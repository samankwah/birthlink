import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';

export interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: string;
  action: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary';
  requiredRole?: string;
}

export const useQuickActions = (): QuickAction[] => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);

  return useMemo(() => {
    const actions: QuickAction[] = [
      {
        id: 'new-registration',
        title: t('registration.newRegistration'),
        description: 'Create a new birth registration',
        icon: '📝',
        action: () => navigate('/registrations/new'),
        variant: 'primary',
        requiredRole: 'registrar'
      },
      {
        id: 'view-registrations',
        title: t('navigation.registrations'),
        description: 'View and manage registrations',
        icon: '🔍',
        action: () => navigate('/registrations'),
        variant: 'secondary'
      },
      {
        id: 'generate-certificate',
        title: 'Generate Certificate',
        description: 'Create birth certificates',
        icon: '📄',
        action: () => navigate('/certificate/generate'),
        variant: 'secondary'
      },
      {
        id: 'user-management',
        title: 'User Management',
        description: 'Manage system users',
        icon: '👥',
        action: () => navigate('/users'),
        variant: 'secondary',
        requiredRole: 'admin'
      }
    ];

    // Filter actions based on user role
    return actions.filter(action => {
      if (!action.requiredRole) return true;
      return user?.role === action.requiredRole || user?.role === 'admin';
    });
  }, [t, navigate, user]);
};