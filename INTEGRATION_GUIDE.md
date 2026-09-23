# BarberAI - Full Stack Setup Guide

This guide will help you set up both the frontend and backend for the BarberAI application.

## 📁 Project Structure

```
barberai/
├── backend/              # Node.js Express API
│   ├── src/
│   │   ├── index.js
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── middleware/
│   │   └── scripts/
│   ├── package.json
│   └── README.md
├── src/                  # React Frontend
│   ├── components/
│   ├── lib/
│   │   └── api.ts       # API client
│   ├── App.tsx
│   └── main.tsx
└── package.json
```

## 🚀 Quick Start

### 1. Install Backend Dependencies

```bash
cd backend
npm install
```

### 2. Seed the Database

```bash
npm run seed
```

This creates the SQLite database with sample data:
- 6 services (Haircut, Beard Trim, etc.)
- 4 barbers (Dawit, Abel, Yonas, Samuel)
- 4 cameras
- Sample transactions
- Active sessions

### 3. Start the Backend

```bash
npm run dev
```

Backend will run on `http://localhost:3001`

### 4. Install Frontend Dependencies (if not already done)

```bash
cd ..
npm install
```

### 5. Start the Frontend

```bash
npm run dev
```

Frontend will run on `http://localhost:5173`

## 🔌 Connecting Frontend to Backend

The frontend includes an API client at `src/lib/api.ts` that's ready to use.

### Example: Fetch Services from Backend

```typescript
import { servicesAPI } from './lib/api';

// In your component
const fetchServices = async () => {
  try {
    const response = await servicesAPI.getAll();
    console.log(response.data); // Array of services
  } catch (error) {
    console.error('Failed to fetch services:', error);
  }
};
```

### Example: Create a Session

```typescript
import { sessionsAPI } from './lib/api';

const startSession = async () => {
  try {
    const response = await sessionsAPI.create({
      chairId: '1',
      customerName: 'Customer #1050',
      customerId: '1050',
      barberId: 'b1',
      barberName: 'Dawit'
    });
    console.log('Session created:', response.data);
  } catch (error) {
    console.error('Failed to create session:', error);
  }
};
```

### Example: Process Payment

```typescript
import { transactionsAPI } from './lib/api';

const processPayment = async (sessionId: string) => {
  try {
    const response = await transactionsAPI.create({
      sessionId,
      paymentMethod: 'telebirr'
    });
    console.log('Payment processed:', response.data);
  } catch (error) {
    console.error('Failed to process payment:', error);
  }
};
```

## 📡 Available API Endpoints

### Services
- `GET /api/services` - List all services
- `POST /api/services` - Create service
- `PUT /api/services/:id` - Update service
- `DELETE /api/services/:id` - Delete service

### Sessions
- `GET /api/sessions` - List sessions (optional `?status=active`)
- `POST /api/sessions` - Create session
- `POST /api/sessions/:id/detected-services` - Add detected service
- `PATCH /api/sessions/detected-services/:id` - Update service status
- `POST /api/sessions/:id/complete` - Complete session

### Transactions
- `GET /api/transactions` - List transactions
- `POST /api/transactions` - Process payment
- `GET /api/transactions/stats` - Get statistics

### Cameras
- `GET /api/cameras` - List cameras
- `GET /api/cameras/status` - System status

### Activity
- `GET /api/activity` - Get activity log
- `POST /api/activity` - Add activity

### AI Simulation
- `POST /api/ai/demo` - Run demo simulation
- `POST /api/ai/detect` - Simulate detection

## 🔄 Migrating from Mock Data to Backend

Currently, the frontend uses Zustand store with mock data. To migrate to backend:

### 1. Update Store to Use API

```typescript
// src/store.ts
import { servicesAPI, sessionsAPI, transactionsAPI } from './lib/api';

export const useStore = create<AppState>((set, get) => ({
  // Fetch services from backend
  fetchServices: async () => {
    try {
      const response = await servicesAPI.getAll();
      set({ services: response.data });
    } catch (error) {
      console.error('Failed to fetch services:', error);
    }
  },

  // Fetch sessions from backend
  fetchSessions: async () => {
    try {
      const response = await sessionsAPI.getAll();
      set({ sessions: response.data });
    } catch (error) {
      console.error('Failed to fetch sessions:', error);
    }
  },

  // Create session via backend
  startSession: async (chairId, customerName, customerId, barberId, barberName) => {
    try {
      const response = await sessionsAPI.create({
        chairId,
        customerName,
        customerId,
        barberId,
        barberName
      });
      
      // Refresh sessions
      await get().fetchSessions();
      return response.data;
    } catch (error) {
      console.error('Failed to start session:', error);
    }
  },

  // Process payment via backend
  processPayment: async (sessionId, paymentMethod) => {
    try {
      const response = await transactionsAPI.create({
        sessionId,
        paymentMethod
      });
      
      // Refresh sessions and transactions
      await Promise.all([
        get().fetchSessions(),
        get().fetchTransactions()
      ]);
      
      return response.data;
    } catch (error) {
      console.error('Failed to process payment:', error);
    }
  },
}));
```

### 2. Update Components to Call Store Methods

```typescript
// In Dashboard.tsx
const handleStartDemo = async () => {
  setDemoRunning(true);
  
  // Call backend API
  const response = await aiAPI.runDemo('2');
  
  // Refresh data
  await fetchSessions();
  await fetchActivity();
  
  setDemoRunning(false);
};
```

## 🧪 Testing the Integration

### Test Backend Health
```bash
curl http://localhost:3001/health
```

### Test Services Endpoint
```bash
curl http://localhost:3001/api/services
```

### Test Creating a Session
```bash
curl -X POST http://localhost:3001/api/sessions \
  -H "Content-Type: application/json" \
  -d '{
    "chairId": "2",
    "customerName": "Test Customer",
    "customerId": "9999",
    "barberId": "b2",
    "barberName": "Abel"
  }'
```

### Test AI Demo
```bash
curl -X POST http://localhost:3001/api/ai/demo \
  -H "Content-Type: application/json" \
  -d '{"chairId": "3"}'
```

## 📊 Database Management

### View Database
The SQLite database is located at: `backend/data/barberai.db`

You can use any SQLite viewer or command line:
```bash
sqlite3 backend/data/barberai.db
.tables
SELECT * FROM services;
.quit
```

### Reset Database
```bash
rm backend/data/barberai.db
npm run seed
```

## 🔧 Configuration

### Backend Environment Variables

Create `backend/.env`:
```env
PORT=3001
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
```

### Frontend Environment Variables

Create `.env` in project root:
```env
VITE_API_URL=http://localhost:3001/api
```

## 🐛 Troubleshooting

### Backend won't start
- Check if port 3001 is available
- Ensure Node.js 18+ is installed
- Run `npm install` in backend directory

### Frontend can't connect to backend
- Ensure backend is running on port 3001
- Check CORS settings in `backend/src/index.js`
- Verify API_BASE_URL in `src/lib/api.ts`

### Database errors
- Delete `backend/data/barberai.db` and run `npm run seed`
- Check file permissions in `backend/data/` directory

## 📚 Additional Resources

- Backend README: `backend/README.md`
- API Documentation: See backend README for full API docs
- Database Schema: `backend/src/config/database.js`

## 🎯 Next Steps

1. ✅ Backend is set up and running
2. ✅ Frontend API client is ready
3. 🔄 Update frontend components to use API calls
4. 🔄 Replace mock data with real backend data
5. 🔄 Add real-time updates (WebSocket/SSE)
6. 🔄 Implement real camera integration
7. 🔄 Connect actual AI vision models
8. 🔄 Integrate real payment APIs (Telebirr, CBE Birr)

## 📞 Support

For issues or questions:
- Check backend logs: Console output when running `npm run dev`
- Check browser console: For frontend API errors
- Review API responses: Use browser DevTools Network tab

---

**Happy coding! 🚀**
