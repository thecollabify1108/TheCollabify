/**
 * Jest Setup File
 * Runs before each test file
 */
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables for testing
dotenv.config({ path: path.join(__dirname, '../.env.test'), override: true });

// Mock standard utilities if needed
jest.setTimeout(10000);

console.log('🧪 Test Environment Initialized');
