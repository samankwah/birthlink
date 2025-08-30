import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';
import { getStorage, connectStorageEmulator } from 'firebase/storage';

// Firebase configuration - requires proper environment variables in production
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

// Initialize Cloud Functions and get a reference to the service
export const functions = getFunctions(app);

// Initialize Firebase Storage and get a reference to the service
export const storage = getStorage(app);
console.log('🔧 Firebase Storage initialized:', storage);
console.log('🔧 Storage bucket:', storage.app.options.storageBucket);

// Track emulator connection status
let emulatorsConnected = false;

// Connect to emulators in development (only if explicitly enabled)
if (import.meta.env.DEV && import.meta.env.VITE_USE_FIREBASE_EMULATORS === 'true') {
  try {
    connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
    connectFirestoreEmulator(db, 'localhost', 8080);
    connectFunctionsEmulator(functions, 'localhost', 5001);
    connectStorageEmulator(storage, 'localhost', 9199);
    emulatorsConnected = true;
    console.log('✅ Connected to Firebase emulators');
    console.log('🔧 Development mode: Using Firebase emulators');
  } catch (error) {
    console.warn('⚠️ Firebase emulators connection failed:', (error as Error).message);
    console.log('💡 Tip: Run "firebase emulators:start" to use emulators');
    console.log('📋 Required: Firebase CLI and Java must be installed');
    console.log('🔄 App will use mock authentication instead');
    emulatorsConnected = false;
  }
} else if (import.meta.env.DEV) {
  console.log('🚧 Development mode: Firebase emulators disabled');
  console.log('💡 To enable emulators, set VITE_USE_FIREBASE_EMULATORS=true in .env');
}

// Export a flag to check if we should use mock auth
export const shouldUseMockAuth = () => {
  // Use mock auth if explicitly enabled in development
  const mockAuthEnabled = import.meta.env.VITE_USE_MOCK_AUTH === 'true';
  
  // Allow mock auth to override Firebase config in development
  if (import.meta.env.DEV && mockAuthEnabled) {
    return true;
  }
  
  // In production, only use mock auth if Firebase is not configured
  const firebaseConfigured = firebaseConfig.apiKey && firebaseConfig.projectId;
  return !firebaseConfigured && mockAuthEnabled;
};

// Export emulator connection status for debugging
export const areEmulatorsConnected = () => emulatorsConnected;

export default app;