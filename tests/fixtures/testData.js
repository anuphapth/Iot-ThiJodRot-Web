// Sample test data for parking slots
export const mockParkingSlots = [
  { id: 1, slot: 1, status: 0 }, // ว่าง
  { id: 2, slot: 2, status: 1 }, // ไม่ว่าง
];

// Sample test data for parking logs
export const mockParkingLogs = [
  {
    id: 1,
    slot: 1,
    time_in: '2026-01-01T08:00:00Z',
    time_out: '2026-01-01T17:00:00Z',
  },
  {
    id: 2,
    slot: 2,
    time_in: '2026-01-01T09:00:00Z',
    time_out: null,
  },
];

// Sample test data for users
export const mockUsers = [
  {
    id: 1,
    username: 'admin',
    password: '$2b$10$hashedpassword',
    created_at: '2026-01-01T00:00:00Z',
  },
];

// Sample test data for power readings
export const mockPowerData = [
  {
    id: 1,
    use: 10.5,
    created_at: '2026-01-01T08:00:00Z',
  },
  {
    id: 2,
    use: 12.3,
    created_at: '2026-01-01T09:00:00Z',
  },
];

export default {
  mockParkingSlots,
  mockParkingLogs,
  mockUsers,
  mockPowerData,
};
