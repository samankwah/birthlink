import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  type User as FirebaseUser
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, Timestamp } from 'firebase/firestore';
import { auth, db, shouldUseMockAuth } from '../../services/firebase';
import type { User, UserRole, SerializableTimestamp } from '../../types';

// Helper functions for timestamp handling
const createFirebaseTimestamp = () => Timestamp.now();

const createSerializableTimestamp = (): SerializableTimestamp => ({
  seconds: Math.floor(Date.now() / 1000),
  nanoseconds: 0
});


interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null
};

// Async thunks
export const loginUser = createAsyncThunk(
  'auth/login',
  async ({ email, password }: { email: string; password: string }) => {
    // Development bypass when using mock authentication (only if Firebase not configured)
    if (shouldUseMockAuth()) {
      console.warn('🚧 Development mode: Using mock authentication - Firebase not configured');
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // For mock auth, we still validate that the email looks reasonable
      if (!email || !email.includes('@')) {
        throw new Error('Please enter a valid email address');
      }
      
      if (!password || password.length < 6) {
        throw new Error('Please enter a password (minimum 6 characters)');
      }
      
      // Mock user data for development
      const mockUser: User = {
        uid: 'dev-user-123',
        email: email,
        role: 'registrar',
        profile: {
          firstName: 'Test',
          lastName: 'Registrar',
          phoneNumber: '+233243999631',
          location: {
            region: 'Eastern',
            district: 'Fanteakwa'
          }
        },
        preferences: {
          language: 'en',
          notifications: true
        },
        status: 'active',
        createdAt: createSerializableTimestamp(),
        lastLogin: createSerializableTimestamp()
      };
      
      return mockUser;
    }

    // Production Firebase authentication with fallback
    try {
      if (!auth || !db) {
        throw new Error('Firebase services not available');
      }
      
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      
      // Get user profile from Firestore
      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
      if (!userDoc.exists()) {
        throw new Error('User profile not found. Please contact support if you believe this is an error.');
      }
      
      const firestoreData = userDoc.data();
      
      // Check user status - only allow active users to log in
      if (firestoreData?.status !== 'active') {
        const status = firestoreData?.status || 'unknown';
        if (status === 'pending') {
          throw new Error('Your account is pending approval. Please contact an administrator.');
        } else if (status === 'disabled') {
          throw new Error('Your account has been disabled. Please contact support.');
        } else {
          throw new Error(`Account status: ${status}. Please contact support.`);
        }
      }
      
      // Convert Firebase Timestamps to serializable format for Redux
      const userData: User = {
        uid: firebaseUser.uid,
        email: firestoreData?.email || '',
        role: firestoreData?.role || 'viewer',
        profile: firestoreData?.profile || {},
        preferences: firestoreData?.preferences || { language: 'en', notifications: true },
        status: firestoreData?.status || 'active',
        createdAt: createSerializableTimestamp(),
        lastLogin: createSerializableTimestamp()
      };
      
      return userData;
    } catch (firebaseError) {
      // Re-throw Firebase errors instead of falling back to mock auth
      console.error('❌ Firebase authentication failed:', (firebaseError as Error).message);
      throw firebaseError;
    }
  }
);

export const registerUser = createAsyncThunk(
  'auth/register',
  async ({ 
    email, 
    password, 
    profile, 
    role = 'registrar' 
  }: { 
    email: string; 
    password: string; 
    profile: User['profile'];
    role?: UserRole;
  }) => {
    // Development bypass when using mock authentication (only if Firebase not configured)
    if (shouldUseMockAuth()) {
      console.warn('🚧 Development mode: Using mock registration - Firebase not configured');
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // For mock auth, still validate registration fields
      if (!email || !email.includes('@')) {
        throw new Error('Please enter a valid email address');
      }
      
      if (!password || password.length < 8) {
        throw new Error('Password must be at least 8 characters long');
      }
      
      if (!profile.firstName || !profile.lastName) {
        throw new Error('First name and last name are required');
      }
      
      // Mock user data for development
      const mockUser: User = {
        uid: `dev-user-${Date.now()}`,
        email,
        role,
        profile,
        preferences: {
          language: 'en',
          notifications: true
        },
        status: 'active',
        createdAt: createSerializableTimestamp(),
        lastLogin: createSerializableTimestamp()
      };
      
      return mockUser;
    }

    // Production Firebase registration with fallback
    try {
      if (!auth || !db) {
        throw new Error('Firebase services not available');
      }
      
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      
      // Update Firebase Auth profile
      await updateProfile(firebaseUser, {
        displayName: `${profile.firstName} ${profile.lastName}`
      });
      
      // Create user document in Firestore with proper Firebase Timestamps
      const firestoreData = {
        email,
        role,
        profile,
        preferences: {
          language: 'en',
          notifications: true
        },
        status: 'active', // Change to 'pending' if you want admin approval required
        createdAt: createFirebaseTimestamp(),
        lastLogin: createFirebaseTimestamp()
      };
      
      await setDoc(doc(db, 'users', firebaseUser.uid), firestoreData);
      
      // Return user data for Redux with serializable timestamps
      const userData: User = {
        uid: firebaseUser.uid,
        email,
        role,
        profile,
        preferences: {
          language: 'en',
          notifications: true
        },
        status: 'active', // Change to 'pending' if you want admin approval required
        createdAt: createSerializableTimestamp(),
        lastLogin: createSerializableTimestamp()
      };
      
      return userData;
    } catch (firebaseError) {
      // Re-throw Firebase errors instead of falling back to mock auth
      console.error('❌ Firebase registration failed:', (firebaseError as Error).message);
      throw firebaseError;
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logout',
  async () => {
    if (shouldUseMockAuth()) {
      // Mock logout - just resolve
      console.warn('🚧 Development mode: Mock logout');
      return;
    }
    
    if (!auth) {
      throw new Error('Firebase auth not available');
    }
    
    await signOut(auth);
  }
);

export const resetPassword = createAsyncThunk(
  'auth/resetPassword',
  async (email: string) => {
    if (import.meta.env.VITE_USE_MOCK_AUTH === 'true') {
      // Mock password reset
      console.warn('🚧 Development mode: Mock password reset for:', email);
      await new Promise(resolve => setTimeout(resolve, 1000));
      return email;
    }
    
    if (!auth) {
      throw new Error('Firebase auth not available');
    }
    
    await sendPasswordResetEmail(auth, email);
    return email;
  }
);

export const updateUserProfile = createAsyncThunk(
  'auth/updateProfile',
  async (updates: Partial<User['profile']>, { getState }) => {
    const state = getState() as { auth: AuthState };
    if (!state.auth.user) throw new Error('No user logged in');
    
    if (import.meta.env.VITE_USE_MOCK_AUTH === 'true') {
      // Mock profile update
      console.warn('🚧 Development mode: Mock profile update:', updates);
      await new Promise(resolve => setTimeout(resolve, 500));
      return updates;
    }
    
    if (!db) {
      throw new Error('Firebase Firestore not available');
    }
    
    const userRef = doc(db, 'users', state.auth.user.uid);
    await updateDoc(userRef, {
      profile: { ...state.auth.user.profile, ...updates },
      updatedAt: createFirebaseTimestamp()
    });
    
    return updates;
  }
);

export const updateUserPreferences = createAsyncThunk(
  'auth/updatePreferences',
  async (preferences: Partial<User['preferences']>, { getState }) => {
    const state = getState() as { auth: AuthState };
    if (!state.auth.user) throw new Error('No user logged in');
    
    if (import.meta.env.VITE_USE_MOCK_AUTH === 'true') {
      // Mock preferences update
      console.warn('🚧 Development mode: Mock preferences update:', preferences);
      await new Promise(resolve => setTimeout(resolve, 500));
      return preferences;
    }
    
    if (!db) {
      throw new Error('Firebase Firestore not available');
    }
    
    const userRef = doc(db, 'users', state.auth.user.uid);
    await updateDoc(userRef, {
      preferences: { ...state.auth.user.preferences, ...preferences },
      updatedAt: createFirebaseTimestamp()
    });
    
    return preferences;
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setFirebaseUser: (state, action: PayloadAction<FirebaseUser | null>) => {
      state.isAuthenticated = !!action.payload;
      if (!action.payload) {
        state.user = null;
      }
    },
    setUser: (state, action: PayloadAction<User | null>) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Login failed';
        state.isAuthenticated = false;
      })
      // Register
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Registration failed';
      })
      // Logout
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.error = null;
      })
      // Reset Password
      .addCase(resetPassword.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(resetPassword.fulfilled, (state) => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Password reset failed';
      })
      // Update Profile
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        if (state.user) {
          state.user.profile = { ...state.user.profile, ...action.payload };
        }
      })
      // Update Preferences
      .addCase(updateUserPreferences.fulfilled, (state, action) => {
        if (state.user) {
          state.user.preferences = { ...state.user.preferences, ...action.payload };
        }
      });
  }
});

export const { setFirebaseUser, setUser, clearError, setLoading } = authSlice.actions;
export default authSlice.reducer;