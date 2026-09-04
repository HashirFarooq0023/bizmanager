import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import api from '../services/api';
import { toast } from 'react-toastify';
import { getAllInvoices, deleteInvoice, reset } from "../redux/slices/posSlice";
import Layout from "../components/Layout";
import PageHeader from "../components/PageHeader";
import Button from "../components/Button";
import Card from "../components/Card";
import StatsCard from "../components/StatsCard";
import StatusBadge from "../components/StatusBadge";
import Modal from "../components/Modal";
import FormInput from "../components/FormInput";
import EmptyState from "../components/EmptyState";
import LoadingSkeleton from "../components/LoadingSkeleton";
import PaymentModal from '../components/PaymentModal';

const Invoices = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { invoices = [], isLoading, isError, message } = useSelector(
    (state) => state.pos
  );

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [paymentModal, setPaymentModal] = useState({
    isOpen: false,
    invoice: null
  });

  useEffect(() => {
    dispatch(getAllInvoices());
    return () => {
      dispatch(reset());
    };
  }, [dispatch]);

  const handleDelete = async (id) => {
    await dispatch(deleteInvoice(id));
    setDeleteConfirm(null);
    dispatch(getAllInvoices());
  };

  const handleReceivePayment = (invoice) => {
    setPaymentModal({
      isOpen: true,
      invoice
    });
  };

  const handlePaymentSubmit = async (paymentData) => {
    try {
      const userData = JSON.parse(localStorage.getItem('user'));
      const token = userData?.token;
      await api.put(
        `/api/pos/invoice/${paymentModal.invoice._id}/payment`,
        paymentData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success('Payment received successfully');
      setPaymentModal({ isOpen: false, invoice: null });
      dispatch(getAllInvoices());
    } catch (error) {
      toast.error(error.response?.data?.message || 'Payment failed');
    }
  };

  const filteredInvoices = invoices.filter((invoice) => {
    const matchesSearch =
      invoice.invoiceNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (invoice.customer?.name || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || invoice.paymentStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalSales = invoices.reduce((sum, inv) => sum + (inv.totalAmount || 0), 0);
  const totalPaid = invoices.reduce((sum, inv) => sum + (inv.paidAmount || 0), 0);
  const totalDue = totalSales - totalPaid;

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <PageHeader
          title="Sales Invoices"
          description="View, manage, and track payment status for all POS and billing invoices."
          actions={
            <Button
              onClick={() => navigate("/pos")}
              variant="primary"
              icon={
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              }
            >
              Go to POS Billing
            </Button>
          }
        />

        {/* Error Message */}
        {isError && (
          <div className="p-4 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 rounded-xl">
            <p className="text-rose-700 dark:text-rose-400 text-sm font-medium">{message}</p>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="Total Invoices"
            value={invoices.length}
            iconBgColor="bg-violet-50 dark:bg-violet-900/20"
            iconColor="text-violet-600 dark:text-violet-400"
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            }
          />
          <StatsCard
            title="Total Invoiced Value"
            value={`Rs. ${totalSales.toLocaleString()}`}
            iconBgColor="bg-emerald-50 dark:bg-emerald-900/20"
            iconColor="text-emerald-600 dark:text-emerald-400"
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
          <StatsCard
            title="Total Collected"
            value={`Rs. ${totalPaid.toLocaleString()}`}
            iconBgColor="bg-blue-50 dark:bg-blue-900/20"
            iconColor="text-blue-600 dark:text-blue-400"
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            }
          />
          <StatsCard
            title="Outstanding Balance"
            value={`Rs. ${totalDue.toLocaleString()}`}
            iconBgColor="bg-amber-50 dark:bg-amber-900/20"
            iconColor="text-amber-600 dark:text-amber-400"
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
        </div>

        {/* Invoices List Card */}
        <Card padding="none">
          <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="w-full sm:w-80">
              <FormInput
                type="text"
                placeholder="Search invoice no or customer..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                leftIcon={
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                }
              />
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3.5 py-2 text-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-xl focus:ring-2 focus:ring-violet-500 focus:outline-hidden"
              >
                <option value="all">All Payment Status</option>
                <option value="paid">Paid</option>
                <option value="partial">Partial</option>
                <option value="unpaid">Unpaid</option>
              </select>
            </div>
          </div>

          {isLoading ? (
            <div className="p-6">
              <LoadingSkeleton type="table" rows={5} />
            </div>
          ) : filteredInvoices.length === 0 ? (
            <EmptyState
              title="No Invoices Found"
              description={searchTerm ? "No invoices match your search query." : "No sales invoices have been recorded yet."}
              actionLabel="Create Invoice"
              onAction={() => navigate("/pos")}
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/40 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    <th className="py-3.5 px-6">Invoice No</th>
                    <th className="py-3.5 px-6">Date</th>
                    <th className="py-3.5 px-6">Customer</th>
                    <th className="py-3.5 px-6">Total Amount</th>
                    <th className="py-3.5 px-6">Paid Amount</th>
                    <th className="py-3.5 px-6">Status</th>
                    <th className="py-3.5 px-6">Payment Mode</th>
                    <th className="py-3.5 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {filteredInvoices.map((invoice) => (
                    <tr key={invoice._id} className="hover:bg-gray-50/60 dark:hover:bg-gray-800/50 transition-colors">
                      <td className="py-4 px-6 font-semibold text-violet-600 dark:text-violet-400">
                        {invoice.invoiceNo}
                      </td>
                      <td className="py-4 px-6 text-gray-600 dark:text-gray-300 whitespace-nowrap">
                        {new Date(invoice.createdAt).toLocaleDateString("en-PK")}
                      </td>
                      <td className="py-4 px-6">
                        <div className="font-semibold text-gray-900 dark:text-gray-100">
                          {invoice.customer?.name || "Walk-in Customer"}
                        </div>
                        {invoice.customer?.phone && (
                          <div className="text-xs text-gray-400">{invoice.customer.phone}</div>
                        )}
                      </td>
                      <td className="py-4 px-6 font-semibold text-gray-900 dark:text-gray-100 whitespace-nowrap">
                        Rs. {(invoice.totalAmount || 0).toFixed(2)}
                      </td>
                      <td className="py-4 px-6 text-gray-700 dark:text-gray-300 whitespace-nowrap">
                        Rs. {(invoice.paidAmount || 0).toFixed(2)}
                      </td>
                      <td className="py-4 px-6 whitespace-nowrap">
                        <StatusBadge
                          status={
                            invoice.paymentStatus === 'paid'
                              ? 'success'
                              : invoice.paymentStatus === 'partial'
                              ? 'warning'
                              : 'danger'
                          }
                        >
                          {invoice.paymentStatus || 'unpaid'}
                        </StatusBadge>
                      </td>
                      <td className="py-4 px-6 text-gray-600 dark:text-gray-300 capitalize whitespace-nowrap">
                        {invoice.paymentMethod || 'Cash'}
                      </td>
                      <td className="py-4 px-6 text-right space-x-2 whitespace-nowrap">
                        {invoice.paymentStatus !== 'paid' && (
                          <Button
                            size="xs"
                            variant="secondary"
                            onClick={() => handleReceivePayment(invoice)}
                          >
                            Receive
                          </Button>
                        )}
                        <Button
                          size="xs"
                          variant="secondary"
                          onClick={() => navigate(`/pos/invoice/${invoice._id}`)}
                        >
                          View
                        </Button>
                        <Button
                          size="xs"
                          variant="danger"
                          onClick={() => setDeleteConfirm(invoice._id)}
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

        {/* Delete Confirmation Modal */}
        <Modal
          isOpen={!!deleteConfirm}
          onClose={() => setDeleteConfirm(null)}
          title="Delete Invoice"
          size="sm"
        >
          <div className="space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Are you sure you want to delete this invoice? This will remove the recorded sale entry.
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="secondary" size="sm" onClick={() => setDeleteConfirm(null)}>
                Cancel
              </Button>
              <Button variant="danger" size="sm" onClick={() => handleDelete(deleteConfirm)}>
                Delete Invoice
              </Button>
            </div>
          </div>
        </Modal>

        {/* Payment Modal */}
        {paymentModal.isOpen && paymentModal.invoice && (
          <PaymentModal
            isOpen={paymentModal.isOpen}
            onClose={() => setPaymentModal({ isOpen: false, invoice: null })}
            onSubmit={handlePaymentSubmit}
            documentType="Invoice"
            totalAmount={paymentModal.invoice.totalAmount}
            paidAmount={paymentModal.invoice.paidAmount || 0}
          />
        )}
      </div>
    </Layout>
  );
};

export default Invoices;
