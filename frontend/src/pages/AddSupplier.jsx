import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import useDraftSave from '../hooks/useDraftSave';
import { useLanguage } from '../contexts/LanguageContext';
import { addSupplier, reset } from '../redux/slices/supplierSlice';
import Layout from '../components/Layout';

const AddSupplier = () => {
  const { isUrdu } = useLanguage();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isLoading, isSuccess, isError, message } = useSelector(
    (state) => state.suppliers
  );

  const initialFormData = {
    businessName: '',
    contactPersonName: '',
    contactNo: '',
    email: '',
    physicalAddress: '',
    gstNo: '',
    supplierType: 'manufacturer',
    openingBalance: 0,
    balanceType: 'payable',
    creditPeriod: 0,
    status: 'active',
  };

  const [formData, setFormData, clearDraft] = useDraftSave('supplierDraft', initialFormData);

  const [shouldNavigate, setShouldNavigate] = useState(false);

  const { businessName, contactPersonName, contactNo, email, physicalAddress, gstNo, supplierType, openingBalance, balanceType, creditPeriod, status } = formData;

  useEffect(() => {
    // Only navigate if we explicitly set the flag from this component
    if (shouldNavigate && isSuccess) {
      clearDraft(); // Clear draft on success
      navigate('/suppliers');
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
    await dispatch(addSupplier(formData));
  };

  return (
    <Layout>
      <div dir="ltr" className="max-w-3xl mx-auto text-left">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/suppliers')}
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
            {isUrdu ? 'Back to Suppliers / سپلائرز کی فہرست' : 'Back to Suppliers'}
          </button>
          <h1 className="text-3xl font-bold text-main mb-2">
            {isUrdu ? 'Add New Supplier (نیا سپلائر شامل کریں)' : 'Add New Supplier'}
          </h1>
          <p className="text-secondary">
            {isUrdu ? 'Create a new supplier profile (سپلائر کا نیا پروفائل بنائیں)' : 'Create a new supplier profile'}
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
            {/* Business Name Input */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label
                  htmlFor="businessName"
                  className="block text-sm font-medium text-secondary"
                >
                  Business Name <span className="text-red-500">*</span>
                </label>
                {isUrdu && <span className="text-xs text-secondary font-urdu">کاروبار / فرم کا نام</span>}
              </div>
              <input
                type="text"
                id="businessName"
                name="businessName"
                value={businessName}
                onChange={onChange}
                required
                className="w-full px-4 py-3 border border-default rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-main"
                placeholder={isUrdu ? "e.g. ABC Suppliers Pvt Ltd / نام درج کریں" : "ABC Suppliers Pvt Ltd"}
              />
            </div>

            {/* Contact Person Name Input */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label
                  htmlFor="contactPersonName"
                  className="block text-sm font-medium text-secondary"
                >
                  Contact Person Name <span className="text-red-500">*</span>
                </label>
                {isUrdu && <span className="text-xs text-secondary font-urdu">رابطہ کار کا نام</span>}
              </div>
              <input
                type="text"
                id="contactPersonName"
                name="contactPersonName"
                value={contactPersonName}
                onChange={onChange}
                required
                className="w-full px-4 py-3 border border-default rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-main"
                placeholder={isUrdu ? "e.g. John Doe / نام درج کریں" : "John Doe"}
              />
            </div>

            {/* Contact No. Input */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label
                  htmlFor="contactNo"
                  className="block text-sm font-medium text-secondary"
                >
                  Contact Number <span className="text-red-500">*</span>
                </label>
                {isUrdu && <span className="text-xs text-secondary font-urdu">فون نمبر</span>}
              </div>
              <input
                type="tel"
                id="contactNo"
                name="contactNo"
                value={contactNo}
                onChange={onChange}
                pattern="[0-9]{10,11}"
                maxLength={11}
                required
                title="Please enter a valid mobile number"
                className="w-full px-4 py-3 border border-default rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-main"
                placeholder="0325-4567318"
              />
            </div>

            {/* Email Input */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-secondary"
                >
                  Email Address <span className="text-red-500">*</span>
                </label>
                {isUrdu && <span className="text-xs text-secondary font-urdu">ای میل ایڈریس</span>}
              </div>
              <input
                type="email"
                id="email"
                name="email"
                value={email}
                onChange={onChange}
                required
                className="w-full px-4 py-3 border border-default rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-main"
                placeholder="supplier@example.com"
              />
            </div>

            {/* Physical Address Input */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label
                  htmlFor="physicalAddress"
                  className="block text-sm font-medium text-secondary"
                >
                  Physical Address <span className="text-red-500">*</span>
                </label>
                {isUrdu && <span className="text-xs text-secondary font-urdu">پتہ</span>}
              </div>
              <textarea
                id="physicalAddress"
                name="physicalAddress"
                value={physicalAddress}
                onChange={onChange}
                required
                rows={3}
                className="w-full px-4 py-3 border border-default rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-main"
                placeholder={isUrdu ? "Street address, City / گلی، پتہ، شہر" : "Street address, City, State, PIN"}
              />
            </div>

            {/* GST / NTN Number Input */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label
                  htmlFor="gstNo"
                  className="block text-sm font-medium text-secondary"
                >
                  GST / NTN Number <span className="text-xs text-muted font-normal">({isUrdu ? 'Optional / اختیاری' : 'Optional'})</span>
                </label>
                {isUrdu && <span className="text-xs text-secondary font-urdu">جی ایس ٹی / این ٹی این نمبر</span>}
              </div>
              <input
                type="text"
                id="gstNo"
                name="gstNo"
                value={gstNo}
                onChange={onChange}
                maxLength={20}
                className="w-full px-4 py-3 border border-default rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-main"
                placeholder="e.g. 1234567-8 or STRN / GST"
              />
            </div>

            {/* Supplier Type Input */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label
                  htmlFor="supplierType"
                  className="block text-sm font-medium text-secondary"
                >
                  Supplier Type <span className="text-red-500">*</span>
                </label>
                {isUrdu && <span className="text-xs text-secondary font-urdu">سپلائر کی قسم</span>}
              </div>
              <select
                id="supplierType"
                name="supplierType"
                value={supplierType}
                onChange={onChange}
                required
                className="w-full px-4 py-3 border border-default rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-main"
              >
                <option value="manufacturer">{isUrdu ? 'Manufacturer / کارخانہ دار' : 'Manufacturer'}</option>
                <option value="wholesaler">{isUrdu ? 'Wholesaler / ہول سیلر' : 'Wholesaler'}</option>
                <option value="distributor">{isUrdu ? 'Distributor / ڈسٹری بیوٹر' : 'Distributor'}</option>
              </select>
            </div>

            {/* Opening Balance Input */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label
                  htmlFor="openingBalance"
                  className="block text-sm font-medium text-secondary"
                >
                  Opening Balance
                </label>
                {isUrdu && <span className="text-xs text-secondary font-urdu">ابتدائی بقایا</span>}
              </div>
              <input
                type="number"
                id="openingBalance"
                name="openingBalance"
                value={openingBalance}
                onChange={onChange}
                min="0"
                step="0.01"
                className="w-full px-4 py-3 border border-default rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-main"
                placeholder="0.00"
              />
            </div>

            {/* Balance Type Input */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label
                  htmlFor="balanceType"
                  className="block text-sm font-medium text-secondary"
                >
                  Balance Type
                </label>
                {isUrdu && <span className="text-xs text-secondary font-urdu">بقایا کی قسم</span>}
              </div>
              <select
                id="balanceType"
                name="balanceType"
                value={balanceType}
                onChange={onChange}
                className="w-full px-4 py-3 border border-default rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-main"
              >
                <option value="payable">{isUrdu ? 'Payable / واجب الادا (دینے ہیں)' : 'Payable'}</option>
                <option value="receivable">{isUrdu ? 'Receivable / وصول طلب (لینے ہیں)' : 'Receivable'}</option>
              </select>
            </div>

            {/* Credit Period Input */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label
                  htmlFor="creditPeriod"
                  className="block text-sm font-medium text-secondary"
                >
                  Credit Period (in days)
                </label>
                {isUrdu && <span className="text-xs text-secondary font-urdu">ادھار کی مدت (دنوں میں)</span>}
              </div>
              <input
                type="number"
                id="creditPeriod"
                name="creditPeriod"
                value={creditPeriod}
                onChange={onChange}
                min="0"
                className="w-full px-4 py-3 border border-default rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-main"
                placeholder="30"
              />
            </div>

            {/* Status Input */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label
                  htmlFor="status"
                  className="block text-sm font-medium text-secondary"
                >
                  Status <span className="text-red-500">*</span>
                </label>
                {isUrdu && <span className="text-xs text-secondary font-urdu">حیثیت</span>}
              </div>
              <select
                id="status"
                name="status"
                value={status}
                onChange={onChange}
                required
                className="w-full px-4 py-3 border border-default rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-main"
              >
                <option value="active">{isUrdu ? 'Active / فعال' : 'Active'}</option>
                <option value="inactive">{isUrdu ? 'Inactive / غیر فعال' : 'Inactive'}</option>
              </select>
            </div>

            {/* Form Actions */}
            <div className="flex space-x-4 pt-4 border-t border-default">
              <button
                type="button"
                onClick={() => navigate('/suppliers')}
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
                    {isUrdu ? 'Adding Supplier... / شامل کیا جا رہا ہے...' : 'Adding Supplier...'}
                  </span>
                ) : (
                  isUrdu ? 'Add Supplier / سپلائر شامل کریں' : 'Add Supplier'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default AddSupplier;