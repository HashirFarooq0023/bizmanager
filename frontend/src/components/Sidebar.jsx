import { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout, reset } from '../redux/slices/authSlice';
import { useTheme } from '../contexts/ThemeContext';
import Logo from './Logo';

const Sidebar = ({
  isOpen = false,
  onClose = () => { },
  isCollapsed = false,
  setIsCollapsed = () => { },
  expandedMenus = {},
  setExpandedMenus = () => { }
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { theme, toggleTheme } = useTheme();

  const onLogout = () => {
    dispatch(logout());
    dispatch(reset());
    navigate('/login');
    onClose();
  };

  // Ref to preserve scroll position
  const navRef = useRef(null);
  const scrollPositionRef = useRef(0);

  // State for hover expansion when collapsed
  const [isHoverExpanded, setIsHoverExpanded] = useState(false);

  // Determine effective expanded state
  const isEffectivelyExpanded = !isCollapsed || isHoverExpanded;

  // Restore scroll position from localStorage on mount
  useEffect(() => {
    if (navRef.current) {
      const savedScrollPosition = localStorage.getItem('sidebarScrollPosition');
      if (savedScrollPosition) {
        navRef.current.scrollTop = parseInt(savedScrollPosition, 10);
        scrollPositionRef.current = parseInt(savedScrollPosition, 10);
      }
    }
  }, []);

  // Preserve scroll position when state changes
  useEffect(() => {
    if (navRef.current && scrollPositionRef.current >= 0) {
      requestAnimationFrame(() => {
        if (navRef.current) {
          navRef.current.scrollTop = scrollPositionRef.current;
          localStorage.setItem('sidebarScrollPosition', scrollPositionRef.current.toString());
        }
      });
    }
  }, [expandedMenus]);

  // Target 9 primary navigation items
  const menuItems = [
    {
      name: 'Dashboard',
      path: '/dashboard',
      icon: (
        <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
    },
    {
      name: 'POS',
      path: '/pos',
      icon: (
        <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      name: 'Sales',
      icon: (
        <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      submenu: [
        { name: 'Invoices', path: '/sales/invoices' },
        { name: 'Orders', path: '/sales/orders' },
        { name: 'Quotations', path: '/sales/estimates' },
        { name: 'Returns', path: '/sales/returned-items' }
      ]
    },
    {
      name: 'Purchases',
      icon: (
        <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      submenu: [
        { name: 'Bills', path: '/purchase/bills' },
        { name: 'Orders', path: '/purchase-orders' },
        { name: 'Returns', path: '/purchase/returns' }
      ]
    },
    {
      name: 'Inventory',
      path: '/inventory',
      icon: (
        <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
    },
    {
      name: 'Parties',
      icon: (
        <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      submenu: [
        { name: 'Customers', path: '/customers' },
        { name: 'Suppliers', path: '/suppliers' }
      ]
    },
    {
      name: 'Finance',
      icon: (
        <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      submenu: [
        { name: 'Overview', path: '/cashbank/position' },
        {
          name: 'Payments',
          submenu: [
            { name: 'Payment In', path: '/sales/payment-in-list' },
            { name: 'Payment Out', path: '/purchase/payment-out/list' }
          ]
        },
        { name: 'Expenses', path: '/purchase/expenses' },
        { name: 'Cash & Bank', path: '/cashbank/bank-accounts' }
      ]
    },
    {
      name: 'Reports',
      path: '/reports',
      icon: (
        <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
    },
    {
      name: 'More',
      icon: (
        <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
        </svg>
      ),
      submenu: [
        {
          name: 'Marketing',
          submenu: [
            { name: 'Google Business Profile', path: '/business/google-profile' },
            { name: 'WhatsApp Marketing', path: '/business/whatsapp-marketing' },
            { name: 'Marketing Tools', path: '/business/marketing-tools' },
            { name: 'Online Shop', path: '/business/online-shop' }
          ]
        },
        {
          name: 'Data & Backup',
          submenu: [
            { name: 'Backup', path: '/sync/backup' },
            { name: 'Restore', path: '/sync/restore' },
            { name: 'Sync & Share', path: '/sync/share' }
          ]
        },
        {
          name: 'Utilities',
          submenu: [
            { name: 'Barcode Generator', path: '/utilities/barcode' },
            { name: 'Import Items', path: '/utilities/import-items' },
            { name: 'Data Export', path: '/utilities/export' }
          ]
        },
        {
          name: 'Settings',
          submenu: [
            { name: 'Business Setup', path: '/utilities/business-setup' },
            { name: 'Profile Settings', path: '/profile-settings' }
          ]
        },
        {
          name: 'Approvals',
          submenu: [
            { name: 'My Approvals', path: '/approvals' },
            { name: 'Approval Settings', path: '/approvals/settings' }
          ]
        }
      ]
    }
  ];

  // Helper functions for path and submenu active checks
  const isPathActive = (targetPath) => {
    if (!targetPath) return false;
    if (targetPath === '/dashboard' || targetPath === '/pos') return location.pathname === targetPath;
    return location.pathname === targetPath || location.pathname.startsWith(targetPath + '/');
  };

  const isSubmenuActive = (subItems) => {
    if (!subItems) return false;
    return subItems.some(sub => {
      if (sub.path) return isPathActive(sub.path);
      if (sub.submenu) return isSubmenuActive(sub.submenu);
      return false;
    });
  };

  // Auto expand active dropdowns on route change
  useEffect(() => {
    const currentPath = location.pathname;
    const updates = {};

    menuItems.forEach((item) => {
      if (item.submenu) {
        let mainActive = false;
        item.submenu.forEach((sub) => {
          if (sub.path && (currentPath === sub.path || currentPath.startsWith(sub.path + '/'))) {
            mainActive = true;
          }
          if (sub.submenu) {
            let nestedActive = false;
            sub.submenu.forEach((nested) => {
              if (nested.path && (currentPath === nested.path || currentPath.startsWith(nested.path + '/'))) {
                nestedActive = true;
                mainActive = true;
              }
            });
            if (nestedActive) {
              updates[`${item.name}:${sub.name}`] = true;
            }
          }
        });
        if (mainActive) {
          updates[item.name] = true;
        }
      }
    });

    if (Object.keys(updates).length > 0) {
      setExpandedMenus(prev => ({ ...prev, ...updates }));
    }
  }, [location.pathname]);

  // Hover handlers for collapsed state
  const handleMouseEnter = () => {
    if (isCollapsed) {
      setIsHoverExpanded(true);
    }
  };

  const handleMouseLeave = () => {
    if (isCollapsed) {
      setIsHoverExpanded(false);
    }
  };

  // Toggle submenu expansion with scroll preservation
  const toggleSubmenu = (menuKey) => {
    if (navRef.current) {
      scrollPositionRef.current = navRef.current.scrollTop;
    }

    setExpandedMenus(prev => {
      const isCurrentlyExpanded = prev[menuKey];
      return { ...prev, [menuKey]: !isCurrentlyExpanded };
    });
  };

  return (
    <>
      {/* Mobile Backdrop */}
      <div
        className={`fixed inset-0 bg-black/40 dark:bg-black/60 z-40 transition-opacity duration-200 lg:hidden print:hidden ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />

      {/* Sidebar Container */}
      <aside
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={`print:hidden fixed inset-y-0 left-0 z-50 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 flex flex-col shadow-sm dark:shadow-lg border-r border-slate-200/80 dark:border-slate-800 transition-all duration-200 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'
          } lg:translate-x-0 ${isEffectivelyExpanded ? 'w-56' : 'w-14'
          }`}
      >
        {/* Header Branding */}
        <div className="p-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between min-h-[60px]">
          {isEffectivelyExpanded ? (
            <>
              <Link to="/dashboard" className="flex items-center">
                <Logo size="lg" hoverSlide={true} />
              </Link>
              <button
                type="button"
                onClick={onClose}
                className="rounded-md p-1 text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800 focus:outline-none lg:hidden"
                aria-label="Close navigation menu"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </>
          ) : (
            <Link to="/dashboard" className="flex items-center justify-center w-full py-1" title="BizManager by MegaTrix">
              <Logo size="md" noContainer={true} showText={false} />
            </Link>
          )}
        </div>

        {/* Toggle & Theme Control - Desktop Only */}
        <div className="hidden lg:flex items-center justify-between px-3 py-1.5 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-xs">
          {isEffectivelyExpanded && <span className="font-semibold tracking-wider text-[10px] uppercase text-slate-400 dark:text-slate-500">Navigation</span>}
          <div className={`flex items-center gap-1 ${!isEffectivelyExpanded ? 'w-full justify-center' : ''}`}>
            <button
              type="button"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-1 rounded-md text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800 transition-colors"
              aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isCollapsed ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                )}
              </svg>
            </button>
            <button
              type="button"
              onClick={toggleTheme}
              className="p-1 rounded-md text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800 transition-colors"
              aria-label="Toggle theme"
              title="Toggle theme"
            >
              {theme === 'light' ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Navigation Items List */}
        <nav
          ref={navRef}
          onScroll={(e) => {
            const scrollTop = e.currentTarget.scrollTop;
            scrollPositionRef.current = scrollTop;
            localStorage.setItem('sidebarScrollPosition', scrollTop.toString());
          }}
          className="flex-1 px-2 py-2 space-y-0.5 overflow-y-auto overflow-x-hidden select-none"
        >
          {menuItems.map((item) => {
            const isParentActive = isSubmenuActive(item.submenu);
            const isExpanded = expandedMenus[item.name];

            return (
              <div key={item.name}>
                {item.submenu ? (
                  <div>
                    {/* Primary Dropdown Header */}
                    <button
                      onClick={() => toggleSubmenu(item.name)}
                      className={`flex items-center w-full rounded-lg transition-colors duration-150 py-1.5 ${isEffectivelyExpanded ? 'justify-between px-2.5' : 'justify-center px-2'
                        } ${isParentActive
                          ? 'bg-violet-50 text-violet-700 font-semibold border-l-2 border-violet-600 dark:bg-violet-600/25 dark:text-violet-300 dark:border-l-0'
                          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800/80 dark:hover:text-white'
                        }`}
                      title={!isEffectivelyExpanded ? item.name : ''}
                    >
                      <div className={`flex items-center ${isEffectivelyExpanded ? 'space-x-2.5' : 'justify-center'}`}>
                        {item.icon}
                        {isEffectivelyExpanded && <span className="text-xs font-medium">{item.name}</span>}
                      </div>
                      {isEffectivelyExpanded && (
                        <svg
                          className={`w-3.5 h-3.5 opacity-70 transition-transform duration-150 ${isExpanded ? 'rotate-180' : ''}`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      )}
                    </button>

                    {/* Submenu Level 1 */}
                    {isExpanded && isEffectivelyExpanded && (
                      <div className="mt-0.5 space-y-0.5 pl-3 border-l border-slate-200 dark:border-slate-800 ml-3.5">
                        {item.submenu.map((sub) => {
                          const isSubActive = sub.path ? isPathActive(sub.path) : isSubmenuActive(sub.submenu);
                          const isSubExpanded = expandedMenus[`${item.name}:${sub.name}`];

                          if (sub.submenu) {
                            return (
                              <div key={sub.name}>
                                {/* Nested Dropdown Header */}
                                <button
                                  onClick={() => toggleSubmenu(`${item.name}:${sub.name}`)}
                                  className={`flex items-center justify-between w-full px-2 py-1 text-xs rounded-md transition-colors ${isSubActive
                                      ? 'text-violet-700 font-semibold dark:text-violet-300'
                                      : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100/70 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800/50'
                                    }`}
                                >
                                  <span>{sub.name}</span>
                                  <svg
                                    className={`w-3 h-3 opacity-60 transition-transform duration-150 ${isSubExpanded ? 'rotate-180' : ''}`}
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                  </svg>
                                </button>

                                {/* Submenu Level 2 */}
                                {isSubExpanded && (
                                  <div className="mt-0.5 space-y-0.5 pl-2 border-l border-slate-200 dark:border-slate-800 ml-2">
                                    {sub.submenu.map((nested) => (
                                      <NavLink
                                        key={nested.path}
                                        to={nested.path}
                                        onClick={onClose}
                                        className={({ isActive }) =>
                                          `block px-2 py-1 text-[11px] rounded-md transition-colors ${isActive
                                            ? 'bg-violet-600 text-white font-medium shadow-xs'
                                            : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800/50'
                                          }`
                                        }
                                      >
                                        {nested.name}
                                      </NavLink>
                                    ))}
                                  </div>
                                )}
                              </div>
                            );
                          }

                          return (
                            <NavLink
                              key={sub.path}
                              to={sub.path}
                              onClick={onClose}
                              className={({ isActive }) =>
                                `block px-2 py-1 text-xs rounded-md transition-colors ${isActive
                                  ? 'bg-violet-600 text-white font-medium shadow-xs'
                                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800/50'
                                }`
                              }
                            >
                              {sub.name}
                            </NavLink>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ) : (
                  /* Primary Direct NavLink */
                  <NavLink
                    to={item.path}
                    end={item.path === '/pos' || item.path === '/dashboard'}
                    onClick={onClose}
                    className={({ isActive }) =>
                      `flex items-center rounded-lg transition-colors duration-150 py-1.5 ${isEffectivelyExpanded ? 'space-x-2.5 px-2.5' : 'justify-center px-2'
                      } ${isActive
                        ? 'bg-violet-600 text-white font-semibold shadow-sm'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800/80 dark:hover:text-white'
                      }`
                    }
                    title={!isEffectivelyExpanded ? item.name : ''}
                  >
                    {item.icon}
                    {isEffectivelyExpanded && <span className="text-xs font-medium">{item.name}</span>}
                  </NavLink>
                )}
              </div>
            );
          })}
        </nav>

        {/* Bottom User Profile Section */}
        <div className="p-2.5 border-t border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/50">
          {isEffectivelyExpanded ? (
            <>
              <div className="flex items-center space-x-2 mb-2">
                <div className="w-7 h-7 bg-violet-600 dark:bg-violet-700 rounded-full flex items-center justify-center shadow-xs flex-shrink-0">
                  <span className="text-xs font-bold text-white">
                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-xs text-slate-900 dark:text-slate-100 truncate leading-tight">{user?.name || 'User'}</p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{user?.email || ''}</p>
                </div>
              </div>
              <button
                onClick={onLogout}
                className="w-full flex items-center justify-center space-x-1.5 px-2 py-1 text-xs bg-slate-200/80 hover:bg-rose-50 hover:text-rose-600 text-slate-700 border border-slate-300/80 dark:bg-slate-800 dark:hover:bg-rose-900/40 dark:hover:text-rose-300 dark:text-slate-300 dark:border-slate-700/60 rounded-lg transition-colors font-medium"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span>Logout</span>
              </button>
            </>
          ) : (
            <div className="flex flex-col items-center space-y-2">
              <div className="w-7 h-7 bg-violet-600 dark:bg-violet-700 rounded-full flex items-center justify-center shadow-xs" title={user?.name}>
                <span className="text-xs font-bold text-white">
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </span>
              </div>
              <button
                onClick={onLogout}
                className="p-1.5 bg-slate-200/80 hover:bg-rose-50 text-slate-700 hover:text-rose-600 border border-slate-300/80 dark:bg-slate-800 dark:hover:bg-rose-900/40 dark:text-slate-300 dark:hover:text-rose-300 dark:border-slate-700/60 rounded-lg transition-colors"
                title="Logout"
                aria-label="Logout"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          )}
          {isEffectivelyExpanded && (
            <div className="mt-2 text-center border-t border-slate-200 dark:border-slate-800 pt-1.5 space-y-0.5">
              <p className="text-[10px] text-slate-500 dark:text-slate-400">
                Developed by <span className="font-semibold text-slate-700 dark:text-slate-200">MegaTrix</span>
              </p>
              <p className="text-[9px] text-slate-500 dark:text-slate-400">
                Support: <a href="tel:03254567318" className="hover:underline text-slate-700 dark:text-slate-200 font-medium">0325-4567318</a>
              </p>
              <p className="text-[9px] text-slate-500 dark:text-slate-400 truncate" title="support@megatrixai.com">
                <a href="mailto:support@megatrixai.com" className="hover:underline text-slate-600 dark:text-slate-300">support@megatrixai.com</a>
              </p>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;