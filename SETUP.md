# GrowMe - Setup Guide

## Quick Start for Testers

If you're testing this app via the developer's Expo server (no setup required):

1. Install **Expo Go** on your phone
   - iOS: https://apps.apple.com/app/expo-go/id982107779
   - Android: https://play.google.com/store/apps/details?id=host.exp.exponent
2. Connect to the same WiFi as the developer
3. Scan the QR code shown on the developer's screen
4. Login with: `test@growme.com` / `Test123!`
5. For test payments, use card: `4242 4242 4242 4242`

For full setup (your own instance), continue below.

---

## Table of Contents

1. [Prerequisites](#1-prerequisites)
2. [Installation](#2-installation)
3. [Firebase Setup](#3-firebase-setup)
4. [Google Sign-In Setup](#4-google-sign-in-setup)
5. [Stripe Setup](#5-stripe-setup)
6. [Environment Configuration](#6-environment-configuration)
7. [Create Test Account](#7-create-test-account)
8. [Running the App](#8-running-the-app)
9. [Troubleshooting](#9-troubleshooting)

---

## 1. Prerequisites

- Node.js 18+
- npm or yarn
- Expo Go app on your phone
- Git

```bash
node --version
npm --version
```

---

## 2. Installation

```bash
git clone <repository-url>
cd GrowMe
npm install
```

---

## 3. Firebase Setup

### 3.1 Create a Firebase Project

1. Go to https://console.firebase.google.com
2. Click "Create a project"
3. Enter a project name
4. Click "Create project"

### 3.2 Enable Authentication

1. Go to Build → Authentication
2. Click "Get started"
3. Enable Email/Password

### 3.3 Create Firestore Database

1. Go to Build → Firestore Database
2. Click "Create database"
3. Select "Start in test mode"
4. Choose a location
5. Click "Enable"

### 3.4 Get Firebase Configuration

1. Go to Project Settings (gear icon)
2. Scroll to "Your apps"
3. Click the Web icon
4. Register the app
5. Copy the configuration values

### 3.5 Set Firestore Security Rules

Go to Firestore Database → Rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /plants/{plantId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    match /orders/{orderId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null;
    }
    match /favorites/{docId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

---

## 4. Google Sign-In Setup

### 4.1 Configure OAuth Consent Screen

1. Go to https://console.cloud.google.com
2. Select your project
3. Go to APIs & Services → OAuth consent screen
4. Select "External" and create
5. Fill in required fields
6. Click "Publish App"

### 4.2 Create OAuth Client ID

1. Go to APIs & Services → Credentials
2. Click "+ CREATE CREDENTIALS" → "OAuth client ID"
3. Select "Web application"
4. Add authorized redirect URI:
   ```
   https://auth.expo.io/@your-expo-username/growme
   ```
5. Copy the Client ID

---

## 5. Stripe Setup

### 5.1 Create Stripe Account

1. Go to https://dashboard.stripe.com/register
2. Create an account

### 5.2 Get API Keys

1. Go to https://dashboard.stripe.com/test/apikeys
2. Copy the Publishable key and Secret key

### 5.3 Deploy Payment Backend

```bash
cd stripe-backend
npm install
npx vercel
```

Add the Stripe secret key:

```bash
npx vercel env add STRIPE_SECRET_KEY
npx vercel --prod
```

---

## 6. Environment Configuration

Create a `.env` file:

```env

// FIREBASE //
EXPO_PUBLIC_FIREBASE_API_KEY=your_api_key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your-project
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
EXPO_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:abcdef123456

// GOOGLE EXPO CLIENT //
EXPO_PUBLIC_GOOGLE_EXPO_CLIENT_ID=your-client-id.apps.googleusercontent.com

// STRIPE //
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
EXPO_PUBLIC_STRIPE_BACKEND_URL=https://your-project.vercel.app
```

---

## 7. Create Test Account

A test account is displayed on the login screen for easy access.

### Create the account in Firebase:

1. Go to Firebase Console → Authentication
2. Click "Add user"
3. Enter:
   - Email: `test@growme.com`
   - Password: `Test123!`
4. Click "Add user"

### Seed sample data:

```bash
npm run seed
```

---

## 8. Running the App

```bash
npm start
```

Open Expo Go and scan the QR code.

### Test Payment

Card: `4242 4242 4242 4242`
Expiry: Any future date
CVC: Any 3 digits

---

## 9. Troubleshooting

### Firebase errors
- Verify all environment variables
- Run `npm start -- --clear`

### Google Sign-In blocked
- Publish the app in OAuth consent screen
- Verify redirect URI

### Payments not working
- Check Stripe secret key in Vercel
- Verify backend URL

### Plants not showing
```bash
npm run seed
```

---

## Production Build

```bash
npx eas build --platform ios
npx eas build --platform android
```
