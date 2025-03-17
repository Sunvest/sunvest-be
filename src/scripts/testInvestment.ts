import axios from 'axios';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const API_URL = process.env.API_URL || 'http://localhost:5000/api/v1';
let authToken: string;

// Helper function to make API requests
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Set auth token for subsequent requests
const setAuthToken = (token: string) => {
  authToken = token;
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
};

// Login to get token
const login = async (email: string, password: string): Promise<boolean> => {
  try {
    console.log('\n----- Logging in to test investment features -----');
    
    const response = await api.post('/auth/login', { email, password });
    
    if (response.data.token) {
      setAuthToken(response.data.token);
      console.log('Login successful!');
      return true;
    }
    
    return false;
  } catch (error: any) {
    console.error('Login Error:', error.response?.data || error.message);
    return false;
  }
};

// Placeholder for future investment tests
const testInvestmentFeatures = async () => {
  console.log('\n----- Investment Feature Tests (Placeholder) -----');
  console.log('These tests will be implemented when the investment features are built');
  console.log('Future tests will include:');
  console.log('1. Fund wallet');
  console.log('2. Check wallet balance');
  console.log('3. Buy tokens');
  console.log('4. Invest in projects');
  console.log('5. Track investment performance');
  console.log('6. View weather-based price updates');
};

// Run tests
const runTests = async () => {
  // Login with test user
  const isLoggedIn = await login('test@example.com', 'password123');
  
  if (isLoggedIn) {
    await testInvestmentFeatures();
  } else {
    console.log('Login failed. Cannot proceed with investment tests.');
    console.log('Make sure you have run the seed script first: npm run seed');
  }
};

// Execute tests
runTests(); 