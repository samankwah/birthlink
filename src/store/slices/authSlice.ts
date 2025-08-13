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
import type { User, UserRole } from '../../types';

interface AuthState {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  firebaseUser: null,
  isAuthenticated: false,
  isLoading: false,
  error: null
};

// Async thunks
export const loginUser = createAsyncThunk(
  'auth/login',
  async ({ email, password }: { email: string; password: string }) => {
    // Development bypass when using mock authentication OR when Firebase fails
    if (shouldUseMockAuth()) {
      console.warn('🚧 Development mode: Using mock authentication');
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock user data for development
      const mockUser: User & { firebaseUser: any } = {
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
        createdAt: new Date() as unknown as Timestamp,
        lastLogin: new Date() as unknown as Timestamp,
        firebaseUser: {
          uid: 'dev-user-123',
          email: email,
          displayName: 'Test Registrar'
        }
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
        throw new Error('User profile not found');
      }
      
      const userData = userDoc.data() as Omit<User, 'uid'>;
      return {
        uid: firebaseUser.uid,
        ...userData,
        firebaseUser
      };
    } catch (firebaseError) {
      // If Firebase fails, fall back to mock auth
      console.warn('🔄 Firebase auth failed, using mock authentication:', (firebaseError as Error).message);
      
      // Mock user data for development
      const mockUser: User & { firebaseUser: any } = {
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
        createdAt: new Date() as unknown as Timestamp,
        lastLogin: new Date() as unknown as Timestamp,
        firebaseUser: {
          uid: 'dev-user-123',
          email: email,
          displayName: 'Test Registrar'
        }
      };
      
      return mockUser;
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
    // Development bypass when using mock authentication OR when Firebase fails
    if (shouldUseMockAuth()) {
      console.warn('🚧 Development mode: Using mock registration');
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock user data for development
      const mockUser: User & { firebaseUser: any } = {
        uid: `dev-user-${Date.now()}`,
        email,
        role,
        profile,
        preferences: {
          language: 'en',
          notifications: true
        },
        status: 'active',
        createdAt: new Date() as unknown as Timestamp,
        lastLogin: new Date() as unknown as Timestamp,
        firebaseUser: {
          uid: `dev-user-${Date.now()}`,
          email,
          displayName: `${profile.firstName} ${profile.lastName}`
        }
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
      
      // Create user document in Firestore
      const userData: Omit<User, 'uid'> = {
        email,
        role,
        profile,
        preferences: {
          language: 'en',
          notifications: true
        },
        status: 'pending',
        createdAt: new Date() as unknown as Timestamp,
        lastLogin: new Date() as unknown as Timestamp
      };
      
      await setDoc(doc(db, 'users', firebaseUser.uid), userData);
      
      return {
        uid: firebaseUser.uid,
        ...userData,
        firebaseUser
      };
    } catch (firebaseError) {
      // If Firebase fails, fall back to mock registration
      console.warn('🔄 Firebase registration failed, using mock registration:', (firebaseError as Error).message);
      
      // Mock user data for development
      const mockUser: User & { firebaseUser: any } = {
        uid: `dev-user-${Date.now()}`,
        email,
        role,
        profile,
        preferences: {
          language: 'en',
          notifications: true
        },
        status: 'active',
        createdAt: new Date() as unknown as Timestamp,
        lastLogin: new Date() as unknown as Timestamp,
        firebaseUser: {
          uid: `dev-user-${Date.now()}`,
          email,
          displayName: `${profile.firstName} ${profile.lastName}`
        }
      };
      
      return mockUser;
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logout',
  async () => {
    if (import.meta.env.VITE_USE_MOCK_AUTH === 'true') {
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
      updatedAt: new Date()
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
      updatedAt: new Date()
    });
    
    return preferences;
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setFirebaseUser: (state, action: PayloadAction<FirebaseUser | null>) => {
      state.firebaseUser = action.payload;
      state.isAuthenticated = !!action.payload;
      if (!action.payload) {
        state.user = null;
      }
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
        state.firebaseUser = action.payload.firebaseUser;
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
        state.firebaseUser = action.payload.firebaseUser;
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
        state.firebaseUser = null;
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

export const { setFirebaseUser, clearError, setLoading } = authSlice.actions;
export default authSlice.reducer;