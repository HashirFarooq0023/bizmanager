import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { login, reset } from '../redux/slices/authSlice';
import DeviceConflictModal from '../components/DeviceConflictModal';
import SecurePasswordInput from '../components/SecurePasswordInput';
import Logo from '../components/Logo';
import { useTheme } from '../contexts/ThemeContext';

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
    <div className="min-h-screen bg-slate-50 dark:bg-black text-slate-900 dark:text-white font-sans selection:bg-violet-600 selection:text-white transition-colors duration-300 relative overflow-hidden flex flex-col justify-between">

      {/* Global Ambient Background Glows */}
      <div className="absolute -top-32 -left-32 w-96 sm:w-[550px] h-96 sm:h-[550px] bg-violet-500/15 dark:bg-violet-600/20 blur-[140px] rounded-full pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 sm:w-[550px] h-96 sm:h-[550px] bg-indigo-500/15 dark:bg-indigo-600/20 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-400/5 dark:bg-purple-600/10 blur-[160px] rounded-full pointer-events-none" />

      {/* Outer Centered Responsive Container */}
      <div className="max-w-7xl mx-auto w-full min-h-screen flex flex-col justify-between p-6 sm:p-10 lg:p-12 relative z-10">

        {/* Top Action Header Bar */}
        <header className="flex items-center justify-between w-full pb-6">
          <Link to="/" className="flex items-center gap-3.5 group">
            <Logo size="2xl" showText={true} showSubtitle={true} />
          </Link>

          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-white/70 dark:bg-[#0C0F17] border border-slate-200 dark:border-zinc-800/80 shadow-sm backdrop-blur-md transition hover:scale-105 active:scale-95"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span>Back to Website</span>
            </Link>

            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2.5 px-3.5 rounded-xl bg-white/80 dark:bg-[#0C0F17] text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#141724] hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-zinc-800/80 shadow-sm transition backdrop-blur-md cursor-pointer flex items-center gap-2 text-xs font-semibold"
              title="Toggle Light / Dark Mode"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? (
                <>
                  <svg className="w-4 h-4 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                  <span>Dark Mode</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  <span>Light Mode</span>
                </>
              )}
            </button>
          </div>
        </header>

        {/* Main Content Grid: Balanced 2-Column Layout */}
        <main className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 xl:gap-16 items-center my-auto py-6 sm:py-10">

          {/* Left Hero & Value Proposition (Desktop & Tablet) */}
          <div className="hidden lg:flex lg:col-span-7 xl:col-span-7 flex-col justify-center space-y-8 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-violet-100/90 dark:bg-[#121422] border border-violet-200 dark:border-violet-900/60 text-xs font-semibold text-violet-700 dark:text-violet-300 shadow-sm w-fit">
              <span className="w-2 h-2 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse" />
              <span>Secure Business Operating System</span>
            </div>

            <h1 className="text-3xl sm:text-4xl xl:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.15]">
              Manage Sales, Inventory & Dues in One Fast Workspace.
            </h1>

            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
              BizManager eliminates stock mismatches, automates customer credit ledgers, and gives you instant net profit calculations in real time.
            </p>

            {/* Feature Highlights (Light-black card layers) */}
            <div className="space-y-3.5 pt-2">
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/70 dark:bg-[#0A0C13]/80 border border-slate-200/80 dark:border-zinc-800/60 backdrop-blur-md shadow-sm dark:shadow-none hover:border-violet-500/30 dark:hover:border-violet-500/40 dark:hover:bg-[#111420] transition-all group">
                <div className="w-10 h-10 rounded-xl bg-violet-600/15 dark:bg-violet-600/25 text-violet-600 dark:text-violet-400 flex items-center justify-center font-bold text-lg flex-shrink-0 group-hover:scale-110 transition-transform">⚡</div>
                <div>
                  <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">Ultra-Fast POS Counter</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Barcode scanner support & multi-cart checkout</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/70 dark:bg-[#0A0C13]/80 border border-slate-200/80 dark:border-zinc-800/60 backdrop-blur-md shadow-sm dark:shadow-none hover:border-indigo-500/30 dark:hover:border-indigo-500/40 dark:hover:bg-[#111420] transition-all group">
                <div className="w-10 h-10 rounded-xl bg-indigo-600/15 dark:bg-indigo-600/25 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-lg flex-shrink-0 group-hover:scale-110 transition-transform">🛡️</div>
                <div>
                  <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">Stock Guardian & Low-Stock Alerts</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Automatic reorder warnings & barcode labels</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/70 dark:bg-[#0A0C13]/80 border border-slate-200/80 dark:border-zinc-800/60 backdrop-blur-md shadow-sm dark:shadow-none hover:border-emerald-500/30 dark:hover:border-emerald-500/40 dark:hover:bg-[#111420] transition-all group">
                <div className="w-10 h-10 rounded-xl bg-emerald-600/15 dark:bg-emerald-600/25 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-lg flex-shrink-0 group-hover:scale-110 transition-transform">💳</div>
                <div>
                  <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">Customer & Udhaar Ledgers</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Automated credit balances & payment reminders</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Login Card Column */}
          <div className="lg:col-span-5 xl:col-span-5 w-full flex flex-col justify-center">
            <div className="max-w-md w-full mx-auto space-y-6">

              {/* Mobile Header */}
              <div className="lg:hidden flex flex-col items-center text-center mb-4">
                <Logo size="2xl" showText={true} showSubtitle={true} className="mb-3" />
              </div>

              <div className="space-y-1 text-center sm:text-left">
                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                  Welcome Back
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                  Sign in to your BizManager business account
                </p>
              </div>

              {/* Form Card (Light-black elevated container) */}
              <div className="bg-white/85 dark:bg-[#0C0F17]/95 rounded-3xl shadow-xl dark:shadow-2xl dark:shadow-black/90 border border-slate-200/80 dark:border-zinc-800/80 p-6 sm:p-8 space-y-6 backdrop-blur-xl transition-colors duration-200">

                {isError && (
                  <div className="p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 rounded-xl flex items-center gap-2.5">
                    <svg className="w-4 h-4 text-rose-600 dark:text-rose-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    <p className="text-rose-700 dark:text-rose-300 text-xs font-semibold">{message}</p>
                  </div>
                )}

                <form onSubmit={onSubmit} className="space-y-5">
                  {/* Email Input (Deep Black Inset) */}
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5"
                    >
                      Email Address
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-zinc-500">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={email}
                        onChange={onChange}
                        required
                        className="w-full pl-10 pr-3.5 py-2.5 text-sm border border-slate-300 dark:border-zinc-800/80 bg-slate-50/80 dark:bg-[#05060A] text-slate-900 dark:text-white rounded-xl outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500 dark:focus:border-violet-500 transition placeholder:text-slate-400 dark:placeholder:text-zinc-500"
                        placeholder="you@example.com"
                      />
                    </div>
                  </div>

                  {/* Password Input (Deep Black Inset) */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label
                        htmlFor="password"
                        className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
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
                      className="w-full px-4 py-2.5 pr-10 text-sm border border-slate-300 dark:border-zinc-800/80 bg-slate-50/80 dark:bg-[#05060A] text-slate-900 dark:text-white rounded-xl outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500 transition placeholder:text-slate-400 dark:placeholder:text-zinc-500"
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold rounded-xl text-sm shadow-lg shadow-violet-600/25 transition-all transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
                  >
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

                <div className="pt-1 text-center text-xs text-slate-600 dark:text-slate-400">
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

        {/* Unified Bottom Footer Bar */}
        <footer className="pt-6 border-t border-slate-200/80 dark:border-zinc-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <p>© 2026 BizManager by MegaTrix</p>
            <span>•</span>
            <span className="text-[11px] text-slate-400 dark:text-slate-500 font-mono">v2.4 Production</span>
          </div>
          <div>
            Support: <a href="tel:03254567318" className="font-semibold hover:underline text-slate-700 dark:text-slate-300">0325-4567318</a> • <a href="mailto:support@megatrixai.com" className="font-semibold hover:underline text-slate-700 dark:text-slate-300">support@megatrixai.com</a>
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