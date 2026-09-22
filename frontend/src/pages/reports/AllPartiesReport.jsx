import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useLanguage } from '../../contexts/LanguageContext';
import Layout from '../../components/Layout';
import ReportToolbar from './components/ReportToolbar';
import api from '../../services/api';
import { exportReportToPDF, exportReportToExcel, formatCurrency } from '../../utils/reportExporter';
import { FiUsers, FiUserCheck, FiTrendingUp, FiTrendingDown, FiDollarSign } from 'react-icons/fi';

const AllPartiesReport = () => {
    const navigate = useNavigate();
    const { isUrdu } = useLanguage();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState('all'); // 'all' | 'customer' | 'supplier' | 'dues_only'
    const [isExportingPDF, setIsExportingPDF] = useState(false);
    const [isExportingExcel, setIsExportingExcel] = useState(false);

    useEffect(() => {
        fetchAllParties();
    }, []);

    const fetchAllParties = async () => {
        try {
            setLoading(true);
            const res = await api.get('/api/reports/all-parties');
            setData(res.data);
        } catch (err) {
            console.error('Failed to load all parties:', err);
            toast.error(isUrdu ? 'پارٹیوں کا ڈیٹا لوڈ نہیں ہوا' : 'Failed to load All Parties Report');
        } finally {
            setLoading(false);
        }
    };

    const summary = data?.summary || {};
    const parties = data?.parties || [];

    const filteredParties = parties.filter((p) => {
        if (typeFilter === 'customer' && p.type !== 'Customer') return false;
        if (typeFilter === 'supplier' && p.type !== 'Supplier') return false;
        if (typeFilter === 'dues_only' && (p.receivable === 0 && p.payable === 0)) return false;

        if (!searchTerm) return true;
        const q = searchTerm.toLowerCase();
        return (
            (p.name || '').toLowerCase().includes(q) ||
            (p.phone || '').toLowerCase().includes(q) ||
            (p.city || '').toLowerCase().includes(q)
        );
    });

    const columns = [
        { header: 'Party Name', accessor: 'name' },
        { header: 'Type', accessor: 'type' },
        { header: 'Phone', accessor: 'phone' },
        { header: 'City', accessor: 'city' },
        { header: 'Receivable (To Get)', accessor: (row) => row.receivable > 0 ? formatCurrency(row.receivable) : '-' },
        { header: 'Payable (To Pay)', accessor: (row) => row.payable > 0 ? formatCurrency(row.payable) : '-' },
        { header: 'Total Transactions', accessor: 'totalTransactions' },
    ];

    const summaryCards = [
        { label: 'Total Customers', value: String(summary.totalCustomers || 0) },
        { label: 'Total Suppliers', value: String(summary.totalSuppliers || 0) },
        { label: 'Total Receivables', value: formatCurrency(summary.totalReceivables) },
        { label: 'Total Payables', value: formatCurrency(summary.totalPayables) },
    ];

    const handleExportPDF = () => {
        try {
            setIsExportingPDF(true);
            exportReportToPDF({
                title: 'All Parties Balance Report / تمام پارٹیز بیلنس رپورٹ',
                summaryCards,
                columns,
                data: filteredParties,
                fileName: 'all-parties-report',
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
                title: 'All Parties Report',
                columns,
                data: filteredParties,
                summaryCards,
                fileName: 'all-parties-report',
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
                title="All Parties Balance Report"
                urduTitle="تمام پارٹیز بیلنس رپورٹ"
                subtitle="Complete register of all customer receivables (you'll get) and supplier payables (you'll give)"
                urduSubtitle="گاہکوں اور سپلائرز کے تمام بقایا جات، ادھار کھاتے اور پوزیشن کا جائزہ"
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                onExportPDF={handleExportPDF}
                onExportExcel={handleExportExcel}
                onRefresh={fetchAllParties}
                isExportingPDF={isExportingPDF}
                isExportingExcel={isExportingExcel}
                extraFilters={
                    <div className="flex flex-wrap gap-2 pt-2">
                        {[
                            { label: isUrdu ? 'تمام پارٹیز' : 'All Parties', value: 'all' },
                            { label: isUrdu ? 'صرف گاہک' : 'Customers Only', value: 'customer' },
                            { label: isUrdu ? 'صرف سپلائر' : 'Suppliers Only', value: 'supplier' },
                            { label: isUrdu ? 'صرف بقایا والی پارٹیز' : 'With Balance Only', value: 'dues_only' },
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

            {/* KPI Summary Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-card border border-default p-4 rounded-2xl shadow-xs">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-secondary uppercase tracking-wider">
                            {isUrdu ? 'کل رجسٹرڈ گاہک' : 'Total Customers'}
                        </span>
                        <span className="p-2 rounded-xl bg-blue-500/10 text-blue-600">
                            <FiUsers className="w-4 h-4" />
                        </span>
                    </div>
                    <div className="text-lg sm:text-2xl font-black text-main font-mono">
                        {summary.totalCustomers || 0}
                    </div>
                </div>

                <div className="bg-card border border-default p-4 rounded-2xl shadow-xs">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-secondary uppercase tracking-wider">
                            {isUrdu ? 'کل سپلائرز' : 'Total Suppliers'}
                        </span>
                        <span className="p-2 rounded-xl bg-purple-500/10 text-purple-600">
                            <FiUserCheck className="w-4 h-4" />
                        </span>
                    </div>
                    <div className="text-lg sm:text-2xl font-black text-main font-mono">
                        {summary.totalSuppliers || 0}
                    </div>
                </div>

                <div className="bg-card border border-default p-4 rounded-2xl shadow-xs">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-secondary uppercase tracking-wider">
                            {isUrdu ? 'کل وصول طلب رقم (Receivables)' : 'Total Receivables (You Get)'}
                        </span>
                        <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600">
                            <FiTrendingUp className="w-4 h-4" />
                        </span>
                    </div>
                    <div className="text-lg sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
                        {formatCurrency(summary.totalReceivables)}
                    </div>
                </div>

                <div className="bg-card border border-default p-4 rounded-2xl shadow-xs">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-secondary uppercase tracking-wider">
                            {isUrdu ? 'کل واجب الادا رقم (Payables)' : 'Total Payables (You Give)'}
                        </span>
                        <span className="p-2 rounded-xl bg-rose-500/10 text-rose-600">
                            <FiTrendingDown className="w-4 h-4" />
                        </span>
                    </div>
                    <div className="text-lg sm:text-2xl font-black text-rose-600 font-mono">
                        {formatCurrency(summary.totalPayables)}
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-card border border-default rounded-2xl shadow-xs overflow-hidden">
                <div className="p-4 border-b border-default flex items-center justify-between">
                    <h2 className="text-sm font-bold text-main uppercase tracking-wider">
                        {isUrdu ? `تمام کھاتے دار (${filteredParties.length})` : `All Parties Directory (${filteredParties.length})`}
                    </h2>
                </div>

                {loading ? (
                    <div className="p-12 text-center text-secondary">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-indigo-600 border-t-transparent mb-2" />
                        <p className="text-xs font-medium">{isUrdu ? 'پارٹیز لوڈ ہو رہی ہیں...' : 'Loading parties...'}</p>
                    </div>
                ) : filteredParties.length === 0 ? (
                    <div className="p-12 text-center text-secondary">
                        <p className="text-sm font-semibold">{isUrdu ? 'کوئی پارٹی نہیں ملی' : 'No parties found matching criteria'}</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-xs">
                            <thead className="bg-table-header border-b border-default text-secondary uppercase font-semibold text-[11px]">
                                <tr>
                                    <th className="px-4 py-3 text-left rtl:text-right">{isUrdu ? 'نام پارٹی' : 'Party Name'}</th>
                                    <th className="px-4 py-3 text-left rtl:text-right">{isUrdu ? 'قسم' : 'Type'}</th>
                                    <th className="px-4 py-3 text-left rtl:text-right">{isUrdu ? 'فون' : 'Phone'}</th>
                                    <th className="px-4 py-3 text-left rtl:text-right">{isUrdu ? 'شہر' : 'City'}</th>
                                    <th className="px-4 py-3 text-right rtl:text-left">{isUrdu ? 'وصول طلب (Receivable)' : 'Receivable (You Get)'}</th>
                                    <th className="px-4 py-3 text-right rtl:text-left">{isUrdu ? 'واجب الادا (Payable)' : 'Payable (You Give)'}</th>
                                    <th className="px-4 py-3 text-center">{isUrdu ? 'کارروائی' : 'Action'}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-default">
                                {filteredParties.map((p) => (
                                    <tr key={p.id} className="hover:bg-hover transition">
                                        <td className="px-4 py-3 font-bold text-main">
                                            {p.name}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                                                p.type === 'Customer'
                                                    ? 'bg-blue-500/10 text-blue-600'
                                                    : 'bg-purple-500/10 text-purple-600'
                                            }`}>
                                                {p.type}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-secondary font-mono">
                                            {p.phone || '-'}
                                        </td>
                                        <td className="px-4 py-3 text-secondary">
                                            {p.city || '-'}
                                        </td>
                                        <td className="px-4 py-3 text-right rtl:text-left font-mono font-bold text-emerald-600">
                                            {p.receivable > 0 ? formatCurrency(p.receivable) : '-'}
                                        </td>
                                        <td className="px-4 py-3 text-right rtl:text-left font-mono font-bold text-rose-600">
                                            {p.payable > 0 ? formatCurrency(p.payable) : '-'}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <button
                                                type="button"
                                                onClick={() => navigate(`/reports/party-statement?partyId=${p.id}&partyType=${p.type.toLowerCase()}`)}
                                                className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-600 transition cursor-pointer"
                                            >
                                                {isUrdu ? 'کھاتہ دیکھیں' : 'View Ledger'}
                                            </button>
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

export default AllPartiesReport;
