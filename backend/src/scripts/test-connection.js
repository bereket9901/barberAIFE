import pg from 'pg';
import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🔍 Testing PostgreSQL Connection...\n');

// Read .env file manually (simple parser)
const envPath = join(__dirname, '..', '.env');
if (!existsSync(envPath)) {
  console.error('❌ .env file not found!');
  console.error('   Please create a .env file in the backend folder\n');
  process.exit(1);
}

const envContent = readFileSync(envPath, 'utf-8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^#=]+)=(.*)$/);
  if (match) {
    envVars[match[1].trim()] = match[2].trim();
  }
});

const config = {
  host: envVars.DB_HOST || 'localhost',
  port: parseInt(envVars.DB_PORT || '5432'),
  database: envVars.DB_NAME || 'postgres', // Test with postgres database first
  user: envVars.DB_USER || 'postgres',
  password: envVars.DB_PASSWORD || '',
};

console.log('📋 Connection Settings:');
console.log(`   Host: ${config.host}`);
console.log(`   Port: ${config.port}`);
console.log(`   User: ${config.user}`);
console.log(`   Database: ${config.database}`);
console.log(`   Password: ${'*'.repeat(config.password.length)}\n`);

const client = new pg.Client(config);

async function testConnection() {
  try {
    console.log('⏳ Attempting to connect...\n');
    await client.connect();
    
    console.log('✅ Connection successful!\n');
    
    // Get PostgreSQL version
    const versionResult = await client.query('SELECT version()');
    console.log('📊 PostgreSQL Version:');
    console.log(`   ${versionResult.rows[0].version}\n`);
    
    // Check if barberai database exists
    const dbCheck = await client.query(
      "SELECT datname FROM pg_database WHERE datname = 'barberai'"
    );
    
    if (dbCheck.rows.length > 0) {
      console.log('✅ Database "barberai" exists!\n');
    } else {
      console.log('⚠️  Database "barberai" does not exist!');
      console.log('   Creating it now...\n');
      
      await client.query('CREATE DATABASE barberai');
      console.log('✅ Database "barberai" created!\n');
    }
    
    await client.end();
    
    console.log('🎉 All checks passed!');
    console.log('\n🚀 Next steps:');
    console.log('   1. npm run db:init    (Create tables)');
    console.log('   2. npm run seed       (Add sample data)');
    console.log('   3. npm run dev        (Start server)\n');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Connection failed!\n');
    console.error('Error:', error.message);
    console.error('\n💡 Troubleshooting:\n');
    
    if (error.message.includes('password authentication failed')) {
      console.error('   ❌ Wrong password!');
      console.error('   → Check DB_PASSWORD in .env file');
      console.error('   → Current password in .env: ' + config.password);
      console.error('   → Make sure it matches your PostgreSQL password\n');
    } else if (error.message.includes('does not exist')) {
      console.error('   ❌ PostgreSQL user does not exist!');
      console.error('   → Check DB_USER in .env file');
      console.error('   → Default is usually "postgres"\n');
    } else if (error.message.includes('ECONNREFUSED')) {
      console.error('   ❌ Cannot connect to PostgreSQL!');
      console.error('   → Make sure PostgreSQL is running');
      console.error('   → Check DB_HOST and DB_PORT in .env file\n');
      
      console.error('   Windows: Check Services → PostgreSQL');
      console.error('   Or run: net start postgresql-x64-15\n');
    } else if (error.message.includes('database')) {
      console.error('   ❌ Database issue!');
      console.error('   → The database might not exist yet');
      console.error('   → Run: psql -U postgres -c "CREATE DATABASE barberai;"\n');
    }
    
    console.error('📚 See POSTGRESQL_SETUP.md for detailed help\n');
    
    await client.end();
    process.exit(1);
  }
}

testConnection();
