import { useState } from 'react';
import { useTranslation } from 'react-i18next';

const SalesReportTable = ({ data, pagination, isLoading, onPageChange }) => {
    const { t } = useTranslation(['reports', 'common']);
    const [visibleColumns, setVisibleColumns] = useState({
        invoiceDate: true,
        invoiceNo: true,
        customerName: true,
        itemsCount: true,
        quantitySold: true,
        grossAmount: true,
        discount: true,
        taxableAmount: true,
        cgst: false,
        sgst: false,
        igst: false,
        totalTax: true,
        netAmount: true,
        paymentStatus: true,
        paymentMethod: true,
    });

    const [sortField, setSortField] = useState(null);
    const [sortDirection, setSortDirection] = useState('asc');
    const [showColumnDropdown, setShowColumnDropdown] = useState(false);

    const toggleColumn = (column) => {
        setVisibleColumns({ ...visibleColumns, [column]: !visibleColumns[column] });
    };

    const handleSort = (field) => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
    };

    const sortedData = data ? [...data].sort((a, b) => {
        if (!sortField) return 0;
        const aVal = a[sortField];
        const bVal = b[sortField];
        if (sortDirection === 'asc') {
            return aVal > bVal ? 1 : -1;
        } else {
            return aVal < bVal ? 1 : -1;
        }
    }) : [];

    if (isLoading) {
        return (
            <div className="bg-card rounded-xl border border-border p-6">
                <div className="animate-pulse space-y-4">
                    <div className="h-8 bg-border rounded w-1/4"></div>
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="h-12 bg-border rounded"></div>
                    ))}
                </div>
            </div>
        );
    }

    if (!data || data.length === 0) {
        return (
            <div className="bg-card rounded-xl border border-border p-12 text-center">
                <div className="text-6xl mb-4">📊</div>
                <h3 className="text-xl font-bold text-main mb-2">{t('reports:noSalesFound')}</h3>
                <p className="text-secondary">{t('reports:adjustFiltersPrompt')}</p>
            </div>
        );
    }

    return (
        <div className="bg-card rounded-xl border border-border overflow-hidden">
            {/* Table Header with Column Toggle */}
            <div className="p-4 border-b border-border flex justify-between items-center">
                <h3 className="text-lg font-bold text-main">{t('reports:salesTransactions')}</h3>
                <div className="relative">
                    <button
                        onClick={() => setShowColumnDropdown(!showColumnDropdown)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    >
                        {t('reports:columns')}
                    </button>
                    {showColumnDropdown && (
                        <>
                            {/* Backdrop to close dropdown when clicking outside */}
                            <div
                                className="fixed inset-0 z-40"
                                onClick={() => setShowColumnDropdown(false)}
                            />
                            {/* Dropdown menu */}
                            <div className="absolute right-0 mt-2 bg-card border border-border rounded-lg shadow-lg p-4 z-50 w-64 max-h-96 overflow-y-auto">
                                {Object.keys(visibleColumns).map((col) => (
                                    <label key={col} className="flex items-center gap-2 mb-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 p-1 rounded">
                                        <input
                                            type="checkbox"
                                            checked={visibleColumns[col]}
                                            onChange={() => toggleColumn(col)}
                                            className="w-4 h-4"
                                        />
                                        <span className="text-sm text-main">
                                            {col.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase())}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-800 sticky top-0">
                        <tr>
                            {visibleColumns.invoiceDate && (
                                <th
                                    onClick={() => handleSort('invoiceDate')}
                                    className="px-4 py-3 ltr:text-left rtl:text-right text-xs font-medium text-secondary uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                                >
                                    {t('reports:date')} {sortField === 'invoiceDate' && (sortDirection === 'asc' ? '↑' : '↓')}
                                </th>
                            )}
                            {visibleColumns.invoiceNo && (
                                <th className="px-4 py-3 ltr:text-left rtl:text-right text-xs font-medium text-secondary uppercase tracking-wider">
                                    {t('reports:invoiceNo')}
                                </th>
                            )}
                            {visibleColumns.customerName && (
                                <th className="px-4 py-3 ltr:text-left rtl:text-right text-xs font-medium text-secondary uppercase tracking-wider">
                                    {t('reports:customer')}
                                </th>
                            )}
                            {visibleColumns.itemsCount && (
                                <th className="px-4 py-3 ltr:text-right rtl:text-left text-xs font-medium text-secondary uppercase tracking-wider">
                                    {t('reports:items')}
                                </th>
                            )}
                            {visibleColumns.quantitySold && (
                                <th className="px-4 py-3 ltr:text-right rtl:text-left text-xs font-medium text-secondary uppercase tracking-wider">
                                    {t('reports:qty')}
                                </th>
                            )}
                            {visibleColumns.grossAmount && (
                                <th
                                    onClick={() => handleSort('grossAmount')}
                                    className="px-4 py-3 ltr:text-right rtl:text-left text-xs font-medium text-secondary uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                                >
                                    {t('reports:gross')} {sortField === 'grossAmount' && (sortDirection === 'asc' ? '↑' : '↓')}
                                </th>
                            )}
                            {visibleColumns.discount && (
                                <th className="px-4 py-3 ltr:text-right rtl:text-left text-xs font-medium text-secondary uppercase tracking-wider">
                                    {t('reports:discount')}
                                </th>
                            )}
                            {visibleColumns.taxableAmount && (
                                <th className="px-4 py-3 ltr:text-right rtl:text-left text-xs font-medium text-secondary uppercase tracking-wider">
                                    {t('reports:taxable')}
                                </th>
                            )}
                            {visibleColumns.cgst && (
                                <th className="px-4 py-3 ltr:text-right rtl:text-left text-xs font-medium text-secondary uppercase tracking-wider">
                                    {t('reports:cgst')}
                                </th>
                            )}
                            {visibleColumns.sgst && (
                                <th className="px-4 py-3 ltr:text-right rtl:text-left text-xs font-medium text-secondary uppercase tracking-wider">
                                    {t('reports:sgst')}
                                </th>
                            )}
                            {visibleColumns.igst && (
                                <th className="px-4 py-3 ltr:text-right rtl:text-left text-xs font-medium text-secondary uppercase tracking-wider">
                                    {t('reports:igst')}
                                </th>
                            )}
                            {visibleColumns.totalTax && (
                                <th className="px-4 py-3 ltr:text-right rtl:text-left text-xs font-medium text-secondary uppercase tracking-wider">
                                    {t('reports:totalTax')}
                                </th>
                            )}
                            {visibleColumns.netAmount && (
                                <th
                                    onClick={() => handleSort('netAmount')}
                                    className="px-4 py-3 ltr:text-right rtl:text-left text-xs font-medium text-secondary uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                                >
                                    {t('reports:netAmount')} {sortField === 'netAmount' && (sortDirection === 'asc' ? '↑' : '↓')}
                                </th>
                            )}
                            {visibleColumns.paymentStatus && (
                                <th className="px-4 py-3 text-center text-xs font-medium text-secondary uppercase tracking-wider">
                                    {t('reports:paymentStatus')}
                                </th>
                            )}
                            {visibleColumns.paymentMethod && (
                                <th className="px-4 py-3 text-center text-xs font-medium text-secondary uppercase tracking-wider">
                                    {t('reports:paymentMethod')}
                                </th>
                            )}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {sortedData.map((row, index) => (
                            <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition">
                                {visibleColumns.invoiceDate && (
                                    <td className="px-4 py-3 text-sm text-main whitespace-nowrap">
                                        {new Date(row.invoiceDate).toLocaleDateString('en-PK')}
                                    </td>
                                )}
                                {visibleColumns.invoiceNo && (
                                    <td className="px-4 py-3 text-sm font-medium text-blue-600 dark:text-blue-400 whitespace-nowrap">
                                        {row.invoiceNo}
                                    </td>
                                )}
                                {visibleColumns.customerName && (
                                    <td className="px-4 py-3 text-sm text-main">{row.customerName}</td>
                                )}
                                {visibleColumns.itemsCount && (
                                    <td className="px-4 py-3 text-sm text-main text-right">{row.itemsCount}</td>
                                )}
                                {visibleColumns.quantitySold && (
                                    <td className="px-4 py-3 text-sm text-main text-right">{row.quantitySold}</td>
                                )}
                                {visibleColumns.grossAmount && (
                                    <td className="px-4 py-3 text-sm text-main text-right">
                                        Rs. {row.grossAmount.toLocaleString('en-PK')}
                                    </td>
                                )}
                                {visibleColumns.discount && (
                                    <td className="px-4 py-3 text-sm text-orange-600 dark:text-orange-400 text-right">
                                        Rs. {row.discount.toLocaleString('en-PK')}
                                    </td>
                                )}
                                {visibleColumns.taxableAmount && (
                                    <td className="px-4 py-3 text-sm text-main text-right">
                                        Rs. {row.taxableAmount.toLocaleString('en-PK')}
                                    </td>
                                )}
                                {visibleColumns.cgst && (
                                    <td className="px-4 py-3 text-sm text-main text-right">
                                        Rs. {row.cgst.toLocaleString('en-PK')}
                                    </td>
                                )}
                                {visibleColumns.sgst && (
                                    <td className="px-4 py-3 text-sm text-main text-right">
                                        Rs. {row.sgst.toLocaleString('en-PK')}
                                    </td>
                                )}
                                {visibleColumns.igst && (
                                    <td className="px-4 py-3 text-sm text-main text-right">
                                        Rs. {row.igst.toLocaleString('en-PK')}
                                    </td>
                                )}
                                {visibleColumns.totalTax && (
                                    <td className="px-4 py-3 text-sm text-purple-600 dark:text-purple-400 text-right">
                                        Rs. {row.totalTax.toLocaleString('en-PK')}
                                    </td>
                                )}
                                {visibleColumns.netAmount && (
                                    <td className="px-4 py-3 text-sm font-bold text-green-600 dark:text-green-400 text-right">
                                        Rs. {row.netAmount.toLocaleString('en-PK')}
                                    </td>
                                )}
                                {visibleColumns.paymentStatus && (
                                    <td className="px-4 py-3 text-center">
                                        <span
                                            className={`px-2 py-1 text-xs rounded-full ${row.paymentStatus === 'paid'
                                                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                                                : row.paymentStatus === 'partial'
                                                    ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                                                    : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                                                }`}
                                        >
                                            {row.paymentStatus}
                                        </span>
                                    </td>
                                )}
                                {visibleColumns.paymentMethod && (
                                    <td className="px-4 py-3 text-sm text-main text-center uppercase">
                                        {row.paymentMethod}
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
                <div className="p-4 border-t border-border flex justify-between items-center">
                    <p className="text-sm text-secondary">
                        Showing {((pagination.currentPage - 1) * pagination.limit) + 1} to{' '}
                        {Math.min(pagination.currentPage * pagination.limit, pagination.totalRecords)} of{' '}
                        {pagination.totalRecords} results
                    </p>
                    <div className="flex gap-2">
                        <button
                            onClick={() => onPageChange(pagination.currentPage - 1)}
                            disabled={pagination.currentPage === 1}
                            className="px-4 py-2 bg-card border border-border rounded-lg text-main hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition"
                        >
                            Previous
                        </button>
                        <span className="px-4 py-2 bg-blue-600 text-white rounded-lg">
                            {pagination.currentPage} / {pagination.totalPages}
                        </span>
                        <button
                            onClick={() => onPageChange(pagination.currentPage + 1)}
                            disabled={pagination.currentPage === pagination.totalPages}
                            className="px-4 py-2 bg-card border border-border rounded-lg text-main hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition"
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SalesReportTable;
