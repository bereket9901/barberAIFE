# 🔐 Authentication Quick Start

Get authentication running in 3 simple steps!

## Step 1: Initialize Database

```bash
cd backend
npm run db:init
```

This creates the `users` table in your PostgreSQL database.

## Step 2: Create Default Admin User

```bash
npm run seed:users
```

This creates an admin user with:
- **Email**: `admin@barberai.com`
- **Password**: `admin123`

## Step 3: Start the Application

```bash
# Terminal 1: Backend
npm run dev

# Terminal 2: Frontend (new terminal)
cd ..
npm run dev
```

## Step 4: Login

1. Open http://localhost:5173
2. You'll see the login page
3. Enter:
   - Email: `admin@barberai.com`
   - Password: `admin123`
4. Click "Sign In"
5. You're in! 🎉

## ⚠️ Important: Change Default Password

After logging in, you should:

1. Create a new admin user with a strong password
2. Or update the default admin password

### Create New Admin via API

```bash
# First, get your token
TOKEN=$(curl -s -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@barberai.com","password":"admin123"}' \
  | jq -r '.data.token')

# Create new admin
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "email": "your-email@example.com",
    "password": "your-strong-password",
    "name": "Your Name",
    "role": "admin"
  }'
```

## 🔧 Configure JWT Secret

Edit `backend/.env`:

```env
JWT_SECRET=generate-a-strong-random-secret-here
JWT_EXPIRES_IN=24h
```

Generate a strong secret:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

## ✅ Verify Authentication

### Test Login

```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@barberai.com","password":"admin123"}'
```

Should return:
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "...",
      "email": "admin@barberai.com",
      "name": "Admin User",
      "role": "admin"
    }
  }
}
```

### Test Protected Route

```bash
# Use token from login response
curl http://localhost:3001/api/services \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Test Unauthorized Access

```bash
# Should return 401
curl http://localhost:3001/api/services
```

## 🎯 What's Protected?

**All routes require authentication** except:
- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Register (requires admin token)

This includes:
- Dashboard data
- Services management
- Session management
- Transactions
- Camera feeds
- AI processing
- All other endpoints

## 🚀 Next Steps

1. ✅ Change default admin password
2. ✅ Set strong JWT_SECRET in `.env`
3. ✅ Create additional admin users if needed
4. ✅ Test all features work with authentication
5. ✅ Review AUTHENTICATION.md for advanced features

## 📖 Full Documentation

See [AUTHENTICATION.md](./AUTHENTICATION.md) for:
- Complete API reference
- User management
- Security best practices
- Production deployment checklist
- Troubleshooting guide

---

**That's it! Your BarberAI application is now secured with authentication!** 🔐
