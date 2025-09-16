# 🌸 Sari Inventory Management System

A comprehensive, modern inventory management system designed specifically for Sari manufacturing and production flow tracking. Built with React Native for cross-platform mobile support and a robust Node.js/PostgreSQL backend.

## 🚀 Project Overview

This system provides end-to-end management of Sari production, from raw materials to finished products, with real-time tracking of movement through various production stages (Kora → White → Self → Contrast).

## 🏗️ System Architecture

```
sari-inventory-app/
├── 📱 Frontend (React Native + Expo)
│   ├── App.tsx                 # Main application with navigation
│   ├── src/
│   │   ├── screens/           # UI screens for all features
│   │   ├── types.ts           # TypeScript interfaces
│   │   └── services/          # Data services and API integration
│   └── package.json           # Frontend dependencies
│
├── 🔧 Backend (Node.js + Express + PostgreSQL)
│   ├── server.js              # Main Express server
│   ├── config/
│   │   └── database.js        # PostgreSQL connection management
│   ├── routes/                # API endpoints for all entities
│   ├── config.env             # Environment configuration
│   └── package.json           # Backend dependencies
│
└── 🗄️ Database (PostgreSQL)
    ├── Item_Master            # Design codes and process codes
    ├── Serial_Master          # Main sari tracking table
    └── Movement_Log           # Production flow history
```

## ✨ Key Features

### 📱 Frontend Features
- **Cross-Platform Support**: Works on iOS, Android, and Web
- **Beautiful UI/UX**: Modern, intuitive interface with smooth animations
- **Real-time Updates**: Live data synchronization with backend
- **Offline Support**: Local data caching for mobile devices
- **Responsive Design**: Adapts to different screen sizes

### 🔧 Backend Features
- **RESTful API**: Complete CRUD operations for all entities
- **Real-time Database**: PostgreSQL with automatic trigger updates
- **Security**: Rate limiting, CORS, input validation
- **Performance**: Connection pooling, query optimization
- **Monitoring**: Comprehensive logging and error handling

### 🗄️ Database Features
- **Automatic Updates**: Triggers update Serial_Master on Movement_Log changes
- **Referential Integrity**: Foreign key constraints ensure data consistency
- **Process Tracking**: Complete production flow history
- **Code Management**: Automatic current_code calculation based on process

## 🛠️ Technology Stack

### Frontend
- **React Native** - Cross-platform mobile development
- **Expo** - Development platform and build tools
- **TypeScript** - Type-safe development
- **React Navigation** - Screen navigation management
- **Expo Linear Gradient** - Beautiful UI components

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **PostgreSQL** - Relational database
- **pg** - PostgreSQL client for Node.js
- **express-validator** - Input validation
- **helmet** - Security middleware

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- PostgreSQL database
- npm or yarn package manager

### 1. Database Setup
```sql
-- Run the schema file in pgAdmin or psql
-- File: sari_tracking_schema.sql
```

### 2. Backend Setup
```bash
cd sari-inventory-app/backend

# Install dependencies
npm install

# Start server
npm start
# or use the Windows batch file
start.bat
```

### 3. Frontend Setup
```bash
cd sari-inventory-app

# Install dependencies
npm install

# Start development server
npm start
```

## 📱 Platform Support

- **🟢 Mobile (iOS/Android)**: Full native functionality
- **🟢 Web**: Responsive web interface
- **🟡 Desktop**: Electron support (future enhancement)

## 🔄 Production Flow

The system tracks Sari movement through these stages:

1. **Kora** → Initial processing
2. **White** → Bleaching/cleaning
3. **Self** → Self-dyeing
4. **Contrast** → Final contrast dyeing

Each movement automatically updates:
- Current process location
- Current location
- Current code (based on design_code + process)

## 📊 Dashboard Features

- **Overview Statistics**: Total saris, active count, recent movements
- **Production Analytics**: Process distribution, completion rates
- **Performance Metrics**: Cycle times, efficiency rates
- **Real-time Monitoring**: Live updates of production status

## 🔍 Search & Filtering

- **Smart Search**: Across serial numbers, design codes, locations
- **Advanced Filters**: By process, status, date ranges
- **Pagination**: Efficient handling of large datasets
- **Real-time Suggestions**: Auto-complete for better UX

## 🛡️ Security Features

- **Input Validation**: Comprehensive request validation
- **Rate Limiting**: API abuse prevention
- **CORS Protection**: Cross-origin request security
- **SQL Injection Protection**: Parameterized queries
- **Error Handling**: Secure error responses

## 📈 Performance Features

- **Connection Pooling**: Efficient database connections
- **Query Optimization**: Indexed database queries
- **Caching**: Smart data caching strategies
- **Compression**: Response size optimization
- **Monitoring**: Performance metrics and logging

## 🧪 Testing

### Backend Testing
```bash
cd backend
npm install axios  # If not already installed
node test-api.js
```

### Frontend Testing
```bash
# Run on different platforms
npm start          # Opens Expo development tools
# Then choose: iOS, Android, or Web
```

## 🔧 Configuration

### Environment Variables
```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=MH Factory Sari-Tracking
DB_USER=postgres
DB_PASSWORD=Aman@589

# Server
PORT=5000
NODE_ENV=development
CORS_ORIGIN=http://localhost:19006,http://localhost:3000
```

## 🚨 Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Verify PostgreSQL is running
   - Check connection credentials
   - Ensure database exists

2. **Frontend Build Errors**
   - Clear npm cache: `npm cache clean --force`
   - Delete node_modules and reinstall
   - Check Expo CLI version

3. **API Endpoints Not Working**
   - Verify backend server is running
   - Check CORS configuration
   - Verify database connectivity

### Getting Help
- Check the troubleshooting sections in individual README files
- Review server logs for error details
- Verify all prerequisites are met

## 🔄 Development Workflow

1. **Database Changes**: Update schema and test triggers
2. **Backend Updates**: Modify API endpoints and test
3. **Frontend Integration**: Update UI components and services
4. **Testing**: Run comprehensive tests on all platforms
5. **Deployment**: Deploy backend and frontend updates

## 📋 API Documentation

Complete API documentation is available in the backend README:
- All endpoints with examples
- Request/response formats
- Error handling details
- Authentication requirements

## 🚀 Deployment

### Backend Deployment
- Use PM2 for process management
- Configure production environment variables
- Set up reverse proxy (nginx/Apache)
- Enable SSL certificates

### Frontend Deployment
- Build production bundles for each platform
- Deploy web version to hosting service
- Publish mobile apps to app stores
- Configure CDN for static assets

## 🤝 Contributing

1. Follow the existing code style
2. Add comprehensive error handling
3. Include input validation
4. Test on all platforms
5. Update documentation

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For technical support:
1. Check the troubleshooting sections
2. Review the API documentation
3. Check server and client logs
4. Verify system requirements

---

## 🌟 What Makes This System Special

- **Real-time Production Tracking**: Automatic updates using PostgreSQL triggers
- **Cross-Platform Compatibility**: Single codebase for mobile and web
- **Beautiful User Interface**: Modern, intuitive design with smooth animations
- **Comprehensive Analytics**: Deep insights into production efficiency
- **Scalable Architecture**: Built for growth and future enhancements
- **Industry-Specific**: Designed specifically for Sari manufacturing workflows

**Built with ❤️ for efficient Sari Inventory Management**
