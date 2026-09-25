# 🧪 Complete Testing Guide

## ✅ What's Been Connected

The frontend is now fully connected to the backend API:
- ✅ Services (CRUD operations)
- ✅ Sessions (create, update, complete)
- ✅ Transactions (payment processing)
- ✅ Cameras (status monitoring)
- ✅ Activity Log (real-time events)
- ✅ AI Demo (simulation)

---

## 🚀 Step-by-Step Testing

### 1️⃣ Start the Backend

Open a terminal:

```bash
cd backend
npm install          # Install dependencies (if not done)
npm run seed         # Seed database with sample data
npm run dev          # Start backend server
```

You should see:
```
🚀 BarberAI Backend API is running
📡 Server: http://localhost:3001
```

**Keep this terminal open!**

---

### 2️⃣ Test Backend API (Optional)

Open your browser and test these URLs:

- **Health Check**: http://localhost:3001/health
- **Services**: http://localhost:3001/api/services
- **Sessions**: http://localhost:3001/api/sessions
- **Transactions**: http://localhost:3001/api/transactions
- **Cameras**: http://localhost:3001/api/cameras
- **System Status**: http://localhost:3001/api/cameras/status

You should see JSON data!

---

### 3️⃣ Start the Frontend

Open a **second terminal**:

```bash
npm run dev          # Start frontend dev server
```

You should see:
```
VITE v5.x.x  ready in xxx ms
➜  Local:   http://localhost:5173/
```

---

### 4️⃣ Open the Application

Open your browser to: **http://localhost:5173**

The frontend will automatically:
- ✅ Fetch services from backend
- ✅ Fetch sessions from backend
- ✅ Fetch transactions from backend
- ✅ Fetch activity log from backend
- ✅ Fetch camera status from backend

---

## 🎯 Test the Features

### Test 1: View Dashboard
- You should see real data from the backend
- Active sessions should show customers in chairs
- Revenue should be calculated from backend transactions

### Test 2: Start AI Demo
1. Click the **"Start AI Demo"** button
2. Watch as a new customer session is created via the backend
3. Services are detected and added to the session
4. Activity log updates in real-time

### Test 3: View Billing
1. Click on any active chair/card
2. The billing dialog opens with real session data
3. You can confirm/reject detected services
4. Changes are saved to the backend

### Test 4: Process Payment
1. Click **"Confirm & Pay"** in the billing dialog
2. Select a payment method (Telebirr, CBE Birr, etc.)
3. The transaction is created in the backend
4. Session status changes to "paid"
5. Success dialog appears

### Test 5: View Transactions
1. Navigate to **"Transactions"** page
2. You should see the payment you just made
3. All data comes from the backend

### Test 6: Manage Services
1. Navigate to **"Services"** page
2. Add a new service
3. Edit an existing service
4. Delete a service
5. All changes are saved to the backend

---

## 🔍 Verify Backend is Working

### Check Database File

Open: `backend/data/barberai.json`

You should see all your data:
- Services
- Barbers
- Cameras
- Sessions
- Transactions
- Activity log

### Check Backend Logs

In the backend terminal, you should see API requests:
```
GET /api/services 200 5ms
GET /api/sessions 200 3ms
POST /api/transactions 201 8ms
```

---

## 🐛 Troubleshooting

### Frontend Shows No Data

**Problem**: Frontend is empty or shows errors

**Solution**:
1. Make sure backend is running on port 3001
2. Check browser console for errors (F12 → Console)
3. Check Network tab for failed API calls
4. Verify backend URL in `src/lib/api.ts` is `http://localhost:3001/api`

### Backend Won't Start

**Problem**: `npm run dev` fails

**Solution**:
```bash
cd backend
rm -rf node_modules
npm install
npm run dev
```

### Database is Empty

**Problem**: No data in the application

**Solution**:
```bash
cd backend
npm run seed
```

Then refresh the frontend.

### CORS Errors

**Problem**: Browser shows CORS errors

**Solution**: Backend is already configured with CORS. Make sure:
- Backend is running on port 3001
- Frontend is running on port 5173
- Check `backend/src/index.js` CORS configuration

---

## 📊 What Happens Behind the Scenes

### When You Open the App:
```
Frontend → GET /api/services → Backend → Returns services
Frontend → GET /api/sessions → Backend → Returns sessions
Frontend → GET /api/transactions → Backend → Returns transactions
Frontend → GET /api/activity → Backend → Returns activity log
Frontend → GET /api/cameras → Backend → Returns cameras
```

### When You Click "Start AI Demo":
```
Frontend → POST /api/ai/demo → Backend creates:
  - New session
  - Detected services
  - Activity log entries
Frontend → GET /api/sessions → Refreshes session list
Frontend → GET /api/activity → Refreshes activity log
```

### When You Process Payment:
```
Frontend → POST /api/transactions → Backend creates:
  - Transaction record
  - Transaction services
  - Updates session status to "paid"
  - Marks detected services as "charged"
Frontend → GET /api/transactions → Refreshes transaction list
Frontend → GET /api/sessions → Refreshes session list
```

---

## 🎉 Success Checklist

- [ ] Backend starts without errors
- [ ] Frontend starts without errors
- [ ] Dashboard shows data from backend
- [ ] AI Demo creates a new session
- [ ] Billing dialog shows session details
- [ ] Payment creates a transaction
- [ ] Transactions page shows the payment
- [ ] Services can be added/edited/deleted
- [ ] Activity log updates in real-time
- [ ] Database file contains all data

---

## 📝 API Endpoints Being Used

| Frontend Action | Backend Endpoint | Method |
|----------------|------------------|--------|
| Load services | `/api/services` | GET |
| Load sessions | `/api/sessions` | GET |
| Load transactions | `/api/transactions` | GET |
| Load activity | `/api/activity` | GET |
| Load cameras | `/api/cameras` | GET |
| Start demo | `/api/ai/demo` | POST |
| Create session | `/api/sessions` | POST |
| Add detected service | `/api/sessions/:id/detected-services` | POST |
| Update service status | `/api/sessions/detected-services/:id` | PATCH |
| Process payment | `/api/transactions` | POST |
| Add service | `/api/services` | POST |
| Update service | `/api/services/:id` | PUT |
| Delete service | `/api/services/:id` | DELETE |

---

## 🚀 Next Steps

Now that everything is connected:

1. **Test all features** - Make sure everything works
2. **Check the database** - Open `backend/data/barberai.json` to see your data
3. **Monitor API calls** - Use browser DevTools Network tab
4. **Read the logs** - Check backend terminal for request logs
5. **Deploy** - Ready for production deployment!

---

## 💡 Tips

- **Keep both terminals open** - Backend and frontend need to run simultaneously
- **Refresh the frontend** - After backend changes, refresh the browser
- **Check the database** - The JSON file shows exactly what's stored
- **Use browser DevTools** - Network tab shows all API calls
- **Read error messages** - Both frontend and backend log helpful errors

---

**Happy Testing! 🎊**
