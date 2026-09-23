@echo off
echo 🚀 Starting BarberAI...
echo.

REM Check if backend dependencies are installed
if not exist "backend\node_modules" (
    echo 📦 Installing backend dependencies...
    cd backend
    call npm install
    cd ..
)

REM Check if database exists, if not seed it
if not exist "backend\data\barberai.db" (
    echo 🗄️  Seeding database...
    cd backend
    call npm run seed
    cd ..
)

REM Start backend
echo 🔌 Starting backend on port 3001...
cd backend
start "BarberAI Backend" cmd /c "npm run dev"
cd ..

REM Wait for backend to start
timeout /t 2 /nobreak >nul

REM Start frontend
echo 🎨 Starting frontend on port 5173...
start "BarberAI Frontend" cmd /c "npm run dev"

echo.
echo ✅ Both servers are starting!
echo.
echo 📡 Backend:  http://localhost:3001
echo 🎨 Frontend: http://localhost:5173
echo.
echo Close both terminal windows to stop the servers.
echo.
pause
