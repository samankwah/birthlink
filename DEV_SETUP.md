# 🚀 Development Setup Guide

## Quick Start for Developers

### Seeing Firebase API Key Error?

If you see the error `Firebase: Error (auth/api-key-not-valid.-please-pass-a-valid-api-key.)`, you have 2 options:

### Option 1: Use Firebase Emulator (Fastest for Testing)

1. Install Firebase CLI:
   ```bash
   npm install -g firebase-tools
   ```

2. Login to Firebase:
   ```bash
   firebase login
   ```

3. Initialize Firebase in the project:
   ```bash
   firebase init
   ```
   - Select "Emulators"
   - Choose "Authentication" and "Firestore"
   - Use default ports

4. Start the emulators:
   ```bash
   firebase emulators:start
   ```

5. The app will automatically connect to the emulators!

### Option 2: Create Real Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create new project: "BirthLink Ghana Test"
3. Add web app
4. Copy config to `.env`:

```env
VITE_FIREBASE_API_KEY=your_real_api_key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

5. Enable Authentication → Email/Password
6. Create Firestore database

## 🎯 Current Status

✅ **UI is working perfectly!** - Beautiful, responsive, professional  
✅ **Authentication flow** - Multi-step registration complete  
✅ **Error handling** - User-friendly error messages  
🔧 **Just needs Firebase config** - Then fully functional!

## 🎨 UI Features Implemented

- **Modern gradient design** with Ghana-inspired colors
- **Multi-step registration wizard** with progress indicator
- **Mobile-responsive layout** that looks great on all devices
- **Form validation** with real-time feedback
- **Professional error handling** with helpful messages
- **Ghana-specific features** (regions, phone validation)

The app is **production-ready** once Firebase is configured! 🇬🇭✨