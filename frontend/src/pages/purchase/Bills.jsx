import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { toast } from 'react-toastify';
import Layout from '../../components/Layout';
import PageHeader from '../../components/PageHeader';
import Card from '../../components/Card';
import StatsCard from '../../components/StatsCard';
import StatusBadge from '../../components/StatusBadge';
import Button from '../../components/Button';
import DataTable from '../../components/DataTable';
import PaymentModal from '../../components/PaymentModal';
import Modal from '../../components/Modal';
import {
    getAllBills,
    deleteBill,
    recordPayment,
    approveBill,
    rejectBill,
    getBillAnalytics,
    reset
} from '../../redux/slices/billSlice';
import { getAllSuppliers } from '../../redux/slices/supplierSlice';
import { useTranslation } from 'react-i18next';

const Bills = () => {
    const { t } = useTranslation(['purchase', 'common']);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { bills, analytics, isLoading, isError, message } = useSelector(state => state.bill);
    const { suppliers } = useSelector(state => state.suppliers);

    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [agingFilter, setAgingFilter] = useState('all');
    const [supplierFilter, setSupplierFilter] = useState('all');
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [paymentModal, setPaymentModal] = useState({ isOpen: false, bill: null });
    const [approvalModal, setApprovalModal] = useState({ isOpen: false, bill: null, action: null });
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    useEffect(() => {
        dispatch(getAllBills());
        dispatch(getAllSuppliers());
        dispatch(getBillAnalytics());
        return () => {
            dispatch(reset());
        };
    }, [dispatch]);

    const calculateAging = (bill) => {
        if (!bill.dueDate) return { days: 0, bucket: 'Not Due' };
        const today = new Date();
        const due = new Date(bill.dueDate);
        if (today <= due) {
            const isDueToday = today.toDateString() === due.toDateString();
            return { days: 0, bucket: isDueToday ? 'Due Today' : 'Not Due' };
        }
        const diffTime = Math.abs(today - due);
        const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        let bucket = 'Not Due';
        if (days <= 30) bucket = '1-30 Days';
        else if (days <= 60) bucket = '31-60 Days';
        else bucket = '60+ Days';
        return { days, bucket };
    };

    const handleMarkAsPaid = (bill) => {
        setPaymentModal({ isOpen: true, bill });
    };

    const handlePaymentSubmit = async (paymentData) => {
        try {
            await dispatch(recordPayment({
                id: paymentModal.bill._id,
                paymentData
            })).unwrap();
            toast.success('Payment recorded successfully');
            setPaymentModal({ isOpen: false, bill: null });
            dispatch(getAllBills());
            dispatch(getBillAnalytics());
        } catch (error) {
            toast.error(error.message || 'Failed to record payment');
        }
    };

    const handleApprove = async (bill) => {
        try {
            await dispatch(approveBill(bill._id)).unwrap();
            toast.success('Bill approved');
            dispatch(getAllBills());
            dispatch(getBillAnalytics());
        } catch (error) {
            toast.error(error.message || 'Failed to approve bill');
        }
    };

    const handleDelete = async (id) => {
        try {
            await dispatch(deleteBill(id)).unwrap();
            toast.success('Bill deleted successfully');
            setDeleteConfirm(null);
            dispatch(getAllBills());
            dispatch(getBillAnalytics());
        } catch (error) {
            toast.error(error.message || 'Failed to delete bill');
        }
    };

    const handleViewDetail = (bill) => {
        navigate(`/purchase/bills/${bill._id}`);
    };

    const columns = [
        {
            key: 'billNo',
            label: t('invoiceNumber', 'Bill / Invoice #'),
            sortable: true,
            render: (val, row) => (
                <div>
                    <span className="font-semibold text-violet-700 dark:text-violet-400">{val}</span>
                    {row.supplierInvoiceNo && (
                        <span className="block text-[10px] text-gray-400">Inv: {row.supplierInvoiceNo}</span>
                    )}
                </div>
            )
        },
        {
            key: 'supplier',
            label: t('common:supplier', 'Supplier'),
            render: (val) => (
                <span className="font-medium text-gray-900 dark:text-gray-100">{val?.businessName || 'N/A'}</span>
            )
        },
        {
            key: 'billDate',
            label: t('supplierInvoiceDate', 'Bill Date'),
            sortable: true,
            render: (val) => <span className="text-gray-600 dark:text-gray-400">{new Date(val).toLocaleDateString()}</span>
        },
        {
            key: 'dueDate',
            label: t('dueDate', 'Due Date'),
            sortable: true,
            render: (val, row) => {
                if (!val) return 'N/A';
                const aging = calculateAging(row);
                const isOverdue = aging.days > 0;
                return (
                    <div className="flex flex-col">
                        <span className={isOverdue ? 'text-rose-600 font-semibold' : 'text-gray-600 dark:text-gray-400'}>
                            {new Date(val).toLocaleDateString()}
                        </span>
                        {isOverdue && (
                            <span className="text-[10px] font-bold text-rose-500">
                                {t('daysOverdue', { days: aging.days, defaultValue: `${aging.days}d overdue` })}
                            </span>
                        )}
                    </div>
                );
            }
        },
        {
            key: 'totalAmount',
            label: t('billAmount', 'Bill Amount'),
            sortable: true,
            render: (val) => <span className="font-semibold text-gray-900 dark:text-gray-100">Rs. {val.toFixed(2)}</span>
        },
        {
            key: 'paidAmount',
            label: t('paid', 'Paid'),
            render: (val) => val > 0 ?
                <span className="text-emerald-600 dark:text-emerald-400 font-medium">Rs. {val.toFixed(2)}</span> :
                <span className="text-gray-400">Rs. 0.00</span>
        },
        {
            key: 'outstandingAmount',
            label: t('outstanding', 'Outstanding'),
            render: (val) => val > 0 ?
                <span className="text-rose-600 dark:text-rose-400 font-medium">Rs. {val.toFixed(2)}</span> :
                <span className="text-gray-400">Rs. 0.00</span>
        },
        {
            key: 'paymentStatus',
            label: t('common:status', 'Status'),
            render: (val) => <StatusBadge status={val} />
        },
        {
            key: 'actions',
            label: t('common:actions', 'Actions'),
            render: (val, row) => (
                <div className="flex items-center space-x-1 justify-end">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewDetail(row)}
                    >
                        {t('common:view', 'View')}
                    </Button>
                    {row.approvalStatus === 'draft' && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleApprove(row)}
                        >
                            {t('approve', 'Approve')}
                        </Button>
                    )}
                    {row.paymentStatus !== 'paid' && row.approvalStatus === 'approved' && (
                        <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleMarkAsPaid(row)}
                        >
                            {t('pay', 'Pay')}
                        </Button>
                    )}
                    {!row.isLocked && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                            onClick={() => setDeleteConfirm(row._id)}
                        >
                            {t('common:delete', 'Delete')}
                        </Button>
                    )}
                </div>
            )
        }
    ];

    const filteredBills = bills.filter(bill => {
        const matchesSearch =
            bill.billNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (bill.supplier?.businessName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (bill.supplierInvoiceNo || '').toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = statusFilter === 'all' || bill.paymentStatus === statusFilter;
        const matchesSupplier = supplierFilter === 'all' || bill.supplier?._id === supplierFilter;

        const aging = calculateAging(bill);
        const matchesAging = agingFilter === 'all' || aging.bucket === agingFilter;

        return matchesSearch && matchesStatus && matchesSupplier && matchesAging;
    });

    return (
        <Layout>
            <div className="space-y-6">
                <PageHeader
                    title={t('purchase:billsTitle', 'Bills (Accounts Payable)')}
                    subtitle={t('purchase:billsSubtitle', 'Track and manage supplier purchase bills, payments, and liabilities')}
                    action={
                        <div className="flex gap-2">
                            <Button
                                variant="secondary"
                                onClick={() => navigate('/purchase/bills/aging')}
                            >
                                {t('purchase:agingReport', 'Aging Report')}
                            </Button>
                            <Button
                                variant="primary"
                                onClick={() => navigate('/purchase/bills/new')}
                                icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>}
                            >
                                {t('purchase:newBill', 'New Bill')}
                            </Button>
                        </div>
                    }
                />

                {/* Analytics Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                    <StatsCard
                        title={t('purchase:totalBills', 'Total Bills')}
                        value={analytics?.totalBills || bills.length}
                        color="indigo"
                        icon={
                            <svg className="w-5 h-5 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        }
                    />

                    <StatsCard
                        title={t('purchase:billAmount', 'Total Amount')}
                        value={`Rs. ${(analytics?.totalBillAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 0 })}`}
                        color="violet"
                        icon={
                            <svg className="w-5 h-5 text-violet-600 dark:text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        }
                    />

                    <StatsCard
                        title={t('purchase:paid', 'Amount Paid')}
                        value={`Rs. ${(analytics?.totalPaid || 0).toLocaleString('en-IN', { minimumFractionDigits: 0 })}`}
                        color="emerald"
                        icon={
                            <svg className="w-5 h-5 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        }
                    />

                    <StatsCard
                        title={t('purchase:outstanding', 'Outstanding')}
                        value={`Rs. ${(analytics?.totalOutstanding || 0).toLocaleString('en-IN', { minimumFractionDigits: 0 })}`}
                        color="amber"
                        icon={
                            <svg className="w-5 h-5 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        }
                    />

                    <StatsCard
                        title={t('purchase:overdue', 'Overdue')}
                        value={`Rs. ${(analytics?.totalOverdue || 0).toLocaleString('en-IN', { minimumFractionDigits: 0 })}`}
                        color="rose"
                        icon={
                            <svg className="w-5 h-5 text-rose-600 dark:text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        }
                    />
                </div>

                <Card noPadding>
                    <div className="p-4 border-b border-gray-100 dark:border-gray-800 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder={t('purchase:searchBillsPlaceholder', 'Search by bill no, supplier...')}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 text-xs border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-xl focus:ring-2 focus:ring-violet-500/20 focus:outline-none"
                            />
                            <svg className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>

                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-3 py-2 text-xs border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-xl focus:ring-2 focus:ring-violet-500/20 focus:outline-none"
                        >
                            <option value="all">{t('purchase:allPaymentStatuses', 'All Payment Statuses')}</option>
                            <option value="unpaid">{t('pos:unpaid', 'Unpaid')}</option>
                            <option value="partial">{t('pos:partial', 'Partial')}</option>
                            <option value="paid">{t('pos:paid', 'Paid')}</option>
                            <option value="overdue">{t('purchase:overdue', 'Overdue')}</option>
                        </select>

                        <select
                            value={agingFilter}
                            onChange={(e) => setAgingFilter(e.target.value)}
                            className="px-3 py-2 text-xs border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-xl focus:ring-2 focus:ring-violet-500/20 focus:outline-none"
                        >
                            <option value="all">{t('purchase:allAging', 'All Aging')}</option>
                            <option value="Not Due">{t('common:notDue', 'Not Due')}</option>
                            <option value="Due Today">{t('common:dueToday', 'Due Today')}</option>
                            <option value="1-30 Days">1-30 Days</option>
                            <option value="31-60 Days">31-60 Days</option>
                            <option value="60+ Days">60+ Days</option>
                        </select>

                        <select
                            value={supplierFilter}
                            onChange={(e) => setSupplierFilter(e.target.value)}
                            className="px-3 py-2 text-xs border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-xl focus:ring-2 focus:ring-violet-500/20 focus:outline-none"
                        >
                            <option value="all">{t('purchase:allSuppliers', 'All Suppliers')}</option>
                            {suppliers.map(supplier => (
                                <option key={supplier._id} value={supplier._id}>
                                    {supplier.businessName}
                                </option>
                            ))}
                        </select>
                    </div>

                    <DataTable
                        columns={columns}
                        data={filteredBills.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)}
                        emptyMessage={searchTerm ? t('common:noResultsMatch', 'No bills match your search criteria') : t('purchase:noBills', 'No purchase bills recorded')}
                        isLoading={isLoading}
                    />

                    {filteredBills.length > 0 && (
                        <div className="p-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                            <div className="text-xs text-gray-500">
                                {t('purchase:showingBills', { from: ((currentPage - 1) * itemsPerPage) + 1, to: Math.min(currentPage * itemsPerPage, filteredBills.length), total: filteredBills.length, defaultValue: `Showing ${((currentPage - 1) * itemsPerPage) + 1} to ${Math.min(currentPage * itemsPerPage, filteredBills.length)} of ${filteredBills.length} bills` })}
                            </div>
                            <div className="flex items-center space-x-2">
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                    isDisabled={currentPage === 1}
                                >
                                    {t('common:previous', 'Previous')}
                                </Button>
                                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                                    {t('purchase:pageOf', { current: currentPage, total: Math.ceil(filteredBills.length / itemsPerPage) || 1, defaultValue: `Page ${currentPage} of ${Math.ceil(filteredBills.length / itemsPerPage) || 1}` })}
                                </span>
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    onClick={() => setCurrentPage(prev => Math.min(Math.ceil(filteredBills.length / itemsPerPage), prev + 1))}
                                    isDisabled={currentPage >= Math.ceil(filteredBills.length / itemsPerPage)}
                                >
                                    {t('common:next', 'Next')}
                                </Button>
                            </div>
                        </div>
                    )}
                </Card>

                {/* Delete Modal */}
                <Modal
                    isOpen={Boolean(deleteConfirm)}
                    onClose={() => setDeleteConfirm(null)}
                    title={t('purchase:confirmDelete', 'Confirm Delete')}
                    size="sm"
                    footer={
                        <div className="flex space-x-3 w-full">
                            <Button variant="secondary" className="w-full" onClick={() => setDeleteConfirm(null)}>{t('common:cancel', 'Cancel')}</Button>
                            <Button variant="danger" className="w-full" onClick={() => handleDelete(deleteConfirm)}>{t('common:delete', 'Delete')}</Button>
                        </div>
                    }
                >
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                        {t('purchase:deleteBillConfirm', 'Are you sure you want to delete this bill? This action cannot be undone.')}
                    </p>
                </Modal>

                {/* Payment Modal */}
                {paymentModal.isOpen && paymentModal.bill && (
                    <PaymentModal
                        isOpen={paymentModal.isOpen}
                        onClose={() => setPaymentModal({ isOpen: false, bill: null })}
                        onSubmit={handlePaymentSubmit}
                        documentType="Bill"
                        totalAmount={paymentModal.bill.totalAmount}
                        paidAmount={paymentModal.bill.paidAmount || 0}
                    />
                )}
            </div>
        </Layout>
    );
};

export default Bills;
