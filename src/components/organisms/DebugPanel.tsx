import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store';
import { db, auth, areEmulatorsConnected } from '../../services/firebase';

interface DebugPanelProps {
  isVisible?: boolean;
}

export const DebugPanel: React.FC<DebugPanelProps> = ({ isVisible = false }) => {
  const [isExpanded, setIsExpanded] = useState(isVisible);
  const { user } = useSelector((state: RootState) => state.auth);
  const { isLoading, error } = useSelector((state: RootState) => state.registrations);
  const { notifications } = useSelector((state: RootState) => state.ui);

  // Only show in development mode
  if (!import.meta.env.DEV) {
    return null;
  }

  if (!isExpanded) {
    return (
      <div className="fixed bottom-4 left-4 z-50">
        <button
          onClick={() => setIsExpanded(true)}
          className="bg-gray-800 text-white px-3 py-2 rounded-full text-xs hover:bg-gray-700"
        >
          🔧 Debug
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 left-4 z-50 bg-gray-800 text-white p-4 rounded-lg max-w-md max-h-96 overflow-y-auto shadow-xl">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-sm font-bold">🔧 Debug Panel</h3>
        <button
          onClick={() => setIsExpanded(false)}
          className="text-gray-400 hover:text-white"
        >
          ✕
        </button>
      </div>
      
      <div className="space-y-3 text-xs">
        {/* Firebase Status */}
        <div>
          <strong>🔥 Firebase Status:</strong>
          <div className="ml-2 space-y-1">
            <div>Database: {db ? '✅ Connected' : '❌ Not Connected'}</div>
            <div>Auth: {auth ? '✅ Initialized' : '❌ Not Initialized'}</div>
            <div>Emulators: {areEmulatorsConnected() ? '✅ Connected' : '❌ Not Connected'}</div>
            <div>Environment: {import.meta.env.DEV ? '🚧 Development' : '🚀 Production'}</div>
          </div>
        </div>

        {/* User Status */}
        <div>
          <strong>👤 User Status:</strong>
          <div className="ml-2 space-y-1">
            <div>Authenticated: {user ? '✅ Yes' : '❌ No'}</div>
            {user && (
              <>
                <div>Role: {user.role || 'Unknown'}</div>
                <div>UID: {user.uid?.slice(0, 8)}...</div>
                <div>Email: {user.email}</div>
              </>
            )}
          </div>
        </div>

        {/* Registration Status */}
        <div>
          <strong>📄 Registration Status:</strong>
          <div className="ml-2 space-y-1">
            <div>Loading: {isLoading ? '⏳ Yes' : '✅ No'}</div>
            <div>Error: {error ? `❌ ${error}` : '✅ None'}</div>
          </div>
        </div>

        {/* Notifications */}
        <div>
          <strong>🔔 Notifications ({notifications.length}):</strong>
          <div className="ml-2 space-y-1 max-h-24 overflow-y-auto">
            {notifications.length === 0 ? (
              <div>No notifications</div>
            ) : (
              notifications.slice(-3).map(notif => (
                <div key={notif.id} className="text-xs">
                  <span className={
                    notif.type === 'error' ? 'text-red-300' :
                    notif.type === 'success' ? 'text-green-300' :
                    notif.type === 'warning' ? 'text-yellow-300' :
                    'text-blue-300'
                  }>
                    {notif.type.toUpperCase()}:
                  </span>
                  <span className="ml-1">{notif.message.slice(0, 50)}...</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Environment Variables */}
        <div>
          <strong>⚙️ Environment:</strong>
          <div className="ml-2 space-y-1">
            <div>Firebase Project: {import.meta.env.VITE_FIREBASE_PROJECT_ID || 'Not set'}</div>
            <div>Use Emulators: {import.meta.env.VITE_USE_FIREBASE_EMULATORS || 'false'}</div>
            <div>Mock Auth: {import.meta.env.VITE_USE_MOCK_AUTH || 'false'}</div>
          </div>
        </div>
      </div>
    </div>
  );
};