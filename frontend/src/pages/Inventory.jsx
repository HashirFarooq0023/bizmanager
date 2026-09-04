import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { getAllItems, deleteItem, getLowStockItems, reset } from '../redux/slices/inventorySlice';
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

const Inventory = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { items = [], lowStockItems = [], alerts = [], isLoading, isError, message } = useSelector(
    (state) => state.inventory
  );

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    dispatch(getAllItems());
    dispatch(getLowStockItems());
    return () => {
      dispatch(reset());
    };
  }, [dispatch]);

  const handleDelete = async (id) => {
    await dispatch(deleteItem(id));
    setDeleteConfirm(null);
    dispatch(getAllItems());
  };

  const categories = ['all', ...new Set(Array.isArray(items) ? items.map((item) => item.category).filter(Boolean) : [])];

  const filteredItems = Array.isArray(items) ? items.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.sku && item.sku.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.barcode && item.barcode.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  }) : [];

  const inventoryValue = Array.isArray(items) ? items.reduce((sum, item) => sum + (item.costPrice || 0) * (item.stockQty || 0), 0) : 0;
  const expectedRevenue = Array.isArray(items) ? items.reduce((sum, item) => sum + (item.sellingPrice || 0) * (item.stockQty || 0), 0) : 0;

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <PageHeader
          title="Inventory Management"
          description="Manage products, track stock levels, and monitor low-stock alerts."
          actions={
            <Button
              onClick={() => navigate('/inventory/add')}
              variant="primary"
              icon={
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              }
            >
              Add New Product
            </Button>
          }
        />

        {/* Stock Alerts */}
        {alerts && alerts.length > 0 && (
          <div className="p-4 bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/50 rounded-xl">
            <div className="flex items-start gap-3">
              <div className="p-1 bg-amber-100 dark:bg-amber-900/50 rounded-lg text-amber-700 dark:text-amber-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-xs font-bold text-amber-900 dark:text-amber-200 uppercase tracking-wider mb-1">Stock Alerts</h3>
                <ul className="space-y-1">
                  {alerts.map((alert, idx) => (
                    <li key={idx} className="text-xs text-amber-800 dark:text-amber-300">
                      • {alert.message}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {isError && (
          <div className="p-4 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 rounded-xl">
            <p className="text-rose-700 dark:text-rose-400 text-sm font-medium">{message}</p>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="Total Items"
            value={items.length}
            iconBgColor="bg-violet-50 dark:bg-violet-900/20"
            iconColor="text-violet-600 dark:text-violet-400"
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            }
          />
          <StatsCard
            title="Low Stock Items"
            value={lowStockItems.length}
            iconBgColor="bg-amber-50 dark:bg-amber-900/20"
            iconColor="text-amber-600 dark:text-amber-400"
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            }
          />
          <StatsCard
            title="Cost Valuation"
            value={`Rs. ${inventoryValue.toLocaleString()}`}
            iconBgColor="bg-emerald-50 dark:bg-emerald-900/20"
            iconColor="text-emerald-600 dark:text-emerald-400"
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
          <StatsCard
            title="Expected Revenue"
            value={`Rs. ${expectedRevenue.toLocaleString()}`}
            iconBgColor="bg-blue-50 dark:bg-blue-900/20"
            iconColor="text-blue-600 dark:text-blue-400"
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            }
          />
        </div>

        {/* Filter and Table Container */}
        <Card padding="none">
          <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex flex-col lg:flex-row justify-between items-center gap-4">
            <div className="w-full lg:w-96">
              <FormInput
                type="text"
                placeholder="Search by name, SKU, or barcode..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                leftIcon={
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                }
              />
            </div>
            <div className="flex items-center gap-3 w-full lg:w-auto">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full lg:w-auto px-3.5 py-2 text-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-xl focus:ring-2 focus:ring-violet-500 focus:outline-hidden"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat === 'all' ? 'All Categories' : cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {isLoading ? (
            <div className="p-6">
              <LoadingSkeleton type="table" rows={6} />
            </div>
          ) : filteredItems.length === 0 ? (
            <EmptyState
              title="No Inventory Items"
              description={searchTerm ? "No products match your search term or category filter." : "Add products to start tracking inventory and stock levels."}
              actionLabel="Add Product"
              onAction={() => navigate('/inventory/add')}
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/40 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    <th className="py-3.5 px-6">Product</th>
                    <th className="py-3.5 px-6">Category</th>
                    <th className="py-3.5 px-6">Total Stock</th>
                    <th className="py-3.5 px-6">Available</th>
                    <th className="py-3.5 px-6">Cost Price</th>
                    <th className="py-3.5 px-6">Selling Price</th>
                    <th className="py-3.5 px-6">Margin</th>
                    <th className="py-3.5 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {filteredItems.map((item) => {
                    const cost = item.costPrice || 0;
                    const selling = item.sellingPrice || 0;
                    const profitMargin = cost > 0 ? (((selling - cost) / cost) * 100).toFixed(1) : "0.0";
                    const availableStock = (item.stockQty || 0) - (item.reservedStock || 0);
                    const isLowStock = availableStock <= (item.lowStockLimit || 0);

                    return (
                      <tr key={item._id} className="hover:bg-gray-50/60 dark:hover:bg-gray-800/50 transition-colors">
                        <td className="py-4 px-6">
                          <div className="font-semibold text-gray-900 dark:text-gray-100">{item.name}</div>
                          {(item.barcode || item.sku) && (
                            <div className="text-xs text-gray-400">
                              SKU / Code: {item.barcode || item.sku}
                            </div>
                          )}
                        </td>
                        <td className="py-4 px-6 text-gray-600 dark:text-gray-300">
                          {item.category || 'Uncategorized'}
                        </td>
                        <td className="py-4 px-6 font-medium text-gray-900 dark:text-gray-100">
                          {item.stockQty} {item.unit || ''}
                        </td>
                        <td className="py-4 px-6 whitespace-nowrap">
                          {isLowStock ? (
                            <StatusBadge status="danger">
                              {availableStock} {item.unit || ''} (Low)
                            </StatusBadge>
                          ) : (
                            <StatusBadge status="success">
                              {availableStock} {item.unit || ''}
                            </StatusBadge>
                          )}
                        </td>
                        <td className="py-4 px-6 text-gray-700 dark:text-gray-300 whitespace-nowrap">
                          Rs. {cost.toFixed(2)}
                        </td>
                        <td className="py-4 px-6 font-medium text-gray-900 dark:text-gray-100 whitespace-nowrap">
                          Rs. {selling.toFixed(2)}
                        </td>
                        <td className="py-4 px-6 whitespace-nowrap">
                          <span className={`font-semibold ${Number(profitMargin) >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                            {profitMargin}%
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right space-x-2">
                          <Button
                            size="xs"
                            variant="secondary"
                            onClick={() => navigate(`/inventory/edit/${item._id}`)}
                          >
                            Edit
                          </Button>
                          <Button
                            size="xs"
                            variant="danger"
                            onClick={() => setDeleteConfirm(item._id)}
                          >
                            Delete
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {/* Delete Confirmation Modal */}
        <Modal
          isOpen={!!deleteConfirm}
          onClose={() => setDeleteConfirm(null)}
          title="Delete Product"
          size="sm"
        >
          <div className="space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Are you sure you want to delete this item? This action will permanently remove it from inventory.
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="secondary" size="sm" onClick={() => setDeleteConfirm(null)}>
                Cancel
              </Button>
              <Button variant="danger" size="sm" onClick={() => handleDelete(deleteConfirm)}>
                Delete Product
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </Layout>
  );
};

export default Inventory;
