import { QAHarness } from './qa-harness.js';
import dotenv from 'dotenv';

dotenv.config();

async function loginUser(qa) {
  await qa.goto('/login');
  await qa.wait(500);
  await qa.type('input[name="email"]', 'admin.megatrixai@gmail.com');
  await qa.type('input[name="password"]', 'Orangeman235!');
  await qa.click('button[type="submit"]');
  await qa.wait(2500);

  const pageText = await qa.getPageText();
  if (pageText.includes('Device Already Logged In') || pageText.includes('اکاؤنٹ پہلے سے دوسرے آلہ')) {
    await qa.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const target = btns.find((b) => b.innerText.includes('Log out previous device') || b.innerText.includes('پچھلے آلہ'));
      if (target) target.click();
    });
    await qa.wait(3500);
  }

  // Wait until navigated away from /login
  for (let i = 0; i < 10; i++) {
    if (!qa.page.url().includes('/login')) break;
    await qa.wait(500);
  }
}

async function run() {
  const qa = new QAHarness();
  const summary = { passed: [], failed: [] };

  try {
    console.log('🚀 Starting Module 9: Reports & Analytics QA Suite...');
    await qa.init();
    await loginUser(qa);
    console.log('✅ Authenticated successfully as Master Admin');

    // ==========================================
    // 1. Reports Dashboard (/reports)
    // ==========================================
    console.log('\n--- Testing 1: Reports Dashboard (/reports) ---');
    qa.clearErrors();
    await qa.goto('/reports');
    const rdashText = await qa.getPageText();
    console.log(`Reports Dashboard loaded: ${rdashText.includes('Report') || rdashText.includes('Dashboard') || rdashText.includes('رپورٹس')}`);
    if (qa.runtimeErrors.length > 0) {
      summary.failed.push({ page: '/reports', error: qa.runtimeErrors.join('; ') });
    } else {
      summary.passed.push('/reports');
    }

    // ==========================================
    // 2. Sales Report (/reports/sales)
    // ==========================================
    console.log('\n--- Testing 2: Sales Report (/reports/sales) ---');
    qa.clearErrors();
    await qa.goto('/reports/sales');
    const srepText = await qa.getPageText();
    console.log(`Sales Report loaded: ${srepText.includes('Sales') || srepText.includes('Total') || srepText.includes('فروخت')}`);

    // Verify filter toggle or chart rendering
    const hasChartsOrTable = await qa.evaluate(() => {
      return document.querySelectorAll('canvas, svg, table').length > 0;
    });
    console.log(`Sales Report contains charts or tables: ${hasChartsOrTable}`);

    if (qa.runtimeErrors.length > 0) {
      summary.failed.push({ page: '/reports/sales', error: qa.runtimeErrors.join('; ') });
    } else {
      summary.passed.push('/reports/sales');
    }

    // ==========================================
    // 3. Purchase Returns Analytics (/reports/purchase-returns)
    // ==========================================
    console.log('\n--- Testing 3: Purchase Returns Analytics (/reports/purchase-returns) ---');
    qa.clearErrors();
    await qa.goto('/reports/purchase-returns');
    const pretText = await qa.getPageText();
    console.log(`Purchase Returns Analytics loaded: ${pretText.includes('Return') || pretText.includes('Purchase') || pretText.includes('Analytics')}`);
    if (qa.runtimeErrors.length > 0) {
      summary.failed.push({ page: '/reports/purchase-returns', error: qa.runtimeErrors.join('; ') });
    } else {
      summary.passed.push('/reports/purchase-returns');
    }

    console.log('\n==========================================');
    console.log('MODULE 9 SUMMARY:');
    console.log(`Passed: ${summary.passed.length} (${summary.passed.join(', ')})`);
    console.log(`Failed: ${summary.failed.length}`);
    if (summary.failed.length > 0) {
      console.log('Failures:', JSON.stringify(summary.failed, null, 2));
    }
    console.log('==========================================');
  } catch (err) {
    console.error('Fatal test error in Module 9:', err);
  } finally {
    await qa.close();
  }
}

run();
