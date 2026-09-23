import db from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';

// Get all transactions
export const getAllTransactions = (req, res) => {
  try {
    const { paymentMethod, status, limit = 50, offset = 0 } = req.query;
    let transactions = db.getAll('transactions');

    // Apply filters
    if (paymentMethod) {
      transactions = transactions.filter(t => t.payment_method === paymentMethod);
    }
    if (status) {
      transactions = transactions.filter(t => t.status === status);
    }

    // Sort by timestamp descending
    transactions.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    // Apply pagination
    const limitNum = parseInt(limit);
    const offsetNum = parseInt(offset);
    transactions = transactions.slice(offsetNum, offsetNum + limitNum);

    // Attach services to each transaction
    const transactionsWithServices = transactions.map(tx => {
      const services = db.query('transaction_services', { transaction_id: tx.id })
        .map(row => row.service_name);
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
    const transaction = db.getById('transactions', req.params.id);
    if (!transaction) {
      return res.status(404).json({ success: false, error: 'Transaction not found' });
    }

    const services = db.query('transaction_services', { transaction_id: transaction.id })
      .map(row => row.service_name);

    res.json({ success: true, data: { ...transaction, services } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get transaction by transaction ID (TX-XXXX format)
export const getTransactionByTxId = (req, res) => {
  try {
    const transactions = db.getAll('transactions');
    const transaction = transactions.find(t => t.transaction_id === req.params.txId);
    
    if (!transaction) {
      return res.status(404).json({ success: false, error: 'Transaction not found' });
    }

    const services = db.query('transaction_services', { transaction_id: transaction.id })
      .map(row => row.service_name);

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

    const session = db.getById('sessions', sessionId);
    if (!session) {
      return res.status(404).json({ success: false, error: 'Session not found' });
    }

    if (session.status === 'paid') {
      return res.status(400).json({ success: false, error: 'Session already paid' });
    }

    // Get charged services
    const detectedServices = db.query('detected_services', { session_id: sessionId })
      .filter(ds => ds.status !== 'rejected');

    if (detectedServices.length === 0) {
      return res.status(400).json({ success: false, error: 'No services to charge' });
    }

    // Get service names
    const allServices = db.getAll('services');
    const serviceNames = detectedServices.map(ds => {
      const service = allServices.find(s => s.type === ds.type);
      return service ? service.name : ds.type;
    });

    // Create transaction
    const txId = uuidv4();
    const transactionId = `TX-${session.customer_id}`;

    const transaction = {
      id: txId,
      transaction_id: transactionId,
      session_id: sessionId,
      customer_id: session.customer_id,
      customer_name: session.customer_name,
      barber_name: session.barber_name,
      amount: session.total_bill,
      payment_method: paymentMethod,
      status: 'paid',
      timestamp: new Date().toISOString()
    };

    db.insert('transactions', transaction);

    // Insert transaction services
    serviceNames.forEach(serviceName => {
      db.insert('transaction_services', {
        transaction_id: txId,
        service_name: serviceName
      });
    });

    // Mark services as charged
    detectedServices.forEach(ds => {
      db.update('detected_services', ds.id, { status: 'charged' });
    });

    // Mark session as paid
    db.update('sessions', sessionId, {
      status: 'paid',
      end_time: new Date().toISOString()
    });

    res.status(201).json({ success: true, data: { ...transaction, services: serviceNames } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get transaction statistics
export const getTransactionStats = (req, res) => {
  try {
    const { period = 'today' } = req.query;
    
    const now = new Date();
    let startDate;
    
    switch (period) {
      case 'today':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(0);
    }

    const transactions = db.getAll('transactions')
      .filter(t => t.status === 'paid' && new Date(t.timestamp) >= startDate);

    const totalTransactions = transactions.length;
    const totalRevenue = transactions.reduce((sum, t) => sum + t.amount, 0);
    const avgTransaction = totalTransactions > 0 ? Math.round(totalRevenue / totalTransactions) : 0;
    const uniqueCustomers = new Set(transactions.map(t => t.customer_id)).size;

    // Group by payment method
    const byMethod = {};
    transactions.forEach(t => {
      if (!byMethod[t.payment_method]) {
        byMethod[t.payment_method] = { count: 0, total: 0 };
      }
      byMethod[t.payment_method].count++;
      byMethod[t.payment_method].total += t.amount;
    });

    const byPaymentMethod = Object.entries(byMethod).map(([method, data]) => ({
      payment_method: method,
      count: data.count,
      total: data.total
    }));

    res.json({ 
      success: true, 
      data: { 
        summary: {
          total_transactions: totalTransactions,
          total_revenue: totalRevenue,
          avg_transaction: avgTransaction,
          unique_customers: uniqueCustomers
        },
        byPaymentMethod
      } 
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
