import { Router } from 'express';
import {
  signup,
  login,
  verifyEmail,
  verifyPhoneOTP,
  resendEmailOTP,
  resendPhoneOTP,
  forgotPassword,
  resetPassword,
  updatePassword,
  logout,
} from '../controllers/auth.controller';
import { protect } from '../middleware/auth.middleware';
import { getProfile } from '../controllers/user.controller';

const router = Router();

// Public routes
router.post('/signup', signup);
router.post('/login', login);
router.post('/verify-email', verifyEmail);
router.post('/verify-phone', verifyPhoneOTP);
router.post('/resend-email-otp', resendEmailOTP);
router.post('/resend-phone-otp', resendPhoneOTP);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/logout', logout);

// Protected routes
router.use(protect);
router.get('/me', getProfile);
router.patch('/update-password', updatePassword);

export default router; 