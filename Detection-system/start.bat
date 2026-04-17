@echo off
REM Detection System Startup Script - Windows
REM This script starts the entire Detection System (Backend + Frontend)

echo.
echo ========================================
echo Detection System - Full Stack Startup
echo ========================================
echo.

REM Check Node.js installation
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed or not in PATH
    echo Please install Node.js v14+ from https://nodejs.org/
    exit /b 1
)

echo ✅ Node.js found: %cd%
echo.

REM Kill any existing processes on ports 3000 and 3001
echo Cleaning up old processes...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":3000"') do taskkill /PID %%a /F 2>nul
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":3001"') do taskkill /PID %%a /F 2>nul
timeout /t 1 /nobreak >nul

echo.
echo Starting Backend Server (Port 3000)...
start "Backend - Detection System" cmd /k "cd backend && npm start"
timeout /t 3 /nobreak >nul

echo Starting Frontend Server (Port 3001)...
start "Frontend - Detection System" cmd /k "cd frontend && npm run dev -- -p 3001"
timeout /t 3 /nobreak >nul

echo.
echo ========================================
echo Servers are starting...
echo ========================================
echo.
echo Backend:  http://localhost:3000
echo Frontend: http://localhost:3001
echo API:      http://localhost:3000/api
echo.
echo Dashboard will be available at: http://localhost:3001
echo Press CTRL+C in either window to stop the server.
echo.
pause
