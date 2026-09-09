import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { register, reset } from "../redux/slices/authSlice";
import SecurePasswordInput from '../components/SecurePasswordInput';
import Logo from '../components/Logo';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { FiGlobe, FiInfo } from "react-icons/fi";

// Frontend password strength check mirrors backend
const isStrongPassword = (password) => {
  if (!password || password.length < 8) return false;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSymbol = /[^A-Za-z0-9]/.test(password);
  return hasUpper && hasLower && hasNumber && hasSymbol;
};

const isValidPhone = (value) => /^\d{10,11}$/.test(value);

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    shopName: "",
    phone: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { name, email, password, confirmPassword, shopName, phone } = formData;

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { theme, toggleTheme } = useTheme();
  const { language, changeLanguage, isRtl } = useLanguage();
  const { t } = useTranslation(['auth', 'common']);

  const { user, isLoading, isError, isSuccess, message } = useSelector(
    (state) => state.auth
  );

  const [validationError, setValidationError] = useState("");
  const [phoneError, setPhoneError] = useState("");

  useEffect(() => {
    if (isSuccess || user) {
      if (language === 'en') {
        localStorage.setItem('bizmanager_mode', 'pro');
        localStorage.setItem('bizmanager_mode_onboarding_completed', 'true');
      } else {
        localStorage.removeItem('bizmanager_mode_onboarding_completed');
      }
      navigate("/dashboard");
      dispatch(reset());
    }

    // Keep error visible; reset only on unmount
    return () => dispatch(reset());
  }, [user, isSuccess, navigate, dispatch, language]);

  const onChange = (e) => {
    const { name, value } = e.target;
    const nextValue =
      name === "phone" ? value.replace(/\D/g, "").slice(0, 11) : value;

    setFormData((prevState) => ({
      ...prevState,
      [name]: nextValue,
    }));

    if (name === "phone") {
      if (nextValue.length > 0 && nextValue.length < 10) {
        setPhoneError("Mobile number cannot be less than 10 digits.");
      } else {
        setPhoneError("");
      }
    }

    setValidationError("");
  };

  const onSubmit = (e) => {
    e.preventDefault();

    if (!isValidPhone(phone)) {
      setValidationError("Phone number must be exactly 10 digits.");
      setPhoneError("Mobile number cannot be less than 10 digits.");
      return;
    }

    if (password !== confirmPassword) {
      setValidationError("Passwords do not match");
      return;
    }

    if (!isStrongPassword(password)) {
      setValidationError(
        "Password must be 8+ chars with uppercase, lowercase, number, and symbol."
      );
      return;
    }

    const userData = {
      name,
      email,
      password,
      shopName,
      phone,
    };

    dispatch(register(userData));
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black text-slate-900 dark:text-white font-sans selection:bg-violet-600 selection:text-white transition-colors duration-300 relative overflow-hidden flex flex-col justify-between">

      {/* Global Ambient Background Glows */}
      <div className="absolute -top-32 -left-32 w-72 sm:w-[550px] h-72 sm:h-[550px] bg-violet-500/15 dark:bg-violet-600/20 blur-[100px] sm:blur-[140px] rounded-full pointer-events-none max-w-[100vw]" />
      <div className="absolute -bottom-32 -right-32 w-72 sm:w-[550px] h-72 sm:h-[550px] bg-indigo-500/15 dark:bg-indigo-600/20 blur-[100px] sm:blur-[150px] rounded-full pointer-events-none max-w-[100vw]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] sm:w-[600px] h-[350px] sm:h-[600px] bg-purple-400/5 dark:bg-purple-600/10 blur-[120px] sm:blur-[160px] rounded-full pointer-events-none max-w-[100vw]" />

      {/* Outer Centered Responsive Container */}
      <div className="max-w-7xl mx-auto w-full min-h-screen flex flex-col justify-between p-3.5 sm:p-8 lg:p-12 relative z-10">

        {/* Top Action Header Bar */}
        <header className="flex items-center justify-between w-full pb-4 sm:pb-6">
          <Link to="/" className="flex items-center gap-3 cursor-pointer select-none">
            <Logo size="xl" showText={true} showSubtitle={true} />
          </Link>

          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            {/* Language Switcher Pill */}
            <button
              type="button"
              onClick={() => changeLanguage(language === 'ur' ? 'en' : 'ur')}
              className="px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl text-xs font-bold bg-white/80 dark:bg-[#0C0F17] text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#141724] hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-zinc-800/80 shadow-sm transition backdrop-blur-md cursor-pointer flex items-center gap-1.5 active:scale-95"
              title="Switch Language / زبان تبدیل کریں"
            >
              <FiGlobe className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400" />
              <span>{language === 'ur' ? 'English' : 'اردو'}</span>
            </button>

            <Link
              to="/"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-white/70 dark:bg-[#0C0F17] border border-slate-200 dark:border-zinc-800/80 shadow-sm backdrop-blur-md transition hover:scale-105 active:scale-95"
            >
              <svg className={`w-3.5 h-3.5 ${isRtl ? 'scale-x-[-1]' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span>{language === 'ur' ? 'مرکزی صفحہ' : 'Back to Home'}</span>
            </Link>

            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2 sm:p-2.5 px-2.5 sm:px-3 rounded-xl bg-white/80 dark:bg-[#0C0F17] text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#141724] hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-zinc-800/80 shadow-sm transition backdrop-blur-md cursor-pointer flex items-center gap-1.5 sm:gap-2 text-xs font-semibold active:scale-95"
              title="Toggle Light / Dark Mode"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? (
                <>
                  <svg className="w-4 h-4 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                  <span className="hidden sm:inline">Dark</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  <span className="hidden sm:inline">Light</span>
                </>
              )}
            </button>
          </div>
        </header>

        {/* Main Content Grid: Balanced 2-Column Layout */}
        <main className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 xl:gap-16 items-center my-auto py-6 sm:py-8">

          {/* Left Hero & Value Proposition (Desktop & Tablet) */}
          <div className="hidden lg:flex lg:col-span-5 xl:col-span-5 flex-col justify-center space-y-8 max-w-lg">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-violet-100/90 dark:bg-[#121422] border border-violet-200 dark:border-violet-900/60 text-xs font-semibold text-violet-700 dark:text-violet-300 shadow-sm w-fit font-urdu">
              <span className="w-2 h-2 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse" />
              <span>{t('auth:register.badge')}</span>
            </div>

            <h1 className="text-3xl sm:text-4xl xl:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.2] font-urdu">
              {t('auth:register.heroTitle')}
            </h1>

            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-urdu">
              {t('auth:register.heroSubtitle')}
            </p>

            {/* Feature Highlights */}
            <div className="space-y-3.5 pt-2">
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/70 dark:bg-[#0A0C13]/80 border border-slate-200/80 dark:border-zinc-800/60 backdrop-blur-md shadow-sm dark:shadow-none hover:border-violet-500/30 dark:hover:border-violet-500/40 dark:hover:bg-[#111420] transition-all group">
                <div className="w-10 h-10 rounded-xl bg-violet-600/15 dark:bg-violet-600/25 text-violet-600 dark:text-violet-400 flex items-center justify-center font-bold text-lg flex-shrink-0 group-hover:scale-110 transition-transform">⚡</div>
                <div>
                  <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white font-urdu">{t('auth:register.benefit1Title')}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-urdu">{t('auth:register.benefit1Desc')}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/70 dark:bg-[#0A0C13]/80 border border-slate-200/80 dark:border-zinc-800/60 backdrop-blur-md shadow-sm dark:shadow-none hover:border-indigo-500/30 dark:hover:border-indigo-500/40 dark:hover:bg-[#111420] transition-all group">
                <div className="w-10 h-10 rounded-xl bg-indigo-600/15 dark:bg-indigo-600/25 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-lg flex-shrink-0 group-hover:scale-110 transition-transform">💳</div>
                <div>
                  <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white font-urdu">{t('auth:register.benefit2Title')}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-urdu">{t('auth:register.benefit2Desc')}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/70 dark:bg-[#0A0C13]/80 border border-slate-200/80 dark:border-zinc-800/60 backdrop-blur-md shadow-sm dark:shadow-none hover:border-emerald-500/30 dark:hover:border-emerald-500/40 dark:hover:bg-[#111420] transition-all group">
                <div className="w-10 h-10 rounded-xl bg-emerald-600/15 dark:bg-emerald-600/25 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-lg flex-shrink-0 group-hover:scale-110 transition-transform">🔒</div>
                <div>
                  <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white font-urdu">{t('auth:register.benefit3Title')}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-urdu">{t('auth:register.benefit3Desc')}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Register Card Column */}
          <div className="lg:col-span-7 xl:col-span-7 w-full flex flex-col justify-center">
            <div className="max-w-xl w-full mx-auto space-y-5 sm:space-y-6">

              <div className="space-y-1 text-center sm:text-start">
                <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white font-urdu">
                  {t('auth:register.cardTitle')}
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-urdu">
                  {t('auth:register.cardSubtitle')}
                </p>
              </div>

              {/* Form Card */}
              <div className="bg-white/85 dark:bg-[#0C0F17]/95 rounded-2xl sm:rounded-3xl shadow-xl dark:shadow-2xl dark:shadow-black/90 border border-slate-200/80 dark:border-zinc-800/80 p-5 sm:p-8 backdrop-blur-xl transition-colors duration-200">
                
                {/* Portal Disclaimer Notice Banner */}
                <div className="mb-5 p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 rounded-xl flex items-center gap-2.5 text-amber-800 dark:text-amber-300 text-xs font-semibold font-urdu">
                  <FiInfo className="w-4 h-4 flex-shrink-0 text-amber-600 dark:text-amber-400" />
                  <span>{t('auth:register.portalNotice')}</span>
                </div>

                {(isError || validationError) && (
                  <div className="mb-6 p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 rounded-xl flex items-center gap-2.5">
                    <svg className="w-4 h-4 text-rose-600 dark:text-rose-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    <p className="text-rose-700 dark:text-rose-300 text-xs font-semibold">
                      {validationError || message}
                    </p>
                  </div>
                )}

                <form onSubmit={onSubmit} className="space-y-5">
                  {/* Name and Email Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Name Input */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5" dir="ltr">
                        <label
                          htmlFor="name"
                          className="block text-xs font-semibold text-slate-700 dark:text-slate-300 font-sans"
                        >
                          {language === 'ur' ? 'Full Name *' : t('auth:register.fullName')}
                        </label>
                        {language === 'ur' && (
                          <span className="text-xs font-medium text-violet-600 dark:text-violet-400 font-urdu">
                            {t('auth:register.fullName')}
                          </span>
                        )}
                      </div>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        dir="ltr"
                        value={name}
                        onChange={onChange}
                        required
                        className="w-full px-4 py-2.5 text-sm border border-slate-300 dark:border-zinc-800/80 bg-slate-50/80 dark:bg-[#05060A] text-slate-900 dark:text-white rounded-xl outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500 dark:focus:border-violet-500 transition placeholder:text-slate-400 dark:placeholder:text-zinc-500 text-left font-sans"
                        placeholder="e.g. Muhammad Usman"
                      />
                    </div>

                    {/* Email Input */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5" dir="ltr">
                        <label
                          htmlFor="email"
                          className="block text-xs font-semibold text-slate-700 dark:text-slate-300 font-sans"
                        >
                          {language === 'ur' ? 'Email Address *' : t('auth:register.email')}
                        </label>
                        {language === 'ur' && (
                          <span className="text-xs font-medium text-violet-600 dark:text-violet-400 font-urdu">
                            {t('auth:register.email')}
                          </span>
                        )}
                      </div>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        dir="ltr"
                        value={email}
                        onChange={onChange}
                        required
                        className="w-full px-4 py-2.5 text-sm border border-slate-300 dark:border-zinc-800/80 bg-slate-50/80 dark:bg-[#05060A] text-slate-900 dark:text-white rounded-xl outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500 dark:focus:border-violet-500 transition placeholder:text-slate-400 dark:placeholder:text-zinc-500 text-left font-sans"
                        placeholder="you@example.com"
                      />
                    </div>
                  </div>

                  {/* Shop Name and Phone Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Shop Name Input */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5" dir="ltr">
                        <label
                          htmlFor="shopName"
                          className="block text-xs font-semibold text-slate-700 dark:text-slate-300 font-sans"
                        >
                          {language === 'ur' ? 'Shop / Business Name' : t('auth:register.shopName')}
                        </label>
                        {language === 'ur' && (
                          <span className="text-xs font-medium text-violet-600 dark:text-violet-400 font-urdu">
                            {t('auth:register.shopName')}
                          </span>
                        )}
                      </div>
                      <input
                        type="text"
                        id="shopName"
                        name="shopName"
                        dir="ltr"
                        value={shopName}
                        onChange={onChange}
                        className="w-full px-4 py-2.5 text-sm border border-slate-300 dark:border-zinc-800/80 bg-slate-50/80 dark:bg-[#05060A] text-slate-900 dark:text-white rounded-xl outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500 dark:focus:border-violet-500 transition placeholder:text-slate-400 dark:placeholder:text-zinc-500 text-left font-sans"
                        placeholder="e.g. Madina Kiryana Store"
                      />
                    </div>

                    {/* Phone Input */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5" dir="ltr">
                        <label
                          htmlFor="phone"
                          className="block text-xs font-semibold text-slate-700 dark:text-slate-300 font-sans"
                        >
                          {language === 'ur' ? 'Phone Number *' : t('auth:register.phone')}
                        </label>
                        {language === 'ur' && (
                          <span className="text-xs font-medium text-violet-600 dark:text-violet-400 font-urdu">
                            {t('auth:register.phone')}
                          </span>
                        )}
                      </div>
                      <div className="flex overflow-hidden rounded-xl border border-slate-300 dark:border-zinc-800/80 bg-slate-50/80 dark:bg-[#05060A] focus-within:ring-2 focus-within:ring-violet-500/40 focus-within:border-violet-500 transition" dir="ltr">
                        <span className="px-3 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-xs font-bold flex items-center border-r border-violet-500/30 font-mono">
                          +92
                        </span>
                        <input
                          type="tel"
                          id="phone"
                          name="phone"
                          value={phone}
                          onChange={onChange}
                          inputMode="numeric"
                          pattern="\d{10,11}"
                          maxLength={11}
                          required
                          className="w-full px-3.5 py-2.5 bg-transparent text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-500 border-0 focus:ring-0 text-sm outline-none text-left font-mono"
                          placeholder="3254567318"
                        />
                      </div>
                      {phoneError && (
                        <p className="mt-1 text-[11px] font-medium text-rose-600 dark:text-rose-400">{phoneError}</p>
                      )}
                    </div>
                  </div>

                  {/* Password Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Password Input */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5" dir="ltr">
                        <label
                          htmlFor="password"
                          className="block text-xs font-semibold text-slate-700 dark:text-slate-300 font-sans"
                        >
                          {language === 'ur' ? 'Password *' : t('auth:register.password')}
                        </label>
                        {language === 'ur' && (
                          <span className="text-xs font-medium text-violet-600 dark:text-violet-400 font-urdu">
                            {t('auth:register.password')}
                          </span>
                        )}
                      </div>
                      <SecurePasswordInput
                        id="password"
                        name="password"
                        dir="ltr"
                        value={password}
                        onChange={onChange}
                        required
                        showPassword={showPassword}
                        onToggleVisibility={() => setShowPassword(!showPassword)}
                        placeholder="Min 8+ characters"
                        className="w-full pl-4 pr-10 py-2.5 text-sm border border-slate-300 dark:border-zinc-800/80 bg-slate-50/80 dark:bg-[#05060A] text-slate-900 dark:text-white rounded-xl outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500 transition placeholder:text-slate-400 dark:placeholder:text-zinc-500 text-left font-sans"
                      />
                    </div>

                    {/* Confirm Password Input */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5" dir="ltr">
                        <label
                          htmlFor="confirmPassword"
                          className="block text-xs font-semibold text-slate-700 dark:text-slate-300 font-sans"
                        >
                          {language === 'ur' ? 'Confirm Password *' : t('auth:register.confirmPassword')}
                        </label>
                        {language === 'ur' && (
                          <span className="text-xs font-medium text-violet-600 dark:text-violet-400 font-urdu">
                            {t('auth:register.confirmPassword')}
                          </span>
                        )}
                      </div>
                      <SecurePasswordInput
                        id="confirmPassword"
                        name="confirmPassword"
                        dir="ltr"
                        value={confirmPassword}
                        onChange={onChange}
                        required
                        showPassword={showConfirmPassword}
                        onToggleVisibility={() => setShowConfirmPassword(!showConfirmPassword)}
                        placeholder="Re-enter password"
                        className="w-full pl-4 pr-10 py-2.5 text-sm border border-slate-300 dark:border-zinc-800/80 bg-slate-50/80 dark:bg-[#05060A] text-slate-900 dark:text-white rounded-xl outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500 transition placeholder:text-slate-400 dark:placeholder:text-zinc-500 text-left font-sans"
                      />
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold rounded-xl text-sm shadow-lg shadow-violet-600/25 transition-all transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2 font-urdu"
                  >
                    {isLoading ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        <span>{t('auth:register.submitting')}</span>
                      </span>
                    ) : (
                      t('auth:register.submitButton')
                    )}
                  </button>
                </form>

                {/* Sign In Link */}
                <div className="mt-5 text-center font-urdu">
                  <p className="text-slate-600 dark:text-slate-400 text-xs">
                    {t('auth:register.hasAccount')}{" "}
                    <Link
                      to="/login"
                      className="text-violet-600 dark:text-violet-400 font-bold hover:underline transition"
                    >
                      {t('auth:register.signIn')}
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Unified Bottom Footer Bar */}
        <footer className="pt-4 sm:pt-6 border-t border-slate-200/80 dark:border-zinc-800/80 flex flex-col sm:flex-row items-center justify-between gap-2.5 sm:gap-3 text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 text-center sm:text-start">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5 sm:gap-2">
            <p>{language === 'ur' ? 'بز مینیجر — میگا ٹرکس ٹیکنالوجیز کی ایک پروڈکٹ' : 'BizManager — A Product of MegaTrix Technologies'}</p>
            <span className="hidden sm:inline">•</span>
            <span className="text-[11px] text-slate-400 dark:text-slate-500 font-mono">v2.4 Production</span>
          </div>
          <div className="text-center sm:text-end">
            Support: <a href="tel:03254567318" className="font-semibold hover:underline text-slate-700 dark:text-slate-300">0325-4567318</a> • <a href="mailto:support@megatrixai.com" className="font-semibold hover:underline text-slate-700 dark:text-slate-300">support@megatrixai.com</a>
          </div>
        </footer>

      </div>
    </div>
  );
};

export default Register;
