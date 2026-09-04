import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import api from '../../services/api';
import { toast } from 'react-toastify';
import PageHeader from '../../components/PageHeader';
import Card from '../../components/Card';
import StatusBadge from '../../components/StatusBadge';
import Button from '../../components/Button';
import EmptyState from '../../components/EmptyState';
import LoadingSkeleton from '../../components/LoadingSkeleton';

const EstimateList = () => {
    const navigate = useNavigate();
    const [estimates, setEstimates] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchEstimates();
    }, []);

    const fetchEstimates = async () => {
        try {
            const user = JSON.parse(localStorage.getItem('user'));
            const response = await api.get(
                `/api/estimates`,
                {
                    headers: { Authorization: `Bearer ${user.token}` }
                }
            );
            setEstimates(response.data);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to fetch estimates');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this estimate?')) return;

        try {
            const user = JSON.parse(localStorage.getItem('user'));
            await api.delete(
                `/api/estimates/${id}`,
                {
                    headers: { Authorization: `Bearer ${user.token}` }
                }
            );
            toast.success('Estimate deleted');
            fetchEstimates();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to delete estimate');
        }
    };

    const filteredEstimates = estimates.filter((est) =>
        est.estimateNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        est.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <Layout>
            <div className="space-y-6">
                <PageHeader
                    title="Estimates / Proforma"
                    subtitle="Create and manage customer quotes and estimates"
                    backPath="/sales/estimate"
                    action={
                        <Button
                            variant="primary"
                            onClick={() => navigate('/sales/estimate')}
                            icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>}
                        >
                            Create Estimate
                        </Button>
                    }
                />

                <Card noPadding>
                    <div className="p-4 border-b border-gray-100 dark:border-gray-800">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search by estimate number or customer..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 text-xs border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-xl focus:ring-2 focus:ring-violet-500/20 focus:outline-none"
                            />
                            <svg
                                className="absolute left-3 top-2.5 w-4 h-4 text-gray-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24">
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                />
                            </svg>
                        </div>
                    </div>

                    {isLoading ? (
                        <div className="p-6">
                            <LoadingSkeleton count={5} />
                        </div>
                    ) : filteredEstimates.length === 0 ? (
                        <div className="p-8">
                            <EmptyState
                                title="No estimates found"
                                description="Create your first proforma estimate to send quotes to customers."
                                actionText="Create Estimate"
                                onAction={() => navigate('/sales/estimate')}
                            />
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-xs text-left">
                                <thead className="bg-gray-50/70 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800 font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    <tr>
                                        <th className="px-4 py-3">Estimate #</th>
                                        <th className="px-4 py-3">Customer</th>
                                        <th className="px-4 py-3">Date</th>
                                        <th className="px-4 py-3">Amount</th>
                                        <th className="px-4 py-3">Status</th>
                                        <th className="px-4 py-3 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-800 bg-white dark:bg-gray-900">
                                    {filteredEstimates.map((estimate) => (
                                        <tr key={estimate._id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
                                            <td className="px-4 py-3 font-semibold text-violet-700 dark:text-violet-400">
                                                {estimate.estimateNo}
                                            </td>
                                            <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100">
                                                {estimate.customer?.name || 'Walk-in Customer'}
                                            </td>
                                            <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                                                {new Date(estimate.createdAt).toLocaleDateString('en-PK')}
                                            </td>
                                            <td className="px-4 py-3 font-semibold text-gray-900 dark:text-gray-100">
                                                Rs. {estimate.totalAmount.toFixed(2)}
                                            </td>
                                            <td className="px-4 py-3">
                                                <StatusBadge status={estimate.status} />
                                            </td>
                                            <td className="px-4 py-3 text-right space-x-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => navigate(`/sales/estimate/${estimate._id}`)}
                                                >
                                                    View
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                                                    onClick={() => handleDelete(estimate._id)}
                                                >
                                                    Delete
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

export default EstimateList;

