import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import Logo from '../components/Logo';
import {
  FiArrowLeft,
  FiArrowRight,
  FiFileText,
  FiCheckCircle,
  FiAlertCircle,
  FiServer,
  FiGlobe,
  FiSun,
  FiMoon,
  FiMail,
  FiPhone,
  FiAward
} from 'react-icons/fi';

const Terms = () => {
  const navigate = useNavigate();
  const { language, changeLanguage, isRtl } = useLanguage();
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    try { window.scrollTo?.(0, 0); } catch { /* noop */ }
    document.title = language === 'ur'
      ? 'شرائط و ضوابط — بز مینیجر از میگا ٹرکس'
      : 'Terms of Service — BizManager by MegaTrix';
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
            <FiFileText className="w-3.5 h-3.5" />
            <span>{language === 'ur' ? 'قانونی شرائط و ضوابط' : 'Legal Terms of Service'}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-900 dark:text-white">
            {language === 'ur' ? 'شرائط و ضوابط' : 'Terms of Service'}
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
            /* URDU TERMS CONTENT */
            <>
              <section className="space-y-3">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <FiAward className="w-5 h-5 text-violet-600 dark:text-violet-400 shrink-0" />
                  <span>۱. شرائط کی منظوری اور ملکیت</span>
                </h2>
                <p>
                  بز مینیجر (BizManager) <strong>میگا ٹرکس ٹیکنالوجیز (MegaTrix Technologies)</strong> کا تیار کردہ اور ملکیتی بزنس سافٹ ویئر ہے۔ بز مینیجر پر اکاؤنٹ بنانے، پوائنٹ آف سیل (POS) استعمال کرنے، یا سافٹ ویئر کے ذریعے انوینٹری اور کھاتہ سنبھالنے پر آپ ان شرائط و ضوابط کے پابند سمجھے جائیں گے۔
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <FiCheckCircle className="w-5 h-5 text-violet-600 dark:text-violet-400 shrink-0" />
                  <span>۲. سافٹ ویئر کے استعمال کا لائسنس</span>
                </h2>
                <p>
                  میگا ٹرکس ٹیکنالوجیز آپ کو اپنی دکان، سپر اسٹور، ہارڈویئر، فارمیسی یا تھوک کے کاروبار کے لیے بز مینیجر استعمال کرنے کا غیر خصوصی اور ناقابلِ انتقال لائسنس فراہم کرتی ہے۔
                </p>
                <ul className="list-disc list-inside space-y-1.5 ps-2">
                  <li>آپ سافٹ ویئر کے کوڈ کو ریورس انجینئر یا کاپی نہیں کر سکتے۔</li>
                  <li>آپ اس پورٹل کو کسی بھی غیر قانونی سرگرمی یا فراڈ کے لیے استعمال نہیں کر سکتے۔</li>
                  <li>آپ کے کیشیئرز اور عملہ اپنے مختص کردہ رول کے مطابق ہی سسٹم استعمال کرنے کے مجاز ہیں۔</li>
                </ul>
              </section>

              <section className="space-y-3">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <FiServer className="w-5 h-5 text-violet-600 dark:text-violet-400 shrink-0" />
                  <span>۳. ڈیٹا کی درستی اور ٹیکس کی ذمہ داری</span>
                </h2>
                <p>
                  گاہکوں کو جاری کیے گئے بل، قیمتیں، نفع نقصان کا تخمینہ، اور ادھار کھاتہ (Credit Ledger) کا اندراج دکاندار یا سسٹم آپریٹر کی ذمہ داری ہے۔ میگا ٹرکس ٹیکنالوجیز حساب کتاب کی سہولت فراہم کرتی ہے لیکن صارف کے غلط اندراج کی ذمہ دار نہیں ہوگی۔
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <FiAlertCircle className="w-5 h-5 text-violet-600 dark:text-violet-400 shrink-0" />
                  <span>۴. سروس کی دستیابی اور بیک اپ</span>
                </h2>
                <p>
                  ہم جدید ترین کلاؤڈ سرورز اور خودکار بیک اپ سسٹم کے ذریعے ۹۹.۹٪ اپ ٹائم یقینی بنانے کی کوشش کرتے ہیں۔ دکانداروں کو ترغیب دی جاتی ہے کہ وہ یوٹیلیٹی سیکشن سے باقاعدگی سے اپنی انوینٹری اور لیجر کا بیک اپ ڈاؤن لوڈ کرتے رہیں۔
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <FiMail className="w-5 h-5 text-violet-600 dark:text-violet-400 shrink-0" />
                  <span>۵. سوالات اور کسٹمر سپورٹ</span>
                </h2>
                <p>کسی بھی قانونی سوال یا تجارتی لائسنس کی معلومات کے لیے ہم سے رابطہ کریں:</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.06] text-xs sm:text-sm">
                    <span className="font-bold block text-slate-900 dark:text-white">ای میل سپورٹ:</span>
                    <a href="mailto:support@megatrixai.com" className="text-violet-600 dark:text-violet-400 font-mono underline" dir="ltr">support@megatrixai.com</a>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.06] text-xs sm:text-sm">
                    <span className="font-bold block text-slate-900 dark:text-white">فون / واٹس ایپ:</span>
                    <a href="tel:03254567318" className="text-violet-600 dark:text-violet-400 font-mono" dir="ltr">0325-4567318</a>
                  </div>
                </div>
              </section>
            </>
          ) : (
            /* ENGLISH TERMS CONTENT */
            <>
              <section className="space-y-3">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <FiAward className="w-5 h-5 text-violet-600 dark:text-violet-400 shrink-0" />
                  <span>1. Acceptance of Terms & Company Identity</span>
                </h2>
                <p>
                  <strong>BizManager</strong> is a proprietary business management and POS platform developed, owned, and maintained by <strong>MegaTrix Technologies</strong>. By registering, accessing, or subscribing to BizManager, you explicitly agree to comply with and be bound by these Terms of Service.
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <FiCheckCircle className="w-5 h-5 text-violet-600 dark:text-violet-400 shrink-0" />
                  <span>2. Permitted Use & Software License</span>
                </h2>
                <p>
                  MegaTrix Technologies grants you a non-exclusive, non-transferable, revocable license to utilize BizManager for your retail, wholesale, distribution, supermarket, or commercial business operations according to your active subscription plan.
                </p>
                <ul className="list-disc list-inside space-y-1.5 ps-2">
                  <li>You shall not decompile, reverse-engineer, modify, or resell the software platform.</li>
                  <li>You shall not use the service to process fraudulent billing or malicious activity.</li>
                  <li>Multi-user credentials and staff roles must be safeguarded by the registered store administrator.</li>
                </ul>
              </section>

              <section className="space-y-3">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <FiServer className="w-5 h-5 text-violet-600 dark:text-violet-400 shrink-0" />
                  <span>3. Ledger Integrity & Tax Compliance</span>
                </h2>
                <p>
                  You acknowledge that inventory counts, sales invoices, tax rates (GST/VAT), customer credit (Udhaar) balances, and payment entries inputted into BizManager are the sole operational responsibility of the user. While BizManager enforces double-entry verification and automated reconciliations, users remain responsible for statutory tax reporting and compliance.
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <FiAlertCircle className="w-5 h-5 text-violet-600 dark:text-violet-400 shrink-0" />
                  <span>4. Service Availability, Data Backups & SLA</span>
                </h2>
                <p>
                  We aim for a 99.9% application uptime backed by automated cloud database backups. Users are strongly encouraged to periodically download offline local backups (via the Data Export / Utilities screen) in Excel or PDF formats for localized contingency planning.
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <FiMail className="w-5 h-5 text-violet-600 dark:text-violet-400 shrink-0" />
                  <span>5. Inquiries & Legal Contact</span>
                </h2>
                <p>For enterprise licensing, terms inquiries, or commercial support, contact MegaTrix Technologies:</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.06] text-xs sm:text-sm">
                    <span className="font-bold block text-slate-900 dark:text-white">Email Desk:</span>
                    <a href="mailto:support@megatrixai.com" className="text-violet-600 dark:text-violet-400 font-mono underline" dir="ltr">support@megatrixai.com</a>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.06] text-xs sm:text-sm">
                    <span className="font-bold block text-slate-900 dark:text-white">Phone / WhatsApp:</span>
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
            <Link to="/privacy-policy" className="hover:underline hover:text-violet-600 dark:hover:text-violet-400">
              {language === 'ur' ? 'پرائیویسی پالیسی' : 'Privacy Policy'}
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

export default Terms;
