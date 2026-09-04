import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
    getAllPurchaseOrders,
    deletePurchaseOrder,
    submitForApproval,
    approvePurchaseOrder,
    rejectPurchaseOrder,
    cancelPurchaseOrder,
    duplicatePurchaseOrder,
    setFilters,
    clearFilters,
    setPagination,
    reset,
} from "../../redux/slices/purchaseOrderSlice";
import { toast } from "react-toastify";
import Layout from "../../components/Layout";
import PageHeader from "../../components/PageHeader";
import Card from "../../components/Card";
import StatsCard from "../../components/StatsCard";
import StatusBadge from "../../components/StatusBadge";
import Button from "../../components/Button";
import EmptyState from "../../components/EmptyState";
import LoadingSkeleton from "../../components/LoadingSkeleton";
import Modal from "../../components/Modal";

const PurchaseOrderList = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { purchaseOrders, filters, pagination, isLoading, isError, isSuccess, message } =
        useSelector((state) => state.purchaseOrder);

    const [showFilters, setShowFilters] = useState(false);
    const [selectedPO, setSelectedPO] = useState(null);
    const [showApprovalModal, setShowApprovalModal] = useState(false);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [approvalComments, setApprovalComments] = useState("");
    const [rejectionReason, setRejectionReason] = useState("");
    const [cancellationReason, setCancellationReason] = useState("");

    useEffect(() => {
        dispatch(getAllPurchaseOrders({ ...filters, ...pagination }));
    }, [dispatch, filters, pagination.page]);

    useEffect(() => {
        if (isError) {
            toast.error(message);
            dispatch(reset());
        }
        if (isSuccess && message) {
            toast.success(message);
            dispatch(reset());
            dispatch(getAllPurchaseOrders({ ...filters, ...pagination }));
        }
    }, [isError, isSuccess, message, dispatch]);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        dispatch(setFilters({ [name]: value }));
    };

    const handleSearch = (e) => {
        e.preventDefault();
        dispatch(setPagination({ page: 1 }));
        dispatch(getAllPurchaseOrders({ ...filters, page: 1, limit: pagination.limit }));
    };

    const handleClearFilters = () => {
        dispatch(clearFilters());
        dispatch(setPagination({ page: 1 }));
    };

    const handlePageChange = (newPage) => {
        dispatch(setPagination({ page: newPage }));
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this Purchase Order?")) {
            await dispatch(deletePurchaseOrder(id));
        }
    };

    const handleSubmit = async (id) => {
        if (window.confirm("Submit this Purchase Order for approval?")) {
            await dispatch(submitForApproval(id));
        }
    };

    const handleApprove = async () => {
        if (selectedPO) {
            await dispatch(approvePurchaseOrder({ id: selectedPO._id, comments: approvalComments }));
            setShowApprovalModal(false);
            setApprovalComments("");
            setSelectedPO(null);
        }
    };

    const handleReject = async () => {
        if (selectedPO && rejectionReason.trim()) {
            await dispatch(rejectPurchaseOrder({ id: selectedPO._id, rejectionReason }));
            setShowRejectModal(false);
            setRejectionReason("");
            setSelectedPO(null);
        } else {
            toast.error("Rejection reason is required");
        }
    };

    const handleCancel = async () => {
        if (selectedPO && cancellationReason.trim()) {
            await dispatch(cancelPurchaseOrder({ id: selectedPO._id, cancellationReason }));
            setShowCancelModal(false);
            setCancellationReason("");
            setSelectedPO(null);
        } else {
            toast.error("Cancellation reason is required");
        }
    };

    const handleDuplicate = async (id) => {
        await dispatch(duplicatePurchaseOrder(id));
        toast.success("Purchase Order duplicated successfully");
    };

    return (
        <Layout>
            <div className="space-y-6">
                <PageHeader
                    title="Purchase Orders"
                    subtitle="Create, manage, and track supplier purchase orders"
                    backPath="/purchase-orders/new"
                    action={
                        <Button
                            variant="primary"
                            onClick={() => navigate("/purchase-orders/new")}
                            icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>}
                        >
                            New Purchase Order
                        </Button>
                    }
                />

                {/* KPI Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatsCard
                        title="Total Orders"
                        value={pagination?.total || 0}
                        color="indigo"
                        icon={
                            <svg className="w-5 h-5 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        }
                    />

                    <StatsCard
                        title="Total Amount"
                        value={`Rs. ${purchaseOrders.reduce((sum, po) => sum + (po.totalAmount || 0), 0).toLocaleString('en-IN', { minimumFractionDigits: 0 })}`}
                        color="violet"
                        icon={
                            <svg className="w-5 h-5 text-violet-600 dark:text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        }
                    />

                    <StatsCard
                        title="Approved"
                        value={purchaseOrders.filter(po => po.status === 'Approved' || po.status === 'Partially Received' || po.status === 'Fully Received').length}
                        color="emerald"
                        icon={
                            <svg className="w-5 h-5 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        }
                    />

                    <StatsCard
                        title="Pending Approval"
                        value={purchaseOrders.filter(po => po.status === 'Draft' || po.status === 'Pending Approval').length}
                        color="amber"
                        icon={
                            <svg className="w-5 h-5 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        }
                    />
                </div>

                <Card noPadding>
                    <div className="p-4 border-b border-gray-100 dark:border-gray-800">
                        <div className="flex justify-between items-center">
                            <div className="relative flex-1 max-w-md">
                                <input
                                    type="text"
                                    name="search"
                                    value={filters.search || ''}
                                    onChange={handleFilterChange}
                                    placeholder="Search PO number or supplier..."
                                    className="w-full pl-10 pr-4 py-2 text-xs border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-xl focus:ring-2 focus:ring-violet-500/20 focus:outline-none"
                                />
                                <svg className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setShowFilters(!showFilters)}
                            >
                                {showFilters ? "Hide Filters" : "Filter Options"}
                            </Button>
                        </div>

                        {showFilters && (
                            <form onSubmit={handleSearch} className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 grid grid-cols-1 md:grid-cols-3 gap-3">
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                                    <select
                                        name="status"
                                        value={filters.status || ''}
                                        onChange={handleFilterChange}
                                        className="w-full px-3 py-2 text-xs border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-xl focus:outline-none"
                                    >
                                        <option value="">All Statuses</option>
                                        <option value="Draft">Draft</option>
                                        <option value="Pending Approval">Pending Approval</option>
                                        <option value="Approved">Approved</option>
                                        <option value="Partially Received">Partially Received</option>
                                        <option value="Fully Received">Fully Received</option>
                                        <option value="Closed">Closed</option>
                                        <option value="Cancelled">Cancelled</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Start Date</label>
                                    <input
                                        type="date"
                                        name="startDate"
                                        value={filters.startDate || ''}
                                        onChange={handleFilterChange}
                                        className="w-full px-3 py-2 text-xs border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-xl focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">End Date</label>
                                    <input
                                        type="date"
                                        name="endDate"
                                        value={filters.endDate || ''}
                                        onChange={handleFilterChange}
                                        className="w-full px-3 py-2 text-xs border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-xl focus:outline-none"
                                    />
                                </div>
                                <div className="md:col-span-3 flex gap-2 justify-end">
                                    <Button variant="secondary" size="sm" type="button" onClick={handleClearFilters}>Clear</Button>
                                    <Button variant="primary" size="sm" type="submit">Apply</Button>
                                </div>
                            </form>
                        )}
                    </div>

                    {isLoading ? (
                        <div className="p-6">
                            <LoadingSkeleton count={5} />
                        </div>
                    ) : purchaseOrders.length === 0 ? (
                        <div className="p-8">
                            <EmptyState
                                title="No purchase orders found"
                                description="Create your first purchase order to start sending order requests to suppliers."
                                actionText="Create Purchase Order"
                                onAction={() => navigate('/purchase-orders/new')}
                            />
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-xs text-left">
                                <thead className="bg-gray-50/70 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800 font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    <tr>
                                        <th className="px-4 py-3">PO Number</th>
                                        <th className="px-4 py-3">Date</th>
                                        <th className="px-4 py-3">Supplier</th>
                                        <th className="px-4 py-3">Amount</th>
                                        <th className="px-4 py-3">Status</th>
                                        <th className="px-4 py-3 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-800 bg-white dark:bg-gray-900">
                                    {purchaseOrders.map((po) => (
                                        <tr key={po._id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
                                            <td className="px-4 py-3 font-semibold text-violet-700 dark:text-violet-400">
                                                {po.poNumber}
                                            </td>
                                            <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                                                {new Date(po.poDate).toLocaleDateString()}
                                            </td>
                                            <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100">
                                                {po.supplier?.businessName || "N/A"}
                                            </td>
                                            <td className="px-4 py-3 font-semibold text-gray-900 dark:text-gray-100">
                                                Rs. {po.totalAmount?.toFixed(2)}
                                            </td>
                                            <td className="px-4 py-3">
                                                <StatusBadge status={po.status} />
                                            </td>
                                            <td className="px-4 py-3 text-right space-x-1">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => navigate(`/purchase-orders/${po._id}`)}
                                                >
                                                    View
                                                </Button>

                                                {po.status === "Draft" && (
                                                    <>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => navigate(`/purchase-orders/${po._id}/edit`)}
                                                        >
                                                            Edit
                                                        </Button>
                                                        <Button
                                                            variant="primary"
                                                            size="sm"
                                                            onClick={() => handleSubmit(po._id)}
                                                        >
                                                            Submit
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                                                            onClick={() => handleDelete(po._id)}
                                                        >
                                                            Delete
                                                        </Button>
                                                    </>
                                                )}

                                                {po.status === "Pending Approval" && (
                                                    <>
                                                        <Button
                                                            variant="primary"
                                                            size="sm"
                                                            onClick={() => {
                                                                setSelectedPO(po);
                                                                setShowApprovalModal(true);
                                                            }}
                                                        >
                                                            Approve
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                                                            onClick={() => {
                                                                setSelectedPO(po);
                                                                setShowRejectModal(true);
                                                            }}
                                                        >
                                                            Reject
                                                        </Button>
                                                    </>
                                                )}

                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleDuplicate(po._id)}
                                                >
                                                    Duplicate
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </Card>

                {/* Modals */}
                <Modal
                    isOpen={showApprovalModal}
                    onClose={() => {
                        setShowApprovalModal(false);
                        setApprovalComments("");
                        setSelectedPO(null);
                    }}
                    title="Approve Purchase Order"
                    size="sm"
                    footer={
                        <div className="flex space-x-3 w-full">
                            <Button variant="secondary" className="w-full" onClick={() => setShowApprovalModal(false)}>Cancel</Button>
                            <Button variant="primary" className="w-full" onClick={handleApprove}>Approve</Button>
                        </div>
                    }
                >
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
                        Are you sure you want to approve Purchase Order: <strong>{selectedPO?.poNumber}</strong>?
                    </p>
                    <textarea
                        value={approvalComments}
                        onChange={(e) => setApprovalComments(e.target.value)}
                        placeholder="Add comments (optional)..."
                        className="w-full px-3 py-2 text-xs border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-xl text-gray-900 dark:text-gray-100 focus:outline-none"
                        rows="3"
                    />
                </Modal>

                <Modal
                    isOpen={showRejectModal}
                    onClose={() => {
                        setShowRejectModal(false);
                        setRejectionReason("");
                        setSelectedPO(null);
                    }}
                    title="Reject Purchase Order"
                    size="sm"
                    footer={
                        <div className="flex space-x-3 w-full">
                            <Button variant="secondary" className="w-full" onClick={() => setShowRejectModal(false)}>Cancel</Button>
                            <Button variant="danger" className="w-full" onClick={handleReject}>Reject</Button>
                        </div>
                    }
                >
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
                        Rejecting PO: <strong>{selectedPO?.poNumber}</strong>
                    </p>
                    <textarea
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        placeholder="Rejection reason (required)..."
                        className="w-full px-3 py-2 text-xs border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-xl text-gray-900 dark:text-gray-100 focus:outline-none"
                        rows="3"
                        required
                    />
                </Modal>
            </div>
        </Layout>
    );
};

export default PurchaseOrderList;

