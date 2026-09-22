import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useLanguage } from '../../contexts/LanguageContext';
import Layout from '../../components/Layout';
import ReportToolbar from './components/ReportToolbar';
import api from '../../services/api';
import { exportReportToPDF, exportReportToExcel, formatCurrency, formatDate } from '../../utils/reportExporter';
import { FiUsers, FiTrendingUp, FiShoppingBag, FiDollarSign } from 'react-icons/fi';

const PartyWisePLReport = () => {
    const location = useLocation();
    const { isUrdu } = useLanguage();
    const [viewMode, setViewMode] = useState(location.pathname.includes('party-item') ? 'items' : 'pl');
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);
    const [dateFilter, setDateFilter] = useState('this_month');
    const [customStartDate, setCustomStartDate] = useState('');
    const [customEndDate, setCustomEndDate] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [isExportingPDF, setIsExportingPDF] = useState(false);
    const [isExportingExcel, setIsExportingExcel] = useState(false);

    useEffect(() => {
        fetchData();
    }, [viewMode, dateFilter, customStartDate, customEndDate]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const endpoint = viewMode === 'items' ? '/api/reports/party-item' : '/api/reports/party-pl';
            const params = { dateFilter };
            if (dateFilter === 'custom' && customStartDate && customEndDate) {
                params.startDate = customStartDate;
                params.endDate = customEndDate;
            }
            const res = await api.get(endpoint, { params });
            setData(res.data);
        } catch (err) {
            console.error('Failed to load Party PL/Item report:', err);
            toast.error(isUrdu ? 'رپورٹ لوڈ نہیں ہو سکی' : 'Failed to load report');
        } finally {
            setLoading(false);
        }
    };

    const summary = data?.summary || {};
    const parties = data?.parties || [];
    const items = data?.items || [];

    const filteredParties = parties.filter((p) => {
        if (!searchTerm) return true;
        const q = searchTerm.toLowerCase();
        return (p.name || '').toLowerCase().includes(q) || (p.phone || '').toLowerCase().includes(q);
    });

    const filteredItems = items.filter((i) => {
        if (!searchTerm) return true;
        const q = searchTerm.toLowerCase();
        return (i.partyName || '').toLowerCase().includes(q) || (i.itemName || '').toLowerCase().includes(q);
    });

    const handleExportPDF = () => {
        try {
            setIsExportingPDF(true);
            if (viewMode === 'pl') {
                const columns = [
                    { header: 'Customer / Party', accessor: 'name' },
                    { header: 'Phone', accessor: 'phone' },
                    { header: 'Bills', accessor: 'invoicesCount' },
                    { header: 'Revenue (PKR)', accessor: (row) => formatCurrency(row.totalRevenue) },
                    { header: 'Cost (PKR)', accessor: (row) => formatCurrency(row.totalCost) },
                    { header: 'Profit (PKR)', accessor: (row) => formatCurrency(row.totalProfit) },
                    { header: 'Margin %', accessor: (row) => `${row.marginPercent}%` },
                ];
                exportReportToPDF({
                    title: 'Party-wise Profit & Loss / پارٹی وار نفع و نقصان',
                    dateRange: data?.dateRange,
                    summaryCards: [
                        { label: 'Total Parties', value: String(summary.totalParties || 0) },
                        { label: 'Total Revenue', value: formatCurrency(summary.totalRevenue) },
                        { label: 'Total Profit', value: formatCurrency(summary.totalProfit) },
                        { label: 'Avg Margin %', value: `${summary.avgMarginPercent || 0}%` },
                    ],
                    columns,
                    data: filteredParties,
                    fileName: 'party-wise-profit-loss',
                    orientation: 'portrait',
                });
            } else {
                const columns = [
                    { header: 'Customer / Party', accessor: 'partyName' },
                    { header: 'Item Name', accessor: 'itemName' },
                    { header: 'Total Quantity', accessor: 'quantity' },
                    { header: 'Total Value', accessor: (row) => formatCurrency(row.totalAmount) },
                    { header: 'Last Purchase Date', accessor: (row) => formatDate(row.lastDate) },
                ];
                exportReportToPDF({
                    title: 'Party Report by Item / آئٹم کے حساب سے پارٹی رپورٹ',
                    dateRange: data?.dateRange,
                    summaryCards: [
                        { label: 'Total Records', value: String(summary.totalEntries || 0) },
                        { label: 'Total Qty Sold', value: String(summary.totalQuantity || 0) },
                        { label: 'Total Sales Value', value: formatCurrency(summary.totalAmount) },
                    ],
                    columns,
                    data: filteredItems,
                    fileName: 'party-report-by-item',
                    orientation: 'portrait',
                });
            }
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
            if (viewMode === 'pl') {
                const columns = [
                    { header: 'Customer', accessor: 'name' },
                    { header: 'Phone', accessor: 'phone' },
                    { header: 'Revenue', accessor: 'totalRevenue' },
                    { header: 'Cost', accessor: 'totalCost' },
                    { header: 'Profit', accessor: 'totalProfit' },
                    { header: 'Margin %', accessor: 'marginPercent' },
                ];
                exportReportToExcel({
                    title: 'Party PL',
                    columns,
                    data: filteredParties,
                    fileName: 'party-wise-profit-loss',
                });
            } else {
                const columns = [
                    { header: 'Customer', accessor: 'partyName' },
                    { header: 'Item Name', accessor: 'itemName' },
                    { header: 'Quantity', accessor: 'quantity' },
                    { header: 'Total Amount', accessor: 'totalAmount' },
                ];
                exportReportToExcel({
                    title: 'Party Items',
                    columns,
                    data: filteredItems,
                    fileName: 'party-report-by-item',
                });
            }
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
                title={viewMode === 'pl' ? 'Party-wise Profit & Loss Report' : 'Party Report by Item'}
                urduTitle={viewMode === 'pl' ? 'پارٹی کے حساب سے نفع و نقصان' : 'آئٹم کے حساب سے پارٹی رپورٹ'}
                subtitle="Evaluate profitability generated per customer and item-wise sales volume breakdown"
                urduSubtitle="کس گاہک سے کتنا نفع ملا اور کس گاہک نے کونسا سامان کتنی مقدار میں خریدا"
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
                onRefresh={fetchData}
                isExportingPDF={isExportingPDF}
                isExportingExcel={isExportingExcel}
                extraFilters={
                    <div className="flex gap-2 pt-2">
                        <button
                            type="button"
                            onClick={() => setViewMode('pl')}
                            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                                viewMode === 'pl'
                                    ? 'bg-indigo-600 text-white shadow-xs'
                                    : 'bg-input text-secondary hover:text-main border border-default'
                            }`}
                        >
                            {isUrdu ? 'پارٹی وار منافع (P&L)' : 'Party Profit & Loss'}
                        </button>
                        <button
                            type="button"
                            onClick={() => setViewMode('items')}
                            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                                viewMode === 'items'
                                    ? 'bg-indigo-600 text-white shadow-xs'
                                    : 'bg-input text-secondary hover:text-main border border-default'
                            }`}
                        >
                            {isUrdu ? 'آئٹم کے حساب سے (Party by Item)' : 'Party Report by Item'}
                        </button>
                    </div>
                }
            />

            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-card border border-default p-4 rounded-2xl shadow-xs">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-secondary uppercase tracking-wider">
                            {isUrdu ? 'کل پارٹیز' : 'Total Parties'}
                        </span>
                        <span className="p-2 rounded-xl bg-blue-500/10 text-blue-600">
                            <FiUsers className="w-4 h-4" />
                        </span>
                    </div>
                    <div className="text-lg sm:text-2xl font-black text-main font-mono">
                        {summary.totalParties || summary.totalEntries || 0}
                    </div>
                </div>

                <div className="bg-card border border-default p-4 rounded-2xl shadow-xs">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-secondary uppercase tracking-wider">
                            {isUrdu ? 'کل ریونیو' : 'Total Revenue'}
                        </span>
                        <span className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600">
                            <FiShoppingBag className="w-4 h-4" />
                        </span>
                    </div>
                    <div className="text-lg sm:text-2xl font-black text-main font-mono">
                        {formatCurrency(summary.totalRevenue || summary.totalAmount)}
                    </div>
                </div>

                {viewMode === 'pl' ? (
                    <>
                        <div className="bg-card border border-default p-4 rounded-2xl shadow-xs">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-bold text-secondary uppercase tracking-wider">
                                    {isUrdu ? 'کل نفع' : 'Total Profit'}
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
                                    {isUrdu ? 'اوسط مارجن فیصد' : 'Average Margin'}
                                </span>
                                <span className="p-2 rounded-xl bg-purple-500/10 text-purple-600">
                                    <FiDollarSign className="w-4 h-4" />
                                </span>
                            </div>
                            <div className="text-lg sm:text-2xl font-black text-purple-600 dark:text-purple-400 font-mono">
                                {summary.avgMarginPercent || 0}%
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="bg-card border border-default p-4 rounded-2xl shadow-xs col-span-2">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-bold text-secondary uppercase tracking-wider">
                                {isUrdu ? 'کل فروخت شدہ آئٹم مقدار' : 'Total Sold Units'}
                            </span>
                            <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600">
                                <FiShoppingBag className="w-4 h-4" />
                            </span>
                        </div>
                        <div className="text-lg sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
                            {summary.totalQuantity || 0} Units
                        </div>
                    </div>
                )}
            </div>

            {/* Table */}
            <div className="bg-card border border-default rounded-2xl shadow-xs overflow-hidden">
                <div className="p-4 border-b border-default flex items-center justify-between">
                    <h2 className="text-sm font-bold text-main uppercase tracking-wider">
                        {viewMode === 'pl' ? `Party-wise Profit & Loss (${filteredParties.length})` : `Items Purchased by Party (${filteredItems.length})`}
                    </h2>
                </div>

                {loading ? (
                    <div className="p-12 text-center text-secondary">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-indigo-600 border-t-transparent mb-2" />
                        <p className="text-xs font-medium">{isUrdu ? 'ڈیٹا لوڈ ہو رہا ہے...' : 'Loading report data...'}</p>
                    </div>
                ) : (viewMode === 'pl' ? filteredParties.length === 0 : filteredItems.length === 0) ? (
                    <div className="p-12 text-center text-secondary">
                        <p className="text-sm font-semibold">{isUrdu ? 'کوئی ریکارڈ نہیں ملا' : 'No records found for the selected filter'}</p>
                    </div>
                ) : viewMode === 'pl' ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-xs">
                            <thead className="bg-table-header border-b border-default text-secondary uppercase font-semibold text-[11px]">
                                <tr>
                                    <th className="px-4 py-3 text-left rtl:text-right">{isUrdu ? 'گاہک' : 'Customer'}</th>
                                    <th className="px-4 py-3 text-left rtl:text-right">{isUrdu ? 'فون' : 'Phone'}</th>
                                    <th className="px-4 py-3 text-center">{isUrdu ? 'بلز' : 'Invoices'}</th>
                                    <th className="px-4 py-3 text-right rtl:text-left">{isUrdu ? 'کل سیلز' : 'Total Revenue'}</th>
                                    <th className="px-4 py-3 text-right rtl:text-left">{isUrdu ? 'خریداری لاگت' : 'Cost'}</th>
                                    <th className="px-4 py-3 text-right rtl:text-left">{isUrdu ? 'خالص نفع' : 'Profit (PKR)'}</th>
                                    <th className="px-4 py-3 text-right rtl:text-left">{isUrdu ? 'مارجن' : 'Margin %'}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-default">
                                {filteredParties.map((p, idx) => (
                                    <tr key={idx} className="hover:bg-hover transition">
                                        <td className="px-4 py-3 font-bold text-main">
                                            {p.name}
                                        </td>
                                        <td className="px-4 py-3 text-secondary font-mono">
                                            {p.phone || '-'}
                                        </td>
                                        <td className="px-4 py-3 text-center font-bold text-main">
                                            {p.invoicesCount}
                                        </td>
                                        <td className="px-4 py-3 text-right rtl:text-left font-mono font-bold text-main">
                                            {formatCurrency(p.totalRevenue)}
                                        </td>
                                        <td className="px-4 py-3 text-right rtl:text-left font-mono text-secondary">
                                            {formatCurrency(p.totalCost)}
                                        </td>
                                        <td className={`px-4 py-3 text-right rtl:text-left font-mono font-bold ${
                                            p.totalProfit >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600'
                                        }`}>
                                            {formatCurrency(p.totalProfit)}
                                        </td>
                                        <td className="px-4 py-3 text-right rtl:text-left">
                                            <span className={`px-2 py-0.5 rounded-md font-mono font-bold text-[11px] ${
                                                p.marginPercent >= 20
                                                    ? 'bg-emerald-500/10 text-emerald-600'
                                                    : p.marginPercent >= 10
                                                    ? 'bg-blue-500/10 text-blue-600'
                                                    : 'bg-amber-500/10 text-amber-600'
                                            }`}>
                                                {p.marginPercent}%
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-xs">
                            <thead className="bg-table-header border-b border-default text-secondary uppercase font-semibold text-[11px]">
                                <tr>
                                    <th className="px-4 py-3 text-left rtl:text-right">{isUrdu ? 'گاہک کا نام' : 'Customer Name'}</th>
                                    <th className="px-4 py-3 text-left rtl:text-right">{isUrdu ? 'آئٹم کا نام' : 'Item Name'}</th>
                                    <th className="px-4 py-3 text-center">{isUrdu ? 'کل مقدار' : 'Total Quantity'}</th>
                                    <th className="px-4 py-3 text-right rtl:text-left">{isUrdu ? 'کل رقم' : 'Total Amount'}</th>
                                    <th className="px-4 py-3 text-right rtl:text-left">{isUrdu ? 'آخری خریداری' : 'Last Date'}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-default">
                                {filteredItems.map((it, idx) => (
                                    <tr key={idx} className="hover:bg-hover transition">
                                        <td className="px-4 py-3 font-bold text-main">
                                            {it.partyName}
                                        </td>
                                        <td className="px-4 py-3 font-semibold text-main">
                                            {it.itemName}
                                        </td>
                                        <td className="px-4 py-3 text-center font-mono font-bold text-indigo-600">
                                            {it.quantity}
                                        </td>
                                        <td className="px-4 py-3 text-right rtl:text-left font-mono font-bold text-main">
                                            {formatCurrency(it.totalAmount)}
                                        </td>
                                        <td className="px-4 py-3 text-right rtl:text-left text-secondary whitespace-nowrap">
                                            {formatDate(it.lastDate)}
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

export default PartyWisePLReport;
