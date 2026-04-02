import ParkingService from '../services/parkingService.js';
import { asyncHandler } from '../utils/errorHandler.js';

class ParkingController {
  constructor() {
    this.parkingService = new ParkingService();
  }

  updateParkingStatus = asyncHandler(async (req, res) => {
    const { slot, status } = req.body;
    const result = await this.parkingService.updateParkingStatus(slot, status);
    res.status(201).json(result);
  });

  getParkingStatus = asyncHandler(async (req, res) => {
    const statuses = await this.parkingService.getAllSlotStatuses();
    res.json(statuses);
  });

  getClientStatuses = asyncHandler(async (req, res) => {
    const statuses = await this.parkingService.getClientStatuses();
    res.json(statuses);
  });

  getParkingLogs = asyncHandler(async (req, res) => {
    const logs = await this.parkingService.getAllParkingLogs();
    res.json(logs);
  });

  getDashboardData = asyncHandler(async (req, res) => {
    const { type, year, month } = req.query;
    const data = await this.parkingService.getDashboardData(type, year, month);
    res.json(data);
  });

  getChartData = asyncHandler(async (req, res) => {
    const { year, month } = req.query;
    const data = await this.parkingService.getChartData(year, month);
    res.json(data);
  });
}

export default new ParkingController();
