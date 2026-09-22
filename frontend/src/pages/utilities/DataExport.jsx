import { useState } from 'react';
import Layout from '../../components/Layout';
import DualMonthRangePicker from '../../components/DualMonthRangePicker';

const DataExport = () => {
    const [exportFormat, setExportFormat] = useState('excel');
    const [selectedModules, setSelectedModules] = useState(['items']);
    const [dateRange, setDateRange] = useState({ from: '', to: '' });
    const [settings, setSettings] = useState({
        includeHeaders: true,
        compressFile: false,
        splitByMonth: false,
    });

    const modules = [
        { id: 'items', name: 'Items', icon: '📦', count: 245 },
        { id: 'parties', name: 'Parties', icon: '👥', count: 128 },
        { id: 'sales', name: 'Sales', icon: '💰', count: 1543 },
        { id: 'purchase', name: 'Purchase', icon: '🛒', count: 892 },
        { id: 'expenses', name: 'Expenses', icon: '💸', count: 456 },
        { id: 'ledger', name: 'Ledger', icon: '📊', count: 2341 },
        { id: 'gst', name: 'GST Reports', icon: '📋', count: 234 },
        { id: 'transactions', name: 'Transactions', icon: '💳', count: 3421 },
    ];

    const recentExports = [
        { id: 1, name: 'sales_data_2024.xlsx', format: 'Excel', date: '2024-12-07', size: '2.4 MB' },
        { id: 2, name: 'inventory_report.csv', format: 'CSV', date: '2024-12-06', size: '856 KB' },
        { id: 3, name: 'gst_report_nov.pdf', format: 'PDF', date: '2024-12-05', size: '1.2 MB' },
        { id: 4, name: 'customer_list.xlsx', format: 'Excel', date: '2024-12-04', size: '445 KB' },
    ];

    const toggleModule = (moduleId) => {
        setSelectedModules(prev =>
            prev.includes(moduleId)
                ? prev.filter(id => id !== moduleId)
                : [...prev, moduleId]
        );
    };

    const toggleSetting = (setting) => {
        setSettings(prev => ({ ...prev, [setting]: !prev[setting] }));
    };

    const handleExport = () => {
        alert(`Exporting ${selectedModules.length} module(s) as ${exportFormat.toUpperCase()}`);
    };

    const storageUsed = 45.8;
    const storageTotal = 100;
    const storagePercentage = (storageUsed / storageTotal) * 100;

    return (
        <Layout>
            <div className="space-y-6">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-zinc-100 mb-1">Data Export</h1>
                    <p className="text-sm text-slate-500 dark:text-zinc-400">Export your business data in various formats</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Export Panel */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Export Format Selector */}
                        <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xs border border-slate-200/80 dark:border-zinc-800/80 p-5 sm:p-6">
                            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-zinc-100 mb-4">Export Format</h3>
                            <div className="grid grid-cols-3 gap-3 sm:gap-4">
                                {[
                                    { id: 'excel', label: 'EXCEL', icon: '📊' },
                                    { id: 'csv', label: 'CSV', icon: '📄' },
                                    { id: 'pdf', label: 'PDF', icon: '📕' }
                                ].map((fmt) => {
                                    const isSelected = exportFormat === fmt.id;
                                    return (
                                        <button
                                            key={fmt.id}
                                            type="button"
                                            onClick={() => setExportFormat(fmt.id)}
                                            className={`p-4 sm:p-5 border-2 rounded-2xl transition cursor-pointer text-center select-none ${
                                                isSelected
                                                    ? 'border-violet-600 dark:border-violet-500 bg-violet-50 dark:bg-violet-950/50 ring-2 ring-violet-500/20 shadow-xs'
                                                    : 'border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 hover:border-slate-300 dark:hover:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-800/60'
                                            }`}
                                        >
                                            <div className="text-3xl mb-2 sm:mb-3">{fmt.icon}</div>
                                            <p className={`text-xs sm:text-sm font-bold uppercase tracking-wider transition ${
                                                isSelected ? 'text-violet-700 dark:text-violet-300' : 'text-slate-700 dark:text-zinc-300'
                                            }`}>
                                                {fmt.label}
                                            </p>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Module Selection */}
                        <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xs border border-slate-200/80 dark:border-zinc-800/80 p-5 sm:p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-zinc-100">Select Modules</h3>
                                <button
                                    type="button"
                                    onClick={() => setSelectedModules(selectedModules.length === modules.length ? [] : modules.map(m => m.id))}
                                    className="text-xs sm:text-sm text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 font-semibold transition cursor-pointer"
                                >
                                    {selectedModules.length === modules.length ? 'Deselect All' : 'Select All'}
                                </button>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {modules.map((module) => {
                                    const isSelected = selectedModules.includes(module.id);
                                    return (
                                        <label
                                            key={module.id}
                                            className={`flex items-center p-3.5 sm:p-4 border-2 rounded-xl cursor-pointer transition select-none ${
                                                isSelected
                                                    ? 'border-violet-600 dark:border-violet-500 bg-violet-50 dark:bg-violet-950/40 ring-2 ring-violet-500/20 shadow-xs'
                                                    : 'border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 hover:border-slate-300 dark:hover:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-800/40'
                                            }`}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={isSelected}
                                                onChange={() => toggleModule(module.id)}
                                                className="w-4 h-4 text-violet-600 accent-violet-600 rounded cursor-pointer"
                                            />
                                            <div className="ml-3 flex-1 min-w-0">
                                                <div className="flex items-center justify-between gap-2">
                                                    <p className={`text-sm font-semibold truncate transition ${
                                                        isSelected ? 'text-violet-900 dark:text-violet-100' : 'text-slate-800 dark:text-zinc-200'
                                                    }`}>
                                                        <span className="mr-1.5">{module.icon}</span>
                                                        {module.name}
                                                    </p>
                                                    <span className={`text-xs font-mono font-medium px-2 py-0.5 rounded-md ${
                                                        isSelected
                                                            ? 'bg-violet-200/60 dark:bg-violet-900/60 text-violet-800 dark:text-violet-200'
                                                            : 'bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400'
                                                    }`}>
                                                        {module.count}
                                                    </span>
                                                </div>
                                            </div>
                                        </label>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Date Range Selector */}
                        <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xs border border-slate-200/80 dark:border-zinc-800/80 p-5 sm:p-6">
                            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-zinc-100 mb-4">Date Range</h3>
                            <div>
                                <label className="block text-xs sm:text-sm font-medium text-slate-600 dark:text-zinc-400 mb-1.5">
                                    Select Date Range Filter
                                </label>
                                <DualMonthRangePicker
                                    startDate={dateRange.from}
                                    endDate={dateRange.to}
                                    onChange={({ startDate, endDate }) => setDateRange({ from: startDate, to: endDate })}
                                />
                            </div>
                        </div>

                        {/* Export Settings */}
                        <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xs border border-slate-200/80 dark:border-zinc-800/80 p-5 sm:p-6">
                            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-zinc-100 mb-4">Export Settings</h3>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-zinc-800/60 border border-slate-200/60 dark:border-zinc-800 rounded-xl">
                                    <div>
                                        <p className="text-sm font-semibold text-slate-900 dark:text-zinc-100">Include Headers</p>
                                        <p className="text-xs text-slate-500 dark:text-zinc-400">Add column headers to export</p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={settings.includeHeaders}
                                            onChange={() => toggleSetting('includeHeaders')}
                                            className="sr-only peer"
                                        />
                                        <div className="w-11 h-6 bg-slate-300 dark:bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-violet-600"></div>
                                    </label>
                                </div>

                                <div className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-zinc-800/60 border border-slate-200/60 dark:border-zinc-800 rounded-xl">
                                    <div>
                                        <p className="text-sm font-semibold text-slate-900 dark:text-zinc-100">Compress File</p>
                                        <p className="text-xs text-slate-500 dark:text-zinc-400">Create ZIP archive</p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={settings.compressFile}
                                            onChange={() => toggleSetting('compressFile')}
                                            className="sr-only peer"
                                        />
                                        <div className="w-11 h-6 bg-slate-300 dark:bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-violet-600"></div>
                                    </label>
                                </div>

                                <div className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-zinc-800/60 border border-slate-200/60 dark:border-zinc-800 rounded-xl">
                                    <div>
                                        <p className="text-sm font-semibold text-slate-900 dark:text-zinc-100">Split by Month</p>
                                        <p className="text-xs text-slate-500 dark:text-zinc-400">Create separate files per month</p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={settings.splitByMonth}
                                            onChange={() => toggleSetting('splitByMonth')}
                                            className="sr-only peer"
                                        />
                                        <div className="w-11 h-6 bg-slate-300 dark:bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-violet-600"></div>
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* Export Button */}
                        <button
                            type="button"
                            onClick={handleExport}
                            disabled={selectedModules.length === 0}
                            className="w-full py-3.5 px-6 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 shadow-xs cursor-pointer"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            <span>Export {selectedModules.length} Module{selectedModules.length !== 1 ? 's' : ''}</span>
                        </button>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Storage Usage */}
                        <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xs border border-slate-200/80 dark:border-zinc-800/80 p-5 sm:p-6">
                            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-zinc-100 mb-4">Storage Usage</h3>
                            <div className="mb-3">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400">Used</span>
                                    <span className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-zinc-100">{storageUsed} MB / {storageTotal} MB</span>
                                </div>
                                <div className="w-full bg-slate-100 dark:bg-zinc-800 rounded-full h-2.5 overflow-hidden">
                                    <div
                                        className="bg-gradient-to-r from-violet-600 to-indigo-600 h-2.5 rounded-full transition-all"
                                        style={{ width: `${storagePercentage}%` }}
                                    ></div>
                                </div>
                            </div>
                            <p className="text-xs text-slate-400 dark:text-zinc-500 mt-2">{(storageTotal - storageUsed).toFixed(1)} MB remaining</p>
                        </div>

                        {/* Recent Exports */}
                        <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xs border border-slate-200/80 dark:border-zinc-800/80 p-5 sm:p-6">
                            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-zinc-100 mb-4">Recent Exports</h3>
                            <div className="space-y-3">
                                {recentExports.map((exp) => (
                                    <div key={exp.id} className="p-3 bg-slate-50 dark:bg-zinc-800/60 border border-slate-200/60 dark:border-zinc-800 rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-800 transition">
                                        <div className="flex items-start justify-between mb-1.5">
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-semibold text-slate-900 dark:text-zinc-100 truncate">{exp.name}</p>
                                                <div className="flex items-center space-x-2 mt-1">
                                                    <span className="px-2 py-0.5 text-[11px] font-semibold bg-violet-100 dark:bg-violet-950/60 text-violet-700 dark:text-violet-300 rounded-md">
                                                        {exp.format}
                                                    </span>
                                                    <span className="text-xs text-slate-400 dark:text-zinc-500">{exp.size}</span>
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                className="ml-2 p-1.5 text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 hover:bg-violet-50 dark:hover:bg-violet-950/50 rounded-lg transition cursor-pointer"
                                                title="Download"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                                </svg>
                                            </button>
                                        </div>
                                        <p className="text-[11px] text-slate-400 dark:text-zinc-500">{exp.date}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default DataExport;
