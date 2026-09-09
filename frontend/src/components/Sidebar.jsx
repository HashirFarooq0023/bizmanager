import { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { logout, reset } from '../redux/slices/authSlice';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useMode } from '../contexts/ModeContext';
import Logo from './Logo';
import {
  FiHome,
  FiShoppingCart,
  FiPackage,
  FiBookOpen,
  FiDollarSign,
  FiTrendingDown,
  FiBarChart2,
  FiFileText,
  FiShoppingBag,
  FiUsers,
  FiCreditCard,
  FiMoreHorizontal,
  FiGlobe,
  FiZap,
  FiSmile,
  FiLogOut,
  FiChevronDown
} from 'react-icons/fi';

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
  const { language, changeLanguage, isRtl } = useLanguage();
  const { mode, toggleMode, isAsan, isPro } = useMode();
  const { t } = useTranslation(['nav', 'common']);

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

  // ASAN MODE: 7 Clean, high-impact items
  const asanMenuItems = [
    {
      name: t('nav:dashboard'),
      path: '/dashboard',
      icon: <FiHome className="w-5 h-5 flex-shrink-0" />,
    },
    {
      name: t('nav:makeBill'),
      path: '/pos',
      icon: <FiShoppingCart className="w-5 h-5 flex-shrink-0 text-emerald-600 dark:text-emerald-400" />,
      highlight: true,
    },
    {
      name: t('nav:products'),
      path: '/inventory',
      icon: <FiPackage className="w-5 h-5 flex-shrink-0" />,
    },
    {
      name: t('nav:udhaarKhata'),
      path: '/udhaar',
      icon: <FiBookOpen className="w-5 h-5 flex-shrink-0 text-rose-600 dark:text-rose-400" />,
      badge: 'اہم',
    },
    {
      name: t('nav:cashInHand'),
      path: '/cashbank/cash-in-hand',
      icon: <FiDollarSign className="w-5 h-5 flex-shrink-0 text-amber-600 dark:text-amber-400" />,
    },
    {
      name: t('nav:expenses'),
      path: '/purchase/expenses',
      icon: <FiTrendingDown className="w-5 h-5 flex-shrink-0" />,
    },
    {
      name: t('nav:reports'),
      path: '/reports',
      icon: <FiBarChart2 className="w-5 h-5 flex-shrink-0" />,
    },
  ];

  // PRO MODE: Full comprehensive menu
  const proMenuItems = [
    {
      name: t('nav:dashboard'),
      path: '/dashboard',
      icon: <FiHome className="w-4 h-4 flex-shrink-0" />,
    },
    {
      name: t('nav:pos'),
      path: '/pos',
      icon: <FiShoppingCart className="w-4 h-4 flex-shrink-0" />,
    },
    {
      name: t('nav:udhaarKhata'),
      path: '/udhaar',
      icon: <FiBookOpen className="w-4 h-4 flex-shrink-0 text-rose-500" />,
      badge: 'نیا',
    },
    {
      name: t('nav:sales'),
      icon: <FiFileText className="w-4 h-4 flex-shrink-0" />,
      submenu: [
        { name: t('nav:salesInvoices'), path: '/sales/invoices' },
        { name: t('nav:salesOrders'), path: '/sales/orders' },
        { name: t('nav:quotations'), path: '/sales/estimates' },
        { name: t('nav:salesReturns'), path: '/sales/returned-items' },
        { name: t('nav:deliveryChallans'), path: '/sales/delivery-challan-list' },
      ],
    },
    {
      name: t('nav:purchases'),
      icon: <FiShoppingBag className="w-4 h-4 flex-shrink-0" />,
      submenu: [
        { name: t('nav:purchaseBills'), path: '/purchase/bills' },
        { name: t('nav:purchaseOrders'), path: '/purchase-orders' },
        { name: t('nav:purchaseReturns'), path: '/purchase/returns' },
        { name: t('nav:grn'), path: '/grns' },
      ],
    },
    {
      name: t('nav:inventory'),
      path: '/inventory',
      icon: <FiPackage className="w-4 h-4 flex-shrink-0" />,
    },
    {
      name: t('nav:parties'),
      icon: <FiUsers className="w-4 h-4 flex-shrink-0" />,
      submenu: [
        { name: t('nav:customers'), path: '/customers' },
        { name: t('nav:suppliers'), path: '/suppliers' },
      ],
    },
    {
      name: t('nav:finance'),
      icon: <FiCreditCard className="w-4 h-4 flex-shrink-0" />,
      submenu: [
        { name: t('nav:overview'), path: '/cashbank/position' },
        {
          name: t('nav:payments'),
          submenu: [
            { name: t('nav:paymentIn'), path: '/sales/payment-in-list' },
            { name: t('nav:paymentOut'), path: '/purchase/payment-out/list' },
          ],
        },
        { name: t('nav:expenses'), path: '/purchase/expenses' },
        { name: t('nav:cashAndBank'), path: '/cashbank/bank-accounts' },
        { name: t('nav:cheques'), path: '/cashbank/cheques' },
        { name: t('nav:loanAccounts'), path: '/cashbank/loan-accounts' },
      ],
    },
    {
      name: t('nav:reports'),
      path: '/reports',
      icon: <FiBarChart2 className="w-4 h-4 flex-shrink-0" />,
    },
    {
      name: t('nav:more'),
      icon: <FiMoreHorizontal className="w-4 h-4 flex-shrink-0" />,
      submenu: [
        {
          name: t('nav:marketing'),
          submenu: [
            { name: 'Google Business Profile', path: '/business/google-profile' },
            { name: 'WhatsApp Marketing', path: '/business/whatsapp-marketing' },
            { name: 'Marketing Tools', path: '/business/marketing-tools' },
            { name: 'Online Shop', path: '/business/online-shop' },
          ],
        },
        {
          name: t('nav:dataAndBackup'),
          submenu: [
            { name: t('nav:backup'), path: '/sync/backup' },
            { name: t('nav:restore'), path: '/sync/restore' },
            { name: t('nav:syncShare'), path: '/sync/share' },
          ],
        },
        {
          name: t('nav:utilities'),
          submenu: [
            { name: t('nav:barcodeGenerator'), path: '/utilities/barcode' },
            { name: t('nav:importItems'), path: '/utilities/import-items' },
            { name: t('nav:dataExport'), path: '/utilities/export' },
          ],
        },
        {
          name: t('nav:settings'),
          submenu: [
            { name: t('nav:businessSetup'), path: '/utilities/business-setup' },
            { name: t('nav:profileSettings'), path: '/profile-settings' },
          ],
        },
        {
          name: t('nav:approvals'),
          submenu: [
            { name: t('nav:myApprovals'), path: '/approvals' },
            { name: t('nav:approvalSettings'), path: '/approvals/settings' },
          ],
        },
      ],
    },
  ];

  const currentMenuItems = isAsan ? asanMenuItems : proMenuItems;

  // Helper functions for path and submenu active checks
  const isPathActive = (targetPath) => {
    if (!targetPath) return false;
    if (targetPath === '/dashboard' || targetPath === '/pos' || targetPath === '/udhaar') {
      return location.pathname === targetPath;
    }
    return location.pathname === targetPath || location.pathname.startsWith(targetPath + '/');
  };

  const isSubmenuActive = (subItems) => {
    if (!subItems) return false;
    return subItems.some((sub) => {
      if (sub.path) return isPathActive(sub.path);
      if (sub.submenu) return isSubmenuActive(sub.submenu);
      return false;
    });
  };

  // Auto expand active dropdowns on route change
  useEffect(() => {
    const currentPath = location.pathname;
    const updates = {};

    currentMenuItems.forEach((item) => {
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
      setExpandedMenus((prev) => ({ ...prev, ...updates }));
    }
  }, [location.pathname, isAsan]);

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

  const toggleSubmenu = (menuKey) => {
    if (navRef.current) {
      scrollPositionRef.current = navRef.current.scrollTop;
    }

    setExpandedMenus((prev) => {
      const isCurrentlyExpanded = prev[menuKey];
      return { ...prev, [menuKey]: !isCurrentlyExpanded };
    });
  };

  return (
    <>
      {/* Mobile Backdrop */}
      <div
        className={`fixed inset-0 bg-black/40 dark:bg-black/60 z-40 transition-opacity duration-200 lg:hidden print:hidden ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Sidebar Container */}
      <aside
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={`print:hidden fixed inset-y-0 z-50 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 flex flex-col shadow-sm dark:shadow-lg transition-all duration-200 ease-in-out ${
          isRtl
            ? 'right-0 border-l border-slate-200/80 dark:border-slate-800'
            : 'left-0 border-r border-slate-200/80 dark:border-slate-800'
        } ${
          isOpen
            ? 'translate-x-0'
            : isRtl
            ? 'translate-x-full'
            : '-translate-x-full'
        } lg:translate-x-0 ${isEffectivelyExpanded ? 'w-60' : 'w-16'}`}
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
                className="rounded-md p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800 focus:outline-none lg:hidden"
                aria-label="Close navigation menu"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </>
          ) : (
            <Link to="/dashboard" className="flex items-center justify-center w-full py-1" title="BizManager — A Product of MegaTrix Technologies">
              <Logo size="md" noContainer={true} showText={false} />
            </Link>
          )}
        </div>

        {/* Language & Mode Control Bar */}
        <div className="px-3 py-2 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/40 flex items-center justify-between gap-1 text-xs">
          {isEffectivelyExpanded ? (
            <>
              {/* Language Switcher */}
              <button
                type="button"
                onClick={() => changeLanguage(language === 'ur' ? 'en' : 'ur')}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 font-bold transition-all text-xs"
                title="Switch Language / زبان تبدیل کریں"
              >
                <FiGlobe className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400" />
                <span>{language === 'ur' ? 'English' : 'اردو'}</span>
              </button>

              {/* Mode Switcher - Real-time instant toggle */}
              <button
                type="button"
                onClick={toggleMode}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg font-bold text-xs transition-all border ${
                  isAsan
                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/40'
                    : 'border-violet-500 bg-violet-50 dark:bg-violet-950/50 text-violet-700 dark:text-violet-300 hover:bg-violet-100 dark:hover:bg-violet-900/40'
                }`}
                title="Switch Mode / موڈ تبدیل کریں"
              >
                {isAsan ? <FiSmile className="w-3.5 h-3.5 text-emerald-600" /> : <FiZap className="w-3.5 h-3.5 text-violet-600" />}
                <span>{isAsan ? (language === 'ur' ? 'آسان موڈ' : 'Asan Mode') : (language === 'ur' ? 'پرو موڈ' : 'Pro Mode')}</span>
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => changeLanguage(language === 'ur' ? 'en' : 'ur')}
              className="w-full flex items-center justify-center p-1 rounded-md text-slate-600 hover:bg-slate-200 dark:text-slate-300 dark:hover:bg-slate-800"
              title="Toggle Language"
            >
              <FiGlobe className="w-4 h-4" />
            </button>
          )}

          {/* Theme & Collapse Controls (Desktop) */}
          <div className="hidden lg:flex items-center gap-1">
            <button
              type="button"
              onClick={toggleTheme}
              className="p-1 rounded-md text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800 transition-colors"
              title="Toggle theme"
            >
              {theme === 'light' ? '🌙' : '☀️'}
            </button>
            <button
              type="button"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-1 rounded-md text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800 transition-colors"
              title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              <svg className={`w-3.5 h-3.5 ${isRtl ? 'scale-x-[-1]' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isCollapsed ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Navigation List */}
        <nav
          ref={navRef}
          className="flex-1 overflow-y-auto px-2 py-3 space-y-1 select-none scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700"
        >
          {currentMenuItems.map((item) => {
            const hasSubmenu = Boolean(item.submenu && item.submenu.length > 0);
            const isExpanded = Boolean(expandedMenus[item.name]);
            const isItemActive = hasSubmenu ? isSubmenuActive(item.submenu) : isPathActive(item.path);

            return (
              <div key={item.name} className="space-y-0.5">
                {hasSubmenu ? (
                  <>
                    <button
                      type="button"
                      onClick={() => toggleSubmenu(item.name)}
                      className={`w-full min-h-[44px] flex items-center justify-between px-3 py-2 text-sm font-semibold rounded-xl transition-colors ${
                        isItemActive
                          ? 'bg-violet-50 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300 font-bold'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {item.icon}
                        {isEffectivelyExpanded && (
                          <span className="truncate">{item.name}</span>
                        )}
                      </div>
                      {isEffectivelyExpanded && (
                        <FiChevronDown
                          className={`w-4 h-4 transition-transform duration-200 ${
                            isExpanded ? 'rotate-180' : ''
                          }`}
                        />
                      )}
                    </button>

                    {/* Submenu Dropdown */}
                    {isEffectivelyExpanded && isExpanded && (
                      <div className="ps-6 pe-2 py-1 space-y-1">
                        {item.submenu.map((sub) => {
                          const hasNested = Boolean(sub.submenu && sub.submenu.length > 0);
                          const isNestedExpanded = Boolean(expandedMenus[`${item.name}:${sub.name}`]);
                          const isSubActive = hasNested ? isSubmenuActive(sub.submenu) : isPathActive(sub.path);

                          return hasNested ? (
                            <div key={sub.name} className="space-y-1">
                              <button
                                type="button"
                                onClick={() => toggleSubmenu(`${item.name}:${sub.name}`)}
                                className={`w-full flex items-center justify-between px-2.5 py-1.5 text-xs font-semibold rounded-lg ${
                                  isSubActive
                                    ? 'text-violet-700 dark:text-violet-300 font-bold'
                                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                                }`}
                              >
                                <span>{sub.name}</span>
                                <FiChevronDown
                                  className={`w-3.5 h-3.5 transition-transform ${
                                    isNestedExpanded ? 'rotate-180' : ''
                                  }`}
                                />
                              </button>

                              {isNestedExpanded && (
                                <div className="ps-4 space-y-1">
                                  {sub.submenu.map((nested) => (
                                    <NavLink
                                      key={nested.name}
                                      to={nested.path}
                                      onClick={() => {
                                        if (window.innerWidth < 1024) onClose();
                                      }}
                                      className={({ isActive }) =>
                                        `block px-2 py-1 text-xs rounded-md ${
                                          isActive
                                            ? 'bg-violet-100 text-violet-800 dark:bg-violet-900/40 dark:text-violet-200 font-bold'
                                            : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                                        }`
                                      }
                                    >
                                      {nested.name}
                                    </NavLink>
                                  ))}
                                </div>
                              )}
                            </div>
                          ) : (
                            <NavLink
                              key={sub.name}
                              to={sub.path}
                              onClick={() => {
                                if (window.innerWidth < 1024) onClose();
                              }}
                              className={({ isActive }) =>
                                `block px-2.5 py-1.5 text-xs rounded-lg transition-colors ${
                                  isActive
                                    ? 'bg-violet-100 text-violet-800 dark:bg-violet-900/40 dark:text-violet-200 font-bold'
                                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800/40'
                                }`
                              }
                            >
                              {sub.name}
                            </NavLink>
                          );
                        })}
                      </div>
                    )}
                  </>
                ) : (
                  <NavLink
                    to={item.path}
                    onClick={() => {
                      if (window.innerWidth < 1024) onClose();
                    }}
                    className={({ isActive }) =>
                      `min-h-[46px] flex items-center justify-between px-3 py-2 rounded-xl transition-all font-semibold text-sm ${
                        isActive
                          ? 'bg-violet-700 text-white shadow-sm font-bold'
                          : item.highlight
                          ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 hover:bg-emerald-100'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                      }`
                    }
                    title={item.name}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {item.icon}
                      {isEffectivelyExpanded && (
                        <span className="truncate">{item.name}</span>
                      )}
                    </div>
                    {isEffectivelyExpanded && item.badge && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500 text-white">
                        {item.badge}
                      </span>
                    )}
                  </NavLink>
                )}
              </div>
            );
          })}
        </nav>

        {/* Bottom Section: Profile & Logout */}
        <div className="p-2.5 border-t border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/50">
          {isEffectivelyExpanded ? (
            <>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 bg-violet-600 dark:bg-violet-700 rounded-full flex items-center justify-center shadow-xs flex-shrink-0">
                  <span className="text-xs font-bold text-white">
                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-xs text-slate-900 dark:text-slate-100 truncate leading-tight">
                    {user?.name || 'User'}
                  </p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                    {user?.shopName || user?.email || ''}
                  </p>
                </div>
              </div>

              <div className="mb-1">
                <button
                  type="button"
                  onClick={onLogout}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-bold bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 rounded-xl transition-colors"
                >
                  <FiLogOut className="w-3.5 h-3.5" />
                  <span>{t('nav:logout')}</span>
                </button>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <button
                type="button"
                onClick={onLogout}
                className="p-2 bg-slate-200 hover:bg-rose-100 text-slate-700 hover:text-rose-600 dark:bg-slate-800 dark:text-slate-300 rounded-lg"
                title={t('nav:logout')}
              >
                <FiLogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;