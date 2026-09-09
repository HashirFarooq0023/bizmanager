import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import Logo from '../components/Logo';
import {
  FiArrowRight,
  FiCheck,
  FiSearch,
  FiPhone,
  FiMail,
  FiShield,
  FiShoppingCart,
  FiBox,
  FiDollarSign,
  FiUsers,
  FiTrendingUp,
  FiChevronDown,
  FiSun,
  FiMoon,
  FiPrinter,
  FiPlus,
  FiMinus,
  FiTrash2,
  FiZap,
  FiMessageSquare,
  FiCheckCircle,
  FiPlay,
  FiGlobe
} from 'react-icons/fi';

const LandingPage = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { theme, toggleTheme } = useTheme();
  const { language, changeLanguage, isRtl } = useLanguage();
  const { t } = useTranslation(['landing', 'common']);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activePreviewTab, setActivePreviewTab] = useState('pos');
  const [faqCategory, setFaqCategory] = useState('all');
  const [faqSearch, setFaqSearch] = useState('');
  const [openFaq, setOpenFaq] = useState(0);

  // Interactive Demo State
  const [demoCart, setDemoCart] = useState([
    { id: 1, name: 'Samsung 24" LED Monitor', sku: 'MON-SAM-24', price: 24500, qty: 1, stock: 14 },
    { id: 2, name: 'Wireless Mechanical Keyboard', sku: 'KEY-MECH-W', price: 6800, qty: 1, stock: 28 }
  ]);
  const [checkoutFeedback, setCheckoutFeedback] = useState(false);
  const [analyticsPeriod, setAnalyticsPeriod] = useState('month');
  const [reminderFeedback, setReminderFeedback] = useState(null);

  // Contact Form State
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    phone: '',
    businessType: 'Retail Store',
    message: ''
  });
  const [contactSubmitted, setContactSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const scrollToSection = (id) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Demo Actions
  const updateCartQty = (id, delta) => {
    setDemoCart(prev =>
      prev
        .map(item => (item.id === id ? { ...item, qty: Math.max(1, item.qty + delta) } : item))
        .filter(item => item.qty > 0)
    );
  };

  const removeCartItem = (id) => {
    setDemoCart(prev => prev.filter(item => item.id !== id));
  };

  const addDemoScanItem = () => {
    const nextItem = {
      id: Date.now(),
      name: 'Logitech MX Master 3S Mouse',
      sku: 'LOG-MX-3S',
      price: 22500,
      qty: 1,
      stock: 3
    };
    setDemoCart(prev => [nextItem, ...prev]);
  };

  const handleDemoCheckout = () => {
    setCheckoutFeedback(true);
    setTimeout(() => setCheckoutFeedback(false), 3500);
  };

  const handleSendReminder = (customerName) => {
    setReminderFeedback(customerName);
    setTimeout(() => setReminderFeedback(null), 3000);
  };

  const handleContactSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setContactSubmitted(true);
      setContactForm({ name: '', email: '', phone: '', businessType: 'Retail Store', message: '' });
      setTimeout(() => setContactSubmitted(false), 6000);
    }, 700);
  };

  const cartSubtotal = demoCart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const cartTax = Math.round(cartSubtotal * 0.05);
  const cartTotal = cartSubtotal + cartTax;

  const faqs = [
    {
      cat: 'general',
      q: t('landing:faq.q1', "What is BizManager and who is it designed for?"),
      a: t('landing:faq.a1', "BizManager by MegaTrix is an all-in-one business operating system tailored for retail shops, wholesalers, supermarkets, hardware stores, electronics shops, and distributors. It merges POS sales, inventory control, party ledgers, and profit reporting into one fast, ultra-responsive workspace.")
    },
    {
      cat: 'pos',
      q: t('landing:faq.q2', "Does BizManager work with my barcode scanner and thermal receipt printer?"),
      a: t('landing:faq.a2', "Yes! BizManager natively supports standard USB and Bluetooth barcode scanners, cash drawers, and ESC/POS thermal printers (both 80mm & 58mm). You can scan items in milliseconds, split cash/card payments, and print customer bills instantly.")
    },
    {
      cat: 'customers',
      q: t('landing:faq.q3', "How does customer credit & udhaar tracking work?"),
      a: t('landing:faq.a3', "BizManager maintains automatic double-entry credit ledgers for every customer. When a customer buys on credit, their balance updates automatically. You can set customized credit limits, view aging dues, and dispatch one-click payment reminders via WhatsApp or SMS.")
    },
    {
      cat: 'inventory',
      q: t('landing:faq.q4', "Can I manage low stock alerts and barcode generation?"),
      a: t('landing:faq.a4', "Absolutely. Set minimum reorder points for any product. When stock drops below the safety threshold, BizManager highlights it with a luminous alert. You can also generate and print standard barcode labels directly from your inventory screen.")
    }
  ];

  const filteredFaqs = faqs.filter(faq => {
    const matchesCat = faqCategory === 'all' || faq.cat === faqCategory;
    const matchesSearch =
      faq.q.toLowerCase().includes(faqSearch.toLowerCase()) ||
      faq.a.toLowerCase().includes(faqSearch.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#080B11] text-slate-900 dark:text-slate-100 font-sans selection:bg-violet-600 selection:text-white transition-colors duration-300 relative overflow-x-hidden">

      {/* Accessibility Skip Link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-violet-600 focus:text-white focus:rounded-xl focus:shadow-xl focus:outline-none"
      >
        {language === 'ur' ? 'مرکزی مواد پر جائیں' : 'Skip to main content'}
      </a>

      {/* Ambient Lighting Spotlights (The Impactable UI) */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[700px] sm:w-[900px] h-[450px] bg-gradient-to-b from-violet-600/15 via-indigo-500/10 to-transparent blur-[140px] pointer-events-none -z-10 animate-ambient-glow max-w-[100vw]" />
      <div className="fixed -bottom-40 -right-40 w-72 sm:w-[550px] h-72 sm:h-[550px] bg-purple-600/10 dark:bg-purple-900/15 blur-[120px] sm:blur-[160px] pointer-events-none -z-10 max-w-[100vw]" />

      {/* Frosted Glass Floating Navbar */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-[#080B11]/80 backdrop-blur-xl border-b border-slate-200/70 dark:border-white/[0.07] transition-all duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">

          {/* MegaTrix Logo (Preserved Brand Identity) */}
          <div className="flex items-center cursor-pointer select-none" onClick={() => navigate('/')}>
            <Logo size="xl" showText={true} showSubtitle={true} />
          </div>

          {/* Desktop & Tablet Nav Links */}
          <nav className="hidden md:flex items-center space-x-3 lg:space-x-7 text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-zinc-300 font-urdu">
            <button
              onClick={() => scrollToSection('features')}
              className="hover:text-violet-600 dark:hover:text-violet-400 transition-colors duration-150 cursor-pointer"
            >
              {t('landing:nav.features')}
            </button>
            <button
              onClick={() => scrollToSection('demo')}
              className="hover:text-violet-600 dark:hover:text-violet-400 transition-colors duration-150 cursor-pointer flex items-center gap-1.5"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-violet-600 animate-pulse" />
              {t('landing:nav.demo')}
            </button>
            <button
              onClick={() => scrollToSection('faq')}
              className="hover:text-violet-600 dark:hover:text-violet-400 transition-colors duration-150 cursor-pointer"
            >
              {t('landing:nav.faq')}
            </button>
            <button
              onClick={() => scrollToSection('contact')}
              className="hover:text-violet-600 dark:hover:text-violet-400 transition-colors duration-150 cursor-pointer"
            >
              {t('landing:nav.contact')}
            </button>
          </nav>

          {/* Header Action Controls */}
          <div className="hidden md:flex items-center space-x-2 lg:space-x-3 flex-shrink-0">
            {/* Language Switcher Pill */}
            <button
              type="button"
              onClick={() => changeLanguage(language === 'ur' ? 'en' : 'ur')}
              className="px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100/90 dark:bg-white/[0.07] border border-slate-200/80 dark:border-white/[0.1] text-slate-800 dark:text-zinc-200 hover:bg-slate-200 dark:hover:bg-white/[0.15] transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
              title="Switch Language / زبان تبدیل کریں"
            >
              <FiGlobe className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400" />
              <span>{language === 'ur' ? 'English' : 'اردو'}</span>
            </button>

            {/* Theme Toggle Button (Tactile micro-interaction) */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-white bg-slate-100/80 dark:bg-white/[0.05] border border-slate-200/80 dark:border-white/[0.08] hover:scale-105 active:scale-95 transition-all duration-150 cursor-pointer"
              title="Toggle Light / Dark Mode"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? (
                <FiMoon className="w-4 h-4 text-slate-700" />
              ) : (
                <FiSun className="w-4 h-4 text-amber-400" />
              )}
            </button>

            {user ? (
              <button
                onClick={() => navigate('/dashboard')}
                className="px-3.5 sm:px-4 py-2 text-xs font-bold text-white bg-violet-600 hover:bg-violet-500 active:scale-[0.98] rounded-xl shadow-md shadow-violet-600/25 border border-white/20 transition-all duration-150 cursor-pointer flex items-center gap-1.5 font-urdu"
              >
                <span>{t('landing:nav.dashboard')}</span>
                <FiArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <>
                <button
                  onClick={() => navigate('/login')}
                  className="px-2.5 sm:px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-zinc-200 hover:text-violet-600 dark:hover:text-violet-400 active:scale-95 transition-all duration-150 cursor-pointer font-urdu"
                >
                  {t('landing:nav.signIn')}
                </button>
                <button
                  onClick={() => navigate('/register')}
                  className="relative group px-3.5 sm:px-4 py-2 text-xs font-bold text-white bg-gradient-to-b from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 active:scale-[0.98] rounded-xl shadow-md shadow-violet-600/25 border border-white/20 transition-all duration-150 cursor-pointer overflow-hidden font-urdu"
                >
                  <span className="relative z-10 flex items-center gap-1.5">
                    <span>{t('landing:nav.getStarted')}</span>
                    <FiArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform duration-150" />
                  </span>
                </button>
              </>
            )}
          </div>

          {/* Mobile Action & Menu Trigger */}
          <div className="flex md:hidden items-center gap-1.5">
            <button
              type="button"
              onClick={() => changeLanguage(language === 'ur' ? 'en' : 'ur')}
              className="px-2 py-1.5 rounded-xl text-xs font-bold bg-slate-100/90 dark:bg-white/[0.07] border border-slate-200/80 dark:border-white/[0.1] text-slate-800 dark:text-zinc-200 cursor-pointer"
              title="Switch Language / زبان تبدیل کریں"
            >
              <FiGlobe className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400" />
            </button>
            <button
              onClick={toggleTheme}
              className="p-2 text-slate-500 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-white/[0.06] rounded-xl border border-transparent dark:border-white/[0.06]"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? <FiMoon className="w-4 h-4" /> : <FiSun className="w-4 h-4 text-amber-400" />}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-700 dark:text-zinc-200 hover:bg-slate-100 dark:hover:bg-white/[0.06] rounded-xl"
              aria-label="Toggle menu"
            >
              <div className="w-5 h-4 flex flex-col justify-between">
                <span className={`h-0.5 w-full bg-current rounded-full transition-transform ${mobileMenuOpen ? 'rotate-45 translate-y-1.5' : ''}`} />
                <span className={`h-0.5 w-full bg-current rounded-full transition-opacity ${mobileMenuOpen ? 'opacity-0' : ''}`} />
                <span className={`h-0.5 w-full bg-current rounded-full transition-transform ${mobileMenuOpen ? '-rotate-45 -translate-y-1.5' : ''}`} />
              </div>
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-slate-200/80 dark:border-white/[0.08] bg-white/95 dark:bg-[#0B0F19]/95 backdrop-blur-2xl px-5 pt-3 pb-6 space-y-3">
            <button onClick={() => scrollToSection('features')} className="block w-full text-start py-2 text-sm font-semibold text-slate-700 dark:text-zinc-200">
              {t('landing:nav.features')}
            </button>
            <button onClick={() => scrollToSection('demo')} className="block w-full text-start py-2 text-sm font-semibold text-slate-700 dark:text-zinc-200">
              {t('landing:nav.demo')}
            </button>
            <button onClick={() => scrollToSection('faq')} className="block w-full text-start py-2 text-sm font-semibold text-slate-700 dark:text-zinc-200">
              {t('landing:nav.faq')}
            </button>
            <button onClick={() => scrollToSection('contact')} className="block w-full text-start py-2 text-sm font-semibold text-slate-700 dark:text-zinc-200">
              {t('landing:nav.contact')}
            </button>
            <div className="pt-3 border-t border-slate-200/80 dark:border-white/[0.08] flex flex-col gap-2.5">
              {/* Mobile Language Switcher */}
              <button
                type="button"
                onClick={() => changeLanguage(language === 'ur' ? 'en' : 'ur')}
                className="w-full py-2.5 px-3 flex items-center justify-center gap-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-white/[0.06] text-slate-800 dark:text-zinc-200 border border-slate-200 dark:border-white/[0.08]"
              >
                <FiGlobe className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                <span>{language === 'ur' ? 'Switch to English' : 'اردو میں دیکھیں'}</span>
              </button>
              {user ? (
                <button
                  onClick={() => navigate('/dashboard')}
                  className="w-full py-2.5 text-center text-xs font-bold text-white bg-violet-600 rounded-xl"
                >
                  {t('landing:nav.dashboard')} →
                </button>
              ) : (
                <>
                  <button
                    onClick={() => navigate('/login')}
                    className="w-full py-2.5 text-center text-xs font-semibold text-slate-700 dark:text-zinc-200 bg-slate-100 dark:bg-white/[0.06] rounded-xl"
                  >
                    {t('landing:nav.signIn')}
                  </button>
                  <button
                    onClick={() => navigate('/register')}
                    className="w-full py-2.5 text-center text-xs font-bold text-white bg-violet-600 rounded-xl"
                  >
                    {t('landing:nav.getStarted')} →
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Hero Section (The Impactable Visual Anchor) */}
      <section id="main-content" className="relative pt-16 sm:pt-24 pb-20 sm:pb-28 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">

          {/* Product Announcement Pill */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/10 dark:bg-violet-950/40 border border-violet-500/20 dark:border-violet-500/30 mb-8 backdrop-blur-md shadow-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse" />
            <span className="text-xs sm:text-sm font-semibold text-violet-700 dark:text-violet-300 tracking-wide font-urdu">
              {t('landing:hero.badge')}
            </span>
          </div>

          {/* Main Headline */}
          <h1 className="hero-headline text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 dark:text-white max-w-4xl mx-auto leading-[1.18] sm:leading-[1.15] font-urdu">
            {t('landing:hero.title')}{' '}
            <span className="hero-gradient-brand bg-gradient-to-r from-violet-600 via-indigo-500 to-purple-600 dark:from-violet-400 dark:via-indigo-300 dark:to-purple-400 bg-clip-text text-transparent">
              {t('landing:hero.brandName')}
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mt-6 text-base sm:text-lg lg:text-xl text-slate-600 dark:text-zinc-300 max-w-3xl mx-auto leading-[2.1] font-normal font-urdu">
            {t('landing:hero.subtitle')}
          </p>

          {/* Catalyst Actions */}
          <div className="mt-8 sm:mt-9 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-3.5">
            <button
              onClick={() => navigate(user ? '/dashboard' : '/register')}
              className="relative group w-full sm:w-auto px-6 sm:px-8 py-3.5 sm:py-4 text-sm sm:text-base font-bold text-white bg-gradient-to-b from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 rounded-xl shadow-lg shadow-violet-600/30 border border-white/20 transition-all duration-150 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer overflow-hidden font-urdu"
            >
              <span className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-[300%] transition-transform duration-700 ease-in-out pointer-events-none" />
              <span>{user ? t('landing:nav.dashboard') : t('landing:hero.startTrial')}</span>
              <FiArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>

            <button
              onClick={() => scrollToSection('demo')}
              className="w-full sm:w-auto px-6 sm:px-7 py-3.5 sm:py-4 text-sm sm:text-base font-semibold text-slate-700 dark:text-zinc-200 bg-white/80 dark:bg-white/[0.05] border border-slate-200/80 dark:border-white/[0.08] hover:bg-slate-100 dark:hover:bg-white/[0.08] hover:border-slate-300 dark:hover:border-white/15 rounded-xl shadow-xs transition-all duration-150 active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer backdrop-blur-md font-urdu"
            >
              <FiPlay className="w-4 h-4 text-violet-600 dark:text-violet-400" />
              <span>{t('landing:hero.exploreDemo')}</span>
            </button>
          </div>

          {/* Quick Pillar Checklist */}
          <div className="mt-6 sm:mt-8 flex flex-wrap justify-center items-center gap-y-2 gap-x-4 sm:gap-x-7 text-xs sm:text-sm md:text-base font-medium text-slate-500 dark:text-zinc-400 font-urdu">
            <div className="flex items-center gap-1.5">
              <FiCheckCircle className="w-4 h-4 text-emerald-500" />
              <span>{t('landing:hero.pillarPos')}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <FiCheckCircle className="w-4 h-4 text-emerald-500" />
              <span>{t('landing:hero.pillarUdhaar')}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <FiCheckCircle className="w-4 h-4 text-emerald-500" />
              <span>{t('landing:hero.pillarStock')}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <FiCheckCircle className="w-4 h-4 text-emerald-500" />
              <span>{t('landing:hero.pillarProfit')}</span>
            </div>
          </div>

        </div>
      </section>

      {/* Interactive Live App Sandbox (The Impactable Interactive Demo) */}
      <section id="demo" className="py-14 sm:py-20 bg-slate-100/60 dark:bg-[#07090F]/80 border-y border-slate-200/80 dark:border-white/[0.08] relative">
        <div className="max-w-6xl mx-auto px-3.5 sm:px-6 lg:px-8">

          <div className="text-center mb-8 sm:mb-10">
            <div className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold uppercase tracking-widest text-violet-600 dark:text-violet-400 mb-2 font-urdu">
              <FiZap className="w-4 h-4" />
              <span>{t('landing:demo.badge')}</span>
            </div>
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-900 dark:text-white font-urdu">
              {t('landing:demo.title')}
            </h2>
            <p className="text-xs sm:text-sm md:text-base text-slate-500 dark:text-zinc-400 mt-2 max-w-xl mx-auto leading-relaxed font-urdu">
              {t('landing:demo.subtitle')}
            </p>
          </div>

          {/* Interactive Browser Frame (Hairline Glassmorphic Surface) */}
          <div className="rounded-2xl sm:rounded-3xl shadow-[0_4px_24px_rgba(0,0,0,0.06),0_24px_48px_rgba(0,0,0,0.12)] border border-slate-200/90 dark:border-white/[0.08] bg-white dark:bg-[#0A0D15] overflow-hidden backdrop-blur-xl">

            {/* Browser Window Header */}
            <div className="px-3.5 sm:px-6 py-3 sm:py-3.5 bg-slate-100/90 dark:bg-zinc-950/80 border-b border-slate-200/80 dark:border-white/[0.06] flex flex-wrap items-center justify-between gap-2.5 sm:gap-3">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 sm:w-3 h-2.5 sm:h-3 rounded-full bg-rose-500/80 inline-block" />
                <span className="w-2.5 sm:w-3 h-2.5 sm:h-3 rounded-full bg-amber-500/80 inline-block" />
                <span className="w-2.5 sm:w-3 h-2.5 sm:h-3 rounded-full bg-emerald-500/80 inline-block" />
                <span className="ml-2 sm:ml-3 px-2 sm:px-3 py-0.5 rounded-md bg-white/70 dark:bg-white/[0.05] text-[10px] sm:text-[11px] font-mono text-slate-500 dark:text-zinc-400 hidden sm:inline-block border border-slate-200/60 dark:border-white/[0.05]">
                  bizmanager.megatrixai.com/live-demo
                </span>
              </div>

              {/* Demo Mode Tabs (Tactile sliding selection, responsive touch-scrollable) */}
              <div className="flex items-center bg-slate-200/70 dark:bg-white/[0.06] p-1 rounded-xl gap-1 text-xs sm:text-sm font-semibold font-urdu overflow-x-auto no-scrollbar max-w-full">
                <button
                  onClick={() => setActivePreviewTab('pos')}
                  className={`px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-lg transition-all duration-150 cursor-pointer active:scale-95 whitespace-nowrap ${
                    activePreviewTab === 'pos'
                      ? 'bg-white dark:bg-violet-600 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {t('landing:demo.tabPos')}
                </button>
                <button
                  onClick={() => setActivePreviewTab('inventory')}
                  className={`px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-lg transition-all duration-150 cursor-pointer active:scale-95 whitespace-nowrap ${
                    activePreviewTab === 'inventory'
                      ? 'bg-white dark:bg-violet-600 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {t('landing:demo.tabInventory')}
                </button>
                <button
                  onClick={() => setActivePreviewTab('ledgers')}
                  className={`px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-lg transition-all duration-150 cursor-pointer active:scale-95 whitespace-nowrap ${
                    activePreviewTab === 'ledgers'
                      ? 'bg-white dark:bg-violet-600 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {t('landing:demo.tabUdhaar')}
                </button>
                <button
                  onClick={() => setActivePreviewTab('analytics')}
                  className={`px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-lg transition-all duration-150 cursor-pointer active:scale-95 whitespace-nowrap ${
                    activePreviewTab === 'analytics'
                      ? 'bg-white dark:bg-violet-600 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {t('landing:demo.tabAnalytics')}
                </button>
              </div>
            </div>

            {/* Tab View Canvas */}
            <div className="p-3.5 sm:p-6 md:p-8 bg-slate-50/40 dark:bg-transparent min-h-[420px] transition-all">

              {/* TAB 1: POS TERMINAL */}
              {activePreviewTab === 'pos' && (
                <div className="space-y-5 sm:space-y-6 font-urdu">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 dark:border-white/[0.08] pb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                          {t('landing:demo.posTitle')}
                        </h3>
                        <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[11px] font-semibold">
                          {t('landing:demo.activeCounter')}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                        {t('landing:demo.posSub')}
                      </p>
                    </div>

                    <button
                      onClick={addDemoScanItem}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-violet-50 dark:bg-violet-950/60 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-800/60 hover:bg-violet-100 active:scale-95 transition cursor-pointer self-start sm:self-auto"
                    >
                      <FiPlus className="w-3.5 h-3.5" />
                      <span>{t('landing:demo.simulateScan')}</span>
                    </button>
                  </div>

                  {/* Checkout Feedback Alert */}
                  {checkoutFeedback && (
                    <div className="p-3.5 sm:p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 animate-fade-in">
                      <div className="flex items-center gap-2.5">
                        <FiPrinter className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                        <div>
                          <p className="text-xs font-bold text-emerald-800 dark:text-emerald-300">
                            {t('landing:demo.checkoutSuccess')}
                          </p>
                          <p className="text-[11px] text-emerald-700 dark:text-emerald-400 font-mono">
                            Bill #{Math.floor(1000 + Math.random() * 9000)} • ESC/POS 80mm
                          </p>
                        </div>
                      </div>
                      <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 self-end sm:self-auto">
                        {t('landing:demo.paid')} Rs. {cartTotal.toLocaleString()}
                      </span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-start">
                    {/* Cart Items List */}
                    <div className="lg:col-span-7 space-y-3">
                      {demoCart.length === 0 ? (
                        <div className="p-8 text-center rounded-xl border border-dashed border-slate-300 dark:border-zinc-800 text-slate-400">
                          <p className="text-xs font-semibold">{t('landing:demo.cartEmpty')}</p>
                          <button
                            onClick={addDemoScanItem}
                            className="mt-2 text-xs font-bold text-violet-600 dark:text-violet-400 hover:underline"
                          >
                            {t('landing:demo.clickScan')}
                          </button>
                        </div>
                      ) : (
                        demoCart.map(item => (
                          <div
                            key={item.id}
                            className="p-3 sm:p-3.5 bg-white dark:bg-zinc-900/80 rounded-xl border border-slate-200/80 dark:border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 shadow-xs hover:border-violet-500/40 transition duration-150"
                          >
                            <div className="min-w-0 flex-1">
                              <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                                {item.name}
                              </p>
                              <p className="text-[11px] text-slate-500 dark:text-zinc-400 font-mono mt-0.5">
                                SKU: {item.sku} • {t('landing:demo.inStock')} {item.stock}
                              </p>
                            </div>

                            {/* Quantity Controls & Price */}
                            <div className="flex items-center justify-between sm:justify-end gap-2.5 w-full sm:w-auto">
                              <div className="flex items-center border border-slate-200 dark:border-zinc-800 rounded-lg overflow-hidden bg-slate-50 dark:bg-zinc-950">
                                <button
                                  onClick={() => updateCartQty(item.id, -1)}
                                  className="p-1.5 text-slate-600 dark:text-zinc-400 hover:bg-slate-200 dark:hover:bg-zinc-800 transition"
                                >
                                  <FiMinus className="w-3 h-3" />
                                </button>
                                <span className="px-2.5 text-xs font-mono font-bold text-slate-900 dark:text-white tabular-nums">
                                  {item.qty}
                                </span>
                                <button
                                  onClick={() => updateCartQty(item.id, 1)}
                                  className="p-1.5 text-slate-600 dark:text-zinc-400 hover:bg-slate-200 dark:hover:bg-zinc-800 transition"
                                >
                                  <FiPlus className="w-3 h-3" />
                                </button>
                              </div>

                              <div className="text-right min-w-[85px]">
                                <span className="text-xs sm:text-sm font-bold font-mono text-slate-900 dark:text-white tabular-nums">
                                  Rs. {(item.price * item.qty).toLocaleString()}
                                </span>
                              </div>

                              <button
                                onClick={() => removeCartItem(item.id)}
                                className="p-1.5 text-slate-400 hover:text-rose-500 transition cursor-pointer"
                                title="Remove item"
                              >
                                <FiTrash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Order Summary Card */}
                    <div className="lg:col-span-5 bg-white dark:bg-zinc-900/90 p-5 rounded-2xl border border-slate-200/80 dark:border-white/[0.08] shadow-sm space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-white/[0.08] pb-3">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                          {t('landing:demo.cartSummary')}
                        </span>
                        <span className="text-xs font-mono text-slate-400">
                          {t('landing:demo.itemsCount', { count: demoCart.reduce((sum, i) => sum + i.qty, 0) })}
                        </span>
                      </div>

                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between text-slate-600 dark:text-zinc-400">
                          <span>{t('landing:demo.subtotal')}</span>
                          <span className="font-mono tabular-nums font-semibold text-slate-900 dark:text-white">
                            Rs. {cartSubtotal.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between text-slate-600 dark:text-zinc-400">
                          <span>{t('landing:demo.salesTax')}</span>
                          <span className="font-mono tabular-nums font-semibold text-slate-900 dark:text-white">
                            Rs. {cartTax.toLocaleString()}
                          </span>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-slate-200/80 dark:border-white/[0.08] flex justify-between items-baseline">
                        <span className="text-xs font-bold uppercase text-slate-900 dark:text-white">
                          {t('landing:demo.totalAmount')}
                        </span>
                        <span className="text-2xl font-extrabold font-mono text-violet-600 dark:text-violet-400 tabular-nums">
                          Rs. {cartTotal.toLocaleString()}
                        </span>
                      </div>

                      <button
                        onClick={handleDemoCheckout}
                        disabled={demoCart.length === 0}
                        className="w-full py-3 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white font-bold rounded-xl text-xs sm:text-sm shadow-md shadow-violet-600/20 active:scale-[0.98] transition duration-150 cursor-pointer flex items-center justify-center gap-2"
                      >
                        <FiPrinter className="w-4 h-4" />
                        <span>{t('landing:demo.checkoutBtn')}</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: INVENTORY STOCK */}
              {activePreviewTab === 'inventory' && (
                <div className="space-y-4 font-urdu">
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b border-slate-200/80 dark:border-white/[0.08] pb-3">
                    <div>
                      <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                        {t('landing:demo.inventoryTitle')}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-zinc-400">
                        {t('landing:demo.inventorySub')}
                      </p>
                    </div>
                    <span className="px-2.5 py-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-xs font-semibold rounded-lg w-fit">
                      {t('landing:demo.lowStockWarning')}
                    </span>
                  </div>

                  <div className="overflow-x-auto rounded-xl border border-slate-200/80 dark:border-white/[0.08]">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-100 dark:bg-zinc-950/80 text-slate-600 dark:text-zinc-300 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200 dark:border-white/[0.06]">
                        <tr>
                          <th className="p-3">{t('landing:demo.thProductName')}</th>
                          <th className="p-3">{t('landing:demo.thSku')}</th>
                          <th className="p-3">{t('landing:demo.thStockUnits')}</th>
                          <th className="p-3">{t('landing:demo.thPurchaseRate')}</th>
                          <th className="p-3">{t('landing:demo.thSellingPrice')}</th>
                          <th className="p-3">{t('landing:demo.thStatus')}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200/70 dark:divide-white/[0.05] text-slate-700 dark:text-zinc-200 bg-white dark:bg-transparent">
                        <tr className="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition">
                          <td className="p-3 font-semibold text-slate-900 dark:text-white">Logitech MX Master 3S</td>
                          <td className="p-3 font-mono text-slate-500">LOG-MX-3S</td>
                          <td className="p-3 font-mono tabular-nums font-bold text-rose-600 dark:text-rose-400">3 {t('landing:demo.left')}</td>
                          <td className="p-3 font-mono tabular-nums">Rs. 18,000</td>
                          <td className="p-3 font-mono tabular-nums font-bold">Rs. 22,500</td>
                          <td className="p-3">
                            <span className="px-2 py-0.5 bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 text-[10px] font-bold rounded-md">
                              {t('landing:demo.statusReorder')}
                            </span>
                          </td>
                        </tr>
                        <tr className="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition">
                          <td className="p-3 font-semibold text-slate-900 dark:text-white">Dell UltraSharp 27" 4K Monitor</td>
                          <td className="p-3 font-mono text-slate-500">DEL-U27-4K</td>
                          <td className="p-3 font-mono tabular-nums font-bold text-emerald-600 dark:text-emerald-400">42 {t('landing:demo.left')}</td>
                          <td className="p-3 font-mono tabular-nums">Rs. 85,000</td>
                          <td className="p-3 font-mono tabular-nums font-bold">Rs. 102,000</td>
                          <td className="p-3">
                            <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[10px] font-bold rounded-md">
                              {t('landing:demo.statusOptimal')}
                            </span>
                          </td>
                        </tr>
                        <tr className="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition">
                          <td className="p-3 font-semibold text-slate-900 dark:text-white">Samsung 24" LED Monitor</td>
                          <td className="p-3 font-mono text-slate-500">MON-SAM-24</td>
                          <td className="p-3 font-mono tabular-nums font-bold text-emerald-600 dark:text-emerald-400">14 {t('landing:demo.left')}</td>
                          <td className="p-3 font-mono tabular-nums">Rs. 19,500</td>
                          <td className="p-3 font-mono tabular-nums font-bold">Rs. 24,500</td>
                          <td className="p-3">
                            <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[10px] font-bold rounded-md">
                              {t('landing:demo.statusOptimal')}
                            </span>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 3: CUSTOMER DUES */}
              {activePreviewTab === 'ledgers' && (
                <div className="space-y-4 font-urdu">
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b border-slate-200/80 dark:border-white/[0.08] pb-3">
                    <div>
                      <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                        {t('landing:demo.udhaarTitle')}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-zinc-400">
                        {t('landing:demo.totalOutstanding')} <strong className="font-mono text-rose-600 tabular-nums">Rs. 170,000</strong>
                      </p>
                    </div>
                  </div>

                  {reminderFeedback && (
                    <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 rounded-xl text-xs font-semibold text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
                      <FiCheck className="w-4 h-4" />
                      <span>{t('landing:demo.reminderDispatched', { name: reminderFeedback })}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-white dark:bg-zinc-900/80 rounded-xl border border-slate-200/80 dark:border-white/[0.08] flex justify-between items-center shadow-xs">
                      <div>
                        <p className="text-sm font-bold text-slate-900 dark:text-white">Usman Traders (Lahore)</p>
                        <p className="text-xs text-slate-500 font-mono mt-0.5">{t('landing:demo.phone')} 0300-1234567 • {t('landing:demo.limit')} Rs. 200,000</p>
                        <button
                          onClick={() => handleSendReminder('Usman Traders')}
                          className="mt-2 text-[11px] font-semibold text-violet-600 dark:text-violet-400 hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <FiMessageSquare className="w-3 h-3" />
                          <span>{t('landing:demo.sendReminder')}</span>
                        </button>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-extrabold font-mono text-rose-600 tabular-nums">Rs. 120,000</p>
                        <span className="text-[10px] text-slate-400">{t('landing:demo.dueInDays', { days: 5 })}</span>
                      </div>
                    </div>

                    <div className="p-4 bg-white dark:bg-zinc-900/80 rounded-xl border border-slate-200/80 dark:border-white/[0.08] flex justify-between items-center shadow-xs">
                      <div>
                        <p className="text-sm font-bold text-slate-900 dark:text-white">Ali Hardware & Electric</p>
                        <p className="text-xs text-slate-500 font-mono mt-0.5">{t('landing:demo.phone')} 0321-9876543 • {t('landing:demo.limit')} Rs. 100,000</p>
                        <button
                          onClick={() => handleSendReminder('Ali Hardware')}
                          className="mt-2 text-[11px] font-semibold text-violet-600 dark:text-violet-400 hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <FiMessageSquare className="w-3 h-3" />
                          <span>{t('landing:demo.sendReminder')}</span>
                        </button>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-extrabold font-mono text-rose-600 tabular-nums">Rs. 50,000</p>
                        <span className="text-[10px] text-rose-500 font-semibold">{t('landing:demo.overdueToday')}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: NET PROFIT */}
              {activePreviewTab === 'analytics' && (
                <div className="space-y-4 font-urdu">
                  <div className="flex justify-between items-center border-b border-slate-200/80 dark:border-white/[0.08] pb-3">
                    <div>
                      <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                        {t('landing:demo.profitTitle')}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-zinc-400">
                        {t('landing:demo.profitSub')}
                      </p>
                    </div>
                    <div className="flex gap-1 text-[11px] font-semibold bg-slate-200/60 dark:bg-white/[0.05] p-0.5 rounded-lg">
                      <button
                        onClick={() => setAnalyticsPeriod('week')}
                        className={`px-2 py-1 rounded ${analyticsPeriod === 'week' ? 'bg-white dark:bg-violet-600 text-slate-900 dark:text-white' : 'text-slate-500'}`}
                      >
                        {t('landing:demo.periodWeek')}
                      </button>
                      <button
                        onClick={() => setAnalyticsPeriod('month')}
                        className={`px-2 py-1 rounded ${analyticsPeriod === 'month' ? 'bg-white dark:bg-violet-600 text-slate-900 dark:text-white' : 'text-slate-500'}`}
                      >
                        {t('landing:demo.periodMonth')}
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="p-4 bg-white dark:bg-zinc-900/80 rounded-xl border border-slate-200/80 dark:border-white/[0.08] shadow-xs">
                      <p className="text-[11px] font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">{t('landing:demo.totalSales')}</p>
                      <p className="text-xl sm:text-2xl font-bold font-mono text-slate-900 dark:text-white tabular-nums mt-1">
                        Rs. {analyticsPeriod === 'month' ? '1,450,000' : '380,000'}
                      </p>
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold font-mono mt-1 inline-block">+14.2%</span>
                    </div>

                    <div className="p-4 bg-white dark:bg-zinc-900/80 rounded-xl border border-slate-200/80 dark:border-white/[0.08] shadow-xs">
                      <p className="text-[11px] font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">{t('landing:demo.cashCollected')}</p>
                      <p className="text-xl sm:text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400 tabular-nums mt-1">
                        Rs. {analyticsPeriod === 'month' ? '1,280,000' : '330,000'}
                      </p>
                      <span className="text-[10px] text-slate-400 font-mono mt-1 inline-block">{t('landing:demo.paidRatio')}</span>
                    </div>

                    <div className="p-4 bg-white dark:bg-zinc-900/80 rounded-xl border border-slate-200/80 dark:border-white/[0.08] shadow-xs">
                      <p className="text-[11px] font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">{t('landing:demo.expenses')}</p>
                      <p className="text-xl sm:text-2xl font-bold font-mono text-rose-600 dark:text-rose-400 tabular-nums mt-1">
                        Rs. {analyticsPeriod === 'month' ? '85,000' : '19,500'}
                      </p>
                      <span className="text-[10px] text-slate-400 font-mono mt-1 inline-block">{t('landing:demo.rentBills')}</span>
                    </div>

                    <div className="p-4 bg-white dark:bg-zinc-900/80 rounded-xl border border-slate-200/80 dark:border-white/[0.08] shadow-xs">
                      <p className="text-[11px] font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">{t('landing:demo.netProfit')}</p>
                      <p className="text-xl sm:text-2xl font-bold font-mono text-violet-600 dark:text-violet-400 tabular-nums mt-1">
                        Rs. {analyticsPeriod === 'month' ? '320,000' : '82,000'}
                      </p>
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold font-mono mt-1 inline-block">+22.1% {t('landing:demo.margin')}</span>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>

        </div>
      </section>

      {/* Feature Pillar Showcase (Leon's Taste Rails: Anti-Slop, Hairline Borders) */}
      <section id="features" className="py-16 sm:py-20 lg:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 font-urdu">
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold uppercase tracking-widest text-violet-600 dark:text-violet-400 mb-2">
            <FiBox className="w-4 h-4" />
            <span>{t('landing:features.builtForOps')}</span>
          </div>
          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.25]">
            {t('landing:features.scaleTitle')}
          </h2>
          <p className="text-sm sm:text-base lg:text-lg text-slate-600 dark:text-zinc-400 mt-4 leading-[2.1]">
            {t('landing:features.scaleSub')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-8">
          {/* Feature 1 */}
          <div className="group p-6 sm:p-8 rounded-2xl bg-white/70 dark:bg-white/[0.03] backdrop-blur-md border border-slate-200/80 dark:border-white/[0.08] hover:border-violet-500/40 hover:-translate-y-1 transition-all duration-200 shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-violet-500/10 text-violet-600 dark:text-violet-400 flex items-center justify-center mb-5 sm:mb-6 text-xl">
              <FiShoppingCart className="w-6 h-6" />
            </div>
            <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-900 dark:text-white mb-2">
              {t('landing:features.card1Title')}
            </h3>
            <p className="text-xs sm:text-sm lg:text-base text-slate-600 dark:text-zinc-400 leading-[2.1]">
              {t('landing:features.card1Desc')}
            </p>
          </div>

          {/* Feature 2 */}
          <div className="group p-6 sm:p-8 rounded-2xl bg-white/70 dark:bg-white/[0.03] backdrop-blur-md border border-slate-200/80 dark:border-white/[0.08] hover:border-indigo-500/40 hover:-translate-y-1 transition-all duration-200 shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-5 sm:mb-6 text-xl">
              <FiBox className="w-6 h-6" />
            </div>
            <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-900 dark:text-white mb-2">
              {t('landing:features.card2Title')}
            </h3>
            <p className="text-xs sm:text-sm lg:text-base text-slate-600 dark:text-zinc-400 leading-[2.1]">
              {t('landing:features.card2Desc')}
            </p>
          </div>

          {/* Feature 3 */}
          <div className="group p-6 sm:p-8 rounded-2xl bg-white/70 dark:bg-white/[0.03] backdrop-blur-md border border-slate-200/80 dark:border-white/[0.08] hover:border-emerald-500/40 hover:-translate-y-1 transition-all duration-200 shadow-sm md:col-span-2 lg:col-span-1">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-5 sm:mb-6 text-xl">
              <FiUsers className="w-6 h-6" />
            </div>
            <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-900 dark:text-white mb-2">
              {t('landing:features.card3Title')}
            </h3>
            <p className="text-xs sm:text-sm lg:text-base text-slate-600 dark:text-zinc-400 leading-[2.1]">
              {t('landing:features.card3Desc')}
            </p>
          </div>
        </div>
      </section>

      {/* Frequently Asked Questions (Kowalski Zero-Jank CSS Grid Accordion) */}
      <section id="faq" className="py-16 sm:py-20 lg:py-24 bg-slate-100/60 dark:bg-[#07090F]/80 border-t border-slate-200/80 dark:border-white/[0.08] font-urdu">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 sm:mb-12">
            <div className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold uppercase tracking-widest text-violet-600 dark:text-violet-400 mb-2">
              <FiMessageSquare className="w-4 h-4" />
              <span>{t('landing:faq.badge')}</span>
            </div>
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-900 dark:text-white">
              {t('landing:faq.title')}
            </h2>
          </div>

          {/* Search & Category Filter Pills */}
          <div className="flex flex-col sm:flex-row gap-3 mb-8">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 start-0 ps-3.5 flex items-center pointer-events-none text-slate-400">
                <FiSearch className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={faqSearch}
                onChange={(e) => setFaqSearch(e.target.value)}
                placeholder={t('landing:faq.searchPlaceholder')}
                className="w-full ps-10 pe-4 py-2.5 sm:py-3 bg-white dark:bg-zinc-900/90 border border-slate-200/80 dark:border-white/[0.08] rounded-xl text-xs sm:text-sm outline-none focus:ring-2 focus:ring-violet-500/30 transition shadow-xs font-urdu"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1 font-urdu no-scrollbar">
              <button
                onClick={() => setFaqCategory('all')}
                className={`px-3.5 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold rounded-xl whitespace-nowrap active:scale-95 transition cursor-pointer ${
                  faqCategory === 'all'
                    ? 'bg-violet-600 text-white shadow-xs'
                    : 'bg-white dark:bg-zinc-900 text-slate-600 dark:text-zinc-300 border border-slate-200/80 dark:border-white/[0.08]'
                }`}
              >
                {t('landing:faq.catAll')}
              </button>
              <button
                onClick={() => setFaqCategory('pos')}
                className={`px-3.5 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold rounded-xl whitespace-nowrap active:scale-95 transition cursor-pointer ${
                  faqCategory === 'pos'
                    ? 'bg-violet-600 text-white shadow-xs'
                    : 'bg-white dark:bg-zinc-900 text-slate-600 dark:text-zinc-300 border border-slate-200/80 dark:border-white/[0.08]'
                }`}
              >
                {t('landing:faq.catPos')}
              </button>
              <button
                onClick={() => setFaqCategory('customers')}
                className={`px-3.5 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold rounded-xl whitespace-nowrap active:scale-95 transition cursor-pointer ${
                  faqCategory === 'customers'
                    ? 'bg-violet-600 text-white shadow-xs'
                    : 'bg-white dark:bg-zinc-900 text-slate-600 dark:text-zinc-300 border border-slate-200/80 dark:border-white/[0.08]'
                }`}
              >
                {t('landing:faq.catCustomers')}
              </button>
            </div>
          </div>

          {/* FAQ Accordion List (Zero Layout Shift via CSS Grid) */}
          <div className="space-y-3.5 font-urdu">
            {filteredFaqs.length === 0 ? (
              <div className="p-8 text-center bg-white dark:bg-zinc-900/80 rounded-2xl border border-slate-200/80 dark:border-white/[0.08] text-sm text-slate-500">
                {t('landing:faq.noResults')}
              </div>
            ) : (
              filteredFaqs.map((faq, idx) => {
                const isOpen = openFaq === idx;
                return (
                  <div
                    key={idx}
                    className="bg-white dark:bg-zinc-900/80 border border-slate-200/80 dark:border-white/[0.08] rounded-2xl overflow-hidden shadow-xs hover:border-violet-500/30 transition duration-150"
                  >
                    <button
                      onClick={() => toggleFaq(idx)}
                      className="w-full p-4 sm:p-5 text-start font-semibold text-slate-900 dark:text-white flex justify-between items-center cursor-pointer transition-colors duration-150"
                    >
                      <span className="text-base sm:text-lg pe-4">{faq.q}</span>
                      <span
                        className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 transition-transform duration-200 ${
                          isOpen
                            ? 'rotate-180 bg-violet-600 text-white'
                            : 'bg-slate-100 dark:bg-white/[0.06] text-slate-500 dark:text-zinc-400'
                        }`}
                      >
                        <FiChevronDown className="w-4 h-4" />
                      </span>
                    </button>

                    {/* Zero-Jank Kowalski Grid Accordion */}
                    <div
                      className={`grid-accordion ${
                        isOpen ? 'grid-accordion-expanded' : 'grid-accordion-collapsed'
                      }`}
                    >
                      <div className="overflow-hidden">
                        <div className="px-4 sm:px-6 pb-5 text-sm sm:text-base text-slate-600 dark:text-zinc-300 leading-[2.2] border-t border-slate-100 dark:border-white/[0.04] pt-4">
                          {faq.a}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

        </div>
      </section>

      {/* Direct MegaTrix Contact Section */}
      <section id="contact" className="py-16 sm:py-20 lg:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 font-urdu">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-start">

          {/* Left Column: Direct Support Access */}
          <div className="lg:col-span-6 space-y-6 sm:space-y-7">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-violet-600 dark:text-violet-400 mb-2">
                <FiPhone className="w-3.5 h-3.5" />
                <span>{t('landing:contact.supportBadge')}</span>
              </div>
              <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-900 dark:text-white">
                {t('landing:contact.helpTitle')}
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-300 mt-3 leading-relaxed">
                {t('landing:contact.helpDesc')}
              </p>
            </div>

            {/* Direct Contact Badges */}
            <div className="space-y-3.5">
              <a
                href="tel:03254567318"
                className="p-3.5 sm:p-4 bg-white dark:bg-zinc-900/80 rounded-2xl border border-slate-200/80 dark:border-white/[0.08] flex items-center gap-3.5 sm:gap-4 shadow-xs hover:border-violet-500/40 hover:-translate-y-0.5 transition duration-150 group"
              >
                <div className="w-10 sm:w-11 h-10 sm:h-11 rounded-xl bg-violet-500/10 text-violet-600 dark:text-violet-400 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition">
                  <FiPhone className="w-4 sm:w-5 h-4 sm:h-5" />
                </div>
                <div>
                  <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">{t('landing:contact.callLabel')}</p>
                  <p className="text-sm sm:text-base font-bold text-slate-900 dark:text-white font-mono" dir="ltr">0325-4567318</p>
                  <p className="text-[11px] text-slate-500">{t('landing:contact.callTiming')}</p>
                </div>
              </a>

              <a
                href="mailto:support@megatrixai.com"
                className="p-3.5 sm:p-4 bg-white dark:bg-zinc-900/80 rounded-2xl border border-slate-200/80 dark:border-white/[0.08] flex items-center gap-3.5 sm:gap-4 shadow-xs hover:border-indigo-500/40 hover:-translate-y-0.5 transition duration-150 group"
              >
                <div className="w-10 sm:w-11 h-10 sm:h-11 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition">
                  <FiMail className="w-4 sm:w-5 h-4 sm:h-5" />
                </div>
                <div>
                  <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">{t('landing:contact.emailLabel')}</p>
                  <p className="text-sm sm:text-base font-bold text-slate-900 dark:text-white truncate max-w-[200px] xs:max-w-none" dir="ltr">support@megatrixai.com</p>
                  <p className="text-[11px] text-slate-500">{t('landing:contact.emailTiming')}</p>
                </div>
              </a>
            </div>
          </div>

          {/* Right Column: Inquiry Form */}
          <div className="lg:col-span-6 bg-white/80 dark:bg-zinc-900/90 p-5 sm:p-8 rounded-2xl sm:rounded-3xl border border-slate-200/80 dark:border-white/[0.08] shadow-lg backdrop-blur-xl">
            <h3 className="text-base sm:text-xl font-bold text-slate-900 dark:text-white mb-1">
              {t('landing:contact.formTitle')}
            </h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mb-5 sm:mb-6">
              {t('landing:contact.formSub')}
            </p>

            {contactSubmitted && (
              <div className="mb-5 p-3.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 rounded-xl flex items-start gap-2.5 animate-fade-in" role="alert">
                <FiCheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                <div className="text-xs space-y-1">
                  <p className="font-semibold text-emerald-800 dark:text-emerald-300">
                    {t('landing:contact.thankYou')}
                  </p>
                  <a
                    href="https://wa.me/923254567318?text=Hello%20MegaTrix%20Team%2C%20I%20would%20like%20to%20inquire%20about%20BizManager%20for%20my%20store."
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-bold underline cursor-pointer"
                  >
                    <span>{language === 'ur' ? 'فوری جواب کے لیے واٹس ایپ پر پیغام بھیجیں' : 'Need instant assistance? Chat directly on WhatsApp →'}</span>
                  </a>
                </div>
              </div>
            )}

            <form onSubmit={handleContactSubmit} className="space-y-3.5 sm:space-y-4">
              {/* Field 1: Complete Name */}
              <div>
                <div className="flex items-center justify-between mb-1.5" dir="ltr">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 font-sans">
                    {language === 'ur' ? 'Complete Name' : t('landing:contact.nameLabel')}
                  </label>
                  {language === 'ur' && (
                    <span className="text-xs font-medium text-violet-600 dark:text-violet-400 font-urdu">
                      {t('landing:contact.nameLabel')}
                    </span>
                  )}
                </div>
                <input
                  type="text"
                  required
                  dir="ltr"
                  value={contactForm.name}
                  onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                  placeholder={language === 'ur' ? 'Enter full name (e.g. Muhammad Usman)' : t('landing:contact.namePlaceholder')}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-zinc-950 border border-slate-200/90 dark:border-white/[0.08] rounded-xl text-xs sm:text-sm outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500 transition text-left"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* Field 2: Phone Number */}
                <div>
                  <div className="flex items-center justify-between mb-1.5" dir="ltr">
                    <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 font-sans">
                      {language === 'ur' ? 'Phone Number' : t('landing:contact.phoneLabel')}
                    </label>
                    {language === 'ur' && (
                      <span className="text-xs font-medium text-violet-600 dark:text-violet-400 font-urdu">
                        {t('landing:contact.phoneLabel')}
                      </span>
                    )}
                  </div>
                  <input
                    type="tel"
                    required
                    dir="ltr"
                    value={contactForm.phone}
                    onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                    placeholder="0300-1234567"
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-zinc-950 border border-slate-200/90 dark:border-white/[0.08] rounded-xl text-xs sm:text-sm outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500 transition text-left font-mono"
                  />
                </div>

                {/* Business Type / Sector Dropdown */}
                <div>
                  <div className="flex items-center justify-between mb-1.5" dir="ltr">
                    <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 font-sans">
                      {language === 'ur' ? 'Business Type' : t('landing:contact.sectorLabel')}
                    </label>
                    {language === 'ur' && (
                      <span className="text-xs font-medium text-violet-600 dark:text-violet-400 font-urdu">
                        {t('landing:contact.sectorLabel')}
                      </span>
                    )}
                  </div>
                  <select
                    value={contactForm.businessType}
                    onChange={(e) => setContactForm({ ...contactForm, businessType: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-zinc-950 border border-slate-200/90 dark:border-white/[0.08] rounded-xl text-xs sm:text-sm outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500 transition font-urdu"
                  >
                    <option>{t('landing:contact.sectorRetail')}</option>
                    <option>{t('landing:contact.sectorWholesale')}</option>
                    <option>{t('landing:contact.sectorElectronics')}</option>
                    <option>{t('landing:contact.sectorHardware')}</option>
                    <option>{t('landing:contact.sectorPharmacy')}</option>
                    <option>{t('landing:contact.sectorGarments')}</option>
                    <option>{t('landing:contact.sectorOther')}</option>
                  </select>
                </div>
              </div>

              {/* Field 3: Message / Requirements */}
              <div>
                <div className="flex items-center justify-between mb-1.5" dir="ltr">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 font-sans">
                    {language === 'ur' ? 'Your Message' : t('landing:contact.messageLabel')}
                  </label>
                  {language === 'ur' && (
                    <span className="text-xs font-medium text-violet-600 dark:text-violet-400 font-urdu">
                      {t('landing:contact.messageLabel')}
                    </span>
                  )}
                </div>
                <textarea
                  rows={3}
                  required
                  dir="ltr"
                  value={contactForm.message}
                  onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                  placeholder={language === 'ur' ? 'Share details about your store or questions...' : t('landing:contact.messagePlaceholder')}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-zinc-950 border border-slate-200/90 dark:border-white/[0.08] rounded-xl text-xs sm:text-sm outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500 transition resize-none text-left"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 sm:py-3 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md shadow-violet-600/20 active:scale-[0.98] transition duration-150 cursor-pointer flex items-center justify-center gap-2 font-urdu"
              >
                {isSubmitting ? (
                  <span>{t('landing:contact.sending')}</span>
                ) : (
                  <>
                    <span>{t('landing:contact.submitBtn')}</span>
                    <FiArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>

        </div>
      </section>

      {/* Pre-Footer Conversion CTA Banner (Item 3) */}
      <section className="py-12 sm:py-16 bg-gradient-to-b from-transparent via-violet-600/5 to-violet-600/10 dark:via-violet-950/20 dark:to-violet-950/40 border-t border-slate-200/70 dark:border-white/[0.06] font-urdu">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="p-8 sm:p-12 rounded-3xl bg-white/90 dark:bg-[#0C0F1A]/90 border border-slate-200/90 dark:border-white/[0.1] shadow-xl backdrop-blur-xl relative overflow-hidden">
            <div className="relative z-10 max-w-2xl mx-auto space-y-4">
              <span className="inline-block px-3.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                {language === 'ur' ? 'بغیر کریڈٹ کارڈ — فوری سیٹ اپ' : 'No Credit Card Required — Instant Setup'}
              </span>
              <h2 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
                {language === 'ur'
                  ? 'کیا آپ اپنے اسٹور کا نظام جدید اور خودکار بنانا چاہتے ہیں؟'
                  : 'Ready to Modernize & Grow Your Retail Store?'}
              </h2>
              <p className="text-xs sm:text-base text-slate-600 dark:text-zinc-300 leading-relaxed">
                {language === 'ur'
                  ? 'بز مینیجر کے ساتھ تیز ترین بلنگ، انوینٹری کنٹرول، اور ادھار کھاتہ کا انتظام آسان اور محفوظ بنائیں۔ آج ہی اپنا مفت ٹرائل حاصل کریں۔'
                  : 'Join modern store owners across Pakistan. Get instant billing, inventory management, and customer credit ledger in one fast, reliable platform.'}
              </p>
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  onClick={() => navigate(user ? '/dashboard' : '/register')}
                  className="w-full sm:w-auto px-7 py-3.5 bg-violet-600 hover:bg-violet-500 text-white font-bold text-sm sm:text-base rounded-xl shadow-lg shadow-violet-600/25 flex items-center justify-center gap-2 active:scale-95 transition cursor-pointer"
                >
                  <span>{user ? t('landing:nav.dashboard') : (language === 'ur' ? '۱۴ دن کا مفت ٹرائل شروع کریں' : 'Start 14-Day Free Trial')}</span>
                  <FiArrowRight className="w-4 h-4" />
                </button>
                <a
                  href="https://wa.me/923254567318"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto px-6 py-3.5 bg-emerald-600/10 hover:bg-emerald-600/20 border border-emerald-600/30 text-emerald-700 dark:text-emerald-300 font-bold text-sm sm:text-base rounded-xl flex items-center justify-center gap-2 active:scale-95 transition"
                >
                  <FiPhone className="w-4 h-4" />
                  <span>{language === 'ur' ? 'واٹس ایپ پر رابطہ کریں' : 'Chat on WhatsApp'}</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Bar */}
      <footer className="bg-white dark:bg-[#06080E] border-t border-slate-200/80 dark:border-white/[0.08] py-8 sm:py-10 transition-colors font-urdu">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-start">
            <div className="flex items-center cursor-pointer select-none" onClick={() => navigate('/')}>
              <Logo size="md" showText={true} showSubtitle={true} />
            </div>

            <div className="flex flex-wrap items-center justify-center sm:justify-end gap-3.5 sm:gap-6 text-xs text-slate-500 dark:text-zinc-400">
              <button onClick={() => scrollToSection('features')} className="hover:underline cursor-pointer">{t('landing:footer.features')}</button>
              <button onClick={() => scrollToSection('demo')} className="hover:underline cursor-pointer">{t('landing:footer.demo')}</button>
              <button onClick={() => scrollToSection('faq')} className="hover:underline cursor-pointer">{t('landing:footer.faq')}</button>
              <button onClick={() => scrollToSection('contact')} className="hover:underline cursor-pointer">{t('landing:footer.contact')}</button>
              <Link to="/privacy-policy" className="hover:underline cursor-pointer text-slate-700 dark:text-zinc-300 font-medium">
                {language === 'ur' ? 'پرائیویسی پالیسی' : 'Privacy Policy'}
              </Link>
              <Link to="/terms" className="hover:underline cursor-pointer text-slate-700 dark:text-zinc-300 font-medium">
                {language === 'ur' ? 'شرائط و ضوابط' : 'Terms'}
              </Link>
              <a
                href="https://wa.me/923254567318"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1"
              >
                <span>{language === 'ur' ? 'واٹس ایپ' : 'WhatsApp'}</span>
              </a>
            </div>
          </div>

          <div className="pt-4 sm:pt-6 border-t border-slate-200/60 dark:border-white/[0.05] flex flex-col sm:flex-row items-center justify-between text-[11px] sm:text-xs text-slate-500 dark:text-zinc-400 gap-2 text-center sm:text-start">
            <p>{t('landing:footer.rights')}</p>
            <p>{t('landing:footer.supportText')}</p>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default LandingPage;
