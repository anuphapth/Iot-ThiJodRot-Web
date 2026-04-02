import PowerRepository from '../repositories/powerRepository.js';
import { PowerData } from '../models/PowerData.js';
import { ValidationError } from '../utils/errorHandler.js';
import { validatePowerData } from '../utils/validator.js';

export class PowerService {
  constructor() {
    this.powerRepository = new PowerRepository();
  }

  async addPowerReading(power) {
    const validatedPower = validatePowerData(power);
    
    const powerReading = await this.powerRepository.createPowerReading(
      validatedPower, 
      new Date()
    );

    return {
      message: 'Power reading added successfully',
      data: powerReading.toJSON()
    };
  }

  async getLatestPowerReading() {
    const latestReading = await this.powerRepository.getLatestPowerReading();
    
    if (!latestReading) {
      return {
        latestUse: 0,
        message: 'No power readings available'
      };
    }

    return {
      latestUse: latestReading.use * 5, // Apply conversion factor
      timestamp: latestReading.createdAt
    };
  }

  async getAveragePower() {
    const averagePower = await this.powerRepository.getAveragePower();
    
    return {
      averageUse: averagePower * 5, // Apply conversion factor
      message: 'Average power calculated successfully'
    };
  }

  async getPowerStats() {
    const latestReading = await this.powerRepository.getLatestPowerReading();
    const averagePower = await this.powerRepository.getAveragePower();

    const latestUse = latestReading ? latestReading.use * 5 : 0;
    const averageUse = averagePower * 5;

    return {
      latestUse,
      averageUse,
      message: 'Power statistics retrieved successfully'
    };
  }

  async getPowerHistory(limit = 100) {
    const readings = await this.powerRepository.getAllPowerReadings(limit);
    
    return {
      data: readings.map(reading => ({
        ...reading.toJSON(),
        use: reading.use * 5 // Apply conversion factor
      })),
      message: 'Power history retrieved successfully'
    };
  }

  async getPowerHistoryByDateRange(startDate, endDate) {
    const readings = await this.powerRepository.getPowerReadingsByDateRange(startDate, endDate);
    
    return {
      data: readings.map(reading => ({
        ...reading.toJSON(),
        use: reading.use * 5 // Apply conversion factor
      })),
      message: 'Power history by date range retrieved successfully'
    };
  }

  async getPowerAnalytics(startDate, endDate) {
    const stats = await this.powerRepository.getPowerStats(startDate, endDate);
    
    if (!stats) {
      return {
        totalReadings: 0,
        averagePower: 0,
        minPower: 0,
        maxPower: 0,
        message: 'No power data available for the specified period'
      };
    }

    return {
      totalReadings: parseInt(stats.total_readings),
      averagePower: parseFloat(stats.average_power) * 5,
      minPower: parseFloat(stats.min_power) * 5,
      maxPower: parseFloat(stats.max_power) * 5,
      message: 'Power analytics retrieved successfully'
    };
  }

  async cleanupOldReadings(daysOld = 30) {
    const deletedCount = await this.powerRepository.deleteOldReadings(daysOld);
    
    return {
      deletedCount,
      message: `Cleaned up ${deletedCount} old power readings`
    };
  }

  async generatePowerReport(startDate, endDate) {
    const [analytics, history] = await Promise.all([
      this.getPowerAnalytics(startDate, endDate),
      this.getPowerHistoryByDateRange(startDate, endDate)
    ]);

    return {
      period: { startDate, endDate },
      analytics,
      history: history.data,
      message: 'Power report generated successfully'
    };
  }

  validatePowerReading(power) {
    try {
      return validatePowerData(power);
    } catch (error) {
      throw new ValidationError(`Invalid power reading: ${error.message}`);
    }
  }

  async addMultiplePowerReadings(readings) {
    const results = [];
    const errors = [];

    for (const reading of readings) {
      try {
        const result = await this.addPowerReading(reading.power || reading);
        results.push(result);
      } catch (error) {
        errors.push({
          reading,
          error: error.message
        });
      }
    }

    return {
      successful: results,
      failed: errors,
      message: `Processed ${results.length} readings successfully, ${errors.length} failed`
    };
  }
}

export default PowerService;
