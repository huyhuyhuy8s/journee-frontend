/**
 * Example API Responses for Testing
 * 
 * Use these examples to test your authentication flow or to mock API responses
 */

// ====================================
// LOGIN RESPONSE
// ====================================

export const mockLoginResponse = {
  token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NzViZjJhNzQxNTY4YTAwMTJhZTRhYjgiLCJpYXQiOjE3MzQxMDg4MTUsImV4cCI6MTczNjcwMDgxNX0.example_token",
  user: {
    _id: "675bf2a741568a0012ae4ab8",
    email: "test@example.com",
    username: "testuser",
    firstName: "Test",
    lastName: "User",
    createdAt: "2024-12-13T10:00:00.000Z",
    updatedAt: "2024-12-13T10:00:00.000Z",
  }
};

// ====================================
// REGISTER RESPONSE
// ====================================

export const mockRegisterResponse = {
  token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NzViZjJhNzQxNTY4YTAwMTJhZTRhYjgiLCJpYXQiOjE3MzQxMDg4MTUsImV4cCI6MTczNjcwMDgxNX0.example_token",
  user: {
    _id: "675bf2a741568a0012ae4ab8",
    email: "newuser@example.com",
    username: "newuser",
    firstName: "New",
    lastName: "User",
    createdAt: "2024-12-13T10:00:00.000Z",
    updatedAt: "2024-12-13T10:00:00.000Z",
  }
};

// ====================================
// ERROR RESPONSES
// ====================================

export const mockLoginError = {
  message: "Invalid email or password",
  status: 401
};

export const mockRegisterErrors = {
  emailExists: {
    message: "Email already exists",
    status: 400
  },
  usernameExists: {
    message: "Username already exists",
    status: 400
  },
  invalidData: {
    message: "Invalid registration data",
    status: 400
  }
};

// ====================================
// TEST CREDENTIALS
// ====================================

export const testCredentials = {
  // Valid credentials for testing
  valid: {
    email: "test@example.com",
    password: "test123456",
    username: "testuser",
    firstName: "Test",
    lastName: "User"
  },
  
  // Invalid credentials for testing error handling
  invalid: {
    email: "invalid-email",
    password: "123", // Too short
    username: "ab", // Too short
  }
};

// ====================================
// USAGE EXAMPLE
// ====================================

/*
// In your tests or development:

import { mockLoginResponse, testCredentials } from '@/examples/authExamples';

// Test login
const { login } = useAuth();
await login(testCredentials.valid.email, testCredentials.valid.password);

// Mock API response for testing
const mockAxios = jest.mock('axios');
mockAxios.post.mockResolvedValue({ data: mockLoginResponse });
*/
