import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

export interface DashboardStat {
  label: string;
  value: string;
  icon: string;
  trend?: 'up' | 'down' | 'stable';
  status?: 'good' | 'warning' | 'critical';
}

export interface DashboardStats {
  stats: DashboardStat[];
  isLoading: boolean;
  error: string | null;
  refresh: () => void;
}

export const useDashboardStats = (): DashboardStats => {
  const { t } = useTranslation();
  const [stats, setStats] = useState<DashboardStat[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Simulate API call - replace with actual API integration
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock data - replace with actual API response
      const mockStats: DashboardStat[] = [
        {
          label: t('dashboard.totalRegistrations'),
          value: '1,234',
          icon: '📊',
          trend: 'up',
          status: 'good'
        },
        {
          label: t('dashboard.pendingApprovals'),
          value: '23',
          icon: '⏳',
          trend: 'stable',
          status: 'warning'
        },
        {
          label: t('dashboard.monthlyStats'),
          value: '156',
          icon: '📈',
          trend: 'up',
          status: 'good'
        }
      ];
      
      setStats(mockStats);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch stats');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [t]);

  return {
    stats,
    isLoading,
    error,
    refresh: fetchStats
  };
};