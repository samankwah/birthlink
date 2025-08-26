import React from 'react';

interface Option {
  value: string;
  label: string;
  description?: string;
  icon?: React.ReactNode;
}

interface SelectCardProps {
  title: string;
  description?: string;
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  disabled?: boolean;
  variant?: 'default' | 'compact';
}

export const SelectCard: React.FC<SelectCardProps> = ({
  title,
  description,
  value,
  onChange,
  options,
  disabled = false,
  variant = 'default'
}) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const selectedOption = options.find(opt => opt.value === value);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.select-card-dropdown')) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  if (variant === 'compact') {
    return (
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-medium text-gray-900">{title}</h4>
          {description && (
            <p className="text-sm text-gray-600">{description}</p>
          )}
        </div>
        <div className="relative select-card-dropdown">
          <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            className="appearance-none bg-white border border-gray-300 rounded-md px-3 py-2 pr-8 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {options.map((option) => (
              <option key={option.value} value={option.value} className="bg-white text-gray-900">
                {option.label}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div>
        <h4 className="text-sm font-medium text-gray-900">{title}</h4>
        {description && (
          <p className="text-sm mt-1 text-gray-600">{description}</p>
        )}
      </div>

      <div className="relative select-card-dropdown">
        <button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className={`
            relative w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-left text-gray-900
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
            hover:border-gray-400 transition-colors duration-200
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          `}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {selectedOption?.icon && (
                <div className="flex-shrink-0 w-6 h-6 text-gray-400">
                  {selectedOption.icon}
                </div>
              )}
              <div>
                <span className="block text-sm font-medium text-gray-900">
                  {selectedOption?.label || 'Select option'}
                </span>
                {selectedOption?.description && (
                  <span className="block text-sm text-gray-600">
                    {selectedOption.description}
                  </span>
                )}
              </div>
            </div>
            <svg
              className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </button>

        {isOpen && (
          <div className="absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-xl 
                         max-h-60 overflow-auto sm:max-h-60 overscroll-contain
                         transform-gpu will-change-transform">
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleSelect(option.value)}
                className={`
                  w-full px-3 py-2.5 sm:px-4 sm:py-3 text-left focus:outline-none
                  transition-colors duration-150 first:rounded-t-lg last:rounded-b-lg
                  touch-manipulation
                  ${value === option.value 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-900 hover:bg-gray-100'
                  }
                `}
              >
                <div className="flex items-center space-x-3">
                  {option.icon && (
                    <div className="flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 text-gray-400">
                      {option.icon}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <span className="block text-sm font-medium truncate">{option.label}</span>
                    {option.description && (
                      <span className="block text-xs sm:text-sm text-gray-500 truncate">{option.description}</span>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};