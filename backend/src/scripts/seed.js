import db from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';

console.log('🌱 Seeding database...\n');

// Clear existing data
db.clear('services');
db.clear('barbers');
db.clear('cameras');
db.clear('sessions');
db.clear('detected_services');
db.clear('transactions');
db.clear('transaction_services');
db.clear('activity_log');

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
services.forEach(service => {
  db.insert('services', {
    id: uuidv4(),
    ...service,
    enabled: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  });
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
barbers.forEach(barber => {
  db.insert('barbers', {
    ...barber,
    active: 1,
    created_at: new Date().toISOString()
  });
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
cameras.forEach(camera => {
  db.insert('cameras', {
    id: camera.id,
    name: camera.name,
    chair_id: camera.chairId,
    status: 'online',
    stream_url: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  });
});
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

sampleTransactions.forEach(tx => {
  const txId = uuidv4();
  const transactionId = `TX-${tx.customerId}`;
  const sessionId = uuidv4();

  db.insert('transactions', {
    id: txId,
    transaction_id: transactionId,
    session_id: sessionId,
    customer_id: tx.customerId,
    customer_name: tx.customerName,
    barber_name: tx.barberName,
    amount: tx.amount,
    payment_method: tx.paymentMethod,
    status: 'paid',
    timestamp: tx.timestamp
  });

  tx.services.forEach(service => {
    db.insert('transaction_services', {
      transaction_id: txId,
      service_name: service
    });
  });
});
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

activeSessions.forEach(session => {
  const sessionId = uuidv4();
  
  db.insert('sessions', {
    id: sessionId,
    chair_id: session.chairId,
    customer_name: session.customerName,
    customer_id: session.customerId,
    barber_id: session.barberId,
    barber_name: session.barberName,
    start_time: new Date().toISOString(),
    end_time: null,
    status: 'active',
    total_bill: session.totalBill,
    created_at: new Date().toISOString()
  });

  session.services.forEach(service => {
    db.insert('detected_services', {
      id: uuidv4(),
      session_id: sessionId,
      chair_id: session.chairId,
      type: service.type,
      confidence: service.confidence,
      status: service.status,
      price: service.price,
      detected_at: new Date().toISOString(),
      completed_at: service.status === 'confirmed' ? new Date().toISOString() : null
    });
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
