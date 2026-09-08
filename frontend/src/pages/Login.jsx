import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { login, reset } from '../redux/slices/authSlice';
import DeviceConflictModal from '../components/DeviceConflictModal';
import SecurePasswordInput from '../components/SecurePasswordInput';
import Logo from '../components/Logo';
import { useTheme } from '../contexts/ThemeContext';
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

  const { user, isLoading, isError, isSuccess, message, deviceConflict } = useSelector(
    (state) => state.auth
  );

  const [showConflictModal, setShowConflictModal] = useState(false);

  useEffect(() => {
    if (isSuccess || user) {
      navigate('/dashboard');
    }

    // Cleanup: reset only on unmount
    return () => dispatch(reset());
  }, [user, isSuccess, navigate, dispatch]);

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
      <div className="fixed -top-32 -left-32 w-96 sm:w-[580px] h-96 sm:h-[580px] bg-violet-600/15 dark:bg-violet-600/20 blur-[150px] rounded-full pointer-events-none -z-10 animate-ambient-glow" />
      <div className="fixed -bottom-32 -right-32 w-96 sm:w-[580px] h-96 sm:h-[580px] bg-indigo-600/15 dark:bg-indigo-600/20 blur-[150px] rounded-full pointer-events-none -z-10" />

      {/* Main Centered Container */}
      <div className="max-w-7xl mx-auto w-full min-h-screen flex flex-col justify-between p-5 sm:p-8 lg:p-12 relative z-10">

        {/* Top Header Bar */}
        <header className="flex items-center justify-between w-full pb-6 border-b border-slate-200/60 dark:border-white/[0.06]">
          <Link to="/" className="flex items-center gap-3 cursor-pointer select-none">
            <Logo size="xl" showText={true} showSubtitle={true} />
          </Link>

          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white bg-white/70 dark:bg-white/[0.04] border border-slate-200/80 dark:border-white/[0.08] shadow-xs backdrop-blur-md active:scale-95 transition-all duration-150"
            >
              <FiArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Website</span>
            </Link>

            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2.5 px-3 rounded-xl bg-white/80 dark:bg-white/[0.05] text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-white/[0.08] border border-slate-200/80 dark:border-white/[0.08] shadow-xs transition-all duration-150 backdrop-blur-md cursor-pointer flex items-center gap-2 text-xs font-semibold active:scale-95"
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
        <main className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 xl:gap-16 items-center my-auto py-8 sm:py-12">

          {/* Left Column: Value Proposition & Security Anchor (Desktop) */}
          <div className="hidden lg:flex lg:col-span-7 flex-col justify-center space-y-7 max-w-xl">
            {/* Status Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-violet-500/10 dark:bg-violet-950/50 border border-violet-500/20 dark:border-violet-500/30 text-xs font-semibold text-violet-700 dark:text-violet-300 shadow-xs w-fit">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>MegaTrix Cloud • Bank-Grade 256-Bit SSL</span>
            </div>

            <h1 className="text-3xl sm:text-4xl xl:text-5xl font-extrabold tracking-[-0.03em] text-slate-900 dark:text-white leading-[1.12]">
              Manage Sales, Inventory & Customer Dues in One Fast Workspace.
            </h1>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-300 leading-relaxed font-normal">
              Sign in to manage walk-in counter billing, monitor automated reorder thresholds, and inspect real-time profit reports with zero lag.
            </p>

            {/* Feature Highlights (Leon's Taste Rails: Hairline borders, no heavy boxes) */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/70 dark:bg-zinc-900/60 border border-slate-200/80 dark:border-white/[0.08] backdrop-blur-md shadow-xs hover:border-violet-500/30 dark:hover:border-violet-500/40 transition duration-150 group">
                <div className="w-10 h-10 rounded-xl bg-violet-500/10 text-violet-600 dark:text-violet-400 flex items-center justify-center font-bold text-base flex-shrink-0 group-hover:scale-105 transition-transform">
                  <FiZap className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                    Ultra-Fast Multi-Cart POS
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                    Barcode scanning, hold sales, and instant ESC/POS thermal printing
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/70 dark:bg-zinc-900/60 border border-slate-200/80 dark:border-white/[0.08] backdrop-blur-md shadow-xs hover:border-indigo-500/30 dark:hover:border-indigo-500/40 transition duration-150 group">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-base flex-shrink-0 group-hover:scale-105 transition-transform">
                  <FiBox className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                    Stock Guardian & Low-Stock Alerts
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                    Automatic reorder thresholds and customized barcode label generation
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/70 dark:bg-zinc-900/60 border border-slate-200/80 dark:border-white/[0.08] backdrop-blur-md shadow-xs hover:border-emerald-500/30 dark:hover:border-emerald-500/40 transition duration-150 group">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-base flex-shrink-0 group-hover:scale-105 transition-transform">
                  <FiUsers className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                    Customer & Udhaar Ledgers
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                    Real-time balances, credit limits, and one-click WhatsApp payment reminders
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: High-Impact Glassmorphic Auth Card */}
          <div className="lg:col-span-5 w-full flex flex-col justify-center">
            <div className="max-w-md w-full mx-auto space-y-6">

              {/* Mobile Branding Header */}
              <div className="lg:hidden flex flex-col items-center text-center mb-2">
                <Logo size="xl" showText={true} showSubtitle={true} className="mb-2" />
              </div>

              <div className="space-y-1 text-center sm:text-left">
                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                  Welcome Back
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400">
                  Sign in to your BizManager business account
                </p>
              </div>

              {/* Form Card (Glassmorphic Elevated Surface with Hairline Borders) */}
              <div className="bg-white/85 dark:bg-zinc-950/80 rounded-3xl shadow-[0_4px_20px_rgba(0,0,0,0.06),0_20px_40px_rgba(0,0,0,0.12)] border border-slate-200/80 dark:border-white/[0.08] p-6 sm:p-8 space-y-5 backdrop-blur-2xl transition-colors duration-200">

                {/* Error Banner */}
                {isError && (
                  <div className="p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 rounded-xl flex items-center gap-2.5 animate-fade-in">
                    <FiAlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 flex-shrink-0" />
                    <p className="text-rose-700 dark:text-rose-300 text-xs font-semibold">{message}</p>
                  </div>
                )}

                <form onSubmit={onSubmit} className="space-y-4">
                  {/* Email Input */}
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5"
                    >
                      Email Address
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-zinc-500">
                        <FiMail className="w-4 h-4" />
                      </div>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={email}
                        onChange={onChange}
                        required
                        className="w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm border border-slate-200/90 dark:border-white/[0.08] bg-slate-50/80 dark:bg-zinc-900/80 text-slate-900 dark:text-white rounded-xl outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500 dark:focus:border-violet-500 transition placeholder:text-slate-400 dark:placeholder:text-zinc-500"
                        placeholder="you@example.com"
                      />
                    </div>
                  </div>

                  {/* Password Input */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label
                        htmlFor="password"
                        className="block text-xs font-semibold text-slate-700 dark:text-zinc-300"
                      >
                        Password
                      </label>
                      <Link
                        to="/forgot-password"
                        className="text-xs font-semibold text-violet-600 dark:text-violet-400 hover:underline"
                      >
                        Forgot Password?
                      </Link>
                    </div>
                    <SecurePasswordInput
                      id="password"
                      name="password"
                      value={password}
                      onChange={onChange}
                      required
                      showPassword={showPassword}
                      onToggleVisibility={() => setShowPassword(!showPassword)}
                      placeholder="Enter your password"
                      className="w-full px-3.5 py-2.5 pr-10 text-xs sm:text-sm border border-slate-200/90 dark:border-white/[0.08] bg-slate-50/80 dark:bg-zinc-900/80 text-slate-900 dark:text-white rounded-xl outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500 transition placeholder:text-slate-400 dark:placeholder:text-zinc-500"
                    />
                  </div>

                  {/* Submit Button (Kowalski Tactile Button with Sheen) */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="relative group w-full py-3 bg-gradient-to-b from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold rounded-xl text-xs sm:text-sm shadow-lg shadow-violet-600/25 border border-white/20 transition-all duration-150 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2 overflow-hidden"
                  >
                    {/* Shimmer Sheen */}
                    <span className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-[300%] transition-transform duration-700 ease-in-out pointer-events-none" />

                    {isLoading ? (
                      <>
                        <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        <span>Authenticating...</span>
                      </>
                    ) : (
                      <span>Sign In to BizManager</span>
                    )}
                  </button>
                </form>

                <div className="pt-2 text-center text-xs text-slate-500 dark:text-zinc-400">
                  Don't have an account yet?{' '}
                  <Link
                    to="/register"
                    className="font-bold text-violet-600 dark:text-violet-400 hover:underline"
                  >
                    Create Free Account →
                  </Link>
                </div>
              </div>

            </div>
          </div>
        </main>

        {/* Footer Bar */}
        <footer className="pt-6 border-t border-slate-200/60 dark:border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] sm:text-xs text-slate-500 dark:text-zinc-400">
          <div className="flex items-center gap-2">
            <p>© 2026 BizManager by MegaTrix</p>
            <span>•</span>
            <span className="text-[11px] text-slate-400 dark:text-zinc-500 font-mono">v2.4 Production</span>
          </div>
          <div>
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
    </div>
  );
};

export default Login;