import db from '../config/database.js';

// Get all cameras
export const getAllCameras = (req, res) => {
  try {
    const cameras = db.getAll('cameras').sort((a, b) => a.chair_id.localeCompare(b.chair_id));
    res.json({ success: true, data: cameras });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get camera by ID
export const getCameraById = (req, res) => {
  try {
    const camera = db.getById('cameras', req.params.id);
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
    const cameras = db.query('cameras', { chair_id: req.params.chairId });
    const camera = cameras[0];
    
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

    const camera = db.getById('cameras', req.params.id);
    if (!camera) {
      return res.status(404).json({ success: false, error: 'Camera not found' });
    }

    const updates = { updated_at: new Date().toISOString() };
    if (status) updates.status = status;
    if (streamUrl !== undefined) updates.stream_url = streamUrl;

    const updatedCamera = db.update('cameras', req.params.id, updates);
    res.json({ success: true, data: updatedCamera });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get system status
export const getSystemStatus = (req, res) => {
  try {
    const cameras = db.getAll('cameras');
    const onlineCameras = cameras.filter(c => c.status === 'online').length;
    
    const activeSessions = db.query('sessions', { status: 'active' }).length;

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    const todayTransactions = db.getAll('transactions')
      .filter(t => t.status === 'paid' && new Date(t.timestamp) >= todayStart);
    
    const todayRevenue = todayTransactions.reduce((sum, t) => sum + t.amount, 0);

    res.json({
      success: true,
      data: {
        aiVision: 'online',
        cameras: cameras.length,
        camerasConnected: onlineCameras,
        detection: activeSessions > 0 ? 'running' : 'idle',
        payment: 'ready',
        activeSessions,
        todayRevenue,
        todayTransactions: todayTransactions.length
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
