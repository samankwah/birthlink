import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Button } from '../components/atoms';
import { FormField } from '../components/molecules';
import type { RootState, AppDispatch } from '../store';
import { resetPassword } from '../store/slices/authSlice';

export const ForgotPassword: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const { isLoading, error } = useSelector((state: RootState) => state.auth);
  
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    if (!email) {
      errors.email = t('validation.required');
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = t('validation.email');
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      await dispatch(resetPassword(email)).unwrap();
      setIsSubmitted(true);
    } catch (error) {
      console.error('Password reset failed:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { value } = e.target;
    setEmail(value);
    
    // Clear error when user starts typing
    if (formErrors.email) {
      setFormErrors(prev => ({ ...prev, email: '' }));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <div className="h-10 w-10 flex items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-green-600">
                <span className="text-white text-xl font-bold">B</span>
              </div>
              <div className="ml-3">
                <h1 className="text-xl font-bold text-gray-900">BirthLink Ghana</h1>
                <p className="text-sm text-gray-500">Birth Registration System</p>
              </div>
            </div>
            <Link
              to="/login"
              className="text-sm text-blue-600 hover:text-blue-500 font-medium"
            >
              {t('auth.backToLogin')}
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          {!isSubmitted ? (
            <>
              {/* Reset Password Form */}
              <div className="text-center mb-8">
                <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-green-600 shadow-lg">
                  <span className="text-3xl">🔐</span>
                </div>
                <h2 className="mt-6 text-3xl font-bold text-gray-900">
                  {t('auth.forgotPassword')}
                </h2>
                <p className="mt-3 text-gray-600">
                  {t('auth.forgotPasswordDesc')}
                </p>
              </div>

              <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8">
                <form className="space-y-6" onSubmit={handleSubmit}>
                  <FormField
                    label={t('auth.email')}
                    name="email"
                    type="email"
                    required
                    value={email}
                    onChange={handleInputChange}
                    error={formErrors.email}
                    placeholder="your.email@example.com"
                    helperText={t('auth.resetPasswordHelp')}
                  />

                  {error && (
                    <div className="rounded-lg bg-red-50 border border-red-200 p-4">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <span className="text-red-500">⚠</span>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm text-red-800">{error}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  <Button
                    type="submit"
                    fullWidth
                    isLoading={isLoading}
                    disabled={isLoading}
                    className="h-12 text-lg font-medium bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    {isLoading ? t('auth.sendingReset') : t('auth.sendResetLink')}
                  </Button>
                </form>
              </div>
            </>
          ) : (
            <>
              {/* Success Message */}
              <div className="text-center mb-8">
                <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-gradient-to-r from-green-600 to-blue-600 shadow-lg">
                  <span className="text-3xl">✉️</span>
                </div>
                <h2 className="mt-6 text-3xl font-bold text-gray-900">
                  {t('auth.resetEmailSent')}
                </h2>
                <p className="mt-3 text-gray-600">
                  {t('auth.resetEmailSentDesc', { email })}
                </p>
              </div>

              <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8">
                <div className="space-y-6">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <span className="text-green-500">✓</span>
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-green-800">
                          {t('auth.checkYourEmail')}
                        </h3>
                        <div className="mt-2 text-sm text-green-700">
                          <ul className="list-disc list-inside space-y-1">
                            <li>{t('auth.checkEmailStep1')}</li>
                            <li>{t('auth.checkEmailStep2')}</li>
                            <li>{t('auth.checkEmailStep3')}</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="text-sm text-gray-600">
                    <p>{t('auth.noEmailReceived')}</p>
                    <ul className="mt-2 space-y-1 list-disc list-inside">
                      <li>{t('auth.checkSpamFolder')}</li>
                      <li>{t('auth.waitFewMinutes')}</li>
                    </ul>
                  </div>

                  <div className="flex space-x-4">
                    <Button
                      type="button"
                      fullWidth
                      variant="ghost"
                      onClick={() => setIsSubmitted(false)}
                    >
                      {t('auth.resendEmail')}
                    </Button>
                    <Link to="/login" className="flex-1">
                      <Button
                        type="button"
                        fullWidth
                        className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700"
                      >
                        {t('auth.backToLogin')}
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500">
              {t('auth.rememberPassword')}{' '}
              <Link
                to="/login"
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                {t('auth.backToLogin')}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};