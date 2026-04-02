export class ParkingSlot {
  constructor(data = {}) {
    this.id = data.id;
    this.slot = data.slot;
    this.status = data.status; // 0: ว่าง, 1: มีรถ, 2: ซ่อมบำรุง
  }

  static getStatusText(status) {
    const statusMap = {
      0: 'ว่าง',
      1: 'ไม่ว่าง', 
      2: 'ซ่อมบำรุง'
    };
    return statusMap[status] || 'ไม่ทราบสถานะ';
  }

  static getStatusClass(status) {
    const classMap = {
      0: 'vacant',
      1: 'occupied',
      2: 'maintenance'
    };
    return classMap[status] || '';
  }

  isValid() {
    return this.slot && [0, 1, 2].includes(this.status);
  }

  toJSON() {
    return {
      id: this.id,
      slot: this.slot,
      status: this.status,
      statusText: ParkingSlot.getStatusText(this.status),
      statusClass: ParkingSlot.getStatusClass(this.status)
    };
  }
}

export default ParkingSlot;
