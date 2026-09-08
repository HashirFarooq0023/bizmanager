import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useTheme } from '../contexts/ThemeContext';
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
  FiPlay
} from 'react-icons/fi';

const LandingPage = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { theme, toggleTheme } = useTheme();

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
      q: "What is BizManager and who is it designed for?",
      a: "BizManager by MegaTrix is an all-in-one business operating system tailored for retail shops, wholesalers, supermarkets, hardware stores, electronics shops, and distributors. It merges POS sales, inventory control, party ledgers, and profit reporting into one fast, ultra-responsive workspace."
    },
    {
      cat: 'pos',
      q: "Does BizManager work with my barcode scanner and thermal receipt printer?",
      a: "Yes! BizManager natively supports standard USB and Bluetooth barcode scanners, cash drawers, and ESC/POS thermal printers (both 80mm & 58mm). You can scan items in milliseconds, split cash/card payments, and print customer bills instantly."
    },
    {
      cat: 'customers',
      q: "How does customer credit & udhaar tracking work?",
      a: "BizManager maintains automatic double-entry credit ledgers for every customer. When a customer buys on credit, their balance updates automatically. You can set customized credit limits, view aging dues, and dispatch one-click payment reminders via WhatsApp or SMS."
    },
    {
      cat: 'inventory',
      q: "Can I manage low stock alerts and barcode generation?",
      a: "Absolutely. Set minimum reorder points for any product. When stock drops below the safety threshold, BizManager highlights it with a luminous alert. You can also generate and print standard barcode labels directly from your inventory screen."
    },
    {
      cat: 'security',
      q: "Is my business financial data secure and private?",
      a: "Your data is stored in bank-grade encrypted cloud infrastructure with daily automated snapshots. Only authorized account owners and staff with assigned granular roles can access your business records."
    },
    {
      cat: 'pricing',
      q: "Are there any hidden transaction fees or long-term contracts?",
      a: "Zero hidden fees. We offer simple, transparent subscription plans with lifetime support by MegaTrix. You can start with a 14-day free trial without entering a credit card."
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

      {/* Ambient Lighting Spotlights (The Impactable UI) */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[700px] sm:w-[900px] h-[450px] bg-gradient-to-b from-violet-600/15 via-indigo-500/10 to-transparent blur-[140px] pointer-events-none -z-10 animate-ambient-glow" />
      <div className="fixed -bottom-40 -right-40 w-[550px] h-[550px] bg-purple-600/10 dark:bg-purple-900/15 blur-[160px] pointer-events-none -z-10" />

      {/* Frosted Glass Floating Navbar */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-[#080B11]/80 backdrop-blur-xl border-b border-slate-200/70 dark:border-white/[0.07] transition-all duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">

          {/* MegaTrix Logo (Preserved Brand Identity) */}
          <div className="flex items-center cursor-pointer" onClick={() => navigate('/')}>
            <Logo size="lg" hoverSlide={true} />
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center space-x-7 text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-zinc-300">
            <button
              onClick={() => scrollToSection('features')}
              className="hover:text-violet-600 dark:hover:text-violet-400 transition-colors duration-150 cursor-pointer"
            >
              Features
            </button>
            <button
              onClick={() => scrollToSection('demo')}
              className="hover:text-violet-600 dark:hover:text-violet-400 transition-colors duration-150 cursor-pointer flex items-center gap-1.5"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-violet-600 animate-pulse" />
              Interactive Demo
            </button>
            <button
              onClick={() => scrollToSection('faq')}
              className="hover:text-violet-600 dark:hover:text-violet-400 transition-colors duration-150 cursor-pointer"
            >
              FAQ
            </button>
            <button
              onClick={() => scrollToSection('contact')}
              className="hover:text-violet-600 dark:hover:text-violet-400 transition-colors duration-150 cursor-pointer"
            >
              Contact Us
            </button>
          </nav>

          {/* Header Action Controls */}
          <div className="hidden md:flex items-center space-x-3">
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
                className="px-4 py-2 text-xs font-bold text-white bg-violet-600 hover:bg-violet-500 active:scale-[0.98] rounded-xl shadow-md shadow-violet-600/25 border border-white/20 transition-all duration-150 cursor-pointer flex items-center gap-1.5"
              >
                <span>Dashboard</span>
                <FiArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <>
                <button
                  onClick={() => navigate('/login')}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-zinc-200 hover:text-violet-600 dark:hover:text-violet-400 active:scale-95 transition-all duration-150 cursor-pointer"
                >
                  Sign In
                </button>
                <button
                  onClick={() => navigate('/register')}
                  className="relative group px-4 py-2 text-xs font-bold text-white bg-gradient-to-b from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 active:scale-[0.98] rounded-xl shadow-md shadow-violet-600/25 border border-white/20 transition-all duration-150 cursor-pointer overflow-hidden"
                >
                  <span className="relative z-10 flex items-center gap-1.5">
                    <span>Get Started Free</span>
                    <FiArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform duration-150" />
                  </span>
                </button>
              </>
            )}
          </div>

          {/* Mobile Menu Trigger */}
          <div className="flex md:hidden items-center space-x-2">
            <button
              onClick={toggleTheme}
              className="p-2 text-slate-500 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-white/[0.06] rounded-xl border border-transparent dark:border-white/[0.06]"
            >
              {theme === 'light' ? <FiMoon className="w-4 h-4" /> : <FiSun className="w-4 h-4 text-amber-400" />}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-700 dark:text-zinc-200 hover:bg-slate-100 dark:hover:bg-white/[0.06] rounded-xl"
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
            <button onClick={() => scrollToSection('features')} className="block w-full text-left py-2 text-sm font-semibold text-slate-700 dark:text-zinc-200">
              Features
            </button>
            <button onClick={() => scrollToSection('demo')} className="block w-full text-left py-2 text-sm font-semibold text-slate-700 dark:text-zinc-200">
              Interactive Demo
            </button>
            <button onClick={() => scrollToSection('faq')} className="block w-full text-left py-2 text-sm font-semibold text-slate-700 dark:text-zinc-200">
              FAQ
            </button>
            <button onClick={() => scrollToSection('contact')} className="block w-full text-left py-2 text-sm font-semibold text-slate-700 dark:text-zinc-200">
              Contact Us
            </button>
            <div className="pt-3 border-t border-slate-200/80 dark:border-white/[0.08] flex flex-col gap-2.5">
              {user ? (
                <button
                  onClick={() => navigate('/dashboard')}
                  className="w-full py-2.5 text-center text-xs font-bold text-white bg-violet-600 rounded-xl"
                >
                  Go to Dashboard →
                </button>
              ) : (
                <>
                  <button
                    onClick={() => navigate('/login')}
                    className="w-full py-2.5 text-center text-xs font-semibold text-slate-700 dark:text-zinc-200 bg-slate-100 dark:bg-white/[0.06] rounded-xl"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => navigate('/register')}
                    className="w-full py-2.5 text-center text-xs font-bold text-white bg-violet-600 rounded-xl"
                  >
                    Get Started Free →
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Hero Section (The Impactable Visual Anchor) */}
      <section className="relative pt-16 sm:pt-24 pb-20 sm:pb-28 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">

          {/* Product Announcement Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-violet-500/10 dark:bg-violet-950/40 border border-violet-500/20 dark:border-violet-500/30 mb-8 backdrop-blur-md shadow-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse" />
            <span className="text-xs font-semibold text-violet-700 dark:text-violet-300 tracking-wide">
              Production Release v2.4 • Next-Gen Business OS
            </span>
          </div>

          {/* Main Headline (Optical Tightening & High-Contrast Gradient) */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-[-0.03em] text-slate-900 dark:text-white max-w-5xl mx-auto leading-[1.08]">
            Run Your Business With{' '}
            <span className="bg-gradient-to-r from-violet-600 via-indigo-500 to-purple-600 dark:from-violet-400 dark:via-indigo-300 dark:to-purple-400 bg-clip-text text-transparent">
              Zero Chaos & Full Control.
            </span>
          </h1>

          {/* Subtitle (Refined Two-Tone Typography) */}
          <p className="mt-6 text-base sm:text-lg lg:text-xl text-slate-600 dark:text-zinc-300 max-w-3xl mx-auto leading-relaxed font-normal">
            Eliminate inventory discrepancies, automate customer credit ledgers, accelerate POS checkout, and obtain transparent net profit calculations in seconds.
          </p>

          {/* Catalyst Actions (Kowalski Tactile Button & Sheen Effect) */}
          <div className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <button
              onClick={() => navigate(user ? '/dashboard' : '/register')}
              className="relative group w-full sm:w-auto px-8 py-3.5 text-sm font-bold text-white bg-gradient-to-b from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 rounded-xl shadow-lg shadow-violet-600/30 border border-white/20 transition-all duration-150 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer overflow-hidden"
            >
              {/* Shimmer Sheen Layer */}
              <span className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-[300%] transition-transform duration-700 ease-in-out pointer-events-none" />
              <span>{user ? 'Open Dashboard' : 'Start 14-Day Free Trial'}</span>
              <FiArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>

            <button
              onClick={() => scrollToSection('demo')}
              className="w-full sm:w-auto px-7 py-3.5 text-sm font-semibold text-slate-700 dark:text-zinc-200 bg-white/80 dark:bg-white/[0.05] border border-slate-200/80 dark:border-white/[0.08] hover:bg-slate-100 dark:hover:bg-white/[0.08] hover:border-slate-300 dark:hover:border-white/15 rounded-xl shadow-xs transition-all duration-150 active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer backdrop-blur-md"
            >
              <FiPlay className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400" />
              <span>Explore Interactive Sandbox</span>
            </button>
          </div>



          {/* Quick Pillar Checklist */}
          <div className="mt-8 flex flex-wrap justify-center items-center gap-y-2 gap-x-7 text-xs sm:text-sm font-medium text-slate-500 dark:text-zinc-400">
            <div className="flex items-center gap-1.5">
              <FiCheckCircle className="w-4 h-4 text-emerald-500" />
              <span>Multi-Cart POS Terminal</span>
            </div>
            <div className="flex items-center gap-1.5">
              <FiCheckCircle className="w-4 h-4 text-emerald-500" />
              <span>Automatic Udhaar Ledgers</span>
            </div>
            <div className="flex items-center gap-1.5">
              <FiCheckCircle className="w-4 h-4 text-emerald-500" />
              <span>Low-Stock Guardian</span>
            </div>
            <div className="flex items-center gap-1.5">
              <FiCheckCircle className="w-4 h-4 text-emerald-500" />
              <span>Real-Time Net Profit</span>
            </div>
          </div>

        </div>
      </section>

      {/* Interactive Live App Sandbox (The Impactable Interactive Demo) */}
      <section id="demo" className="py-16 sm:py-20 bg-slate-100/60 dark:bg-[#07090F]/80 border-y border-slate-200/80 dark:border-white/[0.08] relative">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-violet-600 dark:text-violet-400 mb-2">
              <FiZap className="w-3.5 h-3.5" />
              <span>Interactive Live Sandbox</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Experience BizManager in Real Time
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 mt-2 max-w-xl mx-auto">
              Test core features below: adjust cart quantities, scan new products, or switch tabs to view live calculations.
            </p>
          </div>

          {/* Interactive Browser Frame (Hairline Glassmorphic Surface) */}
          <div className="rounded-2xl sm:rounded-3xl shadow-[0_4px_24px_rgba(0,0,0,0.06),0_24px_48px_rgba(0,0,0,0.12)] border border-slate-200/90 dark:border-white/[0.08] bg-white dark:bg-[#0A0D15] overflow-hidden backdrop-blur-xl">

            {/* Browser Window Header */}
            <div className="px-4 sm:px-6 py-3.5 bg-slate-100/90 dark:bg-zinc-950/80 border-b border-slate-200/80 dark:border-white/[0.06] flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center space-x-2">
                <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
                <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
                <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
                <span className="ml-3 px-3 py-0.5 rounded-md bg-white/70 dark:bg-white/[0.05] text-[11px] font-mono text-slate-500 dark:text-zinc-400 hidden sm:inline-block border border-slate-200/60 dark:border-white/[0.05]">
                  bizmanager.megatrixai.com/live-demo
                </span>
              </div>

              {/* Demo Mode Tabs (Tactile sliding selection) */}
              <div className="flex items-center bg-slate-200/70 dark:bg-white/[0.06] p-1 rounded-xl gap-1 text-xs font-semibold">
                <button
                  onClick={() => setActivePreviewTab('pos')}
                  className={`px-3 py-1.5 rounded-lg transition-all duration-150 cursor-pointer active:scale-95 ${
                    activePreviewTab === 'pos'
                      ? 'bg-white dark:bg-violet-600 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  POS Terminal
                </button>
                <button
                  onClick={() => setActivePreviewTab('inventory')}
                  className={`px-3 py-1.5 rounded-lg transition-all duration-150 cursor-pointer active:scale-95 ${
                    activePreviewTab === 'inventory'
                      ? 'bg-white dark:bg-violet-600 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Inventory Stock
                </button>
                <button
                  onClick={() => setActivePreviewTab('ledgers')}
                  className={`px-3 py-1.5 rounded-lg transition-all duration-150 cursor-pointer active:scale-95 ${
                    activePreviewTab === 'ledgers'
                      ? 'bg-white dark:bg-violet-600 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Customer Dues
                </button>
                <button
                  onClick={() => setActivePreviewTab('analytics')}
                  className={`px-3 py-1.5 rounded-lg transition-all duration-150 cursor-pointer active:scale-95 ${
                    activePreviewTab === 'analytics'
                      ? 'bg-white dark:bg-violet-600 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Net Profit
                </button>
              </div>
            </div>

            {/* Tab View Canvas */}
            <div className="p-5 sm:p-8 bg-slate-50/40 dark:bg-transparent min-h-[420px] transition-all">

              {/* TAB 1: POS TERMINAL */}
              {activePreviewTab === 'pos' && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 dark:border-white/[0.08] pb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                          POS Checkout Counter
                        </h3>
                        <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[11px] font-semibold">
                          Active Counter #01
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                        Interactive cart: adjust quantities or simulate a barcode scanner input.
                      </p>
                    </div>

                    <button
                      onClick={addDemoScanItem}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-violet-50 dark:bg-violet-950/60 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-800/60 hover:bg-violet-100 active:scale-95 transition cursor-pointer"
                    >
                      <FiPlus className="w-3.5 h-3.5" />
                      <span>Simulate Barcode Scan</span>
                    </button>
                  </div>

                  {/* Checkout Feedback Alert */}
                  {checkoutFeedback && (
                    <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-between animate-fade-in">
                      <div className="flex items-center gap-2.5">
                        <FiPrinter className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                        <div>
                          <p className="text-xs font-bold text-emerald-800 dark:text-emerald-300">
                            Cash Sale Completed & Receipt Printed!
                          </p>
                          <p className="text-[11px] text-emerald-700 dark:text-emerald-400 font-mono">
                            Bill #{Math.floor(1000 + Math.random() * 9000)} • ESC/POS 80mm
                          </p>
                        </div>
                      </div>
                      <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        Paid: Rs. {cartTotal.toLocaleString()}
                      </span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    {/* Cart Items List */}
                    <div className="lg:col-span-7 space-y-3">
                      {demoCart.length === 0 ? (
                        <div className="p-8 text-center rounded-xl border border-dashed border-slate-300 dark:border-zinc-800 text-slate-400">
                          <p className="text-xs font-semibold">Cart is currently empty.</p>
                          <button
                            onClick={addDemoScanItem}
                            className="mt-2 text-xs font-bold text-violet-600 dark:text-violet-400 hover:underline"
                          >
                            Click here to scan an item
                          </button>
                        </div>
                      ) : (
                        demoCart.map(item => (
                          <div
                            key={item.id}
                            className="p-3.5 bg-white dark:bg-zinc-900/80 rounded-xl border border-slate-200/80 dark:border-white/[0.08] flex items-center justify-between gap-3 shadow-xs hover:border-violet-500/40 transition duration-150"
                          >
                            <div className="min-w-0 flex-1">
                              <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                                {item.name}
                              </p>
                              <p className="text-[11px] text-slate-500 dark:text-zinc-400 font-mono mt-0.5">
                                SKU: {item.sku} • In Stock: {item.stock}
                              </p>
                            </div>

                            {/* Quantity Controls */}
                            <div className="flex items-center gap-2">
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
                                className="p-1.5 text-slate-400 hover:text-rose-500 transition"
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
                          Current Cart Summary
                        </span>
                        <span className="text-xs font-mono text-slate-400">
                          {demoCart.reduce((sum, i) => sum + i.qty, 0)} items
                        </span>
                      </div>

                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between text-slate-600 dark:text-zinc-400">
                          <span>Subtotal</span>
                          <span className="font-mono tabular-nums font-semibold text-slate-900 dark:text-white">
                            Rs. {cartSubtotal.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between text-slate-600 dark:text-zinc-400">
                          <span>Sales Tax (5%)</span>
                          <span className="font-mono tabular-nums font-semibold text-slate-900 dark:text-white">
                            Rs. {cartTax.toLocaleString()}
                          </span>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-slate-200/80 dark:border-white/[0.08] flex justify-between items-baseline">
                        <span className="text-xs font-bold uppercase text-slate-900 dark:text-white">
                          Total Amount
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
                        <span>Complete Cash Checkout & Print</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: INVENTORY STOCK */}
              {activePreviewTab === 'inventory' && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b border-slate-200/80 dark:border-white/[0.08] pb-3">
                    <div>
                      <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                        Inventory Guardian & Real-Time Balances
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-zinc-400">
                        Tracks stock movements in real time with automatic reorder alerts.
                      </p>
                    </div>
                    <span className="px-2.5 py-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-xs font-semibold rounded-lg w-fit">
                      1 Low-Stock Warning
                    </span>
                  </div>

                  <div className="overflow-x-auto rounded-xl border border-slate-200/80 dark:border-white/[0.08]">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-100 dark:bg-zinc-950/80 text-slate-600 dark:text-zinc-300 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200 dark:border-white/[0.06]">
                        <tr>
                          <th className="p-3">Product Name</th>
                          <th className="p-3">SKU</th>
                          <th className="p-3">Stock Units</th>
                          <th className="p-3">Purchase Rate</th>
                          <th className="p-3">Selling Price</th>
                          <th className="p-3">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200/70 dark:divide-white/[0.05] text-slate-700 dark:text-zinc-200 bg-white dark:bg-transparent">
                        <tr className="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition">
                          <td className="p-3 font-semibold text-slate-900 dark:text-white">Logitech MX Master 3S</td>
                          <td className="p-3 font-mono text-slate-500">LOG-MX-3S</td>
                          <td className="p-3 font-mono tabular-nums font-bold text-rose-600 dark:text-rose-400">3 left</td>
                          <td className="p-3 font-mono tabular-nums">Rs. 18,000</td>
                          <td className="p-3 font-mono tabular-nums font-bold">Rs. 22,500</td>
                          <td className="p-3">
                            <span className="px-2 py-0.5 bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 text-[10px] font-bold rounded-md">
                              Reorder Alert
                            </span>
                          </td>
                        </tr>
                        <tr className="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition">
                          <td className="p-3 font-semibold text-slate-900 dark:text-white">Dell UltraSharp 27" 4K Monitor</td>
                          <td className="p-3 font-mono text-slate-500">DEL-U27-4K</td>
                          <td className="p-3 font-mono tabular-nums font-bold text-emerald-600 dark:text-emerald-400">42 left</td>
                          <td className="p-3 font-mono tabular-nums">Rs. 85,000</td>
                          <td className="p-3 font-mono tabular-nums font-bold">Rs. 102,000</td>
                          <td className="p-3">
                            <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[10px] font-bold rounded-md">
                              Optimal
                            </span>
                          </td>
                        </tr>
                        <tr className="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition">
                          <td className="p-3 font-semibold text-slate-900 dark:text-white">Samsung 24" LED Monitor</td>
                          <td className="p-3 font-mono text-slate-500">MON-SAM-24</td>
                          <td className="p-3 font-mono tabular-nums font-bold text-emerald-600 dark:text-emerald-400">14 left</td>
                          <td className="p-3 font-mono tabular-nums">Rs. 19,500</td>
                          <td className="p-3 font-mono tabular-nums font-bold">Rs. 24,500</td>
                          <td className="p-3">
                            <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[10px] font-bold rounded-md">
                              Optimal
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
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b border-slate-200/80 dark:border-white/[0.08] pb-3">
                    <div>
                      <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                        Customer Credit & Udhaar Ledgers
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-zinc-400">
                        Total Outstanding Credit: <strong className="font-mono text-rose-600 tabular-nums">Rs. 170,000</strong>
                      </p>
                    </div>
                  </div>

                  {reminderFeedback && (
                    <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 rounded-xl text-xs font-semibold text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
                      <FiCheck className="w-4 h-4" />
                      <span>WhatsApp payment reminder dispatched to <strong>{reminderFeedback}</strong>!</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-white dark:bg-zinc-900/80 rounded-xl border border-slate-200/80 dark:border-white/[0.08] flex justify-between items-center shadow-xs">
                      <div>
                        <p className="text-sm font-bold text-slate-900 dark:text-white">Usman Traders (Lahore)</p>
                        <p className="text-xs text-slate-500 font-mono mt-0.5">Phone: 0300-1234567 • Limit: Rs. 200,000</p>
                        <button
                          onClick={() => handleSendReminder('Usman Traders')}
                          className="mt-2 text-[11px] font-semibold text-violet-600 dark:text-violet-400 hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <FiMessageSquare className="w-3 h-3" />
                          <span>Send WhatsApp Reminder</span>
                        </button>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-extrabold font-mono text-rose-600 tabular-nums">Rs. 120,000</p>
                        <span className="text-[10px] text-slate-400">Due in 5 days</span>
                      </div>
                    </div>

                    <div className="p-4 bg-white dark:bg-zinc-900/80 rounded-xl border border-slate-200/80 dark:border-white/[0.08] flex justify-between items-center shadow-xs">
                      <div>
                        <p className="text-sm font-bold text-slate-900 dark:text-white">Ali Hardware & Electric</p>
                        <p className="text-xs text-slate-500 font-mono mt-0.5">Phone: 0321-9876543 • Limit: Rs. 100,000</p>
                        <button
                          onClick={() => handleSendReminder('Ali Hardware')}
                          className="mt-2 text-[11px] font-semibold text-violet-600 dark:text-violet-400 hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <FiMessageSquare className="w-3 h-3" />
                          <span>Send WhatsApp Reminder</span>
                        </button>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-extrabold font-mono text-rose-600 tabular-nums">Rs. 50,000</p>
                        <span className="text-[10px] text-rose-500 font-semibold">Overdue today</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: NET PROFIT */}
              {activePreviewTab === 'analytics' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center border-b border-slate-200/80 dark:border-white/[0.08] pb-3">
                    <div>
                      <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                        Executive Net Profit & Revenue Analytics
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-zinc-400">
                        Automatic calculation: Gross Sales minus Purchases & Operating Expenses.
                      </p>
                    </div>
                    <div className="flex gap-1 text-[11px] font-semibold bg-slate-200/60 dark:bg-white/[0.05] p-0.5 rounded-lg">
                      <button
                        onClick={() => setAnalyticsPeriod('week')}
                        className={`px-2 py-1 rounded ${analyticsPeriod === 'week' ? 'bg-white dark:bg-violet-600 text-slate-900 dark:text-white' : 'text-slate-500'}`}
                      >
                        Week
                      </button>
                      <button
                        onClick={() => setAnalyticsPeriod('month')}
                        className={`px-2 py-1 rounded ${analyticsPeriod === 'month' ? 'bg-white dark:bg-violet-600 text-slate-900 dark:text-white' : 'text-slate-500'}`}
                      >
                        Month
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="p-4 bg-white dark:bg-zinc-900/80 rounded-xl border border-slate-200/80 dark:border-white/[0.08] shadow-xs">
                      <p className="text-[11px] font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">Total Sales</p>
                      <p className="text-xl sm:text-2xl font-bold font-mono text-slate-900 dark:text-white tabular-nums mt-1">
                        Rs. {analyticsPeriod === 'month' ? '1,450,000' : '380,000'}
                      </p>
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold font-mono mt-1 inline-block">+14.2%</span>
                    </div>

                    <div className="p-4 bg-white dark:bg-zinc-900/80 rounded-xl border border-slate-200/80 dark:border-white/[0.08] shadow-xs">
                      <p className="text-[11px] font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">Cash Collected</p>
                      <p className="text-xl sm:text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400 tabular-nums mt-1">
                        Rs. {analyticsPeriod === 'month' ? '1,280,000' : '330,000'}
                      </p>
                      <span className="text-[10px] text-slate-400 font-mono mt-1 inline-block">88.2% paid</span>
                    </div>

                    <div className="p-4 bg-white dark:bg-zinc-900/80 rounded-xl border border-slate-200/80 dark:border-white/[0.08] shadow-xs">
                      <p className="text-[11px] font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">Expenses</p>
                      <p className="text-xl sm:text-2xl font-bold font-mono text-rose-600 dark:text-rose-400 tabular-nums mt-1">
                        Rs. {analyticsPeriod === 'month' ? '85,000' : '19,500'}
                      </p>
                      <span className="text-[10px] text-slate-400 font-mono mt-1 inline-block">Rent & Bills</span>
                    </div>

                    <div className="p-4 bg-white dark:bg-zinc-900/80 rounded-xl border border-slate-200/80 dark:border-white/[0.08] shadow-xs">
                      <p className="text-[11px] font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">Net Profit</p>
                      <p className="text-xl sm:text-2xl font-bold font-mono text-violet-600 dark:text-violet-400 tabular-nums mt-1">
                        Rs. {analyticsPeriod === 'month' ? '320,000' : '82,000'}
                      </p>
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold font-mono mt-1 inline-block">+22.1% margin</span>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>

        </div>
      </section>

      {/* Feature Pillar Showcase (Leon's Taste Rails: Anti-Slop, Hairline Borders) */}
      <section id="features" className="py-20 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-violet-600 dark:text-violet-400 mb-2">
            <FiBox className="w-3.5 h-3.5" />
            <span>Built For Real Operations</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-[-0.03em] text-slate-900 dark:text-white">
            Everything You Need to Scale Without Headaches
          </h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-zinc-400 mt-4 leading-relaxed">
            Eliminate loose paper notes and disjointed spreadsheets. BizManager unifies your sales, stock, and supplier operations into a cohesive system.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {/* Feature 1 */}
          <div className="group p-8 rounded-2xl bg-white/70 dark:bg-white/[0.03] backdrop-blur-md border border-slate-200/80 dark:border-white/[0.08] hover:border-violet-500/40 hover:-translate-y-1 transition-all duration-200 shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-violet-500/10 text-violet-600 dark:text-violet-400 flex items-center justify-center mb-6 text-xl">
              <FiShoppingCart className="w-6 h-6" />
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mb-2">
              Multi-Cart POS Checkout
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-400 leading-relaxed">
              Serve multiple walk-in customers concurrently. Hold carts, scan barcodes at 60fps, split payments between cash & card, and print instant ESC/POS receipts.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="group p-8 rounded-2xl bg-white/70 dark:bg-white/[0.03] backdrop-blur-md border border-slate-200/80 dark:border-white/[0.08] hover:border-indigo-500/40 hover:-translate-y-1 transition-all duration-200 shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-6 text-xl">
              <FiBox className="w-6 h-6" />
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mb-2">
              Automated Stock Guardian
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-400 leading-relaxed">
              Stock levels decrement instantly upon sale and replenish with purchase GRNs. Set automated safety reorder points and print custom barcode labels.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="group p-8 rounded-2xl bg-white/70 dark:bg-white/[0.03] backdrop-blur-md border border-slate-200/80 dark:border-white/[0.08] hover:border-emerald-500/40 hover:-translate-y-1 transition-all duration-200 shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-6 text-xl">
              <FiUsers className="w-6 h-6" />
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mb-2">
              Party & Udhaar Ledgers
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-400 leading-relaxed">
              Maintain precise double-entry customer balances, credit thresholds, overdue flags, and complete purchase audit histories without ledger discrepancies.
            </p>
          </div>
        </div>
      </section>

      {/* Frequently Asked Questions (Kowalski Zero-Jank CSS Grid Accordion) */}
      <section id="faq" className="py-20 sm:py-24 bg-slate-100/60 dark:bg-[#07090F]/80 border-t border-slate-200/80 dark:border-white/[0.08]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-violet-600 dark:text-violet-400 mb-2">
              <FiMessageSquare className="w-3.5 h-3.5" />
              <span>Got Questions?</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Frequently Asked Questions
            </h2>
          </div>

          {/* Search & Category Filter Pills */}
          <div className="flex flex-col sm:flex-row gap-3 mb-8">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <FiSearch className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={faqSearch}
                onChange={(e) => setFaqSearch(e.target.value)}
                placeholder="Search questions (e.g., barcode, credit, printer)..."
                className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-zinc-900/90 border border-slate-200/80 dark:border-white/[0.08] rounded-xl text-xs sm:text-sm outline-none focus:ring-2 focus:ring-violet-500/30 transition shadow-xs"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1">
              <button
                onClick={() => setFaqCategory('all')}
                className={`px-3.5 py-2 text-xs font-semibold rounded-xl whitespace-nowrap active:scale-95 transition cursor-pointer ${
                  faqCategory === 'all'
                    ? 'bg-violet-600 text-white shadow-xs'
                    : 'bg-white dark:bg-zinc-900 text-slate-600 dark:text-zinc-300 border border-slate-200/80 dark:border-white/[0.08]'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFaqCategory('pos')}
                className={`px-3.5 py-2 text-xs font-semibold rounded-xl whitespace-nowrap active:scale-95 transition cursor-pointer ${
                  faqCategory === 'pos'
                    ? 'bg-violet-600 text-white shadow-xs'
                    : 'bg-white dark:bg-zinc-900 text-slate-600 dark:text-zinc-300 border border-slate-200/80 dark:border-white/[0.08]'
                }`}
              >
                POS & Hardware
              </button>
              <button
                onClick={() => setFaqCategory('customers')}
                className={`px-3.5 py-2 text-xs font-semibold rounded-xl whitespace-nowrap active:scale-95 transition cursor-pointer ${
                  faqCategory === 'customers'
                    ? 'bg-violet-600 text-white shadow-xs'
                    : 'bg-white dark:bg-zinc-900 text-slate-600 dark:text-zinc-300 border border-slate-200/80 dark:border-white/[0.08]'
                }`}
              >
                Customer Credit
              </button>
            </div>
          </div>

          {/* FAQ Accordion List (Zero Layout Shift via CSS Grid) */}
          <div className="space-y-3.5">
            {filteredFaqs.length === 0 ? (
              <div className="p-8 text-center bg-white dark:bg-zinc-900/80 rounded-2xl border border-slate-200/80 dark:border-white/[0.08] text-xs text-slate-500">
                No matching questions found. Try a different search term or contact our support team.
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
                      className="w-full p-4 sm:p-5 text-left font-bold text-slate-900 dark:text-white flex justify-between items-center cursor-pointer transition-colors duration-150"
                    >
                      <span className="text-sm sm:text-base pr-4">{faq.q}</span>
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
                        <div className="px-4 sm:px-5 pb-5 text-xs sm:text-sm text-slate-600 dark:text-zinc-300 leading-relaxed border-t border-slate-100 dark:border-white/[0.04] pt-3">
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
      <section id="contact" className="py-20 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">

          {/* Left Column: Direct Support Access */}
          <div className="lg:col-span-6 space-y-7">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-violet-600 dark:text-violet-400 mb-2">
                <FiPhone className="w-3.5 h-3.5" />
                <span>Direct MegaTrix Support</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                We're Here to Help Your Business Succeed.
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-300 mt-3 leading-relaxed">
                Have questions regarding hardware compatibility, custom ledger setups, or migrating your legacy data? Connect directly with our engineering team in Pakistan.
              </p>
            </div>

            {/* Direct Contact Badges */}
            <div className="space-y-3.5">
              <a
                href="tel:03254567318"
                className="p-4 bg-white dark:bg-zinc-900/80 rounded-2xl border border-slate-200/80 dark:border-white/[0.08] flex items-center gap-4 shadow-xs hover:border-violet-500/40 hover:-translate-y-0.5 transition duration-150 group"
              >
                <div className="w-11 h-11 rounded-xl bg-violet-500/10 text-violet-600 dark:text-violet-400 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition">
                  <FiPhone className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">Direct Call / WhatsApp</p>
                  <p className="text-sm sm:text-base font-bold text-slate-900 dark:text-white font-mono">0325-4567318</p>
                  <p className="text-[11px] text-slate-500">Monday – Saturday: 9:00 AM to 8:00 PM</p>
                </div>
              </a>

              <a
                href="mailto:support@megatrixai.com"
                className="p-4 bg-white dark:bg-zinc-900/80 rounded-2xl border border-slate-200/80 dark:border-white/[0.08] flex items-center gap-4 shadow-xs hover:border-indigo-500/40 hover:-translate-y-0.5 transition duration-150 group"
              >
                <div className="w-11 h-11 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition">
                  <FiMail className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">Official MegaTrix Email</p>
                  <p className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">support@megatrixai.com</p>
                  <p className="text-[11px] text-slate-500">Priority response guaranteed within 2 hours</p>
                </div>
              </a>
            </div>
          </div>

          {/* Right Column: Inquiry Form */}
          <div className="lg:col-span-6 bg-white/80 dark:bg-zinc-900/90 p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-white/[0.08] shadow-lg backdrop-blur-xl">
            <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mb-1">
              Send Us a Message
            </h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mb-6">
              Our specialists will respond directly to review your store setup.
            </p>

            {contactSubmitted && (
              <div className="mb-5 p-3.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 rounded-xl flex items-center gap-2.5 animate-fade-in">
                <FiCheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                <p className="text-xs font-semibold text-emerald-800 dark:text-emerald-300">
                  Thank you! Your inquiry was received. We will reach out shortly.
                </p>
              </div>
            )}

            <form onSubmit={handleContactSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={contactForm.name}
                  onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                  placeholder="e.g. Muhammad Usman"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-zinc-950 border border-slate-200/90 dark:border-white/[0.08] rounded-xl text-xs sm:text-sm outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500 transition"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    required
                    value={contactForm.phone}
                    onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                    placeholder="0300-1234567"
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-zinc-950 border border-slate-200/90 dark:border-white/[0.08] rounded-xl text-xs sm:text-sm outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                    Business Sector
                  </label>
                  <select
                    value={contactForm.businessType}
                    onChange={(e) => setContactForm({ ...contactForm, businessType: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-zinc-950 border border-slate-200/90 dark:border-white/[0.08] rounded-xl text-xs sm:text-sm outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500 transition"
                  >
                    <option>Retail Supermarket</option>
                    <option>Wholesale Trader</option>
                    <option>Electronics / Mobile Store</option>
                    <option>Hardware & Sanitary</option>
                    <option>Pharmacy & Healthcare</option>
                    <option>Garments & Footwear</option>
                    <option>Other Business</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                  Message / Requirements
                </label>
                <textarea
                  rows={3}
                  required
                  value={contactForm.message}
                  onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                  placeholder="Share details about your setup or questions..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-zinc-950 border border-slate-200/90 dark:border-white/[0.08] rounded-xl text-xs sm:text-sm outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500 transition resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md shadow-violet-600/20 active:scale-[0.98] transition duration-150 cursor-pointer flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <span>Sending Message...</span>
                ) : (
                  <>
                    <span>Submit Inquiry</span>
                    <FiArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>

        </div>
      </section>

      {/* Footer Bar */}
      <footer className="bg-white dark:bg-[#06080E] border-t border-slate-200/80 dark:border-white/[0.08] py-10 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center cursor-pointer" onClick={() => navigate('/')}>
              <Logo size="md" hoverSlide={true} />
            </div>

            <div className="flex items-center space-x-6 text-xs text-slate-500 dark:text-zinc-400">
              <button onClick={() => scrollToSection('features')} className="hover:underline cursor-pointer">Features</button>
              <button onClick={() => scrollToSection('demo')} className="hover:underline cursor-pointer">Interactive Demo</button>
              <button onClick={() => scrollToSection('faq')} className="hover:underline cursor-pointer">FAQ</button>
              <button onClick={() => scrollToSection('contact')} className="hover:underline cursor-pointer">Contact</button>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-200/60 dark:border-white/[0.05] flex flex-col sm:flex-row items-center justify-between text-[11px] sm:text-xs text-slate-500 dark:text-zinc-400 gap-2">
            <p>© 2026 BizManager by MegaTrix. All rights reserved.</p>
            <p>Direct Support: <a href="tel:03254567318" className="font-semibold hover:underline">0325-4567318</a> • <a href="mailto:support@megatrixai.com" className="font-semibold hover:underline">support@megatrixai.com</a></p>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default LandingPage;
