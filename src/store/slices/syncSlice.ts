import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import { Timestamp } from 'firebase/firestore';
import type { SyncQueueItem, SyncQueueStatus } from '../../types';

interface SyncState {
  queue: SyncQueueItem[];
  isOnline: boolean;
  isSyncing: boolean;
  lastSyncTime: Date | null;
  syncErrors: string[];
}

const initialState: SyncState = {
  queue: [],
  isOnline: navigator.onLine,
  isSyncing: false,
  lastSyncTime: null,
  syncErrors: []
};

// Async thunks for sync operations
export const addToSyncQueue = createAsyncThunk(
  'sync/addToQueue',
  async (item: Omit<SyncQueueItem, 'id' | 'timestamp' | 'retryCount' | 'status'>) => {
    const queueItem: SyncQueueItem = {
      id: crypto.randomUUID(),
      timestamp: new Date() as unknown as Timestamp,
      retryCount: 0,
      status: 'pending',
      ...item
    };
    
    // Store in IndexedDB for persistence
    await storeInIndexedDB('syncQueue', queueItem);
    
    return queueItem;
  }
);

export const processSyncQueue = createAsyncThunk(
  'sync/processQueue',
  async (_, { getState, dispatch }) => {
    const state = getState() as { sync: SyncState };
    const pendingItems = state.sync.queue.filter((item: SyncQueueItem) => 
      item.status === 'pending' || item.status === 'failed'
    );
    
    const results = [];
    
    for (const item of pendingItems) {
      try {
        dispatch(updateSyncItemStatus({ id: item.id, status: 'processing' }));
        
        // Process the sync item based on operation type
        await processSyncItem(item);
        
        dispatch(updateSyncItemStatus({ id: item.id, status: 'completed' }));
        results.push({ id: item.id, success: true });
      } catch (error) {
        const newRetryCount = item.retryCount + 1;
        
        if (newRetryCount >= 5) {
          dispatch(updateSyncItemStatus({ id: item.id, status: 'failed' }));
        } else {
          dispatch(updateSyncItem({ 
            id: item.id, 
            updates: { 
              retryCount: newRetryCount,
              status: 'pending'
            }
          }));
        }
        
        results.push({ 
          id: item.id, 
          success: false, 
          error: (error as Error).message 
        });
      }
    }
    
    return results;
  }
);

// Helper functions
const storeInIndexedDB = async (storeName: string, data: SyncQueueItem): Promise<void> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('BirthLinkDB', 1);
    
    request.onerror = () => reject(request.error);
    
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      
      const addRequest = store.add(data);
      addRequest.onsuccess = () => resolve();
      addRequest.onerror = () => reject(addRequest.error);
    };
    
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(storeName)) {
        db.createObjectStore(storeName, { keyPath: 'id' });
      }
    };
  });
};

const processSyncItem = async (item: SyncQueueItem): Promise<void> => {
  // Implementation would depend on the operation type
  // This is a placeholder for the actual sync logic
  switch (item.operationType) {
    case 'create':
      // Sync creation to server
      break;
    case 'update':
      // Sync update to server
      break;
    case 'delete':
      // Sync deletion to server
      break;
  }
  
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1000));
};

const syncSlice = createSlice({
  name: 'sync',
  initialState,
  reducers: {
    setOnlineStatus: (state, action: PayloadAction<boolean>) => {
      state.isOnline = action.payload;
    },
    updateSyncItemStatus: (state, action: PayloadAction<{ id: string; status: SyncQueueStatus }>) => {
      const item = state.queue.find(item => item.id === action.payload.id);
      if (item) {
        item.status = action.payload.status;
      }
    },
    updateSyncItem: (state, action: PayloadAction<{ id: string; updates: Partial<SyncQueueItem> }>) => {
      const item = state.queue.find(item => item.id === action.payload.id);
      if (item) {
        Object.assign(item, action.payload.updates);
      }
    },
    removeSyncItem: (state, action: PayloadAction<string>) => {
      state.queue = state.queue.filter(item => item.id !== action.payload);
    },
    clearSyncErrors: (state) => {
      state.syncErrors = [];
    },
    addSyncError: (state, action: PayloadAction<string>) => {
      state.syncErrors.push(action.payload);
    }
  },
  extraReducers: (builder) => {
    builder
      // Add to Sync Queue
      .addCase(addToSyncQueue.fulfilled, (state, action) => {
        state.queue.push(action.payload);
      })
      // Process Sync Queue
      .addCase(processSyncQueue.pending, (state) => {
        state.isSyncing = true;
      })
      .addCase(processSyncQueue.fulfilled, (state, action) => {
        state.isSyncing = false;
        state.lastSyncTime = new Date();
        
        // Remove completed items from queue
        state.queue = state.queue.filter(item => item.status !== 'completed');
        
        // Add errors for failed items
        action.payload.forEach(result => {
          if (!result.success && result.error) {
            state.syncErrors.push(result.error);
          }
        });
      })
      .addCase(processSyncQueue.rejected, (state, action) => {
        state.isSyncing = false;
        state.syncErrors.push(action.error.message || 'Sync failed');
      });
  }
});

export const { 
  setOnlineStatus, 
  updateSyncItemStatus, 
  updateSyncItem,
  removeSyncItem, 
  clearSyncErrors,
  addSyncError 
} = syncSlice.actions;

export default syncSlice.reducer;