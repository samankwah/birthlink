#!/bin/bash

# Firebase Storage Setup Script
echo "🔥 Firebase Storage Setup for BirthLink Ghana"
echo "=============================================="

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI is not installed. Please install it first:"
    echo "npm install -g firebase-tools"
    exit 1
fi

echo "✅ Firebase CLI found"

# Login to Firebase (will open browser)
echo "🔑 Logging into Firebase..."
firebase login

# Verify project is set correctly
echo "📋 Current Firebase project:"
firebase use --list

# Set the project if not already set
echo "🎯 Setting Firebase project..."
firebase use birthlink-8772c

# Deploy storage rules
echo "🛡️ Deploying Storage security rules..."
firebase deploy --only storage

# Deploy hosting (optional)
echo "🚀 Would you like to deploy the application? (y/n)"
read -r deploy_app
if [ "$deploy_app" = "y" ] || [ "$deploy_app" = "Y" ]; then
    echo "🏗️ Building application..."
    npm run build
    
    echo "🚀 Deploying to Firebase Hosting..."
    firebase deploy --only hosting
    
    echo "✅ Application deployed!"
    firebase hosting:open
fi

# Apply CORS configuration (requires gcloud CLI)
echo "🌐 Would you like to apply CORS configuration? (requires gcloud CLI) (y/n)"
read -r apply_cors
if [ "$apply_cors" = "y" ] || [ "$apply_cors" = "Y" ]; then
    if ! command -v gcloud &> /dev/null; then
        echo "❌ gcloud CLI is not installed. Please install it to apply CORS:"
        echo "https://cloud.google.com/sdk/docs/install"
        echo "📄 Manual CORS setup instructions are in FIREBASE_STORAGE_SETUP.md"
    else
        echo "🌐 Applying CORS configuration..."
        gcloud auth login
        gsutil cors set cors.json gs://birthlink-8772c.firebasestorage.app
        echo "✅ CORS configuration applied"
    fi
fi

echo ""
echo "🎉 Firebase Storage setup completed!"
echo ""
echo "Next steps:"
echo "1. Test profile picture upload at your app URL"
echo "2. Check Firebase Console > Storage to see uploaded files"
echo "3. If you get CORS errors, run the CORS setup above"
echo ""
echo "📚 For troubleshooting, see: FIREBASE_STORAGE_SETUP.md"