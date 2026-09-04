import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import Layout from '../../components/Layout';
import PageHeader from '../../components/PageHeader';
import Card from '../../components/Card';
import StatusBadge from '../../components/StatusBadge';
import Button from '../../components/Button';
import EmptyState from '../../components/EmptyState';
import LoadingSkeleton from '../../components/LoadingSkeleton';
import Modal from '../../components/Modal';
import { getAllDeliveryChallans, deleteDeliveryChallan, convertToInvoice, reset } from '../../redux/slices/deliveryChallanSlice';

const DeliveryChallanList = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { challans, isLoading, isError, message } = useSelector(state => state.deliveryChallan);

    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [convertConfirm, setConvertConfirm] = useState(null);

    useEffect(() => {
        dispatch(getAllDeliveryChallans());
    }, [dispatch]);

    useEffect(() => {
        if (isError) {
            toast.error(message);
        }
        return () => {
            dispatch(reset());
        };
    }, [isError, message, dispatch]);

    const handleDelete = async (id) => {
        await dispatch(deleteDeliveryChallan(id));
        setDeleteConfirm(null);
        toast.success('Delivery Challan deleted successfully');
        dispatch(getAllDeliveryChallans());
    };

    const handleConvert = async (id) => {
        const result = await dispatch(convertToInvoice(id));
        setConvertConfirm(null);

        if (result.type.includes('fulfilled')) {
            toast.success('Converted to Invoice successfully!');
            navigate(`/sales/invoice/${result.payload.invoice._id}`);
        }
    };

    const filteredChallans = Array.isArray(challans) ? challans.filter(challan => {
        const matchesSearch = challan.challanNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (challan.customer?.name || '').toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || challan.status === statusFilter;
        return matchesSearch && matchesStatus;
    }) : [];

    return (
        <Layout>
            <div className="space-y-6">
                <PageHeader
                    title="Delivery Challans"
                    subtitle="View and manage customer dispatch notes and delivery receipts"
                    backPath="/sales/delivery-challan"
                    action={
                        <Button
                            variant="primary"
                            onClick={() => {
                                dispatch(reset());
                                navigate('/sales/delivery-challan');
                            }}
                            icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>}
                        >
                            Create Challan
                        </Button>
                    }
                />

                <Card noPadding>
                    <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row justify-between items-center gap-4">
                        <div className="w-full sm:w-80 relative">
                            <input
                                type="text"
                                placeholder="Search by challan number or customer..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 text-xs border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-xl focus:ring-2 focus:ring-violet-500/20 focus:outline-none"
                            />
                            <svg
                                className="absolute left-3 top-2.5 w-4 h-4 text-gray-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>

                        <div className="w-full sm:w-auto">
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="w-full px-3 py-2 text-xs border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-xl focus:ring-2 focus:ring-violet-500/20 focus:outline-none"
                            >
                                <option value="all">All Statuses</option>
                                <option value="Draft">Draft</option>
                                <option value="Delivered">Delivered</option>
                                <option value="Converted">Converted</option>
                            </select>
                        </div>
                    </div>

                    {isLoading ? (
                        <div className="p-6">
                            <LoadingSkeleton count={5} />
                        </div>
                    ) : filteredChallans.length === 0 ? (
                        <div className="p-8">
                            <EmptyState
                                title="No delivery challans found"
                                description="Create your first delivery challan to track goods dispatched to customers."
                                actionText="Create Challan"
                                onAction={() => navigate('/sales/delivery-challan')}
                            />
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-xs text-left">
                                <thead className="bg-gray-50/70 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800 font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    <tr>
                                        <th className="px-4 py-3">Challan No</th>
                                        <th className="px-4 py-3">Date</th>
                                        <th className="px-4 py-3">Customer</th>
                                        <th className="px-4 py-3">Items</th>
                                        <th className="px-4 py-3">Status</th>
                                        <th className="px-4 py-3 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-800 bg-white dark:bg-gray-900">
                                    {filteredChallans.map((challan) => (
                                        <tr key={challan._id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
                                            <td className="px-4 py-3 font-semibold text-violet-700 dark:text-violet-400">
                                                {challan.challanNumber}
                                            </td>
                                            <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                                                {new Date(challan.challanDate).toLocaleDateString('en-PK')}
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="font-medium text-gray-900 dark:text-gray-100">{challan.customer?.name || 'N/A'}</div>
                                                {challan.customer?.phone && (
                                                    <div className="text-[11px] text-gray-400">{challan.customer.phone}</div>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                                                {challan.items.length} item(s)
                                            </td>
                                            <td className="px-4 py-3">
                                                <StatusBadge status={challan.status} />
                                            </td>
                                            <td className="px-4 py-3 text-right space-x-1">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => navigate(`/sales/delivery-challan/${challan._id}`)}
                                                >
                                                    View
                                                </Button>
                                                {challan.status !== 'Converted' && (
                                                    <>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => setConvertConfirm(challan._id)}
                                                        >
                                                            Convert
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                                                            onClick={() => setDeleteConfirm(challan._id)}
                                                        >
                                                            Delete
                                                        </Button>
                                                    </>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </Card>

                {/* Modal Confirmations */}
                <Modal
                    isOpen={Boolean(deleteConfirm)}
                    onClose={() => setDeleteConfirm(null)}
                    title="Confirm Delete"
                    size="sm"
                    footer={
                        <div className="flex space-x-3 w-full">
                            <Button variant="secondary" className="w-full" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
                            <Button variant="danger" className="w-full" onClick={() => handleDelete(deleteConfirm)}>Delete</Button>
                        </div>
                    }
                >
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                        Are you sure you want to delete this delivery challan? Dispatched stock reserved for this challan will be restored.
                    </p>
                </Modal>

                <Modal
                    isOpen={Boolean(convertConfirm)}
                    onClose={() => setConvertConfirm(null)}
                    title="Convert to Invoice"
                    size="sm"
                    footer={
                        <div className="flex space-x-3 w-full">
                            <Button variant="secondary" className="w-full" onClick={() => setConvertConfirm(null)}>Cancel</Button>
                            <Button variant="primary" className="w-full" onClick={() => handleConvert(convertConfirm)}>Convert</Button>
                        </div>
                    }
                >
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                        Are you sure you want to convert this delivery challan to a Sales Invoice?
                    </p>
                </Modal>
            </div>
        </Layout>
    );
};

export default DeliveryChallanList;

