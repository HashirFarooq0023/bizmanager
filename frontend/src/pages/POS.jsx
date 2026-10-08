import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../contexts/LanguageContext';
import { getAllItems } from '../redux/slices/inventorySlice';
import { getAllCustomers, addCustomer, reset as resetCustomer } from '../redux/slices/customerSlice';
import { createInvoice, reset, clearInvoice } from '../redux/slices/posSlice';
import { getAccounts } from '../redux/slices/cashbankSlice';
import Layout from '../components/Layout';
import POSReturnModal from '../components/POSReturnModal';
import DenominationBreakdown from '../components/DenominationBreakdown';

const POS = () => {
  const { t } = useTranslation(['pos', 'common']);
  const { isUrdu } = useLanguage();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { items = [] } = useSelector((state) => state.inventory);
  const { customers = [] } = useSelector((state) => state.customers);
  const { accounts = [] } = useSelector((state) => state.cashbank);
  const { invoice, isLoading, isSuccess, isError, message } = useSelector((state) => state.pos);

  const defaultTab = {
    id: 1,
    name: 'Tab 1',
    customer: null,
    cart: [],
    discount: 0,
    paymentMethod: 'cash',
    bankAccount: '',
    paidAmount: '',
    changeReturned: '',
    applyCreditEnabled: false,
    creditUsed: 0,
    availableCredit: 0,
    previousDueApplied: 0,
    splitPaymentDetails: [],
  };

  // Tab system state - Load from localStorage on mount with safe schema fallback
  const [tabs, setTabs] = useState(() => {
    try {
      const savedTabs = localStorage.getItem('posTabs');
      if (savedTabs) {
        const parsed = JSON.parse(savedTabs);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map(tab => ({
            ...defaultTab,
            ...tab,
            cart: Array.isArray(tab?.cart) ? tab.cart : []
          }));
        }
      }
    } catch (e) {
      console.error('Error reading posTabs from localStorage:', e);
    }
    return [defaultTab];
  });

  const [activeTabId, setActiveTabId] = useState(() => {
    try {
      const savedActiveTab = localStorage.getItem('posActiveTab');
      if (savedActiveTab) {
        const parsed = parseInt(savedActiveTab, 10);
        if (!isNaN(parsed)) return parsed;
      }
    } catch (e) {
      console.error('Error reading posActiveTab from localStorage:', e);
    }
    return 1;
  });

  // Helper function to get the next available tab number (fills gaps)
  const getNextTabNumber = (currentTabs) => {
    const list = Array.isArray(currentTabs) ? currentTabs : [];
    const usedNumbers = list.map(tab => {
      const match = (tab?.name || '').match(/^Tab (\d+)$/);
      return match ? parseInt(match[1]) : 0;
    }).filter(n => n > 0);

    // Find the smallest available number starting from 1
    let nextNum = 1;
    while (usedNumbers.includes(nextNum)) {
      nextNum++;
    }
    return nextNum;
  };

  // UI state
  const [searchTerm, setSearchTerm] = useState('');
  const [customerSearchTerm, setCustomerSearchTerm] = useState('');
  const [showAddCustomer, setShowAddCustomer] = useState(false);
  const [showCustomerSelect, setShowCustomerSelect] = useState(false);
  const [showHoldOrders, setShowHoldOrders] = useState(false);
  const [showSplitPayment, setShowSplitPayment] = useState(false);
  const [showOverpaymentConfirm, setShowOverpaymentConfirm] = useState(false);
  const [completedSale, setCompletedSale] = useState(null);
  const [draggedTabId, setDraggedTabId] = useState(null);
  const [splitPayments, setSplitPayments] = useState([
    { method: 'cash', amount: '' },
  ]);
  const [barcodeInput, setBarcodeInput] = useState('');
  const [showUnpaidConfirm, setShowUnpaidConfirm] = useState(false);
  const [showReturnModal, setShowReturnModal] = useState(false);

  // Hold orders state - Load from localStorage
  const [holdOrders, setHoldOrders] = useState(() => {
    try {
      const saved = localStorage.getItem('posHoldOrders');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.error('Error reading posHoldOrders from localStorage:', e);
    }
    return [];
  });

  // New customer form
  const [newCustomer, setNewCustomer] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
  });

  useEffect(() => {
    dispatch(getAllItems());
    dispatch(getAllCustomers());
    dispatch(getAccounts());
  }, [dispatch]);

  useEffect(() => {
    if (isError && message) {
      toast.error(message);
      dispatch(reset());
    }
  }, [isError, message, dispatch]);

  useEffect(() => {
    if (isSuccess && invoice) {
      const invoiceId = invoice._id;

      // Remove completed tab and reset tabs
      const currentTabs = Array.isArray(tabs) ? tabs : [];
      const newTabs = currentTabs.filter(tab => tab.id !== activeTabId);

      if (newTabs.length === 0) {
        // If no tabs left, create a fresh tab
        const freshTab = {
          ...defaultTab,
          id: Date.now(),
          name: 'Tab 1',
        };
        setTabs([freshTab]);
        setActiveTabId(freshTab.id);
      } else {
        setTabs(newTabs);
        setActiveTabId(newTabs[0].id);
      }

      // Refresh bank accounts to update balances
      dispatch(getAccounts());

      // Direct navigation to Invoice Detail page (Old after-sale structure)
      navigate(`/pos/invoice/${invoiceId}`);
      dispatch(clearInvoice());
      dispatch(reset());
    }
  }, [isSuccess, invoice, navigate, dispatch, activeTabId, tabs]);

  // Save tabs to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('posTabs', JSON.stringify(tabs));
      localStorage.setItem('posActiveTab', (activeTabId || 1).toString());
    } catch (e) {
      console.error('Error saving posTabs to localStorage:', e);
    }
  }, [tabs, activeTabId]);

  // Save hold orders to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('posHoldOrders', JSON.stringify(holdOrders));
    } catch (e) {
      console.error('Error saving posHoldOrders to localStorage:', e);
    }
  }, [holdOrders]);

  // Ensure activeTab is always non-null and valid
  const activeTab = (Array.isArray(tabs) && tabs.find(tab => tab?.id === activeTabId)) || tabs?.[0] || defaultTab;

  // Re-synchronize activeTabId if tabs array updates and current activeTabId is missing
  useEffect(() => {
    if (!Array.isArray(tabs) || tabs.length === 0) {
      setTabs([defaultTab]);
      setActiveTabId(1);
    } else if (!tabs.some(tab => tab?.id === activeTabId)) {
      setActiveTabId(tabs[0].id);
    }
  }, [tabs, activeTabId]);

  const filteredItems = Array.isArray(items) ? items.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.sku && item.sku.toLowerCase().includes(searchTerm.toLowerCase()))
  ) : [];

  const filteredCustomers = Array.isArray(customers) ? customers.filter((customer) =>
    customer.name.toLowerCase().includes(customerSearchTerm.toLowerCase()) ||
    customer.phone.includes(customerSearchTerm)
  ) : [];

  // Barcode scanner handler
  const handleBarcodeInput = (e) => {
    if (e.key === 'Enter' && barcodeInput.trim()) {
      const item = items.find(i => i.sku === barcodeInput.trim());
      if (item) {
        addToCart(item);
        setBarcodeInput('');
      } else {
        alert('Product not found with this barcode!');
        setBarcodeInput('');
      }
    }
  };

  // Tab management functions
  const addNewTab = () => {
    const currentTabs = Array.isArray(tabs) ? tabs : [];
    const nextTabNum = getNextTabNumber(currentTabs);
    const newTabId = Date.now(); // Use timestamp for unique ID
    const newTab = {
      ...defaultTab,
      id: newTabId,
      name: `Tab ${nextTabNum}`,
    };
    setTabs([...currentTabs, newTab]);
    setActiveTabId(newTabId);
  };

  const closeTab = (tabId) => {
    if (!Array.isArray(tabs) || tabs.length <= 1) return; // Don't close last tab

    const newTabs = tabs.filter(tab => tab.id !== tabId);
    setTabs(newTabs);

    if (activeTabId === tabId && newTabs.length > 0) {
      setActiveTabId(newTabs[0].id);
    }
  };

  // Drag and drop handlers for tab reordering
  const handleDragStart = (e, tabId) => {
    setDraggedTabId(tabId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, tabId) => {
    e.preventDefault();
    if (draggedTabId === null || draggedTabId === tabId) return;

    const currentTabs = Array.isArray(tabs) ? tabs : [];
    const draggedIndex = currentTabs.findIndex(tab => tab.id === draggedTabId);
    const targetIndex = currentTabs.findIndex(tab => tab.id === tabId);

    if (draggedIndex === -1 || targetIndex === -1 || draggedIndex === targetIndex) return;

    const newTabs = [...currentTabs];
    const [draggedTab] = newTabs.splice(draggedIndex, 1);
    newTabs.splice(targetIndex, 0, draggedTab);
    setTabs(newTabs);
  };

  const handleDragEnd = () => {
    setDraggedTabId(null);
  };

  const updateTabData = (updates) => {
    setTabs(prevTabs => {
      const currentTabs = Array.isArray(prevTabs) && prevTabs.length > 0 ? prevTabs : [defaultTab];
      const targetId = activeTab?.id || activeTabId;
      return currentTabs.map(tab =>
        tab.id === targetId ? { ...tab, ...updates } : tab
      );
    });
  };

  // Cart management
  const addToCart = (item) => {
    if (!item) return;
    const currentCart = Array.isArray(activeTab?.cart) ? activeTab.cart : [];
    const existingItem = currentCart.find((cartItem) => cartItem.item === item._id);

    if (existingItem) {
      if (existingItem.quantity >= (item.stockQty || 0)) {
        toast.warning(`Only ${item.stockQty || 0} units available in stock!`);
        return;
      }

      updateTabData({
        cart: currentCart.map((cartItem) =>
          cartItem.item === item._id
            ? { ...cartItem, quantity: cartItem.quantity + 1, total: (cartItem.quantity + 1) * (Number(cartItem.price) || 0) }
            : cartItem
        )
      });
    } else {
      if (item.stockQty === 0) {
        toast.warning('This item is out of stock!');
        return;
      }

      updateTabData({
        cart: [...currentCart, {
          item: item._id,
          name: item.name || 'Unnamed Product',
          quantity: 1,
          price: Number(item.sellingPrice) || 0,
          total: Number(item.sellingPrice) || 0,
          availableStock: item.stockQty || 0,
        }]
      });
    }
  };

  const updateQuantity = (itemId, newQuantity) => {
    const currentCart = Array.isArray(activeTab?.cart) ? activeTab.cart : [];
    if (newQuantity <= 0) {
      removeFromCart(itemId);
      return;
    }

    const cartItem = currentCart.find((item) => item.item === itemId);
    if (cartItem && newQuantity > (cartItem.availableStock || 0)) {
      alert(`Only ${cartItem.availableStock} units available!`);
      return;
    }

    updateTabData({
      cart: currentCart.map((cartItem) =>
        cartItem.item === itemId
          ? { ...cartItem, quantity: newQuantity, total: newQuantity * (Number(cartItem.price) || 0) }
          : cartItem
      )
    });
  };

  const removeFromCart = (itemId) => {
    const currentCart = Array.isArray(activeTab?.cart) ? activeTab.cart : [];
    updateTabData({
      cart: currentCart.filter((cartItem) => cartItem.item !== itemId)
    });
  };

  const calculateSubtotal = () => {
    if (!activeTab || !Array.isArray(activeTab.cart)) return 0;
    return activeTab.cart.reduce((sum, item) => sum + (Number(item?.total) || 0), 0);
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const discount = Number(activeTab?.discount) || 0;
    const afterDiscount = Math.max(0, subtotal - discount);

    // Calculate credit to apply
    const availableCredit = getAvailableCredit();
    const creditToApply = activeTab?.applyCreditEnabled ? Math.min(availableCredit, afterDiscount) : 0;

    const prevDue = parseFloat(activeTab?.previousDueApplied) || 0;

    return Math.max(0, afterDiscount + prevDue - creditToApply);
  };

  const getAvailableCredit = () => {
    if (!activeTab?.customer || typeof activeTab.customer.dues !== 'number') return 0;
    // Credit is negative dues
    return Math.abs(Math.min(0, activeTab.customer.dues));
  };

  const getCreditApplied = () => {
    if (!activeTab?.applyCreditEnabled) return 0;
    const subtotal = calculateSubtotal();
    const discount = Number(activeTab?.discount) || 0;
    const afterDiscount = Math.max(0, subtotal - discount);
    const availableCredit = getAvailableCredit();
    return Math.min(availableCredit, afterDiscount);
  };

  // Customer management
  const handleAddCustomer = async (e) => {
    e.preventDefault();
    if (!newCustomer.name || !newCustomer.name.trim()) {
      toast.error(t('pos:nameRequired', 'Customer name is required'));
      return;
    }
    if (!newCustomer.phone || !newCustomer.phone.trim()) {
      toast.error(t('pos:phoneRequired', 'Customer phone number is required'));
      return;
    }

    try {
      const payload = {
        name: newCustomer.name.trim(),
        phone: newCustomer.phone.trim(),
        email: newCustomer.email?.trim() || '',
        address: newCustomer.address?.trim() || '',
      };
      const createdCustomer = await dispatch(addCustomer(payload)).unwrap();
      toast.success(t('pos:customerAddedSuccess', 'Customer added successfully!'));
      await dispatch(getAllCustomers());
      if (createdCustomer) {
        selectCustomer(createdCustomer);
      }
      setNewCustomer({ name: '', phone: '', email: '', address: '' });
      setShowAddCustomer(false);
      dispatch(resetCustomer());
    } catch (err) {
      toast.error(typeof err === 'string' ? err : err?.message || 'Failed to add new customer');
    }
  };

  const selectCustomer = (customer) => {
    updateTabData({
      customer,
      applyCreditEnabled: false, // Reset credit checkbox when selecting new customer
      previousDueApplied: 0,
    });
    setShowCustomerSelect(false);
    setCustomerSearchTerm('');
  };

  // Hold Order Management
  const holdCurrentOrder = () => {
    const currentCart = Array.isArray(activeTab?.cart) ? activeTab.cart : [];
    if (currentCart.length === 0) {
      toast.warning('Cart is empty!');
      return;
    }

    const holdOrder = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      ...activeTab,
      customerName: activeTab?.customer?.name || 'Walk-in',
    };

    setHoldOrders([...holdOrders, holdOrder]);

    // Clear current tab
    updateTabData({
      customer: null,
      cart: [],
      discount: 0,
      paymentMethod: 'cash',
      paidAmount: '',
      changeReturned: '',
      applyCreditEnabled: false,
      previousDueApplied: 0,
    });

    toast.success('Order parked successfully!');
  };

  const retrieveHoldOrder = (holdOrder) => {
    if (!holdOrder) return;
    // Create new tab with hold order data - restore ALL properties
    const newTabId = Date.now(); // Use timestamp for unique ID
    const currentTabs = Array.isArray(tabs) ? tabs : [];
    const nextTabNum = getNextTabNumber(currentTabs);

    const newTab = {
      ...defaultTab,
      ...holdOrder,
      id: newTabId,
      name: `Tab ${nextTabNum}`,
      customer: holdOrder.customer || null,
      cart: Array.isArray(holdOrder.cart) ? holdOrder.cart : [],
      discount: Number(holdOrder.discount) || 0,
      paymentMethod: holdOrder.paymentMethod || 'cash',
      bankAccount: holdOrder.bankAccount || '',
      paidAmount: holdOrder.paidAmount || '',
      changeReturned: holdOrder.changeReturned || '',
      applyCreditEnabled: Boolean(holdOrder.applyCreditEnabled),
      creditUsed: Number(holdOrder.creditUsed) || 0,
      availableCredit: Number(holdOrder.availableCredit) || 0,
      previousDueApplied: Number(holdOrder.previousDueApplied) || 0,
    };

    setTabs([...currentTabs, newTab]);
    setActiveTabId(newTabId);

    // Remove from hold orders
    setHoldOrders(prev => Array.isArray(prev) ? prev.filter(order => order.id !== holdOrder.id) : []);
    setShowHoldOrders(false);

    // Show success message to user
    toast.success('Order retrieved successfully!');
  };

  const deleteHoldOrder = (orderId) => {
    if (confirm('Delete this parked order?')) {
      setHoldOrders(prev => Array.isArray(prev) ? prev.filter(order => order.id !== orderId) : []);
    }
  };

  // Split Payment Management
  const addSplitPayment = () => {
    setSplitPayments([...splitPayments, { method: 'cash', amount: '' }]);
  };

  const removeSplitPayment = (index) => {
    setSplitPayments(splitPayments.filter((_, i) => i !== index));
  };

  const updateSplitPayment = (index, field, value) => {
    const updated = [...splitPayments];
    updated[index][field] = value;
    setSplitPayments(updated);
  };

  const calculateSplitTotal = () => {
    return splitPayments.reduce((sum, payment) => sum + (parseFloat(payment.amount) || 0), 0);
  };

  const applySplitPayment = () => {
    const splitTotal = calculateSplitTotal();
    const saleTotal = calculateTotal();
    // Convert string amounts to numbers and filter out zero/empty amounts
    const validSplitPayments = splitPayments
      .map(p => ({
        method: p.method,
        amount: parseFloat(p.amount) || 0
      }))
      .filter(p => p.amount > 0);

    const change = Math.max(0, splitTotal - saleTotal);

    updateTabData({
      paidAmount: splitTotal.toString(),
      changeReturned: change > 0 ? change.toFixed(2) : '',
      paymentMethod: 'split',
      splitPaymentDetails: validSplitPayments
    });
    setShowSplitPayment(false);
  };

  // Print Receipt
  const printReceipt = () => {
    const cart = Array.isArray(activeTab?.cart) ? activeTab.cart : [];
    if (cart.length === 0) {
      alert('Cart is empty!');
      return;
    }

    const printWindow = window.open('', '', 'width=300,height=600');
    if (!printWindow) return;
    const receipt = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${t('pos:receipt')}</title>
        <style>
          body { font-family: monospace; width: 280px; margin: 10px; }
          h2 { text-align: center; margin: 10px 0; }
          .line { border-top: 1px dashed #000; margin: 10px 0; }
          table { width: 100%; }
          .right { text-align: right; }
          .bold { font-weight: bold; }
        </style>
      </head>
      <body>
        <h2>${t('pos:receipt')}</h2>
        <div class="line"></div>
        <p>${t('pos:date')} ${new Date().toLocaleString()}</p>
        <p>${t('pos:customer')}: ${activeTab.customer?.name || t('pos:walkInCustomer')}</p>
        <div class="line"></div>
        <table>
          ${cart.map(item => `
            <tr>
              <td>${item.name || 'Item'}</td>
              <td class="right">${item.quantity || 1} x Rs. ${(Number(item.price) || 0).toFixed(2)}</td>
            </tr>
            <tr>
              <td colspan="2" class="right">Rs. ${(Number(item.total) || 0).toFixed(2)}</td>
            </tr>
          `).join('')}
        </table>
        <div class="line"></div>
        <table>
          <tr>
            <td>${t('pos:subtotal')}</td>
            <td class="right">Rs. ${(Number(subtotal) || 0).toFixed(2)}</td>
          </tr>
          <tr>
            <td>${t('pos:discount')}</td>
            <td class="right">-Rs. ${(Number(activeTab.discount) || 0).toFixed(2)}</td>
          </tr>
          ${(Number(activeTab.previousDueApplied) || 0) > 0 ? `
            <tr>
              <td>${t('pos:previousDueAdded')}</td>
              <td class="right">+Rs. ${(parseFloat(activeTab.previousDueApplied) || 0).toFixed(2)}</td>
            </tr>
          ` : ''}
          <tr class="bold">
            <td>${t('pos:total')}</td>
            <td class="right">Rs. ${(Number(total) || 0).toFixed(2)}</td>
          </tr>
          ${getCreditApplied() > 0 ? `
            <tr>
              <td>${t('pos:creditApplied')}</td>
              <td class="right">-Rs. ${(Number(getCreditApplied()) || 0).toFixed(2)}</td>
            </tr>
          ` : ''}
          <tr>
            <td>${t('pos:amountPaidLabel')}</td>
            <td class="right">Rs. ${(parseFloat(activeTab.paidAmount) || 0).toFixed(2)}</td>
          </tr>
          ${balance > 0 ? `
            <tr>
              <td>${t('pos:changeToReturn', 'Change to Return:')}</td>
              <td class="right bold">Rs. ${(Number(balance) || 0).toFixed(2)}</td>
            </tr>
          ` : `
            <tr>
              <td>${t('pos:balanceDue')}</td>
              <td class="right bold">Rs. ${Math.max(0, -balance).toFixed(2)}</td>
            </tr>
          `}
        </table>
        <div class="line"></div>
        <p style="text-align: center;">${t('pos:thankYou')}</p>
      </body>
      </html>
    `;
    printWindow.document.write(receipt);
    printWindow.document.close();
    printWindow.print();
  };

  // Direct Print Receipt from Sale Completion Modal
  const printSaleReceipt = (saleInfo) => {
    if (!saleInfo) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error('Pop-up blocked! Please allow pop-ups to print receipts.');
      return;
    }

    const receiptHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Receipt - ${saleInfo.invoiceNumber || 'Sale'}</title>
        <style>
          body { font-family: monospace; width: 280px; margin: 10px; font-size: 12px; }
          h2 { text-align: center; margin: 8px 0 4px 0; font-size: 15px; }
          .center { text-align: center; }
          .line { border-top: 1px dashed #000; margin: 8px 0; }
          table { width: 100%; border-collapse: collapse; }
          .right { text-align: right; }
          .bold { font-weight: bold; }
          .item-row td { padding: 2px 0; }
        </style>
      </head>
      <body>
        <h2>SALES RECEIPT</h2>
        <p class="center" style="margin: 2px 0; font-size: 11px;">Invoice #: <strong>${saleInfo.invoiceNumber || saleInfo.id}</strong></p>
        <p class="center" style="margin: 2px 0; font-size: 10px;">Date: ${new Date(saleInfo.date || Date.now()).toLocaleString()}</p>
        <p class="center" style="margin: 2px 0; font-size: 11px;">Customer: ${saleInfo.customerName || 'Walk-in Customer'}</p>
        <div class="line"></div>
        <table>
          ${(saleInfo.items || []).map(item => `
            <tr class="item-row">
              <td>${item.name || item.item?.name || 'Item'}</td>
              <td class="right">${item.quantity || 1} x Rs. ${(Number(item.price) || 0).toFixed(2)}</td>
            </tr>
            <tr>
              <td colspan="2" class="right" style="font-size: 11px; padding-bottom: 4px;">Rs. ${(Number(item.total) || ((item.quantity || 1) * (Number(item.price) || 0)) || 0).toFixed(2)}</td>
            </tr>
          `).join('')}
        </table>
        <div class="line"></div>
        <table>
          ${(Number(saleInfo.discount) || 0) > 0 ? `
            <tr>
              <td>Discount:</td>
              <td class="right">-Rs. ${(Number(saleInfo.discount) || 0).toFixed(2)}</td>
            </tr>
          ` : ''}
          ${(Number(saleInfo.previousDueApplied) || 0) > 0 ? `
            <tr>
              <td>Previous Due:</td>
              <td class="right">+Rs. ${(Number(saleInfo.previousDueApplied) || 0).toFixed(2)}</td>
            </tr>
          ` : ''}
          <tr class="bold">
            <td style="font-size: 13px;">Total Bill:</td>
            <td class="right" style="font-size: 13px;">Rs. ${(Number(saleInfo.totalAmount) || 0).toFixed(2)}</td>
          </tr>
          <tr>
            <td>Amount Received:</td>
            <td class="right">Rs. ${(Number(saleInfo.paidAmount) || 0).toFixed(2)}</td>
          </tr>
          ${(Number(saleInfo.changeReturned) || 0) > 0 ? `
            <tr class="bold">
              <td style="font-size: 13px;">Change Returned:</td>
              <td class="right" style="font-size: 13px;">Rs. ${(Number(saleInfo.changeReturned) || 0).toFixed(2)}</td>
            </tr>
          ` : ''}
        </table>
        <div class="line"></div>
        <p class="center" style="margin: 8px 0; font-size: 11px;">Thank you for your visit!</p>
      </body>
      </html>
    `;

    printWindow.document.write(receiptHtml);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 250);
  };

  // Checkout
  const handleCheckout = () => {
    const cart = Array.isArray(activeTab?.cart) ? activeTab.cart : [];
    if (cart.length === 0) {
      toast.warning(t('pos:cartEmptyWarning', 'Cart is empty! Please add items to proceed.'));
      return;
    }

    const total = calculateTotal();
    const paid = activeTab.paidAmount !== '' && activeTab.paidAmount !== undefined
      ? (parseFloat(activeTab.paidAmount) || 0)
      : total;

    if (paid < 0) {
      toast.error('Invalid payment amount!');
      return;
    }

    // Check if walk-in customer is trying to take due
    if (!activeTab.customer && paid < total) {
      toast.warning('Walk-in customers must pay full amount. Please add customer details to allow credit.');
      return;
    }

    // Show confirmation popup for unpaid invoices (only for registered customers)
    if (activeTab.customer && paid < total) {
      setShowUnpaidConfirm(true);
      return;
    }

    // Proceed with checkout for fully paid/overpaid invoices or after confirmation
    proceedWithCheckout();
  };

  // Actual checkout logic
  const proceedWithCheckout = () => {
    setShowUnpaidConfirm(false);
    setShowOverpaymentConfirm(false);

    // Validate bank account selection
    if (activeTab.paymentMethod === 'bank_transfer' && !activeTab.bankAccount) {
      toast.error('Please select a bank account for bank transfer payment');
      return;
    }

    const total = calculateTotal();
    const paid = activeTab.paidAmount !== '' && activeTab.paidAmount !== undefined
      ? (parseFloat(activeTab.paidAmount) || 0)
      : total;
    const creditApplied = getCreditApplied();
    const changeRequired = Math.max(0, paid - total);

    // Default changeReturned to full changeRequired automatically
    let changeReturned = changeRequired;
    if (activeTab.customer && activeTab.changeReturned !== '' && activeTab.changeReturned !== undefined && activeTab.changeReturned !== null) {
      const explicitReturned = parseFloat(activeTab.changeReturned);
      if (!isNaN(explicitReturned) && explicitReturned <= changeRequired) {
        changeReturned = explicitReturned;
      }
    }

    console.log('Active tab:', { paymentMethod: activeTab.paymentMethod, bankAccount: activeTab.bankAccount });

    const invoiceData = {
      customerId: activeTab.customer?._id || null,
      items: (Array.isArray(activeTab.cart) ? activeTab.cart : []).map(item => ({
        item: item.item,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        total: item.quantity * item.price,
      })),
      discount: parseFloat(activeTab.discount) || 0,
      paidAmount: paid,
      creditApplied,
      previousDueAmount: parseFloat(activeTab.previousDueApplied) || 0,
      paymentMethod: activeTab.paymentMethod || 'cash',
      bankAccount: activeTab.paymentMethod === 'bank_transfer' ? activeTab.bankAccount : null,
      changeReturned,
      splitPaymentDetails: activeTab.splitPaymentDetails || [],
    };

    console.log('Sending invoice data:', invoiceData);

    dispatch(createInvoice(invoiceData));
  };

  const subtotal = calculateSubtotal();
  const total = calculateTotal();
  const paid = parseFloat(activeTab?.paidAmount) || 0;
  const balance = paid - total;

  return (
    <Layout>
      <div className="space-y-5" dir="ltr">
        {/* Header */}
        <div className="mb-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-left">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-main flex items-center gap-2">
              <span>Billing Counter (POS)</span>
              {isUrdu && <span className="text-lg font-urdu text-secondary font-normal">(بلنگ کاؤنٹر / بل بنائیں)</span>}
            </h1>
            <p className="text-xs sm:text-sm text-secondary mt-0.5">
              {isUrdu ? 'Fast counter billing & instant checkout (تیز ترین کاؤنٹر بلنگ اور رسید)' : 'Fast point of sale & billing'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowReturnModal(true)}
              className="flex items-center gap-2 px-3.5 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-semibold shadow-xs transition duration-150 cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
              </svg>
              <span>{isUrdu ? 'Sales Return / سامان واپسی' : 'Sales Return'}</span>
            </button>
            <button
              onClick={() => setShowHoldOrders(true)}
              className="flex items-center gap-2 px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-semibold shadow-xs transition duration-150 relative cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
              </svg>
              <span>{isUrdu ? 'Hold Orders / پارک شدہ بل' : 'Hold Orders'}</span>
              {holdOrders.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-rose-600 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center border-2 border-white">
                  {holdOrders.length}
                </span>
              )}
            </button>
            <button
              onClick={() => navigate('/pos/invoices')}
              className="flex items-center gap-2 px-3.5 py-2 bg-card hover:bg-hover border border-default text-main rounded-xl text-xs font-semibold shadow-xs transition duration-150 cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>{isUrdu ? 'View Invoices / تمام بل' : 'View Invoices'}</span>
            </button>
          </div>
        </div>

        {/* Error Message */}
        {isError && (
          <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-left">
            <p className="text-rose-600 dark:text-rose-400 text-sm font-medium">{message}</p>
          </div>
        )}

        {/* Tab System */}
        <div className="mb-4 bg-card rounded-xl border border-default shadow-xs text-left">
          <div className="flex items-center gap-1.5 p-2 overflow-x-auto">
            {tabs.map((tab) => (
              <div
                key={tab.id}
                draggable
                onDragStart={(e) => handleDragStart(e, tab.id)}
                onDragOver={(e) => handleDragOver(e, tab.id)}
                onDragEnd={handleDragEnd}
                className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg cursor-grab transition select-none text-xs sm:text-sm ${activeTabId === tab.id
                  ? 'bg-violet-600 text-white font-semibold shadow-xs'
                  : 'bg-hover text-secondary hover:text-main'
                  } ${draggedTabId === tab.id ? 'opacity-50' : ''}`}
              >
                <button
                  onClick={() => setActiveTabId(tab.id)}
                  className="flex items-center space-x-2"
                >
                  <span>
                    {(tab?.name || 'Tab').startsWith('Tab ') ? `Tab ${(tab?.name || '').replace('Tab ', '')}` : (tab?.name || 'Tab')}
                    {isUrdu && ` (ٹیب ${(tab?.name || '').replace('Tab ', '')})`}
                  </span>
                  {(tab?.cart || []).length > 0 && (
                    <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${activeTabId === tab.id ? 'bg-white/20 text-white' : 'bg-violet-100 dark:bg-violet-900/50 text-violet-700 dark:text-violet-300'
                      }`}>
                      {(tab?.cart || []).length}
                    </span>
                  )}
                </button>
                {tabs.length > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      closeTab(tab.id);
                    }}
                    className={`ml-1 rounded-full p-0.5 transition-colors ${activeTabId === tab.id
                      ? 'hover:bg-violet-500 text-white/70 hover:text-white'
                      : 'hover:bg-slate-300 dark:hover:bg-zinc-600 text-muted hover:text-main'
                      }`}
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            ))}
            <button
              onClick={addNewTab}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-violet-500/10 hover:bg-violet-500/20 text-violet-600 dark:text-violet-400 border border-violet-500/20 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>{isUrdu ? '+ New Tab (+ نیا ٹیب)' : '+ New Tab'}</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left Side - Products & Customer */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-4 text-left">
            {/* Customer Selection */}
            <div className="bg-card rounded-2xl border border-default shadow-sm p-4 sm:p-5 text-left">
              <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center gap-2">
                  <label className="text-sm font-semibold text-main">Customer</label>
                  {isUrdu && <span className="text-xs font-urdu text-secondary font-normal">(گاہک منتخب کریں)</span>}
                </div>
                <button
                  onClick={() => setShowAddCustomer(true)}
                  className="text-violet-600 dark:text-violet-400 hover:text-violet-700 text-xs sm:text-sm font-semibold flex items-center gap-1"
                >
                  <span>{isUrdu ? '+ New Customer (+ نیا گاہک بنائیں)' : '+ Add New Customer'}</span>
                </button>
              </div>

              {activeTab?.customer ? (
                <div>
                  <div className="flex items-center justify-between p-3.5 bg-hover border border-default rounded-xl">
                    <div className="flex-1">
                      <div className="font-bold text-main">{activeTab.customer.name}</div>
                      <div className="text-xs text-secondary">{activeTab.customer.phone}</div>
                      {getAvailableCredit() > 0 && (
                        <div className="mt-1 flex items-center space-x-1">
                          <svg className="w-4 h-4 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          <span className="text-xs font-semibold text-emerald-600">
                            {isUrdu ? `Available Credit / دستیاب کریڈٹ: Rs. ${(Number(getAvailableCredit()) || 0).toFixed(2)}` : `Available Credit: Rs. ${(Number(getAvailableCredit()) || 0).toFixed(2)}`}
                          </span>
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => updateTabData({ customer: null, applyCreditEnabled: false, availableCredit: 0, creditUsed: 0 })}
                      className="text-rose-500 hover:text-rose-700 p-1.5 rounded-lg hover:bg-rose-500/10 transition"
                      title="Remove customer"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setShowCustomerSelect(true)}
                  className="w-full px-4 py-3.5 border-2 border-dashed border-default hover:border-violet-500 rounded-xl text-secondary hover:text-violet-600 dark:hover:text-violet-400 hover:bg-violet-500/5 transition flex items-center justify-between text-left cursor-pointer"
                >
                  <span className="text-sm font-medium">Walk-in Customer</span>
                  {isUrdu && <span className="text-xs font-urdu text-muted">عام خریدار (گاہک تبدیل کرنے کے لیے کلک کریں)</span>}
                </button>
              )}

              {/* Credit Balance Display */}
              {activeTab?.customer && (Number(activeTab.availableCredit) || 0) > 0 && (
                <div className="mt-3 p-3.5 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <svg className="w-5 h-5 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs sm:text-sm font-semibold text-emerald-800 dark:text-emerald-300">Available Credit</span>
                        {isUrdu && <span className="text-xs font-urdu text-emerald-700 dark:text-emerald-400">(دستیاب کریڈٹ)</span>}
                      </div>
                    </div>
                    <span className="text-base font-bold font-mono text-emerald-600 dark:text-emerald-400">Rs. {(Number(activeTab.availableCredit) || 0).toFixed(2)}</span>
                  </div>
                </div>
              )}

              {/* Pending Dues Display */}
              {activeTab?.customer && (Number(activeTab.customer?.dues) || 0) > 0 && (
                <div className="mt-3 p-3.5 bg-rose-500/10 rounded-xl border border-rose-500/20">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <svg className="w-5 h-5 text-rose-600 dark:text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs sm:text-sm font-semibold text-rose-800 dark:text-rose-300">Previous Pending Dues</span>
                        {isUrdu && <span className="text-xs font-urdu text-rose-700 dark:text-rose-400">(سابقہ بقایا ادھار)</span>}
                      </div>
                    </div>
                    <span className="text-base font-bold font-mono text-rose-600 dark:text-rose-400">Rs. {(Number(activeTab.customer.dues) || 0).toFixed(2)}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Product Search & Barcode */}
            <div className="bg-card rounded-2xl border border-default shadow-sm p-4 sm:p-5 text-left">
              {/* Barcode Scanner Input */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-semibold text-main flex items-center gap-1.5">
                    <svg className="w-4 h-4 text-violet-600 dark:text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                    </svg>
                    <span>Barcode Scanner</span>
                  </span>
                  {isUrdu && <span className="text-xs text-secondary font-urdu">بارکوڈ اسکینر</span>}
                </div>
                <input
                  type="text"
                  dir="ltr"
                  value={barcodeInput}
                  onChange={(e) => setBarcodeInput(e.target.value)}
                  onKeyPress={handleBarcodeInput}
                  placeholder={isUrdu ? "Scan barcode or type SKU and press Enter... (بارکوڈ اسکین کریں یا کوڈ لکھ کر Enter دبائیں)" : "Scan barcode or type SKU and press Enter..."}
                  className="w-full px-4 py-2.5 border border-default rounded-xl bg-input text-main placeholder-muted focus:ring-2 focus:ring-violet-500 focus:border-violet-500 font-mono text-left transition shadow-xs"
                />
              </div>

              {/* Item Search Input */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-semibold text-main flex items-center gap-1.5">
                    <svg className="w-4 h-4 text-violet-600 dark:text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <span>Search Products</span>
                  </span>
                  {isUrdu && <span className="text-xs text-secondary font-urdu">سامان تلاش کریں</span>}
                </div>
                <div className="relative">
                  <input
                    type="text"
                    dir="ltr"
                    placeholder={isUrdu ? "Search by product name or SKU... (نام یا کوڈ سے سامان تلاش کریں)" : "Search by product name or SKU..."}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-default rounded-xl bg-input text-main placeholder-muted focus:ring-2 focus:ring-violet-500 focus:border-violet-500 text-left transition shadow-xs"
                  />
                  <svg className="absolute left-3.5 top-3 w-4 h-4 text-muted pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>

              {/* Products Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-96 overflow-y-auto">
                {filteredItems.map((item) => (
                  <button
                    key={item._id}
                    onClick={() => addToCart(item)}
                    disabled={item.stockQty === 0}
                    className={`p-3.5 border rounded-xl text-left transition-all duration-150 ${item.stockQty === 0
                      ? 'border-default bg-hover/50 cursor-not-allowed opacity-50'
                      : 'border-default bg-card hover:border-violet-500 hover:bg-violet-500/5 hover:shadow-xs cursor-pointer'
                      }`}
                  >
                    <div className="font-bold text-main mb-1 truncate text-sm">{item.name}</div>
                    <div className="text-base font-bold tabular-nums text-violet-600 dark:text-violet-400">Rs. {item.sellingPrice}</div>
                    <div className="text-xs text-secondary mt-1 flex items-center justify-between">
                      <span>Stock: {item.stockQty} {item.unit}</span>
                      {isUrdu && <span className="font-urdu text-[11px]">اسٹاک</span>}
                    </div>
                    {item.sku && (
                      <div className="text-[11px] text-muted mt-0.5 truncate flex items-center justify-between">
                        <span>SKU: {item.sku}</span>
                        {isUrdu && <span className="font-urdu text-[10px]">کوڈ</span>}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Side - Cart & Checkout */}
          <div className="lg:col-span-5 xl:col-span-4" dir="ltr">
            <div className="bg-card rounded-2xl border border-default shadow-sm p-4 sm:p-5 sticky top-4 text-left">
              <div className="flex items-center justify-between mb-4 border-b border-default pb-3">
                <h2 className="text-lg font-bold text-main">Sale Bill / Invoice</h2>
                {isUrdu && <span className="text-sm font-urdu text-secondary">خریداری کا بل</span>}
              </div>

              {/* Cart Items */}
              <div className="space-y-2.5 mb-4 max-h-72 overflow-y-auto overflow-x-hidden pr-0.5">
                {(activeTab?.cart || []).length === 0 ? (
                  <div className="text-secondary text-center py-8">
                    <p className="font-medium text-sm">Cart is currently empty</p>
                    {isUrdu && <p className="text-xs font-urdu text-muted mt-1">(بل ابھی خالی ہے)</p>}
                  </div>
                ) : (
                  (activeTab?.cart || []).map((item) => (
                    <div key={item.item} className="p-3 bg-hover border border-default rounded-xl space-y-2">
                      {/* Top Line: Item Name & Delete Button */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="font-bold text-main text-sm leading-snug line-clamp-2 break-words flex-1 min-w-0" title={item.name}>
                          {item.name}
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFromCart(item.item)}
                          className="text-rose-500 hover:text-rose-700 hover:bg-rose-500/10 p-1 rounded-lg transition shrink-0 cursor-pointer"
                          title="Remove item"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>

                      {/* Bottom Line: Stepper + Unit Rate on Left, Line Total on Right */}
                      <div className="flex items-center justify-between gap-2 pt-1.5 border-t border-dashed border-default/60">
                        <div className="flex items-center gap-1.5 shrink-0">
                          {/* Quantity Controls */}
                          <div className="flex items-center bg-card border border-default rounded-lg p-0.5 shadow-2xs">
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.item, item.quantity - 1)}
                              className="w-5 h-5 sm:w-6 sm:h-6 rounded-md hover:bg-hover text-main font-bold flex items-center justify-center text-xs transition cursor-pointer"
                            >
                              -
                            </button>
                            <span className="w-6 text-center font-bold text-main text-xs font-mono">{item.quantity}</span>
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.item, item.quantity + 1)}
                              className="w-5 h-5 sm:w-6 sm:h-6 rounded-md hover:bg-hover text-main font-bold flex items-center justify-center text-xs transition cursor-pointer"
                            >
                              +
                            </button>
                          </div>

                          <span className="text-[11px] text-secondary font-mono">
                            @ {Number(item.price).toLocaleString()}
                          </span>
                        </div>

                        {/* Line Item Total */}
                        <div className="font-bold text-main text-sm text-right font-mono tabular-nums shrink-0">
                          Rs. {Number(item.total).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Discount */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs sm:text-sm font-semibold text-main">Discount (Rs.)</label>
                  {isUrdu && <span className="text-xs font-urdu text-secondary">رعایت (روپے)</span>}
                </div>
                <input
                  type="number"
                  dir="ltr"
                  value={activeTab?.discount === 0 ? '' : (activeTab?.discount ?? '')}
                  onChange={(e) => updateTabData({ discount: parseFloat(e.target.value) || 0 })}
                  min="0"
                  step="0.01"
                  className="w-full px-3.5 py-2 border border-default rounded-xl bg-input text-main placeholder-muted focus:ring-2 focus:ring-violet-500 focus:border-violet-500 font-mono text-left shadow-xs transition"
                  placeholder="0.00"
                />
              </div>

              {/* Apply Customer Credit */}
              {activeTab?.customer && getAvailableCredit() > 0 && (
                <div className="mb-4">
                  <label className="flex items-center justify-between cursor-pointer p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={Boolean(activeTab?.applyCreditEnabled)}
                        onChange={(e) => updateTabData({ applyCreditEnabled: e.target.checked })}
                        className="w-4 h-4 text-emerald-600 border-default rounded focus:ring-emerald-500"
                      />
                      <span className="text-xs sm:text-sm font-semibold text-emerald-800 dark:text-emerald-300">
                        Apply Customer Credit (Rs. {(Number(getAvailableCredit()) || 0).toFixed(2)})
                      </span>
                    </div>
                    {isUrdu && <span className="text-xs font-urdu text-emerald-700 dark:text-emerald-400">کریڈٹ استعمال کریں</span>}
                  </label>
                  {Boolean(activeTab?.applyCreditEnabled) && (
                    <div className="mt-2 p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-xs text-emerald-700 dark:text-emerald-300">
                      {isUrdu 
                        ? `Rs. ${(Number(getCreditApplied()) || 0).toFixed(2)} will be deducted from customer credit (کریڈٹ کٹوتی ہوگی)`
                        : `Rs. ${(Number(getCreditApplied()) || 0).toFixed(2)} will be applied from customer credit`
                      }
                    </div>
                  )}
                </div>
              )}

              {/* Totals */}
              <div className="border-t border-default pt-3.5 mb-4 space-y-2">
                <div className="flex items-center justify-between text-xs sm:text-sm">
                  <div className="flex items-center gap-1.5">
                    <span className="text-secondary">Subtotal:</span>
                    {isUrdu && <span className="text-xs font-urdu text-muted">(سب ٹوٹل)</span>}
                  </div>
                  <span className="font-semibold text-main tabular-nums">Rs. {(Number(subtotal) || 0).toFixed(2)}</span>
                </div>

                <div className="flex items-center justify-between text-xs sm:text-sm">
                  <div className="flex items-center gap-1.5">
                    <span className="text-secondary">Discount:</span>
                    {isUrdu && <span className="text-xs font-urdu text-muted">(رعایت)</span>}
                  </div>
                  <span className="font-semibold text-main tabular-nums">-Rs. {(Number(activeTab?.discount) || 0).toFixed(2)}</span>
                </div>

                {/* Previous Due Handling */}
                {activeTab?.customer && (Number(activeTab.customer?.dues) || 0) > 0 && (
                  <div className="space-y-2 pt-1 border-t border-dashed border-default">
                    {(Number(activeTab?.previousDueApplied) || 0) > 0 ? (
                      <div className="flex items-center justify-between text-xs sm:text-sm">
                        <div className="flex items-center gap-1.5">
                          <span className="text-amber-600 font-medium">Previous Due Added:</span>
                          {isUrdu && <span className="text-xs font-urdu text-amber-500">(سابقہ ادھار شامل)</span>}
                        </div>
                        <span className="font-bold text-amber-600 tabular-nums">+Rs. {(Number(activeTab.previousDueApplied) || 0).toFixed(2)}</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between text-xs sm:text-sm">
                        <div className="flex items-center gap-1.5">
                          <span className="text-secondary">Outstanding Previous Due:</span>
                          {isUrdu && <span className="text-xs font-urdu text-muted">(سابقہ بقایا)</span>}
                        </div>
                        <span className="font-semibold text-main tabular-nums">Rs. {(Number(activeTab.customer.dues) || 0).toFixed(2)}</span>
                      </div>
                    )}

                    {(Number(activeTab?.previousDueApplied) || 0) > 0 ? (
                      <button
                        onClick={() => updateTabData({ previousDueApplied: 0 })}
                        className="w-full px-3 py-1.5 text-xs bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 rounded-lg font-medium transition"
                      >
                        {isUrdu ? 'Remove Previous Due (سابقہ ادھار ختم کریں)' : 'Remove Previous Due'}
                      </button>
                    ) : (
                      <button
                        onClick={() => updateTabData({ previousDueApplied: Math.max(0, activeTab?.customer?.dues || 0) })}
                        className="w-full px-3 py-1.5 text-xs bg-violet-500/10 hover:bg-violet-500/20 text-violet-700 dark:text-violet-300 rounded-lg font-semibold transition"
                      >
                        {isUrdu ? '+ Add Previous Due (+ سابقہ ادھار بل میں شامل کریں)' : '+ Add Previous Due to Bill'}
                      </button>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-between text-base font-bold border-t border-default pt-2.5">
                  <div className="flex items-center gap-1.5">
                    <span className="text-main">Total Amount:</span>
                    {isUrdu && <span className="text-xs font-urdu text-secondary font-normal">(کل رقم)</span>}
                  </div>
                  <span className="text-violet-600 dark:text-violet-400 tabular-nums">
                    Rs. {(Number(subtotal) - (Number(activeTab?.discount) || 0) + (parseFloat(activeTab?.previousDueApplied) || 0)).toFixed(2)}
                  </span>
                </div>

                {Boolean(activeTab?.applyCreditEnabled) && getCreditApplied() > 0 && (
                  <div className="flex items-center justify-between text-xs sm:text-sm text-emerald-600">
                    <div className="flex items-center gap-1.5">
                      <span>Credit Applied:</span>
                      {isUrdu && <span className="font-urdu">(کریڈٹ کٹوتی)</span>}
                    </div>
                    <span className="font-bold tabular-nums">-Rs. {(Number(getCreditApplied()) || 0).toFixed(2)}</span>
                  </div>
                )}

                {Boolean(activeTab?.applyCreditEnabled) && getCreditApplied() > 0 && (
                  <div className="flex items-center justify-between text-base font-bold text-violet-600 dark:text-violet-400 border-t border-default pt-2">
                    <div className="flex items-center gap-1.5">
                      <span>Amount to Pay:</span>
                      {isUrdu && <span className="text-xs font-urdu text-secondary font-normal">(قابل ادائیگی)</span>}
                    </div>
                    <span className="tabular-nums">Rs. {(Number(total) || 0).toFixed(2)}</span>
                  </div>
                )}
              </div>

              {/* Payment Method */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs sm:text-sm font-semibold text-main">Payment Method</label>
                  {isUrdu && <span className="text-xs font-urdu text-secondary">ادائیگی کا طریقہ</span>}
                </div>
                <select
                  value={activeTab?.paymentMethod || 'cash'}
                  onChange={(e) => updateTabData({ paymentMethod: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-default rounded-xl bg-input text-main focus:ring-2 focus:ring-violet-500 focus:border-violet-500 text-left transition shadow-xs"
                >
                  <option value="cash">{isUrdu ? 'Cash / نقد' : 'Cash'}</option>
                  <option value="upi">{isUrdu ? 'Online / UPI / ڈیجیٹل' : 'Online / UPI'}</option>
                  <option value="card">{isUrdu ? 'Card / کارڈ' : 'Card'}</option>
                  <option value="bank_transfer">{isUrdu ? 'Bank Transfer / بینک ٹرانسفر' : 'Bank Transfer'}</option>
                  {activeTab?.customer && <option value="due">{isUrdu ? 'Credit / Due (ادھار کھاتہ)' : 'Credit / Due (Udhaar)'}</option>}
                </select>
              </div>

              {/* Bank Account Selection */}
              {activeTab?.paymentMethod === 'bank_transfer' && (
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs sm:text-sm font-semibold text-main">Select Bank Account</label>
                    {isUrdu && <span className="text-xs font-urdu text-secondary">بینک کھاتہ منتخب کریں</span>}
                  </div>
                  <select
                    value={activeTab?.bankAccount || ''}
                    onChange={(e) => updateTabData({ bankAccount: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-default rounded-xl bg-input text-main focus:ring-2 focus:ring-violet-500 focus:border-violet-500 text-left transition shadow-xs"
                    required
                  >
                    <option value="">{isUrdu ? 'Choose Account (کھاتہ منتخب کریں)' : 'Choose Account'}</option>
                    {accounts.map(account => (
                      <option key={account._id} value={account._id}>
                        {account.bankName} - {account.accountType} (Rs. {account.currentBalance})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Paid Amount / Cash Tendered */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs sm:text-sm font-semibold text-main">Amount Paid / Received (Rs.)</label>
                  {isUrdu && <span className="text-xs font-urdu text-secondary">وصول شدہ رقم (روپے)</span>}
                </div>

                <input
                  type="number"
                  dir="ltr"
                  value={activeTab?.paidAmount ?? ''}
                  onChange={(e) => updateTabData({ paidAmount: e.target.value })}
                  min="0"
                  step="0.01"
                  className="w-full px-3.5 py-2.5 border border-default rounded-xl bg-input text-main placeholder-muted focus:ring-2 focus:ring-violet-500 focus:border-violet-500 font-mono text-left transition shadow-xs font-bold text-base"
                  placeholder="e.g. 25000"
                />
              </div>

              {/* Balance / Change Banner */}
              {activeTab?.paidAmount !== '' && activeTab?.paidAmount !== undefined && activeTab?.paidAmount !== null && (
                <div className={`mb-3 p-3.5 rounded-xl border transition-all ${
                  balance >= 0
                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-800 dark:text-emerald-300'
                    : 'bg-rose-500/10 border-rose-500/20 text-rose-800 dark:text-rose-300'
                }`}>
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold uppercase tracking-wider block">
                          {balance >= 0 ? 'Change to Return' : 'Balance Due / Udhaar'}
                        </span>
                        {isUrdu && <span className="text-xs font-urdu font-normal">({balance >= 0 ? 'بقایا واپسی' : 'باقی ادھار'})</span>}
                      </div>
                      {balance > 0 && (
                        <span className="text-[11px] text-emerald-600/80 dark:text-emerald-400/80">
                          {isUrdu ? 'گاہک کو واپس کریں' : 'Will be returned to customer'}
                        </span>
                      )}
                      {balance < 0 && (
                        <span className="text-[11px] text-rose-600/80 dark:text-rose-400/80">
                          {isUrdu ? 'کھاتے میں ادھار درج ہوگا' : 'Will be added to customer dues'}
                        </span>
                      )}
                    </div>
                    <span className={`text-xl font-bold font-mono tabular-nums ${
                      balance >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                    }`}>
                      Rs. {Math.abs(Number(balance) || 0).toFixed(2)}
                    </span>
                  </div>
                </div>
              )}

              {/* Walk-in Customer Warning */}
              {!activeTab?.customer && paid < total && (
                <div className="mb-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                  <p className="text-xs text-amber-700 dark:text-amber-300 font-medium">
                    {isUrdu 
                      ? 'Walk-in customers must pay full amount. Please select or add customer for credit. (عام خریدار کے لیے مکمل رقم ضروری ہے۔ ادھار کے لیے گاہک منتخب کریں۔)' 
                      : 'Walk-in customers must pay full amount. Please add customer details to allow credit.'
                    }
                  </p>
                </div>
              )}

              {/* Checkout Button */}
              <button
                onClick={handleCheckout}
                disabled={(activeTab?.cart || []).length === 0 || isLoading}
                className="w-full py-3.5 bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition shadow-lg hover:shadow-violet-500/25 active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
              >
                {isLoading ? (
                  <span>{isUrdu ? 'Processing Sale... (بل تیار ہو رہا ہے...)' : 'Processing Sale...'}</span>
                ) : (
                  <span>{isUrdu ? 'Complete Sale / بل محفوظ کریں' : 'Complete Sale & Bill'}</span>
                )}
              </button>

              {/* Additional Actions */}
              <div className="grid grid-cols-3 gap-2 mt-3">
                <button
                  onClick={holdCurrentOrder}
                  disabled={(activeTab?.cart || []).length === 0}
                  className="py-2 px-2 border border-amber-500/40 hover:bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-xl disabled:opacity-40 text-xs font-semibold transition"
                >
                  {isUrdu ? 'Hold / ہولڈ' : 'Hold'}
                </button>
                <button
                  onClick={() => setShowSplitPayment(true)}
                  disabled={(activeTab?.cart || []).length === 0}
                  className="py-2 px-2 border border-violet-500/40 hover:bg-violet-500/10 text-violet-600 dark:text-violet-400 rounded-xl disabled:opacity-40 text-xs font-semibold transition"
                >
                  {isUrdu ? 'Split / تقسیم' : 'Split Pay'}
                </button>
                <button
                  onClick={printReceipt}
                  disabled={(activeTab?.cart || []).length === 0}
                  className="py-2 px-2 border border-default hover:bg-hover text-main rounded-xl disabled:opacity-40 text-xs font-semibold transition"
                >
                  {isUrdu ? 'Print / پرنٹ' : 'Print'}
                </button>
              </div>

              {/* Clear Cart */}
              {(activeTab?.cart || []).length > 0 && (
                <button
                  onClick={() => updateTabData({ cart: [] })}
                  className="w-full mt-2.5 py-2 border border-default hover:bg-hover text-secondary hover:text-rose-500 rounded-xl text-xs font-medium transition"
                >
                  {isUrdu ? 'Clear Cart / بل خالی کریں' : 'Clear Cart'}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Add Customer Modal */}
        {showAddCustomer && (
          <div className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" dir="ltr">
            <div className="bg-card rounded-2xl p-6 max-w-md w-full border border-default shadow-2xl text-left">
              <h3 className="text-lg font-bold text-main mb-4 flex items-center gap-2">
                <span>Add New Customer</span>
                {isUrdu && <span className="text-sm font-urdu text-secondary font-normal">(نیا گاہک بنائیں)</span>}
              </h3>
              <form onSubmit={handleAddCustomer} className="space-y-4 text-left">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-sm font-semibold text-main">Customer Name *</label>
                    {isUrdu && <span className="text-xs font-urdu text-secondary">گاہک کا نام</span>}
                  </div>
                  <input
                    type="text"
                    value={newCustomer.name}
                    onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                    required
                    placeholder={isUrdu ? "Customer full name (گاہک کا پورا نام)" : "Customer full name"}
                    className="w-full px-3.5 py-2.5 border border-default rounded-xl bg-input text-main placeholder-muted focus:ring-2 focus:ring-violet-500 focus:border-violet-500 text-left transition shadow-xs"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-sm font-semibold text-main">Phone Number *</label>
                    {isUrdu && <span className="text-xs font-urdu text-secondary">فون نمبر</span>}
                  </div>
                  <input
                    type="tel"
                    dir="ltr"
                    value={newCustomer.phone}
                    onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                    required
                    placeholder="03001234567"
                    className="w-full px-3.5 py-2.5 border border-default rounded-xl bg-input text-main placeholder-muted focus:ring-2 focus:ring-violet-500 focus:border-violet-500 font-mono text-left transition shadow-xs"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-sm font-semibold text-main">Email (Optional)</label>
                    {isUrdu && <span className="text-xs font-urdu text-secondary">ای میل (اختیاری)</span>}
                  </div>
                  <input
                    type="email"
                    dir="ltr"
                    value={newCustomer.email}
                    onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
                    placeholder="customer@example.com"
                    className="w-full px-3.5 py-2.5 border border-default rounded-xl bg-input text-main placeholder-muted focus:ring-2 focus:ring-violet-500 focus:border-violet-500 font-mono text-left transition shadow-xs"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-sm font-semibold text-main">Address (Optional)</label>
                    {isUrdu && <span className="text-xs font-urdu text-secondary">پتہ (اختیاری)</span>}
                  </div>
                  <textarea
                    value={newCustomer.address}
                    onChange={(e) => setNewCustomer({ ...newCustomer, address: e.target.value })}
                    rows={2}
                    placeholder={isUrdu ? "Shop / street address, city... (دکان یا گھر کا پتہ)" : "Shop / street address, city..."}
                    className="w-full px-3.5 py-2.5 border border-default rounded-xl bg-input text-main placeholder-muted focus:ring-2 focus:ring-violet-500 focus:border-violet-500 text-left transition shadow-xs resize-none"
                  />
                </div>
                <div className="flex space-x-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddCustomer(false);
                      setNewCustomer({ name: '', phone: '', email: '', address: '' });
                    }}
                    className="flex-1 px-4 py-2.5 border border-default text-secondary hover:text-main rounded-xl hover:bg-hover font-medium transition"
                  >
                    {isUrdu ? 'Cancel / منسوخ' : 'Cancel'}
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-semibold transition shadow-xs"
                  >
                    {isUrdu ? 'Save / محفوظ کریں' : 'Add Customer'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Customer Select Modal */}
        {showCustomerSelect && (
          <div className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" dir="ltr">
            <div className="bg-card rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto border border-default shadow-2xl text-left">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-main flex items-center gap-2">
                  <span>Select Customer</span>
                  {isUrdu && <span className="text-sm font-urdu text-secondary font-normal">(گاہک منتخب کریں)</span>}
                </h3>
                <button
                  onClick={() => {
                    setShowCustomerSelect(false);
                    setCustomerSearchTerm('');
                  }}
                  className="text-muted hover:text-main p-1 rounded-lg hover:bg-hover transition"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Customer Search */}
              <div className="mb-4">
                <input
                  type="text"
                  placeholder={isUrdu ? "Search by customer name or phone... (گاہک کے نام یا فون سے تلاش کریں)" : "Search by customer name or phone..."}
                  value={customerSearchTerm}
                  onChange={(e) => setCustomerSearchTerm(e.target.value)}
                  className="w-full px-4 py-2.5 border border-default rounded-xl bg-input text-main placeholder-muted focus:ring-2 focus:ring-violet-500 focus:border-violet-500 text-left transition shadow-xs"
                  autoFocus
                />
              </div>

              <div className="space-y-2">
                {filteredCustomers.length === 0 ? (
                  <p className="text-center text-secondary py-8 font-medium">
                    {isUrdu ? 'No customers found (کوئی گاہک نہیں ملا)' : 'No customers found'}
                  </p>
                ) : (
                  filteredCustomers.map((customer) => (
                    <button
                      key={customer._id}
                      onClick={() => selectCustomer(customer)}
                      className="w-full p-4 border border-default rounded-xl hover:border-violet-500 hover:bg-violet-500/5 text-left transition cursor-pointer"
                    >
                      <div className="font-bold text-main">{customer.name}</div>
                      <div className="text-sm text-secondary">{customer.phone}</div>
                      {customer.dues > 0 && (
                        <div className="text-xs font-semibold text-rose-600 dark:text-rose-400 mt-1">
                          {isUrdu ? `Outstanding Dues / سابقہ بقایا: Rs. ${customer.dues.toFixed(2)}` : `Outstanding Dues: Rs. ${customer.dues.toFixed(2)}`}
                        </div>
                      )}
                    </button>
                  ))
                )}
              </div>
              <button
                onClick={() => {
                  setShowCustomerSelect(false);
                  setCustomerSearchTerm('');
                }}
                className="w-full mt-4 px-4 py-2.5 border border-default text-secondary hover:text-main rounded-xl hover:bg-hover font-medium transition"
              >
                {isUrdu ? 'Cancel / منسوخ کریں' : 'Cancel'}
              </button>
            </div>
          </div>
        )}

        {/* Hold Orders Modal */}
        {showHoldOrders && (
          <div className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" dir="ltr">
            <div className="bg-card rounded-2xl p-6 max-w-4xl w-full max-h-[80vh] overflow-y-auto border border-default shadow-2xl text-left">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-main flex items-center gap-2">
                  <span>Parked Orders ({holdOrders.length})</span>
                  {isUrdu && <span className="text-sm font-urdu text-secondary font-normal">(محفوظ شدہ بل)</span>}
                </h3>
                <button
                  onClick={() => setShowHoldOrders(false)}
                  className="text-muted hover:text-main p-1 rounded-lg hover:bg-hover transition"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {holdOrders.length === 0 ? (
                <p className="text-center text-secondary py-12 font-medium">
                  {isUrdu ? 'No parked orders available (کوئی ہولڈ شدہ بل نہیں ہے)' : 'No parked orders available'}
                </p>
              ) : (
                <div className="space-y-3">
                  {holdOrders.map((order) => (
                    <div key={order.id} className="border border-default rounded-xl p-4 hover:border-violet-500 transition text-left">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <div className="font-bold text-main">{order.customerName}</div>
                          <div className="text-xs text-secondary">
                            {new Date(order.timestamp).toLocaleString()}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-secondary">{order.cart.length} items</div>
                          <div className="font-bold text-violet-600 dark:text-violet-400">
                            Rs. {(order.cart.reduce((sum, item) => sum + item.total, 0) - order.discount).toFixed(2)}
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-2 mt-3">
                        <button
                          onClick={() => retrieveHoldOrder(order)}
                          className="flex-1 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-semibold transition text-xs shadow-xs"
                        >
                          {isUrdu ? 'Retrieve Bill / بل واپس لائیں' : 'Retrieve Order'}
                        </button>
                        <button
                          onClick={() => deleteHoldOrder(order.id)}
                          className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-semibold transition text-xs shadow-xs"
                        >
                          {isUrdu ? 'Delete / حذف کریں' : 'Delete'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <button
                onClick={() => setShowHoldOrders(false)}
                className="w-full mt-4 px-4 py-2.5 border border-default text-secondary hover:text-main rounded-xl hover:bg-hover font-medium transition"
              >
                {isUrdu ? 'Close / بند کریں' : 'Close'}
              </button>
            </div>
          </div>
        )}

        {/* Split Payment Modal */}
        {showSplitPayment && (
          <div className="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4" dir="ltr">
            <div className="bg-card rounded-2xl p-5 sm:p-6 max-w-lg w-full border border-default shadow-2xl space-y-4 text-left">
              <div className="flex items-center justify-between pb-2 border-b border-default">
                <h3 className="text-base sm:text-lg font-bold text-main flex items-center gap-2">
                  <span>Split Payment</span>
                  {isUrdu && <span className="text-sm font-urdu text-secondary font-normal">(ادائیگی تقسیم کریں)</span>}
                </h3>
                <button
                  onClick={() => {
                    setShowSplitPayment(false);
                    setSplitPayments([{ method: 'cash', amount: '' }]);
                  }}
                  className="p-1 rounded-lg text-muted hover:text-main transition"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="p-3 bg-violet-500/10 border border-violet-500/20 rounded-xl">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-secondary font-medium">{isUrdu ? 'Total Amount (کل رقم)' : 'Total Amount'}</span>
                  <span className="font-bold text-violet-600 dark:text-violet-400 font-mono text-base tabular-nums">Rs. {total.toFixed(2)}</span>
                </div>
              </div>

              <div className="space-y-2.5 max-h-60 overflow-y-auto pe-1">
                {splitPayments.map((payment, index) => (
                  <div key={index} className="flex items-center gap-2 w-full">
                    <select
                      value={payment.method}
                      onChange={(e) => updateSplitPayment(index, 'method', e.target.value)}
                      className="w-[125px] sm:w-[150px] shrink-0 px-3 py-2 border border-default rounded-xl bg-input text-main text-xs sm:text-sm focus:ring-2 focus:ring-violet-500 font-medium"
                    >
                      <option value="cash">{isUrdu ? 'Cash (نقد)' : 'Cash'}</option>
                      <option value="upi">{isUrdu ? 'Online / UPI' : 'Online / UPI'}</option>
                      <option value="card">{isUrdu ? 'Card (کارڈ)' : 'Card'}</option>
                      <option value="bank_transfer">{isUrdu ? 'Bank Transfer' : 'Bank Transfer'}</option>
                    </select>
                    <div className="flex-1 min-w-0">
                      <input
                        type="number"
                        dir="ltr"
                        value={payment.amount}
                        onChange={(e) => updateSplitPayment(index, 'amount', e.target.value)}
                        placeholder="0.00"
                        className="w-full px-3 py-2 border border-default rounded-xl bg-input text-main placeholder-muted focus:ring-2 focus:ring-violet-500 font-mono text-left text-xs sm:text-sm shadow-xs"
                      />
                    </div>
                    {splitPayments.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeSplitPayment(index)}
                        className="shrink-0 p-2 text-rose-600 hover:text-rose-700 hover:bg-rose-500/10 rounded-lg transition"
                        title="Remove"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={addSplitPayment}
                className="w-full py-2 border border-dashed border-violet-500/40 text-violet-600 dark:text-violet-400 hover:bg-violet-500/10 rounded-xl text-xs sm:text-sm font-semibold transition cursor-pointer flex items-center justify-center gap-1.5"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span>{isUrdu ? '+ Add Another Method (+ دوسرا طریقہ شامل کریں)' : '+ Add Another Method'}</span>
              </button>

              <div className="p-3.5 bg-hover rounded-xl border border-default space-y-2">
                <div className="flex justify-between items-center text-xs sm:text-sm">
                  <span className="text-secondary font-medium">{isUrdu ? 'Total Paid (کل وصولی):' : 'Total Paid:'}</span>
                  <span className={`font-bold font-mono tabular-nums ${calculateSplitTotal() >= (total - 0.01) ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                    Rs. {calculateSplitTotal().toFixed(2)}
                  </span>
                </div>
                {calculateSplitTotal() > total ? (
                  <div className="flex justify-between items-center text-xs sm:text-sm pt-2 border-t border-default">
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{isUrdu ? 'Change to Return (بقایا واپسی):' : 'Change to Return:'}</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono tabular-nums text-sm sm:text-base">
                      Rs. {(calculateSplitTotal() - total).toFixed(2)}
                    </span>
                  </div>
                ) : calculateSplitTotal() >= (total - 0.01) ? (
                  <div className="flex justify-between items-center text-xs sm:text-sm pt-2 border-t border-default">
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Balance / بقایا:</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono tabular-nums">
                      Rs. 0.00
                    </span>
                  </div>
                ) : (
                  <div className="flex justify-between items-center text-xs sm:text-sm pt-2 border-t border-default">
                    <span className="text-rose-600 dark:text-rose-400 font-semibold">{isUrdu ? 'Remaining Due (باقی رقم):' : 'Remaining Due:'}</span>
                    <span className="font-bold text-rose-600 dark:text-rose-400 font-mono tabular-nums">
                      Rs. {(total - calculateSplitTotal()).toFixed(2)}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setShowSplitPayment(false);
                    setSplitPayments([{ method: 'cash', amount: '' }]);
                  }}
                  className="flex-1 px-4 py-2.5 border border-default text-secondary hover:text-main hover:bg-hover rounded-xl font-medium transition text-xs sm:text-sm cursor-pointer"
                >
                  {isUrdu ? 'Cancel / منسوخ' : 'Cancel'}
                </button>
                <button
                  type="button"
                  onClick={applySplitPayment}
                  disabled={activeTab.customer ? calculateSplitTotal() <= 0 : calculateSplitTotal() < (total - 0.01)}
                  className="flex-1 px-4 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-semibold shadow-xs disabled:opacity-40 transition text-xs sm:text-sm cursor-pointer"
                >
                  {isUrdu ? 'Apply / لاگو کریں' : 'Apply Payment'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Unpaid Invoice Confirmation Modal */}
        {showUnpaidConfirm && (
          <div className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" dir="ltr">
            <div className="bg-card rounded-2xl p-6 max-w-md w-full border border-default shadow-2xl text-left">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-2xl border border-amber-500/20 flex items-center justify-center mr-4">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-main">Unpaid Invoice Confirmation</h3>
                  {isUrdu && <p className="text-xs font-urdu text-secondary">غیر ادا شدہ بل کی تصدیق</p>}
                </div>
              </div>

              <div className="mb-4">
                <p className="text-secondary text-sm mb-3">
                  {isUrdu 
                    ? 'Customer is paying less than total amount. Remaining balance will be added to their credit / udhaar account.' 
                    : 'Customer is paying less than total amount. Remaining balance will be added to their credit / udhaar account.'}
                </p>
                <div className="bg-hover p-4 rounded-xl border border-default space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-secondary">{isUrdu ? 'Customer (گاہک):' : 'Customer:'}</span>
                    <span className="font-semibold text-main">{activeTab?.customer?.name || 'Walk-in'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-secondary">{isUrdu ? 'Total Amount (کل رقم):' : 'Total Amount:'}</span>
                    <span className="font-bold text-main">Rs. {(Number(total) || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-secondary">{isUrdu ? 'Amount Paid (وصول شدہ):' : 'Amount Paid:'}</span>
                    <span className="text-main font-semibold">Rs. {(Number(paid) || 0).toFixed(2)}</span>
                  </div>
                  <div className="border-t border-default pt-2 flex justify-between">
                    <span className="font-bold text-rose-600 dark:text-rose-400">{isUrdu ? 'Balance Due / Udhaar (باقی ادھار):' : 'Balance Due / Udhaar:'}</span>
                    <span className="font-bold text-rose-600 dark:text-rose-400 text-base">Rs. {(Number(total) - Number(paid)).toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => setShowUnpaidConfirm(false)}
                  className="flex-1 px-4 py-2.5 border border-default text-secondary hover:text-main rounded-xl hover:bg-hover font-medium transition"
                >
                  {isUrdu ? 'Cancel / منسوخ' : 'Cancel'}
                </button>
                <button
                  onClick={proceedWithCheckout}
                  className="flex-1 px-4 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-semibold shadow-xs transition"
                >
                  {isUrdu ? 'Confirm & Save / تصدیق کریں' : 'Confirm & Create'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Overpayment Confirmation Modal */}
        {showOverpaymentConfirm && (
          <div className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" dir="ltr">
            <div className="bg-card rounded-2xl p-6 max-w-md w-full border border-default shadow-2xl text-left">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-2xl border border-blue-500/20 flex items-center justify-center mr-4">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-main">Overpayment Details</h3>
                  {isUrdu && <p className="text-xs font-urdu text-secondary">اضافی ادائیگی کی تفصیل</p>}
                </div>
              </div>

              <div className="mb-4">
                <div className="bg-hover p-4 rounded-xl border border-default space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-secondary">{isUrdu ? 'Customer (گاہک):' : 'Customer:'}</span>
                    <span className="font-semibold text-main">{activeTab?.customer?.name || 'Walk-in'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-secondary">{isUrdu ? 'Total Amount (کل رقم):' : 'Total Amount:'}</span>
                    <span className="font-bold text-main">Rs. {(Number(total) || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-secondary">{isUrdu ? 'Amount Paid (وصول شدہ):' : 'Amount Paid:'}</span>
                    <span className="text-main font-semibold">Rs. {(Number(paid) || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-secondary">{isUrdu ? 'Change Required (بقایا رقم):' : 'Change Required:'}</span>
                    <span className="font-bold text-violet-600 dark:text-violet-400">Rs. {(Number(paid) - Number(total)).toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => setShowOverpaymentConfirm(false)}
                  className="flex-1 px-4 py-2.5 border border-default text-secondary hover:text-main rounded-xl hover:bg-hover font-medium transition"
                >
                  {isUrdu ? 'Cancel / منسوخ' : 'Cancel'}
                </button>
                <button
                  onClick={() => {
                    setShowOverpaymentConfirm(false);
                    proceedWithCheckout();
                  }}
                  className="flex-1 px-4 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-semibold shadow-xs transition"
                >
                  {isUrdu ? 'Proceed / جاری رکھیں' : 'Proceed'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Post-Sale Completion & Change Denomination Modal */}
        {completedSale && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in" dir="ltr">
            <div className="bg-card rounded-3xl p-5 sm:p-6 max-w-xl w-full border border-default shadow-2xl space-y-5 max-h-[92vh] overflow-y-auto text-left">
              {/* Header */}
              <div className="text-center space-y-2">
                <div className="w-14 h-14 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto ring-8 ring-emerald-500/5">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-main">
                  {isUrdu ? 'بل کامیابی سے مکمل ہو گیا!' : 'Sale Completed Successfully!'}
                </h3>
                <div className="flex items-center justify-center gap-2 text-xs text-secondary font-mono">
                  <span>{isUrdu ? 'انوائس نمبر:' : 'Invoice #:'}</span>
                  <span className="font-bold text-main px-2 py-0.5 bg-hover rounded-md border border-default">
                    {completedSale?.invoiceNumber || completedSale?.id}
                  </span>
                  {completedSale?.customerName && (
                    <span className="text-secondary">({completedSale.customerName})</span>
                  )}
                </div>
              </div>

              {/* Financial Quick Summary */}
              <div className="grid grid-cols-3 gap-2 p-3.5 bg-muted/40 rounded-2xl border border-default text-center">
                <div className="p-1">
                  <span className="text-[11px] text-secondary block">{isUrdu ? 'کل بل' : 'Bill Total'}</span>
                  <span className="font-mono font-bold text-sm sm:text-base text-main">
                    Rs. {Number(completedSale?.totalAmount || 0).toLocaleString()}
                  </span>
                </div>
                <div className="border-x border-default/50 p-1">
                  <span className="text-[11px] text-secondary block">{isUrdu ? 'وصول شدہ' : 'Received'}</span>
                  <span className="font-mono font-bold text-sm sm:text-base text-emerald-600 dark:text-emerald-400">
                    Rs. {Number(completedSale?.paidAmount || 0).toLocaleString()}
                  </span>
                </div>
                <div className="p-1">
                  <span className="text-[11px] text-secondary block">{isUrdu ? 'بقایا واپسی' : 'Change Due'}</span>
                  <span className="font-mono font-bold text-sm sm:text-base text-violet-600 dark:text-violet-400">
                    Rs. {Number(completedSale?.changeReturned || 0).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Banknote Denomination Breakdown Guide */}
              {(Number(completedSale?.changeReturned) || 0) > 0 ? (
                <div className="pt-1">
                  <DenominationBreakdown
                    amount={Number(completedSale?.changeReturned) || 0}
                    label="Hand Over These Notes to Customer"
                    urduLabel="گاہک کو یہ اصل نوٹ واپس ادا کریں"
                  />
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center space-y-1">
                  <p className="text-xs font-bold text-emerald-700 dark:text-emerald-300">
                    {isUrdu ? 'مکمل رقم وصول ہو چکی ہے۔ کوئی بقایا نوٹ واپس نہیں کرنا۔' : 'Exact amount paid. No return change notes required.'}
                  </p>
                </div>
              )}

              {/* Actions Footer */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    const invoiceId = completedSale?.id;
                    setCompletedSale(null);
                    if (invoiceId) navigate(`/pos/invoice/${invoiceId}`);
                  }}
                  className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-default bg-card hover:bg-hover text-main text-xs font-bold transition shadow-xs cursor-pointer"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  <span>{isUrdu ? 'بل دیکھیں' : 'View Invoice'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => printSaleReceipt(completedSale)}
                  className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold transition shadow-xs cursor-pointer"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                  </svg>
                  <span>{isUrdu ? 'رسید پرنٹ کریں' : 'Print Slip'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setCompletedSale(null)}
                  className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-xs cursor-pointer"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span>{isUrdu ? 'نیا بل (اگلا گاہک)' : 'New Sale'}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* POS Return by Invoice Modal */}
        <POSReturnModal
          isOpen={showReturnModal}
          onClose={() => setShowReturnModal(false)}
        />

      </div>
    </Layout>
  );
};

export default POS;