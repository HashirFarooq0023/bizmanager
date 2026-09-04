import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { toast } from 'react-toastify';
import Layout from '../../components/Layout';
import PageHeader from '../../components/PageHeader';
import Card from '../../components/Card';
import Button from '../../components/Button';
import StatusBadge from '../../components/StatusBadge';
import FormInput from '../../components/FormInput';
import CustomerSelectionModal from '../../components/CustomerSelectionModal';
import ItemSelectionModal from '../../components/ItemSelectionModal';
import useDraftSave from '../../hooks/useDraftSave';

const SalesOrder = () => {
    const navigate = useNavigate();
    const [showCustomerModal, setShowCustomerModal] = useState(false);
    const [showItemModal, setShowItemModal] = useState(false);
    const [loading, setLoading] = useState(false);

    const initialFormData = {
        orderDate: new Date().toISOString().split('T')[0],
        expectedDeliveryDate: '',
        customer: null,
        items: [],
        discount: 0,
        notes: ''
    };

    const [formData, setFormData, clearDraft, hasDraft] = useDraftSave('salesOrderDraft', initialFormData);

    const addItemFromModal = (item) => {
        const existingIndex = formData.items.findIndex(i => i.item === item._id);

        if (existingIndex >= 0) {
            const newItems = [...formData.items];
            newItems[existingIndex].quantity += item.quantity;
            setFormData({ ...formData, items: newItems });
        } else {
            setFormData({
                ...formData,
                items: [...formData.items, {
                    item: item._id,
                    name: item.name,
                    quantity: item.quantity,
                    rate: item.sellingPrice,
                    tax: 18,
                    discount: 0,
                    availableStock: item.stockQty - (item.reservedStock || 0)
                }]
            });
        }
    };

    const updateItem = (index, field, value) => {
        const newItems = [...formData.items];
        newItems[index][field] = value;
        setFormData({ ...formData, items: newItems });
    };

    const removeItem = (index) => {
        const newItems = formData.items.filter((_, i) => i !== index);
        setFormData({ ...formData, items: newItems });
    };

    const calculateItemTotal = (item) => {
        const subtotal = item.quantity * item.rate;
        const taxAmount = (subtotal * item.tax) / 100;
        return subtotal + taxAmount - item.discount;
    };

    const calculateSubtotal = () => {
        return formData.items.reduce((sum, item) => sum + (item.quantity * item.rate), 0);
    };

    const calculateTax = () => {
        return formData.items.reduce((sum, item) => {
            const subtotal = item.quantity * item.rate;
            return sum + (subtotal * item.tax / 100);
        }, 0);
    };

    const calculateItemDiscount = () => {
        return formData.items.reduce((sum, item) => sum + (item.discount || 0), 0);
    };

    const calculateTotal = () => {
        return calculateSubtotal() + calculateTax() - calculateItemDiscount() - formData.discount;
    };

    const validateForm = () => {
        if (!formData.customer) {
            toast.error('Please select a customer');
            return false;
        }

        if (formData.items.length === 0) {
            toast.error('Please add at least one item');
            return false;
        }

        if (!formData.expectedDeliveryDate) {
            toast.error('Please select expected delivery date');
            return false;
        }

        for (const item of formData.items) {
            if (item.quantity > item.availableStock) {
                toast.error(`Insufficient available stock for ${item.name}. Available: ${item.availableStock}`);
                return false;
            }
        }

        return true;
    };

    const handleSaveDraft = async () => {
        if (!validateForm()) return;

        setLoading(true);
        try {
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            const token = user?.token;
            const payload = {
                customerId: formData.customer._id,
                orderDate: formData.orderDate,
                expectedDeliveryDate: formData.expectedDeliveryDate,
                items: formData.items.map(item => ({
                    item: item.item,
                    quantity: item.quantity,
                    rate: item.rate,
                    tax: item.tax,
                    discount: item.discount
                })),
                discount: formData.discount,
                notes: formData.notes
            };

            await api.post(
                `/api/sales-orders`,
                payload,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            toast.success('Sales Order saved as draft successfully!');
            clearDraft();
            navigate('/sales/sales-order-list');
        } catch (error) {
            console.error('Error saving sales order:', error);
            toast.error(error.response?.data?.message || 'Failed to save sales order');
        } finally {
            setLoading(false);
        }
    };

    const handleConfirmOrder = async () => {
        if (!validateForm()) return;

        setLoading(true);
        try {
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            const token = user?.token;

            const payload = {
                customerId: formData.customer._id,
                orderDate: formData.orderDate,
                expectedDeliveryDate: formData.expectedDeliveryDate,
                items: formData.items.map(item => ({
                    item: item.item,
                    quantity: item.quantity,
                    rate: item.rate,
                    tax: item.tax,
                    discount: item.discount
                })),
                discount: formData.discount,
                notes: formData.notes
            };

            const createResponse = await api.post(
                `/api/sales-orders`,
                payload,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            const orderId = createResponse.data.salesOrder._id;

            await api.post(
                `/api/sales-orders/${orderId}/confirm`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );

            toast.success('Sales Order confirmed successfully! Stock reserved.');
            clearDraft();
            navigate('/sales/sales-order-list');
        } catch (error) {
            console.error('Error confirming sales order:', error);
            toast.error(error.response?.data?.message || 'Failed to confirm sales order');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout>
            <div className="space-y-6">
                <PageHeader
                    title="Sales Order"
                    subtitle="Create and manage sales orders for customers"
                    action={
                        <Button
                            variant="secondary"
                            onClick={() => navigate('/sales/sales-order-list')}
                            icon={
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                            }
                        >
                            View All Orders
                        </Button>
                    }
                />

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        <Card title="Order Details">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormInput
                                    label="Order Date"
                                    type="date"
                                    value={formData.orderDate}
                                    onChange={(e) => setFormData({ ...formData, orderDate: e.target.value })}
                                    required
                                />
                                <FormInput
                                    label="Expected Delivery Date"
                                    type="date"
                                    value={formData.expectedDeliveryDate}
                                    onChange={(e) => setFormData({ ...formData, expectedDeliveryDate: e.target.value })}
                                    required
                                />
                            </div>
                        </Card>

                        <Card title="Customer">
                            {formData.customer ? (
                                <div className="p-3 bg-violet-50/50 dark:bg-violet-950/20 border border-violet-100 dark:border-violet-900/30 rounded-xl flex items-center justify-between">
                                    <div>
                                        <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm">{formData.customer.name}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{formData.customer.phone}</p>
                                        {formData.customer.email && (
                                            <p className="text-xs text-gray-500 dark:text-gray-400">{formData.customer.email}</p>
                                        )}
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                                        onClick={() => setFormData({ ...formData, customer: null })}
                                    >
                                        Remove
                                    </Button>
                                </div>
                            ) : (
                                <button
                                    type="button"
                                    onClick={() => setShowCustomerModal(true)}
                                    className="w-full p-6 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-xl text-gray-500 dark:text-gray-400 hover:border-violet-500 hover:text-violet-600 transition flex flex-col items-center justify-center gap-1.5 cursor-pointer bg-gray-50/50 dark:bg-gray-900/50"
                                >
                                    <svg className="w-8 h-8 text-gray-400 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                                    </svg>
                                    <span className="font-semibold text-sm text-gray-900 dark:text-gray-100">Select Customer</span>
                                    <span className="text-xs text-gray-500">Search by name, phone number, or email</span>
                                </button>
                            )}
                        </Card>

                        <Card
                            title="Items"
                            action={
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setShowItemModal(true)}
                                    icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>}
                                >
                                    Add Item
                                </Button>
                            }
                        >
                            {formData.items.length === 0 ? (
                                <div className="text-center py-10 border-2 border-dashed border-gray-100 dark:border-gray-800 rounded-xl">
                                    <svg className="w-10 h-10 text-gray-300 dark:text-gray-700 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                    </svg>
                                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">No items added</p>
                                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Click "Add Item" to select products from inventory</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto border border-gray-200/80 dark:border-gray-800 rounded-xl">
                                    <table className="w-full text-xs text-left">
                                        <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200/80 dark:border-gray-800 font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                                            <tr>
                                                <th className="px-3 py-2.5">Item</th>
                                                <th className="px-3 py-2.5">Qty</th>
                                                <th className="px-3 py-2.5">Rate</th>
                                                <th className="px-3 py-2.5">Tax %</th>
                                                <th className="px-3 py-2.5">Disc</th>
                                                <th className="px-3 py-2.5">Total</th>
                                                <th className="px-3 py-2.5 text-right">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200/80 dark:divide-gray-800 bg-white dark:bg-gray-900">
                                            {formData.items.map((item, index) => (
                                                <tr key={index} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50">
                                                    <td className="px-3 py-2.5">
                                                        <div className="font-medium text-gray-900 dark:text-gray-100">{item.name}</div>
                                                        <div className="text-[10px] text-gray-400">Available: {item.availableStock}</div>
                                                    </td>
                                                    <td className="px-3 py-2.5">
                                                        <input
                                                            type="number"
                                                            value={item.quantity}
                                                            onChange={(e) => updateItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                                                            className="w-20 px-2 py-1 text-xs border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-violet-500/20"
                                                            min="1"
                                                            max={item.availableStock}
                                                        />
                                                    </td>
                                                    <td className="px-3 py-2.5">
                                                        <input
                                                            type="number"
                                                            value={item.rate}
                                                            onChange={(e) => updateItem(index, 'rate', parseFloat(e.target.value) || 0)}
                                                            className="w-24 px-2 py-1 text-xs border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-violet-500/20"
                                                        />
                                                    </td>
                                                    <td className="px-3 py-2.5">
                                                        <select
                                                            value={item.tax}
                                                            onChange={(e) => updateItem(index, 'tax', parseFloat(e.target.value))}
                                                            className="w-20 px-2 py-1 text-xs border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-violet-500/20"
                                                        >
                                                            <option value="0">0%</option>
                                                            <option value="5">5%</option>
                                                            <option value="12">12%</option>
                                                            <option value="18">18%</option>
                                                            <option value="28">28%</option>
                                                        </select>
                                                    </td>
                                                    <td className="px-3 py-2.5">
                                                        <input
                                                            type="number"
                                                            value={item.discount}
                                                            onChange={(e) => updateItem(index, 'discount', parseFloat(e.target.value) || 0)}
                                                            className="w-20 px-2 py-1 text-xs border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-violet-500/20"
                                                        />
                                                    </td>
                                                    <td className="px-3 py-2.5 font-medium text-gray-900 dark:text-gray-100">
                                                        Rs. {calculateItemTotal(item).toFixed(2)}
                                                    </td>
                                                    <td className="px-3 py-2.5 text-right">
                                                        <button
                                                            type="button"
                                                            onClick={() => removeItem(index)}
                                                            className="p-1 text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                            </svg>
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </Card>

                        <Card title="Order Notes">
                            <textarea
                                value={formData.notes}
                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                rows="3"
                                className="w-full px-3 py-2 text-xs border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-xl text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition focus:outline-none"
                                placeholder="Add order instructions or extra details..."
                            />
                        </Card>
                    </div>

                    <div className="lg:col-span-1">
                        <Card title="Order Summary" className="sticky top-6">
                            <div className="mb-4">
                                <StatusBadge status="Draft" />
                            </div>

                            <div className="space-y-3 mb-4 text-xs border-b border-gray-100 dark:border-gray-800 pb-4">
                                <div className="flex justify-between">
                                    <span className="text-gray-500 dark:text-gray-400">Subtotal</span>
                                    <span className="font-medium text-gray-900 dark:text-gray-100">Rs. {calculateSubtotal().toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500 dark:text-gray-400">Tax</span>
                                    <span className="font-medium text-gray-900 dark:text-gray-100">Rs. {calculateTax().toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500 dark:text-gray-400">Item Discount</span>
                                    <span className="font-medium text-gray-900 dark:text-gray-100">Rs. {calculateItemDiscount().toFixed(2)}</span>
                                </div>
                                <div>
                                    <FormInput
                                        label="Order Discount (Rs.)"
                                        type="number"
                                        value={formData.discount}
                                        onChange={(e) => setFormData({ ...formData, discount: parseFloat(e.target.value) || 0 })}
                                    />
                                </div>
                            </div>

                            <div className="flex justify-between items-baseline mb-6">
                                <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">Total</span>
                                <span className="text-xl font-bold text-violet-700 dark:text-violet-400">Rs. {calculateTotal().toFixed(2)}</span>
                            </div>

                            <div className="space-y-3">
                                <Button
                                    variant="primary"
                                    onClick={handleConfirmOrder}
                                    isLoading={loading}
                                    className="w-full"
                                >
                                    Confirm Order
                                </Button>
                                <Button
                                    variant="secondary"
                                    onClick={handleSaveDraft}
                                    isLoading={loading}
                                    className="w-full"
                                >
                                    Save as Draft
                                </Button>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>

            <CustomerSelectionModal
                isOpen={showCustomerModal}
                onClose={() => setShowCustomerModal(false)}
                onSelect={(customer) => {
                    setFormData({ ...formData, customer });
                    setShowCustomerModal(false);
                }}
            />

            <ItemSelectionModal
                isOpen={showItemModal}
                onClose={() => setShowItemModal(false)}
                onSelect={addItemFromModal}
            />
        </Layout>
    );
};

export default SalesOrder;

