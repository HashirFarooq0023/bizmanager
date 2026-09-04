import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  getAllCustomers,
  deleteCustomer,
  reset,
} from "../redux/slices/customerSlice";
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

const Customers = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { customers = [], isLoading, isError, message } = useSelector(
    (state) => state.customers
  );

  const [searchTerm, setSearchTerm] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    dispatch(getAllCustomers());
    return () => {
      if (window.location.pathname === "/customers") dispatch(reset());
    };
  }, [dispatch]);

  const handleDelete = async (id) => {
    await dispatch(deleteCustomer(id));
    setDeleteConfirm(null);
    dispatch(getAllCustomers());
  };

  const handleAddCustomer = (e) => {
    if (e) e.preventDefault();
    navigate("/customers/add");
  };

  const filteredCustomers = customers.filter(
    (customer) =>
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone.includes(searchTerm) ||
      (customer.email &&
        customer.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const totalDues = customers.reduce((sum, c) => sum + (c.dues || 0), 0);
  const customersWithDuesCount = customers.filter((c) => (c.dues || 0) > 0).length;

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <PageHeader
          title="Customers"
          description="Manage your customer directory, contact details, and account balances."
          actions={
            <Button
              onClick={handleAddCustomer}
              variant="primary"
              icon={
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
              }
            >
              Add New Customer
            </Button>
          }
        />

        {/* Error Notification */}
        {isError && (
          <div className="p-4 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 rounded-xl">
            <p className="text-rose-700 dark:text-rose-400 text-sm font-medium">{message}</p>
          </div>
        )}

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatsCard
            title="Total Customers"
            value={customers.length}
            iconBgColor="bg-violet-50 dark:bg-violet-900/20"
            iconColor="text-violet-600 dark:text-violet-400"
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            }
          />
          <StatsCard
            title="Total Outstanding Dues"
            value={`Rs. ${totalDues.toFixed(2)}`}
            iconBgColor="bg-rose-50 dark:bg-rose-900/20"
            iconColor="text-rose-600 dark:text-rose-400"
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
          <div onClick={() => navigate("/customers/with-dues")} className="cursor-pointer">
            <StatsCard
              title="Customers with Pending Dues"
              value={customersWithDuesCount}
              subtitle="Click to view details →"
              iconBgColor="bg-amber-50 dark:bg-amber-900/20"
              iconColor="text-amber-600 dark:text-amber-400"
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              }
            />
          </div>
        </div>

        {/* Customer Directory Table Card */}
        <Card padding="none">
          <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="w-full sm:w-80">
              <FormInput
                type="text"
                placeholder="Search name, phone, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                leftIcon={
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                }
              />
            </div>
            <div className="text-xs text-gray-500 font-medium">
              Showing {filteredCustomers.length} of {customers.length} customers
            </div>
          </div>

          {isLoading ? (
            <div className="p-6">
              <LoadingSkeleton type="table" rows={5} />
            </div>
          ) : filteredCustomers.length === 0 ? (
            <EmptyState
              title="No Customers Found"
              description={searchTerm ? "No customers match your search query." : "Get started by adding your first customer."}
              actionLabel="Add Customer"
              onAction={handleAddCustomer}
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/40 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    <th className="py-3.5 px-6">Customer</th>
                    <th className="py-3.5 px-6">Contact Info</th>
                    <th className="py-3.5 px-6">Address</th>
                    <th className="py-3.5 px-6">Balance / Status</th>
                    <th className="py-3.5 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {filteredCustomers.map((customer) => (
                    <tr key={customer._id} className="hover:bg-gray-50/60 dark:hover:bg-gray-800/50 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 font-semibold flex items-center justify-center text-sm">
                            {customer.name?.charAt(0).toUpperCase() || 'C'}
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900 dark:text-gray-100">{customer.name}</div>
                            {customer.referredBy && (
                              <div className="text-xs text-gray-400">Referred by existing customer</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="font-medium text-gray-900 dark:text-gray-100">{customer.phone}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">{customer.email || "No email"}</div>
                      </td>
                      <td className="py-4 px-6 text-gray-600 dark:text-gray-300">
                        {customer.address || "—"}
                      </td>
                      <td className="py-4 px-6 whitespace-nowrap">
                        {(customer.dues || 0) > 0 ? (
                          <StatusBadge status="warning">
                            Owes Rs. {(customer.dues).toFixed(2)}
                          </StatusBadge>
                        ) : (customer.dues || 0) < 0 ? (
                          <StatusBadge status="info">
                            Advance Rs. {Math.abs(customer.dues).toFixed(2)}
                          </StatusBadge>
                        ) : (
                          <StatusBadge status="success">
                            Clear
                          </StatusBadge>
                        )}
                      </td>
                      <td className="py-4 px-6 text-right space-x-2">
                        <Button
                          size="xs"
                          variant="secondary"
                          onClick={() => navigate(`/customers/${customer._id}`)}
                        >
                          View
                        </Button>
                        <Button
                          size="xs"
                          variant="danger"
                          onClick={() => setDeleteConfirm(customer._id)}
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
          title="Delete Customer"
          size="sm"
        >
          <div className="space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Are you sure you want to delete this customer? This action will permanently remove their records.
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="secondary" size="sm" onClick={() => setDeleteConfirm(null)}>
                Cancel
              </Button>
              <Button variant="danger" size="sm" onClick={() => handleDelete(deleteConfirm)}>
                Delete Customer
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </Layout>
  );
};

export default Customers;
