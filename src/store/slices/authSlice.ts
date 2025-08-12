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
import { auth, db } from '../../services/firebase';
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
    // Demo mode - simulate successful login
    if (import.meta.env.VITE_DEMO_MODE === 'true') {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
      
      const mockUser: User = {
        uid: 'demo-user-123',
        email: email,
        role: 'registrar',
        profile: {
          firstName: 'Demo',
          lastName: 'User',
          phoneNumber: '+233123456789',
          region: 'Greater Accra',
          district: 'Accra Metropolitan'
        },
        preferences: {
          language: 'en',
          notifications: true
        },
        status: 'active',
        createdAt: new Date() as unknown as Timestamp,
        lastLogin: new Date() as unknown as Timestamp
      };
      
      return {
        ...mockUser,
        firebaseUser: null
      };
    }
    
    // Real Firebase authentication
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
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logout',
  async () => {
    // Demo mode - just simulate logout
    if (import.meta.env.VITE_DEMO_MODE === 'true') {
      return;
    }
    
    // Real Firebase logout
    await signOut(auth);
  }
);

export const resetPassword = createAsyncThunk(
  'auth/resetPassword',
  async (email: string) => {
    await sendPasswordResetEmail(auth, email);
    return email;
  }
);

export const updateUserProfile = createAsyncThunk(
  'auth/updateProfile',
  async (updates: Partial<User['profile']>, { getState }) => {
    const state = getState() as { auth: AuthState };
    if (!state.auth.user) throw new Error('No user logged in');
    
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
      // For demo mode, keep the existing user data
      if (!action.payload && state.user?.uid === 'demo-user-123') {
        state.isAuthenticated = false;
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