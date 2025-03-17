// Import email utilities
import {
  sendEmail,
  generateOTPEmailContent,
  generatePasswordResetEmailContent
} from './email.utils';

/**
 * Simulate sending an SMS (in a production environment, you would integrate with a real SMS service)
 * @param to Phone number recipient
 * @param text SMS content
 */
export const sendSMS = async (to: string, text: string): Promise<void> => {
  // This is just a simulation for now
  // In production, you would integrate with an SMS service like Twilio, Nexmo, etc.
  
  // Simulate SMS sending delay
  await new Promise((resolve) => setTimeout(resolve, 1000));
  
  // Log the SMS instead of actually sending it
  console.log('=======================================');
  console.log('SMS Sent:');
  console.log(`To: ${to}`);
  console.log(`Body: ${text}`);
  console.log('=======================================');
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
 */
export const sendOTPSMS = async (
  phoneNumber: string,
  otp: string
): Promise<void> => {
  const text = `Your verification code is: ${otp}. This code will expire in 10 minutes.`;
  
  await sendSMS(phoneNumber, text);
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