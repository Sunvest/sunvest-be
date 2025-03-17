# Phone Number Formatting Guide

For SMS verification to work correctly, phone numbers must be properly formatted. This guide explains the expected formats and how phone numbers are processed in our system.

## E.164 Format

Our system uses the E.164 international phone number format, which is:

- A plus sign (+)
- The country code
- The national phone number

Examples:
- `+234701234567` - Nigerian number
- `+1555123456` - US/Canada number
- `+447123456789` - UK number

## Nigerian Phone Numbers

Since our platform is primarily for Nigerian users, we have special handling for Nigerian phone numbers:

### Automatic Formatting

If you provide a Nigerian phone number in any of these formats, our system will automatically convert it to E.164:

- `0701234567` → `+234701234567`
- `701234567` → `+234701234567`

### Valid Nigerian Prefixes

Valid Nigerian mobile prefixes include:
- 070, 080, 081, 090, 091, etc.

## Input Tips for Users

When entering a phone number:

1. **International Format**: Include the country code with a plus sign (e.g., `+234...`)
2. **Nigerian Format**: Start with `0` (e.g., `0701234567`)
3. **No Spaces or Special Characters**: Don't include spaces, dashes, or parentheses

## Troubleshooting

If SMS verification fails:

1. Check that the phone number is entered correctly
2. Ensure the number is active and can receive SMS
3. Try using the international format with the plus sign
4. If using a Nigerian number, ensure it starts with the correct prefix

## Testing

During development and testing:

1. With `FIREBASE_PHONE_VERIFICATION_ENABLED=false`, any phone format will work (mock mode)
2. With `FIREBASE_PHONE_VERIFICATION_ENABLED=true`, you must use valid phone formats
3. For testing with Firebase, you can use the test numbers provided in the Firebase console 