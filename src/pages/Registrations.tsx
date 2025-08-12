import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/atoms';
import type { RootState, AppDispatch } from '../store';
import { fetchRegistrations, resetPagination } from '../store/slices/registrationSlice';
import { useOfflineRegistrations } from '../hooks/useOfflineRegistrations';
import type { BirthRegistration } from '../types';

export const Registrations: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  
  const { registrations, isLoading, hasMore } = useSelector((state: RootState) => state.registrations);
  const { user } = useSelector((state: RootState) => state.auth);
  const { offlineRegistrations, isOnline, pendingSyncCount } = useOfflineRegistrations();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    dispatch(resetPagination());
    dispatch(fetchRegistrations({ 
      pageSize: 20,
      userId: user?.role === 'registrar' ? user.uid : undefined
    }));
  }, [dispatch, user]);

  const handleLoadMore = () => {
    if (!isLoading && hasMore) {
      dispatch(fetchRegistrations({ 
        pageSize: 20,
        userId: user?.role === 'registrar' ? user.uid : undefined
      }));
    }
  };

  // Combine online and offline registrations
  const allRegistrations = [...registrations, ...offlineRegistrations];
  
  const filteredRegistrations = allRegistrations.filter((registration) => {
    const matchesSearch = searchTerm === '' || 
      registration.childDetails.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      registration.childDetails.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      registration.registrationNumber.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === '' || registration.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getSyncStatusBadge = (syncStatus: BirthRegistration['syncStatus']) => {
    const syncStatusClasses = {
      pending: 'bg-yellow-100 text-yellow-800',
      synced: 'bg-green-100 text-green-800', 
      failed: 'bg-red-100 text-red-800'
    };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${syncStatusClasses[syncStatus]}`}>
        {syncStatus === 'pending' ? 'Pending Sync' : syncStatus === 'synced' ? 'Synced' : 'Sync Failed'}
      </span>
    );
  };

  const getStatusBadge = (status: BirthRegistration['status']) => {
    const statusClasses = {
      draft: 'bg-gray-100 text-gray-800',
      submitted: 'bg-blue-100 text-blue-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800'
    };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusClasses[status]}`}>
        {t(`registration.${status}`)}
      </span>
    );
  };

  const formatDate = (timestamp: unknown) => {
    if (!timestamp) return '';
    
    let date: Date;
    if (timestamp && typeof timestamp === 'object' && 'toDate' in timestamp && typeof timestamp.toDate === 'function') {
      date = (timestamp as { toDate: () => Date }).toDate();
    } else {
      date = new Date(timestamp as string | number | Date);
    }
    
    return date.toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {t('navigation.registrations')}
          </h1>
          <p className="mt-2 text-gray-600">
            Manage birth registrations and track their status
          </p>
        </div>
        
        {(user?.role === 'admin' || user?.role === 'registrar') && (
          <Link to="/registrations/new">
            <Button>
              {t('registration.newRegistration')}
            </Button>
          </Link>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('common.search')}
            </label>
            <input
              type="text"
              placeholder="Search by name or registration number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('registration.status')}
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Statuses</option>
              <option value="draft">{t('registration.draft')}</option>
              <option value="submitted">{t('registration.submitted')}</option>
              <option value="approved">{t('registration.approved')}</option>
              <option value="rejected">{t('registration.rejected')}</option>
            </select>
          </div>
          
          <div className="flex items-end">
            <Button
              variant="ghost"
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('');
              }}
            >
              {t('common.clear')}
            </Button>
          </div>
        </div>
      </div>

      {/* Registrations List */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        {/* Show offline status info */}
        {!isOnline && (
          <div className="px-6 py-4 bg-orange-50 border-b border-orange-200">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
              <span className="text-sm text-orange-800">
                You're offline. Showing {offlineRegistrations.length} offline registrations.
                {pendingSyncCount > 0 && ` ${pendingSyncCount} items will sync when you reconnect.`}
              </span>
            </div>
          </div>
        )}

        {isLoading && allRegistrations.length === 0 ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredRegistrations.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-4xl mb-4">📋</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No registrations found
            </h3>
            <p className="text-gray-500 mb-6">
              {allRegistrations.length === 0 
                ? "Get started by creating your first birth registration."
                : "Try adjusting your search or filter criteria."
              }
            </p>
            {allRegistrations.length === 0 && (user?.role === 'admin' || user?.role === 'registrar') && (
              <Link to="/registrations/new">
                <Button>
                  {t('registration.newRegistration')}
                </Button>
              </Link>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('registration.registrationNumber')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Child Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('registration.dateOfBirth')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('registration.status')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sync Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredRegistrations.map((registration) => (
                  <tr key={registration.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                      {registration.registrationNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {registration.childDetails.firstName} {registration.childDetails.lastName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(registration.childDetails.dateOfBirth)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(registration.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getSyncStatusBadge(registration.syncStatus)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(registration.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => navigate(`/registrations/${registration.id}`)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Load More */}
        {hasMore && !isLoading && (
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
            <Button
              variant="ghost"
              onClick={handleLoadMore}
              fullWidth
            >
              Load More
            </Button>
          </div>
        )}

        {isLoading && registrations.length > 0 && (
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
            <span className="text-sm text-gray-500">Loading more...</span>
          </div>
        )}
      </div>
    </div>
  );
};