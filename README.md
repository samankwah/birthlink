# BirthLink Ghana 👶

> Offline-first birth registration system for remote Ghanaian communities

## Overview

BirthLink Ghana is a Progressive Web App (PWA) designed to streamline birth registration processes across Ghana's remote communities. Built with an offline-first architecture, the application enables continuous operation without internet connectivity, automatically synchronizing data when connection is restored.

## Features

### ✅ Phase 1 (Completed)
- **Authentication System**: Firebase Auth with role-based access control
- **Progressive Web App**: Installable, offline-capable web application
- **Multi-language Support**: English and Twi (Ga and Ewe infrastructure ready)
- **Responsive Design**: Mobile-first UI with TailwindCSS
- **State Management**: Redux Toolkit with offline persistence
- **Type Safety**: Full TypeScript implementation

### 🚧 Phase 2 (In Development)
- **Birth Registration Forms**: Complete validation and data collection
- **Offline Storage**: IndexedDB integration for local data persistence
- **Real-time Sync**: Firebase Firestore integration with conflict resolution
- **SMS Notifications**: Twilio integration for critical updates

## Tech Stack

### Frontend
- **React 18.2+** with TypeScript
- **Vite** for build tooling
- **Redux Toolkit** for state management
- **React Router v6** for routing
- **TailwindCSS** for styling
- **i18next** for internationalization

### Backend & Services
- **Firebase Authentication** for user management
- **Firebase Firestore** for data storage
- **Firebase Cloud Functions** for serverless logic
- **Twilio** for SMS notifications

### PWA Features
- **Service Worker** for offline functionality
- **Web App Manifest** for app installation
- **Background Sync** for data synchronization
- **Push Notifications** for user engagement

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Firebase project (for backend services)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd birth-link
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   # Copy environment template
   cp .env.example .env.local
   
   # Edit .env.local with your Firebase configuration
   VITE_FIREBASE_API_KEY=your_api_key_here
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   # ... other Firebase config
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Build for production**
   ```bash
   npm run build
   ```

### Firebase Setup

**Quick Start (Demo Mode):**
The application comes pre-configured with demo Firebase credentials for development. To use real Firebase:

1. **Create a Firebase project** at https://console.firebase.google.com
2. **Enable Authentication**:
   - Go to Authentication > Sign-in method
   - Enable Email/Password
3. **Create Firestore database**:
   - Go to Firestore Database > Create database
   - Start in test mode
4. **Get your config**:
   - Go to Project Settings > General
   - In "Your apps", click on web app or add one
   - Copy the Firebase configuration
5. **Update .env file**:
   ```bash
   VITE_FIREBASE_API_KEY=your_actual_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your-project-id
   # ... etc
   ```

**Firebase Storage Setup (Required for Profile Pictures):**
To enable profile picture uploads:

1. **Enable Storage in Firebase Console**:
   - Go to Firebase Console > Storage
   - Click "Get Started" if not already enabled
   - Choose your storage location (preferably close to Ghana)

2. **Deploy Storage Rules**:
   ```bash
   # Run the automated setup script
   ./setup-firebase-storage.sh   # macOS/Linux
   # OR
   setup-firebase-storage.bat    # Windows
   
   # Manual deployment
   firebase login
   firebase use your-project-id
   firebase deploy --only storage
   ```

3. **CORS Configuration (if needed)**:
   ```bash
   # Install Google Cloud SDK first
   gcloud auth login
   gsutil cors set cors.json gs://your-storage-bucket
   ```

> **Note**: If profile uploads fail with "Storage service unavailable", see [FIREBASE_STORAGE_SETUP.md](./FIREBASE_STORAGE_SETUP.md) for detailed troubleshooting.

**Using Firebase Emulators (Optional):**
For local development with Firebase emulators:
```bash
# Install Firebase CLI
npm install -g firebase-tools

# Start emulators
firebase emulators:start

# Enable emulators in .env
VITE_USE_FIREBASE_EMULATORS=true
```

## Project Structure

```
src/
├── components/
│   ├── atoms/           # Basic UI components
│   ├── molecules/       # Composite components
│   ├── organisms/       # Complex components (future)
│   └── templates/       # Page layouts
├── pages/               # Route components
├── hooks/               # Custom React hooks
├── store/               # Redux store configuration
│   └── slices/         # Redux slices
├── services/            # External service integrations
├── types/               # TypeScript type definitions
├── locales/            # Internationalization files
└── utils/              # Utility functions
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript compiler

## User Roles

### Admin
- Full system access
- User management
- System configuration
- Analytics and reporting

### Registrar
- Create and edit birth registrations
- View own registrations
- Basic reporting features

### Viewer
- Read-only access to assigned regions
- Basic analytics
- Registration viewing

## Languages Supported

- **English** (en) - Default
- **Twi** (tw) - Complete
- **Ga** (ga) - Infrastructure ready
- **Ewe** (ee) - Infrastructure ready

## Offline Capabilities

The application works completely offline with:
- **Local data storage** using IndexedDB
- **Background synchronization** when connectivity returns
- **Conflict resolution** for simultaneous edits
- **Progressive loading** of cached resources

## Browser Support

- Chrome 88+ ✅
- Firefox 85+ ✅
- Safari 14+ ✅
- Edge 88+ ✅

## Contributing

### Development Workflow
1. Create feature branch from `main`
2. Implement changes with proper TypeScript types
3. Add/update tests as needed
4. Ensure all linting passes
5. Create pull request with detailed description

### Code Standards
- Use TypeScript for all new code
- Follow atomic design principles for components
- Implement proper error handling
- Add internationalization for user-facing text
- Ensure mobile responsiveness

## Deployment

### Firebase Hosting
```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Deploy to Firebase
firebase deploy
```

### Other Platforms
The application can be deployed to any static hosting service:
- Netlify
- Vercel
- GitHub Pages
- AWS S3 + CloudFront

## Performance

### Targets (PRD Requirements)
- **Load Time**: <3 seconds on 3G
- **Bundle Size**: <500KB initial load
- **PWA Score**: >90 (Lighthouse)
- **Accessibility**: WCAG 2.1 AA compliant

## Security

- Firebase Authentication for secure user management
- Input sanitization and XSS protection
- HTTPS enforcement
- Content Security Policy headers
- Rate limiting for API endpoints

## Support

For technical support or questions:
- Check existing GitHub issues
- Create new issue with detailed description
- Contact: technical-support@birthlink.gov.gh

## License

Government of Ghana - Ministry of Health  
All rights reserved.

---

**Version**: 1.0.0  
**Last Updated**: 2025-08-11  
**Status**: Phase 1 Complete ✅
