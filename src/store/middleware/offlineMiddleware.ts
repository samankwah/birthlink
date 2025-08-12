import type { Middleware } from '@reduxjs/toolkit';
import { indexedDBService } from '../../services/indexedDB';
import { addToSyncQueue, setOnlineStatus } from '../slices/syncSlice';
import { addNotification } from '../slices/uiSlice';

export interface OfflineAction {
  type: string;
  payload: unknown;
  meta?: {
    offline?: {
      effect: {
        url: string;
        method: 'GET' | 'POST' | 'PUT' | 'DELETE';
        body?: unknown;
      };
      commit: {
        type: string;
        payload?: unknown;
      };
      rollback: {
        type: string;
        payload?: unknown;
      };
    };
  };
}

// Type guard for actions
function isActionWithType(action: unknown): action is { type: string; payload?: unknown } {
  return typeof action === 'object' && action !== null && 'type' in action;
}

// Type guard for offline actions
function isOfflineAction(action: unknown): action is OfflineAction {
  return isActionWithType(action) && 
         typeof action === 'object' && 
         'meta' in action && 
         typeof action.meta === 'object' && 
         action.meta !== null && 
         'offline' in action.meta;
}

// Middleware to handle offline actions
export const offlineMiddleware: Middleware = (store) => (next) => (action: unknown) => {
  const isOnline = navigator.onLine;
  
  // Update online status if it changed
  const currentOnlineStatus = store.getState().sync.isOnline;
  if (currentOnlineStatus !== isOnline) {
    store.dispatch(setOnlineStatus(isOnline));
  }

  // Check if action has offline configuration
  if (isOfflineAction(action) && action.meta?.offline) {
    const { effect, commit, rollback } = action.meta.offline;
    
    if (isOnline) {
      // Online: dispatch the action normally
      return next(action);
    } else {
      // Offline: queue the action and apply optimistic update
      try {
        // Apply optimistic update (commit)
        if (commit) {
          store.dispatch({
            type: commit.type,
            payload: commit.payload || action.payload
          });
        }

        // Add to sync queue
        const syncAction = addToSyncQueue({
          userId: store.getState().auth.user?.uid || '',
          operationType: getOperationType(effect.method),
          collectionName: getCollectionFromUrl(effect.url),
          documentId: getDocumentIdFromAction(action),
          data: (effect.body || action.payload) as Record<string, unknown>
        });
        store.dispatch(syncAction as any);

        // Show offline notification
        store.dispatch(addNotification({
          type: 'info',
          message: 'Action queued for when you\'re back online'
        }));

        // Don't pass the original action to prevent API calls
        return;
      } catch (error) {
        console.error('Failed to handle offline action:', error);
        
        // Apply rollback
        if (rollback) {
          store.dispatch({
            type: rollback.type,
            payload: rollback.payload
          });
        }

        store.dispatch(addNotification({
          type: 'error',
          message: 'Failed to save action offline'
        }));
      }
    }
  }

  // Regular action, pass it through
  return next(action);
};

// Helper functions
function getOperationType(method: string): 'create' | 'update' | 'delete' {
  switch (method) {
    case 'POST':
      return 'create';
    case 'PUT':
    case 'PATCH':
      return 'update';
    case 'DELETE':
      return 'delete';
    default:
      return 'create';
  }
}

function getCollectionFromUrl(url: string): string {
  // Extract collection name from URL
  // e.g., '/api/registrations' -> 'registrations'
  const parts = url.split('/');
  return parts[parts.length - 1] || 'unknown';
}

function getDocumentIdFromAction(action: OfflineAction): string {
  // Extract document ID from action payload or generate one
  if (action.payload && 
      typeof action.payload === 'object' && 
      action.payload !== null &&
      'id' in action.payload &&
      typeof action.payload.id === 'string') {
    return action.payload.id;
  }
  
  // Generate a temporary ID for new documents
  return `offline_${crypto.randomUUID()}`;
}

// Persistence middleware to save critical data to IndexedDB
export const persistenceMiddleware: Middleware = (store) => (next) => (action) => {
  const result = next(action);

  // Save critical state changes to IndexedDB
  const state = store.getState();
  
  try {
    if (isActionWithType(action)) {
      switch (action.type) {
        case 'registrations/createRegistration/fulfilled':
        case 'registrations/updateRegistration/fulfilled':
          // Save registration to IndexedDB
          if (action.payload && typeof action.payload === 'object' && 'id' in action.payload) {
            indexedDBService.addRegistration(action.payload as import('../../types').BirthRegistration);
          }
          break;
          
        case 'registrations/fetchRegistrations/fulfilled':
          // Cache fetched registrations
          if (action.payload && 
              typeof action.payload === 'object' && 
              'registrations' in action.payload &&
              Array.isArray(action.payload.registrations)) {
            action.payload.registrations.forEach((registration: import('../../types').BirthRegistration) => {
              indexedDBService.addRegistration(registration);
            });
          }
          break;
        
      case 'auth/login/fulfilled':
      case 'auth/updateUserProfile/fulfilled':
        // Cache user data
        if (state.auth.user) {
          indexedDBService.setCache('currentUser', state.auth.user);
        }
        break;
      }
    }
  } catch (error) {
    console.error('Failed to persist data to IndexedDB:', error);
  }

  return result;
};

// Network status listener
export const initializeNetworkListener = (dispatch: import('@reduxjs/toolkit').Dispatch) => {
  const handleOnline = () => {
    dispatch(setOnlineStatus(true));
    dispatch(addNotification({
      type: 'success',
      message: 'You\'re back online! Syncing data...'
    }));
    
    // Trigger sync process
    dispatch({ type: 'sync/processSyncQueue' });
  };

  const handleOffline = () => {
    dispatch(setOnlineStatus(false));
    dispatch(addNotification({
      type: 'warning',
      message: 'You\'re offline. Changes will be synced when you reconnect.'
    }));
  };

  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);

  // Initial status
  dispatch(setOnlineStatus(navigator.onLine));

  // Return cleanup function
  return () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
  };
};