// Store session data
let sessionData = {
  userId: localStorage.getItem('userId') || null,
  token: localStorage.getItem('token') || null,
  isEmailVerified: localStorage.getItem('isEmailVerified') === 'true',
  isPhoneVerified: localStorage.getItem('isPhoneVerified') === 'true',
  firstName: localStorage.getItem('firstName') || null,
  phoneVerificationId: localStorage.getItem('phoneVerificationId') || null,
};

// API endpoint
const API_URL = '/api/v1';

// Function to update UI based on auth state
function updateAuthUI() {
  const isLoggedIn = !!sessionData.token;
  
  // Update navigation
  document.querySelectorAll('.nav-item').forEach(item => {
    const tabId = item.getAttribute('data-bs-target');
    
    // Show/hide tabs based on auth state
    if (isLoggedIn) {
      if (tabId === '#signup-tab' || tabId === '#login-tab') {
        item.classList.add('d-none');
      } else {
        item.classList.remove('d-none');
      }
    } else {
      if (tabId === '#signup-tab' || tabId === '#login-tab') {
        item.classList.remove('d-none');
      } else {
        item.classList.add('d-none');
      }
    }
  });
  
  // Update verification UI
  if (isLoggedIn) {
    // Email verification status
    const emailVerifyBtn = document.getElementById('verify-email-btn');
    const emailVerifyStatus = document.getElementById('email-verification-status');
    
    if (sessionData.isEmailVerified) {
      emailVerifyBtn.disabled = true;
      emailVerifyStatus.textContent = 'Email verified ✓';
      emailVerifyStatus.classList.add('text-success');
    } else {
      emailVerifyBtn.disabled = false;
      emailVerifyStatus.textContent = 'Email not verified ✗';
      emailVerifyStatus.classList.add('text-danger');
    }
    
    // Phone verification status
    const phoneVerifyBtn = document.getElementById('verify-phone-btn');
    const phoneVerifyStatus = document.getElementById('phone-verification-status');
    
    if (sessionData.isPhoneVerified) {
      phoneVerifyBtn.disabled = true;
      phoneVerifyStatus.textContent = 'Phone verified ✓';
      phoneVerifyStatus.classList.add('text-success');
    } else {
      phoneVerifyBtn.disabled = false;
      phoneVerifyStatus.textContent = 'Phone not verified ✗';
      phoneVerifyStatus.classList.add('text-danger');
    }
    
    // Update user info section
    const userInfoSection = document.getElementById('user-info');
    if (userInfoSection) {
      userInfoSection.classList.remove('d-none');
      document.getElementById('user-greeting').textContent = `Hello, ${sessionData.firstName || 'User'}!`;
      document.getElementById('email-status').textContent = sessionData.isEmailVerified ? 'Verified ✓' : 'Not Verified ✗';
      document.getElementById('phone-status').textContent = sessionData.isPhoneVerified ? 'Verified ✓' : 'Not Verified ✗';
    }
  } else {
    // Hide user info when logged out
    const userInfoSection = document.getElementById('user-info');
    if (userInfoSection) {
      userInfoSection.classList.add('d-none');
    }
  }
}

// Function to make API requests
async function apiRequest(endpoint, method = 'GET', data = null) {
  const url = `${API_URL}${endpoint}`;
  
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  };
  
  if (sessionData.token) {
    options.headers.Authorization = `Bearer ${sessionData.token}`;
  }
  
  if (data) {
    options.body = JSON.stringify(data);
  }
  
  try {
    const response = await fetch(url, options);
    const responseData = await response.json();
    
    // Display API response
    displayApiResponse(responseData);
    
    if (!response.ok) {
      throw new Error(responseData.message || 'API request failed');
    }
    
    return responseData;
  } catch (error) {
    displayApiError(error.message);
    throw error;
  }
}

// Function to display API response
function displayApiResponse(data) {
  const responseDisplay = document.getElementById('api-response');
  responseDisplay.textContent = JSON.stringify(data, null, 2);
  responseDisplay.classList.remove('d-none');
}

// Function to display API error
function displayApiError(message) {
  const errorDisplay = document.getElementById('api-error');
  errorDisplay.textContent = message;
  errorDisplay.classList.remove('d-none');
  
  // Hide error after 5 seconds
  setTimeout(() => {
    errorDisplay.classList.add('d-none');
  }, 5000);
}

// Function to handle signup
async function handleSignup(event) {
  event.preventDefault();
  
  const firstName = document.getElementById('signup-firstname').value;
  const lastName = document.getElementById('signup-lastname').value;
  const email = document.getElementById('signup-email').value;
  const phone = document.getElementById('signup-phone').value;
  const password = document.getElementById('signup-password').value;
  const confirmPassword = document.getElementById('signup-confirm-password').value;
  
  // Validate form
  if (!firstName || !lastName || !email || !password) {
    displayApiError('All fields are required');
    return;
  }
  
  if (password !== confirmPassword) {
    displayApiError('Passwords do not match');
    return;
  }
  
  try {
    const data = await apiRequest('/auth/signup', 'POST', {
      firstName,
      lastName,
      email,
      phone,
      password,
    });
    
    // Store user ID for verification
    sessionData.userId = data.userId;
    sessionData.firstName = firstName;
    localStorage.setItem('userId', data.userId);
    localStorage.setItem('firstName', firstName);
    
    // Show verification tab
    document.querySelector('[data-bs-target="#verify-tab"]').click();
    
    // Update UI
    updateAuthUI();
  } catch (error) {
    console.error('Signup error:', error);
  }
}

// Function to handle login
async function handleLogin(event) {
  event.preventDefault();
  
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;
  
  // Validate form
  if (!email || !password) {
    displayApiError('Email and password are required');
    return;
  }
  
  try {
    const data = await apiRequest('/auth/login', 'POST', {
      email,
      password,
    });
    
    // Store session data
    sessionData.token = data.token;
    sessionData.userId = data.data.user._id;
    sessionData.isEmailVerified = data.data.user.isEmailVerified;
    sessionData.isPhoneVerified = data.data.user.isPhoneVerified;
    sessionData.firstName = data.data.user.firstName;
    
    // Save to localStorage
    localStorage.setItem('token', data.token);
    localStorage.setItem('userId', data.data.user._id);
    localStorage.setItem('isEmailVerified', data.data.user.isEmailVerified);
    localStorage.setItem('isPhoneVerified', data.data.user.isPhoneVerified);
    localStorage.setItem('firstName', data.data.user.firstName);
    
    // Update UI
    updateAuthUI();
  } catch (error) {
    console.error('Login error:', error);
  }
}

// Function to handle logout
async function handleLogout() {
  try {
    await apiRequest('/auth/logout', 'POST');
    
    // Clear session data
    sessionData = {
      userId: null,
      token: null,
      isEmailVerified: false,
      isPhoneVerified: false,
      firstName: null,
      phoneVerificationId: null,
    };
    
    // Clear localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('isEmailVerified');
    localStorage.removeItem('isPhoneVerified');
    localStorage.removeItem('firstName');
    localStorage.removeItem('phoneVerificationId');
    
    // Update UI
    updateAuthUI();
    
    // Go to login tab
    document.querySelector('[data-bs-target="#login-tab"]').click();
  } catch (error) {
    console.error('Logout error:', error);
  }
}

// Function to handle email verification
async function handleEmailVerification(event) {
  event.preventDefault();
  
  const otp = document.getElementById('email-otp').value;
  
  // Validate form
  if (!otp) {
    displayApiError('OTP is required');
    return;
  }
  
  try {
    await apiRequest('/auth/verify-email', 'POST', {
      userId: sessionData.userId,
      otp,
    });
    
    // Update session data
    sessionData.isEmailVerified = true;
    localStorage.setItem('isEmailVerified', 'true');
    
    // Update UI
    updateAuthUI();
  } catch (error) {
    console.error('Email verification error:', error);
  }
}

// Function to handle phone verification
async function handlePhoneVerification(event) {
  event.preventDefault();
  
  const otp = document.getElementById('phone-otp').value;
  
  // Validate form
  if (!otp) {
    displayApiError('OTP is required');
    return;
  }
  
  try {
    await apiRequest('/auth/verify-phone', 'POST', {
      userId: sessionData.userId,
      otp,
    });
    
    // Update session data
    sessionData.isPhoneVerified = true;
    localStorage.setItem('isPhoneVerified', 'true');
    
    // Clear verification ID
    sessionData.phoneVerificationId = null;
    localStorage.removeItem('phoneVerificationId');
    
    // Update UI
    updateAuthUI();
  } catch (error) {
    console.error('Phone verification error:', error);
  }
}

// Function to resend email OTP
async function handleResendEmailOTP() {
  try {
    await apiRequest('/auth/resend-email-otp', 'POST', {
      userId: sessionData.userId,
    });
  } catch (error) {
    console.error('Resend email OTP error:', error);
  }
}

// Function to resend phone OTP
async function handleResendPhoneOTP() {
  try {
    const response = await apiRequest('/auth/resend-phone-otp', 'POST', {
      userId: sessionData.userId,
    });
    
    // Store verification ID if available
    if (response && response.verificationId) {
      sessionData.phoneVerificationId = response.verificationId;
      localStorage.setItem('phoneVerificationId', response.verificationId);
    }
  } catch (error) {
    console.error('Resend phone OTP error:', error);
  }
}

// Function to handle forgot password
async function handleForgotPassword(event) {
  event.preventDefault();
  
  const email = document.getElementById('forgot-email').value;
  
  // Validate form
  if (!email) {
    displayApiError('Email is required');
    return;
  }
  
  try {
    await apiRequest('/auth/forgot-password', 'POST', {
      email,
    });
  } catch (error) {
    console.error('Forgot password error:', error);
  }
}

// Function to handle reset password
async function handleResetPassword(event) {
  event.preventDefault();
  
  const token = document.getElementById('reset-token').value;
  const password = document.getElementById('reset-password').value;
  const confirmPassword = document.getElementById('reset-confirm-password').value;
  
  // Validate form
  if (!token || !password) {
    displayApiError('Token and password are required');
    return;
  }
  
  if (password !== confirmPassword) {
    displayApiError('Passwords do not match');
    return;
  }
  
  try {
    await apiRequest('/auth/reset-password', 'POST', {
      token,
      password,
    });
    
    // Show login tab after successful reset
    document.querySelector('[data-bs-target="#login-tab"]').click();
  } catch (error) {
    console.error('Reset password error:', error);
  }
}

// Function to handle update password
async function handleUpdatePassword(event) {
  event.preventDefault();
  
  const currentPassword = document.getElementById('current-password').value;
  const newPassword = document.getElementById('new-password').value;
  const confirmPassword = document.getElementById('confirm-new-password').value;
  
  // Validate form
  if (!currentPassword || !newPassword) {
    displayApiError('All fields are required');
    return;
  }
  
  if (newPassword !== confirmPassword) {
    displayApiError('New passwords do not match');
    return;
  }
  
  try {
    await apiRequest('/auth/update-password', 'PATCH', {
      currentPassword,
      newPassword,
    });
  } catch (error) {
    console.error('Update password error:', error);
  }
}

// Initialize event listeners
document.addEventListener('DOMContentLoaded', () => {
  // Signup form
  const signupForm = document.getElementById('signup-form');
  if (signupForm) {
    signupForm.addEventListener('submit', handleSignup);
  }
  
  // Login form
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', handleLogin);
  }
  
  // Logout button
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', handleLogout);
  }
  
  // Email verification form
  const emailVerifyForm = document.getElementById('email-verification-form');
  if (emailVerifyForm) {
    emailVerifyForm.addEventListener('submit', handleEmailVerification);
  }
  
  // Phone verification form
  const phoneVerifyForm = document.getElementById('phone-verification-form');
  if (phoneVerifyForm) {
    phoneVerifyForm.addEventListener('submit', handlePhoneVerification);
  }
  
  // Resend email OTP button
  const resendEmailBtn = document.getElementById('resend-email-otp-btn');
  if (resendEmailBtn) {
    resendEmailBtn.addEventListener('click', handleResendEmailOTP);
  }
  
  // Resend phone OTP button
  const resendPhoneBtn = document.getElementById('resend-phone-otp-btn');
  if (resendPhoneBtn) {
    resendPhoneBtn.addEventListener('click', handleResendPhoneOTP);
  }
  
  // Forgot password form
  const forgotPasswordForm = document.getElementById('forgot-password-form');
  if (forgotPasswordForm) {
    forgotPasswordForm.addEventListener('submit', handleForgotPassword);
  }
  
  // Reset password form
  const resetPasswordForm = document.getElementById('reset-password-form');
  if (resetPasswordForm) {
    resetPasswordForm.addEventListener('submit', handleResetPassword);
  }
  
  // Update password form
  const updatePasswordForm = document.getElementById('update-password-form');
  if (updatePasswordForm) {
    updatePasswordForm.addEventListener('submit', handleUpdatePassword);
  }
  
  // Initialize UI based on auth state
  updateAuthUI();
}); 