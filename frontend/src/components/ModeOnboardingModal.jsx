import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useMode } from '../contexts/ModeContext';
import { FiCheck, FiLayers, FiZap, FiSmile, FiInfo, FiX } from 'react-icons/fi';

export const ModeOnboardingModal = () => {
  const { language, isRtl } = useLanguage();
  const { showModeOnboarding, completeModeOnboarding, mode, setMode } = useMode();

  if (!showModeOnboarding) return null;

  const handleSelectMode = (chosenMode) => {
    setMode(chosenMode);
    completeModeOnboarding();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
      <div 
        dir={isRtl ? 'rtl' : 'ltr'} 
        className="bg-white dark:bg-[#0C0F16] border border-gray-200 dark:border-gray-800 rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl relative"
      >
        {/* Close button */}
        <button
          onClick={completeModeOnboarding}
          className="absolute top-4 end-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-2 rounded-lg transition-colors"
          title={language === 'ur' ? 'بند کریں' : 'Close'}
        >
          <FiX className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center mb-3 shadow-inner">
            <FiLayers className="w-7 h-7" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white font-urdu">
            {language === 'ur' ? 'آپ کون سا موڈ استعمال کرنا چاہتے ہیں؟' : 'Which Mode Do You Want to Use?'}
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 font-urdu">
            {language === 'ur'
              ? 'اپنی سہولت کے مطابق موڈ منتخب کریں'
              : 'Choose the mode that best fits your daily workflow'}
          </p>
        </div>

        {/* Disclaimer Notice Banner as specified by user */}
        <div className="mb-6 p-3.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-2xl flex items-center gap-3 text-amber-800 dark:text-amber-300">
          <FiInfo className="w-5 h-5 flex-shrink-0 text-amber-600 dark:text-amber-400" />
          <p className="text-xs sm:text-sm font-semibold font-urdu">
            {language === 'ur'
              ? 'آپ اپنا انتخاب بعد میں پورٹل سے کسی بھی وقت تبدیل کر سکتے ہیں'
              : 'You can change your choice later from the portal'}
          </p>
        </div>

        {/* Mode Cards */}
        <div className="grid grid-cols-1 gap-4">
          {/* Asan Mode Card (Recommended) */}
          <button
            type="button"
            onClick={() => handleSelectMode('asan')}
            className={`text-start p-5 rounded-2xl border-2 transition-all relative group ${
              mode === 'asan'
                ? 'border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/40 shadow-sm'
                : 'border-gray-200 dark:border-gray-800 hover:border-emerald-400 bg-white dark:bg-gray-900/40 hover:bg-emerald-50/30'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3.5">
                <span className="w-12 h-12 rounded-xl bg-emerald-500 text-white flex items-center justify-center text-2xl shadow-sm flex-shrink-0">
                  <FiSmile />
                </span>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white font-urdu">
                      {language === 'ur' ? 'آسان موڈ (Asan Mode)' : 'Asan Mode (Simple)'}
                    </h3>
                    <span className="bg-emerald-600 text-white text-[11px] px-2.5 py-0.5 rounded-full font-bold">
                      {language === 'ur' ? 'عام دکاندار کے لیے تجویز کردہ' : 'Recommended for Shopkeepers'}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 mt-1 font-urdu">
                    {language === 'ur'
                      ? 'سادہ، تیز اور آسان۔ کاؤنٹر سیل، سامان اور ادھار کا آسان حساب کتاب۔'
                      : 'Simple, fast, and intuitive. Counter billing, inventory, and udhaar tracking.'}
                  </p>
                </div>
              </div>
              <span className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                mode === 'asan' ? 'border-emerald-600 bg-emerald-600 text-white' : 'border-gray-300 dark:border-gray-700'
              }`}>
                {mode === 'asan' && <FiCheck className="w-3.5 h-3.5" />}
              </span>
            </div>

            <div className="mt-3 pt-3 border-t border-emerald-200 dark:border-emerald-800/50 grid grid-cols-2 gap-2 text-xs text-emerald-800 dark:text-emerald-300 font-urdu">
              <span>✓ {language === 'ur' ? 'صرف 7 بنیادی مینیو' : 'Only 7 simple menus'}</span>
              <span>✓ {language === 'ur' ? 'ادھار کھاتہ اور واٹس ایپ یاد دہانی' : 'Udhaar khata & WhatsApp reminders'}</span>
              <span>✓ {language === 'ur' ? 'کاؤنٹر سے تیز ترین بلنگ' : 'Fast counter POS billing'}</span>
              <span>✓ {language === 'ur' ? 'کوئی غیر ضروری الجھن نہیں' : 'Zero confusing jargon'}</span>
            </div>
          </button>

          {/* Pro Mode Card */}
          <button
            type="button"
            onClick={() => handleSelectMode('pro')}
            className={`text-start p-5 rounded-2xl border-2 transition-all relative group ${
              mode === 'pro'
                ? 'border-violet-500 bg-violet-50/70 dark:bg-violet-950/40 shadow-sm'
                : 'border-gray-200 dark:border-gray-800 hover:border-violet-400 bg-white dark:bg-gray-900/40 hover:bg-violet-50/30'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3.5">
                <span className="w-12 h-12 rounded-xl bg-violet-600 text-white flex items-center justify-center text-2xl shadow-sm flex-shrink-0">
                  <FiZap />
                </span>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white font-urdu">
                      {language === 'ur' ? 'پرو موڈ (Pro Mode)' : 'Pro Mode (Advanced ERP)'}
                    </h3>
                    <span className="bg-violet-100 dark:bg-violet-900/60 text-violet-700 dark:text-violet-300 text-[11px] px-2.5 py-0.5 rounded-full font-bold">
                      {language === 'ur' ? 'بڑے کاروبار اور ہول سیلرز کے لیے' : 'For Wholesalers & Power Users'}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 mt-1 font-urdu">
                    {language === 'ur'
                      ? 'مکمل ERP اور تمام فیچرز۔ تفصیلی رپورٹس، خریداری و فروخت آرڈرز اور اکاؤنٹس۔'
                      : 'Complete business ERP with all advanced modules, purchase orders, and analytics.'}
                  </p>
                </div>
              </div>
              <span className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                mode === 'pro' ? 'border-violet-600 bg-violet-600 text-white' : 'border-gray-300 dark:border-gray-700'
              }`}>
                {mode === 'pro' && <FiCheck className="w-3.5 h-3.5" />}
              </span>
            </div>

            <div className="mt-3 pt-3 border-t border-violet-100 dark:border-violet-900/40 grid grid-cols-2 gap-2 text-xs text-violet-800 dark:text-violet-300 font-urdu">
              <span>✓ {language === 'ur' ? 'تمام 50+ فیچرز اور مینیو' : 'All 50+ features & menus'}</span>
              <span>✓ {language === 'ur' ? 'خریداری و فروخت آرڈرز' : 'Sales & purchase orders'}</span>
              <span>✓ {language === 'ur' ? 'تفصیلی رپورٹس اور تجزیات' : 'Detailed reports & analytics'}</span>
              <span>✓ {language === 'ur' ? 'کثیر بینکاری اور چیک مینجمنٹ' : 'Multi-bank accounts & cheques'}</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModeOnboardingModal;
