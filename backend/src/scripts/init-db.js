import database from '../config/database.js';

async function initDatabase() {
  console.log('🗄️  Initializing PostgreSQL database...\n');
  
  try {
    await database.initSchema();
    console.log('\n✅ Database initialization complete!');
    console.log('\n📊 Tables created:');
    console.log('   • services');
    console.log('   • barbers');
    console.log('   • cameras');
    console.log('   • sessions');
    console.log('   • detected_services');
    console.log('   • transactions');
    console.log('   • transaction_services');
    console.log('   • activity_log');
    console.log('\n🚀 You can now run: npm run seed');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Failed to initialize database:', error.message);
    console.error('\n💡 Make sure PostgreSQL is running and the database exists.');
    console.error('   Create it with: CREATE DATABASE barberai;');
    process.exit(1);
  }
}

initDatabase();
