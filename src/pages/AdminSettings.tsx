import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '../store';
import { 
  loadAdminSettings, 
  saveAdminSettings, 
  updateAdminSettingsLocal, 
  resetAdminSettings,
  clearError 
} from '../store/slices/settingsSlice';
import type { AdminSettings as AdminSettingsType } from '../store/slices/settingsSlice';
import { Button } from '../components/atoms';
import { Notification } from '../components/molecules';
import { Layout } from '../components/templates/Layout';
import { useDocumentTitle } from '../hooks';
import { 
  SettingSection, 
  ToggleCard, 
  SliderSetting, 
  SelectCard, 
  SettingsSearch 
} from '../components/settings';

export const AdminSettings: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  
  // Set page title
  useDocumentTitle("Admin Settings");
  const { 
    adminSettings, 
    isLoading, 
    isSaving, 
    error, 
    hasUnsavedChanges,
    lastSaved 
  } = useSelector((state: RootState) => state.settings);

  const [searchTerm, setSearchTerm] = useState('');
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'warning';
    message: string;
  } | null>(null);

  useEffect(() => {
    dispatch(loadAdminSettings());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      setNotification({
        type: 'error',
        message: error
      });
      dispatch(clearError());
    }
  }, [error, dispatch]);

  // Check admin permission
  if (user?.role !== 'admin') {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">
              {t('settings.admin.accessDenied')}
            </h1>
            <p className="text-gray-600">
              {t('settings.admin.adminRequired')}
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  const handleSave = async () => {
    if (!adminSettings) return;

    try {
      await dispatch(saveAdminSettings(adminSettings)).unwrap();
      
      setNotification({
        type: 'success',
        message: t('settings.admin.saveSuccess')
      });

      // Show maintenance warning if enabled
      if (adminSettings.systemMaintenance) {
        setTimeout(() => {
          setNotification({
            type: 'warning',
            message: t('settings.admin.maintenanceWarning')
          });
        }, 2000);
      }
    } catch (err) {
      setNotification({
        type: 'error',
        message: t('settings.admin.saveError')
      });
    }
  };

  const handleReset = async () => {
    if (confirm(t('settings.admin.resetConfirmation'))) {
      try {
        await dispatch(resetAdminSettings()).unwrap();
        setNotification({
          type: 'success',
          message: t('settings.admin.resetSuccess')
        });
      } catch (err) {
        setNotification({
          type: 'error',
          message: t('settings.admin.resetError')
        });
      }
    }
  };

  const updateSetting = <K extends keyof AdminSettingsType>(
    key: K,
    value: AdminSettingsType[K]
  ) => {
    dispatch(updateAdminSettingsLocal({ [key]: value }));
  };

  const updateNestedSetting = <
    K extends keyof AdminSettingsType,
    NK extends keyof AdminSettingsType[K]
  >(
    key: K,
    nestedKey: NK,
    value: AdminSettingsType[K][NK]
  ) => {
    if (!adminSettings) return;
    dispatch(updateAdminSettingsLocal({
      [key]: {
        ...(adminSettings[key] as any),
        [nestedKey]: value
      }
    } as any));
  };

  if (isLoading || !adminSettings) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </Layout>
    );
  }

  const filteredSections = searchTerm.toLowerCase();

  const languageOptions = [
    { value: 'en', label: t('languages.english') },
    { value: 'tw', label: t('languages.twi') },
    { value: 'ga', label: t('languages.ga') },
    { value: 'ee', label: t('languages.ewe') }
  ];

  const auditLevelOptions = [
    { value: 'minimal', label: t('settings.admin.security.auditLevels.minimal') },
    { value: 'standard', label: t('settings.admin.security.auditLevels.standard') },
    { value: 'detailed', label: t('settings.admin.security.auditLevels.detailed') }
  ];

  const backupFrequencyOptions = [
    { value: 'daily', label: t('settings.admin.backup.frequencies.daily') },
    { value: 'weekly', label: t('settings.admin.backup.frequencies.weekly') },
    { value: 'monthly', label: t('settings.admin.backup.frequencies.monthly') }
  ];

  const smsProviderOptions = [
    { value: 'none', label: t('settings.admin.integration.providers.none') },
    { value: 'twilio', label: 'Twilio' },
    { value: 'africastalking', label: 'Africa\'s Talking' }
  ];

  const emailProviderOptions = [
    { value: 'none', label: t('settings.admin.integration.providers.none') },
    { value: 'sendgrid', label: 'SendGrid' },
    { value: 'mailgun', label: 'Mailgun' }
  ];

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-lg bg-red-100 text-red-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {t('settings.admin.title')}
              </h1>
              <p className="text-gray-600">
                {t('settings.admin.subtitle')}
              </p>
            </div>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-sm text-red-800">
              <span className="font-medium">{t('common.warning')}:</span> {t('settings.admin.warning')}
            </p>
          </div>
        </div>

        {/* Notifications */}
        {notification && (
          <Notification
            id="admin-settings-notification"
            type={notification.type}
            message={notification.message}
            onClose={() => setNotification(null)}
          />
        )}

        {/* Search */}
        <div className="mb-6">
          <SettingsSearch
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder={t('settings.admin.searchPlaceholder')}
          />
        </div>

        {/* Unsaved Changes Banner */}
        {hasUnsavedChanges && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-yellow-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.664-.833-2.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <span className="text-sm text-yellow-800">
                  {t('settings.admin.unsavedChanges')}
                </span>
              </div>
              <div className="flex space-x-2">
                <Button size="sm" variant="ghost" onClick={() => window.location.reload()}>
                  {t('common.cancel')}
                </Button>
                <Button size="sm" onClick={handleSave} isLoading={isSaving}>
                  {t('common.save')}
                </Button>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-8">
          {/* System Configuration */}
          {(!searchTerm || 'system'.includes(filteredSections)) && (
            <SettingSection
              title={t('settings.admin.system.title')}
              description={t('settings.admin.system.description')}
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              }
            >
              <div className="space-y-6">
                <ToggleCard
                  title={t('settings.admin.system.maintenanceMode')}
                  description={t('settings.admin.system.maintenanceModeDescription')}
                  enabled={adminSettings.systemMaintenance}
                  onChange={(enabled) => updateSetting('systemMaintenance', enabled)}
                  variant="warning"
                />

                <div className="grid gap-6 md:grid-cols-2">
                  <SliderSetting
                    title={t('settings.admin.system.registrationsPerDay')}
                    description={t('settings.admin.system.registrationsPerDayDescription')}
                    value={adminSettings.apiLimits.registrationsPerDay}
                    onChange={(value) => updateNestedSetting('apiLimits', 'registrationsPerDay', value)}
                    min={100}
                    max={5000}
                    step={100}
                    marks={[
                      { value: 100, label: '100' },
                      { value: 1000, label: '1K' },
                      { value: 3000, label: '3K' },
                      { value: 5000, label: '5K' }
                    ]}
                  />

                  <SliderSetting
                    title={t('settings.admin.system.syncBatchSize')}
                    description={t('settings.admin.system.syncBatchSizeDescription')}
                    value={adminSettings.apiLimits.syncBatchSize}
                    onChange={(value) => updateNestedSetting('apiLimits', 'syncBatchSize', value)}
                    min={10}
                    max={200}
                    step={10}
                    marks={[
                      { value: 10, label: '10' },
                      { value: 50, label: '50' },
                      { value: 100, label: '100' },
                      { value: 200, label: '200' }
                    ]}
                  />
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-3">
                    {t('settings.admin.system.supportedLanguages')}
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {languageOptions.map(language => (
                      <ToggleCard
                        key={language.value}
                        title={language.label}
                        enabled={adminSettings.supportedLanguages.includes(language.value as any)}
                        onChange={(enabled) => {
                          const currentLanguages = adminSettings.supportedLanguages;
                          const newLanguages = enabled
                            ? [...currentLanguages, language.value as any]
                            : currentLanguages.filter(lang => lang !== language.value);
                          updateSetting('supportedLanguages', newLanguages);
                        }}
                        size="sm"
                      />
                    ))}
                  </div>
                </div>
              </div>
            </SettingSection>
          )}

          {/* Security Settings */}
          {(!searchTerm || 'security'.includes(filteredSections)) && (
            <SettingSection
              title={t('settings.admin.security.title')}
              description={t('settings.admin.security.description')}
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              }
            >
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <SliderSetting
                  title={t('settings.admin.security.sessionTimeout')}
                  description={t('settings.admin.security.sessionTimeoutDescription')}
                  value={adminSettings.security.sessionTimeoutMinutes}
                  onChange={(value) => updateNestedSetting('security', 'sessionTimeoutMinutes', value)}
                  min={15}
                  max={480}
                  step={15}
                  unit={t('common.minutes')}
                  marks={[
                    { value: 15, label: '15m' },
                    { value: 60, label: '1h' },
                    { value: 240, label: '4h' },
                    { value: 480, label: '8h' }
                  ]}
                />

                <SliderSetting
                  title={t('settings.admin.security.maxLoginAttempts')}
                  description={t('settings.admin.security.maxLoginAttemptsDescription')}
                  value={adminSettings.security.maxLoginAttempts}
                  onChange={(value) => updateNestedSetting('security', 'maxLoginAttempts', value)}
                  min={3}
                  max={10}
                  step={1}
                />

                <SliderSetting
                  title={t('settings.admin.security.passwordMinLength')}
                  description={t('settings.admin.security.passwordMinLengthDescription')}
                  value={adminSettings.security.passwordMinLength}
                  onChange={(value) => updateNestedSetting('security', 'passwordMinLength', value)}
                  min={6}
                  max={20}
                  step={1}
                />

                <ToggleCard
                  title={t('settings.admin.security.requireTwoFactor')}
                  description={t('settings.admin.security.requireTwoFactorDescription')}
                  enabled={adminSettings.security.requireTwoFactor}
                  onChange={(enabled) => updateNestedSetting('security', 'requireTwoFactor', enabled)}
                />

                <SelectCard
                  title={t('settings.admin.security.auditLogLevel')}
                  description={t('settings.admin.security.auditLogLevelDescription')}
                  value={adminSettings.security.auditLogLevel}
                  onChange={(value) => updateNestedSetting('security', 'auditLogLevel', value as any)}
                  options={auditLevelOptions}
                  variant="compact"
                />
              </div>
            </SettingSection>
          )}

          {/* Backup & Recovery */}
          {(!searchTerm || 'backup'.includes(filteredSections)) && (
            <SettingSection
              title={t('settings.admin.backup.title')}
              description={t('settings.admin.backup.description')}
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
              }
            >
              <div className="space-y-6">
                <ToggleCard
                  title={t('settings.admin.backup.enabled')}
                  description={t('settings.admin.backup.enabledDescription')}
                  enabled={adminSettings.backup.enabled}
                  onChange={(enabled) => updateNestedSetting('backup', 'enabled', enabled)}
                  variant="success"
                />

                {adminSettings.backup.enabled && (
                  <div className="grid gap-6 md:grid-cols-2">
                    <SelectCard
                      title={t('settings.admin.backup.frequency')}
                      description={t('settings.admin.backup.frequencyDescription')}
                      value={adminSettings.backup.frequency}
                      onChange={(value) => updateNestedSetting('backup', 'frequency', value as any)}
                      options={backupFrequencyOptions}
                      variant="compact"
                    />

                    <SliderSetting
                      title={t('settings.admin.backup.retentionDays')}
                      description={t('settings.admin.backup.retentionDaysDescription')}
                      value={adminSettings.backup.retentionDays}
                      onChange={(value) => updateNestedSetting('backup', 'retentionDays', value)}
                      min={7}
                      max={365}
                      step={7}
                      unit={t('common.days')}
                      marks={[
                        { value: 7, label: '1w' },
                        { value: 30, label: '1m' },
                        { value: 90, label: '3m' },
                        { value: 365, label: '1y' }
                      ]}
                    />
                  </div>
                )}

                {adminSettings.backup.lastBackup && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-sm text-green-800">
                        {t('settings.admin.backup.lastBackup')}: {adminSettings.backup.lastBackup}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </SettingSection>
          )}

          {/* Integration Settings */}
          {(!searchTerm || 'integration'.includes(filteredSections)) && (
            <SettingSection
              title={t('settings.admin.integration.title')}
              description={t('settings.admin.integration.description')}
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
              }
            >
              <div className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <SelectCard
                    title={t('settings.admin.integration.smsProvider')}
                    description={t('settings.admin.integration.smsProviderDescription')}
                    value={adminSettings.integration.smsProvider}
                    onChange={(value) => updateNestedSetting('integration', 'smsProvider', value as any)}
                    options={smsProviderOptions}
                  />

                  <SelectCard
                    title={t('settings.admin.integration.emailProvider')}
                    description={t('settings.admin.integration.emailProviderDescription')}
                    value={adminSettings.integration.emailProvider}
                    onChange={(value) => updateNestedSetting('integration', 'emailProvider', value as any)}
                    options={emailProviderOptions}
                  />
                </div>

                <ToggleCard
                  title={t('settings.admin.integration.analyticsEnabled')}
                  description={t('settings.admin.integration.analyticsEnabledDescription')}
                  enabled={adminSettings.integration.analyticsEnabled}
                  onChange={(enabled) => updateNestedSetting('integration', 'analyticsEnabled', enabled)}
                />
              </div>
            </SettingSection>
          )}

          {/* Data Retention */}
          {(!searchTerm || 'data'.includes(filteredSections)) && (
            <SettingSection
              title={t('settings.admin.dataRetention.title')}
              description={t('settings.admin.dataRetention.description')}
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              }
            >
              <div className="grid gap-6 md:grid-cols-3">
                <SliderSetting
                  title={t('settings.admin.dataRetention.registrations')}
                  description={t('settings.admin.dataRetention.registrationsDescription')}
                  value={adminSettings.dataRetention.registrations}
                  onChange={(value) => updateNestedSetting('dataRetention', 'registrations', value)}
                  min={1}
                  max={10}
                  step={1}
                  unit={t('common.years')}
                />

                <SliderSetting
                  title={t('settings.admin.dataRetention.auditLogs')}
                  description={t('settings.admin.dataRetention.auditLogsDescription')}
                  value={adminSettings.dataRetention.auditLogs}
                  onChange={(value) => updateNestedSetting('dataRetention', 'auditLogs', value)}
                  min={3}
                  max={24}
                  step={3}
                  unit={t('common.months')}
                />

                <SliderSetting
                  title={t('settings.admin.dataRetention.userActivity')}
                  description={t('settings.admin.dataRetention.userActivityDescription')}
                  value={adminSettings.dataRetention.userActivity}
                  onChange={(value) => updateNestedSetting('dataRetention', 'userActivity', value)}
                  min={1}
                  max={12}
                  step={1}
                  unit={t('common.months')}
                />
              </div>
            </SettingSection>
          )}
        </div>

        {/* Action Buttons */}
        <div className="mt-12 flex flex-col sm:flex-row justify-between items-center gap-4 p-6 bg-gray-50 rounded-lg">
          <div className="text-center sm:text-left">
            {lastSaved && (
              <p className="text-sm text-gray-600">
                {t('settings.admin.lastSaved')}: {new Date(lastSaved).toLocaleString()}
              </p>
            )}
          </div>
          
          <div className="flex space-x-3">
            <Button
              variant="danger"
              onClick={handleReset}
              disabled={isSaving}
            >
              {t('settings.admin.resetToDefaults')}
            </Button>
            <Button
              onClick={handleSave}
              isLoading={isSaving}
              disabled={!hasUnsavedChanges}
            >
              {isSaving ? t('common.saving') : t('settings.admin.saveSettings')}
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
};