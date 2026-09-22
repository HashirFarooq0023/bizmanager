import { useState, useEffect } from 'react';
import api from '../services/api';
import Modal from './Modal';
import { useLanguage } from '../contexts/LanguageContext';

const PaymentModal = ({ isOpen, onClose, onSubmit, documentType, totalAmount, paidAmount }) => {
    const { isUrdu } = useLanguage();
    const [bankAccounts, setBankAccounts] = useState([]);
    const [formData, setFormData] = useState({
        amount: totalAmount - paidAmount,
        paymentMethod: 'cash',
        bankAccount: '',
        reference: '',
        notes: ''
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchBankAccounts = async () => {
            try {
                const userData = JSON.parse(localStorage.getItem('user'));
                const token = userData?.token;

                const response = await api.get(
                    `/api/cashbank/accounts`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );

                setBankAccounts(response.data || []);
            } catch (error) {
                console.error('Error fetching bank accounts:', error);
                if (formData.paymentMethod !== 'cash') {
                    alert(`Failed to load bank accounts: ${error.response?.data?.message || error.message}`);
                }
            }
        };

        if (isOpen) {
            setFormData({
                amount: totalAmount - paidAmount,
                paymentMethod: 'cash',
                bankAccount: '',
                reference: '',
                notes: ''
            });
        }
    }, [isOpen, totalAmount, paidAmount]);

    const handleSubmit = (e) => {
        e.preventDefault();

        const bankMethods = ['bank', 'upi', 'card', 'cheque'];
        if (bankMethods.includes(formData.paymentMethod) && !formData.bankAccount) {
            alert(isUrdu ? 'براہ کرم بینک کھاتہ منتخب کریں' : 'Please select a bank account');
            return;
        }

        setLoading(true);

        const paymentData = {
            amount: formData.amount,
            paymentMethod: formData.paymentMethod,
            bankAccount: formData.bankAccount || null,
            reference: formData.reference || '',
            notes: formData.notes || ''
        };

        onSubmit(paymentData);
    };

    const remainingAmount = totalAmount - paidAmount;
    const selectedAccount = bankAccounts.find(a => a._id === formData.bankAccount);
    const hasInsufficientBalance = selectedAccount && selectedAccount.currentBalance < formData.amount;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={
                isUrdu
                    ? `Record Payment - ${documentType} (ادائیگی درج کریں)`
                    : `Record Payment - ${documentType}`
            }
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Amount Summary */}
                <div className="bg-slate-50 dark:bg-zinc-800/60 p-4 rounded-xl border border-slate-200 dark:border-zinc-700/80">
                    <div className="flex justify-between mb-2 text-sm">
                        <span className="text-slate-600 dark:text-zinc-400 font-medium">Total Amount:</span>
                        <span className="font-bold text-slate-900 dark:text-white font-mono">Rs. {totalAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between mb-2 text-sm">
                        <span className="text-slate-600 dark:text-zinc-400 font-medium">Already Paid:</span>
                        <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">Rs. {paidAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between border-t border-slate-200 dark:border-zinc-700/80 pt-2 mt-2 text-sm">
                        <span className="text-slate-800 dark:text-zinc-200 font-semibold">Remaining:</span>
                        <span className="font-extrabold text-rose-600 dark:text-rose-400 text-base font-mono">Rs. {remainingAmount.toFixed(2)}</span>
                    </div>
                </div>

                {/* Payment Amount */}
                <div>
                    {isUrdu ? (
                        <label className="flex items-center justify-between text-xs sm:text-sm font-semibold text-secondary mb-1.5">
                            <span>Payment Amount (Rs.) <span className="text-red-500">*</span></span>
                            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 font-urdu">ادائیگی کی رقم</span>
                        </label>
                    ) : (
                        <label className="block text-xs sm:text-sm font-semibold text-secondary mb-1.5">
                            Payment Amount <span className="text-red-500">*</span>
                        </label>
                    )}
                    <input
                        type="number"
                        step="0.01"
                        min="0.01"
                        max={remainingAmount}
                        value={formData.amount}
                        dir="ltr"
                        onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                        className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent font-mono text-left"
                        required
                    />
                    <p className="text-xs text-slate-400 dark:text-zinc-500 mt-1">Maximum: Rs. {remainingAmount.toFixed(2)}</p>
                </div>

                {/* Payment Method */}
                <div>
                    {isUrdu ? (
                        <label className="flex items-center justify-between text-xs sm:text-sm font-semibold text-secondary mb-1.5">
                            <span>Payment Method <span className="text-red-500">*</span></span>
                            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 font-urdu">ادائیگی کا طریقہ</span>
                        </label>
                    ) : (
                        <label className="block text-xs sm:text-sm font-semibold text-secondary mb-1.5">
                            Payment Method <span className="text-red-500">*</span>
                        </label>
                    )}
                    <select
                        value={formData.paymentMethod}
                        dir="ltr"
                        onChange={(e) => {
                            setFormData({ ...formData, paymentMethod: e.target.value, bankAccount: '' });
                            const bankMethods = ['bank', 'upi', 'card', 'cheque'];
                            if (bankMethods.includes(e.target.value) && bankAccounts.length === 0) {
                                const fetchBankAccounts = async () => {
                                    try {
                                        const userData = JSON.parse(localStorage.getItem('user'));
                                        const token = userData?.token;
                                        const response = await api.get(
                                            `/api/cashbank/accounts`,
                                            { headers: { Authorization: `Bearer ${token}` } }
                                        );
                                        if (!response.data || response.data.length === 0) {
                                            alert(isUrdu ? 'کوئی بینک کھاتہ نہیں ملا۔' : 'No bank accounts found. Please create a bank account first.');
                                        }
                                        setBankAccounts(response.data || []);
                                    } catch (error) {
                                        console.error('Error fetching bank accounts:', error);
                                        alert(`Failed to load bank accounts: ${error.response?.data?.message || error.message}`);
                                    }
                                };
                                fetchBankAccounts();
                            }
                        }}
                        className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                        required
                    >
                        <option value="cash">{isUrdu ? 'Cash / نقد رقم' : 'Cash (from Shop Safe)'}</option>
                        <option value="bank">{isUrdu ? 'Bank Transfer / آن لائن بینک ٹرانسفر' : 'Bank Transfer (IBFT)'}</option>
                        <option value="upi">{isUrdu ? 'EasyPaisa / JazzCash / ایزی پیسہ، جاز کیش' : 'EasyPaisa / JazzCash / Digital'}</option>
                        <option value="card">{isUrdu ? 'Card / POS / کارڈ، پی او ایس' : 'Card / POS'}</option>
                        <option value="cheque">{isUrdu ? 'Cheque / بینک چیک' : 'Cheque'}</option>
                        <option value="owner">{isUrdu ? "Owner's Personal Funds / ذاتی رقم" : "Owner's Personal Funds"}</option>
                    </select>
                </div>

                {/* Bank Account Selection */}
                {['bank', 'upi', 'card', 'cheque'].includes(formData.paymentMethod) && (
                    <div>
                        {isUrdu ? (
                            <label className="flex items-center justify-between text-xs sm:text-sm font-semibold text-secondary mb-1.5">
                                <span>Select Bank Account <span className="text-red-500">*</span></span>
                                <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 font-urdu">بینک کھاتہ منتخب کریں</span>
                            </label>
                        ) : (
                            <label className="block text-xs sm:text-sm font-semibold text-secondary mb-1.5">
                                Select Bank Account <span className="text-red-500">*</span>
                            </label>
                        )}
                        <select
                            value={formData.bankAccount}
                            dir="ltr"
                            onChange={(e) => setFormData({ ...formData, bankAccount: e.target.value })}
                            className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                            required
                        >
                            <option value="">{isUrdu ? 'Choose Bank Account / بینک کھاتہ منتخب کریں' : 'Choose Bank Account'}</option>
                            {bankAccounts.map(acc => (
                                <option key={acc._id} value={acc._id}>
                                    {acc.bankName} - ****{(acc.accountNumber || '').slice(-4)}
                                    {' '}(Balance: Rs. {(acc.currentBalance || 0).toFixed(2)})
                                </option>
                            ))}
                        </select>

                        {/* Insufficient Balance Warning */}
                        {hasInsufficientBalance && (
                            <div className="mt-2 p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 rounded-xl flex items-start">
                                <svg className="w-5 h-5 text-rose-600 mr-2 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                                <div>
                                    <p className="text-rose-800 dark:text-rose-300 font-semibold text-sm">Insufficient Balance!</p>
                                    <p className="text-rose-700 dark:text-rose-400 text-xs">
                                        Available: Rs. {(selectedAccount?.currentBalance || 0).toFixed(2)} |
                                        Required: Rs. {formData.amount.toFixed(2)}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Reference */}
                <div>
                    {isUrdu ? (
                        <label className="flex items-center justify-between text-xs sm:text-sm font-semibold text-secondary mb-1.5">
                            <span>Reference #</span>
                            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 font-urdu">حوالہ نمبر</span>
                        </label>
                    ) : (
                        <label className="block text-xs sm:text-sm font-semibold text-secondary mb-1.5">
                            Reference #
                        </label>
                    )}
                    <input
                        type="text"
                        value={formData.reference}
                        dir="ltr"
                        onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                        placeholder={isUrdu ? 'Cheque / Transaction ID / رسید یا بل نمبر' : 'Cheque / Transaction ID'}
                        className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent font-mono text-left"
                    />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4 border-t border-slate-100 dark:border-zinc-800">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 px-4 py-2.5 border border-slate-300 dark:border-zinc-700 rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-800 font-semibold text-slate-700 dark:text-zinc-300 transition cursor-pointer"
                        disabled={loading}
                    >
                        {isUrdu ? 'Cancel / منسوخ کریں' : 'Cancel'}
                    </button>
                    <button
                        type="submit"
                        className="flex-1 px-4 py-2.5 bg-violet-600 hover:bg-violet-500 text-white rounded-xl font-bold shadow-md shadow-violet-600/20 transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                        disabled={loading || hasInsufficientBalance}
                    >
                        {loading
                            ? (isUrdu ? 'Processing... / پروسیسنگ' : 'Processing...')
                            : (isUrdu ? 'Record Payment / ادائیگی درج کریں' : 'Record Payment')
                        }
                    </button>
                </div>
            </form>
        </Modal>
    );
};

export default PaymentModal;
