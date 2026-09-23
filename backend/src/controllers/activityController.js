import db from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';

// Get activity log
export const getActivityLog = (req, res) => {
  try {
    const { chairId, type, limit = 50, offset = 0 } = req.query;
    let query = 'SELECT * FROM activity_log';
    const conditions = [];
    const params = [];

    if (chairId) {
      conditions.push('chair_id = ?');
      params.push(chairId);
    }

    if (type) {
      conditions.push('type = ?');
      params.push(type);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY timestamp DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const activities = db.prepare(query).all(...params);
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

    const id = uuidv4();
    const stmt = db.prepare(`
      INSERT INTO activity_log (id, chair_id, message, confidence, type)
      VALUES (?, ?, ?, ?, ?)
    `);
    stmt.run(id, chairId, message, confidence, type);

    const activity = db.prepare('SELECT * FROM activity_log WHERE id = ?').get(id);
    res.status(201).json({ success: true, data: activity });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Clear activity log (for testing)
export const clearActivityLog = (req, res) => {
  try {
    const result = db.prepare('DELETE FROM activity_log').run();
    res.json({ success: true, message: `Cleared ${result.changes} activity entries` });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
