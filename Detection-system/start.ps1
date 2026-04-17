#!/usr/bin/env pwsh
# Detection System Startup Script - PowerShell (Windows/Mac/Linux)
# This script starts the entire Detection System (Backend + Frontend)

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Detection System - Full Stack Startup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check Node.js installation
$nodeCheck = node --version 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Node.js is not installed or not in PATH" -ForegroundColor Red
    Write-Host "Please install Node.js v14+ from https://nodejs.org/" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Node.js found: $nodeCheck" -ForegroundColor Green
Write-Host ""

# Kill any existing processes on ports 3000 and 3001
Write-Host "Cleaning up old processes..." -ForegroundColor Yellow
Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue | 
    Where-Object {$_.State -eq 'Listen'} | 
    Stop-Process -Force -ErrorAction SilentlyContinue 2>$null

Get-NetTCPConnection -LocalPort 3001 -ErrorAction SilentlyContinue | 
    Where-Object {$_.State -eq 'Listen'} | 
    Stop-Process -Force -ErrorAction SilentlyContinue 2>$null

Start-Sleep -Seconds 1

Write-Host ""
Write-Host "Starting Backend Server (Port 3000)..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit -Command cd '$PWD/backend' ; npm start" -WindowStyle Normal

Start-Sleep -Seconds 3

Write-Host "Starting Frontend Server (Port 3001)..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit -Command cd '$PWD/frontend' ; npm run dev -- -p 3001" -WindowStyle Normal

Start-Sleep -Seconds 3

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Servers are starting..." -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Backend:  http://localhost:3000" -ForegroundColor Yellow
Write-Host "Frontend: http://localhost:3001" -ForegroundColor Yellow
Write-Host "API:      http://localhost:3000/api" -ForegroundColor Yellow
Write-Host ""
Write-Host "Dashboard will be available at: http://localhost:3001" -ForegroundColor Green
Write-Host "Press CTRL+C in either window to stop the server." -ForegroundColor Yellow
Write-Host ""
