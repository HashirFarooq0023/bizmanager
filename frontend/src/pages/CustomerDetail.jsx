import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import {
  getCustomerById,
  getCustomerTransactions,
  clearCustomer,
  reset,
} from "../redux/slices/customerSlice";
import Layout from "../components/Layout";
import Modal from "../components/Modal";

const CustomerDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { customer, transactions, isLoading, isError, message } = useSelector(
    (state) => state.customers
  );
  const user = useSelector((state) => state.auth?.user);
  const [receiptTxn, setReceiptTxn] = useState(null);

  useEffect(() => {
    dispatch(getCustomerById(id));
    dispatch(getCustomerTransactions(id));
    return () => {
      dispatch(clearCustomer());
      dispatch(reset());
    };
  }, [dispatch, id]);

  const formatTransactionType = (type, amount) => {
    if (type === "due" && amount < 0) return "Due (Return / Refund)";
    if (type === "due_adjustment") return "Due Settlement / Payment";
    if (type === "sale") return "Invoice / Sale";
    if (type === "payment") return "Payment Received";
    if (type === "refund") return "Refund";
    return (type || 'Payment').replace(/_/g, ' ');
  };

  const getTransactionTypeColor = (type, amount) => {
    switch (type) {
      case "sale":
        return "bg-green-100 text-green-800 dark:bg-green-950/50 dark:text-green-300";
      case "purchase":
        return "bg-blue-100 text-blue-800 dark:bg-blue-950/50 dark:text-blue-300";
      case "payment":
      case "due_adjustment":
        return "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300";
      case "due":
        if (amount > 0) return "bg-red-100 text-red-800 dark:bg-red-950/50 dark:text-red-300";
        if (amount < 0) return "bg-yellow-100 text-yellow-800 dark:bg-yellow-950/50 dark:text-yellow-300";
        return "bg-red-100 text-red-800 dark:bg-red-950/50 dark:text-red-300";
      case "refund":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-950/50 dark:text-yellow-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-zinc-800 dark:text-zinc-300";
    }
  };

  const getPaymentMethodIcon = (method) => {
    switch (method) {
      case "cash":
        return (
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
        );
      case "upi":
        return (
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
            />
          </svg>
        );
      case "card":
        return (
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
            />
          </svg>
        );
      case "due":
        return (
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        );
      default:
        return null;
    }
  };

  if (isLoading && !customer) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 dark:border-[rgb(var(--color-primary))]"></div>
        </div>
      </Layout>
    );
  }

  if (!customer) {
    return (
      <Layout>
        <div className="text-center py-12">
          <p className="text-gray-500">Customer not found</p>
          <button
            onClick={() => navigate("/customers")}
            className="mt-4 text-indigo-600 dark:text-[rgb(var(--color-primary))] hover:text-indigo-700 dark:hover:text-[rgb(var(--color-primary-hover))]"
          >
            Back to Customers
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate("/customers")}
            className="flex items-center text-gray-600 dark:text-[rgb(var(--color-text-secondary))] hover:text-gray-900 dark:hover:text-[rgb(var(--color-text))] mb-4"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to Customers
          </button>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-[rgb(var(--color-text))] mb-2">
                Customer Details
              </h1>
              <p className="text-gray-600 dark:text-[rgb(var(--color-text-secondary))]">
                View customer information and transaction history
              </p>
            </div>
            <button
              onClick={() => navigate(`/customers/edit/${id}`)}
              className="flex items-center space-x-2 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white font-semibold rounded-lg transition shadow-xs"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
              <span>Edit</span>
            </button>
          </div>
        </div>

        {/* Error Message */}
        {isError && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-600 dark:text-red-400 text-sm">{message}</p>
          </div>
        )}

        {/* Customer Info Card */}
        <div className="bg-white dark:bg-[rgb(var(--color-card))] rounded-xl shadow-sm dark:shadow-lg border dark:border-[rgb(var(--color-border))] p-8 mb-6">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
              <span className="text-3xl font-bold text-white">
                {(customer?.name || 'C').charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900  dark:text-[rgb(var(--color-text))]">
                {customer?.name || 'Customer'}
              </h2>
              <p className="text-gray-500  dark:text-[rgb(var(--color-text-secondary))]">
                Customer since{" "}
                {customer?.createdAt ? new Date(customer.createdAt).toLocaleDateString() : '—'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Phone */}
            <div className="flex items-start space-x-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <svg
                  className="w-6 h-6 text-blue-600 dark:text-blue-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Phone</p>
                <p className="text-gray-900 font-medium  dark:text-[rgb(var(--color-text))]">{customer?.phone || '—'}</p>
              </div>
            </div>

            {/* Email */}
            <div className="flex items-start space-x-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <svg
                  className="w-6 h-6 text-green-600 dark:text-green-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 ">Email</p>
                <p className="text-gray-900 font-medium  dark:text-[rgb(var(--color-text))]">
                  {customer.email || "Not provided"}
                </p>
              </div>
            </div>

            {/* Address */}
            <div className="flex items-start space-x-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <svg
                  className="w-6 h-6 text-purple-600 dark:text-purple-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Address</p>
                <p className="text-gray-900 font-medium  dark:text-[rgb(var(--color-text))]">
                  {customer.address || "Not provided"}
                </p>
              </div>
            </div>

            {/* Dues */}
            <div
              onClick={() => {
                if (customer.dues > 0) {
                  navigate(`/customers/adjust-due/${id}`);
                }
              }}
              className={`flex items-start space-x-3 ${customer.dues > 0
                  ? "cursor-pointer hover:bg-gray-50 dark:hover:bg-[rgb(var(--color-input))] p-3 rounded-lg transition-colors"
                  : ""
                }`}
            >
              <div
                className={`p-2 rounded-lg ${customer.dues > 0
                    ? "bg-red-100"
                    : customer.dues < 0
                      ? "bg-yellow-100"
                      : "bg-green-100"
                  }`}
              >
                <svg
                  className={`w-6 h-6 ${customer.dues > 0
                      ? "text-red-600"
                      : customer.dues < 0
                        ? "text-yellow-600"
                        : "text-green-600"
                    }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>

              <div className="flex-1">
                <p className="text-sm font-medium text-gray-500">
                  {customer.dues < 0 ? "Pending Return" : "Outstanding Dues"}
                </p>
                <p
                  className={`font-bold text-lg ${Number(customer?.dues || 0) > 0
                      ? "text-red-600"
                      : Number(customer?.dues || 0) < 0
                        ? "text-yellow-600"
                        : "text-green-600"
                    }`}
                >
                  {/* Absolute value used to display returns as positive (e.g. Rs. 9 instead of Rs. -9) */}
                  Rs. {Math.abs(Number(customer?.dues || 0)).toFixed(2)}
                </p>
                {Number(customer?.dues || 0) > 0 && (
                  <p className="text-xs text-indigo-600 dark:text-[rgb(var(--color-primary))] mt-1">
                    Click to adjust due →
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Transaction History */}
        <div className="bg-white dark:bg-[rgb(var(--color-card))] rounded-xl shadow-sm dark:shadow-lg border dark:border-[rgb(var(--color-border))] overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-[rgb(var(--color-border))]">
            <h3 className="text-lg font-bold text-gray-900 dark:text-[rgb(var(--color-text))]">
              Transaction History
            </h3>
            <p className="text-sm text-gray-600 dark:text-[rgb(var(--color-text-secondary))]">
              {(Array.isArray(transactions) ? transactions : []).length} transaction
              {(Array.isArray(transactions) ? transactions : []).length !== 1 ? "s" : ""} found
            </p>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 dark:border-[rgb(var(--color-primary))]"></div>
            </div>
          ) : (!Array.isArray(transactions) || transactions.length === 0) ? (
            <div className="text-center py-12">
              <svg
                className="w-16 h-16 text-gray-400 mx-auto mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <p className="text-gray-500 text-lg">No transactions yet</p>
              <p className="text-gray-400 text-sm mt-2">
                Transactions will appear here once the customer makes purchases
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-[rgb(var(--color-table-header))] border-b border-gray-200 dark:border-[rgb(var(--color-border))]">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Payment Method
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Description
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-[rgb(var(--color-table-row))] divide-y divide-gray-200 dark:divide-[rgb(var(--color-border))]">
                  {transactions.map((transaction, idx) => {
                    const amountVal = Number(transaction?.amount || 0);
                    return (
                      <tr key={transaction?._id || `txn-${idx}`} className="hover:bg-gray-50 dark:hover:bg-[rgb(var(--color-input))]">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900  dark:text-[rgb(var(--color-text))]">
                          {transaction?.createdAt ? new Date(transaction.createdAt).toLocaleDateString() : '—'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getTransactionTypeColor(
                              transaction?.type,
                              amountVal
                            )}`}
                          >
                            {formatTransactionType(transaction?.type, amountVal)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900  dark:text-[rgb(var(--color-text))]">
                          Rs. {Math.abs(amountVal).toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            {getPaymentMethodIcon(transaction?.paymentMethod)}
                            <span className="text-sm text-gray-900 capitalize  dark:text-[rgb(var(--color-text))]">
                              {transaction?.paymentMethod || 'cash'}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {transaction?.description || "-"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                          <div className="inline-flex items-center gap-2 justify-end">
                            <button
                              type="button"
                              onClick={() => setReceiptTxn(transaction)}
                              className="px-2.5 py-1 text-xs font-medium rounded-md bg-indigo-50 hover:bg-indigo-100 text-indigo-700 dark:bg-indigo-950/50 dark:hover:bg-indigo-900/60 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800/60 transition cursor-pointer"
                              title="View & Print Payment Receipt"
                            >
                              Receipt
                            </button>
                            {transaction?.invoice?._id && (
                              <button
                                type="button"
                                onClick={() => navigate(`/pos/invoices/${transaction.invoice._id}`)}
                                className="px-2.5 py-1 text-xs font-medium rounded-md bg-gray-50 hover:bg-gray-100 text-gray-700 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:text-zinc-200 border border-gray-200 dark:border-zinc-700 transition cursor-pointer"
                                title="View Linked Invoice"
                              >
                                Invoice
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Payment Receipt Modal */}
        {receiptTxn && (
          <Modal
            isOpen={Boolean(receiptTxn)}
            onClose={() => setReceiptTxn(null)}
            title="Payment Receipt / رسید واؤچر"
            size="md"
            footer={
              <div className="flex justify-end gap-3 w-full">
                <button
                  type="button"
                  onClick={() => setReceiptTxn(null)}
                  className="px-4 py-2 text-sm border rounded-lg text-gray-700 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-800"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-4 py-2 text-sm bg-violet-600 hover:bg-violet-700 text-white rounded-lg font-semibold flex items-center gap-1.5"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                  </svg>
                  Print Receipt
                </button>
              </div>
            }
          >
            <div className="p-5 border rounded-xl bg-slate-50 dark:bg-zinc-800/40 space-y-4">
              <div className="text-center pb-3 border-b dark:border-zinc-700">
                <h4 className="text-xl font-bold text-gray-900 dark:text-zinc-100">{user?.shopName || 'Business Receipt'}</h4>
                {user?.shopAddress && (
                  <p className="text-xs text-gray-500 dark:text-zinc-400">{user.shopAddress}</p>
                )}
                <p className="text-xs font-semibold text-violet-600 dark:text-violet-400 mt-1">Payment Acknowledgement Receipt</p>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-gray-500 dark:text-zinc-400 block text-xs">Customer Name:</span>
                  <span className="font-semibold text-gray-900 dark:text-zinc-100">{customer?.name}</span>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-zinc-400 block text-xs">Customer Phone:</span>
                  <span className="font-semibold text-gray-900 dark:text-zinc-100">{customer?.phone || '—'}</span>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-zinc-400 block text-xs">Transaction Date:</span>
                  <span className="font-semibold text-gray-900 dark:text-zinc-100">
                    {receiptTxn.createdAt ? new Date(receiptTxn.createdAt).toLocaleString('en-PK') : '—'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-zinc-400 block text-xs">Payment Method:</span>
                  <span className="font-semibold uppercase text-gray-900 dark:text-zinc-100">{receiptTxn.paymentMethod || 'Cash'}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-gray-500 dark:text-zinc-400 block text-xs">Transaction Type:</span>
                  <span className="font-semibold text-gray-900 dark:text-zinc-100">{formatTransactionType(receiptTxn.type, receiptTxn.amount)}</span>
                </div>
                {receiptTxn.description && (
                  <div className="col-span-2">
                    <span className="text-gray-500 dark:text-zinc-400 block text-xs">Description:</span>
                    <span className="text-gray-700 dark:text-zinc-300">{receiptTxn.description}</span>
                  </div>
                )}
              </div>
              <div className="pt-3 border-t dark:border-zinc-700 flex justify-between items-center">
                <div>
                  <span className="text-xs text-gray-500 dark:text-zinc-400 block">Remaining Customer Due:</span>
                  <span className="text-sm font-semibold text-gray-700 dark:text-zinc-300">
                    Rs. {Math.abs(customer?.dues || 0).toLocaleString('en-PK', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs text-gray-500 dark:text-zinc-400 block">Amount Paid:</span>
                  <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                    Rs. {Math.abs(Number(receiptTxn.amount || 0)).toLocaleString('en-PK', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>
          </Modal>
        )}
      </div>
    </Layout>
  );
};

export default CustomerDetail;
