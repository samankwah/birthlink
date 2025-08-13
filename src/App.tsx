import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { useTranslation } from 'react-i18next';
import { store, persistor } from './store';
import { useAuth } from './hooks/useAuth';
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
  Settings,
  CertificateGeneration 
} from './pages';
import './locales/i18n';

// Loading component for PersistGate
const Loading: React.FC = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
  </div>
);

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

          {/* Certificate Generation Route */}
          <Route path="/certificate" element={
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
          
          {/* Settings Route */}
          <Route path="/settings" element={
            <ProtectedRoute requiredRole="admin">
              <Layout>
                <Settings />
              </Layout>
            </ProtectedRoute>
          } />
          
          {/* Redirect root to dashboard */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          
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
        <AppRouter />
      </PersistGate>
    </Provider>
  );
};

export default App;
