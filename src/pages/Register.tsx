import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { Navigate, Link } from 'react-router-dom';
import type { RootState, AppDispatch } from '../store';
import { registerUser } from '../store/slices/authSlice';
import type { UserRole } from '../types';
import { GHANA_REGIONS } from '../types';
import { validateGhanaPhoneNumber, formatGhanaPhoneNumber, normalizeGhanaPhoneNumber } from '../utils/validation';

interface RegisterFormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  phoneNumber: string;
  region: string;
  district: string;
  role: UserRole;
}

export const Register: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated, isLoading, error } = useSelector((state: RootState) => state.auth);
  
  const [formData, setFormData] = useState<RegisterFormData>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phoneNumber: '',
    region: 'Greater Accra',
    district: '',
    role: 'registrar'
  });
  
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Redirect if already authenticated
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    // Personal Information
    if (!formData.firstName.trim()) {
      errors.firstName = t('validation.required', 'This field is required');
    }
    
    if (!formData.lastName.trim()) {
      errors.lastName = t('validation.required', 'This field is required');
    }
    
    // Account Information
    if (!formData.email.trim()) {
      errors.email = t('validation.required', 'This field is required');
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formData.email.trim())) {
      errors.email = t('validation.email', 'Please enter a valid email address');
    }
    
    if (!formData.password) {
      errors.password = t('validation.required', 'This field is required');
    } else if (formData.password.length < 8) {
      errors.password = t('validation.passwordTooShort', 'Password must be at least 8 characters long');
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/.test(formData.password)) {
      errors.password = t('validation.passwordWeak', 'Password must contain uppercase, lowercase, number, and special character');
    }
    
    if (!formData.confirmPassword) {
      errors.confirmPassword = t('validation.required', 'This field is required');
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = t('validation.passwordMismatch', 'Passwords do not match');
    }
    
    // Contact Information - Phone Number is now required
    if (!formData.phoneNumber.trim()) {
      errors.phoneNumber = t('validation.required', 'This field is required');
    } else if (!validateGhanaPhoneNumber(formData.phoneNumber)) {
      errors.phoneNumber = t('validation.invalidPhone', 'Please enter a valid Ghana phone number (e.g., 024 123 4567 or +233 24 123 4567)');
    }
    
    if (!formData.region) {
      errors.region = t('validation.required', 'This field is required');
    }
    
    if (!formData.district.trim()) {
      errors.district = t('validation.required', 'This field is required');
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Special handling for phone number formatting
    if (name === 'phoneNumber') {
      const formattedPhone = formatGhanaPhoneNumber(value);
      setFormData(prev => ({ ...prev, [name]: formattedPhone }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    
    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      // Clear any previous errors
      setFormErrors({});
      
      const { confirmPassword, ...registrationData } = formData;
      await dispatch(registerUser({
        email: registrationData.email.trim().toLowerCase(),
        password: registrationData.password,
        profile: {
          firstName: registrationData.firstName.trim(),
          lastName: registrationData.lastName.trim(),
          phoneNumber: normalizeGhanaPhoneNumber(registrationData.phoneNumber.trim()),
          region: registrationData.region,
          district: registrationData.district.trim()
        },
        role: registrationData.role
      })).unwrap();
      
      // Registration success - redirect handled by Redux
    } catch (error: any) {
      console.error('Registration failed:', error);
      
      // Enhanced error handling with specific messages
      let errorMessage = t('register.registrationError', 'Registration failed. Please try again.');
      
      if (error?.message) {
        if (error.message.includes('email-already-in-use')) {
          errorMessage = t('register.emailInUse', 'An account with this email already exists');
        } else if (error.message.includes('weak-password')) {
          errorMessage = t('register.passwordWeak', 'Password is too weak. Please choose a stronger password');
        } else if (error.message.includes('invalid-email')) {
          errorMessage = t('register.invalidEmail', 'Invalid email address format');
        } else if (error.message.includes('network-request-failed')) {
          errorMessage = t('register.networkError', 'Network error. Please check your connection and try again');
        } else if (error.message.includes('api-key-not-valid')) {
          errorMessage = t('register.configurationError', 'System configuration error. Please contact support');
        }
      }
      
      setFormErrors({ general: errorMessage });
    }
  };

  return (
    <div className="min-h-screen bg-white flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:flex-1 bg-gradient-to-br from-green-600 to-blue-600 items-center justify-center relative overflow-hidden">
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
                <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
              </svg>
            </div>
            <h1 className="text-4xl font-bold mb-4">BirthLink Ghana</h1>
            <p className="text-xl text-green-100 mb-6">Digital Birth Registration Portal</p>
            <p className="text-sm text-green-200">Ministry of Health • Government of Ghana</p>
          </div>
          
          <div className="space-y-4 text-left max-w-sm mx-auto">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-white rounded-full"></div>
              <p className="text-sm">Create your registrar account</p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-white rounded-full"></div>
              <p className="text-sm">Access birth registration tools</p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-white rounded-full"></div>
              <p className="text-sm">Help communities register births</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Registration Form */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-6">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center">
            <div className="w-16 h-16 mx-auto bg-gradient-to-r from-green-600 to-blue-600 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">BirthLink Ghana</h2>
          </div>

          {/* Create Account Header */}
          <div className="text-center lg:text-left">
            <h2 className="text-2xl font-normal text-gray-900 mb-2">Create your Account</h2>
            <p className="text-sm text-gray-600">to continue to BirthLink Ghana</p>
          </div>

          {/* Registration Form */}
          <div className="border border-gray-200 rounded-lg p-8 shadow-sm">
            <form className="space-y-5" onSubmit={handleSubmit}>
              {/* Error Display */}
              {(error || formErrors.general) && (
                <div className="rounded-lg bg-red-50 border border-red-200 p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-800">Registration Failed</h3>
                      <p className="text-sm text-red-700 mt-1">{error || formErrors.general}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Name Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <input
                    name="firstName"
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className={`block w-full px-4 py-4 border-0 border-b-2 bg-transparent placeholder-gray-500 focus:outline-none focus:border-blue-600 transition-colors text-base ${
                      formErrors.firstName 
                        ? 'border-red-500 text-red-900' 
                        : 'border-gray-300 text-gray-900 hover:border-gray-400'
                    }`}
                    placeholder="First name"
                  />
                  {formErrors.firstName && (
                    <p className="mt-2 text-sm text-red-600">{formErrors.firstName}</p>
                  )}
                </div>
                <div>
                  <input
                    name="lastName"
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className={`block w-full px-4 py-4 border-0 border-b-2 bg-transparent placeholder-gray-500 focus:outline-none focus:border-blue-600 transition-colors text-base ${
                      formErrors.lastName 
                        ? 'border-red-500 text-red-900' 
                        : 'border-gray-300 text-gray-900 hover:border-gray-400'
                    }`}
                    placeholder="Last name"
                  />
                  {formErrors.lastName && (
                    <p className="mt-2 text-sm text-red-600">{formErrors.lastName}</p>
                  )}
                </div>
              </div>

              {/* Email */}
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

              {/* Password Fields */}
              <div className="grid grid-cols-2 gap-4">
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
                <div className="relative">
                  <input
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className={`block w-full px-4 py-4 pr-12 border-0 border-b-2 bg-transparent placeholder-gray-500 focus:outline-none focus:border-blue-600 transition-colors text-base ${
                      formErrors.confirmPassword 
                        ? 'border-red-500 text-red-900' 
                        : 'border-gray-300 text-gray-900 hover:border-gray-400'
                    }`}
                    placeholder="Confirm"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-4 text-gray-400 hover:text-gray-600"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
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
                  {formErrors.confirmPassword && (
                    <p className="mt-2 text-sm text-red-600">{formErrors.confirmPassword}</p>
                  )}
                </div>
              </div>

              {/* Phone Number */}
              <div>
                <input
                  name="phoneNumber"
                  type="tel"
                  required
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  className={`block w-full px-4 py-4 border-0 border-b-2 bg-transparent placeholder-gray-500 focus:outline-none focus:border-blue-600 transition-colors text-base ${
                    formErrors.phoneNumber 
                      ? 'border-red-500 text-red-900' 
                      : 'border-gray-300 text-gray-900 hover:border-gray-400'
                  }`}
                  placeholder="Phone number (e.g., 024 123 4567)"
                />
                {formErrors.phoneNumber && (
                  <p className="mt-2 text-sm text-red-600">{formErrors.phoneNumber}</p>
                )}
                <div className="text-xs text-gray-500 mt-1">
                  Enter Ghana phone number with or without country code
                </div>
              </div>

              {/* Region and District */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <select
                    name="region"
                    required
                    value={formData.region}
                    onChange={handleInputChange}
                    className={`block w-full px-4 py-4 border-0 border-b-2 bg-transparent focus:outline-none focus:border-blue-600 transition-colors text-base ${
                      formErrors.region 
                        ? 'border-red-500 text-red-900' 
                        : 'border-gray-300 text-gray-900 hover:border-gray-400'
                    }`}
                  >
                    <option value="">Select Region</option>
                    {Object.values(GHANA_REGIONS).map(region => (
                      <option key={region} value={region}>{region}</option>
                    ))}
                  </select>
                  {formErrors.region && (
                    <p className="mt-2 text-sm text-red-600">{formErrors.region}</p>
                  )}
                </div>
                <div>
                  <input
                    name="district"
                    type="text"
                    required
                    value={formData.district}
                    onChange={handleInputChange}
                    className={`block w-full px-4 py-4 border-0 border-b-2 bg-transparent placeholder-gray-500 focus:outline-none focus:border-blue-600 transition-colors text-base ${
                      formErrors.district 
                        ? 'border-red-500 text-red-900' 
                        : 'border-gray-300 text-gray-900 hover:border-gray-400'
                    }`}
                    placeholder="District"
                  />
                  {formErrors.district && (
                    <p className="mt-2 text-sm text-red-600">{formErrors.district}</p>
                  )}
                </div>
              </div>

              {/* Password Strength Info */}
              <div className="text-xs text-gray-500 mt-2">
                Use 8 or more characters with a mix of letters, numbers & symbols
              </div>

              {/* Footer Links and Button */}
              <div className="flex items-center justify-between text-sm pt-4">
                <Link
                  to="/login"
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  Sign in instead
                </Link>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isLoading ? 'Creating...' : 'Create'}
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