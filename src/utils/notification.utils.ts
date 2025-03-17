// Import email utilities
import {
  sendEmail,
  generateOTPEmailContent,
  generatePasswordResetEmailContent
} from './email.utils';

// Import Firebase phone auth utilities
import { generateFirebasePhoneOTP } from './firebase.utils';

/**
 * Send SMS via Firebase Phone Authentication
 * @param to Phone number recipient
 * @param text SMS content (not used with Firebase Phone Auth)
 * @returns VerificationId and status
 */
export const sendSMS = async (
  to: string,
  text: string
): Promise<{
  verificationId: string;
  status: string;
}> => {
  try {
    // Generate and send OTP via Firebase
    const result = await generateFirebasePhoneOTP(to);
    
    // Log for debugging
    console.log('=======================================');
    console.log('SMS Verification Initiated:');
    console.log(`To: ${to}`);
    console.log(`Status: ${result.status}`);
    console.log(`VerificationId: ${result.verificationId}`);
    console.log('=======================================');
    
    return result;
  } catch (error) {
    console.error('Error sending SMS:', error);
    
    // For fallback/testing, return mock verification ID
    const mockResult = {
      verificationId: `mock-verification-id-${Date.now()}`,
      status: 'fallback',
    };
    
    console.log('=======================================');
    console.log('SMS FALLBACK - Firebase Auth failed:');
    console.log(`To: ${to}`);
    console.log(`Body: ${text}`);
    console.log(`VerificationId: ${mockResult.verificationId}`);
    console.log('=======================================');
    
    return mockResult;
  }
};

/**
 * Send OTP via email
 * @param email Recipient email
 * @param otp OTP code
 * @param name Recipient's name
 */
export const sendOTPEmail = async (
  email: string,
  otp: string,
  name?: string
): Promise<void> => {
  const subject = 'Your Verification Code';
  const { html, text } = generateOTPEmailContent(otp, name);
  
  await sendEmail(email, subject, html, text);
};

/**
 * Send OTP via SMS
 * @param phoneNumber Recipient phone number
 * @param otp OTP code
 * @returns Firebase verification ID (needed for verification)
 */
export const sendOTPSMS = async (
  phoneNumber: string,
  otp: string
): Promise<string> => {
  // When using Firebase Phone Auth, the OTP is sent directly by Firebase
  // We don't need to send the OTP ourselves, but we still include it for legacy/fallback
  const text = `Your verification code is: ${otp}. This code will expire in 10 minutes.`;
  
  // Send SMS and get verification ID
  const { verificationId } = await sendSMS(phoneNumber, text);
  
  // Return verification ID (needed for verification)
  return verificationId;
};

/**
 * Send password reset link
 * @param email Recipient email
 * @param resetToken Reset token
 * @param name Recipient's name
 */
export const sendPasswordResetEmail = async (
  email: string,
  resetToken: string,
  name?: string
): Promise<void> => {
  const subject = 'Password Reset';
  const { html, text } = generatePasswordResetEmailContent(resetToken, name);
  
  await sendEmail(email, subject, html, text);
}; 