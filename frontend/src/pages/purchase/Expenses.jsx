import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import {
    FiPlus,
    FiFilter,
    FiDownload,
    FiTrash2,
    FiEdit2,
    FiChevronDown,
    FiChevronUp,
    FiRefreshCw,
    FiCheckSquare,
    FiSquare,
} from 'react-icons/fi';
import Layout from '../../components/Layout';
import DataTable from '../../components/DataTable';
import ExpenseForm from '../../components/expenses/ExpenseForm';
import ExpenseFilterPanel from '../../components/expenses/ExpenseFilterPanel';
import BulkActionBar from '../../components/expenses/BulkActionBar';
import {
    getAllExpenses,
    getExpenseSummary,
    deleteExpense,
    bulkDeleteExpenses,
    exportExpenses,
    reset,
} from '../../redux/slices/expenseSlice';
import { getAllCategories, seedDefaultCategories } from '../../redux/slices/expenseCategorySlice';

const Expenses = () => {
    const { t } = useTranslation(['purchase', 'common']);
    const dispatch = useDispatch();
    const { expenses, summary, pagination, isLoading, isError, isSuccess, message } = useSelector(
        (state) => state.expense
    );
    const { categories } = useSelector((state) => state.expenseCategory);

    // UI State
    const [showForm, setShowForm] = useState(false);
    const [showFilters, setShowFilters] = useState(false);
    const [editingExpense, setEditingExpense] = useState(null);
    const [selectedExpenses, setSelectedExpenses] = useState([]);

    // Filter State
    const [filters, setFilters] = useState({
        page: 1,
        limit: 25,
        sortBy: 'date',
        sortOrder: 'desc',
        category: '',
        status: '',
        paymentMethod: '',
        startDate: '',
        endDate: '',
        minAmount: '',
        maxAmount: '',
        search: '',
    });

    // Load data on mount only
    useEffect(() => {
        const initializeCategories = async () => {
            try {
                const result = await dispatch(getAllCategories()).unwrap();
                // Auto-seed default categories if none exist
                if (!result || result.length === 0) {
                    try {
                        await dispatch(seedDefaultCategories()).unwrap();
                        toast.success('Default expense categories initialized');
                        dispatch(getAllCategories());
                    } catch (error) {
                        // Silently fail if categories already exist or other error
                        console.log('Categories already initialized or error:', error);
                    }
                }
            } catch (error) {
                console.error('Failed to load categories:', error);
                // Continue anyway - page should still render
            }
        };

        initializeCategories();
        dispatch(getExpenseSummary());
    }, [dispatch]);

    // Load expenses when filters change (using JSON.stringify to prevent infinite loop)
    useEffect(() => {
        dispatch(getAllExpenses(filters));
    }, [dispatch, JSON.stringify(filters)]);

    // Handle success/error messages
    useEffect(() => {
        if (isError) {
            toast.error(message);
        }

        if (isSuccess && message) {
            toast.success(message);
        }

        return () => {
            dispatch(reset());
        };
    }, [isError, isSuccess, message, dispatch]);

    // Handlers
    const handleFilterChange = (newFilters) => {
        setFilters({ ...filters, ...newFilters, page: 1 });
    };

    const handleClearFilters = () => {
        setFilters({
            page: 1,
            limit: 25,
            sortBy: 'date',
            sortOrder: 'desc',
            category: '',
            status: '',
            paymentMethod: '',
            startDate: '',
            endDate: '',
            minAmount: '',
            maxAmount: '',
            search: '',
        });
    };

    const handlePageChange = (page) => {
        setFilters({ ...filters, page });
    };

    const handleSort = (field) => {
        const newOrder = filters.sortBy === field && filters.sortOrder === 'asc' ? 'desc' : 'asc';
        setFilters({ ...filters, sortBy: field, sortOrder: newOrder });
    };

    const handleEdit = (expense) => {
        setEditingExpense(expense);
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this expense?')) {
            await dispatch(deleteExpense(id));
            dispatch(getAllExpenses(filters));
            dispatch(getExpenseSummary());
            setSelectedExpenses([]);
        }
    };

    const handleFormClose = (shouldRefresh) => {
        setShowForm(false);
        setEditingExpense(null);
        if (shouldRefresh) {
            // Refresh expense list and summary after create/update
            dispatch(getAllExpenses(filters));
            dispatch(getExpenseSummary());
        }
    };

    const handleBulkDelete = async () => {
        if (window.confirm(`Are you sure you want to delete ${selectedExpenses.length} expense(s)?`)) {
            await dispatch(bulkDeleteExpenses(selectedExpenses));
            dispatch(getAllExpenses(filters));
            dispatch(getExpenseSummary());
            setSelectedExpenses([]);
        }
    };

    const handleBulkCategoryUpdate = async (categoryId) => {
        // TODO: Implement bulk category update
        toast.info('Bulk category update coming soon');
    };

    // Handle export
    const handleExport = async (format) => {
        await dispatch(exportExpenses({ format, filters }));
    };

    // Handle row selection
    const handleSelectAll = () => {
        if (selectedExpenses.length === expenses.length) {
            setSelectedExpenses([]);
        } else {
            setSelectedExpenses(expenses.map((exp) => exp._id));
        }
    };

    const handleSelectRow = (id) => {
        if (selectedExpenses.includes(id)) {
            setSelectedExpenses(selectedExpenses.filter((expId) => expId !== id));
        } else {
            setSelectedExpenses([...selectedExpenses, id]);
        }
    };

    // Format currency
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-PK', {
            style: 'currency',
            currency: 'PKR',
            minimumFractionDigits: 2,
        }).format(amount);
    };

    // Format date
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-PK', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    // Get category name
    const getCategoryName = (categoryValue) => {
        // If category is already a string name, return it directly
        if (typeof categoryValue === 'string' && !categoryValue.match(/^[0-9a-fA-F]{24}$/)) {
            return categoryValue;
        }
        // Otherwise, try to find it in categories array (if it's an ID)
        const category = categories.find((cat) => cat._id === categoryValue || cat.name === categoryValue);
        return category ? category.name : categoryValue || 'Unknown';
    };

    // Get status badge
    const getStatusBadge = (status) => {
        const badges = {
            pending: 'bg-yellow-100 text-yellow-800',
            approved: 'bg-green-100 text-green-800',
            rejected: 'bg-red-100 text-red-800',
        };
        const statusLabel = {
            pending: t('purchase:pending', 'Pending'),
            approved: t('purchase:approved', 'Approved'),
            rejected: t('purchase:rejected', 'Rejected'),
        }[status] || status;
        return (
            <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${badges[status] || badges.pending}`}>
                {statusLabel}
            </span>
        );
    };

    // Get payment method badge
    const getPaymentMethodBadge = (method) => {
        const badges = {
            cash: 'bg-blue-100 text-blue-800',
            bank: 'bg-purple-100 text-purple-800',
            cheque: 'bg-indigo-100 text-indigo-800',
        };
        const methodLabel = {
            cash: t('purchase:cash', 'Cash'),
            bank: t('purchase:bankTransfer', 'Bank'),
            cheque: t('purchase:cheque', 'Cheque'),
        }[method] || method;
        return (
            <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${badges[method] || badges.cash}`}>
                {methodLabel}
            </span>
        );
    };

    // Table columns
    const columns = [
        {
            key: 'select',
            label: (
                <input
                    type="checkbox"
                    checked={selectedExpenses.length === expenses.length && expenses.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300"
                />
            ),
            render: (_, row) => (
                <input
                    type="checkbox"
                    checked={selectedExpenses.includes(row._id)}
                    onChange={() => handleSelectRow(row._id)}
                    className="rounded border-gray-300"
                />
            ),
        },
        {
            key: 'expenseNo',
            label: t('purchase:expenseNo', 'Expense #'),
            sortable: true,
            render: (value) => <span className="font-medium text-blue-600">{value}</span>,
        },
        {
            key: 'date',
            label: t('purchase:date', 'Date'),
            sortable: true,
            render: (value) => formatDate(value),
        },
        {
            key: 'category',
            label: t('purchase:expenseCategory', 'Category'),
            render: (value) => getCategoryName(value),
        },
        {
            key: 'description',
            label: t('purchase:description', 'Description'),
            render: (value) => (
                <span className="text-sm text-gray-600 max-w-xs truncate block">{value || '-'}</span>
            ),
        },
        {
            key: 'amount',
            label: t('purchase:amount', 'Amount'),
            sortable: true,
            render: (value) => <span className="text-sm font-semibold">{formatCurrency(value)}</span>,
        },
        {
            key: 'paymentMethod',
            label: t('purchase:payment', 'Payment'),
            render: (value) => getPaymentMethodBadge(value),
        },
        {
            key: 'status',
            label: t('purchase:status', 'Status'),
            render: (value) => getStatusBadge(value),
        },
        {
            key: 'actions',
            label: t('purchase:actions', 'Actions'),
            render: (_, row) => (
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => handleEdit(row)}
                        className="text-blue-600 hover:text-blue-800 transition-colors"
                        title={t('common:edit', 'Edit')}
                    >
                        <FiEdit2 className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => handleDelete(row._id)}
                        className="text-red-600 hover:text-red-800 transition-colors"
                        title={t('common:delete', 'Delete')}
                    >
                        <FiTrash2 className="w-4 h-4" />
                    </button>
                </div>
            ),
        },
    ];

    return (
        <Layout>
            <div className="space-y-4">
                {/* Page Header */}
                <div className="mb-4">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-[rgb(var(--color-text))] mb-1">{t('purchase:expensesManagement', 'Expenses Management')}</h1>
                    <p className="text-sm text-gray-600 dark:text-[rgb(var(--color-text-secondary))]">{t('purchase:trackManageExpenses', 'Track and manage all business expenses')}</p>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    {/* Total Expenses */}
                    <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-xs border border-slate-200/80 dark:border-zinc-800/80 p-4 sm:p-5 transition-shadow hover:shadow-sm">
                        <div className="flex items-center space-x-4">
                            <div className="p-3 bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 rounded-xl">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="text-xl sm:text-2xl font-bold tabular-nums text-zinc-900 dark:text-zinc-100 truncate">{summary?.totalExpenses?.amount ? formatCurrency(summary.totalExpenses.amount) : formatCurrency(0)}</p>
                                <p className="text-xs text-zinc-500 dark:text-zinc-400 uppercase tracking-wide font-medium">{t('purchase:totalExpenses', 'Total Expenses')}</p>
                                <p className="text-xs text-zinc-500 dark:text-zinc-400">{t('purchase:entriesCount', { count: summary?.totalExpenses?.count || 0, defaultValue: `${summary?.totalExpenses?.count || 0} entries` })}</p>
                            </div>
                        </div>
                    </div>

                    {/* This Month */}
                    <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-xs border border-slate-200/80 dark:border-zinc-800/80 p-4 sm:p-5 transition-shadow hover:shadow-sm">
                        <div className="flex items-center space-x-4">
                            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 rounded-xl">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="text-xl sm:text-2xl font-bold tabular-nums text-zinc-900 dark:text-zinc-100 truncate">{summary?.thisMonth?.amount ? formatCurrency(summary.thisMonth.amount) : formatCurrency(0)}</p>
                                <p className="text-xs text-zinc-500 dark:text-zinc-400 uppercase tracking-wide font-medium">{t('purchase:thisMonth', 'This Month')}</p>
                                <p className="text-xs text-zinc-500 dark:text-zinc-400">{t('purchase:expensesCount', { count: summary?.thisMonth?.count || 0, defaultValue: `${summary?.thisMonth?.count || 0} expenses` })}</p>
                            </div>
                        </div>
                    </div>

                    {/* Top Category */}
                    <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-xs border border-slate-200/80 dark:border-zinc-800/80 p-4 sm:p-5 transition-shadow hover:shadow-sm">
                        <div className="flex items-center space-x-4">
                            <div className="p-3 bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 rounded-xl">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-zinc-100 truncate">{summary?.categoryBreakdown && summary.categoryBreakdown.length > 0 ? summary.categoryBreakdown[0].categoryName : 'N/A'}</p>
                                <p className="text-xs text-zinc-500 dark:text-zinc-400 uppercase tracking-wide font-medium">{t('purchase:topCategory', 'Top Category')}</p>
                                <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">{summary?.categoryBreakdown && summary.categoryBreakdown.length > 0 ? formatCurrency(summary.categoryBreakdown[0].total) : 'No data'}</p>
                            </div>
                        </div>
                    </div>

                    {/* Average Expense */}
                    <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-xs border border-slate-200/80 dark:border-zinc-800/80 p-4 sm:p-5 transition-shadow hover:shadow-sm">
                        <div className="flex items-center space-x-4">
                            <div className="p-3 bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 rounded-xl">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                </svg>
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="text-xl sm:text-2xl font-bold tabular-nums text-zinc-900 dark:text-zinc-100 truncate">{summary?.totalExpenses?.count && summary?.totalExpenses?.amount ? formatCurrency(summary.totalExpenses.amount / summary.totalExpenses.count) : formatCurrency(0)}</p>
                                <p className="text-xs text-zinc-500 dark:text-zinc-400 uppercase tracking-wide font-medium">{t('purchase:averageExpense', 'Average Expense')}</p>
                                <p className="text-xs text-zinc-500 dark:text-zinc-400">{t('purchase:perTransaction', 'Per transaction')}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Action Bar */}
                <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
                    <div className="flex flex-wrap items-center gap-2">
                        <button
                            onClick={() => {
                                setEditingExpense(null);
                                setShowForm(true);
                            }}
                            className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-xs cursor-pointer"
                        >
                            <FiPlus className="w-4 h-4" />
                            {t('purchase:addExpense', 'Add Expense')}
                        </button>
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={`flex items-center gap-2 px-3.5 py-2 text-sm font-medium border rounded-xl transition-colors cursor-pointer ${
                                showFilters
                                    ? 'border-violet-600 bg-violet-50 text-violet-700 dark:bg-violet-950/60 dark:border-violet-600 dark:text-violet-300 ring-2 ring-violet-500/20'
                                    : 'border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-700 dark:text-zinc-200 hover:bg-slate-50 dark:hover:bg-zinc-700'
                            }`}
                        >
                            <FiFilter className={`w-4 h-4 ${showFilters ? 'text-violet-600 dark:text-violet-400' : 'text-slate-500 dark:text-zinc-400'}`} />
                            <span>{t('purchase:filters', 'Filters')}</span>
                            {Object.keys(filters).some(k => !['page', 'limit', 'sortBy', 'sortOrder'].includes(k) && filters[k]) && (
                                <span className="w-2 h-2 rounded-full bg-violet-600 dark:bg-violet-400" />
                            )}
                            {showFilters ? <FiChevronUp className="w-3.5 h-3.5" /> : <FiChevronDown className="w-3.5 h-3.5" />}
                        </button>
                        <button
                            onClick={() => {
                                dispatch(getAllExpenses(filters));
                                dispatch(getExpenseSummary());
                            }}
                            className="flex items-center gap-2 px-3.5 py-2 text-sm font-medium border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-700 dark:text-zinc-200 rounded-xl hover:bg-slate-50 dark:hover:bg-zinc-700 transition-colors cursor-pointer"
                            title={t('purchase:refresh', 'Refresh')}
                        >
                            <FiRefreshCw className="w-4 h-4" />
                            <span className="hidden xs:inline">{t('purchase:refresh', 'Refresh')}</span>
                        </button>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        <button
                            onClick={() => handleExport('pdf')}
                            className="flex items-center gap-2 px-3.5 py-2 text-sm font-medium border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-700 dark:text-zinc-200 rounded-xl hover:bg-slate-50 dark:hover:bg-zinc-700 transition-colors cursor-pointer"
                        >
                            <FiDownload className="w-4 h-4" />
                            {t('purchase:exportPdf', 'Export PDF')}
                        </button>
                        <button
                            onClick={() => handleExport('excel')}
                            className="flex items-center gap-2 px-3.5 py-2 text-sm font-medium border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-700 dark:text-zinc-200 rounded-xl hover:bg-slate-50 dark:hover:bg-zinc-700 transition-colors cursor-pointer"
                        >
                            <FiDownload className="w-4 h-4" />
                            {t('purchase:exportExcel', 'Export Excel')}
                        </button>
                    </div>
                </div>

                {/* Bulk Action Bar */}
                {selectedExpenses.length > 0 && (
                    <BulkActionBar
                        selectedCount={selectedExpenses.length}
                        onDelete={handleBulkDelete}
                        onCategoryUpdate={handleBulkCategoryUpdate}
                        onClearSelection={() => setSelectedExpenses([])}
                        categories={categories}
                    />
                )}

                {/* Filter Panel */}
                {showFilters && (
                    <ExpenseFilterPanel
                        filters={filters}
                        categories={categories}
                        onFilterChange={handleFilterChange}
                        onClear={handleClearFilters}
                    />
                )}

                {/* Data Table */}
                <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-xs border border-slate-200/80 dark:border-zinc-800/80 overflow-hidden">
                    <div className="overflow-x-auto min-w-0">
                        <DataTable
                            columns={columns}
                            data={expenses || []}
                            isLoading={isLoading}
                            emptyMessage={t('purchase:noExpensesFound', "No expenses found. Click 'Add Expense' to create your first expense.")}
                        />
                    </div>

                    {/* Pagination */}
                    {pagination && pagination.totalPages > 1 && (
                        <div className="px-4 sm:px-6 py-3 border-t border-slate-200 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-3">
                            <div className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 text-center sm:text-left">
                                {t('purchase:showingResults', { from: ((pagination.currentPage - 1) * filters.limit) + 1, to: Math.min(pagination.currentPage * filters.limit, pagination.totalItems), total: pagination.totalItems, defaultValue: `Showing ${((pagination.currentPage - 1) * filters.limit) + 1} to ${Math.min(pagination.currentPage * filters.limit, pagination.totalItems)} of ${pagination.totalItems} results` })}
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                                    disabled={!pagination.hasPrevPage}
                                    className="px-3 py-1.5 text-xs sm:text-sm font-medium border border-slate-200 dark:border-zinc-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 transition-colors"
                                >
                                    {t('common:previous', 'Previous')}
                                </button>
                                <span className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">
                                    {t('purchase:pageOf', { current: pagination.currentPage, total: pagination.totalPages, defaultValue: `Page ${pagination.currentPage} of ${pagination.totalPages}` })}
                                </span>
                                <button
                                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                                    disabled={!pagination.hasNextPage}
                                    className="px-3 py-1.5 text-xs sm:text-sm font-medium border border-slate-200 dark:border-zinc-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 transition-colors"
                                >
                                    {t('common:next', 'Next')}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Expense Form Modal */}
            {showForm && (
                <ExpenseForm
                    expense={editingExpense}
                    categories={categories}
                    onClose={handleFormClose}
                />
            )}
        </Layout>
    );
};

export default Expenses;
