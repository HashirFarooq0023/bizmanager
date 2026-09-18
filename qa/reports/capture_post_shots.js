import puppeteer from 'puppeteer-core';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '../../');
const SHOTS_DIR = path.join(ROOT_DIR, 'qa', 'reports', 'run-20260919', 'shots');
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const BASE_URL = 'http://localhost:5173';

async function capture() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  // Seed session
  const mockUser = {
    user: { _id: "demo-id-qa", name: "Demo QA Owner", email: "demo@bizmanager.com", role: "owner", shopName: "Demo Shop" },
    token: "qa-valid-jwt-token",
    organization: { _id: "org-qa-1", name: "Demo Shop", status: "active" }
  };
  await page.goto(`${BASE_URL}/login`, { waitUntil: 'domcontentloaded' });
  await page.evaluate((u) => {
    localStorage.setItem('user', JSON.stringify(u));
    localStorage.setItem('token', u.token);
  }, mockUser);

  // Capture Dashboard light & dark
  await page.goto(`${BASE_URL}/dashboard`, { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: path.join(SHOTS_DIR, 'dashboard_light_desktop_post.png') });

  await page.evaluate(() => document.documentElement.classList.add('dark'));
  await new Promise(r => setTimeout(r, 300));
  await page.screenshot({ path: path.join(SHOTS_DIR, 'dashboard_dark_desktop_post.png') });

  // Capture Login light & dark
  await page.goto(`${BASE_URL}/login`, { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => document.documentElement.classList.remove('dark'));
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: path.join(SHOTS_DIR, 'login_light_desktop_post.png') });

  await page.evaluate(() => document.documentElement.classList.add('dark'));
  await new Promise(r => setTimeout(r, 300));
  await page.screenshot({ path: path.join(SHOTS_DIR, 'login_dark_desktop_post.png') });

  await browser.close();
  console.log('Captured post-remediation screenshots.');
}

capture().catch(err => {
  console.error('Failed to capture post shots:', err);
  process.exit(1);
});
