import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { useLanguage } from '../contexts/LanguageContext';
import { getAllItems } from '../redux/slices/inventorySlice';
import { getAllCustomers } from '../redux/slices/customerSlice';
import { getAccounts } from '../redux/slices/cashbankSlice';
import api from '../services/api';
import {
  FiRotateCcw,
  FiSearch,
  FiX,
  FiCheck,
  FiAlertCircle,
  FiArrowLeft,
  FiPackage,
  FiDollarSign,
  FiUser,
  FiCalendar,
  FiPlus,
  FiMinus
} from 'react-icons/fi';
import DenominationBreakdown from './DenominationBreakdown';

const POSReturnModal = ({ isOpen, onClose }) => {
  const { isUrdu } = useLanguage();
  const dispatch = useDispatch();
  const { accounts = [] } = useSelector((state) => state.cashbank);

  const [invoices, setInvoices] = useState([]);
  const [loadingInvoices, setLoadingInvoices] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Selected invoice & return process state
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [loadingInvoiceDetail, setLoadingInvoiceDetail] = useState(false);
  const [returnItems, setReturnItems] = useState([]);
  const [refundMethod, setRefundMethod] = useState('cash'); // 'cash' | 'credit' | 'bank_transfer' | 'original_payment'
  const [selectedBankAccount, setSelectedBankAccount] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch invoices on modal open
  useEffect(() => {
    if (isOpen) {
      fetchInvoices();
      resetState();
    }
  }, [isOpen]);

  const resetState = () => {
    setSelectedInvoice(null);
    setReturnItems([]);
    setSearchTerm('');
    setRefundMethod('cash');
    setSelectedBankAccount('');
    setNotes('');
    setIsSubmitting(false);
  };

  const fetchInvoices = async () => {
    try {
      setLoadingInvoices(true);
      const res = await api.get('/api/pos/invoices');
      const list = Array.isArray(res.data) ? res.data : (res.data?.invoices || []);
      setInvoices(list);
    } catch (err) {
      console.error('Failed to load invoices:', err);
      toast.error(isUrdu ? 'بل لوڈ کرنے میں ناکامی ہوئی' : 'Failed to load invoices');
    } finally {
      setLoadingInvoices(false);
    }
  };

  const handleSelectInvoice = async (invoice) => {
    try {
      setLoadingInvoiceDetail(true);
      // Fetch complete invoice data
      const res = await api.get(`/api/pos/invoice/${invoice._id}`);
      const fullInvoice = res.data || {};

      if (!fullInvoice.items || fullInvoice.items.length === 0) {
        toast.error(isUrdu ? 'اس بل میں کوئی آئٹم نہیں ہے' : 'No items found in this invoice');
        return;
      }

      // Fetch existing returns for this invoice
      let existingReturns = [];
      try {
        const returnsRes = await api.get('/api/returns');
        const allReturns = Array.isArray(returnsRes.data) ? returnsRes.data : [];
        existingReturns = allReturns.filter(
          (ret) => ret.invoice?._id === invoice._id || ret.invoice === invoice._id
        );
      } catch (e) {
        console.error('Failed to load existing returns:', e);
      }

      // Calculate already returned quantities
      const returnedMap = {};
      existingReturns.forEach((ret) => {
        (ret.items || []).forEach((it) => {
          const pId = typeof it.product === 'object' ? it.product?._id : it.product;
          if (pId) {
            returnedMap[pId] = (returnedMap[pId] || 0) + (Number(it.returnedQty) || 0);
          }
        });
      });

      // Prepare return items
      const itemsList = fullInvoice.items
        .map((it) => {
          const itemObj = it.item || {};
          const itemId = typeof itemObj === 'object' ? itemObj._id : itemObj;
          const itemName = typeof itemObj === 'object' ? (itemObj.name || it.name) : (it.name || 'Item');
          const alreadyReturned = Number(returnedMap[itemId]) || 0;
          const remainingQty = Math.max(0, Number(it.quantity || 0) - alreadyReturned);

          return {
            productId: itemId,
            productName: itemName,
            originalQty: it.quantity,
            alreadyReturned,
            remainingQty,
            returnedQty: 0, // start with 0, user selects which to return
            rate: Number(it.price) || 0,
            condition: 'not_damaged', // 'not_damaged' (adds stock back) or 'damaged'
            reason: 'Customer Return',
          };
        })
        .filter((it) => it.remainingQty > 0);

      if (itemsList.length === 0) {
        toast.warning(isUrdu ? 'اس بل کے تمام آئٹمز پہلے ہی واپس ہو چکے ہیں' : 'All items from this invoice have already been returned.');
        return;
      }

      // Auto-set refund method to credit if original was credit and customer exists, else cash
      if (fullInvoice.customer && (fullInvoice.paymentMethod === 'credit' || fullInvoice.paidViaMethod === 'credit')) {
        setRefundMethod('credit');
      } else {
        setRefundMethod('cash');
      }

      setSelectedInvoice(fullInvoice);
      setReturnItems(itemsList);
    } catch (err) {
      console.error('Error loading invoice details:', err);
      toast.error(isUrdu ? 'بل کی تفصیل حاصل کرنے میں خرابی' : 'Failed to load invoice details');
    } finally {
      setLoadingInvoiceDetail(false);
    }
  };

  // Update item return qty
  const updateItemQty = (index, qty) => {
    setReturnItems((prev) => {
      const updated = [...prev];
      const item = updated[index];
      const validQty = Math.max(0, Math.min(Number(qty) || 0, item.remainingQty));
      updated[index] = { ...item, returnedQty: validQty };
      return updated;
    });
  };

  // Update item condition
  const updateItemCondition = (index, condition) => {
    setReturnItems((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], condition };
      return updated;
    });
  };

  // Update item reason
  const updateItemReason = (index, reason) => {
    setReturnItems((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], reason };
      return updated;
    });
  };

  // Quick set all remaining qty
  const handleReturnAll = () => {
    setReturnItems((prev) =>
      prev.map((item) => ({ ...item, returnedQty: item.remainingQty }))
    );
  };

  // Calculate totals
  const selectedItemsToReturn = returnItems.filter((it) => it.returnedQty > 0);
  const totalReturnAmount = selectedItemsToReturn.reduce(
    (sum, it) => sum + it.returnedQty * it.rate,
    0
  );
  const totalRestoredStockQty = selectedItemsToReturn
    .filter((it) => it.condition === 'not_damaged')
    .reduce((sum, it) => sum + it.returnedQty, 0);

  // Financial breakdown for partial payments & past dues
  const itemsNetTotal = selectedInvoice ? Math.max(0, (selectedInvoice.subtotal || 0) - (selectedInvoice.discount || 0)) : 0;
  const effectivePaid = selectedInvoice ? (Number(selectedInvoice.paidAmount || 0) + Number(selectedInvoice.creditApplied || 0)) : 0;
  const paidTowardItems = Math.min(effectivePaid, itemsNetTotal);
  const unpaidDueForItems = Math.max(0, itemsNetTotal - paidTowardItems);
  const unpaidToCancel = selectedInvoice?.customer ? Math.min(totalReturnAmount, unpaidDueForItems) : 0;
  const actualRefundAmount = Math.max(0, totalReturnAmount - unpaidToCancel);

  // Filter invoices for search
  const filteredInvoices = invoices.filter((inv) => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return true;
    const invNo = (inv.invoiceNo || '').toLowerCase();
    const custName = (inv.customer?.name || '').toLowerCase();
    const custPhone = (inv.customer?.phone || '').toLowerCase();
    return invNo.includes(q) || custName.includes(q) || custPhone.includes(q);
  });

  // Handle return submission
  const handleSubmitReturn = async () => {
    if (selectedItemsToReturn.length === 0) {
      toast.warning(isUrdu ? 'براہ کرم کم از کم ایک آئٹم منتخب کریں' : 'Please select at least one item quantity to return');
      return;
    }

    if (refundMethod === 'bank_transfer' && !selectedBankAccount) {
      toast.error(isUrdu ? 'براہ کرم بینک اکاؤنٹ منتخب کریں' : 'Please select a bank account for refund');
      return;
    }

    if (refundMethod === 'credit' && !selectedInvoice?.customer) {
      toast.error(isUrdu ? 'عام خریدار کے لیے ادھار کٹوتی ممکن نہیں، نقد منتخب کریں' : 'Walk-in customers cannot receive credit. Please select Cash.');
      return;
    }

    try {
      setIsSubmitting(true);

      const payload = {
        invoiceId: selectedInvoice._id,
        items: selectedItemsToReturn.map((it) => ({
          productId: it.productId,
          productName: it.productName,
          originalQty: it.originalQty,
          returnedQty: it.returnedQty,
          rate: it.rate,
          taxPercent: 0,
          condition: it.condition,
          reason: it.reason || 'Customer Return',
        })),
        refundMethod,
        bankAccount: refundMethod === 'bank_transfer' ? selectedBankAccount : undefined,
        discountAmount: 0,
        notes: notes.trim(),
      };

      const res = await api.post('/api/returns', payload);
      const returnRecord = res.data?.return || res.data;
      const returnId = returnRecord?.returnId || 'Return';

      toast.success(
        isUrdu
          ? `واپسی (${returnId}) کامیابی سے درج ہو گئی! اسٹاک میں اضافہ اور رقم کی کٹوتی ہو گئی۔`
          : `Return (${returnId}) processed! Stock restored and Rs. ${totalReturnAmount.toFixed(2)} refunded.`
      );

      // Refresh Redux stores in real time
      dispatch(getAllItems());
      dispatch(getAllCustomers());
      dispatch(getAccounts());

      onClose();
    } catch (err) {
      console.error('Error processing return:', err);
      toast.error(err.response?.data?.message || (isUrdu ? 'واپسی کے عمل میں خرابی پیش آگئی' : 'Failed to process return'));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4 overflow-y-auto" dir="ltr">
      <div className="bg-card rounded-2xl max-w-3xl w-full border border-default shadow-2xl overflow-hidden flex flex-col max-h-[90vh] text-left">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-default flex items-center justify-between bg-card shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-600 dark:text-orange-400 flex items-center justify-center shrink-0">
              <FiRotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-main flex items-center gap-2">
                <span>Sales Return by Invoice</span>
                {isUrdu && <span className="text-sm font-urdu text-secondary font-normal">(بل کے ذریعے مال کی واپسی)</span>}
              </h2>
              <p className="text-xs text-secondary">
                {isUrdu ? 'اسٹاک خودکار طریقے سے واپس شامل ہوگا اور رقم ایڈجسٹ ہوگی' : 'Restores item stock & automatically deducts refund amount'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-muted hover:text-main p-1.5 rounded-lg hover:bg-hover transition cursor-pointer"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-5">
          {/* STEP 1: If No Invoice is selected yet */}
          {!selectedInvoice ? (
            <div className="space-y-4">
              {/* Search Bar */}
              <div className="relative">
                <FiSearch className="absolute left-3.5 top-3.5 text-muted w-4 h-4" />
                <input
                  type="text"
                  placeholder={isUrdu ? "بل نمبر، گاہک کا نام یا فون درج کریں... (e.g. INV-00001)" : "Search by invoice # (e.g. INV-00001), customer name, or phone..."}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  autoFocus
                  className="w-full pl-10 pr-4 py-2.5 border border-default rounded-xl bg-input text-main placeholder-muted focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition shadow-xs text-sm"
                />
              </div>

              {/* Invoices List */}
              <div className="space-y-2 max-h-[52vh] overflow-y-auto pr-1">
                {loadingInvoices || loadingInvoiceDetail ? (
                  <div className="py-12 text-center text-secondary">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-2"></div>
                    <p className="text-sm font-medium">{isUrdu ? 'بلز تلاش کیے جا رہے ہیں...' : 'Loading invoices...'}</p>
                  </div>
                ) : filteredInvoices.length === 0 ? (
                  <div className="py-12 text-center text-secondary">
                    <FiAlertCircle className="w-8 h-8 mx-auto text-muted mb-2" />
                    <p className="font-semibold text-main text-sm">{isUrdu ? 'کوئی بل نہیں ملا' : 'No invoices found'}</p>
                    <p className="text-xs text-muted mt-1">{isUrdu ? 'براہ کرم بل نمبر یا گاہک کا نام درست لکھیں' : 'Check search term or create a new invoice first'}</p>
                  </div>
                ) : (
                  filteredInvoices.map((inv) => (
                    <div
                      key={inv._id}
                      onClick={() => handleSelectInvoice(inv)}
                      className="p-3.5 sm:p-4 rounded-xl border border-default hover:border-orange-500 hover:bg-orange-500/5 transition cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-main group-hover:text-orange-600 dark:group-hover:text-orange-400 font-mono text-sm">
                            {inv.invoiceNo}
                          </span>
                          <span className="text-[11px] px-2 py-0.5 rounded-md bg-default text-secondary font-medium">
                            {inv.items?.length || 0} {isUrdu ? 'آئٹمز' : 'items'}
                          </span>
                          {inv.hasReturns && (
                            <span className="text-[11px] px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-700 dark:text-amber-400 font-medium">
                              {isUrdu ? 'پہلے سے واپسی شدہ' : 'Has Returns'}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-xs text-secondary">
                          <span className="flex items-center gap-1">
                            <FiUser className="w-3.5 h-3.5 text-muted" />
                            {inv.customer?.name || (isUrdu ? 'عام خریدار (Walk-in)' : 'Walk-in Customer')}
                          </span>
                          <span className="flex items-center gap-1">
                            <FiCalendar className="w-3.5 h-3.5 text-muted" />
                            {new Date(inv.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      <div className="text-right sm:text-right flex sm:flex-col items-center sm:items-end justify-between border-t sm:border-0 border-default pt-2 sm:pt-0">
                        <span className="font-bold text-base text-main tabular-nums font-mono">
                          Rs. {Number(inv.totalAmount || 0).toFixed(2)}
                        </span>
                        <span className="text-xs text-emerald-600 font-medium capitalize">
                          {inv.paymentMethod || 'cash'}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          ) : (
            /* STEP 2: Configure Return for Selected Invoice */
            <div className="space-y-5">
              {/* Selected Invoice Banner */}
              <div className="p-3.5 sm:p-4 rounded-xl bg-orange-500/10 border border-orange-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase text-orange-700 dark:text-orange-400 tracking-wider">
                      {isUrdu ? 'منتخب شدہ بل:' : 'Selected Invoice:'}
                    </span>
                    <span className="font-mono font-bold text-main">{selectedInvoice.invoiceNo}</span>
                  </div>
                  <div className="text-xs text-secondary mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                    <span>
                      {isUrdu ? 'گاہک:' : 'Customer:'}{' '}
                      <strong className="text-main">
                        {selectedInvoice.customer?.name || (isUrdu ? 'عام خریدار' : 'Walk-in')}
                      </strong>
                    </span>
                    <span>
                      {isUrdu ? 'کل رقم:' : 'Total:'}{' '}
                      <strong className="text-main">Rs. {Number(selectedInvoice.totalAmount || 0).toFixed(2)}</strong>
                    </span>
                    <span>
                      {isUrdu ? 'ادائیگی:' : 'Paid:'}{' '}
                      <strong className="text-emerald-600">Rs. {Number(selectedInvoice.paidAmount || 0).toFixed(2)}</strong>
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleReturnAll}
                    className="px-3 py-1.5 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-xs font-semibold shadow-xs transition cursor-pointer"
                  >
                    {isUrdu ? 'تمام واپس کریں' : 'Return All Items'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedInvoice(null);
                      setReturnItems([]);
                    }}
                    className="px-3 py-1.5 border border-default bg-card hover:bg-hover text-secondary hover:text-main rounded-lg text-xs font-medium transition cursor-pointer flex items-center gap-1"
                  >
                    <FiArrowLeft className="w-3.5 h-3.5" />
                    <span>{isUrdu ? 'بل تبدیل کریں' : 'Change'}</span>
                  </button>
                </div>
              </div>

              {/* Items List Table */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase text-secondary tracking-wider">
                    {isUrdu ? 'واپسی کے لیے سامان اور تعداد منتخب کریں' : 'Select Items & Quantities to Return'}
                  </label>
                  <span className="text-xs text-muted">
                    {selectedItemsToReturn.length} {isUrdu ? 'آئٹمز منتخب شدہ' : 'items selected'}
                  </span>
                </div>

                <div className="space-y-2.5 max-h-[36vh] overflow-y-auto pr-1">
                  {returnItems.map((item, idx) => (
                    <div
                      key={item.productId || idx}
                      className={`p-3.5 rounded-xl border transition ${
                        item.returnedQty > 0
                          ? 'border-orange-500 bg-orange-500/5'
                          : 'border-default bg-card'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                        <div className="flex-1 min-w-0">
                          <div className="font-bold text-main text-sm truncate">{item.productName}</div>
                          <div className="text-xs text-secondary flex items-center gap-3 mt-0.5">
                            <span>{isUrdu ? 'قیمت فی یونٹ:' : 'Rate:'} Rs. {item.rate.toFixed(2)}</span>
                            <span>{isUrdu ? 'کل فروخت:' : 'Sold:'} {item.originalQty}</span>
                            <span className="text-orange-600 font-medium">
                              {isUrdu ? 'باقی قابل واپسی:' : 'Returnable:'} {item.remainingQty}
                            </span>
                          </div>
                        </div>

                        {/* Quantity Controls */}
                        <div className="flex items-center gap-3 self-end sm:self-center">
                          <div className="flex items-center border border-default rounded-lg bg-input overflow-hidden shadow-xs">
                            <button
                              type="button"
                              onClick={() => updateItemQty(idx, item.returnedQty - 1)}
                              disabled={item.returnedQty <= 0}
                              className="p-1.5 text-secondary hover:text-main hover:bg-hover disabled:opacity-30 transition cursor-pointer"
                            >
                              <FiMinus className="w-3.5 h-3.5" />
                            </button>
                            <input
                              type="number"
                              min="0"
                              max={item.remainingQty}
                              value={item.returnedQty}
                              onChange={(e) => updateItemQty(idx, e.target.value)}
                              className="w-14 text-center py-1 bg-transparent text-sm font-bold text-main font-mono focus:outline-none"
                            />
                            <button
                              type="button"
                              onClick={() => updateItemQty(idx, item.returnedQty + 1)}
                              disabled={item.returnedQty >= item.remainingQty}
                              className="p-1.5 text-secondary hover:text-main hover:bg-hover disabled:opacity-30 transition cursor-pointer"
                            >
                              <FiPlus className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <div className="text-right min-w-[80px]">
                            <span className="text-xs text-muted block">{isUrdu ? 'رقم' : 'Refund'}</span>
                            <span className="font-bold text-sm text-main font-mono tabular-nums">
                              Rs. {(item.returnedQty * item.rate).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Item Condition & Reason (Shows when returnedQty > 0) */}
                      {item.returnedQty > 0 && (
                        <div className="mt-3 pt-2.5 border-t border-dashed border-default flex flex-col sm:flex-row items-center gap-2 text-xs">
                          <div className="w-full sm:w-1/2 flex items-center gap-1.5">
                            <span className="text-secondary shrink-0 font-medium">{isUrdu ? 'حالت:' : 'Condition:'}</span>
                            <select
                              value={item.condition}
                              onChange={(e) => updateItemCondition(idx, e.target.value)}
                              className="w-full px-2.5 py-1.5 border border-default rounded-lg bg-input text-main text-xs focus:ring-1 focus:ring-orange-500 font-medium"
                            >
                              <option value="not_damaged">{isUrdu ? 'صحیح / درست (اسٹاک میں واپس شامل کریں +)' : 'Good / Resellable (Restores Stock +)'}</option>
                              <option value="damaged">{isUrdu ? 'خراب / ڈیفیکٹ (اسٹاک میں شامل نہ کریں)' : 'Damaged / Defective (No stock added)'}</option>
                            </select>
                          </div>

                          <div className="w-full sm:w-1/2 flex items-center gap-1.5">
                            <span className="text-secondary shrink-0 font-medium">{isUrdu ? 'وجہ:' : 'Reason:'}</span>
                            <select
                              value={item.reason}
                              onChange={(e) => updateItemReason(idx, e.target.value)}
                              className="w-full px-2.5 py-1.5 border border-default rounded-lg bg-input text-main text-xs focus:ring-1 focus:ring-orange-500 font-medium"
                            >
                              <option value="Customer Return">{isUrdu ? 'گاہک کی مرضی سے واپسی' : 'Customer Return'}</option>
                              <option value="Wrong Item">{isUrdu ? 'غلط آئٹم گیا تھا' : 'Wrong Item'}</option>
                              <option value="Defective">{isUrdu ? 'خراب / نقص والا مال' : 'Defective Item'}</option>
                              <option value="Size / Variant Change">{isUrdu ? 'سائز یا ماڈل کی تبدیلی' : 'Size / Variant Change'}</option>
                              <option value="Other">{isUrdu ? 'دیگر وجہ' : 'Other Reason'}</option>
                            </select>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Refund Method & Account */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-default pt-4">
                <div>
                  <label className="text-xs font-bold uppercase text-secondary tracking-wider block mb-1.5">
                    {isUrdu ? 'رقم واپس کرنے کا طریقہ' : 'Refund Method (Where to Deduct)'}
                  </label>
                  <select
                    value={refundMethod}
                    onChange={(e) => setRefundMethod(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-default rounded-xl bg-input text-main focus:ring-2 focus:ring-orange-500 text-sm font-medium transition shadow-xs"
                  >
                    <option value="cash">{isUrdu ? 'Cash (گلّہ سے نقد رقم واپس کریں)' : 'Cash (Deduct from Cash Drawer)'}</option>
                    {selectedInvoice.customer && (
                      <option value="credit">{isUrdu ? 'Customer Udhaar / Balance (ادھار کھاتے سے کٹوتی)' : 'Customer Credit / Dues (Adjust in Udhaar)'}</option>
                    )}
                    <option value="bank_transfer">{isUrdu ? 'Bank Transfer (بینک کھاتے سے واپسی)' : 'Bank Transfer (Deduct from Bank)'}</option>
                    <option value="original_payment">{isUrdu ? 'Original Payment Method (اصل طریقہ)' : 'Original Payment Method'}</option>
                  </select>
                </div>

                {refundMethod === 'bank_transfer' && (
                  <div>
                    <label className="text-xs font-bold uppercase text-secondary tracking-wider block mb-1.5">
                      {isUrdu ? 'بینک کھاتہ منتخب کریں' : 'Select Bank Account'}
                    </label>
                    <select
                      value={selectedBankAccount}
                      onChange={(e) => setSelectedBankAccount(e.target.value)}
                      className="w-full px-3.5 py-2.5 border border-default rounded-xl bg-input text-main focus:ring-2 focus:ring-orange-500 text-sm font-medium transition shadow-xs"
                      required
                    >
                      <option value="">{isUrdu ? 'کھاتہ منتخب کریں...' : 'Choose Bank Account...'}</option>
                      {accounts.map((acc) => (
                        <option key={acc._id} value={acc._id}>
                          {acc.bankName} - {acc.accountType} (Rs. {acc.currentBalance})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className={refundMethod !== 'bank_transfer' ? 'sm:col-span-2' : ''}>
                  <label className="text-xs font-bold uppercase text-secondary tracking-wider block mb-1.5">
                    {isUrdu ? 'نوٹ / ریمارکس (اختیاری)' : 'Return Notes (Optional)'}
                  </label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder={isUrdu ? "واپسی کے متعلق کوئی خاص بات لکھیں..." : "Optional notes for this return..."}
                    className="w-full px-3.5 py-2.5 border border-default rounded-xl bg-input text-main placeholder-muted text-sm shadow-xs focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>

              {/* Live Impact Preview Card */}
              <div className="p-4 rounded-xl border border-orange-500/30 bg-gradient-to-br from-orange-500/10 via-amber-500/5 to-transparent space-y-2.5">
                <div className="text-[11px] font-bold uppercase tracking-wider text-secondary">
                  {isUrdu ? 'واپسی کے اثرات کا خلاصہ' : 'Return Impact & Calculation'}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-semibold text-main">
                    <FiPackage className="text-orange-600 dark:text-orange-400 w-4 h-4" />
                    <span>{isUrdu ? 'اسٹاک میں اضافہ:' : 'Stock Restored:'}</span>
                  </div>
                  <span className="font-bold text-xs text-emerald-600 dark:text-emerald-400">
                    +{totalRestoredStockQty} {isUrdu ? 'یونٹس سامان' : 'units to inventory'}
                  </span>
                </div>

                {/* Udhaar auto-cancellation */}
                {unpaidToCancel > 0 && (
                  <div className="flex items-center justify-between bg-emerald-500/10 dark:bg-emerald-950/30 p-2 rounded-lg border border-emerald-500/20">
                    <div className="text-xs">
                      <span className="font-bold text-emerald-700 dark:text-emerald-400 block">
                        {isUrdu ? 'ادھار کھاتے سے کٹوتی (غیر ادا شدہ):' : 'Udhaar Auto-Cancelled:'}
                      </span>
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-500">
                        {isUrdu ? 'واپس کردہ سامان کا بقایا ادھار ختم' : 'Unpaid item balance removed from ledger'}
                      </span>
                    </div>
                    <span className="font-bold text-sm text-emerald-600 dark:text-emerald-400 font-mono">
                      -Rs. {unpaidToCancel.toFixed(2)}
                    </span>
                  </div>
                )}

                {/* Actual Money Refund */}
                <div className="flex items-center justify-between bg-blue-500/10 dark:bg-blue-950/30 p-2 rounded-lg border border-blue-500/20">
                  <div className="text-xs">
                    <span className="font-bold text-blue-700 dark:text-blue-400 block">
                      {isUrdu ? 'گاہک کو ادا کی جانے والی رقم:' : 'Net Refund (Cash/Credit):'}
                    </span>
                    <span className="text-[10px] text-blue-600 dark:text-blue-500">
                      {isUrdu ? 'جو رقم گاہک نے نقد دی تھی' : 'Actual money paid by customer for items'}
                    </span>
                  </div>
                  <span className="font-bold text-sm text-blue-600 dark:text-blue-400 font-mono">
                    Rs. {actualRefundAmount.toFixed(2)}
                  </span>
                </div>

                {/* Past Dues Note */}
                {selectedInvoice.previousDueAmount > 0 && (
                  <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300 text-[11px] flex items-center gap-1.5">
                    <FiAlertCircle className="shrink-0 w-3.5 h-3.5" />
                    <span>
                      {isUrdu
                        ? `سابقہ ادھار (Rs. ${Number(selectedInvoice.previousDueAmount).toFixed(2)}) کھاتے میں محفوظ رہے گا اور واپس نہیں ہوگا۔`
                        : `Past Dues (Rs. ${Number(selectedInvoice.previousDueAmount).toFixed(2)}) remain safe & untouched in customer ledger.`}
                    </span>
                  </div>
                )}

                {/* Pakistani Currency Note Breakdown when paying cash */}
                {actualRefundAmount > 0 && (refundMethod === 'cash' || refundMethod === 'original_payment') && (
                  <div className="pt-2">
                    <DenominationBreakdown
                      amount={actualRefundAmount}
                      label="Cash Refund Notes to Return"
                      urduLabel="واپسی نقد نوٹوں کی تفصیل (گاہک کو ادا کریں)"
                    />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-default bg-card flex flex-col-reverse sm:flex-row items-center justify-end gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 border border-default rounded-xl text-secondary hover:text-main hover:bg-hover text-sm font-medium transition cursor-pointer"
          >
            {isUrdu ? 'منسوخ کریں' : 'Cancel'}
          </button>

          {selectedInvoice && (
            <button
              type="button"
              disabled={isSubmitting || selectedItemsToReturn.length === 0}
              onClick={handleSubmitReturn}
              className="w-full sm:w-auto px-6 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-sm font-bold shadow-md hover:shadow-orange-500/25 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                  <span>{isUrdu ? 'واپسی ہو رہی ہے...' : 'Processing...'}</span>
                </>
              ) : (
                <>
                  <FiCheck className="w-4 h-4" />
                  <span>
                    {isUrdu
                      ? `واپسی مکمل کریں (Rs. ${totalReturnAmount.toFixed(2)})`
                      : `Confirm Return & Add Stock (Rs. ${totalReturnAmount.toFixed(2)})`}
                  </span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default POSReturnModal;
