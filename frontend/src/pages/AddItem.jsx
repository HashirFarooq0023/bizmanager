import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import useDraftSave from '../hooks/useDraftSave';
import { useLanguage } from '../contexts/LanguageContext';
import { addItem, reset } from '../redux/slices/inventorySlice';
import Layout from '../components/Layout';

const AddItem = () => {
  const { isUrdu } = useLanguage();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isLoading, isSuccess, isError, message } = useSelector(
    (state) => state.inventory
  );

  const initialFormData = {
    name: '',
    sku: '',
    category: '',
    costPrice: '',
    sellingPrice: '',
    stockQty: '',
    lowStockLimit: '5',
    unit: 'pcs',
  };

  const [formData, setFormData, clearDraft] = useDraftSave('itemDraft', initialFormData);

  const [shouldNavigate, setShouldNavigate] = useState(false);

  const { name, sku, category, costPrice, sellingPrice, stockQty, lowStockLimit, unit } = formData;

  useEffect(() => {
    // Only navigate if we explicitly set the flag from this component
    if (shouldNavigate && isSuccess) {
      clearDraft(); // Clear draft on success
      navigate('/inventory');
      dispatch(reset());
    }
  }, [shouldNavigate, isSuccess, navigate, dispatch, clearDraft]);

  const onChange = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setShouldNavigate(true);

    const itemData = {
      ...formData,
      costPrice: parseFloat(costPrice),
      sellingPrice: parseFloat(sellingPrice),
      stockQty: parseInt(stockQty) || 0,
      lowStockLimit: parseInt(lowStockLimit) || 5,
    };

    await dispatch(addItem(itemData));
  };

  return (
    <Layout>
      <div dir="ltr" className="max-w-4xl mx-auto text-left">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/inventory')}
            className="flex items-center text-secondary hover:text-main mb-4 transition-colors"
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
            {isUrdu ? 'Back to Inventory / انونٹری کی فہرست' : 'Back to Inventory'}
          </button>
          <h1 className="text-3xl font-bold text-main mb-2">
            {isUrdu ? 'Add New Item (نیا آئٹم شامل کریں)' : 'Add New Item'}
          </h1>
          <p className="text-secondary">
            {isUrdu ? 'Add a new product to your inventory (انونٹری میں نیا پروڈکٹ شامل کریں)' : 'Add a new product to your inventory'}
          </p>
        </div>

        {/* Error Message */}
        {isError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{message}</p>
          </div>
        )}

        {/* Form Card */}
        <div className="bg-card rounded-xl shadow-sm p-8 border border-default">
          <form onSubmit={onSubmit} className="space-y-6">
            {/* Basic Info Section */}
            <div>
              <h3 className="text-lg font-semibold text-main mb-4">
                {isUrdu ? 'Basic Information (بنیادی معلومات)' : 'Basic Information'}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Name Input */}
                <div className="md:col-span-2">
                  <div className="flex items-center justify-between mb-2">
                    <label
                      htmlFor="name"
                      className="block text-sm font-medium text-secondary"
                    >
                      Item Name <span className="text-red-500">*</span>
                    </label>
                    {isUrdu && <span className="text-xs text-secondary font-urdu">آئٹم کا نام</span>}
                  </div>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={name}
                    onChange={onChange}
                    required
                    className="w-full px-4 py-3 border border-default rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-main"
                    placeholder={isUrdu ? "e.g., Rice Bag 25kg / نام درج کریں" : "e.g., Rice Bag 25kg"}
                  />
                </div>

                {/* SKU Input */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label
                      htmlFor="sku"
                      className="block text-sm font-medium text-secondary"
                    >
                      SKU / Barcode
                    </label>
                    {isUrdu && <span className="text-xs text-secondary font-urdu">بارکوڈ / کوڈ</span>}
                  </div>
                  <input
                    type="text"
                    id="sku"
                    name="sku"
                    value={sku}
                    onChange={onChange}
                    className="w-full px-4 py-3 border border-default rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-main"
                    placeholder="e.g., RICE-001"
                  />
                </div>

                {/* Category Input */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label
                      htmlFor="category"
                      className="block text-sm font-medium text-secondary"
                    >
                      Category
                    </label>
                    {isUrdu && <span className="text-xs text-secondary font-urdu">کیٹیگری</span>}
                  </div>
                  <input
                    type="text"
                    id="category"
                    name="category"
                    value={category}
                    onChange={onChange}
                    className="w-full px-4 py-3 border border-default rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-main"
                    placeholder={isUrdu ? "e.g., Grocery / کریانہ" : "e.g., Grocery"}
                  />
                </div>
              </div>
            </div>

            {/* Pricing Section */}
            <div className="border-t border-default pt-6">
              <h3 className="text-lg font-semibold text-main mb-4">
                {isUrdu ? 'Pricing (قیمت)' : 'Pricing'}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Cost Price */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label
                      htmlFor="costPrice"
                      className="block text-sm font-medium text-secondary"
                    >
                      Cost Price (Rs.) <span className="text-red-500">*</span>
                    </label>
                    {isUrdu && <span className="text-xs text-secondary font-urdu">خریداری قیمت (روپے)</span>}
                  </div>
                  <input
                    type="number"
                    id="costPrice"
                    name="costPrice"
                    value={costPrice}
                    onChange={onChange}
                    required
                    step="0.01"
                    min="0"
                    className="w-full px-4 py-3 border border-default rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-main"
                    placeholder="0.00"
                  />
                  <p className="mt-1 text-xs text-muted">
                    {isUrdu ? 'Purchase/Cost price per unit / فی یونٹ خریداری کی قیمت' : 'Purchase/Cost price per unit'}
                  </p>
                </div>

                {/* Selling Price */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label
                      htmlFor="sellingPrice"
                      className="block text-sm font-medium text-secondary"
                    >
                      Selling Price (Rs.) <span className="text-red-500">*</span>
                    </label>
                    {isUrdu && <span className="text-xs text-secondary font-urdu">فروخت قیمت (روپے)</span>}
                  </div>
                  <input
                    type="number"
                    id="sellingPrice"
                    name="sellingPrice"
                    value={sellingPrice}
                    onChange={onChange}
                    required
                    step="0.01"
                    min="0"
                    className="w-full px-4 py-3 border border-default rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-main"
                    placeholder="0.00"
                  />
                  <p className="mt-1 text-xs text-muted">
                    {isUrdu ? 'Retail/Selling price per unit / فی یونٹ فروخت کی قیمت' : 'Retail/Selling price per unit'}
                  </p>
                </div>

                {/* Profit Margin Display */}
                {costPrice && sellingPrice && (
                  <div className="md:col-span-2 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                    <p className="text-sm text-secondary">
                      <span className="font-medium">{isUrdu ? 'Profit Margin / منافع کی شرح:' : 'Profit Margin:'}</span>{' '}
                      <span className="text-green-600 dark:text-green-400 font-bold">
                        {((sellingPrice - costPrice) / costPrice * 100).toFixed(1)}%
                      </span>
                      {' '}(Rs. {(sellingPrice - costPrice).toFixed(2)} {isUrdu ? 'profit per unit / منافع فی یونٹ' : 'profit per unit'})
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Stock Section */}
            <div className="border-t border-default pt-6">
              <h3 className="text-lg font-semibold text-main mb-4">
                {isUrdu ? 'Stock Information (اسٹاک کی معلومات)' : 'Stock Information'}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Stock Quantity */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label
                      htmlFor="stockQty"
                      className="block text-sm font-medium text-secondary"
                    >
                      Stock Quantity
                    </label>
                    {isUrdu && <span className="text-xs text-secondary font-urdu">موجودہ تعداد</span>}
                  </div>
                  <input
                    type="number"
                    id="stockQty"
                    name="stockQty"
                    value={stockQty}
                    onChange={onChange}
                    min="0"
                    className="w-full px-4 py-3 border border-default rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-main"
                    placeholder="0"
                  />
                </div>

                {/* Low Stock Limit */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label
                      htmlFor="lowStockLimit"
                      className="block text-sm font-medium text-secondary"
                    >
                      Low Stock Alert
                    </label>
                    {isUrdu && <span className="text-xs text-secondary font-urdu">کم اسٹاک الرٹ</span>}
                  </div>
                  <input
                    type="number"
                    id="lowStockLimit"
                    name="lowStockLimit"
                    value={lowStockLimit}
                    onChange={onChange}
                    min="0"
                    className="w-full px-4 py-3 border border-default rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-main"
                    placeholder="5"
                  />
                  <p className="mt-1 text-xs text-muted">
                    {isUrdu ? 'Alert when stock falls below this / جب اسٹاک اس سے کم ہو تو خبردار کریں' : 'Alert when stock falls below this'}
                  </p>
                </div>

                {/* Unit */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label
                      htmlFor="unit"
                      className="block text-sm font-medium text-secondary"
                    >
                      Unit
                    </label>
                    {isUrdu && <span className="text-xs text-secondary font-urdu">پیمائش کی اکائی</span>}
                  </div>
                  <select
                    id="unit"
                    name="unit"
                    value={unit}
                    onChange={onChange}
                    className="w-full px-4 py-3 border border-default rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-main"
                  >
                    <option value="pcs">{isUrdu ? 'Pieces (pcs) / عدد' : 'Pieces (pcs)'}</option>
                    <option value="kg">{isUrdu ? 'Kilograms (kg) / کلوگرام' : 'Kilograms (kg)'}</option>
                    <option value="g">{isUrdu ? 'Grams (g) / گرام' : 'Grams (g)'}</option>
                    <option value="l">{isUrdu ? 'Liters (l) / لیٹر' : 'Liters (l)'}</option>
                    <option value="ml">{isUrdu ? 'Milliliters (ml) / ملی لیٹر' : 'Milliliters (ml)'}</option>
                    <option value="box">{isUrdu ? 'Box / ڈبہ' : 'Box'}</option>
                    <option value="pack">{isUrdu ? 'Pack / پیکٹ' : 'Pack'}</option>
                    <option value="dozen">{isUrdu ? 'Dozen / درجن' : 'Dozen'}</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex space-x-4 pt-4 border-t border-default">
              <button
                type="button"
                onClick={() => navigate('/inventory')}
                className="flex-1 px-6 py-3 border border-default text-secondary rounded-lg hover:bg-surface font-medium transition cursor-pointer"
              >
                {isUrdu ? 'Cancel / منسوخ کریں' : 'Cancel'}
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 px-6 py-3 bg-violet-600 text-white rounded-lg hover:bg-violet-700 font-semibold shadow-xs transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <svg
                      className="animate-spin h-5 w-5 mr-2"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    {isUrdu ? 'Adding Item... / شامل کیا جا رہا ہے...' : 'Adding Item...'}
                  </span>
                ) : (
                  isUrdu ? 'Add Item / آئٹم شامل کریں' : 'Add Item'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default AddItem;