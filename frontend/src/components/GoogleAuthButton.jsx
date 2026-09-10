import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { googleLogin } from '../redux/slices/authSlice';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useTranslation } from 'react-i18next';

const GOOGLE_CLIENT_ID =
  import.meta.env.VITE_GOOGLE_CLIENT_ID ||
  '797014673114-9rlvk9ivhh9m675p041vr67ojkm948ut.apps.googleusercontent.com';

const GoogleAuthButton = ({ mode = 'signin' }) => {
  const buttonRef = useRef(null);
  const dispatch = useDispatch();
  const { theme } = useTheme();
  const { language } = useLanguage();
  const { t } = useTranslation(['auth', 'common']);
  const { isLoading } = useSelector((state) => state.auth);
  const [gisLoaded, setGisLoaded] = useState(false);

  const handleCredentialResponseRef = useRef();
  handleCredentialResponseRef.current = (response) => {
    if (response && response.credential) {
      dispatch(googleLogin({ credential: response.credential }));
    }
  };

  useEffect(() => {
    let checkCount = 0;
    const maxChecks = 50; // Check up to 5 seconds

    const initGis = () => {
      if (window.google && window.google.accounts && window.google.accounts.id) {
        setGisLoaded(true);

        try {
          if (!window.__bizmanager_gis_initialized) {
            window.google.accounts.id.initialize({
              client_id: GOOGLE_CLIENT_ID,
              callback: (response) => {
                if (handleCredentialResponseRef.current) {
                  handleCredentialResponseRef.current(response);
                }
              },
              auto_select: false,
              cancel_on_tap_outside: true,
            });
            window.__bizmanager_gis_initialized = true;
          }

          if (buttonRef.current) {
            buttonRef.current.innerHTML = ''; // Clear previous render to handle theme/lang change

            const containerWidth = buttonRef.current.offsetWidth || 360;
            // Google GIS width must be between 200 and 400 px
            const targetWidth = Math.max(220, Math.min(containerWidth, 400));

            window.google.accounts.id.renderButton(buttonRef.current, {
              type: 'standard',
              theme: theme === 'dark' ? 'filled_black' : 'outline',
              size: 'large',
              text: mode === 'signup' ? 'signup_with' : 'signin_with',
              shape: 'rectangular',
              logo_alignment: 'left',
              width: targetWidth,
              locale: language === 'ur' ? 'ur' : 'en',
            });
          }
        } catch (err) {
          console.warn('Google Identity Services initialization warning:', err);
        }
      } else if (checkCount < maxChecks) {
        checkCount++;
        setTimeout(initGis, 100);
      }
    };

    initGis();
  }, [theme, language, mode]);

  return (
    <div className="w-full flex flex-col items-center justify-center my-1 relative">
      <div
        ref={buttonRef}
        className="w-full flex items-center justify-center min-h-[44px] transition-all overflow-hidden rounded-xl"
      />

      {/* Fallback branded button if Google Identity script is still initializing or blocked */}
      {!gisLoaded && (
        <button
          type="button"
          disabled={true}
          className="w-full max-w-[400px] h-[44px] px-4 rounded-xl border border-slate-300 dark:border-white/[0.12] bg-white dark:bg-zinc-900 text-slate-700 dark:text-zinc-200 text-xs sm:text-sm font-semibold flex items-center justify-center gap-3 shadow-xs opacity-75 cursor-wait"
        >
          <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
            />
            <path
              fill="#34A853"
              d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.26v3.15C3.26 21.36 7.33 24 12 24z"
            />
            <path
              fill="#FBBC05"
              d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.26C.46 8.16 0 9.94 0 12s.46 3.84 1.26 5.42l4.02-3.15z"
            />
            <path
              fill="#EA4335"
              d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.26 6.58l4.02 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
            />
          </svg>
          <span className="font-urdu">
            {mode === 'signup'
              ? (t('auth:register.googleSignUp') || 'Sign up with Google')
              : (t('auth:login.googleSignIn') || 'Sign in with Google')}
          </span>
        </button>
      )}

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-white/70 dark:bg-zinc-950/70 backdrop-blur-xs flex items-center justify-center rounded-xl z-20">
          <div className="flex items-center gap-2 text-xs font-semibold text-violet-600 dark:text-violet-400">
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span className="font-urdu">
              {language === 'ur' ? 'گوگل سے تصدیق ہو رہی ہے...' : 'Authenticating with Google...'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default GoogleAuthButton;
