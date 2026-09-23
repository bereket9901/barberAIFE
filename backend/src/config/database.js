import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbPath = join(__dirname, '..', '..', 'data', 'barberai.db');

// Ensure data directory exists
import { mkdirSync } from 'fs';
mkdirSync(join(__dirname, '..', '..', 'data'), { recursive: true });

const db = new Database(dbPath);

// Enable WAL mode for better concurrent performance
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Initialize database schema
db.exec(`
  -- Services table
  CREATE TABLE IF NOT EXISTS services (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT NOT NULL UNIQUE,
    price INTEGER NOT NULL,
    duration INTEGER NOT NULL,
    enabled INTEGER NOT NULL DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  );

  -- Barbers table
  CREATE TABLE IF NOT EXISTS barbers (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    avatar TEXT,
    active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now'))
  );

  -- Cameras table
  CREATE TABLE IF NOT EXISTS cameras (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    chair_id TEXT NOT NULL,
    stream_url TEXT,
    status TEXT NOT NULL DEFAULT 'online' CHECK(status IN ('online', 'offline')),
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  );

  -- Customer sessions table
  CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    chair_id TEXT NOT NULL,
    customer_name TEXT NOT NULL,
    customer_id TEXT NOT NULL,
    barber_id TEXT NOT NULL,
    barber_name TEXT NOT NULL,
    start_time TEXT NOT NULL DEFAULT (datetime('now')),
    end_time TEXT,
    status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active', 'completed', 'paid')),
    total_bill INTEGER NOT NULL DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (barber_id) REFERENCES barbers(id)
  );

  -- Detected services within a session
  CREATE TABLE IF NOT EXISTS detected_services (
    id TEXT PRIMARY KEY,
    session_id TEXT NOT NULL,
    chair_id TEXT NOT NULL,
    type TEXT NOT NULL,
    confidence INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'detected' CHECK(status IN ('detected', 'confirmed', 'charged', 'rejected')),
    price INTEGER NOT NULL,
    detected_at TEXT NOT NULL DEFAULT (datetime('now')),
    completed_at TEXT,
    FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE
  );

  -- Transactions table
  CREATE TABLE IF NOT EXISTS transactions (
    id TEXT PRIMARY KEY,
    transaction_id TEXT NOT NULL UNIQUE,
    session_id TEXT NOT NULL,
    customer_id TEXT NOT NULL,
    customer_name TEXT NOT NULL,
    barber_name TEXT NOT NULL,
    amount INTEGER NOT NULL,
    payment_method TEXT NOT NULL CHECK(payment_method IN ('telebirr', 'cbe_birr', 'bank_transfer', 'cash', 'card')),
    status TEXT NOT NULL DEFAULT 'paid' CHECK(status IN ('paid', 'pending', 'failed')),
    timestamp TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (session_id) REFERENCES sessions(id)
  );

  -- Transaction services (many-to-many)
  CREATE TABLE IF NOT EXISTS transaction_services (
    transaction_id TEXT NOT NULL,
    service_name TEXT NOT NULL,
    PRIMARY KEY (transaction_id, service_name),
    FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON DELETE CASCADE
  );

  -- Activity log
  CREATE TABLE IF NOT EXISTS activity_log (
    id TEXT PRIMARY KEY,
    chair_id TEXT NOT NULL,
    message TEXT NOT NULL,
    confidence INTEGER NOT NULL,
    type TEXT NOT NULL CHECK(type IN (
      'service_start', 'service_detect', 'service_complete',
      'customer_enter', 'customer_leave', 'payment', 'bill_generated'
    )),
    timestamp TEXT NOT NULL DEFAULT (datetime('now'))
  );

  -- Indexes for performance
  CREATE INDEX IF NOT EXISTS idx_sessions_chair ON sessions(chair_id);
  CREATE INDEX IF NOT EXISTS idx_sessions_status ON sessions(status);
  CREATE INDEX IF NOT EXISTS idx_detected_services_session ON detected_services(session_id);
  CREATE INDEX IF NOT EXISTS idx_transactions_timestamp ON transactions(timestamp);
  CREATE INDEX IF NOT EXISTS idx_activity_timestamp ON activity_log(timestamp);
  CREATE INDEX IF NOT EXISTS idx_activity_chair ON activity_log(chair_id);
`);

export default db;
