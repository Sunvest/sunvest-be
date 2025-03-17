import { Request, Response, NextFunction } from 'express';
import User from '../models/user.model';
import { AppError, catchAsync } from '../utils/error.utils';
import {
  generateOTP,
  generateToken,
  generatePasswordResetToken,
  hashToken,
} from '../utils/auth.utils';
import {
  sendOTPEmail,
  sendOTPSMS,
  sendPasswordResetEmail,
} from '../utils/notification.utils';
import { verifyFirebasePhoneOTP } from '../utils/firebase.utils';
import bcryptjs from 'bcryptjs';

// Set cookie options
const cookieOptions = {
  expires: new Date(
    Date.now() + 7 * 24 * 60 * 60 * 1000 // 7 days
  ),
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
};

/**
 * Create and send token as cookie
 */
const createSendToken = (user: any, statusCode: number, res: Response) => {
  const token = generateToken(user._id);

  // Create a user object without the password
  const userResponse = user.toObject ? user.toObject() : { ...user };
  delete userResponse.password;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user: userResponse,
    },
  });
};

/**
 * Sign up a new user
 */
export const signup = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, password, firstName, lastName, phone } = req.body;

    // Validate required fields
    if (!email || !password || !firstName || !lastName) {
      return next(new AppError('All fields are required', 400));
    }

    // Check if user with email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(new AppError('User with this email already exists', 400));
    }

    // Check if user with phone already exists (if phone provided)
    if (phone) {
      const existingPhoneUser = await User.findOne({ phone });
      if (existingPhoneUser) {
        return next(new AppError('User with this phone number already exists', 400));
      }
    }

    // Hash password
    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(password, salt);

    // Generate OTPs for email and phone
    const emailOtp = generateOTP();
    const phoneOtp = generateOTP();

    // Calculate OTP expiry (10 minutes from now)
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    // Initialize phoneVerificationId (will be set if phone is provided)
    let phoneVerificationId = '';

    // Send OTPs
    await sendOTPEmail(email, emailOtp, firstName);
    
    // Send phone OTP if phone number provided
    if (phone) {
      phoneVerificationId = await sendOTPSMS(phone, phoneOtp);
    }

    // Create user
    const newUser = await User.create({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      phone,
      emailOtp,
      phoneOtp,
      otpExpiry,
      phoneVerificationId, // Store the Firebase verification ID
    });

    res.status(201).json({
      message: 'User created successfully. Please verify your email and phone.',
      userId: newUser._id,
    });
  }
);

/**
 * Log in a user
 */
export const login = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body;

    // Check if email and password are provided
    if (!email || !password) {
      return next(new AppError('Please provide email and password', 400));
    }

    // Check if user exists and password is correct
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password, user.password))) {
      return next(new AppError('Incorrect email or password', 401));
    }

    // Send token to client
    createSendToken(user, 200, res);
  }
);

/**
 * Log out a user by clearing the cookie
 */
export const logout = (req: Request, res: Response) => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000), // 10 seconds
    httpOnly: true,
  });
  
  res.status(200).json({ status: 'success' });
};

/**
 * Verify email with OTP
 */
export const verifyEmail = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, otp } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return next(new AppError('User not found', 404));
    }

    // Check if OTP is valid and not expired
    if (
      !user.emailOtp ||
      user.emailOtp !== otp ||
      !user.otpExpiry ||
      new Date() > user.otpExpiry
    ) {
      return next(new AppError('Invalid or expired OTP', 400));
    }

    // Mark email as verified and clear OTP
    user.isEmailVerified = true;
    user.emailOtp = undefined;
    await user.save({ validateBeforeSave: false });

    // Send response
    res.status(200).json({
      status: 'success',
      message: 'Email verified successfully',
    });
  }
);

/**
 * Verify phone with OTP
 */
export const verifyPhone = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { phoneNumber, otp } = req.body;

    // Find user by phone number
    const user = await User.findOne({ phone: phoneNumber });
    if (!user) {
      return next(new AppError('User not found', 404));
    }

    // Check if OTP is valid and not expired
    if (
      !user.phoneOtp ||
      user.phoneOtp !== otp ||
      !user.otpExpiry ||
      new Date() > user.otpExpiry
    ) {
      return next(new AppError('Invalid or expired OTP', 400));
    }

    // Mark phone as verified and clear OTP
    user.isPhoneVerified = true;
    user.phoneOtp = undefined;
    await user.save({ validateBeforeSave: false });

    // Send response
    res.status(200).json({
      status: 'success',
      message: 'Phone number verified successfully',
    });
  }
);

/**
 * Resend email OTP
 */
export const resendEmailOTP = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return next(new AppError('User not found', 404));
    }

    // Generate new OTP
    const emailOtp = generateOTP();
    
    // Set OTP expiration (10 minutes from now)
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
    
    // Update user with new OTP
    user.emailOtp = emailOtp;
    user.otpExpiry = otpExpiry;
    await user.save({ validateBeforeSave: false });
    
    // Send OTP
    try {
      await sendOTPEmail(email, emailOtp, user.firstName);
      
      res.status(200).json({
        status: 'success',
        message: 'Email OTP resent successfully',
      });
    } catch (error) {
      // Reset OTP in case of error
      user.emailOtp = undefined;
      user.otpExpiry = undefined;
      await user.save({ validateBeforeSave: false });
      
      return next(
        new AppError('There was an error sending the OTP. Please try again later.', 500)
      );
    }
  }
);

/**
 * Resend phone OTP
 * Handles both phoneNumber parameter (for regular verification)
 * and userId parameter (for Firebase verification)
 */
export const resendPhoneOTP = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { phoneNumber, userId } = req.body;
    
    let user;
    
    // Find user either by phone number or user ID
    if (phoneNumber) {
      user = await User.findOne({ phone: phoneNumber });
    } else if (userId) {
      user = await User.findById(userId);
    } else {
      return next(new AppError('Phone number or user ID is required', 400));
    }
    
    if (!user) {
      return next(new AppError('User not found', 404));
    }
    
    // Check if phone number exists
    if (!user.phone) {
      return next(new AppError('No phone number associated with this account', 400));
    }
    
    // Check if phone is already verified
    if (user.isPhoneVerified) {
      return next(new AppError('Phone is already verified', 400));
    }

    // Generate new OTP
    const phoneOtp = generateOTP();
    
    // Set OTP expiration (10 minutes from now)
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
    
    // Send OTP and get verification ID
    try {
      const phoneVerificationId = await sendOTPSMS(user.phone, phoneOtp);
      
      // Update user with new OTP
      user.phoneOtp = phoneOtp;
      user.otpExpiry = otpExpiry;
      user.phoneVerificationId = phoneVerificationId;
      await user.save({ validateBeforeSave: false });
      
      res.status(200).json({
        status: 'success',
        message: 'SMS OTP resent successfully',
      });
    } catch (error) {
      // Reset OTP in case of error
      user.phoneOtp = undefined;
      user.otpExpiry = undefined;
      user.phoneVerificationId = undefined;
      await user.save({ validateBeforeSave: false });
      
      return next(
        new AppError('There was an error sending the OTP. Please try again later.', 500)
      );
    }
  }
);

/**
 * Forgot password
 */
export const forgotPassword = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return next(new AppError('There is no user with that email address', 404));
    }

    // Generate reset token
    const resetToken = generatePasswordResetToken();
    user.passwordResetToken = hashToken(resetToken);
    user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save({ validateBeforeSave: false });

    // Send reset token to user's email
    try {
      await sendPasswordResetEmail(email, resetToken, user.firstName);

      res.status(200).json({
        status: 'success',
        message: 'Password reset link sent to email',
      });
    } catch (error) {
      // Reset token fields in case of error
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save({ validateBeforeSave: false });

      return next(
        new AppError('There was an error sending the email. Please try again later.', 500)
      );
    }
  }
);

/**
 * Reset password
 */
export const resetPassword = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { token, password } = req.body;

    // Hash the token to compare with stored hash
    const hashedToken = hashToken(token);

    // Find user by reset token and check if token is expired
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: new Date() },
    });

    if (!user) {
      return next(new AppError('Token is invalid or has expired', 400));
    }

    // Set new password and clear reset token fields
    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    // Log user in by sending JWT
    createSendToken(user, 200, res);
  }
);

/**
 * Update password while logged in
 */
export const updatePassword = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { currentPassword, newPassword } = req.body;

    // Get user from collection
    const user = await User.findById(req.user.id).select('+password');
    if (!user) {
      return next(new AppError('User not found', 404));
    }

    // Check if current password is correct
    if (!(await user.comparePassword(currentPassword, user.password))) {
      return next(new AppError('Your current password is incorrect', 401));
    }

    // Update password
    user.password = newPassword;
    await user.save();

    // Log user in with new password (send new JWT)
    createSendToken(user, 200, res);
  }
);

/**
 * In the verifyPhoneOTP method, use Firebase verification
 */
export const verifyPhoneOTP = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, otp } = req.body;

    if (!userId || !otp) {
      res.status(400).json({ message: 'User ID and OTP are required' });
      return;
    }

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    // Check if phone number exists
    if (!user.phone) {
      res.status(400).json({ message: 'No phone number associated with this account' });
      return;
    }

    // Check if phone is already verified
    if (user.isPhoneVerified) {
      res.status(400).json({ message: 'Phone is already verified' });
      return;
    }

    // Check if verification ID exists
    if (!user.phoneVerificationId) {
      res.status(400).json({ message: 'No verification in progress. Request a new OTP' });
      return;
    }

    // Use Firebase to verify the OTP
    const isVerified = await verifyFirebasePhoneOTP(user.phoneVerificationId, otp);

    // If fallback mode is used or Firebase verification failed, verify with stored OTP
    if (!isVerified) {
      // Check if OTP is expired
      if (user.otpExpiry && user.otpExpiry < new Date()) {
        res.status(400).json({ message: 'OTP has expired. Request a new one' });
        return;
      }

      // Check if OTP matches
      if (user.phoneOtp !== otp) {
        res.status(400).json({ message: 'Invalid OTP' });
        return;
      }
    }

    // Update user
    user.isPhoneVerified = true;
    user.phoneOtp = undefined;
    user.phoneVerificationId = undefined;
    await user.save();

    res.status(200).json({ message: 'Phone verified successfully' });
  } catch (error) {
    console.error('Phone verification error:', error);
    res.status(500).json({ message: 'Server error during phone verification' });
  }
}; 