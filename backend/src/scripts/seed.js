import database from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';

console.log('🌱 Seeding PostgreSQL database...\n');

async function seedDatabase() {
  const client = await database.getClient();
  
  try {
    await client.query('BEGIN');

    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await client.query('DELETE FROM transaction_services');
    await client.query('DELETE FROM transactions');
    await client.query('DELETE FROM detected_services');
    await client.query('DELETE FROM sessions');
    await client.query('DELETE FROM activity_log');
    await client.query('DELETE FROM cameras');
    await client.query('DELETE FROM barbers');
    await client.query('DELETE FROM services');

    // Seed services
    console.log('📋 Seeding services...');
    const services = [
      { name: 'Haircut', type: 'haircut', price: 300, duration: 30 },
      { name: 'Beard Trim', type: 'beard_trim', price: 150, duration: 15 },
      { name: 'Hair Wash', type: 'hair_wash', price: 100, duration: 10 },
      { name: 'Hair Coloring', type: 'hair_coloring', price: 500, duration: 60 },
      { name: 'Shaving', type: 'shaving', price: 150, duration: 20 },
      { name: 'Facial', type: 'facial', price: 300, duration: 25 }
    ];

    for (const service of services) {
      await client.query(
        `INSERT INTO services (name, type, price, duration)
         VALUES ($1, $2, $3, $4)`,
        [service.name, service.type, service.price, service.duration]
      );
    }
    console.log(`✅ Seeded ${services.length} services\n`);

    // Seed barbers
    console.log('💈 Seeding barbers...');
    const barbers = [
      { id: 'b1', name: 'Dawit' },
      { id: 'b2', name: 'Abel' },
      { id: 'b3', name: 'Yonas' },
      { id: 'b4', name: 'Samuel' }
    ];

    for (const barber of barbers) {
      await client.query(
        `INSERT INTO barbers (id, name)
         VALUES ($1, $2)`,
        [barber.id, barber.name]
      );
    }
    console.log(`✅ Seeded ${barbers.length} barbers\n`);

    // Seed cameras
    console.log('📹 Seeding cameras...');
    const cameras = [
      { id: 'cam-1', name: 'Camera 1', chairId: '1' },
      { id: 'cam-2', name: 'Camera 2', chairId: '2' },
      { id: 'cam-3', name: 'Camera 3', chairId: '3' },
      { id: 'cam-4', name: 'Camera 4', chairId: '4' }
    ];

    for (const camera of cameras) {
      await client.query(
        `INSERT INTO cameras (id, name, chair_id, status)
         VALUES ($1, $2, $3, 'online')`,
        [camera.id, camera.name, camera.chairId]
      );
    }
    console.log(`✅ Seeded ${cameras.length} cameras\n`);

    // Seed some sample transactions
    console.log('💰 Seeding sample transactions...');
    const sampleTransactions = [
      {
        customerId: '1038',
        customerName: 'Customer #1038',
        barberName: 'Dawit',
        services: ['Haircut', 'Hair Wash'],
        amount: 400,
        paymentMethod: 'telebirr',
        timestamp: '2026-01-15T09:30:00'
      },
      {
        customerId: '1039',
        customerName: 'Customer #1039',
        barberName: 'Abel',
        services: ['Beard Trim', 'Shaving'],
        amount: 300,
        paymentMethod: 'cbe_birr',
        timestamp: '2026-01-15T10:15:00'
      },
      {
        customerId: '1040',
        customerName: 'Customer #1040',
        barberName: 'Yonas',
        services: ['Haircut'],
        amount: 300,
        paymentMethod: 'cash',
        timestamp: '2026-01-15T10:45:00'
      }
    ];

    for (const tx of sampleTransactions) {
      const txId = uuidv4();
      const transactionId = `TX-${tx.customerId}`;
      const sessionId = uuidv4();

      await client.query(
        `INSERT INTO transactions (id, transaction_id, session_id, customer_id, customer_name, barber_name, amount, payment_method, timestamp)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [txId, transactionId, sessionId, tx.customerId, tx.customerName, tx.barberName, tx.amount, tx.paymentMethod, tx.timestamp]
      );

      for (const serviceName of tx.services) {
        await client.query(
          `INSERT INTO transaction_services (transaction_id, service_name)
           VALUES ($1, $2)`,
          [txId, serviceName]
        );
      }
    }
    console.log(`✅ Seeded ${sampleTransactions.length} transactions\n`);

    // Seed some active sessions
    console.log('🪑 Seeding active sessions...');
    const activeSessions = [
      {
        chairId: '1',
        customerName: 'Customer #1041',
        customerId: '1041',
        barberId: 'b1',
        barberName: 'Dawit',
        services: [{ type: 'haircut', confidence: 94, price: 300, status: 'confirmed' }],
        totalBill: 300
      },
      {
        chairId: '3',
        customerName: 'Customer #1043',
        customerId: '1043',
        barberId: 'b3',
        barberName: 'Yonas',
        services: [{ type: 'shaving', confidence: 92, price: 150, status: 'confirmed' }],
        totalBill: 150
      }
    ];

    for (const session of activeSessions) {
      const sessionId = uuidv4();
      
      await client.query(
        `INSERT INTO sessions (id, chair_id, customer_name, customer_id, barber_id, barber_name, total_bill)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [sessionId, session.chairId, session.customerName, session.customerId, session.barberId, session.barberName, session.totalBill]
      );

      for (const service of session.services) {
        await client.query(
          `INSERT INTO detected_services (session_id, chair_id, type, confidence, status, price)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [sessionId, session.chairId, service.type, service.confidence, service.status, service.price]
        );
      }
    }
    console.log(`✅ Seeded ${activeSessions.length} active sessions\n`);

    await client.query('COMMIT');

    console.log('🎉 Database seeding completed successfully!\n');
    console.log('📊 Summary:');
    console.log(`   • ${services.length} services`);
    console.log(`   • ${barbers.length} barbers`);
    console.log(`   • ${cameras.length} cameras`);
    console.log(`   • ${sampleTransactions.length} transactions`);
    console.log(`   • ${activeSessions.length} active sessions\n`);

    process.exit(0);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('\n❌ Error seeding database:', error.message);
    process.exit(1);
  } finally {
    client.release();
  }
}

seedDatabase();
