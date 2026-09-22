import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import api from '../services/api';
import { useLanguage } from '../contexts/LanguageContext';

const SalesOrderSelectionModal = ({ isOpen, onClose, onSelect }) => {
    const { user } = useSelector((state) => state.auth);
    const { isUrdu } = useLanguage();
    const [orders, setOrders] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const response = await api.get(
                `/api/sales-orders`,
                {
                    headers: { Authorization: `Bearer ${user.token}` }
                }
            );

            // Filter only Confirmed orders that are not fully delivered
            const availableOrders = response.data.filter(order =>
                order.status === 'Confirmed' ||
                order.status === 'Partially Delivered'
            );

            setOrders(availableOrders);
        } catch (error) {
            console.error('Error fetching sales orders:', error);
            alert(`Failed to load sales orders: ${error.response?.data?.message || error.message}`);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen) {
            fetchOrders();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen]);

    const filteredOrders = orders.filter(order =>
        order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (order.customer?.name || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSelect = (order) => {
        onSelect(order);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center z-50 p-4" dir="ltr">
            <div className="bg-card rounded-2xl shadow-2xl border border-default w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden text-left">
                <div className="p-6 border-b border-default shrink-0">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold text-main flex items-center gap-2">
                            <span>Select Sales Order</span>
                            {isUrdu && <span className="text-sm font-urdu text-secondary font-normal">(سیلز آرڈر منتخب کریں)</span>}
                        </h2>
                        <button
                            onClick={onClose}
                            className="text-muted hover:text-main p-1 rounded-lg hover:bg-hover transition"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                    <input
                        type="text"
                        placeholder={isUrdu ? "Search by order number or customer... (آرڈر نمبر یا گاہک سے تلاش کریں)" : "Search by order number or customer..."}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full px-4 py-2.5 bg-input border border-default rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-violet-500 text-main transition shadow-xs text-left"
                    />
                </div>

                <div className="p-6 overflow-y-auto max-h-[60vh]">
                    {loading ? (
                        <div className="text-center py-12 text-secondary font-medium">
                            {isUrdu ? 'Loading orders... (آرڈرز لوڈ ہو رہے ہیں)' : 'Loading orders...'}
                        </div>
                    ) : filteredOrders.length === 0 ? (
                        <div className="text-center py-12 text-secondary font-medium">
                            {isUrdu ? 'No confirmed sales orders available (کوئی تصدیق شدہ آرڈر دستیاب نہیں)' : 'No confirmed sales orders available'}
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {filteredOrders.map((order) => (
                                <div
                                    key={order._id}
                                    onClick={() => handleSelect(order)}
                                    className="p-4 border border-default rounded-xl cursor-pointer hover:border-violet-500 hover:bg-violet-500/5 transition text-left"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <h3 className="font-bold text-violet-600 dark:text-violet-400 text-lg">
                                                    {order.orderNumber}
                                                </h3>
                                                <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full ${order.status === 'Confirmed'
                                                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                                                        : 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20'
                                                    }`}>
                                                    {order.status}
                                                </span>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4 text-sm">
                                                <div>
                                                    <span className="text-muted">{isUrdu ? 'Customer (گاہک):' : 'Customer:'}</span>
                                                    <span className="ml-2 font-semibold text-main">
                                                        {order.customer?.name || 'N/A'}
                                                    </span>
                                                </div>
                                                <div>
                                                    <span className="text-muted">{isUrdu ? 'Order Date (تاریخ):' : 'Order Date:'}</span>
                                                    <span className="ml-2 font-semibold text-main">
                                                        {new Date(order.orderDate).toLocaleDateString('en-PK')}
                                                    </span>
                                                </div>
                                                <div>
                                                    <span className="text-muted">{isUrdu ? 'Items (اشیاء):' : 'Items:'}</span>
                                                    <span className="ml-2 font-semibold text-main">
                                                        {order.items.length}
                                                    </span>
                                                </div>
                                                <div>
                                                    <span className="text-muted">{isUrdu ? 'Total (کل رقم):' : 'Total Amount:'}</span>
                                                    <span className="ml-2 font-bold text-main">
                                                        Rs. {order.totalAmount.toLocaleString('en-PK')}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="ml-4">
                                            <svg className="w-6 h-6 text-violet-600 dark:text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

SalesOrderSelectionModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onSelect: PropTypes.func.isRequired,
};

export default SalesOrderSelectionModal;
