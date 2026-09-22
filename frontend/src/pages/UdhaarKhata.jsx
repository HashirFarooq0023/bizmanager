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
  FiExternalLink,
  FiBookOpen
} from 'react-icons/fi';

const UdhaarKhata = () => {
  const { t } = useTranslation(['udhaar', 'common', 'nav']);
  const { isRtl } = useLanguage();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const user = useSelector((state) => state.auth?.user);
  const shopName = user?.shopName || user?.businessName || 'ہماری دکان';

  const { customers, isLoading: customersLoading } = useSelector((state) => state.customers || {});
  const { suppliers, isLoading: suppliersLoading } = useSelector((state) => state.suppliers || {});

  const [activeTab, setActiveTab] = useState('customers'); // 'customers' | 'suppliers'
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    dispatch(getAllCustomers());
    dispatch(getAllSuppliers());
  }, [dispatch]);

  // Safe arrays
  const customersList = Array.isArray(customers) ? customers : [];
  const suppliersList = Array.isArray(suppliers) ? suppliers : [];

  // Helper to get supplier due
  const getSupplierDue = (s) => {
    if (!s) return 0;
    const due = s.outstandingBalance ?? s.balanceDue ?? s.dues ?? s.openingBalance ?? s.balance ?? 0;
    return Number(due) || 0;
  };

  // Customers with positive dues
  const customersWithDues = customersList.filter((c) => c && Number(c.dues || 0) > 0);
  const totalCustomerDues = customersWithDues.reduce((sum, c) => sum + Number(c?.dues || 0), 0);

  // Suppliers with positive dues or balance
  const suppliersWithDues = suppliersList.filter((s) => s && getSupplierDue(s) > 0);
  const totalSupplierDues = suppliersWithDues.reduce((sum, s) => sum + getSupplierDue(s), 0);

  // Filtered lists
  const filteredCustomers = customersWithDues.filter((c) => {
    if (!c) return false;
    const query = (searchTerm || '').trim().toLowerCase();
    if (!query) return true;
    const name = String(c.name || '').toLowerCase();
    const phone = String(c.phone || '');
    const email = String(c.email || '').toLowerCase();
    return name.includes(query) || phone.includes(query) || email.includes(query);
  });

  const filteredSuppliers = suppliersWithDues.filter((s) => {
    if (!s) return false;
    const query = (searchTerm || '').trim().toLowerCase();
    if (!query) return true;
    const name = String(s.businessName || s.name || '').toLowerCase();
    const person = String(s.contactPersonName || s.contactPerson || '').toLowerCase();
    const phone = String(s.contactNo || s.phone || s.contactNumber || '');
    return name.includes(query) || person.includes(query) || phone.includes(query);
  });

  // Helper to format clean Pakistani WhatsApp phone number
  const formatWhatsAppNumber = (phone) => {
    if (!phone) return '';
    let clean = String(phone).replace(/\D/g, '');
    if (clean.startsWith('03')) {
      clean = '92' + clean.substring(1);
    } else if (clean.startsWith('3') && clean.length === 10) {
      clean = '92' + clean;
    }
    return clean;
  };

  // Generate WhatsApp reminder link
  const getWhatsAppLink = (person, amount, isCustomer = true) => {
    if (!person) return null;
    const rawPhone = isCustomer ? person.phone : (person.contactNo || person.phone || person.contactNumber);
    const cleanPhone = formatWhatsAppNumber(rawPhone);
    if (!cleanPhone) return null;

    const personName = isCustomer
      ? (person.name || 'صاحب')
      : (person.businessName || person.name || 'سپلائر');

    let message = '';
    if (isRtl) {
      message = `السلام علیکم ${personName} صاحب،\nامید ہے آپ خیریت سے ہوں گے۔ ${shopName} کی طرف آپ کے کھاتے میں Rs. ${Number(amount || 0).toLocaleString()} کا بقایا واجب الادا ہے۔ برائے مہربانی تشریف لا کر یا آن لائن ادائیگی فرما دیں۔ جزاک اللہ!`;
    } else {
      message = `Respected ${personName},\nThis is a friendly reminder that you have a pending balance of Rs. ${Number(amount || 0).toLocaleString()} at ${shopName}.\nPlease arrange payment at your earliest convenience. Thank you!`;
    }

    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
  };

  return (
    <Layout>
      <div className="space-y-6 pb-12">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-2.5">
              <FiBookOpen className="w-6 h-6 text-violet-600 dark:text-violet-400 shrink-0" />
              <span>{t('udhaar:title')}</span>
            </h1>
            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
              {t('udhaar:subtitle')}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/pos')}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white font-semibold text-xs sm:text-sm transition-colors shadow-xs active:scale-[0.98]"
            >
              <FiDollarSign className="w-4 h-4" />
              <span>{t('nav:makeBill')}</span>
            </button>
          </div>
        </div>

        {/* 2 Primary Hero Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Customer Dues (Receivables) */}
          <div
            onClick={() => setActiveTab('customers')}
            className={`cursor-pointer p-4 sm:p-5 rounded-xl border transition-all shadow-xs ${
              activeTab === 'customers'
                ? 'border-rose-500/80 bg-rose-50/50 dark:bg-rose-950/30 shadow-xs ring-1 ring-rose-500/30'
                : 'border-slate-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-900 hover:border-slate-300 dark:hover:border-zinc-700'
            }`}
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100/80 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 mb-2 border border-rose-200/60 dark:border-rose-900/40">
                  <FiArrowDownLeft className="w-3.5 h-3.5" />
                  {t('udhaar:customerDues')}
                </span>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  {t('udhaar:customerDuesSubtitle')}
                </p>
                <div className="text-2xl sm:text-3xl font-bold tabular-nums font-mono text-zinc-900 dark:text-zinc-100 mt-2 tracking-tight">
                  Rs. {Number(totalCustomerDues || 0).toLocaleString()}
                </div>
                <div className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mt-2 flex items-center gap-1">
                  <span className="font-semibold text-zinc-700 dark:text-zinc-300">{customersWithDues.length}</span>
                  <span>{t('udhaar:totalCustomersWithDues')}</span>
                </div>
              </div>
              <div className="w-10 h-10 rounded-lg bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex items-center justify-center text-lg border border-rose-200/60 dark:border-rose-900/40">
                <FiUsers />
              </div>
            </div>
          </div>

          {/* Supplier Dues (Payables) */}
          <div
            onClick={() => setActiveTab('suppliers')}
            className={`cursor-pointer p-4 sm:p-5 rounded-xl border transition-all shadow-xs ${
              activeTab === 'suppliers'
                ? 'border-indigo-500/80 bg-indigo-50/50 dark:bg-indigo-950/30 shadow-xs ring-1 ring-indigo-500/30'
                : 'border-slate-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-900 hover:border-slate-300 dark:hover:border-zinc-700'
            }`}
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-100/80 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 mb-2 border border-indigo-200/60 dark:border-indigo-900/40">
                  <FiArrowUpRight className="w-3.5 h-3.5" />
                  {t('udhaar:supplierDues')}
                </span>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  {t('udhaar:supplierDuesSubtitle')}
                </p>
                <div className="text-2xl sm:text-3xl font-bold tabular-nums font-mono text-zinc-900 dark:text-zinc-100 mt-2 tracking-tight">
                  Rs. {Number(totalSupplierDues || 0).toLocaleString()}
                </div>
                <div className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mt-2 flex items-center gap-1">
                  <span className="font-semibold text-zinc-700 dark:text-zinc-300">{suppliersWithDues.length}</span>
                  <span>{t('udhaar:totalSuppliersWithDues')}</span>
                </div>
              </div>
              <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-lg border border-indigo-200/60 dark:border-indigo-900/40">
                <FiTruck />
              </div>
            </div>
          </div>
        </div>

        {/* Tab Switcher & Search Bar */}
        <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800/80 rounded-xl p-3 sm:p-4 shadow-xs space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* Tabs */}
            <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-zinc-800/80 p-1 rounded-lg self-start">
              <button
                type="button"
                onClick={() => setActiveTab('customers')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs sm:text-sm font-semibold transition-all ${
                  activeTab === 'customers'
                    ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-xs'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                }`}
              >
                <FiUsers className="w-3.5 h-3.5" />
                <span>{t('udhaar:customersTab')}</span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300">
                  {customersWithDues.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('suppliers')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs sm:text-sm font-semibold transition-all ${
                  activeTab === 'suppliers'
                    ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-xs'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                }`}
              >
                <FiTruck className="w-3.5 h-3.5" />
                <span>{t('udhaar:suppliersTab')}</span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300">
                  {suppliersWithDues.length}
                </span>
              </button>
            </div>

            {/* Search */}
            <div className="relative w-full sm:w-80">
              <div className="absolute inset-y-0 start-3 flex items-center pointer-events-none text-zinc-400">
                <FiSearch className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={t('udhaar:searchPlaceholder')}
                className="w-full ps-9 pe-4 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500"
              />
            </div>
          </div>
        </div>

        {/* CUSTOMERS LIST TAB */}
        {activeTab === 'customers' && (
          <div>
            {customersLoading ? (
              <div className="p-12 text-center text-zinc-500 font-urdu">{t('common:loading')}</div>
            ) : filteredCustomers.length === 0 ? (
              <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800/80 rounded-xl p-10 text-center shadow-xs">
                <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center text-2xl mb-3 border border-emerald-200/60 dark:border-emerald-800/40">
                  <FiCheckCircle />
                </div>
                <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                  {t('udhaar:noDuesTitle')}
                </h3>
                <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1.5 max-w-md mx-auto">
                  {t('udhaar:noCustomerDues')}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredCustomers.map((customer, idx) => {
                  const duesAmount = Number(customer?.dues || 0);
                  const waLink = getWhatsAppLink(customer, duesAmount, true);
                  const customerName = String(customer?.name || 'Customer').trim();
                  const initial = (customerName || 'C')[0]?.toUpperCase() || 'C';

                  return (
                    <div
                      key={customer?._id || `cust-${idx}`}
                      className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800/80 hover:border-slate-300 dark:hover:border-zinc-700 rounded-xl p-4 sm:p-5 shadow-xs transition-all flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-bold text-base flex items-center justify-center shrink-0 border border-slate-200/60 dark:border-zinc-700">
                              {initial}
                            </div>
                            <div>
                              <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                                {customerName}
                              </h3>
                              <div className="flex items-center gap-3 text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                                {customer?.phone && (
                                  <span className="flex items-center gap-1">
                                    <FiPhone className="w-3 h-3" />
                                    <span dir="ltr">{customer.phone}</span>
                                  </span>
                                )}
                                {customer?.address && (
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
                            <span className="text-[11px] text-zinc-500 dark:text-zinc-400 block font-medium">
                              {t('common:balance')}
                            </span>
                            <span className="text-lg sm:text-xl font-bold tabular-nums font-mono text-rose-600 dark:text-rose-400 tracking-tight">
                              Rs. {duesAmount.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="mt-4 pt-3.5 border-t border-slate-100 dark:border-zinc-800/80 grid grid-cols-3 gap-2">
                        {/* WhatsApp Reminder Button */}
                        {waLink ? (
                          <a
                            href={waLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:hover:bg-emerald-900/60 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60 font-semibold text-xs shadow-xs transition-colors"
                            title="Send WhatsApp Reminder"
                          >
                            <FiMessageCircle className="w-3.5 h-3.5" />
                            <span>واٹس ایپ</span>
                          </a>
                        ) : (
                          <button
                            disabled
                            className="inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-zinc-800 text-zinc-400 text-xs font-semibold cursor-not-allowed"
                          >
                            <FiMessageCircle className="w-3.5 h-3.5" />
                            <span>واٹس ایپ</span>
                          </button>
                        )}

                        {/* Record Payment Button */}
                        <button
                          type="button"
                          onClick={() => navigate(`/customers/adjust-due/${customer._id}`)}
                          className="inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:hover:bg-rose-900/60 dark:text-rose-300 border border-rose-200/80 dark:border-rose-800/60 font-semibold text-xs shadow-xs transition-colors"
                        >
                          <FiDollarSign className="w-3.5 h-3.5" />
                          <span>{t('udhaar:collectPayment')}</span>
                        </button>

                        {/* View Ledger */}
                        <button
                          type="button"
                          onClick={() => navigate(`/customers/${customer._id}`)}
                          className="inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-zinc-700 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:text-zinc-200 border border-slate-200 dark:border-zinc-700 font-semibold text-xs transition-colors"
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
              <div className="p-12 text-center text-zinc-500 font-urdu">{t('common:loading')}</div>
            ) : filteredSuppliers.length === 0 ? (
              <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800/80 rounded-xl p-10 text-center shadow-xs">
                <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center text-2xl mb-3 border border-emerald-200/60 dark:border-emerald-800/40">
                  <FiCheckCircle />
                </div>
                <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                  {t('udhaar:noDuesTitle')}
                </h3>
                <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1.5 max-w-md mx-auto">
                  {t('udhaar:noSupplierDues')}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredSuppliers.map((supplier, idx) => {
                  const due = getSupplierDue(supplier);
                  const waLink = getWhatsAppLink(supplier, due, false);
                  const supplierName = String(supplier?.businessName || supplier?.name || 'سپلائر').trim();
                  const initial = (supplierName || 'S')[0]?.toUpperCase() || 'S';
                  const contactNo = supplier?.contactNo || supplier?.phone || supplier?.contactNumber || '';
                  const contactPerson = supplier?.contactPersonName || supplier?.contactPerson || '';

                  return (
                    <div
                      key={supplier?._id || `supp-${idx}`}
                      className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800/80 hover:border-slate-300 dark:hover:border-zinc-700 rounded-xl p-4 sm:p-5 shadow-xs transition-all flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-bold text-base flex items-center justify-center shrink-0 border border-slate-200/60 dark:border-zinc-700">
                              {initial}
                            </div>
                            <div>
                              <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                                {supplierName}
                              </h3>
                              <div className="flex items-center gap-3 text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                                {contactPerson && (
                                  <span>{contactPerson}</span>
                                )}
                                {contactNo && (
                                  <span className="flex items-center gap-1">
                                    <FiPhone className="w-3 h-3" />
                                    <span dir="ltr">{contactNo}</span>
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Owed Amount Badge */}
                          <div className="text-end">
                            <span className="text-[11px] text-zinc-500 dark:text-zinc-400 block font-medium">
                              {t('common:balance')}
                            </span>
                            <span className="text-lg sm:text-xl font-bold tabular-nums font-mono text-indigo-600 dark:text-indigo-400 tracking-tight">
                              Rs. {Number(due).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="mt-4 pt-3.5 border-t border-slate-100 dark:border-zinc-800/80 grid grid-cols-3 gap-2">
                        {/* WhatsApp Button */}
                        {waLink ? (
                          <a
                            href={waLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:hover:bg-emerald-900/60 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60 font-semibold text-xs shadow-xs transition-colors"
                            title="Contact via WhatsApp"
                          >
                            <FiMessageCircle className="w-3.5 h-3.5" />
                            <span>واٹس ایپ</span>
                          </a>
                        ) : (
                          <button
                            disabled
                            className="inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-zinc-800 text-zinc-400 text-xs font-semibold cursor-not-allowed"
                          >
                            <FiMessageCircle className="w-3.5 h-3.5" />
                            <span>واٹس ایپ</span>
                          </button>
                        )}

                        {/* Pay Supplier Button */}
                        <button
                          type="button"
                          onClick={() => navigate('/purchase/payment-out')}
                          className="inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 dark:bg-indigo-950/50 dark:hover:bg-indigo-900/60 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800/60 font-semibold text-xs shadow-xs transition-colors"
                        >
                          <FiDollarSign className="w-3.5 h-3.5" />
                          <span>{t('udhaar:paySupplier')}</span>
                        </button>

                        {/* View Supplier */}
                        <button
                          type="button"
                          onClick={() => navigate(`/suppliers/${supplier._id}`)}
                          className="inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-zinc-700 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:text-zinc-200 border border-slate-200 dark:border-zinc-700 font-semibold text-xs transition-colors"
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
