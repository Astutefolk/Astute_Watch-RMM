// Jest setup for backend tests
import dotenv from 'dotenv';

// Load test environment
dotenv.config({ path: '.env.test' });

// Mock Redis if needed
jest.mock('redis', () => ({
  createClient: jest.fn(() => ({
    connect: jest.fn(),
    disconnect: jest.fn(),
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
    publish: jest.fn()
  }))
}));

// Mock Socket.io if needed
jest.mock('socket.io', () => ({
  Server: jest.fn(() => ({
    on: jest.fn(),
    emit: jest.fn()
  }))
}));

// Increase timeout for database operations
jest.setTimeout(10000);
