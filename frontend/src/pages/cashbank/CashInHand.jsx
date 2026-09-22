import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../contexts/LanguageContext';
import Layout from '../../components/Layout';
import PageHeader from '../../components/PageHeader';
import FormInput from '../../components/FormInput';
import StatsCard from '../../components/StatsCard';
import DataTable from '../../components/DataTable';
import Modal from '../../components/Modal';
import DualMonthRangePicker from '../../components/DualMonthRangePicker';
import {
    getTransactions,
    getCashBankPosition,
    getAccounts,
    createCashTransaction,
    reset
} from '../../redux/slices/cashbankSlice';
import { toast } from 'react-toastify';

const CashInHand = () => {
    const { t } = useTranslation(['cashbank', 'common']);
    const { isUrdu } = useLanguage();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const [showAddTransaction, setShowAddTransaction] = useState(false);
    const [filterType, setFilterType] = useState('all');
    const [dateRange, setDateRange] = useState({ from: '', to: '' });

    const { transactions, position, accounts, isLoading, isSuccess, isError, message } = useSelector(state => state.cashbank);

    const [formData, setFormData] = useState({
        date: new Date().toISOString().split('T')[0],
        description: '',
        amount: '',
        type: 'in',
        otherAccount: '', // Can be category string or bank account ID
        reference: ''
    });

    useEffect(() => {
        dispatch(getTransactions('cash'));
        dispatch(getCashBankPosition());
        dispatch(getAccounts());
    }, [dispatch]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const amt = parseFloat(formData.amount);
        if (!amt || amt <= 0) {
            toast.error(t('cashbank:invalidAmount', 'Please enter a valid amount greater than 0'));
            return;
        }
        if (!formData.otherAccount) {
            toast.error(formData.type === 'in' ? t('cashbank:selectSourcePrompt', 'Please select source of cash') : t('cashbank:selectDestinationPrompt', 'Please select destination of cash'));
            return;
        }

        try {
            const payload = {
                ...formData,
                amount: amt,
            };
            await dispatch(createCashTransaction(payload)).unwrap();
            toast.success(t('cashbank:txnRecordedSuccess', 'Transaction recorded successfully'));
            setShowAddTransaction(false);
            setFormData({
                date: new Date().toISOString().split('T')[0],
                description: '',
                amount: '',
                type: 'in',
                otherAccount: '',
                reference: ''
            });
            dispatch(getTransactions('cash'));
            dispatch(getCashBankPosition());
            dispatch(getAccounts());
        } catch (err) {
            toast.error(typeof err === 'string' ? err : err?.message || 'Failed to record transaction');
        }
    };

    const safeAccounts = Array.isArray(accounts) ? accounts : [];

    const filteredTransactions = (transactions || [])
        .filter(t => {
            if (!t) return false;
            const matchesType = filterType === 'all' || t.type === filterType;
            const txnDate = t.date ? String(t.date).split('T')[0] : '';
            const matchesDate = (!dateRange.from || txnDate >= dateRange.from) && (!dateRange.to || txnDate <= dateRange.to);
            return matchesType && matchesDate;
        });

    const columns = [
        {
            key: 'date',
            label: isUrdu ? 'Date (تاریخ)' : 'Date',
            render: (val) => val ? new Date(val).toLocaleDateString() : '-'
        },
        { key: 'description', label: isUrdu ? 'Description (تفصیل)' : 'Description' },
        {
            key: 'category',
            label: isUrdu ? 'Source / Destination (ذریعہ / منزل)' : 'Source/Destination',
            render: (_, row) => {
                const other = row.type === 'in' ? row.fromAccount : row.toAccount;
                // Check if it's a bank account ID
                const bank = safeAccounts.find(a => a._id === other);
                return bank ? (
                    <span className="flex items-center text-indigo-600 font-medium">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                        </svg>
                        {bank.bankName}
                    </span>
                ) : (
                    <span className="capitalize">{other}</span>
                );
            }
        },
        { key: 'reference', label: isUrdu ? 'Reference (حوالہ)' : 'Reference', render: (val) => <span className="text-gray-500 font-mono">{val || '-'}</span> },
        {
            key: 'type',
            label: isUrdu ? 'Flow (نوعیت)' : 'Flow',
            render: (val, row) => {
                const isDirectIn = val === 'in';
                const isTransferIn = val === 'transfer' && row.toAccount === 'cash';

                if (isDirectIn || isTransferIn) return <span className="text-emerald-600 font-bold">{isUrdu ? 'Cash In (جمع)' : 'Cash In'}</span>;
                return <span className="text-rose-600 font-bold">{isUrdu ? 'Cash Out (اخراج)' : 'Cash Out'}</span>;
            }
        },
        {
            key: 'amount',
            label: isUrdu ? 'Amount (رقم)' : 'Amount',
            render: (val, row) => {
                const isIn = row.type === 'in' || (row.type === 'transfer' && row.toAccount === 'cash');
                return (
                    <span className={`font-bold font-mono ${isIn ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {isIn ? '+' : '-'}Rs. {(val || 0).toLocaleString()}
                    </span>
                );
            }
        }
    ];

    // Dynamic categories based on transaction type
    const categories = formData.type === 'in'
        ? [
            { group: 'Income Sources', items: ['Sales', 'Customer Payment', 'Service Fee', 'Loan Received', 'Investment', 'Other Income'] },
            { group: 'Bank Accounts', items: safeAccounts.map(a => ({ value: a._id, label: `Bank: ${a.bankName}` })) }
        ]
        : [
            { group: 'Expenses', items: ['Tea/Refreshments (چائے)', 'Electricity/Fuel (بجلی بل/فیول)', 'Shop Rent (دکان کرایہ)', 'Staff Salaries/Mazdoori (تنخواہ/دیہاڑی)', 'Freight/Delivery (کرایہ باربرداری)', 'Packaging/Stationery (شاپر لفافے)', 'Shop Maintenance (مرمت)', 'Internet/Phone (انٹرنیٹ/بل)', 'Cleaning/Committee (صفائی/کمیٹی)', 'Sadqah/Charity (صدقہ/خیرات)', 'Other Expense (متفرق خرچہ)'] },
            { group: 'Bank Accounts', items: safeAccounts.map(a => ({ value: a._id, label: `Bank: ${a.bankName}` })) }
        ];


    return (
        <Layout>
            <PageHeader
                title={t('cashbank:cashInHandTitle', 'Cash in Hand')}
                description={t('cashbank:cashInHandDesc', 'Manage your physical cash transactions and real-time liquidity')}
                actions={[
                    <button
                        key="cash-in"
                        onClick={() => {
                            dispatch(reset());
                            setFormData({ ...formData, type: 'in', otherAccount: '' });
                            setShowAddTransaction(true);
                        }}
                        className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition transform hover:scale-105"
                    >
                        {t('cashbank:btnCashIn', '+ Cash In')}
                    </button>,
                    <button
                        key="cash-out"
                        onClick={() => {
                            dispatch(reset());
                            setFormData({ ...formData, type: 'out', otherAccount: '' });
                            setShowAddTransaction(true);
                        }}
                        className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition transform hover:scale-105"
                    >
                        {t('cashbank:btnCashOut', '- Cash Out')}
                    </button>,
                    <button
                        key="ledger"
                        onClick={() => navigate('/cashbank/ledger/cash')}
                        className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition transform hover:scale-105"
                    >
                        {t('cashbank:btnDetailedLedger', 'Detailed Ledger')}
                    </button>
                ]}
            />

            {/* Current Balance Banner */}
            <div className="bg-gradient-to-r from-indigo-700 via-indigo-600 to-purple-600 rounded-2xl p-8 mb-6 text-white shadow-xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 -mt-4 -mr-4 w-64 h-64 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-all duration-500"></div>
                <div className="relative z-10 flex items-center justify-between">
                    <div>
                        <p className="text-indigo-100 text-sm font-medium mb-2 flex items-center">
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {t('cashbank:totalPhysicalCash', 'Total Physical Cash in Hand')}
                        </p>
                        <h2 className="text-5xl font-bold mb-4 tracking-tight">Rs. {position?.cashInHand?.toLocaleString() || 0}</h2>
                        <div className="flex items-center space-x-6 text-sm">
                            <div className="px-3 py-1 bg-white/20 rounded-full flex items-center">
                                <span className={`w-2 h-2 rounded-full mr-2 ${position?.cashInHand > 0 ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`}></span>
                                {t('cashbank:liquidityStatus', 'Liquidity Status')}: {position?.cashInHand > 0 ? t('cashbank:healthy', 'Healthy') : t('cashbank:zero', 'Zero')}
                            </div>
                        </div>
                    </div>
                    <div className="hidden md:block p-6 bg-white/10 rounded-2xl backdrop-blur-xl border border-white/20 shadow-2xl transform hover:rotate-6 transition-transform">
                        <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                    </div>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <StatsCard
                    title={t('cashbank:totalCashIn', 'Total Cash In')}
                    value={`Rs. ${filteredTransactions.filter(t => t.type === 'in' || (t.type === 'transfer' && t.toAccount === 'cash')).reduce((sum, t) => sum + t.amount, 0).toLocaleString()}`}
                    icon={<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>}
                    iconBgColor="bg-green-100"
                    iconColor="text-green-600"
                />
                <StatsCard
                    title={t('cashbank:totalCashOut', 'Total Cash Out')}
                    value={`Rs. ${filteredTransactions.filter(t => t.type === 'out' || (t.type === 'transfer' && t.fromAccount === 'cash')).reduce((sum, t) => sum + t.amount, 0).toLocaleString()}`}
                    icon={<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" /></svg>}
                    iconBgColor="bg-red-100"
                    iconColor="text-red-600"
                />
                <StatsCard
                    title={t('cashbank:availableForDisposal', 'Available for Disposal')}
                    value={`Rs. ${position?.cashInHand?.toLocaleString() || 0}`}
                    icon={<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                    iconBgColor="bg-indigo-100"
                    iconColor="text-indigo-600"
                />
            </div>

            {/* Filters */}
            <div className="bg-card rounded-xl shadow-sm p-4 mb-6 border border-light">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 md:space-x-4">
                    <div className="flex items-center space-x-2 bg-surface p-1 rounded-xl">
                        {['all', 'in', 'out'].map(type => (
                            <button
                                key={type}
                                onClick={() => setFilterType(type)}
                                className={`px-5 py-2 rounded-lg font-semibold text-sm transition-all duration-200 ${filterType === type
                                    ? type === 'in' ? 'bg-green-600 text-white shadow-lg'
                                        : type === 'out' ? 'bg-red-600 text-white shadow-lg'
                                            : 'bg-indigo-600 text-white shadow-lg'
                                    : 'text-secondary hover:bg-surface'
                                    }`}
                            >
                                {type === 'all' ? t('cashbank:filterAll', 'ALL') : type === 'in' ? t('cashbank:filterIn', 'IN') : t('cashbank:filterOut', 'OUT')}
                            </button>
                        ))}
                    </div>
                    <div className="flex items-center space-x-3">
                        <DualMonthRangePicker
                            startDate={dateRange.from}
                            endDate={dateRange.to}
                            onChange={({ startDate, endDate }) => setDateRange({ from: startDate, to: endDate })}
                            align="right"
                        />
                    </div>
                </div>
            </div>

            {/* Add Transaction Modal */}
            <Modal
                isOpen={showAddTransaction}
                onClose={() => setShowAddTransaction(false)}
                title={
                    isUrdu
                        ? (formData.type === 'in' ? '+ Cash In / Deposit (نقد رقم جمع کریں)' : '- Cash Out / Withdrawal (نقد رقم نکالیں)')
                        : (formData.type === 'in' ? '+ Cash In (Deposit)' : '- Cash Out (Withdrawal)')
                }
                size="lg"
            >
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormInput
                            label="Execution Date"
                            labelUr="تاریخ"
                            type="date"
                            dir="ltr"
                            value={formData.date}
                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                            required
                        />
                        <FormInput
                            label="Amount (Rs.)"
                            labelUr="رقم (روپے)"
                            type="number"
                            dir="ltr"
                            value={formData.amount}
                            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                            placeholder="0.00"
                            className="font-mono text-left"
                            required
                        />
                        <div className="md:col-span-2">
                            {isUrdu ? (
                                <label className="flex items-center justify-between text-xs sm:text-sm font-semibold text-secondary mb-1.5">
                                    <span>
                                        {formData.type === 'in' ? 'Source (Where is cash coming from?)' : 'Destination (Where is cash going?)'} <span className="text-red-500">*</span>
                                    </span>
                                    <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 font-urdu">
                                        {formData.type === 'in' ? 'رقم کا ذریعہ' : 'رقم کہاں جائے گی'}
                                    </span>
                                </label>
                            ) : (
                                <label className="block text-xs sm:text-sm font-semibold text-secondary mb-1.5">
                                    {formData.type === 'in' ? 'Source (Where is cash coming from?)' : 'Destination (Where is cash going?)'} <span className="text-red-500">*</span>
                                </label>
                            )}
                            <select
                                value={formData.otherAccount}
                                dir="ltr"
                                onChange={(e) => setFormData({ ...formData, otherAccount: e.target.value })}
                                className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-zinc-800 rounded-lg focus:ring-2 focus:ring-violet-500 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 transition-all shadow-xs"
                                required
                            >
                                <option value="">
                                    {isUrdu
                                        ? (formData.type === 'in' ? 'Select source / رقم کا ذریعہ منتخب کریں' : 'Select destination / رقم کی منزل منتخب کریں')
                                        : (formData.type === 'in' ? 'Select source of cash' : 'Select where cash is going')
                                    }
                                </option>
                                {categories.map(group => (
                                    <optgroup key={group.group} label={group.group.toUpperCase()}>
                                        {group.items.map(item => (
                                            <option key={typeof item === 'string' ? item : item.value} value={typeof item === 'string' ? item : item.value}>
                                                {typeof item === 'string' ? item : item.label}
                                            </option>
                                        ))}
                                    </optgroup>
                                ))}
                            </select>
                        </div>
                        <div className="md:col-span-2">
                            <FormInput
                                label="Description / Narrative"
                                labelUr="تفصیل / وجہ"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder={isUrdu ? 'e.g. Daily cash sales, Cash deposit / لین دین کی تفصیل یا وجہ' : 'Enter detailed purpose of transaction'}
                                required
                            />
                        </div>
                        <div className="md:col-span-2">
                            <FormInput
                                label="Reference #"
                                labelUr="حوالہ نمبر"
                                dir="ltr"
                                value={formData.reference}
                                onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                                placeholder={isUrdu ? 'Voucher / Bill / ID / رسید یا بل نمبر' : 'Voucher / Bill / ID'}
                                className="font-mono text-left"
                            />
                        </div>
                    </div>

                    {/* Balance Preview Insight */}
                    {formData.otherAccount && parseFloat(formData.amount) > 0 && (
                        <div className="bg-violet-50/80 dark:bg-violet-950/30 border border-violet-200 dark:border-violet-800/60 rounded-xl p-4 flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <div className="p-2 bg-white dark:bg-zinc-800 rounded-lg shadow-xs font-bold text-xs text-violet-700 dark:text-violet-300">
                                    Preview
                                </div>
                                <div className="text-sm text-zinc-900 dark:text-zinc-200">
                                    {formData.type === 'in' ? (
                                        <>
                                            Depositing <strong>Rs. {parseFloat(formData.amount).toLocaleString()}</strong> into <strong>Cash in Hand</strong>
                                            {safeAccounts.find(a => a._id === formData.otherAccount) && ` from ${safeAccounts.find(a => a._id === formData.otherAccount).bankName}`}
                                        </>
                                    ) : (
                                        <>
                                            Withdrawing <strong>Rs. {parseFloat(formData.amount).toLocaleString()}</strong> from <strong>Cash in Hand</strong>
                                            {safeAccounts.find(a => a._id === formData.otherAccount) && ` to ${safeAccounts.find(a => a._id === formData.otherAccount).bankName}`}
                                        </>
                                    )}
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 uppercase font-bold">New Balance</p>
                                <p className="text-base font-black text-violet-700 dark:text-violet-300 font-mono">
                                    Rs. {(formData.type === 'in' ? (position?.cashInHand || 0) + (parseFloat(formData.amount) || 0) : (position?.cashInHand || 0) - (parseFloat(formData.amount) || 0)).toLocaleString()}
                                </p>
                            </div>
                        </div>
                    )}

                    <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-zinc-800">
                        <button
                            type="button"
                            onClick={() => setShowAddTransaction(false)}
                            className="px-5 py-2.5 border border-slate-300 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 rounded-xl font-semibold hover:bg-slate-100 dark:hover:bg-zinc-800 transition cursor-pointer"
                        >
                            {isUrdu ? 'Cancel / منسوخ کریں' : 'Cancel'}
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`px-6 py-2.5 text-white rounded-xl font-bold shadow-md transition cursor-pointer ${
                                formData.type === 'in'
                                    ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/20'
                                    : 'bg-rose-600 hover:bg-rose-500 shadow-rose-600/20'
                            } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {isLoading
                                ? (isUrdu ? 'Processing... / پروسیسنگ' : 'Processing...')
                                : formData.type === 'in'
                                    ? (isUrdu ? 'Confirm Cash In / کیش جمع کریں' : 'Confirm Cash In')
                                    : (isUrdu ? 'Confirm Cash Out / کیش نکالیں' : 'Confirm Cash Out')
                            }
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Transactions Table */}
            <div className="bg-card rounded-xl shadow-sm border border-light overflow-hidden">
                <DataTable
                    columns={columns}
                    data={filteredTransactions}
                    emptyMessage={t('cashbank:noCashMovements', 'No cash movements recorded yet')}
                    isLoading={isLoading}
                />
            </div>
        </Layout>
    );
};

export default CashInHand;
