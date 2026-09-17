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
          document.body.style.paddingTop = '40px';
        }
      } else {
        setIsActive(false);
        document.body.style.paddingTop = '0px';
      }
    };

    checkStatus();
    const interval = setInterval(checkStatus, 60000);
    return () => {
      clearInterval(interval);
      document.body.style.paddingTop = '0px';
    };
  }, []);

  const handleEndSession = () => {
    localStorage.removeItem('user');
    sessionStorage.removeItem('impersonation_active');
    sessionStorage.removeItem('spoof_started_at');
    document.body.style.paddingTop = '0px';
    
    if (typeof logout === 'function') {
      dispatch(logout());
    }

    try {
      window.close();
    } catch (e) {
      // ignore
    }
    
    // If window.close() fails or isn't allowed, redirect
    setTimeout(() => {
      window.location.href = '/login';
    }, 100);
  };

  if (!isActive) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 9999,
      backgroundColor: '#ef4444',
      color: 'white',
      padding: '8px 16px',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      fontWeight: 'bold',
      fontSize: '14px',
      height: '40px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
    }}>
      <span>🔴 IMPERSONATION ACTIVE — You are viewing this account as MegaTrix Admin. All actions are logged.</span>
      <button 
        onClick={handleEndSession}
        style={{
          marginLeft: '16px',
          backgroundColor: 'rgba(0,0,0,0.2)',
          border: '1px solid rgba(255,255,255,0.4)',
          borderRadius: '4px',
          padding: '4px 8px',
          color: 'white',
          cursor: 'pointer',
          fontWeight: 'bold'
        }}
        onMouseOver={e => e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.4)'}
        onMouseOut={e => e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.2)'}
      >
        End Session ✕
      </button>
    </div>
  );
};

export default ImpersonationBanner;
