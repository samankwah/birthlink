import React from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import type { RootState } from "../store";
import {
  StatCard,
  QuickActionCard,
  DashboardSection,
} from "../components/molecules";
import {
  useDashboardStats,
  useRecentRegistrations,
  useQuickActions,
} from "../hooks";

export const Dashboard: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useSelector((state: RootState) => state.auth);
  const {
    stats,
    isLoading: statsLoading,
    error: statsError,
    refresh: refreshStats,
  } = useDashboardStats();
  const {
    registrations,
    isLoading: recentLoading,
    error: recentError,
  } = useRecentRegistrations(3);
  const quickActions = useQuickActions();

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Welcome Header */}
      <div className="bg-white shadow rounded-lg p-4 sm:p-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
          {t("dashboard.welcome", { name: user?.profile?.firstName || "User" })}
        </h1>
        <p className="mt-2 text-sm sm:text-base text-gray-600">
          Welcome to BirthLink Ghana - Birth Registration System
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {statsError ? (
          <div className="col-span-full bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600 text-sm">{statsError}</p>
            <button
              onClick={refreshStats}
              className="text-red-700 underline text-sm mt-1"
            >
              Try again
            </button>
          </div>
        ) : (
          stats.map((stat, index) => (
            <StatCard
              key={index}
              label={stat.label}
              value={stat.value}
              icon={stat.icon}
              isLoading={statsLoading}
            />
          ))
        )}
      </div>

      {/* Quick Actions */}
      <DashboardSection title={t("dashboard.quickActions")}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickActions.map((action) => (
            <QuickActionCard
              key={action.id}
              title={action.title}
              description={action.description}
              icon={action.icon}
              onClick={action.action}
              disabled={action.disabled}
              variant={action.variant}
            />
          ))}
        </div>
      </DashboardSection>

      {/* Recent Registrations */}
      <DashboardSection title={t("dashboard.recentRegistrations")}>
        {recentError ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600 text-sm">{recentError}</p>
          </div>
        ) : recentLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="animate-pulse flex items-center justify-between p-3 border border-gray-200 rounded-lg"
              >
                <div>
                  <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-24"></div>
                </div>
                <div className="h-4 bg-gray-200 rounded w-16"></div>
              </div>
            ))}
          </div>
        ) : registrations.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No recent registrations found</p>
          </div>
        ) : (
          <div className="space-y-3">
            {registrations.map((registration) => (
              <div
                key={registration.id}
                className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-gray-900 truncate">
                    Registration {registration.registrationNumber}
                  </p>
                  <p className="text-sm text-gray-500 truncate">
                    {registration.childName} - {registration.timeAgo}
                  </p>
                </div>
                <div
                  className={`text-sm font-medium ${
                    (registration as any).statusDisplay?.className ||
                    "text-gray-600"
                  }`}
                >
                  {(registration as any).statusDisplay?.text ||
                    registration.status}
                </div>
              </div>
            ))}
          </div>
        )}
      </DashboardSection>
    </div>
  );
};
