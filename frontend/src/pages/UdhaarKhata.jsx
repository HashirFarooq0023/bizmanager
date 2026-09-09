import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../contexts/LanguageContext';
import { getAllCustomers } from '../redux/slices/customerSlice';
import { getAllSuppliers } from '../redux/slices/supplierSlice';
import Layout from '../components/Layout';
import {
  FiUsers,
  FiTruck,
  FiSearch,
  FiMessageCircle,
  FiDollarSign,
  FiArrowUpRight,
  FiArrowDownLeft,
  FiCheckCircle,
  FiPhone,
  FiMapPin,
  FiAlertCircle,
  FiExternalLink
} from 'react-icons/fi';

const UdhaarKhata = () => {
  const { t } = useTranslation(['udhaar', 'common']);
  const { isRtl } = useLanguage();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const user = useSelector((state) => state.auth?.user);
  const shopName = user?.shopName || user?.businessName || 'ہماری دکان';

  const { customers, isLoading: customersLoading } = useSelector((state) => state.customers);
  const { suppliers, isLoading: suppliersLoading } = useSelector((state) => state.suppliers);

  const [activeTab, setActiveTab] = useState('customers'); // 'customers' | 'suppliers'
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => {
    dispatch(getAllCustomers());
    dispatch(getAllSuppliers());
  }, [dispatch]);

  // Customers with positive dues
  const customersWithDues = (customers || []).filter((c) => (c.dues || 0) > 0);
  const totalCustomerDues = customersWithDues.reduce((sum, c) => sum + (c.dues || 0), 0);

  // Suppliers with positive dues or balance
  const suppliersWithDues = (suppliers || []).filter((s) => {
    const due = s.balanceDue || s.outstandingBalance || s.dues || s.balance || 0;
    return due > 0;
  });
  const totalSupplierDues = suppliersWithDues.reduce((sum, s) => {
    const due = s.balanceDue || s.outstandingBalance || s.dues || s.balance || 0;
    return sum + due;
  }, 0);

  // Filtered lists
  const filteredCustomers = customersWithDues.filter((c) => {
    const query = searchTerm.toLowerCase();
    return (
      (c.name && c.name.toLowerCase().includes(query)) ||
      (c.phone && c.phone.includes(query)) ||
      (c.email && c.email.toLowerCase().includes(query))
    );
  });

  const filteredSuppliers = suppliersWithDues.filter((s) => {
    const query = searchTerm.toLowerCase();
    const name = s.businessName || s.name || '';
    const person = s.contactPerson || '';
    const phone = s.phone || s.contactNumber || '';
    return (
      name.toLowerCase().includes(query) ||
      person.toLowerCase().includes(query) ||
      phone.includes(query)
    );
  });

  // Helper to format clean Pakistani WhatsApp phone number
  const formatWhatsAppNumber = (phone) => {
    if (!phone) return '';
    let clean = phone.replace(/\D/g, '');
    if (clean.startsWith('03')) {
      clean = '92' + clean.substring(1);
    } else if (clean.startsWith('3') && clean.length === 10) {
      clean = '92' + clean;
    }
    return clean;
  };

  // Generate WhatsApp reminder link
  const getWhatsAppLink = (person, amount, isCustomer = true) => {
    const cleanPhone = formatWhatsAppNumber(person.phone || person.contactNumber);
    if (!cleanPhone) return null;

    const personName = person.name || person.businessName || 'صاحب';
    
    let message = '';
    if (isRtl) {
      message = `السلام علیکم ${personName} صاحب،\nامید ہے آپ خیریت سے ہوں گے۔ ${shopName} کی طرف آپ کے کھاتے میں Rs. ${Number(amount).toLocaleString()} کا بقایا واجب الادا ہے۔ برائے مہربانی تشریف لا کر یا آن لائن ادائیگی فرما دیں۔ جزاک اللہ!`;
    } else {
      message = `Respected ${personName},\nThis is a friendly reminder that you have a pending balance of Rs. ${Number(amount).toLocaleString()} at ${shopName}.\nPlease arrange payment at your earliest convenience. Thank you!`;
    }

    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
  };

  return (
    <Layout>
      <div className="space-y-6 pb-12">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <span>📒</span>
              <span>{t('udhaar:title')}</span>
            </h1>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1">
              {t('udhaar:subtitle')}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/pos')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-violet-700 hover:bg-violet-800 text-white font-semibold text-sm transition-all shadow-md active:scale-95"
            >
              <FiDollarSign className="w-4 h-4" />
              <span>{t('nav:makeBill')}</span>
            </button>
          </div>
        </div>

        {/* 2 Primary Hero Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {/* Customer Dues (Receivables) */}
          <div
            onClick={() => setActiveTab('customers')}
            className={`cursor-pointer p-5 sm:p-6 rounded-3xl border-2 transition-all shadow-sm ${
              activeTab === 'customers'
                ? 'border-rose-500 bg-rose-50/70 dark:bg-rose-950/20 shadow-md ring-2 ring-rose-500/20'
                : 'border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0C0F16] hover:border-rose-300'
            }`}
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300 mb-2">
                  <FiArrowDownLeft className="w-3.5 h-3.5" />
                  {t('udhaar:customerDues')}
                </span>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                  {t('udhaar:customerDuesSubtitle')}
                </p>
                <div className="text-3xl sm:text-4xl font-extrabold text-rose-600 dark:text-rose-400 mt-2 tracking-tight">
                  Rs. {Number(totalCustomerDues).toLocaleString()}
                </div>
                <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 mt-2 flex items-center gap-1">
                  <span>{customersWithDues.length}</span>
                  <span>{t('udhaar:totalCustomersWithDues')}</span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 flex items-center justify-center text-2xl">
                <FiUsers />
              </div>
            </div>
          </div>

          {/* Supplier Dues (Payables) */}
          <div
            onClick={() => setActiveTab('suppliers')}
            className={`cursor-pointer p-5 sm:p-6 rounded-3xl border-2 transition-all shadow-sm ${
              activeTab === 'suppliers'
                ? 'border-indigo-500 bg-indigo-50/70 dark:bg-indigo-950/20 shadow-md ring-2 ring-indigo-500/20'
                : 'border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0C0F16] hover:border-indigo-300'
            }`}
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 mb-2">
                  <FiArrowUpRight className="w-3.5 h-3.5" />
                  {t('udhaar:supplierDues')}
                </span>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                  {t('udhaar:supplierDuesSubtitle')}
                </p>
                <div className="text-3xl sm:text-4xl font-extrabold text-indigo-600 dark:text-indigo-400 mt-2 tracking-tight">
                  Rs. {Number(totalSupplierDues).toLocaleString()}
                </div>
                <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 mt-2 flex items-center gap-1">
                  <span>{suppliersWithDues.length}</span>
                  <span>{t('udhaar:totalSuppliersWithDues')}</span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-2xl">
                <FiTruck />
              </div>
            </div>
          </div>
        </div>

        {/* Tab Switcher & Search Bar */}
        <div className="bg-white dark:bg-[#0C0F16] border border-gray-200 dark:border-gray-800 rounded-2xl p-4 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* Tabs */}
            <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-900 p-1.5 rounded-xl self-start">
              <button
                type="button"
                onClick={() => setActiveTab('customers')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                  activeTab === 'customers'
                    ? 'bg-white dark:bg-[#0C0F16] text-rose-600 dark:text-rose-400 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
                }`}
              >
                <FiUsers className="w-4 h-4" />
                <span>{t('udhaar:customersTab')}</span>
                <span className="px-2 py-0.5 rounded-full text-xs bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300">
                  {customersWithDues.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('suppliers')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                  activeTab === 'suppliers'
                    ? 'bg-white dark:bg-[#0C0F16] text-indigo-600 dark:text-indigo-400 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
                }`}
              >
                <FiTruck className="w-4 h-4" />
                <span>{t('udhaar:suppliersTab')}</span>
                <span className="px-2 py-0.5 rounded-full text-xs bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300">
                  {suppliersWithDues.length}
                </span>
              </button>
            </div>

            {/* Search */}
            <div className="relative w-full sm:w-80">
              <div className="absolute inset-y-0 start-3 flex items-center pointer-events-none text-gray-400">
                <FiSearch className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={t('udhaar:searchPlaceholder')}
                className="w-full ps-9 pe-4 py-2 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>
          </div>
        </div>

        {/* CUSTOMERS LIST TAB */}
        {activeTab === 'customers' && (
          <div>
            {customersLoading ? (
              <div className="p-12 text-center text-gray-500 font-urdu">{t('common:loading')}</div>
            ) : filteredCustomers.length === 0 ? (
              <div className="bg-white dark:bg-[#0C0F16] border border-gray-200 dark:border-gray-800 rounded-3xl p-12 text-center">
                <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 mx-auto flex items-center justify-center text-3xl mb-4">
                  <FiCheckCircle />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  {t('udhaar:noDuesTitle')}
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mt-2 max-w-md mx-auto">
                  {t('udhaar:noCustomerDues')}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredCustomers.map((customer) => {
                  const waLink = getWhatsAppLink(customer, customer.dues, true);
                  return (
                    <div
                      key={customer._id}
                      className="bg-white dark:bg-[#0C0F16] border border-gray-200 dark:border-gray-800 hover:border-rose-400/60 rounded-2xl p-5 shadow-sm transition-all flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 font-bold text-lg flex items-center justify-center shrink-0">
                              {(customer.name || 'G')[0].toUpperCase()}
                            </div>
                            <div>
                              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                                {customer.name}
                              </h3>
                              <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                {customer.phone && (
                                  <span className="flex items-center gap-1">
                                    <FiPhone className="w-3 h-3" />
                                    <span dir="ltr">{customer.phone}</span>
                                  </span>
                                )}
                                {customer.address && (
                                  <span className="flex items-center gap-1 truncate max-w-[140px]">
                                    <FiMapPin className="w-3 h-3" />
                                    <span>{customer.address}</span>
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Dues Badge */}
                          <div className="text-end">
                            <span className="text-xs text-gray-500 dark:text-gray-400 block">
                              {t('common:balance')}
                            </span>
                            <span className="text-xl font-extrabold text-rose-600 dark:text-rose-400 tracking-tight">
                              Rs. {Number(customer.dues || 0).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="mt-5 pt-4 border-t border-gray-100 dark:border-gray-800/60 grid grid-cols-3 gap-2">
                        {/* WhatsApp Reminder Button */}
                        {waLink ? (
                          <a
                            href={waLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-sm transition-all"
                            title="Send WhatsApp Reminder"
                          >
                            <FiMessageCircle className="w-4 h-4" />
                            <span>واٹس ایپ</span>
                          </a>
                        ) : (
                          <button
                            disabled
                            className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-400 text-xs font-semibold cursor-not-allowed"
                          >
                            <FiMessageCircle className="w-4 h-4" />
                            <span>واٹس ایپ</span>
                          </button>
                        )}

                        {/* Record Payment Button */}
                        <button
                          type="button"
                          onClick={() => navigate(`/customers/adjust-due/${customer._id}`)}
                          className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-sm transition-all"
                        >
                          <FiDollarSign className="w-4 h-4" />
                          <span>{t('udhaar:collectPayment')}</span>
                        </button>

                        {/* View Ledger */}
                        <button
                          type="button"
                          onClick={() => navigate(`/customers/${customer._id}`)}
                          className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold text-xs transition-all"
                        >
                          <FiExternalLink className="w-3.5 h-3.5" />
                          <span>{t('udhaar:viewLedger')}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* SUPPLIERS LIST TAB */}
        {activeTab === 'suppliers' && (
          <div>
            {suppliersLoading ? (
              <div className="p-12 text-center text-gray-500 font-urdu">{t('common:loading')}</div>
            ) : filteredSuppliers.length === 0 ? (
              <div className="bg-white dark:bg-[#0C0F16] border border-gray-200 dark:border-gray-800 rounded-3xl p-12 text-center">
                <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 mx-auto flex items-center justify-center text-3xl mb-4">
                  <FiCheckCircle />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  {t('udhaar:noDuesTitle')}
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mt-2 max-w-md mx-auto">
                  {t('udhaar:noSupplierDues')}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredSuppliers.map((supplier) => {
                  const due = supplier.balanceDue || supplier.outstandingBalance || supplier.dues || supplier.balance || 0;
                  const waLink = getWhatsAppLink(supplier, due, false);
                  const supplierName = supplier.businessName || supplier.name || 'سپلائر';

                  return (
                    <div
                      key={supplier._id}
                      className="bg-white dark:bg-[#0C0F16] border border-gray-200 dark:border-gray-800 hover:border-indigo-400/60 rounded-2xl p-5 shadow-sm transition-all flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 font-bold text-lg flex items-center justify-center shrink-0">
                              {(supplierName || 'S')[0].toUpperCase()}
                            </div>
                            <div>
                              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                                {supplierName}
                              </h3>
                              <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                {supplier.contactPerson && (
                                  <span>{supplier.contactPerson}</span>
                                )}
                                {(supplier.phone || supplier.contactNumber) && (
                                  <span className="flex items-center gap-1">
                                    <FiPhone className="w-3 h-3" />
                                    <span dir="ltr">{supplier.phone || supplier.contactNumber}</span>
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Owed Amount Badge */}
                          <div className="text-end">
                            <span className="text-xs text-gray-500 dark:text-gray-400 block">
                              {t('common:balance')}
                            </span>
                            <span className="text-xl font-extrabold text-indigo-600 dark:text-indigo-400 tracking-tight">
                              Rs. {Number(due).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="mt-5 pt-4 border-t border-gray-100 dark:border-gray-800/60 grid grid-cols-3 gap-2">
                        {/* WhatsApp Button */}
                        {waLink ? (
                          <a
                            href={waLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-sm transition-all"
                            title="Contact via WhatsApp"
                          >
                            <FiMessageCircle className="w-4 h-4" />
                            <span>واٹس ایپ</span>
                          </a>
                        ) : (
                          <button
                            disabled
                            className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-400 text-xs font-semibold cursor-not-allowed"
                          >
                            <FiMessageCircle className="w-4 h-4" />
                            <span>واٹس ایپ</span>
                          </button>
                        )}

                        {/* Pay Supplier Button */}
                        <button
                          type="button"
                          onClick={() => navigate('/purchase/payment-out')}
                          className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm transition-all"
                        >
                          <FiDollarSign className="w-4 h-4" />
                          <span>{t('udhaar:paySupplier')}</span>
                        </button>

                        {/* View Supplier */}
                        <button
                          type="button"
                          onClick={() => navigate(`/suppliers/${supplier._id}`)}
                          className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold text-xs transition-all"
                        >
                          <FiExternalLink className="w-3.5 h-3.5" />
                          <span>{t('udhaar:viewLedger')}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default UdhaarKhata;
