import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { collection, query, where, getDocs } from 'firebase/firestore';
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
  const { t } = useTranslation();
  const { user } = useSelector((state: RootState) => state.auth);
  const [stats, setStats] = useState<DashboardStat[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRealStats = async () => {
    try {
      const registrationsRef = collection(db, 'registrations');
      
      // Always filter by current user - show only their registrations
      const baseQuery = query(registrationsRef, where('registrarInfo.registrarId', '==', user?.uid || 'unknown'));
      
      // If admin wants to see all data, they can use a different view
      // For now, dashboard shows personal data only

      // Get all registrations for counting
      const allRegistrationsSnapshot = await getDocs(baseQuery);
      const totalCount = allRegistrationsSnapshot.size;
      
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

      allRegistrationsSnapshot.forEach(doc => {
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

  const fetchStats = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      let statsData;
      
      if (shouldUseMockAuth()) {
        // Use mock data
        await new Promise(resolve => setTimeout(resolve, 800));
        statsData = getMockStats();
      } else {
        // Use real Firebase data
        statsData = await fetchRealStats();
      }
      
      // Calculate percentages and trends
      const processingRate = statsData.total > 0 ? 
        Math.round((statsData.approved / statsData.total) * 100) : 0;
        
      // const rejectionRate = statsData.total > 0 ? 
      //   Math.round((statsData.rejected / statsData.total) * 100) : 0;

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
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch dashboard statistics');
      console.error('Dashboard stats error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [t, user?.uid]);

  return {
    stats,
    isLoading,
    error,
    refresh: fetchStats
  };
};