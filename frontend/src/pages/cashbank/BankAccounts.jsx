import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import PageHeader from '../../components/PageHeader';
import StatsCard from '../../components/StatsCard';
import DataTable from '../../components/DataTable';
import { useLanguage } from '../../contexts/LanguageContext';
import { getAccounts, createAccount, deleteAccount, reset } from '../../redux/slices/cashbankSlice';

const BankAccounts = () => {
    const { isUrdu } = useLanguage();
    const [showAddAccount, setShowAddAccount] = useState(false);
    const [revealedAccounts, setRevealedAccounts] = useState({});
    const [formData, setFormData] = useState({
        bankName: '',
        accountNumber: '',
        accountType: 'Savings',
        branch: '',
        ifsc: '',
        openingBalance: 0
    });

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { accounts, isLoading, isSuccess } = useSelector(state => state.cashbank);

    useEffect(() => {
        dispatch(getAccounts());
    }, [dispatch]);

    useEffect(() => {
        if (isSuccess) {
            setShowAddAccount(false);
            setFormData({
                bankName: '',
                accountNumber: '',
                accountType: 'Savings',
                branch: '',
                ifsc: '',
                openingBalance: 0
            });
        }
        dispatch(reset());
    }, [isSuccess, dispatch]);

    const handleSubmit = (e) => {
        e.preventDefault();
        dispatch(createAccount(formData));
    };

    const toggleReveal = (id) => {
        setRevealedAccounts(prev => ({
            ...prev,
            [id]: !prev[id]
        }));
    };

    const maskAccountNumber = (number) => {
        if (number.length <= 4) return number;
        return '*'.repeat(number.length - 4) + number.slice(-4);
    };

    const columns = [
        { key: 'bankName', label: 'Bank Name', sortable: true, render: (val) => <span className="font-medium text-main">{val}</span> },
        {
            key: 'accountNumber',
            label: 'Account No',
            render: (val, row) => (
                <div className="flex items-center space-x-2">
                    <span className="font-mono text-secondary">
                        {revealedAccounts[row._id] ? val : maskAccountNumber(val)}
                    </span>
                    <button
                        onClick={() => toggleReveal(row._id)}
                        className="text-blue-600 hover:text-blue-800"
                        title={revealedAccounts[row._id] ? 'Hide account number' : 'Show account number'}
                    >
                        {revealedAccounts[row._id] ? (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                            </svg>
                        ) : (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                        )}
                    </button>
                </div>
            )
        },
        { key: 'accountType', label: 'Type', sortable: true },
        { key: 'branch', label: 'Branch' },
        { key: 'ifsc', label: 'IBAN / Branch Code', render: (val) => <span className="font-mono text-sm">{val}</span> },
        { key: 'currentBalance', label: 'Balance', sortable: true, render: (val) => <span className="font-bold text-green-600">Rs. {val.toLocaleString()}</span> },
        {
            key: 'actions',
            label: 'Actions',
            render: (val, row) => (
                <div className="flex items-center space-x-3">
                    <button
                        onClick={() => navigate(`/cashbank/ledger/${row._id}`)}
                        className="p-1 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors group"
                        title="View Ledger"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01m-.01 4h.01" />
                        </svg>
                        <span className="sr-only">Ledger</span>
                    </button>
                    <button
                        onClick={() => navigate('/transfers', { state: { fromAccount: row._id } })}
                        className="p-1 text-green-600 hover:bg-green-50 rounded-lg transition-colors group"
                        title="Transfer Funds"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                        </svg>
                        <span className="sr-only">Transfer</span>
                    </button>
                    <button
                        className="p-1 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors group"
                        title="Edit Account"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        <span className="sr-only">Edit</span>
                    </button>
                    <button
                        onClick={() => {
                            if (window.confirm('Are you sure you want to delete this account?')) {
                                dispatch(deleteAccount(row._id));
                            }
                        }}
                        className="p-1 text-red-600 hover:bg-red-50 rounded-lg transition-colors group"
                        title="Delete Account"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        <span className="sr-only">Delete</span>
                    </button>
                </div>
            )
        }
    ];

    const safeAccounts = Array.isArray(accounts) ? accounts : [];
    const totalBalance = safeAccounts.reduce((sum, acc) => sum + (acc.currentBalance || 0), 0);

    return (
        <Layout>
            <div dir="ltr" className="text-left">
                <PageHeader
                    title={isUrdu ? "Bank Accounts / بینک کھاتے" : "Bank Accounts"}
                    description={isUrdu ? "Manage your business bank accounts / کاروباری بینک اکاؤنٹس کا انتظام کریں" : "Manage your business bank accounts"}
                    actions={[
                        <button
                            key="add"
                            onClick={() => setShowAddAccount(true)}
                            className="px-6 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-lg font-semibold shadow-xs transition-colors cursor-pointer"
                        >
                            {isUrdu ? '+ Add Bank Account / نیا بینک کھاتہ' : '+ Add Bank Account'}
                        </button>
                    ]}
                />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <StatsCard title={isUrdu ? "Total Balance / کل بیلنس" : "Total Balance"} value={`Rs. ${totalBalance.toLocaleString()}`} icon={<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} iconBgColor="bg-green-100 dark:bg-green-900/30" iconColor="text-green-600 dark:text-green-400" />
                    <StatsCard title={isUrdu ? "Active Accounts / فعال کھاتے" : "Active Accounts"} value={safeAccounts.length} icon={<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>} iconBgColor="bg-blue-100 dark:bg-blue-900/30" iconColor="text-blue-600 dark:text-blue-400" />
                    <StatsCard title={isUrdu ? "Transactions / ٹرانزیکشنز" : "This Month Transactions"} value="156" icon={<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>} iconBgColor="bg-purple-100 dark:bg-purple-900/30" iconColor="text-purple-600 dark:text-purple-400" />
                </div>

                {showAddAccount && (
                    <form onSubmit={handleSubmit} className="bg-card rounded-xl shadow-sm p-6 mb-6 border border-default">
                        <h2 className="text-lg font-bold text-main mb-4">
                            {isUrdu ? 'Add New Bank Account (نیا بینک کھاتہ شامل کریں)' : 'Add New Bank Account'}
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="block text-sm font-medium text-secondary">
                                        Bank Name <span className="text-red-500">*</span>
                                    </label>
                                    {isUrdu && <span className="text-xs text-secondary font-urdu">بینک کا نام</span>}
                                </div>
                                <input
                                    type="text"
                                    value={formData.bankName}
                                    onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                                    className="w-full px-4 py-2 border border-default rounded-lg bg-background text-main focus:ring-2 focus:ring-primary"
                                    placeholder={isUrdu ? "e.g., Meezan Bank, HBL, EasyPaisa, JazzCash / بینک کا نام" : "e.g., Meezan Bank, HBL, EasyPaisa, JazzCash"}
                                    required
                                />
                            </div>
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="block text-sm font-medium text-secondary">
                                        Account Number <span className="text-red-500">*</span>
                                    </label>
                                    {isUrdu && <span className="text-xs text-secondary font-urdu">اکاؤنٹ نمبر</span>}
                                </div>
                                <input
                                    type="text"
                                    value={formData.accountNumber}
                                    onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                                    className="w-full px-4 py-2 border border-default rounded-lg bg-background text-main focus:ring-2 focus:ring-primary"
                                    placeholder={isUrdu ? "Enter account number / اکاؤنٹ نمبر درج کریں" : "Enter account number"}
                                    required
                                />
                            </div>
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="block text-sm font-medium text-secondary">Account Type</label>
                                    {isUrdu && <span className="text-xs text-secondary font-urdu">کھاتے کی قسم</span>}
                                </div>
                                <select
                                    value={formData.accountType}
                                    onChange={(e) => setFormData({ ...formData, accountType: e.target.value })}
                                    className="w-full px-4 py-2 border border-default rounded-lg bg-background text-main focus:ring-2 focus:ring-primary"
                                >
                                    <option value="Savings">{isUrdu ? 'Savings / بچت کھاتہ' : 'Savings'}</option>
                                    <option value="Current">{isUrdu ? 'Current / کرنٹ کھاتہ' : 'Current'}</option>
                                    <option value="Overdraft / Running Finance">{isUrdu ? 'Running Finance / رننگ فنانس' : 'Overdraft / Running Finance'}</option>
                                    <option value="Mobile Wallet (JazzCash/EasyPaisa)">{isUrdu ? 'Mobile Wallet (JazzCash/EasyPaisa) / موبائل والیٹ' : 'Mobile Wallet (JazzCash/EasyPaisa)'}</option>
                                </select>
                            </div>
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="block text-sm font-medium text-secondary">
                                        IBAN / Branch Code <span className="text-red-500">*</span>
                                    </label>
                                    {isUrdu && <span className="text-xs text-secondary font-urdu">آئی بین / برانچ کوڈ</span>}
                                </div>
                                <input
                                    type="text"
                                    value={formData.ifsc}
                                    onChange={(e) => setFormData({ ...formData, ifsc: e.target.value })}
                                    className="w-full px-4 py-2 border border-default rounded-lg bg-background text-main focus:ring-2 focus:ring-primary"
                                    placeholder={isUrdu ? "e.g., PK36MEZN00012345678901 or 0123" : "e.g., PK36MEZN00012345678901 or 0123"}
                                    required
                                />
                            </div>
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="block text-sm font-medium text-secondary">Branch</label>
                                    {isUrdu && <span className="text-xs text-secondary font-urdu">برانچ</span>}
                                </div>
                                <input
                                    type="text"
                                    value={formData.branch}
                                    onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                                    className="w-full px-4 py-2 border border-default rounded-lg bg-background text-main focus:ring-2 focus:ring-primary"
                                    placeholder={isUrdu ? "Branch name / برانچ کا نام" : "Branch name"}
                                />
                            </div>
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="block text-sm font-medium text-secondary">Opening Balance</label>
                                    {isUrdu && <span className="text-xs text-secondary font-urdu">ابتدائی رقم</span>}
                                </div>
                                <input
                                    type="number"
                                    value={formData.openingBalance}
                                    onChange={(e) => setFormData({ ...formData, openingBalance: parseFloat(e.target.value) || 0 })}
                                    className="w-full px-4 py-2 border border-default rounded-lg bg-background text-main focus:ring-2 focus:ring-primary"
                                    placeholder="0.00"
                                />
                            </div>
                        </div>
                        <div className="flex gap-3 mt-6 border-t border-default pt-4">
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="px-6 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-lg font-semibold shadow-xs disabled:opacity-50 cursor-pointer transition-colors"
                            >
                                {isLoading ? (isUrdu ? 'Saving... / محفوظ ہو رہا ہے...' : 'Saving...') : (isUrdu ? 'Save Account / کھاتہ محفوظ کریں' : 'Save Account')}
                            </button>
                            <button
                                type="button"
                                onClick={() => setShowAddAccount(false)}
                                className="px-6 py-2.5 border border-default text-secondary rounded-lg hover:bg-surface font-medium cursor-pointer transition-colors"
                            >
                                {isUrdu ? 'Cancel / منسوخ کریں' : 'Cancel'}
                            </button>
                        </div>
                    </form>
                )}

                <DataTable columns={columns} data={accounts} emptyMessage={isUrdu ? "No bank accounts added / کوئی بینک کھاتہ شامل نہیں کیا گیا" : "No bank accounts added"} />
            </div>
        </Layout>
    );
};

export default BankAccounts;
