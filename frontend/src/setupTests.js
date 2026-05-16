/**
 * Jest Setup for React Testing
 * 
 * This file is automatically loaded by Jest before running tests.
 * It configures the testing environment and adds custom matchers.
 */

// Import Jest DOM matchers for better assertions
import '@testing-library/jest-dom';

// Mock window.matchMedia (used by some components for responsive design)
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // Deprecated
    removeListener: jest.fn(), // Deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock window.scrollTo (used in some components)
window.scrollTo = jest.fn();

// Mock console methods to reduce noise in test output
// Uncomment these if you want to suppress console output during tests
// global.console = {
//   ...console,
//   log: jest.fn(),
//   debug: jest.fn(),
//   info: jest.fn(),
//   warn: jest.fn(),
//   error: jest.fn(),
// };

// Set up environment variables for tests
process.env.REACT_APP_API_URL = 'http://localhost:3001';

// Global test utilities
global.testUtils = {
  /**
   * Wait for a specified amount of time
   * @param {number} ms - Milliseconds to wait
   */
  wait: (ms) => new Promise(resolve => setTimeout(resolve, ms)),
  
  /**
   * Create a mock API response
   * @param {object} data - Response data
   * @param {number} status - HTTP status code
   */
  mockApiResponse: (data, status = 200) => ({
    ok: status >= 200 && status < 300,
    status,
    json: async () => data,
    text: async () => JSON.stringify(data),
  }),
  
  /**
   * Create a mock API error
   * @param {string} message - Error message
   * @param {number} status - HTTP status code
   */
  mockApiError: (message, status = 500) => ({
    ok: false,
    status,
    json: async () => ({ error: message }),
    text: async () => JSON.stringify({ error: message }),
  }),
};

// Clean up after each test
afterEach(() => {
  // Clear all mocks
  jest.clearAllMocks();
  
  // Clear any timers
  jest.clearAllTimers();
  
  // Restore fetch mock if it was mocked
  if (global.fetch && global.fetch.mockRestore) {
    global.fetch.mockRestore();
  }
});

// Global setup before all tests
beforeAll(() => {
  // Suppress console errors for expected errors in tests
  const originalError = console.error;
  beforeAll(() => {
    console.error = (...args) => {
      // Suppress React error boundary errors in tests
      if (
        typeof args[0] === 'string' &&
        args[0].includes('Error: Not implemented: HTMLFormElement.prototype.submit')
      ) {
        return;
      }
      originalError.call(console, ...args);
    };
  });
  
  afterAll(() => {
    console.error = originalError;
  });
});

// Custom matchers (examples)
expect.extend({
  /**
   * Check if a value is a valid URL
   */
  toBeValidUrl(received) {
    try {
      new URL(received);
      return {
        message: () => `expected ${received} not to be a valid URL`,
        pass: true,
      };
    } catch (error) {
      return {
        message: () => `expected ${received} to be a valid URL`,
        pass: false,
      };
    }
  },
  
  /**
   * Check if a value is a non-empty string
   */
  toBeNonEmptyString(received) {
    const pass = typeof received === 'string' && received.length > 0;
    return {
      message: () =>
        pass
          ? `expected ${received} not to be a non-empty string`
          : `expected ${received} to be a non-empty string`,
      pass,
    };
  },
});

// Export test utilities for use in test files
export { testUtils } from './setupTests';

// Made with Bob
