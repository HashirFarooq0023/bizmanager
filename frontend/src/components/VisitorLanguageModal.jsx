import React from 'react';
import { useSelector } from 'react-redux';
import { useLanguage } from '../contexts/LanguageContext';
import Logo from './Logo';
import { FiX, FiCheck, FiArrowRight } from 'react-icons/fi';

/**
 * VisitorLanguageModal
 * Greets first-time visitors with a choice between English (default) and Urdu.
 * If the user clicks 'X' or closes without choosing, English remains active.
 */
const VisitorLanguageModal = () => {
  const { showVisitorPrompt, confirmLanguage, dismissVisitorPrompt } = useLanguage();
  const { user } = useSelector((state) => state.auth);

  if (!showVisitorPrompt || user) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-md p-4 animate-fade-in">
      <div 
        className="bg-white dark:bg-[#0C0F17] border border-slate-200/90 dark:border-zinc-800/90 rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl relative overflow-hidden transition-all text-slate-900 dark:text-white"
        role="dialog"
        aria-modal="true"
        aria-labelledby="visitor-lang-modal-title"
      >
        {/* Subtle Ambient Glow */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-violet-600/15 dark:bg-violet-600/25 blur-3xl rounded-full pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-indigo-600/15 dark:bg-indigo-600/25 blur-3xl rounded-full pointer-events-none" />

        {/* Modal Top Header Bar */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-zinc-800/80 relative z-10">
          <Logo size="lg" showText={true} showSubtitle={true} />
          
          <button
            type="button"
            onClick={dismissVisitorPrompt}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800/80 transition-all cursor-pointer active:scale-95 flex items-center gap-1 text-xs font-semibold"
            title="Close (Continue in English) / بند کریں"
            aria-label="Close dialog"
          >
            <span className="hidden sm:inline text-[11px] text-slate-400 font-normal">Close</span>
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content Header */}
        <div className="text-center my-6 relative z-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-violet-100 dark:bg-violet-950/60 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-800/60 mb-3">
            🌍 Choose Language / زبان کا انتخاب
          </span>
          <h2 id="visitor-lang-modal-title" className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Select Your Preferred Version
          </h2>
          <p className="text-base sm:text-lg font-bold text-violet-600 dark:text-violet-400 mt-1 font-urdu">
            آپ کون سا ورژن استعمال کرنا چاہتے ہیں؟
          </p>
        </div>

        {/* Two Interactive Selection Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 relative z-10 mb-6">
          
          {/* Card 1: English (Default) */}
          <div
            onClick={() => confirmLanguage('en')}
            className="group relative flex flex-col justify-between p-5 rounded-2xl border-2 border-violet-500/50 hover:border-violet-600 bg-violet-50/40 dark:bg-violet-950/20 hover:bg-violet-50 dark:hover:bg-violet-950/40 transition-all cursor-pointer text-start active:scale-[0.98] shadow-sm hover:shadow-md"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="w-12 h-12 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 flex items-center justify-center text-2xl shadow-xs group-hover:scale-105 transition-transform">
                🇬🇧
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-violet-600 text-white shadow-xs">
                Default
              </span>
            </div>

            <div>
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
                English
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                Standard retail ERP & comprehensive business management tools.
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-200/60 dark:border-zinc-800/60 flex items-center justify-between text-xs font-bold text-violet-600 dark:text-violet-400">
              <span>Continue in English</span>
              <FiArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 2: Urdu (اردو) */}
          <div
            onClick={() => confirmLanguage('ur')}
            className="group relative flex flex-col justify-between p-5 rounded-2xl border-2 border-emerald-500/40 hover:border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/20 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-all cursor-pointer text-start active:scale-[0.98] shadow-sm hover:shadow-md"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="w-12 h-12 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 flex items-center justify-center text-2xl shadow-xs group-hover:scale-105 transition-transform">
                🇵🇰
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-600 text-white shadow-xs font-urdu">
                تجویز کردہ
              </span>
            </div>

            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors font-urdu">
                اردو (Urdu)
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed font-urdu">
                پاکستانی تاجروں اور عام دکانداروں کیلئے آسان اردو اور خودکار ادھار کھاتہ۔
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-200/60 dark:border-zinc-800/60 flex items-center justify-between text-xs font-bold text-emerald-600 dark:text-emerald-400 font-urdu">
              <span>اردو منتخب کریں</span>
              <FiCheck className="w-4 h-4" />
            </div>
          </div>

        </div>

        {/* Informative Disclaimer Footer */}
        <div className="pt-3 border-t border-slate-100 dark:border-zinc-800/80 text-[11px] text-slate-500 dark:text-slate-400 text-center space-y-1 relative z-10">
          <p>
            If you close (✕) or choose nothing, <strong>English</strong> will be shown by default.
          </p>
          <p className="font-urdu text-xs text-slate-400 dark:text-slate-500">
            آپ ویب سائٹ پر موجود گلوب (🌐) بٹن سے زبان کسی بھی وقت تبدیل کر سکتے ہیں۔
          </p>
        </div>

      </div>
    </div>
  );
};

export default VisitorLanguageModal;
