# Authentication System Documentation

This document provides a comprehensive overview of the authentication system implemented in the Solar Investment Platform.

## Features

The authentication system includes:

1. **User Registration & Login**
   - Email/password signup and login
   - Session management with JWT tokens
   - Secure password hashing with bcrypt

2. **Multi-Factor Verification**
   - Email verification via SMTP
   - Phone verification via Firebase SMS
   - OTP (One-Time Password) generation and validation

3. **Password Management**
   - Password reset via email
   - Password update for authenticated users
   - Secure token-based reset flow

4. **Security Features**
   - JWT with configurable expiry
   - HTTP-only cookies for token storage
   - Protection against common vulnerabilities
   - Rate limiting on sensitive endpoints

## Authentication Flow

### Signup Process

1. User submits registration information (email, phone, password, etc.)
2. System validates input and checks for existing users
3. Password is hashed securely
4. OTPs are generated for email and phone verification
5. User record is created in database with unverified status
6. OTPs are sent to email (via SMTP) and phone (via Firebase)
7. User ID is returned to client

### Verification Process

1. User receives OTPs via email and SMS
2. User submits OTPs for verification
3. System validates OTPs and updates verification status
4. User can now log in with full access

### Login Process

1. User submits email and password
2. System validates credentials
3. JWT token is generated and provided to user
4. User is authenticated for subsequent requests

### Password Reset Flow

1. User requests password reset with email
2. System generates reset token and sends email
3. User submits token and new password
4. System validates token and updates password

## Implementation Details

### User Model

The User model includes:
- Basic information (name, email, phone)
- Authentication fields (password hash, verification status)
- OTP handling (email/phone OTPs, expiry timestamps)
- Password reset fields (reset tokens, expiry timestamps)

### Email Service

Email functionality is implemented using:
- Nodemailer for sending emails
- Customizable SMTP configuration
- HTML and plain text email templates
- OTP and password reset email content generation

### SMS Service

SMS functionality is implemented using:
- Firebase Authentication for phone verification
- Automatic phone number formatting to E.164 format
- Fallback simulation mode for development/testing

### Token Management

JWT tokens are:
- Signed with a secure secret key
- Configured with customizable expiry
- Stored in HTTP-only cookies
- Validated on protected routes

## Integration with Frontend

The authentication system provides:
- RESTful API endpoints for all auth operations
- Clear error responses for client handling
- Testing UI for rapid development and verification

## Environment Configuration

Authentication requires the following environment variables:
- JWT configuration (secret, expiry)
- SMTP settings (host, port, credentials)
- Firebase configuration (project ID, credentials)
- Feature flags (e.g., enable/disable SMS verification)

## Testing

The system includes:
- HTML UI for manual testing
- Test scripts for automated API testing
- Data seeding utilities for test accounts
- Mock modes for email and SMS services

## Security Considerations

1. **Password Security**:
   - Passwords are hashed with bcrypt
   - Passwords are never stored in plain text
   - Minimum password length enforced

2. **OTP Security**:
   - OTPs expire after 10 minutes
   - OTPs are randomly generated 6-digit numbers
   - Failed verification attempts are logged

3. **API Security**:
   - Rate limiting on sensitive endpoints
   - Proper error handling to prevent information leakage
   - Input validation on all endpoints

## Extensions and Customization

The authentication system is designed to be extensible:
- Additional authentication factors can be added
- Social login can be integrated
- Role-based access control is supported

## Troubleshooting

Common issues and solutions:
- Email delivery problems (check SMTP settings)
- SMS verification issues (check Firebase configuration)
- JWT validation failures (check token expiry and secrets)

## API Reference

See [API Documentation](api-docs.md) for detailed endpoint specifications. 