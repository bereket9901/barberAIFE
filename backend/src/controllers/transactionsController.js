import database from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';

// Get all transactions
export const getAllTransactions = async (req, res) => {
  try {
    const { paymentMethod, status, limit = 50, offset = 0 } = req.query;
    
    let query = `
      SELECT t.*,
             json_agg(ts.service_name) as services
      FROM transactions t
      LEFT JOIN transaction_services ts ON t.id = ts.transaction_id
    `;
    
    const conditions = [];
    const params = [];
    let paramCount = 1;

    if (paymentMethod) {
      conditions.push(`t.payment_method = $${paramCount++}`);
      params.push(paymentMethod);
    }

    if (status) {
      conditions.push(`t.status = $${paramCount++}`);
      params.push(status);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ` GROUP BY t.id ORDER BY t.timestamp DESC LIMIT $${paramCount++} OFFSET $${paramCount++}`;
    params.push(parseInt(limit), parseInt(offset));

    const result = await database.query(query, params);
    
    const transactions = result.rows.map(tx => ({
      ...tx,
      services: tx.services || []
    }));

    res.json({ success: true,  transactions });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get transaction by ID
export const getTransactionById = async (req, res) => {
  try {
    const txResult = await database.query(
      'SELECT * FROM transactions WHERE id = $1',
      [req.params.id]
    );

    if (txResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Transaction not found' });
    }

    const servicesResult = await database.query(
      'SELECT service_name FROM transaction_services WHERE transaction_id = $1',
      [req.params.id]
    );

    const transaction = {
      ...txResult.rows[0],
      services: servicesResult.rows.map(row => row.service_name)
    };

    res.json({ success: true,  transaction });
  } catch (error) {
    console.error('Error fetching transaction:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get transaction by transaction ID (TX-XXXX format)
export const getTransactionByTxId = async (req, res) => {
  try {
    const txResult = await database.query(
      'SELECT * FROM transactions WHERE transaction_id = $1',
      [req.params.txId]
    );

    if (txResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Transaction not found' });
    }

    const servicesResult = await database.query(
      'SELECT service_name FROM transaction_services WHERE transaction_id = $1',
      [txResult.rows[0].id]
    );

    const transaction = {
      ...txResult.rows[0],
      services: servicesResult.rows.map(row => row.service_name)
    };

    res.json({ success: true,  transaction });
  } catch (error) {
    console.error('Error fetching transaction by txId:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Create a new transaction (process payment)
export const createTransaction = async (req, res) => {
  const client = await database.getClient();
  
  try {
    await client.query('BEGIN');

    const { sessionId, paymentMethod } = req.body;

    if (!sessionId || !paymentMethod) {
      await client.query('ROLLBACK');
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }

    const validMethods = ['telebirr', 'cbe_birr', 'bank_transfer', 'cash', 'card'];
    if (!validMethods.includes(paymentMethod)) {
      await client.query('ROLLBACK');
      return res.status(400).json({ success: false, error: 'Invalid payment method' });
    }

    // Get session
    const sessionResult = await client.query(
      'SELECT * FROM sessions WHERE id = $1',
      [sessionId]
    );

    if (sessionResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ success: false, error: 'Session not found' });
    }

    const session = sessionResult.rows[0];

    if (session.status === 'paid') {
      await client.query('ROLLBACK');
      return res.status(400).json({ success: false, error: 'Session already paid' });
    }

    // Get charged services
    const detectedServicesResult = await client.query(
      `SELECT ds.*, s.name as service_name
       FROM detected_services ds
       LEFT JOIN services s ON ds.type = s.type
       WHERE ds.session_id = $1 AND ds.status != 'rejected'`,
      [sessionId]
    );

    const detectedServices = detectedServicesResult.rows;

    if (detectedServices.length === 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ success: false, error: 'No services to charge' });
    }

    // Create transaction
    const txId = uuidv4();
    const transactionId = `TX-${session.customer_id}`;

    const txResult = await client.query(
      `INSERT INTO transactions (id, transaction_id, session_id, customer_id, customer_name, barber_name, amount, payment_method)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [txId, transactionId, sessionId, session.customer_id, session.customer_name, session.barber_name, session.total_bill, paymentMethod]
    );

    // Insert transaction services
    for (const ds of detectedServices) {
      await client.query(
        'INSERT INTO transaction_services (transaction_id, service_name) VALUES ($1, $2)',
        [txId, ds.service_name || ds.type]
      );
    }

    // Mark services as charged
    await client.query(
      `UPDATE detected_services SET status = 'charged'
       WHERE session_id = $1 AND status != 'rejected'`,
      [sessionId]
    );

    // Mark session as paid
    await client.query(
      `UPDATE sessions SET status = 'paid', end_time = CURRENT_TIMESTAMP
       WHERE id = $1`,
      [sessionId]
    );

    await client.query('COMMIT');

    const transaction = {
      ...txResult.rows[0],
      services: detectedServices.map(ds => ds.service_name || ds.type)
    };

    res.status(201).json({ success: true,  transaction });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error creating transaction:', error);
    res.status(500).json({ success: false, error: error.message });
  } finally {
    client.release();
  }
};

// Get transaction statistics
export const getTransactionStats = async (req, res) => {
  try {
    const { period = 'today' } = req.query;
    
    let dateFilter = '';
    switch (period) {
      case 'today':
        dateFilter = "DATE(timestamp) = CURRENT_DATE";
        break;
      case 'week':
        dateFilter = "timestamp >= CURRENT_DATE - INTERVAL '7 days'";
        break;
      case 'month':
        dateFilter = "timestamp >= CURRENT_DATE - INTERVAL '30 days'";
        break;
      default:
        dateFilter = "1=1";
    }

    const statsResult = await database.query(
      `SELECT 
         COUNT(*) as total_transactions,
         COALESCE(SUM(amount), 0) as total_revenue,
         COALESCE(AVG(amount), 0) as avg_transaction,
         COUNT(DISTINCT customer_id) as unique_customers
       FROM transactions
       WHERE status = 'paid' AND ${dateFilter}`
    );

    const byMethodResult = await database.query(
      `SELECT 
         payment_method,
         COUNT(*) as count,
         SUM(amount) as total
       FROM transactions
       WHERE status = 'paid' AND ${dateFilter}
       GROUP BY payment_method`
    );

    res.json({ 
      success: true, 
       { 
        summary: statsResult.rows[0],
        byPaymentMethod: byMethodResult.rows
      } 
    });
  } catch (error) {
    console.error('Error fetching transaction stats:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};
