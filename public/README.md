# Authentication Testing UI

This is a simple HTML/JavaScript UI for testing the authentication features of the Solar & Biogas Investment Platform.

## Features

- User registration (signup)
- Login and logout
- Email and phone verification with OTP
- Password management (forgot password, reset password, update password)
- Real-time display of API responses
- User information display when authenticated

## Usage

1. Start the server:

```bash
npm run ui
```

2. Open your browser and go to:

```
http://localhost:5000
```

## Testing Flow

1. **Sign Up**: Create a new account with your email and phone number
2. **Check Console**: Look at the server console logs to see the OTPs that were generated
3. **Verify Email/Phone**: Use the OTPs from the console to verify your email and phone
4. **Login**: Test logging in with your credentials
5. **Password Management**: Test forgot password, reset password, and update password functions

## Notes

- This UI is for testing purposes only and should not be used in production
- The server simulates sending OTPs via email and SMS but actually just logs them to the console
- Your authentication state is stored in localStorage for convenience 