import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { performPasswordReset, reset } from '../redux/slices/authSlice';
import SecurePasswordInput from '../components/SecurePasswordInput';
import Logo from '../components/Logo';
import { useTheme } from '../contexts/ThemeContext';

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
      setValidationError('Reset link is invalid. Please request a new one.');
      return;
    }

    if (password !== confirmPassword) {
      setValidationError('Passwords do not match');
      return;
    }

    if (!isStrongPassword(password)) {
      setValidationError(
        'Password must be at least 8 characters long and include an uppercase letter, a lowercase letter, a number, and a special character.'
      );
      return;
    }

    dispatch(performPasswordReset({ token, email, password }));
  };

  useEffect(() => {
    // On successful reset, redirect to login after short delay
    if (isSuccess) {
      const t = setTimeout(() => navigate('/login'), 1500);
      return () => clearTimeout(t);
    }
  }, [isSuccess, navigate]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black text-slate-900 dark:text-white font-sans selection:bg-violet-600 selection:text-white transition-colors duration-300 relative overflow-hidden flex flex-col justify-between p-4 sm:p-8">
      {/* Global Ambient Background Glows */}
      <div className="absolute -top-32 -left-32 w-96 sm:w-[500px] h-96 sm:h-[500px] bg-violet-500/15 dark:bg-violet-600/20 blur-[140px] rounded-full pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 sm:w-[500px] h-96 sm:h-[500px] bg-indigo-500/15 dark:bg-indigo-600/20 blur-[150px] rounded-full pointer-events-none" />

      {/* Top Header Bar */}
      <div className="w-full max-w-md mx-auto flex items-center justify-between z-10 mb-6">
        <Link
          to="/login"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span>Back to Sign In</span>
        </Link>

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

      <div className="max-w-md w-full mx-auto relative z-10 my-auto">
        <div className="text-center mb-8 flex flex-col items-center">
          <Logo size="xl" showText={true} showSubtitle={true} className="mb-3" />
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">Set a new password for {email || 'your account'}</p>
        </div>

        <div className="bg-white/85 dark:bg-[#0C0F17]/95 rounded-3xl shadow-xl dark:shadow-2xl dark:shadow-black/90 border border-slate-200/80 dark:border-zinc-800/80 p-6 sm:p-8 backdrop-blur-xl transition-colors duration-200">
          {(validationError || isError || isSuccess) && (
            <div className={`mb-6 p-4 border rounded-xl flex items-center gap-2.5 ${validationError ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900/60 text-amber-700 dark:text-amber-300' : isSuccess ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900/60 text-emerald-700 dark:text-emerald-300' : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-300'}`}>
              <p className="text-xs font-semibold">
                {validationError || message}
              </p>
            </div>
          )}

          <form onSubmit={onSubmit} className="space-y-6">
            <div>
              <label htmlFor="password" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">New Password</label>
              <SecurePasswordInput
                id="password"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                showPassword={showPassword}
                onToggleVisibility={() => setShowPassword(!showPassword)}
                placeholder="Min 8+ characters"
                className="w-full px-4 py-2.5 pr-10 text-sm border border-slate-300 dark:border-zinc-800/80 bg-slate-50/80 dark:bg-[#05060A] text-slate-900 dark:text-white rounded-xl outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500 transition placeholder:text-slate-400 dark:placeholder:text-zinc-500"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Confirm Password</label>
              <SecurePasswordInput
                id="confirmPassword"
                name="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                showPassword={showConfirmPassword}
                onToggleVisibility={() => setShowConfirmPassword(!showConfirmPassword)}
                placeholder="Re-enter password"
                className="w-full px-4 py-2.5 pr-10 text-sm border border-slate-300 dark:border-zinc-800/80 bg-slate-50/80 dark:bg-[#05060A] text-slate-900 dark:text-white rounded-xl outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500 transition placeholder:text-slate-400 dark:placeholder:text-zinc-500"
              />
            </div>

            <button type="submit" disabled={isLoading} className="w-full py-3 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold rounded-xl text-sm shadow-lg shadow-violet-600/25 transition-all transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2">
              {isLoading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-slate-600 dark:text-slate-400 text-xs">
              Back to{' '}<Link to="/login" className="text-violet-600 dark:text-violet-400 font-bold hover:underline transition">Sign In</Link>
            </p>
          </div>
        </div>
      </div>

      <div className="mt-6 text-center text-xs text-slate-500 dark:text-slate-400">
        © 2026 BizManager by MegaTrix
      </div>
    </div>
  );
};

export default ResetPassword;
