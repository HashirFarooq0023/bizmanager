import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { performPasswordReset, reset } from '../redux/slices/authSlice';
import SecurePasswordInput from '../components/SecurePasswordInput';
import Logo from '../components/Logo';
import { useTheme } from '../contexts/ThemeContext';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../contexts/LanguageContext';
import { FiGlobe } from 'react-icons/fi';

const isStrongPassword = (password) => {
  if (!password || password.length < 8) return false;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSymbol = /[^A-Za-z0-9]/.test(password);
  return hasUpper && hasLower && hasNumber && hasSymbol;
};

const ResetPassword = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { theme, toggleTheme } = useTheme();
  const { t } = useTranslation(['auth', 'common']);
  const { language, changeLanguage, isRtl } = useLanguage();
  const { isLoading, isError, isSuccess, message, user } = useSelector((s) => s.auth);

  const params = new URLSearchParams(location.search);
  const [email] = useState(params.get('email') || '');
  const [token] = useState(params.get('token') || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [validationError, setValidationError] = useState('');

  useEffect(() => {
    if (user) navigate('/dashboard');
    return () => dispatch(reset());
  }, [user, navigate, dispatch]);

  const onSubmit = (e) => {
    e.preventDefault();
    setValidationError('');

    if (!token || !email) {
      setValidationError(t('auth:reset.invalidLink'));
      return;
    }

    if (password !== confirmPassword) {
      setValidationError(t('auth:reset.passwordMismatch'));
      return;
    }

    if (!isStrongPassword(password)) {
      setValidationError(t('auth:reset.passwordStrength'));
      return;
    }

    dispatch(performPasswordReset({ token, email, password }));
  };

  useEffect(() => {
    // On successful reset, redirect to login after short delay
    if (isSuccess) {
      const tTimer = setTimeout(() => navigate('/login'), 1500);
      return () => clearTimeout(tTimer);
    }
  }, [isSuccess, navigate]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black text-slate-900 dark:text-white font-sans selection:bg-violet-600 selection:text-white transition-colors duration-300 relative overflow-hidden flex flex-col justify-between p-3 sm:p-6 md:p-8">
      {/* Global Ambient Background Glows */}
      <div className="absolute -top-32 -left-32 w-72 sm:w-96 md:w-[500px] h-72 sm:h-96 md:h-[500px] bg-violet-500/15 dark:bg-violet-600/20 blur-[100px] sm:blur-[140px] rounded-full pointer-events-none max-w-[100vw]" />
      <div className="absolute -bottom-32 -right-32 w-72 sm:w-96 md:w-[500px] h-72 sm:h-96 md:h-[500px] bg-indigo-500/15 dark:bg-indigo-600/20 blur-[100px] sm:blur-[150px] rounded-full pointer-events-none max-w-[100vw]" />

      {/* Top Header Bar */}
      <div className="w-full max-w-md mx-auto flex items-center justify-between z-10 mb-4 sm:mb-6">
        <Link
          to="/login"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition font-urdu truncate max-w-[130px] sm:max-w-none"
        >
          <svg className={`w-4 h-4 flex-shrink-0 ${isRtl ? 'scale-x-[-1]' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span className="truncate">{t('auth:reset.backToLogin')}</span>
        </Link>

        <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
          {/* Language Switcher Pill */}
          <button
            type="button"
            onClick={() => changeLanguage(language === 'ur' ? 'en' : 'ur')}
            className="px-2.5 sm:px-3 py-2 rounded-xl text-xs font-bold bg-white/80 dark:bg-[#0C0F17] text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#141724] hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-zinc-800/80 shadow-sm transition backdrop-blur-md cursor-pointer flex items-center gap-1.5"
            title="Switch Language / زبان تبدیل کریں"
          >
            <FiGlobe className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400" />
            <span>{language === 'ur' ? 'English' : 'اردو'}</span>
          </button>

          {/* Theme Switcher */}
          <button
            onClick={toggleTheme}
            className="p-2 sm:p-2.5 px-2.5 sm:px-3.5 rounded-xl bg-white/80 dark:bg-[#0C0F17] text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#141724] hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-zinc-800/80 shadow-sm transition backdrop-blur-md cursor-pointer flex items-center gap-1.5 sm:gap-2 text-xs font-semibold"
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
      </div>

      <div className="max-w-md w-full mx-auto relative z-10 my-auto px-1 sm:px-0 py-4 sm:py-8">
        <div className="text-center mb-6 sm:mb-8 flex flex-col items-center">
          <Logo size="xl" showText={true} showSubtitle={true} className="mb-3" />
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white font-urdu">
            {t('auth:reset.title')}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-sm mx-auto font-urdu">
            {email ? `${t('auth:reset.subtitle')} (${email})` : t('auth:reset.subtitle')}
          </p>
        </div>

        <div className="bg-white/85 dark:bg-[#0C0F17]/95 rounded-2xl sm:rounded-3xl shadow-xl dark:shadow-2xl dark:shadow-black/90 border border-slate-200/80 dark:border-zinc-800/80 p-5 sm:p-8 backdrop-blur-xl transition-colors duration-200">
          {(validationError || isError || isSuccess) && (
            <div className={`mb-5 sm:mb-6 p-3.5 sm:p-4 border rounded-xl flex items-center gap-2.5 font-urdu ${validationError ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900/60 text-amber-700 dark:text-amber-300' : isSuccess ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900/60 text-emerald-700 dark:text-emerald-300' : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-300'}`}>
              <p className="text-xs sm:text-sm font-semibold">
                {validationError || message}
              </p>
            </div>
          )}

          <form onSubmit={onSubmit} className="space-y-4 sm:space-y-5">
            {/* New Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5" dir="ltr">
                <label
                  htmlFor="password"
                  className="block text-xs sm:text-sm font-semibold text-slate-700 dark:text-zinc-300 font-sans"
                >
                  {language === 'ur' ? 'New Password' : t('auth:reset.passwordLabel')}
                </label>
                {language === 'ur' && (
                  <span className="text-xs sm:text-sm font-medium text-violet-600 dark:text-violet-400 font-urdu">
                    {t('auth:reset.passwordUrduGuide')}
                  </span>
                )}
              </div>
              <SecurePasswordInput
                id="password"
                name="password"
                dir="ltr"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                showPassword={showPassword}
                onToggleVisibility={() => setShowPassword(!showPassword)}
                placeholder={t('auth:reset.passwordPlaceholder')}
                className="w-full pl-3.5 sm:pl-4 pr-10 py-2.5 sm:py-3 text-sm border border-slate-300 dark:border-zinc-800/80 bg-slate-50/80 dark:bg-[#05060A] text-slate-900 dark:text-white rounded-xl outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500 transition placeholder:text-slate-400 dark:placeholder:text-zinc-500 text-left font-sans"
              />
            </div>

            {/* Confirm Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5" dir="ltr">
                <label
                  htmlFor="confirmPassword"
                  className="block text-xs sm:text-sm font-semibold text-slate-700 dark:text-zinc-300 font-sans"
                >
                  {language === 'ur' ? 'Confirm Password' : t('auth:reset.confirmPasswordLabel')}
                </label>
                {language === 'ur' && (
                  <span className="text-xs sm:text-sm font-medium text-violet-600 dark:text-violet-400 font-urdu">
                    {t('auth:reset.confirmPasswordUrduGuide')}
                  </span>
                )}
              </div>
              <SecurePasswordInput
                id="confirmPassword"
                name="confirmPassword"
                dir="ltr"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                showPassword={showConfirmPassword}
                onToggleVisibility={() => setShowConfirmPassword(!showConfirmPassword)}
                placeholder={t('auth:reset.confirmPasswordPlaceholder')}
                className="w-full pl-3.5 sm:pl-4 pr-10 py-2.5 sm:py-3 text-sm border border-slate-300 dark:border-zinc-800/80 bg-slate-50/80 dark:bg-[#05060A] text-slate-900 dark:text-white rounded-xl outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500 transition placeholder:text-slate-400 dark:placeholder:text-zinc-500 text-left font-sans"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 sm:py-3.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold rounded-xl text-sm shadow-lg shadow-violet-600/25 transition-all transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2 font-urdu"
            >
              {isLoading ? t('auth:reset.submitting') : t('auth:reset.submitButton')}
            </button>
          </form>

          <div className="mt-6 text-center font-urdu">
            <p className="text-slate-600 dark:text-slate-400 text-xs">
              {t('auth:reset.remembered')}{' '}
              <Link to="/login" className="text-violet-600 dark:text-violet-400 font-bold hover:underline transition">
                {t('auth:reset.backToLogin')}
              </Link>
            </p>
          </div>
        </div>
      </div>

      <div className="mt-6 text-center text-xs text-slate-500 dark:text-slate-400 font-urdu">
        {language === 'ur' ? (
          <span>بز مینیجر — میگا ٹرکس ٹیکنالوجیز (MegaTrix Technologies) کا تیار کردہ پروڈکٹ</span>
        ) : (
          <span>BizManager — A Product of MegaTrix Technologies</span>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;
