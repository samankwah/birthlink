import React, { useEffect, useState } from 'react';

interface SettingToastProps {
  message: string;
  type: 'success' | 'error' | 'saving';
  show: boolean;
  onHide: () => void;
}

export const SettingToast: React.FC<SettingToastProps> = ({
  message,
  type,
  show,
  onHide
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onHide, 300); // Wait for fade out animation
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [show, onHide]);

  if (!show && !isVisible) return null;

  const iconMap = {
    success: (
      <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    ),
    error: (
      <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    ),
    saving: (
      <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
    )
  };

  const colorMap = {
    success: 'bg-green-50 border-green-200',
    error: 'bg-red-50 border-red-200',
    saving: 'bg-blue-50 border-blue-200'
  };

  return (
    <div className="fixed top-4 right-4 z-[100]">
      <div
        className={`
          flex items-center space-x-3 px-4 py-3 rounded-lg border shadow-lg
          transform transition-all duration-300 ease-in-out
          ${isVisible ? 'translate-y-0 opacity-100' : '-translate-y-2 opacity-0'}
          ${colorMap[type]}
        `}
      >
        {iconMap[type]}
        <span className="text-sm font-medium text-gray-900">{message}</span>
      </div>
    </div>
  );
};