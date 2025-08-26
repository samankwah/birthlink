import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import authSlice from './slices/authSlice';
import registrationSlice from './slices/registrationSlice';
import syncSlice from './slices/syncSlice';
import uiSlice from './slices/uiSlice';
import { offlineMiddleware, persistenceMiddleware, initializeNetworkListener } from './middleware/offlineMiddleware';

const persistConfig = {
  key: 'birthlink-root',
  storage,
  whitelist: ['auth', 'registrations', 'ui', 'sync'] // Persist sync state for offline queue
};

const rootReducer = combineReducers({
  auth: authSlice,
  registrations: registrationSlice,
  sync: syncSlice,
  ui: uiSlice
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
          'sync/processSyncQueue/pending',
          'sync/processSyncQueue/fulfilled',
          'auth/login/fulfilled',
          'auth/register/fulfilled',
          'auth/updateProfile/fulfilled',
          'auth/updatePreferences/fulfilled',
          'auth/setFirebaseUser',
          'registrations/fetchAll/fulfilled',
          'registrations/fetchById/fulfilled',
          'registrations/create/fulfilled'
        ],
        ignoredPaths: [
          'sync.queue', 
          'registrations.lastDoc',
          'auth.user.createdAt',
          'auth.user.lastLogin',
          'registrations.registrations',
          'registrations.currentRegistration'
        ]
      }
    }).concat(offlineMiddleware, persistenceMiddleware)
});

export const persistor = persistStore(store);

// Initialize network status listener
initializeNetworkListener(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;