import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ToastContainer } from "react-toastify";
import { ThemeProvider } from './contexts/ThemeContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { ModeProvider } from './contexts/ModeContext';
import CookieConsent from './components/CookieConsent';
import { useDocumentMeta } from './utils/useDocumentTitle';
import { migrateUserStorage } from './utils/migrateUserStorage';

// Eagerly Loaded Public & Auth Pages (Fast Initial Load)
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import PrivacyPolicy from './pages/PrivacyPolicy';
import Terms from './pages/Terms';
import NotFound from './pages/NotFound';

// Code-Split Protected & Heavy ERP Modules (Performance Optimization)
const Dashboard = lazy(() => import('./pages/Dashboard'));
const UdhaarKhata = lazy(() => import('./pages/UdhaarKhata'));
const ProfileSettings = lazy(() => import('./pages/ProfileSettings'));
const Customers = lazy(() => import('./pages/Customers'));
const AddCustomer = lazy(() => import('./pages/AddCustomer'));
const EditCustomer = lazy(() => import('./pages/EditCustomer'));
const CustomerDetail = lazy(() => import('./pages/CustomerDetail'));
const DueAdjustment = lazy(() => import('./pages/DueAdjustment'));
const CustomersWithDues = lazy(() => import('./pages/CustomersWithDues'));
const Suppliers = lazy(() => import('./pages/Suppliers'));
const AddSupplier = lazy(() => import('./pages/AddSupplier'));
const EditSupplier = lazy(() => import('./pages/EditSupplier'));
const SupplierDetail = lazy(() => import('./pages/SupplierDetail'));
const Inventory = lazy(() => import('./pages/Inventory'));
const AddItem = lazy(() => import('./pages/AddItem'));
const EditItem = lazy(() => import('./pages/EditItem'));
const POS = lazy(() => import('./pages/POS'));
const Invoices = lazy(() => import('./pages/Invoice'));
const InvoiceDetail = lazy(() => import('./pages/InvoiceDetail'));

// Sales Module
const SalesInvoice = lazy(() => import('./pages/sales/SalesInvoice'));
const SalesInvoiceDetail = lazy(() => import('./pages/sales/SalesInvoiceDetail'));
const Estimate = lazy(() => import('./pages/sales/Estimate'));
const EstimateList = lazy(() => import('./pages/sales/EstimateList'));
const EstimateDetail = lazy(() => import('./pages/sales/EstimateDetail'));
const PaymentIn = lazy(() => import('./pages/sales/PaymentIn'));
const PaymentInList = lazy(() => import('./pages/sales/PaymentInList'));
const PaymentReceiptDetail = lazy(() => import('./pages/sales/PaymentReceiptDetail'));
const SalesOrder = lazy(() => import('./pages/sales/SalesOrder'));
const SalesOrderList = lazy(() => import('./pages/sales/SalesOrderList'));
const SalesOrderDetail = lazy(() => import('./pages/sales/SalesOrderDetail'));
const DeliveryChallan = lazy(() => import('./pages/sales/DeliveryChallan'));
const DeliveryChallanList = lazy(() => import('./pages/sales/DeliveryChallanList'));
const DeliveryChallanDetail = lazy(() => import('./pages/sales/DeliveryChallanDetail'));
const Return = lazy(() => import('./pages/sales/Return'));
const ReturnedItems = lazy(() => import('./pages/sales/ReturnedItems'));

// Purchase Module
const PurchaseEntry = lazy(() => import('./pages/purchase/PurchaseEntry'));
const PurchaseList = lazy(() => import('./pages/purchase/PurchaseList'));
const PurchaseDetail = lazy(() => import('./pages/purchase/PurchaseDetail'));
const Bills = lazy(() => import('./pages/purchase/Bills'));
const BillDetail = lazy(() => import('./pages/purchase/BillDetail'));
const BillAging = lazy(() => import('./pages/purchase/BillAging'));
const PaymentOut = lazy(() => import('./pages/purchase/PaymentOut'));
const PaymentOutList = lazy(() => import('./pages/purchase/PaymentOutList'));
const PaymentOutDetail = lazy(() => import('./pages/purchase/PaymentOutDetail'));
const Expenses = lazy(() => import('./pages/purchase/Expenses'));
const PurchaseReturnList = lazy(() => import('./pages/purchase/PurchaseReturnList'));
const PurchaseReturnFormNew = lazy(() => import('./pages/purchase/PurchaseReturnFormNew'));
const PurchaseReturnDetail = lazy(() => import('./pages/purchase/PurchaseReturnDetail'));
const PurchaseOrderList = lazy(() => import('./pages/purchase/PurchaseOrderList'));
const PurchaseOrderForm = lazy(() => import('./pages/purchase/PurchaseOrderForm'));
const PurchaseOrderDetail = lazy(() => import('./pages/purchase/PurchaseOrderDetail'));
const GRNList = lazy(() => import('./pages/purchase/GRNList'));
const GRNForm = lazy(() => import('./pages/purchase/GRNForm'));
const GRNDetail = lazy(() => import('./pages/purchase/GRNDetail'));

// Reports
const ReportsDashboard = lazy(() => import('./pages/reports/ReportsDashboard'));
const SalesReport = lazy(() => import('./pages/reports/SalesReport'));
const PurchaseReturnAnalytics = lazy(() => import('./pages/reports/PurchaseReturnAnalytics'));

// Approvals
const MyApprovals = lazy(() => import('./pages/approvals/MyApprovals'));
const ApprovalSettings = lazy(() => import('./pages/approvals/ApprovalSettings'));

// Cash & Bank
const BankAccounts = lazy(() => import('./pages/cashbank/BankAccounts'));
const CashInHand = lazy(() => import('./pages/cashbank/CashInHand'));
const Transfers = lazy(() => import('./pages/cashbank/Transfers'));
const Cheques = lazy(() => import('./pages/cashbank/Cheques'));
const LoanAccounts = lazy(() => import('./pages/cashbank/LoanAccounts'));
const AccountLedger = lazy(() => import('./pages/cashbank/AccountLedger'));
const BankSummary = lazy(() => import('./pages/cashbank/BankSummary'));
const CashBankPosition = lazy(() => import('./pages/cashbank/CashBankPosition'));

// Business Growth
const OnlineShop = lazy(() => import('./pages/business/OnlineShop'));
const GoogleProfile = lazy(() => import('./pages/business/GoogleProfile'));
const MarketingTools = lazy(() => import('./pages/business/MarketingTools'));
const WhatsAppMarketing = lazy(() => import('./pages/business/WhatsAppMarketing'));

// Sync & Backup
const SyncShare = lazy(() => import('./pages/sync/SyncShare'));
const Backup = lazy(() => import('./pages/sync/Backup'));
const Restore = lazy(() => import('./pages/sync/Restore'));

// Utilities
const BarcodeGenerator = lazy(() => import('./pages/utilities/BarcodeGenerator'));
const ImportItems = lazy(() => import('./pages/utilities/ImportItems'));
const BusinessSetup = lazy(() => import('./pages/utilities/BusinessSetup'));
const DataExport = lazy(() => import('./pages/utilities/DataExport'));

// Elegant Loading Fallback for Lazy-Loaded Routes
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#07090F] text-slate-900 dark:text-slate-100">
    <div className="flex flex-col items-center gap-3">
      <div className="w-9 h-9 border-3 border-violet-600 border-t-transparent rounded-full animate-spin" />
      <span className="text-xs font-semibold text-slate-500 dark:text-zinc-400 font-sans tracking-wide">
        Loading BizManager...
      </span>
    </div>
  </div>
);

// Dynamic Document Meta Updater Component
const MetaTracker = () => {
  useDocumentMeta();
  return null;
};

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user } = useSelector((state) => state.auth);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Public Route Component (redirect to dashboard if already logged in)
const PublicRoute = ({ children }) => {
  const { user } = useSelector((state) => state.auth);

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

function App() {
  // Run migration on app startup to fix user data structure
  migrateUserStorage();

  return (
    <LanguageProvider>
      <ModeProvider>
        <ThemeProvider>
          <div className="min-h-screen bg-app text-main transition-colors duration-300">
            <ToastContainer />
            <Router>
              <MetaTracker />
              <CookieConsent />
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  {/* Public Landing Page */}
                  <Route path="/" element={<LandingPage />} />

                  {/* Public Legal & Info Pages */}
                  <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                  <Route path="/terms" element={<Terms />} />

                  {/* Public Auth Routes */}
                  <Route
                    path="/login"
                    element={
                      <PublicRoute>
                        <Login />
                      </PublicRoute>
                    }
                  />
                  <Route
                    path="/register"
                    element={
                      <PublicRoute>
                        <Register />
                      </PublicRoute>
                    }
                  />
                  <Route
                    path="/forgot-password"
                    element={
                      <PublicRoute>
                        <ForgotPassword />
                      </PublicRoute>
                    }
                  />
                  <Route
                    path="/reset-password"
                    element={
                      <PublicRoute>
                        <ResetPassword />
                      </PublicRoute>
                    }
                  />

                  {/* Protected Routes */}
                  <Route
                    path="/dashboard"
                    element={
                      <ProtectedRoute>
                        <Dashboard />
                      </ProtectedRoute>
                    }
                  />

                  <Route
                    path="/udhaar"
                    element={
                      <ProtectedRoute>
                        <UdhaarKhata />
                      </ProtectedRoute>
                    }
                  />

                  <Route
                    path="/profile-settings"
                    element={
                      <ProtectedRoute>
                        <ProfileSettings />
                      </ProtectedRoute>
                    }
                  />

                  {/* Customer Routes */}
                  <Route path="/customers">
                    <Route
                      index
                      element={
                        <ProtectedRoute>
                          <Customers />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="add"
                      element={
                        <ProtectedRoute>
                          <AddCustomer />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="edit/:id"
                      element={
                        <ProtectedRoute>
                          <EditCustomer />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="adjust-due/:id"
                      element={
                        <ProtectedRoute>
                          <DueAdjustment />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="with-dues"
                      element={
                        <ProtectedRoute>
                          <CustomersWithDues />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path=":id"
                      element={
                        <ProtectedRoute>
                          <CustomerDetail />
                        </ProtectedRoute>
                      }
                    />
                  </Route>

                  {/* Supplier Routes */}
                  <Route path="/suppliers">
                    <Route
                      index
                      element={
                        <ProtectedRoute>
                          <Suppliers />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="add"
                      element={
                        <ProtectedRoute>
                          <AddSupplier />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path=":id/edit"
                      element={
                        <ProtectedRoute>
                          <EditSupplier />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path=":id"
                      element={
                        <ProtectedRoute>
                          <SupplierDetail />
                        </ProtectedRoute>
                      }
                    />
                  </Route>

                  {/* Inventory Routes */}
                  <Route path="/inventory">
                    <Route
                      index
                      element={
                        <ProtectedRoute>
                          <Inventory />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="add"
                      element={
                        <ProtectedRoute>
                          <AddItem />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="edit/:id"
                      element={
                        <ProtectedRoute>
                          <EditItem />
                        </ProtectedRoute>
                      }
                    />
                  </Route>

                  {/* POS Routes */}
                  <Route path="/pos">
                    <Route
                      index
                      element={
                        <ProtectedRoute>
                          <POS />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="invoices"
                      element={
                        <ProtectedRoute>
                          <Invoices />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="invoice/:id"
                      element={
                        <ProtectedRoute>
                          <InvoiceDetail />
                        </ProtectedRoute>
                      }
                    />
                  </Route>

                  {/* Sales Routes */}
                  <Route path="/sales">
                    <Route path="invoices" element={<ProtectedRoute><Invoices /></ProtectedRoute>} />
                    <Route path="invoice" element={<ProtectedRoute><SalesInvoice /></ProtectedRoute>} />
                    <Route path="invoice/:id" element={<ProtectedRoute><SalesInvoiceDetail /></ProtectedRoute>} />
                    <Route path="estimate" element={<ProtectedRoute><Estimate /></ProtectedRoute>} />
                    <Route path="estimates" element={<ProtectedRoute><EstimateList /></ProtectedRoute>} />
                    <Route path="estimate/:id" element={<ProtectedRoute><EstimateDetail /></ProtectedRoute>} />
                    <Route path="payment-in" element={<ProtectedRoute><PaymentIn /></ProtectedRoute>} />
                    <Route path="payment-in-list" element={<ProtectedRoute><PaymentInList /></ProtectedRoute>} />
                    <Route path="payment-in/:id" element={<ProtectedRoute><PaymentReceiptDetail /></ProtectedRoute>} />
                    <Route path="orders" element={<ProtectedRoute><SalesOrderList /></ProtectedRoute>} />
                    <Route path="sales-order-list" element={<Navigate to="/sales/orders" replace />} />
                    <Route path="sales-order" element={<ProtectedRoute><SalesOrder /></ProtectedRoute>} />
                    <Route path="sales-order/:id" element={<ProtectedRoute><SalesOrderDetail /></ProtectedRoute>} />
                    <Route path="order" element={<ProtectedRoute><SalesOrder /></ProtectedRoute>} />
                    <Route path="delivery-challan" element={<ProtectedRoute><DeliveryChallan /></ProtectedRoute>} />
                    <Route path="delivery-challan-list" element={<ProtectedRoute><DeliveryChallanList /></ProtectedRoute>} />
                    <Route path="delivery-challan/:id" element={<ProtectedRoute><DeliveryChallanDetail /></ProtectedRoute>} />
                    <Route path="return" element={<ProtectedRoute><Return /></ProtectedRoute>} />
                    <Route path="returned-items" element={<ProtectedRoute><ReturnedItems /></ProtectedRoute>} />
                  </Route>

                  {/* Purchase Routes */}
                  <Route path="/purchase">
                    <Route index element={<Navigate to="/purchase/list" replace />} />
                    <Route path="entry" element={<ProtectedRoute><PurchaseEntry /></ProtectedRoute>} />
                    <Route path="edit/:id" element={<ProtectedRoute><PurchaseEntry /></ProtectedRoute>} />
                    <Route path="list" element={<ProtectedRoute><PurchaseList /></ProtectedRoute>} />
                    <Route path=":id" element={<ProtectedRoute><PurchaseDetail /></ProtectedRoute>} />
                    <Route path="bills" element={<ProtectedRoute><Bills /></ProtectedRoute>} />
                    <Route path="bills/:id" element={<ProtectedRoute><BillDetail /></ProtectedRoute>} />
                    <Route path="bills/aging" element={<ProtectedRoute><BillAging /></ProtectedRoute>} />
                    <Route path="payment-out" element={<ProtectedRoute><PaymentOut /></ProtectedRoute>} />
                    <Route path="payment-out/list" element={<ProtectedRoute><PaymentOutList /></ProtectedRoute>} />
                    <Route path="payment-out/:id" element={<ProtectedRoute><PaymentOutDetail /></ProtectedRoute>} />
                    <Route path="expenses" element={<ProtectedRoute><Expenses /></ProtectedRoute>} />

                    {/* Purchase Returns Routes */}
                    <Route path="returns" element={<ProtectedRoute><PurchaseReturnList /></ProtectedRoute>} />
                    <Route path="returns/list" element={<ProtectedRoute><PurchaseReturnList /></ProtectedRoute>} />
                    <Route path="returns/new" element={<ProtectedRoute><PurchaseReturnFormNew /></ProtectedRoute>} />
                    <Route path="returns/:id" element={<ProtectedRoute><PurchaseReturnDetail /></ProtectedRoute>} />
                    <Route path="returns/:id/edit" element={<ProtectedRoute><PurchaseReturnFormNew /></ProtectedRoute>} />
                    <Route path="return" element={<Navigate to="/purchase/returns" replace />} />
                  </Route>

                  {/* Purchase Order Routes */}
                  <Route path="/purchase-orders">
                    <Route index element={<ProtectedRoute><PurchaseOrderList /></ProtectedRoute>} />
                    <Route path="new" element={<ProtectedRoute><PurchaseOrderForm /></ProtectedRoute>} />
                    <Route path=":id" element={<ProtectedRoute><PurchaseOrderDetail /></ProtectedRoute>} />
                    <Route path=":id/edit" element={<ProtectedRoute><PurchaseOrderForm /></ProtectedRoute>} />
                  </Route>

                  {/* GRN Routes */}
                  <Route path="/grns">
                    <Route index element={<ProtectedRoute><GRNList /></ProtectedRoute>} />
                    <Route path="new" element={<ProtectedRoute><GRNForm /></ProtectedRoute>} />
                    <Route path=":id" element={<ProtectedRoute><GRNDetail /></ProtectedRoute>} />
                  </Route>

                  {/* Cash & Bank Routes */}
                  <Route path="/cashbank">
                    <Route path="bank-accounts" element={<ProtectedRoute><BankAccounts /></ProtectedRoute>} />
                    <Route path="cash-in-hand" element={<ProtectedRoute><CashInHand /></ProtectedRoute>} />
                    <Route path="cheques" element={<ProtectedRoute><Cheques /></ProtectedRoute>} />
                    <Route path="loan-accounts" element={<ProtectedRoute><LoanAccounts /></ProtectedRoute>} />
                    <Route path="position" element={<ProtectedRoute><CashBankPosition /></ProtectedRoute>} />
                    <Route path="summary" element={<ProtectedRoute><BankSummary /></ProtectedRoute>} />
                  </Route>
                  <Route path="/transfers" element={<ProtectedRoute><Transfers /></ProtectedRoute>} />

                  {/* Business Growth Routes */}
                  <Route path="/business">
                    <Route path="online-shop" element={<ProtectedRoute><OnlineShop /></ProtectedRoute>} />
                    <Route path="google-profile" element={<ProtectedRoute><GoogleProfile /></ProtectedRoute>} />
                    <Route path="marketing-tools" element={<ProtectedRoute><MarketingTools /></ProtectedRoute>} />
                    <Route path="whatsapp-marketing" element={<ProtectedRoute><WhatsAppMarketing /></ProtectedRoute>} />
                  </Route>

                  {/* Sync & Backup Routes */}
                  <Route path="/sync">
                    <Route path="share" element={<ProtectedRoute><SyncShare /></ProtectedRoute>} />
                    <Route path="backup" element={<ProtectedRoute><Backup /></ProtectedRoute>} />
                    <Route path="restore" element={<ProtectedRoute><Restore /></ProtectedRoute>} />
                  </Route>

                  {/* Utilities Routes */}
                  <Route path="/utilities">
                    <Route path="barcode" element={<ProtectedRoute><BarcodeGenerator /></ProtectedRoute>} />
                    <Route path="import-items" element={<ProtectedRoute><ImportItems /></ProtectedRoute>} />
                    <Route path="business-setup" element={<ProtectedRoute><BusinessSetup /></ProtectedRoute>} />
                    <Route path="export" element={<ProtectedRoute><DataExport /></ProtectedRoute>} />
                  </Route>

                  {/* Approvals Routes */}
                  <Route path="/approvals">
                    <Route index element={<ProtectedRoute><MyApprovals /></ProtectedRoute>} />
                    <Route path="settings" element={<ProtectedRoute><ApprovalSettings /></ProtectedRoute>} />
                  </Route>

                  {/* Reports Route */}
                  <Route path="/reports" element={<ProtectedRoute><ReportsDashboard /></ProtectedRoute>} />
                  <Route path="/reports/sales" element={<ProtectedRoute><SalesReport /></ProtectedRoute>} />
                  <Route path="/reports/purchase-returns" element={<ProtectedRoute><PurchaseReturnAnalytics /></ProtectedRoute>} />

                  {/* Custom 404 Route */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </Router>
          </div>
        </ThemeProvider>
      </ModeProvider>
    </LanguageProvider>
  );
}

export default App;
