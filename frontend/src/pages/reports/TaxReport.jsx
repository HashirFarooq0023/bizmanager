import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useLanguage } from '../../contexts/LanguageContext';
import Layout from '../../components/Layout';
import ReportToolbar from './components/ReportToolbar';
import api from '../../services/api';
import { exportReportToPDF, exportReportToExcel, formatCurrency, formatDate } from '../../utils/reportExporter';
import { FiFileText, FiDollarSign, FiCheckSquare } from 'react-icons/fi';

const TaxReport = () => {
    const location = useLocation();
    const { isUrdu } = useLanguage();
    
    // Determine tax report type from URL (gstr1, gstr2, gstr3b, gstr9)
    const getInitialType = () => {
        if (location.pathname.includes('gstr2')) return 'gstr2';
        if (location.pathname.includes('gstr3b')) return 'gstr3b';
        if (location.pathname.includes('gstr9')) return 'gstr9';
        return 'gstr1';
    };

    const [taxType, setTaxType] = useState(getInitialType());
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);
    const [dateFilter, setDateFilter] = useState('this_month');
    const [customStartDate, setCustomStartDate] = useState('');
    const [customEndDate, setCustomEndDate] = useState('');
    const [isExportingPDF, setIsExportingPDF] = useState(false);
    const [isExportingExcel, setIsExportingExcel] = useState(false);

    useEffect(() => {
        fetchTaxReport();
    }, [taxType, dateFilter, customStartDate, customEndDate]);

    const fetchTaxReport = async () => {
        try {
            setLoading(true);
            const params = { taxType, dateFilter };
            if (dateFilter === 'custom' && customStartDate && customEndDate) {
                params.startDate = customStartDate;
                params.endDate = customEndDate;
            }
            const res = await api.get('/api/reports/gst', { params });
            setData(res.data);
        } catch (err) {
            console.error('Failed to load Tax report:', err);
            toast.error(isUrdu ? 'ٹیکس رپورٹ لوڈ نہیں ہو سکی' : 'Failed to load GST Tax Report');
        } finally {
            setLoading(false);
        }
    };

    const summary = data?.summary || {};
    const b2bInvoices = data?.b2bInvoices || [];
    const b2cInvoices = data?.b2cInvoices || [];
    const activeInvoices = [...b2bInvoices, ...b2cInvoices];

    const columns = [
        { header: 'Invoice #', accessor: 'invoiceNo' },
        { header: 'Date', accessor: (row) => formatDate(row.date) },
        { header: 'Customer / Party', accessor: 'partyName' },
        { header: 'GSTIN', accessor: 'gstNumber' },
        { header: 'Taxable Value', accessor: (row) => formatCurrency(row.taxableValue) },
        { header: 'Tax Amount', accessor: (row) => formatCurrency(row.taxAmount) },
        { header: 'Total Value', accessor: (row) => formatCurrency(row.totalAmount) },
    ];

    const summaryCards = [
        { label: 'Taxable Sales', value: formatCurrency(summary.totalTaxableSales) },
        { label: 'Total Output Tax', value: formatCurrency(summary.totalTaxCollected) },
        { label: 'Input Tax Credit (ITC)', value: formatCurrency(summary.totalITC) },
        { label: 'Net Tax Payable', value: formatCurrency(summary.netTaxPayable) },
    ];

    const handleExportPDF = () => {
        try {
            setIsExportingPDF(true);
            exportReportToPDF({
                title: `GST & Tax Report (${taxType.toUpperCase()}) / ٹیکس رپورٹ`,
                dateRange: data?.dateRange,
                summaryCards,
                columns,
                data: activeInvoices,
                fileName: `gst-${taxType}-report`,
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
                title: `GST ${taxType.toUpperCase()}`,
                columns,
                data: activeInvoices,
                summaryCards,
                fileName: `gst-${taxType}-report`,
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
                title={`GST & Tax Return Summary (${taxType.toUpperCase()})`}
                urduTitle="سیلز ٹیکس و گوشوارہ رپورٹ"
                subtitle="Detailed tax analysis of outward supplies, input tax credits, and net government dues"
                urduSubtitle="سیلز ٹیکس کی وصولی، خریداری ٹیکس کٹوتی اور حکومتی واجب الادا ٹیکس کا خلاصہ"
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
                onRefresh={fetchTaxReport}
                isExportingPDF={isExportingPDF}
                isExportingExcel={isExportingExcel}
                extraFilters={
                    <div className="flex flex-wrap gap-2 pt-2">
                        {[
                            { label: 'GSTR-1 (Outward Sales)', value: 'gstr1' },
                            { label: 'GSTR-2 (Inward Purchases / ITC)', value: 'gstr2' },
                            { label: 'GSTR-3B (Monthly Summary)', value: 'gstr3b' },
                            { label: 'GSTR-9 (Annual Return)', value: 'gstr9' },
                        ].map((tab) => (
                            <button
                                key={tab.value}
                                type="button"
                                onClick={() => setTaxType(tab.value)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                                    taxType === tab.value
                                        ? 'bg-purple-600 text-white shadow-xs'
                                        : 'bg-input text-secondary hover:text-main border border-default'
                                }`}
                            >
                                {tab.label}
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
                            {isUrdu ? 'ٹیکس ایبل سیلز' : 'Taxable Sales Value'}
                        </span>
                        <span className="p-2 rounded-xl bg-blue-500/10 text-blue-600">
                            <FiFileText className="w-4 h-4" />
                        </span>
                    </div>
                    <div className="text-lg sm:text-2xl font-black text-main font-mono">
                        {formatCurrency(summary.totalTaxableSales)}
                    </div>
                </div>

                <div className="bg-card border border-default p-4 rounded-2xl shadow-xs">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-secondary uppercase tracking-wider">
                            {isUrdu ? 'وصول شدہ آؤٹ پٹ ٹیکس' : 'Output Tax Collected'}
                        </span>
                        <span className="p-2 rounded-xl bg-purple-500/10 text-purple-600">
                            <FiDollarSign className="w-4 h-4" />
                        </span>
                    </div>
                    <div className="text-lg sm:text-2xl font-black text-purple-600 dark:text-purple-400 font-mono">
                        {formatCurrency(summary.totalTaxCollected)}
                    </div>
                </div>

                <div className="bg-card border border-default p-4 rounded-2xl shadow-xs">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-secondary uppercase tracking-wider">
                            {isUrdu ? 'ان پٹ ٹیکس کریڈٹ (ITC)' : 'Input Tax Credit (ITC)'}
                        </span>
                        <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600">
                            <FiCheckSquare className="w-4 h-4" />
                        </span>
                    </div>
                    <div className="text-lg sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
                        {formatCurrency(summary.totalITC)}
                    </div>
                </div>

                <div className="bg-card border border-default p-4 rounded-2xl shadow-xs">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-secondary uppercase tracking-wider">
                            {isUrdu ? 'خالص واجب الادا ٹیکس' : 'Net Tax Liability'}
                        </span>
                        <span className="p-2 rounded-xl bg-rose-500/10 text-rose-600">
                            <FiDollarSign className="w-4 h-4" />
                        </span>
                    </div>
                    <div className="text-lg sm:text-2xl font-black text-rose-600 font-mono">
                        {formatCurrency(summary.netTaxPayable)}
                    </div>
                </div>
            </div>

            {/* Invoices Table */}
            <div className="bg-card border border-default rounded-2xl shadow-xs overflow-hidden">
                <div className="p-4 border-b border-default flex items-center justify-between">
                    <h2 className="text-sm font-bold text-main uppercase tracking-wider">
                        {isUrdu ? `ٹیکس انوائسز (${activeInvoices.length})` : `Tax Invoices Breakdown (${activeInvoices.length})`}
                    </h2>
                </div>

                {loading ? (
                    <div className="p-12 text-center text-secondary">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-indigo-600 border-t-transparent mb-2" />
                        <p className="text-xs font-medium">{isUrdu ? 'ٹیکس ڈیٹا لوڈ ہو رہا ہے...' : 'Loading tax data...'}</p>
                    </div>
                ) : activeInvoices.length === 0 ? (
                    <div className="p-12 text-center text-secondary">
                        <p className="text-sm font-semibold">{isUrdu ? 'کوئی ٹیکس انوائس نہیں ملی' : 'No tax invoices found for the selected period'}</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-xs">
                            <thead className="bg-table-header border-b border-default text-secondary uppercase font-semibold text-[11px]">
                                <tr>
                                    <th className="px-4 py-3 text-left rtl:text-right">{isUrdu ? 'انوائس #' : 'Invoice #'}</th>
                                    <th className="px-4 py-3 text-left rtl:text-right">{isUrdu ? 'تاریخ' : 'Date'}</th>
                                    <th className="px-4 py-3 text-left rtl:text-right">{isUrdu ? 'گاہک' : 'Customer'}</th>
                                    <th className="px-4 py-3 text-left rtl:text-right">GSTIN</th>
                                    <th className="px-4 py-3 text-right rtl:text-left">{isUrdu ? 'ٹیکس ایبل رقم' : 'Taxable Value'}</th>
                                    <th className="px-4 py-3 text-right rtl:text-left">{isUrdu ? 'ٹیکس رقم' : 'Tax (PKR)'}</th>
                                    <th className="px-4 py-3 text-right rtl:text-left">{isUrdu ? 'کل رقم' : 'Total Amount'}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-default">
                                {activeInvoices.map((inv, idx) => (
                                    <tr key={idx} className="hover:bg-hover transition">
                                        <td className="px-4 py-3 font-mono font-bold text-main">
                                            {inv.invoiceNo}
                                        </td>
                                        <td className="px-4 py-3 text-secondary font-medium whitespace-nowrap">
                                            {formatDate(inv.date)}
                                        </td>
                                        <td className="px-4 py-3 font-semibold text-main">
                                            {inv.partyName}
                                        </td>
                                        <td className="px-4 py-3 font-mono text-secondary">
                                            {inv.gstNumber}
                                        </td>
                                        <td className="px-4 py-3 text-right rtl:text-left font-mono font-bold text-main">
                                            {formatCurrency(inv.taxableValue)}
                                        </td>
                                        <td className="px-4 py-3 text-right rtl:text-left font-mono font-bold text-purple-600">
                                            {formatCurrency(inv.taxAmount)}
                                        </td>
                                        <td className="px-4 py-3 text-right rtl:text-left font-mono font-black text-main">
                                            {formatCurrency(inv.totalAmount)}
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

export default TaxReport;
