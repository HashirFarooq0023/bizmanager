import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useTheme } from '../contexts/ThemeContext';
import Logo from '../components/Logo';

const LandingPage = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { theme, toggleTheme } = useTheme();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activePreviewTab, setActivePreviewTab] = useState('pos');
  const [faqCategory, setFaqCategory] = useState('all');
  const [faqSearch, setFaqSearch] = useState('');
  const [openFaq, setOpenFaq] = useState(0);

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

  const handleContactSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setContactSubmitted(true);
      setContactForm({ name: '', email: '', phone: '', businessType: 'Retail Store', message: '' });
      setTimeout(() => setContactSubmitted(false), 6000);
    }, 800);
  };

  const faqs = [
    {
      cat: 'general',
      q: "What is BizManager and who is it designed for?",
      a: "BizManager by MegaTrix is an all-in-one business operating system tailored for retail shops, wholesalers, supermarkets, hardware stores, electronics shops, and distributors. It merges POS sales, inventory control, party ledgers, and profit reporting into one clean app."
    },
    {
      cat: 'pos',
      q: "Does BizManager work with my barcode scanner and thermal receipt printer?",
      a: "Yes! BizManager natively supports standard USB and Bluetooth barcode scanners, cash drawers, and ESC/POS thermal printers (80mm & 58mm). You can scan items, calculate change, and print receipts in milliseconds."
    },
    {
      cat: 'customers',
      q: "How does customer credit & udhaar tracking work?",
      a: "BizManager maintains automatic credit ledgers for every customer. When a customer buys on credit, their balance updates automatically. You can set credit limits, view aging dues, and send payment reminders via SMS or WhatsApp."
    },
    {
      cat: 'inventory',
      q: "Can I manage low stock alerts and barcode generation?",
      a: "Absolutely. Set minimum reorder points for any product. When stock drops below the safety threshold, BizManager highlights it on your dashboard. You can also print customized barcode labels directly from your inventory screen."
    },
    {
      cat: 'security',
      q: "Is my business financial data secure?",
      a: "Your data is stored in bank-grade encrypted cloud infrastructure with daily automated backups. Only authorized account owners and staff with assigned roles can access your business records."
    },
    {
      cat: 'pricing',
      q: "Are there any hidden transaction fees or long-term contracts?",
      a: "Zero hidden fees. We offer simple, transparent subscription plans with lifetime support by MegaTrix. You can start with a 14-day free trial without entering a credit card."
    }
  ];

  const filteredFaqs = faqs.filter(faq => {
    const matchesCat = faqCategory === 'all' || faq.cat === faqCategory;
    const matchesSearch = faq.q.toLowerCase().includes(faqSearch.toLowerCase()) || faq.a.toLowerCase().includes(faqSearch.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#080B10] text-slate-900 dark:text-slate-100 font-sans selection:bg-violet-600 selection:text-white transition-colors duration-200">

      {/* Glassmorphic Top Header */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-[#090D14]/80 backdrop-blur-xl border-b border-slate-200/80 dark:border-slate-800/80 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">

          {/* Logo & Brand */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigate('/')}>
            <Logo size="md" showText={true} showSubtitle={true} />
          </div>

          {/* Desktop Links */}
          <nav className="hidden md:flex items-center space-x-8 text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
            <button onClick={() => scrollToSection('features')} className="hover:text-violet-600 dark:hover:text-violet-400 transition-colors cursor-pointer">
              Features
            </button>
            <button onClick={() => scrollToSection('demo')} className="hover:text-violet-600 dark:hover:text-violet-400 transition-colors cursor-pointer">
              Interactive Demo
            </button>
            <button onClick={() => scrollToSection('solutions')} className="hover:text-violet-600 dark:hover:text-violet-400 transition-colors cursor-pointer">
              Solutions
            </button>
            <button onClick={() => scrollToSection('faq')} className="hover:text-violet-600 dark:hover:text-violet-400 transition-colors cursor-pointer">
              FAQ
            </button>
            <button onClick={() => scrollToSection('contact')} className="hover:text-violet-600 dark:hover:text-violet-400 transition-colors cursor-pointer">
              Contact Us
            </button>
          </nav>

          {/* Right Action Controls */}
          <div className="hidden md:flex items-center space-x-3">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="Toggle Light / Dark Mode"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              )}
            </button>

            {user ? (
              <button
                onClick={() => navigate('/dashboard')}
                className="px-4 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 dark:bg-violet-600 dark:hover:bg-violet-500 rounded-xl shadow-sm transition-all transform active:scale-95 cursor-pointer"
              >
                Go to Dashboard →
              </button>
            ) : (
              <>
                <button
                  onClick={() => navigate('/login')}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-violet-600 dark:hover:text-violet-400 transition-colors cursor-pointer"
                >
                  Sign In
                </button>
                <button
                  onClick={() => navigate('/register')}
                  className="px-4 py-2 text-xs font-bold text-white bg-violet-600 hover:bg-violet-500 rounded-xl shadow-md shadow-violet-500/20 transition-all transform active:scale-95 cursor-pointer"
                >
                  Get Started Free
                </button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center space-x-2">
            <button
              onClick={toggleTheme}
              className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
            >
              {theme === 'light' ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
              )}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c1017] px-4 pt-3 pb-6 space-y-3">
            <button onClick={() => scrollToSection('features')} className="block w-full text-left py-2 text-sm font-medium text-slate-700 dark:text-slate-200">
              Features
            </button>
            <button onClick={() => scrollToSection('demo')} className="block w-full text-left py-2 text-sm font-medium text-slate-700 dark:text-slate-200">
              Interactive Demo
            </button>
            <button onClick={() => scrollToSection('solutions')} className="block w-full text-left py-2 text-sm font-medium text-slate-700 dark:text-slate-200">
              Solutions
            </button>
            <button onClick={() => scrollToSection('faq')} className="block w-full text-left py-2 text-sm font-medium text-slate-700 dark:text-slate-200">
              FAQ
            </button>
            <button onClick={() => scrollToSection('contact')} className="block w-full text-left py-2 text-sm font-medium text-slate-700 dark:text-slate-200">
              Contact Us
            </button>
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-col gap-2">
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
                    className="w-full py-2.5 text-center text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 rounded-xl"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => navigate('/register')}
                    className="w-full py-2.5 text-center text-xs font-bold text-white bg-violet-600 rounded-xl"
                  >
                    Get Started Free
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="relative pt-16 pb-20 overflow-hidden">
        {/* Ambient Gradient Background Glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-violet-600/20 via-indigo-500/10 to-purple-600/20 blur-[130px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">

          {/* Product Announcement Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-violet-50 dark:bg-violet-950/50 border border-violet-200 dark:border-violet-800/60 mb-8 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-violet-600 animate-pulse" />
            <span className="text-xs font-semibold text-violet-700 dark:text-violet-300 tracking-wide">
              The Next-Gen Operating System for Retail & Wholesale
            </span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 dark:text-white max-w-5xl mx-auto leading-[1.1]">
            Run Your Business With{' '}
            <span className="bg-gradient-to-r from-violet-600 via-indigo-500 to-purple-600 bg-clip-text text-transparent">
              Zero Chaos & Full Control.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mt-6 text-base sm:text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed">
            Eliminate inventory mismatches, track customer credit automatically, speed up POS checkout, and get clear net profit insights in seconds.
          </p>

          {/* CTA Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => navigate(user ? '/dashboard' : '/register')}
              className="w-full sm:w-auto px-8 py-4 text-sm font-bold text-white bg-violet-600 hover:bg-violet-500 rounded-2xl shadow-lg shadow-violet-500/25 transition-all transform hover:-translate-y-0.5 active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>{user ? 'Open Your Dashboard' : 'Start 14-Day Free Trial'}</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
            <button
              onClick={() => scrollToSection('demo')}
              className="w-full sm:w-auto px-7 py-4 text-sm font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 rounded-2xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <svg className="w-4 h-4 text-violet-600 dark:text-violet-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
              <span>Explore Interactive Demo</span>
            </button>
          </div>

          {/* Key Checklist Metrics */}
          <div className="mt-8 flex flex-wrap justify-center items-center gap-y-2 gap-x-6 text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-1.5">
              <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
              <span>Fast POS Counter</span>
            </div>
            <div className="flex items-center gap-1.5">
              <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
              <span>Automatic Customer Ledgers</span>
            </div>
            <div className="flex items-center gap-1.5">
              <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
              <span>Low-Stock Guardian</span>
            </div>
            <div className="flex items-center gap-1.5">
              <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
              <span>Real-Time Net Profit</span>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Live App Preview Frame */}
      <section id="demo" className="py-12 bg-slate-100/60 dark:bg-[#0A0E17]/60 border-y border-slate-200/80 dark:border-slate-800/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-xs font-bold uppercase tracking-widest text-violet-600 dark:text-violet-400">
              Interactive Product Demo
            </h2>
            <p className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white mt-1">
              See How BizManager Operates in Real Time
            </p>
          </div>

          {/* Interactive Preview Container */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">

            {/* Browser Header Bar */}
            <div className="px-5 py-3.5 bg-slate-100 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="w-3 h-3 rounded-full bg-rose-500 inline-block" />
                <span className="w-3 h-3 rounded-full bg-amber-500 inline-block" />
                <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
                <span className="ml-3 text-xs font-mono text-slate-400 dark:text-slate-500 hidden sm:inline-block">
                  app.bizmanager.com/dashboard
                </span>
              </div>

              {/* Demo Mode Tabs */}
              <div className="flex items-center bg-slate-200 dark:bg-slate-800 p-1 rounded-xl gap-1 text-xs font-semibold">
                <button
                  onClick={() => setActivePreviewTab('pos')}
                  className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${activePreviewTab === 'pos' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs' : 'text-slate-600 dark:text-slate-400'}`}
                >
                  POS Counter
                </button>
                <button
                  onClick={() => setActivePreviewTab('inventory')}
                  className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${activePreviewTab === 'inventory' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs' : 'text-slate-600 dark:text-slate-400'}`}
                >
                  Inventory Control
                </button>
                <button
                  onClick={() => setActivePreviewTab('ledgers')}
                  className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${activePreviewTab === 'ledgers' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs' : 'text-slate-600 dark:text-slate-400'}`}
                >
                  Customer Dues
                </button>
                <button
                  onClick={() => setActivePreviewTab('analytics')}
                  className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${activePreviewTab === 'analytics' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs' : 'text-slate-600 dark:text-slate-400'}`}
                >
                  Net Profit
                </button>
              </div>
            </div>

            {/* Tab View Content */}
            <div className="p-6 sm:p-8 bg-slate-50/50 dark:bg-slate-900/50 min-h-[380px]">
              {activePreviewTab === 'pos' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white">POS Checkout Terminal</h3>
                      <p className="text-xs text-slate-500">Scan barcodes, add items to cart, print receipt in 1 click.</p>
                    </div>
                    <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-xs font-bold rounded-full">
                      Ready to Scan
                    </span>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-3">
                      <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 flex justify-between items-center">
                        <div>
                          <p className="text-sm font-bold text-slate-900 dark:text-white">Samsung 24" LED Monitor</p>
                          <p className="text-xs text-slate-500">SKU: MON-SAM-24 • Stock: 14 units</p>
                        </div>
                        <p className="text-sm font-bold text-slate-900 dark:text-white">Rs. 24,500</p>
                      </div>
                      <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 flex justify-between items-center">
                        <div>
                          <p className="text-sm font-bold text-slate-900 dark:text-white">Wireless Mechanical Keyboard</p>
                          <p className="text-xs text-slate-500">SKU: KEY-MECH-W • Stock: 28 units</p>
                        </div>
                        <p className="text-sm font-bold text-slate-900 dark:text-white">Rs. 6,800</p>
                      </div>
                    </div>

                    <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-4">
                      <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Current Cart Total</div>
                      <div className="text-3xl font-extrabold text-violet-600 dark:text-violet-400">Rs. 31,300</div>
                      <button className="w-full py-3 bg-violet-600 text-white font-bold rounded-xl text-sm shadow-md hover:bg-violet-500 transition">
                        Complete Cash Checkout & Print
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {activePreviewTab === 'inventory' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Real-Time Inventory Stock</h3>
                    <span className="text-xs text-amber-600 dark:text-amber-400 font-bold">2 Low-Stock Warnings</span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-200/60 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold uppercase">
                        <tr>
                          <th className="p-3">Product Name</th>
                          <th className="p-3">SKU</th>
                          <th className="p-3">In Stock</th>
                          <th className="p-3">Purchase Rate</th>
                          <th className="p-3">Selling Price</th>
                          <th className="p-3">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-700 dark:text-slate-200">
                        <tr>
                          <td className="p-3 font-semibold">Logitech MX Master 3S Mouse</td>
                          <td className="p-3 font-mono">LOG-MX-3S</td>
                          <td className="p-3 font-bold text-rose-600">3 left</td>
                          <td className="p-3">Rs. 18,000</td>
                          <td className="p-3 font-bold">Rs. 22,500</td>
                          <td className="p-3"><span className="px-2 py-0.5 bg-rose-100 text-rose-700 text-[10px] font-bold rounded">Reorder Alert</span></td>
                        </tr>
                        <tr>
                          <td className="p-3 font-semibold">Dell UltraSharp 27" 4K Monitor</td>
                          <td className="p-3 font-mono">DEL-U27-4K</td>
                          <td className="p-3 font-bold text-emerald-600">42 left</td>
                          <td className="p-3">Rs. 85,000</td>
                          <td className="p-3 font-bold">Rs. 102,000</td>
                          <td className="p-3"><span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded">Healthy</span></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activePreviewTab === 'ledgers' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Customer Credit & Udhaar Ledger</h3>
                    <p className="text-xs text-slate-500">Total Outstanding Balance: <strong className="text-rose-600">Rs. 170,000</strong></p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 flex justify-between items-center">
                      <div>
                        <p className="text-sm font-bold text-slate-900 dark:text-white">Walk-in VIP Customer (Usman Trader)</p>
                        <p className="text-xs text-slate-500">Phone: 0300-1234567 • Credit Limit: Rs. 200,000</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-extrabold text-rose-600">Rs. 120,000</p>
                        <span className="text-[10px] text-slate-400">Due in 5 days</span>
                      </div>
                    </div>
                    <div className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 flex justify-between items-center">
                      <div>
                        <p className="text-sm font-bold text-slate-900 dark:text-white">Ali Hardware Store</p>
                        <p className="text-xs text-slate-500">Phone: 0321-9876543 • Credit Limit: Rs. 100,000</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-extrabold text-rose-600">Rs. 50,000</p>
                        <span className="text-[10px] text-slate-400">Due today</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activePreviewTab === 'analytics' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">Net Profit & Executive Dashboard</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                      <p className="text-xs text-slate-400 font-bold uppercase">Total Revenue</p>
                      <p className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">Rs. 1,450,000</p>
                    </div>
                    <div className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                      <p className="text-xs text-slate-400 font-bold uppercase">Cash Collected</p>
                      <p className="text-xl font-extrabold text-emerald-600 mt-1">Rs. 1,280,000</p>
                    </div>
                    <div className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                      <p className="text-xs text-slate-400 font-bold uppercase">Expenses</p>
                      <p className="text-xl font-extrabold text-rose-600 mt-1">Rs. 85,000</p>
                    </div>
                    <div className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                      <p className="text-xs text-slate-400 font-bold uppercase">Net Profit</p>
                      <p className="text-xl font-extrabold text-violet-600 dark:text-violet-400 mt-1">Rs. 320,000</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-xs font-bold uppercase tracking-widest text-violet-600 dark:text-violet-400">
            Engineered for Real Businesses
          </h2>
          <p className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white mt-2">
            Everything You Need to Scale Without Headaches
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition">
            <div className="w-12 h-12 rounded-2xl bg-violet-100 dark:bg-violet-950/80 text-violet-600 dark:text-violet-400 flex items-center justify-center mb-6">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Multi-Cart POS Checkout</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Serve multiple walk-in customers simultaneously. Hold carts, scan barcodes, split payments between cash & card, and print instant thermal bills.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition">
            <div className="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-6">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Automated Inventory Sync</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Stock levels decrease on POS sales and increase on purchase receipts automatically. Set reorder limits and print custom barcode labels.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-6">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Customer & Credit Ledgers</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Keep precise track of customer balances, credit limits, overdue payments, and purchase history. Eliminate handwritten notebook errors.
            </p>
          </div>
        </div>
      </section>

      {/* Frequently Asked Questions (Asked Questions) */}
      <section id="faq" className="py-20 bg-slate-100/60 dark:bg-[#0A0E17]/60 border-t border-slate-200/80 dark:border-slate-800/80">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-xs font-bold uppercase tracking-widest text-violet-600 dark:text-violet-400">
              Frequently Asked Questions
            </h2>
            <p className="text-3xl font-extrabold text-slate-900 dark:text-white mt-2">
              Got Questions? We Have Answers.
            </p>
          </div>

          {/* Search & Category Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-3 mb-8">
            <input
              type="text"
              value={faqSearch}
              onChange={(e) => setFaqSearch(e.target.value)}
              placeholder="Search questions (e.g., barcode, credit, printer)..."
              className="flex-1 px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm outline-none focus:ring-2 focus:ring-violet-500/20"
            />
            <div className="flex gap-2 overflow-x-auto pb-1">
              <button
                onClick={() => setFaqCategory('all')}
                className={`px-4 py-2.5 text-xs font-semibold rounded-xl whitespace-nowrap cursor-pointer ${faqCategory === 'all' ? 'bg-violet-600 text-white' : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800'}`}
              >
                All Questions
              </button>
              <button
                onClick={() => setFaqCategory('pos')}
                className={`px-4 py-2.5 text-xs font-semibold rounded-xl whitespace-nowrap cursor-pointer ${faqCategory === 'pos' ? 'bg-violet-600 text-white' : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800'}`}
              >
                POS & Hardware
              </button>
              <button
                onClick={() => setFaqCategory('customers')}
                className={`px-4 py-2.5 text-xs font-semibold rounded-xl whitespace-nowrap cursor-pointer ${faqCategory === 'customers' ? 'bg-violet-600 text-white' : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800'}`}
              >
                Customer Credit
              </button>
            </div>
          </div>

          {/* FAQ Accordion List */}
          <div className="space-y-4">
            {filteredFaqs.length === 0 ? (
              <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-500">
                No matching questions found. Try a different search term or contact support.
              </div>
            ) : (
              filteredFaqs.map((faq, idx) => (
                <div
                  key={idx}
                  className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl overflow-hidden transition-all shadow-xs"
                >
                  <button
                    onClick={() => toggleFaq(idx)}
                    className="w-full p-5 text-left font-bold text-slate-900 dark:text-white flex justify-between items-center cursor-pointer hover:text-violet-600 dark:hover:text-violet-400 transition-colors"
                  >
                    <span className="text-base sm:text-lg">{faq.q}</span>
                    <span className={`w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 transition-transform ${openFaq === idx ? 'rotate-180 bg-violet-100 dark:bg-violet-950 text-violet-600' : ''}`}>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                    </span>
                  </button>
                  {openFaq === idx && (
                    <div className="px-5 pb-5 text-sm text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-slate-800/60 pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Contact Us Section */}
      <section id="contact" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">

          {/* Left Column: Direct Support Info */}
          <div className="space-y-8">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-violet-600 dark:text-violet-400">
                Direct MegaTrix Support
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white mt-2">
                We're Here to Help Your Business Succeed.
              </h2>
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 mt-4 leading-relaxed">
                Have questions about onboarding, barcode hardware compatibility, or custom feature setups? Talk directly to our technical team in Pakistan.
              </p>
            </div>

            {/* Direct Contact Cards */}
            <div className="space-y-4">
              <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 flex items-center gap-4 shadow-xs">
                <div className="w-12 h-12 rounded-xl bg-violet-100 dark:bg-violet-950 text-violet-600 dark:text-violet-400 flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-bold uppercase">Call / WhatsApp Support</p>
                  <a href="tel:03254567318" className="text-base font-bold text-slate-900 dark:text-white hover:text-violet-600 transition">
                    0325-4567318
                  </a>
                  <p className="text-[11px] text-slate-500">Mon - Sat: 9:00 AM to 8:00 PM</p>
                </div>
              </div>

              <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 flex items-center gap-4 shadow-xs">
                <div className="w-12 h-12 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-bold uppercase">Official Support Email</p>
                  <a href="mailto:admin.megatrix@gmail.com" className="text-base font-bold text-slate-900 dark:text-white hover:text-violet-600 transition">
                    admin.megatrix@gmail.com
                  </a>
                  <p className="text-[11px] text-slate-500">Guaranteed response within 2 hours</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Contact Form */}
          <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
              Send Us a Message
            </h3>
            <p className="text-xs text-slate-500 mb-6">
              Fill out the form below and our team will get back to you immediately.
            </p>

            {contactSubmitted && (
              <div className="mb-6 p-4 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900 rounded-xl flex items-center gap-3">
                <svg className="w-5 h-5 text-emerald-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                <p className="text-xs font-semibold text-emerald-800 dark:text-emerald-300">
                  Thank you! Your message has been received. Our MegaTrix support team will contact you shortly.
                </p>
              </div>
            )}

            <form onSubmit={handleContactSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Your Full Name
                </label>
                <input
                  type="text"
                  required
                  value={contactForm.name}
                  onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                  placeholder="e.g. Muhammad Ali"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-violet-500/20"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    required
                    value={contactForm.phone}
                    onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                    placeholder="0300-1234567"
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-violet-500/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Business Type
                  </label>
                  <select
                    value={contactForm.businessType}
                    onChange={(e) => setContactForm({ ...contactForm, businessType: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-violet-500/20"
                  >
                    <option>Retail Supermarket</option>
                    <option>Wholesale Trader</option>
                    <option>Electronics / Mobile Shop</option>
                    <option>Hardware & Paint Store</option>
                    <option>Pharmacy / Medical Store</option>
                    <option>Garments & Boutique</option>
                    <option>Other Business</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  How can we help you?
                </label>
                <textarea
                  rows={4}
                  required
                  value={contactForm.message}
                  onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                  placeholder="Tell us about your business setup or requirements..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-violet-500/20 resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-violet-600 hover:bg-violet-500 text-white font-bold text-sm rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? 'Sending Message...' : 'Submit Contact Inquiry'}
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white dark:bg-[#06090F] border-t border-slate-200 dark:border-slate-800 py-12 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center cursor-pointer" onClick={() => navigate('/')}>
              <Logo size="sm" showText={true} showSubtitle={true} />
            </div>

            <div className="flex items-center space-x-6 text-xs text-slate-500 dark:text-slate-400">
              <button onClick={() => scrollToSection('features')} className="hover:underline cursor-pointer">Features</button>
              <button onClick={() => scrollToSection('demo')} className="hover:underline cursor-pointer">Interactive Demo</button>
              <button onClick={() => scrollToSection('faq')} className="hover:underline cursor-pointer">Asked Questions</button>
              <button onClick={() => scrollToSection('contact')} className="hover:underline cursor-pointer">Contact Us</button>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-200/80 dark:border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 dark:text-slate-400 gap-2">
            <p>© 2026 BizManager by MegaTrix. All rights reserved.</p>
            <p>Support: <a href="tel:03254567318" className="font-semibold hover:underline">0325-4567318</a> • <a href="mailto:admin.megatrix@gmail.com" className="font-semibold hover:underline">admin.megatrix@gmail.com</a></p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
