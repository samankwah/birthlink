import React from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '../../store';
import { processSyncQueue } from '../../store/slices/syncSlice';
import { Button } from '../atoms';

export const OfflineStatusBar: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  
  const { isOnline, queue, isSyncing, lastSyncTime } = useSelector((state: RootState) => state.sync);
  
  const pendingItems = queue.filter(item => item.status === 'pending' || item.status === 'failed').length;

  const handleSync = () => {
    if (isOnline && !isSyncing) {
      dispatch(processSyncQueue());
    }
  };

  const formatSyncTime = (time: Date | null) => {
    if (!time) return '';
    
    const now = new Date();
    const diff = now.getTime() - time.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'just now';
    if (minutes < 60) return `${minutes}m ago`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  if (isOnline && pendingItems === 0) {
    return null; // Don't show anything when online and nothing to sync
  }

  return (
    <div className={`border-b transition-colors duration-200 ${
      !isOnline 
        ? 'bg-orange-50 border-orange-200' 
        : pendingItems > 0 
          ? 'bg-blue-50 border-blue-200' 
          : 'bg-green-50 border-green-200'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-2">
          <div className="flex items-center space-x-3">
            {/* Status Icon */}
            <div className={`w-3 h-3 rounded-full ${
              !isOnline 
                ? 'bg-orange-500' 
                : pendingItems > 0 
                  ? 'bg-blue-500' 
                  : 'bg-green-500'
            }`} />
            
            {/* Status Message */}
            <div className="flex items-center space-x-2">
              {!isOnline ? (
                <span className="text-sm text-orange-800 font-medium">
                  {t('sync.offline')}
                </span>
              ) : isSyncing ? (
                <span className="text-sm text-blue-800 font-medium">
                  {t('sync.syncing')}
                </span>
              ) : pendingItems > 0 ? (
                <span className="text-sm text-blue-800 font-medium">
                  {t('sync.pendingSync', { count: pendingItems })}
                </span>
              ) : (
                <span className="text-sm text-green-800 font-medium">
                  {t('sync.syncComplete')}
                </span>
              )}
              
              {/* Last Sync Time */}
              {lastSyncTime && (
                <span className="text-xs text-gray-500">
                  {t('sync.lastSync', { time: formatSyncTime(lastSyncTime) })}
                </span>
              )}
            </div>
          </div>

          {/* Sync Actions */}
          <div className="flex items-center space-x-2">
            {isOnline && pendingItems > 0 && !isSyncing && (
              <Button
                size="sm"
                variant="ghost"
                onClick={handleSync}
                className="text-blue-700 hover:text-blue-900"
              >
                Sync Now
              </Button>
            )}
            
            {isSyncing && (
              <div className="flex items-center space-x-1">
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
                <span className="text-xs text-blue-600">Syncing...</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};