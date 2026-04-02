import ParkingRepository from '../repositories/parkingRepository.js';
import { ConflictError, NotFoundError, ValidationError } from '../utils/errorHandler.js';
import { validateParkingData } from '../utils/validator.js';
import { PARKING_STATUS } from '../utils/constants.js';
import { notifyClients } from '../controllers/sseController.js';

export class AdminService {
  constructor() {
    this.parkingRepository = new ParkingRepository();
  }

  async controlParkingSlot(slot, status) {
    const validatedData = validateParkingData(slot, status);
    
    // Only allow status 0 (Ready) or 2 (Maintenance) for admin control
    if (![PARKING_STATUS.VACANT, PARKING_STATUS.MAINTENANCE].includes(validatedData.status)) {
      throw new ValidationError('Admin can only set status to 0 (Ready) or 2 (Maintenance)');
    }

    // Get current slot status
    const currentSlot = await this.parkingRepository.getSlotStatus(validatedData.slot);
    if (!currentSlot) {
      throw new NotFoundError(`ไม่พบข้อมูลของ slot ${validatedData.slot}`);
    }

    // Handle maintenance mode
    if (validatedData.status === PARKING_STATUS.MAINTENANCE) {
      return await this.handleMaintenanceMode(validatedData.slot, currentSlot);
    }
    
    // Handle ready mode
    if (validatedData.status === PARKING_STATUS.VACANT) {
      return await this.handleReadyMode(validatedData.slot, currentSlot);
    }
  }

  async handleMaintenanceMode(slot, currentSlot) {
    // Check if already in maintenance
    if (currentSlot.status === PARKING_STATUS.MAINTENANCE) {
      throw new ConflictError('status already 2');
    }

    // If slot is occupied, remove the car first
    if (currentSlot.status === PARKING_STATUS.OCCUPIED) {
      await this.parkingRepository.updateParkingLog(slot, new Date());
    }

    // Update slot status to maintenance
    const updatedSlot = await this.parkingRepository.updateSlotStatus(slot, PARKING_STATUS.MAINTENANCE);
    
    // Notify clients of status change
    await notifyClients();

    return {
      message: 'Fixble',
      data: updatedSlot.toJSON()
    };
  }

  async handleReadyMode(slot, currentSlot) {
    // Check if already ready
    if (currentSlot.status === PARKING_STATUS.VACANT) {
      throw new ConflictError('status already 0');
    }

    // Update slot status to ready
    const updatedSlot = await this.parkingRepository.updateSlotStatus(slot, PARKING_STATUS.VACANT);
    
    // Notify clients of status change
    await notifyClients();

    return {
      message: 'Ready',
      data: updatedSlot.toJSON()
    };
  }

  async getSlotStatus(slot) {
    const validatedSlot = validateParkingData(slot, 0).slot; // Just validate slot
    
    const slotStatus = await this.parkingRepository.getSlotStatus(validatedSlot);
    if (!slotStatus) {
      throw new NotFoundError(`ไม่พบข้อมูลของ slot ${validatedSlot}`);
    }

    return slotStatus.toJSON();
  }

  async getAllSlotStatuses() {
    const slots = await this.parkingRepository.getAllSlotStatuses();
    return slots.map(slot => slot.toJSON());
  }

  async forceUpdateSlotStatus(slot, status) {
    const validatedData = validateParkingData(slot, status);
    
    // Force update without business logic checks (for emergency/admin override)
    const updatedSlot = await this.parkingRepository.updateSlotStatus(validatedData.slot, validatedData.status);
    
    // Notify clients of status change
    await notifyClients();

    return {
      message: 'Status updated successfully',
      data: updatedSlot.toJSON()
    };
  }

  async resetAllSlots() {
    // Reset all slots to vacant status
    const slots = await this.parkingRepository.getAllSlotStatuses();
    const results = [];

    for (const slot of slots) {
      try {
        // If slot is occupied, close the parking log first
        if (slot.status === PARKING_STATUS.OCCUPIED) {
          await this.parkingRepository.updateParkingLog(slot.slot, new Date());
        }
        
        // Reset to vacant
        const updatedSlot = await this.parkingRepository.updateSlotStatus(slot.slot, PARKING_STATUS.VACANT);
        results.push(updatedSlot.toJSON());
      } catch (error) {
        console.error(`Failed to reset slot ${slot.slot}:`, error);
      }
    }

    // Notify clients of all changes
    await notifyClients();

    return {
      message: 'All slots reset to vacant',
      data: results
    };
  }
}

export default AdminService;
