// BirthLink Ghana - Analytics Service
// Phase 3: Pilot Testing Analytics & Monitoring
// Created: August 12, 2025

import { getAnalytics, logEvent, setUserProperties, setUserId } from 'firebase/analytics';
import { getPerformance, trace } from 'firebase/performance';
import app from './firebase';

// Initialize Analytics and Performance (conditionally)
const analytics = import.meta.env.VITE_ENABLE_ANALYTICS === 'true' ? getAnalytics(app) : null;
const performance = import.meta.env.VITE_ENABLE_ANALYTICS === 'true' ? getPerformance(app) : null;

// User role type
type UserRole = 'admin' | 'registrar' | 'viewer';

// Analytics service for tracking pilot testing metrics
export class AnalyticsService {
  private static instance: AnalyticsService;
  private isEnabled: boolean = false;
  private userRole: UserRole | null = null;

  private constructor() {
    this.isEnabled = import.meta.env.VITE_ENABLE_ANALYTICS === 'true';
  }

  static getInstance(): AnalyticsService {
    if (!AnalyticsService.instance) {
      AnalyticsService.instance = new AnalyticsService();
    }
    return AnalyticsService.instance;
  }

  // Initialize user tracking
  initializeUser(userId: string, role: UserRole, region?: string, district?: string) {
    if (!this.isEnabled || !analytics) return;

    this.userRole = role;

    setUserId(analytics, userId);
    setUserProperties(analytics, {
      user_role: role,
      user_region: region || 'unknown',
      user_district: district || 'unknown',
      app_version: import.meta.env.VITE_APP_VERSION || '1.0.0',
      pilot_mode: import.meta.env.VITE_PILOT_MODE === 'true' ? 'yes' : 'no'
    });

    this.trackEvent('user_initialized', {
      role,
      region,
      district
    });
  }

  // Track custom events with enhanced data
  trackEvent(eventName: string, parameters?: Record<string, any>) {
    if (!this.isEnabled || !analytics) return;

    const enhancedParams = {
      ...parameters,
      user_role: this.userRole,
      timestamp: new Date().toISOString(),
      app_version: import.meta.env.VITE_APP_VERSION || '1.0.0',
      pilot_phase: 'phase_3'
    };

    logEvent(analytics, eventName, enhancedParams);
    
    // Also log to console in development
    if (import.meta.env.DEV) {
      console.log('📊 Analytics:', eventName, enhancedParams);
    }
  }

  // Birth Registration Analytics
  trackRegistrationStarted(formStep: number = 1) {
    this.trackEvent('registration_started', {
      form_step: formStep,
      start_method: navigator.onLine ? 'online' : 'offline'
    });
  }

  trackRegistrationCompleted(registrationData: {
    duration: number;
    formSteps: number;
    offlineCreated: boolean;
    dataQuality: 'complete' | 'partial';
  }) {
    this.trackEvent('registration_completed', {
      completion_duration_seconds: registrationData.duration,
      form_steps_completed: registrationData.formSteps,
      created_offline: registrationData.offlineCreated,
      data_quality: registrationData.dataQuality,
      completion_method: navigator.onLine ? 'online' : 'offline'
    });
  }

  trackRegistrationError(error: {
    step: number;
    errorType: string;
    errorMessage: string;
  }) {
    this.trackEvent('registration_error', {
      error_step: error.step,
      error_type: error.errorType,
      error_message: error.errorMessage,
      network_status: navigator.onLine ? 'online' : 'offline'
    });
  }

  // Offline/Sync Analytics
  trackOfflineAction(action: 'create' | 'update' | 'delete', dataType: string) {
    this.trackEvent('offline_action_queued', {
      action_type: action,
      data_type: dataType,
      queue_size: this.getOfflineQueueSize()
    });
  }

  trackSyncAttempt(syncData: {
    itemCount: number;
    syncType: 'manual' | 'automatic';
  }) {
    this.trackEvent('sync_attempt_started', {
      sync_item_count: syncData.itemCount,
      sync_type: syncData.syncType,
      network_type: this.getNetworkType()
    });
  }

  trackSyncCompleted(syncResult: {
    successCount: number;
    failureCount: number;
    duration: number;
    conflicts: number;
  }) {
    this.trackEvent('sync_completed', {
      sync_success_count: syncResult.successCount,
      sync_failure_count: syncResult.failureCount,
      sync_duration_seconds: syncResult.duration,
      sync_conflicts: syncResult.conflicts,
      sync_success_rate: syncResult.successCount / (syncResult.successCount + syncResult.failureCount) * 100
    });
  }

  // PWA Analytics
  trackPWAInstall() {
    this.trackEvent('pwa_installed', {
      install_source: 'browser_prompt',
      device_type: this.getDeviceType()
    });
  }

  trackPWAUsage(usageData: {
    sessionDuration: number;
    pagesVisited: number;
    standalone: boolean;
  }) {
    this.trackEvent('pwa_session', {
      session_duration_seconds: usageData.sessionDuration,
      pages_visited: usageData.pagesVisited,
      standalone_mode: usageData.standalone,
      device_type: this.getDeviceType()
    });
  }

  // User Experience Analytics
  trackLanguageSwitch(fromLanguage: string, toLanguage: string) {
    this.trackEvent('language_switched', {
      from_language: fromLanguage,
      to_language: toLanguage,
      user_region: this.getUserRegion()
    });
  }

  trackFormValidationError(field: string, errorType: string) {
    this.trackEvent('form_validation_error', {
      field_name: field,
      validation_error_type: errorType,
      form_type: 'birth_registration'
    });
  }

  trackUserFeedback(feedbackData: {
    rating: number;
    category: string;
    hasComment: boolean;
  }) {
    this.trackEvent('user_feedback_submitted', {
      feedback_rating: feedbackData.rating,
      feedback_category: feedbackData.category,
      has_written_comment: feedbackData.hasComment,
      feedback_source: 'in_app'
    });
  }

  // Performance Analytics
  trackPageLoad(pageName: string, loadTime: number) {
    this.trackEvent('page_performance', {
      page_name: pageName,
      load_time_ms: loadTime,
      network_type: this.getNetworkType(),
      device_type: this.getDeviceType()
    });
  }

  trackAPICall(endpoint: string, duration: number, success: boolean) {
    this.trackEvent('api_call_performance', {
      api_endpoint: endpoint,
      response_time_ms: duration,
      call_success: success,
      network_type: this.getNetworkType()
    });
  }

  // Performance tracing for critical operations
  startTrace(traceName: string) {
    if (!this.isEnabled || !performance) return null;
    return trace(performance, traceName);
  }

  // Pilot Testing Specific Analytics
  trackPilotTrainingCompletion(trainingData: {
    trainingDuration: number;
    trainingType: string;
    completionScore?: number;
  }) {
    this.trackEvent('pilot_training_completed', {
      training_duration_minutes: trainingData.trainingDuration,
      training_type: trainingData.trainingType,
      completion_score: trainingData.completionScore || 0,
      pilot_cohort: this.getPilotCohort()
    });
  }

  trackPilotFeedback(feedbackType: 'bug_report' | 'feature_request' | 'usability_issue' | 'positive_feedback') {
    this.trackEvent('pilot_feedback', {
      feedback_type: feedbackType,
      pilot_week: this.getPilotWeek(),
      user_experience_level: this.getUserExperienceLevel()
    });
  }

  // Utility methods
  private getOfflineQueueSize(): number {
    // This would integrate with your offline storage service
    return 0; // Placeholder
  }

  private getNetworkType(): string {
    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
    return connection?.effectiveType || 'unknown';
  }

  private getDeviceType(): string {
    if (window.innerWidth <= 768) return 'mobile';
    if (window.innerWidth <= 1024) return 'tablet';
    return 'desktop';
  }

  private getUserRegion(): string {
    // This would come from user profile data
    return 'unknown'; // Placeholder
  }

  private getPilotCohort(): string {
    // Determine which pilot group the user belongs to
    return 'cohort_1'; // Placeholder
  }

  private getPilotWeek(): number {
    // Calculate which week of the pilot we're in
    const pilotStartDate = new Date('2025-08-12'); // Adjust based on actual start
    const now = new Date();
    return Math.ceil((now.getTime() - pilotStartDate.getTime()) / (7 * 24 * 60 * 60 * 1000));
  }

  private getUserExperienceLevel(): 'beginner' | 'intermediate' | 'advanced' {
    // This would be determined based on user profile or usage patterns
    return 'beginner'; // Placeholder
  }
}

// Export singleton instance
export const analyticsService = AnalyticsService.getInstance();