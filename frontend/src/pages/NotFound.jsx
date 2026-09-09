import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import Logo from '../components/Logo';
import {
  FiHome,
  FiGrid,
  FiPhone,
  FiGlobe,
  FiSun,
  FiMoon,
  FiAlertTriangle,
  FiArrowRight,
  FiArrowLeft
} from 'react-icons/fi';

const NotFound = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { language, changeLanguage, isRtl } = useLanguage();
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    document.title = language === 'ur'
      ? 'صفحہ نہیں ملا (404) — بز مینیجر'
      : '404 - Page Not Found — BizManager';
  }, [language]);

  const BackIcon = isRtl ? FiArrowRight : FiArrowLeft;

  return (
    <div className={`min-h-screen bg-slate-50 dark:bg-[#07090F] text-slate-900 dark:text-slate-100 flex flex-col justify-between transition-colors duration-300 relative overflow-hidden ${language === 'ur' ? 'font-urdu' : 'font-sans'}`}>
      {/* Background Ambient Glows */}
      <div className="fixed -top-32 -left-32 w-80 h-80 sm:w-[500px] sm:h-[500px] bg-violet-600/15 dark:bg-violet-600/20 blur-[120px] rounded-full pointer-events-none -z-10" />
      <div className="fixed -bottom-32 -right-32 w-80 h-80 sm:w-[500px] sm:h-[500px] bg-indigo-600/15 dark:bg-indigo-600/20 blur-[120px] rounded-full pointer-events-none -z-10" />

      {/* Top Header */}
      <header className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex items-center justify-between border-b border-slate-200/60 dark:border-white/[0.06] z-10">
        <Link to="/" className="flex items-center">
          <Logo size="md" showText={true} showSubtitle={true} />
        </Link>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => changeLanguage(language === 'ur' ? 'en' : 'ur')}
            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-white/80 dark:bg-white/[0.05] text-slate-700 dark:text-zinc-300 border border-slate-200/80 dark:border-white/[0.08] shadow-xs hover:bg-slate-100 dark:hover:bg-white/[0.1] transition flex items-center gap-1.5 cursor-pointer"
            title="Switch Language / زبان تبدیل کریں"
          >
            <FiGlobe className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400" />
            <span>{language === 'ur' ? 'English' : 'اردو'}</span>
          </button>

          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-white bg-white/80 dark:bg-white/[0.05] border border-slate-200/80 dark:border-white/[0.08] transition cursor-pointer"
            aria-label="Toggle theme"
          >
            {theme === 'light' ? <FiMoon className="w-4 h-4 text-slate-700" /> : <FiSun className="w-4 h-4 text-amber-400" />}
          </button>
        </div>
      </header>

      {/* Main 404 Hero Section */}
      <main className="flex-1 max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-20 text-center flex flex-col items-center justify-center z-10">
        {/* Large 404 Graphic */}
        <div className="relative mb-6 sm:mb-8">
          <span className="text-8xl sm:text-9xl font-black tracking-tighter bg-gradient-to-br from-violet-600 via-indigo-500 to-purple-600 dark:from-violet-400 dark:via-indigo-300 dark:to-purple-400 bg-clip-text text-transparent select-none">
            404
          </span>
          <div className="absolute -bottom-2 sm:-bottom-3 left-1/2 -translate-x-1/2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 dark:bg-rose-950/40 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-bold whitespace-nowrap shadow-xs">
            <FiAlertTriangle className="w-3.5 h-3.5" />
            <span>{language === 'ur' ? 'صفحہ دستیاب نہیں' : 'Route Not Found'}</span>
          </div>
        </div>

        {/* Headline */}
        <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mb-3">
          {language === 'ur'
            ? 'معذرت! مطلوبہ صفحہ موجود نہیں ہے'
            : 'Oops! The page you were looking for doesn\'t exist'}
        </h1>

        {/* Subtitle */}
        <p className="text-sm sm:text-base text-slate-600 dark:text-zinc-400 max-w-lg mb-8 sm:mb-10 leading-relaxed">
          {language === 'ur'
            ? 'ممکن ہے کہ یہ لنک تبدیل کر دیا گیا ہو، حذف ہو چکا ہو، یا پتہ لکھنے میں کوئی غلطی ہوئی ہو۔ آپ نیچے دیے گئے بٹنز کی مدد سے واپس جا سکتے ہیں۔'
            : 'The URL might be broken, misspelled, or the page may have been relocated. You can safely return to the homepage or navigate directly to your portal.'}
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <button
            onClick={() => navigate('/')}
            className="w-full sm:w-auto px-6 py-3 bg-violet-600 hover:bg-violet-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-violet-600/25 flex items-center justify-center gap-2 active:scale-95 transition cursor-pointer"
          >
            <FiHome className="w-4 h-4" />
            <span>{language === 'ur' ? 'مرکزی صفحہ پر جائیں' : 'Return to Home'}</span>
          </button>

          {user ? (
            <button
              onClick={() => navigate('/dashboard')}
              className="w-full sm:w-auto px-6 py-3 bg-white dark:bg-zinc-900 hover:bg-slate-100 dark:hover:bg-zinc-800 border border-slate-200 dark:border-white/[0.08] text-slate-800 dark:text-zinc-200 font-bold text-sm rounded-xl shadow-xs flex items-center justify-center gap-2 active:scale-95 transition cursor-pointer"
            >
              <FiGrid className="w-4 h-4 text-violet-600 dark:text-violet-400" />
              <span>{language === 'ur' ? 'ڈیش بورڈ کھولیں' : 'Go to Dashboard'}</span>
            </button>
          ) : (
            <button
              onClick={() => navigate('/login')}
              className="w-full sm:w-auto px-6 py-3 bg-white dark:bg-zinc-900 hover:bg-slate-100 dark:hover:bg-zinc-800 border border-slate-200 dark:border-white/[0.08] text-slate-800 dark:text-zinc-200 font-bold text-sm rounded-xl shadow-xs flex items-center justify-center gap-2 active:scale-95 transition cursor-pointer"
            >
              <span>{language === 'ur' ? 'لاگ ان کریں' : 'Sign In to Portal'}</span>
            </button>
          )}

          <a
            href="tel:03254567318"
            className="w-full sm:w-auto px-4 py-3 text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition"
          >
            <FiPhone className="w-3.5 h-3.5" />
            <span>{language === 'ur' ? 'سپورٹ ہیلپ لائن' : 'Call Support'}</span>
          </a>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-4 border-t border-slate-200/60 dark:border-white/[0.06] flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 dark:text-zinc-500 gap-2 z-10">
        <p>© {new Date().getFullYear()} MegaTrix Technologies. BizManager.</p>
        <div className="flex items-center gap-4">
          <Link to="/privacy-policy" className="hover:underline">
            {language === 'ur' ? 'پرائیویسی پالیسی' : 'Privacy Policy'}
          </Link>
          <Link to="/terms" className="hover:underline">
            {language === 'ur' ? 'شرائط و ضوابط' : 'Terms'}
          </Link>
        </div>
      </footer>
    </div>
  );
};

export default NotFound;
