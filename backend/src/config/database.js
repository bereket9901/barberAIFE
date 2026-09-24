import dotenv from 'dotenv';
import pkg from 'pg';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env file from backend root
dotenv.config({ path: join(__dirname, '..', '..', '.env') });

const { Pool } = pkg;

// PostgreSQL connection configuration
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME || 'barberai',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  max: 20, // maximum number of clients in pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Test connection
pool.on('connect', () => {
  console.log('✅ Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('❌ Unexpected PostgreSQL error:', err);
  process.exit(-1);
});

// Database helper methods
const database = {
  // Query helper
  async query(text, params) {
    const start = Date.now();
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('Executed query', { text, duration, rows: res.rowCount });
    return res;
  },

  // Get client for transactions
  async getClient() {
    const client = await pool.connect();
    return client;
  },

  // Close pool
  async close() {
    await pool.end();
  },

  // Initialize database schema
  async initSchema() {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Create tables
      await client.query(`
        CREATE TABLE IF NOT EXISTS services (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          name VARCHAR(255) NOT NULL,
          type VARCHAR(100) NOT NULL UNIQUE,
          price INTEGER NOT NULL,
          duration INTEGER NOT NULL,
          enabled BOOLEAN DEFAULT true,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS barbers (
          id VARCHAR(50) PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          active BOOLEAN DEFAULT true,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS cameras (
          id VARCHAR(50) PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          chair_id VARCHAR(10) NOT NULL,
          status VARCHAR(20) DEFAULT 'online' CHECK (status IN ('online', 'offline')),
          stream_url TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS sessions (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          chair_id VARCHAR(10) NOT NULL,
          customer_name VARCHAR(255) NOT NULL,
          customer_id VARCHAR(50) NOT NULL,
          barber_id VARCHAR(50) NOT NULL,
          barber_name VARCHAR(255) NOT NULL,
          start_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          end_time TIMESTAMP,
          status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paid')),
          total_bill INTEGER DEFAULT 0,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (barber_id) REFERENCES barbers(id)
        );

        CREATE TABLE IF NOT EXISTS detected_services (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          session_id UUID NOT NULL,
          chair_id VARCHAR(10) NOT NULL,
          type VARCHAR(100) NOT NULL,
          confidence INTEGER NOT NULL,
          status VARCHAR(20) DEFAULT 'detected' CHECK (status IN ('detected', 'confirmed', 'charged', 'rejected')),
          price INTEGER NOT NULL,
          detected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          completed_at TIMESTAMP,
          FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS transactions (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          transaction_id VARCHAR(50) NOT NULL UNIQUE,
          session_id UUID NOT NULL,
          customer_id VARCHAR(50) NOT NULL,
          customer_name VARCHAR(255) NOT NULL,
          barber_name VARCHAR(255) NOT NULL,
          amount INTEGER NOT NULL,
          payment_method VARCHAR(50) NOT NULL CHECK (payment_method IN ('telebirr', 'cbe_birr', 'bank_transfer', 'cash', 'card')),
          status VARCHAR(20) DEFAULT 'paid' CHECK (status IN ('paid', 'pending', 'failed')),
          timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (session_id) REFERENCES sessions(id)
        );

        CREATE TABLE IF NOT EXISTS transaction_services (
          transaction_id UUID NOT NULL,
          service_name VARCHAR(255) NOT NULL,
          PRIMARY KEY (transaction_id, service_name),
          FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS activity_log (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          chair_id VARCHAR(10) NOT NULL,
          message TEXT NOT NULL,
          confidence INTEGER NOT NULL,
          type VARCHAR(50) NOT NULL CHECK (type IN (
            'service_start', 'service_detect', 'service_complete',
            'customer_enter', 'customer_leave', 'payment', 'bill_generated'
          )),
          timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        -- Create indexes for better performance
        CREATE INDEX IF NOT EXISTS idx_sessions_chair ON sessions(chair_id);
        CREATE INDEX IF NOT EXISTS idx_sessions_status ON sessions(status);
        CREATE INDEX IF NOT EXISTS idx_detected_services_session ON detected_services(session_id);
        CREATE INDEX IF NOT EXISTS idx_transactions_timestamp ON transactions(timestamp);
        CREATE INDEX IF NOT EXISTS idx_activity_timestamp ON activity_log(timestamp);
        CREATE INDEX IF NOT EXISTS idx_activity_chair ON activity_log(chair_id);
      `);

      await client.query('COMMIT');
      console.log('✅ Database schema initialized successfully');
    } catch (err) {
      await client.query('ROLLBACK');
      console.error('❌ Error initializing schema:', err);
      throw err;
    } finally {
      client.release();
    }
  },
};

export default database;
