# Route & Navigation Audit

## Executive Summary
This document provides a comprehensive audit of all frontend routes, sidebar navigation entries, and page components in BizManager. It identifies legacy components, duplicate route aliases, canonical implementations, and documents the consolidated sidebar architecture.

---

## Canonical Pages & Mapping

| Business Function | Canonical Page Component | Canonical Route | Former / Legacy Route(s) | Status / Action |
| :--- | :--- | :--- | :--- | :--- |
| **Dashboard** | `Dashboard.jsx` | `/dashboard` | N/A | Active |
| **POS Terminal** | `POS.jsx` | `/pos` | N/A | Active |
| **Invoices List** | `Invoice.jsx` | `/pos/invoices` | `/sales/invoices` | Consolidated |
| **Sales Invoice Form** | `SalesInvoice.jsx` | `/sales/invoice` | N/A | Form Route |
| **Sales Orders List** | `SalesOrderList.jsx` | `/sales/orders` | `/sales/sales-order-list` | Redirected |
| **Sales Order Form** | `SalesOrder.jsx` | `/sales/order` | `/sales/sales-order` | Form Route |
| **Quotations List** | `EstimateList.jsx` | `/sales/estimates` | N/A | Active |
| **Quotation Form** | `Estimate.jsx` | `/sales/estimate` | N/A | Form Route |
| **Sales Returns** | `ReturnedItems.jsx` | `/sales/returned-items` | `/sales/return` | Form / List Pair |
| **Purchases List** | `PurchaseList.jsx` | `/purchase/list` | `/purchase` | Redirected |
| **Purchase Entry Form**| `PurchaseEntry.jsx` | `/purchase/entry` | `/purchase/edit/:id` | Enhanced Form |
| **Supplier Bills** | `Bills.jsx` | `/purchase/bills` | N/A | Active |
| **Purchase Orders List**| `PurchaseOrderList.jsx` | `/purchase-orders` | `/purchase-orders/new` | Sidebar Fixed |
| **Purchase Order Form**| `PurchaseOrderForm.jsx` | `/purchase-orders/new` | N/A | Form Route |
| **Purchase Returns List**| `PurchaseReturnList.jsx` | `/purchase/returns` | `/purchase/returns/list`, `/purchase/return` | Redirected |
| **Purchase Return Form**| `PurchaseReturnFormNew.jsx` | `/purchase/returns/new` | N/A | Enhanced Form |
| **Inventory** | `Inventory.jsx` | `/inventory` | N/A | Active |
| **Customers** | `Customers.jsx` | `/customers` | N/A | Active |
| **Suppliers** | `Suppliers.jsx` | `/suppliers` | N/A | Active |
| **Cash & Bank Position**| `CashBankPosition.jsx` | `/cashbank/position` | N/A | Active |
| **Payment In List** | `PaymentInList.jsx` | `/sales/payment-in-list` | N/A | Active |
| **Payment In Form** | `PaymentIn.jsx` | `/sales/payment-in` | N/A | Form Route |
| **Payment Out List** | `PaymentOutList.jsx` | `/purchase/payment-out/list` | N/A | Active |
| **Payment Out Form** | `PaymentOut.jsx` | `/purchase/payment-out` | N/A | Form Route |
| **Expenses** | `Expenses.jsx` | `/purchase/expenses` | N/A | Active |
| **Bank Accounts** | `BankAccounts.jsx` | `/cashbank/bank-accounts` | N/A | Active |
| **Reports Dashboard** | `ReportsDashboard.jsx` | `/reports` | N/A | Active |
| **Sales Report** | `SalesReport.jsx` | `/reports/sales` | N/A | Active |
| **Approvals** | `MyApprovals.jsx` | `/approvals` | N/A | Active |

---

## Removed / Hidden Legacy Navigation

| Legacy Page | Legacy Route | Replacement Canonical Page | Reason & Action Taken |
| :--- | :--- | :--- | :--- |
| `Purchase.jsx` | `/purchase` | `PurchaseList.jsx` (`/purchase/list`) | Basic static purchase form superseded by `PurchaseEntry.jsx`. Route `/purchase` now redirects to `/purchase/list`. |
| `PurchaseReturn.jsx` | `/purchase/return` | `PurchaseReturnList.jsx` (`/purchase/returns`) | Legacy wrapper component superseded by `PurchaseReturnList.jsx`. Route `/purchase/return` now redirects to `/purchase/returns`. |
| `Reports.jsx` | N/A (Unrouted) | `ReportsDashboard.jsx` (`/reports`) | Monolithic single-page report view superseded by modular `ReportsDashboard.jsx`. Removed unused import from `App.jsx`. |

---

## Final Sidebar Hierarchy (Single Source of Truth)

```
Dashboard (/dashboard)
POS (/pos)
Sales
 ├── Invoices (/pos/invoices)
 ├── Orders (/sales/orders)
 ├── Quotations (/sales/estimates)
 └── Returns (/sales/returned-items)
Purchases
 ├── Bills (/purchase/bills)
 ├── Orders (/purchase-orders)
 └── Returns (/purchase/returns)
Inventory (/inventory)
Parties
 ├── Customers (/customers)
 └── Suppliers (/suppliers)
Finance
 ├── Overview (/cashbank/position)
 ├── Payments
 │    ├── Payment In (/sales/payment-in-list)
 │    └── Payment Out (/purchase/payment-out/list)
 ├── Expenses (/purchase/expenses)
 └── Cash & Bank (/cashbank/bank-accounts)
Reports (/reports)
More
 ├── Marketing
 │    ├── Google Business Profile (/business/google-profile)
 │    ├── WhatsApp Marketing (/business/whatsapp-marketing)
 │    ├── Marketing Tools (/business/marketing-tools)
 │    └── Online Shop (/business/online-shop)
 ├── Data & Backup
 │    ├── Backup (/sync/backup)
 │    ├── Restore (/sync/restore)
 │    └── Sync & Share (/sync/share)
 ├── Utilities
 │    ├── Barcode Generator (/utilities/barcode)
 │    ├── Import Items (/utilities/import-items)
 │    └── Data Export (/utilities/export)
 ├── Settings
 │    ├── Business Setup (/utilities/business-setup)
 │    └── Profile Settings (/profile-settings)
 └── Approvals
      ├── My Approvals (/approvals)
      └── Approval Settings (/approvals/settings)
```

---

## Verification & QA Checklist

- [x] Sidebar items map 1-to-1 to canonical list/dashboard pages.
- [x] Legacy routes redirect seamlessly to canonical routes.
- [x] No duplicate menu entries exist.
- [x] All backend APIs and functionality are untouched.
- [x] Browser automated testing validates sidebar clickthrough and page loading.
