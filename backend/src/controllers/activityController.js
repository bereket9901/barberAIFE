import db from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';

// Get activity log
export const getActivityLog = (req, res) => {
  try {
    const { chairId, type, limit = 50, offset = 0 } = req.query;
    let activities = db.getAll('activity_log');

    // Apply filters
    if (chairId) {
      activities = activities.filter(a => a.chair_id === chairId);
    }
    if (type) {
      activities = activities.filter(a => a.type === type);
    }

    // Sort by timestamp descending
    activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    // Apply pagination
    const limitNum = parseInt(limit);
    const offsetNum = parseInt(offset);
    activities = activities.slice(offsetNum, offsetNum + limitNum);

    res.json({ success: true, data: activities });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Add activity
export const addActivity = (req, res) => {
  try {
    const { chairId, message, confidence, type } = req.body;

    if (!chairId || !message || confidence === undefined || !type) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }

    const validTypes = [
      'service_start', 'service_detect', 'service_complete',
      'customer_enter', 'customer_leave', 'payment', 'bill_generated'
    ];

    if (!validTypes.includes(type)) {
      return res.status(400).json({ success: false, error: 'Invalid activity type' });
    }

    const activity = {
      id: uuidv4(),
      chair_id: chairId,
      message,
      confidence: Number(confidence),
      type,
      timestamp: new Date().toISOString()
    };

    db.insert('activity_log', activity);
    res.status(201).json({ success: true, data: activity });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Clear activity log (for testing)
export const clearActivityLog = (req, res) => {
  try {
    const count = db.clear('activity_log');
    res.json({ success: true, message: `Cleared ${count} activity entries` });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
