# Firebase Storage Setup Guide

## Current Issue
The profile picture upload is failing with "Storage service unavailable" due to Firebase Storage not being properly configured.

## Console Error Analysis
Based on the console logs, the issues are:
- `404 Not Found` from Firebase Storage API
- `CORS policy` blocking localhost requests  
- `storage/unknown` Firebase error code

## Required Steps to Fix

### 1. Enable Firebase Storage in Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your `birthlink-8772c` project
3. Navigate to **Storage** in the left sidebar
4. If you see "Get Started", click it to enable Storage
5. Choose "Start in test mode" for now (we'll deploy proper rules later)
6. Select your preferred location (choose closest to Ghana)
7. Click "Done"

### 2. Deploy Storage Rules (Command Line)

Run these commands in your project directory:

```bash
# Login to Firebase (will open browser)
firebase login

# Verify project is set
firebase use --list

# Deploy storage rules
firebase deploy --only storage
```

### 3. Alternative: Manual Rules Setup

If CLI doesn't work, manually update rules in Firebase Console:

1. Go to Firebase Console > Storage > Rules
2. Replace the default rules with:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Profile pictures: Allow authenticated users to upload their own
    match /profile-pictures/{userId}/{fileName} {
      allow read, write, delete: if request.auth != null 
                                  && request.auth.uid == userId
                                  && request.resource.size < 5 * 1024 * 1024
                                  && request.resource.contentType.matches('image/.*');
    }
    
    // Birth certificates: Allow authenticated users
    match /birth-certificates/{userId}/{fileName} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      allow read: if request.auth != null && 
                  request.auth.token.role in ['admin', 'registrar'];
    }
    
    // Public assets
    match /assets/{allPaths=**} {
      allow read;
    }
    
    // Deny all other access
    match /{allPaths=**} {
      allow read, write: if false;
    }
  }
}
```

3. Click "Publish"

### 4. Configure CORS (if needed)

Create a `cors.json` file:

```json
[
  {
    "origin": ["http://localhost:5173", "http://localhost:3000", "https://your-domain.com"],
    "method": ["GET", "POST", "PUT", "DELETE"],
    "maxAgeSeconds": 3600
  }
]
```

Apply CORS configuration:
```bash
gsutil cors set cors.json gs://birthlink-8772c.firebasestorage.app
```

### 5. Verify Storage is Working

1. Go to Firebase Console > Storage
2. You should see an empty storage bucket
3. The URL should be: `gs://birthlink-8772c.firebasestorage.app`

## Testing After Setup

1. Open your app at `http://localhost:5173/profile`
2. Try uploading a profile picture
3. Check browser console for any remaining errors
4. Verify the image appears immediately after upload

## Troubleshooting

### If you still get 404 errors:
- Storage bucket might not exist - check Firebase Console
- Project might not have Storage enabled
- Authentication might be required for Firebase CLI

### If you get CORS errors:
- Apply the CORS configuration above
- Make sure your development URL is in the allowed origins

### If you get permission errors:
- Check that Storage rules are deployed
- Verify user is authenticated when uploading
- Check that the file path matches the rules pattern

## Current Status
- ✅ Storage rules created (`storage.rules`)
- ✅ Firebase configuration updated (`firebase.json`)  
- ✅ Enhanced error handling in place
- ❌ Storage not enabled in Firebase Console (you need to do this)
- ❌ Rules not deployed (requires authentication)

The main blocker is enabling Firebase Storage in the console, which requires manual action.