import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { getAllItems } from '../redux/slices/inventorySlice';
import { getAllCustomers, addCustomer, reset as resetCustomer } from '../redux/slices/customerSlice';
import { createInvoice, reset, clearInvoice } from '../redux/slices/posSlice';
import { getAccounts } from '../redux/slices/cashbankSlice';
import Layout from '../components/Layout';

const POS = () => {
  const { t } = useTranslation(['pos', 'common']);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { items = [] } = useSelector((state) => state.inventory);
  const { customers = [] } = useSelector((state) => state.customers);
  const { accounts = [] } = useSelector((state) => state.cashbank);
  const { invoice, isLoading, isSuccess, isError, message } = useSelector((state) => state.pos);

  // Tab system state - Load from localStorage on mount
  const [tabs, setTabs] = useState(() => {
    const savedTabs = localStorage.getItem('posTabs');
    return savedTabs ? JSON.parse(savedTabs) : [
      {
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
      }
    ];
  });
  const [activeTabId, setActiveTabId] = useState(() => {
    const savedActiveTab = localStorage.getItem('posActiveTab');
    return savedActiveTab ? parseInt(savedActiveTab) : 1;
  });

  // Helper function to get the next available tab number (fills gaps)
  const getNextTabNumber = (currentTabs) => {
    const usedNumbers = currentTabs.map(tab => {
      const match = tab.name.match(/^Tab (\d+)$/);
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
  const [draggedTabId, setDraggedTabId] = useState(null);
  const [splitPayments, setSplitPayments] = useState([
    { method: 'cash', amount: '' },
  ]);
  const [barcodeInput, setBarcodeInput] = useState('');
  const [showUnpaidConfirm, setShowUnpaidConfirm] = useState(false);
  const [showOverpaymentConfirm, setShowOverpaymentConfirm] = useState(false);
  const [showWalkinChangeConfirm, setShowWalkinChangeConfirm] = useState(false);

  // Hold orders state - Load from localStorage
  const [holdOrders, setHoldOrders] = useState(() => {
    const saved = localStorage.getItem('posHoldOrders');
    return saved ? JSON.parse(saved) : [];
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
    if (isSuccess && invoice) {
      // Remove completed tab and navigate
      const newTabs = tabs.filter(tab => tab.id !== activeTabId);

      if (newTabs.length === 0) {
        // If no tabs left, create a fresh tab
        const freshTab = {
          id: Date.now(),
          name: 'Tab 1',
          customer: null,
          cart: [],
          discount: 0,
          paymentMethod: 'cash',
          bankAccount: '',
          paidAmount: '',
          changeReturned: '',
          applyCreditEnabled: false,
          previousDueApplied: 0,
        };
        setTabs([freshTab]);
        setActiveTabId(freshTab.id);
      } else {
        setTabs(newTabs);
        setActiveTabId(newTabs[0].id);
      }

      // Refresh bank accounts to update balances
      dispatch(getAccounts());

      // Navigate to invoice detail
      navigate(`/pos/invoice/${invoice._id}`);
      dispatch(clearInvoice());
      dispatch(reset());
    }
  }, [isSuccess, invoice, navigate, dispatch, activeTabId, tabs]);

  // Save tabs to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('posTabs', JSON.stringify(tabs));
    localStorage.setItem('posActiveTab', activeTabId.toString());
  }, [tabs, activeTabId]);

  // Save hold orders to localStorage
  useEffect(() => {
    localStorage.setItem('posHoldOrders', JSON.stringify(holdOrders));
  }, [holdOrders]);

  const activeTab = tabs.find(tab => tab.id === activeTabId);

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
    const nextTabNum = getNextTabNumber(tabs);
    const newTabId = Date.now(); // Use timestamp for unique ID
    const newTab = {
      id: newTabId,
      name: `Tab ${nextTabNum}`,
      customer: null,
      cart: [],
      discount: 0,
      paymentMethod: 'cash',
      paidAmount: '',
      changeReturned: '',
      applyCreditEnabled: false,
      previousDueApplied: 0,
    };
    setTabs([...tabs, newTab]);
    setActiveTabId(newTabId);
  };

  const closeTab = (tabId) => {
    if (tabs.length === 1) return; // Don't close last tab

    const newTabs = tabs.filter(tab => tab.id !== tabId);
    setTabs(newTabs);

    if (activeTabId === tabId) {
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

    const draggedIndex = tabs.findIndex(tab => tab.id === draggedTabId);
    const targetIndex = tabs.findIndex(tab => tab.id === tabId);

    if (draggedIndex === targetIndex) return;

    const newTabs = [...tabs];
    const [draggedTab] = newTabs.splice(draggedIndex, 1);
    newTabs.splice(targetIndex, 0, draggedTab);
    setTabs(newTabs);
  };

  const handleDragEnd = () => {
    setDraggedTabId(null);
  };

  const updateTabData = (updates) => {
    setTabs(tabs.map(tab =>
      tab.id === activeTabId ? { ...tab, ...updates } : tab
    ));
  };

  // Cart management
  const addToCart = (item) => {
    const existingItem = activeTab.cart.find((cartItem) => cartItem.item === item._id);

    if (existingItem) {
      if (existingItem.quantity >= item.stockQty) {
        alert(`Only ${item.stockQty} units available in stock!`);
        return;
      }

      updateTabData({
        cart: activeTab.cart.map((cartItem) =>
          cartItem.item === item._id
            ? { ...cartItem, quantity: cartItem.quantity + 1, total: (cartItem.quantity + 1) * cartItem.price }
            : cartItem
        )
      });
    } else {
      if (item.stockQty === 0) {
        alert('This item is out of stock!');
        return;
      }

      updateTabData({
        cart: [...activeTab.cart, {
          item: item._id,
          name: item.name,
          quantity: 1,
          price: item.sellingPrice,
          total: item.sellingPrice,
          availableStock: item.stockQty,
        }]
      });
    }
  };

  const updateQuantity = (itemId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(itemId);
      return;
    }

    const cartItem = activeTab.cart.find((item) => item.item === itemId);
    if (cartItem && newQuantity > cartItem.availableStock) {
      alert(`Only ${cartItem.availableStock} units available!`);
      return;
    }

    updateTabData({
      cart: activeTab.cart.map((cartItem) =>
        cartItem.item === itemId
          ? { ...cartItem, quantity: newQuantity, total: newQuantity * cartItem.price }
          : cartItem
      )
    });
  };

  const removeFromCart = (itemId) => {
    updateTabData({
      cart: activeTab.cart.filter((cartItem) => cartItem.item !== itemId)
    });
  };

  const calculateSubtotal = () => {
    return activeTab.cart.reduce((sum, item) => sum + item.total, 0);
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const afterDiscount = subtotal - activeTab.discount;

    // Calculate credit to apply
    const availableCredit = getAvailableCredit();
    const creditToApply = activeTab.applyCreditEnabled ? Math.min(availableCredit, afterDiscount) : 0;

    const prevDue = parseFloat(activeTab.previousDueApplied) || 0;

    return afterDiscount + prevDue - creditToApply;
  };

  const getAvailableCredit = () => {
    if (!activeTab.customer || !activeTab.customer.dues) return 0;
    // Credit is negative dues
    return Math.abs(Math.min(0, activeTab.customer.dues));
  };

  const getCreditApplied = () => {
    if (!activeTab.applyCreditEnabled) return 0;
    const subtotal = calculateSubtotal();
    const afterDiscount = subtotal - activeTab.discount;
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
    if (activeTab.cart.length === 0) {
      alert('Cart is empty!');
      return;
    }

    const holdOrder = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      ...activeTab,
      customerName: activeTab.customer?.name || 'Walk-in',
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

    alert('Order parked successfully!');
  };

  const retrieveHoldOrder = (holdOrder) => {
    // Create new tab with hold order data - restore ALL properties
    const newTabId = Date.now(); // Use timestamp for unique ID
    const nextTabNum = getNextTabNumber(tabs);

    const newTab = {
      id: newTabId,
      name: `Tab ${nextTabNum}`,
      customer: holdOrder.customer,
      cart: holdOrder.cart || [],
      discount: holdOrder.discount || 0,
      paymentMethod: holdOrder.paymentMethod || 'cash',
      bankAccount: holdOrder.bankAccount || '',
      paidAmount: holdOrder.paidAmount || '',
      changeReturned: holdOrder.changeReturned || '',
      applyCreditEnabled: holdOrder.applyCreditEnabled || false,
      creditUsed: holdOrder.creditUsed || 0,
      availableCredit: holdOrder.availableCredit || 0,
      previousDueApplied: holdOrder.previousDueApplied || 0,
    };

    setTabs([...tabs, newTab]);
    setActiveTabId(newTabId);

    // Remove from hold orders
    setHoldOrders(holdOrders.filter(order => order.id !== holdOrder.id));
    setShowHoldOrders(false);

    // Show success message to user
    toast.success('Order retrieved successfully!');
  };

  const deleteHoldOrder = (orderId) => {
    if (confirm('Delete this parked order?')) {
      setHoldOrders(holdOrders.filter(order => order.id !== orderId));
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
    const total = calculateSplitTotal();
    // Convert string amounts to numbers and filter out zero/empty amounts
    const validSplitPayments = splitPayments
      .map(p => ({
        method: p.method,
        amount: parseFloat(p.amount) || 0
      }))
      .filter(p => p.amount > 0);

    updateTabData({
      paidAmount: total.toString(),
      paymentMethod: 'split',
      splitPaymentDetails: validSplitPayments
    });
    setShowSplitPayment(false);
  };

  // Print Receipt
  const printReceipt = () => {
    if (activeTab.cart.length === 0) {
      alert('Cart is empty!');
      return;
    }

    const printWindow = window.open('', '', 'width=300,height=600');
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
          ${activeTab.cart.map(item => `
            <tr>
              <td>${item.name}</td>
              <td class="right">${item.quantity} x Rs. ${item.price}</td>
            </tr>
            <tr>
              <td colspan="2" class="right">Rs. ${item.total.toFixed(2)}</td>
            </tr>
          `).join('')}
        </table>
        <div class="line"></div>
        <table>
          <tr>
            <td>${t('pos:subtotal')}</td>
            <td class="right">Rs. ${subtotal.toFixed(2)}</td>
          </tr>
          <tr>
            <td>${t('pos:discount')}</td>
            <td class="right">-Rs. ${activeTab.discount.toFixed(2)}</td>
          </tr>
          ${activeTab.previousDueApplied > 0 ? `
            <tr>
              <td>${t('pos:previousDueAdded')}</td>
              <td class="right">+Rs. ${(parseFloat(activeTab.previousDueApplied) || 0).toFixed(2)}</td>
            </tr>
          ` : ''}
          <tr class="bold">
            <td>${t('pos:total')}</td>
            <td class="right">Rs. ${total.toFixed(2)}</td>
          </tr>
          ${getCreditApplied() > 0 ? `
            <tr>
              <td>${t('pos:creditApplied')}</td>
              <td class="right">-Rs. ${getCreditApplied().toFixed(2)}</td>
            </tr>
          ` : ''}
          <tr>
            <td>${t('pos:amountPaidLabel')}</td>
            <td class="right">Rs. ${(parseFloat(activeTab.paidAmount) || 0).toFixed(2)}</td>
          </tr>
          ${balance > 0 ? `
            <tr>
              <td>${t('pos:changeReturnedLabel')}</td>
              <td class="right">Rs. ${(parseFloat(activeTab.changeReturned) || 0).toFixed(2)}</td>
            </tr>
            ${parseFloat(activeTab.changeReturned) < balance ? `
              <tr>
                <td>${t('pos:balanceDue')}</td>
                <td class="right bold">Rs. ${(balance - parseFloat(activeTab.changeReturned || 0)).toFixed(2)}</td>
              </tr>
            ` : ''}
          ` : `
            <tr>
              <td>${t('pos:balanceDue')}</td>
              <td class="right bold">Rs. ${Math.max(0, balance).toFixed(2)}</td>
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

  // Checkout
  const handleCheckout = () => {
    if (activeTab.cart.length === 0) {
      alert('Cart is empty!');
      return;
    }

    const total = calculateTotal();
    const paid = parseFloat(activeTab.paidAmount) || 0;

    if (paid < 0) {
      alert('Invalid payment amount!');
      return;
    }

    // CRITICAL VALIDATION: Prevent Change Returned from exceeding Change to Return
    if (paid > total) {
      const changeRequired = paid - total;
      const changeReturned = parseFloat(activeTab.changeReturned) || 0;

      if (changeReturned > changeRequired) {
        alert('You are returning more amount than required. Please correct the change returned.');
        return;
      }
    }

    // Check if walk-in customer is trying to take due
    if (!activeTab.customer && paid < total) {
      alert('Walk-in customers must pay full amount. Please add customer details to allow credit.');
      return;
    }

    // Enforce full change return for walk-in customers on overpayment
    if (!activeTab.customer && paid > total) {
      const changeRequired = paid - total;
      const changeReturned = parseFloat(activeTab.changeReturned) || 0;
      if (changeReturned < changeRequired) {
        setShowWalkinChangeConfirm(true);
        return;
      }
    }

    // Show confirmation popup for unpaid invoices (only for registered customers)
    if (activeTab.customer && paid < total) {
      setShowUnpaidConfirm(true);
      return;
    }

    // Check for overpayment without full change returned (only for saved customers)
    if (activeTab.customer && paid > total) {
      const changeRequired = paid - total;
      const changeReturned = parseFloat(activeTab.changeReturned) || 0;

      // If not all change is returned, show confirmation
      if (changeReturned < changeRequired) {
        setShowOverpaymentConfirm(true);
        return;
      }
    }

    // Proceed with checkout for fully paid invoices or after confirmation
    proceedWithCheckout();
  };

  // Actual checkout logic
  const proceedWithCheckout = () => {
    setShowUnpaidConfirm(false);

    // Validate bank account selection
    if (activeTab.paymentMethod === 'bank_transfer' && !activeTab.bankAccount) {
      toast.error('Please select a bank account for bank transfer payment');
      return;
    }

    console.log('Active tab:', { paymentMethod: activeTab.paymentMethod, bankAccount: activeTab.bankAccount });

    const creditApplied = getCreditApplied();

    const invoiceData = {
      customerId: activeTab.customer?._id || null,
      items: activeTab.cart.map(item => ({
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
      paymentMethod: activeTab.paymentMethod,
      bankAccount: activeTab.paymentMethod === 'bank_transfer' ? activeTab.bankAccount : null,
      changeReturned: parseFloat(activeTab.changeReturned) || 0,
      splitPaymentDetails: activeTab.splitPaymentDetails || [],
    };

    console.log('Sending invoice data:', invoiceData);

    dispatch(createInvoice(invoiceData));
  };

  const subtotal = calculateSubtotal();
  const total = calculateTotal();
  const paid = parseFloat(activeTab.paidAmount) || 0;
  const balance = paid - total;

  return (
    <Layout>
      <div className="space-y-5">
        {/* Header */}
        <div className="mb-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">{t('pos:title')}</h1>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5">{t('pos:subtitle')}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowHoldOrders(true)}
              className="flex items-center gap-2 px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-semibold shadow-xs transition duration-150 relative cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
              </svg>
              <span>{t('pos:holdOrders')}</span>
              {holdOrders.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-rose-600 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center border-2 border-white">
                  {holdOrders.length}
                </span>
              )}
            </button>
            <button
              onClick={() => navigate('/pos/invoices')}
              className="flex items-center gap-2 px-3.5 py-2 bg-white hover:bg-gray-50 border border-gray-300/80 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg text-xs font-semibold shadow-xs transition duration-150 cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>{t('pos:viewInvoices')}</span>
            </button>
          </div>
        </div>

        {/* Error Message */}
        {isError && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/50 rounded-lg">
            <p className="text-red-600 dark:text-red-400 text-sm">{message}</p>
          </div>
        )}

        {/* Tab System */}
        <div className="mb-6 bg-card rounded-xl shadow-sm">
          <div className="flex items-center space-x-1 p-2 border-b overflow-x-auto">
            {tabs.map((tab) => (
              <div
                key={tab.id}
                draggable
                onDragStart={(e) => handleDragStart(e, tab.id)}
                onDragOver={(e) => handleDragOver(e, tab.id)}
                onDragEnd={handleDragEnd}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg cursor-grab transition select-none ${activeTabId === tab.id
                  ? 'bg-primary text-white'
                  : 'bg-surface text-secondary hover:bg-gray-200 dark:hover:bg-gray-700'
                  } ${draggedTabId === tab.id ? 'opacity-50' : ''}`}
              >
                <button
                  onClick={() => setActiveTabId(tab.id)}
                  className="flex items-center space-x-2"
                >
                  <span className="font-medium">
                    {tab.name.startsWith('Tab ') ? `${t('pos:tab')} ${tab.name.replace('Tab ', '')}` : tab.name}
                  </span>
                  {tab.cart.length > 0 && (
                    <span className={`px-2 py-0.5 rounded-full text-xs ${activeTabId === tab.id ? 'bg-white text-primary dark:text-indigo-600' : 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-300'
                      }`}>
                      {tab.cart.length}
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
                      ? 'hover:bg-indigo-500 text-white/70 hover:text-white'
                      : 'hover:bg-gray-300 text-secondary hover:text-secondary'
                      }`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            ))}
            <button
              onClick={addNewTab}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 whitespace-nowrap"
            >
              {t('pos:newTab')}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Side - Products */}
          <div className="lg:col-span-2 space-y-4">
            {/* Customer Selection */}
            <div className="bg-card rounded-xl shadow-sm p-4">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-secondary">
                  {t('pos:customer')}
                </label>
                <button
                  onClick={() => setShowAddCustomer(true)}
                  className="text-primary hover:text-primary-hover text-sm font-medium"
                >
                  {t('pos:addNewCustomer')}
                </button>
              </div>

              {activeTab.customer ? (
                <div>
                  <div className="flex items-center justify-between p-3 bg-surface rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium text-main">{activeTab.customer.name}</div>
                      <div className="text-sm text-secondary">{activeTab.customer.phone}</div>
                      {getAvailableCredit() > 0 && (
                        <div className="mt-1 flex items-center space-x-1">
                          <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          <span className="text-sm font-medium text-green-600">
                            {t('pos:availableCredit')}: Rs. {getAvailableCredit().toFixed(2)}
                          </span>
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => updateTabData({ customer: null, applyCreditEnabled: false, availableCredit: 0, creditUsed: 0 })}
                      className="text-red-600 hover:text-red-700"
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
                  className="w-full px-4 py-3 border-2 border-dashed border-default rounded-lg text-secondary hover:border-indigo-500 hover:text-indigo-600 transition"
                >
                  {t('pos:walkInCustomer')}
                </button>
              )}

              {/* Credit Balance Display */}
              {
                activeTab.customer && activeTab.availableCredit > 0 && (
                  <div className="mt-3 p-3 bg-green-50 dark:bg-green-950/30 rounded-lg border border-green-200 dark:border-green-800/50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-sm font-medium text-green-800 dark:text-green-300">{t('pos:availableCredit')}</span>
                      </div>
                      <span className="text-lg font-bold text-green-600 dark:text-green-400">Rs. {activeTab.availableCredit.toFixed(2)}</span>
                    </div>
                  </div>
                )
              }

              {/* Pending Dues Display */}
              {
                activeTab.customer && activeTab.customer.dues > 0 && (
                  <div className="mt-3 p-3 bg-red-50 dark:bg-red-950/30 rounded-lg border border-red-200 dark:border-red-800/50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <span className="text-sm font-medium text-red-800 dark:text-red-300">{t('pos:pendingDues')}</span>
                      </div>
                      <span className="text-lg font-bold text-red-600 dark:text-red-400">Rs. {activeTab.customer.dues.toFixed(2)}</span>
                    </div>
                  </div>
                )
              }
            </div>

            {/* Product Search */}
            <div className="bg-card rounded-xl shadow-sm p-4">
              {/* Barcode Scanner Input */}
              <div className="mb-4">
                <label className="flex items-center justify-between text-sm font-medium text-secondary mb-1.5">
                  <span className="flex items-center gap-1.5">
                    <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                    </svg>
                    <span>Barcode Scanner</span>
                  </span>
                  <span className="text-xs text-muted font-urdu">بارکوڈ اسکینر</span>
                </label>
                <input
                  type="text"
                  dir="ltr"
                  value={barcodeInput}
                  onChange={(e) => setBarcodeInput(e.target.value)}
                  onKeyPress={handleBarcodeInput}
                  placeholder={t('pos:scanBarcodePlaceholder', 'Scan barcode or type SKU and press Enter...')}
                  className="w-full px-4 py-2 border border-default rounded-lg bg-input text-main placeholder-muted focus:ring-2 focus:ring-primary focus:border-transparent font-mono text-left"
                />
              </div>

              {/* Item Search Input */}
              <div className="mb-4">
                <label className="flex items-center justify-between text-sm font-medium text-secondary mb-1.5">
                  <span className="flex items-center gap-1.5">
                    <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <span>Search Products</span>
                  </span>
                  <span className="text-xs text-muted font-urdu">سامان تلاش کریں</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    dir="ltr"
                    placeholder={t('pos:searchProductsPlaceholder', 'Search by product name or SKU...')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-default rounded-lg bg-input text-main placeholder-muted focus:ring-2 focus:ring-primary focus:border-transparent text-left"
                  />
                  <svg className="absolute left-3 top-2.5 w-5 h-5 text-muted pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                    className={`p-4 border-2 rounded-lg text-left transition ${item.stockQty === 0
                      ? 'border-default bg-surface cursor-not-allowed opacity-50'
                      : 'border-default hover:border-primary hover:shadow-md dark:hover:bg-[rgb(var(--color-card))]'
                      }`}
                  >
                    <div className="font-medium text-main mb-1 truncate">{item.name}</div>
                    <div className="text-lg font-bold text-primary">Rs. {item.sellingPrice}</div>
                    <div className="text-xs text-muted mt-1">{t('pos:stock')}: {item.stockQty} {item.unit}</div>
                    {item.sku && <div className="text-xs text-muted mt-1">{t('pos:sku')}: {item.sku}</div>}
                  </button>
                ))}
              </div>
            </div>
          </div >

          {/* Right Side - Cart & Checkout */}
          < div className="lg:col-span-1" >
            <div className="bg-card rounded-xl shadow-sm p-6 sticky top-4">
              <h2 className="text-xl font-bold text-main mb-4">{t('pos:cart')}</h2>

              {/* Cart Items */}
              <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                {activeTab.cart.length === 0 ? (
                  <p className="text-secondary text-center py-8">{t('pos:cartEmpty')}</p>
                ) : (
                  activeTab.cart.map((item) => (
                    <div key={item.item} className="flex items-center justify-between p-3 bg-surface rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium text-main text-sm">{item.name}</div>
                        <div className="text-xs text-secondary">Rs. {item.price} {t('pos:each')}</div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => updateQuantity(item.item, item.quantity - 1)}
                          className="w-7 h-7 bg-surface rounded hover:bg-gray-300 dark:hover:bg-gray-600 text-main"
                        >
                          -
                        </button>
                        <span className="w-8 text-center font-medium text-main">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.item, item.quantity + 1)}
                          className="w-7 h-7 bg-surface rounded hover:bg-gray-300 dark:hover:bg-gray-600 text-main"
                        >
                          +
                        </button>
                        <button
                          onClick={() => removeFromCart(item.item)}
                          className="ml-2 text-red-600 hover:text-red-800"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                      <div className="ml-3 font-bold text-main w-20 text-right">Rs. {item.total.toFixed(2)}</div>
                    </div>
                  ))
                )}
              </div>

              {/* Discount */}
              <div className="mb-4">
                <label className="flex items-center justify-between text-sm font-medium text-secondary mb-2">
                  <span>{t('pos:discountLabel', 'Discount (Rs.)')}</span>
                  <span className="text-xs text-muted font-urdu">رعایت (روپے)</span>
                </label>
                <input
                  type="number"
                  dir="ltr"
                  value={activeTab.discount === 0 ? '' : activeTab.discount}
                  onChange={(e) => updateTabData({ discount: parseFloat(e.target.value) || 0 })}
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-2 border border-default rounded-lg bg-input text-main placeholder-muted focus:ring-2 focus:ring-primary focus:border-transparent font-mono text-left"
                  placeholder={t('pos:enterDiscount', '0.00')}
                />
              </div>

              {/* Apply Customer Credit */}
              {activeTab.customer && getAvailableCredit() > 0 && (
                <div className="mb-4">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={activeTab.applyCreditEnabled}
                      onChange={(e) => updateTabData({ applyCreditEnabled: e.target.checked })}
                      className="w-4 h-4 text-green-600 border-default rounded focus:ring-green-500"
                    />
                    <span className="text-sm font-medium text-secondary">
                      {t('pos:applyCustomerCredit', { amount: getAvailableCredit().toFixed(2) })}
                    </span>
                  </label>
                  {activeTab.applyCreditEnabled && (
                    <div className="mt-2 p-2 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800/50 rounded text-sm text-green-800 dark:text-green-300">
                      {t('pos:creditWillBeApplied', { amount: getCreditApplied().toFixed(2) })}
                    </div>
                  )}
                </div>
              )}

              {/* Totals */}
              <div className="border-t border-default pt-4 mb-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-secondary">{t('pos:subtotal')}</span>
                  <span className="font-medium">Rs. {subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-secondary">{t('pos:discount')}</span>
                  <span className="font-medium">-Rs. {activeTab.discount.toFixed(2)}</span>
                </div>

                {/* Previous Due Handling */}
                {activeTab.customer && (activeTab.customer.dues || 0) > 0 && (
                  <div className="space-y-2">
                    {activeTab.previousDueApplied > 0 ? (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">{t('pos:previousDueAdded')}</span>
                        <span className="font-medium text-amber-600">+Rs. {activeTab.previousDueApplied.toFixed(2)}</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">{t('pos:outstandingPreviousDue')}</span>
                        <span className="font-medium">Rs. {(activeTab.customer.dues || 0).toFixed(2)}</span>
                      </div>
                    )}

                    {activeTab.previousDueApplied > 0 ? (
                      <button
                        onClick={() => updateTabData({ previousDueApplied: 0 })}
                        className="w-full px-3 py-2 text-sm bg-amber-100 hover:bg-amber-200 text-amber-800 rounded"
                      >
                        {t('pos:removePreviousDue')}
                      </button>
                    ) : (
                      <button
                        onClick={() => updateTabData({ previousDueApplied: Math.max(0, activeTab.customer.dues || 0) })}
                        className="w-full px-3 py-2 text-sm bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded"
                      >
                        {t('pos:addPreviousDue')}
                      </button>
                    )}
                  </div>
                )}

                <div className="flex justify-between text-lg font-bold border-t pt-2">
                  <span>{t('pos:total')}</span>
                  <span className="text-indigo-600">Rs. {(subtotal - activeTab.discount + (parseFloat(activeTab.previousDueApplied) || 0)).toFixed(2)}</span>
                </div>
                {activeTab.applyCreditEnabled && getCreditApplied() > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-secondary">{t('pos:creditApplied')}</span>
                    <span className="font-medium text-green-600">-Rs. {getCreditApplied().toFixed(2)}</span>
                  </div>
                )}
                {activeTab.applyCreditEnabled && getCreditApplied() > 0 && (
                  <div className="flex justify-between text-lg font-bold text-indigo-600 border-t pt-2">
                    <span>{t('pos:amountToPay')}</span>
                    <span>Rs. {total.toFixed(2)}</span>
                  </div>
                )}

                {/* Payment Method Display with Split Info */}
                {activeTab.applyCreditEnabled && getCreditApplied() > 0 && (
                  <div className="mt-3 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                    <div className="text-xs font-semibold text-purple-700 mb-2">{t('pos:paymentBreakdown')}</div>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-purple-700">{t('pos:availableCredit')}:</span>
                        <span className="font-medium text-purple-900">Rs. {getCreditApplied().toFixed(2)}</span>
                      </div>
                      {paid > 0 && (
                        <div className="flex justify-between">
                          <span className="text-purple-700">{activeTab.paymentMethod.charAt(0).toUpperCase() + activeTab.paymentMethod.slice(1)}:</span>
                          <span className="font-medium text-purple-900">Rs. {paid.toFixed(2)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Payment Method */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-secondary mb-2">{t('pos:paymentMethod')}</label>
                <select
                  value={activeTab.paymentMethod}
                  onChange={(e) => updateTabData({ paymentMethod: e.target.value })}
                  className="w-full px-4 py-2 border border-default rounded-lg bg-input text-main focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="cash">{t('pos:cash')}</option>
                  <option value="upi">{t('pos:upiOrDigital')}</option>
                  <option value="card">{t('pos:card')}</option>
                  <option value="bank_transfer">{t('pos:bankTransfer')}</option>
                  {activeTab.customer && <option value="due">{t('pos:creditDue')}</option>}
                </select>
              </div>

              {/* Paid Amount */}
              <div className="mb-4">
                <label className="flex items-center justify-between text-sm font-medium text-secondary mb-2">
                  <span>{t('pos:amountPaidLabel', 'Amount Paid (Rs.)')}</span>
                  <span className="text-xs text-muted font-urdu">ادا شدہ رقم</span>
                </label>
                <input
                  type="number"
                  dir="ltr"
                  value={activeTab.paidAmount}
                  onChange={(e) => updateTabData({ paidAmount: e.target.value })}
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-2 border border-default rounded-lg bg-input text-main placeholder-muted focus:ring-2 focus:ring-primary focus:border-transparent font-mono text-left"
                  placeholder={t('pos:enterAmount', '0.00')}
                />
              </div>

              {/* Balance */}
              {
                activeTab.paidAmount && (
                  <div className={`mb-4 p-3 rounded-lg ${balance >= 0 ? 'bg-green-50 dark:bg-green-950/30' : 'bg-red-50 dark:bg-red-950/30'}`}>
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-secondary">
                        {balance >= 0 ? t('pos:changeToReturn') : t('pos:balanceDue')}
                      </span>
                      <span className={`text-xl font-bold ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        Rs. {Math.abs(balance).toFixed(2)}
                      </span>
                    </div>
                  </div>
                )
              }

              {/* Bank Account Selection */}
              {activeTab.paymentMethod === 'bank_transfer' && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-secondary mb-2">{t('pos:selectBankAccount')}</label>
                  <select
                    value={activeTab.bankAccount}
                    onChange={(e) => updateTabData({ bankAccount: e.target.value })}
                    className="w-full px-4 py-2 border border-default rounded-lg bg-input text-main focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                  >
                    <option value="">{t('pos:chooseAccount')}</option>
                    {accounts.map(account => (
                      <option key={account._id} value={account._id}>
                        {account.bankName} - {account.accountType} (Rs. {account.currentBalance})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Change Returned Input - only show if customer paid MORE than total */}
              {balance > 0 && (
                <div className="mt-3 pt-3 border-t border-green-200">
                  <label className="flex items-center justify-between text-sm font-medium text-secondary mb-2">
                    <span>{t('pos:changeReturnedLabel', 'Change Returned (Rs.)')}</span>
                    <span className="text-xs text-muted font-urdu">واپس کی گئی رقم</span>
                  </label>
                  <input
                    type="number"
                    dir="ltr"
                    value={activeTab.changeReturned}
                    onChange={(e) => updateTabData({ changeReturned: e.target.value })}
                    min="0"
                    max={balance}
                    step="0.01"
                    className="w-full px-3 py-2 border border-default rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent font-mono text-left"
                    placeholder={t('pos:enterChangeReturned', '0.00')}
                  />

                  {/* Remaining Change/Credit */}
                  {activeTab.changeReturned && parseFloat(activeTab.changeReturned) < balance && (
                    <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-yellow-800 font-medium">
                          {activeTab.customer ? t('pos:creditDueToCustomer') : t('pos:remainingChangeUnpaid')}
                        </span>
                        <span className="font-bold text-yellow-900">
                          Rs. {(balance - parseFloat(activeTab.changeReturned || 0)).toFixed(2)}
                        </span>
                      </div>
                      {activeTab.customer && (
                        <p className="text-xs text-yellow-700 mt-1">
                          {t('pos:addedAsCreditNotice')}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Full Change Returned Confirmation */}
                  {activeTab.changeReturned && parseFloat(activeTab.changeReturned) === balance && (
                    <div className="mt-2 p-2 bg-green-100 border border-green-300 rounded flex items-center text-sm text-green-800">
                      <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="font-medium">{t('pos:fullChangeReturnedNotice')}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Walk-in Customer Warning */}
              {
                !activeTab.customer && paid < total && (
                  <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-800/50 rounded-lg">
                    <p className="text-xs text-yellow-800 dark:text-yellow-300">
                      {t('pos:walkInWarning')}
                    </p>
                  </div>
                )
              }

              {/* Checkout Button */}
              <button
                onClick={handleCheckout}
                disabled={activeTab.cart.length === 0 || isLoading}
                className="w-full py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {isLoading ? t('pos:processing') : t('pos:completeSale')}
              </button>

              {/* Additional Actions */}
              <div className="grid grid-cols-3 gap-2 mt-2">
                <button
                  onClick={holdCurrentOrder}
                  disabled={activeTab.cart.length === 0}
                  className="py-2 border border-yellow-600 text-yellow-600 rounded-lg hover:bg-yellow-50 dark:hover:bg-yellow-950/30 disabled:opacity-50 text-sm"
                >
                  {t('pos:hold')}
                </button>
                <button
                  onClick={() => setShowSplitPayment(true)}
                  disabled={activeTab.cart.length === 0}
                  className="py-2 border border-purple-600 text-purple-600 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-950/30 disabled:opacity-50 text-sm"
                >
                  {t('pos:splitPay')}
                </button>
                <button
                  onClick={printReceipt}
                  disabled={activeTab.cart.length === 0}
                  className="py-2 border border-gray-600 text-secondary rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 text-sm"
                >
                  {t('pos:print')}
                </button>
              </div>

              {/* Clear Cart */}
              {
                activeTab.cart.length > 0 && (
                  <button
                    onClick={() => updateTabData({ cart: [] })}
                    className="w-full mt-2 py-2 border border-default text-secondary rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    {t('pos:clearCart')}
                  </button>
                )
              }
            </div>
          </div >
        </div >

        {/* Add Customer Modal */}
        {
          showAddCustomer && (
            <div className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
              <div className="bg-card rounded-xl p-6 max-w-md w-full mx-4">
                <h3 className="text-lg font-bold text-main mb-4">{t('pos:addNewCustomerTitle')}</h3>
                <form onSubmit={handleAddCustomer} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-secondary mb-1 flex items-center justify-between">
                      <span>{t('pos:name', 'Name')} *</span>
                      <span className="text-xs text-muted font-urdu">نام</span>
                    </label>
                    <input
                      type="text"
                      value={newCustomer.name}
                      onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                      required
                      placeholder={t('pos:customerNamePlaceholder', 'Customer full name')}
                      className="w-full px-3 py-2 border border-default rounded-lg bg-input text-main placeholder-muted focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-secondary mb-1 flex items-center justify-between">
                      <span>{t('pos:phone', 'Phone')} *</span>
                      <span className="text-xs text-muted font-urdu">فون نمبر</span>
                    </label>
                    <input
                      type="tel"
                      dir="ltr"
                      value={newCustomer.phone}
                      onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                      required
                      placeholder="03001234567"
                      className="w-full px-3 py-2 border border-default rounded-lg bg-input text-main placeholder-muted focus:ring-2 focus:ring-primary font-mono text-left"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-secondary mb-1 flex items-center justify-between">
                      <span>{t('pos:email', 'Email')} <span className="text-xs text-muted font-normal">({t('common:optional', 'Optional')})</span></span>
                      <span className="text-xs text-muted font-urdu">ای میل (اختیاری)</span>
                    </label>
                    <input
                      type="email"
                      dir="ltr"
                      value={newCustomer.email}
                      onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
                      placeholder="customer@example.com"
                      className="w-full px-3 py-2 border border-default rounded-lg bg-input text-main placeholder-muted focus:ring-2 focus:ring-primary font-mono text-left"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-secondary mb-1 flex items-center justify-between">
                      <span>{t('pos:address', 'Address')} <span className="text-xs text-muted font-normal">({t('common:optional', 'Optional')})</span></span>
                      <span className="text-xs text-muted font-urdu">پتہ (اختیاری)</span>
                    </label>
                    <textarea
                      value={newCustomer.address}
                      onChange={(e) => setNewCustomer({ ...newCustomer, address: e.target.value })}
                      rows={2}
                      placeholder={t('pos:addressPlaceholder', 'Shop / street address, city...')}
                      className="w-full px-3 py-2 border border-default rounded-lg bg-input text-main placeholder-muted focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div className="flex space-x-4 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddCustomer(false);
                        setNewCustomer({ name: '', phone: '', email: '', address: '' });
                      }}
                      className="flex-1 px-4 py-2 border border-default text-secondary rounded-lg hover:bg-gray-50 dark:hover:bg-[rgb(var(--color-input))]"
                    >
                      {t('pos:cancel')}
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover font-semibold"
                    >
                      {t('pos:addCustomerBtn')}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )
        }

        {/* Customer Select Modal */}
        {
          showCustomerSelect && (
            <div className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
              <div className="bg-card rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto border border-default">
                <h3 className="text-lg font-bold text-main mb-4">{t('pos:selectCustomerTitle')}</h3>

                {/* Customer Search */}
                <div className="mb-4">
                  <input
                    type="text"
                    placeholder={t('pos:searchCustomerPlaceholder')}
                    value={customerSearchTerm}
                    onChange={(e) => setCustomerSearchTerm(e.target.value)}
                    className="w-full px-4 py-2 border border-default rounded-lg bg-input text-main placeholder-muted focus:ring-2 focus:ring-primary"
                    autoFocus
                  />
                </div>

                <div className="space-y-2">
                  {filteredCustomers.length === 0 ? (
                    <p className="text-center text-secondary py-4">{t('pos:noCustomersFound')}</p>
                  ) : (
                    filteredCustomers.map((customer) => (
                      <button
                        key={customer._id}
                        onClick={() => selectCustomer(customer)}
                        className="w-full p-4 border border-default rounded-lg hover:border-primary hover:bg-indigo-50 dark:hover:bg-[rgb(var(--color-input))] text-left transition"
                      >
                        <div className="font-medium text-main">{customer.name}</div>
                        <div className="text-sm text-secondary">{customer.phone}</div>
                        {customer.dues > 0 && (
                          <div className="text-sm text-red-600 dark:text-red-400 mt-1">{t('pos:outstandingDues', { amount: customer.dues.toFixed(2) })}</div>
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
                  className="w-full mt-4 px-4 py-2 border border-default text-secondary rounded-lg hover:bg-surface dark:hover:bg-[rgb(var(--color-input))]"
                >
                  {t('pos:cancel')}
                </button>
              </div>
            </div>
          )
        }

        {/* Hold Orders Modal */}
        {
          showHoldOrders && (
            <div className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
              <div className="bg-card rounded-xl p-6 max-w-4xl w-full mx-4 max-h-[80vh] overflow-y-auto border border-default">
                <h3 className="text-lg font-bold text-main mb-4">
                  {t('pos:parkedOrders', { count: holdOrders.length })}
                </h3>

                {holdOrders.length === 0 ? (
                  <p className="text-center text-secondary py-8">{t('pos:noParkedOrders')}</p>
                ) : (
                  <div className="space-y-3">
                    {holdOrders.map((order) => (
                      <div key={order.id} className="border border-default rounded-lg p-4 hover:border-indigo-500 transition">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <div className="font-medium text-main">{order.customerName}</div>
                            <div className="text-sm text-secondary">
                              {new Date(order.timestamp).toLocaleString()}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm text-secondary">{t('pos:itemsCount', { count: order.cart.length })}</div>
                            <div className="font-bold text-indigo-600">
                              Rs. {(order.cart.reduce((sum, item) => sum + item.total, 0) - order.discount).toFixed(2)}
                            </div>
                          </div>
                        </div>
                        <div className="flex space-x-2 mt-3">
                          <button
                            onClick={() => retrieveHoldOrder(order)}
                            className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover"
                          >
                            {t('pos:retrieve')}
                          </button>
                          <button
                            onClick={() => deleteHoldOrder(order.id)}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                          >
                            {t('pos:delete')}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <button
                  onClick={() => setShowHoldOrders(false)}
                  className="w-full mt-4 px-4 py-2 border border-default text-secondary rounded-lg hover:bg-gray-50 dark:hover:bg-[rgb(var(--color-input))]"
                >
                  {t('pos:close')}
                </button>
              </div>
            </div>
          )
        }

        {/* Split Payment Modal */}
        {
          showSplitPayment && (
            <div className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
              <div className="bg-card rounded-xl p-6 max-w-md w-full mx-4 border border-default">
                <h3 className="text-lg font-bold text-main mb-4">{t('pos:splitPaymentTitle')}</h3>
                <div className="mb-4 p-3 bg-indigo-50 dark:bg-indigo-950/30 rounded-lg">
                  <div className="flex justify-between text-sm">
                    <span className="text-secondary">{t('pos:totalAmount')}</span>
                    <span className="font-bold text-primary">Rs. {total.toFixed(2)}</span>
                  </div>
                </div>

                <div className="space-y-3 mb-4">
                  {splitPayments.map((payment, index) => (
                    <div key={index} className="flex space-x-2">
                      <select
                        value={payment.method}
                        onChange={(e) => updateSplitPayment(index, 'method', e.target.value)}
                        className="flex-1 px-3 py-2 border border-default rounded-lg bg-input text-main focus:ring-2 focus:ring-primary"
                      >
                        <option value="cash">{t('pos:cash')}</option>
                        <option value="upi">{t('pos:upiOrDigital')}</option>
                        <option value="card">{t('pos:card')}</option>
                      </select>
                      <input
                        type="number"
                        dir="ltr"
                        value={payment.amount}
                        onChange={(e) => updateSplitPayment(index, 'amount', e.target.value)}
                        placeholder={t('pos:enterAmount', '0.00')}
                        className="flex-1 px-3 py-2 border border-default rounded-lg bg-input text-main placeholder-muted focus:ring-2 focus:ring-primary font-mono text-left"
                      />
                      {splitPayments.length > 1 && (
                        <button
                          onClick={() => removeSplitPayment(index)}
                          className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                <button
                  onClick={addSplitPayment}
                  className="w-full mb-4 px-4 py-2 border border-primary text-primary rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-950/30"
                >
                  {t('pos:addPaymentMethod')}
                </button>

                <div className="mb-4 p-3 bg-gray-50 dark:bg-[rgb(var(--color-input))] rounded-lg">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-secondary">{t('pos:totalPaid')}</span>
                    <span className={`font-bold ${calculateSplitTotal() >= total ? 'text-green-600' : 'text-red-600'}`}>
                      Rs. {calculateSplitTotal().toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-secondary">{t('pos:balance')}</span>
                    <span className={`font-bold ${calculateSplitTotal() >= total ? 'text-green-600' : 'text-red-600'}`}>
                      Rs. {(total - calculateSplitTotal()).toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Payment Methods Summary */}
                {splitPayments.some(p => p.amount) && (
                  <div className="mb-4 p-3 bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800/50 rounded-lg">
                    <div className="text-xs font-semibold text-purple-700 dark:text-purple-300 mb-2">{t('pos:paymentMethod')}</div>
                    <div className="space-y-1">
                      {splitPayments.map((payment, index) => (
                        payment.amount && (
                          <div key={index} className="flex justify-between text-sm">
                            <span className="text-purple-700 dark:text-purple-300">{payment.method.charAt(0).toUpperCase() + payment.method.slice(1)}:</span>
                            <span className="font-medium text-purple-900 dark:text-purple-200">Rs. {parseFloat(payment.amount || 0).toFixed(2)}</span>
                          </div>
                        )
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      setShowSplitPayment(false);
                      setSplitPayments([{ method: 'cash', amount: '' }]);
                    }}
                    className="flex-1 px-4 py-2 border border-default text-secondary rounded-lg hover:bg-gray-50 dark:hover:bg-[rgb(var(--color-input))]"
                  >
                    {t('pos:cancel')}
                  </button>
                  <button
                    onClick={applySplitPayment}
                    disabled={calculateSplitTotal() !== total}
                    className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover disabled:opacity-50"
                  >
                    {t('pos:apply')}
                  </button>
                </div>
              </div>
            </div>
          )
        }

        {/* Unpaid Invoice Confirmation Modal */}
        {
          showUnpaidConfirm && (
            <div className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <div className="bg-card rounded-xl p-6 max-w-md w-full mx-4 border border-default">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mr-4">
                    <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-main">{t('pos:unpaidConfirmTitle')}</h3>
                </div>

                <div className="mb-4">
                  <p className="text-secondary mb-3">
                    {t('pos:unpaidConfirmDesc')}
                  </p>
                  <div className="bg-surface p-4 rounded-lg space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-secondary">{t('pos:customer')}:</span>
                      <span className="font-medium text-main">{activeTab.customer?.name}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-secondary">{t('pos:total')}:</span>
                      <span className="font-bold text-main">Rs. {total.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-secondary">{t('pos:amountPaidLabel')}:</span>
                      <span className="text-main">Rs. {paid.toFixed(2)}</span>
                    </div>
                    <div className="border-t pt-2 flex justify-between">
                      <span className="font-medium text-red-600">{t('pos:balanceDue')}:</span>
                      <span className="font-bold text-red-600 text-lg">Rs. {(total - paid).toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <p className="text-sm text-secondary mb-6">
                  {t('pos:unpaidNotice', { amount: (total - paid).toFixed(2) })}
                </p>

                <div className="flex space-x-3">
                  <button
                    onClick={() => setShowUnpaidConfirm(false)}
                    className="flex-1 px-4 py-2 border border-default text-secondary rounded-lg hover:bg-gray-50 dark:hover:bg-[rgb(var(--color-input))] font-medium"
                  >
                    {t('pos:cancel')}
                  </button>
                  <button
                    onClick={proceedWithCheckout}
                    className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover font-medium"
                  >
                    {t('pos:confirmAndCreate')}
                  </button>
                </div>
              </div>
            </div>
          )
        }

        {/* Overpayment Confirmation Modal - for saved customers */}
        {
          showOverpaymentConfirm && (
            <div className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <div className="bg-card rounded-xl p-6 max-w-md w-full mx-4 border border-default">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-main">{t('pos:partialChangeTitle')}</h3>
                </div>

                <div className="mb-4">
                  <p className="text-secondary mb-3">
                    {t('pos:partialChangeDesc')}
                  </p>
                  <div className="bg-blue-50 dark:bg-blue-950/30 p-4 rounded-lg space-y-2 border border-blue-200 dark:border-blue-800/50">
                    <div className="flex justify-between text-sm">
                      <span className="text-secondary">{t('pos:customer')}:</span>
                      <span className="font-medium text-main">{activeTab.customer?.name}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-secondary">{t('pos:total')}:</span>
                      <span className="font-bold text-main">Rs. {total.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-secondary">{t('pos:amountPaidLabel')}:</span>
                      <span className="text-main">Rs. {paid.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-secondary">{t('pos:changeRequired')}</span>
                      <span className="font-bold text-indigo-600">Rs. {(paid - total).toFixed(2)}</span>
                    </div>
                    <div className="border-t pt-2 flex justify-between">
                      <span className="text-secondary">{t('pos:changeReturnedLabel')}</span>
                      <span className="font-bold text-main">Rs. {(parseFloat(activeTab.changeReturned) || 0).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm bg-yellow-100 p-2 rounded border border-yellow-300">
                      <span className="font-medium text-yellow-800">{t('pos:remainingCredit')}</span>
                      <span className="font-bold text-yellow-900">Rs. {((paid - total) - (parseFloat(activeTab.changeReturned) || 0)).toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <div className="mb-4 p-3 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800/50 rounded-lg">
                  <p className="text-sm text-green-800 dark:text-green-300 font-medium mb-1">{t('pos:whatHappensNext')}</p>
                  <p className="text-sm text-green-700 dark:text-green-400">
                    {t('pos:creditSaveNotice', { amount: ((paid - total) - (parseFloat(activeTab.changeReturned) || 0)).toFixed(2) })}
                  </p>
                </div>

                <p className="text-xs text-secondary mb-6">
                  {t('pos:accountingNotice')}
                </p>

                <div className="flex space-x-3">
                  <button
                    onClick={() => setShowOverpaymentConfirm(false)}
                    className="flex-1 px-4 py-2 border border-default text-secondary rounded-lg hover:bg-gray-50 dark:hover:bg-[rgb(var(--color-input))] font-medium"
                  >
                    {t('pos:cancel')}
                  </button>
                  <button
                    onClick={() => {
                      setShowOverpaymentConfirm(false);
                      proceedWithCheckout();
                    }}
                    className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover font-medium"
                  >
                    {t('pos:proceed')}
                  </button>
                </div>
              </div>
            </div>
          )
        }

        {/* Walk-in Overpayment Modal (must return full change) */}
        {
          showWalkinChangeConfirm && (
            <div className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <div className="bg-card rounded-xl p-6 max-w-md w-full mx-4 border border-default">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mr-4">
                    <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-main">{t('pos:returnFullChangeTitle')}</h3>
                </div>

                <div className="mb-4">
                  <p className="text-secondary mb-3">
                    {t('pos:returnFullChangeDesc')}
                  </p>
                  <div className="bg-yellow-50 dark:bg-yellow-950/30 p-4 rounded-lg space-y-2 border border-yellow-200 dark:border-yellow-800/50">
                    <div className="flex justify-between text-sm">
                      <span className="text-secondary">{t('pos:total')}:</span>
                      <span className="font-bold text-main">Rs. {total.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-secondary">{t('pos:amountPaidLabel')}:</span>
                      <span className="text-main">Rs. {paid.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-secondary">{t('pos:changeRequired')}</span>
                      <span className="font-bold text-indigo-600">Rs. {(paid - total).toFixed(2)}</span>
                    </div>
                    <div className="border-t pt-2 flex justify-between">
                      <span className="text-secondary">{t('pos:changeReturnedLabel')}</span>
                      <span className="font-bold text-main">Rs. {(parseFloat(activeTab.changeReturned) || 0).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm bg-yellow-100 p-2 rounded border border-yellow-300">
                      <span className="font-medium text-yellow-800">{t('pos:remainingChangeUnpaid')}</span>
                      <span className="font-bold text-yellow-900">Rs. {((paid - total) - (parseFloat(activeTab.changeReturned) || 0)).toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-secondary mb-6">
                  {t('pos:walkInChangeNotice')}
                </p>

                <div className="flex">
                  <button
                    onClick={() => setShowWalkinChangeConfirm(false)}
                    className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover font-medium"
                  >
                    {t('pos:gotIt')}
                  </button>
                </div>
              </div>
            </div>
          )
        }
      </div >
    </Layout >
  );
};

export default POS;