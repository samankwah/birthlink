import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import type { BirthRegistration } from '../types';

interface UseRegistrationByIdResult {
  registration: BirthRegistration | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useRegistrationById = (registrationId: string | undefined): UseRegistrationByIdResult => {
  const [registration, setRegistration] = useState<BirthRegistration | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRegistration = async () => {
    if (!registrationId) {
      setError('Registration ID is required');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log('🔍 Fetching registration with ID:', registrationId);
      const docRef = doc(db, 'registrations', registrationId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        console.log('🔍 Found registration data:', data);
        
        // Convert Firestore data to BirthRegistration format
        const registrationData: BirthRegistration = {
          id: docSnap.id,
          registrationNumber: data.registrationNumber || '',
          childDetails: {
            firstName: data.childDetails?.firstName || '',
            lastName: data.childDetails?.lastName || '',
            dateOfBirth: data.childDetails?.dateOfBirth?.toDate() || new Date(),
            placeOfBirth: data.childDetails?.placeOfBirth || '',
            gender: data.childDetails?.gender || 'Male',
            hospitalOfBirth: data.childDetails?.hospitalOfBirth || '',
            registrationDistrict: data.childDetails?.registrationDistrict || '',
          },
          motherDetails: {
            firstName: data.motherDetails?.firstName || '',
            lastName: data.motherDetails?.lastName || '',
            nationalId: data.motherDetails?.nationalId || '',
            dateOfBirth: data.motherDetails?.dateOfBirth?.toDate() || new Date(),
            occupation: data.motherDetails?.occupation || '',
            phoneNumber: data.motherDetails?.phoneNumber || '',
            nationality: data.motherDetails?.nationality || 'Ghana',
          },
          fatherDetails: {
            firstName: data.fatherDetails?.firstName || '',
            lastName: data.fatherDetails?.lastName || '',
            nationalId: data.fatherDetails?.nationalId || '',
            dateOfBirth: data.fatherDetails?.dateOfBirth?.toDate() || new Date(),
            occupation: data.fatherDetails?.occupation || '',
            phoneNumber: data.fatherDetails?.phoneNumber || '',
            nationality: data.fatherDetails?.nationality || 'Ghana',
          },
          registrarInfo: {
            registrarId: data.registrarInfo?.registrarId || '',
            registrationDate: data.registrarInfo?.registrationDate?.toDate() || new Date(),
            location: data.registrarInfo?.location || '',
            region: data.registrarInfo?.region || '',
            district: data.registrarInfo?.district || '',
          },
          status: data.status || 'draft',
          syncStatus: data.syncStatus || 'pending',
          createdAt: data.createdAt || { seconds: Date.now() / 1000, nanoseconds: 0 },
          updatedAt: data.updatedAt || { seconds: Date.now() / 1000, nanoseconds: 0 },
        };

        setRegistration(registrationData);
      } else {
        setError('Registration not found');
        setRegistration(null);
      }
    } catch (err) {
      console.error('Error fetching registration:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch registration');
      setRegistration(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (registrationId) {
      fetchRegistration();
    } else {
      setRegistration(null);
      setError(null);
      setIsLoading(false);
    }
  }, [registrationId]);

  return {
    registration,
    isLoading,
    error,
    refetch: fetchRegistration,
  };
};