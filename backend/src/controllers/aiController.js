import database from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';

// Simulate AI detection (mock implementation)
export const simulateDetection = async (req, res) => {
  try {
    const { chairId } = req.body;

    if (!chairId) {
      return res.status(400).json({ success: false, error: 'Chair ID is required' });
    }

    // Get active session for this chair
    const sessionResult = await database.query(
      "SELECT * FROM sessions WHERE chair_id = $1 AND status = 'active'",
      [chairId]
    );

    if (sessionResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'No active session for this chair' });
    }

    const session = sessionResult.rows[0];

    // Simulate detection with random service
    const serviceTypes = ['haircut', 'beard_trim', 'hair_wash', 'shaving', 'hair_coloring', 'facial'];
    const randomType = serviceTypes[Math.floor(Math.random() * serviceTypes.length)];
    const confidence = Math.floor(Math.random() * 20) + 80; // 80-99%

    // Get service details
    const serviceResult = await database.query(
      'SELECT * FROM services WHERE type = $1',
      [randomType]
    );

    if (serviceResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Service not found in database' });
    }

    const service = serviceResult.rows[0];

    // Create detected service
    const detectedResult = await database.query(
      `INSERT INTO detected_services (session_id, chair_id, type, confidence, price)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [session.id, chairId, randomType, confidence, service.price]
    );

    // Recalculate total bill
    const totalResult = await database.query(
      `SELECT COALESCE(SUM(price), 0) as total
       FROM detected_services
       WHERE session_id = $1 AND status != 'rejected'`,
      [session.id]
    );

    await database.query(
      'UPDATE sessions SET total_bill = $1 WHERE id = $2',
      [totalResult.rows[0].total, session.id]
    );

    // Log activity
    const activityResult = await database.query(
      `INSERT INTO activity_log (chair_id, message, confidence, type)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [chairId, `${service.name} detected`, confidence, 'service_detect']
    );

    res.json({
      success: true,
      data: {
        detection: detectedResult.rows[0],
        activity: activityResult.rows[0],
        session: {
          ...session,
          total_bill: parseInt(totalResult.rows[0].total)
        }
      }
    });
  } catch (error) {
    console.error('Error simulating detection:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Run full demo simulation
export const runDemoSimulation = async (req, res) => {
  try {
    const { chairId } = req.body;

    if (!chairId) {
      return res.status(400).json({ success: false, error: 'Chair ID is required' });
    }

    // Check if chair has active session
    const existingSessionResult = await database.query(
      "SELECT * FROM sessions WHERE chair_id = $1 AND status = 'active'",
      [chairId]
    );

    if (existingSessionResult.rows.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Chair already has an active session',
        session: existingSessionResult.rows[0]
      });
    }

    // Create new session
    const customerNumber = 1045 + Math.floor(Math.random() * 100);
    const barbersResult = await database.query('SELECT * FROM barbers');
    const barbers = barbersResult.rows;
    const barber = barbers[parseInt(chairId) - 1] || barbers[0];

    const sessionResult = await database.query(
      `INSERT INTO sessions (chair_id, customer_name, customer_id, barber_id, barber_name)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [chairId, `Customer #${customerNumber}`, String(customerNumber), barber.id, barber.name]
    );

    const session = sessionResult.rows[0];

    // Log customer entry
    await database.query(
      `INSERT INTO activity_log (chair_id, message, confidence, type)
       VALUES ($1, $2, $3, $4)`,
      [chairId, `Customer #${customerNumber} entered`, 99, 'customer_enter']
    );

    // Add some detected services
    const servicesToDetect = [
      { type: 'haircut', confidence: 96 },
      { type: 'beard_trim', confidence: 91 },
      { type: 'hair_wash', confidence: 88 }
    ];

    let totalBill = 0;

    for (const svc of servicesToDetect) {
      const serviceResult = await database.query(
        'SELECT * FROM services WHERE type = $1',
        [svc.type]
      );

      if (serviceResult.rows.length > 0) {
        const service = serviceResult.rows[0];

        await database.query(
          `INSERT INTO detected_services (session_id, chair_id, type, confidence, price, status)
           VALUES ($1, $2, $3, $4, $5, 'confirmed')`,
          [session.id, chairId, svc.type, svc.confidence, service.price]
        );

        totalBill += service.price;

        // Log activity
        await database.query(
          `INSERT INTO activity_log (chair_id, message, confidence, type)
           VALUES ($1, $2, $3, $4)`,
          [chairId, `${service.name} detected`, svc.confidence, 'service_detect']
        );
      }
    }

    // Update session total
    await database.query(
      'UPDATE sessions SET total_bill = $1 WHERE id = $2',
      [totalBill, session.id]
    );

    // Get detected services
    const detectedServicesResult = await database.query(
      'SELECT * FROM detected_services WHERE session_id = $1 ORDER BY detected_at ASC',
      [session.id]
    );

    res.status(201).json({
      success: true,
      data: {
        session: { ...session, detectedServices: detectedServicesResult.rows },
        totalBill
      }
    });
  } catch (error) {
    console.error('Error running demo simulation:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get detection confidence threshold
export const getConfidenceThreshold = async (req, res) => {
  // In a real app, this would be configurable
  res.json({ success: true, data: { threshold: 80 } });
};
