import React from 'react';

interface QuickActionCardProps {
  title: string;
  description: string;
  icon: string;
  onClick: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary';
  className?: string;
}

export const QuickActionCard: React.FC<QuickActionCardProps> = ({
  title,
  description,
  icon,
  onClick,
  disabled = false,
  variant = 'secondary',
  className = ""
}) => {
  const baseStyles = "flex items-center p-4 border rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed";
  const variantStyles = {
    primary: "border-blue-200 bg-blue-50 hover:bg-blue-100 disabled:hover:bg-blue-50",
    secondary: "border-gray-200 bg-white hover:bg-gray-50 disabled:hover:bg-white"
  };

  return (
    <button 
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
      aria-label={`${title}: ${description}`}
    >
      <div className="text-2xl mr-3" aria-hidden="true">{icon}</div>
      <div className="text-left min-w-0 flex-1">
        <p className="font-medium text-gray-900 truncate">{title}</p>
        <p className="text-sm text-gray-500 truncate">{description}</p>
      </div>
    </button>
  );
};