# Health Check API Documentation

## Overview
The IoT Parking System provides comprehensive health check endpoints for monitoring server status, database connectivity, and application readiness.

## Base URL
```
http://localhost:3000/api
```

## Health Check Endpoints

### 1. Basic Health Check
**Endpoint:** `GET /api/health` or `GET /api/healthz`

**Purpose:** Simple health check for load balancers and monitoring systems

**Response:**
```http
HTTP/1.1 200 OK
Content-Type: text/plain

HEALTHY
```

**Error Response:**
```http
HTTP/1.1 503 Service Unavailable
Content-Type: text/plain

UNHEALTHY
```

### 2. Server Health Check
**Endpoint:** `GET /api/health/server`

**Purpose:** Detailed server status including memory, uptime, and system information

**Response:**
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "timestamp": "2026-04-03T12:00:00.000Z",
    "uptime": {
      "seconds": 3600,
      "human": "1h 0m 0s"
    },
    "memory": {
      "rss": "50.25 MB",
      "heapTotal": "25.12 MB",
      "heapUsed": "18.75 MB",
      "external": "2.34 MB"
    },
    "version": "v18.19.0",
    "platform": "win32",
    "environment": "development"
  }
}
```

### 3. Database Health Check
**Endpoint:** `GET /api/health/database`

**Purpose:** Database connectivity and information

**Response:**
```json
{
  "success": true,
  "data": {
    "connection": {
      "status": "connected",
      "timestamp": "2026-04-03T12:00:00.000Z",
      "database": "PostgreSQL"
    },
    "info": {
      "version": "PostgreSQL 14.6",
      "database": "iot_parking",
      "user": "postgres",
      "total_tables": 4
    },
    "tables": {
      "parking_status": true,
      "parking_logs": true,
      "users": true,
      "power": true
    },
    "timestamp": "2026-04-03T12:00:00.000Z"
  }
}
```

### 4. Full Health Check
**Endpoint:** `GET /api/health/full`

**Purpose:** Comprehensive health check including all components

**Response:**
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "timestamp": "2026-04-03T12:00:00.000Z",
    "server": {
      "status": "healthy",
      "uptime": { "seconds": 3600, "human": "1h 0m 0s" },
      "memory": { "rss": "50.25 MB", "heapTotal": "25.12 MB", "heapUsed": "18.75 MB" },
      "version": "v18.19.0",
      "environment": "development"
    },
    "database": {
      "connection": { "status": "connected", "database": "PostgreSQL" },
      "tables": { "parking_status": true, "parking_logs": true, "users": true, "power": true }
    },
    "checks": {
      "server": true,
      "database": true,
      "tables": true
    }
  }
}
```

### 5. Readiness Check (Kubernetes)
**Endpoint:** `GET /api/ready`

**Purpose:** Check if application is ready to serve traffic

**Response:**
```json
{
  "ready": true,
  "timestamp": "2026-04-03T12:00:00.000Z",
  "checks": {
    "database": true,
    "tables": true
  }
}
```

### 6. Liveness Check (Kubernetes)
**Endpoint:** `GET /api/live`

**Purpose:** Check if application is alive (basic server status)

**Response:**
```json
{
  "alive": true,
  "timestamp": "2026-04-03T12:00:00.000Z",
  "uptime": { "seconds": 3600, "human": "1h 0m 0s" }
}
```

## HTTP Status Codes

| Status | Meaning | Usage |
|--------|---------|-------|
| 200 | OK | All health checks pass |
| 503 | Service Unavailable | Health checks fail |
| 500 | Internal Server Error | Error during health check |

## Error Responses

All endpoints return consistent error format:

```json
{
  "success": false,
  "error": "Connection timeout",
  "timestamp": "2026-04-03T12:00:00.000Z"
}
```

## Usage Examples

### Basic Health Check
```bash
curl http://localhost:3000/api/health
```

### Full Health Check
```bash
curl http://localhost:3000/api/health/full
```

### Database Status Only
```bash
curl http://localhost:3000/api/health/database
```

## Monitoring Integration

### Load Balancer Configuration
Use `/api/health` or `/api/healthz` for simple health checks:
- Returns plain text `HEALTHY` or `UNHEALTHY`
- Fast response time
- Suitable for frequent polling

### Kubernetes Configuration
```yaml
livenessProbe:
  httpGet:
    path: /api/live
    port: 3000
  initialDelaySeconds: 30
  periodSeconds: 10

readinessProbe:
  httpGet:
    path: /api/ready
    port: 3000
  initialDelaySeconds: 5
  periodSeconds: 5
```

### Monitoring Systems
Use `/api/health/full` for detailed monitoring:
- Comprehensive system information
- Database connectivity status
- Memory and performance metrics
- JSON format for easy parsing

## Security Considerations

- Health check endpoints do not require authentication
- They expose limited system information
- Suitable for internal monitoring only
- Consider restricting access in production

## Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Check database credentials in `.env`
   - Verify PostgreSQL is running
   - Check network connectivity

2. **Missing Tables**
   - Run database schema: `psql -d iot_parking -f scripts/database/schema.sql`
   - Verify table creation succeeded

3. **Memory Issues**
   - Monitor memory usage in `/api/health/server`
   - Check for memory leaks in application

### Debug Commands

```bash
# Check all health endpoints
curl http://localhost:3000/api/health/full

# Test database connection only
curl http://localhost:3000/api/health/database

# Check server status
curl http://localhost:3000/api/health/server
```
