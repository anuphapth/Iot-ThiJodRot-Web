import { jest } from '@jest/globals';

// Mock database for testing
export const mockDb = {
  query: jest.fn(),
  connect: jest.fn(),
  end: jest.fn(),
};

// Mock environment variables
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test_db';
process.env.PORT = '3001';

// Global test setup
beforeEach(() => {
  jest.clearAllMocks();
});

export default {
  mockDb,
};
