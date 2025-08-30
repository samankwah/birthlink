@echo off
echo 🔥 Firebase Storage Setup for BirthLink Ghana
echo ==============================================

REM Check if Firebase CLI is installed
firebase --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Firebase CLI is not installed. Please install it first:
    echo npm install -g firebase-tools
    pause
    exit /b 1
)

echo ✅ Firebase CLI found

REM Login to Firebase
echo 🔑 Logging into Firebase...
firebase login

REM Verify and set project
echo 📋 Current Firebase project:
firebase use --list

echo 🎯 Setting Firebase project...
firebase use birthlink-8772c

REM Deploy storage rules
echo 🛡️ Deploying Storage security rules...
firebase deploy --only storage

REM Optional: Deploy hosting
set /p deploy_app="🚀 Would you like to deploy the application? (y/n): "
if /i "%deploy_app%"=="y" (
    echo 🏗️ Building application...
    npm run build
    
    echo 🚀 Deploying to Firebase Hosting...
    firebase deploy --only hosting
    
    echo ✅ Application deployed!
    firebase hosting:open
)

REM Optional: CORS setup reminder
set /p apply_cors="🌐 Would you like CORS setup instructions? (y/n): "
if /i "%apply_cors%"=="y" (
    echo 📄 CORS Setup Instructions:
    echo 1. Install Google Cloud SDK: https://cloud.google.com/sdk/docs/install
    echo 2. Run: gcloud auth login
    echo 3. Run: gsutil cors set cors.json gs://birthlink-8772c.firebasestorage.app
    echo.
    echo Manual setup instructions are in FIREBASE_STORAGE_SETUP.md
)

echo.
echo 🎉 Firebase Storage setup completed!
echo.
echo Next steps:
echo 1. Test profile picture upload at your app URL
echo 2. Check Firebase Console ^> Storage to see uploaded files  
echo 3. If you get CORS errors, follow the CORS setup above
echo.
echo 📚 For troubleshooting, see: FIREBASE_STORAGE_SETUP.md
pause