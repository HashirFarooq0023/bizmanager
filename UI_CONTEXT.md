# BizManager UI Architecture & Design System Specification

A complete reference of every UI system, design token, component hierarchy, page layout, theme configuration, and state mechanism in the **BizManager** SaaS application.

---

## 1. Technical Stack & UI Foundations

- **Framework**: React 19.1 (`react`, `react-dom`, `react-router-dom` v7)
- **Styling Engine**: Tailwind CSS v4 (`@tailwindcss/vite`, `@import "tailwindcss"`)
- **State Management**: Redux Toolkit (`@reduxjs/toolkit`, `react-redux`)
- **Data Visualization**: Recharts v3.7 (`ResponsiveContainer`, `AreaChart`, `Area`, `BarChart`, `PieChart`)
- **Typography & Localization**: `i18next`, `react-i18next` (English LTR & Urdu RTL)
- **Icons**: `react-icons` (Feather `fi`, FontAwesome `fa`, Material `md`, Heroicons SVGs)
- **Notification System**: `react-toastify`

---

## 2. Design Tokens & Theming System

The app utilizes CSS Custom Properties mapped to Tailwind semantic variables with explicit support for **Light Mode** and **Deep OLED Zinc Dark Mode**.

### A. Color Palette Matrix

| Token | CSS Variable | Light Mode (`:root`) | Dark Mode (`.dark`) | Usage |
|---|---|---|---|---|
| **App Background** | `--color-bg` | `#F7F7FA` (`247 247 250`) | `#09090B` (`9 9 11`) | Main canvas background |
| **Card Surface** | `--color-card` | `#FFFFFF` (`255 255 255`) | `#18181B` (`24 24 27`) | Cards, tables, modal containers |
| **Sidebar Surface** | `--color-sidebar` | `#FFFFFF` (`255 255 255`) | `#09090B` (`9 9 11`) | Left navigation dock |
| **Input Background** | `--color-input` | `#FFFFFF` (`255 255 255`) | `#18181B` (`24 24 27`) | Text fields, selects, pickers |
| **Primary Text** | `--color-text` | `#111827` (`gray-900`) | `#F4F4F5` (`zinc-100`) | Headings, primary labels, values |
| **Secondary Text** | `--color-text-secondary` | `#4B5563` (`gray-600`) | `#A1A1AA` (`zinc-400`) | Subtitles, helper text |
| **Muted Text** | `--color-text-muted` | `#9CA3AF` (`gray-400`) | `#71717A` (`zinc-500`) | Placeholders, inactive items |
| **Default Border** | `--color-border` | `#E5E7EB` (`gray-200`) | `#27272A` (`zinc-800`) | Container dividers & outlines |
| **Primary Brand Accent** | `--color-primary` | `#7C3AED` (Violet-700) | `#8B5CF6` (Violet-500) | Buttons, active links, charts |

### B. Functional Status Accents

- **Success (Collected / In Stock / Paid)**:
  - Light: `bg-emerald-50`, `text-emerald-700`, `border-emerald-200`
  - Dark: `dark:bg-emerald-950/50`, `dark:text-emerald-400`, `dark:border-emerald-800/50`
- **Warning (Low Stock / Customer Dues)**:
  - Light: `bg-amber-50`, `text-amber-700`, `border-amber-200`
  - Dark: `dark:bg-amber-950/50`, `dark:text-amber-400`, `dark:border-amber-800/50`
- **Destructive / Alert (Out of Stock / Expenses / Loss / Logout)**:
  - Light: `bg-rose-50`, `text-rose-700`, `border-rose-200`
  - Dark: `dark:bg-rose-950/50`, `dark:text-rose-400`, `dark:border-rose-800/50`
- **Brand Metric (Net Profit / Store Analytics)**:
  - Light: `bg-violet-50`, `text-violet-700`, `border-violet-200`
  - Dark: `dark:bg-violet-950/50`, `dark:text-violet-400`, `dark:border-violet-800/50`

---

## 3. Typography & Multi-Language / RTL Architecture

- **English Font**: `Inter`, system-ui, -apple-system, sans-serif (`--font-en`)
- **Urdu Font**: `Jameel Noori Nastaleeq`, `Urdu Typesetting`, `Segoe UI` (`--font-ur`)
- **Monospace Figures**: Tabular numbers (`tabular-nums`, `font-mono`) on all currency values (`Rs. X,XXX`)
- **RTL Support**:
  - `LanguageContext` toggles `document.documentElement.dir = 'rtl' | 'ltr'` and `<html lang="ur" | "en">`
  - Layout dynamic margins:
    - **LTR**: `lg:ml-60` (expanded) or `lg:ml-16` (collapsed)
    - **RTL**: `lg:mr-60` (expanded) or `lg:mr-16` (collapsed)
  - Directional icons automatically flipped using `${isRtl ? 'scale-x-[-1]' : ''}`

---

## 4. Layout & Navigation Hierarchy

### A. Navigation Modes (`ModeContext`)
BizManager features two UX modes tailored for store owners:

1. **Asan Mode (`آسان موڈ`)**: 7 simplified, high-priority navigation items:
   - Dashboard (`/dashboard`)
   - Make Bill (`/pos` — highlighted primary green action)
   - Products (`/inventory`)
   - Udhaar Khata (`/udhaar` — red alert badge)
   - Cash in Hand (`/cashbank/cash-in-hand`)
   - Expenses (`/purchase/expenses`)
   - Reports (`/reports`)

2. **Pro Mode (`پرو موڈ`)**: Full enterprise ERP navigation tree:
   - Dashboard (`/dashboard`)
   - POS Terminal (`/pos`)
   - Udhaar Khata (`/udhaar`)
   - **Sales** (Dropdown: Invoices, Orders, Estimates, Returns, Delivery Challans)
   - **Purchases** (Dropdown: Bills, Purchase Orders, Returns, GRN)
   - **Inventory** (`/inventory`)
   - **Parties** (Dropdown: Customers, Suppliers)
   - **Finance** (Dropdown: Overview, Payments In/Out, Expenses, Cash & Bank, Cheques, Loans)
   - **Reports** (`/reports`)
   - **More** (Dropdown: Marketing, WhatsApp, Backup, Utilities, Settings, Approvals)

### B. Sidebar Architecture (`Sidebar.jsx`)
- **Desktop (>= 1024px)**: Fixed side dock with hover expansion when collapsed (`w-60` expanded, `w-16` collapsed).
- **Mobile (< 1024px)**: Slide-out drawer with high-contrast backdrop overlay (`bg-black/40 dark:bg-black/60`).
- **Control Bar**: Embedded language switcher (`EN` / `اردو`), mode switcher (`آسان` / `پرو`), dark/light theme toggle, and collapse buttons.
- **User Footer**: User avatar badge, shop name, and high-visibility logout button.

---

## 5. Component Library & Visual Archetypes

### A. Double-Bezel Hardware Card (`Card.jsx` & `StatsCard.jsx`)
A machined hardware enclosure pattern:
- **Outer Shell**: `rounded-2xl p-1 border border-slate-200/70 dark:border-zinc-800/80 bg-slate-50/40 dark:bg-zinc-950/60`
- **Inner Core**: `bg-white dark:bg-zinc-900/90 rounded-[calc(1rem-0.25rem)] border border-slate-200/80 dark:border-zinc-800/80 shadow-xs dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]`
- **Header**: Subtle divider line `border-b border-slate-100 dark:border-zinc-800/80`

### B. Interactive Buttons (`Button.jsx`)
- **Primary**: `bg-violet-700 text-white hover:bg-violet-800 shadow-xs active:scale-[0.98]`
- **Secondary**: `bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-200 hover:bg-slate-50 dark:hover:bg-zinc-800`
- **Danger**: `bg-rose-600 text-white hover:bg-rose-700`

### C. Status Badges (`StatusBadge.jsx`)
Pill badges with matched border and background opacities:
- `PAID` / `IN_STOCK`: Green (`bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300`)
- `LOW_STOCK` / `PARTIAL`: Amber (`bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300`)
- `OUT_OF_STOCK` / `UNPAID`: Red (`bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300`)

---

## 6. Page-by-Page UI Breakdown

### 1. Dashboard (`/dashboard`)
- **Hero Banner**: Store live telemetry status, greeting, quick action buttons (`New Sale`, `Udhaar Khata`, `Add Product`, `Add Customer`).
- **5-Column Metric Grid**: Total Revenue, Collected Cash, Customer Dues, Total Expenses, Net Profit.
- **Collapsible Liquidity Row**: Supplier Payables, Total Inventory Value, Cash in Hand, Bank Accounts.
- **Sales Performance Chart**: 30-day continuous Recharts `AreaChart` with theme-aware grid and custom hover tooltip.
- **Actionable Low Stock Table**: Lists items with $0$ stock or stock below limit with SKU, available quantities, and quick reorder action.
- **Top Receivables List**: Top 5 customers with highest outstanding debt.

### 2. POS Terminal (`/pos`)
- **3-Panel Layout**: Category filter tabs, barcode scanner / quick search, cart line items, and tender drawer.
- **Multi-Tab Cart**: Hold, switch, and resume multiple concurrent orders without data loss.
- **Tender & Change Calculation**: Automatic change computation on overpayment with support for walk-in and registered customers.
- **Split Payment Modal**: Responsive multi-payment splits (Cash, Card, Bank, Credit) with real-time balance validation.

### 3. Udhaar Khata (`/udhaar`)
- **Receivables & Payables Ledger**: Customer dues breakdown, credit balances, payment settlement drawers, and WhatsApp payment reminder sharing.

### 4. Inventory Management (`/inventory`)
- **Stock Grid**: Filter by Category, Low Stock, and Out of Stock. Batch tracking, barcode generator, Excel/CSV import/export, and stock adjustments.

---

## 7. State Management & Data Flow Architecture

```
Redux Store (Root)
├── authSlice        -> Current user, token, shop credentials, Google auth
├── reportsSlice     -> dashboardStats, dailySales, lowStockItemsList, revenueVsExpenses
├── expenseSlice     -> Store operational expenses
├── billSlice        -> Supplier purchase bills and aging
├── inventorySlice   -> Products catalog, stockQty, lowStockLimit
├── customerSlice    -> Customer profiles, dues ledger, advance credit
└── posSlice / Cart  -> Active cart items, held bills, payment tender
```
