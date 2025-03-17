# Solar & Biogas Investment Platform

A secure investment platform for solar and biogas projects with a custom authentication system.

## Features

- User authentication (signup, login, logout)
- Email verification via SMTP
- Phone verification via Firebase SMS
- Password management (reset, update)
- JWT-based authentication
- MongoDB data storage
- TypeScript throughout

## Installation & Setup

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Create a `.env` file based on `.env.example`
4. Set up your SMTP email provider (see [Email Setup Guide](docs/email-setup.md))
5. Set up Firebase for SMS verification (see [Firebase SMS Setup Guide](docs/firebase-sms-setup.md))
6. Start the development server:
   ```
   npm run dev
   ```

## Testing the Platform

### Using HTML Test UI

The simplest way to test the authentication system is using the built-in HTML UI:

1. Start the server:
   ```
   npm run ui
   ```
2. Open your browser to `http://localhost:5000`
3. Use the UI to test signup, login, verification, and password management

### Using Test Scripts

You can also use the included test scripts:

1. Seed the database with test data:
   ```
   npm run seed
   ```
2. Test API endpoints:
   ```
   npm run test:api
   ```

## Authentication Flow

1. User signs up with email, phone, password, and personal details
2. System sends verification OTPs to email (via SMTP) and phone (via Firebase)
3. User verifies their email and phone with the received OTPs
4. User can then log in with email/password
5. JWT token is issued for authenticated API access

## Environment Variables

See `.env.example` for required environment variables:

- Server configuration
- MongoDB connection
- JWT secrets
- SMTP email settings
- Firebase configuration

## API Documentation

### Auth Endpoints

- `POST /api/v1/auth/signup` - Register a new user
- `POST /api/v1/auth/login` - Authenticate a user
- `POST /api/v1/auth/verify-email` - Verify email OTP
- `POST /api/v1/auth/verify-phone` - Verify phone OTP
- `POST /api/v1/auth/resend-email-otp` - Resend email OTP
- `POST /api/v1/auth/resend-phone-otp` - Resend phone OTP
- `POST /api/v1/auth/forgot-password` - Request password reset
- `POST /api/v1/auth/reset-password` - Reset password with token
- `POST /api/v1/auth/logout` - Log out a user
- `GET /api/v1/auth/me` - Get authenticated user profile
- `PATCH /api/v1/auth/update-password` - Update user password

## License

MIT 