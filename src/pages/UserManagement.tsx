import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';
import type { User, UserRole, UserStatus } from '../types';
import { Button } from '../components/atoms';
import { FormField, Notification } from '../components/molecules';
import { Layout } from '../components/templates/Layout';

interface UserFormData {
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  region: string;
  district: string;
  role: UserRole;
  language: string;
}

export const UserManagement: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useSelector((state: RootState) => state.auth);
  const [users, setUsers] = useState<User[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<UserFormData>({
    email: '',
    firstName: '',
    lastName: '',
    phoneNumber: '',
    region: '',
    district: '',
    role: 'registrar',
    language: 'en'
  });
  const [notification, setNotification] = useState<{type: 'success' | 'error', message: string} | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      // In production, this would fetch from Firebase
      // For now, using mock data
      const mockUsers: User[] = [
        {
          uid: '1',
          email: 'admin@birthlink.gov.gh',
          role: 'admin',
          profile: {
            firstName: 'System',
            lastName: 'Administrator',
            phoneNumber: '+233200000001',
            region: 'Greater Accra',
            district: 'Accra Metropolitan'
          },
          preferences: {
            language: 'en',
            notifications: true
          },
          status: 'active',
          createdAt: new Date() as any,
          lastLogin: new Date() as any
        }
      ];
      setUsers(mockUsers);
    } catch (error) {
      setNotification({
        type: 'error',
        message: t('userManagement.loadError')
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate form data
      if (!formData.email || !formData.firstName || !formData.lastName) {
        throw new Error(t('userManagement.requiredFieldsError'));
      }

      // In production, this would create user via Firebase Auth & Firestore
      console.log('Creating user:', formData);

      setNotification({
        type: 'success',
        message: t('userManagement.userCreated')
      });

      // Reset form
      setFormData({
        email: '',
        firstName: '',
        lastName: '',
        phoneNumber: '',
        region: '',
        district: '',
        role: 'registrar',
        language: 'en'
      });
      setShowCreateForm(false);
      loadUsers();
    } catch (error) {
      setNotification({
        type: 'error',
        message: error instanceof Error ? error.message : t('userManagement.createError')
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUserStatusChange = async (userId: string, newStatus: UserStatus) => {
    setLoading(true);
    try {
      // In production, update user status in Firestore
      console.log(`Updating user ${userId} status to ${newStatus}`);
      
      setNotification({
        type: 'success',
        message: t('userManagement.statusUpdated')
      });
      loadUsers();
    } catch (error) {
      setNotification({
        type: 'error',
        message: t('userManagement.updateError')
      });
    } finally {
      setLoading(false);
    }
  };

  // Check permissions
  if (user?.role !== 'admin') {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">
              {t('userManagement.accessDenied')}
            </h1>
            <p className="text-gray-600">
              {t('userManagement.adminRequired')}
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">
            {t('userManagement.title')}
          </h1>
          <Button
            onClick={() => setShowCreateForm(true)}
            disabled={loading}
          >
            {t('userManagement.createUser')}
          </Button>
        </div>

        {/* Notifications */}
        {notification && (
          <Notification
            id="user-management-notification"
            type={notification.type}
            message={notification.message}
            onClose={() => setNotification(null)}
          />
        )}

        {/* Create User Form */}
        {showCreateForm && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">
              {t('userManagement.createNewUser')}
            </h2>
            <form onSubmit={handleCreateUser} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                label={t('userManagement.email')}
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleInputChange}
              />
              <FormField
                label={t('userManagement.firstName')}
                name="firstName"
                required
                value={formData.firstName}
                onChange={handleInputChange}
              />
              <FormField
                label={t('userManagement.lastName')}
                name="lastName"
                required
                value={formData.lastName}
                onChange={handleInputChange}
              />
              <FormField
                label={t('userManagement.phoneNumber')}
                name="phoneNumber"
                type="tel"
                value={formData.phoneNumber}
                onChange={handleInputChange}
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('userManagement.role')}
                </label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="registrar">{t('userManagement.roles.registrar')}</option>
                  <option value="viewer">{t('userManagement.roles.viewer')}</option>
                  <option value="admin">{t('userManagement.roles.admin')}</option>
                </select>
              </div>
              <FormField
                label={t('userManagement.region')}
                name="region"
                value={formData.region}
                onChange={handleInputChange}
              />
              <div className="md:col-span-2 flex gap-4">
                <Button
                  type="submit"
                  disabled={loading}
                >
                  {loading ? t('common.loading') : t('userManagement.createUser')}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setShowCreateForm(false)}
                >
                  {t('common.cancel')}
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Users Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('userManagement.user')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('userManagement.role')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('userManagement.region')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('userManagement.status')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('userManagement.lastLogin')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('common.actions')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center">
                    {t('common.loading')}...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                    {t('userManagement.noUsers')}
                  </td>
                </tr>
              ) : (
                users.map((userData) => (
                  <tr key={userData.uid}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {userData.profile.firstName} {userData.profile.lastName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {userData.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        userData.role === 'admin' ? 'bg-red-100 text-red-800' :
                        userData.role === 'registrar' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {t(`userManagement.roles.${userData.role}`)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {userData.profile.region}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        userData.status === 'active' ? 'bg-green-100 text-green-800' :
                        userData.status === 'suspended' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {t(`userManagement.statuses.${userData.status}`)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {userData.lastLogin ? new Date(userData.lastLogin.toDate()).toLocaleDateString() : t('common.never')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setSelectedUser(userData)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          {t('common.edit')}
                        </button>
                        {userData.status === 'active' ? (
                          <button
                            onClick={() => handleUserStatusChange(userData.uid, 'suspended')}
                            className="text-red-600 hover:text-red-900"
                          >
                            {t('userManagement.suspend')}
                          </button>
                        ) : (
                          <button
                            onClick={() => handleUserStatusChange(userData.uid, 'active')}
                            className="text-green-600 hover:text-green-900"
                          >
                            {t('userManagement.activate')}
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

        {/* User Details Modal - Would be implemented as a separate component */}
        {selectedUser && (
          <div className="fixed inset-0 bg-white/20 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white/95 backdrop-blur rounded-lg p-6 w-full max-w-md shadow-2xl border border-white/30">
              <h3 className="text-lg font-medium mb-4">
                {t('userManagement.userDetails')}
              </h3>
              <div className="space-y-2">
                <p><strong>{t('userManagement.name')}:</strong> {selectedUser.profile.firstName} {selectedUser.profile.lastName}</p>
                <p><strong>{t('userManagement.email')}:</strong> {selectedUser.email}</p>
                <p><strong>{t('userManagement.role')}:</strong> {t(`userManagement.roles.${selectedUser.role}`)}</p>
                <p><strong>{t('userManagement.region')}:</strong> {selectedUser.profile.region}</p>
                <p><strong>{t('userManagement.district')}:</strong> {selectedUser.profile.district}</p>
                <p><strong>{t('userManagement.phone')}:</strong> {selectedUser.profile.phoneNumber}</p>
              </div>
              <div className="flex justify-end mt-4">
                <Button
                  variant="ghost"
                  onClick={() => setSelectedUser(null)}
                >
                  {t('common.close')}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};