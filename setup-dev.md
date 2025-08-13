# BirthLink Ghana - Development Setup

## Quick Start (Mock Mode)
The application will automatically use mock authentication if Firebase emulators fail to start.

## Firebase Emulators Setup (Recommended)

### 1. Install Java
Firebase emulators require Java Runtime Environment (JRE).

**For WSL/Linux:**
```bash
sudo apt update
sudo apt install openjdk-11-jre-headless
```

**For Windows:**
- Download Java from https://www.oracle.com/java/technologies/downloads/
- Install and ensure `java` is in your PATH

### 2. Start Emulators
```bash
# In project directory
firebase emulators:start --only auth,firestore
```

### 3. Development Server
```bash
npm run dev
```

## Environment Configuration

The app will automatically:
1. **Try Firebase emulators** (if available)
2. **Fallback to mock auth** (if emulators fail)
3. **Use real Firebase** (in production)

## Current Status
- ✅ Mock authentication working
- ✅ Offline-first architecture  
- ✅ PWA functionality
- ⚠️ Firebase emulators need Java installation

## Test Credentials (Mock Mode)
- **Email**: any@example.com
- **Password**: any password
- **Role**: Automatically assigned as registrar