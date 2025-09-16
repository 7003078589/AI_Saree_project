@echo off
echo 🌸 Starting Sari Inventory Backend Server...
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

REM Check if dependencies are installed
if not exist "node_modules" (
    echo 📦 Installing dependencies...
    npm install
    if %errorlevel% neq 0 (
        echo ❌ Failed to install dependencies
        pause
        exit /b 1
    )
)

REM Check if config.env exists
if not exist "config.env" (
    echo ⚠️  config.env not found. Creating default configuration...
    echo # Database Configuration > config.env
    echo DB_HOST=localhost >> config.env
    echo DB_PORT=5432 >> config.env
    echo DB_NAME=MH Factory Sari-Tracking >> config.env
    echo DB_USER=postgres >> config.env
    echo DB_PASSWORD=Aman@589 >> config.env
    echo. >> config.env
    echo # Server Configuration >> config.env
    echo PORT=5000 >> config.env
    echo NODE_ENV=development >> config.env
    echo. >> config.env
    echo # JWT Secret >> config.env
    echo JWT_SECRET=your-super-secret-jwt-key-change-this-in-production >> config.env
    echo. >> config.env
    echo # CORS Configuration >> config.env
    echo CORS_ORIGIN=http://localhost:19006,http://localhost:3000 >> config.env
    echo ✅ Default config.env created
)

echo 🚀 Starting server...
echo 📍 Server will be available at: http://localhost:5000
echo 📊 Health check: http://localhost:5000/health
echo.
echo Press Ctrl+C to stop the server
echo.

npm start
