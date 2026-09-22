import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../services/api';
import { useLanguage } from '../contexts/LanguageContext';

const QuickAddItemModal = ({ isOpen, onClose, onItemCreated, prefilledBarcode = '', initialBarcode = '' }) => {
    const { isUrdu } = useLanguage();
    const [formData, setFormData] = useState({
        name: '',
        barcode: '',
        category: '',
        hsnCode: '',
        taxRate: 18,
        costPrice: '',
        sellingPrice: '',
        trackBatch: false,
        trackExpiry: false,
    });
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const barcodeValue = initialBarcode || prefilledBarcode;
        if (barcodeValue) {
            setFormData(prev => ({ ...prev, barcode: barcodeValue }));
        }
    }, [prefilledBarcode, initialBarcode]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.name.trim()) {
            toast.error(isUrdu ? 'آئٹم کا نام درج کرنا ضروری ہے' : 'Item name is required');
            return;
        }

        if (!formData.category.trim()) {
            toast.error(isUrdu ? 'کیٹیگری درج کرنا ضروری ہے' : 'Category is required');
            return;
        }

        setIsLoading(true);

        try {
            const response = await api.post('/api/inventory', {
                name: formData.name.trim(),
                barcode: formData.barcode.trim() || undefined,
                category: formData.category.trim(),
                hsnCode: formData.hsnCode.trim() || undefined,
                taxRate: formData.taxRate || 18,
                costPrice: parseFloat(formData.costPrice) || 0,
                sellingPrice: parseFloat(formData.sellingPrice) || 0,
                trackBatch: formData.trackBatch,
                trackExpiry: formData.trackExpiry,
                stockQty: 0,
            });

            toast.success(isUrdu ? 'آئٹم کامیابی سے شامل ہو گیا' : 'Item created successfully');

            if (onItemCreated) {
                onItemCreated({
                    ...response.data.item,
                    lastPurchaseRate: parseFloat(formData.costPrice) || 0,
                });
            }

            setFormData({
                name: '',
                barcode: '',
                category: '',
                hsnCode: '',
                taxRate: 18,
                costPrice: '',
                sellingPrice: '',
                trackBatch: false,
                trackExpiry: false,
            });
            onClose();
        } catch (error) {
            const message = error.response?.data?.message || (isUrdu ? 'آئٹم بنانے میں ناکامی ہوئی' : 'Failed to create item');
            toast.error(message);
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-slate-900/40 dark:bg-black/75 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <div dir="ltr" className="bg-white dark:bg-zinc-900 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-200 dark:border-zinc-800 shadow-2xl text-left">
                <div className="flex justify-between items-center mb-5 pb-3 border-b border-slate-100 dark:border-zinc-800">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                        <span>Quick Add Item</span>
                        {isUrdu && <span className="text-xs font-semibold text-violet-600 dark:text-violet-400 font-urdu">(نیا آئٹم درج کریں)</span>}
                    </h3>
                    <button
                        onClick={onClose}
                        className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:text-zinc-500 dark:hover:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 transition cursor-pointer"
                        type="button"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Item Name */}
                        <div className="md:col-span-2">
                            {isUrdu ? (
                                <label className="flex items-center justify-between text-xs sm:text-sm font-semibold text-secondary mb-1.5">
                                    <span>Item Name <span className="text-red-500">*</span></span>
                                    <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 font-urdu">آئٹم کا نام</span>
                                </label>
                            ) : (
                                <label className="block text-xs sm:text-sm font-semibold text-secondary mb-1.5">
                                    Item Name <span className="text-red-500">*</span>
                                </label>
                            )}
                            <input
                                type="text"
                                dir="ltr"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 rounded-lg focus:ring-2 focus:ring-violet-500 text-left"
                                placeholder={isUrdu ? "e.g. Panadol 500mg, Rooh Afza / آئٹم کا نام درج کریں" : "Enter item name"}
                                required
                                autoFocus
                            />
                        </div>

                        {/* Barcode */}
                        <div>
                            {isUrdu ? (
                                <label className="flex items-center justify-between text-xs sm:text-sm font-semibold text-secondary mb-1.5">
                                    <span>Barcode</span>
                                    <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 font-urdu">بارکوڈ</span>
                                </label>
                            ) : (
                                <label className="block text-xs sm:text-sm font-semibold text-secondary mb-1.5">
                                    Barcode
                                </label>
                            )}
                            <input
                                type="text"
                                dir="ltr"
                                value={formData.barcode}
                                onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                                className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 rounded-lg focus:ring-2 focus:ring-violet-500 font-mono text-left"
                                placeholder="Barcode (optional)"
                            />
                        </div>

                        {/* Category */}
                        <div>
                            {isUrdu ? (
                                <label className="flex items-center justify-between text-xs sm:text-sm font-semibold text-secondary mb-1.5">
                                    <span>Category <span className="text-red-500">*</span></span>
                                    <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 font-urdu">کیٹیگری</span>
                                </label>
                            ) : (
                                <label className="block text-xs sm:text-sm font-semibold text-secondary mb-1.5">
                                    Category <span className="text-red-500">*</span>
                                </label>
                            )}
                            <input
                                type="text"
                                dir="ltr"
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 rounded-lg focus:ring-2 focus:ring-violet-500 text-left"
                                placeholder={isUrdu ? "e.g. Groceries, Medicines / کیٹیگری منتخب کریں" : "e.g., Groceries, Electronics"}
                                required
                            />
                        </div>

                        {/* Cost Price */}
                        <div>
                            {isUrdu ? (
                                <label className="flex items-center justify-between text-xs sm:text-sm font-semibold text-secondary mb-1.5">
                                    <span>Purchase Rate (Cost)</span>
                                    <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 font-urdu">خریداری قیمت</span>
                                </label>
                            ) : (
                                <label className="block text-xs sm:text-sm font-semibold text-secondary mb-1.5">
                                    Purchase Rate (Cost)
                                </label>
                            )}
                            <input
                                type="number"
                                dir="ltr"
                                value={formData.costPrice}
                                onChange={(e) => setFormData({ ...formData, costPrice: e.target.value })}
                                className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 rounded-lg focus:ring-2 focus:ring-violet-500 font-mono text-left"
                                placeholder="0.00"
                                min="0"
                                step="0.01"
                            />
                        </div>

                        {/* Selling Price */}
                        <div>
                            {isUrdu ? (
                                <label className="flex items-center justify-between text-xs sm:text-sm font-semibold text-secondary mb-1.5">
                                    <span>Selling Price (Sale)</span>
                                    <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 font-urdu">فروخت قیمت</span>
                                </label>
                            ) : (
                                <label className="block text-xs sm:text-sm font-semibold text-secondary mb-1.5">
                                    Selling Price (Sale)
                                </label>
                            )}
                            <input
                                type="number"
                                dir="ltr"
                                value={formData.sellingPrice}
                                onChange={(e) => setFormData({ ...formData, sellingPrice: e.target.value })}
                                className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 rounded-lg focus:ring-2 focus:ring-violet-500 font-mono text-left"
                                placeholder="0.00"
                                min="0"
                                step="0.01"
                            />
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-4 border-t border-slate-100 dark:border-zinc-800">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2.5 border border-slate-300 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-800 font-semibold transition cursor-pointer"
                            disabled={isLoading}
                        >
                            {isUrdu ? 'Cancel / منسوخ کریں' : 'Cancel'}
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-4 py-2.5 bg-violet-600 hover:bg-violet-500 text-white rounded-xl font-bold shadow-md shadow-violet-600/20 transition disabled:opacity-50 cursor-pointer"
                            disabled={isLoading}
                        >
                            {isLoading
                                ? (isUrdu ? 'Creating... / بنایا جا رہا ہے' : 'Creating...')
                                : (isUrdu ? 'Create & Add Item / آئٹم محفوظ کریں' : 'Create & Add Item')
                            }
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default QuickAddItemModal;
