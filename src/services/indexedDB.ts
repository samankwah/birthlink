import type { BirthRegistration, SyncQueueItem } from '../types';
import type { Timestamp } from 'firebase/firestore';

const DB_NAME = 'BirthLinkDB';
const DB_VERSION = 1;

// Store names
export const STORES = {
  REGISTRATIONS: 'registrations',
  SYNC_QUEUE: 'syncQueue',
  USER_PREFERENCES: 'userPreferences',
  CACHE: 'cache'
} as const;

export interface IndexedDBService {
  init(): Promise<void>;
  addRegistration(registration: BirthRegistration): Promise<string>;
  getRegistration(id: string): Promise<BirthRegistration | undefined>;
  getAllRegistrations(): Promise<BirthRegistration[]>;
  updateRegistration(registration: BirthRegistration): Promise<void>;
  deleteRegistration(id: string): Promise<void>;
  addToSyncQueue(item: Omit<SyncQueueItem, 'id'>): Promise<string>;
  getSyncQueue(): Promise<SyncQueueItem[]>;
  removeSyncQueueItem(id: string): Promise<void>;
  clearSyncQueue(): Promise<void>;
  setCache(key: string, data: unknown): Promise<void>;
  getCache(key: string): Promise<unknown>;
  clearCache(): Promise<void>;
}

class IndexedDBServiceImpl implements IndexedDBService {
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        console.error('Failed to open IndexedDB:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        console.log('IndexedDB initialized successfully');
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Create registrations store
        if (!db.objectStoreNames.contains(STORES.REGISTRATIONS)) {
          const registrationStore = db.createObjectStore(STORES.REGISTRATIONS, { keyPath: 'id' });
          registrationStore.createIndex('registrationNumber', 'registrationNumber', { unique: true });
          registrationStore.createIndex('status', 'status', { unique: false });
          registrationStore.createIndex('createdAt', 'createdAt', { unique: false });
        }

        // Create sync queue store
        if (!db.objectStoreNames.contains(STORES.SYNC_QUEUE)) {
          const syncStore = db.createObjectStore(STORES.SYNC_QUEUE, { keyPath: 'id' });
          syncStore.createIndex('status', 'status', { unique: false });
          syncStore.createIndex('timestamp', 'timestamp', { unique: false });
        }

        // Create user preferences store
        if (!db.objectStoreNames.contains(STORES.USER_PREFERENCES)) {
          db.createObjectStore(STORES.USER_PREFERENCES, { keyPath: 'key' });
        }

        // Create cache store
        if (!db.objectStoreNames.contains(STORES.CACHE)) {
          const cacheStore = db.createObjectStore(STORES.CACHE, { keyPath: 'key' });
          cacheStore.createIndex('expiry', 'expiry', { unique: false });
        }

        console.log('IndexedDB stores created');
      };
    });
  }

  private ensureDB(): void {
    if (!this.db) {
      throw new Error('IndexedDB not initialized. Call init() first.');
    }
  }

  // Registration methods
  async addRegistration(registration: BirthRegistration): Promise<string> {
    this.ensureDB();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORES.REGISTRATIONS], 'readwrite');
      const store = transaction.objectStore(STORES.REGISTRATIONS);
      
      // Generate ID if not provided
      const registrationWithId = {
        ...registration,
        id: registration.id || crypto.randomUUID()
      };
      
      const request = store.add(registrationWithId);
      
      request.onsuccess = () => {
        console.log('Registration added to IndexedDB:', registrationWithId.id);
        resolve(registrationWithId.id);
      };
      
      request.onerror = () => {
        console.error('Failed to add registration:', request.error);
        reject(request.error);
      };
    });
  }

  async getRegistration(id: string): Promise<BirthRegistration | undefined> {
    this.ensureDB();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORES.REGISTRATIONS], 'readonly');
      const store = transaction.objectStore(STORES.REGISTRATIONS);
      const request = store.get(id);
      
      request.onsuccess = () => {
        resolve(request.result);
      };
      
      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  async getAllRegistrations(): Promise<BirthRegistration[]> {
    this.ensureDB();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORES.REGISTRATIONS], 'readonly');
      const store = transaction.objectStore(STORES.REGISTRATIONS);
      const request = store.getAll();
      
      request.onsuccess = () => {
        resolve(request.result || []);
      };
      
      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  async updateRegistration(registration: BirthRegistration): Promise<void> {
    this.ensureDB();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORES.REGISTRATIONS], 'readwrite');
      const store = transaction.objectStore(STORES.REGISTRATIONS);
      const request = store.put(registration);
      
      request.onsuccess = () => {
        console.log('Registration updated in IndexedDB:', registration.id);
        resolve();
      };
      
      request.onerror = () => {
        console.error('Failed to update registration:', request.error);
        reject(request.error);
      };
    });
  }

  async deleteRegistration(id: string): Promise<void> {
    this.ensureDB();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORES.REGISTRATIONS], 'readwrite');
      const store = transaction.objectStore(STORES.REGISTRATIONS);
      const request = store.delete(id);
      
      request.onsuccess = () => {
        console.log('Registration deleted from IndexedDB:', id);
        resolve();
      };
      
      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  // Sync queue methods
  async addToSyncQueue(item: Omit<SyncQueueItem, 'id'>): Promise<string> {
    this.ensureDB();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORES.SYNC_QUEUE], 'readwrite');
      const store = transaction.objectStore(STORES.SYNC_QUEUE);
      
      const queueItem: SyncQueueItem = {
        ...item,
        id: crypto.randomUUID(),
        timestamp: new Date() as unknown as Timestamp,
        retryCount: 0,
        status: 'pending'
      };
      
      const request = store.add(queueItem);
      
      request.onsuccess = () => {
        console.log('Item added to sync queue:', queueItem.id);
        resolve(queueItem.id);
      };
      
      request.onerror = () => {
        console.error('Failed to add to sync queue:', request.error);
        reject(request.error);
      };
    });
  }

  async getSyncQueue(): Promise<SyncQueueItem[]> {
    this.ensureDB();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORES.SYNC_QUEUE], 'readonly');
      const store = transaction.objectStore(STORES.SYNC_QUEUE);
      const request = store.getAll();
      
      request.onsuccess = () => {
        resolve(request.result || []);
      };
      
      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  async removeSyncQueueItem(id: string): Promise<void> {
    this.ensureDB();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORES.SYNC_QUEUE], 'readwrite');
      const store = transaction.objectStore(STORES.SYNC_QUEUE);
      const request = store.delete(id);
      
      request.onsuccess = () => {
        console.log('Sync queue item removed:', id);
        resolve();
      };
      
      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  async clearSyncQueue(): Promise<void> {
    this.ensureDB();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORES.SYNC_QUEUE], 'readwrite');
      const store = transaction.objectStore(STORES.SYNC_QUEUE);
      const request = store.clear();
      
      request.onsuccess = () => {
        console.log('Sync queue cleared');
        resolve();
      };
      
      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  // Cache methods
  async setCache(key: string, data: unknown): Promise<void> {
    this.ensureDB();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORES.CACHE], 'readwrite');
      const store = transaction.objectStore(STORES.CACHE);
      
      const cacheItem = {
        key,
        data,
        timestamp: Date.now(),
        expiry: Date.now() + (24 * 60 * 60 * 1000) // 24 hours default
      };
      
      const request = store.put(cacheItem);
      
      request.onsuccess = () => {
        resolve();
      };
      
      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  async getCache(key: string): Promise<unknown> {
    this.ensureDB();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORES.CACHE], 'readonly');
      const store = transaction.objectStore(STORES.CACHE);
      const request = store.get(key);
      
      request.onsuccess = () => {
        const result = request.result;
        
        if (!result) {
          resolve(undefined);
          return;
        }
        
        // Check if cache has expired
        if (result.expiry < Date.now()) {
          // Remove expired cache item
          this.deleteCache(key);
          resolve(undefined);
          return;
        }
        
        resolve(result.data);
      };
      
      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  async deleteCache(key: string): Promise<void> {
    this.ensureDB();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORES.CACHE], 'readwrite');
      const store = transaction.objectStore(STORES.CACHE);
      const request = store.delete(key);
      
      request.onsuccess = () => {
        resolve();
      };
      
      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  async clearCache(): Promise<void> {
    this.ensureDB();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORES.CACHE], 'readwrite');
      const store = transaction.objectStore(STORES.CACHE);
      const request = store.clear();
      
      request.onsuccess = () => {
        console.log('Cache cleared');
        resolve();
      };
      
      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  // Cleanup expired cache entries
  async cleanupExpiredCache(): Promise<void> {
    this.ensureDB();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORES.CACHE], 'readwrite');
      const store = transaction.objectStore(STORES.CACHE);
      const index = store.index('expiry');
      const request = index.openCursor(IDBKeyRange.upperBound(Date.now()));
      
      request.onsuccess = () => {
        const cursor = request.result;
        if (cursor) {
          cursor.delete();
          cursor.continue();
        } else {
          console.log('Expired cache entries cleaned up');
          resolve();
        }
      };
      
      request.onerror = () => {
        reject(request.error);
      };
    });
  }
}

// Singleton instance
export const indexedDBService: IndexedDBService = new IndexedDBServiceImpl();

// Initialize IndexedDB when the module is imported
indexedDBService.init().catch(error => {
  console.error('Failed to initialize IndexedDB:', error);
});