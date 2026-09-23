import db from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';

// Get all services
export const getAllServices = (req, res) => {
  try {
    const services = db.getAll('services').sort((a, b) => a.name.localeCompare(b.name));
    res.json({ success: true, data: services });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get service by ID
export const getServiceById = (req, res) => {
  try {
    const service = db.getById('services', req.params.id);
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

    // Check if type already exists
    const existing = db.getAll('services').find(s => s.type === type);
    if (existing) {
      return res.status(400).json({ success: false, error: 'Service type already exists' });
    }

    const service = {
      id: uuidv4(),
      name,
      type,
      price: Number(price),
      duration: Number(duration),
      enabled: enabled ? 1 : 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    db.insert('services', service);
    res.status(201).json({ success: true, data: service });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Update a service
export const updateService = (req, res) => {
  try {
    const { name, type, price, duration, enabled } = req.body;
    const existing = db.getById('services', req.params.id);

    if (!existing) {
      return res.status(404).json({ success: false, error: 'Service not found' });
    }

    // Check if type is being changed to an existing type
    if (type && type !== existing.type) {
      const typeExists = db.getAll('services').find(s => s.type === type);
      if (typeExists) {
        return res.status(400).json({ success: false, error: 'Service type already exists' });
      }
    }

    const updates = {
      updated_at: new Date().toISOString()
    };

    if (name !== undefined) updates.name = name;
    if (type !== undefined) updates.type = type;
    if (price !== undefined) updates.price = Number(price);
    if (duration !== undefined) updates.duration = Number(duration);
    if (enabled !== undefined) updates.enabled = enabled ? 1 : 0;

    const service = db.update('services', req.params.id, updates);
    res.json({ success: true, data: service });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Delete a service
export const deleteService = (req, res) => {
  try {
    const deleted = db.delete('services', req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, error: 'Service not found' });
    }
    res.json({ success: true, message: 'Service deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
