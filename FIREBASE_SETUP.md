# Firebase Setup Guide for BirthLink Ghana

## 🚀 Quick Setup Instructions

### 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project"
3. Enter project name: `birthlink-ghana`
4. Enable Google Analytics (recommended)
5. Select your analytics account
6. Click "Create project"

### 2. Enable Authentication

1. In Firebase Console, go to **Authentication** → **Get started**
2. Go to **Sign-in method** tab
3. Enable **Email/Password** authentication
4. Optionally enable **Phone** authentication for SMS verification

### 3. Set up Firestore Database

1. Go to **Firestore Database** → **Create database**
2. Start in **test mode** (you can secure it later)
3. Choose a location close to Ghana (e.g., `europe-west3` or `us-central1`)

### 4. Configure Web App

1. Go to **Project Settings** (gear icon) → **General** tab
2. Scroll to "Your apps" section
3. Click **Web** icon (`</>`)
4. Enter app nickname: `BirthLink Ghana Web`
5. Check "Also set up Firebase Hosting"
6. Click "Register app"
7. Copy the configuration object

### 5. Update Environment Variables

Replace the values in `.env` with your Firebase config:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com  
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### 6. Set up Firestore Security Rules

In **Firestore Database** → **Rules**, replace with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Birth registrations - role-based access
    match /registrations/{registrationId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null && 
        (get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['admin', 'registrar']);
      allow update: if request.auth != null && 
        (get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin' ||
         resource.data.registrarInfo.registrarId == request.auth.uid);
      allow delete: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // System config - admin only
    match /systemConfig/{document} {
      allow read, write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
  }
}
```

### 7. Create Admin User

After setup, create your first admin user:

1. Register through the app with your email
2. Go to Firebase Console → **Firestore Database**
3. Find your user document in the `users` collection
4. Edit the document and change `role` from `registrar` to `admin`
5. Change `status` from `pending` to `active`

## 🎯 Testing the Setup

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Open `http://localhost:5173`

3. Test the authentication flow:
   - Register a new account
   - Login with existing credentials
   - Test forgot password functionality

## 📱 Production Deployment

For production deployment:

1. Update `.env.production` with production Firebase config
2. Build the app: `npm run build`
3. Deploy to Firebase Hosting: `firebase deploy`

## 🔐 Security Considerations

- **Never commit** your `.env` file to version control
- Use different Firebase projects for development/staging/production
- Regularly review Firestore security rules
- Enable App Check for additional security (optional)
- Set up Firebase Security Rules for Storage if using file uploads

## 📞 Support

If you encounter issues:
1. Check the browser console for errors
2. Verify Firebase configuration in `.env`
3. Ensure Firestore rules are correctly set up
4. Check Firebase project permissions

---

**🇬🇭 Ready to digitize Ghana's birth registration system! 👶**