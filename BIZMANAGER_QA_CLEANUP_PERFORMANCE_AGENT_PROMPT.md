# BizManager — AI-Tell Cleanup, Functional QA & Performance Audit (Agent Build Prompt)

> **How to use:** place this file in `D:\MegaTrix\bizmanager\` next to `README.md` and `GEMINI.md`, then start the agent with:
> `Read BIZMANAGER_QA_CLEANUP_PERFORMANCE_AGENT_PROMPT.md, GEMINI.md, README.md, docs/architecture.md, and docs/PAGES_WORKING_GUIDE.txt. Execute Phase 0 first and report before writing any code.`

---

## 0. Role & critical operating mode

You are running **unattended** for an extended window with no one available to answer questions. Terminal auto-execution and the review policy are already set to proceed automatically. This changes how you must work, not just what you must do:

- **Never stop and wait.** There is no one to unblock you. If a decision is genuinely ambiguous, make the more conservative choice, write it to `qa/reports/DECISIONS_LOG.md` with your reasoning, and keep going. A finished report with a logged judgment call is useful; a run that halted at hour one asking a question nobody could answer is not.
- **Work on a branch, never on `main`.** Branch `qa/bizmanager-cleanup-<date>`. Commit in small, atomic, clearly-labelled steps. Open a pull request at the end with the full report in the PR description. **Never merge. Never push to `main`. Never deploy. Never touch production data.**
- **This is a cleanup + QA + performance pass — not a redesign.** No new features, no information-architecture changes, no navigation restructuring, no backend schema or business-logic changes, no dependency upgrades. The person explicitly does not want the overall structure or UI/UX touched — only three things: strip AI-generated tells, prove every function still works with real test cases, and measure performance before and after every change.
- **Stay loud the entire time.** Silence for more than 10 seconds is a failure mode here — see §7.

When the person returns, two things must both be demonstrably true, with evidence, not just a claim:
1. Every AI-generated visual tell is gone and the app now reads as a deliberately designed enterprise product.
2. Every one of the 13 modules still works exactly as before, verified by multiple real test cases per feature, with no performance regression introduced by the cleanup itself.

---

## 1. Repo facts (do not re-derive)

| Item | Value |
|---|---|
| Repo | `D:\MegaTrix\bizmanager` |
| Frontend | React 19 + Vite 7 + React Router v7 + Tailwind CSS v4, Redux Toolkit, Recharts, i18next — `http://localhost:5173` |
| Backend | Node.js (ESM) + Express 4.21 + Mongoose 8.19 / MongoDB Atlas + Redis/BullMQ, Sentry, Winston — `http://localhost:5000` |
| Run | `npm run dev` (both) or `npm run dev:backend` / `npm run dev:frontend` |
| Demo account | `demo@bizzai.com` / `Demo@123` — **sandbox/local only, never run destructive tests against anything that could be a shared or production database** |
| Health check | `http://localhost:5000/api/health` |
| Design rulebook | `GEMINI.md` at repo root — read this before anything else; it already defines the target aesthetic |
| Part of | the MegaTrix ecosystem; connects to `megatrix-admin` via `x-megatrix-service-key` — do not touch that integration |

---

## 2. Phase 0 — Read the project's own rulebook, then report

Before writing or changing anything:

```bash
cat GEMINI.md README.md docs/architecture.md docs/PAGES_WORKING_GUIDE.txt
rg -n "\"path\":|element:|<Route" frontend/src/App.jsx
fd . frontend/src/pages -e jsx
fd . .github/workflows 2>/dev/null
cat package.json | grep -A5 '"scripts"'
```

`GEMINI.md` already documents **"Anti-AI Design & Taste Rails"** — this is not something you need to invent. Quoted directly from the project's own docs:

- **Double-Bezel (Doppelrand):** elevated cards use concentric calculated radii (`rounded-[calc(2rem-0.375rem)]`) with soft layered borders.
- **Tabular Numerics:** every currency value (PKR), stock count, timestamp, and metric card uses `font-mono tabular-nums`.
- **Optical Tightening:** headings use `tracking-[-0.03em]`.
- **Clean Enterprise SaaS:** deep zincs (`#09090b`) and slate contrasts — explicitly **no generic rainbow gradients or gimmicky AI sparkle badges.**

Your job in this project is to **hold the live app to the standard it already claims to meet**, and fix the places where implementation drifted from the documented rule — not to design something new. Treat every bullet above as a machine-checkable rule (§4) rather than a vibe.

Also in Phase 0, enumerate:
- Every route from `frontend/src/App.jsx` (the doc says 40+ pages across POS, Inventory, Sales, Purchase, Udhaar Khata, Suppliers, Cash & Bank, Governance, Reports).
- Whether a test suite or CI workflow already exists (don't duplicate — extend).
- Whether `frontend/src` still contains any reference to the old name `BizzAI` in rendered UI (title, footer, email templates, PDF headers) — the product was renamed and half-migrated names are a common leftover.

Produce an Implementation Plan artifact (routes found, rules to check, modules to test, performance baseline plan) and a Task List with one task per phase below, before touching any file.

---

## 3. What "AI tell" means here — be concrete, not vibes-based

Every rule below maps to something in GEMINI.md or is a well-known agentic-coding-tool leftover. Log route, selector, the specific rule broken, and a screenshot for every hit.

| Rule | What to flag |
|---|---|
| **Doppelrand violation** | An elevated card with a single flat border/radius instead of the documented concentric double-bezel — the generic "AI template card" look |
| **Numerics violation** | A PKR value, stock count, or timestamp NOT set in `font-mono tabular-nums` — causes columns to visibly wobble, a classic tell |
| **Tightening violation** | A heading at default browser letter-spacing instead of `tracking-[-0.03em]` |
| **Palette violation** | Any default Tailwind/shadcn accent leaking in (indigo-500, violet-600, emerald-400-on-pink, etc.) instead of the documented deep zinc/slate system; any card painted with a tinted background wash |
| **Sparkle/wand tell (zero tolerance)** | Any `Sparkles`, `Wand2`, `Bot`, `Cpu`, magic-wand, or four-point-star/diamond icon used as decoration; any badge or pill reading "AI", "Generated", "Powered by", "Beta AI", "Smart", etc.; any gradient glow behind a button that exists purely for the "AI shimmer" effect |
| **Boilerplate leftovers** | Default Vite/React favicon or `<title>`, unedited meta tags, placeholder Lorem ipsum, a default robot/avatar image, any visible `BizzAI` naming left over from the rename |
| **Rainbow/gradient cards** | Multiple unrelated hues on one KPI row (GEMINI.md's own words: "no generic rainbow gradients") |
| **Icon soup** | Mixed icon libraries, mismatched stroke weights, non-square icon boxes next to square ones |

If the live app is actually already clean on some of these — say so plainly in the report rather than manufacturing findings. The goal is truth, not a quota of fixes.

---

## 4. Phase 1 — Inventory & detection (Puppeteer)

Build `qa/lint/inventory.js`: crawl every enumerated route, at both light and dark theme (the doc confirms both exist) and at three viewports (390 / 1024 / 1920), harvesting computed styles the same way a design-lint tool would — background, border, border-radius, font-family, font-variant-numeric, letter-spacing, box-shadow, and a flag for any SVG/icon component name matching the sparkle/wand/bot list in §3.

Screenshot **every route × theme × viewport** combination to `qa/reports/<runId>/shots/`, written to disk as each is captured, never buffered.

Run the rule engine (`qa/lint/rules/*.js`, one file per row in §3's table) against the harvested inventory and produce `qa/reports/<runId>/violations.json`.

---

## 5. Phase 2 — Remediation

- Fix only what Phase 1 flagged. Pull replacement values from the project's **own** Tailwind config / CSS variables — never invent a new color, radius, or font stack.
- One component or page per commit, clearly labelled (`fix(pos): replace sparkle icon with lucide Receipt, apply doppelrand to KPI card`).
- **Never touch business logic on a node while fixing its decoration.** If a button has a sparkle icon AND a working `onClick`, remove the icon, keep the handler untouched. If you cannot tell whether an element carries functional weight, leave it and log it rather than guessing.
- Every fix gets a before/after screenshot pair in the report.
- Leave `GEMINI.md` itself alone — it is the rulebook you're enforcing, not a defect. If reality and the doc genuinely can't be reconciled without a product decision, log it in `DECISIONS_LOG.md` rather than editing the doc yourself.

---

## 6. Phase 3 — Functional QA (Playwright), multiple test cases per module

This is the part that proves the cleanup didn't break anything. Build a real per-module matrix — not a generic template — using the 13 modules the project's own docs enumerate. Every row below needs **at least a happy path, one edge case, and one error/validation case** — that is what "multiple test cases" means here, and the report must show all three per row, not just a pass/fail summary.

| Module | Cases to cover |
|---|---|
| **POS & Billing** | Barcode/SKU scan adds correct item; split payment (cash + Udhaar) totals correctly; stock decrements exactly on checkout; over-discount beyond allowed limit is rejected; thermal + A4 print both render |
| **Inventory / Stock Ledger** | Low-stock alert fires at threshold; stock ledger shows correct opening/incoming/outgoing/closing after a manual adjustment; negative-stock attempt is blocked or flagged per business rule |
| **Udhaar Khata** | Due balance updates correctly after a `PaymentIn`; partial payment leaves correct remaining due; overpayment is handled (rejected or credited, whichever the app does — confirm and record which) |
| **Suppliers & Advances** | Supplier advance auto-deducts on the next purchase bill; advance exceeding the bill total is handled without a negative-balance bug |
| **Sales lifecycle** | Full chain Estimate → Sales Order → Delivery Challan → Invoice → Return/Credit Note carries the same data through each conversion without loss; a Return correctly restocks (or doesn't, per the "restock option") |
| **Purchase lifecycle** | Full chain PO → GRN → Quality Inspection (accept/reject split) → Purchase Bill → Payment Out → Return/Debit Note; a QI-rejected quantity never enters inventory |
| **Cash & Bank** | Internal fund transfer between two accounts balances both sides and leaves an audit trail; cheque status lifecycle Pending→Cleared and Pending→Bounced both behave correctly; a bank reconciliation surfaces a deliberately-introduced mismatch |
| **Governance** | A maker-checker threshold (e.g. an expense over PKR 50,000) actually requires approval and is blocked without it; a locked financial period rejects a retroactive edit; a CREATE/UPDATE/DELETE/IMPERSONATE action writes a correct, immutable AuditLog entry with IP/user-agent/timestamp |
| **BI & Reports** | KPI dashboard numbers match a manually-computed control case from seeded data; Balance Sheet balances (assets = liabilities + equity); FBR/GST summary totals match the underlying invoice set |
| **Multi-tenancy** | A request scoped to Tenant A's `organizationId` cannot read Tenant B's data — attempt one cross-tenant read and confirm it's rejected or empty |
| **Subscription gate** | An organization with an expired plan is served `SubscriptionExpired.jsx`, not the live dashboard, on a protected route |
| **i18n** | Urdu/English toggle doesn't break layout (RTL/LTR) on at least POS, Inventory, Sales Invoice, Reports, and Udhaar Khata |

Use the demo account for auth. If seed/fixture data is needed for edge cases (negative stock, expired subscription, locked period), create it in an isolated way and note in the report how it was created and whether it was cleaned up.

---

## 7. Phase 4 — Performance monitoring at every step (new requirement — treat as first-class)

This was explicitly asked for: performance must be watched **at each step**, not measured once at the end.

- **Baseline before touching anything.** For every enumerated route, capture: LCP, CLS, INP/TBT, TTFB (Lighthouse, throttled to a mid-tier mobile CPU profile + Fast 3G, matching how most of this app's real users will experience it), and JS bundle size for that route's chunk (`vite build` with `rollup-plugin-visualizer` or `--report`).
- **Re-measure the same route immediately after any Phase 2 change touches it.** The report must show a before → after delta per route, not just a final snapshot — this is how a regression introduced by the cleanup itself gets caught instead of silently shipped.
- **Backend timing:** for 4–5 representative endpoints under real load shape (POS checkout, Sales invoice list, Reports dashboard, Stock ledger query), capture response time via Playwright network timing or a lightweight timing check against those routes plus `/api/health`. Surface anything that looks like an N+1 query pattern in the Morgan/Winston logs during the run — a flag, not a full profiling exercise.
- **Budgets (flag, don't hard-fail the run on these):** LCP < 2.5s, CLS < 0.1, TBT < 200ms per route on the throttled profile. Any route regressing more than 10% after a Phase 2 edit is logged as a P1 finding with the specific commit that caused it.
- Every performance capture writes to `qa/reports/<runId>/performance.json` immediately — this feeds the live status file in §8, per the "show me all progress" requirement, at the same per-check granularity as the functional tests.

---

## 8. Phase 5 — CI/CD + progress that is actually visible the whole time

- Console format, one line per check, never more than 10 seconds of silence:
  `[BIZ-QA] [042/210] [00:37:12] ▸ Reports/KPI dashboard — perf capture … LCP 1.8s (budget OK)`
- `qa/reports/LIVE_STATUS.json` rewritten after **every individual check** — a route screenshot, a rule violation, a test case, a performance capture — not just after each phase. Given the explicit "show me all progress, each and everything" ask, per-phase granularity is not enough here.
- `qa/reports/PROGRESS.md` as a live checklist (`- [x] POS — split payment edge case — pass`), so opening the file mid-run in the IDE shows exactly where things stand.
- Wire this into whatever `package.json` scripts already exist (Phase 0 found this out); add `qa:lint`, `qa:e2e`, `qa:perf`, `qa:report`, and a combined `qa` script if none exists. Add a GitHub Actions workflow that runs the same chain on PRs, only if a `.github/workflows` directory already exists or the repo is clearly set up to use GitHub Actions — otherwise the local npm chain is the deliverable and CI wiring is a note in the report, not a blocker.

---

## 9. Phase 6 — Final report

Structure `qa/reports/<runId>/REPORT.md` so the first thing read is a summary, not a wall of JSON:

```
# BizManager QA — <date>  ·  <duration>

## Summary
- AI tells found / fixed: N / N
- Functional test cases run: N  (pass N, fail N)
- Performance regressions introduced by cleanup: N
- Open questions logged for review: N
- Branch: qa/bizmanager-cleanup-<date>  ·  PR: <link>

## AI-tell removal log
route | element | GEMINI.md rule broken | before | after

## Functional QA results
module | test case | happy/edge/error | result | notes

## Performance
route | metric | before | after | delta | budget status

## Decisions log
what was ambiguous, what you chose, why — for review, not because you needed permission
```

Screenshots for every AI-tell fix and every route's before/after are embedded or linked from the report, not just listed by filename.

---

## 10. Do not

- Do not redesign anything GEMINI.md doesn't already call for — this is enforcement, not a new design pass.
- Do not add features, change the IA, or touch backend schema/business logic.
- Do not upgrade dependencies.
- Do not touch Sentry, JWT, CORS, or any security/middleware configuration.
- Do not run destructive tests against anything that isn't a clearly local/sandbox database.
- Do not edit or rename `GEMINI.md`.
- Do not merge the branch, push to `main`, or deploy.
- Do not go silent for more than 10 seconds, and do not stop and wait for confirmation at any point — log and proceed.
