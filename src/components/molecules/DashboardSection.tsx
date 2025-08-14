import React from 'react';

interface DashboardSectionProps {
  title: string;
  children: React.ReactNode;
  className?: string;
  headerAction?: React.ReactNode;
}

export const DashboardSection: React.FC<DashboardSectionProps> = ({
  title,
  children,
  className = "",
  headerAction
}) => {
  return (
    <div className={`bg-white shadow rounded-lg p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium text-gray-900">{title}</h2>
        {headerAction && (
          <div className="flex-shrink-0">
            {headerAction}
          </div>
        )}
      </div>
      <div>{children}</div>
    </div>
  );
};