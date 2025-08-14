import React from 'react';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  status?: 'good' | 'warning' | 'critical';
  trend?: 'up' | 'down' | 'stable';
  isLoading?: boolean;
  className?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({ 
  title, 
  value, 
  subtitle, 
  status = 'good', 
  trend, 
  isLoading = false,
  className = ""
}) => {
  const statusColors = {
    good: 'border-green-200 bg-green-50',
    warning: 'border-yellow-200 bg-yellow-50',
    critical: 'border-red-200 bg-red-50'
  };

  const trendIcons = {
    up: '↗️',
    down: '↘️', 
    stable: '→'
  };

  const trendColors = {
    up: 'text-green-600',
    down: 'text-red-600',
    stable: 'text-gray-600'
  };

  return (
    <div 
      className={`p-6 rounded-lg border-2 ${statusColors[status]} ${className}`}
      role="img" 
      aria-label={`${title}: ${value}${subtitle ? `, ${subtitle}` : ''}${trend ? `, trend ${trend}` : ''}`}
    >
      <div className="flex items-center justify-between">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-gray-600 truncate">{title}</p>
          {isLoading ? (
            <div className="animate-pulse">
              <div className="h-9 bg-gray-200 rounded mt-1"></div>
              {subtitle && <div className="h-4 bg-gray-200 rounded mt-2"></div>}
            </div>
          ) : (
            <>
              <p className="text-3xl font-bold text-gray-900">{value}</p>
              {subtitle && <p className="text-sm text-gray-500 truncate">{subtitle}</p>}
            </>
          )}
        </div>
        {trend && !isLoading && (
          <div className={`ml-4 text-2xl ${trendColors[trend]}`} aria-hidden="true">
            {trendIcons[trend]}
          </div>
        )}
      </div>
    </div>
  );
};