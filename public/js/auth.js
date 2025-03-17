// Base API URL
const API_URL = 'http://localhost:5000/api/v1';

// Store auth token
let authToken = localStorage.getItem('authToken');
let currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');

// Helper function to make API requests
const api = async (endpoint, method = 'GET', data = null) => {
  const headers = {
    'Content-Type': 'application/json',
  };

  // Add auth token if available
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  const config = {
    method,
    headers,
  };

  if (data && (method === 'POST' || method === 'PATCH' || method === 'PUT')) {
    config.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(`${API_URL}${endpoint}`, config);
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.message || 'Something went wrong');
    }
    
    return result;
  } catch (error) {
    throw error;
  }
};

// Display response in appropriate container
const displayResponse = (containerId, response, isError = false) => {
  const container = document.getElementById(containerId);
  container.classList.remove('hidden');
  
  if (isError) {
    container.innerHTML = `<div class="alert alert-danger">${response}</div>`;
  } else {
    container.innerHTML = `<pre>${JSON.stringify(response, null, 2)}</pre>`;
  }
};

// Update UI based on authentication status
const updateAuthUI = () => {
  const userInfoCard = document.getElementById('userInfoCard');
  
  if (currentUser) {
    // User is logged in
    userInfoCard.classList.remove('hidden');
    
    document.getElementById('userFullName').textContent = `${currentUser.firstName} ${currentUser.lastName}`;
    document.getElementById('userEmail').textContent = currentUser.email;
    document.getElementById('userPhone').textContent = currentUser.phoneNumber;
    document.getElementById('userEmailVerified').textContent = currentUser.isEmailVerified ? 'Yes' : 'No';
    document.getElementById('userPhoneVerified').textContent = currentUser.isPhoneVerified ? 'Yes' : 'No';
    
    // Prefill email/phone inputs for convenience
    document.getElementById('verifyEmailAddress').value = currentUser.email;
    document.getElementById('verifyPhoneNumber').value = currentUser.phoneNumber;
    document.getElementById('forgotEmail').value = currentUser.email;
  } else {
    // User is not logged in
    userInfoCard.classList.add('hidden');
  }
};

// Handle signup form submission
document.getElementById('signupForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const userData = {
    firstName: document.getElementById('firstName').value,
    lastName: document.getElementById('lastName').value,
    email: document.getElementById('signupEmail').value,
    phoneNumber: document.getElementById('phoneNumber').value,
    password: document.getElementById('signupPassword').value,
  };
  
  try {
    const response = await api('/auth/signup', 'POST', userData);
    
    // Save auth token and user data
    authToken = response.token;
    currentUser = response.data.user;
    
    localStorage.setItem('authToken', authToken);
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    
    // Update UI
    updateAuthUI();
    
    // Display response
    displayResponse('signupResponse', {
      status: 'Success',
      message: 'Account created successfully!',
      user: response.data.user,
      note: 'Check console logs for OTP codes'
    });
    
    // Show an alert about OTPs
    alert('Account created successfully! Check the server console for OTP codes sent for verification.');
  } catch (error) {
    displayResponse('signupResponse', error.message, true);
  }
});

// Handle login form submission
document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const loginData = {
    email: document.getElementById('loginEmail').value,
    password: document.getElementById('loginPassword').value,
  };
  
  try {
    const response = await api('/auth/login', 'POST', loginData);
    
    // Save auth token and user data
    authToken = response.token;
    currentUser = response.data.user;
    
    localStorage.setItem('authToken', authToken);
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    
    // Update UI
    updateAuthUI();
    
    // Display response
    displayResponse('loginResponse', {
      status: 'Success',
      message: 'Logged in successfully!',
      user: response.data.user
    });
  } catch (error) {
    displayResponse('loginResponse', error.message, true);
  }
});

// Handle logout
document.getElementById('logoutBtn').addEventListener('click', async () => {
  try {
    await api('/auth/logout', 'GET');
    
    // Clear auth data
    authToken = null;
    currentUser = null;
    
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    
    // Update UI
    updateAuthUI();
    
    // Display response as an alert
    alert('Logged out successfully!');
  } catch (error) {
    alert(`Logout failed: ${error.message}`);
  }
});

// Handle email verification form
document.getElementById('verifyEmailForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const verificationData = {
    email: document.getElementById('verifyEmailAddress').value,
    otp: document.getElementById('emailOtp').value,
  };
  
  try {
    const response = await api('/auth/verify-email', 'POST', verificationData);
    
    // Update user data if current user
    if (currentUser && currentUser.email === verificationData.email) {
      currentUser.isEmailVerified = true;
      localStorage.setItem('currentUser', JSON.stringify(currentUser));
      updateAuthUI();
    }
    
    // Display response
    displayResponse('emailVerifyResponse', response);
  } catch (error) {
    displayResponse('emailVerifyResponse', error.message, true);
  }
});

// Handle phone verification form
document.getElementById('verifyPhoneForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const verificationData = {
    phoneNumber: document.getElementById('verifyPhoneNumber').value,
    otp: document.getElementById('phoneOtp').value,
  };
  
  try {
    const response = await api('/auth/verify-phone', 'POST', verificationData);
    
    // Update user data if current user
    if (currentUser && currentUser.phoneNumber === verificationData.phoneNumber) {
      currentUser.isPhoneVerified = true;
      localStorage.setItem('currentUser', JSON.stringify(currentUser));
      updateAuthUI();
    }
    
    // Display response
    displayResponse('phoneVerifyResponse', response);
  } catch (error) {
    displayResponse('phoneVerifyResponse', error.message, true);
  }
});

// Handle resend email OTP button
document.getElementById('resendEmailOtp').addEventListener('click', async () => {
  const email = document.getElementById('verifyEmailAddress').value;
  
  if (!email) {
    alert('Please enter your email address');
    return;
  }
  
  try {
    const response = await api('/auth/resend-email-otp', 'POST', { email });
    
    // Display response
    displayResponse('emailVerifyResponse', response);
    
    // Show an alert
    alert('Email OTP resent! Check server console logs.');
  } catch (error) {
    displayResponse('emailVerifyResponse', error.message, true);
  }
});

// Handle resend SMS OTP button
document.getElementById('resendSmsOtp').addEventListener('click', async () => {
  const phoneNumber = document.getElementById('verifyPhoneNumber').value;
  
  if (!phoneNumber) {
    alert('Please enter your phone number');
    return;
  }
  
  try {
    const response = await api('/auth/resend-sms-otp', 'POST', { phoneNumber });
    
    // Display response
    displayResponse('phoneVerifyResponse', response);
    
    // Show an alert
    alert('SMS OTP resent! Check server console logs.');
  } catch (error) {
    displayResponse('phoneVerifyResponse', error.message, true);
  }
});

// Handle forgot password form
document.getElementById('forgotPasswordForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const forgotData = {
    email: document.getElementById('forgotEmail').value,
  };
  
  try {
    const response = await api('/auth/forgot-password', 'POST', forgotData);
    
    // Display response
    displayResponse('forgotPasswordResponse', response);
    
    // Show an alert
    alert('Password reset link sent! Check server console logs.');
  } catch (error) {
    displayResponse('forgotPasswordResponse', error.message, true);
  }
});

// Handle reset password form
document.getElementById('resetPasswordForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const resetData = {
    token: document.getElementById('resetToken').value,
    password: document.getElementById('newPassword').value,
  };
  
  try {
    const response = await api('/auth/reset-password', 'POST', resetData);
    
    // Save auth token and user data if received
    if (response.token) {
      authToken = response.token;
      currentUser = response.data.user;
      
      localStorage.setItem('authToken', authToken);
      localStorage.setItem('currentUser', JSON.stringify(currentUser));
      
      // Update UI
      updateAuthUI();
    }
    
    // Display response
    displayResponse('resetPasswordResponse', response);
  } catch (error) {
    displayResponse('resetPasswordResponse', error.message, true);
  }
});

// Handle update password form
document.getElementById('updatePasswordForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  if (!authToken) {
    displayResponse('updatePasswordResponse', 'You must be logged in to update your password', true);
    return;
  }
  
  const updateData = {
    currentPassword: document.getElementById('currentPassword').value,
    newPassword: document.getElementById('updatedPassword').value,
  };
  
  try {
    const response = await api('/auth/update-password', 'PATCH', updateData);
    
    // Update auth token if a new one is provided
    if (response.token) {
      authToken = response.token;
      localStorage.setItem('authToken', authToken);
    }
    
    // Display response
    displayResponse('updatePasswordResponse', response);
  } catch (error) {
    displayResponse('updatePasswordResponse', error.message, true);
  }
});

// Initialize the UI
updateAuthUI(); 