import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { updateProfile, reset } from '../redux/slices/authSlice';
import Layout from '../components/Layout';
import PageHeader from '../components/PageHeader';
import Button from '../components/Button';
import Card from '../components/Card';
import FormInput from '../components/FormInput';
import { toast } from 'react-toastify';

const ProfileSettings = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, isLoading, isSuccess, isError, message } = useSelector(
    (state) => state.auth
  );

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    shopName: '',
    gstNumber: '',
    shopAddress: '',
  });

  const [errors, setErrors] = useState({});

  const { name, email, phone, shopName, gstNumber, shopAddress } = formData;

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        shopName: user.shopName || '',
        gstNumber: user.gstNumber || '',
        shopAddress: user.shopAddress || '',
      });
    }
  }, [user]);

  useEffect(() => {
    if (isSuccess) {
      toast.success('Profile updated successfully!');
      dispatch(reset());
    }
  }, [isSuccess, dispatch]);

  useEffect(() => {
    if (isError && message) {
      toast.error(message);
      dispatch(reset());
    }
  }, [isError, message, dispatch]);

  const validateForm = () => {
    const newErrors = {};

    if (!name || name.trim().length === 0) {
      newErrors.name = 'Name is required';
    } else if (name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    if (!email || email.trim().length === 0) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Invalid email format';
    }

    if (phone && phone.length < 10) {
      newErrors.phone = 'Phone number must be at least 10 digits';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const onChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        [name]: '',
      }));
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    await dispatch(updateProfile(formData));
  };

  if (!user) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-violet-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        <PageHeader
          title="Profile & Business Settings"
          description="Manage your account profile, store information, and billing contact details."
          actions={
            <Button variant="secondary" size="sm" onClick={() => navigate('/dashboard')}>
              Back to Dashboard
            </Button>
          }
        />

        <form onSubmit={onSubmit} className="space-y-6">
          {/* User Account Settings */}
          <Card title="Personal Information" subtitle="Your personal credentials and contact info.">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormInput
                label="Full Name"
                name="name"
                value={name}
                onChange={onChange}
                error={errors.name}
                required
              />

              <FormInput
                label="Email Address"
                name="email"
                type="email"
                value={email}
                onChange={onChange}
                error={errors.email}
                required
              />

              <FormInput
                label="Phone Number"
                name="phone"
                value={phone}
                onChange={onChange}
                error={errors.phone}
                placeholder="+92 300 1234567"
              />
            </div>
          </Card>

          {/* Business Details */}
          <Card title="Business Details" subtitle="Store profile used on invoices and customer receipts.">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormInput
                label="Business / Shop Name"
                name="shopName"
                value={shopName}
                onChange={onChange}
                placeholder="My Retail Shop"
              />

              <FormInput
                label="NTN / GST Number"
                name="gstNumber"
                value={gstNumber}
                onChange={onChange}
                placeholder="Optional Tax Registration No."
              />

              <div className="md:col-span-2 space-y-1.5">
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Store Address
                </label>
                <textarea
                  name="shopAddress"
                  rows={3}
                  value={shopAddress}
                  onChange={onChange}
                  placeholder="Enter full physical address..."
                  className="w-full px-3.5 py-2 text-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-xl focus:ring-2 focus:ring-violet-500 focus:outline-hidden"
                ></textarea>
              </div>
            </div>
          </Card>

          {/* Save Action */}
          <div className="flex justify-end gap-3">
            <Button variant="secondary" type="button" onClick={() => navigate('/dashboard')}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" isLoading={isLoading}>
              Save Profile Changes
            </Button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default ProfileSettings;
