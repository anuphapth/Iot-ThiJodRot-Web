import { ParkingService } from '../../src/services/parkingService.js';
import { mockParkingSlots, mockParkingLogs } from '../fixtures/testData.js';

describe('ParkingService', () => {
  let parkingService;

  beforeEach(() => {
    parkingService = new ParkingService();
  });

  describe('getAllSlotStatuses', () => {
    it('should return all parking slot statuses', async () => {
      // Mock repository response
      parkingService.parkingRepository.getAllSlotStatuses = jest.fn()
        .mockResolvedValue(mockParkingSlots);

      const result = await parkingService.getAllSlotStatuses();

      expect(result).toEqual(mockParkingSlots.map(slot => slot.toJSON()));
      expect(parkingService.parkingRepository.getAllSlotStatuses).toHaveBeenCalled();
    });
  });

  describe('updateParkingStatus', () => {
    it('should handle car arrival successfully', async () => {
      const slot = 1;
      const status = 1; // OCCUPIED

      // Mock repository methods
      parkingService.parkingRepository.getSlotStatus = jest.fn()
        .mockResolvedValue(mockParkingSlots[0]);
      parkingService.parkingRepository.transaction = jest.fn()
        .mockResolvedValue({
          log: mockParkingLogs[0],
          updatedSlot: mockParkingSlots[1]
        });

      const result = await parkingService.updateParkingStatus(slot, status);

      expect(result.message).toContain('Get car come on slot 1');
      expect(parkingService.parkingRepository.transaction).toHaveBeenCalled();
    });

    it('should throw error for invalid slot', async () => {
      const slot = 99;
      const status = 1;

      parkingService.parkingRepository.getSlotStatus = jest.fn()
        .mockResolvedValue(null);

      await expect(parkingService.updateParkingStatus(slot, status))
        .rejects.toThrow('ไม่พบข้อมูลของ slot 99');
    });
  });
});
