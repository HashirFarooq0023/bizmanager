import React, { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';

const Impersonate = () => {
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const token = searchParams.get('token');
    const isSpoof = searchParams.get('spoof');
    
    if (!token) {
      toast.error('Invalid impersonation link: Missing token.');
      return;
    }

    try {
      let decoded = {};
      try {
        decoded = JSON.parse(atob(token.split('.')[1])) || {};
      } catch (e) {
        console.warn('[Impersonate] Could not decode JWT claims:', e);
      }

      const userObj = {
        token,
        refreshToken: token,
        _id: decoded.id || decoded.userId || decoded._id || 'merchant_user',
        id: decoded.id || decoded.userId || decoded._id || 'merchant_user',
        name: decoded.name || 'Store Merchant',
        email: decoded.email || 'merchant@bizmanager.internal',
        shopName: decoded.shopName || 'Retail Counter',
        role: decoded.role || 'owner',
        isSuperAdmin: false,
        accountStatus: 'active',
        _impersonated: true,
      };
      
      localStorage.setItem('user', JSON.stringify(userObj));
      
      if (isSpoof === 'true') {
        sessionStorage.setItem('impersonation_active', 'true');
        sessionStorage.setItem('spoof_started_at', Date.now().toString());
      }
      
      // Full page redirect so Redux and Axios interceptors reinitialize with the new token
      window.location.replace('/dashboard');
    } catch (error) {
      console.error('Error during impersonation setup:', error);
      toast.error('Failed to start impersonation session.');
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#07090F] text-slate-900 dark:text-slate-100">
      <div className="flex flex-col items-center gap-3">
        <div className="w-9 h-9 border-3 border-violet-600 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-semibold text-slate-500 dark:text-zinc-400 font-sans tracking-wide">
          Initializing Impersonation Session...
        </span>
      </div>
    </div>
  );
};

export default Impersonate;
