import { useState, useEffect } from 'react';
import api from '../../services/api';
import { toast } from 'react-toastify';
import { useLanguage } from '../../contexts/LanguageContext';

const PurchaseSelectionModal = ({ sourceType, onSelect, onClose }) => {
    const { isUrdu } = useLanguage();
    const [search, setSearch] = useState('');
    const [purchases, setPurchases] = useState([]);
    const [loading, setLoading] = useState(false);

    // Fetch purchases on mount
    useEffect(() => {
        fetchPurchases();
    }, [sourceType]);

    const fetchPurchases = async () => {
        try {
            setLoading(true);
            const response = await api.get('/api/purchase-returns/purchases-for-return', {
                params: { search, type: sourceType },
            });
            setPurchases(response.data);
        } catch (err) {
            console.error('Error fetching purchases:', err);
            toast.error(isUrdu ? 'پرچیز ڈیٹا حاصل کرنے میں ناکامی ہوئی' : 'Failed to fetch purchases');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        fetchPurchases();
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <div dir="ltr" className="bg-card rounded-xl shadow-2xl w-full max-w-4xl max-h-[85vh] overflow-hidden border border-default text-left flex flex-col">
                {/* Header */}
                <div className="px-6 py-4 border-b border-default flex justify-between items-center">
                    <h2 className="text-xl font-bold text-main">
                        {isUrdu
                            ? (sourceType === 'purchase' ? 'Select Purchase (خریداری منتخب کریں)' : 'Select GRN (جی آر این منتخب کریں)')
                            : `Select ${sourceType === 'purchase' ? 'Purchase' : 'GRN'}`}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-secondary hover:text-main cursor-pointer"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Search */}
                <div className="px-6 py-4 border-b border-default bg-surface/50">
                    <form onSubmit={handleSearch} className="flex space-x-2">
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder={isUrdu
                                ? `Search by ${sourceType === 'purchase' ? 'purchase number or invoice / پرچیز نمبر' : 'GRN number or PO / جی آر این نمبر'}`
                                : `Search by ${sourceType === 'purchase' ? 'purchase number or invoice' : 'GRN number or PO'}`}
                            className="flex-1 px-4 py-2.5 border border-default rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-main"
                        />
                        <button
                            type="submit"
                            className="px-6 py-2.5 bg-violet-600 text-white rounded-lg hover:bg-violet-700 font-semibold shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                            disabled={loading}
                        >
                            {loading ? (isUrdu ? 'Searching... / تلاش...' : 'Searching...') : (isUrdu ? 'Search / تلاش' : 'Search')}
                        </button>
                    </form>
                </div>

                {/* Results */}
                <div className="px-6 py-4 overflow-y-auto flex-1 max-h-96">
                    {purchases.length === 0 ? (
                        <div className="text-center py-12 text-secondary">
                            <p>{isUrdu ? 'کوئی پرچیز ریکارڈ نہیں ملا۔ اوپر تلاش کریں۔' : 'No purchases found. Try searching above.'}</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {purchases.map((purchase) => (
                                <div
                                    key={purchase._id}
                                    onClick={() => onSelect(purchase)}
                                    className="border border-default rounded-lg p-4 hover:border-violet-500 hover:bg-violet-50 dark:hover:bg-violet-900/20 cursor-pointer transition-colors bg-card"
                                >
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="font-semibold text-main text-base">
                                                {sourceType === 'purchase' ? purchase.purchaseNo : purchase.grnNumber}
                                            </h3>
                                            <p className="text-sm text-secondary mt-1">
                                                {purchase.supplier?.businessName}
                                            </p>
                                            <p className="text-xs text-muted mt-1">
                                                Date: {new Date(sourceType === 'purchase' ? purchase.purchaseDate : purchase.grnDate).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-main text-base">
                                                Rs. {purchase.totalAmount?.toFixed(2)}
                                            </p>
                                            <p className="text-xs text-muted mt-1">
                                                {purchase.items?.length} items
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-default flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 border border-default rounded-lg text-secondary hover:bg-surface font-medium cursor-pointer transition-colors"
                    >
                        {isUrdu ? 'Cancel / منسوخ کریں' : 'Cancel'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PurchaseSelectionModal;
