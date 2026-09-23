import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dataDir = join(__dirname, '..', '..', 'data');
const dbPath = join(dataDir, 'barberai.json');

// Ensure data directory exists
mkdirSync(dataDir, { recursive: true });

// Database structure
const defaultData = {
  services: [],
  barbers: [],
  cameras: [],
  sessions: [],
  detected_services: [],
  transactions: [],
  transaction_services: [],
  activity_log: []
};

// Load or initialize database
function loadDB() {
  if (existsSync(dbPath)) {
    try {
      const data = readFileSync(dbPath, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Error loading database, creating new one:', error);
      return { ...defaultData };
    }
  }
  return { ...defaultData };
}

// Save database to file
function saveDB(data) {
  writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf-8');
}

// Initialize database
let db = loadDB();

// Database helper methods
const database = {
  // Get all records from a table
  getAll(table) {
    return db[table] || [];
  },

  // Get single record by ID
  getById(table, id) {
    const records = db[table] || [];
    return records.find(r => r.id === id);
  },

  // Get records by field value
  getByField(table, field, value) {
    const records = db[table] || [];
    return records.filter(r => r[field] === value);
  },

  // Insert a record
  insert(table, record) {
    if (!db[table]) {
      db[table] = [];
    }
    db[table].push(record);
    saveDB(db);
    return record;
  },

  // Update a record
  update(table, id, updates) {
    const records = db[table] || [];
    const index = records.findIndex(r => r.id === id);
    if (index !== -1) {
      records[index] = { ...records[index], ...updates };
      saveDB(db);
      return records[index];
    }
    return null;
  },

  // Delete a record
  delete(table, id) {
    const records = db[table] || [];
    const index = records.findIndex(r => r.id === id);
    if (index !== -1) {
      const deleted = records.splice(index, 1)[0];
      saveDB(db);
      return deleted;
    }
    return null;
  },

  // Delete records by field value
  deleteByField(table, field, value) {
    const records = db[table] || [];
    const filtered = records.filter(r => r[field] !== value);
    const deletedCount = records.length - filtered.length;
    db[table] = filtered;
    saveDB(db);
    return deletedCount;
  },

  // Clear all records from a table
  clear(table) {
    const count = (db[table] || []).length;
    db[table] = [];
    saveDB(db);
    return count;
  },

  // Query with conditions
  query(table, conditions = {}) {
    let records = db[table] || [];
    
    // Apply filters
    for (const [field, value] of Object.entries(conditions)) {
      if (value !== undefined && value !== null) {
        records = records.filter(r => r[field] === value);
      }
    }
    
    return records;
  },

  // Reload database from file
  reload() {
    db = loadDB();
  }
};

export default database;
