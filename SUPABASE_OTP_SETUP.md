# Supabase Email OTP Verification - Setup Guide

## Files Created

1. **supabase-config.js** - Initializes Supabase client with your credentials
2. **otp.js** - Contains `sendOtp()` and `verifyOtp()` functions
3. **otp.html** - UI for OTP signup verification

## Supabase Configuration

### Step 1: Enable Email Provider

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Navigate to **Authentication** → **Providers**
3. Find **Email** provider and toggle it ON
4. Ensure **Confirm email** is enabled (for OTP flow)

### Step 2: Configure Redirect URLs

1. In Supabase Dashboard, go to **Authentication** → **URL Configuration**
2. Add your local development URL:
   - `http://127.0.0.1:5500`
   - `http://localhost:3000` (or whatever port you use)
3. For production, add your actual domain URL

### Step 3: Customize Email Template (Important!)

**Email templates need to be modified to show OTP instead of magic link:**

1. Go to **Authentication** → **Email Templates**
2. Click on **Confirm email**
3. Modify the template to include the OTP token:

```html
<h2>Verify your email</h2>
<p>Enter this verification code:</p>
<h1 style="font-size: 32px; font-weight: bold; letter-spacing: 5px;">{{ .Token }}</h1>
<p>This code expires in 24 hours.</p>
```

Or use the full template:

```html
<h2>Confirm your signup</h2>

<p>Follow this link to confirm your user:</p>
<p><a href="{{ .ConfirmationURL }}">Confirm your email</a></p>

<hr />

<p>Or enter this verification code: <strong>{{ .Token }}</strong></p>
```

### Step 4: Ensure Email Settings

1. Go to **Project Settings** → **Email**
2. Authentication email sender should be configured
3. Default email is `noreply@...supabase.co` (for free tier)

## Running the Application

### Option 1: Using VS Code Live Server

1. Install [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) extension
2. Right-click **otp.html** → Select **"Open with Live Server"**
3. App will open at `http://127.0.0.1:5500/otp.html`

### Option 2: Using Python

```bash
# Python 3
python -m http.server 5500

# Python 2
python -m SimpleHTTPServer 5500
```

Then visit: `http://127.0.0.1:5500/otp.html`

### Option 3: Using Node.js http-server

```bash
npm install -g http-server
http-server -p 5500
```

## How the OTP Flow Works

### Signup (With OTP)

1. User enters email → clicks **"Send OTP"**
2. `sendOtp()` calls `supabase.auth.signInWithOtp({ email, shouldCreateUser: true })`
3. User receives OTP in email
4. User enters OTP → clicks **"Verify OTP"**
5. `verifyOtp()` calls `supabase.auth.verifyOtp({ email, token, type: 'email' })`
6. Account is created and verified
7. User is automatically logged in

### Login (No OTP)

- For normal login, create a separate form with email/password or use a different Supabase method
- OTP is **only** used during signup

## Testing the System

### Test Email Addresses

1. **Local Testing**: Supabase provides test email addresses
   - Use any format: `test+anything@supabase.local` (may not work in production)
   - Or use real email addresses

2. **With Real Email**:
   - Use your actual email address
   - Check spam/promotions folder for OTP email
   - Copy the 6-digit code

### Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| "Email not found" | Ensure HTTP server is running at configured URL |
| OTP not received | Check email spam folder; check Supabase email settings |
| "Invalid OTP" | Ensure OTP hasn't expired (usually 24 hours); verify correct email |
| CORS errors | Make sure you're using `http://` not `file://` |
| "API key not found" | Verify credentials in supabase-config.js are correct |

## Security Notes

⚠️ **Important**: 

- The `supabase-config.js` contains your **anon key** (public key), which is safe to expose
- The anon key can only perform operations you've allowed via Row Level Security (RLS)
- For production, ensure proper security rules are configured in Supabase

## Project Structure

```
Unisys-1/
├── otp.html                 ← Open this file (on HTTP server)
├── otp.js                   ← OTP functions (sendOtp, verifyOtp)
├── supabase-config.js       ← Supabase client config
├── (other existing files)
```

## Next Steps

1. ✅ Create `supabase-config.js`, `otp.js`, `otp.html`
2. ✅ Set Supabase credentials
3. 📋 Configure Supabase Email Provider
4. 📋 Add Redirect URLs in Supabase
5. 📋 Customize Email Template
6. 🚀 Start local server
7. 🧪 Test OTP flow

## Additional Features (Optional)

You can extend this system with:

- **Password strength validation** on signup
- **Rate limiting** for OTP requests (built into Supabase)
- **Remember me** functionality
- **Social sign-in** (Google, GitHub, etc.)
- **Analytics** tracking

## Resources

- [Supabase Auth Docs](https://supabase.com/docs/guides/auth)
- [Email OTP Guide](https://supabase.com/docs/guides/auth/auth-email-otp)
- [JavaScript Client Docs](https://supabase.com/docs/reference/javascript/auth-signinwithotp)
