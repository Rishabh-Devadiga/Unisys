# Firebase email sending (SMTP) — UniSys_Project

This repo already queues email documents to Firestore collection `mail` (see `firebase-email.js`).  
This setup adds a Firebase Cloud Function that watches `mail/{docId}` and sends real emails via SMTP (Gmail App Password recommended).

## What you need
- A Firebase project with **Firestore** enabled.
- The Firebase CLI (`firebase-tools`).
- SMTP credentials (recommended: Gmail App Password).

## Step 1 — Put Firebase Web config in the app
Edit `firebase-config.js` and paste your Firebase config from:
Firebase Console → Project settings → Your apps → Web app → SDK config.

## Step 2 — Initialize Firebase in this folder
From `UniSys_Project`:
1. `npm i -g firebase-tools`
2. `firebase login`
3. `firebase init firestore functions`
   - Select your Firebase project
   - Functions language: **JavaScript**
   - Use existing `functions` folder when prompted
   - Don’t overwrite existing files if asked

## Step 3 — Install function deps
From `UniSys_Project\\functions`:
- `npm install`

## Step 4 — Set SMTP secrets (for deployed Functions)
From `UniSys_Project`:
- `firebase functions:secrets:set SMTP_HOST`
- `firebase functions:secrets:set SMTP_PORT`
- `firebase functions:secrets:set SMTP_SECURE`
- `firebase functions:secrets:set SMTP_USER`
- `firebase functions:secrets:set SMTP_PASS` (paste your Gmail **App Password**)
- `firebase functions:secrets:set SMTP_FROM`

Note: `.env` is only used for local emulators; deployed Functions use Secrets.

## Step 5 — Deploy
From `UniSys_Project`:
- `firebase deploy --only functions,firestore:rules`

## Step 6 — Test from the UI
Open `index.html`, login as HOD/Faculty, go to Defaulters:
- Click **Email Me (Test)** and enter your email when prompted.
- Click **Email Defaulters** to queue emails to the mock addresses.

In Firestore, look at `mail` docs:
- `delivery.state` becomes `sent` or `error`.

## Notes / safety
- The current `firestore.rules` are demo-only and allow anyone to create `mail` docs.
- Lock down rules before production.
