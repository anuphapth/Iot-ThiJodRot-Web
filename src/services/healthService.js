import { HealthRepository } from '../repositories/healthRepository.js';

export class HealthService {
  constructor() {
    this.healthRepository = new HealthRepository();
  }

  async getServerHealth() {
    const uptime = process.uptime();
    const memory = process.memoryUsage();
    
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: {
        seconds: uptime,
        human: this.formatUptime(uptime)
      },
      memory: {
        rss: this.formatBytes(memory.rss),
        heapTotal: this.formatBytes(memory.heapTotal),
        heapUsed: this.formatBytes(memory.heapUsed),
        external: this.formatBytes(memory.external)
      },
      version: process.version,
      platform: process.platform,
      environment: process.env.NODE_ENV || 'development'
    };
  }

  async getDatabaseHealth() {
    const connection = await this.healthRepository.checkDatabaseConnection();
    const info = await this.healthRepository.getDatabaseInfo();
    const tables = await this.healthRepository.checkTables();

    return {
      connection,
      info,
      tables,
      timestamp: new Date().toISOString()
    };
  }

  async getFullHealthCheck() {
    const server = await this.getServerHealth();
    const database = await this.getDatabaseHealth();
    
    const overallStatus = server.status === 'healthy' && database.connection.status === 'connected' 
      ? 'healthy' 
      : 'unhealthy';

    return {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      server,
      database,
      checks: {
        server: server.status === 'healthy',
        database: database.connection.status === 'connected',
        tables: this.checkAllTablesExist(database.tables)
      }
    };
  }

  formatUptime(seconds) {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (days > 0) {
      return `${days}d ${hours}h ${minutes}m ${secs}s`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  }

  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  checkAllTablesExist(tables) {
    if (!tables || tables.error) return false;
    return Object.values(tables).every(exists => exists === true);
  }
}

export default HealthService;
