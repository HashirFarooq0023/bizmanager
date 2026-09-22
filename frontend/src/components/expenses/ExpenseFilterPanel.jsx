import { useState, useEffect } from 'react';
import { FiX, FiSearch } from 'react-icons/fi';
import DualMonthRangePicker from '../DualMonthRangePicker';

const ExpenseFilterPanel = ({ filters, categories, onFilterChange, onClear }) => {
    const [localFilters, setLocalFilters] = useState({
        ...filters,
        startDate: filters.startDate || filters.dateFrom || '',
        endDate: filters.endDate || filters.dateTo || '',
    });

    useEffect(() => {
        setLocalFilters({
            ...filters,
            startDate: filters.startDate || filters.dateFrom || '',
            endDate: filters.endDate || filters.dateTo || '',
        });
    }, [filters]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setLocalFilters(prev => ({ ...prev, [name]: value }));
    };

    const handleDateRangeChange = ({ startDate, endDate }) => {
        const updated = {
            ...localFilters,
            startDate,
            endDate,
            dateFrom: startDate,
            dateTo: endDate,
        };
        setLocalFilters(updated);
        onFilterChange(updated);
    };

    const handleApply = () => {
        onFilterChange(localFilters);
    };

    const handleClear = () => {
        const clearedFilters = {
            page: 1,
            limit: 25,
            sortBy: 'date',
            sortOrder: 'desc',
            category: '',
            status: '',
            paymentMethod: '',
            startDate: '',
            endDate: '',
            dateFrom: '',
            dateTo: '',
            minAmount: '',
            maxAmount: '',
            search: '',
        };
        setLocalFilters(clearedFilters);
        onClear();
    };

    const paymentMethods = [
        { value: 'cash', label: 'Cash' },
        { value: 'upi', label: 'EasyPaisa / JazzCash / Digital' },
        { value: 'card', label: 'Card' },
        { value: 'cheque', label: 'Cheque' },
        { value: 'bank_transfer', label: 'Bank Transfer' },
    ];

    const statuses = [
        { value: 'Paid', label: 'Paid' },
        { value: 'Pending', label: 'Pending' },
        { value: 'Cancelled', label: 'Cancelled' },
    ];

    const activeFiltersCount = Object.keys(localFilters).filter(
        (key) =>
            !['page', 'limit', 'sortBy', 'sortOrder', 'dateFrom', 'dateTo'].includes(key) &&
            localFilters[key] !== '' &&
            localFilters[key] !== null
    ).length;

    return (
        <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xs border border-slate-200 dark:border-zinc-800 p-5 sm:p-6 text-slate-800 dark:text-zinc-100 transition-all">
            <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2.5">
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-zinc-100">Filters</h3>
                    {activeFiltersCount > 0 && (
                        <span className="px-2.5 py-0.5 text-xs font-semibold bg-violet-100 dark:bg-violet-950/60 text-violet-700 dark:text-violet-300 rounded-full">
                            {activeFiltersCount} active
                        </span>
                    )}
                </div>
                <button
                    type="button"
                    onClick={handleClear}
                    className="text-xs sm:text-sm font-medium text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100 transition-colors cursor-pointer"
                >
                    Clear all
                </button>
            </div>

            <div className="space-y-4">
                {/* Search */}
                <div>
                    <label className="block text-xs sm:text-sm font-medium text-slate-700 dark:text-zinc-300 mb-1.5">Search</label>
                    <div className="relative">
                        <FiSearch className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-slate-400 dark:text-zinc-500 w-4 h-4" />
                        <input
                            type="text"
                            name="search"
                            value={localFilters.search || ''}
                            onChange={handleChange}
                            placeholder="Search by expense #, category, description..."
                            className="w-full pl-10 pr-3.5 py-2 bg-slate-50 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 rounded-xl text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-500 focus:ring-2 focus:ring-violet-500 focus:border-transparent text-xs sm:text-sm transition"
                        />
                    </div>
                </div>

                {/* Row 1: Category, Status, Payment Method */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-xs sm:text-sm font-medium text-slate-700 dark:text-zinc-300 mb-1.5">Category</label>
                        <select
                            name="category"
                            value={localFilters.category || ''}
                            onChange={handleChange}
                            className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 rounded-xl text-slate-900 dark:text-zinc-100 focus:ring-2 focus:ring-violet-500 focus:border-transparent text-xs sm:text-sm transition cursor-pointer"
                        >
                            <option value="">All Categories</option>
                            {categories.map((cat) => (
                                <option key={cat._id} value={cat.name}>
                                    {cat.icon} {cat.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs sm:text-sm font-medium text-slate-700 dark:text-zinc-300 mb-1.5">Status</label>
                        <select
                            name="status"
                            value={localFilters.status || ''}
                            onChange={handleChange}
                            className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 rounded-xl text-slate-900 dark:text-zinc-100 focus:ring-2 focus:ring-violet-500 focus:border-transparent text-xs sm:text-sm transition cursor-pointer"
                        >
                            <option value="">All Statuses</option>
                            {statuses.map((status) => (
                                <option key={status.value} value={status.value}>
                                    {status.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs sm:text-sm font-medium text-slate-700 dark:text-zinc-300 mb-1.5">Payment Method</label>
                        <select
                            name="paymentMethod"
                            value={localFilters.paymentMethod || ''}
                            onChange={handleChange}
                            className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 rounded-xl text-slate-900 dark:text-zinc-100 focus:ring-2 focus:ring-violet-500 focus:border-transparent text-xs sm:text-sm transition cursor-pointer"
                        >
                            <option value="">All Methods</option>
                            {paymentMethods.map((method) => (
                                <option key={method.value} value={method.value}>
                                    {method.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Row 2: Date Range (Dual Month Picker) & Amount Range */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                    <div>
                        <label className="block text-xs sm:text-sm font-medium text-slate-700 dark:text-zinc-300 mb-1.5">
                            Date Range
                        </label>
                        <DualMonthRangePicker
                            startDate={localFilters.startDate || localFilters.dateFrom || ''}
                            endDate={localFilters.endDate || localFilters.dateTo || ''}
                            onChange={handleDateRangeChange}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs sm:text-sm font-medium text-slate-700 dark:text-zinc-300 mb-1.5">Min Amount (Rs.)</label>
                            <input
                                type="number"
                                name="minAmount"
                                value={localFilters.minAmount || ''}
                                onChange={handleChange}
                                placeholder="0.00"
                                step="0.01"
                                min="0"
                                className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 rounded-xl text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-500 focus:ring-2 focus:ring-violet-500 focus:border-transparent text-xs sm:text-sm transition font-mono"
                            />
                        </div>

                        <div>
                            <label className="block text-xs sm:text-sm font-medium text-slate-700 dark:text-zinc-300 mb-1.5">Max Amount (Rs.)</label>
                            <input
                                type="number"
                                name="maxAmount"
                                value={localFilters.maxAmount || ''}
                                onChange={handleChange}
                                placeholder="0.00"
                                step="0.01"
                                min="0"
                                className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 rounded-xl text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-500 focus:ring-2 focus:ring-violet-500 focus:border-transparent text-xs sm:text-sm transition font-mono"
                            />
                        </div>
                    </div>
                </div>

                {/* Apply Button */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-zinc-800">
                    <button
                        type="button"
                        onClick={handleClear}
                        className="px-4 py-2 text-xs sm:text-sm font-medium text-slate-700 dark:text-zinc-300 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 border border-slate-200 dark:border-zinc-700 rounded-xl transition cursor-pointer"
                    >
                        Reset
                    </button>
                    <button
                        type="button"
                        onClick={handleApply}
                        className="px-6 py-2 text-xs sm:text-sm font-semibold bg-violet-600 hover:bg-violet-700 text-white rounded-xl shadow-xs transition cursor-pointer"
                    >
                        Apply Filters
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ExpenseFilterPanel;
