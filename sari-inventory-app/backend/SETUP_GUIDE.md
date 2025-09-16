# Backend Setup Guide

This guide will help you set up the AI Sari Tracking Inventory System backend on your own machine.

## Prerequisites

1. **Node.js** (v14 or higher)
   - Download from: https://nodejs.org/
   - Verify installation: `node --version`

2. **PostgreSQL Database**
   - Download from: https://www.postgresql.org/download/
   - Or use Docker: `docker run --name postgres -e POSTGRES_PASSWORD=yourpassword -p 5432:5432 -d postgres`

3. **Git** (to clone the repository)
   - Download from: https://git-scm.com/

## Step 1: Clone the Repository

```bash
git clone https://github.com/7003078589/AI_Saree_project.git
cd AI_Saree_project/sari-inventory-app/backend
```

## Step 2: Install Dependencies

```bash
npm install
```

This will install all required packages:
- express (web framework)
- pg (PostgreSQL client)
- csv-parser (CSV file processing)
- dotenv (environment variables)

## Step 3: Database Setup

### Option A: Using PostgreSQL (Recommended)

1. **Create Database:**
   ```sql
   CREATE DATABASE "MH Factory Sari-Tracking";
   ```

2. **Create User (Optional):**
   ```sql
   CREATE USER sari_user WITH PASSWORD 'your_password';
   GRANT ALL PRIVILEGES ON DATABASE "MH Factory Sari-Tracking" TO sari_user;
   ```

### Option B: Using Docker

```bash
docker run --name sari-postgres \
  -e POSTGRES_DB="MH Factory Sari-Tracking" \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=yourpassword \
  -p 5432:5432 \
  -d postgres:13
```

## Step 4: Configure Environment Variables

1. **Copy the config file:**
   ```bash
   cp config.env.example config.env
   ```

2. **Edit config.env with your database details:**
   ```env
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=MH Factory Sari-Tracking
   DB_USER=postgres
   DB_PASSWORD=your_password
   PORT=5000
   ```

## Step 5: Initialize Database

1. **Create Tables:**
   ```bash
   node recreate-database-simple.js
   ```

2. **Upload Sample Data (Optional):**
   ```bash
   node upload-csv-data-new.js
   ```

3. **Upload Real Data (If you have CSV files):**
   ```bash
   node upload-real-serial-data.js
   ```

## Step 6: Start the Server

```bash
node server.js
```

The server will start on: http://localhost:5000

## Step 7: Test the API

Open your browser or use curl to test:

```bash
# Test health endpoint
curl http://localhost:5000/health

# Test API endpoints
curl http://localhost:5000/api/dashboard/overview
curl http://localhost:5000/api/saris
curl http://localhost:5000/api/movements
```

## Database Schema

The system creates these tables:

- **serial_master**: Main sari records
- **movement_log**: Production flow tracking
- **item_master**: Item specifications
- **customers**: Customer information
- **suppliers**: Supplier data

## API Endpoints

### Core Endpoints
- `GET /api/saris` - Get all saris
- `GET /api/movements` - Get movement logs
- `GET /api/dashboard/overview` - Dashboard statistics
- `GET /api/process/live-status` - Live process tracking

### Data Management
- `POST /api/saris` - Add new sari
- `POST /api/movements` - Add movement log
- `PUT /api/saris/:id` - Update sari
- `DELETE /api/saris/:id` - Delete sari

## Troubleshooting

### Common Issues

1. **Database Connection Error:**
   - Check if PostgreSQL is running
   - Verify database credentials in config.env
   - Ensure database exists

2. **Port Already in Use:**
   - Change PORT in config.env
   - Or kill the process using port 5000

3. **Permission Denied:**
   - Check database user permissions
   - Ensure user has access to the database

### Logs and Debugging

- Server logs are displayed in the console
- Database connection status is shown on startup
- API requests are logged with timestamps

## Production Deployment

### Environment Variables for Production

```env
NODE_ENV=production
DB_HOST=your_production_db_host
DB_PORT=5432
DB_NAME=your_production_db_name
DB_USER=your_production_db_user
DB_PASSWORD=your_secure_password
PORT=5000
```

### Security Considerations

1. **Change default passwords**
2. **Use environment variables for sensitive data**
3. **Enable SSL/TLS in production**
4. **Set up proper firewall rules**
5. **Regular database backups**

## Support

If you encounter issues:

1. Check the logs for error messages
2. Verify all prerequisites are installed
3. Ensure database is accessible
4. Check network connectivity

## Sample Data

The repository includes sample CSV files:
- `serial_master.csv` - Sample sari data
- `movement_log.csv` - Sample movement data
- `item_master.csv` - Sample item specifications

You can use these to test the system before adding your own data.

---

**Happy Tracking! 🎉**
