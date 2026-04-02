export class PowerData {
  constructor(data = {}) {
    this.id = data.id;
    this.use = data.use;
    this.createdAt = data.created_at || data.createdAt;
  }

  static isValidPower(power) {
    return typeof power === 'number' && power >= 0;
  }

  static calculateAverage(powerReadings) {
    if (!powerReadings || powerReadings.length === 0) return 0;
    const sum = powerReadings.reduce((acc, reading) => acc + reading.use, 0);
    return sum / powerReadings.length;
  }

  toJSON() {
    return {
      id: this.id,
      use: this.use,
      createdAt: this.createdAt
    };
  }
}

export default PowerData;
