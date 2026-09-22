import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useLanguage } from '../../contexts/LanguageContext';
import Layout from '../../components/Layout';
import ReportToolbar from './components/ReportToolbar';
import api from '../../services/api';
import { exportReportToPDF, exportReportToExcel, formatCurrency, formatDate } from '../../utils/reportExporter';
import { FiUser, FiPhone, FiDollarSign, FiFileText } from 'react-icons/fi';

const PartyStatementReport = () => {
    const { isUrdu } = useLanguage();
    const [partyType, setPartyType] = useState('customer'); // 'customer' | 'supplier'
    const [partyList, setPartyList] = useState([]);
    const [selectedPartyId, setSelectedPartyId] = useState('');
    const [loadingParties, setLoadingParties] = useState(false);

    const [loading, setLoading] = useState(false);
    const [statementData, setStatementData] = useState(null);
    const [dateFilter, setDateFilter] = useState('this_year');
    const [customStartDate, setCustomStartDate] = useState('');
    const [customEndDate, setCustomEndDate] = useState('');
    const [isExportingPDF, setIsExportingPDF] = useState(false);
    const [isExportingExcel, setIsExportingExcel] = useState(false);

    // Fetch parties on type change
    useEffect(() => {
        fetchParties();
    }, [partyType]);

    // Fetch statement when party or date filter changes
    useEffect(() => {
        if (selectedPartyId) {
            fetchStatement();
        }
    }, [selectedPartyId, dateFilter, customStartDate, customEndDate]);

    const fetchParties = async () => {
        try {
            setLoadingParties(true);
            if (partyType === 'customer') {
                const res = await api.get('/api/customers');
                const list = Array.isArray(res.data) ? res.data : (res.data?.customers || []);
                setPartyList(list);
                if (list.length > 0 && !selectedPartyId) {
                    setSelectedPartyId(list[0]._id);
                }
            } else {
                const res = await api.get('/api/suppliers');
                const list = Array.isArray(res.data) ? res.data : (res.data?.suppliers || []);
                setPartyList(list);
                if (list.length > 0) {
                    setSelectedPartyId(list[0]._id);
                }
            }
        } catch (err) {
            console.error('Failed to load parties:', err);
        } finally {
            setLoadingParties(false);
        }
    };

    const fetchStatement = async () => {
        try {
            setLoading(true);
            const params = {
                partyId: selectedPartyId,
                partyType,
                dateFilter,
            };
            if (dateFilter === 'custom' && customStartDate && customEndDate) {
                params.startDate = customStartDate;
                params.endDate = customEndDate;
            }
            const res = await api.get('/api/reports/party-statement', { params });
            setStatementData(res.data);
        } catch (err) {
            console.error('Failed to fetch statement:', err);
            toast.error(isUrdu ? 'پارٹی کا کھاتہ لوڈ نہیں ہوا' : 'Failed to load Party Statement');
        } finally {
            setLoading(false);
        }
    };

    const party = statementData?.party || {};
    const summary = statementData?.summary || {};
    const entries = statementData?.entries || [];

    const columns = [
        { header: 'Date', accessor: (row) => formatDate(row.date) },
        { header: 'Type', accessor: 'type' },
        { header: 'Ref #', accessor: 'refNo' },
        { header: 'Description', accessor: 'description' },
        { header: 'Debit (+)', accessor: (row) => row.debit > 0 ? formatCurrency(row.debit) : '-' },
        { header: 'Credit (-)', accessor: (row) => row.credit > 0 ? formatCurrency(row.credit) : '-' },
        { header: 'Balance', accessor: (row) => formatCurrency(row.balance) },
    ];

    const summaryCards = [
        { label: 'Party Name', value: party.name || 'N/A' },
        { label: 'Total Debits', value: formatCurrency(summary.totalDebit) },
        { label: 'Total Credits', value: formatCurrency(summary.totalCredit) },
        { label: 'Closing Balance', value: formatCurrency(summary.netBalance) },
    ];

    const handleExportPDF = () => {
        try {
            setIsExportingPDF(true);
            exportReportToPDF({
                title: `Party Ledger: ${party.name || 'Statement'}`,
                dateRange: statementData?.dateRange,
                summaryCards,
                columns,
                data: entries,
                fileName: `party-statement-${party.name || 'party'}`,
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
                title: 'Party Statement',
                columns,
                data: entries,
                summaryCards,
                fileName: `party-statement-${party.name || 'party'}`,
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
                title="Party Statement / Ledger"
                urduTitle="پارٹی کھاتہ / اسٹیٹمنٹ"
                subtitle="Detailed customer and vendor ledger accounts with running balance, debits, and credits"
                urduSubtitle="گاہک یا سپلائر کا مکمل لین دین کھاتہ، ادھار اور سابقہ بقایا جات"
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
                onRefresh={fetchStatement}
                isExportingPDF={isExportingPDF}
                isExportingExcel={isExportingExcel}
                extraFilters={
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                        {/* Party Type Switcher */}
                        <div>
                            <label className="block text-xs font-bold text-secondary uppercase mb-1">
                                {isUrdu ? 'کھاتے کی قسم' : 'Party Type'}
                            </label>
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => { setPartyType('customer'); setSelectedPartyId(''); }}
                                    className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition ${
                                        partyType === 'customer'
                                            ? 'bg-indigo-600 text-white shadow-xs'
                                            : 'bg-input text-secondary border border-default hover:text-main'
                                    }`}
                                >
                                    {isUrdu ? 'گاہک (Customer)' : 'Customer (گاہک)'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => { setPartyType('supplier'); setSelectedPartyId(''); }}
                                    className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition ${
                                        partyType === 'supplier'
                                            ? 'bg-indigo-600 text-white shadow-xs'
                                            : 'bg-input text-secondary border border-default hover:text-main'
                                    }`}
                                >
                                    {isUrdu ? 'سپلائر (Supplier)' : 'Supplier (سپلائر)'}
                                </button>
                            </div>
                        </div>

                        {/* Party Dropdown */}
                        <div>
                            <label className="block text-xs font-bold text-secondary uppercase mb-1">
                                {isUrdu ? 'پارٹی منتخب کریں' : 'Select Party / Account'}
                            </label>
                            <select
                                value={selectedPartyId}
                                onChange={(e) => setSelectedPartyId(e.target.value)}
                                className="w-full px-3.5 py-2 bg-input border border-default rounded-xl text-main text-xs font-medium focus:ring-2 focus:ring-indigo-500 shadow-xs"
                            >
                                <option value="">{isUrdu ? 'کھاتہ منتخب کریں...' : 'Select Party...'}</option>
                                {partyList.map((p) => (
                                    <option key={p._id} value={p._id}>
                                        {p.name} {p.phone ? `(${p.phone})` : ''} - (Rs. {p.dues || p.outstandingAmount || 0})
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                }
            />

            {/* Selected Party Info & Summary Banner */}
            {party.name && (
                <div className="bg-card border border-default rounded-2xl p-4 mb-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center font-bold text-lg">
                            <FiUser className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-main">{party.name}</h2>
                            <p className="text-xs text-secondary flex items-center gap-2">
                                <span>{party.type === 'customer' ? 'Customer' : 'Supplier'}</span>
                                {party.phone && <span>• {party.phone}</span>}
                                {party.email && <span>• {party.email}</span>}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="text-right">
                            <span className="text-xs text-secondary block font-medium">
                                {isUrdu ? 'موجودہ بقایا کھاتہ' : 'Current Outstanding Balance'}
                            </span>
                            <span className={`text-xl font-black font-mono ${(party.currentBalance || 0) > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                                {formatCurrency(party.currentBalance)}
                            </span>
                        </div>
                    </div>
                </div>
            )}

            {/* Statement Table */}
            <div className="bg-card border border-default rounded-2xl shadow-xs overflow-hidden">
                <div className="p-4 border-b border-default flex items-center justify-between">
                    <h2 className="text-sm font-bold text-main uppercase tracking-wider">
                        {isUrdu ? `لیجر کے اندراجات (${entries.length})` : `Ledger Entries (${entries.length})`}
                    </h2>
                </div>

                {loading ? (
                    <div className="p-12 text-center text-secondary">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-indigo-600 border-t-transparent mb-2" />
                        <p className="text-xs font-medium">{isUrdu ? 'کھاتہ لوڈ ہو رہا ہے...' : 'Loading party ledger...'}</p>
                    </div>
                ) : entries.length === 0 ? (
                    <div className="p-12 text-center text-secondary">
                        <p className="text-sm font-semibold">{isUrdu ? 'اس مدت کے لیے کوئی اندراج نہیں ملا' : 'No statement entries found for this party in the selected period'}</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-xs">
                            <thead className="bg-table-header border-b border-default text-secondary uppercase font-semibold text-[11px]">
                                <tr>
                                    <th className="px-4 py-3 text-left rtl:text-right">{isUrdu ? 'تاریخ' : 'Date'}</th>
                                    <th className="px-4 py-3 text-left rtl:text-right">{isUrdu ? 'قسم' : 'Type'}</th>
                                    <th className="px-4 py-3 text-left rtl:text-right">{isUrdu ? 'حوالہ #' : 'Ref #'}</th>
                                    <th className="px-4 py-3 text-left rtl:text-right">{isUrdu ? 'تفصیل' : 'Description'}</th>
                                    <th className="px-4 py-3 text-right rtl:text-left">{isUrdu ? 'ڈیبٹ (+)' : 'Debit (+)'}</th>
                                    <th className="px-4 py-3 text-right rtl:text-left">{isUrdu ? 'کریڈٹ (-)' : 'Credit (-)'}</th>
                                    <th className="px-4 py-3 text-right rtl:text-left">{isUrdu ? 'بقایا بیلنس' : 'Running Balance'}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-default">
                                {entries.map((row, idx) => (
                                    <tr key={idx} className="hover:bg-hover transition">
                                        <td className="px-4 py-3 text-main font-medium whitespace-nowrap">
                                            {formatDate(row.date)}
                                        </td>
                                        <td className="px-4 py-3 font-semibold text-main">
                                            {row.type}
                                        </td>
                                        <td className="px-4 py-3 font-mono text-secondary">
                                            {row.refNo || '-'}
                                        </td>
                                        <td className="px-4 py-3 text-secondary">
                                            {row.description}
                                        </td>
                                        <td className="px-4 py-3 text-right rtl:text-left font-mono font-bold text-rose-600">
                                            {row.debit > 0 ? formatCurrency(row.debit) : '-'}
                                        </td>
                                        <td className="px-4 py-3 text-right rtl:text-left font-mono font-bold text-emerald-600">
                                            {row.credit > 0 ? formatCurrency(row.credit) : '-'}
                                        </td>
                                        <td className="px-4 py-3 text-right rtl:text-left font-mono font-black text-main">
                                            {formatCurrency(row.balance)}
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

export default PartyStatementReport;
