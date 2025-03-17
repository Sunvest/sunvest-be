# Email Setup Guide

This guide will help you set up your email service for the Solar & Biogas Investment Platform.

## Using Gmail

To use Gmail as your SMTP provider, follow these steps:

1. **Create or use an existing Gmail account**
   - It's recommended to create a dedicated email for your application

2. **Enable 2-Step Verification**
   - Go to your Google Account settings
   - Navigate to Security
   - Enable 2-Step Verification

3. **Generate an App Password**
   - Go to your Google Account settings
   - Navigate to Security
   - Under "Signing in to Google," select "App passwords"
   - Select "Mail" as the app and "Other" as the device (name it "Solar Platform")
   - Click "Generate"
   - Copy the 16-character password that appears

4. **Update your .env file**
   ```
   EMAIL_FROM=your-gmail@gmail.com
   EMAIL_FROM_NAME=Solar Investment Platform
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-gmail@gmail.com
   SMTP_PASS=your-16-character-app-password
   ```

## Using Other Email Providers

### Outlook/Office 365

```
EMAIL_FROM=your-email@outlook.com
EMAIL_FROM_NAME=Solar Investment Platform
SMTP_HOST=smtp.office365.com
SMTP_PORT=587
SMTP_USER=your-email@outlook.com
SMTP_PASS=your-password
```

### SendGrid

1. Create a SendGrid account
2. Create an API key with mail permissions
3. Update your .env file:

```
EMAIL_FROM=your-verified-sender@domain.com
EMAIL_FROM_NAME=Solar Investment Platform
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your-sendgrid-api-key
```

## Testing Your Configuration

After updating your .env file, restart the server. The system will attempt to verify the SMTP connection at startup.

You should see a log message: `SMTP server connection established`

If there's an error, you'll see: `Error connecting to SMTP server: [error details]`

## Gmail Limits

Note that Gmail has sending limits:
- 500 emails per day for regular Gmail accounts
- 2,000 emails per day for Google Workspace accounts

For production use with high volume, consider using a professional email service like SendGrid, Mailgun, or Amazon SES. 