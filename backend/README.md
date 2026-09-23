# BarberAI Backend API

Node.js backend for the BarberAI Visual Service & Payment Counter system.

## 🚀 Tech Stack

- **Runtime**: Node.js with ES Modules
- **Framework**: Express.js
- **Database**: JSON file-based (zero native dependencies!)
- **CORS**: Enabled for frontend integration

> **Note**: This backend uses a pure JavaScript JSON file-based database instead of SQLite. This means **no native compilation is required** — it works on Windows, Mac, and Linux without any build tools!

## 📋 Prerequisites

- Node.js 18+
- npm

## 🛠️ Installation

```bash
cd backend
npm install
```

That's it! No build tools, no Python, no native compilation needed.

## 🗄️ Database Setup

The database is automatically created as a JSON file when the server starts. To seed initial 

```bash
npm run seed
```

This will populate the database with:
- 6 services (Haircut, Beard Trim, Hair Wash, etc.)
- 4 barbers (Dawit, Abel, Yonas, Samuel)
- 4 cameras (one per chair)
- Sample transactions
- Active sessions

## 🏃 Running the Server

### Development (with auto-reload)
```bash
npm run dev
```

### Production
```bash
npm start
```

The server will start on `http://localhost:3001` by default.

## 📡 API Endpoints

### Health Check
```
GET /health
```

### Services
```
GET    /api/services          - Get all services
GET    /api/services/:id      - Get service by ID
POST   /api/services          - Create new service
PUT    /api/services/:id      - Update service
DELETE /api/services/:id      - Delete service
```

### Sessions
```
GET    /api/sessions                    - Get all sessions (optional ?status=active)
GET    /api/sessions/:id                - Get session by ID
GET    /api/sessions/chair/:chairId     - Get sessions by chair
POST   /api/sessions                    - Create new session
POST   /api/sessions/:sessionId/detected-services - Add detected service
PATCH  /api/sessions/detected-services/:serviceId - Update service status
POST   /api/sessions/:id/complete       - Complete session
```

### Transactions
```
GET    /api/transactions                - Get all transactions (optional ?paymentMethod=telebirr)
GET    /api/transactions/stats          - Get transaction statistics
GET    /api/transactions/tx/:txId       - Get transaction by TX ID
GET    /api/transactions/:id            - Get transaction by ID
POST   /api/transactions                - Create transaction (process payment)
```

### Cameras
```
GET    /api/cameras                     - Get all cameras
GET    /api/cameras/status              - Get system status
GET    /api/cameras/:id                 - Get camera by ID
GET    /api/cameras/chair/:chairId      - Get camera by chair
PATCH  /api/cameras/:id                 - Update camera status
```

### Activity Log
```
GET    /api/activity                    - Get activity log (optional ?chairId=1&type=service_detect)
POST   /api/activity                    - Add activity entry
DELETE /api/activity                    - Clear activity log
```

### AI Simulation
```
POST   /api/ai/detect                   - Simulate AI detection
POST   /api/ai/demo                     - Run full demo simulation
GET    /api/ai/threshold                - Get confidence threshold
```

## 📝 Example Requests

### Create a Service
```bash
curl -X POST http://localhost:3001/api/services \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Haircut",
    "type": "haircut",
    "price": 300,
    "duration": 30,
    "enabled": true
  }'
```

### Start a Session
```bash
curl -X POST http://localhost:3001/api/sessions \
  -H "Content-Type: application/json" \
  -d '{
    "chairId": "1",
    "customerName": "Customer #1050",
    "customerId": "1050",
    "barberId": "b1",
    "barberName": "Dawit"
  }'
```

### Add Detected Service
```bash
curl -X POST http://localhost:3001/api/sessions/{sessionId}/detected-services \
  -H "Content-Type: application/json" \
  -d '{
    "type": "haircut",
    "confidence": 95,
    "price": 300
  }'
```

### Process Payment
```bash
curl -X POST http://localhost:3001/api/transactions \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "{sessionId}",
    "paymentMethod": "telebirr"
  }'
```

### Run AI Demo
```bash
curl -X POST http://localhost:3001/api/ai/demo \
  -H "Content-Type: application/json" \
  -d '{
    "chairId": "2"
  }'
```

## 🗂️ Database

The database is stored as a JSON file at `backend/data/barberai.json`.

### Schema

The JSON file contains these arrays:
- **services**: Available services with pricing
- **barbers**: Barber information
- **cameras**: Camera configuration per chair
- **sessions**: Customer sessions (active/completed/paid)
- **detected_services**: AI-detected services within sessions
- **transactions**: Payment records
- **transaction_services**: Services included in transactions
- **activity_log**: Real-time activity events

## 🔧 Configuration

Environment variables (optional):
```env
PORT=3001
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
```

## 📦 Project Structure

```
backend/
├── package.json
├── data/
│   └── barberai.json        # JSON database (auto-created)
└── src/
    ├── index.js             # Main server entry point
    ├── config/
    │   └── database.js      # JSON database wrapper
    ├── controllers/
    │   ├── servicesController.js
    │   ├── sessionsController.js
    │   ├── transactionsController.js
    │   ├── camerasController.js
    │   ├── activityController.js
    │   └── aiController.js
    ├── routes/
    │   ├── services.js
    │   ├── sessions.js
    │   ├── transactions.js
    │   ├── cameras.js
    │   ├── activity.js
    │   └── ai.js
    ├── middleware/
    │   └── errorHandler.js
    └── scripts/
        └── seed.js          # Database seeding script
```

## 🔄 Upgrading to a Real Database

When you're ready to move to production, you can easily swap the JSON database for SQLite, PostgreSQL, or MongoDB. The controller interface is designed to make this straightforward — just replace the `database.js` module with one that uses your preferred database driver.

## 🚀 Next Steps

1. Start the backend: `npm run dev`
2. Seed the database: `npm run seed`
3. Update frontend API calls to use `http://localhost:3001/api/*`
4. Replace mock data with actual API calls

## 📝 License

MIT
