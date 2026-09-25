# 🐘 PostgreSQL Setup Guide

## ✅ Backend Now Uses PostgreSQL!

The backend has been migrated from JSON file storage to **PostgreSQL** for better performance, scalability, and production readiness.

---

## 📋 Prerequisites

### Install PostgreSQL

**Windows:**
1. Download from: https://www.postgresql.org/download/windows/
2. Run the installer
3. During installation:
   - Set a password for the `postgres` user (remember it!)
   - Keep the default port: `5432`
   - Keep the default locale

**Mac (Homebrew):**
```bash
brew install postgresql@15
brew services start postgresql@15
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

---

## 🗄️ Step 1: Create the Database

### Option A: Using pgAdmin (GUI)

1. Open pgAdmin (installed with PostgreSQL)
2. Connect to your PostgreSQL server
3. Right-click on "Databases" → "Create" → "Database"
4. Database name: `barberai`
5. Click "Save"

### Option B: Using Command Line

**Windows (PowerShell or CMD):**
```bash
# Open psql
"C:\Program Files\PostgreSQL\15\bin\psql.exe" -U postgres

# In psql prompt:
CREATE DATABASE barberai;
\q
```

**Mac/Linux:**
```bash
# Open psql
psql -U postgres

# In psql prompt:
CREATE DATABASE barberai;
\q
```

---

## 🔧 Step 2: Configure Environment

Create a `.env` file in the `backend` folder:

```bash
cd backend
cp .env.example .env
```

Edit `.env` and update with your PostgreSQL credentials:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=barberai
DB_USER=postgres
DB_PASSWORD=your_postgres_password_here
```

**Important:** Replace `your_postgres_password_here` with the password you set during PostgreSQL installation.

---

## 🚀 Step 3: Initialize Database Schema

```bash
cd backend
npm run db:init
```

This will create all the tables:
- ✅ services
- ✅ barbers
- ✅ cameras
- ✅ sessions
- ✅ detected_services
- ✅ transactions
- ✅ transaction_services
- ✅ activity_log

---

## 🌱 Step 4: Seed the Database

```bash
npm run seed
```

This will populate the database with:
- 6 services (Haircut, Beard Trim, etc.)
- 4 barbers (Dawit, Abel, Yonas, Samuel)
- 4 cameras (one per chair)
- 3 sample transactions
- 2 active sessions

---

## 🏃 Step 5: Start the Server

```bash
npm run dev
```

You should see:
```
✅ Connected to PostgreSQL database
🚀 BarberAI Backend API is running
🗄️  Database: PostgreSQL
```

---

## 🧪 Verify PostgreSQL is Working

### Test Connection

Open your browser: http://localhost:3001/health

You should see:
```json
{
  "status": "ok",
  "timestamp": "2026-01-15T...",
  "service": "BarberAI Backend API",
  "database": "connected"
}
```

### Test API Endpoints

```bash
# Get services
curl http://localhost:3001/api/services

# Get sessions
curl http://localhost:3001/api/sessions

# Get transactions
curl http://localhost:3001/api/transactions
```

---

## 🔍 View Database Contents

### Using pgAdmin

1. Open pgAdmin
2. Connect to your server
3. Expand: Servers → PostgreSQL → Databases → barberai → Tables
4. Right-click on any table → "View/Edit Data" → "All Rows"

### Using Command Line

```bash
# Connect to database
psql -U postgres -d barberai

# List tables
\dt

# View services
SELECT * FROM services;

# View sessions
SELECT * FROM sessions;

# View transactions
SELECT * FROM transactions;

# Exit
\q
```

---

## 🐛 Troubleshooting

### Error: "database "barberai" does not exist"

**Solution:**
```bash
# Create the database
psql -U postgres -c "CREATE DATABASE barberai;"
```

### Error: "password authentication failed"

**Solution:**
1. Check your `.env` file
2. Make sure `DB_PASSWORD` matches your PostgreSQL password
3. If you forgot the password, reset it:
   ```bash
   # Windows
   "C:\Program Files\PostgreSQL\15\bin\psql.exe" -U postgres
   ALTER USER postgres PASSWORD 'new_password';
   
   # Mac/Linux
   psql -U postgres
   ALTER USER postgres PASSWORD 'new_password';
   ```

### Error: "connection refused"

**Solution:**
1. Make sure PostgreSQL is running:
   - **Windows:** Check Services → PostgreSQL
   - **Mac:** `brew services list`
   - **Linux:** `sudo systemctl status postgresql`

2. Start PostgreSQL if not running:
   - **Windows:** Start the service
   - **Mac:** `brew services start postgresql@15`
   - **Linux:** `sudo systemctl start postgresql`

### Error: "ECONNREFUSED" on port 5432

**Solution:**
1. Check if PostgreSQL is listening on port 5432:
   ```bash
   # Windows
   netstat -an | findstr 5432
   
   # Mac/Linux
   netstat -an | grep 5432
   ```

2. If not listening, check `postgresql.conf`:
   - **Windows:** `C:\Program Files\PostgreSQL\15\data\postgresql.conf`
   - **Mac:** `/usr/local/var/postgres/postgresql.conf`
   - **Linux:** `/etc/postgresql/15/main/postgresql.conf`
   
3. Make sure this line is present:
   ```
   listen_addresses = 'localhost'
   port = 5432
   ```

4. Restart PostgreSQL after changes

---

## 📊 Database Schema

### Tables

**services**
- id (UUID, Primary Key)
- name (VARCHAR)
- type (VARCHAR, Unique)
- price (INTEGER)
- duration (INTEGER)
- enabled (BOOLEAN)
- created_at, updated_at (TIMESTAMP)

**barbers**
- id (VARCHAR, Primary Key)
- name (VARCHAR)
- active (BOOLEAN)
- created_at (TIMESTAMP)

**cameras**
- id (VARCHAR, Primary Key)
- name (VARCHAR)
- chair_id (VARCHAR)
- status (VARCHAR)
- stream_url (TEXT)
- created_at, updated_at (TIMESTAMP)

**sessions**
- id (UUID, Primary Key)
- chair_id (VARCHAR)
- customer_name, customer_id (VARCHAR)
- barber_id, barber_name (VARCHAR)
- start_time, end_time (TIMESTAMP)
- status (VARCHAR)
- total_bill (INTEGER)
- created_at (TIMESTAMP)

**detected_services**
- id (UUID, Primary Key)
- session_id (UUID, Foreign Key)
- chair_id (VARCHAR)
- type (VARCHAR)
- confidence (INTEGER)
- status (VARCHAR)
- price (INTEGER)
- detected_at, completed_at (TIMESTAMP)

**transactions**
- id (UUID, Primary Key)
- transaction_id (VARCHAR, Unique)
- session_id (UUID, Foreign Key)
- customer_id, customer_name (VARCHAR)
- barber_name (VARCHAR)
- amount (INTEGER)
- payment_method (VARCHAR)
- status (VARCHAR)
- timestamp (TIMESTAMP)

**transaction_services**
- transaction_id (UUID, Foreign Key)
- service_name (VARCHAR)
- Primary Key: (transaction_id, service_name)

**activity_log**
- id (UUID, Primary Key)
- chair_id (VARCHAR)
- message (TEXT)
- confidence (INTEGER)
- type (VARCHAR)
- timestamp (TIMESTAMP)

### Indexes

- idx_sessions_chair (chair_id)
- idx_sessions_status (status)
- idx_detected_services_session (session_id)
- idx_transactions_timestamp (timestamp)
- idx_activity_timestamp (timestamp)
- idx_activity_chair (chair_id)

---

## 🔄 Migration from JSON to PostgreSQL

If you had data in the old JSON database:

1. The JSON file was at: `backend/data/barberai.json`
2. PostgreSQL is now at: `localhost:5432/barberai`
3. All API endpoints work the same way
4. No frontend changes needed!

---

## 🎯 Next Steps

1. ✅ PostgreSQL installed and running
2. ✅ Database created
3. ✅ Schema initialized
4. ✅ Data seeded
5. ✅ Backend connected to PostgreSQL
6. 🚀 Start the frontend and test!

---

## 📚 PostgreSQL Resources

- **Official Documentation:** https://www.postgresql.org/docs/
- **pgAdmin Download:** https://www.pgadmin.org/download/
- **SQL Tutorial:** https://www.postgresqltutorial.com/

---

## 💡 Tips

- **Use pgAdmin** for easy database management
- **Backup regularly:** `pg_dump barberai > backup.sql`
- **Restore from backup:** `psql -U postgres -d barberai < backup.sql`
- **Monitor performance:** Use pgAdmin's built-in tools
- **Learn SQL:** It's worth it for database work!

---

**Happy coding with PostgreSQL! 🐘**
