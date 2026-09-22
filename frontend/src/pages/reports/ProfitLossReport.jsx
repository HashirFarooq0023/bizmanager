import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useLanguage } from '../../contexts/LanguageContext';
import Layout from '../../components/Layout';
import ReportToolbar from './components/ReportToolbar';
import api from '../../services/api';
import { exportReportToPDF, exportReportToExcel, formatCurrency } from '../../utils/reportExporter';
import { FiTrendingUp, FiTrendingDown, FiPercent, FiDollarSign, FiPieChart, FiShoppingBag } from 'react-icons/fi';

const ProfitLossReport = () => {
    const { isUrdu } = useLanguage();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);
    const [dateFilter, setDateFilter] = useState('this_month');
    const [customStartDate, setCustomStartDate] = useState('');
    const [customEndDate, setCustomEndDate] = useState('');
    const [isExportingPDF, setIsExportingPDF] = useState(false);
    const [isExportingExcel, setIsExportingExcel] = useState(false);

    useEffect(() => {
        fetchProfitLoss();
    }, [dateFilter, customStartDate, customEndDate]);

    const fetchProfitLoss = async () => {
        try {
            setLoading(true);
            const params = { dateFilter };
            if (dateFilter === 'custom' && customStartDate && customEndDate) {
                params.startDate = customStartDate;
                params.endDate = customEndDate;
            }
            const res = await api.get('/api/reports/profit-loss', { params });
            setData(res.data);
        } catch (err) {
            console.error('Failed to fetch P&L:', err);
            toast.error(isUrdu ? 'نفع و نقصان رپورٹ لوڈ نہیں ہو سکی' : 'Failed to load Profit & Loss Report');
        } finally {
            setLoading(false);
        }
    };

    const summary = data?.summary || {};
    const incomeList = data?.incomeBreakdown || [];
    const expenseList = data?.expenseBreakdown || [];

    const handleExportPDF = () => {
        try {
            setIsExportingPDF(true);
            const columns = [
                { header: 'Account / Particulars', accessor: 'label' },
                { header: 'Amount (PKR)', accessor: (row) => formatCurrency(row.amount) },
            ];

            const allRows = [
                ...incomeList,
                { label: 'COGS (Cost of Goods Sold)', amount: summary.totalCOGS },
                { label: 'GROSS PROFIT', amount: summary.grossProfit },
                ...expenseList.map(e => ({ label: `Operating Expense: ${e.category}`, amount: e.amount })),
                { label: 'TOTAL OPERATING EXPENSES', amount: summary.totalOperatingExpenses },
                { label: 'NET PROFIT', amount: summary.netProfit },
            ];

            const summaryCards = [
                { label: 'Net Sales', value: formatCurrency(summary.netSales) },
                { label: 'Gross Profit', value: formatCurrency(summary.grossProfit) },
                { label: 'Total Expenses', value: formatCurrency(summary.totalOperatingExpenses) },
                { label: 'Net Profit', value: formatCurrency(summary.netProfit) },
            ];

            exportReportToPDF({
                title: 'Profit & Loss Statement / نفع و نقصان گوشوارہ',
                dateRange: data?.dateRange,
                summaryCards,
                columns,
                data: allRows,
                fileName: 'profit-loss-statement',
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
            const columns = [
                { header: 'Particulars', accessor: 'label' },
                { header: 'Amount', accessor: 'amount' },
            ];

            const allRows = [
                ...incomeList,
                { label: 'Cost of Goods Sold (COGS)', amount: summary.totalCOGS },
                { label: 'Gross Profit', amount: summary.grossProfit },
                ...expenseList.map(e => ({ label: e.category, amount: e.amount })),
                { label: 'Operating Expenses', amount: summary.totalOperatingExpenses },
                { label: 'Net Profit', amount: summary.netProfit },
            ];

            exportReportToExcel({
                title: 'Profit & Loss',
                columns,
                data: allRows,
                fileName: 'profit-loss-statement',
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
                title="Profit & Loss Statement"
                urduTitle="نفع و نقصان گوشوارہ"
                subtitle="Complete financial statement showing revenue, cost of goods sold, operating expenses, and net profit"
                urduSubtitle="سیلز، خریداری لاگت، اخراجات اور خالص نفع کا مکمل مالیاتی جائزہ"
                dateFilter={dateFilter}
                onDateFilterChange={setDateFilter}
                customStartDate={customStartDate}
                customEndDate={customEndDate}
                onCustomDateChange={({ startDate, endDate }) => {
                    setCustomStartDate(startDate);
                    setCustomEndDate(endDate);
                }}
                onExportPDF={handleExportPDF}
                onExportExcel={handleExportExcel}
                onRefresh={fetchProfitLoss}
                isExportingPDF={isExportingPDF}
                isExportingExcel={isExportingExcel}
            />

            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-card border border-default p-4 rounded-2xl shadow-xs">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-secondary uppercase tracking-wider">
                            {isUrdu ? 'خالص سیلز ریونیو' : 'Net Sales Revenue'}
                        </span>
                        <span className="p-2 rounded-xl bg-blue-500/10 text-blue-600">
                            <FiShoppingBag className="w-4 h-4" />
                        </span>
                    </div>
                    <div className="text-lg sm:text-2xl font-black text-main font-mono">
                        {formatCurrency(summary.netSales)}
                    </div>
                </div>

                <div className="bg-card border border-default p-4 rounded-2xl shadow-xs">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-secondary uppercase tracking-wider">
                            {isUrdu ? 'خام نفع (Gross Profit)' : 'Gross Profit'}
                        </span>
                        <span className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600">
                            <FiTrendingUp className="w-4 h-4" />
                        </span>
                    </div>
                    <div className="text-lg sm:text-2xl font-black text-indigo-600 dark:text-indigo-400 font-mono">
                        {formatCurrency(summary.grossProfit)}
                    </div>
                    <span className="text-[11px] font-semibold text-secondary">
                        {summary.grossMarginPercent}% {isUrdu ? 'مارجن' : 'Margin'}
                    </span>
                </div>

                <div className="bg-card border border-default p-4 rounded-2xl shadow-xs">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-secondary uppercase tracking-wider">
                            {isUrdu ? 'کل آپریٹنگ اخراجات' : 'Operating Expenses'}
                        </span>
                        <span className="p-2 rounded-xl bg-rose-500/10 text-rose-600">
                            <FiTrendingDown className="w-4 h-4" />
                        </span>
                    </div>
                    <div className="text-lg sm:text-2xl font-black text-rose-600 font-mono">
                        {formatCurrency(summary.totalOperatingExpenses)}
                    </div>
                </div>

                <div className={`p-4 rounded-2xl border shadow-xs ${
                    summary.isProfitable
                        ? 'bg-emerald-500/10 border-emerald-500/30'
                        : 'bg-rose-500/10 border-rose-500/30'
                }`}>
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-secondary">
                            {isUrdu ? 'خالص نفع (Net Profit)' : 'Net Profit / Margin'}
                        </span>
                        <span className={`p-2 rounded-xl ${summary.isProfitable ? 'bg-emerald-500/20 text-emerald-600' : 'bg-rose-500/20 text-rose-600'}`}>
                            <FiPercent className="w-4 h-4" />
                        </span>
                    </div>
                    <div className={`text-lg sm:text-2xl font-black font-mono ${summary.isProfitable ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600'}`}>
                        {formatCurrency(summary.netProfit)}
                    </div>
                    <span className="text-[11px] font-bold">
                        {summary.netMarginPercent}% {isUrdu ? 'خالص مارجن' : 'Net Margin'}
                    </span>
                </div>
            </div>

            {/* Income & Expense Breakdown Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 1. Trading Account / Revenue & COGS */}
                <div className="bg-card border border-default rounded-2xl shadow-xs overflow-hidden">
                    <div className="p-4 bg-table-header border-b border-default flex items-center justify-between">
                        <h3 className="font-bold text-sm text-main uppercase tracking-wider flex items-center gap-2">
                            <FiShoppingBag className="text-blue-600" />
                            <span>{isUrdu ? 'آمدنی اور لاگت (Trading Account)' : 'Revenue & Cost of Goods Sold'}</span>
                        </h3>
                    </div>

                    <div className="p-4 space-y-3 text-xs">
                        {incomeList.map((item, idx) => (
                            <div key={idx} className={`flex items-center justify-between py-1.5 ${item.isTotal ? 'border-t border-default pt-2 font-bold text-main' : 'text-secondary'}`}>
                                <span>{item.label}</span>
                                <span className={`font-mono ${item.amount < 0 ? 'text-rose-600' : item.isTotal ? 'font-bold text-main' : ''}`}>
                                    {formatCurrency(item.amount)}
                                </span>
                            </div>
                        ))}

                        <div className="border-t border-default pt-3 mt-3">
                            <div className="flex items-center justify-between py-1.5 text-secondary">
                                <span>Less: Cost of Goods Sold (COGS)</span>
                                <span className="font-mono text-rose-600">- {formatCurrency(summary.totalCOGS)}</span>
                            </div>

                            <div className="flex items-center justify-between py-2.5 mt-2 bg-indigo-500/10 px-3 rounded-xl font-bold text-indigo-600 dark:text-indigo-400">
                                <span>Gross Profit / خام نفع</span>
                                <span className="font-mono text-sm">{formatCurrency(summary.grossProfit)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. Operating Expenses Breakdown */}
                <div className="bg-card border border-default rounded-2xl shadow-xs overflow-hidden">
                    <div className="p-4 bg-table-header border-b border-default flex items-center justify-between">
                        <h3 className="font-bold text-sm text-main uppercase tracking-wider flex items-center gap-2">
                            <FiTrendingDown className="text-rose-600" />
                            <span>{isUrdu ? 'آپریٹنگ اخراجات کی تفصیل' : 'Operating Expenses Breakdown'}</span>
                        </h3>
                        <span className="font-mono font-bold text-rose-600 text-xs">
                            {formatCurrency(summary.totalOperatingExpenses)}
                        </span>
                    </div>

                    <div className="p-4 space-y-2 text-xs">
                        {expenseList.length === 0 ? (
                            <p className="text-secondary text-center py-6">
                                {isUrdu ? 'اس مدت کے لیے کوئی اخراجات درج نہیں' : 'No operating expenses recorded in this period'}
                            </p>
                        ) : (
                            expenseList.map((exp, idx) => (
                                <div key={idx} className="flex items-center justify-between py-1.5 border-b border-dashed border-default">
                                    <span className="text-secondary font-medium">{exp.category}</span>
                                    <span className="font-mono font-semibold text-main">{formatCurrency(exp.amount)}</span>
                                </div>
                            ))
                        )}

                        <div className="pt-4 border-t border-default">
                            <div className={`flex items-center justify-between py-2.5 px-3 rounded-xl font-bold ${
                                summary.isProfitable
                                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                                    : 'bg-rose-500/10 text-rose-600'
                            }`}>
                                <span>{isUrdu ? 'خالص نفع / نقصان (Net Profit)' : 'Net Profit (Bottom Line)'}</span>
                                <span className="font-mono text-sm">{formatCurrency(summary.netProfit)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default ProfitLossReport;
