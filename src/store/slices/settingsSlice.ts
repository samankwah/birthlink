import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import { doc, getDoc, setDoc, updateDoc, Timestamp } from 'firebase/firestore';
import { db, shouldUseMockAuth } from '../../services/firebase';
import type { Language, SystemConfig } from '../../types';

export interface UserSettings {
  theme: 'light' | 'system';
  language: Language;
  timezone: string;
  dateFormat: 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD';
  timeFormat: '12h' | '24h';
  notifications: {
    email: boolean;
    sms: boolean;
    inApp: boolean;
    registrationUpdates: boolean;
    systemAlerts: boolean;
    weeklyReports: boolean;
  };
  privacy: {
    shareAnalytics: boolean;
    activityVisible: boolean;
    allowDataExport: boolean;
  };
  dashboard: {
    defaultView: 'cards' | 'table';
    itemsPerPage: 10 | 25 | 50 | 100;
    autoRefresh: boolean;
    refreshInterval: number; // in seconds
  };
}

export interface AdminSettings extends SystemConfig {
  security: {
    sessionTimeoutMinutes: number;
    maxLoginAttempts: number;
    passwordMinLength: number;
    requireTwoFactor: boolean;
    auditLogLevel: 'minimal' | 'standard' | 'detailed';
  };
  backup: {
    enabled: boolean;
    frequency: 'daily' | 'weekly' | 'monthly';
    retentionDays: number;
    lastBackup?: string;
  };
  integration: {
    smsProvider: 'twilio' | 'africastalking' | 'none';
    emailProvider: 'sendgrid' | 'mailgun' | 'none';
    analyticsEnabled: boolean;
  };
  dataRetention: {
    registrations: number; // years
    auditLogs: number; // months
    userActivity: number; // months
  };
}

interface SettingsState {
  userSettings: UserSettings | null;
  adminSettings: AdminSettings | null;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  lastSaved: string | null;
  hasUnsavedChanges: boolean;
}

const defaultUserSettings: UserSettings = {
  theme: 'system',
  language: 'en',
  timezone: 'Africa/Accra',
  dateFormat: 'DD/MM/YYYY',
  timeFormat: '12h',
  notifications: {
    email: true,
    sms: false,
    inApp: true,
    registrationUpdates: true,
    systemAlerts: true,
    weeklyReports: false,
  },
  privacy: {
    shareAnalytics: true,
    activityVisible: true,
    allowDataExport: true,
  },
  dashboard: {
    defaultView: 'cards',
    itemsPerPage: 25,
    autoRefresh: true,
    refreshInterval: 300, // 5 minutes
  },
};

const defaultAdminSettings: AdminSettings = {
  registrationNumberSequence: 1000,
  supportedLanguages: ['en', 'tw'],
  systemMaintenance: false,
  apiLimits: {
    registrationsPerDay: 1000,
    syncBatchSize: 50,
  },
  security: {
    sessionTimeoutMinutes: 60,
    maxLoginAttempts: 5,
    passwordMinLength: 8,
    requireTwoFactor: false,
    auditLogLevel: 'standard',
  },
  backup: {
    enabled: true,
    frequency: 'daily',
    retentionDays: 30,
  },
  integration: {
    smsProvider: 'none',
    emailProvider: 'none',
    analyticsEnabled: true,
  },
  dataRetention: {
    registrations: 7, // years
    auditLogs: 12, // months
    userActivity: 3, // months
  },
};

const initialState: SettingsState = {
  userSettings: null,
  adminSettings: null,
  isLoading: false,
  isSaving: false,
  error: null,
  lastSaved: null,
  hasUnsavedChanges: false,
};

// Async thunks
export const loadUserSettings = createAsyncThunk(
  'settings/loadUserSettings',
  async (userId: string) => {
    console.log('🔍 Loading user settings for userId:', userId);
    
    if (shouldUseMockAuth()) {
      console.warn('🚧 Development mode: Using mock user settings');
      await new Promise(resolve => setTimeout(resolve, 500));
      return defaultUserSettings;
    }

    if (!db) throw new Error('Firebase not available');

    try {
      console.log('🔍 Fetching user settings from Firestore...');
      const docRef = doc(db, 'userSettings', userId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        console.log('✅ Found existing user settings:', docSnap.data());
        return { ...defaultUserSettings, ...docSnap.data() } as UserSettings;
      }

      // Create default settings for new user
      console.log('📝 Creating default user settings for new user');
      await setDoc(docRef, defaultUserSettings);
      console.log('✅ Default user settings created successfully');
      return defaultUserSettings;
    } catch (error) {
      console.error('❌ Error loading user settings:', error);
      throw error;
    }
  }
);

export const saveUserSettings = createAsyncThunk(
  'settings/saveUserSettings',
  async ({ userId, settings }: { userId: string; settings: Partial<UserSettings> }) => {
    console.log('💾 Saving user settings for userId:', userId, 'settings:', settings);
    
    if (shouldUseMockAuth()) {
      console.warn('🚧 Development mode: Mock saving user settings');
      await new Promise(resolve => setTimeout(resolve, 800));
      return settings;
    }

    if (!db) throw new Error('Firebase not available');

    try {
      const docRef = doc(db, 'userSettings', userId);
      await updateDoc(docRef, {
        ...settings,
        updatedAt: Timestamp.now(),
      });
      console.log('✅ User settings saved successfully');
      return settings;
    } catch (error) {
      console.error('❌ Error saving user settings:', error);
      throw error;
    }
  }
);

export const loadAdminSettings = createAsyncThunk(
  'settings/loadAdminSettings',
  async () => {
    if (shouldUseMockAuth()) {
      console.warn('🚧 Development mode: Using mock admin settings');
      await new Promise(resolve => setTimeout(resolve, 600));
      return defaultAdminSettings;
    }

    if (!db) throw new Error('Firebase not available');

    const docRef = doc(db, 'systemConfig', 'main');
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return { ...defaultAdminSettings, ...docSnap.data() } as AdminSettings;
    }

    // Create default admin settings
    await setDoc(docRef, defaultAdminSettings);
    return defaultAdminSettings;
  }
);

export const saveAdminSettings = createAsyncThunk(
  'settings/saveAdminSettings',
  async (settings: Partial<AdminSettings>) => {
    if (shouldUseMockAuth()) {
      console.warn('🚧 Development mode: Mock saving admin settings');
      await new Promise(resolve => setTimeout(resolve, 1000));
      return settings;
    }

    if (!db) throw new Error('Firebase not available');

    const docRef = doc(db, 'systemConfig', 'main');
    await updateDoc(docRef, {
      ...settings,
      updatedAt: Timestamp.now(),
    });

    return settings;
  }
);

export const resetUserSettings = createAsyncThunk(
  'settings/resetUserSettings',
  async (userId: string) => {
    if (shouldUseMockAuth()) {
      console.warn('🚧 Development mode: Mock resetting user settings');
      await new Promise(resolve => setTimeout(resolve, 500));
      return defaultUserSettings;
    }

    if (!db) throw new Error('Firebase not available');

    const docRef = doc(db, 'userSettings', userId);
    await setDoc(docRef, defaultUserSettings);
    return defaultUserSettings;
  }
);

export const resetAdminSettings = createAsyncThunk(
  'settings/resetAdminSettings',
  async () => {
    if (shouldUseMockAuth()) {
      console.warn('🚧 Development mode: Mock resetting admin settings');
      await new Promise(resolve => setTimeout(resolve, 500));
      return defaultAdminSettings;
    }

    if (!db) throw new Error('Firebase not available');

    const docRef = doc(db, 'systemConfig', 'main');
    await setDoc(docRef, defaultAdminSettings);
    return defaultAdminSettings;
  }
);

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setUnsavedChanges: (state, action: PayloadAction<boolean>) => {
      state.hasUnsavedChanges = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    updateUserSettingsLocal: (state, action: PayloadAction<Partial<UserSettings>>) => {
      if (state.userSettings) {
        state.userSettings = { ...state.userSettings, ...action.payload };
        state.hasUnsavedChanges = true;
      }
    },
    updateAdminSettingsLocal: (state, action: PayloadAction<Partial<AdminSettings>>) => {
      if (state.adminSettings) {
        state.adminSettings = { ...state.adminSettings, ...action.payload };
        state.hasUnsavedChanges = true;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Load User Settings
      .addCase(loadUserSettings.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loadUserSettings.fulfilled, (state, action) => {
        state.isLoading = false;
        state.userSettings = action.payload;
        state.hasUnsavedChanges = false;
      })
      .addCase(loadUserSettings.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to load user settings';
      })
      // Save User Settings
      .addCase(saveUserSettings.pending, (state) => {
        state.isSaving = true;
        state.error = null;
      })
      .addCase(saveUserSettings.fulfilled, (state, action) => {
        state.isSaving = false;
        if (state.userSettings) {
          state.userSettings = { ...state.userSettings, ...action.payload };
        }
        state.hasUnsavedChanges = false;
        state.lastSaved = new Date().toISOString();
      })
      .addCase(saveUserSettings.rejected, (state, action) => {
        state.isSaving = false;
        state.error = action.error.message || 'Failed to save user settings';
      })
      // Load Admin Settings
      .addCase(loadAdminSettings.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loadAdminSettings.fulfilled, (state, action) => {
        state.isLoading = false;
        state.adminSettings = action.payload;
        state.hasUnsavedChanges = false;
      })
      .addCase(loadAdminSettings.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to load admin settings';
      })
      // Save Admin Settings
      .addCase(saveAdminSettings.pending, (state) => {
        state.isSaving = true;
        state.error = null;
      })
      .addCase(saveAdminSettings.fulfilled, (state, action) => {
        state.isSaving = false;
        if (state.adminSettings) {
          state.adminSettings = { ...state.adminSettings, ...action.payload };
        }
        state.hasUnsavedChanges = false;
        state.lastSaved = new Date().toISOString();
      })
      .addCase(saveAdminSettings.rejected, (state, action) => {
        state.isSaving = false;
        state.error = action.error.message || 'Failed to save admin settings';
      })
      // Reset User Settings
      .addCase(resetUserSettings.fulfilled, (state, action) => {
        state.userSettings = action.payload;
        state.hasUnsavedChanges = false;
        state.lastSaved = new Date().toISOString();
      })
      // Reset Admin Settings
      .addCase(resetAdminSettings.fulfilled, (state, action) => {
        state.adminSettings = action.payload;
        state.hasUnsavedChanges = false;
        state.lastSaved = new Date().toISOString();
      });
  },
});

export const {
  setUnsavedChanges,
  clearError,
  updateUserSettingsLocal,
  updateAdminSettingsLocal,
} = settingsSlice.actions;

export default settingsSlice.reducer;