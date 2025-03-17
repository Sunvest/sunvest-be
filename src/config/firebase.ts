import admin from 'firebase-admin';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

/**
 * Initialize Firebase Admin SDK
 */
let firebaseApp: admin.app.App;

try {
  // Check if we should use a JSON file for credentials
  const useJsonFile = process.env.FIREBASE_USE_JSON_FILE === 'true';
  
  if (useJsonFile) {
    // Load credentials from the JSON file
    const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH || 
                               path.join(__dirname, '../../firebase-service-account.json');
    
    if (!fs.existsSync(serviceAccountPath)) {
      throw new Error(`Firebase service account file not found at: ${serviceAccountPath}`);
    }
    
    const serviceAccount = require(serviceAccountPath);
    
    firebaseApp = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    
    console.log('Firebase Admin SDK initialized with service account JSON file');
  } else {
    // Use environment variables for credentials
    if (!process.env.FIREBASE_PROJECT_ID || 
        !process.env.FIREBASE_CLIENT_EMAIL || 
        !process.env.FIREBASE_PRIVATE_KEY) {
      throw new Error('Missing Firebase credentials in environment variables');
    }
    
    // Initialize Firebase Admin SDK with environment variables
    firebaseApp = admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        // Note: FIREBASE_PRIVATE_KEY is stored with double quotes and newlines
        // We need to parse it to use it correctly
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      }),
    });
    
    console.log('Firebase Admin SDK initialized with environment variables');
  }
} catch (error) {
  console.error('Failed to initialize Firebase Admin SDK:', error);
  
  // Initialize a dummy app for development if Firebase initialization failed
  if (!admin.apps.length) {
    firebaseApp = admin.initializeApp({
      projectId: 'solar-investment-platform-dev',
    });
    console.warn('Firebase initialized in development mode only - SMS verification will not work!');
  } else {
    firebaseApp = admin.app();
  }
}

export default firebaseApp; 