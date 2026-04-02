import { BaseRepository } from './baseRepository.js';
import { SQL_QUERIES } from '../utils/constants.js';
import { ParkingSlot } from '../models/ParkingSlot.js';
import { ParkingLog } from '../models/ParkingLog.js';

export class ParkingRepository extends BaseRepository {
  async getSlotStatus(slot) {
    const result = await this.findOne(SQL_QUERIES.GET_STATUS_CAR, [slot]);
    return result ? new ParkingSlot({ slot, status: result.status }) : null;
  }

  async getAllSlotStatuses() {
    const results = await this.findMany(SQL_QUERIES.GET_STATUS);
    return results.map(row => new ParkingSlot(row));
  }

  async updateSlotStatus(slot, status) {
    await this.query(SQL_QUERIES.CHANGE_STATUS, [status, slot]);
    return await this.getSlotStatus(slot);
  }

  async createParkingLog(slot, timeIn) {
    const result = await this.create('parking_logs', { slot, time_in: timeIn });
    return new ParkingLog(result);
  }

  async updateParkingLog(slot, timeOut) {
    const result = await this.query(SQL_QUERIES.CAR_AWAY, [timeOut, slot]);
    return result.rows[0] ? new ParkingLog(result.rows[0]) : null;
  }

  async getAllParkingLogs() {
    const results = await this.findMany(SQL_QUERIES.GET_ALL_LOG);
    return results.map(row => new ParkingLog(row));
  }

  async getClientStatuses() {
    const results = await this.findMany(SQL_QUERIES.GET_CLIENT_STATUS);
    return results.map(row => ({
      slot: row.slot,
      status: row.status,
      timeIn: row.time_in,
      timeOut: row.time_out
    }));
  }

  async getActiveParkingLog(slot) {
    const result = await this.findOne(SQL_QUERIES.GET_ACTIVE_LOG, [slot]);
    return result ? new ParkingLog(result) : null;
  }

  async getParkingLogsByDateRange(startDate, endDate) {
    const results = await this.findMany(SQL_QUERIES.GET_LOGS_BY_DATE_RANGE, [startDate, endDate]);
    return results.map(row => new ParkingLog(row));
  }

  async getChartData(startDate, endDate) {
    const results = await this.findMany(SQL_QUERIES.GET_CHART_DATA, [startDate, endDate]);
    return results.map(row => new ParkingLog(row));
  }

  async getDashboardData(startDate, endDate, labelFormat) {
    const results = await this.query(SQL_QUERIES.GET_DATE, [labelFormat, startDate, endDate]);
    return results.rows;
  }
}

export default ParkingRepository;
