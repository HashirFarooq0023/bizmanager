import express from "express";
import {
  getSalesReport,
  getStockReport,
  getCustomerReport,
  getDashboardStats,
  getSalesReportData,
  getSalesReportSummary,
  getSalesReportCharts,
  exportSalesReport,
  getDayBookReport,
  getProfitLossReport,
  getBillWiseProfitReport,
  getPartyStatementReport,
  getAllPartiesReport,
  getSalesByPartyReport,
  getPurchaseReport,
  getTransactionsReport,
  getCashFlowReport,
  getFinancialStatementsReport,
  getTaxReport,
  getPartyWisePLReport,
  getPartyItemReport,
} from "../controllers/reportController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/sales", protect, getSalesReport);
router.get("/stock", protect, getStockReport);
router.get("/customers", protect, getCustomerReport);
router.get("/dashboard", protect, getDashboardStats);
router.get("/dashboard-stats", protect, getDashboardStats);

// Sales Report Endpoints
router.get("/sales/data", protect, getSalesReportData);
router.get("/sales/summary", protect, getSalesReportSummary);
router.get("/sales/charts", protect, getSalesReportCharts);
router.get("/sales/export", protect, exportSalesReport);

// Operational & Financial Reports
router.get("/daybook", protect, getDayBookReport);
router.get("/profit-loss", protect, getProfitLossReport);
router.get("/bill-profit", protect, getBillWiseProfitReport);
router.get("/party-statement", protect, getPartyStatementReport);
router.get("/all-parties", protect, getAllPartiesReport);
router.get("/sales-party", protect, getSalesByPartyReport);
router.get("/purchase", protect, getPurchaseReport);
router.get("/transactions", protect, getTransactionsReport);
router.get("/cashflow", protect, getCashFlowReport);
router.get("/financial-statements", protect, getFinancialStatementsReport);
router.get("/trial-balance", protect, getFinancialStatementsReport);
router.get("/balance-sheet", protect, getFinancialStatementsReport);
router.get("/gst", protect, getTaxReport);
router.get("/party-pl", protect, getPartyWisePLReport);
router.get("/party-item", protect, getPartyItemReport);

export default router;

