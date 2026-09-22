import React, { useState, useContext } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { updateProfile, clearNewGoogleUser } from '../redux/slices/authSlice';
import { useLanguage } from '../contexts/LanguageContext';
import { ModeContext } from '../contexts/ModeContext';
import { FiShoppingBag, FiCheck, FiLayers, FiCheckCircle } from 'react-icons/fi';

const GoogleOnboardingModal = ({ isOpen, onComplete }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { language, isRtl } = useLanguage();
  const modeContext = useContext(ModeContext);
  const setMode = modeContext?.setMode || ((m) => { localStorage.setItem('bizmanager_mode', m); });
  const { user } = useSelector((state) => state.auth);

  const [shopName, setShopName] = useState(user?.shopName || '');
  const [preferredMode, setPreferredMode] = useState(language === 'ur' ? 'asan' : 'pro');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!shopName.trim()) {
      setError(
        language === 'ur'
          ? 'برائے مہربانی اپنی دکان یا کاروبار کا نام درج کریں۔'
          : 'Please enter your store or business name.'
      );
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      // 1. Update user profile in backend with store name and preferred mode
      await dispatch(
        updateProfile({
          shopName: shopName.trim(),
          preferredMode: preferredMode,
        })
      ).unwrap();

      // 2. Set mode preferences in localStorage & ModeContext
      setMode(preferredMode);
      localStorage.setItem('bizmanager_mode', preferredMode);
      localStorage.setItem('bizmanager_mode_onboarding_completed', 'true');

      // 3. Clear new google user flag
      dispatch(clearNewGoogleUser());

      if (onComplete) {
        onComplete();
      }

      // 4. Navigate to dashboard
      navigate('/dashboard');
    } catch (err) {
      console.error('Failed to complete onboarding:', err);
      setError(
        typeof err === 'string'
          ? err
          : language === 'ur'
          ? 'اسٹور سیٹ اپ محفوظ کرنے میں مسئلہ پیش آیا۔ دوبارہ کوشش کریں۔'
          : 'Failed to save store setup. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto animate-fade-in">
      <div
        dir={isRtl ? 'rtl' : 'ltr'}
        className="bg-white dark:bg-[#0C0F17] border border-slate-200/90 dark:border-zinc-800 rounded-2xl max-w-lg w-full p-5 sm:p-6 shadow-2xl relative my-auto transition-all max-h-[92vh] flex flex-col justify-between"
      >
        {/* Header */}
        <div className="text-center mb-4">
          <div className="w-10 h-10 rounded-xl bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/20 mx-auto flex items-center justify-center mb-2.5">
            <FiShoppingBag className="w-5 h-5" />
          </div>

          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 mb-1.5 font-urdu">
            <FiCheckCircle className="w-3 h-3 text-emerald-500" />
            <span>
              {language === 'ur' ? 'گوگل اکاؤنٹ تصدیق شدہ' : 'Google Account Connected'}
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white font-urdu tracking-tight">
            {language === 'ur' ? 'اپنے اسٹور کا سیٹ اپ مکمل کریں' : 'Set Up Your Store & Mode'}
          </h2>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5 font-urdu">
            {language === 'ur'
              ? 'بِز مینیجر میں خوش آمدید! دکان کا نام درج کریں اور ورک اسپیس شروع کریں۔'
              : 'Enter your store name and choose your preferred workspace mode.'}
          </p>
        </div>

        {error && (
          <div className="mb-3.5 p-2.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 rounded-xl text-rose-700 dark:text-rose-300 text-xs font-semibold font-urdu">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Store Name Input */}
          <div>
            <label
              htmlFor="onboarding-shopName"
              className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1 font-urdu"
            >
              {language === 'ur' ? 'دکان یا کاروبار کا نام *' : 'Store / Business Name *'}
            </label>
            <input
              id="onboarding-shopName"
              type="text"
              required
              autoFocus
              value={shopName}
              onChange={(e) => {
                setShopName(e.target.value);
                if (error) setError('');
              }}
              placeholder={
                language === 'ur' ? 'مثلاً مدینہ سپر اسٹور' : 'e.g. Madina Kiryana Store'
              }
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-900/80 text-slate-900 dark:text-white rounded-xl outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500 dark:focus:border-violet-500 transition placeholder:text-slate-400 dark:placeholder:text-zinc-500"
            />
          </div>

          {/* Mode Selection */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 font-urdu">
              {language === 'ur' ? 'ورک اسپیس موڈ منتخب کریں *' : 'Choose Operating Mode *'}
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* Asan Mode Option */}
              <div
                onClick={() => setPreferredMode('asan')}
                className={`cursor-pointer p-3 rounded-xl border transition-all relative flex flex-col justify-between ${
                  preferredMode === 'asan'
                    ? 'border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/30 shadow-xs'
                    : 'border-slate-200 dark:border-zinc-800/80 hover:border-slate-300 dark:hover:border-zinc-700 bg-white dark:bg-zinc-900/40'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xs flex-shrink-0">
                        <FiShoppingBag className="w-3.5 h-3.5" />
                      </span>
                      <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white font-urdu">
                        {language === 'ur' ? 'آسان موڈ (Asan Mode)' : 'Asan Mode (Simple)'}
                      </h3>
                    </div>
                    <span
                      className={`w-4 h-4 rounded-full border flex items-center justify-center flex-shrink-0 ${
                        preferredMode === 'asan'
                          ? 'border-emerald-600 bg-emerald-600 text-white'
                          : 'border-slate-300 dark:border-zinc-700'
                      }`}
                    >
                      {preferredMode === 'asan' && <FiCheck className="w-2.5 h-2.5" />}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400 font-urdu leading-snug">
                    {language === 'ur'
                      ? 'کاؤنٹر بلنگ، اسٹاک اور ادھار کھاتہ۔'
                      : 'Counter POS, stock & customer udhaar.'}
                  </p>
                </div>
                <div className="mt-2 pt-1.5 border-t border-slate-100 dark:border-white/[0.04]">
                  <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-100/60 dark:bg-emerald-950/50 px-2 py-0.5 rounded-md font-urdu">
                    {language === 'ur' ? 'ریٹیل دکانوں کے لیے' : 'Recommended for Retail'}
                  </span>
                </div>
              </div>

              {/* Pro Mode Option */}
              <div
                onClick={() => setPreferredMode('pro')}
                className={`cursor-pointer p-3 rounded-xl border transition-all relative flex flex-col justify-between ${
                  preferredMode === 'pro'
                    ? 'border-violet-500 bg-violet-50/60 dark:bg-violet-950/30 shadow-xs'
                    : 'border-slate-200 dark:border-zinc-800/80 hover:border-slate-300 dark:hover:border-zinc-700 bg-white dark:bg-zinc-900/40'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-violet-500/15 text-violet-600 dark:text-violet-400 flex items-center justify-center text-xs flex-shrink-0">
                        <FiLayers className="w-3.5 h-3.5" />
                      </span>
                      <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white font-urdu">
                        {language === 'ur' ? 'پرو موڈ (Pro Mode)' : 'Pro Mode (Advanced ERP)'}
                      </h3>
                    </div>
                    <span
                      className={`w-4 h-4 rounded-full border flex items-center justify-center flex-shrink-0 ${
                        preferredMode === 'pro'
                          ? 'border-violet-600 bg-violet-600 text-white'
                          : 'border-slate-300 dark:border-zinc-700'
                      }`}
                    >
                      {preferredMode === 'pro' && <FiCheck className="w-2.5 h-2.5" />}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400 font-urdu leading-snug">
                    {language === 'ur'
                      ? 'مکمل ERP، پرچیز آرڈرز اور اکاؤنٹس۔'
                      : 'Full ERP, purchase orders & ledgers.'}
                  </p>
                </div>
                <div className="mt-2 pt-1.5 border-t border-slate-100 dark:border-white/[0.04]">
                  <span className="text-[10px] font-semibold text-violet-700 dark:text-violet-400 bg-violet-100/60 dark:bg-violet-950/50 px-2 py-0.5 rounded-md font-urdu">
                    {language === 'ur' ? 'ہول سیل اور ملٹی کاؤنٹر' : 'For Wholesalers & ERP'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-1">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-11 bg-violet-600 hover:bg-violet-700 text-white font-semibold rounded-xl text-xs sm:text-sm shadow-sm transition active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2 font-urdu"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>
                    {language === 'ur' ? 'اسٹور سیٹ کیا جا رہا ہے...' : 'Setting up your workspace...'}
                  </span>
                </>
              ) : (
                <span>
                  {language === 'ur' ? 'سیٹ اپ مکمل کریں اور شروع کریں ←' : 'Complete Setup & Enter Dashboard →'}
                </span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GoogleOnboardingModal;

