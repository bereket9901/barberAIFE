# 🔐 Authentication System

BarberAI now includes a complete authentication system with admin-only access control.

## 🎯 Overview

- **JWT-based authentication** with secure token management
- **Admin-only access** - All routes require authentication
- **Role-based access control** - Admin role required for all operations
- **Secure password hashing** using bcrypt
- **Token expiration** - Configurable JWT expiration time
- **Protected routes** - Frontend routes require authentication
- **User management** - Admin can manage other users

## 🚀 Quick Start

### 1. Initialize Database Schema

If you haven't already, initialize the database with the users table:

```bash
cd backend
npm run db:init
```

### 2. Seed Default Admin User

Create the default admin user:

```bash
npm run seed:users
```

This creates an admin user with:
- **Email**: `admin@barberai.com`
- **Password**: `admin123`

⚠️ **Important**: Change the default password in production!

### 3. Configure JWT Secret

Edit `backend/.env` and set a strong JWT secret:

```env
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=24h
```

⚠️ **Important**: Use a strong, random secret in production!

### 4. Start the Application

```bash
# Terminal 1: Backend
cd backend
npm run dev

# Terminal 2: Frontend
npm run dev
```

### 5. Login

1. Open http://localhost:5173
2. You'll be redirected to the login page
3. Enter credentials:
   - Email: `admin@barberai.com`
   - Password: `admin123`
4. Click "Sign In"
5. You'll be redirected to the dashboard

## 📡 API Endpoints

### Authentication Endpoints

#### Register New User (Admin Only)
```http
POST /api/auth/register
Content-Type: application/json
Authorization: Bearer <token>

{
  "email": "newuser@barberai.com",
  "password": "securepassword",
  "name": "New User",
  "role": "admin"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@barberai.com",
  "password": "admin123"
}
```

Response:
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "uuid",
      "email": "admin@barberai.com",
      "name": "Admin User",
      "role": "admin"
    }
  }
}
```

#### Get Current User
```http
GET /api/auth/me
Authorization: Bearer <token>
```

#### Get All Users (Admin Only)
```http
GET /api/auth
Authorization: Bearer <token>
```

#### Update User (Admin Only)
```http
PUT /api/auth/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Updated Name",
  "email": "updated@email.com",
  "role": "admin",
  "active": true
}
```

#### Delete User (Admin Only)
```http
DELETE /api/auth/:id
Authorization: Bearer <token>
```

## 🔒 Protected Routes

All API routes now require authentication except:
- `POST /api/auth/login`
- `POST /api/auth/register` (requires admin token)

### Example Protected Request

```javascript
// Frontend
const token = localStorage.getItem('authToken');

const response = await fetch('http://localhost:3001/api/services', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});
```

## 🎨 Frontend Implementation

### Auth Context

The `AuthContext` manages authentication state:

```typescript
import { useAuth } from './contexts/AuthContext';

function MyComponent() {
  const { user, token, login, logout, isAuthenticated } = useAuth();
  
  // Use auth state
}
```

### Protected Routes

Wrap protected routes with `ProtectedRoute`:

```typescript
import ProtectedRoute from './components/ProtectedRoute';

<Route
  path="/dashboard"
  element={
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  }
/>
```

### Login Page

Users are automatically redirected to `/login` if not authenticated.

### Logout

```typescript
const { logout } = useAuth();

const handleLogout = () => {
  logout();
  navigate('/login');
};
```

## 🗄️ Database Schema

### Users Table

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'admin' CHECK (role IN ('admin', 'user')),
  active BOOLEAN DEFAULT true,
  last_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 🔐 Security Features

### Password Hashing
- Uses bcrypt with salt rounds = 10
- Passwords are never stored in plain text
- Each password has a unique salt

### JWT Tokens
- Signed with secret key (configure in .env)
- Configurable expiration time
- Contains user ID, email, and role
- Sent in Authorization header as Bearer token

### Token Storage
- Stored in localStorage on frontend
- Automatically included in API requests
- Cleared on logout or token expiration

### Route Protection
- Backend middleware validates JWT on every request
- Frontend ProtectedRoute component redirects unauthenticated users
- 401 responses clear token and redirect to login

## 👥 User Management

### Create New Admin User

```bash
# Via API
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <admin-token>" \
  -d '{
    "email": "newadmin@barberai.com",
    "password": "securepassword",
    "name": "New Admin",
    "role": "admin"
  }'
```

### List All Users

```bash
curl http://localhost:3001/api/auth \
  -H "Authorization: Bearer <admin-token>"
```

### Update User

```bash
curl -X PUT http://localhost:3001/api/auth/<user-id> \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <admin-token>" \
  -d '{
    "name": "Updated Name",
    "active": false
  }'
```

### Delete User

```bash
curl -X DELETE http://localhost:3001/api/auth/<user-id> \
  -H "Authorization: Bearer <admin-token>"
```

⚠️ **Note**: You cannot delete your own account

## 🔧 Configuration

### Environment Variables

Add to `backend/.env`:

```env
# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=24h
```

### JWT Secret Generation

Generate a strong secret:

```bash
# Using Node.js
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Using OpenSSL
openssl rand -base64 64
```

### Token Expiration

Configure token lifetime:
- `1h` - 1 hour
- `24h` - 24 hours (default)
- `7d` - 7 days
- `30d` - 30 days

## 🧪 Testing Authentication

### Test Login

```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@barberai.com",
    "password": "admin123"
  }'
```

### Test Protected Route

```bash
# Get token from login response
TOKEN="your-jwt-token"

# Access protected route
curl http://localhost:3001/api/services \
  -H "Authorization: Bearer $TOKEN"
```

### Test Unauthorized Access

```bash
# Should return 401
curl http://localhost:3001/api/services
```

## 🚨 Production Checklist

Before deploying to production:

- [ ] Change default admin password
- [ ] Set strong JWT_SECRET (at least 64 characters)
- [ ] Configure appropriate JWT_EXPIRES_IN
- [ ] Enable HTTPS
- [ ] Set FRONTEND_URL to production domain
- [ ] Review CORS settings
- [ ] Enable rate limiting
- [ ] Set up monitoring for failed login attempts
- [ ] Consider implementing 2FA
- [ ] Review password policy requirements

## 🐛 Troubleshooting

### "Invalid token" Error
- Token may be expired
- Check JWT_SECRET matches between requests
- Verify token format (Bearer <token>)

### "Access denied" Error
- User may not have admin role
- Check user is active in database
- Verify token contains correct role

### Can't Login
- Check email and password are correct
- Verify user exists in database
- Check user is active (active = true)
- Review backend logs for errors

### Token Not Persisting
- Check localStorage is enabled
- Verify AuthContext is wrapping the app
- Check browser console for errors

## 📚 Additional Resources

- [JWT.io](https://jwt.io/) - JWT debugger
- [bcrypt Documentation](https://github.com/kelektiv/node.bcrypt.js)
- [Express Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)

## 🔮 Future Enhancements

Potential improvements:
- [ ] Refresh token mechanism
- [ ] Two-factor authentication (2FA)
- [ ] Password reset via email
- [ ] Session management
- [ ] Rate limiting on login attempts
- [ ] Audit logging for admin actions
- [ ] Multi-tenant support
- [ ] OAuth integration (Google, GitHub)
- [ ] API key authentication for service-to-service

---

**Authentication system is now active! All routes are protected and require admin authentication.** 🔐
