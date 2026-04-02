# IoT Parking System

## Overview
IoT Parking System is a smart parking management solution built with Node.js and PostgreSQL. It provides real-time parking slot monitoring, admin controls, power consumption tracking, and user authentication for RMUTL IoT Project 2568/1.

## Features
- Real-time parking slot status monitoring
- Admin controls for slot maintenance and status management
- Power consumption tracking and analytics
- User authentication system for admin access
- Server-Sent Events for real-time updates
- Responsive web interface for desktop and mobile

## Architecture
This project follows a layered architecture pattern:
- Controllers - Request/response handling
- Services - Business logic and validation
- Repositories - Data access layer
- Models - Data entities and schemas
- Middleware - Custom request processing
- Utils - Helper functions and error handling

## Quick Start

### Prerequisites
- Node.js 18 or higher
- PostgreSQL 12 or higher
- npm or yarn

### Installation
```bash
# Clone the repository
git clone <repository-url>
cd Iot_ThiJodRot

# Install dependencies
npm install

# Setup database
psql -h localhost -U postgres -c "CREATE DATABASE iot_parking;"
psql -h localhost -U postgres -d iot_parking -f scripts/database/schema.sql

# Configure environment
cp .env.example .env
# Edit .env with your database credentials

# Start the application
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
├── public/                 # Static frontend files
├── tests/                  # Test files
├── scripts/                # Database & deployment scripts
├── docs/                   # Documentation
```

## Development

### Available Scripts
```bash
npm start          # Start production server
npm run dev        # Start development server with hot reload
npm test           # Run test suite
npm run test:watch # Run tests in watch mode
npm run test:coverage # Run tests with coverage
npm run lint       # Run code linting
```

### Database Management
```bash
# Create database schema
psql -h localhost -U postgres -d iot_parking -f scripts/database/schema.sql

# Seed sample data
psql -h localhost -U postgres -d iot_parking -f scripts/database/seed.sql

# Reset database
psql -h localhost -U postgres -d iot_parking -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
psql -h localhost -U postgres -d iot_parking -f scripts/database/schema.sql
psql -h localhost -U postgres -d iot_parking -f scripts/database/seed.sql
```

## API Documentation

### Base URL
```
http://localhost:3000/api
```

### Key Endpoints
- `GET /api/parking/status` - Get all parking slot statuses
- `POST /api/parking` - Update parking slot status
- `POST /api/login` - User authentication
- `POST /api/admin/controll` - Admin slot control
- `GET /api/events` - Real-time status updates (SSE)

See [API Documentation](docs/api/endpoints.md) for complete API reference.

## Default Credentials
- Username: `admin`
- Password: `admin123`

Security Note: Change the default password in production!

## Testing
```bash
# Run all tests
npm test

# Run specific test file
npm test -- tests/unit/parkingService.test.js

# Run tests with coverage
npm run test:coverage
```

## Technologies Used
- Backend: Node.js, Express.js
- Database: PostgreSQL
- Frontend: HTML5, CSS3, JavaScript (ES6+)
- Real-time: Server-Sent Events
- Authentication: Session-based with bcrypt
- Testing: Jest
- Architecture: Layered Architecture Pattern

## Configuration

### Environment Variables
Copy `.env.example` to `.env` and configure:

```env
DATABASE_URL=postgresql://username:password@localhost:5432/iot_parking
PORT=3000
NODE_ENV=development
SESSION_SECRET=your-secret-key
JWT_SECRET=your-jwt-secret-here
```

### Database Schema
The system uses 4 main tables:
- `parking_status` - Current slot statuses
- `parking_logs` - Parking history
- `users` - User authentication
- `power` - Power consumption data

## Deployment

### Development
```bash
npm start
```

### Production
See [Deployment Guide](docs/deployment/setup.md) for production deployment instructions.

## Monitoring & Logging

- Error handling with centralized error middleware
- Request logging with custom middleware
- Database connection monitoring

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request