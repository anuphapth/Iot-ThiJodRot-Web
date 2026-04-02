# IoT Parking System - Setup Guide

## Prerequisites
- Node.js (v18 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

## Installation

### 1. Clone the Repository
```bash
git clone <repository-url>
cd Iot_ThiJodRot
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Database Setup

#### Create Database
```sql
CREATE DATABASE iot_parking;
CREATE USER iot_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE iot_parking TO iot_user;
```

#### Run Database Schema
```bash
psql -h localhost -U iot_user -d iot_parking -f scripts/database/schema.sql
```

#### Seed Sample Data (Optional)
```bash
psql -h localhost -U iot_user -d iot_parking -f scripts/database/seed.sql
```

### 4. Environment Configuration
Create `.env` file:
```env
DATABASE_URL=postgresql://iot_user:your_password@localhost:5432/iot_parking
PORT=3000
NODE_ENV=development
```

### 5. Start the Application
```bash
npm start
```

The application will be available at `http://localhost:3000`

## Project Structure

```
Iot_ThiJodRot/
├── src/                    # Source code
│   ├── controllers/         # Request handlers
│   ├── services/           # Business logic
│   ├── repositories/       # Data access
│   ├── models/             # Data models
│   ├── routes/             # API routes
│   ├── middleware/         # Custom middleware
│   ├── utils/              # Utilities
│   └── config/             # Configuration
├── public/                 # Static files
├── tests/                  # Test files
├── scripts/                # Automation scripts
├── docs/                   # Documentation
├── logs/                   # Application logs
```

## Development

### Running Tests
```bash
npm test
```

### Development Mode
```bash
npm run dev
```

### Database Migrations
```bash
# Run schema
psql -h localhost -U iot_user -d iot_parking -f scripts/database/schema.sql

# Reset database
psql -h localhost -U iot_user -d iot_parking -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
psql -h localhost -U iot_user -d iot_parking -f scripts/database/schema.sql
psql -h localhost -U iot_user -d iot_parking -f scripts/database/seed.sql
```

## API Documentation

See [API Endpoints](docs/api/endpoints.md) for detailed API documentation.

## Default Credentials

- Username: `admin`
- Password: `admin123`

⚠️ **Important**: Change the default password in production!

## Features

- **Parking Management**: Real-time parking slot status
- **Admin Controls**: Slot maintenance and status control
- **Power Monitoring**: Energy consumption tracking
- **Real-time Updates**: Server-sent events for live updates
- **User Authentication**: Session-based login system

## Troubleshooting

### Database Connection Issues
1. Verify PostgreSQL is running
2. Check database credentials in `.env`
3. Ensure database exists

### Port Already in Use
```bash
# Find process using port 3000
netstat -tulpn | grep :3000

# Kill process (replace PID)
kill -9 <PID>
```

### Permission Issues
```bash
# Fix file permissions
chmod +x scripts/database/*.sql
```