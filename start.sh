#!/bin/bash

# BarberAI - Start both frontend and backend

echo "🚀 Starting BarberAI..."
echo ""

# Check if backend dependencies are installed
if [ ! -d "backend/node_modules" ]; then
    echo "📦 Installing backend dependencies..."
    cd backend
    npm install
    cd ..
fi

# Check if database exists, if not seed it
if [ ! -f "backend/data/barberai.db" ]; then
    echo "🗄️  Seeding database..."
    cd backend
    npm run seed
    cd ..
fi

# Start backend in background
echo "🔌 Starting backend on port 3001..."
cd backend
npm run dev &
BACKEND_PID=$!
cd ..

# Wait for backend to start
sleep 2

# Start frontend
echo "🎨 Starting frontend on port 5173..."
npm run dev &
FRONTEND_PID=$!

echo ""
echo "✅ Both servers are running!"
echo ""
echo "📡 Backend:  http://localhost:3001"
echo "🎨 Frontend: http://localhost:5173"
echo ""
echo "Press Ctrl+C to stop both servers"
echo ""

# Handle Ctrl+C
trap "echo ''; echo '🛑 Stopping servers...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT

# Wait for both processes
wait
