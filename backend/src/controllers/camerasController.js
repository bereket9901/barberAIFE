import db from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';

// Get all cameras
export const getAllCameras = (req, res) => {
  try {
    const cameras = db.prepare('SELECT * FROM cameras ORDER BY chair_id').all();
    res.json({ success: true, data: cameras });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get camera by ID
export const getCameraById = (req, res) => {
  try {
    const camera = db.prepare('SELECT * FROM cameras WHERE id = ?').get(req.params.id);
    if (!camera) {
      return res.status(404).json({ success: false, error: 'Camera not found' });
    }
    res.json({ success: true, data: camera });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get camera by chair ID
export const getCameraByChair = (req, res) => {
  try {
    const camera = db.prepare('SELECT * FROM cameras WHERE chair_id = ?').get(req.params.chairId);
    if (!camera) {
      return res.status(404).json({ success: false, error: 'Camera not found for this chair' });
    }
    res.json({ success: true, data: camera });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Update camera status
export const updateCameraStatus = (req, res) => {
  try {
    const { status, streamUrl } = req.body;

    if (status && !['online', 'offline'].includes(status)) {
      return res.status(400).json({ success: false, error: 'Invalid status' });
    }

    const camera = db.prepare('SELECT * FROM cameras WHERE id = ?').get(req.params.id);
    if (!camera) {
      return res.status(404).json({ success: false, error: 'Camera not found' });
    }

    db.prepare(`
      UPDATE cameras 
      SET status = COALESCE(?, status),
          stream_url = COALESCE(?, stream_url),
          updated_at = datetime('now')
      WHERE id = ?
    `).run(status || null, streamUrl || null, req.params.id);

    const updatedCamera = db.prepare('SELECT * FROM cameras WHERE id = ?').get(req.params.id);
    res.json({ success: true, data: updatedCamera });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get system status
export const getSystemStatus = (req, res) => {
  try {
    const cameras = db.prepare('SELECT * FROM cameras').all();
    const onlineCameras = cameras.filter(c => c.status === 'online').length;
    
    const activeSessions = db.prepare(
      "SELECT COUNT(*) as count FROM sessions WHERE status = 'active'"
    ).get().count;

    const todayTransactions = db.prepare(`
      SELECT COUNT(*) as count, COALESCE(SUM(amount), 0) as revenue
      FROM transactions 
      WHERE date(timestamp) = date('now') AND status = 'paid'
    `).get();

    res.json({
      success: true,
      data: {
        aiVision: 'online',
        cameras: cameras.length,
        camerasConnected: onlineCameras,
        detection: activeSessions > 0 ? 'running' : 'idle',
        payment: 'ready',
        activeSessions,
        todayRevenue: todayTransactions.revenue,
        todayTransactions: todayTransactions.count
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
