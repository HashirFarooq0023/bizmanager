import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import Layout from '../../components/Layout';
import PageHeader from '../../components/PageHeader';
import { getAccounts, createTransfer, reset, getCashBankPosition } from '../../redux/slices/cashbankSlice';
import { useLanguage } from '../../contexts/LanguageContext';

const Transfers = () => {
    const { isUrdu } = useLanguage();
    const [formData, setFormData] = useState({
        fromAccount: '',
        toAccount: '',
        amount: '',
        description: ''
    });
    const [hasShownToast, setHasShownToast] = useState(false);

    const dispatch = useDispatch();
    const location = useLocation();
    const { accounts, isLoading, isTransferSuccess, position } = useSelector(state => state.cashbank);

    useEffect(() => {
        dispatch(getAccounts());
        dispatch(getCashBankPosition());
        if (location.state?.fromAccount) {
            setFormData(prev => ({ ...prev, fromAccount: location.state.fromAccount }));
        }
        if (location.state?.toAccount) {
            setFormData(prev => ({ ...prev, toAccount: location.state.toAccount }));
        }
    }, [dispatch, location.state]);

    useEffect(() => {
        if (isTransferSuccess && !hasShownToast) {
            setHasShownToast(true);
            setFormData({
                fromAccount: '',
                toAccount: '',
                amount: '',
                description: ''
            });
            dispatch(getAccounts());
            dispatch(getCashBankPosition());
        }
        if (!isTransferSuccess && hasShownToast) {
            setHasShownToast(false);
        }
        dispatch(reset());
    }, [isTransferSuccess, dispatch, hasShownToast]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (formData.fromAccount === formData.toAccount) {
            return;
        }
        dispatch(createTransfer(formData));
    };

    const safeAccounts = Array.isArray(accounts) ? accounts : [];

    const accountOptions = [
        ...safeAccounts.map(acc => ({
            value: acc._id,
            label: `${acc.bankName} - ${acc.accountType} (Rs. ${(acc.currentBalance || 0).toLocaleString()})`
        })),
        { value: 'cash', label: `Cash in Hand / کیش ان ہینڈ (Rs. ${position?.cashInHand?.toLocaleString() || 0})` }
    ];

    const selectedTo = accountOptions.find(opt => opt.value === formData.toAccount);

    // Dynamic balance check
    const fromBalance = formData.fromAccount === 'cash'
        ? (position?.cashInHand || 0)
        : (safeAccounts.find(acc => acc._id === formData.fromAccount)?.currentBalance || 0);

    const insufficientBalance = formData.amount > fromBalance;

    return (
        <Layout>
            <PageHeader 
                title={isUrdu ? "Transfers (فنڈز کی منتقلی)" : "Transfers"} 
                description={isUrdu ? "Transfer money between accounts / کھاتوں کے درمیان رقم منتقل کریں" : "Transfer money between accounts"} 
            />

            <div className="max-w-4xl mx-auto" dir="ltr">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Transfer Visualization */}
                    <div className="bg-card border border-default rounded-2xl shadow-xl p-6 sm:p-8 transition-all duration-300 text-left">
                        <h2 className="text-xl font-bold text-main mb-6 text-center flex items-center justify-center gap-2">
                            <span>New Transfer</span>
                            {isUrdu && <span className="text-sm font-urdu text-secondary font-normal">(نئی منتقلی)</span>}
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-11 gap-4 items-center mb-8">
                            {/* From Account */}
                            <div className="md:col-span-5">
                                <div className="flex items-center justify-between mb-2">
                                    <label className="text-sm font-semibold text-main">From Account *</label>
                                    {isUrdu && <span className="text-xs font-urdu text-secondary">کس کھاتے سے</span>}
                                </div>
                                <select
                                    value={formData.fromAccount}
                                    onChange={(e) => setFormData({ ...formData, fromAccount: e.target.value })}
                                    className="w-full px-4 py-3 bg-input border border-default rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-violet-500 text-main transition text-left"
                                    required
                                >
                                    <option value="">{isUrdu ? 'Select source account (ذریعہ منتخب کریں)' : 'Select source account'}</option>
                                    {accountOptions.map(option => (
                                        <option key={option.value} value={option.value}>{option.label}</option>
                                    ))}
                                </select>
                                {formData.fromAccount && (
                                    <div className={`mt-3 p-3.5 rounded-xl border transition-all ${insufficientBalance ? 'bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400' : 'bg-hover border-default text-main'}`}>
                                        <div className="flex items-center justify-between text-xs text-muted mb-1">
                                            <span>Available Balance</span>
                                            {isUrdu && <span className="font-urdu">دستیاب رقم</span>}
                                        </div>
                                        <p className={`text-lg font-bold ${insufficientBalance ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                                            Rs. {fromBalance.toLocaleString()}
                                        </p>
                                        {insufficientBalance && (
                                            <p className="text-xs text-rose-500 mt-1 font-medium">
                                                {isUrdu ? 'Insufficient funds for this transfer (رقم ناکافی ہے)' : 'Insufficient funds for this transfer'}
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Transfer Arrow */}
                            <div className="md:col-span-1 flex justify-center py-2 md:py-0">
                                <div className={`flex items-center justify-center w-12 h-12 rounded-full border transition-all duration-300 ${formData.fromAccount && formData.toAccount ? 'bg-violet-600 border-violet-500 text-white shadow-md' : 'bg-hover border-default text-muted'}`}>
                                    <svg className="w-6 h-6 rotate-90 md:rotate-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                    </svg>
                                </div>
                            </div>

                            {/* To Account */}
                            <div className="md:col-span-5">
                                <div className="flex items-center justify-between mb-2">
                                    <label className="text-sm font-semibold text-main">To Account *</label>
                                    {isUrdu && <span className="text-xs font-urdu text-secondary">کس کھاتے میں</span>}
                                </div>
                                <select
                                    value={formData.toAccount}
                                    onChange={(e) => setFormData({ ...formData, toAccount: e.target.value })}
                                    className="w-full px-4 py-3 bg-input border border-default rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-violet-500 text-main transition text-left"
                                    required
                                >
                                    <option value="">{isUrdu ? 'Select destination account (منزل منتخب کریں)' : 'Select destination account'}</option>
                                    {accountOptions.map(option => (
                                        <option key={option.value} value={option.value}>{option.label}</option>
                                    ))}
                                </select>
                                {selectedTo && (
                                    <div className="mt-3 p-3.5 bg-hover border border-default rounded-xl transition-all">
                                        <div className="flex items-center justify-between text-xs text-muted mb-1">
                                            <span>Current Balance</span>
                                            {isUrdu && <span className="font-urdu">موجودہ رقم</span>}
                                        </div>
                                        <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                                            Rs. {
                                                formData.toAccount === 'cash'
                                                    ? (position?.cashInHand || 0).toLocaleString()
                                                    : (accounts.find(acc => acc._id === formData.toAccount)?.currentBalance || 0).toLocaleString()
                                            }
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Amount Section */}
                        <div className="border-t border-default pt-6">
                            <div className="max-w-xs mx-auto">
                                <div className="flex items-center justify-between mb-2">
                                    <label className="text-sm font-semibold text-main text-center w-full">
                                        <span>Transfer Amount</span>
                                        {isUrdu && <span className="ml-1.5 text-xs font-urdu text-secondary font-normal">(منتقلی کی رقم)</span>}
                                    </label>
                                </div>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <span className="text-muted font-bold">Rs. </span>
                                    </div>
                                    <input
                                        type="number"
                                        value={formData.amount}
                                        onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                                        className={`block w-full pl-10 pr-4 py-3 bg-input border rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-violet-500 text-center text-xl font-bold transition shadow-xs ${insufficientBalance ? 'border-rose-500 bg-rose-500/10 text-rose-600 dark:text-rose-400' : 'border-default text-main'}`}
                                        placeholder="0.00"
                                        required
                                        min="0.01"
                                        step="0.01"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Description */}
                        <div className="border-t border-default pt-6">
                            <div className="max-w-md mx-auto">
                                <div className="flex items-center justify-between mb-2">
                                    <label className="text-sm font-semibold text-main">Description (Optional)</label>
                                    {isUrdu && <span className="text-xs font-urdu text-secondary">تفصیل (اختیاری)</span>}
                                </div>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    rows={3}
                                    className="block w-full px-4 py-2.5 bg-input border border-default rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-violet-500 text-main resize-none transition shadow-xs"
                                    placeholder={isUrdu ? "Add a note for this transfer... (کوئی نوٹ درج کریں)" : "Add a note for this transfer..."}
                                />
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="border-t border-default pt-6 flex justify-center">
                            <button
                                type="submit"
                                disabled={isLoading || !formData.fromAccount || !formData.toAccount || formData.amount <= 0 || insufficientBalance || formData.fromAccount === formData.toAccount}
                                className="px-8 py-3 bg-violet-600 hover:bg-violet-700 text-white font-semibold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center transition shadow-lg hover:shadow-violet-500/25 active:scale-95"
                            >
                                {isLoading ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        <span>{isUrdu ? 'Processing Transfer... (منتقلی جاری ہے...)' : 'Processing Transfer...'}</span>
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                        </svg>
                                        <span>
                                            {insufficientBalance 
                                                ? (isUrdu ? 'Insufficient Balance / رقم ناکافی ہے' : 'Insufficient Balance')
                                                : (isUrdu ? 'Transfer Money / رقم منتقل کریں' : 'Transfer Money')
                                            }
                                        </span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </Layout>
    );
};

export default Transfers;