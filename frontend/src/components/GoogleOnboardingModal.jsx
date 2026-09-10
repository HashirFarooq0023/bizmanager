import React, { useState, useContext } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { updateProfile, clearNewGoogleUser } from '../redux/slices/authSlice';
import { useLanguage } from '../contexts/LanguageContext';
import { ModeContext } from '../contexts/ModeContext';
import { FiShoppingBag, FiCheck, FiSmile, FiZap, FiInfo } from 'react-icons/fi';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-3.5 sm:p-6 overflow-y-auto animate-fade-in">
      <div
        dir={isRtl ? 'rtl' : 'ltr'}
        className="bg-white dark:bg-[#0C0F17] border border-slate-200 dark:border-white/[0.1] rounded-3xl max-w-xl w-full p-5 sm:p-8 shadow-2xl relative my-auto transition-all"
      >
        {/* Header Icon & Title */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-violet-600/20 to-indigo-600/20 border border-violet-500/30 text-violet-600 dark:text-violet-400 mx-auto flex items-center justify-center mb-3 shadow-inner">
            <FiShoppingBag className="w-7 h-7" />
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-100/90 dark:bg-violet-950/50 border border-violet-200 dark:border-violet-800/60 text-[11px] font-semibold text-violet-700 dark:text-violet-300 mb-2 font-urdu">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>
              {language === 'ur' ? 'گوگل اکاؤنٹ تصدیق شدہ' : 'Google Account Connected'}
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-urdu tracking-tight">
            {language === 'ur' ? 'اپنے اسٹور کا سیٹ اپ مکمل کریں' : 'Set Up Your Store & Mode'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 mt-1 font-urdu">
            {language === 'ur'
              ? 'بِز مینیجر میں خوش آمدید! شروع کرنے کے لیے اپنی دکان کا نام اور پسندیدہ موڈ منتخب کریں۔'
              : 'Welcome to BizManager! Enter your store name and select your preferred operating mode to get started.'}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 rounded-xl text-rose-700 dark:text-rose-300 text-xs sm:text-sm font-semibold font-urdu">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Store Name Input */}
          <div>
            <label
              htmlFor="onboarding-shopName"
              className="block text-xs sm:text-sm font-bold text-slate-800 dark:text-zinc-200 mb-1.5 font-urdu"
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
              className="w-full px-4 py-3 text-sm sm:text-base border border-slate-300 dark:border-white/[0.12] bg-slate-50 dark:bg-[#05060A] text-slate-900 dark:text-white rounded-xl outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500 dark:focus:border-violet-500 transition font-sans placeholder:text-slate-400 dark:placeholder:text-zinc-600"
            />
          </div>

          {/* Mode Selection */}
          <div className="space-y-3">
            <label className="block text-xs sm:text-sm font-bold text-slate-800 dark:text-zinc-200 font-urdu">
              {language === 'ur' ? 'کام کرنے کا طریقہ کار (موڈ) منتخب کریں *' : 'Choose Operating Mode *'}
            </label>

            <div className="grid grid-cols-1 gap-3">
              {/* Asan Mode Option */}
              <div
                onClick={() => setPreferredMode('asan')}
                className={`cursor-pointer p-4 rounded-2xl border-2 transition-all relative ${
                  preferredMode === 'asan'
                    ? 'border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/40 shadow-sm'
                    : 'border-slate-200 dark:border-white/[0.08] hover:border-emerald-400 bg-white dark:bg-zinc-900/40'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center text-xl shadow-xs flex-shrink-0">
                      <FiSmile />
                    </span>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white font-urdu">
                          {language === 'ur' ? 'آسان موڈ (Asan Mode)' : 'Asan Mode (Simple)'}
                        </h3>
                        <span className="bg-emerald-600 text-white text-[10px] sm:text-[11px] px-2 py-0.5 rounded-full font-bold">
                          {language === 'ur' ? 'عام دکاندار کے لیے تجویز کردہ' : 'Recommended for Retail'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-zinc-300 mt-1 font-urdu leading-relaxed">
                        {language === 'ur'
                          ? 'کاؤنٹر بلنگ، سادہ سامان کا حساب اور آسان ادھار کھاتہ۔'
                          : 'Simple, fast, and intuitive. Counter billing, inventory, and udhaar tracking.'}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-1 ${
                      preferredMode === 'asan'
                        ? 'border-emerald-600 bg-emerald-600 text-white'
                        : 'border-slate-300 dark:border-zinc-700'
                    }`}
                  >
                    {preferredMode === 'asan' && <FiCheck className="w-3 h-3" />}
                  </span>
                </div>
              </div>

              {/* Pro Mode Option */}
              <div
                onClick={() => setPreferredMode('pro')}
                className={`cursor-pointer p-4 rounded-2xl border-2 transition-all relative ${
                  preferredMode === 'pro'
                    ? 'border-violet-500 bg-violet-50/70 dark:bg-violet-950/40 shadow-sm'
                    : 'border-slate-200 dark:border-white/[0.08] hover:border-violet-400 bg-white dark:bg-zinc-900/40'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-10 h-10 rounded-xl bg-violet-600 text-white flex items-center justify-center text-xl shadow-xs flex-shrink-0">
                      <FiZap />
                    </span>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white font-urdu">
                          {language === 'ur' ? 'پرو موڈ (Pro Mode)' : 'Pro Mode (Advanced ERP)'}
                        </h3>
                        <span className="bg-violet-100 dark:bg-violet-900/60 text-violet-700 dark:text-violet-300 text-[10px] sm:text-[11px] px-2 py-0.5 rounded-full font-bold">
                          {language === 'ur' ? 'بڑے کاروبار اور ہول سیلرز' : 'For Wholesalers & Power Users'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-zinc-300 mt-1 font-urdu leading-relaxed">
                        {language === 'ur'
                          ? 'تمام 50+ فیچرز، تفصیلی رپورٹس، خریداری و فروخت آرڈرز اور اکاؤنٹس۔'
                          : 'Complete business ERP with all advanced modules, purchase orders, and analytics.'}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-1 ${
                      preferredMode === 'pro'
                        ? 'border-violet-600 bg-violet-600 text-white'
                        : 'border-slate-300 dark:border-zinc-700'
                    }`}
                  >
                    {preferredMode === 'pro' && <FiCheck className="w-3 h-3" />}
                  </span>
                </div>
              </div>
            </div>

            {/* Change Later Notice */}
            <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/50 rounded-xl flex items-center gap-2.5 text-amber-800 dark:text-amber-300 text-xs font-semibold font-urdu">
              <FiInfo className="w-4 h-4 flex-shrink-0 text-amber-600 dark:text-amber-400" />
              <span>
                {language === 'ur'
                  ? 'آپ اپنا انتخاب بعد میں پورٹل سے کسی بھی وقت تبدیل کر سکتے ہیں'
                  : 'You can change your choice later anytime from the portal'}
              </span>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold rounded-xl text-sm sm:text-base shadow-lg shadow-violet-600/25 border border-white/20 transition-all transform active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2 font-urdu"
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
        </form>
      </div>
    </div>
  );
};

export default GoogleOnboardingModal;
