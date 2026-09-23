import db from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';

// Get all sessions
export const getAllSessions = (req, res) => {
  try {
    const { status } = req.query;
    let sessions = db.getAll('sessions');

    if (status) {
      sessions = sessions.filter(s => s.status === status);
    }

    // Sort by start_time descending
    sessions.sort((a, b) => new Date(b.start_time) - new Date(a.start_time));

    // Attach detected services to each session
    const sessionsWithServices = sessions.map(session => {
      const detectedServices = db.query('detected_services', { session_id: session.id })
        .sort((a, b) => new Date(a.detected_at) - new Date(b.detected_at));
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
    const session = db.getById('sessions', req.params.id);
    if (!session) {
      return res.status(404).json({ success: false, error: 'Session not found' });
    }

    const detectedServices = db.query('detected_services', { session_id: session.id })
      .sort((a, b) => new Date(a.detected_at) - new Date(b.detected_at));

    res.json({ success: true, data: { ...session, detectedServices } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get sessions by chair
export const getSessionsByChair = (req, res) => {
  try {
    const sessions = db.query('sessions', { chair_id: req.params.chairId })
      .sort((a, b) => new Date(b.start_time) - new Date(a.start_time));

    const sessionsWithServices = sessions.map(session => {
      const detectedServices = db.query('detected_services', { session_id: session.id })
        .sort((a, b) => new Date(a.detected_at) - new Date(b.detected_at));
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
    const existingSession = db.query('sessions', { chair_id: chairId, status: 'active' })[0];

    if (existingSession) {
      return res.status(400).json({ 
        success: false, 
        error: 'Chair already has an active session',
        existingSession 
      });
    }

    const session = {
      id: uuidv4(),
      chair_id: chairId,
      customer_name: customerName,
      customer_id: customerId,
      barber_id: barberId,
      barber_name: barberName,
      start_time: new Date().toISOString(),
      end_time: null,
      status: 'active',
      total_bill: 0,
      created_at: new Date().toISOString()
    };

    db.insert('sessions', session);
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

    const session = db.getById('sessions', sessionId);
    if (!session) {
      return res.status(404).json({ success: false, error: 'Session not found' });
    }

    const detectedService = {
      id: uuidv4(),
      session_id: sessionId,
      chair_id: session.chair_id,
      type,
      confidence: Number(confidence),
      status: 'detected',
      price: Number(price),
      detected_at: new Date().toISOString(),
      completed_at: null
    };

    db.insert('detected_services', detectedService);

    // Recalculate total bill
    recalculateTotalBill(sessionId);

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

    const service = db.getById('detected_services', serviceId);
    if (!service) {
      return res.status(404).json({ success: false, error: 'Detected service not found' });
    }

    const updates = { status };
    if (status === 'confirmed' || status === 'charged') {
      updates.completed_at = new Date().toISOString();
    }

    const updatedService = db.update('detected_services', serviceId, updates);

    // Recalculate total bill
    recalculateTotalBill(service.session_id);

    res.json({ success: true, data: updatedService });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Complete session
export const completeSession = (req, res) => {
  try {
    const session = db.getById('sessions', req.params.id);
    if (!session) {
      return res.status(404).json({ success: false, error: 'Session not found' });
    }

    const updatedSession = db.update('sessions', req.params.id, {
      status: 'completed',
      end_time: new Date().toISOString()
    });

    const detectedServices = db.query('detected_services', { session_id: updatedSession.id })
      .sort((a, b) => new Date(a.detected_at) - new Date(b.detected_at));

    res.json({ success: true, data: { ...updatedSession, detectedServices } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Helper function to recalculate total bill
const recalculateTotalBill = (sessionId) => {
  const services = db.query('detected_services', { session_id: sessionId });
  const total = services
    .filter(s => s.status !== 'rejected')
    .reduce((sum, s) => sum + s.price, 0);

  db.update('sessions', sessionId, { total_bill: total });
};
