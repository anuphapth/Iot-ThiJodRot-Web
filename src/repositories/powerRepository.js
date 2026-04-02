import { BaseRepository } from './baseRepository.js';
import { SQL_QUERIES } from '../utils/constants.js';
import { PowerData } from '../models/PowerData.js';

export class PowerRepository extends BaseRepository {
  async createPowerReading(power, createdAt) {
    const result = await this.query(SQL_QUERIES.INSERT_POWER, [power, createdAt]);
    return new PowerData(result.rows[0]);
  }

  async getLatestPowerReading() {
    const result = await this.findOne(SQL_QUERIES.GET_LAST_POWER);
    return result ? new PowerData({ use: result.use, createdAt: new Date() }) : null;
  }

  async getAveragePower() {
    const result = await this.findOne(SQL_QUERIES.GET_AVG_POWER);
    return result ? parseFloat(result.average) : 0;
  }

  async getAllPowerReadings(limit = 100) {
    const results = await this.findMany(SQL_QUERIES.GET_ALL_POWER, [limit]);
    return results.map(row => new PowerData(row));
  }

  async getPowerReadingsByDateRange(startDate, endDate) {
    const results = await this.findMany(SQL_QUERIES.GET_POWER_BY_DATE_RANGE, [startDate, endDate]);
    return results.map(row => new PowerData(row));
  }

  async getPowerStats(startDate, endDate) {
    const result = await this.findOne(SQL_QUERIES.GET_POWER_STATS, [startDate, endDate]);
    return result;
  }

  async deleteOldReadings(daysOld = 30) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);
    
    const result = await this.query(SQL_QUERIES.DELETE_OLD_POWER, [cutoffDate]);
    return result.rows.length;
  }
}

export default PowerRepository;
