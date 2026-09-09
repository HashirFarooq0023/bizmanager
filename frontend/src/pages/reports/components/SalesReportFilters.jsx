import { useState } from 'react';
import { useTranslation } from 'react-i18next';

const SalesReportFilters = ({ filters, onFilterChange, onReset }) => {
    const { t } = useTranslation(['reports', 'common']);
    const [localFilters, setLocalFilters] = useState(filters);

    const datePresets = [
        { label: t('reports:today'), value: 'today' },
        { label: t('reports:yesterday'), value: 'yesterday' },
        { label: t('reports:thisWeek'), value: 'this_week' },
        { label: t('reports:lastWeek'), value: 'last_week' },
        { label: t('reports:thisMonth'), value: 'this_month' },
        { label: t('reports:lastMonth'), value: 'last_month' },
        { label: t('reports:thisQuarter'), value: 'this_quarter' },
        { label: t('reports:financialYear'), value: 'financial_year' },
        { label: t('reports:custom'), value: 'custom' },
    ];

    const paymentStatuses = ['paid', 'unpaid', 'partial'];
    const paymentMethods = ['cash', 'upi', 'card', 'bank_transfer', 'cheque', 'due'];

    const getStatusLabel = (status) => {
        switch (status) {
            case 'paid': return t('reports:paid');
            case 'unpaid': return t('reports:unpaid');
            case 'partial': return t('reports:partial');
            default: return status.charAt(0).toUpperCase() + status.slice(1);
        }
    };

    const handleDatePresetChange = (preset) => {
        const updated = { ...localFilters, dateFilter: preset };
        if (preset !== 'custom') {
            updated.customStartDate = null;
            updated.customEndDate = null;
        }
        setLocalFilters(updated);
    };

    const handleInputChange = (field, value) => {
        setLocalFilters({ ...localFilters, [field]: value });
    };

    const handleMultiSelectChange = (field, value) => {
        const current = localFilters[field] || [];
        const updated = current.includes(value)
            ? current.filter((v) => v !== value)
            : [...current, value];
        setLocalFilters({ ...localFilters, [field]: updated });
    };

    const handleApply = () => {
        onFilterChange(localFilters);
    };

    const handleReset = () => {
        setLocalFilters({
            dateFilter: 'this_month',
            customStartDate: null,
            customEndDate: null,
            invoiceNo: '',
            paymentStatus: [],
            paymentMethod: [],
            customerId: null,
        });
        onReset();
    };

    return (
        <div className="bg-card p-6 rounded-xl border border-border mb-6">
            <h3 className="text-lg font-bold text-main mb-4">{t('reports:advancedFilters')}</h3>

            {/* Date Filters */}
            <div className="mb-6">
                <label className="block text-sm font-medium text-main mb-2">{t('reports:dateRange')}</label>
                <div className="flex flex-wrap gap-2 mb-3">
                    {datePresets.map((preset) => (
                        <button
                            key={preset.value}
                            onClick={() => handleDatePresetChange(preset.value)}
                            className={`px-4 py-2 rounded-lg border transition ${localFilters.dateFilter === preset.value
                                ? 'bg-blue-600 text-white border-blue-600'
                                : 'bg-card text-main border-border hover:border-blue-400'
                                }`}
                        >
                            {preset.label}
                        </button>
                    ))}
                </div>

                {localFilters.dateFilter === 'custom' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm text-secondary mb-1">{t('reports:startDate')}</label>
                            <input
                                type="date"
                                dir="ltr"
                                value={localFilters.customStartDate || ''}
                                onChange={(e) => handleInputChange('customStartDate', e.target.value)}
                                className="w-full px-4 py-2 bg-card border border-border rounded-lg text-main focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-secondary mb-1">{t('reports:endDate')}</label>
                            <input
                                type="date"
                                dir="ltr"
                                value={localFilters.customEndDate || ''}
                                onChange={(e) => handleInputChange('customEndDate', e.target.value)}
                                className="w-full px-4 py-2 bg-card border border-border rounded-lg text-main focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Transaction Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                    <label className="block text-sm font-medium text-main mb-2">{t('reports:invoiceNumber')}</label>
                    <input
                        type="text"
                        dir="ltr"
                        placeholder={t('reports:searchByInvoice')}
                        value={localFilters.invoiceNo || ''}
                        onChange={(e) => handleInputChange('invoiceNo', e.target.value)}
                        className="w-full px-4 py-2 bg-card border border-border rounded-lg text-main focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-main mb-2">{t('reports:paymentStatus')}</label>
                    <div className="flex flex-wrap gap-2">
                        {paymentStatuses.map((status) => (
                            <button
                                key={status}
                                onClick={() => handleMultiSelectChange('paymentStatus', status)}
                                className={`px-3 py-1 rounded-lg border text-sm transition ${localFilters.paymentStatus?.includes(status)
                                    ? 'bg-green-600 text-white border-green-600'
                                    : 'bg-card text-main border-border hover:border-green-400'
                                    }`}
                            >
                                {getStatusLabel(status)}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="mb-6">
                <label className="block text-sm font-medium text-main mb-2">{t('reports:paymentMethod')}</label>
                <div className="flex flex-wrap gap-2">
                    {paymentMethods.map((method) => (
                        <button
                            key={method}
                            onClick={() => handleMultiSelectChange('paymentMethod', method)}
                            className={`px-3 py-1 rounded-lg border text-sm transition ${localFilters.paymentMethod?.includes(method)
                                ? 'bg-purple-600 text-white border-purple-600'
                                : 'bg-card text-main border-border hover:border-purple-400'
                                }`}
                        >
                            {method.toUpperCase().replace('_', ' ')}
                        </button>
                    ))}
                </div>
            </div>

            {/* Item Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                    <label className="block text-sm font-medium text-main mb-2">{t('reports:itemCategory')}</label>
                    <input
                        type="text"
                        placeholder={t('reports:searchByCategory')}
                        value={localFilters.itemCategory || ''}
                        onChange={(e) => handleInputChange('itemCategory', e.target.value)}
                        className="w-full px-4 py-2 bg-card border border-border rounded-lg text-main focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-main mb-2">{t('reports:itemSku')}</label>
                    <input
                        type="text"
                        dir="ltr"
                        placeholder={t('reports:searchBySku')}
                        value={localFilters.itemSku || ''}
                        onChange={(e) => handleInputChange('itemSku', e.target.value)}
                        className="w-full px-4 py-2 bg-card border border-border rounded-lg text-main focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                    />
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
                <button
                    onClick={handleApply}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                >
                    {t('reports:applyFilters')}
                </button>
                <button
                    onClick={handleReset}
                    className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition font-medium"
                >
                    {t('reports:reset')}
                </button>
            </div>
        </div>
    );
};

export default SalesReportFilters;
