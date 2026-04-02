import AdminService from '../services/adminService.js';
import PowerService from '../services/powerService.js';
import { asyncHandler } from '../utils/errorHandler.js';

class AdminController {
  constructor() {
    this.adminService = new AdminService();
    this.powerService = new PowerService();
  }

  controlParkingSlot = asyncHandler(async (req, res) => {
    const { slot, status } = req.body;
    const result = await this.adminService.controlParkingSlot(slot, status);
    res.status(200).json(result);
  });

  getParkingData = asyncHandler(async (req, res) => {
    const { type, year, month } = req.query;
    const adminService = this.adminService;
    
    // Reuse parking service for dashboard data
    const { default: ParkingService } = await import('../services/parkingService.js');
    const parkingService = new ParkingService();
    
    const data = await parkingService.getDashboardData(type, year, month);
    res.json(data);
  });

  getChart = asyncHandler(async (req, res) => {
    const { year, month } = req.query;
    
    // Reuse parking service for chart data
    const { default: ParkingService } = await import('../services/parkingService.js');
    const parkingService = new ParkingService();
    
    const data = await parkingService.getChartData(year, month);
    res.json(data);
  });

  addPowerReading = asyncHandler(async (req, res) => {
    const { power } = req.body;
    const result = await this.powerService.addPowerReading(power);
    res.status(200).json(result);
  });

  getPowerStats = asyncHandler(async (req, res) => {
    const stats = await this.powerService.getPowerStats();
    res.json(stats);
  });

  getSlotStatus = asyncHandler(async (req, res) => {
    const { slot } = req.params;
    const status = await this.adminService.getSlotStatus(slot);
    res.json(status);
  });

  getAllSlotStatuses = asyncHandler(async (req, res) => {
    const statuses = await this.adminService.getAllSlotStatuses();
    res.json(statuses);
  });

  forceUpdateSlotStatus = asyncHandler(async (req, res) => {
    const { slot, status } = req.body;
    const result = await this.adminService.forceUpdateSlotStatus(slot, status);
    res.json(result);
  });

  resetAllSlots = asyncHandler(async (req, res) => {
    const result = await this.adminService.resetAllSlots();
    res.json(result);
  });
}

export default new AdminController();
