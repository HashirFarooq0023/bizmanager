import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiDownload, FiSearch, FiRefreshCw, FiDollarSign, FiTrendingUp, FiTrendingDown, FiBookOpen } from 'react-icons/fi';
import api from '../../services/api';
import { toast } from 'react-toastify';
import Layout from '../../components/Layout';
import PageHeader from '../../components/PageHeader';
import DualMonthRangePicker from '../../components/DualMonthRangePicker';

const AccountLedger = () => {
    const { id } = useParams();
    const accountId = id || 'cash';
    const navigate = useNavigate();
    const [ledgerData, setLedgerData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({
        startDate: '',
        endDate: '',
    });

    useEffect(() => {
        fetchLedger();
    }, [accountId, filters]);

    const fetchLedger = async () => {
        try {
            setLoading(true);
            const userData = JSON.parse(localStorage.getItem('user'));
            const token = userData?.token;
            const params = new URLSearchParams();
            if (filters.startDate) params.append('startDate', filters.startDate);
            if (filters.endDate) params.append('endDate', filters.endDate);

            const response = await api.get(
                `/api/cashbank/accounts/${accountId}/ledger?${params}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setLedgerData(response.data);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to load ledger');
        } finally {
            setLoading(false);
        }
    };

    const exportCSV = () => {
        window.open(
            `/api/cashbank/export?accountId=${accountId}&format=csv&startDate=${filters.startDate}&endDate=${filters.endDate}`,
            '_blank'
        );
    };

    // Filter transactions by search term
    const filteredLedger = ledgerData?.ledger?.filter((txn) => {
        if (!searchTerm) return true;
        const q = searchTerm.toLowerCase();
        return (
            (txn.description && txn.description.toLowerCase().includes(q)) ||
            (txn.reference && txn.reference.toLowerCase().includes(q)) ||
            (txn.debit && txn.debit.toString().includes(q)) ||
            (txn.credit && txn.credit.toString().includes(q))
        );
    }) || [];

    if (loading && !ledgerData) {
        return (
            <Layout>
                <div className="flex justify-center items-center h-80">
                    <div className="flex flex-col items-center gap-3">
                        <div className="animate-spin rounded-full h-10 w-10 border-3 border-violet-600 border-t-transparent"></div>
                        <p className="text-sm font-medium text-slate-500 dark:text-zinc-400">Loading detailed ledger...</p>
                    </div>
                </div>
            </Layout>
        );
    }

    if (!ledgerData) {
        return (
            <Layout>
                <div className="text-center py-16 bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800">
                    <FiBookOpen className="w-12 h-12 text-slate-400 dark:text-zinc-500 mx-auto mb-3" />
                    <p className="text-lg font-bold text-slate-800 dark:text-zinc-200">Account Not Found</p>
                    <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1 mb-4">The selected cash or bank account could not be found.</p>
                    <button
                        onClick={() => navigate('/cashbank/cash-in-hand')}
                        className="px-4 py-2 bg-violet-600 text-white rounded-xl font-semibold hover:bg-violet-500 cursor-pointer shadow-xs"
                    >
                        Back to Cash Drawer
                    </button>
                </div>
            </Layout>
        );
    }

    const isCash = ledgerData?.account?._id === 'cash';

    return (
        <Layout>
            <div className="space-y-6">
                {/* Header */}
                <PageHeader
                    title={`${ledgerData?.account?.bankName || 'Cash in Hand'} — Detailed Ledger`}
                    description={
                        isCash
                            ? 'Complete chronological record of all Cash In & Cash Out transactions'
                            : `Account: ****${(ledgerData?.account?.accountNumber || '').slice(-4)} | Type: ${ledgerData?.account?.accountType || 'Standard'}`
                    }
                    actions={[
                        <button
                            key="back"
                            onClick={() => navigate(-1)}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 rounded-xl text-sm font-semibold transition cursor-pointer shadow-xs"
                        >
                            <FiArrowLeft className="w-4 h-4" />
                            <span>Back</span>
                        </button>,
                        <button
                            key="export"
                            onClick={exportCSV}
                            className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-semibold transition cursor-pointer shadow-xs shadow-emerald-600/20"
                        >
                            <FiDownload className="w-4 h-4" />
                            <span>Export CSV</span>
                        </button>
                    ]}
                />

                {/* Stat Summary Cards in Dark & Light Modes */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Opening Balance */}
                    <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800/80 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                                Opening Balance
                            </span>
                            <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 flex items-center justify-center">
                                <FiDollarSign className="w-4 h-4" />
                            </div>
                        </div>
                        <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-2 font-mono">
                            Rs. {(ledgerData?.summary?.openingBalance || 0).toLocaleString('en-PK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                    </div>

                    {/* Total Credits (Cash In) */}
                    <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800/80 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                                Total Credits (Cash In)
                            </span>
                            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                                <FiTrendingUp className="w-4 h-4" />
                            </div>
                        </div>
                        <p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-2 font-mono">
                            Rs. {(ledgerData?.summary?.totalCredits || 0).toLocaleString('en-PK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                    </div>

                    {/* Total Debits (Cash Out) */}
                    <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800/80 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
                                Total Debits (Cash Out)
                            </span>
                            <div className="w-8 h-8 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                                <FiTrendingDown className="w-4 h-4" />
                            </div>
                        </div>
                        <p className="text-2xl font-extrabold text-rose-600 dark:text-rose-400 mt-2 font-mono">
                            Rs. {(ledgerData?.summary?.totalDebits || 0).toLocaleString('en-PK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                    </div>

                    {/* Closing Balance */}
                    <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800/80 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold uppercase tracking-wider text-violet-600 dark:text-violet-400">
                                Closing Balance
                            </span>
                            <div className="w-8 h-8 rounded-xl bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400 flex items-center justify-center">
                                <FiBookOpen className="w-4 h-4" />
                            </div>
                        </div>
                        <p className="text-2xl font-extrabold text-violet-600 dark:text-violet-400 mt-2 font-mono">
                            Rs. {(ledgerData?.summary?.closingBalance || 0).toLocaleString('en-PK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                    </div>
                </div>

                {/* Filter Bar with Dual Month Range Picker & Search */}
                <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800/80 rounded-2xl p-4 shadow-xs">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        {/* Dual Month Date Range Selector */}
                        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                            <div className="w-full sm:w-80">
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-1.5">
                                    Date Range
                                </label>
                                <DualMonthRangePicker
                                    startDate={filters.startDate}
                                    endDate={filters.endDate}
                                    onChange={({ startDate, endDate }) => {
                                        setFilters({ startDate, endDate });
                                    }}
                                    placeholder="Filter by Date Range..."
                                />
                            </div>

                            {/* Search Box */}
                            <div className="w-full sm:w-72">
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-1.5">
                                    Search Transactions
                                </label>
                                <div className="relative">
                                    <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-zinc-500 w-4 h-4" />
                                    <input
                                        type="text"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        placeholder="Search description, ref #..."
                                        className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-800 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-500 text-xs sm:text-sm focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Reset / Reload Button */}
                        <div className="flex items-center gap-2 self-end lg:self-end">
                            {(filters.startDate || filters.endDate || searchTerm) && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setFilters({ startDate: '', endDate: '' });
                                        setSearchTerm('');
                                    }}
                                    className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-700 text-xs font-bold transition cursor-pointer"
                                >
                                    Clear Filters
                                </button>
                            )}
                            <button
                                type="button"
                                onClick={fetchLedger}
                                className="p-2 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-600 dark:text-zinc-300 transition cursor-pointer shadow-xs"
                                title="Refresh ledger"
                            >
                                <FiRefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Ledger Transactions Table */}
                <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800/80 rounded-2xl shadow-xs overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 dark:bg-zinc-800/60 border-b border-slate-200 dark:border-zinc-800 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 select-none">
                                    <th className="px-5 py-3.5">Date</th>
                                    <th className="px-5 py-3.5">Description & Reference</th>
                                    <th className="px-5 py-3.5 text-center">Type</th>
                                    <th className="px-5 py-3.5 text-right text-rose-600 dark:text-rose-400">Cash Out (Debit)</th>
                                    <th className="px-5 py-3.5 text-right text-emerald-600 dark:text-emerald-400">Cash In (Credit)</th>
                                    <th className="px-5 py-3.5 text-right text-violet-600 dark:text-violet-400">Running Balance</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/60">
                                {filteredLedger.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-16 text-center text-slate-400 dark:text-zinc-500">
                                            <FiBookOpen className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                            <p className="font-semibold text-sm">No transactions found</p>
                                            <p className="text-xs mt-0.5">Try adjusting your date range or search filter.</p>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredLedger.map((txn, idx) => {
                                        const isDebit = txn.debit > 0;
                                        const isCredit = txn.credit > 0;

                                        return (
                                            <tr
                                                key={txn._id || idx}
                                                className="hover:bg-slate-50/80 dark:hover:bg-zinc-800/40 transition-colors"
                                            >
                                                {/* Date */}
                                                <td className="px-5 py-3.5 whitespace-nowrap text-xs font-semibold text-slate-700 dark:text-zinc-300 font-mono">
                                                    {txn.date ? new Date(txn.date).toLocaleDateString('en-US', {
                                                        year: 'numeric',
                                                        month: 'short',
                                                        day: '2-digit',
                                                    }) : '—'}
                                                </td>

                                                {/* Description & Reference */}
                                                <td className="px-5 py-3.5 text-sm text-slate-900 dark:text-zinc-100 font-medium max-w-md">
                                                    <div>{txn.description || 'Cash Transaction'}</div>
                                                    {txn.reference && (
                                                        <div className="text-[11px] text-slate-400 dark:text-zinc-500 font-mono mt-0.5">
                                                            Ref: {txn.reference}
                                                        </div>
                                                    )}
                                                </td>

                                                {/* Type Badge */}
                                                <td className="px-5 py-3.5 whitespace-nowrap text-center">
                                                    {isCredit ? (
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300">
                                                            Cash In
                                                        </span>
                                                    ) : isDebit ? (
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-950/70 dark:text-rose-300">
                                                            Cash Out
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 dark:bg-zinc-800 dark:text-zinc-300">
                                                            Adjustment
                                                        </span>
                                                    )}
                                                </td>

                                                {/* Cash Out (Debit) */}
                                                <td className="px-5 py-3.5 whitespace-nowrap text-right text-sm font-bold text-rose-600 dark:text-rose-400 font-mono">
                                                    {isDebit ? `Rs. ${(txn.debit || 0).toFixed(2)}` : '—'}
                                                </td>

                                                {/* Cash In (Credit) */}
                                                <td className="px-5 py-3.5 whitespace-nowrap text-right text-sm font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                                                    {isCredit ? `Rs. ${(txn.credit || 0).toFixed(2)}` : '—'}
                                                </td>

                                                {/* Running Balance */}
                                                <td className="px-5 py-3.5 whitespace-nowrap text-right text-sm font-extrabold text-violet-600 dark:text-violet-400 font-mono">
                                                    Rs. {(txn.runningBalance || 0).toFixed(2)}
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default AccountLedger;
