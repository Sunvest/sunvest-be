# Firebase SMS Verification Setup Guide

This guide will help you set up Firebase Authentication for SMS verification in the Solar Investment Platform.

## Prerequisites

- A Google account
- A Firebase project
- A verified credit card or billing account (Firebase Phone Authentication requires a payment method)

## Setting Up Firebase Project

1. **Create a Firebase Project**:
   - Go to the [Firebase Console](https://console.firebase.google.com/)
   - Click "Add project" and follow the prompts to create a new project
   - Enable Google Analytics if desired

2. **Enable Phone Authentication**:
   - In your Firebase project, navigate to "Authentication" in the left sidebar
   - Click on the "Sign-in method" tab
   - Find "Phone" in the list of sign-in providers and click on it
   - Toggle the "Enable" switch and click "Save"

3. **Set up a Firebase Web App**:
   - In the Firebase console, click on the gear icon (⚙️) next to "Project Overview" 
   - Select "Project settings"
   - Scroll down to "Your apps" section and click on the web icon (</>) to add a web app
   - Give your app a nickname and click "Register app"
   - You don't need to add Firebase SDK as we're using Firebase Admin SDK

## Getting Firebase Admin SDK Credentials

You have two options for Firebase Admin SDK authentication:

### Option 1: Using Service Account Key File (Recommended for Development)

1. **Generate a Service Account Key**:
   - In Firebase console, go to "Project settings" > "Service accounts"
   - Click "Generate new private key" button
   - Save the generated JSON file securely
   - Move this file to your project root and rename it to `firebase-service-account.json`
   - **IMPORTANT**: Never commit this file to version control!

2. **Update your `.env` file**:
   ```
   FIREBASE_USE_JSON_FILE=true
   FIREBASE_SERVICE_ACCOUNT_PATH=./firebase-service-account.json
   FIREBASE_PHONE_VERIFICATION_ENABLED=true
   ```

### Option 2: Using Environment Variables (Recommended for Production)

1. **Get Service Account Details**:
   - In Firebase console, go to "Project settings" > "Service accounts"
   - Note the values for "Project ID" and "Client email"
   - Generate a private key as described above
   - Open the JSON file and copy the private key value (multi-line string)

2. **Update your `.env` file**:
   ```
   FIREBASE_USE_JSON_FILE=false
   FIREBASE_PROJECT_ID=your-project-id
   FIREBASE_CLIENT_EMAIL=your-service-account-email@example.com
   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour Private Key Here\n-----END PRIVATE KEY-----\n"
   FIREBASE_PHONE_VERIFICATION_ENABLED=true
   ```

   **Note**: Make sure to preserve the newlines in the private key using `\n`.

## Testing Firebase SMS Verification

1. Set `FIREBASE_PHONE_VERIFICATION_ENABLED=false` during development to use mock mode
2. Set `FIREBASE_PHONE_VERIFICATION_ENABLED=true` when you want to test actual SMS delivery

## Limitations and Considerations

- Firebase Phone Authentication has usage limits and costs. Check the [Firebase pricing](https://firebase.google.com/pricing) page.
- Some phone numbers may be flagged as high risk and might not receive verification SMS.
- International phone numbers may require additional configuration.
- During development, you can use test phone numbers in the Firebase console.

## Troubleshooting

If you encounter issues with Firebase SMS verification:

1. Check the server logs for detailed error messages
2. Verify that your Firebase project has billing enabled
3. Ensure the phone number is in E.164 format (e.g., +234XXXXXXXXXX)
4. Confirm that your service account has the necessary permissions
5. Test with the Firebase Phone Authentication test numbers 