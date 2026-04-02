import ParkingRepository from '../repositories/parkingRepository.js';
import { ParkingSlot, ParkingLog } from '../models/index.js';
import { ConflictError, NotFoundError, ValidationError } from '../utils/errorHandler.js';
import { validateParkingData } from '../utils/validator.js';
import { VALID_SLOTS, PARKING_STATUS } from '../utils/constants.js';
import { notifyClients } from '../controllers/sseController.js';

export class ParkingService {
  constructor() {
    this.parkingRepository = new ParkingRepository();
  }

  async updateParkingStatus(slot, status) {
    const validatedData = validateParkingData(slot, status);
    
    // Get current slot status
    const currentSlot = await this.parkingRepository.getSlotStatus(validatedData.slot);
    if (!currentSlot) {
      throw new NotFoundError(`ไม่พบข้อมูลของ slot ${validatedData.slot}`);
    }

    // Handle different status updates
    if (validatedData.status === PARKING_STATUS.OCCUPIED) {
      return await this.handleCarArrival(validatedData.slot, currentSlot);
    } else if (validatedData.status === PARKING_STATUS.VACANT) {
      return await this.handleCarDeparture(validatedData.slot, currentSlot);
    } else {
      throw new ValidationError('Invalid status for parking operation');
    }
  }

  async handleCarArrival(slot, currentSlot) {
    // Check if slot is under maintenance
    if (currentSlot.status === PARKING_STATUS.MAINTENANCE) {
      throw new ConflictError('ช่องจอดอยู่ระหว่างการซ่อมบำรุง');
    }

    // Check if slot is already occupied
    if (currentSlot.status === PARKING_STATUS.OCCUPIED) {
      throw new ConflictError(`Slot ${slot} still have car`);
    }

    // Create parking log and update status in transaction
    const result = await this.parkingRepository.transaction(async (client) => {
      // Create parking log
      const log = await this.parkingRepository.createParkingLog(slot, new Date());
      
      // Update slot status
      const updatedSlot = await this.parkingRepository.updateSlotStatus(slot, PARKING_STATUS.OCCUPIED);
      
      return { log, updatedSlot };
    });

    // Notify clients of status change
    await notifyClients();

    return {
      message: `Get car come on slot ${slot}`,
      data: result.updatedSlot.toJSON()
    };
  }

  async handleCarDeparture(slot, currentSlot) {
    // Check if slot is already vacant
    if (currentSlot.status === PARKING_STATUS.VACANT) {
      throw new ConflictError(`There are no cars parked here slot ${slot}`);
    }

    // Update parking log and slot status in transaction
    const result = await this.parkingRepository.transaction(async (client) => {
      // Update parking log with departure time
      const log = await this.parkingRepository.updateParkingLog(slot, new Date());
      
      // Update slot status
      const updatedSlot = await this.parkingRepository.updateSlotStatus(slot, PARKING_STATUS.VACANT);
      
      return { log, updatedSlot };
    });

    // Notify clients of status change
    await notifyClients();

    return {
      message: `Get car out on slot ${slot}`,
      data: result.updatedSlot.toJSON()
    };
  }

  async getAllSlotStatuses() {
    const slots = await this.parkingRepository.getAllSlotStatuses();
    return slots.map(slot => slot.toJSON());
  }

  async getClientStatuses() {
    const statuses = await this.parkingRepository.getClientStatuses();
    return statuses;
  }

  async getAllParkingLogs() {
    const logs = await this.parkingRepository.getAllParkingLogs();
    return logs.map(log => log.toJSON());
  }

  async getDashboardData(type, year, month) {
    let startDate, endDate, labelFormat;

    if (type === 'year') {
      startDate = `${year}-01-01`;
      endDate = `${parseInt(year) + 1}-01-01`;
      labelFormat = 'YYYY-MM';
    } else if (type === 'month') {
      const yearInt = parseInt(year);
      const monthInt = parseInt(month);
      const startDateObj = new Date(yearInt, monthInt - 1, 1);
      const endDateObj = new Date(yearInt, monthInt, 1);
      startDate = startDateObj.toISOString().split('T')[0];
      endDate = endDateObj.toISOString().split('T')[0];
      labelFormat = 'YYYY-MM-DD';
    } else {
      throw new ValidationError('Invalid type parameter');
    }

    const data = await this.parkingRepository.getDashboardData(startDate, endDate, labelFormat);
    return data;
  }

  async getChartData(year, month) {
    let startDate, endDate;

    if (year) {
      startDate = `${year}-01-01`;
      endDate = `${parseInt(year) + 1}-01-01`;
    }

    if (month) {
      const yearInt = parseInt(year || new Date().getFullYear());
      const monthInt = parseInt(month);
      const startDateObj = new Date(yearInt, monthInt - 1, 1);
      const endDateObj = new Date(yearInt, monthInt, 1);
      startDate = startDate || startDateObj.toISOString().split('T')[0];
      endDate = endDateObj.toISOString().split('T')[0];
    }

    const logs = await this.parkingRepository.getChartData(startDate, endDate);
    return logs.map(log => log.toJSON());
  }

  async validateSlotExists(slot) {
    if (!VALID_SLOTS.includes(slot)) {
      throw new ValidationError('Slot must be 1 or 2');
    }

    const slotStatus = await this.parkingRepository.getSlotStatus(slot);
    if (!slotStatus) {
      throw new NotFoundError(`ไม่พบ slot นี้ในระบบ`);
    }

    return slotStatus;
  }
}

export default ParkingService;
