import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Layout from '../../components/Layout';
import PageHeader from '../../components/PageHeader';
import FormInput from '../../components/FormInput';
import StatsCard from '../../components/StatsCard';
import DataTable from '../../components/DataTable';
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

    useEffect(() => {
        if (isSuccess && showAddTransaction) {
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
            dispatch(reset());
        }
        if (isError && message) {
            toast.error(message);
            dispatch(reset());
        }
    }, [isSuccess, isError, message, dispatch, showAddTransaction, t]);

    const handleSubmit = (e) => {
        e.preventDefault();
        dispatch(createCashTransaction(formData));
    };

    const filteredTransactions = (transactions || [])
        .filter(t => {
            const matchesType = filterType === 'all' || t.type === filterType;
            const txnDate = t.date.split('T')[0];
            const matchesDate = (!dateRange.from || txnDate >= dateRange.from) && (!dateRange.to || txnDate <= dateRange.to);
            return matchesType && matchesDate;
        });
    // Backend already sorts by date DESC, createdAt DESC - no need to re-sort here


    const columns = [
        {
            key: 'date',
            label: t('cashbank:executionDate', 'Date'),
            render: (val) => new Date(val).toLocaleDateString()
        },
        { key: 'description', label: t('cashbank:narrative', 'Description') },
        {
            key: 'category',
            label: t('cashbank:sourceDestination', 'Source/Destination'),
            render: (_, row) => {
                const other = row.type === 'in' ? row.fromAccount : row.toAccount;
                // Check if it's a bank account ID
                const bank = accounts.find(a => a._id === other);
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
        { key: 'reference', label: t('cashbank:reference', 'Reference'), render: (val) => <span className="text-gray-500">{val || '-'}</span> },
        {
            key: 'type',
            label: t('cashbank:flow', 'Flow'),
            render: (val, row) => {
                const isDirectIn = val === 'in';
                const isTransferIn = val === 'transfer' && row.toAccount === 'cash';

                if (isDirectIn || isTransferIn) return <span className="text-green-600 font-bold">{t('cashbank:btnCashIn', 'Cash In')}</span>;
                return <span className="text-red-600 font-bold">{t('cashbank:btnCashOut', 'Cash Out')}</span>;
            }
        },
        {
            key: 'amount',
            label: t('cashbank:amountLabel', 'Amount'),
            render: (val, row) => {
                const isIn = row.type === 'in' || (row.type === 'transfer' && row.toAccount === 'cash');
                return (
                    <span className={`font-bold ${isIn ? 'text-green-600' : 'text-red-600'}`}>
                        {isIn ? '+' : '-'}Rs. {val.toLocaleString()}
                    </span>
                );
            }
        }
    ];

    // Dynamic categories based on transaction type
    const categories = formData.type === 'in'
        ? [
            { group: 'Income Sources', items: ['Sales', 'Customer Payment', 'Service Fee', 'Loan Received', 'Investment', 'Other Income'] },
            { group: 'Bank Accounts', items: accounts.map(a => ({ value: a._id, label: `Bank: ${a.bankName}` })) }
        ]
        : [
            { group: 'Expenses', items: ['Office Rent', 'Electricity', 'Water Bill', 'Internet', 'Stationery', 'Tea/Snacks', 'Salaries', 'Transportation', 'Maintenance', 'Other Expense'] },
            { group: 'Bank Accounts', items: accounts.map(a => ({ value: a._id, label: `Bank: ${a.bankName}` })) }
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
                        <div className="flex items-center bg-surface border border-default rounded-lg px-2">
                            <input
                                type="date"
                                value={dateRange.from}
                                onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
                                className="bg-transparent px-2 py-2 text-sm focus:outline-none"
                            />
                            <span className="text-muted">→</span>
                            <input
                                type="date"
                                value={dateRange.to}
                                onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
                                className="bg-transparent px-2 py-2 text-sm focus:outline-none"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Add Transaction Form */}
            {showAddTransaction && (
                <div className="bg-card rounded-xl shadow-lg p-6 mb-6 border border-light animate-slide-down">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-main border-l-4 border-indigo-600 pl-4 uppercase tracking-wider">
                            {formData.type === 'in' ? t('cashbank:addCashIn', 'Add Cash In (Source)') : t('cashbank:addCashOut', 'Add Cash Out (Application)')}
                        </h2>
                        <button onClick={() => setShowAddTransaction(false)} className="text-muted hover:text-secondary">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                            <FormInput
                                label={t('cashbank:executionDate', 'Execution Date')}
                                type="date"
                                value={formData.date}
                                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                required
                            />
                            <FormInput
                                label={t('cashbank:amountLabel', 'Amount (Rs. )')}
                                type="number"
                                value={formData.amount}
                                onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                                placeholder="0.00"
                                required
                            />
                            <div>
                                <label className="block text-sm font-semibold text-secondary mb-2">
                                    {formData.type === 'in' ? t('cashbank:sourceLabel', 'Source (Where is cash coming from?)') : t('cashbank:destinationLabel', 'Destination (Where is cash going?)')}
                                </label>
                                <select
                                    value={formData.otherAccount}
                                    onChange={(e) => setFormData({ ...formData, otherAccount: e.target.value })}
                                    className="w-full px-4 py-3 border border-default rounded-lg focus:ring-2 focus:ring-primary bg-card transition-all shadow-sm"
                                    required
                                >
                                    <option value="">{formData.type === 'in' ? t('cashbank:selectSource', 'Select source of cash') : t('cashbank:selectDestination', 'Select where cash is going')}</option>
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
                                    label={t('cashbank:narrative', 'Narrative / Description')}
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder={t('cashbank:narrativePlaceholder', 'Enter detailed purpose of transaction')}
                                    required
                                />
                            </div>
                            <FormInput
                                label={t('cashbank:reference', 'Reference #')}
                                value={formData.reference}
                                onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                                placeholder={t('cashbank:referencePlaceholder', 'Voucher / Bill / ID')}
                            />
                        </div>

                        {/* Balance Preview Insight */}
                        {formData.otherAccount && formData.amount > 0 && (
                            <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 mb-8 flex items-center justify-between animate-pulse">
                                <div className="flex items-center space-x-4">
                                    <div className="p-2 bg-white rounded-lg shadow-sm font-bold text-indigo-700">
                                        {t('cashbank:livePreview', 'Live Preview')}
                                    </div>
                                    <div className="text-sm text-indigo-800">
                                        {formData.type === 'in' ? (
                                            <>
                                                {t('cashbank:depositing', 'Depositing')} <strong>Rs. {formData.amount.toLocaleString()}</strong> {t('cashbank:into', 'into')} <strong>{t('cashbank:cashInHand', 'Cash')}</strong>
                                                {accounts.find(a => a._id === formData.otherAccount) && ` ${t('cashbank:from', 'from')} ${accounts.find(a => a._id === formData.otherAccount).bankName}`}
                                            </>
                                        ) : (
                                            <>
                                                {t('cashbank:withdrawing', 'Withdrawing')} <strong>Rs. {formData.amount.toLocaleString()}</strong> {t('cashbank:from', 'from')} <strong>{t('cashbank:cashInHand', 'Cash')}</strong>
                                                {accounts.find(a => a._id === formData.otherAccount) && ` ${t('cashbank:to', 'to')} ${accounts.find(a => a._id === formData.otherAccount).bankName}`}
                                            </>
                                        )}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-indigo-500 uppercase font-bold">{t('cashbank:newCashBalance', 'New Cash Balance')}</p>
                                    <p className="text-lg font-black text-indigo-700">
                                        Rs. {(formData.type === 'in' ? (position?.cashInHand || 0) + formData.amount : (position?.cashInHand || 0) - formData.amount).toLocaleString()}
                                    </p>
                                </div>
                            </div>
                        )}

                        <div className="flex gap-4 items-center">
                            <button
                                type="submit"
                                disabled={isLoading}
                                className={`px-10 py-3 text-white rounded-lg font-bold shadow-lg transition transform hover:scale-105 ${formData.type === 'in' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'} ${isLoading ? 'opacity-50' : ''}`}
                            >
                                {isLoading ? t('cashbank:processing', 'Processing...') : formData.type === 'in' ? t('cashbank:confirmCashEntry', 'Confirm Cash Entry') : t('cashbank:confirmCashExit', 'Confirm Cash Exit')}
                            </button>
                            <button
                                type="button"
                                onClick={() => setShowAddTransaction(false)}
                                className="px-10 py-3 border border-default text-secondaryrounded-lg font-bold hover:bg-surface transition"
                            >
                                {t('cashbank:discard', 'Discard')}
                            </button>
                        </div>
                    </form>
                </div>
            )}

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
