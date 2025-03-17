import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Email configuration
const {
  EMAIL_FROM,
  EMAIL_FROM_NAME,
  SMTP_HOST,
  SMTP_PORT,
  SMTP_USER,
  SMTP_PASS
} = process.env;

// Create a transporter
const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: Number(SMTP_PORT),
  secure: Number(SMTP_PORT) === 465, // true for 465, false for other ports
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASS,
  },
});

// Verify transporter connection at startup
const verifyConnection = async (): Promise<void> => {
  try {
    await transporter.verify();
    console.log('SMTP server connection established');
  } catch (error) {
    console.error('Error connecting to SMTP server:', error);
    console.log('Emails will be logged to console instead');
  }
};

// Call verify at startup
verifyConnection();

/**
 * Send an email
 * @param to Recipient email
 * @param subject Email subject
 * @param html HTML content
 * @param text Plain text content (fallback)
 */
export const sendEmail = async (
  to: string,
  subject: string,
  html: string,
  text?: string
): Promise<void> => {
  try {
    // Email options
    const mailOptions = {
      from: `"${EMAIL_FROM_NAME}" <${EMAIL_FROM}>`,
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, ''), // Strip HTML tags for text version
    };

    // Send email
    await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${to}`);
  } catch (error) {
    console.error('Error sending email:', error);
    // Log email to console as fallback
    console.log('=======================================');
    console.log('Email would have been sent:');
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Body: ${text || html.replace(/<[^>]*>/g, '')}`);
    console.log('=======================================');
    
    throw new Error('Failed to send email');
  }
};

/**
 * Generate OTP email content
 * @param otp OTP code to include in email
 * @param name Recipient's name
 * @returns HTML and text content
 */
export const generateOTPEmailContent = (
  otp: string,
  name: string = 'there'
): { html: string; text: string } => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background-color: #28a745; padding: 20px; text-align: center; color: white;">
        <h2>Solar & Biogas Investment Platform</h2>
      </div>
      <div style="padding: 20px; border: 1px solid #e9e9e9; border-top: none;">
        <p>Hi ${name},</p>
        <p>Thank you for signing up! Please use the verification code below to complete your registration:</p>
        <div style="background-color: #f4f4f4; padding: 15px; margin: 20px 0; text-align: center; font-size: 24px; letter-spacing: 5px; font-weight: bold;">
          ${otp}
        </div>
        <p>This code will expire in 10 minutes.</p>
        <p>If you didn't request this code, please ignore this email.</p>
        <p>Regards,<br>The Solar & Biogas Investment Team</p>
      </div>
      <div style="background-color: #f4f4f4; padding: 10px; text-align: center; font-size: 12px; color: #666;">
        <p>This is an automated message, please do not reply.</p>
      </div>
    </div>
  `;

  const text = `
    Solar & Biogas Investment Platform
    
    Hi ${name},
    
    Thank you for signing up! Please use the verification code below to complete your registration:
    
    ${otp}
    
    This code will expire in 10 minutes.
    
    If you didn't request this code, please ignore this email.
    
    Regards,
    The Solar & Biogas Investment Team
    
    This is an automated message, please do not reply.
  `;

  return { html, text };
};

/**
 * Generate password reset email content
 * @param resetLink Link for password reset
 * @param name Recipient's name
 * @returns HTML and text content
 */
export const generatePasswordResetEmailContent = (
  resetToken: string,
  name: string = 'there'
): { html: string; text: string } => {
  const resetLink = `${process.env.CLIENT_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background-color: #28a745; padding: 20px; text-align: center; color: white;">
        <h2>Solar & Biogas Investment Platform</h2>
      </div>
      <div style="padding: 20px; border: 1px solid #e9e9e9; border-top: none;">
        <p>Hi ${name},</p>
        <p>You recently requested to reset your password. Click the button below to reset it:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetLink}" style="background-color: #28a745; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">Reset Password</a>
        </div>
        <p>Or copy and paste this link in your browser:</p>
        <p style="word-break: break-all; color: #0066cc;">${resetLink}</p>
        <p>If you prefer to enter the token manually, use:</p>
        <div style="background-color: #f4f4f4; padding: 15px; margin: 20px 0; text-align: center; font-size: 16px; font-family: monospace; word-break: break-all;">
          ${resetToken}
        </div>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request this reset, please ignore this email or contact support if you have concerns.</p>
        <p>Regards,<br>The Solar & Biogas Investment Team</p>
      </div>
      <div style="background-color: #f4f4f4; padding: 10px; text-align: center; font-size: 12px; color: #666;">
        <p>This is an automated message, please do not reply.</p>
      </div>
    </div>
  `;

  const text = `
    Solar & Biogas Investment Platform
    
    Hi ${name},
    
    You recently requested to reset your password. Please visit the link below to reset it:
    
    ${resetLink}
    
    If you prefer to enter the token manually, use: ${resetToken}
    
    This link will expire in 1 hour.
    
    If you didn't request this reset, please ignore this email or contact support if you have concerns.
    
    Regards,
    The Solar & Biogas Investment Team
    
    This is an automated message, please do not reply.
  `;

  return { html, text };
}; 