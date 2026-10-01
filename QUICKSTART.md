# 🚀 Quick Start Guide

## ✅ Frontend is Connected to Backend!

The frontend now automatically fetches data from the backend API.

---

## 🎯 Quick Test (2 Minutes)

### Step 1: Start Backend

Open a terminal:

```bash
cd backend
npm install          # Install dependencies
npm run seed         # Seed database with sample data
npm run dev          # Start backend on port 3001
```

**Keep this terminal open!** You should see:
```
🚀 BarberAI Backend API is running
📡 Server: http://localhost:3001
```

---

### Step 2: Start Frontend

Open a **second terminal**:

```bash
npm run dev          # Start frontend on port 5173
```

You should see:
```
VITE v5.x.x  ready in xxx ms
➜  Local:   http://localhost:5173/
```

---

### Step 3: Open Browser

Go to: **http://localhost:5173**

✅ You should see the BarberAI dashboard with real data from the backend!

---

## 🧪 Test the Features

### 1. View Dashboard
- See active sessions from backend
- View revenue calculated from backend transactions

### 2. Start AI Demo
- Click **"Start AI Demo"** button
- Watch as backend creates a new customer session
- Services are detected and added via API

### 3. Process Payment
- Click on an active chair
- Click **"Confirm & Pay"**
- Select payment method
- Transaction is created in backend

### 4. View Transactions
- Navigate to **"Transactions"** page
- See all payments from backend

### 5. Manage Services
- Navigate to **"Services"** page
- Add/edit/delete services
- Changes are saved to backend

---

## 📊 Verify It's Working

### Check Backend Terminal
You should see API requests:
```
GET /api/services 200 5ms
GET /api/sessions 200 3ms
POST /api/transactions 201 8ms
```

### Check Database
Open: `backend/data/barberai.json`

You'll see all your data stored as JSON!

### Check Browser DevTools
- Open DevTools (F12)
- Go to Network tab
- Refresh the page
- You'll see all API calls to backend

---

## 🐛 Troubleshooting

### Frontend Shows No Data
- ✅ Make sure backend is running on port 3001
- ✅ Check browser console for errors (F12)
- ✅ Verify backend URL: `http://localhost:3001/api`

### Backend Won't Start
```bash
cd backend
rm -rf node_modules
npm install
npm run dev
```

### Database is Empty
```bash
cd backend
npm run seed
```
Then refresh the frontend.

---

## 📚 Documentation

- **TESTING_GUIDE.md** - Complete testing instructions
- **INTEGRATION_GUIDE.md** - How frontend connects to backend
- **backend/README.md** - Backend API documentation
- **GIT_GUIDE.md** - Git workflow guide

---

## 🎉 That's It!

You now have a fully functional full-stack application:
- ✅ Frontend connected to backend
- ✅ Real-time data synchronization
- ✅ All features working end-to-end
- ✅ Database storing all data

**Happy coding! 🚀**
