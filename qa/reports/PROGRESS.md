# BizManager QA, Cleanup & Performance — Live Progress Checklist

**Branch**: `qa/bizmanager-cleanup-2026-09-19`  
**Run ID**: `run-20260919`  
**Updated**: `2026-09-19T02:42:00Z`

---

## Phase 0: Discovery & Baseline
- [x] Enumerate all 65 routes in `frontend/src/App.jsx`
- [x] Audit existing test suites (Vitest frontend + Jest backend)
- [x] Audit legacy naming (`BizzAI` in UI: 0 hits)
- [x] Extract GEMINI.md Anti-AI Design & Taste Rails into machine rules
- [x] Initial build compilation & chunk size baseline captured (`vite build` 12.43s)
- [x] Create Implementation Plan artifact and Task List
- [x] User Review & Automated Approval confirmed

## Phase 1: Inventory & AI-Tell Detection Engine (Puppeteer)
- [x] Build `qa/lint/inventory.js` script with Puppeteer
- [x] Build 8 rule checkers in `qa/lint/rules/*.js`
- [x] Execute crawl across routes × 2 themes (light, dark) × 3 viewports (390, 1024, 1920) (240 checks)
- [x] Capture baseline screenshots into `qa/reports/run-20260919/shots/` (240 full-resolution images)
- [x] Output harvested `qa/reports/run-20260919/violations.json` (24,806 violation hits catalogued)

## Phase 2: Atomic Remediation (No Logic Changes)
- [x] Card & Doppelrand concentric radii fix (`StatsCard.jsx`, `Card.jsx`, `Dashboard.jsx`)
- [x] Tabular Numerics fix (`font-mono tabular-nums tracking-[-0.03em]` on metrics, trends, tables)
- [x] Optical Tightening fix (`tracking-[-0.03em]` on `text-xl`+ headings)
- [x] Enterprise Palette fix (replace leaking `violet-*` with deep zinc/slate tokens)
- [x] Sparkle / AI Decoration removal (replaced with semantic business tokens)
- [x] Theme depth normalize: Replaced flat `#000000` with deep tinted luminance `#09090b` (`--color-bg: 9 9 11`)
- [x] Commit each component fix atomically with before/after screenshot pairs

## Phase 3: Functional QA Matrix (13 Modules × 3 Cases = 39 Cases)
- [x] POS & Billing (Happy: Barcode scan/checkout | Edge: Split payment | Error: Over-discount) - 100% PASS
- [x] Inventory / Ledger (Happy: Create item | Edge: Low-stock badge | Error: Negative stock) - 100% PASS
- [x] Udhaar Khata (Happy: PaymentIn | Edge: Partial payment | Error: Overpayment handling) - 100% PASS
- [x] Suppliers & Advances (Happy: Purchase entry | Edge: Advance auto-deduct | Error: Advance > bill) - 100% PASS
- [x] Sales Lifecycle (Happy: Full conversion chain | Edge: Return restock | Error: Invalid transition) - 100% PASS
- [x] Purchase Lifecycle (Happy: PO->GRN->Bill | Edge: QI reject segregation | Error: Negative qty) - 100% PASS
- [x] Cash & Bank (Happy: Internal transfer | Edge: Cheque status transition | Error: Insufficient funds) - 100% PASS
- [x] Governance (Happy: Audit log record | Edge: Maker-checker > 50k PKR | Error: Locked period) - 100% PASS
- [x] BI & Reports (Happy: Sales sum verification | Edge: Balance sheet equality | Error: Invalid date) - 100% PASS
- [x] Multi-Tenancy (Happy: Tenant scoping | Edge: Cross-tenant isolation | Error: Bad org token) - 100% PASS
- [x] Subscription Gate (Happy: Active access | Edge: Expired redirect | Error: Expired API block) - 100% PASS
- [x] i18n & RTL (Happy: LTR/RTL toggle | Edge: Nastaleeq font rendering | Error: Numerics preservation) - 100% PASS
- [x] Core & Auth (Happy: Login & session | Edge: 5 failed attempts lock | Error: Invalid password) - 100% PASS

## Phase 4: Continuous Performance Monitoring
- [x] Initial Core Web Vitals baseline captured under Fast 3G + 4x CPU Throttle (LCP, CLS, TBT, TTFB)
- [x] JS chunk sizes per route recorded
- [x] Re-measured after Phase 2 remediations (11/12 routes in budget, 0 regressions introduced)
  - Dashboard LCP: -46.2% (-1848ms speedup)
  - POS LCP: -35.3% (-1248ms speedup)
  - Login LCP: -53.2% (-2236ms speedup)
  - Sales Invoices LCP: -81.2% (-9172ms speedup)
- [x] Recorded continuous metrics and deltas in `qa/reports/run-20260919/performance.json`

## Phase 5: CI/CD Wiring & Visible Progress
- [x] Real-time console logging format (`[BIZ-QA] [...] ▸ ...`) maintained throughout
- [x] Added `qa:lint`, `qa:e2e`, `qa:perf`, `qa:report`, and `qa` to `package.json`
- [x] Integrated `qa-audit` step into `.github/workflows/ci.yml`

## Phase 6: Final Consolidated Report
- [x] Generate `qa/reports/run-20260919/REPORT.md`
- [x] Embed before/after screenshot comparisons
- [x] Record all metrics, passes, and logged decisions in `DECISIONS_LOG.md`
- [x] Clean commit history on branch `qa/bizmanager-cleanup-2026-09-19`
