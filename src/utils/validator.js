import { ValidationError } from './errorHandler.js';

export const validateParkingSlot = (slot) => {
  const slotNum = Number(slot);
  
  if (isNaN(slotNum)) {
    throw new ValidationError('Slot must be a number', 'slot');
  }
  
  if (![1, 2].includes(slotNum)) {
    throw new ValidationError('Slot must be 1 or 2', 'slot');
  }
  
  return slotNum;
};

export const validateParkingStatus = (status) => {
  const statusNum = Number(status);
  
  if (isNaN(statusNum)) {
    throw new ValidationError('Status must be a number', 'status');
  }
  
  if (![0, 1, 2].includes(statusNum)) {
    throw new ValidationError('Status must be 0 (ว่าง), 1 (ไม่ว่าง), or 2 (ซ่อมบำรุง)', 'status');
  }
  
  return statusNum;
};

export const validateParkingData = (slot, status) => {
  const validatedSlot = validateParkingSlot(slot);
  const validatedStatus = validateParkingStatus(status);
  
  return { slot: validatedSlot, status: validatedStatus };
};

export const validateUserCredentials = (username, password) => {
  if (!username || username.trim().length === 0) {
    throw new ValidationError('Username is required', 'username');
  }
  
  if (username.length < 3 || username.length > 50) {
    throw new ValidationError('Username must be between 3 and 50 characters', 'username');
  }
  
  if (!password || password.trim().length === 0) {
    throw new ValidationError('Password is required', 'password');
  }
  
  if (password.length < 6) {
    throw new ValidationError('Password must be at least 6 characters', 'password');
  }
  
  return { username: username.trim(), password };
};

export const validatePowerData = (power) => {
  const powerNum = Number(power);
  
  if (isNaN(powerNum)) {
    throw new ValidationError('Power must be a number', 'power');
  }
  
  if (powerNum < 0) {
    throw new ValidationError('Power cannot be negative', 'power');
  }
  
  return powerNum;
};

export const validateDateRange = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  if (isNaN(start.getTime())) {
    throw new ValidationError('Invalid start date', 'startDate');
  }
  
  if (isNaN(end.getTime())) {
    throw new ValidationError('Invalid end date', 'endDate');
  }
  
  if (start >= end) {
    throw new ValidationError('Start date must be before end date', 'dateRange');
  }
  
  return { start, end };
};

export default {
  validateParkingSlot,
  validateParkingStatus,
  validateParkingData,
  validateUserCredentials,
  validatePowerData,
  validateDateRange
};
