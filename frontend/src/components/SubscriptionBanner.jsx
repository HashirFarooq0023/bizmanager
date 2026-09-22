import React from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { FiClock, FiZap, FiAlertTriangle, FiArrowRight } from 'react-icons/fi';

const SubscriptionBanner = () => {
  const { user } = useSelector((state) => state.auth);

  if (!user || user.role === 'superadmin' || user.role === 'admin') {
    return null;
  }

  const sub = user.subscription;
  if (!sub || sub.isLifetime) {
    return null;
  }

  const now = new Date();
  const expiresAt = sub.expiresAt ? new Date(sub.expiresAt) : null;
  if (!expiresAt) return null;

  const msRemaining = expiresAt.getTime() - now.getTime();
  const daysRemaining = Math.max(0, Math.ceil(msRemaining / (1000 * 60 * 60 * 24)));
  const isExpired = now > expiresAt;
  const isTrial = sub.plan === 'trial';

  // If expiring in more than 7 days and is a paid plan, don't show intrusive banner
  if (!isTrial && daysRemaining > 5 && !isExpired) {
    return null;
  }

  if (isExpired) {
    return (
      <div className="bg-rose-900/90 text-rose-100 border-b border-rose-800/80 px-4 py-2.5 flex items-center justify-between text-xs sm:text-sm font-medium print:hidden">
        <div className="flex items-center gap-2 max-w-2xl">
          <FiAlertTriangle className="w-4 h-4 text-rose-300 shrink-0" />
          <span>
            <strong className="text-white">Subscription Expired:</strong> Your BizManager license has expired. Transactions and ERP features are currently locked.
          </span>
        </div>
        <Link
          to="/subscription-expired"
          className="inline-flex items-center gap-1.5 bg-rose-600 hover:bg-rose-500 text-white font-semibold px-3 py-1.5 rounded-lg shadow-xs transition-all text-xs"
        >
          <span>Renew License</span>
          <FiArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    );
  }

  if (isTrial) {
    return (
      <div className="bg-zinc-900 dark:bg-zinc-950 text-zinc-300 border-b border-zinc-800 px-4 py-2 flex items-center justify-between text-xs font-medium print:hidden">
        <div className="flex items-center gap-2.5">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 font-semibold border border-emerald-500/30 text-[11px]">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Trial Active
          </span>
          <span className="text-zinc-300">
            You have <strong className="text-white">{daysRemaining} {daysRemaining === 1 ? 'day' : 'days'}</strong> remaining on your BizManager trial.
          </span>
        </div>
        <Link
          to="/subscription-expired"
          className="inline-flex items-center gap-1.5 bg-violet-600 hover:bg-violet-500 text-white font-semibold px-3 py-1 rounded-md transition-all text-xs shadow-xs"
        >
          <FiZap className="w-3 h-3 text-amber-300" />
          <span>Upgrade to Pro</span>
        </Link>
      </div>
    );
  }

  // Paid plan expiring soon
  return (
    <div className="bg-amber-950/80 text-amber-100 border-b border-amber-800/80 px-4 py-2 flex items-center justify-between text-xs font-medium print:hidden">
      <div className="flex items-center gap-2">
        <FiAlertTriangle className="w-4 h-4 text-amber-300" />
        <span>
          <strong className="text-white">Plan Expiring Soon:</strong> Your {sub.plan.toUpperCase()} plan expires in <strong>{daysRemaining} {daysRemaining === 1 ? 'day' : 'days'}</strong>.
        </span>
      </div>
      <Link
        to="/subscription-expired"
        className="inline-flex items-center gap-1 bg-amber-600 hover:bg-amber-500 text-white font-semibold px-3 py-1 rounded-md shadow-xs transition-all text-xs"
      >
        <span>Renew Now</span>
        <FiArrowRight className="w-3 h-3" />
      </Link>
    </div>
  );
};

export default SubscriptionBanner;
