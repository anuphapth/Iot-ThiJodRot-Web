# IoT Parking System API Documentation

## Overview
The IoT Parking System provides RESTful APIs for managing parking slots, user authentication, and power monitoring.

## Base URL
```
http://localhost:3000/api
```

## Authentication
Currently uses session-based authentication. Login required for admin endpoints.

## Endpoints

### Parking Management

#### Get All Parking Status
```http
GET /api/parking/status
```

**Response:**
```json
[
  {
    "id": 1,
    "slot": 1,
    "status": 0,
    "statusText": "ว่าง",
    "statusClass": "vacant"
  }
]
```

#### Update Parking Status
```http
POST /api/parking
```

**Body:**
```json
{
  "slot": 1,
  "status": 1
}
```

**Response:**
```json
{
  "message": "Get car come on slot 1",
  "data": {
    "id": 1,
    "slot": 1,
    "status": 1,
    "statusText": "ไม่ว่าง",
    "statusClass": "occupied"
  }
}
```

#### Get Parking Logs
```http
GET /api/parking/log
```

#### Get Dashboard Data
```http
GET /api/admin/parking-data?type=month&year=2026&month=1
```

### Admin Management

#### Control Parking Slot
```http
POST /api/admin/controll
```

**Body:**
```json
{
  "slot": 1,
  "status": 2
}
```

#### Add Power Reading
```http
POST /api/admin/up/power
```

**Body:**
```json
{
  "power": 10.5
}
```

#### Get Power Statistics
```http
GET /api/admin/getdata/power
```

**Response:**
```json
{
  "latestUse": 52.5,
  "averageUse": 48.2,
  "message": "Power statistics retrieved successfully"
}
```

### User Authentication

#### Login
```http
POST /api/login
```

**Body:**
```json
{
  "username": "admin",
  "password": "admin123"
}
```

#### Logout
```http
POST /api/logout
```

### Real-time Events

#### Server-Sent Events
```http
GET /api/events
```

**Response:** Stream of parking status updates

## Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `404` - Not Found
- `409` - Conflict
- `500` - Internal Server Error

## Error Response Format
```json
{
  "error": "Error message description"
}
```

## Data Models

### ParkingSlot
- `id`: Integer (Primary Key)
- `slot`: Integer (1 or 2)
- `status`: Integer (0=ว่าง, 1=ไม่ว่าง, 2=ซ่อมบำรุง)

### ParkingLog
- `id`: Integer (Primary Key)
- `slot`: Integer
- `timeIn`: DateTime
- `timeOut`: DateTime (nullable)

### User
- `id`: Integer (Primary Key)
- `username`: String
- `createdAt`: DateTime

### PowerData
- `id`: Integer (Primary Key)
- `use`: Decimal
- `createdAt`: DateTime
