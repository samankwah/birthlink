// BirthLink Ghana - SMS Notification Service
// Phase 4: Production SMS Integration with Twilio
// Created: August 12, 2025

import { analyticsService } from './analytics';

interface SMSConfig {
  accountSid: string;
  authToken: string;
  fromPhoneNumber: string;
  isEnabled: boolean;
}

interface SMSMessage {
  to: string;
  message: string;
  type: 'registration_success' | 'sync_notification' | 'system_alert' | 'training_reminder' | 'certificate_ready';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  language?: 'en' | 'tw' | 'ga' | 'ee';
}

interface SMSTemplate {
  en: string;
  tw?: string;
  ga?: string;
  ee?: string;
}

// SMS notification service for critical system updates
export class SMSService {
  private static instance: SMSService;
  private config: SMSConfig;
  private templates: Record<string, SMSTemplate> = {};
  private rateLimiter: Map<string, number> = new Map();

  private constructor() {
    this.config = {
      accountSid: import.meta.env.VITE_TWILIO_ACCOUNT_SID || '',
      authToken: import.meta.env.VITE_TWILIO_AUTH_TOKEN || '',
      fromPhoneNumber: import.meta.env.VITE_TWILIO_PHONE_NUMBER || '',
      isEnabled: import.meta.env.VITE_ENABLE_SMS_NOTIFICATIONS === 'true'
    };

    this.initializeTemplates();
  }

  static getInstance(): SMSService {
    if (!SMSService.instance) {
      SMSService.instance = new SMSService();
    }
    return SMSService.instance;
  }

  private initializeTemplates() {
    this.templates = {
      registration_success: {
        en: "✅ Birth registration successful! Registration ID: {registrationId}. Certificate will be available in 48 hours. - BirthLink Ghana",
        tw: "✅ Awo nkyerɛw nsɛm kwan so adi nkonim! Nkyerɛw nsɛm ID: {registrationId}. Krataa no bɛba awia 48 mu. - BirthLink Ghana"
      },
      sync_notification: {
        en: "🔄 {count} birth registration(s) have been synchronized to the national database. All data is now secure. - BirthLink Ghana",
        tw: "🔄 Awo nkyerɛw nsɛm {count} wɔ ɔman database no mu seesei. Data nyinaa ahye. - BirthLink Ghana"
      },
      system_alert: {
        en: "⚠️ BirthLink System Alert: {message}. Please contact support if needed: {supportPhone}",
        tw: "⚠️ BirthLink System Alert: {message}. Frɛ yɛn sɛ wohia mmoa a: {supportPhone}"
      },
      training_reminder: {
        en: "📚 BirthLink Training Reminder: Your training session is scheduled for {date} at {time}. Venue: {location}. Bring your mobile device!",
        tw: "📚 BirthLink Nkyerɛw Nkae: Wo nkyerɛkyerɛ bere ne {date} wɔ {time}. Beae: {location}. Fa wo phone bra!"
      },
      certificate_ready: {
        en: "📄 Birth certificate for {childName} is ready for collection. Reference: {registrationId}. Valid ID required.",
        tw: "📄 {childName} awo krataa ayɛ. Reference: {registrationId}. Fa wo nsɛnkyerɛnne krataa bra."
      },
      system_maintenance: {
        en: "🔧 BirthLink will be under maintenance from {startTime} to {endTime} on {date}. Offline mode will remain available.",
        tw: "🔧 BirthLink bɛyɛ maintenance fi {startTime} kɔsi {endTime} wɔ {date}. Offline mode da so wɔ hɔ."
      },
      backup_notification: {
        en: "💾 Weekly backup completed. {registrationCount} registrations secured. System health: {status}.",
        tw: "💾 Dapɛn backup ayɛ. Awo nkyerɛw nsɛm {registrationCount} ahye. System health: {status}."
      }
    };
  }

  // Send SMS notification with rate limiting and error handling
  async sendSMS(smsMessage: SMSMessage): Promise<boolean> {
    if (!this.config.isEnabled) {
      console.log('📱 SMS disabled in environment, message would be:', smsMessage.message);
      return true;
    }

    if (!this.config.accountSid || !this.config.authToken) {
      console.error('SMS configuration missing');
      return false;
    }

    // Rate limiting: max 5 SMS per phone number per hour
    const rateLimitKey = `${smsMessage.to}_${new Date().getHours()}`;
    const currentCount = this.rateLimiter.get(rateLimitKey) || 0;
    
    if (currentCount >= 5 && smsMessage.priority !== 'urgent') {
      console.warn(`Rate limit exceeded for ${smsMessage.to}`);
      return false;
    }

    try {
      // In production, this would use Twilio's REST API
      const response = await this.sendTwilioSMS(smsMessage);
      
      if (response.success) {
        // Update rate limiter
        this.rateLimiter.set(rateLimitKey, currentCount + 1);
        
        // Track analytics
        analyticsService.trackEvent('sms_sent', {
          sms_type: smsMessage.type,
          sms_priority: smsMessage.priority,
          sms_language: smsMessage.language || 'en',
          recipient_country: 'GH'
        });

        return true;
      } else {
        throw new Error(response.error);
      }
    } catch (error) {
      console.error('Failed to send SMS:', error);
      
      analyticsService.trackEvent('sms_failed', {
        sms_type: smsMessage.type,
        error_message: error instanceof Error ? error.message : 'Unknown error'
      });

      return false;
    }
  }

  // Send registration success notification
  async sendRegistrationSuccessNotification(
    phoneNumber: string, 
    registrationId: string, 
    _childName: string,
    language: 'en' | 'tw' = 'en'
  ): Promise<boolean> {
    const template = this.templates.registration_success[language] || this.templates.registration_success.en;
    const message = template.replace('{registrationId}', registrationId);

    return this.sendSMS({
      to: this.formatPhoneNumber(phoneNumber),
      message,
      type: 'registration_success',
      priority: 'normal',
      language
    });
  }

  // Send sync completion notification
  async sendSyncNotification(
    phoneNumber: string, 
    syncCount: number, 
    language: 'en' | 'tw' = 'en'
  ): Promise<boolean> {
    const template = this.templates.sync_notification[language] || this.templates.sync_notification.en;
    const message = template.replace('{count}', syncCount.toString());

    return this.sendSMS({
      to: this.formatPhoneNumber(phoneNumber),
      message,
      type: 'sync_notification',
      priority: 'low',
      language
    });
  }

  // Send system alert to administrators
  async sendSystemAlert(
    phoneNumbers: string[], 
    alertMessage: string, 
    priority: 'high' | 'urgent' = 'high'
  ): Promise<boolean[]> {
    const supportPhone = import.meta.env.VITE_SUPPORT_PHONE || '+233200000000';
    const template = this.templates.system_alert.en;
    const message = template
      .replace('{message}', alertMessage)
      .replace('{supportPhone}', supportPhone);

    const results = await Promise.all(
      phoneNumbers.map(phone => this.sendSMS({
        to: this.formatPhoneNumber(phone),
        message,
        type: 'system_alert',
        priority,
        language: 'en'
      }))
    );

    return results;
  }

  // Send training reminder
  async sendTrainingReminder(
    phoneNumber: string,
    trainingDate: string,
    trainingTime: string,
    location: string,
    language: 'en' | 'tw' = 'en'
  ): Promise<boolean> {
    const template = this.templates.training_reminder[language] || this.templates.training_reminder.en;
    const message = template
      .replace('{date}', trainingDate)
      .replace('{time}', trainingTime)
      .replace('{location}', location);

    return this.sendSMS({
      to: this.formatPhoneNumber(phoneNumber),
      message,
      type: 'training_reminder',
      priority: 'normal',
      language
    });
  }

  // Send certificate ready notification
  async sendCertificateReadyNotification(
    phoneNumber: string,
    childName: string,
    registrationId: string,
    language: 'en' | 'tw' = 'en'
  ): Promise<boolean> {
    const template = this.templates.certificate_ready[language] || this.templates.certificate_ready.en;
    const message = template
      .replace('{childName}', childName)
      .replace('{registrationId}', registrationId);

    return this.sendSMS({
      to: this.formatPhoneNumber(phoneNumber),
      message,
      type: 'certificate_ready',
      priority: 'normal',
      language
    });
  }

  // Bulk SMS for system announcements
  async sendBulkNotification(
    recipients: Array<{phone: string, language?: 'en' | 'tw'}>,
    templateKey: string,
    variables: Record<string, string>,
    priority: 'low' | 'normal' | 'high' = 'normal'
  ): Promise<number> {
    let successCount = 0;
    
    for (const recipient of recipients) {
      const language = recipient.language || 'en';
      const template = this.templates[templateKey]?.[language] || this.templates[templateKey]?.en;
      
      if (!template) {
        console.error(`Template ${templateKey} not found`);
        continue;
      }

      let message = template;
      Object.entries(variables).forEach(([key, value]) => {
        message = message.replace(`{${key}}`, value);
      });

      const success = await this.sendSMS({
        to: this.formatPhoneNumber(recipient.phone),
        message,
        type: templateKey as any,
        priority,
        language
      });

      if (success) successCount++;
      
      // Add delay between bulk messages to respect rate limits
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    analyticsService.trackEvent('bulk_sms_sent', {
      total_recipients: recipients.length,
      successful_sends: successCount,
      template_key: templateKey,
      priority
    });

    return successCount;
  }

  // Format phone number to Ghana international format
  private formatPhoneNumber(phoneNumber: string): string {
    // Remove all non-digits
    let cleaned = phoneNumber.replace(/\D/g, '');
    
    // Handle Ghana phone number formats
    if (cleaned.startsWith('0')) {
      // Convert from local format (0XXXXXXXXX) to international (+233XXXXXXXXX)
      cleaned = '233' + cleaned.substring(1);
    } else if (!cleaned.startsWith('233')) {
      // Add country code if missing
      cleaned = '233' + cleaned;
    }
    
    return '+' + cleaned;
  }

  // Mock Twilio API call (replace with actual Twilio SDK in production)
  private async sendTwilioSMS(smsMessage: SMSMessage): Promise<{success: boolean, error?: string}> {
    // In production environment, use actual Twilio SDK
    if (import.meta.env.VITE_APP_ENV === 'production') {
      try {
        // This would be the actual Twilio API call
        const response = await fetch('https://api.twilio.com/2010-04-01/Accounts/' + this.config.accountSid + '/Messages.json', {
          method: 'POST',
          headers: {
            'Authorization': 'Basic ' + btoa(this.config.accountSid + ':' + this.config.authToken),
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: new URLSearchParams({
            From: this.config.fromPhoneNumber,
            To: smsMessage.to,
            Body: smsMessage.message
          })
        });

        if (response.ok) {
          return { success: true };
        } else {
          const errorData = await response.json();
          return { success: false, error: errorData.message };
        }
      } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : 'Network error' };
      }
    } else {
      // Development/staging environment - simulate successful send
      console.log(`📱 [SMS Simulation] To: ${smsMessage.to}`);
      console.log(`📱 [SMS Simulation] Message: ${smsMessage.message}`);
      console.log(`📱 [SMS Simulation] Type: ${smsMessage.type}, Priority: ${smsMessage.priority}`);
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // 95% success rate simulation
      return { success: Math.random() > 0.05 };
    }
  }

  // Get SMS usage statistics
  getUsageStats(): {dailyCount: number, hourlyCount: number, rateLimitReached: number} {
    // In production, this would query actual usage from a persistent store
    return {
      dailyCount: 0, // Would be calculated from database
      hourlyCount: Array.from(this.rateLimiter.values()).reduce((a, b) => a + b, 0),
      rateLimitReached: Array.from(this.rateLimiter.values()).filter(count => count >= 5).length
    };
  }

  // Health check for SMS service
  async healthCheck(): Promise<{isHealthy: boolean, error?: string}> {
    if (!this.config.isEnabled) {
      return { isHealthy: true }; // SMS disabled is valid state
    }

    if (!this.config.accountSid || !this.config.authToken || !this.config.fromPhoneNumber) {
      return { isHealthy: false, error: 'SMS configuration incomplete' };
    }

    try {
      // In production, this would verify Twilio credentials
      return { isHealthy: true };
    } catch (error) {
      return { 
        isHealthy: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }
}

// Export singleton instance
export const smsService = SMSService.getInstance();