import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout, reset } from '../redux/slices/authSlice';
import api from '../services/api';
import Logo from '../components/Logo';
import {
  FiLock,
  FiZap,
  FiCheckCircle,
  FiRefreshCw,
  FiLogOut,
  FiShield,
  FiArrowRight,
  FiMessageSquare,
  FiAlertOctagon,
  FiCreditCard,
  FiCheck,
} from 'react-icons/fi';
import { toast } from 'react-toastify';

const SubscriptionExpired = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const [plans, setPlans] = useState([]);
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);
  const [processingPlan, setProcessingPlan] = useState(null);
  const [contactInfo, setContactInfo] = useState(null);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/subscriptions/plans');
      if (res.data && res.data.plans) {
        setPlans(res.data.plans.filter((p) => p.id !== 'trial' && p.slug !== 'trial'));
        setContactInfo(res.data.contact);
      }
    } catch (err) {
      console.error('Failed to load plans:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshStatus = async () => {
    try {
      setChecking(true);
      const res = await api.get('/api/subscriptions/me');
      if (res.data && res.data.subscription) {
        const sub = res.data.subscription;
        if (!sub.isExpired && sub.status === 'active') {
          toast.success('🎉 Subscription active! Restoring full access...');
          setTimeout(() => {
            navigate('/dashboard');
          }, 1000);
        } else {
          toast.info('Subscription is still pending activation. Please renew below or contact support.');
        }
      }
    } catch (err) {
      toast.error('Unable to verify subscription. Please try again.');
    } finally {
      setChecking(false);
    }
  };

  const handleCheckout = async (plan) => {
    try {
      const targetSlug = plan.slug || plan.id || plan._id;
      const payload = {
        planId: targetSlug,
        planSlug: targetSlug,
        slug: targetSlug,
        billingCycle: billingCycle === 'lifetime' || plan.slug === 'lifetime' ? 'lifetime' : billingCycle,
        currency: 'PKR',
      };

      const res = await api.post('/api/subscriptions/checkout', payload);
      if (res.data?.success && res.data?.checkoutUrl) {
        toast.info('Opening Assan Pay secure checkout...');
        window.location.href = res.data.checkoutUrl;
      } else if (res.data?.message) {
        toast.info(res.data.message);
        handleRefreshStatus();
      } else {
        toast.error('Could not initiate checkout session.');
      }
    } catch (err) {
      console.error('Checkout error:', err);
      const errMsg =
        err.response?.data?.error ||
        err.response?.data?.message ||
        'Failed to initiate checkout session. Please contact support.';
      toast.error(errMsg);
    } finally {
      setProcessingPlan(null);
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    dispatch(reset());
    navigate('/login');
  };

  const isSuspended = user?.accountStatus === 'suspended' || user?.status === 'suspended' || user?.subscription?.status === 'terminated';

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-between p-4 sm:p-6 lg:p-8 relative overflow-hidden font-sans">
      {/* Ambient background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-violet-600/10 blur-[120px] pointer-events-none rounded-full" />
      <div className="absolute bottom-0 right-10 w-80 h-80 bg-emerald-600/10 blur-[100px] pointer-events-none rounded-full" />

      {/* Top Header */}
      <header className="max-w-6xl w-full mx-auto flex items-center justify-between py-2 border-b border-slate-800 z-10">
        <Logo size="md" />
        <div className="flex items-center gap-3">
          <button
            onClick={handleRefreshStatus}
            disabled={checking}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition-all disabled:opacity-50 cursor-pointer"
          >
            <FiRefreshCw className={`w-3.5 h-3.5 ${checking ? 'animate-spin' : ''}`} />
            <span>Check Activation</span>
          </button>
          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 text-xs font-semibold transition-all border border-rose-500/20 cursor-pointer"
          >
            <FiLogOut className="w-3.5 h-3.5" />
            <span>Logout</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-6xl w-full mx-auto my-8 z-10 space-y-8">
        {/* Status Hero Card */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-rose-500 to-amber-500 p-0.5 shadow-xl shadow-rose-500/10 mx-auto">
            <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center">
              {isSuspended ? (
                <FiAlertOctagon className="w-7 h-7 text-rose-500" />
              ) : (
                <FiLock className="w-7 h-7 text-amber-400" />
              )}
            </div>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            {isSuspended ? 'Account Suspended' : 'Your BizManager Subscription Has Ended'}
          </h1>
          <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed">
            {isSuspended
              ? `Your account for "${user?.shopName || user?.name}" has been placed on hold by administration. Contact MegaTrix support for immediate reactivation.`
              : `All your inventory, customer khata ledgers, and sales invoices are safely preserved. Select a plan below to pay online via Assan Pay and unlock POS operations instantly.`}
          </p>

          {/* Billing Cycle Switcher */}
          {!isSuspended && (
            <div className="pt-2">
              <div className="inline-flex items-center p-1 rounded-xl bg-slate-800/90 border border-slate-700 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setBillingCycle('monthly')}
                  className={`px-4 py-2 rounded-lg transition-all cursor-pointer ${
                    billingCycle === 'monthly'
                      ? 'bg-violet-600 text-white shadow-sm font-extrabold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Monthly Billing
                </button>
                <button
                  type="button"
                  onClick={() => setBillingCycle('yearly')}
                  className={`px-4 py-2 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                    billingCycle === 'yearly'
                      ? 'bg-violet-600 text-white shadow-sm font-extrabold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <span>Annual (Yearly)</span>
                  <span className="px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    Save 20%
                  </span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Subscription Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-2">
          {plans.map((p) => {
            const isPopular = Boolean(p.isPopular || p.popular || p.slug === 'pro');
            const isPlanLifetime = p.slug === 'lifetime';

            let priceToDisplay = p.price || 0;
            let tenureLabel = '/ mo';
            if (billingCycle === 'yearly' && p.yearlyPrice) {
              priceToDisplay = p.yearlyPrice;
              tenureLabel = '/ yr';
            } else if (isPlanLifetime && p.lifetimePrice) {
              priceToDisplay = p.lifetimePrice;
              tenureLabel = 'lifetime';
            }

            return (
              <div
                key={p.slug || p.id}
                className={`rounded-2xl p-6 transition-all duration-300 relative flex flex-col justify-between border ${
                  isPopular
                    ? 'bg-gradient-to-b from-slate-800/95 to-slate-900/95 border-violet-500 shadow-2xl shadow-violet-500/15 ring-1 ring-violet-500/30'
                    : 'bg-slate-800/60 hover:bg-slate-800/80 border-slate-700/80'
                }`}
              >
                {isPopular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md">
                    {p.badge || 'Most Popular'}
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-bold text-white">{p.name}</h3>
                    <p className="text-xs text-slate-400 mt-1 min-h-[32px] line-clamp-2">
                      {p.tagline || p.description}
                    </p>
                  </div>

                  <div className="flex items-baseline gap-1 py-2 border-y border-slate-700/50">
                    <span className="text-2xl sm:text-3xl font-extrabold text-white font-mono">
                      Rs {priceToDisplay.toLocaleString()}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">{tenureLabel}</span>
                  </div>

                  <ul className="space-y-2.5 text-xs text-slate-300">
                    {(Array.isArray(p.features) ? p.features : []).slice(0, 5).map((f, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <FiCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span className="line-clamp-2">{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-6 mt-4 border-t border-slate-700/50 space-y-2">
                  <button
                    type="button"
                    disabled={processingPlan === (p.slug || p.id)}
                    onClick={() => handleCheckout(p)}
                    className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer ${
                      isPopular
                        ? 'bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-violet-600/30'
                        : 'bg-slate-700 hover:bg-slate-600 text-white'
                    }`}
                  >
                    {processingPlan === (p.slug || p.id) ? (
                      <>
                        <FiRefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Connecting Assan Pay...</span>
                      </>
                    ) : (
                      <>
                        <FiCreditCard className="w-3.5 h-3.5 text-amber-300" />
                        <span>Pay with Assan Pay</span>
                      </>
                    )}
                  </button>

                  <a
                    href={`https://wa.me/${(contactInfo?.whatsapp || '923000000000').replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                      `Hello MegaTrix Team, I want to activate/renew BizManager Plan: ${p.name} (Shop: ${user?.shopName || user?.name || user?.email})`
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-2 px-3 rounded-lg text-[11px] font-semibold text-slate-400 hover:text-emerald-300 flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <FiMessageSquare className="w-3 h-3" />
                    <span>WhatsApp Verification</span>
                  </a>
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick Payment & Direct Contact Box */}
        <div className="bg-slate-800/60 rounded-2xl border border-slate-700/80 p-5 sm:p-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2 text-white font-bold text-sm">
              <FiShield className="w-4 h-4 text-emerald-400" />
              <span>Official MegaTrix Support & Verification Desk</span>
            </div>
            <p className="text-xs text-slate-400">
              JazzCash, EasyPaisa, Zindigi Wallet, Debit/Credit Cards (Mastercard/Visa), and Bank Transfers accepted.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <a
              href={`https://wa.me/${(contactInfo?.whatsapp || '923000000000').replace(/[^0-9]/g, '')}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
            >
              <FiMessageSquare className="w-4 h-4" />
              <span>WhatsApp Support</span>
            </a>
            <button
              onClick={handleRefreshStatus}
              disabled={checking}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-bold transition-all cursor-pointer"
            >
              <FiRefreshCw className={`w-3.5 h-3.5 ${checking ? 'animate-spin' : ''}`} />
              <span>I Have Paid (Refresh)</span>
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-6xl w-full mx-auto text-center py-4 border-t border-slate-800 text-xs text-slate-500 z-10">
        <p>© 2026 MegaTrix Technologies. All Rights Reserved. Assan Pay Official Integration.</p>
      </footer>
    </div>
  );
};

export default SubscriptionExpired;
