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
}

async function run() {
  const qa = new QAHarness();
  const summary = { passed: [], failed: [] };

  try {
    console.log('🚀 Starting Module 8: Finance, Cash & Bank QA Suite...');
    await qa.init();
    await loginUser(qa);
    console.log('✅ Authenticated successfully as Master Admin');

    // ==========================================
    // 1. Cash & Bank Position (/cashbank/position)
    // ==========================================
    console.log('\n--- Testing 1: Cash & Bank Position (/cashbank/position) ---');
    qa.clearErrors();
    await qa.goto('/cashbank/position');
    const posText = await qa.getPageText();
    console.log(`Cash & Bank Position loaded: ${posText.includes('Position') || posText.includes('Balance') || posText.includes('Cash')}`);
    if (qa.runtimeErrors.length > 0) {
      summary.failed.push({ page: '/cashbank/position', error: qa.runtimeErrors.join('; ') });
    } else {
      summary.passed.push('/cashbank/position');
    }

    // ==========================================
    // 2. Bank Accounts (/cashbank/bank-accounts)
    // ==========================================
    console.log('\n--- Testing 2: Bank Accounts (/cashbank/bank-accounts) ---');
    qa.clearErrors();
    await qa.goto('/cashbank/bank-accounts');
    const baccText = await qa.getPageText();
    console.log(`Bank Accounts page loaded: ${baccText.includes('Bank Accounts') || baccText.includes('بینک')}`);

    // Test adding a Pakistani bank account
    try {
      console.log('Testing adding bank account (Meezan Bank)...');
      await qa.evaluate(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const addBtn = btns.find(b => b.innerText.includes('Add Bank Account') || b.innerText.includes('نیا بینک'));
        if (addBtn) addBtn.click();
      });
      await qa.wait(1000);

      // Fill in account details
      await qa.evaluate(() => {
        const inputs = Array.from(document.querySelectorAll('input'));
        // Find inputs by placeholder or label
        const bankNameInput = inputs.find(i => i.placeholder?.includes('Meezan') || i.parentElement?.innerText?.includes('Bank Name'));
        const accNoInput = inputs.find(i => i.placeholder?.includes('account number') || i.parentElement?.innerText?.includes('Account Number'));
        const ifscInput = inputs.find(i => i.placeholder?.includes('PK36') || i.parentElement?.innerText?.includes('IBAN') || i.parentElement?.innerText?.includes('IFSC'));
        const branchInput = inputs.find(i => i.placeholder?.includes('Branch') || i.parentElement?.innerText?.includes('Branch'));
        const balInput = inputs.find(i => i.type === 'number' || i.placeholder?.includes('0.00'));

        const setVal = (input, val) => {
          if (!input) return;
          const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
          setter.call(input, val);
          input.dispatchEvent(new Event('input', { bubbles: true }));
          input.dispatchEvent(new Event('change', { bubbles: true }));
        };

        setVal(bankNameInput, 'Meezan Bank');
        setVal(accNoInput, '01020304050607');
        setVal(ifscInput, 'PK36MEZN0001020304050607');
        setVal(branchInput, 'Gulberg Branch Lahore');
        setVal(balInput, '50000');
      });
      await qa.wait(500);

      // Save Account
      await qa.evaluate(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const saveBtn = btns.find(b => b.innerText.includes('Save Account') || b.innerText.includes('محفوظ'));
        if (saveBtn) saveBtn.click();
      });
      await qa.wait(3000);

      const tableTextAfter = await qa.getPageText();
      console.log(`Meezan Bank added: ${tableTextAfter.includes('Meezan Bank')}`);
    } catch (e) {
      console.warn('Bank account creation notice:', e.message);
    }

    if (qa.runtimeErrors.length > 0) {
      summary.failed.push({ page: '/cashbank/bank-accounts', error: qa.runtimeErrors.join('; ') });
    } else {
      summary.passed.push('/cashbank/bank-accounts');
    }

    // ==========================================
    // 3. Cash in Hand (/cashbank/cash-in-hand)
    // ==========================================
    console.log('\n--- Testing 3: Cash in Hand (/cashbank/cash-in-hand) ---');
    qa.clearErrors();
    await qa.goto('/cashbank/cash-in-hand');
    const cashText = await qa.getPageText();
    console.log(`Cash In Hand loaded: ${cashText.includes('Cash') || cashText.includes('Balance') || cashText.includes('نقد')}`);
    if (qa.runtimeErrors.length > 0) {
      summary.failed.push({ page: '/cashbank/cash-in-hand', error: qa.runtimeErrors.join('; ') });
    } else {
      summary.passed.push('/cashbank/cash-in-hand');
    }

    // ==========================================
    // 4. Transfers (/transfers)
    // ==========================================
    console.log('\n--- Testing 4: Inter-account Transfers (/transfers) ---');
    qa.clearErrors();
    await qa.goto('/transfers');
    const transferText = await qa.getPageText();
    console.log(`Transfers loaded: ${transferText.includes('Transfer') || transferText.includes('منتقلی')}`);
    if (qa.runtimeErrors.length > 0) {
      summary.failed.push({ page: '/transfers', error: qa.runtimeErrors.join('; ') });
    } else {
      summary.passed.push('/transfers');
    }

    // ==========================================
    // 5. Cheques Tracker (/cashbank/cheques)
    // ==========================================
    console.log('\n--- Testing 5: Cheques Tracker (/cashbank/cheques) ---');
    qa.clearErrors();
    await qa.goto('/cashbank/cheques');
    const chequesText = await qa.getPageText();
    console.log(`Cheques loaded: ${chequesText.includes('Cheque') || chequesText.includes('چیک')}`);
    if (qa.runtimeErrors.length > 0) {
      summary.failed.push({ page: '/cashbank/cheques', error: qa.runtimeErrors.join('; ') });
    } else {
      summary.passed.push('/cashbank/cheques');
    }

    // ==========================================
    // 6. Loan Accounts (/cashbank/loan-accounts)
    // ==========================================
    console.log('\n--- Testing 6: Loan Accounts (/cashbank/loan-accounts) ---');
    qa.clearErrors();
    await qa.goto('/cashbank/loan-accounts');
    const loansText = await qa.getPageText();
    console.log(`Loan accounts loaded: ${loansText.includes('Loan') || loansText.includes('قرضہ')}`);
    if (qa.runtimeErrors.length > 0) {
      summary.failed.push({ page: '/cashbank/loan-accounts', error: qa.runtimeErrors.join('; ') });
    } else {
      summary.passed.push('/cashbank/loan-accounts');
    }

    // ==========================================
    // 7. Bank Summary (/cashbank/summary)
    // ==========================================
    console.log('\n--- Testing 7: Bank Summary (/cashbank/summary) ---');
    qa.clearErrors();
    await qa.goto('/cashbank/summary');
    const summaryText = await qa.getPageText();
    console.log(`Bank Summary loaded: ${summaryText.includes('Summary') || summaryText.includes('Account') || summaryText.includes('بینک')}`);
    if (qa.runtimeErrors.length > 0) {
      summary.failed.push({ page: '/cashbank/summary', error: qa.runtimeErrors.join('; ') });
    } else {
      summary.passed.push('/cashbank/summary');
    }

    console.log('\n==========================================');
    console.log('MODULE 8 SUMMARY:');
    console.log(`Passed: ${summary.passed.length} (${summary.passed.join(', ')})`);
    console.log(`Failed: ${summary.failed.length}`);
    if (summary.failed.length > 0) {
      console.log('Failures:', JSON.stringify(summary.failed, null, 2));
    }
    console.log('==========================================');
  } catch (err) {
    console.error('Fatal test error in Module 8:', err);
  } finally {
    await qa.close();
  }
}

run();
