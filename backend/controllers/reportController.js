import Invoice from "../models/Invoice.js";
import Item from "../models/Item.js";
import Customer from "../models/Customer.js";
import Expense from "../models/Expense.js";
import { generateAIReport } from "../utils/aiReportHelper.js";
import { checkStockAlerts } from "../utils/stockAlert.js";
import { info, error } from "../utils/logger.js";
import salesReportService from "../services/salesReportService.js";

/**
 * @desc Generate Sales Report (daily/weekly/monthly) - Only for current owner
 * @route GET /api/reports/sales
 */
export const getSalesReport = async (req, res) => {
  try {
    // Only get invoices and items for current user
    const invoices = await Invoice.find({ createdBy: req.user._id });
    const items = await Item.find({ addedBy: req.user._id });

    const report = generateAIReport(invoices, items);
    const stockAlerts = await checkStockAlerts(req.user._id);

    info(`Sales report generated for ${req.user.name} with ${report.summary.totalInvoices} invoices`);

    res.status(200).json({ report, stockAlerts });
  } catch (err) {
    error(`Report Generation Error: ${err.message}`);
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};

/**
 * @desc Get Stock Report (only for current owner)
 * @route GET /api/reports/stock
 */
export const getStockReport = async (req, res) => {
  try {
    const items = await Item.find({ addedBy: req.user._id }).sort({ stockQty: 1 });
    const lowStock = items.filter((i) => i.stockQty <= i.lowStockLimit);
    res.status(200).json({ totalItems: items.length, lowStock });
  } catch (err) {
    error(`Stock Report Error: ${err.message}`);
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};

/**
 * @desc Get Customer Dues Report (only for current owner)
 * @route GET /api/reports/customers
 */
export const getCustomerReport = async (req, res) => {
  try {
    const customers = await Customer.find({
      owner: req.user._id,
      dues: { $gt: 0 }
    }).sort({ dues: -1 });
    res.status(200).json(customers);
  } catch (err) {
    error(`Customer Report Error: ${err.message}`);
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};

/**
 * @desc Get Dashboard Statistics for Graphs
 * @route GET /api/reports/dashboard-stats
 */
export const getDashboardStats = async (req, res) => {
  try {
    const userId = req.user._id;

    // Import additional models
    const Item = (await import("../models/Item.js")).default;
    const Purchase = (await import("../models/Purchase.js")).default;
    const SalesOrder = (await import("../models/SalesOrder.js")).default;
    const Supplier = (await import("../models/Supplier.js")).default;
    const BankAccount = (await import("../models/BankAccount.js")).default;
    const CashbankTransaction = (await import("../models/CashbankTransaction.js")).default;
    const PaymentIn = (await import("../models/PaymentIn.js")).default;
    const PaymentOut = (await import("../models/PaymentOut.js")).default;
    const Return = (await import("../models/Return.js")).default;
    const PurchaseReturn = (await import("../models/PurchaseReturn.js")).default;

    // 0. Summary metrics (Invoices/Revenue)
    const allInvoices = await Invoice.find({ createdBy: userId });
    const totalInvoices = allInvoices.length;
    const totalRevenue = allInvoices.reduce((sum, inv) => sum + (inv.totalAmount || 0), 0);
    const totalCollected = allInvoices.reduce((sum, inv) => {
      const collected = Math.min(inv.totalAmount || 0, (inv.paidAmount || 0) + (inv.creditApplied || 0));
      return sum + collected;
    }, 0);
    const totalOutstanding = Math.max(0, totalRevenue - totalCollected); // Customer receivables

    // Import Bill model for supplier payables
    const Bill = (await import("../models/Bill.js")).default;

    // Supplier Outstanding (Payables - what we owe to suppliers)
    const allBills = await Bill.find({ createdBy: userId, isDeleted: false });
    const totalSupplierOutstanding = allBills.reduce((sum, bill) => sum + (bill.outstandingAmount || 0), 0);
    const totalBillsAmount = allBills.reduce((sum, bill) => sum + (bill.totalAmount || 0), 0);
    const totalBillsPaid = allBills.reduce((sum, bill) => sum + (bill.paidAmount || 0), 0);

    // 1. Inventory Metrics
    const allItems = await Item.find({ addedBy: userId, isDeleted: { $ne: true } });
    const totalItems = allItems.length;

    // Detailed low stock & out-of-stock items (including 0 stock items)
    const lowStockItemsList = allItems
      .filter(item => {
        const available = item.stockQty - (item.reservedStock || 0);
        return available <= (item.lowStockLimit || 5);
      })
      .sort((a, b) => {
        const availA = a.stockQty - (a.reservedStock || 0);
        const availB = b.stockQty - (b.reservedStock || 0);
        return availA - availB;
      })
      .slice(0, 10)
      .map(item => ({
        _id: item._id,
        name: item.name,
        sku: item.sku || item.supplierSKU || item.barcode || '',
        stockQty: item.stockQty,
        reservedStock: item.reservedStock || 0,
        availableStock: Math.max(item.stockQty - (item.reservedStock || 0), 0),
        lowStockLimit: item.lowStockLimit || 5,
        costPrice: item.costPrice || 0,
        sellingPrice: item.price || item.sellingPrice || 0,
        isOutOfStock: (item.stockQty - (item.reservedStock || 0)) <= 0
      }));

    const lowStockItems = allItems.filter(item => (item.stockQty - (item.reservedStock || 0)) <= (item.lowStockLimit || 5)).length;
    const outOfStockItems = allItems.filter(item => (item.stockQty - (item.reservedStock || 0)) <= 0).length;
    const totalInventoryValue = allItems.reduce((sum, item) => sum + (item.stockQty * (item.costPrice || 0)), 0);

    // 2. Purchase Metrics
    const allPurchases = await Purchase.find({ createdBy: userId, status: { $ne: 'cancelled' } });
    const totalPurchases = allPurchases.length;
    const totalPurchaseAmount = allPurchases.reduce((sum, purchase) => sum + (purchase.totalAmount || 0), 0);

    // 3. Supplier Metrics
    const allSuppliers = await Supplier.find({ owner: userId, status: 'active' });
    const totalSuppliers = allSuppliers.length;

    // Top 5 suppliers by purchase volume
    const topSuppliers = await Purchase.aggregate([
      { $match: { createdBy: userId, status: { $ne: 'cancelled' } } },
      {
        $group: {
          _id: "$supplier",
          totalPurchaseValue: { $sum: "$totalAmount" },
          purchaseCount: { $sum: 1 }
        }
      },
      { $sort: { totalPurchaseValue: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: "suppliers",
          localField: "_id",
          foreignField: "_id",
          as: "supplierInfo"
        }
      },
      { $unwind: "$supplierInfo" },
      {
        $project: {
          name: "$supplierInfo.businessName",
          totalPurchaseValue: 1,
          purchaseCount: 1
        }
      }
    ]);

    // 4. Sales Order Metrics
    const allSalesOrders = await SalesOrder.find({ createdBy: userId });
    const pendingSalesOrders = allSalesOrders.filter(order =>
      order.status === 'Draft' || order.status === 'Confirmed' || order.status === 'Partially Delivered'
    ).length;
    const completedSalesOrders = allSalesOrders.filter(order =>
      order.status === 'Delivered' || order.status === 'Invoiced'
    ).length;
    const totalSalesOrderValue = allSalesOrders
      .filter(order => order.status !== 'Cancelled')
      .reduce((sum, order) => sum + (order.totalAmount || 0), 0);

    // 5. Cash & Bank Metrics
    const bankAccounts = await BankAccount.find({ userId });
    const totalBankBalance = bankAccounts.reduce((sum, acc) => sum + acc.currentBalance, 0);
    const bankAccountCount = bankAccounts.length;

    // Calculate cash in hand
    const mongoose = (await import("mongoose")).default;
    const cashIn = await CashbankTransaction.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          toAccount: 'cash'
        }
      },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const cashOut = await CashbankTransaction.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          fromAccount: 'cash'
        }
      },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const cashInHand = (cashIn[0]?.total || 0) - (cashOut[0]?.total || 0);
    const totalLiquidity = cashInHand + totalBankBalance;

    // 6. Customer Metrics - ENTERPRISE-READY
    const allCustomers = await Customer.find({ owner: userId });
    const totalCustomers = allCustomers.length;

    // Invoice-based outstanding (ONLY positive receivables)
    const invoiceOutstanding = allInvoices.reduce((sum, inv) => {
      const outstanding = (inv.totalAmount || 0) - (inv.paidAmount || 0) - (inv.creditApplied || 0);
      return sum + Math.max(0, outstanding);
    }, 0);

    // Customer model dues (ONLY positive)
    const customerDuesPositive = allCustomers.reduce((sum, customer) => {
      return sum + Math.max(0, customer.dues || 0);
    }, 0);

    // Invoice overpayments (customer credit)
    const invoiceOverpayments = allInvoices.reduce((sum, inv) => {
      const overpaid = (inv.paidAmount || 0) + (inv.creditApplied || 0) - (inv.totalAmount || 0);
      return sum + Math.max(0, overpaid);
    }, 0);

    // Customer model negative dues = credit
    const customerDuesNegative = allCustomers.reduce((sum, customer) => {
      return sum + Math.abs(Math.min(0, customer.dues || 0));
    }, 0);

    // FINAL VALUES (GUARANTEED >= 0)
    // Customer Outstanding = ONLY from Customer.dues field (not invoices)
    const totalCustomerOutstanding = customerDuesPositive;
    const totalCustomerCredit = invoiceOverpayments + customerDuesNegative;

    // 7. Payment Metrics
    const allPaymentsIn = await PaymentIn.find({ createdBy: userId });
    const totalPaymentsIn = allPaymentsIn.reduce((sum, payment) => sum + (payment.totalAmount || 0), 0);

    const allPaymentsOut = await PaymentOut.find({ createdBy: userId, status: { $ne: 'cancelled' } });
    const totalPaymentsOut = allPaymentsOut.reduce((sum, payment) => sum + (payment.totalAmount || 0), 0);

    const netCashFlow = totalPaymentsIn - totalPaymentsOut;

    // 8. Return Metrics
    const allSalesReturns = await Return.find({ createdBy: userId });
    const salesReturnsCount = allSalesReturns.length;
    const salesReturnsAmount = allSalesReturns.reduce((sum, ret) => sum + (ret.totalReturnAmount || 0), 0);

    const allPurchaseReturns = await PurchaseReturn.find({ createdBy: userId });
    const purchaseReturnsCount = allPurchaseReturns.length;
    const purchaseReturnsAmount = allPurchaseReturns.reduce((sum, ret) => sum + (ret.totalAmount || 0), 0);

    // 9. Profit Metrics
    // Get expenses from Expense model
    const allExpenses = await Expense.find({ createdBy: userId });
    const expenseModelTotal = allExpenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);

    // Get expenses from CashbankTransaction (cash outflows)
    const cashOutflows = await CashbankTransaction.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          type: 'out',
          fromAccount: 'cash'
        }
      },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const cashExpenses = cashOutflows[0]?.total || 0;

    // Total expenses = Expense model + Cash outflows
    const totalExpenses = expenseModelTotal + cashExpenses;

    // Gross Profit = Revenue - COGS (approximated as: Purchase Amount - Purchase Returns + Sales Returns)
    // This is a simplified calculation. In reality, COGS should track actual cost of items sold.
    const approximateCOGS = totalPurchaseAmount - purchaseReturnsAmount + salesReturnsAmount;
    // Operating Profit = Revenue - Expenses (not using COGS as it's inaccurate)
    const operatingProfit = totalRevenue - totalExpenses;
    const profitMargin = totalRevenue > 0 ? ((operatingProfit / totalRevenue) * 100) : 0;



    // 10. Sales over time (last 30 days) - zero-fill so chart always renders a continuous trend line
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29);
    thirtyDaysAgo.setHours(0, 0, 0, 0);

    const rawDailySales = await Invoice.aggregate([
      {
        $match: {
          createdBy: userId,
          createdAt: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          totalSales: { $sum: "$totalAmount" },
          invoicesCount: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const salesMap = {};
    rawDailySales.forEach(d => {
      salesMap[d._id] = { totalSales: d.totalSales, invoicesCount: d.invoicesCount || 1 };
    });

    const dailySales = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateKey = d.toISOString().split('T')[0];
      dailySales.push({
        _id: dateKey,
        totalSales: salesMap[dateKey]?.totalSales || 0,
        invoicesCount: salesMap[dateKey]?.invoicesCount || 0
      });
    }

    // 11. Revenue vs Expenses (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyRevenue = await Invoice.aggregate([
      {
        $match: {
          createdBy: userId,
          createdAt: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
          revenue: { $sum: "$totalAmount" }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const monthlyExpenses = await Expense.aggregate([
      {
        $match: {
          createdBy: userId,
          date: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$date" } },
          expenses: { $sum: "$amount" }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Combine monthly revenue and expenses
    const months = Array.from(new Set([
      ...monthlyRevenue.map(r => r._id),
      ...monthlyExpenses.map(e => e._id)
    ])).sort();

    const revenueVsExpenses = months.map(month => ({
      month,
      revenue: monthlyRevenue.find(r => r._id === month)?.revenue || 0,
      expenses: monthlyExpenses.find(e => e._id === month)?.expenses || 0
    }));

    // 12. Payment methods distribution (Invoices)
    const paymentMethods = await Invoice.aggregate([
      { $match: { createdBy: userId } },
      {
        $group: {
          _id: "$paymentMethod",
          count: { $sum: 1 },
          amount: { $sum: "$totalAmount" }
        }
      }
    ]);

    // 13. Outstanding dues trend (Top 5 customers)
    const topCustomersWithDues = await Customer.find({
      owner: userId,
      dues: { $gt: 0 }
    })
      .sort({ dues: -1 })
      .limit(5)
      .select('name dues');

    res.status(200).json({
      // Invoice/Revenue metrics
      totalInvoices,
      totalRevenue,
      totalCollected,
      totalCustomerOutstanding, // Receivables (always >= 0)
      totalCustomerCredit,      // Advances / Overpayments (always >= 0)

      // Supplier Payables metrics
      totalSupplierOutstanding, // What we owe suppliers
      totalBillsAmount,
      totalBillsPaid,

      // Inventory metrics
      totalItems,
      lowStockItems,
      outOfStockItems,
      lowStockItemsList,
      totalInventoryValue,

      // Purchase metrics
      totalPurchases,
      totalPurchaseAmount,

      // Supplier metrics
      totalSuppliers,
      topSuppliers,

      // Sales Order metrics
      pendingSalesOrders,
      completedSalesOrders,
      totalSalesOrderValue,

      // Cash & Bank metrics
      cashInHand,
      totalBankBalance,
      totalLiquidity,
      bankAccountCount,

      // Customer metrics
      totalCustomers,

      // Payment metrics
      totalPaymentsIn,
      totalPaymentsOut,
      netCashFlow,

      // Return metrics
      salesReturnsCount,
      salesReturnsAmount,
      purchaseReturnsCount,
      purchaseReturnsAmount,

      // Profit metrics
      totalExpenses,
      operatingProfit,
      profitMargin,

      // Charts data
      dailySales,
      revenueVsExpenses,
      paymentMethods,
      topCustomersWithDues
    });
  } catch (err) {
    error(`Dashboard Stats Error: ${err.message}`);
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};

/**
 * @desc Get Sales Report Data with Filters and Pagination
 * @route GET /api/reports/sales/data
 */
export const getSalesReportData = async (req, res) => {
  try {
    const userId = req.user._id;
    const filters = {
      dateFilter: req.query.dateFilter || 'this_month',
      customStartDate: req.query.startDate,
      customEndDate: req.query.endDate,
      invoiceNo: req.query.invoiceNo,
      paymentStatus: req.query.paymentStatus ? req.query.paymentStatus.split(',') : [],
      paymentMethod: req.query.paymentMethod ? req.query.paymentMethod.split(',') : [],
      customerId: req.query.customerId,
    };

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;

    const result = await salesReportService.getSalesData(userId, filters, page, limit);

    info(`Sales report data generated for ${req.user.name}: ${result.pagination.totalRecords} records`);

    res.status(200).json(result);
  } catch (err) {
    error(`Sales Report Data Error: ${err.message}`);
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};

/**
 * @desc Get Sales Report Summary KPIs
 * @route GET /api/reports/sales/summary
 */
export const getSalesReportSummary = async (req, res) => {
  try {
    const userId = req.user._id;
    const filters = {
      dateFilter: req.query.dateFilter || 'this_month',
      customStartDate: req.query.startDate,
      customEndDate: req.query.endDate,
      invoiceNo: req.query.invoiceNo,
      paymentStatus: req.query.paymentStatus ? req.query.paymentStatus.split(',') : [],
      paymentMethod: req.query.paymentMethod ? req.query.paymentMethod.split(',') : [],
      customerId: req.query.customerId,
    };

    const summary = await salesReportService.getSalesSummary(userId, filters);

    info(`Sales report summary generated for ${req.user.name}`);

    res.status(200).json(summary);
  } catch (err) {
    error(`Sales Report Summary Error: ${err.message}`);
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};

/**
 * @desc Get Sales Report Charts Data
 * @route GET /api/reports/sales/charts
 */
export const getSalesReportCharts = async (req, res) => {
  try {
    const userId = req.user._id;
    const filters = {
      dateFilter: req.query.dateFilter || 'this_month',
      customStartDate: req.query.startDate,
      customEndDate: req.query.endDate,
      invoiceNo: req.query.invoiceNo,
      paymentStatus: req.query.paymentStatus ? req.query.paymentStatus.split(',') : [],
      paymentMethod: req.query.paymentMethod ? req.query.paymentMethod.split(',') : [],
      customerId: req.query.customerId,
    };

    const charts = await salesReportService.getChartsData(userId, filters);

    info(`Sales report charts generated for ${req.user.name}`);

    res.status(200).json(charts);
  } catch (err) {
    error(`Sales Report Charts Error: ${err.message}`);
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};

/**
 * @desc Export Sales Report to PDF/CSV
 * @route GET /api/reports/sales/export
 */
export const exportSalesReport = async (req, res) => {
  try {
    const userId = req.user._id;
    const format = req.query.format || 'pdf'; // pdf, csv

    const filters = {
      dateFilter: req.query.dateFilter || 'this_month',
      customStartDate: req.query.startDate,
      customEndDate: req.query.endDate,
      invoiceNo: req.query.invoiceNo,
      paymentStatus: req.query.paymentStatus ? req.query.paymentStatus.split(',') : [],
      paymentMethod: req.query.paymentMethod ? req.query.paymentMethod.split(',') : [],
      customerId: req.query.customerId,
    };

    // Get all data (no pagination for export)
    const reportData = await salesReportService.getSalesData(userId, filters, 1, 10000);
    const summary = await salesReportService.getSalesSummary(userId, filters);

    const userInfo = {
      shopName: req.user.shopName,
      shopAddress: req.user.shopAddress,
      gstNumber: req.user.gstNumber,
      phone: req.user.phone,
    };

    // Dynamic import to avoid loading exporter if not needed
    const { default: salesReportExporter } = await import('../utils/salesReportExporter.js');

    if (format === 'pdf') {
      const pdfBuffer = await salesReportExporter.exportToPDF(reportData, summary, userInfo, filters);

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=sales-report-${Date.now()}.pdf`);
      res.send(Buffer.from(pdfBuffer));
    } else if (format === 'csv') {
      const csvData = await salesReportExporter.exportToCSV(reportData, summary);

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=sales-report-${Date.now()}.csv`);
      res.send(csvData);
    } else {
      res.status(400).json({ message: 'Invalid export format. Use pdf or csv.' });
    }

    info(`Sales report exported as ${format} for ${req.user.name}`);
  } catch (err) {
    error(`Sales Report Export Error: ${err.message}`);
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};

/**
 * Helper: Build Date Range from Query Filters
 */
export const buildReportDateRange = (dateFilter = 'this_month', customStartDate, customEndDate) => {
  const now = new Date();
  let startDate, endDate;

  if (customStartDate && customEndDate) {
    startDate = new Date(customStartDate);
    startDate.setHours(0, 0, 0, 0);
    endDate = new Date(customEndDate);
    endDate.setHours(23, 59, 59, 999);
    return { startDate, endDate };
  }

  switch (dateFilter) {
    case 'today':
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
      endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
      break;
    case 'yesterday':
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 0, 0, 0, 0);
      endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 23, 59, 59, 999);
      break;
    case 'this_week': {
      const day = now.getDay();
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - day, 0, 0, 0, 0);
      endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + (6 - day), 23, 59, 59, 999);
      break;
    }
    case 'last_week': {
      const d = now.getDay();
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - d - 7, 0, 0, 0, 0);
      endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - d - 1, 23, 59, 59, 999);
      break;
    }
    case 'this_month':
      startDate = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
      break;
    case 'last_month':
      startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1, 0, 0, 0, 0);
      endDate = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
      break;
    case 'this_quarter': {
      const q = Math.floor(now.getMonth() / 3);
      startDate = new Date(now.getFullYear(), q * 3, 1, 0, 0, 0, 0);
      endDate = new Date(now.getFullYear(), (q + 1) * 3, 0, 23, 59, 59, 999);
      break;
    }
    case 'this_year':
    case 'financial_year':
      startDate = new Date(now.getFullYear(), 0, 1, 0, 0, 0, 0);
      endDate = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
      break;
    case 'all':
    default:
      startDate = new Date(2000, 0, 1);
      endDate = new Date(2100, 11, 31, 23, 59, 59, 999);
      break;
  }
  return { startDate, endDate };
};

/**
 * @desc 1. Get Day Book Report (Daily inflows, outflows, sales, expenses, payments)
 * @route GET /api/reports/daybook
 */
export const getDayBookReport = async (req, res) => {
  try {
    const userId = req.user._id;
    const { dateFilter = 'today', startDate: qStart, endDate: qEnd } = req.query;
    const { startDate, endDate } = buildReportDateRange(dateFilter, qStart, qEnd);

    // Import models
    const Bill = (await import("../models/Bill.js")).default;
    const PaymentIn = (await import("../models/PaymentIn.js")).default;
    const PaymentOut = (await import("../models/PaymentOut.js")).default;
    const Return = (await import("../models/Return.js")).default;
    const PurchaseReturn = (await import("../models/PurchaseReturn.js")).default;
    const CashbankTransaction = (await import("../models/CashbankTransaction.js")).default;

    // Parallel fetch of all daily operational transactions
    const [invoices, paymentsIn, paymentsOut, expenses, salesReturns, purchaseReturns, cashbankTxns, bills] = await Promise.all([
      Invoice.find({ createdBy: userId, createdAt: { $gte: startDate, $lte: endDate } }).populate('customer', 'name phone'),
      PaymentIn.find({ createdBy: userId, paymentDate: { $gte: startDate, $lte: endDate } }).populate('customer', 'name phone'),
      PaymentOut.find({ createdBy: userId, paymentDate: { $gte: startDate, $lte: endDate } }).populate('supplier', 'name phone'),
      Expense.find({ user: userId, date: { $gte: startDate, $lte: endDate } }),
      Return.find({ createdBy: userId, createdAt: { $gte: startDate, $lte: endDate } }).populate('customer', 'name phone'),
      PurchaseReturn.find({ user: userId, returnDate: { $gte: startDate, $lte: endDate } }).populate('supplier', 'name phone'),
      CashbankTransaction.find({ userId, date: { $gte: startDate, $lte: endDate } }),
      Bill.find({ createdBy: userId, isDeleted: false, billDate: { $gte: startDate, $lte: endDate } }).populate('supplier', 'name phone'),
    ]);

    const entries = [];
    let totalInflow = 0;
    let totalOutflow = 0;
    let totalSales = 0;
    let totalPurchases = 0;

    // 1. Invoices
    invoices.forEach(inv => {
      const paid = (inv.paidAmount || 0) + (inv.creditApplied || 0);
      totalSales += inv.totalAmount || 0;
      if (paid > 0) totalInflow += paid;
      entries.push({
        id: inv._id,
        date: inv.createdAt,
        type: 'SALE_INVOICE',
        label: 'Sale Invoice',
        refNo: inv.invoiceNo,
        party: inv.customer?.name || 'Walk-in Customer',
        mode: inv.paymentMethod || 'cash',
        amount: inv.totalAmount || 0,
        paidAmount: paid,
        inflow: paid,
        outflow: 0,
        status: inv.paymentStatus || 'completed',
      });
    });

    // 2. Payments In (Customer Receipts)
    paymentsIn.forEach(pin => {
      const amt = pin.totalAmount || pin.amount || 0;
      totalInflow += amt;
      entries.push({
        id: pin._id,
        date: pin.paymentDate || pin.createdAt,
        type: 'PAYMENT_IN',
        label: 'Payment In (Receipt)',
        refNo: pin.paymentNumber || 'PIN',
        party: pin.customer?.name || 'Customer',
        mode: pin.paymentMethods?.[0]?.method || 'cash',
        amount: amt,
        paidAmount: amt,
        inflow: amt,
        outflow: 0,
        status: 'received',
      });
    });

    // 3. Expenses
    expenses.forEach(exp => {
      const amt = exp.amount || 0;
      totalOutflow += amt;
      entries.push({
        id: exp._id,
        date: exp.date || exp.createdAt,
        type: 'EXPENSE',
        label: `Expense (${exp.category || 'General'})`,
        refNo: exp.referenceNo || exp.title || 'EXP',
        party: exp.vendor || exp.title || 'Expense',
        mode: exp.paymentMethod || 'cash',
        amount: amt,
        paidAmount: amt,
        inflow: 0,
        outflow: amt,
        status: 'paid',
      });
    });

    // 4. Payments Out (Supplier Payments)
    paymentsOut.forEach(pout => {
      const amt = pout.totalAmount || pout.amount || 0;
      totalOutflow += amt;
      entries.push({
        id: pout._id,
        date: pout.paymentDate || pout.createdAt,
        type: 'PAYMENT_OUT',
        label: 'Payment Out',
        refNo: pout.paymentNumber || 'POUT',
        party: pout.supplier?.name || 'Supplier',
        mode: pout.paymentMethods?.[0]?.method || 'cash',
        amount: amt,
        paidAmount: amt,
        inflow: 0,
        outflow: amt,
        status: 'paid',
      });
    });

    // 5. Bills (Purchases)
    bills.forEach(bill => {
      const paid = bill.paidAmount || 0;
      totalPurchases += bill.totalAmount || 0;
      entries.push({
        id: bill._id,
        date: bill.billDate || bill.createdAt,
        type: 'PURCHASE_BILL',
        label: 'Purchase Bill',
        refNo: bill.billNumber,
        party: bill.supplier?.name || 'Supplier',
        mode: bill.paymentMethod || 'credit',
        amount: bill.totalAmount || 0,
        paidAmount: paid,
        inflow: 0,
        outflow: paid,
        status: bill.status || 'active',
      });
    });

    // 6. Sales Returns
    salesReturns.forEach(ret => {
      const refund = ret.actualRefundAmount || 0;
      if (refund > 0) totalOutflow += refund;
      entries.push({
        id: ret._id,
        date: ret.returnDate || ret.createdAt,
        type: 'SALES_RETURN',
        label: 'Sales Return',
        refNo: ret.returnId,
        party: ret.customer?.name || ret.customerName || 'Customer',
        mode: ret.actualRefundMethod || ret.refundMethod || 'cash',
        amount: ret.totalReturnAmount || 0,
        paidAmount: refund,
        inflow: 0,
        outflow: refund,
        status: ret.status || 'processed',
      });
    });

    // Sort chronologically descending
    entries.sort((a, b) => new Date(b.date) - new Date(a.date));

    res.status(200).json({
      dateRange: { startDate, endDate },
      summary: {
        totalInflow,
        totalOutflow,
        netCashflow: totalInflow - totalOutflow,
        totalSales,
        totalPurchases,
        totalEntries: entries.length,
      },
      entries,
    });
  } catch (err) {
    error(`DayBook Report Error: ${err.message}`);
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};

/**
 * @desc 2. Get Profit & Loss Report
 * @route GET /api/reports/profit-loss
 */
export const getProfitLossReport = async (req, res) => {
  try {
    const userId = req.user._id;
    const { dateFilter = 'this_month', startDate: qStart, endDate: qEnd } = req.query;
    const { startDate, endDate } = buildReportDateRange(dateFilter, qStart, qEnd);

    const Bill = (await import("../models/Bill.js")).default;
    const Return = (await import("../models/Return.js")).default;

    const [invoices, salesReturns, expenses, bills, allItems] = await Promise.all([
      Invoice.find({ createdBy: userId, createdAt: { $gte: startDate, $lte: endDate } }),
      Return.find({ createdBy: userId, createdAt: { $gte: startDate, $lte: endDate } }),
      Expense.find({ user: userId, date: { $gte: startDate, $lte: endDate } }),
      Bill.find({ createdBy: userId, isDeleted: false, billDate: { $gte: startDate, $lte: endDate } }),
      Item.find({ addedBy: userId }),
    ]);

    // Item cost lookup map
    const itemCostMap = {};
    allItems.forEach(it => {
      itemCostMap[it._id.toString()] = it.purchasePrice || it.purchaseRate || it.costPrice || 0;
    });

    // 1. Revenue
    const grossSales = invoices.reduce((sum, inv) => sum + (inv.subtotal || inv.totalAmount || 0), 0);
    const totalDiscountGiven = invoices.reduce((sum, inv) => sum + (inv.discount || 0), 0);
    const totalTaxCollected = invoices.reduce((sum, inv) => sum + (inv.taxAmount || 0), 0);
    const totalReturnsValue = salesReturns.reduce((sum, ret) => sum + (ret.totalReturnAmount || 0), 0);
    const netSales = Math.max(0, grossSales - totalDiscountGiven - totalReturnsValue);

    // 2. Cost of Goods Sold (COGS)
    let totalCOGS = 0;
    invoices.forEach(inv => {
      (inv.items || []).forEach(it => {
        const pId = typeof it.item === 'object' ? it.item?._id?.toString() : it.item?.toString();
        const costPerUnit = (pId && itemCostMap[pId]) || it.purchasePrice || it.costPrice || (it.price ? it.price * 0.7 : 0);
        totalCOGS += costPerUnit * (it.quantity || 1);
      });
    });

    // Subtract cost of returned items
    salesReturns.forEach(ret => {
      (ret.items || []).forEach(it => {
        const pId = typeof it.product === 'object' ? it.product?._id?.toString() : it.product?.toString();
        const costPerUnit = (pId && itemCostMap[pId]) || it.rate * 0.7;
        totalCOGS = Math.max(0, totalCOGS - costPerUnit * (it.returnedQty || 0));
      });
    });

    const grossProfit = netSales - totalCOGS;

    // 3. Operating Expenses by Category
    const expensesByCategory = {};
    let totalOperatingExpenses = 0;

    expenses.forEach(exp => {
      const cat = exp.category || 'General Expenses';
      expensesByCategory[cat] = (expensesByCategory[cat] || 0) + (exp.amount || 0);
      totalOperatingExpenses += exp.amount || 0;
    });

    const netProfit = grossProfit - totalOperatingExpenses;
    const grossMarginPercent = netSales > 0 ? (grossProfit / netSales) * 100 : 0;
    const netMarginPercent = netSales > 0 ? (netProfit / netSales) * 100 : 0;

    res.status(200).json({
      dateRange: { startDate, endDate },
      summary: {
        grossSales,
        totalDiscountGiven,
        totalReturnsValue,
        netSales,
        totalCOGS,
        grossProfit,
        grossMarginPercent: Number(grossMarginPercent.toFixed(2)),
        totalOperatingExpenses,
        netProfit,
        netMarginPercent: Number(netMarginPercent.toFixed(2)),
        isProfitable: netProfit >= 0,
      },
      incomeBreakdown: [
        { label: 'Gross Sales Revenue', amount: grossSales },
        { label: 'Less: Sales Discounts', amount: -totalDiscountGiven },
        { label: 'Less: Sales Returns', amount: -totalReturnsValue },
        { label: 'Net Sales Revenue', amount: netSales, isTotal: true },
      ],
      cogsBreakdown: [
        { label: 'Cost of Goods Sold (COGS)', amount: totalCOGS },
        { label: 'Gross Profit (Revenue - COGS)', amount: grossProfit, isTotal: true },
      ],
      expenseBreakdown: Object.keys(expensesByCategory).map(cat => ({
        category: cat,
        amount: expensesByCategory[cat],
      })),
    });
  } catch (err) {
    error(`Profit & Loss Report Error: ${err.message}`);
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};

/**
 * @desc 3. Get Bill-wise Profit Report
 * @route GET /api/reports/bill-profit
 */
export const getBillWiseProfitReport = async (req, res) => {
  try {
    const userId = req.user._id;
    const { dateFilter = 'this_month', startDate: qStart, endDate: qEnd, search } = req.query;
    const { startDate, endDate } = buildReportDateRange(dateFilter, qStart, qEnd);

    const query = {
      createdBy: userId,
      createdAt: { $gte: startDate, $lte: endDate },
    };

    const [invoices, allItems] = await Promise.all([
      Invoice.find(query).populate('customer', 'name phone').sort({ createdAt: -1 }),
      Item.find({ addedBy: userId }),
    ]);

    const itemCostMap = {};
    allItems.forEach(it => {
      itemCostMap[it._id.toString()] = it.purchasePrice || it.purchaseRate || it.costPrice || 0;
    });

    let totalSales = 0;
    let totalCost = 0;
    let totalProfit = 0;

    const bills = invoices.map(inv => {
      let billCost = 0;
      (inv.items || []).forEach(it => {
        const pId = typeof it.item === 'object' ? it.item?._id?.toString() : it.item?.toString();
        const costPerUnit = (pId && itemCostMap[pId]) || it.purchasePrice || (it.price ? it.price * 0.7 : 0);
        billCost += costPerUnit * (it.quantity || 1);
      });

      const billSale = inv.totalAmount || 0;
      const profit = billSale - billCost;
      const margin = billSale > 0 ? (profit / billSale) * 100 : 0;

      totalSales += billSale;
      totalCost += billCost;
      totalProfit += profit;

      return {
        id: inv._id,
        invoiceNo: inv.invoiceNo,
        date: inv.createdAt,
        customerName: inv.customer?.name || 'Walk-in Customer',
        customerPhone: inv.customer?.phone || '',
        itemsCount: (inv.items || []).length,
        saleAmount: billSale,
        costAmount: billCost,
        profitAmount: profit,
        marginPercent: Number(margin.toFixed(2)),
        paymentMethod: inv.paymentMethod || 'cash',
        status: inv.paymentStatus || 'completed',
      };
    });

    const filteredBills = search
      ? bills.filter(b => b.invoiceNo.toLowerCase().includes(search.toLowerCase()) || b.customerName.toLowerCase().includes(search.toLowerCase()))
      : bills;

    const avgMargin = totalSales > 0 ? (totalProfit / totalSales) * 100 : 0;

    res.status(200).json({
      dateRange: { startDate, endDate },
      summary: {
        totalInvoices: filteredBills.length,
        totalSales,
        totalCost,
        totalProfit,
        avgMarginPercent: Number(avgMargin.toFixed(2)),
      },
      bills: filteredBills,
    });
  } catch (err) {
    error(`Bill-wise Profit Report Error: ${err.message}`);
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};

/**
 * @desc 4. Get Party Statement Report (Customer / Supplier ledger with running balance)
 * @route GET /api/reports/party-statement
 */
export const getPartyStatementReport = async (req, res) => {
  try {
    const userId = req.user._id;
    const { partyId, partyType = 'customer', dateFilter = 'this_year', startDate: qStart, endDate: qEnd } = req.query;
    const { startDate, endDate } = buildReportDateRange(dateFilter, qStart, qEnd);

    if (!partyId) {
      return res.status(400).json({ message: "Party ID is required" });
    }

    const entries = [];
    let partyDetails = null;

    if (partyType === 'customer') {
      partyDetails = await Customer.findOne({ _id: partyId, owner: userId });
      if (!partyDetails) return res.status(404).json({ message: "Customer not found" });

      const PaymentIn = (await import("../models/PaymentIn.js")).default;
      const Return = (await import("../models/Return.js")).default;

      const [invoices, payments, returns] = await Promise.all([
        Invoice.find({ customer: partyId, createdBy: userId, createdAt: { $gte: startDate, $lte: endDate } }),
        PaymentIn.find({ customer: partyId, createdBy: userId, paymentDate: { $gte: startDate, $lte: endDate } }),
        Return.find({ customer: partyId, createdBy: userId, createdAt: { $gte: startDate, $lte: endDate } }),
      ]);

      // Invoices = Debit (+amount to customer dues)
      invoices.forEach(inv => {
        entries.push({
          date: inv.createdAt,
          type: 'INVOICE',
          refNo: inv.invoiceNo,
          description: `Sale Invoice #${inv.invoiceNo}`,
          debit: inv.totalAmount || 0,
          credit: (inv.paidAmount || 0) + (inv.creditApplied || 0),
        });
      });

      // Payments In = Credit (reduces customer dues)
      payments.forEach(p => {
        entries.push({
          date: p.paymentDate || p.createdAt,
          type: 'PAYMENT_RECEIVED',
          refNo: p.paymentNumber || 'PAY',
          description: `Payment Received (${p.paymentMethods?.[0]?.method || 'cash'})`,
          debit: 0,
          credit: p.totalAmount || p.amount || 0,
        });
      });

      // Returns = Credit
      returns.forEach(r => {
        entries.push({
          date: r.returnDate || r.createdAt,
          type: 'SALES_RETURN',
          refNo: r.returnId,
          description: `Item Return - ${r.returnId}`,
          debit: 0,
          credit: r.totalReturnAmount || 0,
        });
      });
    } else {
      // Supplier
      const Supplier = (await import("../models/Supplier.js")).default;
      const Bill = (await import("../models/Bill.js")).default;
      const PaymentOut = (await import("../models/PaymentOut.js")).default;
      const PurchaseReturn = (await import("../models/PurchaseReturn.js")).default;

      partyDetails = await Supplier.findOne({ _id: partyId, userId });
      if (!partyDetails) return res.status(404).json({ message: "Supplier not found" });

      const [bills, payments, returns] = await Promise.all([
        Bill.find({ supplier: partyId, createdBy: userId, isDeleted: false, billDate: { $gte: startDate, $lte: endDate } }),
        PaymentOut.find({ supplier: partyId, createdBy: userId, paymentDate: { $gte: startDate, $lte: endDate } }),
        PurchaseReturn.find({ supplier: partyId, user: userId, returnDate: { $gte: startDate, $lte: endDate } }),
      ]);

      bills.forEach(b => {
        entries.push({
          date: b.billDate || b.createdAt,
          type: 'PURCHASE_BILL',
          refNo: b.billNumber,
          description: `Purchase Bill #${b.billNumber}`,
          debit: b.paidAmount || 0,
          credit: b.totalAmount || 0,
        });
      });

      payments.forEach(p => {
        entries.push({
          date: p.paymentDate || p.createdAt,
          type: 'PAYMENT_MADE',
          refNo: p.paymentNumber || 'PAY',
          description: `Payment Sent (${p.paymentMethods?.[0]?.method || 'cash'})`,
          debit: p.totalAmount || p.amount || 0,
          credit: 0,
        });
      });

      returns.forEach(r => {
        entries.push({
          date: r.returnDate || r.createdAt,
          type: 'PURCHASE_RETURN',
          refNo: r.returnNumber || 'PR',
          description: `Purchase Return`,
          debit: r.totalAmount || 0,
          credit: 0,
        });
      });
    }

    // Sort chronologically ascending
    entries.sort((a, b) => new Date(a.date) - new Date(b.date));

    let runningBalance = 0;
    const statement = entries.map(item => {
      runningBalance += (item.debit - item.credit);
      return {
        ...item,
        balance: runningBalance,
      };
    });

    const totalDebit = entries.reduce((s, e) => s + (e.debit || 0), 0);
    const totalCredit = entries.reduce((s, e) => s + (e.credit || 0), 0);

    res.status(200).json({
      party: {
        id: partyDetails._id,
        name: partyDetails.name,
        phone: partyDetails.phone || partyDetails.mobile,
        email: partyDetails.email,
        address: partyDetails.address,
        currentBalance: partyDetails.dues || partyDetails.balance || partyDetails.outstandingAmount || runningBalance,
        type: partyType,
      },
      dateRange: { startDate, endDate },
      summary: {
        totalDebit,
        totalCredit,
        netBalance: runningBalance,
        entriesCount: entries.length,
      },
      entries: statement,
    });
  } catch (err) {
    error(`Party Statement Report Error: ${err.message}`);
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};

/**
 * @desc 5. Get All Parties Report (Customers & Suppliers balance overview)
 * @route GET /api/reports/all-parties
 */
export const getAllPartiesReport = async (req, res) => {
  try {
    const userId = req.user._id;
    const Supplier = (await import("../models/Supplier.js")).default;
    const Bill = (await import("../models/Bill.js")).default;

    const [customers, suppliers, invoices, bills] = await Promise.all([
      Customer.find({ owner: userId }).sort({ dues: -1 }),
      Supplier.find({ userId }).sort({ outstandingAmount: -1 }),
      Invoice.find({ createdBy: userId }).select('customer totalAmount paidAmount'),
      Bill.find({ createdBy: userId, isDeleted: false }).select('supplier totalAmount paidAmount outstandingAmount'),
    ]);

    // Customer invoice aggregations
    const custStats = {};
    invoices.forEach(inv => {
      if (inv.customer) {
        const cId = inv.customer.toString();
        if (!custStats[cId]) custStats[cId] = { count: 0, totalSales: 0 };
        custStats[cId].count += 1;
        custStats[cId].totalSales += (inv.totalAmount || 0);
      }
    });

    // Supplier bill aggregations
    const suppStats = {};
    bills.forEach(b => {
      if (b.supplier) {
        const sId = b.supplier.toString();
        if (!suppStats[sId]) suppStats[sId] = { count: 0, totalBills: 0, payables: 0 };
        suppStats[sId].count += 1;
        suppStats[sId].totalBills += (b.totalAmount || 0);
        suppStats[sId].payables += (b.outstandingAmount || 0);
      }
    });

    const partyList = [
      ...customers.map(c => ({
        id: c._id,
        name: c.name,
        type: 'Customer',
        phone: c.phone || '',
        email: c.email || '',
        city: c.city || c.address?.city || '',
        receivable: c.dues || 0,
        payable: 0,
        totalTransactions: custStats[c._id.toString()]?.count || 0,
        totalVolume: custStats[c._id.toString()]?.totalSales || 0,
        status: (c.dues || 0) > 0 ? 'Has Dues' : 'Clear',
      })),
      ...suppliers.map(s => ({
        id: s._id,
        name: s.name,
        type: 'Supplier',
        phone: s.phone || s.mobile || '',
        email: s.email || '',
        city: s.city || s.address || '',
        receivable: 0,
        payable: s.outstandingAmount || suppStats[s._id.toString()]?.payables || 0,
        totalTransactions: suppStats[s._id.toString()]?.count || 0,
        totalVolume: suppStats[s._id.toString()]?.totalBills || 0,
        status: (s.outstandingAmount || 0) > 0 ? 'To Pay' : 'Clear',
      })),
    ];

    const totalReceivables = customers.reduce((sum, c) => sum + Math.max(0, c.dues || 0), 0);
    const totalPayables = suppliers.reduce((sum, s) => sum + Math.max(0, s.outstandingAmount || 0), 0);

    res.status(200).json({
      summary: {
        totalCustomers: customers.length,
        totalSuppliers: suppliers.length,
        totalReceivables,
        totalPayables,
        netBalance: totalReceivables - totalPayables,
      },
      parties: partyList,
    });
  } catch (err) {
    error(`All Parties Report Error: ${err.message}`);
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};

/**
 * @desc 6. Get Sales by Party Report
 * @route GET /api/reports/sales-party
 */
export const getSalesByPartyReport = async (req, res) => {
  try {
    const userId = req.user._id;
    const { dateFilter = 'this_month', startDate: qStart, endDate: qEnd } = req.query;
    const { startDate, endDate } = buildReportDateRange(dateFilter, qStart, qEnd);

    const [invoices, customers] = await Promise.all([
      Invoice.find({ createdBy: userId, createdAt: { $gte: startDate, $lte: endDate } }).populate('customer', 'name phone dues'),
      Customer.find({ owner: userId }),
    ]);

    const partyMap = {};

    invoices.forEach(inv => {
      const custId = inv.customer?._id?.toString() || 'walk-in';
      const custName = inv.customer?.name || 'Walk-in Customer';
      const custPhone = inv.customer?.phone || '';
      const currentDues = inv.customer?.dues || 0;

      if (!partyMap[custId]) {
        partyMap[custId] = {
          id: custId,
          name: custName,
          phone: custPhone,
          currentDues,
          invoiceCount: 0,
          totalSales: 0,
          paidAmount: 0,
          dueAmount: 0,
        };
      }

      const paid = (inv.paidAmount || 0) + (inv.creditApplied || 0);
      partyMap[custId].invoiceCount += 1;
      partyMap[custId].totalSales += (inv.totalAmount || 0);
      partyMap[custId].paidAmount += paid;
      partyMap[custId].dueAmount += Math.max(0, (inv.totalAmount || 0) - paid);
    });

    const salesList = Object.values(partyMap).sort((a, b) => b.totalSales - a.totalSales);
    const totalSalesVolume = salesList.reduce((sum, p) => sum + p.totalSales, 0);
    const totalCollected = salesList.reduce((sum, p) => sum + p.paidAmount, 0);

    res.status(200).json({
      dateRange: { startDate, endDate },
      summary: {
        totalParties: salesList.length,
        totalSalesVolume,
        totalCollected,
        totalOutstanding: totalSalesVolume - totalCollected,
      },
      parties: salesList,
    });
  } catch (err) {
    error(`Sales by Party Report Error: ${err.message}`);
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};

/**
 * @desc 7. Get Purchase Report
 * @route GET /api/reports/purchase
 */
export const getPurchaseReport = async (req, res) => {
  try {
    const userId = req.user._id;
    const { dateFilter = 'this_month', startDate: qStart, endDate: qEnd, supplierId } = req.query;
    const { startDate, endDate } = buildReportDateRange(dateFilter, qStart, qEnd);

    const Bill = (await import("../models/Bill.js")).default;
    const PurchaseReturn = (await import("../models/PurchaseReturn.js")).default;

    const query = {
      createdBy: userId,
      isDeleted: false,
      billDate: { $gte: startDate, $lte: endDate },
    };
    if (supplierId) query.supplier = supplierId;

    const [bills, returns] = await Promise.all([
      Bill.find(query).populate('supplier', 'name phone').sort({ billDate: -1 }),
      PurchaseReturn.find({ user: userId, returnDate: { $gte: startDate, $lte: endDate } }),
    ]);

    let totalPurchases = 0;
    let totalPaid = 0;
    let totalOutstanding = 0;

    const formattedBills = bills.map(b => {
      const total = b.totalAmount || 0;
      const paid = b.paidAmount || 0;
      const outstanding = b.outstandingAmount || Math.max(0, total - paid);

      totalPurchases += total;
      totalPaid += paid;
      totalOutstanding += outstanding;

      return {
        id: b._id,
        billNumber: b.billNumber,
        supplierName: b.supplier?.name || 'Unknown Supplier',
        supplierPhone: b.supplier?.phone || '',
        billDate: b.billDate || b.createdAt,
        dueDate: b.dueDate,
        totalAmount: total,
        paidAmount: paid,
        outstandingAmount: outstanding,
        paymentStatus: b.paymentStatus || (outstanding === 0 ? 'paid' : paid > 0 ? 'partial' : 'unpaid'),
      };
    });

    const totalReturns = returns.reduce((sum, r) => sum + (r.totalAmount || 0), 0);

    res.status(200).json({
      dateRange: { startDate, endDate },
      summary: {
        totalBills: formattedBills.length,
        totalPurchases,
        totalPaid,
        totalOutstanding,
        totalReturns,
      },
      bills: formattedBills,
    });
  } catch (err) {
    error(`Purchase Report Error: ${err.message}`);
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};

/**
 * @desc 8. Get All Transactions Report
 * @route GET /api/reports/transactions
 */
export const getTransactionsReport = async (req, res) => {
  try {
    const userId = req.user._id;
    const { dateFilter = 'this_month', startDate: qStart, endDate: qEnd, type } = req.query;
    const { startDate, endDate } = buildReportDateRange(dateFilter, qStart, qEnd);

    const Bill = (await import("../models/Bill.js")).default;
    const PaymentIn = (await import("../models/PaymentIn.js")).default;
    const PaymentOut = (await import("../models/PaymentOut.js")).default;
    const Return = (await import("../models/Return.js")).default;
    const PurchaseReturn = (await import("../models/PurchaseReturn.js")).default;

    const [invoices, bills, paymentsIn, paymentsOut, expenses, salesReturns, purchaseReturns] = await Promise.all([
      Invoice.find({ createdBy: userId, createdAt: { $gte: startDate, $lte: endDate } }).populate('customer', 'name'),
      Bill.find({ createdBy: userId, isDeleted: false, billDate: { $gte: startDate, $lte: endDate } }).populate('supplier', 'name'),
      PaymentIn.find({ createdBy: userId, paymentDate: { $gte: startDate, $lte: endDate } }).populate('customer', 'name'),
      PaymentOut.find({ createdBy: userId, paymentDate: { $gte: startDate, $lte: endDate } }).populate('supplier', 'name'),
      Expense.find({ user: userId, date: { $gte: startDate, $lte: endDate } }),
      Return.find({ createdBy: userId, createdAt: { $gte: startDate, $lte: endDate } }).populate('customer', 'name'),
      PurchaseReturn.find({ user: userId, returnDate: { $gte: startDate, $lte: endDate } }).populate('supplier', 'name'),
    ]);

    let txns = [];

    invoices.forEach(i => txns.push({
      id: i._id,
      date: i.createdAt,
      type: 'Sale Invoice',
      refNo: i.invoiceNo,
      party: i.customer?.name || 'Walk-in',
      inflow: (i.paidAmount || 0) + (i.creditApplied || 0),
      outflow: 0,
      totalAmount: i.totalAmount || 0,
      mode: i.paymentMethod || 'cash',
    }));

    bills.forEach(b => txns.push({
      id: b._id,
      date: b.billDate || b.createdAt,
      type: 'Purchase Bill',
      refNo: b.billNumber,
      party: b.supplier?.name || 'Supplier',
      inflow: 0,
      outflow: b.paidAmount || 0,
      totalAmount: b.totalAmount || 0,
      mode: b.paymentMethod || 'credit',
    }));

    paymentsIn.forEach(p => txns.push({
      id: p._id,
      date: p.paymentDate || p.createdAt,
      type: 'Payment In',
      refNo: p.paymentNumber || 'PIN',
      party: p.customer?.name || 'Customer',
      inflow: p.totalAmount || p.amount || 0,
      outflow: 0,
      totalAmount: p.totalAmount || p.amount || 0,
      mode: p.paymentMethods?.[0]?.method || 'cash',
    }));

    paymentsOut.forEach(p => txns.push({
      id: p._id,
      date: p.paymentDate || p.createdAt,
      type: 'Payment Out',
      refNo: p.paymentNumber || 'POUT',
      party: p.supplier?.name || 'Supplier',
      inflow: 0,
      outflow: p.totalAmount || p.amount || 0,
      totalAmount: p.totalAmount || p.amount || 0,
      mode: p.paymentMethods?.[0]?.method || 'cash',
    }));

    expenses.forEach(e => txns.push({
      id: e._id,
      date: e.date || e.createdAt,
      type: 'Expense',
      refNo: e.referenceNo || 'EXP',
      party: e.title || e.category || 'Expense',
      inflow: 0,
      outflow: e.amount || 0,
      totalAmount: e.amount || 0,
      mode: e.paymentMethod || 'cash',
    }));

    salesReturns.forEach(r => txns.push({
      id: r._id,
      date: r.returnDate || r.createdAt,
      type: 'Sales Return',
      refNo: r.returnId,
      party: r.customer?.name || r.customerName || 'Customer',
      inflow: 0,
      outflow: r.actualRefundAmount || 0,
      totalAmount: r.totalReturnAmount || 0,
      mode: r.actualRefundMethod || 'cash',
    }));

    purchaseReturns.forEach(r => txns.push({
      id: r._id,
      date: r.returnDate || r.createdAt,
      type: 'Purchase Return',
      refNo: r.returnNumber || 'PR',
      party: r.supplier?.name || 'Supplier',
      inflow: r.totalAmount || 0,
      outflow: 0,
      totalAmount: r.totalAmount || 0,
      mode: 'credit',
    }));

    if (type) {
      txns = txns.filter(t => t.type.toLowerCase().includes(type.toLowerCase()));
    }

    txns.sort((a, b) => new Date(b.date) - new Date(a.date));

    const totalInflow = txns.reduce((s, t) => s + t.inflow, 0);
    const totalOutflow = txns.reduce((s, t) => s + t.outflow, 0);

    res.status(200).json({
      dateRange: { startDate, endDate },
      summary: {
        totalTransactions: txns.length,
        totalInflow,
        totalOutflow,
        netBalance: totalInflow - totalOutflow,
      },
      transactions: txns,
    });
  } catch (err) {
    error(`Transactions Report Error: ${err.message}`);
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};

/**
 * @desc 9. Get Cash Flow Report
 * @route GET /api/reports/cashflow
 */
export const getCashFlowReport = async (req, res) => {
  try {
    const userId = req.user._id;
    const { dateFilter = 'this_year', startDate: qStart, endDate: qEnd } = req.query;
    const { startDate, endDate } = buildReportDateRange(dateFilter, qStart, qEnd);

    const PaymentIn = (await import("../models/PaymentIn.js")).default;
    const PaymentOut = (await import("../models/PaymentOut.js")).default;
    const Return = (await import("../models/Return.js")).default;

    const [invoices, paymentsIn, paymentsOut, expenses, returns] = await Promise.all([
      Invoice.find({ createdBy: userId, createdAt: { $gte: startDate, $lte: endDate } }),
      PaymentIn.find({ createdBy: userId, paymentDate: { $gte: startDate, $lte: endDate } }),
      PaymentOut.find({ createdBy: userId, paymentDate: { $gte: startDate, $lte: endDate } }),
      Expense.find({ user: userId, date: { $gte: startDate, $lte: endDate } }),
      Return.find({ createdBy: userId, createdAt: { $gte: startDate, $lte: endDate } }),
    ]);

    let totalInflow = 0;
    let totalOutflow = 0;

    // Monthly bucket map
    const monthlyMap = {};

    const addCashMovement = (date, inflow, outflow) => {
      const d = new Date(date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (!monthlyMap[key]) {
        monthlyMap[key] = { month: key, inflow: 0, outflow: 0, net: 0 };
      }
      monthlyMap[key].inflow += inflow;
      monthlyMap[key].outflow += outflow;
      monthlyMap[key].net += (inflow - outflow);
      totalInflow += inflow;
      totalOutflow += outflow;
    };

    invoices.forEach(inv => {
      const paid = (inv.paidAmount || 0) + (inv.creditApplied || 0);
      if (paid > 0) addCashMovement(inv.createdAt, paid, 0);
    });

    paymentsIn.forEach(p => {
      const amt = p.totalAmount || p.amount || 0;
      if (amt > 0) addCashMovement(p.paymentDate || p.createdAt, amt, 0);
    });

    expenses.forEach(e => {
      const amt = e.amount || 0;
      if (amt > 0) addCashMovement(e.date || e.createdAt, 0, amt);
    });

    paymentsOut.forEach(p => {
      const amt = p.totalAmount || p.amount || 0;
      if (amt > 0) addCashMovement(p.paymentDate || p.createdAt, 0, amt);
    });

    returns.forEach(r => {
      const refund = r.actualRefundAmount || 0;
      if (refund > 0) addCashMovement(r.returnDate || r.createdAt, 0, refund);
    });

    const monthlyTrends = Object.values(monthlyMap).sort((a, b) => a.month.localeCompare(b.month));

    res.status(200).json({
      dateRange: { startDate, endDate },
      summary: {
        totalInflow,
        totalOutflow,
        netCashFlow: totalInflow - totalOutflow,
      },
      monthlyTrends,
    });
  } catch (err) {
    error(`Cash Flow Report Error: ${err.message}`);
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};

/**
 * @desc 10. Get Financial Statements (Trial Balance & Balance Sheet)
 * @route GET /api/reports/financial-statements
 */
export const getFinancialStatementsReport = async (req, res) => {
  try {
    const userId = req.user._id;
    const BankAccount = (await import("../models/BankAccount.js")).default;
    const Supplier = (await import("../models/Supplier.js")).default;

    const [customers, suppliers, bankAccounts, items, invoices, expenses] = await Promise.all([
      Customer.find({ owner: userId }),
      Supplier.find({ userId }),
      BankAccount.find({ userId }),
      Item.find({ addedBy: userId, isDeleted: { $ne: true } }),
      Invoice.find({ createdBy: userId }),
      Expense.find({ user: userId }),
    ]);

    // Assets
    const cashInHand = 0; // Drawer estimate
    const bankBalanceTotal = bankAccounts.reduce((s, b) => s + (b.currentBalance || 0), 0);
    const accountsReceivable = customers.reduce((s, c) => s + Math.max(0, c.dues || 0), 0);
    const inventoryValuation = items.reduce((s, i) => s + ((i.purchasePrice || i.costPrice || i.price * 0.7) * (i.stockQty || 0)), 0);
    const totalAssets = bankBalanceTotal + accountsReceivable + inventoryValuation;

    // Liabilities
    const accountsPayable = suppliers.reduce((s, sp) => s + Math.max(0, sp.outstandingAmount || 0), 0);
    const loans = bankAccounts.filter(b => b.accountType === 'loan').reduce((s, b) => s + Math.abs(b.currentBalance || 0), 0);
    const totalLiabilities = accountsPayable + loans;

    // Equity = Assets - Liabilities
    const totalEquity = totalAssets - totalLiabilities;

    // Trial Balance items
    const totalRevenue = invoices.reduce((s, inv) => s + (inv.totalAmount || 0), 0);
    const totalExpenseAmount = expenses.reduce((s, e) => s + (e.amount || 0), 0);

    const trialBalance = [
      { account: 'Bank & Liquid Accounts', debit: bankBalanceTotal, credit: 0 },
      { account: 'Accounts Receivable (Customer Dues)', debit: accountsReceivable, credit: 0 },
      { account: 'Inventory Stock Value', debit: inventoryValuation, credit: 0 },
      { account: 'Operating Expenses', debit: totalExpenseAmount, credit: 0 },
      { account: 'Accounts Payable (Supplier Dues)', debit: 0, credit: accountsPayable },
      { account: 'Loans & Borrowings', debit: 0, credit: loans },
      { account: 'Sales Revenue', debit: 0, credit: totalRevenue },
      { account: "Owner's Capital / Equity", debit: 0, credit: Math.max(0, totalEquity) },
    ];

    res.status(200).json({
      balanceSheet: {
        assets: {
          bankAccounts: bankBalanceTotal,
          accountsReceivable,
          inventoryValuation,
          totalAssets,
        },
        liabilities: {
          accountsPayable,
          loans,
          totalLiabilities,
        },
        equity: {
          retainedEarnings: totalEquity,
          totalEquity,
        },
      },
      trialBalance,
    });
  } catch (err) {
    error(`Financial Statements Report Error: ${err.message}`);
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};

/**
 * @desc 11. Get GST / Tax Reports (GSTR-1, GSTR-2, GSTR-3B)
 * @route GET /api/reports/gst
 */
export const getTaxReport = async (req, res) => {
  try {
    const userId = req.user._id;
    const { taxType = 'gstr1', dateFilter = 'this_month', startDate: qStart, endDate: qEnd } = req.query;
    const { startDate, endDate } = buildReportDateRange(dateFilter, qStart, qEnd);

    const Bill = (await import("../models/Bill.js")).default;

    const [invoices, bills] = await Promise.all([
      Invoice.find({ createdBy: userId, createdAt: { $gte: startDate, $lte: endDate } }).populate('customer', 'name gstNumber address'),
      Bill.find({ createdBy: userId, isDeleted: false, billDate: { $gte: startDate, $lte: endDate } }).populate('supplier', 'name gstNumber'),
    ]);

    // Outward Supplies (GSTR-1 / Sales Tax)
    let totalTaxableSales = 0;
    let totalCGST = 0;
    let totalSGST = 0;
    let totalIGST = 0;
    let totalTaxCollected = 0;

    const b2bInvoices = [];
    const b2cInvoices = [];

    invoices.forEach(inv => {
      const subtotal = inv.subtotal || inv.totalAmount || 0;
      const tax = inv.taxAmount || 0;
      const total = inv.totalAmount || 0;

      totalTaxableSales += subtotal;
      totalTaxCollected += tax;
      totalCGST += (tax / 2);
      totalSGST += (tax / 2);

      const invData = {
        invoiceNo: inv.invoiceNo,
        date: inv.createdAt,
        partyName: inv.customer?.name || 'Consumer',
        gstNumber: inv.customer?.gstNumber || 'Unregistered',
        taxableValue: subtotal,
        taxAmount: tax,
        totalAmount: total,
      };

      if (inv.customer?.gstNumber) {
        b2bInvoices.push(invData);
      } else {
        b2cInvoices.push(invData);
      }
    });

    // Inward Supplies (GSTR-2 / Purchase Tax / ITC)
    let totalPurchaseTaxable = 0;
    let totalITC = 0;

    bills.forEach(b => {
      totalPurchaseTaxable += (b.taxableAmount || b.totalAmount || 0);
      totalITC += (b.taxAmount || 0);
    });

    const netTaxPayable = Math.max(0, totalTaxCollected - totalITC);

    res.status(200).json({
      taxType,
      dateRange: { startDate, endDate },
      summary: {
        totalTaxableSales,
        totalTaxCollected,
        totalCGST,
        totalSGST,
        totalIGST,
        totalPurchaseTaxable,
        totalITC,
        netTaxPayable,
      },
      b2bInvoices,
      b2cInvoices,
    });
  } catch (err) {
    error(`Tax / GST Report Error: ${err.message}`);
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};

/**
 * @desc 12. Get Party-wise Profit & Loss Report
 * @route GET /api/reports/party-pl
 */
export const getPartyWisePLReport = async (req, res) => {
  try {
    const userId = req.user._id;
    const { dateFilter = 'this_month', startDate: qStart, endDate: qEnd } = req.query;
    const { startDate, endDate } = buildReportDateRange(dateFilter, qStart, qEnd);

    const [invoices, allItems] = await Promise.all([
      Invoice.find({ createdBy: userId, createdAt: { $gte: startDate, $lte: endDate } }).populate('customer', 'name phone'),
      Item.find({ addedBy: userId }),
    ]);

    const itemCostMap = {};
    allItems.forEach(it => {
      itemCostMap[it._id.toString()] = it.purchasePrice || it.purchaseRate || it.costPrice || 0;
    });

    const partyMap = {};

    invoices.forEach(inv => {
      const cId = inv.customer?._id?.toString() || 'walk-in';
      const cName = inv.customer?.name || 'Walk-in Customer';
      const cPhone = inv.customer?.phone || '';

      if (!partyMap[cId]) {
        partyMap[cId] = {
          id: cId,
          name: cName,
          phone: cPhone,
          totalRevenue: 0,
          totalCost: 0,
          totalProfit: 0,
          invoicesCount: 0,
        };
      }

      let invCost = 0;
      (inv.items || []).forEach(it => {
        const pId = typeof it.item === 'object' ? it.item?._id?.toString() : it.item?.toString();
        const cost = (pId && itemCostMap[pId]) || it.purchasePrice || (it.price ? it.price * 0.7 : 0);
        invCost += cost * (it.quantity || 1);
      });

      const invRevenue = inv.totalAmount || 0;
      partyMap[cId].invoicesCount += 1;
      partyMap[cId].totalRevenue += invRevenue;
      partyMap[cId].totalCost += invCost;
      partyMap[cId].totalProfit += (invRevenue - invCost);
    });

    const parties = Object.values(partyMap).map(p => ({
      ...p,
      marginPercent: p.totalRevenue > 0 ? Number(((p.totalProfit / p.totalRevenue) * 100).toFixed(2)) : 0,
    })).sort((a, b) => b.totalProfit - a.totalProfit);

    const totalRevenue = parties.reduce((s, p) => s + p.totalRevenue, 0);
    const totalProfit = parties.reduce((s, p) => s + p.totalProfit, 0);

    res.status(200).json({
      dateRange: { startDate, endDate },
      summary: {
        totalParties: parties.length,
        totalRevenue,
        totalProfit,
        avgMarginPercent: totalRevenue > 0 ? Number(((totalProfit / totalRevenue) * 100).toFixed(2)) : 0,
      },
      parties,
    });
  } catch (err) {
    error(`Party Wise P&L Report Error: ${err.message}`);
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};

/**
 * @desc 13. Get Party Item Report (Items bought by customer / items supplied by vendor)
 * @route GET /api/reports/party-item
 */
export const getPartyItemReport = async (req, res) => {
  try {
    const userId = req.user._id;
    const { partyType = 'customer', dateFilter = 'this_month', startDate: qStart, endDate: qEnd } = req.query;
    const { startDate, endDate } = buildReportDateRange(dateFilter, qStart, qEnd);

    const invoices = await Invoice.find({ createdBy: userId, createdAt: { $gte: startDate, $lte: endDate } })
      .populate('customer', 'name phone')
      .populate('items.item', 'name sku category');

    const itemMap = {};

    invoices.forEach(inv => {
      const cName = inv.customer?.name || 'Walk-in Customer';
      (inv.items || []).forEach(it => {
        const itemName = typeof it.item === 'object' ? it.item?.name : (it.name || 'Item');
        const key = `${cName}_${itemName}`;

        if (!itemMap[key]) {
          itemMap[key] = {
            partyName: cName,
            itemName,
            quantity: 0,
            totalAmount: 0,
            lastDate: inv.createdAt,
          };
        }

        itemMap[key].quantity += (it.quantity || 1);
        itemMap[key].totalAmount += (it.price || 0) * (it.quantity || 1);
        if (new Date(inv.createdAt) > new Date(itemMap[key].lastDate)) {
          itemMap[key].lastDate = inv.createdAt;
        }
      });
    });

    const itemsList = Object.values(itemMap).sort((a, b) => b.totalAmount - a.totalAmount);

    res.status(200).json({
      dateRange: { startDate, endDate },
      summary: {
        totalEntries: itemsList.length,
        totalQuantity: itemsList.reduce((s, i) => s + i.quantity, 0),
        totalAmount: itemsList.reduce((s, i) => s + i.totalAmount, 0),
      },
      items: itemsList,
    });
  } catch (err) {
    error(`Party Item Report Error: ${err.message}`);
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};


