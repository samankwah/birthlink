import React, { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '../store';
import type { UserProfile as UserProfileType, Language } from '../types';
import { Button } from '../components/atoms';
import { FormField, Notification } from '../components/molecules';
import { Layout } from '../components/templates/Layout';
import { updateUserProfile, updateUserPreferences } from '../store/slices/authSlice';
import { GHANA_REGIONS } from '../types';

interface ProfileFormData {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  region: string;
  district: string;
  language: Language;
  notifications: boolean;
}

export const UserProfile: React.FC = () => {
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const { user, isLoading } = useSelector((state: RootState) => state.auth);
  
  const [formData, setFormData] = useState<ProfileFormData>({
    firstName: user?.profile.firstName || '',
    lastName: user?.profile.lastName || '',
    phoneNumber: user?.profile.phoneNumber || '',
    region: user?.profile.region || '',
    district: user?.profile.district || '',
    language: user?.preferences.language || 'en',
    notifications: user?.preferences.notifications || true
  });
  
  const [notification, setNotification] = useState<{type: 'success' | 'error', message: string} | null>(null);
  const [saving, setSaving] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const actualValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    
    setFormData(prev => ({
      ...prev,
      [name]: actualValue
    }));
  }, []);

  const handlePasswordInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  }, []);

  const validateForm = (): boolean => {
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      setNotification({
        type: 'error',
        message: t('userProfile.requiredFieldsError')
      });
      return false;
    }

    if (formData.phoneNumber && !formData.phoneNumber.match(/^\+233\d{9}$|^0\d{9}$/)) {
      setNotification({
        type: 'error',
        message: t('userProfile.invalidPhoneError')
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setSaving(true);
    try {
      const updatedProfile: UserProfileType = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phoneNumber: formData.phoneNumber,
        region: formData.region,
        district: formData.district
      };

      const preferences = {
        language: formData.language,
        notifications: formData.notifications
      };

      // Update language immediately
      if (formData.language !== i18n.language) {
        i18n.changeLanguage(formData.language);
      }

      // Dispatch update actions
      await dispatch(updateUserProfile(updatedProfile)).unwrap();
      
      if (user?.preferences.language !== formData.language || user?.preferences.notifications !== formData.notifications) {
        await dispatch(updateUserPreferences(preferences)).unwrap();
      }

      setNotification({
        type: 'success',
        message: t('userProfile.updateSuccess')
      });
    } catch (error) {
      setNotification({
        type: 'error',
        message: error instanceof Error ? error.message : t('userProfile.updateError')
      });
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      setNotification({
        type: 'error',
        message: t('userProfile.passwordRequiredError')
      });
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setNotification({
        type: 'error',
        message: t('userProfile.passwordMismatchError')
      });
      return;
    }

    if (passwordData.newPassword.length < 8) {
      setNotification({
        type: 'error',
        message: t('userProfile.passwordTooShortError')
      });
      return;
    }

    setSaving(true);
    try {
      // In production, this would use Firebase Auth to change password
      console.log('Changing password for user:', user?.uid);
      
      setNotification({
        type: 'success',
        message: t('userProfile.passwordChangeSuccess')
      });

      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setShowChangePassword(false);
    } catch (error) {
      setNotification({
        type: 'error',
        message: t('userProfile.passwordChangeError')
      });
    } finally {
      setSaving(false);
    }
  };

  if (!user) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">
              {t('userProfile.notLoggedIn')}
            </h1>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {t('userProfile.title')}
          </h1>
          <p className="text-gray-600">
            {t('userProfile.subtitle')}
          </p>
        </div>

        {/* Notifications */}
        {notification && (
          <Notification
            id="user-profile-notification"
            type={notification.type}
            message={notification.message}
            onClose={() => setNotification(null)}
          />
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">
                {t('userProfile.personalInformation')}
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    label={t('userProfile.firstName')}
                    name="firstName"
                    required
                    value={formData.firstName}
                    onChange={handleInputChange}
                    disabled={saving}
                  />
                  <FormField
                    label={t('userProfile.lastName')}
                    name="lastName"
                    required
                    value={formData.lastName}
                    onChange={handleInputChange}
                    disabled={saving}
                  />
                </div>

                <FormField
                  label={t('userProfile.email')}
                  name="email"
                  type="email"
                  value={user.email}
                  disabled
                />

                <FormField
                  label={t('userProfile.phoneNumber')}
                  name="phoneNumber"
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  disabled={saving}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('userProfile.region')}
                    </label>
                    <select
                      name="region"
                      value={formData.region}
                      onChange={handleInputChange}
                      disabled={saving}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">{t('userProfile.selectRegion')}</option>
                      {GHANA_REGIONS.map(region => (
                        <option key={region} value={region}>{region}</option>
                      ))}
                    </select>
                  </div>

                  <FormField
                    label={t('userProfile.district')}
                    name="district"
                    value={formData.district}
                    onChange={handleInputChange}
                    disabled={saving}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('userProfile.language')}
                  </label>
                  <select
                    name="language"
                    value={formData.language}
                    onChange={handleInputChange}
                    disabled={saving}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="en">{t('languages.english')}</option>
                    <option value="tw">{t('languages.twi')}</option>
                    <option value="ga">{t('languages.ga')}</option>
                    <option value="ee">{t('languages.ewe')}</option>
                  </select>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="notifications"
                    name="notifications"
                    checked={formData.notifications}
                    onChange={handleInputChange}
                    disabled={saving}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="notifications" className="ml-2 block text-sm text-gray-900">
                    {t('userProfile.enableNotifications')}
                  </label>
                </div>

                <div className="flex justify-end">
                  <Button
                    type="submit"
                    disabled={saving || isLoading}
                  >
                    {saving ? t('common.saving') : t('userProfile.saveChanges')}
                  </Button>
                </div>
              </form>
            </div>
          </div>

          {/* Account Information & Security */}
          <div className="space-y-6">
            {/* Account Info */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4">
                {t('userProfile.accountInformation')}
              </h3>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="font-medium text-gray-600">{t('userProfile.role')}:</span>
                  <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                    user.role === 'admin' ? 'bg-red-100 text-red-800' :
                    user.role === 'registrar' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {t(`userProfile.roles.${user.role}`)}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-gray-600">{t('userProfile.memberSince')}:</span>
                  <span className="ml-2">
                    {new Date(user.createdAt.toDate()).toLocaleDateString()}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-gray-600">{t('userProfile.lastLogin')}:</span>
                  <span className="ml-2">
                    {user.lastLogin ? new Date(user.lastLogin.toDate()).toLocaleDateString() : t('common.never')}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-gray-600">{t('userProfile.status')}:</span>
                  <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                    user.status === 'active' ? 'bg-green-100 text-green-800' :
                    user.status === 'suspended' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {t(`userProfile.statuses.${user.status}`)}
                  </span>
                </div>
              </div>
            </div>

            {/* Security Settings */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4">
                {t('userProfile.security')}
              </h3>
              
              {!showChangePassword ? (
                <div>
                  <p className="text-sm text-gray-600 mb-4">
                    {t('userProfile.passwordInfo')}
                  </p>
                  <Button
                    variant="ghost"
                    onClick={() => setShowChangePassword(true)}
                  >
                    {t('userProfile.changePassword')}
                  </Button>
                </div>
              ) : (
                <form onSubmit={handlePasswordChange} className="space-y-4">
                  <FormField
                    label={t('userProfile.currentPassword')}
                    name="currentPassword"
                    type="password"
                    required
                    value={passwordData.currentPassword}
                    onChange={handlePasswordInputChange}
                    disabled={saving}
                  />
                  <FormField
                    label={t('userProfile.newPassword')}
                    name="newPassword"
                    type="password"
                    required
                    value={passwordData.newPassword}
                    onChange={handlePasswordInputChange}
                    disabled={saving}
                  />
                  <FormField
                    label={t('userProfile.confirmNewPassword')}
                    name="confirmPassword"
                    type="password"
                    required
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordInputChange}
                    disabled={saving}
                  />
                  
                  <div className="flex space-x-2">
                    <Button
                      type="submit"
                      disabled={saving}
                    >
                      {saving ? t('common.updating') : t('userProfile.updatePassword')}
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => {
                        setShowChangePassword(false);
                        setPasswordData({
                          currentPassword: '',
                          newPassword: '',
                          confirmPassword: ''
                        });
                      }}
                    >
                      {t('common.cancel')}
                    </Button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};