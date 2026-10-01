# BarberAI - Visual Service & Payment Counter

A full-stack AI-powered barber shop management system with real-time service detection, automated billing, and Ethiopian payment integration.

## 🏗️ Project Structure (Monorepo)

```
barberai/
├── 📁 backend/              # Node.js Express API
│   ├── src/
│   │   ├── index.js         # Server entry point
│   │   ├── config/          # Database configuration
│   │   ├── controllers/     # Business logic
│   │   ├── routes/          # API routes
│   │   ├── middleware/      # Error handling, logging
│   │   └── scripts/         # Database seeding
│   ├── data/                # SQLite database (auto-created)
│   └── package.json
│
├── 📁 src/                  # React Frontend (Vite + TypeScript)
│   ├── components/          # UI components
│   │   ├── ui/             # shadcn/ui components
│   │   ├── Dashboard.tsx
│   │   ├── LiveCamerasPage.tsx
│   │   ├── ServicesPage.tsx
│   │   └── TransactionsPage.tsx
│   ├── lib/
│   │   ├── api.ts          # Backend API client
│   │   └── utils.ts        # Utility functions
│   ├── App.tsx             # Main app component
│   ├── store.ts            # Zustand state management
│   └── types.ts            # TypeScript types
│
├── package.json            # Root package.json
├── INTEGRATION_GUIDE.md    # Frontend-Backend integration guide
├── BACKEND_SUMMARY.md      # Backend overview
└── README.md              # This file
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Git

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd barberai

# Install all dependencies (frontend + backend)
npm run install:all

# Seed the database with sample data
npm run seed
```

### Running the Application

You need to run both frontend and backend:

**Option 1: Two Terminal Windows**

Terminal 1 - Backend:
```bash
npm run dev:backend
# Runs on http://localhost:3001
```

Terminal 2 - Frontend:
```bash
npm run dev
# Runs on http://localhost:5173
```

**Option 2: Using Start Scripts**

Linux/Mac:
```bash
chmod +x start.sh
./start.sh
```

Windows:
```bash
start.bat
```

### Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001
- **API Health Check**: http://localhost:3001/health

## 📋 Available Scripts

From the root directory:

```bash
# Frontend
npm run dev              # Start frontend dev server
npm run build            # Build frontend for production
npm run typecheck        # Run TypeScript type checking

# Backend
npm run dev:backend      # Start backend dev server (with auto-reload)
npm run start:backend    # Start backend in production mode
npm run seed             # Seed database with sample data

# Both
npm run install:all      # Install dependencies for frontend and backend
```

## 🎯 Features

### Frontend (React + TypeScript)
- ✅ Modern CRM-style dashboard with sidebar navigation
- ✅ Real-time camera feed simulation
- ✅ AI activity timeline
- ✅ Service management (CRUD)
- ✅ Transaction history with filtering
- ✅ Customer session tracking
- ✅ Payment processing UI (Telebirr, CBE Birr, Bank Transfer, Cash, Card)
- ✅ AI confidence scoring
- ✅ shadcn/ui components
- ✅ Tailwind CSS styling
- ✅ Zustand state management

### Backend (Node.js + Express)
- ✅ RESTful API with 25+ endpoints
- ✅ SQLite database (zero configuration)
- ✅ Services CRUD operations
- ✅ Session management (active → completed → paid)
- ✅ Transaction processing
- ✅ Camera & system status monitoring
- ✅ Activity logging
- ✅ AI simulation endpoints
- ✅ Automatic bill calculation
- ✅ CORS enabled for frontend
- ✅ Error handling & logging

## 📡 API Endpoints

### Services
```
GET    /api/services          # List all services
POST   /api/services          # Create service
PUT    /api/services/:id      # Update service
DELETE /api/services/:id      # Delete service
```

### Sessions
```
GET    /api/sessions                              # List sessions
POST   /api/sessions                              # Create session
POST   /api/sessions/:id/detected-services        # Add detected service
PATCH  /api/sessions/detected-services/:id        # Update service status
POST   /api/sessions/:id/complete                 # Complete session
```

### Transactions
```
GET    /api/transactions              # List transactions
POST   /api/transactions              # Process payment
GET    /api/transactions/stats        # Get statistics
```

### Cameras & System
```
GET    /api/cameras                   # List cameras
GET    /api/cameras/status            # System status
```

### Activity & AI
```
GET    /api/activity                  # Get activity log
POST   /api/ai/demo                   # Run AI demo simulation
POST   /api/ai/detect                 # Simulate AI detection
```

## 🔌 Frontend-Backend Integration

✅ **The frontend is fully connected to the backend!**

The frontend automatically fetches data from the backend API:
- Services, sessions, transactions, cameras, and activity log
- All CRUD operations are connected
- Real-time updates when data changes

### How It Works

1. **Frontend Store** (`src/store.ts`) uses API client to fetch data
2. **API Client** (`src/lib/api.ts`) makes HTTP requests to backend
3. **Backend** (`backend/`) processes requests and returns data
4. **Database** (`backend/data/barberai.json`) stores all data

### Quick Test

```bash
# Terminal 1 - Start backend
cd backend
npm install
npm run seed
npm run dev

# Terminal 2 - Start frontend
npm run dev

# Open browser
# http://localhost:5173
```

See `TESTING_GUIDE.md` for complete testing instructions.

## 🗄️ Database

- **Type**: SQLite (via better-sqlite3)
- **Location**: `backend/data/barberai.db`
- **Schema**: 8 tables with foreign keys and indexes
- **Auto-created**: Database is created on first run

### Sample Data (after seeding)
- 6 services (Haircut, Beard Trim, Hair Wash, etc.)
- 4 barbers (Dawit, Abel, Yonas, Samuel)
- 4 cameras (one per chair)
- 3 sample transactions
- 2 active sessions

### Reset Database
```bash
rm backend/data/barberai.db
npm run seed
```

## 🧪 Testing the API

```bash
# Health check
curl http://localhost:3001/health

# Get services
curl http://localhost:3001/api/services

# Create session
curl -X POST http://localhost:3001/api/sessions \
  -H "Content-Type: application/json" \
  -d '{
    "chairId": "2",
    "customerName": "Test Customer",
    "customerId": "9999",
    "barberId": "b2",
    "barberName": "Abel"
  }'

# Run AI demo
curl -X POST http://localhost:3001/api/ai/demo \
  -H "Content-Type: application/json" \
  -d '{"chairId": "3"}'
```

## 📚 Documentation

- **Backend API**: `backend/README.md` - Complete API documentation
- **Integration Guide**: `INTEGRATION_GUIDE.md` - How to connect frontend to backend
- **Backend Summary**: `BACKEND_SUMMARY.md` - Overview of backend features

## 🛠️ Tech Stack

### Frontend
- React 18 + TypeScript
- Vite (build tool)
- Tailwind CSS 4
- shadcn/ui components
- Zustand (state management)
- Lucide React (icons)
- Radix UI (primitives)

### Backend
- Node.js + Express
- SQLite (better-sqlite3)
- ES Modules
- UUID for ID generation
- CORS enabled

## 🔄 Development Workflow

1. **Start backend**: `npm run dev:backend`
2. **Start frontend**: `npm run dev` (in separate terminal)
3. **Make changes** to frontend or backend
4. **Frontend auto-reloads** on file changes
5. **Backend auto-reloads** on file changes (nodemon)
6. **Test API** with curl, Postman, or frontend

## 🚀 Deployment

### Frontend
```bash
npm run build
# Deploy dist/ folder to Vercel, Netlify, or any static host
```

### Backend
```bash
cd backend
npm start
# Deploy to Railway, Render, Heroku, or any Node.js host
```

### Environment Variables

**Backend** (create `backend/.env`):
```env
PORT=3001
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
```

**Frontend** (create `.env` in root):
```env
VITE_API_URL=http://localhost:3001/api
```

## 📝 Next Steps

- [ ] Connect frontend to backend API (replace mock data)
- [ ] Add real camera integration (RTSP/WebRTC)
- [ ] Integrate real AI models (YOLO, Gemini Vision, Ollama)
- [ ] Connect Ethiopian payment APIs (Telebirr, CBE Birr)
- [ ] Add authentication (JWT)
- [ ] Implement real-time updates (WebSocket/SSE)
- [ ] Add user management
- [ ] Deploy to production

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test both frontend and backend
5. Submit a pull request

## 📄 License

MIT

## 🆘 Troubleshooting

### Backend won't start
```bash
cd backend
rm -rf node_modules package-lock.json
npm install
```

### Frontend won't start
```bash
rm -rf node_modules package-lock.json
npm install
```

### Database errors
```bash
rm backend/data/barberai.db
npm run seed
```

### Port already in use
- Backend: Change `PORT` in `backend/.env`
- Frontend: Change port in `vite.config.js`

## 📞 Support

For issues or questions:
- Check backend logs in terminal
- Check browser console for frontend errors
- Review API responses in Network tab
- See `INTEGRATION_GUIDE.md` for detailed help

---

**Built with ❤️ for Ethiopian barber shops**
