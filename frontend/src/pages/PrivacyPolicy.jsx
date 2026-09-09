import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import Logo from '../components/Logo';
import {
  FiArrowLeft,
  FiArrowRight,
  FiShield,
  FiLock,
  FiDatabase,
  FiUsers,
  FiGlobe,
  FiSun,
  FiMoon,
  FiMail,
  FiPhone,
  FiCheckCircle
} from 'react-icons/fi';

const PrivacyPolicy = () => {
  const navigate = useNavigate();
  const { language, changeLanguage, isRtl } = useLanguage();
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    try { window.scrollTo?.(0, 0); } catch { /* noop */ }
    document.title = language === 'ur'
      ? 'پرائیویسی پالیسی — بز مینیجر از میگا ٹرکس'
      : 'Privacy Policy — BizManager by MegaTrix';
  }, [language]);

  const BackIcon = isRtl ? FiArrowRight : FiArrowLeft;

  return (
    <div className={`min-h-screen bg-slate-50 dark:bg-[#07090F] text-slate-900 dark:text-slate-100 transition-colors duration-300 ${language === 'ur' ? 'font-urdu' : 'font-sans'}`}>
      {/* Top Header Navigation */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-[#0A0D15]/80 backdrop-blur-xl border-b border-slate-200/80 dark:border-white/[0.08]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/')}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.06] transition flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
              title="Return to Home"
            >
              <BackIcon className="w-4 h-4" />
              <span className="hidden sm:inline">{language === 'ur' ? 'مرکزی صفحہ' : 'Back to Home'}</span>
            </button>
            <Link to="/" className="flex items-center">
              <Logo size="md" showText={true} showSubtitle={true} />
            </Link>
          </div>

          <div className="flex items-center gap-2">
            {/* Language Switcher */}
            <button
              type="button"
              onClick={() => changeLanguage(language === 'ur' ? 'en' : 'ur')}
              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100/90 dark:bg-white/[0.07] border border-slate-200/80 dark:border-white/[0.1] text-slate-800 dark:text-zinc-200 hover:bg-slate-200 dark:hover:bg-white/[0.15] transition flex items-center gap-1.5 cursor-pointer shadow-xs"
              title="Switch Language / زبان تبدیل کریں"
            >
              <FiGlobe className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400" />
              <span>{language === 'ur' ? 'English' : 'اردو'}</span>
            </button>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-white bg-slate-100/80 dark:bg-white/[0.05] border border-slate-200/80 dark:border-white/[0.08] transition cursor-pointer"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? <FiMoon className="w-4 h-4 text-slate-700" /> : <FiSun className="w-4 h-4 text-amber-400" />}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
        {/* Title Header */}
        <div className="mb-10 text-center sm:text-start">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-violet-500/10 dark:bg-violet-950/40 border border-violet-500/20 text-violet-700 dark:text-violet-300 text-xs font-semibold mb-4">
            <FiShield className="w-3.5 h-3.5" />
            <span>{language === 'ur' ? 'رازداری اور ڈیٹا کا تحفظ' : 'Privacy & Data Protection'}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-900 dark:text-white">
            {language === 'ur' ? 'پرائیویسی پالیسی' : 'Privacy Policy'}
          </h1>
          <p className="mt-3 text-sm sm:text-base text-slate-500 dark:text-zinc-400">
            {language === 'ur'
              ? 'آخری تجدید: ستمبر ۲۰۲۶ — بز مینیجر (میگا ٹرکس ٹیکنالوجیز کی ایک پراڈکٹ)'
              : 'Last Updated: September 2026 — BizManager (A Product of MegaTrix Technologies)'}
          </p>
        </div>

        {/* Content Container */}
        <div className="bg-white dark:bg-[#0A0D15] rounded-2xl sm:rounded-3xl border border-slate-200/80 dark:border-white/[0.08] p-6 sm:p-10 shadow-sm space-y-8 text-slate-700 dark:text-zinc-300 leading-relaxed text-sm sm:text-base">

          {language === 'ur' ? (
            /* URDU PRIVACY CONTENT */
            <>
              <section className="space-y-3">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <FiShield className="w-5 h-5 text-violet-600 dark:text-violet-400 shrink-0" />
                  <span>۱. تعارف اور ملکیت</span>
                </h2>
                <p>
                  بز مینیجر (BizManager) <strong>میگا ٹرکس ٹیکنالوجیز (MegaTrix Technologies)</strong> کی ایک رجسٹرڈ کاروباری سافٹ ویئر پراڈکٹ ہے۔ یہ پرائیویسی پالیسی واضح کرتی ہے کہ جب آپ بز مینیجر کی ویب ایپلیکیشن، پوائنٹ آف سیل (POS)، یا موبائل پورٹل استعمال کرتے ہیں تو ہم آپ کے کاروباری ڈیٹا کی حفاظت کس طرح کرتے ہیں۔
                </p>
                <p>
                  ہم آپ کے تجارتی ڈیٹا اور کھاتہ جات کی رازداری کا مکمل احترام کرتے ہیں۔ آپ کے کاروبار کا تمام تر ریکارڈ صرف اور صرف آپ کی ملکیت ہے۔
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <FiDatabase className="w-5 h-5 text-violet-600 dark:text-violet-400 shrink-0" />
                  <span>۲. کون سا ڈیٹا اکٹھا کیا جاتا ہے؟</span>
                </h2>
                <p>سافٹ ویئر کی فراہمی اور ہموار کارکردگی کے لیے درج ذیل معلومات محفوظ کی جاتی ہیں:</p>
                <ul className="list-disc list-inside space-y-1.5 ps-2">
                  <li><strong>اکاؤنٹ کی تفصیلات:</strong> نام، کاروباری نام، ای میل پتہ، اور فون نمبر۔</li>
                  <li><strong>اسٹور اور انوینٹری ریکارڈ:</strong> مصنوعات کی تفصیل، قیمتِ خرید و فروخت، اور اسٹاک کی مقدار۔</li>
                  <li><strong>بلنگ اور ادھار کھاتہ:</strong> فروخت کے بل، کسٹمرز کے نام، ادھار کی رقوم اور ادائیگیوں کی تاریخ۔</li>
                  <li><strong>تکنیکی لاگز:</strong> سیکیورٹی اور خودکار سیشن کے لیے ڈیوائس آئی پی اور ضروری کوکیز۔</li>
                </ul>
              </section>

              <section className="space-y-3">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <FiLock className="w-5 h-5 text-violet-600 dark:text-violet-400 shrink-0" />
                  <span>۳. ڈیٹا کی حفاظت اور انکرپشن</span>
                </h2>
                <p>
                  آپ کے تمام تر ٹرانزیکشنز جدید ترین انڈسٹری گریڈ <strong>SSL/TLS انکرپشن</strong> کے تحت محفوظ ہیں۔ ڈیٹا بیسز پر تصدیق شدہ رسائی کے سخت اصول لاگو ہیں تاکہ غیر مجاز رسائی کا مکمل سدِ باب ہو سکے۔
                </p>
                <div className="p-4 rounded-xl bg-violet-50 dark:bg-violet-950/30 border border-violet-200 dark:border-violet-900/50 flex items-start gap-3 text-xs sm:text-sm text-violet-900 dark:text-violet-200">
                  <FiCheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>ہم آپ کا کاروباری ڈیٹا، کسٹمر لسٹ یا مالیاتی معلومات کسی بھی تیسری فریق کو فروخت یا شیئر نہیں کرتے۔</span>
                </div>
              </section>

              <section className="space-y-3">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <FiUsers className="w-5 h-5 text-violet-600 dark:text-violet-400 shrink-0" />
                  <span>۴. ڈیٹا کی ملکیت اور بیک اپ کے حقوق</span>
                </h2>
                <p>
                  آپ کسی بھی وقت سافٹ ویئر کے یوٹیلیٹی سیکشن سے اپنی تمام انوینٹری، گاہکوں کا کھاتہ اور سیلز رپورٹ Excel یا PDF فارمیٹ میں ایکسپورٹ اور ڈاؤن لوڈ کر سکتے ہیں۔ اگر آپ اپنا اکاؤنٹ ختم کرنا چاہیں تو رابطہ کرنے پر آپ کا ڈیٹا مکمل طور پر حذف کیا جا سکتا ہے۔
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <FiMail className="w-5 h-5 text-violet-600 dark:text-violet-400 shrink-0" />
                  <span>۵. رابطہ کی تفصیلات</span>
                </h2>
                <p>اگر آپ کو اپنی پرائیویسی یا ڈیٹا سیکیورٹی کے حوالے سے کوئی بھی سوال درپیش ہو تو ہم سے بلا جھجھک رابطہ کریں:</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.06] text-xs sm:text-sm">
                    <span className="font-bold block text-slate-900 dark:text-white">ای میل سپورٹ:</span>
                    <a href="mailto:support@megatrixai.com" className="text-violet-600 dark:text-violet-400 font-mono underline" dir="ltr">support@megatrixai.com</a>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.06] text-xs sm:text-sm">
                    <span className="font-bold block text-slate-900 dark:text-white">براہِ راست فون / واٹس ایپ:</span>
                    <a href="tel:03254567318" className="text-violet-600 dark:text-violet-400 font-mono" dir="ltr">0325-4567318</a>
                  </div>
                </div>
              </section>
            </>
          ) : (
            /* ENGLISH PRIVACY CONTENT */
            <>
              <section className="space-y-3">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <FiShield className="w-5 h-5 text-violet-600 dark:text-violet-400 shrink-0" />
                  <span>1. Introduction & Company Ownership</span>
                </h2>
                <p>
                  <strong>BizManager</strong> is a proprietary business operating and billing system engineered and operated by <strong>MegaTrix Technologies</strong>. This Privacy Policy describes how your business and personal information is collected, safeguarded, and managed when you utilize our point-of-sale (POS), web applications, inventory management tools, and online portals.
                </p>
                <p>
                  We are deeply committed to transparent data practices. Your retail transactions, inventory catalogs, and party ledgers remain exclusively under your control.
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <FiDatabase className="w-5 h-5 text-violet-600 dark:text-violet-400 shrink-0" />
                  <span>2. Information We Collect</span>
                </h2>
                <p>To provide high-availability billing and accounting services, we process the following categories of data:</p>
                <ul className="list-disc list-inside space-y-1.5 ps-2">
                  <li><strong>Account Credentials:</strong> Shopkeeper/operator name, registered email address, contact phone number, and hashed passwords.</li>
                  <li><strong>Retail Store Records:</strong> Inventory items, barcodes/SKUs, supplier identities, and cost/retail price schedules.</li>
                  <li><strong>Billing & Udhaar Ledgers:</strong> Invoices, thermal receipts, customer credit balances, payment receipts, and transaction history.</li>
                  <li><strong>Device & Session Tokens:</strong> Secure HTTP authentication cookies, language preferences, and interface theme selections.</li>
                </ul>
              </section>

              <section className="space-y-3">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <FiLock className="w-5 h-5 text-violet-600 dark:text-violet-400 shrink-0" />
                  <span>3. Data Protection & Encryption</span>
                </h2>
                <p>
                  All network communication between your terminal and our servers is strictly encrypted using industry-standard <strong>TLS 1.3 / SSL encryption</strong>. Database records are secured with multi-tenant isolation, automated daily backups, and role-based access restrictions.
                </p>
                <div className="p-4 rounded-xl bg-violet-50 dark:bg-violet-950/30 border border-violet-200 dark:border-violet-900/50 flex items-start gap-3 text-xs sm:text-sm text-violet-900 dark:text-violet-200">
                  <FiCheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Zero Data Monetization:</strong> MegaTrix Technologies never sells, monetizes, or shares your customer records, pricing details, or ledger entries with third-party advertisers.</span>
                </div>
              </section>

              <section className="space-y-3">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <FiUsers className="w-5 h-5 text-violet-600 dark:text-violet-400 shrink-0" />
                  <span>4. Your Rights & Data Portability</span>
                </h2>
                <p>
                  You hold complete sovereignty over your business data. At any time, you may export your entire catalog, ledger entries, and transaction history into standardized spreadsheet (Excel / CSV) or PDF formats. You can also request complete account termination and irreversible data purge by contacting our security desk.
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <FiMail className="w-5 h-5 text-violet-600 dark:text-violet-400 shrink-0" />
                  <span>5. Official Contact Details</span>
                </h2>
                <p>For privacy inquiries, audit disclosures, or security concerns, reach out to MegaTrix Technologies:</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.06] text-xs sm:text-sm">
                    <span className="font-bold block text-slate-900 dark:text-white">Email Desk:</span>
                    <a href="mailto:support@megatrixai.com" className="text-violet-600 dark:text-violet-400 font-mono underline" dir="ltr">support@megatrixai.com</a>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.06] text-xs sm:text-sm">
                    <span className="font-bold block text-slate-900 dark:text-white">Direct Phone / WhatsApp:</span>
                    <a href="tel:03254567318" className="text-violet-600 dark:text-violet-400 font-mono" dir="ltr">0325-4567318</a>
                  </div>
                </div>
              </section>
            </>
          )}

        </div>

        {/* Footer Navigation */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-zinc-400 border-t border-slate-200/80 dark:border-white/[0.08] pt-6">
          <p>© {new Date().getFullYear()} MegaTrix Technologies. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link to="/terms" className="hover:underline hover:text-violet-600 dark:hover:text-violet-400">
              {language === 'ur' ? 'شرائط و ضوابط' : 'Terms of Service'}
            </Link>
            <Link to="/" className="hover:underline hover:text-violet-600 dark:hover:text-violet-400">
              {language === 'ur' ? 'مرکزی صفحہ' : 'Home'}
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PrivacyPolicy;
