import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import Logo from '../../components/Logo';
import {
  FiCheckCircle,
  FiAlertTriangle,
  FiXCircle,
  FiRefreshCw,
  FiArrowRight,
  FiShoppingBag,
  FiShield,
  FiMessageSquare,
} from 'react-icons/fi';
import { toast } from 'react-toastify';

const PaymentCallback = ({ type = 'callback' }) => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const orderId =
    searchParams.get('order_id') ||
    searchParams.get('transaction_id') ||
    searchParams.get('orderId') ||
    searchParams.get('orderRef') ||
    '';

  const statusParam = searchParams.get('status') || '';

  const [verifying, setVerifying] = useState(Boolean(orderId));
  const [paymentResult, setPaymentResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (orderId) {
      verifyTransaction(orderId);
    } else {
      setVerifying(false);
      if (type === 'success') {
        setPaymentResult({ status: 'paid', message: 'Payment confirmed successfully!' });
      } else if (type === 'failed') {
        setPaymentResult({ status: 'failed', message: 'Payment failed or was declined.' });
      } else if (type === 'pending') {
        setPaymentResult({ status: 'pending', message: 'Payment is currently processing.' });
      }
    }
  }, [orderId, type]);

  const verifyTransaction = async (id) => {
    try {
      setVerifying(true);
      const res = await api.get(`/api/subscriptions/verify/${id}`);
      if (res.data?.success) {
        setPaymentResult(res.data);
        if (res.data.status === 'paid') {
          toast.success('🎉 Subscription payment verified successfully!');
        }
      } else {
        setErrorMsg(res.data?.message || 'Could not verify transaction with Assan Pay gateway.');
      }
    } catch (err) {
      console.error('Verification error:', err);
      setErrorMsg(
        err.response?.data?.error ||
          err.response?.data?.message ||
          'Failed to verify payment status. If your account was charged, please contact support.'
      );
    } finally {
      setVerifying(false);
    }
  };

  const isSuccess =
    type === 'success' ||
    paymentResult?.status === 'paid' ||
    statusParam.toLowerCase() === 'paid' ||
    statusParam.toLowerCase() === 'success';

  const isPending =
    type === 'pending' ||
    paymentResult?.status === 'pending' ||
    statusParam.toLowerCase() === 'pending';

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-between p-4 sm:p-6 lg:p-8 relative overflow-hidden font-sans">
      {/* Glow Effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-violet-600/10 blur-[120px] pointer-events-none rounded-full" />
      <div className="absolute bottom-0 right-10 w-80 h-80 bg-emerald-600/10 blur-[100px] pointer-events-none rounded-full" />

      {/* Header */}
      <header className="max-w-4xl w-full mx-auto flex items-center justify-between py-3 border-b border-slate-800 z-10">
        <Logo size="md" />
        <Link
          to="/dashboard"
          className="text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          Return to Dashboard
        </Link>
      </header>

      {/* Center Card */}
      <main className="max-w-xl w-full mx-auto my-12 z-10">
        <div className="bg-slate-800/80 backdrop-blur-md rounded-3xl border border-slate-700/80 p-7 sm:p-9 shadow-2xl space-y-6 text-center">
          {verifying ? (
            <div className="py-10 space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-violet-500/20 border border-violet-500/40 text-violet-400 flex items-center justify-center mx-auto animate-pulse">
                <FiRefreshCw className="w-7 h-7 animate-spin" />
              </div>
              <h2 className="text-xl font-bold text-white">Verifying Assan Pay Payment...</h2>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Securely confirming cryptographic transaction signature with Assan Pay Gateway.
              </p>
            </div>
          ) : isSuccess ? (
            <div className="space-y-5">
              <div className="w-16 h-16 rounded-3xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto shadow-xl shadow-emerald-500/10 animate-in zoom-in-50 duration-300">
                <FiCheckCircle className="w-9 h-9" />
              </div>

              <div className="space-y-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  Payment Successful!
                </h1>
                <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
                  Your BizManager subscription has been activated. All POS billing features and cloud syncing are ready.
                </p>
              </div>

              {/* Transaction Summary Receipt Box */}
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-700/80 text-left text-xs space-y-2 font-mono">
                {orderId && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">Order Ref:</span>
                    <span className="text-white font-bold">{orderId}</span>
                  </div>
                )}
                {paymentResult?.invoiceNumber && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">Invoice #:</span>
                    <span className="text-emerald-400 font-bold">{paymentResult.invoiceNumber}</span>
                  </div>
                )}
                {paymentResult?.planName && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">Plan:</span>
                    <span className="text-white font-bold">{paymentResult.planName}</span>
                  </div>
                )}
                {paymentResult?.amount && (
                  <div className="flex justify-between border-t border-slate-800 pt-2 font-bold text-sm">
                    <span className="text-slate-300">Amount Paid:</span>
                    <span className="text-white">PKR {Number(paymentResult.amount).toLocaleString()}</span>
                  </div>
                )}
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-center gap-3 justify-center">
                <button
                  type="button"
                  onClick={() => navigate('/dashboard')}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <FiShoppingBag className="w-4 h-4" />
                  <span>Launch BizManager POS</span>
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/billing')}
                  className="w-full sm:w-auto px-5 py-3 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200 font-bold text-xs transition-all cursor-pointer"
                >
                  <span>View Billing Invoices</span>
                </button>
              </div>
            </div>
          ) : isPending ? (
            <div className="space-y-5">
              <div className="w-16 h-16 rounded-3xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center mx-auto">
                <FiClock className="w-9 h-9" />
              </div>

              <div className="space-y-2">
                <h1 className="text-2xl font-bold text-white tracking-tight">Payment In Process</h1>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  Your transaction is being settled with your bank / wallet. Once confirmed, your subscription will activate automatically.
                </p>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-center gap-3 justify-center">
                {orderId && (
                  <button
                    type="button"
                    onClick={() => verifyTransaction(orderId)}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs transition-all flex items-center justify-center gap-2"
                  >
                    <FiRefreshCw className="w-3.5 h-3.5" />
                    <span>Check Status Again</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => navigate('/billing')}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-bold text-xs transition-all"
                >
                  <span>Back to Billing</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="w-16 h-16 rounded-3xl bg-rose-500/20 border border-rose-500/40 text-rose-400 flex items-center justify-center mx-auto">
                <FiXCircle className="w-9 h-9" />
              </div>

              <div className="space-y-2">
                <h1 className="text-2xl font-bold text-white tracking-tight">
                  Payment Was Not Completed
                </h1>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  {errorMsg || 'The checkout session was cancelled or failed by the payment provider.'}
                </p>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-center gap-3 justify-center">
                <button
                  type="button"
                  onClick={() => navigate('/billing')}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Try Again on Billing Page</span>
                  <FiArrowRight className="w-4 h-4" />
                </button>
                <a
                  href="https://wa.me/923000000000"
                  target="_blank"
                  rel="noreferrer"
                  className="w-full sm:w-auto px-5 py-3 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200 font-bold text-xs transition-all flex items-center justify-center gap-2"
                >
                  <FiMessageSquare className="w-4 h-4 text-emerald-400" />
                  <span>Contact Support</span>
                </a>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-4xl w-full mx-auto text-center py-4 border-t border-slate-800 text-xs text-slate-500 z-10">
        <p>© 2026 MegaTrix Technologies. Official Assan Pay Signed Gateway.</p>
      </footer>
    </div>
  );
};

export default PaymentCallback;
