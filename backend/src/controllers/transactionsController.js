import db from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';

// Get all transactions
export const getAllTransactions = (req, res) => {
  try {
    const { paymentMethod, status, limit = 50, offset = 0 } = req.query;
    let query = 'SELECT * FROM transactions';
    const conditions = [];
    const params = [];

    if (paymentMethod) {
      conditions.push('payment_method = ?');
      params.push(paymentMethod);
    }

    if (status) {
      conditions.push('status = ?');
      params.push(status);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY timestamp DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const transactions = db.prepare(query).all(...params);

    // Attach services to each transaction
    const transactionsWithServices = transactions.map(tx => {
      const services = db.prepare(
        'SELECT service_name FROM transaction_services WHERE transaction_id = ?'
      ).all(tx.id).map(row => row.service_name);
      return { ...tx, services };
    });

    res.json({ success: true, data: transactionsWithServices });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get transaction by ID
export const getTransactionById = (req, res) => {
  try {
    const transaction = db.prepare('SELECT * FROM transactions WHERE id = ?').get(req.params.id);
    if (!transaction) {
      return res.status(404).json({ success: false, error: 'Transaction not found' });
    }

    const services = db.prepare(
      'SELECT service_name FROM transaction_services WHERE transaction_id = ?'
    ).all(transaction.id).map(row => row.service_name);

    res.json({ success: true, data: { ...transaction, services } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get transaction by transaction ID (TX-XXXX format)
export const getTransactionByTxId = (req, res) => {
  try {
    const transaction = db.prepare('SELECT * FROM transactions WHERE transaction_id = ?').get(req.params.txId);
    if (!transaction) {
      return res.status(404).json({ success: false, error: 'Transaction not found' });
    }

    const services = db.prepare(
      'SELECT service_name FROM transaction_services WHERE transaction_id = ?'
    ).all(transaction.id).map(row => row.service_name);

    res.json({ success: true, data: { ...transaction, services } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Create a new transaction (process payment)
export const createTransaction = (req, res) => {
  try {
    const { sessionId, paymentMethod } = req.body;

    if (!sessionId || !paymentMethod) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }

    const validMethods = ['telebirr', 'cbe_birr', 'bank_transfer', 'cash', 'card'];
    if (!validMethods.includes(paymentMethod)) {
      return res.status(400).json({ success: false, error: 'Invalid payment method' });
    }

    const session = db.prepare('SELECT * FROM sessions WHERE id = ?').get(sessionId);
    if (!session) {
      return res.status(404).json({ success: false, error: 'Session not found' });
    }

    if (session.status === 'paid') {
      return res.status(400).json({ success: false, error: 'Session already paid' });
    }

    // Get charged services
    const detectedServices = db.prepare(`
      SELECT ds.*, s.name as service_name
      FROM detected_services ds
      LEFT JOIN services s ON ds.type = s.type
      WHERE ds.session_id = ? AND ds.status != 'rejected'
    `).all(sessionId);

    if (detectedServices.length === 0) {
      return res.status(400).json({ success: false, error: 'No services to charge' });
    }

    // Create transaction
    const txId = uuidv4();
    const transactionId = `TX-${session.customer_id}`;

    const insertTx = db.prepare(`
      INSERT INTO transactions (id, transaction_id, session_id, customer_id, customer_name, barber_name, amount, payment_method)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    insertTx.run(
      txId,
      transactionId,
      sessionId,
      session.customer_id,
      session.customer_name,
      session.barber_name,
      session.total_bill,
      paymentMethod
    );

    // Insert transaction services
    const insertTxService = db.prepare(
      'INSERT INTO transaction_services (transaction_id, service_name) VALUES (?, ?)'
    );
    detectedServices.forEach(ds => {
      insertTxService.run(txId, ds.service_name || ds.type);
    });

    // Mark services as charged
    db.prepare(`
      UPDATE detected_services SET status = 'charged'
      WHERE session_id = ? AND status != 'rejected'
    `).run(sessionId);

    // Mark session as paid
    db.prepare(`
      UPDATE sessions SET status = 'paid', end_time = datetime('now')
      WHERE id = ?
    `).run(sessionId);

    const transaction = db.prepare('SELECT * FROM transactions WHERE id = ?').get(txId);
    const services = detectedServices.map(ds => ds.service_name || ds.type);

    res.status(201).json({ success: true, data: { ...transaction, services } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get transaction statistics
export const getTransactionStats = (req, res) => {
  try {
    const { period = 'today' } = req.query;
    
    let dateFilter = '';
    switch (period) {
      case 'today':
        dateFilter = "date(timestamp) = date('now')";
        break;
      case 'week':
        dateFilter = "timestamp >= datetime('now', '-7 days')";
        break;
      case 'month':
        dateFilter = "timestamp >= datetime('now', '-30 days')";
        break;
      default:
        dateFilter = "1=1";
    }

    const stats = db.prepare(`
      SELECT 
        COUNT(*) as total_transactions,
        COALESCE(SUM(amount), 0) as total_revenue,
        COALESCE(AVG(amount), 0) as avg_transaction,
        COUNT(DISTINCT customer_id) as unique_customers
      FROM transactions
      WHERE status = 'paid' AND ${dateFilter}
    `).get();

    const byMethod = db.prepare(`
      SELECT 
        payment_method,
        COUNT(*) as count,
        SUM(amount) as total
      FROM transactions
      WHERE status = 'paid' AND ${dateFilter}
      GROUP BY payment_method
    `).all();

    res.json({ 
      success: true, 
      data: { 
        summary: stats,
        byPaymentMethod: byMethod
      } 
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
