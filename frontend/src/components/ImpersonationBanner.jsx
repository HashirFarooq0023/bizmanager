import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { logout } from '../redux/slices/authSlice'; // Fallback to clearing storage directly

const ImpersonationBanner = () => {
  const [isActive, setIsActive] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    const checkStatus = () => {
      const active = sessionStorage.getItem('impersonation_active') === 'true';
      const startedAt = sessionStorage.getItem('spoof_started_at');
      
      if (active && startedAt) {
        const elapsed = Date.now() - parseInt(startedAt, 10);
        if (elapsed > 1800000) {
          handleEndSession();
        } else {
          setIsActive(true);
          document.documentElement.classList.add('has-impersonation');
        }
      } else {
        setIsActive(false);
        document.documentElement.classList.remove('has-impersonation');
      }
    };

    checkStatus();
    const interval = setInterval(checkStatus, 30000);
    return () => {
      clearInterval(interval);
      document.documentElement.classList.remove('has-impersonation');
    };
  }, []);

  const handleEndSession = () => {
    localStorage.removeItem('user');
    sessionStorage.removeItem('impersonation_active');
    sessionStorage.removeItem('spoof_started_at');
    document.documentElement.classList.remove('has-impersonation');
    
    if (typeof logout === 'function') {
      dispatch(logout());
    }

    try {
      window.close();
    } catch (e) {
      // ignore
    }
    
    setTimeout(() => {
      window.location.href = '/login';
    }, 100);
  };

  if (!isActive) return null;

  return (
    <div className="sticky top-0 left-0 right-0 w-full z-[9999] bg-red-600 text-white h-10 px-3 sm:px-6 flex items-center justify-between shadow-md text-xs sm:text-sm font-semibold select-none shrink-0 print:hidden">
      <div className="flex items-center gap-2 truncate">
        <span className="w-2.5 h-2.5 rounded-full bg-white shrink-0 animate-pulse" />
        <span className="truncate">
          <span className="font-black uppercase tracking-wider">Impersonation Active</span> — You are viewing this account as MegaTrix Admin. All actions are logged.
        </span>
      </div>
      <button 
        type="button"
        onClick={handleEndSession}
        className="ml-3 px-2.5 py-1 bg-black/25 hover:bg-black/40 border border-white/50 hover:border-white rounded text-white text-xs font-bold transition-all shrink-0 cursor-pointer shadow-xs active:scale-95"
      >
        End Session ✕
      </button>
    </div>
  );
};

export default ImpersonationBanner;
