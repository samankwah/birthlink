import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

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

export const useRecentRegistrations = (limit: number = 5): RecentRegistrationsData => {
  const { t } = useTranslation();
  const [registrations, setRegistrations] = useState<RecentRegistration[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRegistrations = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Simulate API call - replace with actual API integration
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Mock data - replace with actual API response
      const mockRegistrations: RecentRegistration[] = [
        {
          id: '1',
          registrationNumber: '#1234',
          childName: 'John Doe',
          timeAgo: '2 days ago',
          status: 'approved' as const
        },
        {
          id: '2',
          registrationNumber: '#1235',
          childName: 'Jane Smith',
          timeAgo: '3 days ago',
          status: 'approved' as const
        },
        {
          id: '3',
          registrationNumber: '#1236',
          childName: 'Michael Johnson',
          timeAgo: '1 week ago',
          status: 'pending' as const
        }
      ].slice(0, limit);
      
      setRegistrations(mockRegistrations);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch recent registrations');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRegistrations();
  }, [limit]);

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