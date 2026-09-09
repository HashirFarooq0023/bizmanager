import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useTranslation } from 'react-i18next';

const SalesReportCharts = ({ charts, isLoading }) => {
    const { t } = useTranslation(['reports', 'common']);

    if (isLoading || !charts) {
        return (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="bg-card p-6 rounded-xl border border-border animate-pulse">
                        <div className="h-4 bg-border rounded w-1/3 mb-4"></div>
                        <div className="h-64 bg-border rounded"></div>
                    </div>
                ))}
            </div>
        );
    }

    const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316'];

    // Format sales trend data
    const salesTrendData = charts.salesTrend?.map(item => ({
        date: new Date(item._id).toLocaleDateString('en-PK', { month: 'short', day: 'numeric' }),
        sales: item.totalSales,
        count: item.count,
    })) || [];

    // Format payment methods data
    const paymentMethodsData = charts.paymentMethods?.map(item => ({
        name: item._id?.toUpperCase() || 'UNKNOWN',
        value: item.amount,
        count: item.count,
    })) || [];

    // Format category data
    const categoryData = charts.categoryData?.slice(0, 8) || [];

    // Format top customers data
    const topCustomersData = charts.topCustomers?.map(item => ({
        name: item.customerName?.substring(0, 20) || 'Unknown',
        sales: item.totalSales,
        invoices: item.invoiceCount,
    })) || [];

    // Format top items data
    const topItemsData = charts.topItems?.slice(0, 10).map(item => ({
        name: item.itemName?.substring(0, 20) || 'Unknown',
        amount: item.amount,
        quantity: item.quantity,
    })) || [];

    return (
        <div className="mb-8">
            <h3 className="text-xl font-bold text-main mb-4">{t('reports:visualAnalytics')}</h3>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Sales Trend */}
                {salesTrendData.length > 0 && (
                    <div className="bg-card p-6 rounded-xl border border-border">
                        <h4 className="text-lg font-semibold text-main mb-4">{t('reports:salesTrend')}</h4>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={salesTrendData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                <XAxis dataKey="date" stroke="#9CA3AF" />
                                <YAxis stroke="#9CA3AF" />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px' }}
                                    labelStyle={{ color: '#F3F4F6' }}
                                />
                                <Legend />
                                <Line type="monotone" dataKey="sales" stroke="#3B82F6" strokeWidth={2} name={`${t('reports:sales')} (Rs.)`} />
                                <Line type="monotone" dataKey="count" stroke="#10B981" strokeWidth={2} name={t('reports:totalInvoices')} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                )}

                {/* Payment Methods */}
                {paymentMethodsData.length > 0 && (
                    <div className="bg-card p-6 rounded-xl border border-border">
                        <h4 className="text-lg font-semibold text-main mb-4">{t('reports:paymentMethodsDistribution')}</h4>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={paymentMethodsData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                                    outerRadius={100}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {paymentMethodsData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px' }}
                                    formatter={(value) => `Rs. ${value.toLocaleString('en-PK')}`}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                )}

                {/* Category-wise Sales */}
                {categoryData.length > 0 && (
                    <div className="bg-card p-6 rounded-xl border border-border">
                        <h4 className="text-lg font-semibold text-main mb-4">{t('reports:categoryWiseSales')}</h4>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={categoryData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                <XAxis dataKey="category" stroke="#9CA3AF" />
                                <YAxis stroke="#9CA3AF" />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px' }}
                                    formatter={(value) => `Rs. ${value.toLocaleString('en-PK')}`}
                                />
                                <Legend />
                                <Bar dataKey="amount" fill="#8B5CF6" name={`${t('reports:sales')} (Rs.)`} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                )}

                {/* Top Customers */}
                {topCustomersData.length > 0 && (
                    <div className="bg-card p-6 rounded-xl border border-border">
                        <h4 className="text-lg font-semibold text-main mb-4">{t('reports:topCustomers')}</h4>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={topCustomersData} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                <XAxis type="number" stroke="#9CA3AF" />
                                <YAxis dataKey="name" type="category" stroke="#9CA3AF" width={100} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px' }}
                                    formatter={(value) => `Rs. ${value.toLocaleString('en-PK')}`}
                                />
                                <Legend />
                                <Bar dataKey="sales" fill="#10B981" name={`${t('reports:sales')} (Rs.)`} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                )}

                {/* Top Items */}
                {topItemsData.length > 0 && (
                    <div className="bg-card p-6 rounded-xl border border-border lg:col-span-2">
                        <h4 className="text-lg font-semibold text-main mb-4">{t('reports:topSellingItems')}</h4>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={topItemsData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                <XAxis dataKey="name" stroke="#9CA3AF" />
                                <YAxis stroke="#9CA3AF" />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px' }}
                                    formatter={(value, name) => {
                                        if (name === 'Amount' || name === `${t('reports:gross')} (Rs.)`) return `Rs. ${value.toLocaleString('en-PK')}`;
                                        return value;
                                    }}
                                />
                                <Legend />
                                <Bar dataKey="amount" fill="#F59E0B" name={`${t('reports:gross')} (Rs.)`} />
                                <Bar dataKey="quantity" fill="#3B82F6" name={t('reports:qty')} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                )}

                {/* Profit Trend */}
                {charts.profitTrend && charts.profitTrend.length > 0 && (
                    <div className="bg-card p-6 rounded-xl border border-border lg:col-span-2">
                        <h4 className="text-lg font-semibold text-main mb-4">{t('reports:profitTrend')}</h4>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={charts.profitTrend.map(item => ({
                                date: new Date(item._id).toLocaleDateString('en-PK', { month: 'short', day: 'numeric' }),
                                revenue: item.totalRevenue,
                            }))}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                <XAxis dataKey="date" stroke="#9CA3AF" />
                                <YAxis stroke="#9CA3AF" />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px' }}
                                    formatter={(value) => `Rs. ${value.toLocaleString('en-PK')}`}
                                />
                                <Legend />
                                <Line type="monotone" dataKey="revenue" stroke="#10B981" strokeWidth={2} name="Revenue (Rs. )" />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SalesReportCharts;
