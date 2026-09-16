import { QAHarness } from './qa-harness.js';
import dotenv from 'dotenv';

dotenv.config();

async function loginUser(qa) {
  await qa.goto('/login');
  await qa.type('input[name="email"]', 'admin.megatrixai@gmail.com');
  await qa.type('input[name="password"]', 'Orangeman235!');
  await qa.click('button[type="submit"]');
  await qa.wait(2000);

  const pageText = await qa.getPageText();
  if (pageText.includes('Device Already Logged In') || pageText.includes('اکاؤنٹ پہلے سے دوسرے آلہ')) {
    await qa.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const target = btns.find((b) => b.innerText.includes('Log out previous device') || b.innerText.includes('پچھلے آلہ'));
      if (target) target.click();
    });
    await qa.wait(3500);
  }

  const url = qa.page.url();
  if (!url.includes('/dashboard')) {
    throw new Error(`Login failed to navigate to dashboard, current url: ${url}`);
  }
}

async function run() {
  const qa = new QAHarness();
  const summary = { passed: [], failed: [], bugs: [] };

  try {
    console.log('🚀 Starting Module 2: Dashboard & Udhaar Khata QA Suite...');
    await qa.init();

    await loginUser(qa);
    console.log('✅ Authenticated successfully as Master Admin');

    // ==========================================
    // 1. Dashboard (/dashboard)
    // ==========================================
    console.log('\n--- Testing 1: Dashboard (/dashboard) ---');
    qa.clearErrors();
    await qa.goto('/dashboard');

    const dbTitle = await qa.page.title();
    console.log(`Dashboard page title: "${dbTitle}"`);

    const dbText = await qa.getPageText();
    const hasGreeting = dbText.includes('Welcome back') || dbText.includes('خوش آمدید');
    console.log(`Dashboard greeting rendered: ${hasGreeting}`);

    // Verify Quick Action Buttons
    const quickActionNewSale = await qa.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      return btns.some((b) => b.innerText.includes('New Sale') || b.innerText.includes('نیا بل بنائیں'));
    });
    console.log(`Quick action 'New Sale' button present: ${quickActionNewSale}`);

    const quickActionUdhaar = await qa.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      return btns.some((b) => b.innerText.includes('Udhaar') || b.innerText.includes('ادھار'));
    });
    console.log(`Quick action 'Udhaar' button present: ${quickActionUdhaar}`);

    // Verify stats / metrics cards exist
    const statsCardsCount = await qa.evaluate(() => {
      return document.querySelectorAll('.grid > div, [data-testid="stats-card"]').length;
    });
    console.log(`Metric/content cards rendered: ${statsCardsCount}`);

    // Test responsive behavior on Dashboard
    console.log('Testing mobile responsive viewport (375x812)...');
    await qa.page.setViewport({ width: 375, height: 812 });
    await qa.wait(1000);
    const mobileText = await qa.getPageText();
    if (!mobileText.includes('Welcome back') && !mobileText.includes('خوش آمدید')) {
      summary.failed.push({ page: '/dashboard', error: 'Dashboard failed rendering on mobile viewport' });
    } else {
      console.log('✅ Dashboard adapted gracefully to mobile viewport');
    }

    // Reset viewport to desktop
    await qa.page.setViewport({ width: 1280, height: 800 });
    await qa.wait(500);

    if (qa.runtimeErrors.length > 0) {
      console.error('❌ Runtime errors on Dashboard:', qa.runtimeErrors);
      summary.failed.push({ page: '/dashboard', error: qa.runtimeErrors.join('; ') });
    } else {
      summary.passed.push('/dashboard');
      console.log('✅ Dashboard tests passed');
    }

    // ==========================================
    // 2. Udhaar Khata (/udhaar)
    // ==========================================
    console.log('\n--- Testing 2: Udhaar Khata (/udhaar) ---');
    qa.clearErrors();
    await qa.goto('/udhaar');

    const udhaarText = await qa.getPageText();
    const hasKhataHeader = udhaarText.includes('Udhaar') || udhaarText.includes('ادھار') || udhaarText.includes('Khata');
    console.log(`Udhaar header rendered: ${hasKhataHeader}`);

    // Test tab switching: Customers vs Suppliers
    console.log('Testing Udhaar tab switching...');
    const tabs = await qa.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      return btns.filter((b) => b.innerText.includes('Customers') || b.innerText.includes('گراہک') || b.innerText.includes('Suppliers') || b.innerText.includes('سپلائرز')).map((b) => b.innerText);
    });
    console.log(`Udhaar tabs available:`, tabs);

    // Click Suppliers tab
    await qa.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const supplierTab = btns.find((b) => b.innerText.includes('Suppliers') || b.innerText.includes('سپلائرز'));
      if (supplierTab) supplierTab.click();
    });
    await qa.wait(800);
    console.log('Switched to Suppliers tab');

    // Click back to Customers tab
    await qa.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const custTab = btns.find((b) => b.innerText.includes('Customers') || b.innerText.includes('گراہک'));
      if (custTab) custTab.click();
    });
    await qa.wait(800);
    console.log('Switched back to Customers tab');

    // Test Search input
    console.log('Testing search input filter on Udhaar page...');
    const searchInput = await qa.page.$('input[type="text"]');
    if (searchInput) {
      await qa.type('input[type="text"]', 'Tariq Mehmood');
      await qa.wait(500);
      console.log('Entered search query');
      await qa.type('input[type="text"]', ''); // clear
      await qa.wait(500);
      console.log('Cleared search query');
    }

    if (qa.runtimeErrors.length > 0) {
      console.error('❌ Runtime errors on Udhaar Khata:', qa.runtimeErrors);
      summary.failed.push({ page: '/udhaar', error: qa.runtimeErrors.join('; ') });
    } else {
      summary.passed.push('/udhaar');
      console.log('✅ Udhaar Khata tests passed');
    }

    console.log('\n==========================================');
    console.log('MODULE 2 SUMMARY:');
    console.log(`Passed: ${summary.passed.length} (${summary.passed.join(', ')})`);
    console.log(`Failed: ${summary.failed.length}`);
    if (summary.failed.length > 0) {
      console.log('Failures:', JSON.stringify(summary.failed, null, 2));
    }
    console.log('==========================================');
  } catch (err) {
    console.error('Fatal test error in Module 2:', err);
  } finally {
    await qa.close();
  }
}

run();
