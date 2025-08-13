import React, { useState, forwardRef } from 'react';

interface PasswordInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  showStrengthIndicator?: boolean;
}

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ label, error, helperText, required, showStrengthIndicator = false, className = '', value, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    
    // Password strength calculation
    const calculatePasswordStrength = (password: string): { score: number; label: string; color: string } => {
      if (!password) return { score: 0, label: 'Enter password', color: 'gray' };
      
      let score = 0;
      if (password.length >= 8) score += 1;
      if (/[a-z]/.test(password)) score += 1;
      if (/[A-Z]/.test(password)) score += 1;
      if (/\d/.test(password)) score += 1;
      if (/[@$!%*?&]/.test(password)) score += 1;
      
      if (score <= 2) return { score, label: 'Weak', color: 'red' };
      if (score === 3) return { score, label: 'Fair', color: 'yellow' };
      if (score === 4) return { score, label: 'Good', color: 'blue' };
      return { score, label: 'Strong', color: 'green' };
    };

    const strength = showStrengthIndicator ? calculatePasswordStrength(value as string || '') : null;

    const inputClasses = `
      block w-full pl-3 pr-12 py-3 border rounded-lg shadow-sm placeholder-gray-400 
      focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
      transition-all duration-200 text-sm
      ${error 
        ? 'border-red-300 text-red-900 focus:ring-red-500 focus:border-red-500' 
        : 'border-gray-300 text-gray-900'
      }
      ${props.disabled ? 'bg-gray-50 cursor-not-allowed' : 'bg-white hover:border-gray-400'}
      ${className}
    `;

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <div className="relative">
          <input
            ref={ref}
            type={showPassword ? 'text' : 'password'}
            className={inputClasses}
            value={value}
            {...props}
          />
          <button
            type="button"
            className="absolute inset-y-0 right-0 pr-3 flex items-center hover:bg-gray-50 rounded-r-lg transition-colors"
            onClick={() => setShowPassword(!showPassword)}
            tabIndex={-1}
          >
            {showPassword ? (
              <svg className="w-5 h-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
              </svg>
            ) : (
              <svg className="w-5 h-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            )}
          </button>
        </div>

        {/* Password Strength Indicator */}
        {showStrengthIndicator && strength && value && (
          <div className="mt-2">
            <div className="flex items-center space-x-2">
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-300 ${
                    strength.color === 'red' ? 'bg-red-500' :
                    strength.color === 'yellow' ? 'bg-yellow-500' :
                    strength.color === 'blue' ? 'bg-blue-500' :
                    'bg-green-500'
                  }`}
                  style={{ width: `${(strength.score / 5) * 100}%` }}
                />
              </div>
              <span className={`text-xs font-medium ${
                strength.color === 'red' ? 'text-red-600' :
                strength.color === 'yellow' ? 'text-yellow-600' :
                strength.color === 'blue' ? 'text-blue-600' :
                'text-green-600'
              }`}>
                {strength.label}
              </span>
            </div>
          </div>
        )}

        {error && (
          <p className="mt-2 text-sm text-red-600 flex items-center">
            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path 
                fillRule="evenodd" 
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" 
                clipRule="evenodd" 
              />
            </svg>
            {error}
          </p>
        )}
        {helperText && !error && (
          <p className="mt-2 text-sm text-gray-500">{helperText}</p>
        )}
      </div>
    );
  }
);

PasswordInput.displayName = 'PasswordInput';