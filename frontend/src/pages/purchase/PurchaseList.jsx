import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import PageHeader from '../../components/PageHeader';
import Button from '../../components/Button';
import Card from '../../components/Card';
import StatsCard from '../../components/StatsCard';
import StatusBadge from '../../components/StatusBadge';
import FormInput from '../../components/FormInput';
import EmptyState from '../../components/EmptyState';
import LoadingSkeleton from '../../components/LoadingSkeleton';
import { getAllPurchases, reset } from '../../redux/slices/purchaseSlice';
import { getAllSuppliers } from '../../redux/slices/supplierSlice';

const PurchaseList = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const { purchases = [], isLoading } = useSelector((state) => state.purchase);
    const { suppliers = [] } = useSelector((state) => state.suppliers);

    const [filters, setFilters] = useState({
        status: '',
        supplier: '',
        startDate: '',
        endDate: '',
    });

    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    useEffect(() => {
        dispatch(getAllPurchases(filters));
        dispatch(getAllSuppliers());
    }, [dispatch]);

    const handleFilterChange = (field, value) => {
        const newFilters = { ...filters, [field]: value };
        setFilters(newFilters);
        dispatch(getAllPurchases(newFilters));
        setCurrentPage(1);
    };

    const handleClearFilters = () => {
        const emptyFilters = { status: '', supplier: '', startDate: '', endDate: '' };
        setFilters(emptyFilters);
        dispatch(getAllPurchases(emptyFilters));
        setCurrentPage(1);
    };

    const filteredPurchases = purchases.filter((purchase) => {
        const matchesSearch =
            purchase.purchaseNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
            purchase.supplier?.businessName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            purchase.supplierInvoiceNo.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesSearch;
    });

    const totalPages = Math.ceil(filteredPurchases.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentPurchases = filteredPurchases.slice(startIndex, endIndex);

    const validPurchases = filteredPurchases.filter(p => p.status !== 'cancelled');
    const totalAmount = validPurchases.reduce((sum, p) => sum + (p.totalAmount || 0), 0);
    const totalPaid = validPurchases.reduce((sum, p) => sum + (p.paidAmount || 0), 0);
    const totalOutstanding = validPurchases.reduce((sum, p) => sum + (p.outstandingAmount || 0), 0);

    return (
        <Layout>
            <div className="space-y-6">
                {/* Header */}
                <PageHeader
                    title="Purchase History & Entries"
                    description="Track supplier purchases, procurement invoices, and payment statuses."
                    actions={
                        <Button
                            onClick={() => navigate('/purchase/entry')}
                            variant="primary"
                            icon={
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                            }
                        >
                            New Purchase Entry
                        </Button>
                    }
                />

                {/* Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatsCard
                        title="Total Purchases"
                        value={validPurchases.length}
                        iconBgColor="bg-violet-50 dark:bg-violet-900/20"
                        iconColor="text-violet-600 dark:text-violet-400"
                        icon={
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                            </svg>
                        }
                    />
                    <StatsCard
                        title="Total Purchase Value"
                        value={`Rs. ${totalAmount.toLocaleString()}`}
                        iconBgColor="bg-blue-50 dark:bg-blue-900/20"
                        iconColor="text-blue-600 dark:text-blue-400"
                        icon={
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        }
                    />
                    <StatsCard
                        title="Amount Paid"
                        value={`Rs. ${totalPaid.toLocaleString()}`}
                        iconBgColor="bg-emerald-50 dark:bg-emerald-900/20"
                        iconColor="text-emerald-600 dark:text-emerald-400"
                        icon={
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        }
                    />
                    <StatsCard
                        title="Outstanding Balance"
                        value={`Rs. ${totalOutstanding.toLocaleString()}`}
                        iconBgColor="bg-rose-50 dark:bg-rose-900/20"
                        iconColor="text-rose-600 dark:text-rose-400"
                        icon={
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        }
                    />
                </div>

                {/* Filters and List Table */}
                <Card padding="none">
                    <div className="p-4 border-b border-gray-100 dark:border-gray-800 space-y-4">
                        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                            <div className="w-full sm:w-80">
                                <FormInput
                                    type="text"
                                    placeholder="Search purchase no, supplier, or invoice no..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    leftIcon={
                                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                        </svg>
                                    }
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <Button variant="secondary" size="xs" onClick={handleClearFilters}>
                                    Reset Filters
                                </Button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                            <select
                                value={filters.status}
                                onChange={(e) => handleFilterChange('status', e.target.value)}
                                className="px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-xl focus:ring-2 focus:ring-violet-500 focus:outline-hidden"
                            >
                                <option value="">All Statuses</option>
                                <option value="draft">Draft</option>
                                <option value="finalized">Finalized</option>
                                <option value="cancelled">Cancelled</option>
                            </select>

                            <select
                                value={filters.supplier}
                                onChange={(e) => handleFilterChange('supplier', e.target.value)}
                                className="px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-xl focus:ring-2 focus:ring-violet-500 focus:outline-hidden"
                            >
                                <option value="">All Suppliers</option>
                                {suppliers.map((s) => (
                                    <option key={s._id} value={s._id}>
                                        {s.businessName}
                                    </option>
                                ))}
                            </select>

                            <FormInput
                                type="date"
                                value={filters.startDate}
                                onChange={(e) => handleFilterChange('startDate', e.target.value)}
                            />

                            <FormInput
                                type="date"
                                value={filters.endDate}
                                onChange={(e) => handleFilterChange('endDate', e.target.value)}
                            />
                        </div>
                    </div>

                    {isLoading ? (
                        <div className="p-6">
                            <LoadingSkeleton type="table" rows={6} />
                        </div>
                    ) : filteredPurchases.length === 0 ? (
                        <EmptyState
                            title="No Purchases Found"
                            description={searchTerm ? "No purchase entries match your criteria." : "Create your first purchase entry to track inventory acquisitions."}
                            actionLabel="New Purchase Entry"
                            onAction={() => navigate('/purchase/entry')}
                        />
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm border-collapse">
                                <thead>
                                    <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/40 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                        <th className="py-3.5 px-6">Purchase No</th>
                                        <th className="py-3.5 px-6">Date</th>
                                        <th className="py-3.5 px-6">Supplier</th>
                                        <th className="py-3.5 px-6">Invoice No</th>
                                        <th className="py-3.5 px-6">Total</th>
                                        <th className="py-3.5 px-6">Status</th>
                                        <th className="py-3.5 px-6">Payment</th>
                                        <th className="py-3.5 px-6 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                    {currentPurchases.map((purchase) => (
                                        <tr key={purchase._id} className="hover:bg-gray-50/60 dark:hover:bg-gray-800/50 transition-colors">
                                            <td className="py-4 px-6 font-semibold text-violet-600 dark:text-violet-400 whitespace-nowrap">
                                                {purchase.purchaseNo}
                                            </td>
                                            <td className="py-4 px-6 text-gray-600 dark:text-gray-300 whitespace-nowrap">
                                                {new Date(purchase.purchaseDate).toLocaleDateString('en-PK')}
                                            </td>
                                            <td className="py-4 px-6">
                                                <div className="font-semibold text-gray-900 dark:text-gray-100">
                                                    {purchase.supplier?.businessName || 'N/A'}
                                                </div>
                                            </td>
                                            <td className="py-4 px-6 text-gray-600 dark:text-gray-300 whitespace-nowrap">
                                                {purchase.supplierInvoiceNo || '—'}
                                            </td>
                                            <td className="py-4 px-6 font-semibold text-gray-900 dark:text-gray-100 whitespace-nowrap">
                                                Rs. {(purchase.totalAmount || 0).toFixed(2)}
                                            </td>
                                            <td className="py-4 px-6 whitespace-nowrap">
                                                <StatusBadge
                                                    status={
                                                        purchase.status === 'finalized'
                                                            ? 'success'
                                                            : purchase.status === 'draft'
                                                            ? 'warning'
                                                            : 'danger'
                                                    }
                                                >
                                                    {purchase.status}
                                                </StatusBadge>
                                            </td>
                                            <td className="py-4 px-6 whitespace-nowrap">
                                                <StatusBadge
                                                    status={
                                                        purchase.paymentStatus === 'paid'
                                                            ? 'success'
                                                            : purchase.paymentStatus === 'partial'
                                                            ? 'warning'
                                                            : 'danger'
                                                    }
                                                >
                                                    {purchase.paymentStatus}
                                                </StatusBadge>
                                            </td>
                                            <td className="py-4 px-6 text-right space-x-2 whitespace-nowrap">
                                                <Button
                                                    size="xs"
                                                    variant="secondary"
                                                    onClick={() => navigate(`/purchase/${purchase._id}`)}
                                                >
                                                    View Details
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Pagination Footer */}
                    {totalPages > 1 && (
                        <div className="p-4 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center">
                            <span className="text-xs text-gray-500">
                                Page {currentPage} of {totalPages}
                            </span>
                            <div className="flex gap-2">
                                <Button
                                    size="xs"
                                    variant="secondary"
                                    disabled={currentPage === 1}
                                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                >
                                    Previous
                                </Button>
                                <Button
                                    size="xs"
                                    variant="secondary"
                                    disabled={currentPage === totalPages}
                                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                >
                                    Next
                                </Button>
                            </div>
                        </div>
                    )}
                </Card>
            </div>
        </Layout>
    );
};

export default PurchaseList;
