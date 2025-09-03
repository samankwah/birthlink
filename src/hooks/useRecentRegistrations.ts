import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { collection, query, where, orderBy, limit, onSnapshot, getDocs, type Unsubscribe } from 'firebase/firestore';
import { db, shouldUseMockAuth } from '../services/firebase';
import type { RootState } from '../store';

export interface RecentRegistration {
  id: string;
  registrationNumber: string;
  childName: string;
  timeAgo: string;
  status: 'approved' | 'pending' | 'rejected';
}

export interface RecentRegistrationsData {
  registrations: RecentRegistration[];
  isLoading: boolean;
  error: string | null;
  refresh: () => void;
}


export const useRecentRegistrations = (limitCount: number = 5): RecentRegistrationsData => {
  const { t } = useTranslation();
  const { user } = useSelector((state: RootState) => state.auth);
  const [registrations, setRegistrations] = useState<RecentRegistration[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const processRegistrationData = (querySnapshot: any): RecentRegistration[] => {
    const recentRegistrations: RecentRegistration[] = [];
    
    querySnapshot.forEach((doc: any) => {
      const data = doc.data();
      
      // Get time ago
      const createdAt = data.createdAt;
      let timeAgo = 'Recently';
      
      if (createdAt) {
        let createdDate: Date;
        if (createdAt.toDate) {
          createdDate = createdAt.toDate();
        } else if (createdAt.seconds) {
          createdDate = new Date(createdAt.seconds * 1000);
        } else {
          createdDate = new Date(createdAt);
        }
        
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - createdDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) {
          timeAgo = '1 day ago';
        } else if (diffDays < 7) {
          timeAgo = `${diffDays} days ago`;
        } else if (diffDays < 14) {
          timeAgo = '1 week ago';
        } else if (diffDays < 30) {
          timeAgo = `${Math.ceil(diffDays / 7)} weeks ago`;
        } else {
          timeAgo = `${Math.ceil(diffDays / 30)} months ago`;
        }
      }
      
      recentRegistrations.push({
        id: doc.id,
        registrationNumber: data.registrationNumber || `REG${doc.id.slice(-6).toUpperCase()}`,
        childName: (data.childDetails?.firstName && data.childDetails?.lastName) 
          ? `${data.childDetails.firstName} ${data.childDetails.lastName}`
          : data.childName || `${data.childFirstName || ''} ${data.childLastName || ''}`.trim() || 'Unknown Child',
        timeAgo,
        status: data.status || 'pending'
      });
    });
    
    return recentRegistrations;
  };

  const setupRealTimeListener = (): Unsubscribe => {
    const registrationsRef = collection(db, 'registrations');
    console.log('🔍 Recent registrations real-time listener setup - User:', user?.uid, 'Role:', user?.role);
    
    let realtimeQuery;
    if (user?.role === 'admin') {
      console.log('👑 Setting up admin real-time listener (all recent registrations)');
      realtimeQuery = query(
        registrationsRef,
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );
    } else {
      console.log('👤 Setting up user-specific real-time listener');
      realtimeQuery = query(
        registrationsRef, 
        where('registrarInfo.registrarId', '==', user?.uid || 'unknown'),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );
    }
    
    return onSnapshot(realtimeQuery, (querySnapshot) => {
      try {
        console.log('📋 Recent registrations real-time update:', querySnapshot.size, 'found');
        const recentData = processRegistrationData(querySnapshot);
        setRegistrations(recentData);
        setError(null);
        setIsLoading(false);
      } catch (error) {
        console.error('Error processing real-time registrations:', error);
        setError(error instanceof Error ? error.message : 'Failed to update registrations');
        setIsLoading(false);
      }
    }, (error) => {
      console.error('Real-time registrations listener error:', error);
      setError(error.message || 'Real-time updates failed');
      setIsLoading(false);
    });
  };

  const fetchRealRegistrations = async () => {
    try {
      const registrationsRef = collection(db, 'registrations');
      console.log('📋 Recent registrations fetch - User:', user?.uid, 'Role:', user?.role);
      
      let querySnapshot;
      
      if (user?.role === 'admin') {
        console.log('👑 Admin fetching all recent registrations');
        const adminQuery = query(
          registrationsRef,
          orderBy('createdAt', 'desc'),
          limit(limitCount)
        );
        querySnapshot = await getDocs(adminQuery);
      } else {
        console.log('👤 Registrar fetching own recent registrations');
        const userQuery = query(
          registrationsRef, 
          where('registrarInfo.registrarId', '==', user?.uid || 'unknown'),
          orderBy('createdAt', 'desc'),
          limit(limitCount)
        );
        querySnapshot = await getDocs(userQuery);
      }
      
      console.log('📋 Recent registrations query found:', querySnapshot.size, 'registrations');
      const recentData = processRegistrationData(querySnapshot);
      return recentData;
    } catch (error) {
      console.error('Error fetching real registrations:', error);
      throw error;
    }
  };

  const getMockRegistrations = (): RecentRegistration[] => {
    const mockRegistrations: RecentRegistration[] = [
      {
        id: '1',
        registrationNumber: '#BR001234',
        childName: 'John Doe',
        timeAgo: '2 days ago',
        status: 'approved' as const
      },
      {
        id: '2',
        registrationNumber: '#BR001235',
        childName: 'Jane Smith',
        timeAgo: '3 days ago',
        status: 'approved' as const
      },
      {
        id: '3',
        registrationNumber: '#BR001236',
        childName: 'Michael Johnson',
        timeAgo: '1 week ago',
        status: 'pending' as const
      },
      {
        id: '4',
        registrationNumber: '#BR001237',
        childName: 'Sarah Wilson',
        timeAgo: '2 weeks ago',
        status: 'approved' as const
      }
    ].slice(0, limitCount);
    
    return mockRegistrations;
  };

  const fetchRegistrations = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      if (shouldUseMockAuth()) {
        // Use mock data
        await new Promise(resolve => setTimeout(resolve, 800));
        const mockData = getMockRegistrations();
        setRegistrations(mockData);
      } else {
        // Use real Firebase data (initial fetch)
        const realData = await fetchRealRegistrations();
        setRegistrations(realData);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch recent registrations');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Don't set up listeners if no user
    if (!user?.uid) {
      console.log('📋 No user UID found, skipping recent registrations setup');
      setIsLoading(false);
      return;
    }

    console.log('📋 Setting up recent registrations for user:', user.uid);
    console.log('📋 User details:', {
      uid: user.uid,
      email: user.email,
      role: user.role,
      profile: user.profile,
      status: user.status
    });

    let unsubscribe: Unsubscribe | null = null;

    const initializeRegistrations = async () => {
      if (shouldUseMockAuth()) {
        // Use mock data - no real-time updates
        fetchRegistrations();
      } else {
        // Initial fetch followed by real-time listener setup
        try {
          const initialData = await fetchRealRegistrations();
          setRegistrations(initialData);
          console.log('🎯 Initial recent registrations fetch completed, setting up real-time listener...');
          unsubscribe = setupRealTimeListener();
        } catch (error) {
          console.error('Failed to initialize real-time registrations:', error);
          setError(error instanceof Error ? error.message : 'Failed to load recent registrations');
          
          // Use mock data as fallback
          const mockData = getMockRegistrations();
          setRegistrations(mockData);
          setIsLoading(false);
        }
      }
    };

    initializeRegistrations();

    // Cleanup listener on unmount or user change
    return () => {
      if (unsubscribe) {
        console.log('🧹 Cleaning up recent registrations real-time listener');
        unsubscribe();
      }
    };
  }, [user?.uid, limitCount]);

  const getStatusDisplay = (status: RecentRegistration['status']) => {
    switch (status) {
      case 'approved':
        return {
          text: t('registration.approved'),
          className: 'text-green-600'
        };
      case 'pending':
        return {
          text: t('registration.pending'),
          className: 'text-yellow-600'
        };
      case 'rejected':
        return {
          text: t('registration.rejected'),
          className: 'text-red-600'
        };
    }
  };

  return {
    registrations: registrations.map(reg => ({
      ...reg,
      statusDisplay: getStatusDisplay(reg.status)
    })) as any,
    isLoading,
    error,
    refresh: fetchRegistrations
  };
};