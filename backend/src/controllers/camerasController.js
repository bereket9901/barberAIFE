import database from '../config/database.js';

// Get all cameras
export const getAllCameras = async (req, res) => {
  try {
    const result = await database.query(
      'SELECT * FROM cameras ORDER BY chair_id ASC'
    );
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Error fetching cameras:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get camera by ID
export const getCameraById = async (req, res) => {
  try {
    const result = await database.query(
      'SELECT * FROM cameras WHERE id = $1',
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Camera not found' });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error fetching camera:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get camera by chair ID
export const getCameraByChair = async (req, res) => {
  try {
    const result = await database.query(
      'SELECT * FROM cameras WHERE chair_id = $1',
      [req.params.chairId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Camera not found for this chair' });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error fetching camera by chair:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Update camera status
export const updateCameraStatus = async (req, res) => {
  try {
    const { status, streamUrl } = req.body;

    if (status && !['online', 'offline'].includes(status)) {
      return res.status(400).json({ success: false, error: 'Invalid status' });
    }

    // Check if camera exists
    const existing = await database.query(
      'SELECT * FROM cameras WHERE id = $1',
      [req.params.id]
    );

    if (existing.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Camera not found' });
    }

    const result = await database.query(
      `UPDATE cameras 
       SET status = COALESCE($1, status),
           stream_url = COALESCE($2, stream_url),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $3
       RETURNING *`,
      [status, streamUrl, req.params.id]
    );

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error updating camera:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get system status
export const getSystemStatus = async (req, res) => {
  try {
    const camerasResult = await database.query('SELECT * FROM cameras');
    const cameras = camerasResult.rows;
    const onlineCameras = cameras.filter(c => c.status === 'online').length;
    
    const activeSessionsResult = await database.query(
      "SELECT COUNT(*) as count FROM sessions WHERE status = 'active'"
    );
    const activeSessions = parseInt(activeSessionsResult.rows[0].count);

    const todayTransactionsResult = await database.query(
      `SELECT COUNT(*) as count, COALESCE(SUM(amount), 0) as revenue
       FROM transactions 
       WHERE DATE(timestamp) = CURRENT_DATE AND status = 'paid'`
    );

    res.json({
      success: true,
       {
        aiVision: 'online',
        cameras: cameras.length,
        camerasConnected: onlineCameras,
        detection: activeSessions > 0 ? 'running' : 'idle',
        payment: 'ready',
        activeSessions,
        todayRevenue: parseInt(todayTransactionsResult.rows[0].revenue),
        todayTransactions: parseInt(todayTransactionsResult.rows[0].count)
      }
    });
  } catch (error) {
    console.error('Error fetching system status:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};
