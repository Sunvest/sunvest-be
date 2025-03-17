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
    const { email, password, firstName, lastName, phoneNumber } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(new AppError('Email already in use', 400));
    }

    // Create new user
    const newUser = await User.create({
      email,
      password,
      firstName,
      lastName,
      phoneNumber,
    });

    // Generate OTPs for email and SMS verification
    const emailOtp = generateOTP();
    const smsOtp = generateOTP();
    
    // Set OTP expiration (10 minutes from now)
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
    
    // Update user with OTPs
    newUser.emailOtp = emailOtp;
    newUser.smsOtp = smsOtp;
    newUser.otpExpiresAt = otpExpiresAt;
    await newUser.save({ validateBeforeSave: false });
    
    // Send OTPs
    try {
      await sendOTPEmail(email, emailOtp, firstName);
      await sendOTPSMS(phoneNumber, smsOtp);
      
      // Send token to client
      createSendToken(newUser, 201, res);
    } catch (error) {
      // Reset OTPs in case of error
      newUser.emailOtp = null;
      newUser.smsOtp = null;
      newUser.otpExpiresAt = null;
      await newUser.save({ validateBeforeSave: false });
      
      return next(
        new AppError('There was an error sending the verification code. Please try again later.', 500)
      );
    }
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
    if (!user || !(await user.comparePassword(password))) {
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
      !user.otpExpiresAt ||
      new Date() > user.otpExpiresAt
    ) {
      return next(new AppError('Invalid or expired OTP', 400));
    }

    // Mark email as verified and clear OTP
    user.isEmailVerified = true;
    user.emailOtp = null;
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
    const user = await User.findOne({ phoneNumber });
    if (!user) {
      return next(new AppError('User not found', 404));
    }

    // Check if OTP is valid and not expired
    if (
      !user.smsOtp ||
      user.smsOtp !== otp ||
      !user.otpExpiresAt ||
      new Date() > user.otpExpiresAt
    ) {
      return next(new AppError('Invalid or expired OTP', 400));
    }

    // Mark phone as verified and clear OTP
    user.isPhoneVerified = true;
    user.smsOtp = null;
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
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
    
    // Update user with new OTP
    user.emailOtp = emailOtp;
    user.otpExpiresAt = otpExpiresAt;
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
      user.emailOtp = null;
      user.otpExpiresAt = null;
      await user.save({ validateBeforeSave: false });
      
      return next(
        new AppError('There was an error sending the OTP. Please try again later.', 500)
      );
    }
  }
);

/**
 * Resend SMS OTP
 */
export const resendSmsOTP = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { phoneNumber } = req.body;

    // Find user by phone number
    const user = await User.findOne({ phoneNumber });
    if (!user) {
      return next(new AppError('User not found', 404));
    }

    // Generate new OTP
    const smsOtp = generateOTP();
    
    // Set OTP expiration (10 minutes from now)
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
    
    // Update user with new OTP
    user.smsOtp = smsOtp;
    user.otpExpiresAt = otpExpiresAt;
    await user.save({ validateBeforeSave: false });
    
    // Send OTP
    try {
      await sendOTPSMS(phoneNumber, smsOtp);
      
      res.status(200).json({
        status: 'success',
        message: 'SMS OTP resent successfully',
      });
    } catch (error) {
      // Reset OTP in case of error
      user.smsOtp = null;
      user.otpExpiresAt = null;
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
      user.passwordResetToken = null;
      user.passwordResetExpires = null;
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
    user.passwordResetToken = null;
    user.passwordResetExpires = null;
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
    if (!(await user.comparePassword(currentPassword))) {
      return next(new AppError('Your current password is incorrect', 401));
    }

    // Update password
    user.password = newPassword;
    await user.save();

    // Log user in with new password (send new JWT)
    createSendToken(user, 200, res);
  }
); 