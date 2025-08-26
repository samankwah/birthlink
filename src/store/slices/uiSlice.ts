import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Language } from '../../types';

interface UIState {
  theme: 'light';
  language: Language;
  isLoading: boolean;
  notifications: Array<{
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    message: string;
    timestamp: Date;
  }>;
  modals: {
    isRegistrationFormOpen: boolean;
    isUserProfileOpen: boolean;
    isSettingsOpen: boolean;
  };
  sidebarOpen: boolean;
}

const initialState: UIState = {
  theme: 'light',
  language: 'en',
  isLoading: false,
  notifications: [],
  modals: {
    isRegistrationFormOpen: false,
    isUserProfileOpen: false,
    isSettingsOpen: false
  },
  sidebarOpen: false
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setTheme: (state, action: PayloadAction<'light'>) => {
      state.theme = action.payload;
    },
    setLanguage: (state, action: PayloadAction<Language>) => {
      state.language = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    addNotification: (state, action: PayloadAction<{
      type: 'success' | 'error' | 'warning' | 'info';
      message: string;
    }>) => {
      const notification = {
        id: crypto.randomUUID(),
        timestamp: new Date(),
        ...action.payload
      };
      state.notifications.push(notification);
    },
    removeNotification: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter(n => n.id !== action.payload);
    },
    clearNotifications: (state) => {
      state.notifications = [];
    },
    openModal: (state, action: PayloadAction<keyof UIState['modals']>) => {
      state.modals[action.payload] = true;
    },
    closeModal: (state, action: PayloadAction<keyof UIState['modals']>) => {
      state.modals[action.payload] = false;
    },
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebarOpen = action.payload;
    }
  }
});

export const {
  setTheme,
  setLanguage,
  setLoading,
  addNotification,
  removeNotification,
  clearNotifications,
  openModal,
  closeModal,
  toggleSidebar,
  setSidebarOpen
} = uiSlice.actions;

export default uiSlice.reducer;