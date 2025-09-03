import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { collection, query, where, getDocs, onSnapshot, type Unsubscribe } from 'firebase/firestore';
import { db, shouldUseMockAuth } from '../services/firebase';
import type { RootState } from '../store';

export interface DashboardStat {
  label: string;
  value: string;
  icon: string;
  trend?: 'up' | 'down' | 'stable';
  status?: 'good' | 'warning' | 'critical';
  percentage?: string;
  subtitle?: string;
}

export interface DashboardStats {
  stats: DashboardStat[];
  isLoading: boolean;
  error: string | null;
  refresh: () => void;
}


export const useDashboardStats = (): DashboardStats => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [stats, setStats] = useState<DashboardStat[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  console.log('🚀 useDashboardStats hook initialized for user:', user?.profile?.firstName || 'Unknown');

  const processStatsData = (querySnapshot: any) => {
    const totalCount = querySnapshot.size;
    
    // Count by status
    const statusCounts = {
      draft: 0,
      submitted: 0,
      approved: 0,
      rejected: 0
    };

    // Count registrations this month
    const thisMonthStart = new Date();
    thisMonthStart.setDate(1);
    thisMonthStart.setHours(0, 0, 0, 0);
    
    let thisMonthCount = 0;

    querySnapshot.forEach((doc: any) => {
      const data = doc.data();
      const status = data.status;
      if (status in statusCounts) {
        statusCounts[status as keyof typeof statusCounts]++;
      }

      // Count this month's registrations
      const createdAt = data.createdAt;
      if (createdAt) {
        let createdDate: Date;
        if (createdAt.toDate) {
          createdDate = createdAt.toDate();
        } else if (createdAt.seconds) {
          createdDate = new Date(createdAt.seconds * 1000);
        } else {
          createdDate = new Date(createdAt);
        }
        
        if (createdDate >= thisMonthStart) {
          thisMonthCount++;
        }
      }
    });

    return {
      total: totalCount,
      pending: statusCounts.submitted,
      approved: statusCounts.approved,
      rejected: statusCounts.rejected,
      draft: statusCounts.draft,
      thisMonth: thisMonthCount
    };
  };

  const setupRealTimeListener = (): Unsubscribe => {
    const registrationsRef = collection(db, 'registrations');
    console.log('🔍 Dashboard real-time listener setup - User:', user?.uid, 'Role:', user?.role);
    
    let realtimeQuery;
    if (user?.role === 'admin') {
      console.log('👑 Setting up admin real-time listener (all registrations)');
      realtimeQuery = query(registrationsRef);
    } else {
      console.log('👤 Setting up user-specific real-time listener');
      realtimeQuery = query(registrationsRef, where('registrarInfo.registrarId', '==', user?.uid || 'unknown'));
    }
    
    return onSnapshot(realtimeQuery, (querySnapshot) => {
      try {
        console.log('📊 Dashboard stats real-time update:', querySnapshot.size, 'registrations found');
        const statsData = processStatsData(querySnapshot);
        updateStatsDisplay(statsData);
        setError(null);
      } catch (error) {
        console.error('Error processing real-time stats:', error);
        setError(error instanceof Error ? error.message : 'Failed to update dashboard statistics');
      }
    }, (error) => {
      console.error('Real-time listener error:', error);
      setError(error.message || 'Real-time updates failed');
    });
  };

  const fetchRealStats = async () => {
    try {
      const registrationsRef = collection(db, 'registrations');
      console.log('🔍 Dashboard initial fetch - User UID:', user?.uid);
      console.log('🔍 Dashboard initial fetch - User role:', user?.role);
      console.log('🔍 Dashboard initial fetch - User status:', user?.status);
      
      console.log('🔍 Testing basic Firestore read permissions...');
      
      // Check if user is admin first
      console.log('🔍 Checking user permissions based on role...');
      
      let allRegistrationsSnapshot;
      
      if (user?.role === 'admin') {
        console.log('👑 User is admin - attempting to read all registrations');
        try {
          const adminQuery = query(registrationsRef);
          allRegistrationsSnapshot = await getDocs(adminQuery);
          console.log('✅ Admin query succeeded. Found:', allRegistrationsSnapshot.size, 'total registrations');
        } catch (adminQueryError) {
          console.error('❌ Admin query failed:', adminQueryError);
          throw adminQueryError;
        }
      } else {
        console.log('👤 User is registrar - attempting user-specific query');
        console.log('🔍 Looking for registrations with registrarInfo.registrarId ==', user?.uid);
        
        try {
          const userQuery = query(registrationsRef, where('registrarInfo.registrarId', '==', user?.uid || 'unknown'));
          allRegistrationsSnapshot = await getDocs(userQuery);
          console.log('✅ User-specific query succeeded. Found:', allRegistrationsSnapshot.size, 'registrations');
        } catch (userQueryError) {
          console.error('❌ User-specific query failed:', userQueryError);
          console.log('📋 Error details:', userQueryError);
          throw userQueryError;
        }
      }
      
      const statsData = processStatsData(allRegistrationsSnapshot);
      console.log('📊 Processed stats data:', statsData);
      return statsData;
    } catch (error) {
      console.error('Error fetching real stats:', error);
      throw error;
    }
  };

  const getMockStats = () => {
    // User-specific mock data - simulating data for the current logged-in user only
    const userSpecificData = {
      total: 47,      // User has created 47 registrations total
      pending: 5,     // 5 pending approval
      approved: 39,   // 39 approved by admin
      rejected: 2,    // 2 rejected/expired
      draft: 1,       // 1 draft in progress
      thisMonth: 12   // 12 created this month
    };
    
    return userSpecificData;
  };

  const updateStatsDisplay = (statsData: any) => {
    // Calculate percentages and trends
    const processingRate = statsData.total > 0 ? 
      Math.round((statsData.approved / statsData.total) * 100) : 0;
      
    const dashboardStats: DashboardStat[] = [
      {
        label: 'Total Certificates',
        value: statsData.total.toLocaleString(),
        icon: 'document',
        trend: 'up',
        status: 'good',
        percentage: '+2% from last month',
        subtitle: ''
      },
      {
        label: 'Active',
        value: statsData.approved.toLocaleString(),
        icon: 'shield-check',
        trend: 'up',
        status: 'good',
        percentage: `${processingRate}% of total`,
        subtitle: ''
      },
      {
        label: 'Expiring Soon',
        value: statsData.pending.toLocaleString(),
        icon: 'clock',
        trend: 'stable',
        status: 'warning',
        percentage: 'Require attention',
        subtitle: ''
      },
      {
        label: 'Expired',
        value: statsData.rejected.toLocaleString(),
        icon: 'x-circle',
        trend: 'down',
        status: 'critical',
        percentage: 'Need renewal',
        subtitle: ''
      },
      {
        label: 'Resolved',
        value: '0',
        icon: 'check-circle',
        trend: 'stable',
        status: 'good',
        percentage: 'Handled',
        subtitle: ''
      },
      {
        label: 'Ignored',
        value: '1',
        icon: 'eye-slash',
        trend: 'stable',
        status: 'good',
        percentage: 'Dismissed',
        subtitle: ''
      }
    ];
    
    setStats(dashboardStats);
    setIsLoading(false);
  };

  const fetchStats = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      let statsData;
      
      if (shouldUseMockAuth()) {
        // Use mock data
        await new Promise(resolve => setTimeout(resolve, 800));
        statsData = getMockStats();
        updateStatsDisplay(statsData);
      } else {
        // Use real Firebase data (initial fetch)
        statsData = await fetchRealStats();
        updateStatsDisplay(statsData);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch dashboard statistics');
      console.error('Dashboard stats error:', err);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Don't set up listeners if no user
    if (!user?.uid) {
      console.log('📊 No user UID found, skipping dashboard stats setup');
      setIsLoading(false);
      return;
    }

    console.log('📊 Setting up dashboard stats for user:', user.uid);
    console.log('📊 User details:', {
      uid: user.uid,
      email: user.email,
      role: user.role,
      profile: user.profile,
      status: user.status,
      fullUserObject: user
    });

    let unsubscribe: Unsubscribe | null = null;

    const initializeStats = async () => {
      if (shouldUseMockAuth()) {
        // Use mock data - no real-time updates
        fetchStats();
      } else {
        // Initial fetch followed by real-time listener setup
        try {
          const statsData = await fetchRealStats();
          updateStatsDisplay(statsData);
          console.log('🎯 Initial stats fetch completed, setting up real-time listener...');
          unsubscribe = setupRealTimeListener();
        } catch (error) {
          console.error('Failed to initialize real-time stats:', error);
          setError(error instanceof Error ? error.message : 'Failed to load dashboard statistics');
          
          // Use mock data as fallback
          const mockData = getMockStats();
          updateStatsDisplay(mockData);
        }
      }
    };

    initializeStats();

    // Cleanup listener on unmount or user change
    return () => {
      if (unsubscribe) {
        console.log('🧹 Cleaning up dashboard stats real-time listener');
        unsubscribe();
      }
    };
  }, [user?.uid]);

  return {
    stats,
    isLoading,
    error,
    refresh: fetchStats
  };
};