import { useEffect, useState, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '../store';
import { indexedDBService } from '../services/indexedDB';
import type { BirthRegistration, RegistrationFormData } from '../types';
import { createRegistration } from '../store/slices/registrationSlice';
import { addToSyncQueue, processSyncQueue } from '../store/slices/syncSlice';
import { addNotification } from '../store/slices/uiSlice';

export interface UseOfflineRegistrationsResult {
  // Data
  offlineRegistrations: BirthRegistration[];
  isLoading: boolean;
  error: string | null;
  
  // Network status
  isOnline: boolean;
  pendingSyncCount: number;
  
  // Actions
  createOfflineRegistration: (formData: RegistrationFormData) => Promise<string>;
  syncOfflineData: () => Promise<void>;
  loadOfflineRegistrations: () => Promise<void>;
  clearOfflineData: () => Promise<void>;
}

export const useOfflineRegistrations = (): UseOfflineRegistrationsResult => {
  const dispatch = useDispatch<AppDispatch>();
  const { isOnline, queue: syncQueue, isSyncing } = useSelector((state: RootState) => state.sync);
  const { user } = useSelector((state: RootState) => state.auth);
  
  const [offlineRegistrations, setOfflineRegistrations] = useState<BirthRegistration[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadOfflineRegistrations = useCallback(async (): Promise<void> => {
    try {
      setIsLoading(true);
      const registrations = await indexedDBService.getAllRegistrations();
      setOfflineRegistrations(registrations);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load offline registrations';
      setError(errorMessage);
      console.error('Failed to load offline registrations:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const syncOfflineData = useCallback(async (): Promise<void> => {
    if (!isOnline) {
      dispatch(addNotification({
        type: 'warning',
        message: 'Cannot sync while offline'
      }));
      return;
    }

    try {
      await dispatch(processSyncQueue()).unwrap();
      
      // Reload offline registrations to update sync status
      await loadOfflineRegistrations();
      
      dispatch(addNotification({
        type: 'success',
        message: 'Data synchronized successfully'
      }));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to sync data';
      setError(errorMessage);
      dispatch(addNotification({
        type: 'error',
        message: errorMessage
      }));
      console.error('Sync failed:', err);
    }
  }, [isOnline, dispatch, loadOfflineRegistrations]);

  // Load offline registrations on mount
  useEffect(() => {
    loadOfflineRegistrations();
  }, [loadOfflineRegistrations]);

  // Auto-sync when coming back online
  useEffect(() => {
    if (isOnline && syncQueue.length > 0) {
      syncOfflineData();
    }
  }, [isOnline, syncQueue.length, syncOfflineData]);

  const generateOfflineRegistrationNumber = (): string => {
    const year = new Date().getFullYear();
    const timestamp = Date.now().toString().slice(-6);
    return `OFFLINE-${year}-${timestamp}`;
  };

  const createOfflineRegistration = async (formData: RegistrationFormData): Promise<string> => {
    try {
      setIsLoading(true);
      setError(null);

      const registration: BirthRegistration = {
        id: crypto.randomUUID(),
        registrationNumber: generateOfflineRegistrationNumber(),
        childDetails: {
          ...formData.childDetails,
          dateOfBirth: new Date(formData.childDetails.dateOfBirth)
        },
        motherDetails: {
          ...formData.motherDetails,
          dateOfBirth: new Date(formData.motherDetails.dateOfBirth)
        },
        fatherDetails: {
          ...formData.fatherDetails,
          dateOfBirth: new Date(formData.fatherDetails.dateOfBirth)
        },
        registrarInfo: {
          registrarId: user?.uid || 'unknown',
          registrationDate: new Date(),
          location: user?.profile.district || 'Unknown',
          region: user?.profile.region || 'Unknown',
          district: user?.profile.district || 'Unknown'
        },
        status: 'draft',
        syncStatus: 'pending',
        createdAt: new Date() as unknown as import('firebase/firestore').Timestamp,
        updatedAt: new Date() as unknown as import('firebase/firestore').Timestamp
      };

      if (isOnline) {
        // If online, try to create normally first
        try {
          const result = await dispatch(createRegistration(formData)).unwrap();
          return result.id;
        } catch (error) {
          console.warn('Online creation failed, falling back to offline:', error);
          // Fall through to offline creation
        }
      }

      // Store in IndexedDB
      await indexedDBService.addRegistration(registration);

      // Add to sync queue
      await dispatch(addToSyncQueue({
        userId: user?.uid || '',
        operationType: 'create',
        collectionName: 'registrations',
        documentId: registration.id,
        data: registration as unknown as Record<string, unknown>
      }));

      // Update local state
      await loadOfflineRegistrations();

      dispatch(addNotification({
        type: isOnline ? 'warning' : 'info',
        message: isOnline 
          ? 'Saved offline due to sync issues. Will sync when connection improves.'
          : 'Registration saved offline. Will sync when you\'re back online.'
      }));

      return registration.id;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create registration';
      setError(errorMessage);
      
      dispatch(addNotification({
        type: 'error',
        message: errorMessage
      }));

      throw err;
    } finally {
      setIsLoading(false);
    }
  };


  const clearOfflineData = async (): Promise<void> => {
    try {
      setIsLoading(true);
      
      // Clear IndexedDB data
      const registrations = await indexedDBService.getAllRegistrations();
      for (const registration of registrations) {
        await indexedDBService.deleteRegistration(registration.id);
      }
      
      // Clear sync queue
      await indexedDBService.clearSyncQueue();
      
      // Update local state
      setOfflineRegistrations([]);
      
      dispatch(addNotification({
        type: 'info',
        message: 'Offline data cleared'
      }));

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to clear offline data';
      setError(errorMessage);
      console.error('Failed to clear offline data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    // Data
    offlineRegistrations,
    isLoading: isLoading || isSyncing,
    error,
    
    // Network status
    isOnline,
    pendingSyncCount: syncQueue.filter(item => item.status === 'pending').length,
    
    // Actions
    createOfflineRegistration,
    syncOfflineData,
    loadOfflineRegistrations,
    clearOfflineData
  };
};