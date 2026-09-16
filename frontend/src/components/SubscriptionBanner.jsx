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
      <div className="bg-gradient-to-r from-rose-600 via-red-600 to-rose-700 text-white px-4 py-2.5 shadow-md flex items-center justify-between text-xs sm:text-sm font-medium print:hidden">
        <div className="flex items-center gap-2 max-w-2xl">
          <FiAlertTriangle className="w-4 h-4 flex-shrink-0 animate-bounce" />
          <span>
            <strong>Subscription Expired:</strong> Your BizManager license has expired. Transactions and ERP features are currently locked.
          </span>
        </div>
        <Link
          to="/subscription-expired"
          className="inline-flex items-center gap-1.5 bg-white text-rose-700 font-bold px-3 py-1.5 rounded-lg shadow-sm hover:bg-rose-50 transition-all text-xs"
        >
          <span>Renew License</span>
          <FiArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    );
  }

  if (isTrial) {
    return (
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white px-4 py-2 shadow-xs flex items-center justify-between text-xs font-medium print:hidden">
        <div className="flex items-center gap-2">
          <div className="p-1 bg-white/20 rounded-md">
            <FiClock className="w-3.5 h-3.5" />
          </div>
          <span>
            <strong>Free Trial Active:</strong> You have <strong>{daysRemaining} {daysRemaining === 1 ? 'day' : 'days'}</strong> remaining on your MegaTrix trial.
          </span>
        </div>
        <Link
          to="/subscription-expired"
          className="inline-flex items-center gap-1 bg-white/15 hover:bg-white text-white hover:text-emerald-800 font-bold px-3 py-1 rounded-md transition-all text-xs border border-white/20"
        >
          <FiZap className="w-3 h-3 text-amber-300 group-hover:text-amber-500" />
          <span>Upgrade to Pro</span>
        </Link>
      </div>
    );
  }

  // Paid plan expiring soon
  return (
    <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white px-4 py-2 shadow-xs flex items-center justify-between text-xs font-medium print:hidden">
      <div className="flex items-center gap-2">
        <FiAlertTriangle className="w-3.5 h-3.5" />
        <span>
          <strong>Plan Expiring Soon:</strong> Your {sub.plan.toUpperCase()} plan expires in <strong>{daysRemaining} {daysRemaining === 1 ? 'day' : 'days'}</strong>.
        </span>
      </div>
      <Link
        to="/subscription-expired"
        className="inline-flex items-center gap-1 bg-white text-orange-700 font-bold px-3 py-1 rounded-md shadow-xs hover:bg-orange-50 transition-all text-xs"
      >
        <span>Renew Now</span>
        <FiArrowRight className="w-3 h-3" />
      </Link>
    </div>
  );
};

export default SubscriptionBanner;
