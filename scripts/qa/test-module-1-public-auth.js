import { QAHarness } from './qa-harness.js';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

async function run() {
  const qa = new QAHarness();
  const summary = { passed: [], failed: [], bugs: [] };

  try {
    console.log('🚀 Starting Module 1: Public & Auth QA Suite...');
    await qa.init();

    // ==========================================
    // 1. Landing Page (/)
    // ==========================================
    console.log('\n--- Testing 1: Landing Page (/) ---');
    qa.clearErrors();
    await qa.goto('/');
    const title = await qa.page.title();
    console.log(`Page title: "${title}"`);
    if (!title || !title.toLowerCase().includes('bizmanager')) {
      summary.failed.push({ page: '/', error: `Unexpected title: ${title}` });
    } else {
      console.log('✅ Landing page loaded with correct title');
    }

    // Check key elements on landing page
    const landingText = await qa.getPageText();
    const hasHero = landingText.includes('BizManager') || landingText.includes('Business');
    console.log(`Landing page content check: hasHero=${hasHero}`);

    // Check interactive buttons on landing page
    const navButtons = await qa.evaluate(() => {
      const elements = Array.from(document.querySelectorAll('button, a'));
      const hasSignIn = elements.some((b) => b.innerText.includes('Sign In') || b.innerText.includes('سائن ان') || b.getAttribute('href') === '/login');
      const hasStart = elements.some((b) => b.innerText.includes('Start') || b.innerText.includes('شروع') || b.innerText.includes('Register') || b.getAttribute('href') === '/register');
      return { hasSignIn, hasStart };
    });
    console.log(`Landing page interactive buttons found:`, navButtons);

    if (qa.runtimeErrors.length > 0) {
      console.error('❌ Runtime errors on Landing Page:', qa.runtimeErrors);
      summary.failed.push({ page: '/', error: qa.runtimeErrors.join('; ') });
    } else {
      summary.passed.push('/');
    }

    // ==========================================
    // 2. Privacy Policy (/privacy-policy)
    // ==========================================
    console.log('\n--- Testing 2: Privacy Policy (/privacy-policy) ---');
    qa.clearErrors();
    await qa.goto('/privacy-policy');
    const privacyText = await qa.getPageText();
    if (privacyText.toLowerCase().includes('privacy') || privacyText.toLowerCase().includes('policy')) {
      console.log('✅ Privacy Policy loaded and contains expected text');
      summary.passed.push('/privacy-policy');
    } else {
      console.error('❌ Privacy Policy content missing');
      summary.failed.push({ page: '/privacy-policy', error: 'Content missing' });
    }

    // ==========================================
    // 3. Terms of Service (/terms)
    // ==========================================
    console.log('\n--- Testing 3: Terms (/terms) ---');
    qa.clearErrors();
    await qa.goto('/terms');
    const termsText = await qa.getPageText();
    if (termsText.toLowerCase().includes('terms') || termsText.toLowerCase().includes('condition')) {
      console.log('✅ Terms loaded and contains expected text');
      summary.passed.push('/terms');
    } else {
      console.error('❌ Terms content missing');
      summary.failed.push({ page: '/terms', error: 'Content missing' });
    }

    // ==========================================
    // 4. 404 Page (/unknown-test-path)
    // ==========================================
    console.log('\n--- Testing 4: 404 Not Found (/unknown-test-path) ---');
    qa.clearErrors();
    await qa.goto('/unknown-test-path');
    const notFoundText = await qa.getPageText();
    if (notFoundText.includes('404') || notFoundText.toLowerCase().includes('not found') || notFoundText.toLowerCase().includes('page')) {
      console.log('✅ 404 page rendered correctly');
      summary.passed.push('/404');
    } else {
      console.error('❌ 404 page failed to render properly');
      summary.failed.push({ page: '/404', error: '404 not rendered' });
    }

    // ==========================================
    // 5. Forgot Password (/forgot-password)
    // ==========================================
    console.log('\n--- Testing 5: Forgot Password (/forgot-password) ---');
    qa.clearErrors();
    await qa.goto('/forgot-password');
    const fpText = await qa.getPageText();
    console.log('Forgot password rendered, checking form inputs...');
    const emailInput = await qa.page.$('input[type="email"]');
    console.log(`Email input present: ${Boolean(emailInput)}`);

    // Test empty submission
    const submitBtn = await qa.page.$('button[type="submit"]');
    if (submitBtn) {
      await submitBtn.click();
      await qa.wait(500);
      console.log('Tested submit button interaction');
    }
    if (qa.runtimeErrors.length > 0) {
      summary.failed.push({ page: '/forgot-password', error: qa.runtimeErrors.join('; ') });
    } else {
      summary.passed.push('/forgot-password');
    }

    // ==========================================
    // 6. Register Page (/register)
    // ==========================================
    console.log('\n--- Testing 6: Register Page (/register) ---');
    qa.clearErrors();
    await qa.goto('/register');
    const registerText = await qa.getPageText();
    console.log('Register page loaded. Checking interactive form elements...');

    // Test form controls
    const regInputs = await qa.evaluate(() => {
      const inputs = Array.from(document.querySelectorAll('input'));
      return inputs.map((i) => ({ name: i.name, type: i.type, placeholder: i.placeholder, required: i.required }));
    });
    console.log('Registration inputs found:', regInputs.map((i) => i.name || i.type));

    // Test invalid submission
    const regSubmit = await qa.page.$('button[type="submit"]');
    if (regSubmit) {
      await regSubmit.click();
      await qa.wait(500);
      console.log('Tested empty submission behavior');
    }

    if (qa.runtimeErrors.length > 0) {
      summary.failed.push({ page: '/register', error: qa.runtimeErrors.join('; ') });
    } else {
      summary.passed.push('/register');
    }

    // ==========================================
    // 7. Login Page (/login)
    // ==========================================
    console.log('\n--- Testing 7: Login Page (/login) ---');
    qa.clearErrors();
    await qa.goto('/login');
    console.log('Testing invalid credentials login...');
    await qa.type('input[name="email"]', 'wronguser@test.com');
    await qa.type('input[name="password"]', 'WrongPassword123!');
    await qa.click('button[type="submit"]');
    await qa.wait(1500);

    const afterInvalidText = await qa.getPageText();
    const hasErrorAlert = afterInvalidText.includes('Invalid') || afterInvalidText.includes('credentials') || afterInvalidText.includes('error');
    console.log(`Invalid credentials handled with user feedback: ${hasErrorAlert}`);

    // Now test master admin login:
    console.log('Testing master admin credentials...');
    // Pre-clear device session in DB so conflict modal can be tested cleanly or login goes through
    await qa.goto('/login');
    await qa.type('input[name="email"]', 'admin.megatrixai@gmail.com');
    await qa.type('input[name="password"]', 'Orangeman235!');
    await qa.click('button[type="submit"]');
    await qa.wait(2000);

    // Check if device conflict modal appeared
    const pageTextNow = await qa.getPageText();
    if (pageTextNow.includes('Device Already Logged In') || pageTextNow.includes('اکاؤنٹ پہلے سے دوسرے آلہ')) {
      console.log('⚠️ Device conflict detected. Testing "Log out previous device & continue" button...');
      const clicked = await qa.evaluate(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const target = btns.find((b) => b.innerText.includes('Log out previous device') || b.innerText.includes('پچھلے آلہ'));
        if (target) {
          target.click();
          return true;
        }
        return false;
      });
      console.log('Clicked force logout button:', clicked);
      await qa.wait(3500);
    }

    // Verify redirect to /dashboard
    const currentUrl = qa.page.url();
    console.log(`Post-login URL: ${currentUrl}`);
    if (currentUrl.includes('/dashboard')) {
      console.log('✅ Successfully logged in and navigated to /dashboard!');
      summary.passed.push('/login');
    } else {
      console.error(`❌ Failed to redirect to /dashboard. Current URL: ${currentUrl}`);
      await qa.screenshot('login_failed');
      summary.failed.push({ page: '/login', error: `Did not reach dashboard, at ${currentUrl}` });
    }

    console.log('\n==========================================');
    console.log('MODULE 1 SUMMARY:');
    console.log(`Passed: ${summary.passed.length} (${summary.passed.join(', ')})`);
    console.log(`Failed: ${summary.failed.length}`);
    if (summary.failed.length > 0) {
      console.log('Failures:', JSON.stringify(summary.failed, null, 2));
    }
    console.log('==========================================');
  } catch (err) {
    console.error('Fatal test error in Module 1:', err);
  } finally {
    await qa.close();
  }
}

run();
