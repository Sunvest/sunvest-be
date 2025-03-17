import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Email configuration
const EMAIL_FROM = process.env.EMAIL_FROM || '';
const EMAIL_FROM_NAME = process.env.EMAIL_FROM_NAME || 'Solar Investment Platform';
const SMTP_HOST = process.env.SMTP_HOST || '';
const SMTP_PORT = parseInt(process.env.SMTP_PORT || '587', 10);
const SMTP_USER = process.env.SMTP_USER || '';
const SMTP_PASS = process.env.SMTP_PASS || '';

// Create transporter
const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: SMTP_PORT,
  secure: SMTP_PORT === 465, // true for 465, false for other ports
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASS,
  },
});

/**
 * Verify SMTP connection
 * @returns Promise that resolves if connection is successful
 */
export const verifyConnection = async (): Promise<void> => {
  return new Promise((resolve, reject) => {
    transporter.verify((error) => {
      if (error) {
        console.error('SMTP connection error:', error);
        reject(new Error(`SMTP connection failed: ${error.message}`));
      } else {
        console.log('SMTP server is ready to send emails');
        resolve();
      }
    });
  });
};

/**
 * Send email
 * @param to Recipient email
 * @param subject Email subject
 * @param html HTML content
 * @param text Plain text content
 */
export const sendEmail = async (
  to: string,
  subject: string,
  html: string,
  text: string
): Promise<void> => {
  const mailOptions = {
    from: `"${EMAIL_FROM_NAME}" <${EMAIL_FROM}>`,
    to,
    subject,
    text,
    html,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Failed to send email');
  }
};

/**
 * Generate OTP email content
 * @param otp OTP code
 * @param name Recipient's name
 * @returns HTML and plain text content
 */
export const generateOTPEmailContent = (
  otp: string,
  name?: string
): { html: string; text: string } => {
  const greeting = name ? `Hello ${name},` : 'Hello,';

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2c3e50;">Email Verification</h2>
      <p>${greeting}</p>
      <p>Your verification code is:</p>
      <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;">
        ${otp}
      </div>
      <p>This code will expire in 10 minutes.</p>
      <p>If you didn't request this code, you can safely ignore this email.</p>
      <p>Best regards,<br>Solar Investment Platform Team</p>
    </div>
  `;

  const text = `
    Email Verification
    
    ${greeting}
    
    Your verification code is: ${otp}
    
    This code will expire in 10 minutes.
    
    If you didn't request this code, you can safely ignore this email.
    
    Best regards,
    Solar Investment Platform Team
  `;

  return { html, text };
};

/**
 * Generate password reset email content
 * @param resetToken Reset token
 * @param name Recipient's name
 * @returns HTML and plain text content
 */
export const generatePasswordResetEmailContent = (
  resetToken: string,
  name?: string
): { html: string; text: string } => {
  const greeting = name ? `Hello ${name},` : 'Hello,';
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2c3e50;">Password Reset</h2>
      <p>${greeting}</p>
      <p>We received a request to reset your password. Use the token below to complete the process:</p>
      <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; text-align: center; font-size: 18px; font-weight: bold; margin: 20px 0;">
        ${resetToken}
      </div>
      <p>This token will expire in 10 minutes.</p>
      <p>If you didn't request a password reset, you can safely ignore this email.</p>
      <p>Best regards,<br>Solar Investment Platform Team</p>
    </div>
  `;

  const text = `
    Password Reset
    
    ${greeting}
    
    We received a request to reset your password. Use the token below to complete the process:
    
    ${resetToken}
    
    This token will expire in 10 minutes.
    
    If you didn't request a password reset, you can safely ignore this email.
    
    Best regards,
    Solar Investment Platform Team
  `;

  return { html, text };
}; 