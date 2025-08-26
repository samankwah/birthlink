import React from 'react';

interface ToggleCardProps {
  title: string;
  description?: string;
  enabled: boolean;
  onChange: (enabled: boolean) => void;
  disabled?: boolean;
  variant?: 'default' | 'warning' | 'success';
  size?: 'sm' | 'md' | 'lg';
}

export const ToggleCard: React.FC<ToggleCardProps> = ({
  title,
  description,
  enabled,
  onChange,
  disabled = false,
  variant = 'default',
  size = 'md'
}) => {
  const sizeClasses = {
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6'
  };

  const variantClasses = {
    default: 'border-gray-200 hover:border-gray-300',
    warning: 'border-orange-200 hover:border-orange-300 bg-orange-50',
    success: 'border-green-200 hover:border-green-300 bg-green-50'
  };

  const toggleClasses = enabled
    ? 'bg-blue-600 border-blue-600'
    : 'bg-gray-200 border-gray-200';

  const thumbClasses = enabled
    ? 'translate-x-5 bg-white'
    : 'translate-x-0 bg-white';

  return (
    <div 
      className={`
        rounded-lg border transition-all duration-200 
        ${variantClasses[variant]} 
        ${sizeClasses[size]}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:shadow-sm'}
      `}
      onClick={() => !disabled && onChange(!enabled)}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0 mr-4">
          <h4 className="text-sm font-medium text-gray-900 truncate">{title}</h4>
          {description && (
            <p className="text-sm text-gray-600 mt-1">{description}</p>
          )}
        </div>
        
        <div className="flex-shrink-0">
          <button
            type="button"
            disabled={disabled}
            onClick={(e) => {
              e.stopPropagation();
              !disabled && onChange(!enabled);
            }}
            className={`
              relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 
              border-transparent transition-colors duration-200 ease-in-out focus:outline-none 
              focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
              ${toggleClasses}
              ${disabled ? 'cursor-not-allowed' : ''}
            `}
            role="switch"
            aria-checked={enabled}
          >
            <span
              aria-hidden="true"
              className={`
                pointer-events-none inline-block h-5 w-5 transform rounded-full 
                shadow ring-0 transition duration-200 ease-in-out
                ${thumbClasses}
              `}
            />
          </button>
        </div>
      </div>
    </div>
  );
};