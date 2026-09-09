import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { FiShield, FiX, FiCheck } from 'react-icons/fi';

const COOKIE_STORAGE_KEY = 'bizmanager_cookie_consent';

const CookieConsent = ({ initialDelay = (typeof process !== 'undefined' && process.env?.NODE_ENV === 'test' ? 0 : 1200) } = {}) => {
  const [isVisible, setIsVisible] = useState(initialDelay === 0);
  const { language } = useLanguage();

  useEffect(() => {
    // Check if user has previously made a cookie consent selection
    try {
      const consent = localStorage.getItem(COOKIE_STORAGE_KEY);
      if (!consent) {
        if (initialDelay === 0) {
          setIsVisible(true);
        } else {
          const timer = setTimeout(() => setIsVisible(true), initialDelay);
          return () => clearTimeout(timer);
        }
      } else {
        setIsVisible(false);
      }
    } catch {
      // Ignore storage errors in private browsing
    }
  }, [initialDelay]);

  const handleConsent = (level) => {
    try {
      localStorage.setItem(COOKIE_STORAGE_KEY, JSON.stringify({
        level,
        timestamp: new Date().toISOString()
      }));
    } catch {
      // Ignore
    }
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div
      role="region"
      aria-label="Cookie consent banner"
      className="fixed bottom-3 sm:bottom-5 left-3 sm:left-5 right-3 sm:right-auto sm:max-w-md z-50 animate-slide-up"
    >
      <div className="bg-white/95 dark:bg-[#0B0F19]/95 backdrop-blur-xl border border-slate-200/90 dark:border-white/[0.1] rounded-2xl shadow-2xl p-4 sm:p-5 text-slate-800 dark:text-zinc-200 font-sans text-xs sm:text-sm">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2 text-violet-600 dark:text-violet-400 font-bold">
            <span className="p-1.5 rounded-lg bg-violet-500/10 dark:bg-violet-500/20">
              <FiShield className="w-4 h-4" />
            </span>
            <span className={language === 'ur' ? 'font-urdu text-sm' : 'text-xs uppercase tracking-wider'}>
              {language === 'ur' ? 'رازداری اور کوکیز کا انتخاب' : 'Privacy & Cookie Consent'}
            </span>
          </div>

          <button
            onClick={() => handleConsent('dismissed')}
            className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg transition"
            aria-label="Dismiss cookie banner"
          >
            <FiX className="w-4 h-4" />
          </button>
        </div>

        <p className={`mt-2.5 text-slate-600 dark:text-zinc-400 leading-relaxed ${language === 'ur' ? 'font-urdu text-xs sm:text-sm' : 'text-xs'}`}>
          {language === 'ur' ? (
            <>
              ہم بز مینیجر پر محفوظ سیشن، اردو زبان اور تھیم ترجیحات کو یاد رکھنے کے لیے بنیادی کوکیز استعمال کرتے ہیں۔ مزید تفصیلات کے لیے ہماری{' '}
              <Link to="/privacy-policy" className="text-violet-600 dark:text-violet-400 underline font-semibold">
                پرائیویسی پالیسی
              </Link>{' '}
              ملاحظہ کریں۔
            </>
          ) : (
            <>
              BizManager uses essential cookies to keep you signed in securely and remember your language and dark mode preferences. We never sell your store data. Read our{' '}
              <Link to="/privacy-policy" className="text-violet-600 dark:text-violet-400 underline font-semibold">
                Privacy Policy
              </Link>.
            </>
          )}
        </p>

        <div className="mt-3.5 flex items-center gap-2 pt-1">
          <button
            onClick={() => handleConsent('accepted')}
            className="flex-1 py-2 px-3 bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
          >
            <FiCheck className="w-3.5 h-3.5" />
            <span className={language === 'ur' ? 'font-urdu' : ''}>
              {language === 'ur' ? 'تمام قبول کریں' : 'Accept All'}
            </span>
          </button>

          <button
            onClick={() => handleConsent('essential')}
            className="py-2 px-3 bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.06] dark:hover:bg-white/[0.1] text-slate-700 dark:text-zinc-300 font-semibold text-xs rounded-xl border border-slate-200/80 dark:border-white/[0.08] transition cursor-pointer active:scale-95"
          >
            <span className={language === 'ur' ? 'font-urdu' : ''}>
              {language === 'ur' ? 'صرف ضروری' : 'Essential Only'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CookieConsent;
