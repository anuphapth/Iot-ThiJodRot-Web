import { HealthService } from '../services/healthService.js';

export class HealthController {
  constructor() {
    this.healthService = new HealthService();
  }

  async getServerHealth(req, res) {
    try {
      const health = await this.healthService.getServerHealth();
      res.json({
        success: true,
        data: health
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  async getDatabaseHealth(req, res) {
    try {
      const health = await this.healthService.getDatabaseHealth();
      res.json({
        success: true,
        data: health
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  async getFullHealthCheck(req, res) {
    try {
      const health = await this.healthService.getFullHealthCheck();
      
      // Set HTTP status based on overall health
      const statusCode = health.status === 'healthy' ? 200 : 503;
      
      res.status(statusCode).json({
        success: health.status === 'healthy',
        data: health
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  async getHealthCheck(req, res) {
    try {
      // Simple health check for load balancers
      const health = await this.healthService.getFullHealthCheck();
      
      res.status(health.status === 'healthy' ? 200 : 503)
         .set('Content-Type', 'text/plain')
         .send(health.status.toUpperCase());
    } catch (error) {
      res.status(503)
         .set('Content-Type', 'text/plain')
         .send('UNHEALTHY');
    }
  }

  async getReadinessCheck(req, res) {
    try {
      // Check if application is ready to serve traffic
      const database = await this.healthService.getDatabaseHealth();
      const ready = database.connection.status === 'connected' && 
                   this.healthService.checkAllTablesExist(database.tables);
      
      res.status(ready ? 200 : 503).json({
        ready,
        timestamp: new Date().toISOString(),
        checks: {
          database: database.connection.status === 'connected',
          tables: this.healthService.checkAllTablesExist(database.tables)
        }
      });
    } catch (error) {
      res.status(503).json({
        ready: false,
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  async getLivenessCheck(req, res) {
    try {
      // Check if application is alive (basic server status)
      const server = await this.healthService.getServerHealth();
      const alive = server.status === 'healthy';
      
      res.status(alive ? 200 : 503).json({
        alive,
        timestamp: new Date().toISOString(),
        uptime: server.uptime
      });
    } catch (error) {
      res.status(503).json({
        alive: false,
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }
}

export default HealthController;
