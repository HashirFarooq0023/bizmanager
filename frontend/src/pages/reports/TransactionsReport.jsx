import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useLanguage } from '../../contexts/LanguageContext';
import Layout from '../../components/Layout';
import ReportToolbar from './components/ReportToolbar';
import api from '../../services/api';
import { exportReportToPDF, exportReportToExcel, formatCurrency, formatDate } from '../../utils/reportExporter';
import { FiList, FiTrendingUp, FiTrendingDown, FiDollarSign } from 'react-icons/fi';

const TransactionsReport = () => {
    const { isUrdu } = useLanguage();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);
    const [dateFilter, setDateFilter] = useState('this_month');
    const [customStartDate, setCustomStartDate] = useState('');
    const [customEndDate, setCustomEndDate] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState('');
    const [isExportingPDF, setIsExportingPDF] = useState(false);
    const [isExportingExcel, setIsExportingExcel] = useState(false);

    useEffect(() => {
        fetchTransactions();
    }, [dateFilter, customStartDate, customEndDate, typeFilter]);

    const fetchTransactions = async () => {
        try {
            setLoading(true);
            const params = { dateFilter };
            if (dateFilter === 'custom' && customStartDate && customEndDate) {
                params.startDate = customStartDate;
                params.endDate = customEndDate;
            }
            if (typeFilter) params.type = typeFilter;

            const res = await api.get('/api/reports/transactions', { params });
            setData(res.data);
        } catch (err) {
            console.error('Failed to load transactions:', err);
            toast.error(isUrdu ? 'ٹرانزیکشنز لوڈ نہیں ہو سکیں' : 'Failed to load Transactions Report');
        } finally {
            setLoading(false);
        }
    };

    const summary = data?.summary || {};
    const transactions = data?.transactions || [];

    const filteredTxns = transactions.filter((t) => {
        if (!searchTerm) return true;
        const q = searchTerm.toLowerCase();
        return (
            (t.refNo || '').toLowerCase().includes(q) ||
            (t.party || '').toLowerCase().includes(q) ||
            (t.type || '').toLowerCase().includes(q)
        );
    });

    const columns = [
        { header: 'Date', accessor: (row) => formatDate(row.date) },
        { header: 'Type', accessor: 'type' },
        { header: 'Ref #', accessor: 'refNo' },
        { header: 'Party / Account', accessor: 'party' },
        { header: 'Payment Method', accessor: (row) => (row.mode || '').toUpperCase() },
        { header: 'Inflow (+)', accessor: (row) => row.inflow > 0 ? formatCurrency(row.inflow) : '-' },
        { header: 'Outflow (-)', accessor: (row) => row.outflow > 0 ? formatCurrency(row.outflow) : '-' },
    ];

    const summaryCards = [
        { label: 'Total Transactions', value: String(summary.totalTransactions || 0) },
        { label: 'Total Inflow', value: formatCurrency(summary.totalInflow) },
        { label: 'Total Outflow', value: formatCurrency(summary.totalOutflow) },
        { label: 'Net Balance', value: formatCurrency(summary.netBalance) },
    ];

    const handleExportPDF = () => {
        try {
            setIsExportingPDF(true);
            exportReportToPDF({
                title: 'All Transactions Report / تمام ٹرانزیکشنز رپورٹ',
                dateRange: data?.dateRange,
                summaryCards,
                columns,
                data: filteredTxns,
                fileName: 'transactions-report',
                orientation: 'portrait',
            });
            toast.success(isUrdu ? 'پی ڈی ایف ڈاؤنلوڈ ہوگئی' : 'PDF exported successfully');
        } catch (err) {
            toast.error('Failed to export PDF');
        } finally {
            setIsExportingPDF(false);
        }
    };

    const handleExportExcel = () => {
        try {
            setIsExportingExcel(true);
            exportReportToExcel({
                title: 'Transactions Report',
                columns,
                data: filteredTxns,
                summaryCards,
                fileName: 'transactions-report',
            });
            toast.success(isUrdu ? 'ایکسل فائل ڈاؤنلوڈ ہوگئی' : 'Excel exported successfully');
        } catch (err) {
            toast.error('Failed to export Excel');
        } finally {
            setIsExportingExcel(false);
        }
    };

    return (
        <Layout>
            <ReportToolbar
                title="All Business Transactions Report"
                urduTitle="تمام کاروباری ٹرانزیکشنز رپورٹ"
                subtitle="Consolidated journal of all financial movements, sales, bills, payments, and expenses"
                urduSubtitle="تمام سیلز، بلز، وصولیوں، ادائیگیوں اور اخراجات کا مکمل تاریخی ریکارڈ"
                dateFilter={dateFilter}
                onDateFilterChange={setDateFilter}
                customStartDate={customStartDate}
                customEndDate={customEndDate}
                onCustomDateChange={({ startDate, endDate }) => {
                    setCustomStartDate(startDate);
                    setCustomEndDate(endDate);
                }}
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                onExportPDF={handleExportPDF}
                onExportExcel={handleExportExcel}
                onRefresh={fetchTransactions}
                isExportingPDF={isExportingPDF}
                isExportingExcel={isExportingExcel}
                extraFilters={
                    <div className="flex flex-wrap gap-2 pt-2">
                        {[
                            { label: isUrdu ? 'تمام' : 'All Types', value: '' },
                            { label: isUrdu ? 'سیلز انوائس' : 'Sales Invoices', value: 'Sale Invoice' },
                            { label: isUrdu ? 'خریداری بلز' : 'Purchase Bills', value: 'Purchase Bill' },
                            { label: isUrdu ? 'وصولیاں (Payment In)' : 'Payment In', value: 'Payment In' },
                            { label: isUrdu ? 'ادائیگی (Payment Out)' : 'Payment Out', value: 'Payment Out' },
                            { label: isUrdu ? 'اخراجات' : 'Expenses', value: 'Expense' },
                            { label: isUrdu ? 'واپسی' : 'Returns', value: 'Return' },
                        ].map((btn) => (
                            <button
                                key={btn.value}
                                type="button"
                                onClick={() => setTypeFilter(btn.value)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                                    typeFilter === btn.value
                                        ? 'bg-indigo-600 text-white shadow-xs'
                                        : 'bg-input text-secondary hover:text-main border border-default'
                                }`}
                            >
                                {btn.label}
                            </button>
                        ))}
                    </div>
                }
            />

            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-card border border-default p-4 rounded-2xl shadow-xs">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-secondary uppercase tracking-wider">
                            {isUrdu ? 'کل ٹرانزیکشنز' : 'Total Records'}
                        </span>
                        <span className="p-2 rounded-xl bg-blue-500/10 text-blue-600">
                            <FiList className="w-4 h-4" />
                        </span>
                    </div>
                    <div className="text-lg sm:text-2xl font-black text-main font-mono">
                        {summary.totalTransactions || 0}
                    </div>
                </div>

                <div className="bg-card border border-default p-4 rounded-2xl shadow-xs">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-secondary uppercase tracking-wider">
                            {isUrdu ? 'کل وصولی (Inflow)' : 'Total Inflow (+)'}
                        </span>
                        <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600">
                            <FiTrendingUp className="w-4 h-4" />
                        </span>
                    </div>
                    <div className="text-lg sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
                        {formatCurrency(summary.totalInflow)}
                    </div>
                </div>

                <div className="bg-card border border-default p-4 rounded-2xl shadow-xs">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-secondary uppercase tracking-wider">
                            {isUrdu ? 'کل ادائیگیاں (Outflow)' : 'Total Outflow (-)'}
                        </span>
                        <span className="p-2 rounded-xl bg-rose-500/10 text-rose-600">
                            <FiTrendingDown className="w-4 h-4" />
                        </span>
                    </div>
                    <div className="text-lg sm:text-2xl font-black text-rose-600 font-mono">
                        {formatCurrency(summary.totalOutflow)}
                    </div>
                </div>

                <div className="bg-card border border-default p-4 rounded-2xl shadow-xs">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-secondary uppercase tracking-wider">
                            {isUrdu ? 'خالص بقایا بیلنس' : 'Net Cash Position'}
                        </span>
                        <span className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600">
                            <FiDollarSign className="w-4 h-4" />
                        </span>
                    </div>
                    <div className={`text-lg sm:text-2xl font-black font-mono ${(summary.netBalance || 0) >= 0 ? 'text-indigo-600 dark:text-indigo-400' : 'text-rose-600'}`}>
                        {formatCurrency(summary.netBalance)}
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-card border border-default rounded-2xl shadow-xs overflow-hidden">
                <div className="p-4 border-b border-default flex items-center justify-between">
                    <h2 className="text-sm font-bold text-main uppercase tracking-wider">
                        {isUrdu ? `ٹرانزیکشن ریکارڈ (${filteredTxns.length})` : `Transactions Record (${filteredTxns.length})`}
                    </h2>
                </div>

                {loading ? (
                    <div className="p-12 text-center text-secondary">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-indigo-600 border-t-transparent mb-2" />
                        <p className="text-xs font-medium">{isUrdu ? 'ڈیٹا لوڈ ہو رہا ہے...' : 'Loading transactions...'}</p>
                    </div>
                ) : filteredTxns.length === 0 ? (
                    <div className="p-12 text-center text-secondary">
                        <p className="text-sm font-semibold">{isUrdu ? 'اس فلٹر کے تحت کوئی ریکارڈ نہیں ملا' : 'No transactions found for the selected filter'}</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-xs">
                            <thead className="bg-table-header border-b border-default text-secondary uppercase font-semibold text-[11px]">
                                <tr>
                                    <th className="px-4 py-3 text-left rtl:text-right">{isUrdu ? 'تاریخ' : 'Date'}</th>
                                    <th className="px-4 py-3 text-left rtl:text-right">{isUrdu ? 'قسم' : 'Type'}</th>
                                    <th className="px-4 py-3 text-left rtl:text-right">{isUrdu ? 'حوالہ #' : 'Ref #'}</th>
                                    <th className="px-4 py-3 text-left rtl:text-right">{isUrdu ? 'پارٹی / کھاتہ' : 'Party / Account'}</th>
                                    <th className="px-4 py-3 text-left rtl:text-right">{isUrdu ? 'طریقہ' : 'Mode'}</th>
                                    <th className="px-4 py-3 text-right rtl:text-left">{isUrdu ? 'وصولی (+)' : 'Inflow (+)'}</th>
                                    <th className="px-4 py-3 text-right rtl:text-left">{isUrdu ? 'ادائیگی (-)' : 'Outflow (-)'}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-default">
                                {filteredTxns.map((t) => (
                                    <tr key={t.id} className="hover:bg-hover transition">
                                        <td className="px-4 py-3 text-main font-medium whitespace-nowrap">
                                            {formatDate(t.date)}
                                        </td>
                                        <td className="px-4 py-3 font-semibold text-main">
                                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                                                t.type.includes('Sale')
                                                    ? 'bg-blue-500/10 text-blue-600'
                                                    : t.type.includes('Purchase')
                                                    ? 'bg-purple-500/10 text-purple-600'
                                                    : t.type.includes('Expense')
                                                    ? 'bg-rose-500/10 text-rose-600'
                                                    : t.type.includes('Payment In')
                                                    ? 'bg-emerald-500/10 text-emerald-600'
                                                    : 'bg-orange-500/10 text-orange-600'
                                            }`}>
                                                {t.type}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 font-mono font-semibold text-main">
                                            {t.refNo || '-'}
                                        </td>
                                        <td className="px-4 py-3 font-medium text-main">
                                            {t.party || '-'}
                                        </td>
                                        <td className="px-4 py-3 uppercase text-secondary font-mono text-[10px]">
                                            {t.mode || 'CASH'}
                                        </td>
                                        <td className="px-4 py-3 text-right rtl:text-left font-mono font-bold text-emerald-600">
                                            {t.inflow > 0 ? formatCurrency(t.inflow) : '-'}
                                        </td>
                                        <td className="px-4 py-3 text-right rtl:text-left font-mono font-bold text-rose-600">
                                            {t.outflow > 0 ? formatCurrency(t.outflow) : '-'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default TransactionsReport;
