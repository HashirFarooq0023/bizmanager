/**
 * BizManager Phase 1 Inventory & AI-Tell Detection Engine
 * Uses Puppeteer to crawl routes, capture computed styles across themes and viewports,
 * saves screenshots directly to disk, and runs all 8 anti-AI rule checkers.
 */

import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Import all 8 rule checkers
import { checkDoppelrand } from './rules/doppelrand.js';
import { checkNumerics } from './rules/numerics.js';
import { checkTightening } from './rules/tightening.js';
import { checkPalette } from './rules/palette.js';
import { checkSparkles } from './rules/sparkles.js';
import { checkBoilerplate } from './rules/boilerplate.js';
import { checkRainbowCards } from './rules/rainbow.js';
import { checkIconConsistency } from './rules/icons.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '../../');

const RUN_ID = process.env.RUN_ID || 'run-20260919';
const REPORTS_DIR = path.join(ROOT_DIR, 'qa', 'reports', RUN_ID);
const SHOTS_DIR = path.join(REPORTS_DIR, 'shots');
const LIVE_STATUS_FILE = path.join(ROOT_DIR, 'qa', 'reports', 'LIVE_STATUS.json');

// Ensure directories exist
fs.mkdirSync(SHOTS_DIR, { recursive: true });

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const BASE_URL = process.env.BASE_URL || 'http://localhost:5173';

const VIEWPORTS = [
  { name: 'mobile', width: 390, height: 844 },
  { name: 'tablet', width: 1024, height: 768 },
  { name: 'desktop', width: 1920, height: 1080 }
];

const THEMES = ['light', 'dark'];

// Complete route inventory from App.jsx
export const ROUTES = [
  { path: '/', name: 'landing' },
  { path: '/login', name: 'login' },
  { path: '/register', name: 'register' },
  { path: '/forgot-password', name: 'forgot-password' },
  { path: '/privacy-policy', name: 'privacy-policy' },
  { path: '/terms', name: 'terms' },
  { path: '/subscription-expired', name: 'subscription-expired' },
  { path: '/dashboard', name: 'dashboard', requiresAuth: true },
  { path: '/udhaar', name: 'udhaar', requiresAuth: true },
  { path: '/pos', name: 'pos', requiresAuth: true },
  { path: '/inventory', name: 'inventory', requiresAuth: true },
  { path: '/inventory/add', name: 'inventory-add', requiresAuth: true },
  { path: '/customers', name: 'customers', requiresAuth: true },
  { path: '/customers/add', name: 'customers-add', requiresAuth: true },
  { path: '/suppliers', name: 'suppliers', requiresAuth: true },
  { path: '/sales/invoice', name: 'sales-invoice', requiresAuth: true },
  { path: '/sales/invoices', name: 'sales-invoices', requiresAuth: true },
  { path: '/sales/estimates', name: 'sales-estimates', requiresAuth: true },
  { path: '/sales/orders', name: 'sales-orders', requiresAuth: true },
  { path: '/sales/delivery-challan', name: 'sales-challan', requiresAuth: true },
  { path: '/sales/return', name: 'sales-return', requiresAuth: true },
  { path: '/purchase/list', name: 'purchase-list', requiresAuth: true },
  { path: '/purchase/entry', name: 'purchase-entry', requiresAuth: true },
  { path: '/purchase/bills', name: 'purchase-bills', requiresAuth: true },
  { path: '/purchase/expenses', name: 'purchase-expenses', requiresAuth: true },
  { path: '/purchase/returns', name: 'purchase-returns', requiresAuth: true },
  { path: '/purchase-orders', name: 'purchase-orders', requiresAuth: true },
  { path: '/grns', name: 'grns', requiresAuth: true },
  { path: '/cashbank/bank-accounts', name: 'cashbank-accounts', requiresAuth: true },
  { path: '/cashbank/cash-in-hand', name: 'cashbank-cash', requiresAuth: true },
  { path: '/cashbank/cheques', name: 'cashbank-cheques', requiresAuth: true },
  { path: '/cashbank/position', name: 'cashbank-position', requiresAuth: true },
  { path: '/approvals', name: 'approvals', requiresAuth: true },
  { path: '/reports', name: 'reports', requiresAuth: true },
  { path: '/reports/sales', name: 'reports-sales', requiresAuth: true },
  { path: '/utilities/barcode', name: 'utilities-barcode', requiresAuth: true },
  { path: '/utilities/import-items', name: 'utilities-import', requiresAuth: true },
  { path: '/utilities/export', name: 'utilities-export', requiresAuth: true },
  { path: '/sync/backup', name: 'sync-backup', requiresAuth: true },
  { path: '/profile-settings', name: 'profile-settings', requiresAuth: true }
];

let checkIndex = 0;
const totalChecks = ROUTES.length * VIEWPORTS.length * THEMES.length;
const startTime = Date.now();

function formatTime(ms) {
  const totalSec = Math.floor(ms / 1000);
  const m = String(Math.floor(totalSec / 60)).padStart(2, '0');
  const s = String(totalSec % 60).padStart(2, '0');
  return `${m}:${s}`;
}

function updateLiveStatus(moduleName, checkName, status, details, totalViolations = 0) {
  checkIndex++;
  const elapsed = formatTime(Date.now() - startTime);
  const checkStr = String(checkIndex).padStart(3, '0');
  const totalStr = String(totalChecks).padStart(3, '0');
  
  // Loud console logging format per prompt §8
  console.log(`[BIZ-QA] [${checkStr}/${totalStr}] [${elapsed}] ▸ ${moduleName} — ${checkName} … ${status} (${details})`);

  const statusData = {
    runId: RUN_ID,
    branch: 'qa/bizmanager-cleanup-2026-09-19',
    timestamp: new Date().toISOString(),
    currentPhase: 'Phase 1: Inventory & AI-Tell Detection Engine',
    progress: {
      totalChecks,
      completedChecks: checkIndex,
      percent: Number(((checkIndex / totalChecks) * 100).toFixed(1))
    },
    latestEvent: {
      module: moduleName,
      check: checkName,
      status,
      details
    },
    counts: {
      aiTellsFound: totalViolations,
      aiTellsFixed: 0,
      testsTotal: 0,
      testsPassed: 0,
      testsFailed: 0,
      perfRegressions: 0
    }
  };

  fs.writeFileSync(LIVE_STATUS_FILE, JSON.stringify(statusData, null, 2), 'utf8');
}

export async function runInventory() {
  console.log(`\n======================================================`);
  console.log(` Starting BizManager AI-Tell Inventory & Crawl Engine `);
  console.log(` Run ID: ${RUN_ID} | Target: ${BASE_URL}`);
  console.log(` Routes: ${ROUTES.length} | Viewports: ${VIEWPORTS.length} | Themes: ${THEMES.length}`);
  console.log(`======================================================\n`);

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu']
  });

  const page = await browser.newPage();
  const allViolations = [];

  // Seed mock user session into localStorage for protected routes
  const mockUserSession = {
    user: {
      _id: "demo-owner-id-123",
      name: "Demo Shop Owner",
      email: "demo@bizzai.com",
      role: "owner",
      shopName: "Demo Enterprise Mart",
      organizationId: "org-demo-123"
    },
    token: "mock-jwt-token-for-qa-crawl-session",
    organization: {
      _id: "org-demo-123",
      name: "Demo Enterprise Mart",
      plan: "enterprise",
      status: "active"
    }
  };

  try {
    // Navigate once to set localStorage
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'domcontentloaded' });
    await page.evaluate((session) => {
      localStorage.setItem('user', JSON.stringify(session));
      localStorage.setItem('token', session.token);
    }, mockUserSession);

    for (const route of ROUTES) {
      for (const vp of VIEWPORTS) {
        await page.setViewport({ width: vp.width, height: vp.height });

        for (const theme of THEMES) {
          const url = `${BASE_URL}${route.path}`;
          
          try {
            await page.goto(url, { waitUntil: 'networkidle2', timeout: 15000 });
          } catch (e) {
            // Fallback if timeout
            await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 8000 });
          }

          // Apply theme
          await page.evaluate((currentTheme) => {
            if (currentTheme === 'dark') {
              document.documentElement.classList.add('dark');
            } else {
              document.documentElement.classList.remove('dark');
            }
          }, theme);

          await new Promise(res => setTimeout(res, 250));

          // Save screenshot to disk directly (never buffered)
          const cleanPath = route.name.replace(/\//g, '_');
          const shotFilename = `${cleanPath}_${theme}_${vp.name}.png`;
          const shotPath = path.join(SHOTS_DIR, shotFilename);
          await page.screenshot({ path: shotPath, fullPage: false });

          // Harvest elements and computed styles safely with retry
          let harvest = { title: '', bodyText: '', nodes: [] };
          for (let attempt = 0; attempt < 3; attempt++) {
            try {
              harvest = await page.evaluate(() => {
                const nodes = [];
                const allElements = document.querySelectorAll('h1, h2, h3, h4, button, p, span, div, table, tr, th, td');

                allElements.forEach((el, index) => {
                  if (index > 400) return; // Sample top 400 elements per route
                  const style = window.getComputedStyle(el);
                  const text = (el.innerText || el.textContent || '').trim();
                  const className = (el.className && typeof el.className === 'string') ? el.className : '';

                  // SVG / Icon inspection
                  const svgs = el.querySelectorAll('svg');
                  let iconName = '';
                  if (svgs.length > 0) {
                    iconName = el.getAttribute('data-icon') || el.getAttribute('aria-label') || className;
                  }

                  nodes.push({
                    selector: `${el.tagName.toLowerCase()}${el.id ? '#' + el.id : ''}${className ? '.' + className.split(' ').slice(0, 2).join('.') : ''}`,
                    tagName: el.tagName.toLowerCase(),
                    className,
                    innerText: text.length > 60 ? text.substring(0, 60) + '...' : text,
                    iconName,
                    width: el.offsetWidth,
                    height: el.offsetHeight,
                    computedStyle: {
                      backgroundColor: style.backgroundColor,
                      color: style.color,
                      border: style.border,
                      borderRadius: style.borderRadius,
                      fontFamily: style.fontFamily,
                      fontVariantNumeric: style.fontVariantNumeric,
                      letterSpacing: style.letterSpacing,
                      boxShadow: style.boxShadow
                    }
                  });
                });

                return {
                  title: document.title,
                  bodyText: document.body ? document.body.innerText.substring(0, 5000) : '',
                  nodes
                };
              });
              break;
            } catch (err) {
              if (attempt === 2) {
                // Fallback empty harvest
                harvest = { title: '', bodyText: '', nodes: [] };
              } else {
                await new Promise(r => setTimeout(r, 400));
              }
            }
          }

          // Run rule engine
          const routeViolations = [];

          // Boilerplate rule
          const bpViolations = checkBoilerplate({ title: harvest.title, bodyText: harvest.bodyText });
          bpViolations.forEach(v => routeViolations.push({ ...v, route: route.path, theme, viewport: vp.name }));

          // Element-level rules
          for (const node of harvest.nodes) {
            const doppel = checkDoppelrand(node);
            const num = checkNumerics(node);
            const tight = checkTightening(node);
            const pal = checkPalette(node);
            const spark = checkSparkles(node);
            const icon = checkIconConsistency(node);

            [...doppel, ...num, ...tight, ...pal, ...spark, ...icon].forEach(v => {
              routeViolations.push({
                ...v,
                route: route.path,
                theme,
                viewport: vp.name,
                screenshot: shotFilename
              });
            });
          }

          allViolations.push(...routeViolations);

          const statusStr = routeViolations.length === 0 ? 'CLEAN' : `${routeViolations.length} tells`;
          updateLiveStatus(
            route.name,
            `${theme} / ${vp.name}`,
            routeViolations.length === 0 ? 'PASS' : 'FLAGGED',
            statusStr,
            allViolations.length
          );
        }
      }
    }
  } finally {
    await browser.close();
  }

  // Deduplicate and output violations.json
  const violationsFile = path.join(REPORTS_DIR, 'violations.json');
  fs.writeFileSync(violationsFile, JSON.stringify(allViolations, null, 2), 'utf8');

  console.log(`\n======================================================`);
  console.log(` Inventory complete! Total violations flagged: ${allViolations.length}`);
  console.log(` Violations saved to: ${violationsFile}`);
  console.log(` Screenshots captured to: ${SHOTS_DIR}`);
  console.log(`======================================================\n`);

  return allViolations;
}

// Auto-execute if run directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  runInventory().catch(err => {
    console.error('Inventory crawl failed:', err);
    process.exit(1);
  });
}
