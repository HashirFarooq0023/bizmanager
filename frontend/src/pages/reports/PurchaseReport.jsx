import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useLanguage } from '../../contexts/LanguageContext';
import Layout from '../../components/Layout';
import ReportToolbar from './components/ReportToolbar';
import api from '../../services/api';
import { exportReportToPDF, exportReportToExcel, formatCurrency, formatDate } from '../../utils/reportExporter';
import { FiShoppingBag, FiDollarSign, FiClock, FiRotateCcw } from 'react-icons/fi';

const PurchaseReport = () => {
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
        fetchPurchaseReport();
    }, [dateFilter, customStartDate, customEndDate]);

    const fetchPurchaseReport = async () => {
        try {
            setLoading(true);
            const params = { dateFilter };
            if (dateFilter === 'custom' && customStartDate && customEndDate) {
                params.startDate = customStartDate;
                params.endDate = customEndDate;
            }
            const res = await api.get('/api/reports/purchase', { params });
            setData(res.data);
        } catch (err) {
            console.error('Failed to load purchase report:', err);
            toast.error(isUrdu ? 'خریداری رپورٹ لوڈ نہیں ہو سکی' : 'Failed to load Purchase Report');
        } finally {
            setLoading(false);
        }
    };

    const summary = data?.summary || {};
    const bills = data?.bills || [];

    const filteredBills = bills.filter((b) => {
        if (!searchTerm) return true;
        const q = searchTerm.toLowerCase();
        return (
            (b.billNumber || '').toLowerCase().includes(q) ||
            (b.supplierName || '').toLowerCase().includes(q)
        );
    });

    const columns = [
        { header: 'Bill #', accessor: 'billNumber' },
        { header: 'Supplier Name', accessor: 'supplierName' },
        { header: 'Bill Date', accessor: (row) => formatDate(row.billDate) },
        { header: 'Total Amount', accessor: (row) => formatCurrency(row.totalAmount) },
        { header: 'Paid Amount', accessor: (row) => formatCurrency(row.paidAmount) },
        { header: 'Outstanding', accessor: (row) => formatCurrency(row.outstandingAmount) },
        { header: 'Status', accessor: (row) => (row.paymentStatus || '').toUpperCase() },
    ];

    const summaryCards = [
        { label: 'Total Bills', value: String(summary.totalBills || 0) },
        { label: 'Total Purchases', value: formatCurrency(summary.totalPurchases) },
        { label: 'Total Paid', value: formatCurrency(summary.totalPaid) },
        { label: 'Outstanding Payables', value: formatCurrency(summary.totalOutstanding) },
    ];

    const handleExportPDF = () => {
        try {
            setIsExportingPDF(true);
            exportReportToPDF({
                title: 'Purchase Report / خریداری رپورٹ',
                dateRange: data?.dateRange,
                summaryCards,
                columns,
                data: filteredBills,
                fileName: 'purchase-report',
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
                title: 'Purchase Report',
                columns,
                data: filteredBills,
                summaryCards,
                fileName: 'purchase-report',
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
                title="Purchase & Vendor Bills Report"
                urduTitle="خریداری و سپلائر بلز رپورٹ"
                subtitle="Complete register of all inventory purchases, supplier bills, and unpaid payables"
                urduSubtitle="تمام اسٹاک خریداری، سپلائر کے بلز اور واجب الادا رقوم کا مکمل گوشوارہ"
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
                onRefresh={fetchPurchaseReport}
                isExportingPDF={isExportingPDF}
                isExportingExcel={isExportingExcel}
            />

            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-card border border-default p-4 rounded-2xl shadow-xs">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-secondary uppercase tracking-wider">
                            {isUrdu ? 'کل خریداری کا حجم' : 'Total Purchases'}
                        </span>
                        <span className="p-2 rounded-xl bg-blue-500/10 text-blue-600">
                            <FiShoppingBag className="w-4 h-4" />
                        </span>
                    </div>
                    <div className="text-lg sm:text-2xl font-black text-main font-mono">
                        {formatCurrency(summary.totalPurchases)}
                    </div>
                </div>

                <div className="bg-card border border-default p-4 rounded-2xl shadow-xs">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-secondary uppercase tracking-wider">
                            {isUrdu ? 'ادا شدہ رقم' : 'Total Paid'}
                        </span>
                        <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600">
                            <FiDollarSign className="w-4 h-4" />
                        </span>
                    </div>
                    <div className="text-lg sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
                        {formatCurrency(summary.totalPaid)}
                    </div>
                </div>

                <div className="bg-card border border-default p-4 rounded-2xl shadow-xs">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-secondary uppercase tracking-wider">
                            {isUrdu ? 'واجب الادا رقم (Payables)' : 'Outstanding Payables'}
                        </span>
                        <span className="p-2 rounded-xl bg-rose-500/10 text-rose-600">
                            <FiClock className="w-4 h-4" />
                        </span>
                    </div>
                    <div className="text-lg sm:text-2xl font-black text-rose-600 font-mono">
                        {formatCurrency(summary.totalOutstanding)}
                    </div>
                </div>

                <div className="bg-card border border-default p-4 rounded-2xl shadow-xs">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-secondary uppercase tracking-wider">
                            {isUrdu ? 'پرچیز واپسی' : 'Purchase Returns'}
                        </span>
                        <span className="p-2 rounded-xl bg-amber-500/10 text-amber-600">
                            <FiRotateCcw className="w-4 h-4" />
                        </span>
                    </div>
                    <div className="text-lg sm:text-2xl font-black text-amber-600 font-mono">
                        {formatCurrency(summary.totalReturns)}
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-card border border-default rounded-2xl shadow-xs overflow-hidden">
                <div className="p-4 border-b border-default flex items-center justify-between">
                    <h2 className="text-sm font-bold text-main uppercase tracking-wider">
                        {isUrdu ? `خریداری بلز (${filteredBills.length})` : `Purchase Bills Directory (${filteredBills.length})`}
                    </h2>
                </div>

                {loading ? (
                    <div className="p-12 text-center text-secondary">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-indigo-600 border-t-transparent mb-2" />
                        <p className="text-xs font-medium">{isUrdu ? 'خریداری بلز لوڈ ہو رہے ہیں...' : 'Loading purchase bills...'}</p>
                    </div>
                ) : filteredBills.length === 0 ? (
                    <div className="p-12 text-center text-secondary">
                        <p className="text-sm font-semibold">{isUrdu ? 'اس مدت میں کوئی خریداری بل نہیں ملا' : 'No purchase bills found for the selected period'}</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-xs">
                            <thead className="bg-table-header border-b border-default text-secondary uppercase font-semibold text-[11px]">
                                <tr>
                                    <th className="px-4 py-3 text-left rtl:text-right">{isUrdu ? 'بل نمبر' : 'Bill #'}</th>
                                    <th className="px-4 py-3 text-left rtl:text-right">{isUrdu ? 'سپلائر' : 'Supplier'}</th>
                                    <th className="px-4 py-3 text-left rtl:text-right">{isUrdu ? 'تاریخ' : 'Date'}</th>
                                    <th className="px-4 py-3 text-right rtl:text-left">{isUrdu ? 'کل رقم' : 'Total Amount'}</th>
                                    <th className="px-4 py-3 text-right rtl:text-left">{isUrdu ? 'ادا شدہ' : 'Paid'}</th>
                                    <th className="px-4 py-3 text-right rtl:text-left">{isUrdu ? 'بقایا' : 'Balance'}</th>
                                    <th className="px-4 py-3 text-center">{isUrdu ? 'حیثیت' : 'Status'}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-default">
                                {filteredBills.map((b) => (
                                    <tr key={b.id} className="hover:bg-hover transition">
                                        <td className="px-4 py-3 font-mono font-bold text-main">
                                            {b.billNumber}
                                        </td>
                                        <td className="px-4 py-3 font-semibold text-main">
                                            {b.supplierName}
                                        </td>
                                        <td className="px-4 py-3 text-secondary font-medium whitespace-nowrap">
                                            {formatDate(b.billDate)}
                                        </td>
                                        <td className="px-4 py-3 text-right rtl:text-left font-mono font-bold text-main">
                                            {formatCurrency(b.totalAmount)}
                                        </td>
                                        <td className="px-4 py-3 text-right rtl:text-left font-mono font-bold text-emerald-600">
                                            {formatCurrency(b.paidAmount)}
                                        </td>
                                        <td className="px-4 py-3 text-right rtl:text-left font-mono font-bold text-rose-600">
                                            {b.outstandingAmount > 0 ? formatCurrency(b.outstandingAmount) : '-'}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] uppercase ${
                                                b.paymentStatus === 'paid'
                                                    ? 'bg-emerald-500/10 text-emerald-600'
                                                    : b.paymentStatus === 'partial'
                                                    ? 'bg-amber-500/10 text-amber-600'
                                                    : 'bg-rose-500/10 text-rose-600'
                                            }`}>
                                                {b.paymentStatus}
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

export default PurchaseReport;
