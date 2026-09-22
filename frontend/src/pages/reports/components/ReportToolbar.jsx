import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../../contexts/LanguageContext';
import { FiArrowLeft, FiDownload, FiFileText, FiRefreshCw, FiSearch, FiCalendar } from 'react-icons/fi';
import DualMonthRangePicker from '../../../components/DualMonthRangePicker';

const ReportToolbar = ({
    title,
    urduTitle,
    subtitle,
    urduSubtitle,
    dateFilter,
    onDateFilterChange,
    customStartDate,
    customEndDate,
    onCustomDateChange,
    searchTerm,
    onSearchChange,
    onExportPDF,
    onExportExcel,
    onRefresh,
    isExportingPDF,
    isExportingExcel,
    extraFilters,
    children,
}) => {
    const navigate = useNavigate();
    const { isUrdu } = useLanguage();

    const datePresets = [
        { label: isUrdu ? 'آج' : 'Today', value: 'today' },
        { label: isUrdu ? 'گزشتہ کل' : 'Yesterday', value: 'yesterday' },
        { label: isUrdu ? 'اس ہفتے' : 'This Week', value: 'this_week' },
        { label: isUrdu ? 'اس ماہ' : 'This Month', value: 'this_month' },
        { label: isUrdu ? 'گزشتہ ماہ' : 'Last Month', value: 'last_month' },
        { label: isUrdu ? 'اس سال' : 'This Year', value: 'this_year' },
        { label: isUrdu ? 'مخصوص مدت' : 'Custom', value: 'custom' },
    ];

    return (
        <div className="bg-card border border-default rounded-2xl p-5 mb-6 shadow-xs space-y-4">
            {/* Top Row: Title, Back & Export Actions */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={() => navigate('/reports')}
                        className="p-2.5 rounded-xl border border-default hover:bg-hover text-secondary hover:text-main transition shrink-0 cursor-pointer"
                        title={isUrdu ? 'رپورٹس کی طرف واپسی' : 'Back to Reports Dashboard'}
                    >
                        <FiArrowLeft className="w-5 h-5 rtl:rotate-180" />
                    </button>
                    <div>
                        <h1 className="text-xl sm:text-2xl font-bold text-main tracking-tight flex items-center gap-2">
                            <span>{isUrdu && urduTitle ? urduTitle : title}</span>
                            {urduTitle && !isUrdu && (
                                <span className="text-sm font-normal text-muted">/ {urduTitle}</span>
                            )}
                        </h1>
                        <p className="text-xs sm:text-sm text-secondary">
                            {isUrdu && urduSubtitle ? urduSubtitle : subtitle}
                        </p>
                    </div>
                </div>

                {/* Export & Action Buttons */}
                <div className="flex flex-wrap items-center gap-2">
                    {onRefresh && (
                        <button
                            type="button"
                            onClick={onRefresh}
                            className="px-3.5 py-2 border border-default rounded-xl text-secondary hover:text-main hover:bg-hover text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                        >
                            <FiRefreshCw className="w-3.5 h-3.5" />
                            <span>{isUrdu ? 'تازہ کریں' : 'Refresh'}</span>
                        </button>
                    )}

                    {onExportExcel && (
                        <button
                            type="button"
                            onClick={onExportExcel}
                            disabled={isExportingExcel}
                            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs disabled:opacity-50 transition cursor-pointer"
                        >
                            <FiDownload className="w-3.5 h-3.5" />
                            <span>{isExportingExcel ? (isUrdu ? 'ایکسل بن رہی ہے...' : 'Exporting...') : (isUrdu ? 'ایکسل ڈاؤنلوڈ' : 'Export Excel')}</span>
                        </button>
                    )}

                    {onExportPDF && (
                        <button
                            type="button"
                            onClick={onExportPDF}
                            disabled={isExportingPDF}
                            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs disabled:opacity-50 transition cursor-pointer"
                        >
                            <FiFileText className="w-3.5 h-3.5" />
                            <span>{isExportingPDF ? (isUrdu ? 'پی ڈی ایف بن رہی ہے...' : 'Exporting...') : (isUrdu ? 'پی ڈی ایف ڈاؤنلوڈ' : 'Download PDF')}</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Bottom Row: Date Presets, Custom Date Picker & Search */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 pt-3 border-t border-default">
                {/* Date Filter Tabs */}
                {onDateFilterChange && (
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
                        {datePresets.map((preset) => (
                            <button
                                key={preset.value}
                                type="button"
                                onClick={() => onDateFilterChange(preset.value)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition shrink-0 cursor-pointer ${
                                    dateFilter === preset.value
                                        ? 'bg-indigo-600 text-white shadow-xs'
                                        : 'bg-input text-secondary hover:text-main hover:bg-hover border border-default'
                                }`}
                            >
                                {preset.label}
                            </button>
                        ))}
                    </div>
                )}

                {/* Search Input */}
                {onSearchChange && (
                    <div className="relative min-w-[200px] md:w-64">
                        <FiSearch className="absolute ltr:left-3 rtl:right-3 top-1/2 -translate-y-1/2 text-muted w-3.5 h-3.5" />
                        <input
                            type="text"
                            value={searchTerm || ''}
                            onChange={(e) => onSearchChange(e.target.value)}
                            placeholder={isUrdu ? 'تلاش کریں...' : 'Search records...'}
                            className="w-full ltr:pl-9 rtl:pr-9 pr-3 py-1.5 bg-input border border-default rounded-xl text-main text-xs focus:ring-2 focus:ring-indigo-500 shadow-xs"
                        />
                    </div>
                )}
            </div>

            {/* Custom Date Range Picker Dropdown (when 'custom' is active) */}
            {dateFilter === 'custom' && onCustomDateChange && (
                <div className="pt-2">
                    <div className="max-w-md">
                        <label className="block text-xs font-semibold text-secondary mb-1.5">
                            {isUrdu ? 'مخصوص تاریخ منتخب کریں:' : 'Select Custom Date Range:'}
                        </label>
                        <DualMonthRangePicker
                            startDate={customStartDate || ''}
                            endDate={customEndDate || ''}
                            onChange={onCustomDateChange}
                        />
                    </div>
                </div>
            )}

            {extraFilters}
            {children}
        </div>
    );
};

export default ReportToolbar;
