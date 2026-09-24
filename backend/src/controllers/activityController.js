import database from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';

// Get activity log
export const getActivityLog = async (req, res) => {
  try {
    const { chairId, type, limit = 50, offset = 0 } = req.query;
    
    let query = 'SELECT * FROM activity_log';
    const conditions = [];
    const params = [];
    let paramCount = 1;

    if (chairId) {
      conditions.push(`chair_id = $${paramCount++}`);
      params.push(chairId);
    }

    if (type) {
      conditions.push(`type = $${paramCount++}`);
      params.push(type);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ` ORDER BY timestamp DESC LIMIT $${paramCount++} OFFSET $${paramCount++}`;
    params.push(parseInt(limit), parseInt(offset));

    const result = await database.query(query, params);
    res.json({ success: true,  result.rows });
  } catch (error) {
    console.error('Error fetching activity log:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Add activity
export const addActivity = async (req, res) => {
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

    const result = await database.query(
      `INSERT INTO activity_log (chair_id, message, confidence, type)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [chairId, message, confidence, type]
    );

    res.status(201).json({ success: true,  result.rows[0] });
  } catch (error) {
    console.error('Error adding activity:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Clear activity log (for testing)
export const clearActivityLog = async (req, res) => {
  try {
    const result = await database.query('DELETE FROM activity_log');
    res.json({ success: true, message: `Cleared ${result.rowCount} activity entries` });
  } catch (error) {
    console.error('Error clearing activity log:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};
