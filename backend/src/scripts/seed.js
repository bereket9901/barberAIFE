import db from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';

console.log('🌱 Seeding database...\n');

// Seed services
const services = [
  { name: 'Haircut', type: 'haircut', price: 300, duration: 30 },
  { name: 'Beard Trim', type: 'beard_trim', price: 150, duration: 15 },
  { name: 'Hair Wash', type: 'hair_wash', price: 100, duration: 10 },
  { name: 'Hair Coloring', type: 'hair_coloring', price: 500, duration: 60 },
  { name: 'Shaving', type: 'shaving', price: 150, duration: 20 },
  { name: 'Facial', type: 'facial', price: 300, duration: 25 }
];

console.log('📋 Seeding services...');
const insertService = db.prepare(
  'INSERT OR IGNORE INTO services (id, name, type, price, duration) VALUES (?, ?, ?, ?, ?)'
);

services.forEach(service => {
  insertService.run(uuidv4(), service.name, service.type, service.price, service.duration);
});
console.log(`✅ Seeded ${services.length} services\n`);

// Seed barbers
const barbers = [
  { id: 'b1', name: 'Dawit' },
  { id: 'b2', name: 'Abel' },
  { id: 'b3', name: 'Yonas' },
  { id: 'b4', name: 'Samuel' }
];

console.log('💈 Seeding barbers...');
const insertBarber = db.prepare(
  'INSERT OR IGNORE INTO barbers (id, name) VALUES (?, ?)'
);

barbers.forEach(barber => {
  insertBarber.run(barber.id, barber.name);
});
console.log(`✅ Seeded ${barbers.length} barbers\n`);

// Seed cameras
const cameras = [
  { id: 'cam-1', name: 'Camera 1', chairId: '1' },
  { id: 'cam-2', name: 'Camera 2', chairId: '2' },
  { id: 'cam-3', name: 'Camera 3', chairId: '3' },
  { id: 'cam-4', name: 'Camera 4', chairId: '4' }
];

console.log('📹 Seeding cameras...');
const insertCamera = db.prepare(
  'INSERT OR IGNORE INTO cameras (id, name, chair_id, status) VALUES (?, ?, ?, ?)'
);

cameras.forEach(camera => {
  insertCamera.run(camera.id, camera.name, camera.chairId, 'online');
});
console.log(`✅ Seeded ${cameras.length} cameras\n`);

// Seed some sample transactions
console.log('💰 Seeding sample transactions...');
const insertTransaction = db.prepare(`
  INSERT INTO transactions (id, transaction_id, session_id, customer_id, customer_name, barber_name, amount, payment_method, timestamp)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const insertTxService = db.prepare(
  'INSERT INTO transaction_services (transaction_id, service_name) VALUES (?, ?)'
);

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

sampleTransactions.forEach(tx => {
  const txId = uuidv4();
  const transactionId = `TX-${tx.customerId}`;
  const sessionId = uuidv4();

  insertTransaction.run(
    txId,
    transactionId,
    sessionId,
    tx.customerId,
    tx.customerName,
    tx.barberName,
    tx.amount,
    tx.paymentMethod,
    tx.timestamp
  );

  tx.services.forEach(service => {
    insertTxService.run(txId, service);
  });
});
console.log(`✅ Seeded ${sampleTransactions.length} transactions\n`);

// Seed some active sessions
console.log('🪑 Seeding active sessions...');
const insertSession = db.prepare(`
  INSERT INTO sessions (id, chair_id, customer_name, customer_id, barber_id, barber_name, start_time, total_bill)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`);

const insertDetectedService = db.prepare(`
  INSERT INTO detected_services (id, session_id, chair_id, type, confidence, price, status)
  VALUES (?, ?, ?, ?, ?, ?, ?)
`);

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

activeSessions.forEach(session => {
  const sessionId = uuidv4();
  insertSession.run(
    sessionId,
    session.chairId,
    session.customerName,
    session.customerId,
    session.barberId,
    session.barberName,
    new Date().toISOString(),
    session.totalBill
  );

  session.services.forEach(service => {
    insertDetectedService.run(
      uuidv4(),
      sessionId,
      session.chairId,
      service.type,
      service.confidence,
      service.price,
      service.status
    );
  });
});
console.log(`✅ Seeded ${activeSessions.length} active sessions\n`);

console.log('🎉 Database seeding completed successfully!\n');
console.log('📊 Summary:');
console.log(`   • ${services.length} services`);
console.log(`   • ${barbers.length} barbers`);
console.log(`   • ${cameras.length} cameras`);
console.log(`   • ${sampleTransactions.length} transactions`);
console.log(`   • ${activeSessions.length} active sessions\n`);
