@echo off
REM AI Sari Tracking Inventory System - Quick Start Script for Windows
REM This script will set up the backend quickly

echo 🚀 AI Sari Tracking Inventory System - Quick Start
echo ==================================================

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js is not installed. Please install Node.js first.
    echo    Download from: https://nodejs.org/
    pause
    exit /b 1
)

echo 📦 Installing dependencies...
npm install

echo ⚙️  Setting up configuration...
if not exist config.env (
    copy config.env.example config.env
    echo ✅ Created config.env from template
    echo ⚠️  Please edit config.env with your database credentials
    echo    Database: MH Factory Sari-Tracking
    echo    User: postgres
    echo    Password: (your password)
    echo.
    pause
)

echo 🗄️  Setting up database...
node recreate-database-simple.js

echo 📊 Uploading sample data...
node upload-csv-data-new.js

echo 🎉 Setup complete!
echo.
echo To start the server:
echo   node server.js
echo.
echo The API will be available at:
echo   http://localhost:5000
echo.
echo Test endpoints:
echo   http://localhost:5000/health
echo   http://localhost:5000/api/dashboard/overview
echo.
echo Happy tracking! 🎯
pause
