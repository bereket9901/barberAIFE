# 🔐 Complete Authentication Setup Guide

This guide will help you set up and use the authentication system in BarberAI.

## 📋 Prerequisites

- PostgreSQL database running
- Node.js 18+ installed
- npm installed

## 🚀 Quick Setup (5 Minutes)

### Step 1: Install Dependencies

```bash
cd backend
npm install
```

This installs:
- `bcryptjs` - Password hashing
- `jsonwebtoken` - JWT token management

### Step 2: Initialize Database

```bash
npm run db:init
```

This creates the `users` table in your PostgreSQL database.

### Step 3: Create Default Admin User

```bash
npm run seed:users
```

This creates:
- **Email**: `admin@barberai.com`
- **Password**: `admin123`
- **Role**: `admin`

### Step 4: Configure JWT Secret

Edit `backend/.env`:

```env
# JWT Configuration
JWT_SECRET=generate-a-strong-random-secret-here-at-least-64-characters-long
JWT_EXPIRES_IN=24h
```

**Generate a strong secret:**

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Copy the output and paste it as `JWT_SECRET` in your `.env` file.

### Step 5: Start the Application

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

### Step 6: Login

1. Open http://localhost:5173
2. You'll see the login page
3. Enter credentials:
   - Email: `admin@barberai.com`
   - Password: `admin123`
4. Click "Sign In"
5. You're in! 🎉

## ✅ Verify Authentication Works

### Test 1: Login via API

```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@barberai.com",
    "password": "admin123"
  }'
```

Expected response:
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "uuid-here",
      "email": "admin@barberai.com",
      "name": "Admin User",
      "role": "admin"
    }
  }
}
```

### Test 2: Access Protected Route

```bash
# Replace YOUR_TOKEN with the token from login response
curl http://localhost:3001/api/services \
  -H "Authorization: Bearer YOUR_TOKEN"
```

Should return services data.

### Test 3: Unauthorized Access

```bash
# Should return 401 Unauthorized
curl http://localhost:3001/api/services
```

### Test 4: Frontend Login

1. Open http://localhost:5173
2. Try accessing any page without logging in
3. You should be redirected to `/login`
4. Login with default credentials
5. You should be redirected to dashboard

## 🔧 Configuration Options

### JWT Expiration

Edit `backend/.env`:

```env
# Common options:
JWT_EXPIRES_IN=1h    # 1 hour
JWT_EXPIRES_IN=24h   # 24 hours (default)
JWT_EXPIRES_IN=7d    # 7 days
JWT_EXPIRES_IN=30d   # 30 days
```

### CORS Settings

Edit `backend/src/index.js`:

```javascript
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
```

## 👥 User Management

### Create New Admin User

**Via API:**

```bash
# Get your token first
TOKEN=$(curl -s -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@barberai.com","password":"admin123"}' \
  | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

# Create new admin
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "email": "newadmin@barberai.com",
    "password": "strong-password-here",
    "name": "New Admin Name",
    "role": "admin"
  }'
```

**List All Users:**

```bash
curl http://localhost:3001/api/auth \
  -H "Authorization: Bearer $TOKEN"
```

**Update User:**

```bash
curl -X PUT http://localhost:3001/api/auth/USER_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "Updated Name",
    "active": true
  }'
```

**Delete User:**

```bash
curl -X DELETE http://localhost:3001/api/auth/USER_ID \
  -H "Authorization: Bearer $TOKEN"
```

⚠️ **Note**: You cannot delete your own account

## 🔒 Security Best Practices

### 1. Change Default Password

After first login, create a new admin user with a strong password or update the default admin password.

### 2. Use Strong JWT Secret

- At least 64 characters
- Random and unpredictable
- Different for each environment
- Never commit to version control

### 3. Enable HTTPS in Production

All authentication should happen over HTTPS to prevent token interception.

### 4. Set Appropriate Token Expiration

- Development: `24h` or longer
- Production: `1h` to `24h` depending on security requirements

### 5. Monitor Failed Login Attempts

Check backend logs for suspicious activity.

### 6. Regular Security Audits

- Review user list regularly
- Remove inactive users
- Rotate JWT secret periodically
- Update dependencies

## 🐛 Troubleshooting

### Issue: "Invalid token" Error

**Solution:**
- Check JWT_SECRET matches in `.env`
- Verify token hasn't expired
- Ensure token format is correct: `Bearer <token>`

### Issue: Can't Login

**Solution:**
- Verify user exists: `SELECT * FROM users WHERE email = 'admin@barberai.com';`
- Check user is active: `active = true`
- Reset password if needed (see below)

### Issue: Token Not Persisting

**Solution:**
- Check localStorage is enabled in browser
- Clear browser cache and try again
- Check browser console for errors

### Issue: 401 on All Requests

**Solution:**
- Login again to get fresh token
- Check token is being sent in Authorization header
- Verify backend is running

### Reset Admin Password

```bash
# In backend directory
node -e "
const bcrypt = require('bcryptjs');
const database = require('./src/config/database.js').default;

(async () => {
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash('newpassword123', salt);
  await database.query('UPDATE users SET password_hash = \$1 WHERE email = \$2', [hash, 'admin@barberai.com']);
  console.log('Password updated successfully');
  process.exit(0);
})();
"
```

## 📊 Database Schema

### Users Table

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'admin',
  active BOOLEAN DEFAULT true,
  last_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Check Users

```sql
-- Connect to database
psql -U postgres -d barberai

-- List all users
SELECT id, email, name, role, active, last_login FROM users;

-- Check specific user
SELECT * FROM users WHERE email = 'admin@barberai.com';
```

## 🎯 API Endpoints Reference

### Public Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | Login user |
| POST | `/api/auth/register` | Register user (requires admin token) |

### Protected Endpoints (All Require Auth)

| Method | Endpoint | Description | Admin Only |
|--------|----------|-------------|------------|
| GET | `/api/auth/me` | Get current user | No |
| GET | `/api/auth` | List all users | Yes |
| PUT | `/api/auth/:id` | Update user | Yes |
| DELETE | `/api/auth/:id` | Delete user | Yes |
| GET | `/api/services` | Get services | No |
| POST | `/api/services` | Create service | No |
| GET | `/api/sessions` | Get sessions | No |
| POST | `/api/transactions` | Create transaction | No |
| ... | ... | All other routes | No |

## 📚 Documentation

- **`AUTHENTICATION.md`** - Complete authentication guide
- **`AUTH_QUICKSTART.md`** - Quick start guide
- **`AUTH_IMPLEMENTATION_SUMMARY.md`** - Implementation details
- **`AUTH_SETUP_GUIDE.md`** - This file

## 🚀 Next Steps

1. ✅ Set up authentication (you're here!)
2. ⚠️ Change default admin password
3. ⚠️ Set strong JWT_SECRET
4. ✅ Test all features work
5. ✅ Create additional admin users if needed
6. ⚠️ Review security best practices
7. ⚠️ Prepare for production deployment

## 🆘 Need Help?

### Common Commands

```bash
# Check if user exists
cd backend
node -e "
const database = require('./src/config/database.js').default;
database.query('SELECT email, name, role, active FROM users')
  .then(res => console.log(res.rows))
  .catch(err => console.error(err));
"

# Reset database (WARNING: deletes all data)
npm run db:init
npm run seed
npm run seed:users

# Check backend logs
# Look for authentication errors in the terminal

# Clear frontend storage
# Open browser console and run:
localStorage.clear()
```

### Support Resources

- Check `AUTHENTICATION.md` for detailed documentation
- Review backend logs for errors
- Check browser console for frontend errors
- Verify database connection
- Test API endpoints with curl

---

## ✅ Checklist

Before going to production:

- [ ] Changed default admin password
- [ ] Set strong JWT_SECRET (64+ characters)
- [ ] Configured JWT_EXPIRES_IN appropriately
- [ ] Enabled HTTPS
- [ ] Set FRONTEND_URL to production domain
- [ ] Reviewed CORS settings
- [ ] Tested all authentication flows
- [ ] Created backup admin user
- [ ] Documented admin credentials securely
- [ ] Set up monitoring for failed logins
- [ ] Reviewed security best practices

---

**🎉 Authentication is now fully set up and ready to use!**

**Default Credentials:**
- Email: `admin@barberai.com`
- Password: `admin123`

**⚠️ Remember to change these in production!**
