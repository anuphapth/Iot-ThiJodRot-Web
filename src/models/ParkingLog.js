export class ParkingLog {
  constructor(data = {}) {
    this.id = data.id;
    this.slot = data.slot;
    this.timeIn = data.time_in || data.timeIn;
    this.timeOut = data.time_out || data.timeOut;
  }

  static isValidSlot(slot) {
    return [1, 2].includes(slot);
  }

  static isValidStatus(status) {
    return [0, 1].includes(status);
  }

  getDuration() {
    if (!this.timeIn || !this.timeOut) return null;
    return (new Date(this.timeOut) - new Date(this.timeIn)) / 3600000; // hours
  }

  isActive() {
    return this.timeIn && !this.timeOut;
  }

  toJSON() {
    return {
      id: this.id,
      slot: this.slot,
      timeIn: this.timeIn,
      timeOut: this.timeOut,
      duration: this.getDuration(),
      isActive: this.isActive()
    };
  }
}

export default ParkingLog;
