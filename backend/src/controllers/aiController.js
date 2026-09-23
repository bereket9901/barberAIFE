import db from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';

// Simulate AI detection (mock implementation)
export const simulateDetection = (req, res) => {
  try {
    const { chairId } = req.body;

    if (!chairId) {
      return res.status(400).json({ success: false, error: 'Chair ID is required' });
    }

    // Get active session for this chair
    const session = db.prepare(
      'SELECT * FROM sessions WHERE chair_id = ? AND status = ?'
    ).get(chairId, 'active');

    if (!session) {
      return res.status(404).json({ success: false, error: 'No active session for this chair' });
    }

    // Simulate detection with random service
    const serviceTypes = ['haircut', 'beard_trim', 'hair_wash', 'shaving', 'hair_coloring', 'facial'];
    const randomType = serviceTypes[Math.floor(Math.random() * serviceTypes.length)];
    const confidence = Math.floor(Math.random() * 20) + 80; // 80-99%

    // Get service details
    const service = db.prepare('SELECT * FROM services WHERE type = ?').get(randomType);
    if (!service) {
      return res.status(404).json({ success: false, error: 'Service not found in database' });
    }

    // Create detected service
    const detectedId = uuidv4();
    db.prepare(`
      INSERT INTO detected_services (id, session_id, chair_id, type, confidence, price)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(detectedId, session.id, chairId, randomType, confidence, service.price);

    // Recalculate total bill
    const result = db.prepare(`
      SELECT COALESCE(SUM(price), 0) as total
      FROM detected_services
      WHERE session_id = ? AND status != 'rejected'
    `).get(session.id);

    db.prepare('UPDATE sessions SET total_bill = ? WHERE id = ?')
      .run(result.total, session.id);

    // Log activity
    const activityId = uuidv4();
    db.prepare(`
      INSERT INTO activity_log (id, chair_id, message, confidence, type)
      VALUES (?, ?, ?, ?, ?)
    `).run(activityId, chairId, `${service.name} detected`, confidence, 'service_detect');

    const detectedService = db.prepare('SELECT * FROM detected_services WHERE id = ?').get(detectedId);
    const activity = db.prepare('SELECT * FROM activity_log WHERE id = ?').get(activityId);

    res.json({
      success: true,
      data: {
        detection: detectedService,
        activity: activity,
        session: {
          ...session,
          total_bill: result.total
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Run full demo simulation
export const runDemoSimulation = (req, res) => {
  try {
    const { chairId } = req.body;

    if (!chairId) {
      return res.status(400).json({ success: false, error: 'Chair ID is required' });
    }

    // Check if chair has active session
    const existingSession = db.prepare(
      'SELECT * FROM sessions WHERE chair_id = ? AND status = ?'
    ).get(chairId, 'active');

    if (existingSession) {
      return res.status(400).json({ 
        success: false, 
        error: 'Chair already has an active session',
        session: existingSession
      });
    }

    // Create new session
    const sessionId = uuidv4();
    const customerNumber = 1045 + Math.floor(Math.random() * 100);
    const barbers = [
      { id: 'b1', name: 'Dawit' },
      { id: 'b2', name: 'Abel' },
      { id: 'b3', name: 'Yonas' },
      { id: 'b4', name: 'Samuel' }
    ];
    const barber = barbers[parseInt(chairId) - 1] || barbers[0];

    db.prepare(`
      INSERT INTO sessions (id, chair_id, customer_name, customer_id, barber_id, barber_name)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      sessionId,
      chairId,
      `Customer #${customerNumber}`,
      String(customerNumber),
      barber.id,
      barber.name
    );

    // Log customer entry
    const entryActivityId = uuidv4();
    db.prepare(`
      INSERT INTO activity_log (id, chair_id, message, confidence, type)
      VALUES (?, ?, ?, ?, ?)
    `).run(entryActivityId, chairId, `Customer #${customerNumber} entered`, 99, 'customer_enter');

    // Add some detected services
    const services = [
      { type: 'haircut', confidence: 96 },
      { type: 'beard_trim', confidence: 91 },
      { type: 'hair_wash', confidence: 88 }
    ];

    let totalBill = 0;
    services.forEach(svc => {
      const service = db.prepare('SELECT * FROM services WHERE type = ?').get(svc.type);
      if (service) {
        const detectedId = uuidv4();
        db.prepare(`
          INSERT INTO detected_services (id, session_id, chair_id, type, confidence, price, status)
          VALUES (?, ?, ?, ?, ?, ?, 'confirmed')
        `).run(detectedId, sessionId, chairId, svc.type, svc.confidence, service.price);

        totalBill += service.price;

        // Log activity
        const activityId = uuidv4();
        db.prepare(`
          INSERT INTO activity_log (id, chair_id, message, confidence, type)
          VALUES (?, ?, ?, ?, ?)
        `).run(activityId, chairId, `${service.name} detected`, svc.confidence, 'service_detect');
      }
    });

    // Update session total
    db.prepare('UPDATE sessions SET total_bill = ? WHERE id = ?').run(totalBill, sessionId);

    const session = db.prepare('SELECT * FROM sessions WHERE id = ?').get(sessionId);
    const detectedServices = db.prepare(
      'SELECT * FROM detected_services WHERE session_id = ? ORDER BY detected_at'
    ).all(sessionId);

    res.status(201).json({
      success: true,
      data: {
        session: { ...session, detectedServices },
        totalBill
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get detection confidence threshold
export const getConfidenceThreshold = (req, res) => {
  // In a real app, this would be configurable
  res.json({ success: true, data: { threshold: 80 } });
};
