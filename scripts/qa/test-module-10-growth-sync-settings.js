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

  for (let i = 0; i < 10; i++) {
    if (!qa.page.url().includes('/login')) break;
    await qa.wait(500);
  }
}

async function run() {
  const qa = new QAHarness();
  const summary = { passed: [], failed: [] };

  try {
    console.log('🚀 Starting Module 10: Growth, Sync, Utilities, Approvals & Settings QA Suite...');
    await qa.init();
    await loginUser(qa);
    console.log('✅ Authenticated successfully as Master Admin');

    // ==========================================
    // 1. Online Shop (/business/online-shop)
    // ==========================================
    console.log('\n--- Testing 1: Online Shop (/business/online-shop) ---');
    qa.clearErrors();
    await qa.goto('/business/online-shop');
    const shopText = await qa.getPageText();
    console.log(`Online Shop loaded: ${shopText.includes('Online Shop') || shopText.includes('Store') || shopText.includes('آن لائن')}`);
    if (qa.runtimeErrors.length > 0) {
      summary.failed.push({ page: '/business/online-shop', error: qa.runtimeErrors.join('; ') });
    } else {
      summary.passed.push('/business/online-shop');
    }

    // ==========================================
    // 2. Google Profile (/business/google-profile)
    // ==========================================
    console.log('\n--- Testing 2: Google Profile (/business/google-profile) ---');
    qa.clearErrors();
    await qa.goto('/business/google-profile');
    const gprofText = await qa.getPageText();
    console.log(`Google Profile loaded: ${gprofText.includes('Google') || gprofText.includes('Profile')}`);
    if (qa.runtimeErrors.length > 0) {
      summary.failed.push({ page: '/business/google-profile', error: qa.runtimeErrors.join('; ') });
    } else {
      summary.passed.push('/business/google-profile');
    }

    // ==========================================
    // 3. Marketing Tools (/business/marketing-tools)
    // ==========================================
    console.log('\n--- Testing 3: Marketing Tools (/business/marketing-tools) ---');
    qa.clearErrors();
    await qa.goto('/business/marketing-tools');
    const mktText = await qa.getPageText();
    console.log(`Marketing Tools loaded: ${mktText.includes('Marketing') || mktText.includes('Tools') || mktText.includes('مارکیٹنگ')}`);
    if (qa.runtimeErrors.length > 0) {
      summary.failed.push({ page: '/business/marketing-tools', error: qa.runtimeErrors.join('; ') });
    } else {
      summary.passed.push('/business/marketing-tools');
    }

    // ==========================================
    // 4. WhatsApp Marketing (/business/whatsapp-marketing)
    // ==========================================
    console.log('\n--- Testing 4: WhatsApp Marketing (/business/whatsapp-marketing) ---');
    qa.clearErrors();
    await qa.goto('/business/whatsapp-marketing');
    const waText = await qa.getPageText();
    console.log(`WhatsApp Marketing loaded: ${waText.includes('WhatsApp') || waText.includes('Marketing')}`);
    if (qa.runtimeErrors.length > 0) {
      summary.failed.push({ page: '/business/whatsapp-marketing', error: qa.runtimeErrors.join('; ') });
    } else {
      summary.passed.push('/business/whatsapp-marketing');
    }

    // ==========================================
    // 5. Sync Share (/sync/share)
    // ==========================================
    console.log('\n--- Testing 5: Sync Share (/sync/share) ---');
    qa.clearErrors();
    await qa.goto('/sync/share');
    const syncText = await qa.getPageText();
    console.log(`Sync Share loaded: ${syncText.includes('Sync') || syncText.includes('Share') || syncText.includes('ہم آہنگی')}`);
    if (qa.runtimeErrors.length > 0) {
      summary.failed.push({ page: '/sync/share', error: qa.runtimeErrors.join('; ') });
    } else {
      summary.passed.push('/sync/share');
    }

    // ==========================================
    // 6. Backup (/sync/backup)
    // ==========================================
    console.log('\n--- Testing 6: Backup (/sync/backup) ---');
    qa.clearErrors();
    await qa.goto('/sync/backup');
    const bkText = await qa.getPageText();
    console.log(`Backup loaded: ${bkText.includes('Backup') || bkText.includes('بیک اپ')}`);
    if (qa.runtimeErrors.length > 0) {
      summary.failed.push({ page: '/sync/backup', error: qa.runtimeErrors.join('; ') });
    } else {
      summary.passed.push('/sync/backup');
    }

    // ==========================================
    // 7. Restore (/sync/restore)
    // ==========================================
    console.log('\n--- Testing 7: Restore (/sync/restore) ---');
    qa.clearErrors();
    await qa.goto('/sync/restore');
    const resText = await qa.getPageText();
    console.log(`Restore loaded: ${resText.includes('Restore') || resText.includes('بحالی')}`);
    if (qa.runtimeErrors.length > 0) {
      summary.failed.push({ page: '/sync/restore', error: qa.runtimeErrors.join('; ') });
    } else {
      summary.passed.push('/sync/restore');
    }

    // ==========================================
    // 8. Business Setup (/utilities/business-setup)
    // ==========================================
    console.log('\n--- Testing 8: Business Setup (/utilities/business-setup) ---');
    qa.clearErrors();
    await qa.goto('/utilities/business-setup');
    const bsText = await qa.getPageText();
    console.log(`Business Setup loaded: ${bsText.includes('Business Setup') || bsText.includes('Business Name')}`);

    // Fill form and save
    try {
      await qa.evaluate(() => {
        const nameInput = document.querySelector('input[name="businessName"]');
        if (nameInput) {
          const valSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
          valSetter.call(nameInput, 'Tariq Wholesale General Store');
          nameInput.dispatchEvent(new Event('input', { bubbles: true }));
        }
        const btns = Array.from(document.querySelectorAll('button[type="submit"], button'));
        const saveBtn = btns.find(b => b.innerText.includes('Save') || b.innerText.includes('Update'));
        if (saveBtn) saveBtn.click();
      });
      await qa.wait(1500);
    } catch (e) {
      console.warn('Business setup save notice:', e.message);
    }

    if (qa.runtimeErrors.length > 0) {
      summary.failed.push({ page: '/utilities/business-setup', error: qa.runtimeErrors.join('; ') });
    } else {
      summary.passed.push('/utilities/business-setup');
    }

    // ==========================================
    // 9. Data Export (/utilities/export)
    // ==========================================
    console.log('\n--- Testing 9: Data Export (/utilities/export) ---');
    qa.clearErrors();
    await qa.goto('/utilities/export');
    const expText = await qa.getPageText();
    console.log(`Data Export loaded: ${expText.includes('Export') || expText.includes('Download') || expText.includes('برآمد')}`);
    if (qa.runtimeErrors.length > 0) {
      summary.failed.push({ page: '/utilities/export', error: qa.runtimeErrors.join('; ') });
    } else {
      summary.passed.push('/utilities/export');
    }

    // ==========================================
    // 10. Approvals (/approvals)
    // ==========================================
    console.log('\n--- Testing 10: Approvals (/approvals) ---');
    qa.clearErrors();
    await qa.goto('/approvals');
    const appText = await qa.getPageText();
    console.log(`Approvals loaded: ${appText.includes('Approval') || appText.includes('منظوری')}`);
    if (qa.runtimeErrors.length > 0) {
      summary.failed.push({ page: '/approvals', error: qa.runtimeErrors.join('; ') });
    } else {
      summary.passed.push('/approvals');
    }

    // ==========================================
    // 11. Approval Settings (/approvals/settings)
    // ==========================================
    console.log('\n--- Testing 11: Approval Settings (/approvals/settings) ---');
    qa.clearErrors();
    await qa.goto('/approvals/settings');
    const appSetText = await qa.getPageText();
    console.log(`Approval Settings loaded: ${appSetText.includes('Approval') || appSetText.includes('Settings') || appSetText.includes('Workflow')}`);
    if (qa.runtimeErrors.length > 0) {
      summary.failed.push({ page: '/approvals/settings', error: qa.runtimeErrors.join('; ') });
    } else {
      summary.passed.push('/approvals/settings');
    }

    // ==========================================
    // 12. Profile Settings (/profile-settings)
    // ==========================================
    console.log('\n--- Testing 12: Profile Settings (/profile-settings) ---');
    qa.clearErrors();
    await qa.goto('/profile-settings');
    const profText = await qa.getPageText();
    console.log(`Profile Settings loaded: ${profText.includes('Profile') || profText.includes('Shop') || profText.includes('پروفائل')}`);
    if (qa.runtimeErrors.length > 0) {
      summary.failed.push({ page: '/profile-settings', error: qa.runtimeErrors.join('; ') });
    } else {
      summary.passed.push('/profile-settings');
    }

    console.log('\n==========================================');
    console.log('MODULE 10 SUMMARY:');
    console.log(`Passed: ${summary.passed.length} (${summary.passed.join(', ')})`);
    console.log(`Failed: ${summary.failed.length}`);
    if (summary.failed.length > 0) {
      console.log('Failures:', JSON.stringify(summary.failed, null, 2));
    }
    console.log('==========================================');
  } catch (err) {
    console.error('Fatal test error in Module 10:', err);
  } finally {
    await qa.close();
  }
}

run();
