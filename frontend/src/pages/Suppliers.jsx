import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { getAllSuppliers, deleteSupplier, reset } from '../redux/slices/supplierSlice';
import Layout from '../components/Layout';
import PageHeader from '../components/PageHeader';
import Button from '../components/Button';
import Card from '../components/Card';
import StatsCard from '../components/StatsCard';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
import FormInput from '../components/FormInput';
import EmptyState from '../components/EmptyState';
import LoadingSkeleton from '../components/LoadingSkeleton';

const Suppliers = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { suppliers = [], isLoading, isError, message } = useSelector(
    (state) => state.suppliers
  );

  const [searchTerm, setSearchTerm] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    dispatch(getAllSuppliers());
    return () => {
      if (window.location.pathname === "/suppliers")
        dispatch(reset());
    };
  }, [dispatch]);

  const handleDelete = async (id) => {
    await dispatch(deleteSupplier(id));
    setDeleteConfirm(null);
    dispatch(getAllSuppliers());
  };

  const handleAddSupplier = (e) => {
    if (e) e.preventDefault();
    navigate('/suppliers/add');
  };

  const filteredSuppliers = Array.isArray(suppliers) ? suppliers.filter(
    (supplier) =>
      supplier.businessName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.contactPersonName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.contactNo?.includes(searchTerm) ||
      (supplier.email && supplier.email.toLowerCase().includes(searchTerm.toLowerCase()))
  ) : [];

  const activeCount = suppliers.filter((s) => s.status === 'active').length;
  const inactiveCount = suppliers.filter((s) => s.status === 'inactive').length;

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <PageHeader
          title="Suppliers"
          description="Manage supplier directory, contact details, and procurement partners."
          actions={
            <Button
              onClick={handleAddSupplier}
              variant="primary"
              icon={
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
              }
            >
              Add New Supplier
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
            title="Total Suppliers"
            value={suppliers.length}
            iconBgColor="bg-violet-50 dark:bg-violet-900/20"
            iconColor="text-violet-600 dark:text-violet-400"
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            }
          />
          <StatsCard
            title="Active Suppliers"
            value={activeCount}
            iconBgColor="bg-emerald-50 dark:bg-emerald-900/20"
            iconColor="text-emerald-600 dark:text-emerald-400"
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
          <StatsCard
            title="Inactive Suppliers"
            value={inactiveCount}
            iconBgColor="bg-gray-100 dark:bg-gray-800"
            iconColor="text-gray-600 dark:text-gray-400"
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
        </div>

        {/* Suppliers Directory Card */}
        <Card padding="none">
          <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="w-full sm:w-80">
              <FormInput
                type="text"
                placeholder="Search business, contact person, or email..."
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
              Showing {filteredSuppliers.length} of {suppliers.length} suppliers
            </div>
          </div>

          {isLoading ? (
            <div className="p-6">
              <LoadingSkeleton type="table" rows={5} />
            </div>
          ) : filteredSuppliers.length === 0 ? (
            <EmptyState
              title="No Suppliers Found"
              description={searchTerm ? "No suppliers match your search filter." : "Add your first supplier to start managing purchases."}
              actionLabel="Add Supplier"
              onAction={handleAddSupplier}
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/40 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    <th className="py-3.5 px-6">Business Name</th>
                    <th className="py-3.5 px-6">Contact Person</th>
                    <th className="py-3.5 px-6">Contact No. / Email</th>
                    <th className="py-3.5 px-6">City / Address</th>
                    <th className="py-3.5 px-6">Status</th>
                    <th className="py-3.5 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {filteredSuppliers.map((supplier) => (
                    <tr key={supplier._id} className="hover:bg-gray-50/60 dark:hover:bg-gray-800/50 transition-colors">
                      <td className="py-4 px-6 font-semibold text-gray-900 dark:text-gray-100">
                        {supplier.businessName}
                      </td>
                      <td className="py-4 px-6 text-gray-700 dark:text-gray-300">
                        {supplier.contactPersonName}
                      </td>
                      <td className="py-4 px-6">
                        <div className="font-medium text-gray-900 dark:text-gray-100">{supplier.contactNo}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">{supplier.email || "No email"}</div>
                      </td>
                      <td className="py-4 px-6 text-gray-600 dark:text-gray-300">
                        {supplier.city || supplier.address || "—"}
                      </td>
                      <td className="py-4 px-6 whitespace-nowrap">
                        <StatusBadge status={supplier.status === 'active' ? 'success' : 'neutral'}>
                          {supplier.status || 'Active'}
                        </StatusBadge>
                      </td>
                      <td className="py-4 px-6 text-right space-x-2">
                        <Button
                          size="xs"
                          variant="secondary"
                          onClick={() => navigate(`/suppliers/${supplier._id}`)}
                        >
                          View
                        </Button>
                        <Button
                          size="xs"
                          variant="danger"
                          onClick={() => setDeleteConfirm(supplier._id)}
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
          title="Delete Supplier"
          size="sm"
        >
          <div className="space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Are you sure you want to delete this supplier? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="secondary" size="sm" onClick={() => setDeleteConfirm(null)}>
                Cancel
              </Button>
              <Button variant="danger" size="sm" onClick={() => handleDelete(deleteConfirm)}>
                Delete Supplier
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </Layout>
  );
};

export default Suppliers;