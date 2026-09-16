import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const SCREENSHOT_DIR = path.resolve('logs', 'qa-screenshots');

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

export class QAHarness {
  constructor() {
    this.browser = null;
    this.page = null;
    this.consoleErrors = [];
    this.runtimeErrors = [];
    this.failedRequests = [];
    this.testResults = [];
  }

  async init(viewport = { width: 1280, height: 800 }) {
    this.browser = await puppeteer.launch({
      executablePath: CHROME_PATH,
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        `--window-size=${viewport.width},${viewport.height}`,
      ],
      defaultViewport: viewport,
    });

    this.page = await this.browser.newPage();
    this.setupListeners();
  }

  setupListeners() {
    this.consoleErrors = [];
    this.runtimeErrors = [];
    this.failedRequests = [];

    this.page.on('console', (msg) => {
      const type = msg.type();
      const text = msg.text();
      if (type === 'error') {
        // Filter benign browser noise if any, e.g. favicon or external fonts if non-critical
        if (!text.includes('favicon.ico') && !text.includes('chrome-extension')) {
          this.consoleErrors.push({ type, text, location: msg.location() });
        }
      }
    });

    this.page.on('pageerror', (err) => {
      this.runtimeErrors.push(err.toString());
    });

    this.page.on('dialog', async (dialog) => {
      console.log(`[Browser Dialog] ${dialog.type()}: "${dialog.message()}"`);
      await dialog.accept().catch(() => {});
    });

    this.page.on('requestfailed', (req) => {
      const url = req.url();
      const failure = req.failure();
      if (!url.includes('google-analytics') && !url.includes('sentry')) {
        this.failedRequests.push({ url, error: failure?.errorText });
      }
    });
  }

  clearErrors() {
    this.consoleErrors = [];
    this.runtimeErrors = [];
    this.failedRequests = [];
  }

  async screenshot(name) {
    const filename = `${Date.now()}_${name.replace(/[^a-zA-Z0-9_-]/g, '_')}.png`;
    const filepath = path.join(SCREENSHOT_DIR, filename);
    await this.page.screenshot({ path: filepath, fullPage: false });
    return filepath;
  }

  async dismissCookieBanner() {
    try {
      await this.page.evaluate(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const consentBtn = btns.find(b => b.innerText.includes('Essential Only') || b.innerText.includes('Accept All'));
        if (consentBtn) consentBtn.click();
      });
    } catch (e) {}
  }

  async goto(url, waitUntil = 'networkidle2') {
    const fullUrl = url.startsWith('http') ? url : `http://localhost:5173${url}`;
    await this.page.goto(fullUrl, { waitUntil, timeout: 30000 });
    await this.dismissCookieBanner();
    // small settle delay
    await new Promise((r) => setTimeout(r, 600));
  }

  async wait(ms) {
    return new Promise((r) => setTimeout(r, ms));
  }

  async evaluate(fn, ...args) {
    return this.page.evaluate(fn, ...args);
  }

  async click(selector, timeout = 5000) {
    await this.page.waitForSelector(selector, { visible: true, timeout });
    await this.page.click(selector);
    await this.wait(300);
  }

  async type(selector, text, clear = true) {
    await this.page.waitForSelector(selector, { visible: true, timeout: 5000 });
    if (clear) {
      await this.page.click(selector, { clickCount: 3 });
      await this.page.keyboard.press('Backspace');
    }
    await this.page.type(selector, text, { delay: 20 });
  }

  async selectOption(selector, value) {
    await this.page.waitForSelector(selector, { visible: true, timeout: 5000 });
    await this.page.select(selector, value);
  }

  async getPageText() {
    return this.page.evaluate(() => document.body.innerText);
  }

  async findElement(selector) {
    return this.page.$(selector);
  }

  async findElements(selector) {
    return this.page.$$(selector);
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }
}
