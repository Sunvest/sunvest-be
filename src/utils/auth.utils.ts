import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// Generate JWT token
export const generateToken = (userId: string): string => {
  // @ts-ignore - Bypassing type errors with JWT
  return jwt.sign({ id: userId }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
};

// Generate OTP (6 digits)
export const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Generate password reset token
export const generatePasswordResetToken = (): string => {
  const resetToken = crypto.randomBytes(32).toString('hex');
  return resetToken;
};

// Hash a token
export const hashToken = (token: string): string => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

// Verify JWT token
export const verifyToken = (token: string): any => {
  try {
    // @ts-ignore - Bypassing type errors with JWT
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}; 