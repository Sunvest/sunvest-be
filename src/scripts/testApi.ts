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

// Test registration
const testSignup = async () => {
  try {
    console.log('\n----- Testing Signup -----');
    const userData = {
      email: `test${Date.now()}@example.com`,
      password: 'password123',
      firstName: 'Test',
      lastName: 'User',
      phoneNumber: `${Math.floor(1000000000 + Math.random() * 9000000000)}`,
    };
    
    console.log('Signup Data:', userData);
    
    const response = await api.post('/auth/signup', userData);
    console.log('Signup Response:', {
      status: response.status,
      data: response.data,
    });
    
    if (response.data.token) {
      setAuthToken(response.data.token);
      return {
        email: userData.email,
        phoneNumber: userData.phoneNumber,
        token: response.data.token,
      };
    }
    
    return null;
  } catch (error: any) {
    console.error('Signup Error:', error.response?.data || error.message);
    return null;
  }
};

// Test login
const testLogin = async (email: string, password: string) => {
  try {
    console.log('\n----- Testing Login -----');
    const loginData = {
      email,
      password,
    };
    
    console.log('Login Data:', loginData);
    
    const response = await api.post('/auth/login', loginData);
    console.log('Login Response:', {
      status: response.status,
      data: response.data,
    });
    
    if (response.data.token) {
      setAuthToken(response.data.token);
    }
  } catch (error: any) {
    console.error('Login Error:', error.response?.data || error.message);
  }
};

// Test email verification
const testVerifyEmail = async (email: string, otp: string) => {
  try {
    console.log('\n----- Testing Email Verification -----');
    const verificationData = {
      email,
      otp,
    };
    
    console.log('Verification Data:', verificationData);
    
    const response = await api.post('/auth/verify-email', verificationData);
    console.log('Email Verification Response:', {
      status: response.status,
      data: response.data,
    });
  } catch (error: any) {
    console.error('Email Verification Error:', error.response?.data || error.message);
  }
};

// Test phone verification
const testVerifyPhone = async (phoneNumber: string, otp: string) => {
  try {
    console.log('\n----- Testing Phone Verification -----');
    const verificationData = {
      phoneNumber,
      otp,
    };
    
    console.log('Verification Data:', verificationData);
    
    const response = await api.post('/auth/verify-phone', verificationData);
    console.log('Phone Verification Response:', {
      status: response.status,
      data: response.data,
    });
  } catch (error: any) {
    console.error('Phone Verification Error:', error.response?.data || error.message);
  }
};

// Test forgot password
const testForgotPassword = async (email: string) => {
  try {
    console.log('\n----- Testing Forgot Password -----');
    const forgotPasswordData = {
      email,
    };
    
    console.log('Forgot Password Data:', forgotPasswordData);
    
    const response = await api.post('/auth/forgot-password', forgotPasswordData);
    console.log('Forgot Password Response:', {
      status: response.status,
      data: response.data,
    });
  } catch (error: any) {
    console.error('Forgot Password Error:', error.response?.data || error.message);
  }
};

// Test reset password
const testResetPassword = async (token: string, password: string) => {
  try {
    console.log('\n----- Testing Reset Password -----');
    const resetPasswordData = {
      token,
      password,
    };
    
    console.log('Reset Password Data:', { token: '***', password: '***' });
    
    const response = await api.post('/auth/reset-password', resetPasswordData);
    console.log('Reset Password Response:', {
      status: response.status,
      data: response.data,
    });
  } catch (error: any) {
    console.error('Reset Password Error:', error.response?.data || error.message);
  }
};

// Test update password
const testUpdatePassword = async (currentPassword: string, newPassword: string) => {
  try {
    console.log('\n----- Testing Update Password -----');
    const updatePasswordData = {
      currentPassword,
      newPassword,
    };
    
    console.log('Update Password Data:', { currentPassword: '***', newPassword: '***' });
    
    const response = await api.patch('/auth/update-password', updatePasswordData);
    console.log('Update Password Response:', {
      status: response.status,
      data: response.data,
    });
  } catch (error: any) {
    console.error('Update Password Error:', error.response?.data || error.message);
  }
};

// Test logout
const testLogout = async () => {
  try {
    console.log('\n----- Testing Logout -----');
    
    const response = await api.get('/auth/logout');
    console.log('Logout Response:', {
      status: response.status,
      data: response.data,
    });
  } catch (error: any) {
    console.error('Logout Error:', error.response?.data || error.message);
  }
};

// Run all tests
const runTests = async () => {
  try {
    // Test signup
    const signupData = await testSignup();
    
    if (signupData) {
      // Log OTP to console (in a real app, you'd get this from the console logs or email/SMS)
      console.log('\n!! IMPORTANT: Check your server logs for the OTP codes that were sent !!');
      
      // Test login with the newly created user
      await testLogin(signupData.email, 'password123');
      
      // Get OTP from user input
      const emailOtp = process.argv[2] || '123456'; // Use provided OTP or default
      const smsOtp = process.argv[3] || '123456'; // Use provided OTP or default
      
      // Test verifications
      await testVerifyEmail(signupData.email, emailOtp);
      await testVerifyPhone(signupData.phoneNumber, smsOtp);
      
      // Test password management
      await testForgotPassword(signupData.email);
      
      // Note: You would need the actual reset token from the email
      // For testing, we'll use a placeholder token
      const resetToken = 'placeholder_token';
      await testResetPassword(resetToken, 'newpassword123');
      
      // Test password update (requires login)
      await testUpdatePassword('password123', 'newpassword456');
      
      // Test logout
      await testLogout();
    } else {
      // If signup failed, test login with existing user
      await testLogin('test@example.com', 'password123');
    }
    
    console.log('\n----- All Tests Completed -----');
  } catch (error) {
    console.error('Test Error:', error);
  }
};

// Run the tests
runTests(); 