# SMTP Setup (Defaulter Emails)

The "Email Defaulters" button (HOD + Faculty dashboards) sends mail through SMTP using Nodemailer.

## Default SMTP config used by backend

`server.js` is configured to use these defaults if env vars are not set:

- Host: `smtp.gmail.com`
- Port: `465`
- Secure: `true`
- User: `edusysalert@gmail.com`
- Password: Gmail App Password
- From: `edusysalert@gmail.com`

## Recommended env vars

Set these in your environment or `.env`:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=edusysalert@gmail.com
SMTP_PASS=your_gmail_app_password
SMTP_FROM=edusysalert@gmail.com
```

## Run

```bash
npm start
```

Backend endpoint used by dashboard buttons:

- `POST /send-emails`
