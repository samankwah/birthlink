import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';
import type { SystemConfig } from '../types';
import { Button } from '../components/atoms';
import { FormField, Notification } from '../components/molecules';
import { Layout } from '../components/templates/Layout';
import { useDocumentTitle } from '../hooks';

interface SettingsFormData {
  systemMaintenance: boolean;
  registrationsPerDay: number;
  syncBatchSize: number;
  supportedLanguages: string[];
  enableAnalytics: boolean;
  enableSMSNotifications: boolean;
  maxOfflineRegistrations: number;
  syncRetryAttempts: number;
  sessionTimeoutMinutes: number;
}

export const Settings: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useSelector((state: RootState) => state.auth);
  
  // Set page title
  useDocumentTitle("Settings");
  
  const [formData, setFormData] = useState<SettingsFormData>({
    systemMaintenance: false,
    registrationsPerDay: 1000,
    syncBatchSize: 50,
    supportedLanguages: ['en', 'tw'],
    enableAnalytics: true,
    enableSMSNotifications: false,
    maxOfflineRegistrations: 100,
    syncRetryAttempts: 5,
    sessionTimeoutMinutes: 60
  });
  
  const [notification, setNotification] = useState<{type: 'success' | 'error' | 'warning', message: string} | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'general' | 'sync' | 'security' | 'advanced'>('general');

  useEffect(() => {
    loadSystemConfig();
  }, []);

  const loadSystemConfig = async () => {
    setLoading(true);
    try {
      // In production, fetch from Firestore systemConfig collection
      // For now, using default values
      console.log('Loading system configuration...');
    } catch (error) {
      setNotification({
        type: 'error',
        message: t('settings.loadError')
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const actualValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : 
                       type === 'number' ? parseInt(value) : value;
    
    setFormData(prev => ({
      ...prev,
      [name]: actualValue
    }));
  };

  const handleLanguageToggle = (language: string) => {
    setFormData(prev => ({
      ...prev,
      supportedLanguages: prev.supportedLanguages.includes(language)
        ? prev.supportedLanguages.filter(lang => lang !== language)
        : [...prev.supportedLanguages, language]
    }));
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      // Validate settings
      if (formData.registrationsPerDay < 100) {
        throw new Error(t('settings.validation.minRegistrationsError'));
      }

      if (formData.syncBatchSize < 10 || formData.syncBatchSize > 200) {
        throw new Error(t('settings.validation.syncBatchSizeError'));
      }

      if (formData.supportedLanguages.length === 0) {
        throw new Error(t('settings.validation.languagesRequiredError'));
      }

      // In production, save to Firestore systemConfig collection
      const config: SystemConfig = {
        registrationNumberSequence: 1000, // Would be maintained separately
        supportedLanguages: formData.supportedLanguages as any,
        systemMaintenance: formData.systemMaintenance,
        apiLimits: {
          registrationsPerDay: formData.registrationsPerDay,
          syncBatchSize: formData.syncBatchSize
        }
      };

      console.log('Saving system configuration:', config);

      // Show maintenance warning if enabled
      if (formData.systemMaintenance) {
        setNotification({
          type: 'warning',
          message: t('settings.maintenanceWarning')
        });
      } else {
        setNotification({
          type: 'success',
          message: t('settings.saveSuccess')
        });
      }
    } catch (error) {
      setNotification({
        type: 'error',
        message: error instanceof Error ? error.message : t('settings.saveError')
      });
    } finally {
      setSaving(false);
    }
  };

  const handleResetToDefaults = () => {
    if (confirm(t('settings.resetConfirmation'))) {
      setFormData({
        systemMaintenance: false,
        registrationsPerDay: 1000,
        syncBatchSize: 50,
        supportedLanguages: ['en', 'tw'],
        enableAnalytics: true,
        enableSMSNotifications: false,
        maxOfflineRegistrations: 100,
        syncRetryAttempts: 5,
        sessionTimeoutMinutes: 60
      });
      setNotification({
        type: 'success',
        message: t('settings.resetSuccess')
      });
    }
  };

  // Check permissions
  if (user?.role !== 'admin') {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">
              {t('settings.accessDenied')}
            </h1>
            <p className="text-gray-600">
              {t('settings.adminRequired')}
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  const tabs = [
    { id: 'general', label: t('settings.tabs.general') },
    { id: 'sync', label: t('settings.tabs.sync') },
    { id: 'security', label: t('settings.tabs.security') },
    { id: 'advanced', label: t('settings.tabs.advanced') }
  ] as const;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {t('settings.title')}
          </h1>
          <p className="text-gray-600">
            {t('settings.subtitle')}
          </p>
        </div>

        {/* Notifications */}
        {notification && (
          <Notification
            id="settings-notification"
            type={notification.type}
            message={notification.message}
            onClose={() => setNotification(null)}
          />
        )}

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <form onSubmit={handleSaveSettings} className="space-y-6">
          {/* General Settings */}
          {activeTab === 'general' && (
            <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
              <h2 className="text-xl font-semibold">{t('settings.tabs.general')}</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="systemMaintenance"
                      checked={formData.systemMaintenance}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-900">{t('settings.maintenanceMode')}</span>
                  </label>
                  <p className="text-sm text-gray-500 mt-1">{t('settings.maintenanceModeDescription')}</p>
                </div>

                <FormField
                  label={t('settings.registrationsPerDay')}
                  name="registrationsPerDay"
                  type="text"
                  value={formData.registrationsPerDay.toString()}
                  onChange={handleInputChange}
                  disabled={saving}
                />
              </div>

              <div>
                <h3 className="text-lg font-medium mb-4">{t('settings.supportedLanguages')}</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { code: 'en', name: t('languages.english') },
                    { code: 'tw', name: t('languages.twi') },
                    { code: 'ga', name: t('languages.ga') },
                    { code: 'ee', name: t('languages.ewe') }
                  ].map(language => (
                    <label key={language.code} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.supportedLanguages.includes(language.code)}
                        onChange={() => handleLanguageToggle(language.code)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-900">{language.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Sync Settings */}
          {activeTab === 'sync' && (
            <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
              <h2 className="text-xl font-semibold">{t('settings.tabs.sync')}</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  label={t('settings.syncBatchSize')}
                  name="syncBatchSize"
                  type="text"
                  value={formData.syncBatchSize.toString()}
                  onChange={handleInputChange}
                  disabled={saving}
                />

                <FormField
                  label={t('settings.maxOfflineRegistrations')}
                  name="maxOfflineRegistrations"
                  type="text"
                  value={formData.maxOfflineRegistrations.toString()}
                  onChange={handleInputChange}
                  disabled={saving}
                />

                <FormField
                  label={t('settings.syncRetryAttempts')}
                  name="syncRetryAttempts"
                  type="text"
                  value={formData.syncRetryAttempts.toString()}
                  onChange={handleInputChange}
                  disabled={saving}
                />
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">{t('settings.syncInformation')}</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• {t('settings.syncInfo1')}</li>
                  <li>• {t('settings.syncInfo2')}</li>
                  <li>• {t('settings.syncInfo3')}</li>
                </ul>
              </div>
            </div>
          )}

          {/* Security Settings */}
          {activeTab === 'security' && (
            <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
              <h2 className="text-xl font-semibold">{t('settings.tabs.security')}</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  label={t('settings.sessionTimeout')}
                  name="sessionTimeoutMinutes"
                  type="text"
                  value={formData.sessionTimeoutMinutes.toString()}
                  onChange={handleInputChange}
                  disabled={saving}
                />

                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="enableAnalytics"
                      checked={formData.enableAnalytics}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-900">{t('settings.enableAnalytics')}</span>
                  </label>
                  <p className="text-sm text-gray-500 mt-1">{t('settings.analyticsDescription')}</p>
                </div>
              </div>

              <div className="bg-yellow-50 p-4 rounded-lg">
                <h4 className="font-medium text-yellow-900 mb-2">{t('settings.securityNotice')}</h4>
                <p className="text-sm text-yellow-800">{t('settings.securityDescription')}</p>
              </div>
            </div>
          )}

          {/* Advanced Settings */}
          {activeTab === 'advanced' && (
            <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
              <h2 className="text-xl font-semibold">{t('settings.tabs.advanced')}</h2>
              
              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="enableSMSNotifications"
                    checked={formData.enableSMSNotifications}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-900">{t('settings.enableSMS')}</span>
                </label>
                <p className="text-sm text-gray-500 mt-1">{t('settings.smsDescription')}</p>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-4">{t('settings.systemInfo')}</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">{t('settings.appVersion')}:</span>
                    <span className="ml-2 font-mono">1.0.0</span>
                  </div>
                  <div>
                    <span className="text-gray-600">{t('settings.buildDate')}:</span>
                    <span className="ml-2">2025-08-12</span>
                  </div>
                  <div>
                    <span className="text-gray-600">{t('settings.environment')}:</span>
                    <span className="ml-2">Development</span>
                  </div>
                  <div>
                    <span className="text-gray-600">{t('settings.lastBackup')}:</span>
                    <span className="ml-2">2025-08-12 08:00 UTC</span>
                  </div>
                </div>
              </div>

              <div className="bg-red-50 p-4 rounded-lg">
                <h4 className="font-medium text-red-900 mb-2">{t('settings.dangerZone')}</h4>
                <div className="space-y-3">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={handleResetToDefaults}
                    disabled={saving}
                  >
                    {t('settings.resetToDefaults')}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Save Actions */}
          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => window.location.reload()}
              disabled={saving}
            >
              {t('common.cancel')}
            </Button>
            <Button
              type="submit"
              disabled={saving || loading}
            >
              {saving ? t('common.saving') : t('settings.saveSettings')}
            </Button>
          </div>
        </form>
      </div>
    </Layout>
  );
};