import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { useLanguage } from "../contexts/LanguageContext";
import {
  getCustomerById,
  updateCustomer,
  reset,
} from "../redux/slices/customerSlice";
import Layout from "../components/Layout";
import "react-toastify/dist/ReactToastify.css";

const EditCustomer = () => {
  const { isUrdu } = useLanguage();
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { customer, isLoading, isSuccess } = useSelector(
    (state) => state.customers
  );

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
  });

  const [shouldNavigate, setShouldNavigate] = useState(false);
  const [duplicateField, setDuplicateField] = useState(null);

  const { name, phone, email, address } = formData;

  useEffect(() => {
    dispatch(getCustomerById(id));
    return () => {
      dispatch(reset());
    };
  }, [dispatch, id]);

  useEffect(() => {
    if (customer) {
      setFormData({
        name: customer.name || "",
        phone: customer.phone || "",
        email: customer.email || "",
        address: customer.address || "",
      });
    }
  }, [customer]);

  useEffect(() => {
    // Only navigate if we explicitly set the flag from this component
    if (shouldNavigate && isSuccess && !isLoading) {
      navigate("/customers");
      dispatch(reset());
    }
  }, [shouldNavigate, isSuccess, isLoading, navigate, dispatch]);

  const onChange = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setDuplicateField(null);
    const result = await dispatch(updateCustomer({ id, customerData: formData }));
    if (result.type === 'customers/update/fulfilled') {
      toast.success("Customer updated successfully!");
      setShouldNavigate(true);
    } else if (result.type === 'customers/update/rejected') {
      const errorMsg = result.payload || "Failed to update customer";
      toast.error(errorMsg);

      if (errorMsg.toLowerCase().includes('phone')) {
        setDuplicateField('phone');
      } else if (errorMsg.toLowerCase().includes('email')) {
        setDuplicateField('email');
      }
    }
  };

  if (isLoading && !customer) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div dir="ltr" className="max-w-3xl mx-auto text-left">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate("/customers")}
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
            {isUrdu ? "Back to Customers / گاہکوں کی فہرست" : "Back to Customers"}
          </button>
          <h1 className="text-3xl font-bold text-main mb-2">
            {isUrdu ? "Edit Customer (گاہک کی معلومات تبدیل کریں)" : "Edit Customer"}
          </h1>
          <p className="text-secondary">
            {isUrdu ? "Update customer profile (گاہک کا پروفائل اپ ڈیٹ کریں)" : "Update customer information"}
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-card rounded-xl shadow-sm p-8 border border-default">
          <form onSubmit={onSubmit} className="space-y-6">
            {/* Name Input */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-secondary"
                >
                  Customer Name <span className="text-red-500">*</span>
                </label>
                {isUrdu && <span className="text-xs text-secondary font-urdu">گاہک کا نام</span>}
              </div>
              <input
                type="text"
                id="name"
                name="name"
                value={name}
                onChange={onChange}
                required
                className="w-full px-4 py-3 border border-default rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-main"
                placeholder={isUrdu ? "e.g. John Doe / نام درج کریں" : "John Doe"}
              />
            </div>

            {/* Phone Input */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label
                  htmlFor="phone"
                  className="block text-sm font-medium text-secondary"
                >
                  Phone Number <span className="text-red-500">*</span>
                </label>
                {isUrdu && <span className="text-xs text-secondary font-urdu">فون نمبر</span>}
              </div>
              <input
                type="tel"
                id="phone"
                name="phone"
                pattern="[0-9]{10,11}"
                minLength={10}
                maxLength={11}
                value={phone}
                onChange={(e) => {
                  onChange(e);
                  if (duplicateField === 'phone') setDuplicateField(null);
                }}
                required
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-main ${duplicateField === 'phone' ? 'border-red-500 border-2' : 'border-default'
                  }`}
                placeholder="0325-4567318"
              />
              {duplicateField === 'phone' && (
                <p className="mt-1 text-sm text-red-600">
                  {isUrdu ? "This phone number already exists / یہ فون نمبر پہلے سے موجود ہے" : "This phone number already exists"}
                </p>
              )}
            </div>

            {/* Email Input */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-secondary"
                >
                  Email Address
                </label>
                {isUrdu && <span className="text-xs text-secondary font-urdu">ای میل ایڈریس</span>}
              </div>
              <input
                type="email"
                id="email"
                name="email"
                value={email}
                onChange={(e) => {
                  onChange(e);
                  if (duplicateField === 'email') setDuplicateField(null);
                }}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-main ${duplicateField === 'email' ? 'border-red-500 border-2' : 'border-default'
                  }`}
                placeholder="customer@example.com"
              />
              {duplicateField === 'email' && (
                <p className="mt-1 text-sm text-red-600">
                  {isUrdu ? "This email already exists / یہ ای میل پہلے سے موجود ہے" : "This email already exists"}
                </p>
              )}
            </div>

            {/* Address Input */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label
                  htmlFor="address"
                  className="block text-sm font-medium text-secondary"
                >
                  Address
                </label>
                {isUrdu && <span className="text-xs text-secondary font-urdu">پتہ</span>}
              </div>
              <textarea
                id="address"
                name="address"
                value={address}
                onChange={onChange}
                rows={3}
                className="w-full px-4 py-3 border border-default rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-main"
                placeholder={isUrdu ? "Street address, City / گلی، پتہ، شہر" : "Street address, City, State, PIN"}
              />
            </div>

            {/* Form Actions */}
            <div className="flex space-x-4 pt-4 border-t border-default">
              <button
                type="button"
                onClick={() => navigate("/customers")}
                className="flex-1 px-6 py-3 border border-default text-secondary rounded-lg hover:bg-surface font-medium transition cursor-pointer"
              >
                {isUrdu ? "Cancel / منسوخ کریں" : "Cancel"}
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
                    {isUrdu ? "Updating Customer... / تبدیل کیا جا رہا ہے..." : "Updating Customer..."}
                  </span>
                ) : (
                  isUrdu ? "Update Customer / تبدیلی محفوظ کریں" : "Update Customer"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default EditCustomer;
