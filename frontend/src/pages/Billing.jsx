import React, { useState, useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import PageHeader from '../components/PageHeader';
import Button from '../components/Button';
import Card from '../components/Card';
import api from '../services/api';
import {
  FiZap,
  FiCheckCircle,
  FiClock,
  FiShield,
  FiCreditCard,
  FiAlertTriangle,
  FiRefreshCw,
  FiExternalLink,
  FiFileText,
  FiArrowRight,
  FiMessageSquare,
  FiCheck,
  FiLayers,
  FiGift,
  FiSlash,
} from 'react-icons/fi';
import { toast } from 'react-toastify';

const Billing = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const [currentSub, setCurrentSub] = useState(user?.subscription || null);
  const [plans, setPlans] = useState([]);
  const [history, setHistory] = useState([]);
  const [billingCycle, setBillingCycle] = useState('monthly'); // 'monthly' | 'yearly' | 'lifetime'
  const [loading, setLoading] = useState(false);
  const [loadingPlans, setLoadingPlans] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [processingPlan, setProcessingPlan] = useState(null);
  const [contactInfo, setContactInfo] = useState(null);

  const fetchSubscriptionData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/subscriptions/me');
      if (res.data?.subscription) {
        setCurrentSub(res.data.subscription);
      }
    } catch (err) {
      console.warn('Failed to fetch subscription status:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchPlans = useCallback(async () => {
    try {
      setLoadingPlans(true);
      const res = await api.get('/api/subscriptions/plans');
      if (res.data?.plans) {
        setPlans(res.data.plans.filter((p) => p.slug !== 'trial' && p.id !== 'trial'));
        setContactInfo(res.data.contact);
      }
    } catch (err) {
      console.warn('Failed to load subscription plans:', err);
    } finally {
      setLoadingPlans(false);
    }
  }, []);

  const fetchHistory = useCallback(async () => {
    try {
      setLoadingHistory(true);
      const res = await api.get('/api/subscriptions/history');
      if (Array.isArray(res.data?.payments)) {
        setHistory(res.data.payments);
      }
    } catch (err) {
      console.warn('Failed to load payment history:', err);
    } finally {
      setLoadingHistory(false);
    }
  }, []);

  useEffect(() => {
    fetchSubscriptionData();
    fetchPlans();
    fetchHistory();
  }, [fetchSubscriptionData, fetchPlans, fetchHistory]);

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
        toast.info('Redirecting to Assan Pay secure hosted gateway...');
        // Redirect to Assan Pay checkout URL
        window.location.href = res.data.checkoutUrl;
      } else if (res.data?.message) {
        toast.info(res.data.message);
        fetchSubscriptionData();
      } else {
        toast.error('Could not initiate payment session. Please try again.');
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

  const isLifetime = Boolean(currentSub?.isLifetime);
  const isTrial = currentSub?.status === 'trial' || currentSub?.plan === 'trial';
  const isTerminated = currentSub?.status === 'terminated';
  const isExpired = Boolean(currentSub?.isExpired);
  const expiresDate = currentSub?.expiresAt ? new Date(currentSub.expiresAt) : null;
  const daysRemaining = currentSub?.daysRemaining ?? (expiresDate ? Math.max(0, Math.ceil((expiresDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))) : 0);

  return (
    <Layout>
      <div className="max-w-6xl mx-auto space-y-8 pb-12">
        <PageHeader
          title="Subscription & Billing Governance"
          description="Manage your store licensing, online renewal through Assan Pay gateway, and invoice receipts."
          actions={
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  fetchSubscriptionData();
                  fetchPlans();
                  fetchHistory();
                  toast.success('Subscription status refreshed!');
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-slate-50 text-xs font-semibold text-zinc-800 dark:text-zinc-200 transition-all cursor-pointer"
              >
                <FiRefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                <span>Sync License</span>
              </button>
              <Button variant="secondary" size="sm" onClick={() => navigate('/dashboard')}>
                Dashboard
              </Button>
            </div>
          }
        />

        {/* Current Subscription Hero Banner */}
        <div className="rounded-2xl p-6 sm:p-7 border bg-gradient-to-br from-slate-900 to-zinc-900 text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-violet-600/10 blur-[90px] rounded-full pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-60 h-60 bg-emerald-600/10 blur-[80px] rounded-full pointer-events-none" />

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
            <div className="space-y-3">
              <div className="flex items-center gap-2.5">
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                    isTerminated
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                      : isExpired
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      : isTrial
                      ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                      : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      isTerminated
                        ? 'bg-rose-400'
                        : isExpired
                        ? 'bg-amber-400'
                        : isTrial
                        ? 'bg-sky-400 animate-pulse'
                        : 'bg-emerald-400 animate-pulse'
                    }`}
                  />
                  {isTerminated
                    ? 'Terminated by Admin'
                    : isExpired
                    ? 'Subscription Expired'
                    : isTrial
                    ? 'Free Evaluation Trial'
                    : isLifetime
                    ? 'Lifetime VIP License'
                    : 'Active License'}
                </span>
                <span className="text-xs font-mono text-zinc-400">
                  Store: <strong className="text-white">{user?.shopName || user?.name}</strong>
                </span>
              </div>

              <div>
                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                  {currentSub?.planName || (isTrial ? '14-Day Free Evaluation' : isLifetime ? 'Lifetime VIP License' : 'Pro Enterprise POS')}
                </h2>
                <p className="text-xs sm:text-sm text-zinc-300 mt-1 max-w-xl">
                  {isTerminated
                    ? 'This account has been administratively restricted. Please contact MegaTrix administrator to reactivate.'
                    : isExpired
                    ? 'Your billing tenure has elapsed. Renew today via Assan Pay to continue unrestricted POS billing.'
                    : isTrial
                    ? `You have ${daysRemaining} days remaining in your free trial period. Upgrade to Pro for uninterrupted business continuity.`
                    : isLifetime
                    ? 'You have perpetual full access to BizManager with zero monthly or yearly dues.'
                    : `Active ${currentSub?.billingCycle || 'monthly'} subscription. Next renewal scheduled on ${expiresDate ? expiresDate.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '—'}.`}
                </p>
              </div>
            </div>

            {/* Quick Expiration Stats */}
            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 text-center min-w-[120px]">
                <span className="text-[11px] text-zinc-400 block uppercase font-bold">
                  Days Remaining
                </span>
                <strong className="text-2xl font-mono font-extrabold text-white mt-0.5 block">
                  {isLifetime ? '∞' : daysRemaining}
                </strong>
                <span className="text-[10px] text-zinc-400">
                  {isLifetime ? 'Perpetual' : `Till ${expiresDate ? expiresDate.toLocaleDateString() : 'N/A'}`}
                </span>
              </div>

              {!isLifetime && (
                <a
                  href="#plans-section"
                  className="px-5 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-violet-600/30 transition-all flex items-center gap-2 cursor-pointer"
                >
                  <FiZap className="w-4 h-4 text-amber-300" />
                  <span>{isExpired || isTrial ? 'Upgrade / Renew Now' : 'Change Plan'}</span>
                </a>
              )}
            </div>
          </div>
        </div>

        {/* ─── PLANS & RATES MATRIX ─── */}
        <div id="plans-section" className="space-y-6 pt-4">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h3 className="text-2xl font-bold text-zinc-900 dark:text-white tracking-tight">
              Flexible Plans Built For Growing Retailers
            </h3>
            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
              All plans include unlimited sales invoices, automated barcode printing, thermal receipts, and secure cloud backups.
            </p>

            {/* Monthly / Yearly Billing Toggle */}
            <div className="inline-flex items-center p-1 rounded-xl bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs font-bold">
              <button
                type="button"
                onClick={() => setBillingCycle('monthly')}
                className={`px-4 py-2 rounded-lg transition-all cursor-pointer ${
                  billingCycle === 'monthly'
                    ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-sm font-extrabold'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                }`}
              >
                Monthly Billing
              </button>
              <button
                type="button"
                onClick={() => setBillingCycle('yearly')}
                className={`px-4 py-2 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                  billingCycle === 'yearly'
                    ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-sm font-extrabold'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                }`}
              >
                <span>Annual (Yearly)</span>
                <span className="px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                  Save 20%
                </span>
              </button>
            </div>
          </div>

          {/* Dynamic Plan Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {plans.map((plan) => {
              const isPopular = Boolean(plan.isPopular || plan.popular);
              const isPlanLifetime = plan.slug === 'lifetime' || plan.billingCycles?.includes('lifetime');
              
              let priceToDisplay = plan.price || 0;
              let tenureLabel = '/ month';

              if (billingCycle === 'yearly' && plan.yearlyPrice) {
                priceToDisplay = plan.yearlyPrice;
                tenureLabel = '/ year';
              } else if (isPlanLifetime && plan.lifetimePrice) {
                priceToDisplay = plan.lifetimePrice;
                tenureLabel = 'one-time (lifetime)';
              }

              const isCurrentPlan = currentSub?.plan === (plan.slug || plan.id) && !isExpired && !isTerminated;

              return (
                <div
                  key={plan.slug || plan.id || plan._id}
                  className={`rounded-2xl p-6 transition-all duration-300 relative flex flex-col justify-between border ${
                    isPopular
                      ? 'bg-gradient-to-b from-slate-900 to-zinc-900 text-white border-violet-500 shadow-2xl shadow-violet-500/10 ring-1 ring-violet-500/30'
                      : 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white border-slate-200 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700'
                  }`}
                >
                  {isPopular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md">
                      {plan.badge || 'Most Popular'}
                    </div>
                  )}

                  <div className="space-y-4">
                    <div>
                      <h4 className="text-lg font-bold">{plan.name}</h4>
                      <p
                        className={`text-xs mt-1 min-h-[34px] line-clamp-2 ${
                          isPopular ? 'text-zinc-300' : 'text-zinc-500 dark:text-zinc-400'
                        }`}
                      >
                        {plan.tagline || plan.description}
                      </p>
                    </div>

                    <div
                      className={`py-3 border-y ${
                        isPopular ? 'border-zinc-800' : 'border-slate-100 dark:border-zinc-800'
                      }`}
                    >
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl sm:text-3xl font-extrabold font-mono tracking-tight">
                          Rs {priceToDisplay.toLocaleString()}
                        </span>
                        <span
                          className={`text-xs font-mono ${
                            isPopular ? 'text-zinc-400' : 'text-zinc-500'
                          }`}
                        >
                          {tenureLabel}
                        </span>
                      </div>
                      {plan.isTrialAllowed && (
                        <span className="text-[11px] text-emerald-500 font-semibold block mt-1">
                          Includes {plan.trialDays}-day free trial
                        </span>
                      )}
                    </div>

                    {/* Limit Pills */}
                    <div
                      className={`grid grid-cols-2 gap-1 text-[11px] font-mono ${
                        isPopular ? 'text-zinc-300' : 'text-zinc-600 dark:text-zinc-400'
                      }`}
                    >
                      <div
                        className={`p-1.5 rounded-lg border ${
                          isPopular ? 'bg-zinc-800/80 border-zinc-700' : 'bg-slate-50 dark:bg-zinc-800/50 border-slate-200 dark:border-zinc-700/50'
                        }`}
                      >
                        Users: <strong className={isPopular ? 'text-white' : 'text-zinc-900 dark:text-white'}>{plan.limits?.maxUsers === -1 ? 'Unlimited' : plan.limits?.maxUsers || 5}</strong>
                      </div>
                      <div
                        className={`p-1.5 rounded-lg border ${
                          isPopular ? 'bg-zinc-800/80 border-zinc-700' : 'bg-slate-50 dark:bg-zinc-800/50 border-slate-200 dark:border-zinc-700/50'
                        }`}
                      >
                        Branches: <strong className={isPopular ? 'text-white' : 'text-zinc-900 dark:text-white'}>{plan.limits?.maxBranches === -1 ? 'Unlimited' : plan.limits?.maxBranches || 1}</strong>
                      </div>
                    </div>

                    <ul
                      className={`space-y-2.5 text-xs ${
                        isPopular ? 'text-zinc-200' : 'text-zinc-600 dark:text-zinc-300'
                      }`}
                    >
                      {(Array.isArray(plan.features) ? plan.features : []).map((feat, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <FiCheck
                            className={`w-4 h-4 shrink-0 mt-0.5 ${
                              isPopular ? 'text-violet-400' : 'text-emerald-500'
                            }`}
                          />
                          <span className="line-clamp-2">{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div
                    className={`pt-5 mt-5 border-t ${
                      isPopular ? 'border-zinc-800' : 'border-slate-100 dark:border-zinc-800'
                    }`}
                  >
                    <button
                      type="button"
                      disabled={isCurrentPlan || processingPlan === (plan.slug || plan.id)}
                      onClick={() => handleCheckout(plan)}
                      className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-60 disabled:cursor-not-allowed ${
                        isCurrentPlan
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : isPopular
                          ? 'bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-violet-600/30'
                          : 'bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-white dark:hover:bg-zinc-100 dark:text-zinc-900'
                      }`}
                    >
                      {processingPlan === (plan.slug || plan.id) ? (
                        <>
                          <FiRefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Generating Checkout...</span>
                        </>
                      ) : isCurrentPlan ? (
                        <>
                          <FiCheckCircle className="w-3.5 h-3.5" />
                          <span>Current Active Plan</span>
                        </>
                      ) : (
                        <>
                          <FiCreditCard className="w-3.5 h-3.5" />
                          <span>Pay with Assan Pay</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ─── INVOICE & PAYMENT HISTORY ─── */}
        <Card
          title="Payment Receipts & Invoices"
          subtitle="Cryptographically verified transaction receipts processed through Assan Pay gateway."
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 uppercase text-[11px] font-bold">
                  <th className="py-3 px-4">Invoice #</th>
                  <th className="py-3 px-4">Plan Name</th>
                  <th className="py-3 px-4">Billing Tenure</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Payment Method</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                {history.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-zinc-400 font-mono">
                      No payment receipts generated yet.
                    </td>
                  </tr>
                ) : (
                  history.map((tx) => (
                    <tr key={tx._id || tx.transactionId} className="hover:bg-slate-50 dark:hover:bg-zinc-800/50">
                      <td className="py-3 px-4 font-mono font-bold text-zinc-900 dark:text-white">
                        {tx.invoiceNumber || 'INV-PENDING'}
                      </td>
                      <td className="py-3 px-4 font-semibold text-zinc-800 dark:text-zinc-200">
                        {tx.planName || 'Pro Enterprise'}
                      </td>
                      <td className="py-3 px-4 capitalize text-zinc-600 dark:text-zinc-400">
                        {tx.billingCycle || 'monthly'}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-zinc-900 dark:text-white">
                        PKR {(tx.amount || 0).toLocaleString()}
                      </td>
                      <td className="py-3 px-4 font-mono text-zinc-500 uppercase">
                        {tx.paymentMethod || 'AssanPay Hosted'}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-mono font-bold capitalize ${
                            tx.status === 'paid'
                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                              : tx.status === 'pending'
                              ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                              : 'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                          }`}
                        >
                          {tx.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-[11px] text-zinc-500">
                        {new Date(tx.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* ─── SUPPORT & MANUAL ACTIVATION DESK ─── */}
        <div className="bg-slate-50 dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 p-6 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-2 text-zinc-900 dark:text-white font-bold text-sm">
              <FiShield className="w-4 h-4 text-emerald-500" />
              <span>Need Direct Bank Transfer or Official GST Invoice?</span>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Our accounts desk provides instant WhatsApp verification and custom enterprise invoicing.
            </p>
          </div>

          <a
            href={`https://wa.me/${(contactInfo?.whatsapp || '923000000000').replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
              `Hello MegaTrix Team, I need help with BizManager subscription billing for store: ${user?.shopName || user?.name || user?.email}`
            )}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all cursor-pointer shrink-0"
          >
            <FiMessageSquare className="w-4 h-4" />
            <span>Chat on WhatsApp</span>
          </a>
        </div>
      </div>
    </Layout>
  );
};

export default Billing;
