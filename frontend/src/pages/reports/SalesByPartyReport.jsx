import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useLanguage } from '../../contexts/LanguageContext';
import Layout from '../../components/Layout';
import ReportToolbar from './components/ReportToolbar';
import api from '../../services/api';
import { exportReportToPDF, exportReportToExcel, formatCurrency } from '../../utils/reportExporter';
import { FiUsers, FiShoppingBag, FiDollarSign, FiClock } from 'react-icons/fi';

const SalesByPartyReport = () => {
    const navigate = useNavigate();
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
        fetchSalesByParty();
    }, [dateFilter, customStartDate, customEndDate]);

    const fetchSalesByParty = async () => {
        try {
            setLoading(true);
            const params = { dateFilter };
            if (dateFilter === 'custom' && customStartDate && customEndDate) {
                params.startDate = customStartDate;
                params.endDate = customEndDate;
            }
            const res = await api.get('/api/reports/sales-party', { params });
            setData(res.data);
        } catch (err) {
            console.error('Failed to load sales by party:', err);
            toast.error(isUrdu ? 'پارٹی وار سیلز ڈیٹا لوڈ نہیں ہوا' : 'Failed to load Sales by Party Report');
        } finally {
            setLoading(false);
        }
    };

    const summary = data?.summary || {};
    const parties = data?.parties || [];

    const filteredParties = parties.filter((p) => {
        if (!searchTerm) return true;
        const q = searchTerm.toLowerCase();
        return (p.name || '').toLowerCase().includes(q) || (p.phone || '').toLowerCase().includes(q);
    });

    const columns = [
        { header: 'Customer / Party', accessor: 'name' },
        { header: 'Phone', accessor: 'phone' },
        { header: 'Bills Count', accessor: 'invoiceCount' },
        { header: 'Total Sales', accessor: (row) => formatCurrency(row.totalSales) },
        { header: 'Paid Amount', accessor: (row) => formatCurrency(row.paidAmount) },
        { header: 'Outstanding Dues', accessor: (row) => formatCurrency(row.dueAmount) },
    ];

    const summaryCards = [
        { label: 'Total Parties', value: String(summary.totalParties || 0) },
        { label: 'Total Sales Volume', value: formatCurrency(summary.totalSalesVolume) },
        { label: 'Total Collected', value: formatCurrency(summary.totalCollected) },
        { label: 'Total Outstanding', value: formatCurrency(summary.totalOutstanding) },
    ];

    const handleExportPDF = () => {
        try {
            setIsExportingPDF(true);
            exportReportToPDF({
                title: 'Sales by Party Report / گاہک کے حساب سے سیلز رپورٹ',
                dateRange: data?.dateRange,
                summaryCards,
                columns,
                data: filteredParties,
                fileName: 'sales-by-party-report',
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
                title: 'Sales by Party',
                columns,
                data: filteredParties,
                summaryCards,
                fileName: 'sales-by-party-report',
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
                title="Sales by Party Report"
                urduTitle="گاہک کے حساب سے سیلز رپورٹ"
                subtitle="Analyze total sales volume, payments collected, and outstanding balances per customer"
                urduSubtitle="کس گاہک کو کتنی سیلز ہوئیں، کتنی رقم وصول ہوئی اور کتنا ادھار باقی ہے"
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
                onRefresh={fetchSalesByParty}
                isExportingPDF={isExportingPDF}
                isExportingExcel={isExportingExcel}
            />

            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-card border border-default p-4 rounded-2xl shadow-xs">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-secondary uppercase tracking-wider">
                            {isUrdu ? 'گاہکوں کی تعداد' : 'Active Customers'}
                        </span>
                        <span className="p-2 rounded-xl bg-blue-500/10 text-blue-600">
                            <FiUsers className="w-4 h-4" />
                        </span>
                    </div>
                    <div className="text-lg sm:text-2xl font-black text-main font-mono">
                        {summary.totalParties || 0}
                    </div>
                </div>

                <div className="bg-card border border-default p-4 rounded-2xl shadow-xs">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-secondary uppercase tracking-wider">
                            {isUrdu ? 'کل سیلز کا حجم' : 'Total Sales'}
                        </span>
                        <span className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600">
                            <FiShoppingBag className="w-4 h-4" />
                        </span>
                    </div>
                    <div className="text-lg sm:text-2xl font-black text-main font-mono">
                        {formatCurrency(summary.totalSalesVolume)}
                    </div>
                </div>

                <div className="bg-card border border-default p-4 rounded-2xl shadow-xs">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-secondary uppercase tracking-wider">
                            {isUrdu ? 'وصول شدہ رقم' : 'Collected Amount'}
                        </span>
                        <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600">
                            <FiDollarSign className="w-4 h-4" />
                        </span>
                    </div>
                    <div className="text-lg sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
                        {formatCurrency(summary.totalCollected)}
                    </div>
                </div>

                <div className="bg-card border border-default p-4 rounded-2xl shadow-xs">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-secondary uppercase tracking-wider">
                            {isUrdu ? 'بقایا ادھار' : 'Outstanding Dues'}
                        </span>
                        <span className="p-2 rounded-xl bg-rose-500/10 text-rose-600">
                            <FiClock className="w-4 h-4" />
                        </span>
                    </div>
                    <div className="text-lg sm:text-2xl font-black text-rose-600 font-mono">
                        {formatCurrency(summary.totalOutstanding)}
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-card border border-default rounded-2xl shadow-xs overflow-hidden">
                <div className="p-4 border-b border-default flex items-center justify-between">
                    <h2 className="text-sm font-bold text-main uppercase tracking-wider">
                        {isUrdu ? `گاہکوں کی فہرست (${filteredParties.length})` : `Customer Sales Directory (${filteredParties.length})`}
                    </h2>
                </div>

                {loading ? (
                    <div className="p-12 text-center text-secondary">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-indigo-600 border-t-transparent mb-2" />
                        <p className="text-xs font-medium">{isUrdu ? 'ڈیٹا لوڈ ہو رہا ہے...' : 'Loading sales summary...'}</p>
                    </div>
                ) : filteredParties.length === 0 ? (
                    <div className="p-12 text-center text-secondary">
                        <p className="text-sm font-semibold">{isUrdu ? 'کوئی سیلز نہیں ملیں' : 'No sales records found for the selected period'}</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-xs">
                            <thead className="bg-table-header border-b border-default text-secondary uppercase font-semibold text-[11px]">
                                <tr>
                                    <th className="px-4 py-3 text-left rtl:text-right">{isUrdu ? 'گاہک کا نام' : 'Customer Name'}</th>
                                    <th className="px-4 py-3 text-left rtl:text-right">{isUrdu ? 'فون' : 'Phone'}</th>
                                    <th className="px-4 py-3 text-center">{isUrdu ? 'بلوں کی تعداد' : 'Invoices'}</th>
                                    <th className="px-4 py-3 text-right rtl:text-left">{isUrdu ? 'کل سیلز' : 'Total Sales'}</th>
                                    <th className="px-4 py-3 text-right rtl:text-left">{isUrdu ? 'ادا شدہ' : 'Paid'}</th>
                                    <th className="px-4 py-3 text-right rtl:text-left">{isUrdu ? 'بقایا ادھار' : 'Outstanding'}</th>
                                    <th className="px-4 py-3 text-center">{isUrdu ? 'کھاتہ' : 'Ledger'}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-default">
                                {filteredParties.map((p) => (
                                    <tr key={p.id} className="hover:bg-hover transition">
                                        <td className="px-4 py-3 font-bold text-main">
                                            {p.name}
                                        </td>
                                        <td className="px-4 py-3 text-secondary font-mono">
                                            {p.phone || '-'}
                                        </td>
                                        <td className="px-4 py-3 text-center font-bold text-main">
                                            {p.invoiceCount}
                                        </td>
                                        <td className="px-4 py-3 text-right rtl:text-left font-mono font-bold text-main">
                                            {formatCurrency(p.totalSales)}
                                        </td>
                                        <td className="px-4 py-3 text-right rtl:text-left font-mono font-bold text-emerald-600">
                                            {formatCurrency(p.paidAmount)}
                                        </td>
                                        <td className="px-4 py-3 text-right rtl:text-left font-mono font-bold text-rose-600">
                                            {p.dueAmount > 0 ? formatCurrency(p.dueAmount) : '-'}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            {p.id !== 'walk-in' && (
                                                <button
                                                    type="button"
                                                    onClick={() => navigate(`/reports/party-statement?partyId=${p.id}&partyType=customer`)}
                                                    className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-600 transition cursor-pointer"
                                                >
                                                    {isUrdu ? 'کھاتہ دیکھیں' : 'View Ledger'}
                                                </button>
                                            )}
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

export default SalesByPartyReport;
