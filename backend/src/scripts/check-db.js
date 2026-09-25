#!/usr/bin/env node

import database from '../config/database.js';
import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🔍 Checking PostgreSQL connection...\n');

// Check if .env file exists
const envPath = join(__dirname, '..', '.env');
if (!existsSync(envPath)) {
  console.log('⚠️  No .env file found!');
  console.log('   Creating .env from .env.example...\n');
  
  try {
    const examplePath = join(__dirname, '..', '.env.example');
    const exampleContent = readFileSync(examplePath, 'utf-8');
    const { writeFileSync } = await import('fs');
    writeFileSync(envPath, exampleContent);
    console.log('✅ Created .env file');
    console.log('   Please edit .env with your PostgreSQL credentials\n');
  } catch (error) {
    console.log('❌ Could not create .env file');
    console.log('   Please create it manually from .env.example\n');
  }
}

async function checkConnection() {
  try {
    // Test connection
    await database.query('SELECT 1');
    console.log('✅ PostgreSQL connection successful!\n');
    
    // Check if database exists and has tables
    const tablesResult = await database.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    
    if (tablesResult.rows.length === 0) {
      console.log('⚠️  Database is empty!');
      console.log('   Run: npm run db:init\n');
    } else {
      console.log(`✅ Found ${tablesResult.rows.length} tables:`);
      tablesResult.rows.forEach(row => {
        console.log(`   • ${row.table_name}`);
      });
      console.log();
    }
    
    // Check if data exists
    const servicesResult = await database.query('SELECT COUNT(*) FROM services');
    const count = parseInt(servicesResult.rows[0].count);
    
    if (count === 0) {
      console.log('⚠️  No data found!');
      console.log('   Run: npm run seed\n');
    } else {
      console.log(`✅ Database has ${count} services\n`);
    }
    
    console.log('🚀 You can now start the server:');
    console.log('   npm run dev\n');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ PostgreSQL connection failed!\n');
    console.error('Error:', error.message);
    console.error('\n💡 Troubleshooting:');
    console.error('   1. Make sure PostgreSQL is installed and running');
    console.error('   2. Check your .env file has correct credentials');
    console.error('   3. Create the database: psql -U postgres -c "CREATE DATABASE barberai;"');
    console.error('   4. See POSTGRESQL_SETUP.md for detailed instructions\n');
    
    process.exit(1);
  }
}

checkConnection();
