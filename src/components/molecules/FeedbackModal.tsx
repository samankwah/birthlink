// BirthLink Ghana - Pilot Testing Feedback Modal
// Phase 3: Feedback collection for continuous improvement
// Created: August 12, 2025

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { analyticsService } from '../../services/analytics';
import { Button } from '../atoms/Button';
import { Input } from '../atoms/Input';
import { Select } from '../atoms/Select';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  context?: 'registration' | 'sync' | 'general' | 'training';
}

interface FeedbackData {
  rating: number;
  category: string;
  description: string;
  reproducible: boolean;
  urgency: 'low' | 'medium' | 'high';
  deviceInfo: string;
  contactConsent: boolean;
  email?: string;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({
  isOpen,
  onClose,
  context = 'general'
}) => {
  const { t } = useTranslation();
  const [feedback, setFeedback] = useState<FeedbackData>({
    rating: 0,
    category: '',
    description: '',
    reproducible: false,
    urgency: 'low',
    deviceInfo: navigator.userAgent,
    contactConsent: false,
    email: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const feedbackCategories = [
    { value: 'bug_report', label: t('feedback.bug_report', 'Bug Report') },
    { value: 'feature_request', label: t('feedback.feature_request', 'Feature Request') },
    { value: 'usability_issue', label: t('feedback.usability_issue', 'Usability Issue') },
    { value: 'performance_issue', label: t('feedback.performance_issue', 'Performance Issue') },
    { value: 'training_feedback', label: t('feedback.training_feedback', 'Training Feedback') },
    { value: 'positive_feedback', label: t('feedback.positive_feedback', 'Positive Feedback') },
    { value: 'suggestion', label: t('feedback.suggestion', 'Suggestion') },
    { value: 'other', label: t('feedback.other', 'Other') }
  ];

  const urgencyLevels = [
    { value: 'low', label: t('feedback.urgency_low', 'Low - Minor issue') },
    { value: 'medium', label: t('feedback.urgency_medium', 'Medium - Impacts work') },
    { value: 'high', label: t('feedback.urgency_high', 'High - Prevents work') }
  ];

  if (!isOpen) return null;

  const handleRatingClick = (rating: number) => {
    setFeedback(prev => ({ ...prev, rating }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!feedback.rating || !feedback.category || !feedback.description.trim()) {
      alert(t('feedback.validation_error', 'Please fill in all required fields'));
      return;
    }

    setIsSubmitting(true);

    try {
      // Track analytics
      analyticsService.trackUserFeedback({
        rating: feedback.rating,
        category: feedback.category,
        hasComment: feedback.description.length > 0
      });

      analyticsService.trackPilotFeedback(
        feedback.category as 'bug_report' | 'feature_request' | 'usability_issue' | 'positive_feedback'
      );

      // In a real implementation, this would send to your backend
      const feedbackPayload = {
        ...feedback,
        context,
        timestamp: new Date().toISOString(),
        pilotPhase: 'phase_3',
        appVersion: import.meta.env.VITE_APP_VERSION || '1.0.0'
      };

      console.log('📝 Feedback submitted:', feedbackPayload);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      setSubmitSuccess(true);
      setTimeout(() => {
        onClose();
        setSubmitSuccess(false);
        setFeedback({
          rating: 0,
          category: '',
          description: '',
          reproducible: false,
          urgency: 'low',
          deviceInfo: navigator.userAgent,
          contactConsent: false,
          email: ''
        });
      }, 2000);

    } catch (error) {
      console.error('Failed to submit feedback:', error);
      alert(t('feedback.submit_error', 'Failed to submit feedback. Please try again.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitSuccess) {
    return (
      <div className="fixed inset-0 bg-white/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white/95 backdrop-blur rounded-lg p-8 max-w-md w-full text-center shadow-2xl border border-white/30">
          <div className="text-6xl mb-4">🎉</div>
          <h3 className="text-2xl font-bold text-green-600 mb-2">
            {t('feedback.success_title', 'Thank You!')}
          </h3>
          <p className="text-gray-600">
            {t('feedback.success_message', 'Your feedback helps us improve BirthLink Ghana for all users.')}
          </p>
          <div className="mt-4 text-sm text-gray-500">
            {t('feedback.success_note', 'We appreciate your contribution to Ghana\'s digital transformation!')}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-white/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white/95 backdrop-blur rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-white/30">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              📝 {t('feedback.title', 'Share Your Feedback')}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ×
            </button>
          </div>

          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-700">
              🇬🇭 {t('feedback.pilot_note', 'Your feedback is crucial for improving BirthLink Ghana during our pilot testing phase. Every comment helps us create a better experience for all registrars.')}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Rating */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('feedback.rating_label', 'Overall Experience Rating')} *
              </label>
              <div className="flex space-x-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => handleRatingClick(star)}
                    className={`text-3xl transition-colors ${
                      star <= feedback.rating
                        ? 'text-yellow-400 hover:text-yellow-500'
                        : 'text-gray-300 hover:text-gray-400'
                    }`}
                  >
                    ⭐
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {t('feedback.rating_hint', '1 = Poor, 5 = Excellent')}
              </p>
            </div>

            {/* Category */}
            <div>
              <Select
                label={t('feedback.category_label', 'Feedback Category') + ' *'}
                value={feedback.category}
                onChange={(e) => setFeedback(prev => ({ ...prev, category: e.target.value }))}
                options={feedbackCategories}
                placeholder={t('feedback.category_placeholder', 'Select category...')}
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('feedback.description_label', 'Detailed Description')} *
              </label>
              <textarea
                value={feedback.description}
                onChange={(e) => setFeedback(prev => ({ ...prev, description: e.target.value }))}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={t('feedback.description_placeholder', 'Please describe your experience, issue, or suggestion in detail...')}
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                {t('feedback.description_hint', 'Include steps to reproduce issues, device info, or specific suggestions')}
              </p>
            </div>

            {/* Urgency Level */}
            <div>
              <Select
                label={t('feedback.urgency_label', 'Urgency Level')}
                value={feedback.urgency}
                onChange={(e) => setFeedback(prev => ({ ...prev, urgency: e.target.value as 'low' | 'medium' | 'high' }))}
                options={urgencyLevels}
              />
            </div>

            {/* Reproducible (for bugs) */}
            {feedback.category === 'bug_report' && (
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="reproducible"
                  checked={feedback.reproducible}
                  onChange={(e) => setFeedback(prev => ({ ...prev, reproducible: e.target.checked }))}
                  className="mr-2"
                />
                <label htmlFor="reproducible" className="text-sm text-gray-700">
                  {t('feedback.reproducible_label', 'This issue happens consistently')}
                </label>
              </div>
            )}

            {/* Contact Consent */}
            <div className="space-y-3">
              <div className="flex items-start">
                <input
                  type="checkbox"
                  id="contactConsent"
                  checked={feedback.contactConsent}
                  onChange={(e) => setFeedback(prev => ({ ...prev, contactConsent: e.target.checked }))}
                  className="mr-2 mt-1"
                />
                <label htmlFor="contactConsent" className="text-sm text-gray-700">
                  {t('feedback.contact_consent', 'You may contact me for follow-up questions about this feedback')}
                </label>
              </div>

              {feedback.contactConsent && (
                <div>
                  <Input
                    label={t('feedback.email_label', 'Your Email (Optional)')}
                    type="email"
                    value={feedback.email || ''}
                    onChange={(e) => setFeedback(prev => ({ ...prev, email: e.target.value }))}
                    placeholder={t('feedback.email_placeholder', 'your.email@example.com')}
                  />
                </div>
              )}
            </div>

            {/* Device Info Display */}
            <div className="text-xs text-gray-500 p-2 bg-gray-50 rounded">
              <strong>{t('feedback.device_info', 'Device Info')}:</strong> {' '}
              {feedback.deviceInfo.substring(0, 100)}...
            </div>

            {/* Submit Buttons */}
            <div className="flex justify-end space-x-3 pt-4">
              <Button
                type="button"
                variant="secondary"
                onClick={onClose}
                disabled={isSubmitting}
              >
                {t('feedback.cancel', 'Cancel')}
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || !feedback.rating || !feedback.category || !feedback.description.trim()}
              >
                {isSubmitting 
                  ? t('feedback.submitting', 'Submitting...') 
                  : t('feedback.submit', 'Submit Feedback')
                }
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};