import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import api from '../services/api';

const ItemSelectionModal = ({ isOpen, onClose, onSelect }) => {
    const [items, setItems] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedItem, setSelectedItem] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchItems();
        }
    }, [isOpen]);

    const fetchItems = async () => {
        setLoading(true);
        try {
            const userStr = localStorage.getItem('user');
            if (!userStr) {
                console.error('No user found. Please login again.');
                alert('No authentication found. Please login again.');
                setLoading(false);
                return;
            }

            const user = JSON.parse(userStr);
            const token = user?.token;

            if (!token) {
                console.error('No token found in user object. Please login again.');
                alert('Authentication token missing. Please login again.');
                setLoading(false);
                return;
            }

            console.log('Fetching items from:', `/api/inventory`);
            const response = await api.get(`/api/inventory`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            console.log('Items fetched successfully:', response.data);
            // Backend returns { success: true, items: [...] }
            // Extract just the items array
            const itemsData = response.data.items || response.data || [];
            console.log('Number of items:', itemsData.length);
            setItems(itemsData);
        } catch (error) {
            console.error('Error fetching items:', error);
            console.error('Error details:', error.response);
            if (error.response?.status === 401) {
                console.error('Authentication failed. Please logout and login again.');
                alert('Your session has expired. Please logout and login again.');
            } else {
                alert(`Failed to load items: ${error.response?.data?.message || error.message}`);
            }
        } finally {
            setLoading(false);
        }
    };

    const filteredItems = Array.isArray(items) ? items.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.sku && item.sku.toLowerCase().includes(searchTerm.toLowerCase()))
    ) : [];

    const handleSelect = () => {
        if (selectedItem && quantity > 0) {
            onSelect({ ...selectedItem, quantity });
            setSelectedItem(null);
            setQuantity(1);
            setSearchTerm('');
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-slate-900/40 dark:bg-black/75 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <div dir="ltr" className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[85vh] overflow-hidden flex flex-col text-left">
                <div className="p-5 border-b border-slate-200 dark:border-zinc-800">
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="text-lg font-bold text-slate-900 dark:text-zinc-100">Select Item</h2>
                        <button
                            onClick={onClose}
                            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:text-zinc-500 dark:hover:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 transition cursor-pointer"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                    <input
                        type="text"
                        placeholder="Search by name or SKU..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full px-3.5 py-2 border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-500 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent text-sm"
                    />
                </div>

                <div className="p-5 overflow-y-auto max-h-96 flex-1">
                    {loading ? (
                        <div className="text-center py-8 text-slate-500 dark:text-zinc-400 text-sm">Loading items...</div>
                    ) : filteredItems.length === 0 ? (
                        <div className="text-center py-8 text-slate-500 dark:text-zinc-400 text-sm">No items found</div>
                    ) : (
                        <div className="space-y-2">
                            {filteredItems.map((item) => {
                                const availableStock = item.stockQty - (item.reservedStock || 0);
                                const isOutOfStock = availableStock <= 0;
                                const isLowStock = availableStock > 0 && availableStock <= item.lowStockLimit;

                                return (
                                    <div
                                        key={item._id}
                                        onClick={() => !isOutOfStock && setSelectedItem(item)}
                                        className={`p-3.5 border rounded-xl cursor-pointer transition shadow-xs ${
                                            selectedItem?._id === item._id
                                                ? 'border-violet-500 bg-violet-50/60 dark:bg-violet-950/40 ring-1 ring-violet-500'
                                                : 'border-slate-200 dark:border-zinc-800 bg-slate-50/60 dark:bg-zinc-850/50 hover:bg-slate-100 dark:hover:bg-zinc-800'
                                        } ${isOutOfStock ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <h3 className="font-semibold text-slate-900 dark:text-zinc-100 text-sm">{item.name}</h3>
                                                    {item.sku && (
                                                        <span className="text-[11px] text-slate-500 dark:text-zinc-400 bg-slate-200/80 dark:bg-zinc-800 px-2 py-0.5 rounded font-mono">
                                                            {item.sku}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-3 mt-1 text-xs text-slate-600 dark:text-zinc-400">
                                                    <span>Price: <strong className="text-slate-800 dark:text-zinc-200 font-mono">Rs. {item.sellingPrice}</strong></span>
                                                    <span>Stock: <strong className="text-slate-800 dark:text-zinc-200 font-mono">{item.stockQty}</strong></span>
                                                    {item.reservedStock > 0 && (
                                                        <span className="text-amber-600 font-medium">Reserved: {item.reservedStock}</span>
                                                    )}
                                                    <span className={isOutOfStock ? 'text-rose-600 font-bold' : isLowStock ? 'text-amber-600 font-bold' : 'text-emerald-600 font-bold'}>
                                                        Available: {availableStock}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {isOutOfStock && (
                                                    <span className="px-2.5 py-0.5 bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 text-xs font-bold rounded-full">
                                                        Out of Stock
                                                    </span>
                                                )}
                                                {isLowStock && !isOutOfStock && (
                                                    <span className="px-2.5 py-0.5 bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 text-xs font-bold rounded-full">
                                                        Low Stock
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {selectedItem && (
                    <div className="p-4 border-t border-slate-200 dark:border-zinc-800 bg-slate-50/80 dark:bg-zinc-850/60">
                        <div className="flex items-center gap-3">
                            <div className="flex-1">
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-zinc-400 mb-1">
                                    Quantity
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    max={selectedItem.stockQty - (selectedItem.reservedStock || 0)}
                                    value={quantity}
                                    onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                                    className="w-full px-3.5 py-2 border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 rounded-xl focus:ring-2 focus:ring-violet-500 font-mono text-sm"
                                />
                            </div>
                            <div className="flex gap-2 self-end">
                                <button
                                    onClick={onClose}
                                    className="px-4 py-2 border border-slate-300 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-800 transition font-semibold text-sm cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSelect}
                                    className="px-5 py-2 bg-violet-600 hover:bg-violet-500 text-white font-bold rounded-xl shadow-xs transition text-sm cursor-pointer"
                                >
                                    Add Item
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

ItemSelectionModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onSelect: PropTypes.func.isRequired,
};

export default ItemSelectionModal;
