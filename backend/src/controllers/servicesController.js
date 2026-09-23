import db from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';

// Get all services
export const getAllServices = (req, res) => {
  try {
    const services = db.prepare('SELECT * FROM services ORDER BY name').all();
    res.json({ success: true, data: services });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get service by ID
export const getServiceById = (req, res) => {
  try {
    const service = db.prepare('SELECT * FROM services WHERE id = ?').get(req.params.id);
    if (!service) {
      return res.status(404).json({ success: false, error: 'Service not found' });
    }
    res.json({ success: true, data: service });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Create a new service
export const createService = (req, res) => {
  try {
    const { name, type, price, duration, enabled = true } = req.body;

    if (!name || !type || !price || !duration) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }

    const id = uuidv4();
    const stmt = db.prepare(
      'INSERT INTO services (id, name, type, price, duration, enabled) VALUES (?, ?, ?, ?, ?, ?)'
    );
    stmt.run(id, name, type, price, duration, enabled ? 1 : 0);

    const service = db.prepare('SELECT * FROM services WHERE id = ?').get(id);
    res.status(201).json({ success: true, data: service });
  } catch (error) {
    if (error.message.includes('UNIQUE constraint')) {
      return res.status(400).json({ success: false, error: 'Service type already exists' });
    }
    res.status(500).json({ success: false, error: error.message });
  }
};

// Update a service
export const updateService = (req, res) => {
  try {
    const { name, type, price, duration, enabled } = req.body;
    const existing = db.prepare('SELECT * FROM services WHERE id = ?').get(req.params.id);

    if (!existing) {
      return res.status(404).json({ success: false, error: 'Service not found' });
    }

    const stmt = db.prepare(`
      UPDATE services 
      SET name = COALESCE(?, name),
          type = COALESCE(?, type),
          price = COALESCE(?, price),
          duration = COALESCE(?, duration),
          enabled = COALESCE(?, enabled),
          updated_at = datetime('now')
      WHERE id = ?
    `);

    stmt.run(
      name || null,
      type || null,
      price || null,
      duration || null,
      enabled !== undefined ? (enabled ? 1 : 0) : null,
      req.params.id
    );

    const service = db.prepare('SELECT * FROM services WHERE id = ?').get(req.params.id);
    res.json({ success: true, data: service });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Delete a service
export const deleteService = (req, res) => {
  try {
    const result = db.prepare('DELETE FROM services WHERE id = ?').run(req.params.id);
    if (result.changes === 0) {
      return res.status(404).json({ success: false, error: 'Service not found' });
    }
    res.json({ success: true, message: 'Service deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
