import database from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';

// Get all services
export const getAllServices = async (req, res) => {
  try {
    const result = await database.query(
      'SELECT * FROM services ORDER BY name ASC'
    );
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Error fetching services:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get service by ID
export const getServiceById = async (req, res) => {
  try {
    const result = await database.query(
      'SELECT * FROM services WHERE id = $1',
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Service not found' });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error fetching service:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Create a new service
export const createService = async (req, res) => {
  try {
    const { name, type, price, duration, enabled = true } = req.body;

    if (!name || !type || price === undefined || !duration) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }

    const result = await database.query(
      `INSERT INTO services (name, type, price, duration, enabled)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [name, type, price, duration, enabled]
    );

    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(400).json({ success: false, error: 'Service type already exists' });
    }
    console.error('Error creating service:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Update a service
export const updateService = async (req, res) => {
  try {
    const { name, type, price, duration, enabled } = req.body;
    const { id } = req.params;

    // Check if service exists
    const existing = await database.query('SELECT * FROM services WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Service not found' });
    }

    const result = await database.query(
      `UPDATE services 
       SET name = COALESCE($1, name),
           type = COALESCE($2, type),
           price = COALESCE($3, price),
           duration = COALESCE($4, duration),
           enabled = COALESCE($5, enabled),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $6
       RETURNING *`,
      [name, type, price, duration, enabled, id]
    );

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(400).json({ success: false, error: 'Service type already exists' });
    }
    console.error('Error updating service:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Delete a service
export const deleteService = async (req, res) => {
  try {
    const result = await database.query(
      'DELETE FROM services WHERE id = $1 RETURNING *',
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Service not found' });
    }

    res.json({ success: true, message: 'Service deleted' });
  } catch (error) {
    console.error('Error deleting service:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};
