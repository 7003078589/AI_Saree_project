#!/bin/bash

# AI Sari Tracking Inventory System - Quick Start Script
# This script will set up the backend quickly

echo "🚀 AI Sari Tracking Inventory System - Quick Start"
echo "=================================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    echo "   Download from: https://nodejs.org/"
    exit 1
fi

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo "⚠️  PostgreSQL is not installed. You can:"
    echo "   1. Install PostgreSQL from: https://www.postgresql.org/download/"
    echo "   2. Or use Docker: docker run --name postgres -e POSTGRES_PASSWORD=password -p 5432:5432 -d postgres"
    echo ""
    read -p "Do you want to continue with Docker setup? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "🐳 Setting up with Docker..."
        if command -v docker &> /dev/null; then
            docker-compose up -d postgres
            echo "✅ PostgreSQL started with Docker"
        else
            echo "❌ Docker is not installed. Please install Docker first."
            exit 1
        fi
    else
        echo "Please install PostgreSQL and run this script again."
        exit 1
    fi
fi

echo "📦 Installing dependencies..."
npm install

echo "⚙️  Setting up configuration..."
if [ ! -f config.env ]; then
    cp config.env.example config.env
    echo "✅ Created config.env from template"
    echo "⚠️  Please edit config.env with your database credentials"
    echo "   Database: MH Factory Sari-Tracking"
    echo "   User: postgres"
    echo "   Password: (your password)"
    echo ""
    read -p "Press Enter after updating config.env..."
fi

echo "🗄️  Setting up database..."
node recreate-database-simple.js

echo "📊 Uploading sample data..."
node upload-csv-data-new.js

echo "🎉 Setup complete!"
echo ""
echo "To start the server:"
echo "  node server.js"
echo ""
echo "The API will be available at:"
echo "  http://localhost:5000"
echo ""
echo "Test endpoints:"
echo "  http://localhost:5000/health"
echo "  http://localhost:5000/api/dashboard/overview"
echo ""
echo "Happy tracking! 🎯"
