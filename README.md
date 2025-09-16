# AI Sari Tracking Inventory System

A comprehensive React Native application with Node.js backend for tracking sari production processes in real-time.

## 🎯 Features

### 📱 Frontend (React Native/Expo)
- **Dashboard**: Overview of production statistics and key metrics
- **Inventory Management**: Track all saris with filtering and search capabilities
- **Movement Logs**: Complete production flow tracking with advanced filters
- **Live Process Tracking**: Real-time monitoring with blinking indicators
- **Mobile Optimized**: Responsive design for mobile devices

### 🔧 Backend (Node.js/Express)
- **RESTful API**: Complete CRUD operations for all entities
- **PostgreSQL Database**: Robust data storage with proper relationships
- **Real-time Updates**: Live process tracking with automatic refresh
- **Data Import**: CSV upload functionality for bulk data management

## 🏭 Production Process Flow

The system tracks saris through the following manufacturing stages:

```
Entry → Kora → White → Self Dyed → Contrast Dyed
```

Each stage includes:
- **Location tracking**: Current position in the facility
- **Process monitoring**: Real-time status updates
- **Movement logging**: Complete audit trail
- **Quality control**: Status tracking and notes

## 📊 Data Management

### Database Schema
- **serial_master**: Main sari records (2,735+ saris)
- **movement_log**: Production flow tracking (1,973+ movements)
- **item_master**: Design and process specifications
- **customers**: Customer information
- **suppliers**: Supplier management

### Key Statistics
- **Total Saris**: 2,735
- **Total Movements**: 1,973
- **Process Stages**: 5 (Entry, Kora, White, Self Dyed, Contrast Dyed)
- **Locations**: 7+ different facility locations

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- PostgreSQL database
- Expo CLI (for mobile development)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/7003078589/AI_Saree_project.git
   cd AI_Saree_project
   ```

2. **Backend Setup**
   ```bash
   cd sari-inventory-app/backend
   npm install
   ```

3. **Database Configuration**
   - Create PostgreSQL database
   - Update `config.env` with your database credentials
   - Run database setup scripts

4. **Frontend Setup**
   ```bash
   cd sari-inventory-app
   npm install
   ```

### Running the Application

1. **Start Backend Server**
   ```bash
   cd sari-inventory-app/backend
   node server.js
   ```
   Server runs on: http://localhost:5000

2. **Start Frontend**
   ```bash
   cd sari-inventory-app
   npx expo start --web
   ```
   App runs on: http://localhost:8081

## 📱 Mobile App Features

### Dashboard
- Production overview with key metrics
- Process distribution charts
- Recent activity tracking

### Inventory
- Complete sari listing (2,735+ items)
- Advanced filtering by process stage
- Search functionality
- Mobile-optimized interface

### Movement Logs
- Complete production flow history
- Filter by process, date, serial number
- Real-time updates
- Detailed movement tracking

### Live Process Tracking
- Real-time process monitoring
- Blinking indicators for active stages
- Process flow visualization
- Automatic refresh every 30 seconds

## 🔧 API Endpoints

### Core APIs
- `GET /api/saris` - Get all saris with pagination
- `GET /api/movements` - Get movement logs
- `GET /api/dashboard/overview` - Dashboard statistics
- `GET /api/process/live-status` - Live process tracking

### Data Management
- `POST /api/saris` - Add new sari
- `POST /api/movements` - Add movement log
- `PUT /api/saris/:id` - Update sari
- `DELETE /api/saris/:id` - Delete sari

## 📈 Key Features

### Real-time Tracking
- Live process monitoring with visual indicators
- Automatic data refresh
- Blinking lights for active processes
- Progress bars for each sari

### Advanced Filtering
- Search by serial number, process, or location
- Filter by process stages
- Date-based filtering
- Real-time filter updates

### Mobile Optimization
- Responsive design for mobile devices
- Touch-friendly interface
- Optimized for phone usage
- Compact layouts and reduced spacing

### Data Import/Export
- CSV upload functionality
- Bulk data processing
- Data validation and error handling
- Sample data generation

## 🛠️ Technology Stack

### Frontend
- **React Native**: Cross-platform mobile development
- **Expo**: Development platform and tools
- **TypeScript**: Type-safe development
- **React Navigation**: Navigation management

### Backend
- **Node.js**: Server runtime
- **Express.js**: Web framework
- **PostgreSQL**: Database
- **pg**: PostgreSQL client

### Development Tools
- **Git**: Version control
- **npm**: Package management
- **Expo CLI**: Development tools

## 📊 Database Structure

### Tables
- `serial_master`: Main sari records
- `movement_log`: Production movements
- `item_master`: Item specifications
- `customers`: Customer data
- `suppliers`: Supplier information

### Key Relationships
- Serial Master ↔ Movement Log (One-to-Many)
- Item Master ↔ Serial Master (One-to-Many)
- Customers ↔ Serial Master (One-to-Many)

## 🔄 Data Flow

1. **Entry**: Sari enters the system
2. **Kora**: Initial processing stage
3. **White**: Bleaching/preparation
4. **Self Dyed**: Primary dyeing process
5. **Contrast Dyed**: Secondary dyeing
6. **Completion**: Final quality check

## 📱 Mobile App Screens

1. **Dashboard**: Overview and statistics
2. **Inventory**: Sari management with filters
3. **Movement Logs**: Production flow tracking
4. **Live Process**: Real-time monitoring
5. **Add Sari**: New sari entry
6. **Add Movement**: Movement logging

## 🎨 UI/UX Features

- **Purple theme**: Consistent branding
- **Card-based layout**: Clean, modern design
- **Responsive design**: Mobile-first approach
- **Touch optimization**: Easy mobile interaction
- **Visual indicators**: Process status visualization

## 📈 Performance

- **Real-time updates**: 30-second refresh intervals
- **Efficient queries**: Optimized database operations
- **Pagination**: Large dataset handling
- **Caching**: Improved response times

## 🔒 Security

- **Input validation**: Data sanitization
- **SQL injection protection**: Parameterized queries
- **Error handling**: Graceful error management
- **Data validation**: Type checking and constraints

## 📝 Development Notes

### Recent Updates
- Added comprehensive filtering to Movement Logs
- Implemented Live Process tracking with blinking indicators
- Mobile optimization for all screens
- Real-time data updates
- Complete API integration

### Future Enhancements
- Push notifications for process updates
- Barcode scanning for quick entry
- Advanced analytics and reporting
- Multi-language support
- Offline mode capability

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 📞 Support

For support and questions, please contact the development team.

---

**AI Sari Tracking Inventory System** - Streamlining sari production with real-time tracking and mobile optimization.
