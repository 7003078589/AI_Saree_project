# Deployment Guide

This guide will help you deploy the AI Sari Tracking Inventory System backend to various platforms.

## 🚀 Quick Deployment Options

### Option 1: Local Development
```bash
# Clone the repository
git clone https://github.com/7003078589/AI_Saree_project.git
cd AI_Saree_project/sari-inventory-app/backend

# Quick setup
./quick-start.sh  # Linux/Mac
quick-start.bat   # Windows
```

### Option 2: Docker Deployment
```bash
# Using Docker Compose
docker-compose up -d

# Or build manually
docker build -t sari-backend .
docker run -p 5000:5000 sari-backend
```

### Option 3: Cloud Deployment

#### Heroku
```bash
# Install Heroku CLI
# Create new app
heroku create your-sari-app

# Set environment variables
heroku config:set DB_HOST=your-db-host
heroku config:set DB_PASSWORD=your-password
# ... other variables

# Deploy
git push heroku main
```

#### Railway
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway init
railway up
```

#### DigitalOcean App Platform
1. Connect your GitHub repository
2. Set environment variables
3. Deploy automatically

## 🗄️ Database Setup

### PostgreSQL Options

1. **Local PostgreSQL**
   - Install PostgreSQL locally
   - Create database: `CREATE DATABASE "MH Factory Sari-Tracking";`

2. **Cloud PostgreSQL**
   - **Heroku Postgres**: `heroku addons:create heroku-postgresql:hobby-dev`
   - **Railway PostgreSQL**: Automatic with Railway deployment
   - **DigitalOcean Managed Database**: Create PostgreSQL cluster

3. **Docker PostgreSQL**
   ```bash
   docker run --name postgres \
     -e POSTGRES_DB="MH Factory Sari-Tracking" \
     -e POSTGRES_PASSWORD=password \
     -p 5432:5432 \
     -d postgres:13
   ```

## ⚙️ Environment Configuration

### Required Environment Variables

```env
# Database
DB_HOST=your-database-host
DB_PORT=5432
DB_NAME=MH Factory Sari-Tracking
DB_USER=your-username
DB_PASSWORD=your-password

# Server
PORT=5000
NODE_ENV=production

# Optional
DB_MAX_CONNECTIONS=20
DB_IDLE_TIMEOUT=30000
```

### Platform-Specific Setup

#### Heroku
```bash
heroku config:set DB_HOST=your-host
heroku config:set DB_PASSWORD=your-password
heroku config:set NODE_ENV=production
```

#### Railway
Add environment variables in Railway dashboard or:
```bash
railway variables set DB_HOST=your-host
railway variables set DB_PASSWORD=your-password
```

## 🔧 Production Optimizations

### Performance
- Enable connection pooling
- Set up database indexes
- Use CDN for static assets
- Enable compression

### Security
- Use strong passwords
- Enable SSL/TLS
- Set up firewall rules
- Regular security updates

### Monitoring
- Set up health checks
- Monitor database performance
- Log error tracking
- Set up alerts

## 📊 Data Migration

### From Development to Production

1. **Export Development Data**
   ```bash
   pg_dump -h localhost -U postgres "MH Factory Sari-Tracking" > backup.sql
   ```

2. **Import to Production**
   ```bash
   psql -h production-host -U user -d "MH Factory Sari-Tracking" < backup.sql
   ```

### CSV Data Upload
```bash
# Upload sample data
node upload-csv-data-new.js

# Upload real production data
node upload-real-serial-data.js
```

## 🚨 Troubleshooting

### Common Deployment Issues

1. **Database Connection Failed**
   - Check database credentials
   - Verify network connectivity
   - Ensure database exists

2. **Port Issues**
   - Use environment PORT variable
   - Check platform port requirements

3. **Build Failures**
   - Check Node.js version compatibility
   - Verify all dependencies are installed
   - Check for missing environment variables

### Health Checks

Test your deployment:
```bash
# Health check
curl https://your-app-url/health

# API test
curl https://your-app-url/api/dashboard/overview
```

## 📈 Scaling

### Horizontal Scaling
- Use load balancers
- Deploy multiple instances
- Use database read replicas

### Vertical Scaling
- Increase server resources
- Optimize database queries
- Use caching strategies

## 🔄 CI/CD Pipeline

### GitHub Actions Example
```yaml
name: Deploy to Production
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Heroku
        uses: akhileshns/heroku-deploy@v3.12.12
        with:
          heroku_api_key: ${{secrets.HEROKU_API_KEY}}
          heroku_app_name: "your-app-name"
          heroku_email: "your-email@example.com"
```

## 📞 Support

For deployment issues:
1. Check platform-specific documentation
2. Verify environment variables
3. Check server logs
4. Test database connectivity

---

**Happy Deploying! 🚀**
