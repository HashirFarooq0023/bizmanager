import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import Layout from '../../components/Layout';
import PageHeader from '../../components/PageHeader';
import DualMonthRangePicker from '../../components/DualMonthRangePicker';
import api from '../../services/api';

const PurchaseReturnAnalytics = () => {
    const { t } = useTranslation(['reports', 'common']);
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [dateRange, setDateRange] = useState({
        startDate: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
    });

    useEffect(() => {
        fetchAnalytics();
    }, [dateRange]);

    const fetchAnalytics = async () => {
        try {
            setLoading(true);
            const response = await api.get('/api/purchase-returns/analytics', {
                params: dateRange,
            });
            setAnalytics(response.data);
        } catch (err) {
            console.error('Error fetching analytics:', err);
            toast.error('Failed to fetch analytics');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <Layout>
                <div className="flex items-center justify-center h-64">
                    <p className="text-secondary">{t('reports:loadingAnalytics')}</p>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <PageHeader
                title={t('reports:purchaseReturnAnalytics')}
                description={t('reports:analyzeReturnTrends')}
            />

            {/* Date Range Filter */}
            <div className="bg-card rounded-xl border border-border p-5 mb-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="w-full sm:w-80">
                        <label className="block text-xs font-medium text-main mb-1.5">{t('reports:dateRange') || 'Date Range'}</label>
                        <DualMonthRangePicker
                            startDate={dateRange.startDate}
                            endDate={dateRange.endDate}
                            onChange={({ startDate, endDate }) => setDateRange({ startDate, endDate })}
                        />
                    </div>
                    <button
                        onClick={fetchAnalytics}
                        className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition font-semibold text-sm cursor-pointer shadow-xs"
                    >
                        {t('reports:applyFilter')}
                    </button>
                </div>
            </div>

            {analytics && (
                <>
                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        <div className="bg-card rounded-xl border border-border p-6">
                            <p className="text-sm text-secondary mb-1">{t('reports:totalReturns')}</p>
                            <p className="text-3xl font-bold text-main font-mono">{analytics.totalReturns || 0}</p>
                        </div>
                        <div className="bg-card rounded-xl border border-border p-6">
                            <p className="text-sm text-secondary mb-1">{t('reports:totalValue')}</p>
                            <p className="text-3xl font-bold text-blue-600 font-mono" dir="ltr">
                                Rs. {(analytics.totalValue || 0).toFixed(2)}
                            </p>
                        </div>
                        <div className="bg-card rounded-xl border border-border p-6">
                            <p className="text-sm text-secondary mb-1">{t('reports:avgReturnValue')}</p>
                            <p className="text-3xl font-bold text-green-600 font-mono" dir="ltr">
                                Rs. {(analytics.avgReturnValue || 0).toFixed(2)}
                            </p>
                        </div>
                        <div className="bg-card rounded-xl border border-border p-6">
                            <p className="text-sm text-secondary mb-1">{t('reports:returnRate')}</p>
                            <p className="text-3xl font-bold text-orange-600 font-mono" dir="ltr">
                                {(analytics.returnRate || 0).toFixed(2)}%
                            </p>
                        </div>
                    </div>

                    {/* Top Suppliers by Return Value */}
                    <div className="bg-card rounded-xl border border-border p-6 mb-6">
                        <h3 className="text-lg font-semibold text-main mb-4">{t('reports:topSuppliersByReturn')}</h3>
                        <div className="overflow-x-auto">
                            <table className="min-w-full">
                                <thead className="bg-surface border-b border-border">
                                    <tr>
                                        <th className="px-4 py-2 ltr:text-left rtl:text-right text-xs font-medium text-secondary uppercase">{t('reports:supplier')}</th>
                                        <th className="px-4 py-2 ltr:text-left rtl:text-right text-xs font-medium text-secondary uppercase">{t('reports:returns')}</th>
                                        <th className="px-4 py-2 ltr:text-left rtl:text-right text-xs font-medium text-secondary uppercase">{t('reports:totalValue')}</th>
                                        <th className="px-4 py-2 ltr:text-left rtl:text-right text-xs font-medium text-secondary uppercase">{t('reports:returnRate')}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {analytics.topSuppliers?.map((supplier, index) => (
                                        <tr key={index}>
                                            <td className="px-4 py-3 text-sm font-medium text-main">
                                                {supplier.supplierName}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-main font-mono">{supplier.returnCount}</td>
                                            <td className="px-4 py-3 text-sm font-semibold text-main font-mono" dir="ltr">
                                                Rs. {supplier.totalValue.toFixed(2)}
                                            </td>
                                            <td className="px-4 py-3 text-sm font-mono" dir="ltr">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${supplier.returnRate > 10 ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300' :
                                                        supplier.returnRate > 5 ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300' :
                                                            'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                                                    }`}>
                                                    {supplier.returnRate.toFixed(2)}%
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Top Return Reasons */}
                    <div className="bg-card rounded-xl border border-border p-6 mb-6">
                        <h3 className="text-lg font-semibold text-main mb-4">{t('reports:topReturnReasons')}</h3>
                        <div className="space-y-3">
                            {analytics.topReasons?.map((reason, index) => (
                                <div key={index} className="flex items-center">
                                    <div className="flex-1">
                                        <div className="flex justify-between mb-1">
                                            <span className="text-sm font-medium text-main">{reason.reason}</span>
                                            <span className="text-sm text-secondary">{reason.count} {t('reports:returns')}</span>
                                        </div>
                                        <div className="w-full bg-border rounded-full h-2">
                                            <div
                                                className="bg-blue-600 h-2 rounded-full"
                                                style={{ width: `${(reason.count / analytics.totalReturns) * 100}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Disposition Breakdown */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div className="bg-card rounded-xl border border-border p-6">
                            <h3 className="text-lg font-semibold text-main mb-4">{t('reports:dispositionBreakdown')}</h3>
                            <div className="space-y-3">
                                {analytics.dispositionBreakdown?.map((item, index) => (
                                    <div key={index} className="flex justify-between items-center">
                                        <span className="text-sm text-secondary capitalize">{item.disposition.replace('_', ' ')}</span>
                                        <div className="flex items-center space-x-2 rtl:space-x-reverse">
                                            <span className="text-sm font-medium text-main">{item.count} {t('reports:items')}</span>
                                            <span className="text-xs text-muted">
                                                ({((item.count / analytics.totalItems) * 100).toFixed(1)}%)
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-card rounded-xl border border-border p-6">
                            <h3 className="text-lg font-semibold text-main mb-4">{t('reports:conditionBreakdown')}</h3>
                            <div className="space-y-3">
                                {analytics.conditionBreakdown?.map((item, index) => (
                                    <div key={index} className="flex justify-between items-center">
                                        <span className="text-sm text-secondary capitalize">{item.condition}</span>
                                        <div className="flex items-center space-x-2 rtl:space-x-reverse">
                                            <span className="text-sm font-medium text-main">{item.count} {t('reports:items')}</span>
                                            <span className="text-xs text-muted">
                                                ({((item.count / analytics.totalItems) * 100).toFixed(1)}%)
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Financial Impact */}
                    <div className="bg-card rounded-xl border border-border p-6">
                        <h3 className="text-lg font-semibold text-main mb-4">{t('reports:financialImpact')}</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-surface p-4 rounded-lg border border-border">
                                <p className="text-sm text-secondary mb-1">{t('reports:totalRefunded')}</p>
                                <p className="text-2xl font-bold text-red-600 font-mono" dir="ltr">
                                    Rs. {(analytics.totalRefunded || 0).toFixed(2)}
                                </p>
                            </div>
                            <div className="bg-surface p-4 rounded-lg border border-border">
                                <p className="text-sm text-secondary mb-1">{t('reports:payableAdjusted')}</p>
                                <p className="text-2xl font-bold text-blue-600 font-mono" dir="ltr">
                                    Rs. {(analytics.payableAdjusted || 0).toFixed(2)}
                                </p>
                            </div>
                            <div className="bg-surface p-4 rounded-lg border border-border">
                                <p className="text-sm text-secondary mb-1">{t('reports:creditNotesIssued')}</p>
                                <p className="text-2xl font-bold text-green-600 font-mono" dir="ltr">
                                    Rs. {(analytics.creditNotesIssued || 0).toFixed(2)}
                                </p>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </Layout>
    );
};

export default PurchaseReturnAnalytics;
