# Database Options for AI Sari Tracking System

This guide explains different ways to set up the database for the AI Sari Tracking Inventory System.

## 🏠 Option 1: Local Database (Your Current Setup)

**What you have now:**
- PostgreSQL running on your local machine
- Database: "MH Factory Sari-Tracking"
- Contains your real production data (2,735 saris, 1,973 movements)

**⚠️ IMPORTANT: Your database is LOCAL and PRIVATE**
- Others **CANNOT** access your local database directly
- Your database is only accessible from your machine
- To share data, you need to export and provide it to others

**For others to use your data:**
1. **You export your data** using the provided scripts
2. **They set up their own local PostgreSQL**
3. **They import your data** using the provided scripts

## 🌐 Option 2: Cloud Database (Recommended for Sharing)

### A. Free Cloud PostgreSQL Options

#### 1. **Railway PostgreSQL** (Free Tier)
```bash
# Deploy with Railway
railway login
railway init
railway add postgresql
railway up
```

#### 2. **Supabase** (Free Tier)
```bash
# Create project at https://supabase.com
# Get connection string
# Update config.env with Supabase credentials
```

#### 3. **Neon** (Free Tier)
```bash
# Create database at https://neon.tech
# Get connection string
# Update config.env
```

#### 4. **Heroku Postgres** (Free Tier - Limited)
```bash
heroku addons:create heroku-postgresql:hobby-dev
```

### B. Shared Database Setup

**For you to share your database:**

1. **Export your data:**
   ```bash
   # Export all data
   pg_dump -h localhost -U postgres "MH Factory Sari-Tracking" > sari_data_backup.sql
   
   # Or export specific tables
   pg_dump -h localhost -U postgres -t serial_master -t movement_log "MH Factory Sari-Tracking" > sari_core_data.sql
   ```

2. **Upload to cloud database:**
   ```bash
   # Import to cloud database
   psql -h your-cloud-host -U username -d database_name < sari_data_backup.sql
   ```

## 📊 Option 3: Sample Data (For Testing)

**For users who want to test without real data:**

The system includes sample data that users can import:

```bash
# Import sample data
node upload-csv-data-new.js
```

This creates:
- 24 sample saris
- 24 sample movement logs
- Sample item master data

## 🔄 Option 4: Docker Database (Easy Setup)

**For users who want everything in containers:**

```bash
# Start PostgreSQL in Docker
docker run --name sari-postgres \
  -e POSTGRES_DB="MH Factory Sari-Tracking" \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=password123 \
  -p 5432:5432 \
  -d postgres:13

# Or use docker-compose
docker-compose up -d postgres
```

## 📋 Step-by-Step Setup for Different Users

### For Users Who Want Your Real Data:

1. **You provide them with:**
   - Database backup file (`sari_data_backup.sql`)
   - Or access to your cloud database

2. **They set up:**
   ```bash
   # Clone repository
   git clone https://github.com/7003078589/AI_Saree_project.git
   cd AI_Saree_project/sari-inventory-app/backend
   
   # Install dependencies
   npm install
   
   # Configure database
   cp config.env.example config.env
   # Edit config.env with their database credentials
   
   # Setup database
   node recreate-database-simple.js
   
   # Import your data
   psql -h localhost -U postgres -d "MH Factory Sari-Tracking" < sari_data_backup.sql
   
   # Start server
   node server.js
   ```

### For Users Who Want Sample Data:

```bash
# Quick setup with sample data
git clone https://github.com/7003078589/AI_Saree_project.git
cd AI_Saree_project/sari-inventory-app/backend
./quick-start.sh  # This includes sample data
```

### For Users Who Want Their Own Data:

```bash
# Setup empty database
git clone https://github.com/7003078589/AI_Saree_project.git
cd AI_Saree_project/sari-inventory-app/backend
npm install
cp config.env.example config.env
# Edit config.env
node recreate-database-simple.js
node server.js

# Then they can add their own data via:
# - CSV upload scripts
# - API endpoints
# - Manual data entry
```

## 🔧 Configuration Examples

### Local PostgreSQL
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=MH Factory Sari-Tracking
DB_USER=postgres
DB_PASSWORD=your_password
```

### Railway PostgreSQL
```env
DB_HOST=containers-us-west-xxx.railway.app
DB_PORT=5432
DB_NAME=railway
DB_USER=postgres
DB_PASSWORD=your_railway_password
```

### Supabase
```env
DB_HOST=db.xxxxxxxxxxxxx.supabase.co
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=your_supabase_password
```

## 📤 Data Export Scripts

Let me create scripts to help you export your data:

### Export All Data
```bash
# Full database backup
pg_dump -h localhost -U postgres "MH Factory Sari-Tracking" > full_backup.sql

# Only core tables
pg_dump -h localhost -U postgres -t serial_master -t movement_log -t item_master "MH Factory Sari-Tracking" > core_data.sql
```

### Export as CSV
```bash
# Export serial_master
psql -h localhost -U postgres -d "MH Factory Sari-Tracking" -c "\COPY serial_master TO 'serial_master_export.csv' WITH CSV HEADER"

# Export movement_log
psql -h localhost -U postgres -d "MH Factory Sari-Tracking" -c "\COPY movement_log TO 'movement_log_export.csv' WITH CSV HEADER"
```

## 🚀 Recommended Approach

**For maximum compatibility:**

1. **Keep your local setup** for development
2. **Create a cloud database** for sharing
3. **Provide both options** in documentation:
   - Sample data for testing
   - Real data for production use
4. **Include export scripts** for easy data sharing

## 📞 Support

If users have database setup issues:
1. Check the troubleshooting section
2. Verify database credentials
3. Ensure database is accessible
4. Test connection with provided scripts

---

**Choose the option that works best for your use case! 🎯**
