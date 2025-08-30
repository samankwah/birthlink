import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { useTranslation } from 'react-i18next';
import { store, persistor } from './store';
import { ThemeProvider } from './contexts';
import { useAuth } from './hooks/useAuth';
import { indexedDBService } from './services/indexedDB';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Layout } from './components/templates/Layout';
import { NotificationSystem } from './components/organisms';
import { 
  Dashboard, 
  Login, 
  Register,
  ForgotPassword,
  Registrations, 
  NewRegistration, 
  Monitoring,
  UserManagement,
  Profile,
  UserSettings,
  AdminSettings,
  CertificateGeneration,
  CertificateList 
} from './pages';
import './locales/i18n';

// Loading component for PersistGate and IndexedDB
const Loading: React.FC = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
      <p className="text-gray-600">Initializing application...</p>
    </div>
  </div>
);

// IndexedDB Initializer Component
const IndexedDBProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isReady, setIsReady] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const initDB = async () => {
      try {
        await indexedDBService.init();
        setIsReady(true);
      } catch (err) {
        console.error('Failed to initialize IndexedDB:', err);
        setError(err instanceof Error ? err.message : 'Failed to initialize offline storage');
        setIsReady(true); // Continue anyway, offline features won't work
      }
    };

    initDB();
  }, []);

  if (!isReady) {
    return <Loading />;
  }

  if (error) {
    console.warn('IndexedDB initialization failed, continuing without offline features:', error);
  }

  return <>{children}</>;
};

// Auth Wrapper Component
const AuthWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  useAuth(); // Initialize auth listener
  return <>{children}</>;
};

// App Router Component
const AppRouter: React.FC = () => {
  const { i18n } = useTranslation();

  React.useEffect(() => {
    // Set document language
    document.documentElement.lang = i18n.language;
  }, [i18n.language]);

  return (
    <Router>
      <AuthWrapper>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          
          {/* Protected Routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          } />
          
          {/* Registration Routes */}
          <Route path="/registrations" element={
            <ProtectedRoute>
              <Layout>
                <Registrations />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/registrations/new" element={
            <ProtectedRoute requiredRole="registrar">
              <Layout>
                <NewRegistration />
              </Layout>
            </ProtectedRoute>
          } />

          {/* Certificate List Route (Original) */}
          <Route path="/certificate" element={
            <ProtectedRoute>
              <Layout>
                <CertificateList />
              </Layout>
            </ProtectedRoute>
          } />

          {/* Certificate Generation Route */}
          <Route path="/certificate/generate" element={
            <ProtectedRoute>
              <Layout>
                <CertificateGeneration />
              </Layout>
            </ProtectedRoute>
          } />

          {/* Monitoring Route */}
          <Route path="/monitoring" element={
            <ProtectedRoute requiredRole="admin">
              <Layout>
                <Monitoring />
              </Layout>
            </ProtectedRoute>
          } />
          
          {/* User Management Route */}
          <Route path="/users" element={
            <ProtectedRoute requiredRole="admin">
              <Layout>
                <UserManagement />
              </Layout>
            </ProtectedRoute>
          } />
          
          {/* User Profile Route */}
          <Route path="/profile" element={
            <ProtectedRoute>
              <Layout>
                <Profile />
              </Layout>
            </ProtectedRoute>
          } />
          
          {/* User Settings Route */}
          <Route path="/settings" element={
            <ProtectedRoute>
              <UserSettings />
            </ProtectedRoute>
          } />
          
          {/* Admin Settings Route */}
          <Route path="/admin/settings" element={
            <ProtectedRoute requiredRole="admin">
              <AdminSettings />
            </ProtectedRoute>
          } />
          
          {/* Legacy Settings Route - redirect to admin settings */}
          <Route path="/system/settings" element={
            <ProtectedRoute requiredRole="admin">
              <AdminSettings />
            </ProtectedRoute>
          } />
          
          {/* Redirect root to login if not authenticated, otherwise dashboard */}
          <Route path="/" element={
            <ProtectedRoute>
              <Navigate to="/dashboard" replace />
            </ProtectedRoute>
          } />
          
          {/* Catch all route */}
          <Route path="*" element={
            <div className="min-h-screen flex items-center justify-center">
              <div className="text-center">
                <h1 className="text-4xl font-bold text-gray-900">404</h1>
                <p className="mt-2 text-gray-600">Page not found</p>
              </div>
            </div>
          } />
        </Routes>
        
        {/* Global Notification System */}
        <NotificationSystem />
      </AuthWrapper>
    </Router>
  );
};

// Main App Component
const App: React.FC = () => {
  return (
    <Provider store={store}>
      <PersistGate loading={<Loading />} persistor={persistor}>
        <IndexedDBProvider>
          <ThemeProvider>
            <AppRouter />
          </ThemeProvider>
        </IndexedDBProvider>
      </PersistGate>
    </Provider>
  );
};

export default App;
