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
    const activeSessions = db.query('sessions', { chair_id: chairId, status: 'active' });
    const session = activeSessions[0];

    if (!session) {
      return res.status(404).json({ success: false, error: 'No active session for this chair' });
    }

    // Simulate detection with random service
    const serviceTypes = ['haircut', 'beard_trim', 'hair_wash', 'shaving', 'hair_coloring', 'facial'];
    const randomType = serviceTypes[Math.floor(Math.random() * serviceTypes.length)];
    const confidence = Math.floor(Math.random() * 20) + 80; // 80-99%

    // Get service details
    const services = db.getAll('services');
    const service = services.find(s => s.type === randomType);
    
    if (!service) {
      return res.status(404).json({ success: false, error: 'Service not found in database' });
    }

    // Create detected service
    const detectedService = {
      id: uuidv4(),
      session_id: session.id,
      chair_id: chairId,
      type: randomType,
      confidence,
      status: 'detected',
      price: service.price,
      detected_at: new Date().toISOString(),
      completed_at: null
    };

    db.insert('detected_services', detectedService);

    // Recalculate total bill
    const allDetectedServices = db.query('detected_services', { session_id: session.id });
    const totalBill = allDetectedServices
      .filter(ds => ds.status !== 'rejected')
      .reduce((sum, ds) => sum + ds.price, 0);

    db.update('sessions', session.id, { total_bill: totalBill });

    // Log activity
    const activity = {
      id: uuidv4(),
      chair_id: chairId,
      message: `${service.name} detected`,
      confidence,
      type: 'service_detect',
      timestamp: new Date().toISOString()
    };

    db.insert('activity_log', activity);

    res.json({
      success: true,
      data: {
        detection: detectedService,
        activity: activity,
        session: {
          ...session,
          total_bill: totalBill
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
    const activeSessions = db.query('sessions', { chair_id: chairId, status: 'active' });
    const existingSession = activeSessions[0];

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
    const barbers = db.getAll('barbers');
    const barber = barbers[parseInt(chairId) - 1] || barbers[0];

    const session = {
      id: sessionId,
      chair_id: chairId,
      customer_name: `Customer #${customerNumber}`,
      customer_id: String(customerNumber),
      barber_id: barber?.id || 'b1',
      barber_name: barber?.name || 'Dawit',
      start_time: new Date().toISOString(),
      end_time: null,
      status: 'active',
      total_bill: 0,
      created_at: new Date().toISOString()
    };

    db.insert('sessions', session);

    // Log customer entry
    const entryActivity = {
      id: uuidv4(),
      chair_id: chairId,
      message: `Customer #${customerNumber} entered`,
      confidence: 99,
      type: 'customer_enter',
      timestamp: new Date().toISOString()
    };
    db.insert('activity_log', entryActivity);

    // Add some detected services
    const servicesToDetect = [
      { type: 'haircut', confidence: 96 },
      { type: 'beard_trim', confidence: 91 },
      { type: 'hair_wash', confidence: 88 }
    ];

    const allServices = db.getAll('services');
    let totalBill = 0;

    servicesToDetect.forEach(svc => {
      const service = allServices.find(s => s.type === svc.type);
      if (service) {
        const detectedService = {
          id: uuidv4(),
          session_id: sessionId,
          chair_id: chairId,
          type: svc.type,
          confidence: svc.confidence,
          status: 'confirmed',
          price: service.price,
          detected_at: new Date().toISOString(),
          completed_at: new Date().toISOString()
        };

        db.insert('detected_services', detectedService);
        totalBill += service.price;

        // Log activity
        const activity = {
          id: uuidv4(),
          chair_id: chairId,
          message: `${service.name} detected`,
          confidence: svc.confidence,
          type: 'service_detect',
          timestamp: new Date().toISOString()
        };
        db.insert('activity_log', activity);
      }
    });

    // Update session total
    db.update('sessions', sessionId, { total_bill: totalBill });

    const updatedSession = db.getById('sessions', sessionId);
    const detectedServices = db.query('detected_services', { session_id: sessionId })
      .sort((a, b) => new Date(a.detected_at) - new Date(b.detected_at));

    res.status(201).json({
      success: true,
      data: {
        session: { ...updatedSession, detectedServices },
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
