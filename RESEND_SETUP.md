# Resend Email API Configuration Guide

## Issues Fixed:
1. ✅ Added email column to students table
2. ✅ Moved API key to environment variables (security)
3. ✅ Changed from address to configurable environment variable
4. ✅ Added detailed error logging and better error handling
5. ✅ Professional HTML email templates with styling

## Setup Required:

### 1. Get Resend API Key
- Go to https://resend.com
- Sign up for a free account
- Navigate to API Keys section
- Copy your API key (starts with `re_`)

### 2. Verify Your Sender Email

**Option A: Use Resend's Test Email (Development)**
```
FROM_EMAIL=onboarding@resend.dev
```

**Option B: Verify Your Own Domain (Production)**
- In Resend Dashboard, go to "Domains"
- Add your domain (e.g., `noreply@yourdomain.com`)
- Follow DNS verification steps
- Set in environment variables

### 3. Set Environment Variables

Create or edit `.env` file in project root:
```
RESEND_API_KEY=re_your_actual_key_here
FROM_EMAIL=onboarding@resend.dev
```

Or on Windows PowerShell:
```powershell
$env:RESEND_API_KEY = "re_your_actual_key_here"
$env:FROM_EMAIL = "onboarding@resend.dev"
node server.js
```

### 4. Update Student Records with Emails

Your students table now has an `email` column. Add emails:

```sql
UPDATE students SET email = 'student1@example.com' WHERE id = 1;
UPDATE students SET email = 'student2@example.com' WHERE id = 2;
```

## Testing

1. Ensure PostgreSQL is running
2. Restart the server to pick up environment variables
3. Click "Email Defaulters" button
4. Check browser console for error messages
5. Check server terminal for `[SEND-EMAILS]` logs

## Common Issues:

### ❌ "401 Unauthorized"
- API key is invalid or expired
- Solution: Get a new key from Resend dashboard

### ❌ "Invalid from email"
- The FROM_EMAIL is not verified in Resend
- Solution: Use `onboarding@resend.dev` for testing, or verify your domain

### ❌ "No students found"
- Database has no students or attendance data
- Solution: Check database and seed with test data

### ❌ "Email failed to send"
- Check the `email` column has valid email addresses
- Solution: Update students table with real email addresses

## Monitoring

Server logs will show:
```
[SEND-EMAILS] Starting to send emails to X defaulters...
[SEND-EMAILS] Attempting to send email to student@example.com...
[SEND-EMAILS] ✅ Email sent to student@example.com. MessageId: xxxxx
[SEND-EMAILS] Complete. Success: X, Failed: Y
```

Check these logs to diagnose issues!
