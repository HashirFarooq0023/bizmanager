import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';

const decodeJwt = (jwtString) => {
  try {
    const base64Url = jwtString.split('.')[1];
    if (!base64Url) return {};
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload) || {};
  } catch (err) {
    console.warn('[Impersonate] Could not decode JWT claims:', err);
    return {};
  }
};

const Impersonate = () => {
  const [searchParams] = useSearchParams();
  const [statusMessage, setStatusMessage] = useState('Initializing Impersonation Session...');

  useEffect(() => {
    const runImpersonation = async () => {
      const token = searchParams.get('token');
      const isSpoof = searchParams.get('spoof');

      if (!token) {
        toast.error('Invalid impersonation link: Missing authentication token.');
        return;
      }

      try {
        const decoded = decodeJwt(token);

        const targetId = decoded.id || decoded.userId || decoded._id || searchParams.get('targetId') || '';
        const targetName = decoded.name || searchParams.get('targetName') || 'Merchant';
        const targetShop = decoded.shopName || searchParams.get('targetShop') || '';
        const targetEmail = decoded.email || searchParams.get('targetEmail') || '';
        const targetRole = decoded.role || searchParams.get('targetRole') || 'owner';
        const targetOrgId = decoded.organizationId || null;

        setStatusMessage(`Authenticating as ${targetName}${targetShop ? ` (${targetShop})` : ''}...`);

        // 1. Immediately store baseline user claims
        const userObj = {
          token,
          refreshToken: token,
          _id: targetId,
          id: targetId,
          name: targetName,
          email: targetEmail,
          shopName: targetShop,
          role: targetRole,
          organizationId: targetOrgId,
          isSuperAdmin: targetRole === 'superadmin',
          accountStatus: 'active',
          _impersonated: true,
        };

        localStorage.setItem('user', JSON.stringify(userObj));

        if (isSpoof === 'true' || decoded.isSpoof) {
          sessionStorage.setItem('impersonation_active', 'true');
          sessionStorage.setItem('spoof_started_at', Date.now().toString());
          sessionStorage.setItem('spoof_user_name', targetName);
          sessionStorage.setItem('spoof_shop_name', targetShop);
        }

        // 2. Fetch full live profile from database to hydrate complete attributes
        try {
          const backendBase = import.meta.env.VITE_BACKEND_URL || '';
          const res = await fetch(`${backendBase}/api/auth/profile`, {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });

          if (res.ok) {
            const data = await res.json();
            if (data?.user) {
              const fullUser = {
                token,
                refreshToken: token,
                ...data.user,
                _impersonated: true,
              };
              localStorage.setItem('user', JSON.stringify(fullUser));
              if (fullUser.name) sessionStorage.setItem('spoof_user_name', fullUser.name);
              if (fullUser.shopName) sessionStorage.setItem('spoof_shop_name', fullUser.shopName);
            }
          }
        } catch (profileErr) {
          console.warn('[Impersonate] Live profile fetch fallback:', profileErr);
        }

        // 3. Full page redirect so all stores and Axios reinitialize
        window.location.replace('/dashboard');
      } catch (error) {
        console.error('Error during impersonation setup:', error);
        toast.error('Failed to start impersonation session.');
      }
    };

    runImpersonation();
  }, [searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#09090b] text-slate-900 dark:text-slate-100">
      <div className="flex flex-col items-center gap-3">
        <div className="w-9 h-9 border-3 border-zinc-900 dark:border-zinc-100 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-semibold text-slate-500 dark:text-zinc-400 font-sans tracking-wide">
          {statusMessage}
        </span>
      </div>
    </div>
  );
};

export default Impersonate;
