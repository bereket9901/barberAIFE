import db from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';

// Get all sessions
export const getAllSessions = (req, res) => {
  try {
    const { status } = req.query;
    let query = 'SELECT * FROM sessions';
    const params = [];

    if (status) {
      query += ' WHERE status = ?';
      params.push(status);
    }

    query += ' ORDER BY start_time DESC';

    const sessions = db.prepare(query).all(...params);

    // Attach detected services to each session
    const sessionsWithServices = sessions.map(session => {
      const detectedServices = db.prepare(
        'SELECT * FROM detected_services WHERE session_id = ? ORDER BY detected_at'
      ).all(session.id);
      return { ...session, detectedServices };
    });

    res.json({ success: true, data: sessionsWithServices });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get session by ID
export const getSessionById = (req, res) => {
  try {
    const session = db.prepare('SELECT * FROM sessions WHERE id = ?').get(req.params.id);
    if (!session) {
      return res.status(404).json({ success: false, error: 'Session not found' });
    }

    const detectedServices = db.prepare(
      'SELECT * FROM detected_services WHERE session_id = ? ORDER BY detected_at'
    ).all(session.id);

    res.json({ success: true, data: { ...session, detectedServices } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get sessions by chair
export const getSessionsByChair = (req, res) => {
  try {
    const sessions = db.prepare(
      'SELECT * FROM sessions WHERE chair_id = ? ORDER BY start_time DESC'
    ).all(req.params.chairId);

    const sessionsWithServices = sessions.map(session => {
      const detectedServices = db.prepare(
        'SELECT * FROM detected_services WHERE session_id = ? ORDER BY detected_at'
      ).all(session.id);
      return { ...session, detectedServices };
    });

    res.json({ success: true, data: sessionsWithServices });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Create a new session
export const createSession = (req, res) => {
  try {
    const { chairId, customerName, customerId, barberId, barberName } = req.body;

    if (!chairId || !customerName || !customerId || !barberId || !barberName) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }

    // Check if chair already has an active session
    const existingSession = db.prepare(
      'SELECT * FROM sessions WHERE chair_id = ? AND status = ?'
    ).get(chairId, 'active');

    if (existingSession) {
      return res.status(400).json({ 
        success: false, 
        error: 'Chair already has an active session',
        existingSession 
      });
    }

    const id = uuidv4();
    const stmt = db.prepare(`
      INSERT INTO sessions (id, chair_id, customer_name, customer_id, barber_id, barber_name)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    stmt.run(id, chairId, customerName, customerId, barberId, barberName);

    const session = db.prepare('SELECT * FROM sessions WHERE id = ?').get(id);
    res.status(201).json({ success: true, data: { ...session, detectedServices: [] } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Add detected service to session
export const addDetectedService = (req, res) => {
  try {
    const { sessionId } = req.params;
    const { type, confidence, price } = req.body;

    if (!type || confidence === undefined || !price) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }

    const session = db.prepare('SELECT * FROM sessions WHERE id = ?').get(sessionId);
    if (!session) {
      return res.status(404).json({ success: false, error: 'Session not found' });
    }

    const id = uuidv4();
    const stmt = db.prepare(`
      INSERT INTO detected_services (id, session_id, chair_id, type, confidence, price)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    stmt.run(id, sessionId, session.chair_id, type, confidence, price);

    // Recalculate total bill
    recalculateTotalBill(sessionId);

    const detectedService = db.prepare('SELECT * FROM detected_services WHERE id = ?').get(id);
    res.status(201).json({ success: true, data: detectedService });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Update detected service status
export const updateDetectedServiceStatus = (req, res) => {
  try {
    const { serviceId } = req.params;
    const { status } = req.body;

    if (!status || !['detected', 'confirmed', 'charged', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, error: 'Invalid status' });
    }

    const service = db.prepare('SELECT * FROM detected_services WHERE id = ?').get(serviceId);
    if (!service) {
      return res.status(404).json({ success: false, error: 'Detected service not found' });
    }

    const completedAt = status === 'confirmed' || status === 'charged' ? new Date().toISOString() : null;

    db.prepare(`
      UPDATE detected_services 
      SET status = ?, completed_at = COALESCE(?, completed_at)
      WHERE id = ?
    `).run(status, completedAt, serviceId);

    // Recalculate total bill
    recalculateTotalBill(service.session_id);

    const updatedService = db.prepare('SELECT * FROM detected_services WHERE id = ?').get(serviceId);
    res.json({ success: true, data: updatedService });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Complete session
export const completeSession = (req, res) => {
  try {
    const session = db.prepare('SELECT * FROM sessions WHERE id = ?').get(req.params.id);
    if (!session) {
      return res.status(404).json({ success: false, error: 'Session not found' });
    }

    db.prepare(`
      UPDATE sessions 
      SET status = 'completed', end_time = datetime('now')
      WHERE id = ?
    `).run(req.params.id);

    const updatedSession = db.prepare('SELECT * FROM sessions WHERE id = ?').get(req.params.id);
    const detectedServices = db.prepare(
      'SELECT * FROM detected_services WHERE session_id = ? ORDER BY detected_at'
    ).all(updatedSession.id);

    res.json({ success: true, data: { ...updatedSession, detectedServices } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Helper function to recalculate total bill
const recalculateTotalBill = (sessionId) => {
  const result = db.prepare(`
    SELECT COALESCE(SUM(price), 0) as total
    FROM detected_services
    WHERE session_id = ? AND status != 'rejected'
  `).get(sessionId);

  db.prepare('UPDATE sessions SET total_bill = ? WHERE id = ?')
    .run(result.total, sessionId);
};
