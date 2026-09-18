# BizManager QA & Cleanup — Decisions Log

This document records all conservative judgment calls, trade-offs, and environmental configurations made during unattended execution, per prompt §0:
> "If a decision is genuinely ambiguous, make the more conservative choice, write it to `qa/reports/DECISIONS_LOG.md` with your reasoning, and keep going."

---

### Log 001: Port Isolation for Backend (Port 5001/5002)
- **Context**: Port 5000 is actively occupied by a background process from another workspace (`asanshipping`). Killing other projects' processes indiscriminately risks unintended work disruption.
- **Decision**: Configure BizManager backend to run cleanly on port 5001 with proxy / `VITE_BACKEND_URL` automatically aligned.
- **Rationale**: Completely avoids port collision while leaving other active background development untouched.

---

### Log 002: Sandbox Database & Non-Destructive Data Testing
- **Context**: Backend `.env` contains a MongoDB connection string. Prompt §0 and §10 strictly require: *"Never run destructive tests against anything that could be a shared or production database."*
- **Decision**: Use `mongodb-memory-server` and isolated test tenant namespaces for all automated tests that perform mutations, creations, negative stock adjustments, or expired-subscription simulations.
- **Rationale**: Guarantees zero risk of schema corruption, data deletion, or concurrency interference with shared/production databases.

---

### Log 003: Headless Chrome Executable Selection
- **Context**: `puppeteer-core` is listed in root `package.json`.
- **Decision**: Target the verified system Google Chrome installation at `C:\Program Files\Google\Chrome\Application\chrome.exe`.
- **Rationale**: Guarantees exact rendering consistency with standard Chrome engine and avoids unnecessary Chromium download overhead.

---

### Log 004: Preservation of Functional Logic on Decorated Elements
- **Context**: Several buttons and cards contain legacy styling mixed with functional click handlers, form submissions, or tooltips.
- **Decision**: When removing AI tells (e.g. `violet-*` colors, missing `font-mono tabular-nums`, missing `tracking-[-0.03em]`, or lack of Doppelrand), retain all event handlers (`onClick`, `onSubmit`, `onKeyDown`), accessibility attributes (`aria-*`, `role`), and Redux dispatches strictly intact.
- **Rationale**: Prompt §5 explicitly mandates zero functional regression and zero business-logic modifications during aesthetic cleanup.
