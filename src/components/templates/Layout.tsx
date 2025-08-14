import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useLocation } from 'react-router-dom';
import type { RootState, AppDispatch } from '../../store';
import { toggleSidebar } from '../../store/slices/uiSlice';
import { Button } from '../atoms';
import { OfflineStatusBar, FeedbackModal, ProfileDropdown } from '../molecules';
import { Footer } from '../organisms';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { t } = useTranslation();
  const location = useLocation();
  const dispatch = useDispatch<AppDispatch>();
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  
  const { user } = useSelector((state: RootState) => state.auth);
  const { sidebarOpen } = useSelector((state: RootState) => state.ui);

  // Check if current screen is mobile (< 1024px - lg breakpoint)
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    // Check initial screen size
    checkScreenSize();

    // Add event listener for window resize
    window.addEventListener('resize', checkScreenSize);

    // Cleanup event listener on component unmount
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Auto-close sidebar when switching from mobile to desktop
  useEffect(() => {
    if (!isMobile && sidebarOpen) {
      // On desktop, we want the sidebar to be in collapsed state by default
      // This prevents issues when switching from mobile to desktop
    }
  }, [isMobile, sidebarOpen, dispatch]);


  const navigationItems = [
    {
      name: t('navigation.dashboard'),
      href: '/dashboard',
      icon: '🏠'
    },
    {
      name: t('navigation.registrations'),
      href: '/registrations',
      icon: '📋'
    },
    {
      name: t('registration.newRegistration'),
      href: '/registrations/new',
      icon: '➕'
    },
    {
      name: t('certificate.title'),
      href: '/certificate',
      icon: '📜'
    },
    {
      name: t('navigation.settings'),
      href: '/settings',
      icon: '⚙️'
    }
  ];

  if (user?.role === 'admin') {
    navigationItems.push({
      name: t('navigation.monitoring'),
      href: '/monitoring',
      icon: '📊'
    });
    navigationItems.push({
      name: t('navigation.admin'),
      href: '/admin',
      icon: '🛡️'
    });
  }

  return (
    <div className="flex h-screen bg-gray-100 lg:overflow-hidden">
      {/* Mobile Sidebar Overlay - Glassmorphism */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-20 lg:hidden backdrop-blur-sm bg-black/20"
          style={{
            background: 'rgba(0, 0, 0, 0.1)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
          }}
          onClick={() => dispatch(toggleSidebar())}
        />
      )}
      
      {/* Sidebar */}
      <div className={`backdrop-blur-md shadow-xl transition-all duration-300 border-r border-white/20 ${
        // Mobile: Fixed overlay with glassmorphism, Desktop: Normal background
        'lg:relative lg:flex-shrink-0 lg:bg-white lg:backdrop-blur-none lg:border-r-gray-200 ' +
        'bg-white/95 lg:bg-white ' +
        (sidebarOpen 
          ? 'fixed lg:static w-64 h-full lg:h-auto inset-y-0 left-0 z-30' 
          : 'hidden lg:block lg:w-16')
      }`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-center h-16 bg-blue-600">
            <div className="text-white text-xl font-bold">
              <span className="lg:hidden">BirthLink</span>
              <span className="hidden lg:inline">{sidebarOpen ? 'BirthLink' : '👶'}</span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4">
            <ul className="space-y-2">
              {navigationItems.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <li key={item.href}>
                    <Link
                      to={item.href}
                      onClick={() => {
                        // Close sidebar on mobile when navigation link is clicked
                        if (isMobile && sidebarOpen) {
                          dispatch(toggleSidebar());
                        }
                      }}
                      className={`flex items-center p-2 rounded-md transition-colors ${
                        isActive
                          ? 'bg-blue-100 text-blue-700'
                          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                      }`}
                    >
                      <span className="text-lg">{item.icon}</span>
                      <span className="ml-3 text-sm font-medium lg:hidden">{item.name}</span>
                      {sidebarOpen && (
                        <span className="ml-3 text-sm font-medium hidden lg:inline">{item.name}</span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* User Info */}
          <div className="p-4 border-t border-gray-200">
            {sidebarOpen ? (
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {user?.profile.firstName.charAt(0)}
                    </span>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {user?.profile.firstName} {user?.profile.lastName}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {user?.role}
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex justify-center">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {user?.profile.firstName.charAt(0)}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden w-full lg:w-auto">
        {/* Offline Status Bar */}
        <OfflineStatusBar />
        
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between px-4 sm:px-6 py-4">
            <div className="flex items-center">
              <button
                onClick={() => dispatch(toggleSidebar())}
                className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 lg:hidden"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <button
                onClick={() => dispatch(toggleSidebar())}
                className="hidden lg:block p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <h1 className="ml-2 lg:ml-4 text-lg sm:text-xl font-semibold text-gray-900">
                <span className="hidden sm:inline">BirthLink Ghana</span>
                <span className="sm:hidden">BirthLink</span>
              </h1>
            </div>

            <div className="flex items-center space-x-2 sm:space-x-4">
              {/* Pilot Phase Badge */}
              {import.meta.env.VITE_PILOT_MODE === 'true' && (
                <div className="hidden sm:block px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
                  🧪 {t('pilot.badge', 'Pilot Phase 3')}
                </div>
              )}

              {/* Feedback Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setFeedbackModalOpen(true)}
                className="text-blue-600 hover:text-blue-700 text-xs sm:text-sm"
              >
                <span className="hidden sm:inline">📝 {t('feedback.button', 'Feedback')}</span>
                <span className="sm:hidden">📝</span>
              </Button>

              {/* Gmail-style Profile Dropdown */}
              <ProfileDropdown />
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto bg-gray-50 p-4 sm:p-6">
          {children}
        </main>

        {/* Footer */}
        <Footer />

        {/* Feedback Modal */}
        <FeedbackModal
          isOpen={feedbackModalOpen}
          onClose={() => setFeedbackModalOpen(false)}
          context="general"
        />
      </div>
    </div>
  );
};