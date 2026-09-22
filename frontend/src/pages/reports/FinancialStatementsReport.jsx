import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useLanguage } from '../../contexts/LanguageContext';
import Layout from '../../components/Layout';
import ReportToolbar from './components/ReportToolbar';
import api from '../../services/api';
import { exportReportToPDF, exportReportToExcel, formatCurrency } from '../../utils/reportExporter';
import { FiCheckCircle, FiPieChart, FiDollarSign } from 'react-icons/fi';

const FinancialStatementsReport = () => {
    const location = useLocation();
    const { isUrdu } = useLanguage();
    const [activeTab, setActiveTab] = useState(location.pathname.includes('balance-sheet') ? 'balance-sheet' : 'trial-balance');
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);
    const [isExportingPDF, setIsExportingPDF] = useState(false);
    const [isExportingExcel, setIsExportingExcel] = useState(false);

    useEffect(() => {
        fetchFinancialStatements();
    }, []);

    const fetchFinancialStatements = async () => {
        try {
            setLoading(true);
            const res = await api.get('/api/reports/financial-statements');
            setData(res.data);
        } catch (err) {
            console.error('Failed to load financial statements:', err);
            toast.error(isUrdu ? 'مالیاتی گوشوارے لوڈ نہیں ہو سکے' : 'Failed to load Financial Statements');
        } finally {
            setLoading(false);
        }
    };

    const trialBalance = data?.trialBalance || [];
    const balanceSheet = data?.balanceSheet || {};

    const totalDebit = trialBalance.reduce((s, row) => s + (row.debit || 0), 0);
    const totalCredit = trialBalance.reduce((s, row) => s + (row.credit || 0), 0);

    const handleExportPDF = () => {
        try {
            setIsExportingPDF(true);
            if (activeTab === 'trial-balance') {
                const columns = [
                    { header: 'Account Name', accessor: 'account' },
                    { header: 'Debit Balance (PKR)', accessor: (row) => row.debit > 0 ? formatCurrency(row.debit) : '-' },
                    { header: 'Credit Balance (PKR)', accessor: (row) => row.credit > 0 ? formatCurrency(row.credit) : '-' },
                ];
                exportReportToPDF({
                    title: 'Trial Balance / میزان پڑتال',
                    summaryCards: [
                        { label: 'Total Debit', value: formatCurrency(totalDebit) },
                        { label: 'Total Credit', value: formatCurrency(totalCredit) },
                        { label: 'Status', value: totalDebit === totalCredit ? 'Balanced ✓' : 'Discrepancy' },
                    ],
                    columns,
                    data: trialBalance,
                    fileName: 'trial-balance-statement',
                });
            } else {
                const assets = balanceSheet.assets || {};
                const liabilities = balanceSheet.liabilities || {};
                const rows = [
                    { category: 'ASSETS', item: 'Liquid Bank & Cash Accounts', amount: assets.bankAccounts },
                    { category: 'ASSETS', item: 'Accounts Receivable (Customer Dues)', amount: assets.accountsReceivable },
                    { category: 'ASSETS', item: 'Inventory Stock Valuation', amount: assets.inventoryValuation },
                    { category: 'ASSETS', item: 'TOTAL ASSETS', amount: assets.totalAssets, isTotal: true },
                    { category: 'LIABILITIES', item: 'Accounts Payable (Supplier Dues)', amount: liabilities.accountsPayable },
                    { category: 'LIABILITIES', item: 'Loans & Borrowings', amount: liabilities.loans },
                    { category: 'LIABILITIES', item: 'TOTAL LIABILITIES', amount: liabilities.totalLiabilities, isTotal: true },
                    { category: 'EQUITY', item: "Retained Earnings / Owner's Equity", amount: balanceSheet.equity?.totalEquity, isTotal: true },
                ];
                const columns = [
                    { header: 'Category', accessor: 'category' },
                    { header: 'Statement Line', accessor: 'item' },
                    { header: 'Amount (PKR)', accessor: (row) => formatCurrency(row.amount) },
                ];
                exportReportToPDF({
                    title: 'Balance Sheet / چٹھہ حسابات',
                    summaryCards: [
                        { label: 'Total Assets', value: formatCurrency(assets.totalAssets) },
                        { label: 'Total Liabilities', value: formatCurrency(liabilities.totalLiabilities) },
                        { label: 'Total Equity', value: formatCurrency(balanceSheet.equity?.totalEquity) },
                    ],
                    columns,
                    data: rows,
                    fileName: 'balance-sheet',
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
            const columns = [
                { header: 'Account / Particulars', accessor: 'account' },
                { header: 'Debit', accessor: 'debit' },
                { header: 'Credit', accessor: 'credit' },
            ];
            exportReportToExcel({
                title: activeTab === 'trial-balance' ? 'Trial Balance' : 'Balance Sheet',
                columns,
                data: trialBalance,
                fileName: 'financial-statements',
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
                title={activeTab === 'trial-balance' ? 'Trial Balance' : 'Balance Sheet'}
                urduTitle={activeTab === 'trial-balance' ? 'میزان پڑتال (ٹرائل بیلنس)' : 'چٹھہ حسابات (بیلنس شیٹ)'}
                subtitle="Double-entry accounting verification and financial position statement"
                urduSubtitle="کاروبار کے اثاثہ جات، واجبات اور مالیاتی توازن کا مستند جائزہ"
                onExportPDF={handleExportPDF}
                onExportExcel={handleExportExcel}
                onRefresh={fetchFinancialStatements}
                isExportingPDF={isExportingPDF}
                isExportingExcel={isExportingExcel}
                extraFilters={
                    <div className="flex gap-2 pt-2">
                        <button
                            type="button"
                            onClick={() => setActiveTab('trial-balance')}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                                activeTab === 'trial-balance'
                                    ? 'bg-indigo-600 text-white shadow-xs'
                                    : 'bg-input text-secondary hover:text-main border border-default'
                            }`}
                        >
                            {isUrdu ? 'ٹرائل بیلنس (Trial Balance)' : 'Trial Balance (میزان پڑتال)'}
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab('balance-sheet')}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                                activeTab === 'balance-sheet'
                                    ? 'bg-indigo-600 text-white shadow-xs'
                                    : 'bg-input text-secondary hover:text-main border border-default'
                            }`}
                        >
                            {isUrdu ? 'بیلنس شیٹ (Balance Sheet)' : 'Balance Sheet (چٹھہ حسابات)'}
                        </button>
                    </div>
                }
            />

            {activeTab === 'trial-balance' ? (
                /* Trial Balance View */
                <div className="bg-card border border-default rounded-2xl shadow-xs overflow-hidden">
                    <div className="p-4 bg-table-header border-b border-default flex items-center justify-between">
                        <h2 className="text-sm font-bold text-main uppercase tracking-wider">
                            {isUrdu ? 'تمام کھاتوں کا ڈیبٹ و کریڈٹ توازن' : 'Accounts Debit & Credit Balance Verification'}
                        </h2>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-xs">
                            <thead className="bg-table-header border-b border-default text-secondary uppercase font-semibold text-[11px]">
                                <tr>
                                    <th className="px-5 py-3.5 text-left rtl:text-right">{isUrdu ? 'کھاتے کا نام' : 'Account Name'}</th>
                                    <th className="px-5 py-3.5 text-right rtl:text-left">{isUrdu ? 'ڈیبٹ رقم (Debit)' : 'Debit Balance (Rs.)'}</th>
                                    <th className="px-5 py-3.5 text-right rtl:text-left">{isUrdu ? 'کریڈٹ رقم (Credit)' : 'Credit Balance (Rs.)'}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-default">
                                {trialBalance.map((row, idx) => (
                                    <tr key={idx} className="hover:bg-hover transition">
                                        <td className="px-5 py-3 text-main font-semibold">
                                            {row.account}
                                        </td>
                                        <td className="px-5 py-3 text-right rtl:text-left font-mono font-bold text-main">
                                            {row.debit > 0 ? formatCurrency(row.debit) : '-'}
                                        </td>
                                        <td className="px-5 py-3 text-right rtl:text-left font-mono font-bold text-main">
                                            {row.credit > 0 ? formatCurrency(row.credit) : '-'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot className="bg-table-header border-t-2 border-default font-black text-xs">
                                <tr>
                                    <th className="px-5 py-4 text-left rtl:text-right uppercase text-main">
                                        {isUrdu ? 'میزان کل (Total Balanced)' : 'Total (Trial Balance)'}
                                    </th>
                                    <th className="px-5 py-4 text-right rtl:text-left font-mono text-indigo-600 dark:text-indigo-400 text-sm">
                                        {formatCurrency(totalDebit)}
                                    </th>
                                    <th className="px-5 py-4 text-right rtl:text-left font-mono text-indigo-600 dark:text-indigo-400 text-sm">
                                        {formatCurrency(totalCredit)}
                                    </th>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>
            ) : (
                /* Balance Sheet View */
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Assets */}
                    <div className="bg-card border border-default rounded-2xl shadow-xs overflow-hidden">
                        <div className="p-4 bg-emerald-500/10 border-b border-default flex items-center justify-between">
                            <h3 className="font-bold text-sm text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
                                {isUrdu ? 'اثاثہ جات (Assets)' : 'Assets (اثاثہ جات)'}
                            </h3>
                            <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400 text-sm">
                                {formatCurrency(balanceSheet.assets?.totalAssets)}
                            </span>
                        </div>

                        <div className="p-5 space-y-3 text-xs">
                            <div className="flex justify-between py-1.5 border-b border-dashed border-default">
                                <span className="text-secondary font-medium">{isUrdu ? 'بینک و کیش اکاؤنٹس' : 'Liquid Bank & Cash Balances'}</span>
                                <span className="font-mono font-bold text-main">{formatCurrency(balanceSheet.assets?.bankAccounts)}</span>
                            </div>

                            <div className="flex justify-between py-1.5 border-b border-dashed border-default">
                                <span className="text-secondary font-medium">{isUrdu ? 'گاہکوں کے واجب الوصول ادھار' : 'Accounts Receivable (Customer Dues)'}</span>
                                <span className="font-mono font-bold text-main">{formatCurrency(balanceSheet.assets?.accountsReceivable)}</span>
                            </div>

                            <div className="flex justify-between py-1.5 border-b border-dashed border-default">
                                <span className="text-secondary font-medium">{isUrdu ? 'موجودہ اسٹاک مالیت' : 'Current Inventory Stock Valuation'}</span>
                                <span className="font-mono font-bold text-main">{formatCurrency(balanceSheet.assets?.inventoryValuation)}</span>
                            </div>

                            <div className="pt-3 border-t-2 border-default flex justify-between font-black text-sm text-emerald-700 dark:text-emerald-400">
                                <span>{isUrdu ? 'کل اثاثہ جات' : 'Total Assets'}</span>
                                <span className="font-mono">{formatCurrency(balanceSheet.assets?.totalAssets)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Liabilities & Equity */}
                    <div className="bg-card border border-default rounded-2xl shadow-xs overflow-hidden">
                        <div className="p-4 bg-rose-500/10 border-b border-default flex items-center justify-between">
                            <h3 className="font-bold text-sm text-rose-700 dark:text-rose-400 uppercase tracking-wider">
                                {isUrdu ? 'واجبات و سرمایہ (Liabilities & Equity)' : 'Liabilities & Owner Equity'}
                            </h3>
                            <span className="font-mono font-bold text-rose-700 dark:text-rose-400 text-sm">
                                {formatCurrency(balanceSheet.assets?.totalAssets)}
                            </span>
                        </div>

                        <div className="p-5 space-y-3 text-xs">
                            <div className="flex justify-between py-1.5 border-b border-dashed border-default">
                                <span className="text-secondary font-medium">{isUrdu ? 'سپلائرز کے واجب الادا رقوم' : 'Accounts Payable (Supplier Dues)'}</span>
                                <span className="font-mono font-bold text-main">{formatCurrency(balanceSheet.liabilities?.accountsPayable)}</span>
                            </div>

                            <div className="flex justify-between py-1.5 border-b border-dashed border-default">
                                <span className="text-secondary font-medium">{isUrdu ? 'قرضہ جات' : 'Loans & Borrowings'}</span>
                                <span className="font-mono font-bold text-main">{formatCurrency(balanceSheet.liabilities?.loans)}</span>
                            </div>

                            <div className="flex justify-between py-1.5 border-b border-dashed border-default font-semibold text-main">
                                <span>{isUrdu ? 'مالکانہ سرمایہ / منافع' : "Owner's Equity & Retained Earnings"}</span>
                                <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">{formatCurrency(balanceSheet.equity?.totalEquity)}</span>
                            </div>

                            <div className="pt-3 border-t-2 border-default flex justify-between font-black text-sm text-rose-700 dark:text-rose-400">
                                <span>{isUrdu ? 'کل واجبات و سرمایہ' : 'Total Liabilities & Equity'}</span>
                                <span className="font-mono">{formatCurrency(balanceSheet.assets?.totalAssets)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </Layout>
    );
};

export default FinancialStatementsReport;
