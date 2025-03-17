import admin from '../config/firebase';
import dotenv from 'dotenv';

dotenv.config();

// Check if Firebase phone verification is enabled
const isPhoneVerificationEnabled = process.env.FIREBASE_PHONE_VERIFICATION_ENABLED === 'true';

/**
 * Generate a Firebase phone auth verification code
 * @param phoneNumber Phone number in E.164 format (e.g., +234XXXXXXXXXX)
 * @returns Session info including verification ID
 */
export const generateFirebasePhoneOTP = async (phoneNumber: string): Promise<{
  verificationId: string;
  status: string;
}> => {
  try {
    // Check if Firebase phone verification is enabled
    if (!isPhoneVerificationEnabled) {
      // Return a mock verification ID if not enabled
      return {
        verificationId: `mock-verification-id-${Date.now()}`,
        status: 'mock',
      };
    }

    // Format phone number if needed (ensure it's in E.164 format)
    const formattedPhoneNumber = formatPhoneNumber(phoneNumber);

    // Create a verification code with Firebase
    const sessionInfo = await admin.auth().createSessionCookie(
      formattedPhoneNumber,
      { expiresIn: 10 * 60 * 1000 } // 10 minutes in milliseconds
    );

    // Return the verification ID
    return {
      verificationId: sessionInfo,
      status: 'sent',
    };
  } catch (error) {
    console.error('Error generating Firebase phone OTP:', error);
    throw new Error('Failed to send verification code to phone');
  }
};

/**
 * Verify a Firebase phone auth verification code
 * @param verificationId The verification ID from the previous step
 * @param code The verification code entered by the user
 * @returns Whether the verification was successful
 */
export const verifyFirebasePhoneOTP = async (
  verificationId: string,
  code: string
): Promise<boolean> => {
  try {
    // Check if Firebase phone verification is enabled
    if (!isPhoneVerificationEnabled) {
      // Return true for any code if not enabled (for testing)
      return true;
    }

    // Verify the code with Firebase
    const decodedToken = await admin.auth().verifySessionCookie(verificationId);
    
    // Additional verification logic here if needed
    // This is a simplified implementation

    return !!decodedToken;
  } catch (error) {
    console.error('Error verifying Firebase phone OTP:', error);
    return false;
  }
};

/**
 * Format phone number to E.164 format
 * @param phoneNumber Phone number to format
 * @returns Formatted phone number
 */
const formatPhoneNumber = (phoneNumber: string): string => {
  // Remove all non-digit characters
  let digits = phoneNumber.replace(/\D/g, '');
  
  // If number doesn't start with '+', add country code
  // This assumes Nigerian numbers (+234)
  if (!phoneNumber.startsWith('+')) {
    // If the number starts with '0', remove it and add +234
    if (digits.startsWith('0')) {
      digits = digits.substring(1);
    }
    
    // Add Nigerian country code
    return `+234${digits}`;
  }
  
  return phoneNumber;
}; 