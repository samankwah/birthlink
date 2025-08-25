import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { Navigate, Link } from 'react-router-dom';
import type { RootState, AppDispatch } from '../store';
import { loginUser } from '../store/slices/authSlice';

export const Login: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated, isLoading, error } = useSelector((state: RootState) => state.auth);
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);

  // Wait for loading to complete before making navigation decisions
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Only redirect if authenticated AND not loading
  if (isAuthenticated && !isLoading) {
    return <Navigate to="/dashboard" replace />;
  }

  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    if (!formData.email.trim()) {
      errors.email = t('validation.required', 'This field is required');
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formData.email.trim())) {
      errors.email = t('validation.email', 'Please enter a valid email address');
    }
    
    if (!formData.password) {
      errors.password = t('validation.required', 'This field is required');
    } else if (formData.password.length < 8) {
      errors.password = t('validation.minLength', 'Password must be at least 8 characters long');
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    // Clear any previous errors
    setFormErrors({});
    
    try {
      await dispatch(loginUser({
        email: formData.email.trim().toLowerCase(),
        password: formData.password
      })).unwrap();
      
      // Success handling is done by Redux redirect
    } catch (error: unknown) {
      // Enhanced error handling
      let errorMessage = t('auth.loginError', 'Login failed. Please check your credentials and try again.');
      
      if (error && typeof error === 'object' && 'message' in error) {
        const message = (error as { message: string }).message;
        if (message.includes('invalid-email')) {
          errorMessage = t('auth.invalidEmail', 'Invalid email address format');
        } else if (message.includes('wrong-password') || message.includes('invalid-credential')) {
          errorMessage = t('auth.invalidCredentials', 'Invalid email or password');
        } else if (message.includes('user-not-found')) {
          errorMessage = t('auth.userNotFound', 'No account found with this email address');
        } else if (message.includes('too-many-requests')) {
          errorMessage = t('auth.tooManyAttempts', 'Too many failed attempts. Please try again later');
        } else if (message.includes('network-request-failed')) {
          errorMessage = t('auth.networkError', 'Network error. Please check your connection');
        }
      }
      
      setFormErrors({ general: errorMessage });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <div className="min-h-screen bg-white flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:flex-1 bg-gradient-to-br from-blue-600 to-green-600 items-center justify-center relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}></div>
        </div>
        
        <div className="relative text-center text-white px-8">
          <div className="mb-8">
            <div className="w-24 h-24 mx-auto bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm mb-6">
              <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
            </div>
            <h1 className="text-4xl font-bold mb-4">BirthLink Ghana</h1>
            <p className="text-xl text-blue-100 mb-6">Digital Birth Registration Portal</p>
            <p className="text-sm text-blue-200">Ministry of Health • Government of Ghana</p>
          </div>
          
          <div className="space-y-4 text-left max-w-sm mx-auto">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-white rounded-full"></div>
              <p className="text-sm">Secure digital registration</p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-white rounded-full"></div>
              <p className="text-sm">Offline-capable system</p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-white rounded-full"></div>
              <p className="text-sm">Multi-language support</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center">
            <div className="w-16 h-16 mx-auto bg-gradient-to-r from-blue-600 to-green-600 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">BirthLink Ghana</h2>
          </div>

          {/* Sign In Header */}
          <div className="text-center lg:text-left">
            <h2 className="text-2xl font-normal text-gray-900 mb-2">Sign in</h2>
            <p className="text-sm text-gray-600">to continue to BirthLink Ghana</p>
          </div>

          {/* Login Form */}
          <div className="border border-gray-200 rounded-lg p-8 shadow-sm">
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <input
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`block w-full px-4 py-4 border-0 border-b-2 bg-transparent placeholder-gray-500 focus:outline-none focus:border-blue-600 transition-colors text-base ${
                      formErrors.email 
                        ? 'border-red-500 text-red-900' 
                        : 'border-gray-300 text-gray-900 hover:border-gray-400'
                    }`}
                    placeholder="Email"
                  />
                  {formErrors.email && (
                    <p className="mt-2 text-sm text-red-600">{formErrors.email}</p>
                  )}
                </div>
                
                <div className="relative">
                  <input
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={formData.password}
                    onChange={handleInputChange}
                    className={`block w-full px-4 py-4 pr-12 border-0 border-b-2 bg-transparent placeholder-gray-500 focus:outline-none focus:border-blue-600 transition-colors text-base ${
                      formErrors.password 
                        ? 'border-red-500 text-red-900' 
                        : 'border-gray-300 text-gray-900 hover:border-gray-400'
                    }`}
                    placeholder="Password"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-4 text-gray-400 hover:text-gray-600"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                  {formErrors.password && (
                    <p className="mt-2 text-sm text-red-600">{formErrors.password}</p>
                  )}
                </div>
              </div>

              {(error || formErrors.general) && (
                <div className="rounded-lg bg-red-50 border border-red-200 p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-800">{t('auth.loginFailed', 'Sign In Failed')}</h3>
                      <p className="text-sm text-red-700 mt-1">{error || formErrors.general}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between text-sm">
                <Link
                  to="/forgot-password"
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  Forgot password?
                </Link>
                <Link
                  to="/register"
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  Create account
                </Link>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isLoading ? 'Signing In...' : 'Login'}
                </button>
              </div>
            </form>
          </div>

          {/* Footer */}
          <div className="text-center text-xs text-gray-500 space-y-2">
            <div className="flex justify-center space-x-4">
              <a href="#" className="hover:text-gray-700">Help</a>
              <a href="#" className="hover:text-gray-700">Privacy</a>
              <a href="#" className="hover:text-gray-700">Terms</a>
            </div>
            <p>Ministry of Health • Government of Ghana</p>
          </div>
        </div>
      </div>
    </div>
  );
};