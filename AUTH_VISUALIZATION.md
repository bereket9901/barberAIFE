# 🔐 Authentication System - Visual Guide

## 📊 System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND (React)                         │
│                                                                   │
│  ┌──────────────┐      ┌──────────────────────────────────┐    │
│  │  Login Page  │─────>│      AuthContext                 │    │
│  │              │      │  • Manages auth state            │    │
│  └──────────────┘      │  • Auto token refresh (10 min)   │    │
│                        │  • Protected routes              │    │
│                        │  • Logout functionality          │    │
│                        └──────────────────────────────────┘    │
│                                    │                             │
│                        ┌───────────┴───────────┐                │
│                        │                       │                │
│                ┌───────▼────────┐    ┌─────────▼─────────┐     │
│                │ Access Token   │    │ Refresh Token     │     │
│                │ (localStorage) │    │ (HttpOnly Cookie) │     │
│                │ 15 min expiry  │    │ 7 day expiry      │     │
│                └────────────────┘    └───────────────────┘     │
└─────────────────────────────────────────────────────────────────┘
                           │                    │
                           │                    │
                           ▼                    ▼
┌─────────────────────────────────────────────────────────────────┐
│                       BACKEND (Express)                          │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              Security Middleware Stack                    │  │
│  │                                                           │  │
│  │  1. Helmet (Security Headers)                            │  │
│  │     • Content-Security-Policy                            │  │
│  │     • X-Frame-Options                                    │  │
│  │     • Strict-Transport-Security                          │  │
│  │                                                           │  │
│  │  2. CORS (Cross-Origin Protection)                       │  │
│  │     • Allow only frontend domain                         │  │
│  │     • Allow credentials (cookies)                        │  │
│  │                                                           │  │
│  │  3. Cookie Parser                                        │  │
│  │     • Parse HttpOnly cookies                             │  │
│  │                                                           │  │
│  │  4. Rate Limiter                                         │  │
│  │     • Login: 5 attempts per 15 min                       │  │
│  │     • Register: 3 attempts per hour                      │  │
│  └──────────────────────────────────────────────────────────┘  │
│                              │                                   │
│                              ▼                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                 Auth Controller                           │  │
│  │                                                           │  │
│  │  POST /auth/login                                         │  │
│  │  ├─ Check rate limit                                      │  │
│  │  ├─ Check account lock                                    │  │
│  │  ├─ Verify password (bcrypt)                              │  │
│  │  ├─ Generate access token (15 min)                        │  │
│  │  ├─ Generate refresh token (7 days)                       │  │
│  │  ├─ Store refresh token in DB                             │  │
│  │  └─ Return tokens                                         │  │
│  │                                                           │  │
│  │  POST /auth/refresh                                       │  │
│  │  ├─ Validate refresh token from cookie                    │  │
│  │  ├─ Revoke old refresh token                              │  │
│  │  ├─ Generate new access token                             │  │
│  │  ├─ Generate new refresh token                            │  │
│  │  └─ Return new tokens                                     │  │
│  │                                                           │  │
│  │  POST /auth/logout                                        │  │
│  │  ├─ Revoke refresh token                                  │  │
│  │  └─ Clear cookie                                          │  │
│  │                                                           │  │
│  │  POST /auth/logout-all                                    │  │
│  │  ├─ Revoke ALL refresh tokens for user                    │  │
│  │  └─ Clear cookie                                          │  │
│  └──────────────────────────────────────────────────────────┘  │
│                              │                                   │
│                              ▼                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              PostgreSQL Database                          │  │
│  │                                                           │  │
│  │  ┌─────────────────┐      ┌──────────────────┐          │  │
│  │  │   users table   │      │ refresh_tokens   │          │  │
│  │  │                 │      │     table        │          │  │
│  │  │ • id            │      │                  │          │  │
│  │  │ • email         │      │ • id             │          │  │
│  │  │ • password_hash │      │ • user_id        │          │  │
│  │  │ • name          │      │ • token          │          │  │
│  │  │ • role          │      │ • expires_at     │          │  │
│  │  │ • active        │      │ • revoked        │          │  │
│  │  │ • failed_attempts│     │                  │          │  │
│  │  │ • locked_until  │      │                  │          │  │
│  │  └─────────────────┘      └──────────────────┘          │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Login Flow Diagram

```
User enters credentials
         │
         ▼
┌─────────────────────────┐
│   Rate Limit Check      │
│   (5 attempts / 15 min) │
└─────────────────────────┘
         │
         ├─❌ Exceeded ──> Return 429 (Too Many Requests)
         │
         └─✅ OK ──> Continue
                      │
                      ▼
         ┌─────────────────────────┐
         │  Check Account Lock     │
         │  (locked_until > now?)  │
         └─────────────────────────┘
                      │
                      ├─❌ Locked ──> Return 423 (Account Locked)
                      │               "Try again in X minutes"
                      │
                      └─✅ Not Locked ──> Continue
                                           │
                                           ▼
                      ┌─────────────────────────┐
                      │  Find User by Email     │
                      └─────────────────────────┘
                                           │
                                           ├─❌ Not Found ──> Return 401
                                           │
                                           └─✅ Found ──> Continue
                                                            │
                                                            ▼
                      ┌─────────────────────────┐
                      │  Verify Password        │
                      │  (bcrypt compare)       │
                      └─────────────────────────┘
                                           │
                      ┌────────────────────┴────────────────────┐
                      │                                         │
                 ❌ Invalid                               ✅ Valid
                      │                                         │
                      ▼                                         ▼
         ┌────────────────────────┐          ┌────────────────────────┐
         │ Increment failed_count │          │ Reset failed_count     │
         │                        │          │ Set locked_until=NULL  │
         │ If count >= 5:         │          │ Set last_login=NOW     │
         │   Lock for 15 min      │          └────────────────────────┘
         └────────────────────────┘                      │
                      │                                  │
                      └──────────────┬───────────────────┘
                                     │
                                     ▼
                      ┌─────────────────────────┐
                      │  Generate Access Token  │
                      │  (15 min expiration)    │
                      │                         │
                      │  Payload:               │
                      │  {                      │
                      │    userId: "uuid",      │
                      │    email: "...",        │
                      │    role: "admin",       │
                      │    exp: timestamp       │
                      │  }                      │
                      └─────────────────────────┘
                                     │
                                     ▼
                      ┌─────────────────────────┐
                      │ Generate Refresh Token  │
                      │ (7 day expiration)      │
                      │                         │
                      │ crypto.randomBytes(40)  │
                      │ .toString('hex')        │
                      └─────────────────────────┘
                                     │
                                     ▼
                      ┌─────────────────────────┐
                      │ Store Refresh Token     │
                      │ in Database             │
                      │                         │
                      │ INSERT INTO             │
                      │ refresh_tokens          │
                      │ (user_id, token,        │
                      │  expires_at)            │
                      └─────────────────────────┘
                                     │
                                     ▼
                      ┌─────────────────────────┐
                      │  Send Response          │
                      │                         │
                      │  Body:                  │
                      │  {                      │
                      │    accessToken: "jwt",  │
                      │    user: {...},         │
                      │    expiresIn: 900       │
                      │  }                      │
                      │                         │
                      │  Cookie:                │
                      │  Set-Cookie:            │
                      │  refreshToken=xxx;      │
                      │  HttpOnly;              │
                      │  Secure;                │
                      │  SameSite=Strict;       │
                      │  Max-Age=604800         │
                      └─────────────────────────┘
                                     │
                                     ▼
                      ┌─────────────────────────┐
                      │  Frontend Receives      │
                      │                         │
                      │  1. Store access token  │
                      │     in localStorage     │
                      │                         │
                      │  2. Browser auto-stores │
                      │     refresh token in    │
                      │     HttpOnly cookie     │
                      │                         │
                      │  3. Redirect to         │
                      │     dashboard           │
                      └─────────────────────────┘
```

---

## 🔄 API Request Flow

```
Frontend wants to call API
         │
         ▼
┌─────────────────────────┐
│ Get Access Token from   │
│ localStorage            │
└─────────────────────────┘
         │
         ▼
┌─────────────────────────┐
│ Attach to Request       │
│                         │
│ Headers:                │
│ {                       │
│   Authorization:        │
│   "Bearer <token>",     │
│   Content-Type:         │
│   "application/json"    │
│ }                       │
│                         │
│ Credentials: 'include'  │
│ (sends refresh cookie)  │
└─────────────────────────┘
         │
         ▼
┌─────────────────────────┐
│ Backend Auth Middleware │
│                         │
│ 1. Extract token from   │
│    Authorization header │
│                         │
│ 2. Verify JWT signature │
│    (using JWT_SECRET)   │
│                         │
│ 3. Check expiration     │
│    (exp > now?)         │
│                         │
│ 4. Decode payload       │
│    (userId, role, etc)  │
└─────────────────────────┘
         │
    ┌────┴────┐
    │         │
❌ Invalid  ✅ Valid
    │         │
    ▼         ▼
┌────────┐  ┌─────────────────┐
│Return  │  │ Attach user to  │
│ 401    │  │ request object  │
│Unauthorized│                 │
└────────┘  └─────────────────┘
    │              │
    │              ▼
    │     ┌─────────────────┐
    │     │ Process Request │
    │     │ (Controller)    │
    │     └─────────────────┘
    │              │
    │              ▼
    │     ┌─────────────────┐
    │     │ Return Response │
    │     └─────────────────┘
    │
    ▼
┌─────────────────────────┐
│ Frontend receives 401   │
└─────────────────────────┘
         │
         ▼
┌─────────────────────────┐
│ Auto-refresh triggered  │
│                         │
│ POST /api/auth/refresh  │
│ (refresh token in cookie│
│  sent automatically)    │
└─────────────────────────┘
         │
         ▼
    (See Token Refresh Flow below)
```

---

## 🔄 Token Refresh Flow

```
Access token expires (after 15 min)
         │
         ▼
┌─────────────────────────┐
│ Frontend makes request  │
│ with expired token      │
└─────────────────────────┘
         │
         ▼
┌─────────────────────────┐
│ Backend returns 401     │
│ "Token expired"         │
└─────────────────────────┘
         │
         ▼
┌─────────────────────────┐
│ Frontend catches 401    │
│ Calls refresh endpoint  │
│                         │
│ POST /api/auth/refresh  │
│                         │
│ Cookie automatically    │
│ includes refresh token  │
└─────────────────────────┘
         │
         ▼
┌─────────────────────────┐
│ Backend validates       │
│ refresh token           │
│                         │
│ 1. Extract from cookie  │
│ 2. Find in database     │
│ 3. Check not revoked    │
│ 4. Check not expired    │
│ 5. Check user active    │
└─────────────────────────┘
         │
    ┌────┴────┐
    │         │
❌ Invalid  ✅ Valid
    │         │
    ▼         ▼
┌────────┐  ┌─────────────────────────┐
│Return  │  │ Revoke old refresh token│
│ 401    │  │                         │
│        │  │ UPDATE refresh_tokens   │
│Frontend│  │ SET revoked=true        │
│clears  │  │ WHERE token=<old>       │
│storage │  └─────────────────────────┘
│& logs  │              │
│out     │              ▼
└────────┘  ┌─────────────────────────┐
            │ Generate new access     │
            │ token (15 min)          │
            └─────────────────────────┘
                         │
                         ▼
            ┌─────────────────────────┐
            │ Generate new refresh    │
            │ token (7 days)          │
            │                         │
            │ crypto.randomBytes(40)  │
            └─────────────────────────┘
                         │
                         ▼
            ┌─────────────────────────┐
            │ Store new refresh token │
            │ in database             │
            └─────────────────────────┘
                         │
                         ▼
            ┌─────────────────────────┐
            │ Send response           │
            │                         │
            │ Body:                   │
            │ {                       │
            │   accessToken: "new",   │
            │   expiresIn: 900        │
            │ }                       │
            │                         │
            │ Cookie:                 │
            │ Set-Cookie:             │
            │ refreshToken=<new>;     │
            │ HttpOnly; Secure;       │
            │ SameSite=Strict         │
            └─────────────────────────┘
                         │
                         ▼
            ┌─────────────────────────┐
            │ Frontend receives       │
            │ new tokens              │
            │                         │
            │ 1. Update localStorage  │
            │    with new access token│
            │                         │
            │ 2. Browser updates      │
            │    cookie automatically │
            │                         │
            │ 3. Retry original       │
            │    request with new     │
            │    access token         │
            └─────────────────────────┘
                         │
                         ▼
            ┌─────────────────────────┐
            │ Request succeeds!       │
            │ User never noticed      │
            │ the refresh happened    │
            └─────────────────────────┘
```

---

## 🔐 Token Rotation Visualization

```
Day 1, 10:00 AM - User logs in
┌─────────────────────────────────────────┐
│ Access Token A  (expires 10:15 AM)      │
│ Refresh Token A (expires Day 8)         │
│                                         │
│ Database:                               │
│ refresh_tokens:                         │
│  - Token A: active ✓                    │
└─────────────────────────────────────────┘

Day 1, 10:15 AM - Access Token A expires
┌─────────────────────────────────────────┐
│ Frontend calls /auth/refresh            │
│                                         │
│ Backend:                                │
│ 1. Validates Refresh Token A            │
│ 2. Revokes Token A                      │
│ 3. Issues Token B (access)              │
│ 4. Issues Token C (refresh)             │
│                                         │
│ Database:                               │
│ refresh_tokens:                         │
│  - Token A: revoked ✗                   │
│  - Token C: active ✓                    │
└─────────────────────────────────────────┘

Day 1, 10:30 AM - Access Token B expires
┌─────────────────────────────────────────┐
│ Frontend calls /auth/refresh            │
│                                         │
│ Backend:                                │
│ 1. Validates Refresh Token C            │
│ 2. Revokes Token C                      │
│ 3. Issues Token D (access)              │
│ 4. Issues Token E (refresh)             │
│                                         │
│ Database:                               │
│ refresh_tokens:                         │
│  - Token A: revoked ✗                   │
│  - Token C: revoked ✗                   │
│  - Token E: active ✓                    │
└─────────────────────────────────────────┘

... continues every 15 minutes ...

Day 7, 10:00 AM - Refresh Token expires
┌─────────────────────────────────────────┐
│ User must login again                   │
│ (Refresh token expired after 7 days)    │
└─────────────────────────────────────────┘
```

**Security Benefit:**
If an attacker steals Refresh Token A at 10:05 AM, it's already revoked by 10:15 AM and completely useless!

---

## 🛡️ Attack Protection Matrix

```
┌─────────────────────┬──────────────────────────────────────┐
│   Attack Type       │   Protection Mechanism               │
├─────────────────────┼──────────────────────────────────────┤
│ Brute Force         │ • Rate limiting (5 attempts/15 min)  │
│                     │ • Account lockout (15 min)           │
│                     │ • Strong password requirements       │
├─────────────────────┼──────────────────────────────────────┤
│ XSS                 │ • HttpOnly cookies                   │
│ (Cross-Site         │ • Helmet security headers            │
│  Scripting)         │ • Content Security Policy            │
├─────────────────────┼──────────────────────────────────────┤
│ CSRF                │ • CORS configuration                 │
│ (Cross-Site         │ • SameSite=strict cookies            │
│  Request Forgery)   │ • Access token required              │
├─────────────────────┼──────────────────────────────────────┤
│ Token Theft         │ • Short-lived access tokens (15 min) │
│                     │ • Refresh token rotation             │
│                     │ • HttpOnly cookies                   │
├─────────────────────┼──────────────────────────────────────┤
│ Database            │ • Bcrypt password hashing            │
│ Compromise          │ • Token revocation                   │
│                     │ • Short-lived tokens                 │
├─────────────────────┼──────────────────────────────────────┤
│ Man-in-the-Middle   │ • HTTPS required in production       │
│                     │ • Secure cookie flag                 │
│                     │ • HSTS header                        │
├─────────────────────┼──────────────────────────────────────┤
│ Replay Attack       │ • Token expiration                   │
│                     │ • Token rotation                     │
│                     │ • One-time refresh tokens            │
├─────────────────────┼──────────────────────────────────────┤
│ Session Hijacking   │ • Short-lived tokens                 │
│                     │ • Automatic refresh                  │
│                     │ • Logout from all devices            │
└─────────────────────┴──────────────────────────────────────┘
```

---

## 📊 Password Security Flow

```
User creates password
         │
         ▼
┌─────────────────────────┐
│ Password Validation     │
│                         │
│ ✓ Length >= 8           │
│ ✓ Has uppercase         │
│ ✓ Has lowercase         │
│ ✓ Has number            │
│ ✓ Has special char      │
└─────────────────────────┘
         │
    ┌────┴────┐
    │         │
❌ Invalid  ✅ Valid
    │         │
    ▼         ▼
┌────────┐  ┌─────────────────────────┐
│Return  │  │ Generate Salt           │
│ 400    │  │ (12 rounds of bcrypt)   │
│with    │  │                         │
│errors  │  │ bcrypt.genSalt(12)      │
└────────│  │ = 4,096 iterations      │
         └─────────────────────────┘
                         │
                         ▼
         ┌─────────────────────────┐
         │ Hash Password           │
         │                         │
         │ bcrypt.hash(password,   │
         │              salt)      │
         │                         │
         │ Result:                 │
         │ $2b$12$...              │
         │ (60 characters)         │
         └─────────────────────────┘
                         │
                         ▼
         ┌─────────────────────────┐
         │ Store in Database       │
         │                         │
         │ INSERT INTO users       │
         │ (password_hash)         │
         │ VALUES ('$2b$12$...')   │
         └─────────────────────────┘
```

**Why bcrypt is secure:**
- Computationally expensive (slow by design)
- Each password has unique salt
- Resistant to rainbow table attacks
- Resistant to brute force attacks
- Industry standard for password hashing

---

## 🎯 User Journey

### New User First Login

```
1. Opens http://localhost:5173
   │
   ▼
2. Redirected to /login
   │
   ▼
3. Enters email + password
   │
   ▼
4. Clicks "Sign In"
   │
   ▼
5. Backend validates credentials
   │
   ▼
6. Receives access token + refresh token
   │
   ▼
7. Access token stored in localStorage
   Refresh token stored in HttpOnly cookie
   │
   ▼
8. Redirected to dashboard
   │
   ▼
9. Can now access all features!
```

### Returning User

```
1. Opens http://localhost:5173
   │
   ▼
2. Frontend checks localStorage
   │
   ├─ Has valid access token?
   │  │
   │  └─✅ Yes ──> User is logged in
   │              Redirect to dashboard
   │
   └─❌ No (expired or missing)
      │
      ▼
3. Try to refresh token
   │
   ├─ Refresh token valid?
   │  │
   │  └─✅ Yes ──> Get new access token
   │              User is logged in
   │              Redirect to dashboard
   │
   └─❌ No (expired or revoked)
      │
      ▼
4. Redirect to /login
   │
   ▼
5. User must login again
```

### Token Refresh (Seamless)

```
User is working on dashboard
         │
         ▼
15 minutes pass
(Access token expires)
         │
         ▼
User clicks a button
(Makes API request)
         │
         ▼
Backend returns 401
(Token expired)
         │
         ▼
Frontend catches 401
         │
         ▼
Frontend calls /auth/refresh
(Refresh token in cookie)
         │
         ▼
Backend validates refresh token
         │
         ▼
Backend issues new tokens
         │
         ▼
Frontend updates localStorage
         │
         ▼
Frontend retries original request
         │
         ▼
Request succeeds!
         │
         ▼
User sees result
(Never knew token was refreshed!)
```

---

## 🔍 Security Layers

```
┌─────────────────────────────────────────┐
│         Layer 1: Network Security       │
│                                         │
│  • HTTPS (TLS/SSL)                      │
│  • CORS configuration                   │
│  • Security headers (Helmet)            │
└─────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────┐
│      Layer 2: Rate Limiting             │
│                                         │
│  • Login: 5 attempts / 15 min           │
│  • Register: 3 attempts / hour          │
│  • IP-based tracking                    │
└─────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────┐
│    Layer 3: Account Security            │
│                                         │
│  • Account lockout (5 failures)         │
│  • 15-minute lockout duration           │
│  • Failed attempt tracking              │
└─────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────┐
│    Layer 4: Password Security           │
│                                         │
│  • Strong password requirements         │
│  • Bcrypt hashing (12 rounds)           │
│  • Unique salt per password             │
└─────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────┐
│    Layer 5: Token Security              │
│                                         │
│  • Short-lived access tokens (15 min)   │
│  • Refresh token rotation               │
│  • HttpOnly cookies                     │
│  • Secure cookie flag                   │
│  • SameSite attribute                   │
└─────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────┐
│    Layer 6: Session Management          │
│                                         │
│  • Token revocation                     │
│  • Logout from all devices              │
│  • Database token tracking              │
│  • Automatic cleanup                    │
└─────────────────────────────────────────┘
```

---

## 📈 Performance Impact

```
┌─────────────────────┬──────────────┬─────────────────────┐
│ Operation           │ Time         │ Notes               │
├─────────────────────┼──────────────┼─────────────────────┤
│ Password hashing    │ ~100ms       │ bcrypt (12 rounds)  │
│ (registration)      │              │ One-time cost       │
├─────────────────────┼──────────────┼─────────────────────┤
│ Password verify     │ ~100ms       │ bcrypt compare      │
│ (login)             │              │ One-time cost       │
├─────────────────────┼──────────────┼─────────────────────┤
│ JWT sign            │ <1ms         │ Very fast           │
│ (token creation)    │              │                     │
├─────────────────────┼──────────────┼─────────────────────┤
│ JWT verify          │ <1ms         │ Very fast           │
│ (token validation)  │              │                     │
├─────────────────────┼──────────────┼─────────────────────┤
│ Token refresh       │ ~50ms        │ Database query +    │
│                     │              │ JWT operations      │
├─────────────────────┼──────────────┼─────────────────────┤
│ Rate limit check    │ <1ms         │ In-memory tracking  │
├─────────────────────┼──────────────┼─────────────────────┤
│ Total login time    │ ~200ms       │ Acceptable for      │
│                     │              │ user experience     │
└─────────────────────┴──────────────┴─────────────────────┘
```

**Conclusion:** Security features add minimal overhead (~200ms) while providing enterprise-grade protection.

---

## 🎓 Key Takeaways

1. **Defense in Depth** - Multiple security layers protect against different attacks
2. **Token Rotation** - Limits damage from token theft
3. **HttpOnly Cookies** - Protects against XSS attacks
4. **Rate Limiting** - Prevents brute force attacks
5. **Account Lockout** - Additional brute force protection
6. **Strong Passwords** - Makes brute force impractical
7. **Short-lived Tokens** - Limits window of opportunity
8. **Automatic Refresh** - Seamless user experience
9. **Session Management** - Full control over active sessions
10. **Production Ready** - Follows industry best practices

---

**Your authentication system is now enterprise-grade!** 🔐

For detailed implementation details, see `AUTHENTICATION_EXPLAINED.md`
