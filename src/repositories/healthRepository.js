import { BaseRepository } from './baseRepository.js';
import { SQL_QUERIES } from '../utils/constants.js';

export class HealthRepository extends BaseRepository {
  async checkDatabaseConnection() {
    try {
      const result = await this.findOne(SQL_QUERIES.CHECK_CONNECTION);
      return { 
        status: 'connected',
        timestamp: new Date().toISOString(),
        database: 'PostgreSQL'
      };
    } catch (error) {
      return { 
        status: 'disconnected',
        timestamp: new Date().toISOString(),
        error: error.message,
        database: 'PostgreSQL'
      };
    }
  }

  async getDatabaseInfo() {
    try {
      const version = await this.findOne(SQL_QUERIES.GET_DB_VERSION);
      const database = await this.findOne(SQL_QUERIES.GET_CURRENT_DB);
      const user = await this.findOne(SQL_QUERIES.GET_CURRENT_USER);
      const totalTables = await this.findOne(SQL_QUERIES.COUNT_TABLES);

      return {
        version: version.version,
        database: database.database,
        user: user.user,
        total_tables: parseInt(totalTables.total_tables)
      };
    } catch (error) {
      return { error: error.message };
    }
  }

  async checkTables() {
    try {
      const requiredTables = ['parking_status', 'parking_logs', 'users', 'power'];
      const tableStatus = {};

      for (const table of requiredTables) {
        const result = await this.findOne(SQL_QUERIES.CHECK_TABLE_EXISTS, [table]);
        tableStatus[table] = result.exists;
      }

      return tableStatus;
    } catch (error) {
      return { error: error.message };
    }
  }
}

export default HealthRepository;
