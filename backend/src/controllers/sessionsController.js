import database from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';

// Get all sessions
export const getAllSessions = async (req, res) => {
  try {
    const { status } = req.query;
    
    let query = `
      SELECT s.*, 
             json_agg(
               json_build_object(
                 'id', ds.id,
                 'type', ds.type,
                 'confidence', ds.confidence,
                 'status', ds.status,
                 'price', ds.price,
                 'detected_at', ds.detected_at,
                 'completed_at', ds.completed_at
               ) ORDER BY ds.detected_at
             ) FILTER (WHERE ds.id IS NOT NULL) as detectedServices
      FROM sessions s
      LEFT JOIN detected_services ds ON s.id = ds.session_id
    `;
    
    const params = [];
    if (status) {
      query += ' WHERE s.status = $1';
      params.push(status);
    }
    
    query += ' GROUP BY s.id ORDER BY s.start_time DESC';
    
    const result = await database.query(query, params);
    
    // Transform detectedServices from null to empty array
    const sessions = result.rows.map(session => ({
      ...session,
      detectedServices: session.detectedservices || []
    }));
    
    res.json({ success: true,  sessions });
  } catch (error) {
    console.error('Error fetching sessions:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get session by ID
export const getSessionById = async (req, res) => {
  try {
    const sessionResult = await database.query(
      'SELECT * FROM sessions WHERE id = $1',
      [req.params.id]
    );
    
    if (sessionResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Session not found' });
    }

    const servicesResult = await database.query(
      'SELECT * FROM detected_services WHERE session_id = $1 ORDER BY detected_at ASC',
      [req.params.id]
    );

    const session = {
      ...sessionResult.rows[0],
      detectedServices: servicesResult.rows
    };

    res.json({ success: true,  session });
  } catch (error) {
    console.error('Error fetching session:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get sessions by chair
export const getSessionsByChair = async (req, res) => {
  try {
    const result = await database.query(
      `SELECT s.*, 
             json_agg(
               json_build_object(
                 'id', ds.id,
                 'type', ds.type,
                 'confidence', ds.confidence,
                 'status', ds.status,
                 'price', ds.price,
                 'detected_at', ds.detected_at,
                 'completed_at', ds.completed_at
               ) ORDER BY ds.detected_at
             ) FILTER (WHERE ds.id IS NOT NULL) as detectedServices
      FROM sessions s
      LEFT JOIN detected_services ds ON s.id = ds.session_id
      WHERE s.chair_id = $1
      GROUP BY s.id
      ORDER BY s.start_time DESC`,
      [req.params.chairId]
    );
    
    const sessions = result.rows.map(session => ({
      ...session,
      detectedServices: session.detectedservices || []
    }));
    
    res.json({ success: true,  sessions });
  } catch (error) {
    console.error('Error fetching sessions by chair:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Create a new session
export const createSession = async (req, res) => {
  try {
    const { chairId, customerName, customerId, barberId, barberName } = req.body;

    if (!chairId || !customerName || !customerId || !barberId || !barberName) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }

    // Check if chair already has an active session
    const existingSession = await database.query(
      "SELECT * FROM sessions WHERE chair_id = $1 AND status = 'active'",
      [chairId]
    );

    if (existingSession.rows.length > 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'Chair already has an active session',
        existingSession: existingSession.rows[0]
      });
    }

    const result = await database.query(
      `INSERT INTO sessions (chair_id, customer_name, customer_id, barber_id, barber_name)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [chairId, customerName, customerId, barberId, barberName]
    );

    res.status(201).json({ success: true,  { ...result.rows[0], detectedServices: [] } });
  } catch (error) {
    console.error('Error creating session:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Add detected service to session
export const addDetectedService = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { type, confidence, price } = req.body;

    if (!type || confidence === undefined || price === undefined) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }

    // Get session to get chair_id
    const sessionResult = await database.query(
      'SELECT * FROM sessions WHERE id = $1',
      [sessionId]
    );

    if (sessionResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Session not found' });
    }

    const session = sessionResult.rows[0];

    const result = await database.query(
      `INSERT INTO detected_services (session_id, chair_id, type, confidence, price)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [sessionId, session.chair_id, type, confidence, price]
    );

    // Recalculate total bill
    await recalculateTotalBill(sessionId);

    res.status(201).json({ success: true,  result.rows[0] });
  } catch (error) {
    console.error('Error adding detected service:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Update detected service status
export const updateDetectedServiceStatus = async (req, res) => {
  try {
    const { serviceId } = req.params;
    const { status } = req.body;

    if (!status || !['detected', 'confirmed', 'charged', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, error: 'Invalid status' });
    }

    // Get service to get session_id
    const serviceResult = await database.query(
      'SELECT * FROM detected_services WHERE id = $1',
      [serviceId]
    );

    if (serviceResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Detected service not found' });
    }

    const service = serviceResult.rows[0];
    const completedAt = (status === 'confirmed' || status === 'charged') ? new Date() : null;

    const result = await database.query(
      `UPDATE detected_services 
       SET status = $1, completed_at = COALESCE($2, completed_at)
       WHERE id = $3
       RETURNING *`,
      [status, completedAt, serviceId]
    );

    // Recalculate total bill
    await recalculateTotalBill(service.session_id);

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error updating detected service status:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Complete session
export const completeSession = async (req, res) => {
  try {
    const result = await database.query(
      `UPDATE sessions 
       SET status = 'completed', end_time = CURRENT_TIMESTAMP
       WHERE id = $1
       RETURNING *`,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Session not found' });
    }

    // Get detected services
    const servicesResult = await database.query(
      'SELECT * FROM detected_services WHERE session_id = $1 ORDER BY detected_at ASC',
      [req.params.id]
    );

    const session = {
      ...result.rows[0],
      detectedServices: servicesResult.rows
    };

    res.json({ success: true, data: session });
  } catch (error) {
    console.error('Error completing session:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Helper function to recalculate total bill
const recalculateTotalBill = async (sessionId) => {
  const result = await database.query(
    `SELECT COALESCE(SUM(price), 0) as total
     FROM detected_services
     WHERE session_id = $1 AND status != 'rejected'`,
    [sessionId]
  );

  await database.query(
    'UPDATE sessions SET total_bill = $1 WHERE id = $2',
    [result.rows[0].total, sessionId]
  );
};
