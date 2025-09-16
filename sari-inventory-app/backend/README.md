# 🌸 Sari Inventory Management System - Backend API

A robust Node.js/Express backend API for managing Sari inventory, production flow, and business operations with PostgreSQL database integration.

## 🚀 Features

- **Complete CRUD Operations** for all entities
- **Real-time Database Integration** with PostgreSQL
- **Automatic Trigger Updates** for production flow tracking
- **Comprehensive Validation** and error handling
- **Security Features** including rate limiting and CORS
- **Performance Monitoring** and logging
- **RESTful API Design** following best practices

## 🏗️ Architecture

```
backend/
├── config/
│   └── database.js          # Database connection and pool management
├── routes/
│   ├── sariRoutes.js        # Sari inventory management
│   ├── movementRoutes.js    # Production flow tracking
│   ├── dashboardRoutes.js   # Analytics and statistics
│   ├── customerRoutes.js    # Customer management
│   └── supplierRoutes.js    # Supplier management
├── server.js                # Main Express server
├── config.env               # Environment configuration
└── package.json             # Dependencies and scripts
```

## 🛠️ Technology Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL with `pg` driver
- **Validation**: express-validator
- **Security**: helmet, cors, express-rate-limit
- **Logging**: morgan
- **Environment**: dotenv

## 📋 Prerequisites

- Node.js (v14 or higher)
- PostgreSQL database
- npm or yarn package manager

## 🚀 Installation & Setup

### 1. Clone and Install Dependencies

```bash
cd sari-inventory-app/backend
npm install
```

### 2. Environment Configuration

Create a `config.env` file in the backend directory:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=MH Factory Sari-Tracking
DB_USER=postgres
DB_PASSWORD=Aman@589

# Server Configuration
PORT=5000
NODE_ENV=development

# JWT Secret (change this in production)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# CORS Configuration
CORS_ORIGIN=http://localhost:19006,http://localhost:3000
```

### 3. Database Setup

Ensure your PostgreSQL database is running and the schema is created using the `sari_tracking_schema.sql` file from the main project.

### 4. Start the Server

```bash
# Development mode with auto-restart
npm run dev

# Production mode
npm start
```

## 📚 API Endpoints

### 🔍 Health Check
- `GET /health` - Server and database status

### 🌸 Sari Management
- `GET /api/saris` - List all saris with pagination and filters
- `GET /api/saris/:id` - Get sari by ID
- `POST /api/saris` - Create new sari
- `PUT /api/saris/:id` - Update sari
- `DELETE /api/saris/:id` - Soft delete sari (mark as rejected)

### 📦 Movement Tracking
- `GET /api/movements` - List all movement logs
- `GET /api/movements/:id` - Get movement log by ID
- `GET /api/movements/sari/:serialNumber` - Get movement history for a sari
- `POST /api/movements` - Create new movement log
- `PUT /api/movements/:id` - Update movement log
- `DELETE /api/movements/:id` - Delete movement log
- `GET /api/movements/stats/summary` - Movement statistics

### 📊 Dashboard & Analytics
- `GET /api/dashboard/overview` - Overview statistics
- `GET /api/dashboard/production-flow` - Production flow analytics
- `GET /api/dashboard/inventory-analytics` - Inventory analytics
- `GET /api/dashboard/recent-activities` - Recent activities
- `GET /api/dashboard/performance-metrics` - Performance metrics
- `GET /api/dashboard/search-suggestions` - Search suggestions

### 👥 Customer Management
- `GET /api/customers` - List all customers
- `GET /api/customers/:id` - Get customer by ID
- `POST /api/customers` - Create new customer
- `PUT /api/customers/:id` - Update customer
- `DELETE /api/customers/:id` - Soft delete customer
- `GET /api/customers/stats/summary` - Customer statistics

### 🏭 Supplier Management
- `GET /api/suppliers` - List all suppliers
- `GET /api/suppliers/:id` - Get supplier by ID
- `POST /api/suppliers` - Create new supplier
- `PUT /api/suppliers/:id` - Update supplier
- `DELETE /api/suppliers/:id` - Soft delete supplier
- `GET /api/suppliers/categories/list` - List supplier categories
- `GET /api/suppliers/stats/summary` - Supplier statistics

## 🔐 Security Features

- **Helmet.js** - Security headers
- **CORS** - Cross-origin resource sharing
- **Rate Limiting** - 100 requests per 15 minutes per IP
- **Input Validation** - Request body validation
- **SQL Injection Protection** - Parameterized queries

## 📊 Database Integration

### Automatic Updates
The system uses PostgreSQL triggers to automatically update `Serial_Master` when `Movement_Log` entries are created:

- **current_process** → Updated to `to_process`
- **current_location** → Updated to `location`
- **current_code** → Automatically calculated based on `design_code` and `current_process`

### Database Schema
- **Item_Master** - Design codes and process-specific item codes
- **Serial_Master** - Main sari tracking with current status
- **Movement_Log** - Complete production flow history
- **Customers** - Customer information and relationships
- **Suppliers** - Supplier information and categories

## 🧪 Testing

### Test Database Connection
```bash
# The server automatically tests the database connection on startup
npm start
```

### Manual Testing
```bash
# Test health endpoint
curl http://localhost:5000/health

# Test API endpoints
curl http://localhost:5000/api/saris
```

## 📝 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DB_HOST` | PostgreSQL host | localhost |
| `DB_PORT` | PostgreSQL port | 5432 |
| `DB_NAME` | Database name | MH Factory Sari-Tracking |
| `DB_USER` | Database user | postgres |
| `DB_PASSWORD` | Database password | - |
| `PORT` | Server port | 5000 |
| `NODE_ENV` | Environment | development |
| `JWT_SECRET` | JWT signing secret | - |
| `CORS_ORIGIN` | Allowed origins | localhost:19006,3000 |

## 🚨 Error Handling

The API provides comprehensive error handling:

- **400** - Bad Request (validation errors)
- **404** - Not Found (resource not found)
- **500** - Internal Server Error (server errors)

All errors include:
- Error message
- Timestamp
- Request path
- Detailed validation errors (when applicable)

## 📈 Performance Features

- **Connection Pooling** - Efficient database connections
- **Query Optimization** - Indexed database queries
- **Pagination** - Large dataset handling
- **Rate Limiting** - API abuse prevention
- **Compression** - Response size optimization

## 🔄 Production Deployment

### Environment Setup
```bash
# Set production environment
NODE_ENV=production
PORT=5000

# Use strong JWT secret
JWT_SECRET=your-very-long-random-secret-key

# Configure CORS for production domains
CORS_ORIGIN=https://yourdomain.com
```

### Process Management
```bash
# Install PM2 for process management
npm install -g pm2

# Start with PM2
pm2 start server.js --name "sari-inventory-api"

# Monitor processes
pm2 status
pm2 logs
```

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Check PostgreSQL service status
   - Verify connection credentials in `config.env`
   - Ensure database exists and is accessible

2. **Port Already in Use**
   - Change PORT in `config.env`
   - Kill existing process: `lsof -ti:5000 | xargs kill -9`

3. **CORS Errors**
   - Verify `CORS_ORIGIN` in `config.env`
   - Check frontend URL matches allowed origins

### Logs
- Server logs are displayed in the console
- Database connection status is shown on startup
- All API requests are logged with Morgan

## 🤝 Contributing

1. Follow the existing code style
2. Add proper error handling
3. Include input validation
4. Test all endpoints
5. Update documentation

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For issues and questions:
1. Check the troubleshooting section
2. Review the API documentation
3. Check server logs for error details
4. Verify database connectivity

---

**Built with ❤️ for efficient Sari Inventory Management**
