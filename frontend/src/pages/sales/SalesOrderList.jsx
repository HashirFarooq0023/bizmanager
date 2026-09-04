import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { toast } from 'react-toastify';
import Layout from '../../components/Layout';
import PageHeader from '../../components/PageHeader';
import Card from '../../components/Card';
import StatsCard from '../../components/StatsCard';
import StatusBadge from '../../components/StatusBadge';
import Button from '../../components/Button';
import LoadingSkeleton from '../../components/LoadingSkeleton';
import EmptyState from '../../components/EmptyState';

const SalesOrderList = () => {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        status: '',
        search: '',
        overdue: false
    });

    useEffect(() => {
        fetchOrders();
    }, [filters]);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            const token = user?.token;
            const params = new URLSearchParams();
            if (filters.status) params.append('status', filters.status);
            if (filters.overdue) params.append('overdue', 'true');

            const response = await api.get(
                `/api/sales-orders?${params.toString()}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            let fetchedOrders = response.data;

            if (filters.search) {
                const searchLower = filters.search.toLowerCase();
                fetchedOrders = fetchedOrders.filter(order =>
                    order.orderNumber.toLowerCase().includes(searchLower) ||
                    order.customer?.name.toLowerCase().includes(searchLower)
                );
            }

            setOrders(fetchedOrders);
        } catch (error) {
            console.error('Error fetching orders:', error);
            toast.error('Failed to fetch sales orders');
        } finally {
            setLoading(false);
        }
    };

    const isOverdue = (order) => {
        if (order.status === 'Invoiced' || order.status === 'Cancelled') return false;
        const expectedDate = new Date(order.expectedDeliveryDate);
        const now = new Date();
        return expectedDate < now;
    };

    return (
        <Layout>
            <div className="space-y-6">
                <PageHeader
                    title="Sales Orders"
                    subtitle="View and manage all sales orders and order statuses"
                    backPath="/sales/sales-order"
                    action={
                        <Button
                            variant="primary"
                            onClick={() => navigate('/sales/sales-order')}
                            icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>}
                        >
                            New Sales Order
                        </Button>
                    }
                />

                {/* Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatsCard
                        title="Total Orders"
                        value={orders.length}
                        color="indigo"
                        icon={
                            <svg className="w-5 h-5 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        }
                    />

                    <StatsCard
                        title="Confirmed Orders"
                        value={orders.filter(o => o.status === 'Confirmed' || o.status === 'Partially Delivered' || o.status === 'Delivered').length}
                        color="emerald"
                        icon={
                            <svg className="w-5 h-5 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        }
                    />

                    <StatsCard
                        title="Total Amount"
                        value={`Rs. ${orders.reduce((sum, o) => sum + o.totalAmount, 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`}
                        color="violet"
                        icon={
                            <svg className="w-5 h-5 text-violet-600 dark:text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        }
                    />

                    <StatsCard
                        title="Overdue Orders"
                        value={orders.filter(o => isOverdue(o)).length}
                        color="rose"
                        icon={
                            <svg className="w-5 h-5 text-rose-600 dark:text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        }
                    />
                </div>

                <Card noPadding>
                    {/* Filter toolbar */}
                    <div className="p-4 border-b border-gray-100 dark:border-gray-800 grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Search</label>
                            <input
                                type="text"
                                placeholder="Order No or Customer..."
                                value={filters.search}
                                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                                className="w-full px-3 py-2 text-xs border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-xl focus:ring-2 focus:ring-violet-500/20 focus:outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Status</label>
                            <select
                                value={filters.status}
                                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                                className="w-full px-3 py-2 text-xs border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-xl focus:ring-2 focus:ring-violet-500/20 focus:outline-none"
                            >
                                <option value="">All Statuses</option>
                                <option value="Draft">Draft</option>
                                <option value="Confirmed">Confirmed</option>
                                <option value="Partially Delivered">Partially Delivered</option>
                                <option value="Delivered">Delivered</option>
                                <option value="Partially Invoiced">Partially Invoiced</option>
                                <option value="Invoiced">Invoiced</option>
                                <option value="Cancelled">Cancelled</option>
                            </select>
                        </div>
                        <div className="flex items-center h-9">
                            <label className="flex items-center gap-2 cursor-pointer select-none">
                                <input
                                    type="checkbox"
                                    checked={filters.overdue}
                                    onChange={(e) => setFilters({ ...filters, overdue: e.target.checked })}
                                    className="w-4 h-4 text-violet-600 rounded border-gray-300 focus:ring-violet-500"
                                />
                                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Overdue Only</span>
                            </label>
                        </div>
                        <div>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setFilters({ status: '', search: '', overdue: false })}
                                className="w-full"
                            >
                                Reset Filters
                            </Button>
                        </div>
                    </div>

                    {/* Table */}
                    {loading ? (
                        <div className="p-6">
                            <LoadingSkeleton count={5} />
                        </div>
                    ) : orders.length === 0 ? (
                        <div className="p-8">
                            <EmptyState
                                title="No sales orders found"
                                description="Create your first sales order to start tracking customer orders."
                                actionText="Create Sales Order"
                                onAction={() => navigate('/sales/sales-order')}
                            />
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-xs text-left">
                                <thead className="bg-gray-50/70 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800 font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    <tr>
                                        <th className="px-4 py-3">Order No</th>
                                        <th className="px-4 py-3">Customer</th>
                                        <th className="px-4 py-3">Order Date</th>
                                        <th className="px-4 py-3">Expected Delivery</th>
                                        <th className="px-4 py-3">Status</th>
                                        <th className="px-4 py-3">Total Amount</th>
                                        <th className="px-4 py-3 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-800 bg-white dark:bg-gray-900">
                                    {orders.map((order) => (
                                        <tr
                                            key={order._id}
                                            className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors"
                                            onClick={() => navigate(`/sales/sales-order/${order._id}`)}
                                        >
                                            <td className="px-4 py-3 font-semibold text-violet-700 dark:text-violet-400">
                                                {order.orderNumber}
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="font-medium text-gray-900 dark:text-gray-100">{order.customer?.name || 'N/A'}</div>
                                                <div className="text-[11px] text-gray-400">{order.customer?.phone}</div>
                                            </td>
                                            <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                                                {new Date(order.orderDate).toLocaleDateString()}
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="text-gray-600 dark:text-gray-400">
                                                    {new Date(order.expectedDeliveryDate).toLocaleDateString()}
                                                </div>
                                                {isOverdue(order) && (
                                                    <span className="text-[10px] font-bold text-rose-600 uppercase tracking-wide">Overdue</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3">
                                                <StatusBadge status={order.status} />
                                            </td>
                                            <td className="px-4 py-3 font-semibold text-gray-900 dark:text-gray-100">
                                                Rs. {order.totalAmount.toFixed(2)}
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        navigate(`/sales/sales-order/${order._id}`);
                                                    }}
                                                >
                                                    View
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </Card>
            </div>
        </Layout>
    );
};

export default SalesOrderList;

