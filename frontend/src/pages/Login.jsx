import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { login, reset } from '../redux/slices/authSlice';
import DeviceConflictModal from '../components/DeviceConflictModal';
import SecurePasswordInput from '../components/SecurePasswordInput';
import GoogleAuthButton from '../components/GoogleAuthButton';
import GoogleOnboardingModal from '../components/GoogleOnboardingModal';
import Logo from '../components/Logo';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { FiGlobe } from 'react-icons/fi';
import {
  FiArrowLeft,
  FiMail,
  FiLock,
  FiSun,
  FiMoon,
  FiAlertCircle,
  FiShield,
  FiCheckCircle,
  FiZap,
  FiUsers,
  FiBox,
  FiPhone
} from 'react-icons/fi';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);

  const { email, password } = formData;

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { theme, toggleTheme } = useTheme();
  const { language, changeLanguage, isRtl } = useLanguage();
  const { t } = useTranslation(['auth', 'common']);

  const { user, isLoading, isError, isSuccess, message, deviceConflict, isNewGoogleUser } = useSelector(
    (state) => state.auth
  );

  const [showConflictModal, setShowConflictModal] = useState(false);
  const [showGoogleOnboarding, setShowGoogleOnboarding] = useState(false);

  useEffect(() => {
    // If this is a new Google user or an authenticated Google user without shopName, prompt store setup
    if (
      isNewGoogleUser ||
      (user && user.isNewUser) ||
      (user && user.authProvider === 'google' && !user.shopName)
    ) {
      setShowGoogleOnboarding(true);
      return;
    }

    if (isSuccess || user) {
      navigate('/dashboard');
    }

    // Cleanup: reset only on unmount
    return () => dispatch(reset());
  }, [user, isSuccess, isNewGoogleUser, navigate, dispatch]);

  useEffect(() => {
    if (deviceConflict) {
      setShowConflictModal(true);
    }
  }, [deviceConflict]);

  const onChange = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
  };

  const onSubmit = (e) => {
    e.preventDefault();
    dispatch(login(formData));
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#07090F] text-slate-900 dark:text-slate-100 font-sans selection:bg-violet-600 selection:text-white transition-colors duration-300 relative overflow-hidden flex flex-col justify-between">

      {/* Ambient Lighting Glows (The Impactable UI) */}
      <div className="fixed -top-32 -left-32 w-72 sm:w-[580px] h-72 sm:h-[580px] bg-violet-600/15 dark:bg-violet-600/20 blur-[100px] sm:blur-[150px] rounded-full pointer-events-none -z-10 animate-ambient-glow max-w-[100vw]" />
      <div className="fixed -bottom-32 -right-32 w-72 sm:w-[580px] h-72 sm:h-[580px] bg-indigo-600/15 dark:bg-indigo-600/20 blur-[100px] sm:blur-[150px] rounded-full pointer-events-none -z-10 max-w-[100vw]" />

      {/* Main Centered Container */}
      <div className="max-w-7xl mx-auto w-full min-h-screen flex flex-col justify-between p-3.5 sm:p-8 lg:p-12 relative z-10">

        {/* Top Header Bar */}
        <header className="flex items-center justify-between w-full pb-4 sm:pb-6 border-b border-slate-200/60 dark:border-white/[0.06]">
          <Link to="/" className="flex items-center gap-3 cursor-pointer select-none">
            <Logo size="xl" showText={true} showSubtitle={true} />
          </Link>

          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            {/* Language Switcher Pill */}
            <button
              type="button"
              onClick={() => changeLanguage(language === 'ur' ? 'en' : 'ur')}
              className="px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl text-xs font-bold bg-white/80 dark:bg-white/[0.05] text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-white/[0.08] border border-slate-200/80 dark:border-white/[0.08] shadow-xs transition-all duration-150 backdrop-blur-md cursor-pointer flex items-center gap-1.5 active:scale-95"
              title="Switch Language / زبان تبدیل کریں"
            >
              <FiGlobe className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400" />
              <span>{language === 'ur' ? 'English' : 'اردو'}</span>
            </button>

            <Link
              to="/"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white bg-white/70 dark:bg-white/[0.04] border border-slate-200/80 dark:border-white/[0.08] shadow-xs backdrop-blur-md active:scale-95 transition-all duration-150"
            >
              <FiArrowLeft className={`w-3.5 h-3.5 ${isRtl ? 'scale-x-[-1]' : ''}`} />
              <span>{language === 'ur' ? 'مرکزی صفحہ' : 'Back to Website'}</span>
            </Link>

            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2 sm:p-2.5 px-2.5 sm:px-3 rounded-xl bg-white/80 dark:bg-white/[0.05] text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-white/[0.08] border border-slate-200/80 dark:border-white/[0.08] shadow-xs transition-all duration-150 backdrop-blur-md cursor-pointer flex items-center gap-1.5 sm:gap-2 text-xs font-semibold active:scale-95"
              title="Toggle Light / Dark Mode"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? (
                <>
                  <FiMoon className="w-4 h-4 text-slate-700" />
                  <span className="hidden sm:inline">Dark</span>
                </>
              ) : (
                <>
                  <FiSun className="w-4 h-4 text-amber-400" />
                  <span className="hidden sm:inline">Light</span>
                </>
              )}
            </button>
          </div>
        </header>

        {/* 2-Column Responsive Layout */}
        <main className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 xl:gap-16 items-center my-auto py-6 sm:py-10 lg:py-12">

          {/* Left Column: Value Proposition & Security Anchor (Desktop) */}
          <div className="hidden lg:flex lg:col-span-7 flex-col justify-center space-y-7 max-w-xl">
            {/* Status Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-violet-500/10 dark:bg-violet-950/50 border border-violet-500/20 dark:border-violet-500/30 text-xs font-semibold text-violet-700 dark:text-violet-300 shadow-xs w-fit">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-urdu">{t('auth:login.marketingBadge')}</span>
            </div>

            <h1 className="text-3xl sm:text-4xl xl:text-5xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.3] font-urdu">
              {t('auth:login.marketingTitle')}
            </h1>

            <p className="text-sm sm:text-base text-slate-600 dark:text-zinc-300 leading-[2.1] font-normal font-urdu">
              {t('auth:login.marketingSubtitle')}
            </p>

            {/* Feature Highlights (Leon's Taste Rails: Hairline borders, no heavy boxes) */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/70 dark:bg-zinc-900/60 border border-slate-200/80 dark:border-white/[0.08] backdrop-blur-md shadow-xs hover:border-violet-500/30 dark:hover:border-violet-500/40 transition duration-150 group">
                <div className="w-10 h-10 rounded-xl bg-violet-500/10 text-violet-600 dark:text-violet-400 flex items-center justify-center font-bold text-base flex-shrink-0 group-hover:scale-105 transition-transform">
                  <FiZap className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm sm:text-base font-semibold text-slate-900 dark:text-white font-urdu">
                    {t('auth:login.featurePosTitle')}
                  </p>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 font-urdu leading-relaxed">
                    {t('auth:login.featurePosDesc')}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/70 dark:bg-zinc-900/60 border border-slate-200/80 dark:border-white/[0.08] backdrop-blur-md shadow-xs hover:border-indigo-500/30 dark:hover:border-indigo-500/40 transition duration-150 group">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-base flex-shrink-0 group-hover:scale-105 transition-transform">
                  <FiBox className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm sm:text-base font-semibold text-slate-900 dark:text-white font-urdu">
                    {t('auth:login.featureStockTitle')}
                  </p>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 font-urdu leading-relaxed">
                    {t('auth:login.featureStockDesc')}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/70 dark:bg-zinc-900/60 border border-slate-200/80 dark:border-white/[0.08] backdrop-blur-md shadow-xs hover:border-emerald-500/30 dark:hover:border-emerald-500/40 transition duration-150 group">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-base flex-shrink-0 group-hover:scale-105 transition-transform">
                  <FiUsers className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm sm:text-base font-semibold text-slate-900 dark:text-white font-urdu">
                    {t('auth:login.featureUdhaarTitle')}
                  </p>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 font-urdu leading-relaxed">
                    {t('auth:login.featureUdhaarDesc')}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: High-Impact Glassmorphic Auth Card */}
          <div className="lg:col-span-5 w-full flex flex-col justify-center">
            <div className="max-w-md w-full mx-auto space-y-5 sm:space-y-6">

              <div className="space-y-1 text-center sm:text-start font-urdu">
                <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
                  {t('auth:login.title')}
                </h2>
                <p className="text-xs sm:text-sm md:text-base text-slate-500 dark:text-zinc-400">
                  {t('auth:login.subtitle')}
                </p>
              </div>

              {/* Form Card */}
              <div className="bg-white/85 dark:bg-zinc-950/80 rounded-2xl sm:rounded-3xl shadow-[0_4px_20px_rgba(0,0,0,0.06),0_20px_40px_rgba(0,0,0,0.12)] border border-slate-200/80 dark:border-white/[0.08] p-5 sm:p-8 space-y-4 sm:space-y-5 backdrop-blur-2xl transition-colors duration-200">

                {/* Error Banner */}
                {isError && (
                  <div className="p-3 sm:p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 rounded-xl flex items-center gap-2.5 animate-fade-in font-urdu">
                    <FiAlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 flex-shrink-0" />
                    <p className="text-rose-700 dark:text-rose-300 text-xs sm:text-sm font-semibold">{message}</p>
                  </div>
                )}

                {/* Google OAuth Button */}
                <div className="space-y-3 pt-1">
                  <GoogleAuthButton mode="signin" />

                  {/* Divider */}
                  <div className="relative my-3">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-slate-200/80 dark:border-white/[0.08]" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-white/95 dark:bg-zinc-950 px-3 text-slate-500 dark:text-zinc-400 font-medium font-urdu">
                        {t('auth:login.orContinueWith') || 'Or continue with'}
                      </span>
                    </div>
                  </div>
                </div>

                <form onSubmit={onSubmit} className="space-y-3.5 sm:space-y-4">
                  {/* Email Input */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5" dir="ltr">
                      <label
                        htmlFor="email"
                        className="block text-xs sm:text-sm font-semibold text-slate-700 dark:text-zinc-300 font-sans"
                      >
                        {language === 'ur' ? 'Email' : t('auth:login.emailLabel')}
                      </label>
                      {language === 'ur' && (
                        <span className="text-xs sm:text-sm font-medium text-violet-600 dark:text-violet-400 font-urdu">
                          {t('auth:login.emailUrduGuide')}
                        </span>
                      )}
                    </div>
                    <input
                      type="text"
                      id="email"
                      name="email"
                      dir="ltr"
                      value={email}
                      onChange={onChange}
                      required
                      className="w-full px-3.5 sm:px-4 py-2.5 sm:py-3 text-sm border border-slate-200/90 dark:border-white/[0.08] bg-slate-50/80 dark:bg-zinc-900/80 text-slate-900 dark:text-white rounded-xl outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500 dark:focus:border-violet-500 transition placeholder:text-slate-400 dark:placeholder:text-zinc-500 text-left font-sans"
                      placeholder="you@example.com"
                    />
                  </div>

                  {/* Password Input */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5" dir="ltr">
                      <label
                        htmlFor="password"
                        className="block text-xs sm:text-sm font-semibold text-slate-700 dark:text-zinc-300 font-sans"
                      >
                        {language === 'ur' ? 'Password' : t('auth:login.passwordLabel')}
                      </label>
                      {language === 'ur' && (
                        <span className="text-xs sm:text-sm font-medium text-violet-600 dark:text-violet-400 font-urdu">
                          {t('auth:login.passwordUrduGuide')}
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
                      placeholder="••••••••"
                      className="w-full pl-3.5 sm:pl-4 pr-10 py-2.5 sm:py-3 text-sm border border-slate-200/90 dark:border-white/[0.08] bg-slate-50/80 dark:bg-zinc-900/80 text-slate-900 dark:text-white rounded-xl outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500 transition placeholder:text-slate-400 dark:placeholder:text-zinc-500 text-left font-sans"
                    />
                    {/* Forget Password link beneath the password input */}
                    <div className="flex justify-end mt-2" dir={isRtl ? 'rtl' : 'ltr'}>
                      <Link
                        to="/forgot-password"
                        className="text-xs sm:text-sm font-medium text-violet-600 dark:text-violet-400 hover:underline font-urdu"
                      >
                        {t('auth:login.forgotPassword')}
                      </Link>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="relative group w-full py-3 sm:py-3.5 bg-gradient-to-b from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold rounded-xl text-sm sm:text-base shadow-lg shadow-violet-600/25 border border-white/20 transition-all duration-150 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2 overflow-hidden font-urdu"
                  >
                    <span className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-[300%] transition-transform duration-700 ease-in-out pointer-events-none" />

                    {isLoading ? (
                      <>
                        <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        <span>{t('auth:login.signingIn')}</span>
                      </>
                    ) : (
                      <span>{t('auth:login.signInButton')}</span>
                    )}
                  </button>
                </form>

                <div className="pt-2 text-center text-xs sm:text-sm text-slate-500 dark:text-zinc-400 font-urdu">
                  {t('auth:login.noAccount')}{' '}
                  <Link
                    to="/register"
                    className="font-bold text-violet-600 dark:text-violet-400 hover:underline"
                  >
                    {t('auth:login.registerNow')} →
                  </Link>
                </div>
              </div>

            </div>
          </div>
        </main>

        {/* Footer Bar */}
        <footer className="pt-4 sm:pt-6 border-t border-slate-200/60 dark:border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-2.5 sm:gap-3 text-[11px] sm:text-xs text-slate-500 dark:text-zinc-400 text-center sm:text-start">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5 sm:gap-2">
            <p>{language === 'ur' ? 'بز مینیجر — میگا ٹرکس ٹیکنالوجیز کی ایک پروڈکٹ' : 'BizManager — A Product of MegaTrix Technologies'}</p>
            <span className="hidden sm:inline">•</span>
            <span className="text-[11px] text-slate-400 dark:text-zinc-500 font-mono">v2.4 Production</span>
          </div>
          <div className="text-center sm:text-end">
            Support: <a href="tel:03254567318" className="font-semibold hover:underline text-slate-700 dark:text-zinc-300">0325-4567318</a> • <a href="mailto:support@megatrixai.com" className="font-semibold hover:underline text-slate-700 dark:text-zinc-300">support@megatrixai.com</a>
          </div>
        </footer>

      </div>

      {/* Device Conflict Modal */}
      {showConflictModal && (
        <DeviceConflictModal
          email={email}
          password={password}
          onClose={() => setShowConflictModal(false)}
        />
      )}

      {/* Google Onboarding Modal for New Google Users */}
      <GoogleOnboardingModal
        isOpen={showGoogleOnboarding}
        onComplete={() => setShowGoogleOnboarding(false)}
      />
    </div>
  );
};

export default Login;