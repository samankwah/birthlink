import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import authSlice from './slices/authSlice';
import registrationSlice from './slices/registrationSlice';
import uiSlice from './slices/uiSlice';
import settingsSlice from './slices/settingsSlice';
import syncSlice from './slices/syncSlice';

const persistConfig = {
  key: 'birthlink-root',
  storage,
  whitelist: ['auth', 'registrations', 'ui', 'settings', 'sync']
};

const rootReducer = combineReducers({
  auth: authSlice,
  registrations: registrationSlice,
  ui: uiSlice,
  settings: settingsSlice,
  sync: syncSlice
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          'persist/PERSIST', 
          'persist/REHYDRATE',
          'auth/setFirebaseUser',
          'auth/login/fulfilled',
          'auth/register/fulfilled',
          'ui/addNotification'
        ],
        ignoredActionsPaths: ['payload.firebaseUser', 'meta.arg', 'payload.timestamp'],
        ignoredPaths: [
          'auth.firebaseUser',
          'registrations.lastDoc',
          'ui.notifications'
        ]
      }
    })
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;