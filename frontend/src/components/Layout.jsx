import { useEffect, useState } from 'react';
import Sidebar from './Sidebar';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useMode } from '../contexts/ModeContext';
import Logo from './Logo';
import ModeOnboardingModal from './ModeOnboardingModal';

const Layout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { language, changeLanguage, isRtl } = useLanguage();
  const { mode, toggleMode, isAsan } = useMode();

  // Initialize expandedMenus from localStorage
  const [expandedMenus, setExpandedMenus] = useState(() => {
    try {
      const saved = localStorage.getItem('sidebarExpandedMenus');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Persist expandedMenus to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('sidebarExpandedMenus', JSON.stringify(expandedMenus));
    } catch (error) {
      console.error('Failed to save sidebar state:', error);
    }
  }, [expandedMenus]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isSidebarOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isSidebarOpen]);

  return (
    <div className="min-h-screen bg-[#F7F7FA] dark:bg-[#0B0F14]">
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        expandedMenus={expandedMenus}
        setExpandedMenus={setExpandedMenus}
      />
      <ModeOnboardingModal />
      <div
        className={`flex flex-col min-h-screen transition-[margin] duration-300 ease-in-out ${
          isRtl
            ? isCollapsed
              ? 'lg:mr-16'
              : 'lg:mr-60'
            : isCollapsed
            ? 'lg:ml-16'
            : 'lg:ml-60'
        }`}
      >
        <header className="flex items-center justify-between border-b border-gray-200/80 dark:border-gray-800 bg-white dark:bg-gray-900 px-4 py-3 shadow-xs lg:hidden print:hidden sticky top-0 z-30">
          <button
            type="button"
            onClick={() => setIsSidebarOpen(true)}
            className="inline-flex items-center justify-center rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-2 text-gray-700 dark:text-gray-200 hover:bg-gray-50 focus:outline-none"
            aria-label="Open navigation menu"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          
          <Logo size="sm" noContainer={true} showText={true} showSubtitle={false} />

          <div className="flex items-center gap-1.5">
            {/* Quick Lang Switcher in Mobile Header */}
            <button
              type="button"
              onClick={() => changeLanguage(language === 'ur' ? 'en' : 'ur')}
              className="px-2 py-1 rounded-md text-xs font-bold border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-200"
              title="Switch Language"
            >
              {language === 'ur' ? 'English' : 'اردو'}
            </button>

            {/* Quick Mode Switcher in Mobile Header if Urdu */}
            {language === 'ur' && (
              <button
                type="button"
                onClick={toggleMode}
                className={`px-2 py-1 rounded-md text-xs font-bold border ${
                  isAsan
                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300'
                    : 'border-violet-500 bg-violet-50 dark:bg-violet-950/40 text-violet-700 dark:text-violet-300'
                }`}
                title="Switch Mode"
              >
                {isAsan ? 'آسان' : 'پرو'}
              </button>
            )}

            <button
              type="button"
              onClick={toggleTheme}
              className="inline-flex items-center justify-center rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-2 text-gray-700 dark:text-gray-200 hover:bg-gray-50 focus:outline-none"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? (
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              ) : (
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              )}
            </button>
          </div>
        </header>

        <main className="flex-1 w-full px-4 py-6 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;