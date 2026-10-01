import bcrypt from 'bcryptjs';
import database from '../config/database.js';

const seedUsers = async () => {
  console.log('🌱 Seeding users...\n');

  try {
    // Check if admin user already exists
    const existingAdmin = await database.query(
      'SELECT * FROM users WHERE email = $1',
      ['admin@barberai.com']
    );

    if (existingAdmin.rows.length > 0) {
      console.log('✅ Admin user already exists\n');
      return;
    }

    // Create default admin user
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('admin123', salt);

    await database.query(
      `INSERT INTO users (email, password_hash, name, role)
       VALUES ($1, $2, $3, $4)`,
      ['admin@barberai.com', passwordHash, 'Admin User', 'admin']
    );

    console.log('✅ Created default admin user:');
    console.log('   Email: admin@barberai.com');
    console.log('   Password: admin123');
    console.log('   ⚠️  Please change this password in production!\n');

  } catch (error) {
    console.error('❌ Error seeding users:', error.message);
    process.exit(1);
  }
};

// Run seed
seedUsers().then(() => {
  console.log('✨ User seeding completed\n');
  process.exit(0);
}).catch((error) => {
  console.error('❌ Seed failed:', error);
  process.exit(1);
});
