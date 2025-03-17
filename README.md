# Solar & Biogas Investment Platform

A platform for users to invest in solar and biogas projects with dynamic token pricing based on real-world conditions.

## Features

- User authentication (signup, login, email/phone verification)
- Wallet funding via Direct Virtual Accounts
- Token purchasing with dynamic pricing based on weather conditions
- Project investments with real-time tracking
- Admin panel for platform management

## Tech Stack

- Backend: Node.js, Express, TypeScript, MongoDB
- Authentication: Custom JWT-based auth with email verification
- Email: Nodemailer with customizable SMTP support
- APIs: OpenWeatherMap for solar pricing logic

## Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Set up environment variables in `.env` file:

```
MONGODB_URI=your_mongodb_connection_string
PORT=5000
NODE_ENV=development
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:3000

# Email Configuration (SMTP)
EMAIL_FROM=your-email@gmail.com
EMAIL_FROM_NAME=Solar Investment Platform
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

For detailed email setup instructions, see [Email Setup Guide](docs/email-setup.md).

4. Start the development server:

```bash
npm run dev
```

## Testing

### Seed Test Data

To populate the database with test users:

```bash
npm run seed
```

This creates the following test users:
- Email: test@example.com, Password: password123 (Email and Phone verified)
- Email: jane@example.com, Password: password123 (Not verified)
- Email: john@example.com, Password: password123 (Email verified only)

To clear test data:

```bash
npm run seed:delete
```

### Testing UI

For a visual way to test the authentication system:

```bash
npm run ui
```

Then navigate to `http://localhost:5000` in your browser.

### Test API Endpoints

To test all authentication endpoints via scripts:

```bash
npm run test:api
```

You can provide email and SMS OTPs as command line arguments:

```bash
npm run test:api 123456 654321
```

Where the first argument is the email OTP and the second is the SMS OTP.

### Test Investment Features (Placeholder)

To test investment features (placeholder for future implementation):

```bash
npm run test:investment
```

## API Endpoints

### Authentication

- `POST /api/v1/auth/signup` - Register a new user
- `POST /api/v1/auth/login` - Login
- `GET /api/v1/auth/logout` - Logout
- `POST /api/v1/auth/verify-email` - Verify email with OTP
- `POST /api/v1/auth/verify-phone` - Verify phone with OTP
- `POST /api/v1/auth/resend-email-otp` - Resend email OTP
- `POST /api/v1/auth/resend-sms-otp` - Resend SMS OTP
- `POST /api/v1/auth/forgot-password` - Request password reset
- `POST /api/v1/auth/reset-password` - Reset password with token
- `PATCH /api/v1/auth/update-password` - Update password (authenticated) 