import React from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import type { RootState } from '../store';

export const Dashboard: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);

  const stats = [
    {
      label: t('dashboard.totalRegistrations'),
      value: '1,234',
      icon: '📊'
    },
    {
      label: t('dashboard.pendingApprovals'),
      value: '23',
      icon: '⏳'
    },
    {
      label: t('dashboard.monthlyStats'),
      value: '156',
      icon: '📈'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-white shadow rounded-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {t('dashboard.welcome', { name: user?.profile.firstName })}
        </h1>
        <p className="mt-2 text-gray-600">
          Welcome to BirthLink Ghana - Birth Registration System
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center">
              <div className="text-3xl mr-4">{stat.icon}</div>
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">
          {t('dashboard.quickActions')}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button 
            onClick={() => navigate('/registrations/new')}
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <div className="text-2xl mr-3">📝</div>
            <div className="text-left">
              <p className="font-medium text-gray-900">{t('registration.newRegistration')}</p>
              <p className="text-sm text-gray-500">Create a new birth registration</p>
            </div>
          </button>
          <button 
            onClick={() => navigate('/registrations')}
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <div className="text-2xl mr-3">🔍</div>
            <div className="text-left">
              <p className="font-medium text-gray-900">{t('navigation.registrations')}</p>
              <p className="text-sm text-gray-500">View and manage registrations</p>
            </div>
          </button>
        </div>
      </div>

      {/* Recent Registrations */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">
          {t('dashboard.recentRegistrations')}
        </h2>
        <div className="space-y-3">
          {[1, 2, 3].map((item) => (
            <div key={item} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">Registration #{item}234</p>
                <p className="text-sm text-gray-500">John Doe - 2 days ago</p>
              </div>
              <div className="text-sm text-green-600 font-medium">
                {t('registration.approved')}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};