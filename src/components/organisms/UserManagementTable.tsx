import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { User, UserRole, UserStatus } from '../../types';

interface UserManagementTableProps {
  users: User[];
  onUserEdit: (user: User) => void;
  onUserStatusChange: (userId: string, newStatus: UserStatus) => void;
  onUserDelete?: (userId: string) => void;
  loading?: boolean;
}

export const UserManagementTable: React.FC<UserManagementTableProps> = ({
  users,
  onUserEdit,
  onUserStatusChange,
  onUserDelete,
  loading = false
}) => {
  const { t } = useTranslation();
  const [sortField, setSortField] = useState<keyof User | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const handleSort = (field: keyof User) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedUsers = React.useMemo(() => {
    if (!sortField) return users;

    return [...users].sort((a, b) => {
      let aValue: any = a[sortField];
      let bValue: any = b[sortField];

      // Handle nested properties
      if (sortField === 'profile') {
        aValue = `${a.profile.firstName} ${a.profile.lastName}`;
        bValue = `${b.profile.firstName} ${b.profile.lastName}`;
      }

      // Handle dates
      if (aValue?.toDate && bValue?.toDate) {
        aValue = aValue.toDate().getTime();
        bValue = bValue.toDate().getTime();
      }

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [users, sortField, sortDirection]);

  const getRoleColor = (role: UserRole): string => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'registrar': return 'bg-blue-100 text-blue-800';
      case 'viewer': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: UserStatus): string => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'suspended': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const SortIcon: React.FC<{ field: keyof User }> = ({ field }) => {
    if (sortField !== field) {
      return <span className="text-gray-400">↕</span>;
    }
    return (
      <span className="text-blue-600">
        {sortDirection === 'asc' ? '↑' : '↓'}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">{t('common.loading')}...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('profile' as keyof User)}
              >
                <div className="flex items-center space-x-1">
                  <span>{t('userManagement.user')}</span>
                  <SortIcon field={'profile' as keyof User} />
                </div>
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('role')}
              >
                <div className="flex items-center space-x-1">
                  <span>{t('userManagement.role')}</span>
                  <SortIcon field="role" />
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('userManagement.region')}
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('status')}
              >
                <div className="flex items-center space-x-1">
                  <span>{t('userManagement.status')}</span>
                  <SortIcon field="status" />
                </div>
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('lastLogin')}
              >
                <div className="flex items-center space-x-1">
                  <span>{t('userManagement.lastLogin')}</span>
                  <SortIcon field="lastLogin" />
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('common.actions')}
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedUsers.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                  <div className="flex flex-col items-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                      <span className="text-2xl">👥</span>
                    </div>
                    <p className="text-lg font-medium">{t('userManagement.noUsers')}</p>
                    <p className="text-sm">{t('userManagement.noUsersDescription')}</p>
                  </div>
                </td>
              </tr>
            ) : (
              sortedUsers.map((user) => (
                <tr key={user.uid} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <span className="text-blue-600 font-medium">
                            {user.profile.firstName.charAt(0)}{user.profile.lastName.charAt(0)}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {user.profile.firstName} {user.profile.lastName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(user.role)}`}>
                      {t(`userManagement.roles.${user.role}`)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div>
                      <div className="font-medium">{user.profile.region}</div>
                      <div className="text-gray-500">{user.profile.district}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(user.status)}`}>
                      {t(`userManagement.statuses.${user.status}`)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.lastLogin ? (
                      <div>
                        <div>{new Date(user.lastLogin.toDate()).toLocaleDateString()}</div>
                        <div className="text-xs">
                          {new Date(user.lastLogin.toDate()).toLocaleTimeString()}
                        </div>
                      </div>
                    ) : (
                      <span className="text-gray-400">{t('common.never')}</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => onUserEdit(user)}
                        className="text-blue-600 hover:text-blue-900 transition-colors"
                        title={t('common.edit')}
                      >
                        {t('common.edit')}
                      </button>
                      {user.status === 'active' ? (
                        <button
                          onClick={() => onUserStatusChange(user.uid, 'suspended')}
                          className="text-red-600 hover:text-red-900 transition-colors"
                          title={t('userManagement.suspend')}
                        >
                          {t('userManagement.suspend')}
                        </button>
                      ) : (
                        <button
                          onClick={() => onUserStatusChange(user.uid, 'active')}
                          className="text-green-600 hover:text-green-900 transition-colors"
                          title={t('userManagement.activate')}
                        >
                          {t('userManagement.activate')}
                        </button>
                      )}
                      {onUserDelete && (
                        <button
                          onClick={() => {
                            if (window.confirm(t('userManagement.deleteConfirmation'))) {
                              onUserDelete(user.uid);
                            }
                          }}
                          className="text-red-600 hover:text-red-900 transition-colors"
                          title={t('common.delete')}
                        >
                          {t('common.delete')}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Table Footer with Stats */}
      {sortedUsers.length > 0 && (
        <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
          <div className="flex justify-between items-center text-sm text-gray-700">
            <div>
              {t('userManagement.totalUsers', { count: sortedUsers.length })}
            </div>
            <div className="flex space-x-4">
              <span>
                {t('userManagement.activeUsers', { 
                  count: sortedUsers.filter(u => u.status === 'active').length 
                })}
              </span>
              <span>
                {t('userManagement.adminUsers', { 
                  count: sortedUsers.filter(u => u.role === 'admin').length 
                })}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};