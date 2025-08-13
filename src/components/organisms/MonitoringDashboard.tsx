// BirthLink Ghana - Pilot Testing Monitoring Dashboard
// Phase 3: Real-time monitoring for pilot testing
// Created: August 12, 2025

import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store';

interface PilotMetrics {
  activeUsers: number;
  registrationsToday: number;
  registrationsTotal: number;
  syncSuccessRate: number;
  offlineUsers: number;
  avgRegistrationTime: number;
  errorCount: number;
  feedbackCount: number;
}

interface SystemHealth {
  apiResponseTime: number;
  databaseHealth: 'healthy' | 'warning' | 'critical';
  syncQueueSize: number;
  lastSyncTime: string;
  networkStatus: 'online' | 'offline';
}

export const MonitoringDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<PilotMetrics>({
    activeUsers: 0,
    registrationsToday: 0,
    registrationsTotal: 0,
    syncSuccessRate: 0,
    offlineUsers: 0,
    avgRegistrationTime: 0,
    errorCount: 0,
    feedbackCount: 0
  });

  const [systemHealth, setSystemHealth] = useState<SystemHealth>({
    apiResponseTime: 0,
    databaseHealth: 'healthy',
    syncQueueSize: 0,
    lastSyncTime: '',
    networkStatus: 'online'
  });

  const [selectedTimeRange, setSelectedTimeRange] = useState<'1h' | '24h' | '7d' | '30d'>('24h');
  const { user } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    // Simulated metrics - In production, this would fetch from Firebase/Analytics
    const fetchMetrics = () => {
      // This would integrate with your analytics service
      setMetrics({
        activeUsers: Math.floor(Math.random() * 50) + 30,
        registrationsToday: Math.floor(Math.random() * 200) + 150,
        registrationsTotal: Math.floor(Math.random() * 5000) + 3000,
        syncSuccessRate: Math.random() * 10 + 90,
        offlineUsers: Math.floor(Math.random() * 15) + 5,
        avgRegistrationTime: Math.random() * 5 + 8,
        errorCount: Math.floor(Math.random() * 10),
        feedbackCount: Math.floor(Math.random() * 25) + 10
      });

      setSystemHealth({
        apiResponseTime: Math.random() * 300 + 200,
        databaseHealth: Math.random() > 0.8 ? 'warning' : 'healthy',
        syncQueueSize: Math.floor(Math.random() * 50),
        lastSyncTime: new Date().toLocaleTimeString(),
        networkStatus: navigator.onLine ? 'online' : 'offline'
      });
    };

    fetchMetrics();
    const interval = setInterval(fetchMetrics, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, [selectedTimeRange]);

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'healthy': return 'text-green-600 bg-green-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'critical': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const MetricCard: React.FC<{
    title: string;
    value: string | number;
    subtitle?: string;
    status?: 'good' | 'warning' | 'critical';
    trend?: 'up' | 'down' | 'stable';
  }> = ({ title, value, subtitle, status = 'good', trend }) => {
    const statusColors = {
      good: 'border-green-200 bg-green-50',
      warning: 'border-yellow-200 bg-yellow-50',
      critical: 'border-red-200 bg-red-50'
    };

    return (
      <div className={`p-6 rounded-lg border-2 ${statusColors[status]}`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-3xl font-bold text-gray-900">{value}</p>
            {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
          </div>
          {trend && (
            <div className={`ml-4 ${
              trend === 'up' ? 'text-green-600' : 
              trend === 'down' ? 'text-red-600' : 'text-gray-600'
            }`}>
              {trend === 'up' && '↗'}
              {trend === 'down' && '↘'}
              {trend === 'stable' && '→'}
            </div>
          )}
        </div>
      </div>
    );
  };

  // Only show dashboard to admin users
  if (!user || user.role !== 'admin') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🚀 Phase 3 Pilot Monitoring Dashboard
          </h1>
          <p className="text-gray-600">
            Real-time monitoring for BirthLink Ghana pilot testing program
          </p>
          
          {/* Time Range Selector */}
          <div className="mt-4 flex space-x-2">
            {(['1h', '24h', '7d', '30d'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setSelectedTimeRange(range)}
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  selectedTimeRange === range
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                {range}
              </button>
            ))}
          </div>
        </div>

        {/* System Health Alert */}
        <div className={`mb-6 p-4 rounded-lg ${getHealthColor(systemHealth.databaseHealth)}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <span className="text-sm font-medium">System Status:</span>
              <span className="ml-2 capitalize font-semibold">{systemHealth.databaseHealth}</span>
            </div>
            <div className="text-sm">
              Last updated: {systemHealth.lastSyncTime} • 
              API: {systemHealth.apiResponseTime.toFixed(0)}ms •
              Queue: {systemHealth.syncQueueSize} items
            </div>
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            title="Active Registrars"
            value={metrics.activeUsers}
            subtitle="Currently online"
            status={metrics.activeUsers > 40 ? 'good' : metrics.activeUsers > 20 ? 'warning' : 'critical'}
            trend={metrics.activeUsers > 40 ? 'up' : 'stable'}
          />
          
          <MetricCard
            title="Registrations Today"
            value={metrics.registrationsToday}
            subtitle="Daily target: 200"
            status={metrics.registrationsToday > 150 ? 'good' : metrics.registrationsToday > 75 ? 'warning' : 'critical'}
            trend="up"
          />
          
          <MetricCard
            title="Sync Success Rate"
            value={`${metrics.syncSuccessRate.toFixed(1)}%`}
            subtitle="Offline sync performance"
            status={metrics.syncSuccessRate > 95 ? 'good' : metrics.syncSuccessRate > 90 ? 'warning' : 'critical'}
            trend={metrics.syncSuccessRate > 95 ? 'up' : 'down'}
          />
          
          <MetricCard
            title="Avg. Registration Time"
            value={`${metrics.avgRegistrationTime.toFixed(1)}m`}
            subtitle="Target: <10 minutes"
            status={metrics.avgRegistrationTime < 10 ? 'good' : metrics.avgRegistrationTime < 15 ? 'warning' : 'critical'}
            trend="stable"
          />
        </div>

        {/* Detailed Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Pilot Progress */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">📊 Pilot Progress</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm">
                  <span>Registrars Trained</span>
                  <span>{metrics.activeUsers}/50 (Target)</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ width: `${(metrics.activeUsers / 50) * 100}%` }}
                  />
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm">
                  <span>Total Registrations</span>
                  <span>{metrics.registrationsTotal}/1,000 (Target)</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                  <div 
                    className="bg-green-600 h-2 rounded-full" 
                    style={{ width: `${(metrics.registrationsTotal / 1000) * 100}%` }}
                  />
                </div>
              </div>
              
              <div className="flex justify-between items-center pt-2">
                <span className="text-sm text-gray-600">Pilot Districts:</span>
                <span className="text-sm font-medium">Kumasi, Tamale, Accra</span>
              </div>
            </div>
          </div>

          {/* System Performance */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">⚡ System Performance</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Offline Users:</span>
                <span className="text-sm font-medium">{metrics.offlineUsers}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Error Rate:</span>
                <span className={`text-sm font-medium ${metrics.errorCount < 5 ? 'text-green-600' : 'text-red-600'}`}>
                  {metrics.errorCount} errors
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Feedback Received:</span>
                <span className="text-sm font-medium">{metrics.feedbackCount} responses</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">PWA Install Rate:</span>
                <span className="text-sm font-medium">42%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-8 bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">🔧 Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition">
              📊 Export Analytics
            </button>
            <button className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition">
              📝 Generate Report
            </button>
            <button className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition">
              🚨 View Alerts
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Phase 3 Pilot Testing • Updated every 30 seconds • Ghana Birth Registration System</p>
          <p className="mt-1">🇬🇭 Empowering communities through digital birth registration</p>
        </div>
      </div>
    </div>
  );
};