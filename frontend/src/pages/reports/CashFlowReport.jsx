import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useLanguage } from '../../contexts/LanguageContext';
import Layout from '../../components/Layout';
import ReportToolbar from './components/ReportToolbar';
import api from '../../services/api';
import { exportReportToPDF, exportReportToExcel, formatCurrency } from '../../utils/reportExporter';
import { FiTrendingUp, FiTrendingDown, FiDollarSign } from 'react-icons/fi';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';

const CashFlowReport = () => {
    const { isUrdu } = useLanguage();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);
    const [dateFilter, setDateFilter] = useState('this_year');
    const [customStartDate, setCustomStartDate] = useState('');
    const [customEndDate, setCustomEndDate] = useState('');
    const [isExportingPDF, setIsExportingPDF] = useState(false);
    const [isExportingExcel, setIsExportingExcel] = useState(false);

    useEffect(() => {
        fetchCashFlow();
    }, [dateFilter, customStartDate, customEndDate]);

    const fetchCashFlow = async () => {
        try {
            setLoading(true);
            const params = { dateFilter };
            if (dateFilter === 'custom' && customStartDate && customEndDate) {
                params.startDate = customStartDate;
                params.endDate = customEndDate;
            }
            const res = await api.get('/api/reports/cashflow', { params });
            setData(res.data);
        } catch (err) {
            console.error('Failed to load cash flow:', err);
            toast.error(isUrdu ? 'کیش فلو رپورٹ لوڈ نہیں ہو سکی' : 'Failed to load Cash Flow Report');
        } finally {
            setLoading(false);
        }
    };

    const summary = data?.summary || {};
    const monthlyTrends = data?.monthlyTrends || [];

    const columns = [
        { header: 'Month / Period', accessor: 'month' },
        { header: 'Total Inflow (+)', accessor: (row) => formatCurrency(row.inflow) },
        { header: 'Total Outflow (-)', accessor: (row) => formatCurrency(row.outflow) },
        { header: 'Net Cash Flow', accessor: (row) => formatCurrency(row.net) },
    ];

    const summaryCards = [
        { label: 'Total Inflow', value: formatCurrency(summary.totalInflow) },
        { label: 'Total Outflow', value: formatCurrency(summary.totalOutflow) },
        { label: 'Net Cash Flow', value: formatCurrency(summary.netCashFlow) },
    ];

    const handleExportPDF = () => {
        try {
            setIsExportingPDF(true);
            exportReportToPDF({
                title: 'Cash Flow Statement / کیش فلو اسٹیٹمنٹ',
                dateRange: data?.dateRange,
                summaryCards,
                columns,
                data: monthlyTrends,
                fileName: 'cash-flow-report',
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
                title: 'Cash Flow',
                columns,
                data: monthlyTrends,
                summaryCards,
                fileName: 'cash-flow-report',
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
                title="Cash Flow Statement"
                urduTitle="کیش فلو گوشوارہ"
                subtitle="Track monthly cash and bank movements, incoming liquidity, expenses, and net surplus"
                urduSubtitle="ماہانہ نقد و بینک کی آمدنی، اخراجات اور کیش فلو کا رجحان"
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
                onRefresh={fetchCashFlow}
                isExportingPDF={isExportingPDF}
                isExportingExcel={isExportingExcel}
            />

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <div className="bg-card border border-default p-4 rounded-2xl shadow-xs">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-secondary uppercase tracking-wider">
                            {isUrdu ? 'کل کیش آمدنی (Inflows)' : 'Total Inflows (Cash In)'}
                        </span>
                        <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600">
                            <FiTrendingUp className="w-4 h-4" />
                        </span>
                    </div>
                    <div className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
                        {formatCurrency(summary.totalInflow)}
                    </div>
                </div>

                <div className="bg-card border border-default p-4 rounded-2xl shadow-xs">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-secondary uppercase tracking-wider">
                            {isUrdu ? 'کل کیش اخراجات (Outflows)' : 'Total Outflows (Cash Out)'}
                        </span>
                        <span className="p-2 rounded-xl bg-rose-500/10 text-rose-600">
                            <FiTrendingDown className="w-4 h-4" />
                        </span>
                    </div>
                    <div className="text-xl sm:text-2xl font-black text-rose-600 font-mono">
                        {formatCurrency(summary.totalOutflow)}
                    </div>
                </div>

                <div className="bg-card border border-default p-4 rounded-2xl shadow-xs">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-secondary uppercase tracking-wider">
                            {isUrdu ? 'خالص کیش سرپلس' : 'Net Cash Surplus'}
                        </span>
                        <span className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600">
                            <FiDollarSign className="w-4 h-4" />
                        </span>
                    </div>
                    <div className={`text-xl sm:text-2xl font-black font-mono ${(summary.netCashFlow || 0) >= 0 ? 'text-indigo-600 dark:text-indigo-400' : 'text-rose-600'}`}>
                        {formatCurrency(summary.netCashFlow)}
                    </div>
                </div>
            </div>

            {/* Visual Bar Chart */}
            {monthlyTrends.length > 0 && (
                <div className="bg-card border border-default rounded-2xl p-5 mb-6 shadow-xs">
                    <h3 className="text-sm font-bold text-main uppercase tracking-wider mb-4">
                        {isUrdu ? 'ماہانہ کیش فلو موازنہ' : 'Monthly Cash Flow Inflow vs Outflow'}
                    </h3>
                    <div className="h-64 sm:h-72 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={monthlyTrends}>
                                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                                <YAxis tick={{ fontSize: 11 }} />
                                <Tooltip
                                    formatter={(value) => formatCurrency(value)}
                                    contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                                />
                                <Legend wrapperStyle={{ fontSize: '12px' }} />
                                <Bar dataKey="inflow" name={isUrdu ? 'وصولیاں (Inflow)' : 'Inflow'} fill="#10b981" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="outflow" name={isUrdu ? 'ادائیگیاں (Outflow)' : 'Outflow'} fill="#f43f5e" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}

            {/* Table */}
            <div className="bg-card border border-default rounded-2xl shadow-xs overflow-hidden">
                <div className="p-4 border-b border-default flex items-center justify-between">
                    <h2 className="text-sm font-bold text-main uppercase tracking-wider">
                        {isUrdu ? 'ماہانہ تفصیل' : 'Monthly Cash Flow Breakdown'}
                    </h2>
                </div>

                {loading ? (
                    <div className="p-12 text-center text-secondary">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-indigo-600 border-t-transparent mb-2" />
                        <p className="text-xs font-medium">{isUrdu ? 'ڈیٹا لوڈ ہو رہا ہے...' : 'Loading cash movements...'}</p>
                    </div>
                ) : monthlyTrends.length === 0 ? (
                    <div className="p-12 text-center text-secondary">
                        <p className="text-sm font-semibold">{isUrdu ? 'کوئی کیش موومنٹ نہیں ملی' : 'No cash movements found for the selected period'}</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-xs">
                            <thead className="bg-table-header border-b border-default text-secondary uppercase font-semibold text-[11px]">
                                <tr>
                                    <th className="px-4 py-3 text-left rtl:text-right">{isUrdu ? 'ماہ / مدت' : 'Month / Period'}</th>
                                    <th className="px-4 py-3 text-right rtl:text-left">{isUrdu ? 'آمدنی (+)' : 'Inflow (+)'}</th>
                                    <th className="px-4 py-3 text-right rtl:text-left">{isUrdu ? 'اخراجات (-)' : 'Outflow (-)'}</th>
                                    <th className="px-4 py-3 text-right rtl:text-left">{isUrdu ? 'خالص کیش فلو' : 'Net Cash Flow'}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-default">
                                {monthlyTrends.map((row, idx) => (
                                    <tr key={idx} className="hover:bg-hover transition">
                                        <td className="px-4 py-3 text-main font-bold">
                                            {row.month}
                                        </td>
                                        <td className="px-4 py-3 text-right rtl:text-left font-mono font-bold text-emerald-600">
                                            {formatCurrency(row.inflow)}
                                        </td>
                                        <td className="px-4 py-3 text-right rtl:text-left font-mono font-bold text-rose-600">
                                            {formatCurrency(row.outflow)}
                                        </td>
                                        <td className={`px-4 py-3 text-right rtl:text-left font-mono font-black ${row.net >= 0 ? 'text-indigo-600 dark:text-indigo-400' : 'text-rose-600'}`}>
                                            {formatCurrency(row.net)}
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

export default CashFlowReport;
