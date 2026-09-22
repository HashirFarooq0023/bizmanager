import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useLanguage } from '../../contexts/LanguageContext';
import Layout from '../../components/Layout';
import ReportToolbar from './components/ReportToolbar';
import api from '../../services/api';
import { exportReportToPDF, exportReportToExcel, formatCurrency, formatDate } from '../../utils/reportExporter';
import { FiTrendingUp, FiShoppingBag, FiDollarSign, FiPercent } from 'react-icons/fi';

const BillWiseProfitReport = () => {
    const { isUrdu } = useLanguage();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);
    const [dateFilter, setDateFilter] = useState('this_month');
    const [customStartDate, setCustomStartDate] = useState('');
    const [customEndDate, setCustomEndDate] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [isExportingPDF, setIsExportingPDF] = useState(false);
    const [isExportingExcel, setIsExportingExcel] = useState(false);

    useEffect(() => {
        fetchBillProfit();
    }, [dateFilter, customStartDate, customEndDate, searchTerm]);

    const fetchBillProfit = async () => {
        try {
            setLoading(true);
            const params = { dateFilter };
            if (dateFilter === 'custom' && customStartDate && customEndDate) {
                params.startDate = customStartDate;
                params.endDate = customEndDate;
            }
            if (searchTerm) params.search = searchTerm;

            const res = await api.get('/api/reports/bill-profit', { params });
            setData(res.data);
        } catch (err) {
            console.error('Failed to fetch Bill Profit:', err);
            toast.error(isUrdu ? 'بل کے حساب سے منافع لوڈ نہیں ہوا' : 'Failed to load Bill Wise Profit Report');
        } finally {
            setLoading(false);
        }
    };

    const bills = data?.bills || [];
    const summary = data?.summary || {};

    const columns = [
        { header: 'Invoice #', accessor: 'invoiceNo' },
        { header: 'Date', accessor: (row) => formatDate(row.date) },
        { header: 'Customer', accessor: 'customerName' },
        { header: 'Sale Amount', accessor: (row) => formatCurrency(row.saleAmount) },
        { header: 'Cost Amount', accessor: (row) => formatCurrency(row.costAmount) },
        { header: 'Profit Amount', accessor: (row) => formatCurrency(row.profitAmount) },
        { header: 'Margin %', accessor: (row) => `${row.marginPercent}%` },
        { header: 'Payment Mode', accessor: (row) => (row.paymentMethod || '').toUpperCase() },
    ];

    const summaryCards = [
        { label: 'Total Invoices', value: String(summary.totalInvoices || 0) },
        { label: 'Total Sales', value: formatCurrency(summary.totalSales) },
        { label: 'Total Profit', value: formatCurrency(summary.totalProfit) },
        { label: 'Avg Margin %', value: `${summary.avgMarginPercent || 0}%` },
    ];

    const handleExportPDF = () => {
        try {
            setIsExportingPDF(true);
            exportReportToPDF({
                title: 'Bill Wise Profit Report / بل کے حساب سے نفع رپورٹ',
                dateRange: data?.dateRange,
                summaryCards,
                columns,
                data: bills,
                fileName: 'bill-wise-profit-report',
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
                title: 'Bill Wise Profit',
                columns,
                data: bills,
                summaryCards,
                fileName: 'bill-wise-profit-report',
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
                title="Bill Wise Profit Report"
                urduTitle="بل کے حساب سے نفع رپورٹ"
                subtitle="Analyze profit margins, sales volume, and cost on an invoice-by-invoice basis"
                urduSubtitle="ہر بل کی سیلز، لاگت اور حاصل ہونے والے نفع کا تفصیلی جائزہ"
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
                onRefresh={fetchBillProfit}
                isExportingPDF={isExportingPDF}
                isExportingExcel={isExportingExcel}
            />

            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-card border border-default p-4 rounded-2xl shadow-xs">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-secondary uppercase tracking-wider">
                            {isUrdu ? 'کل بلوں کی تعداد' : 'Total Bills'}
                        </span>
                        <span className="p-2 rounded-xl bg-blue-500/10 text-blue-600">
                            <FiShoppingBag className="w-4 h-4" />
                        </span>
                    </div>
                    <div className="text-lg sm:text-2xl font-black text-main font-mono">
                        {summary.totalInvoices || 0}
                    </div>
                </div>

                <div className="bg-card border border-default p-4 rounded-2xl shadow-xs">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-secondary uppercase tracking-wider">
                            {isUrdu ? 'کل سیلز کا حجم' : 'Total Sales'}
                        </span>
                        <span className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600">
                            <FiDollarSign className="w-4 h-4" />
                        </span>
                    </div>
                    <div className="text-lg sm:text-2xl font-black text-main font-mono">
                        {formatCurrency(summary.totalSales)}
                    </div>
                </div>

                <div className="bg-card border border-default p-4 rounded-2xl shadow-xs">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-secondary uppercase tracking-wider">
                            {isUrdu ? 'حاصل شدہ کل نفع' : 'Total Gross Profit'}
                        </span>
                        <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600">
                            <FiTrendingUp className="w-4 h-4" />
                        </span>
                    </div>
                    <div className="text-lg sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
                        {formatCurrency(summary.totalProfit)}
                    </div>
                </div>

                <div className="bg-card border border-default p-4 rounded-2xl shadow-xs">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-secondary uppercase tracking-wider">
                            {isUrdu ? 'اوسط منافع فیصد' : 'Average Margin %'}
                        </span>
                        <span className="p-2 rounded-xl bg-purple-500/10 text-purple-600">
                            <FiPercent className="w-4 h-4" />
                        </span>
                    </div>
                    <div className="text-lg sm:text-2xl font-black text-purple-600 dark:text-purple-400 font-mono">
                        {summary.avgMarginPercent || 0}%
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-card border border-default rounded-2xl shadow-xs overflow-hidden">
                <div className="p-4 border-b border-default flex items-center justify-between">
                    <h2 className="text-sm font-bold text-main uppercase tracking-wider">
                        {isUrdu ? `بلوں کی فہرست (${bills.length})` : `Invoices List (${bills.length})`}
                    </h2>
                </div>

                {loading ? (
                    <div className="p-12 text-center text-secondary">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-indigo-600 border-t-transparent mb-2" />
                        <p className="text-xs font-medium">{isUrdu ? 'ڈیٹا لوڈ ہو رہا ہے...' : 'Loading invoice profits...'}</p>
                    </div>
                ) : bills.length === 0 ? (
                    <div className="p-12 text-center text-secondary">
                        <p className="text-sm font-semibold">{isUrdu ? 'کوئی بل نہیں ملا' : 'No bills found for the selected filter'}</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-xs">
                            <thead className="bg-table-header border-b border-default text-secondary uppercase font-semibold text-[11px]">
                                <tr>
                                    <th className="px-4 py-3 text-left rtl:text-right">{isUrdu ? 'انوائس #' : 'Invoice #'}</th>
                                    <th className="px-4 py-3 text-left rtl:text-right">{isUrdu ? 'تاریخ' : 'Date'}</th>
                                    <th className="px-4 py-3 text-left rtl:text-right">{isUrdu ? 'گاہک' : 'Customer'}</th>
                                    <th className="px-4 py-3 text-right rtl:text-left">{isUrdu ? 'سیلز رقم' : 'Sale (PKR)'}</th>
                                    <th className="px-4 py-3 text-right rtl:text-left">{isUrdu ? 'لاگت رقم' : 'Cost (PKR)'}</th>
                                    <th className="px-4 py-3 text-right rtl:text-left">{isUrdu ? 'منافع' : 'Profit (PKR)'}</th>
                                    <th className="px-4 py-3 text-right rtl:text-left">{isUrdu ? 'مارجن' : 'Margin %'}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-default">
                                {bills.map((b) => (
                                    <tr key={b.id} className="hover:bg-hover transition">
                                        <td className="px-4 py-3 font-mono font-bold text-main">
                                            {b.invoiceNo}
                                        </td>
                                        <td className="px-4 py-3 text-secondary font-medium whitespace-nowrap">
                                            {formatDate(b.date)}
                                        </td>
                                        <td className="px-4 py-3 font-semibold text-main">
                                            {b.customerName}
                                        </td>
                                        <td className="px-4 py-3 text-right rtl:text-left font-mono font-bold text-main">
                                            {formatCurrency(b.saleAmount)}
                                        </td>
                                        <td className="px-4 py-3 text-right rtl:text-left font-mono text-secondary">
                                            {formatCurrency(b.costAmount)}
                                        </td>
                                        <td className={`px-4 py-3 text-right rtl:text-left font-mono font-bold ${
                                            b.profitAmount >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600'
                                        }`}>
                                            {formatCurrency(b.profitAmount)}
                                        </td>
                                        <td className="px-4 py-3 text-right rtl:text-left">
                                            <span className={`px-2 py-0.5 rounded-md font-mono font-bold text-[11px] ${
                                                b.marginPercent >= 20
                                                    ? 'bg-emerald-500/10 text-emerald-600'
                                                    : b.marginPercent >= 10
                                                    ? 'bg-blue-500/10 text-blue-600'
                                                    : 'bg-amber-500/10 text-amber-600'
                                            }`}>
                                                {b.marginPercent}%
                                            </span>
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

export default BillWiseProfitReport;
