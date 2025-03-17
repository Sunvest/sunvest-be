import express from 'express';
import {
  signup,
  login,
  logout,
  verifyEmail,
  verifyPhone,
  resendEmailOTP,
  resendSmsOTP,
  forgotPassword,
  resetPassword,
  updatePassword,
} from '../controllers/auth.controller';
import { protect } from '../middleware/auth.middleware';

const router = express.Router();

// Public routes
router.post('/signup', signup);
router.post('/login', login);
router.get('/logout', logout);
router.post('/verify-email', verifyEmail);
router.post('/verify-phone', verifyPhone);
router.post('/resend-email-otp', resendEmailOTP);
router.post('/resend-sms-otp', resendSmsOTP);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// Protected routes
router.use(protect); // All routes after this middleware require authentication
router.patch('/update-password', updatePassword);

export default router; 