import React from 'react';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: string;
  onClick?: () => void;
  isLoading?: boolean;
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({ 
  label, 
  value, 
  icon, 
  onClick, 
  isLoading = false,
  className = "" 
}) => {
  const Component = onClick ? 'button' : 'div';
  
  return (
    <Component 
      onClick={onClick}
      className={`bg-white shadow rounded-lg p-6 ${onClick ? 'cursor-pointer hover:shadow-lg transition-shadow duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500' : ''} ${className}`}
      {...(onClick && { type: 'button', role: 'button', tabIndex: 0 })}
      aria-label={onClick ? `${label}: ${value}` : undefined}
    >
      <div className="flex items-center">
        <div className="text-3xl mr-4" aria-hidden="true">{icon}</div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-gray-600 truncate">{label}</p>
          {isLoading ? (
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded mt-1"></div>
            </div>
          ) : (
            <p className="text-2xl font-bold text-gray-900">{value}</p>
          )}
        </div>
      </div>
    </Component>
  );
};