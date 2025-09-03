import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '../store';
import { useTheme } from '../contexts';
import { 
  loadUserSettings, 
  saveUserSettings, 
  updateUserSettingsLocal, 
  resetUserSettings,
  clearError 
} from '../store/slices/settingsSlice';
import type { UserSettings as UserSettingsType } from '../store/slices/settingsSlice';
import { Button } from '../components/atoms';
import { Notification } from '../components/molecules';
import { useDocumentTitle } from '../hooks';
import { Layout } from '../components/templates/Layout';
import { 
  SettingSection, 
  ToggleCard, 
  SliderSetting, 
  SelectCard, 
  SettingsSearch,
  SettingToast 
} from '../components/settings';

export const UserSettings: React.FC = () => {
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const { setTheme } = useTheme();
  const { user } = useSelector((state: RootState) => state.auth);
  
  // Set page title
  useDocumentTitle("User Settings");
  const { 
    userSettings, 
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
  
  const [settingToast, setSettingToast] = useState<{
    type: 'success' | 'error' | 'saving';
    message: string;
    show: boolean;
  }>({ type: 'success', message: '', show: false });

  useEffect(() => {
    if (user?.uid) {
      dispatch(loadUserSettings(user.uid));
    }
  }, [dispatch, user?.uid]);

  useEffect(() => {
    if (error) {
      setNotification({
        type: 'error',
        message: error
      });
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const handleSave = async () => {
    if (!user?.uid || !userSettings) return;

    try {
      await dispatch(saveUserSettings({
        userId: user.uid,
        settings: userSettings
      })).unwrap();
      
      setNotification({
        type: 'success',
        message: t('settings.user.saveSuccess')
      });
    } catch (err) {
      setNotification({
        type: 'error',
        message: t('settings.user.saveError')
      });
    }
  };

  const handleReset = async () => {
    if (!user?.uid) return;
    
    if (confirm(t('settings.user.resetConfirmation'))) {
      try {
        await dispatch(resetUserSettings(user.uid)).unwrap();
        setNotification({
          type: 'success',
          message: t('settings.user.resetSuccess')
        });
      } catch (err) {
        setNotification({
          type: 'error',
          message: t('settings.user.resetError')
        });
      }
    }
  };

  const updateSetting = <K extends keyof UserSettingsType>(
    key: K,
    value: UserSettingsType[K]
  ) => {
    dispatch(updateUserSettingsLocal({ [key]: value }));
    
    // Show saving toast
    setSettingToast({
      type: 'saving',
      message: t('common.saving'),
      show: true
    });

    // Auto-save after a short delay
    setTimeout(async () => {
      if (user?.uid) {
        try {
          await dispatch(saveUserSettings({
            userId: user.uid,
            settings: { [key]: value } as any
          })).unwrap();
          
          // Show success toast
          setSettingToast({
            type: 'success',
            message: t('settings.user.settingSaved'),
            show: true
          });
        } catch (error) {
          // Show error toast
          setSettingToast({
            type: 'error',
            message: t('settings.user.settingError'),
            show: true
          });
        }
      }
    }, 500);
  };

  const updateNestedSetting = <
    K extends keyof UserSettingsType,
    NK extends keyof UserSettingsType[K]
  >(
    key: K,
    nestedKey: NK,
    value: UserSettingsType[K][NK]
  ) => {
    if (!userSettings) return;
    const updatedSetting = {
      [key]: {
        ...(userSettings[key] as any),
        [nestedKey]: value
      }
    } as any;
    dispatch(updateUserSettingsLocal(updatedSetting));
    // Auto-save after a short delay
    setTimeout(() => {
      if (user?.uid) {
        dispatch(saveUserSettings({
          userId: user.uid,
          settings: updatedSetting
        }));
      }
    }, 500);
  };

  if (isLoading || !userSettings) {
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

  // Filter settings based on search
  const filteredSections = searchTerm.toLowerCase();
  
  const matchesSearch = (sectionName: string) => {
    if (!searchTerm) return true;
    return sectionName.toLowerCase().includes(filteredSections);
  };

  const themeOptions = [
    { value: 'light', label: t('settings.user.theme.light'), icon: 
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    },
    { value: 'system', label: t('settings.user.theme.system'), icon:
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    }
  ];

  const languageOptions = [
    { value: 'en', label: t('languages.english') },
    { value: 'tw', label: t('languages.twi') },
    { value: 'ga', label: t('languages.ga') },
    { value: 'ee', label: t('languages.ewe') }
  ];

  const dateFormatOptions = [
    { value: 'DD/MM/YYYY', label: '31/12/2024' },
    { value: 'MM/DD/YYYY', label: '12/31/2024' },
    { value: 'YYYY-MM-DD', label: '2024-12-31' }
  ];

  const timeFormatOptions = [
    { value: '12h', label: '12:00 PM' },
    { value: '24h', label: '12:00' }
  ];

  const dashboardViewOptions = [
    { value: 'cards', label: t('settings.user.dashboard.cardsView') },
    { value: 'table', label: t('settings.user.dashboard.tableView') }
  ];

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {t('settings.user.title')}
          </h1>
          <p className="text-gray-600">
            {t('settings.user.subtitle')}
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

        {/* Search */}
        <div className="mb-6">
          <SettingsSearch
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder={t('settings.user.searchPlaceholder')}
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
                  {t('settings.user.unsavedChanges')}
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
          {/* Appearance Settings */}
          {matchesSearch('appearance') && (
            <SettingSection
              title={t('settings.user.appearance.title')}
              description={t('settings.user.appearance.description')}
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" />
                </svg>
              }
            >
              <div className="grid gap-6 md:grid-cols-2" style={{ overflow: 'visible' }}>
                <div className="relative" style={{ overflow: 'visible' }}>
                  <SelectCard
                    title={t('settings.user.appearance.theme')}
                    description={t('settings.user.appearance.themeDescription')}
                    value={userSettings.theme}
                    onChange={(value) => {
                      updateSetting('theme', value as any);
                      setTheme(value as any); // Apply theme immediately
                    }}
                    options={themeOptions}
                  />
                </div>
                
                <SelectCard
                  title={t('settings.user.appearance.language')}
                  description={t('settings.user.appearance.languageDescription')}
                  value={userSettings.language}
                  onChange={(value) => {
                    updateSetting('language', value as any);
                    i18n.changeLanguage(value);
                  }}
                  options={languageOptions}
                  variant="compact"
                />
                
                <SelectCard
                  title={t('settings.user.appearance.dateFormat')}
                  value={userSettings.dateFormat}
                  onChange={(value) => updateSetting('dateFormat', value as any)}
                  options={dateFormatOptions}
                  variant="compact"
                />
                
                <SelectCard
                  title={t('settings.user.appearance.timeFormat')}
                  value={userSettings.timeFormat}
                  onChange={(value) => updateSetting('timeFormat', value as any)}
                  options={timeFormatOptions}
                  variant="compact"
                />
              </div>
            </SettingSection>
          )}

          {/* Notifications */}
          {matchesSearch('notifications') && (
            <SettingSection
              title={t('settings.user.notifications.title')}
              description={t('settings.user.notifications.description')}
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5-5V9.5a6.5 6.5 0 10-13 0V12l-5 5h5m13 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              }
            >
              <div className="grid gap-4 md:grid-cols-2">
                <ToggleCard
                  title={t('settings.user.notifications.email')}
                  description={t('settings.user.notifications.emailDescription')}
                  enabled={userSettings.notifications.email}
                  onChange={(enabled) => updateNestedSetting('notifications', 'email', enabled)}
                />
                
                <ToggleCard
                  title={t('settings.user.notifications.sms')}
                  description={t('settings.user.notifications.smsDescription')}
                  enabled={userSettings.notifications.sms}
                  onChange={(enabled) => updateNestedSetting('notifications', 'sms', enabled)}
                />
                
                <ToggleCard
                  title={t('settings.user.notifications.inApp')}
                  description={t('settings.user.notifications.inAppDescription')}
                  enabled={userSettings.notifications.inApp}
                  onChange={(enabled) => updateNestedSetting('notifications', 'inApp', enabled)}
                />
                
                <ToggleCard
                  title={t('settings.user.notifications.registrationUpdates')}
                  description={t('settings.user.notifications.registrationUpdatesDescription')}
                  enabled={userSettings.notifications.registrationUpdates}
                  onChange={(enabled) => updateNestedSetting('notifications', 'registrationUpdates', enabled)}
                />
                
                <ToggleCard
                  title={t('settings.user.notifications.systemAlerts')}
                  description={t('settings.user.notifications.systemAlertsDescription')}
                  enabled={userSettings.notifications.systemAlerts}
                  onChange={(enabled) => updateNestedSetting('notifications', 'systemAlerts', enabled)}
                />
                
                <ToggleCard
                  title={t('settings.user.notifications.weeklyReports')}
                  description={t('settings.user.notifications.weeklyReportsDescription')}
                  enabled={userSettings.notifications.weeklyReports}
                  onChange={(enabled) => updateNestedSetting('notifications', 'weeklyReports', enabled)}
                />
              </div>
            </SettingSection>
          )}

          {/* Dashboard Preferences */}
          {matchesSearch('dashboard') && (
            <SettingSection
              title={t('settings.user.dashboard.title')}
              description={t('settings.user.dashboard.description')}
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              }
            >
              <div className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <SelectCard
                    title={t('settings.user.dashboard.defaultView')}
                    description={t('settings.user.dashboard.defaultViewDescription')}
                    value={userSettings.dashboard.defaultView}
                    onChange={(value) => updateNestedSetting('dashboard', 'defaultView', value as any)}
                    options={dashboardViewOptions}
                    variant="compact"
                  />
                  
                  <SelectCard
                    title={t('settings.user.dashboard.itemsPerPage')}
                    value={userSettings.dashboard.itemsPerPage.toString()}
                    onChange={(value) => updateNestedSetting('dashboard', 'itemsPerPage', parseInt(value) as any)}
                    options={[
                      { value: '10', label: '10' },
                      { value: '25', label: '25' },
                      { value: '50', label: '50' },
                      { value: '100', label: '100' }
                    ]}
                    variant="compact"
                  />
                </div>

                <ToggleCard
                  title={t('settings.user.dashboard.autoRefresh')}
                  description={t('settings.user.dashboard.autoRefreshDescription')}
                  enabled={userSettings.dashboard.autoRefresh}
                  onChange={(enabled) => updateNestedSetting('dashboard', 'autoRefresh', enabled)}
                />

                {userSettings.dashboard.autoRefresh && (
                  <SliderSetting
                    title={t('settings.user.dashboard.refreshInterval')}
                    description={t('settings.user.dashboard.refreshIntervalDescription')}
                    value={userSettings.dashboard.refreshInterval}
                    onChange={(value) => updateNestedSetting('dashboard', 'refreshInterval', value)}
                    min={30}
                    max={1800}
                    step={30}
                    unit={t('common.seconds')}
                    marks={[
                      { value: 30, label: '30s' },
                      { value: 300, label: '5m' },
                      { value: 900, label: '15m' },
                      { value: 1800, label: '30m' }
                    ]}
                  />
                )}
              </div>
            </SettingSection>
          )}

          {/* Privacy Settings */}
          {matchesSearch('privacy') && (
            <SettingSection
              title={t('settings.user.privacy.title')}
              description={t('settings.user.privacy.description')}
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              }
            >
              <div className="grid gap-4 md:grid-cols-2">
                <ToggleCard
                  title={t('settings.user.privacy.shareAnalytics')}
                  description={t('settings.user.privacy.shareAnalyticsDescription')}
                  enabled={userSettings.privacy.shareAnalytics}
                  onChange={(enabled) => updateNestedSetting('privacy', 'shareAnalytics', enabled)}
                />
                
                <ToggleCard
                  title={t('settings.user.privacy.activityVisible')}
                  description={t('settings.user.privacy.activityVisibleDescription')}
                  enabled={userSettings.privacy.activityVisible}
                  onChange={(enabled) => updateNestedSetting('privacy', 'activityVisible', enabled)}
                />
                
                <ToggleCard
                  title={t('settings.user.privacy.allowDataExport')}
                  description={t('settings.user.privacy.allowDataExportDescription')}
                  enabled={userSettings.privacy.allowDataExport}
                  onChange={(enabled) => updateNestedSetting('privacy', 'allowDataExport', enabled)}
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
                {t('settings.user.lastSaved')}: {new Date(lastSaved).toLocaleString()}
              </p>
            )}
          </div>
          
          <div className="flex space-x-3">
            <Button
              variant="ghost"
              onClick={handleReset}
              disabled={isSaving}
            >
              {t('settings.user.resetToDefaults')}
            </Button>
            <Button
              onClick={handleSave}
              isLoading={isSaving}
              disabled={!hasUnsavedChanges}
            >
              {isSaving ? t('common.saving') : t('settings.user.saveSettings')}
            </Button>
          </div>
        </div>

        {/* Toast Notifications */}
        <SettingToast
          type={settingToast.type}
          message={settingToast.message}
          show={settingToast.show}
          onHide={() => setSettingToast(prev => ({ ...prev, show: false }))}
        />
      </div>
    </Layout>
  );
};