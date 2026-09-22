import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useLanguage } from '../../contexts/LanguageContext';
import Layout from '../../components/Layout';
import ReportToolbar from './components/ReportToolbar';
import api from '../../services/api';
import { exportReportToPDF, exportReportToExcel, formatCurrency, formatDate } from '../../utils/reportExporter';
import { FiTrendingUp, FiTrendingDown, FiDollarSign, FiShoppingBag, FiCreditCard } from 'react-icons/fi';

const DayBookReport = () => {
    const { isUrdu } = useLanguage();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);
    const [dateFilter, setDateFilter] = useState('today');
    const [customStartDate, setCustomStartDate] = useState('');
    const [customEndDate, setCustomEndDate] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [isExportingPDF, setIsExportingPDF] = useState(false);
    const [isExportingExcel, setIsExportingExcel] = useState(false);

    useEffect(() => {
        fetchDayBook();
    }, [dateFilter, customStartDate, customEndDate]);

    const fetchDayBook = async () => {
        try {
            setLoading(true);
            const params = { dateFilter };
            if (dateFilter === 'custom' && customStartDate && customEndDate) {
                params.startDate = customStartDate;
                params.endDate = customEndDate;
            }
            const res = await api.get('/api/reports/daybook', { params });
            setData(res.data);
        } catch (err) {
            console.error('Failed to fetch DayBook:', err);
            toast.error(isUrdu ? 'روزنامچہ لوڈ کرنے میں ناکامی ہوئی' : 'Failed to load Day Book');
        } finally {
            setLoading(false);
        }
    };

    const entries = data?.entries || [];
    const summary = data?.summary || {};

    const filteredEntries = entries.filter((e) => {
        if (!searchTerm) return true;
        const q = searchTerm.toLowerCase();
        return (
            (e.refNo || '').toLowerCase().includes(q) ||
            (e.party || '').toLowerCase().includes(q) ||
            (e.label || '').toLowerCase().includes(q) ||
            (e.mode || '').toLowerCase().includes(q)
        );
    });

    const columns = [
        { header: 'Date', accessor: (row) => formatDate(row.date) },
        { header: 'Type', accessor: (row) => row.label || row.type },
        { header: 'Ref / Invoice #', accessor: 'refNo' },
        { header: 'Party / Description', accessor: 'party' },
        { header: 'Payment Mode', accessor: (row) => (row.mode || '').toUpperCase() },
        { header: 'Inflow (Cash In)', accessor: (row) => row.inflow > 0 ? formatCurrency(row.inflow) : '-' },
        { header: 'Outflow (Cash Out)', accessor: (row) => row.outflow > 0 ? formatCurrency(row.outflow) : '-' },
    ];

    const summaryCards = [
        { label: 'Total Inflow', value: formatCurrency(summary.totalInflow) },
        { label: 'Total Outflow', value: formatCurrency(summary.totalOutflow) },
        { label: 'Net Cashflow', value: formatCurrency(summary.netCashflow) },
        { label: 'Total Sales', value: formatCurrency(summary.totalSales) },
    ];

    const handleExportPDF = () => {
        try {
            setIsExportingPDF(true);
            exportReportToPDF({
                title: 'Day Book Report / روزنامچہ رپورٹ',
                dateRange: data?.dateRange,
                summaryCards,
                columns,
                data: filteredEntries,
                fileName: 'daybook-report',
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
                title: 'Day Book Report',
                columns,
                data: filteredEntries,
                summaryCards,
                fileName: 'daybook-report',
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
                title="Day Book Report"
                urduTitle="روزنامچہ رپورٹ"
                subtitle="Complete daily register of cash inflows, outflows, counter sales, payments and expenses"
                urduSubtitle="روزانہ کی تمام آمدنی، اخراجات، سیلز اور ادائیگیوں کا مکمل کھاتہ"
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
                onRefresh={fetchDayBook}
                isExportingPDF={isExportingPDF}
                isExportingExcel={isExportingExcel}
            />

            {/* KPI Summary Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-card border border-default p-4 rounded-2xl shadow-xs">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-secondary uppercase tracking-wider">
                            {isUrdu ? 'کل وصولی / آمدنی' : 'Total Inflow (Cash In)'}
                        </span>
                        <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600">
                            <FiTrendingUp className="w-4 h-4" />
                        </span>
                    </div>
                    <div className="text-lg sm:text-2xl font-black text-emerald-600 font-mono">
                        {formatCurrency(summary.totalInflow)}
                    </div>
                </div>

                <div className="bg-card border border-default p-4 rounded-2xl shadow-xs">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-secondary uppercase tracking-wider">
                            {isUrdu ? 'کل اخراجات / ادائیگیاں' : 'Total Outflow (Cash Out)'}
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
                            {isUrdu ? 'خالص بقایا / کیش فلو' : 'Net Cash Flow'}
                        </span>
                        <span className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600">
                            <FiDollarSign className="w-4 h-4" />
                        </span>
                    </div>
                    <div className={`text-lg sm:text-2xl font-black font-mono ${(summary.netCashflow || 0) >= 0 ? 'text-indigo-600 dark:text-indigo-400' : 'text-rose-600'}`}>
                        {formatCurrency(summary.netCashflow)}
                    </div>
                </div>

                <div className="bg-card border border-default p-4 rounded-2xl shadow-xs">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-secondary uppercase tracking-wider">
                            {isUrdu ? 'کل سیلز کا حجم' : 'Total Sales Volume'}
                        </span>
                        <span className="p-2 rounded-xl bg-amber-500/10 text-amber-600">
                            <FiShoppingBag className="w-4 h-4" />
                        </span>
                    </div>
                    <div className="text-lg sm:text-2xl font-black text-main font-mono">
                        {formatCurrency(summary.totalSales)}
                    </div>
                </div>
            </div>

            {/* Entries Table */}
            <div className="bg-card border border-default rounded-2xl shadow-xs overflow-hidden">
                <div className="p-4 border-b border-default flex items-center justify-between">
                    <h2 className="text-sm font-bold text-main uppercase tracking-wider">
                        {isUrdu ? `اندراجات (${filteredEntries.length})` : `Day Book Transactions (${filteredEntries.length})`}
                    </h2>
                </div>

                {loading ? (
                    <div className="p-12 text-center text-secondary">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-indigo-600 border-t-transparent mb-2" />
                        <p className="text-xs font-medium">{isUrdu ? 'ڈیٹا لوڈ ہو رہا ہے...' : 'Loading transactions...'}</p>
                    </div>
                ) : filteredEntries.length === 0 ? (
                    <div className="p-12 text-center text-secondary">
                        <p className="text-sm font-semibold">{isUrdu ? 'منتخب مدت میں کوئی اندراج نہیں ملا' : 'No transactions found for the selected period'}</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-xs">
                            <thead className="bg-table-header border-b border-default text-secondary uppercase font-semibold text-[11px]">
                                <tr>
                                    <th className="px-4 py-3 text-left rtl:text-right">{isUrdu ? 'تاریخ' : 'Date'}</th>
                                    <th className="px-4 py-3 text-left rtl:text-right">{isUrdu ? 'قسم' : 'Type'}</th>
                                    <th className="px-4 py-3 text-left rtl:text-right">{isUrdu ? 'حوالہ / انوائس #' : 'Ref / Invoice #'}</th>
                                    <th className="px-4 py-3 text-left rtl:text-right">{isUrdu ? 'تفصیل / پارٹی' : 'Party / Description'}</th>
                                    <th className="px-4 py-3 text-left rtl:text-right">{isUrdu ? 'طریقہ' : 'Mode'}</th>
                                    <th className="px-4 py-3 text-right rtl:text-left">{isUrdu ? 'آمدنی (Inflow)' : 'Inflow (+)'}</th>
                                    <th className="px-4 py-3 text-right rtl:text-left">{isUrdu ? 'اخراجات (Outflow)' : 'Outflow (-)'}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-default">
                                {filteredEntries.map((row, idx) => (
                                    <tr key={row.id || idx} className="hover:bg-hover transition">
                                        <td className="px-4 py-3 text-main font-medium whitespace-nowrap">
                                            {formatDate(row.date)}
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                                                row.type.includes('SALE')
                                                    ? 'bg-blue-500/10 text-blue-600'
                                                    : row.type.includes('EXPENSE')
                                                    ? 'bg-rose-500/10 text-rose-600'
                                                    : row.type.includes('PAYMENT_IN')
                                                    ? 'bg-emerald-500/10 text-emerald-600'
                                                    : row.type.includes('RETURN')
                                                    ? 'bg-orange-500/10 text-orange-600'
                                                    : 'bg-gray-500/10 text-gray-600'
                                            }`}>
                                                {row.label || row.type}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 font-mono font-semibold text-main">
                                            {row.refNo || '-'}
                                        </td>
                                        <td className="px-4 py-3 text-main font-medium">
                                            {row.party || '-'}
                                        </td>
                                        <td className="px-4 py-3 uppercase text-secondary font-medium text-[10px]">
                                            {row.mode || 'CASH'}
                                        </td>
                                        <td className="px-4 py-3 text-right rtl:text-left font-mono font-bold text-emerald-600">
                                            {row.inflow > 0 ? formatCurrency(row.inflow) : '-'}
                                        </td>
                                        <td className="px-4 py-3 text-right rtl:text-left font-mono font-bold text-rose-600">
                                            {row.outflow > 0 ? formatCurrency(row.outflow) : '-'}
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

export default DayBookReport;
