#!/bin/bash
# Detection System Startup Script - macOS/Linux
# This script starts the entire Detection System (Backend + Frontend)

echo ""
echo "========================================"
echo "Detection System - Full Stack Startup"
echo "========================================"
echo ""

# Check Node.js installation
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed or not in PATH"
    echo "Please install Node.js v14+ from https://nodejs.org/"
    exit 1
fi

NODE_VERSION=$(node --version)
echo "✅ Node.js found: $NODE_VERSION"
echo ""

# Kill any existing processes on ports 3000 and 3001
echo "Cleaning up old processes..."
lsof -ti:3000 | xargs kill -9 2>/dev/null || true
lsof -ti:3001 | xargs kill -9 2>/dev/null || true
sleep 1

echo ""
echo "Starting Backend Server (Port 3000)..."
cd backend && npm start &
BACKEND_PID=$!
sleep 3

echo "Starting Frontend Server (Port 3001)..."
cd ../frontend && npm run dev -- -p 3001 &
FRONTEND_PID=$!
sleep 3

echo ""
echo "========================================"
echo "Servers are starting..."
echo "========================================"
echo ""
echo "Backend:  http://localhost:3000"
echo "Frontend: http://localhost:3001"
echo "API:      http://localhost:3000/api"
echo ""
echo "Dashboard will be available at: http://localhost:3001"
echo "Backend PID: $BACKEND_PID"
echo "Frontend PID: $FRONTEND_PID"
echo ""
echo "To stop the servers, run:"
echo "  kill $BACKEND_PID $FRONTEND_PID"
echo ""

# Keep the script running
wait
