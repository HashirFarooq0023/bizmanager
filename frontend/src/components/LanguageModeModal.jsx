import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useMode } from '../contexts/ModeContext';
import { FiCheck, FiGlobe, FiLayers, FiZap, FiSmile, FiArrowRight, FiArrowLeft, FiX } from 'react-icons/fi';

export const LanguageModeModal = () => {
  const { language, changeLanguage, isRtl } = useLanguage();
  const { showSetupModal, completeSetup, mode, setMode } = useMode();
  
  // Step 1: Language selection, Step 2: Mode selection (for Urdu)
  const [step, setStep] = useState(1);
  const [selectedLang, setSelectedLang] = useState(language);
  const [selectedMode, setSelectedMode] = useState(mode);

  if (!showSetupModal) return null;

  const handleLanguageSelect = (lang) => {
    setSelectedLang(lang);
    changeLanguage(lang);
    if (lang === 'en') {
      // English automatically sets Pro mode as per user specification
      setMode('pro');
      completeSetup();
    } else {
      // Urdu proceeds to step 2 to choose between Asan and Pro mode
      setStep(2);
    }
  };

  const handleModeConfirm = (chosenMode) => {
    setSelectedMode(chosenMode);
    setMode(chosenMode);
    completeSetup();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white dark:bg-[#0C0F16] border border-gray-200 dark:border-gray-800 rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl relative">
        {/* Step Indicator */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step === 1 ? 'bg-violet-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-400'}`}>
              1
            </span>
            <div className="w-8 h-1 bg-gray-200 dark:bg-gray-800 rounded-full" />
            <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step === 2 ? 'bg-violet-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-400'}`}>
              2
            </span>
          </div>

          <button
            onClick={completeSetup}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-2 rounded-lg"
            title="Close"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* STEP 1: Select Language */}
        {step === 1 && (
          <div>
            <div className="text-center mb-8">
              <div className="w-14 h-14 rounded-2xl bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 mx-auto flex items-center justify-center mb-3">
                <FiGlobe className="w-7 h-7" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                Select Your Language
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 mt-1 font-urdu">
                اپنی پسندیدہ زبان منتخب کریں
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Urdu Option */}
              <button
                type="button"
                onClick={() => handleLanguageSelect('ur')}
                className="group relative flex flex-col items-center p-6 rounded-2xl border-2 border-emerald-500/40 hover:border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-all text-center"
              >
                <span className="text-3xl mb-2">🇵🇰</span>
                <span className="text-2xl font-bold text-emerald-700 dark:text-emerald-400 font-urdu">
                  اردو (Urdu)
                </span>
                <span className="text-sm text-gray-600 dark:text-gray-400 mt-1 font-urdu">
                  آسان اردو، دکانداروں کے لیے تجویز کردہ
                </span>
                <span className="mt-4 px-3 py-1 bg-emerald-600 text-white text-xs font-semibold rounded-full">
                  تجویز کردہ / Recommended
                </span>
              </button>

              {/* English Option */}
              <button
                type="button"
                onClick={() => handleLanguageSelect('en')}
                className="group relative flex flex-col items-center p-6 rounded-2xl border-2 border-gray-200 dark:border-gray-800 hover:border-violet-500 bg-white dark:bg-gray-900/40 hover:bg-violet-50/40 dark:hover:bg-violet-950/20 transition-all text-center"
              >
                <span className="text-3xl mb-2">🇬🇧</span>
                <span className="text-xl font-bold text-gray-900 dark:text-white">
                  English
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Full ERP features in standard English
                </span>
                <span className="mt-4 px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 text-xs font-semibold rounded-full">
                  Standard Pro Mode
                </span>
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Select Mode (For Urdu) */}
        {step === 2 && (
          <div dir="rtl">
            <div className="text-center mb-6">
              <div className="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center mb-3">
                <FiLayers className="w-7 h-7" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white font-urdu">
                آپ کون سا موڈ استعمال کرنا چاہتے ہیں؟
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 font-urdu">
                آپ اسے بعد میں بھی سیٹنگز سے کسی بھی وقت تبدیل کر سکتے ہیں
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {/* Asan Mode Card */}
              <button
                type="button"
                onClick={() => handleModeConfirm('asan')}
                className="text-right p-5 rounded-2xl border-2 border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/30 hover:bg-emerald-100/50 dark:hover:bg-emerald-950/50 transition-all relative group"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center text-xl">
                      <FiSmile />
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white font-urdu">
                          آسان موڈ (Asan Mode)
                        </h3>
                        <span className="bg-emerald-600 text-white text-xs px-2.5 py-0.5 rounded-full font-bold">
                          عام دکاندار کے لیے
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 font-urdu">
                        سادہ، تیز اور عام فہم۔ کاؤنٹر سیل، سامان اور ادھار کا آسان حساب۔
                      </p>
                    </div>
                  </div>
                  <span className="w-6 h-6 rounded-full border-2 border-emerald-600 flex items-center justify-center bg-emerald-600 text-white">
                    <FiCheck className="w-4 h-4" />
                  </span>
                </div>

                <div className="mt-3 pt-3 border-t border-emerald-200 dark:border-emerald-800/50 grid grid-cols-2 gap-2 text-xs text-emerald-800 dark:text-emerald-300 font-urdu">
                  <span>✓ صرف 6 بنیادی مینیو</span>
                  <span>✓ ادھار کھاتہ اور واٹس ایپ یاد دہانی</span>
                  <span>✓ کاؤنٹر سے تیز ترین بلنگ</span>
                  <span>✓ کوئی تکنیکی الجھن نہیں</span>
                </div>
              </button>

              {/* Pro Mode Card */}
              <button
                type="button"
                onClick={() => handleModeConfirm('pro')}
                className="text-right p-5 rounded-2xl border-2 border-gray-200 dark:border-gray-800 hover:border-violet-500 bg-white dark:bg-gray-900/40 hover:bg-violet-50/40 dark:hover:bg-violet-950/20 transition-all group"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-10 h-10 rounded-xl bg-violet-600 text-white flex items-center justify-center text-xl">
                      <FiZap />
                    </span>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white font-urdu">
                        پرو موڈ (Pro Mode)
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 font-urdu">
                        مکمل ERP اور تمام 50+ فیچرز۔ بڑے کاروبار اور ہول سیلرز کے لیے۔
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800 grid grid-cols-2 gap-2 text-xs text-gray-500 dark:text-gray-400 font-urdu">
                  <span>✓ تمام تفصیلی رپورٹس اور تجزیات</span>
                  <span>✓ خریداری اور فروخت کے آرڈرز</span>
                  <span>✓ ڈیلیوری چالان اور کثیر بینکاری</span>
                  <span>✓ ملازمین اور منظوریوں کا نظام</span>
                </div>
              </button>
            </div>

            <div className="mt-6 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 flex items-center gap-1 font-urdu"
              >
                <FiArrowRight className="w-4 h-4" /> زبان واپس تبدیل کریں
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
