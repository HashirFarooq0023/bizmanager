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
    console.log('🚀 Starting Module 7: Purchase Operations QA Suite...');
    await qa.init();
    await loginUser(qa);
    console.log('✅ Authenticated successfully as Master Admin');

    // ==========================================
    // 1. Purchase List (/purchase/list)
    // ==========================================
    console.log('\n--- Testing 1: Purchase List (/purchase/list) ---');
    qa.clearErrors();
    await qa.goto('/purchase/list');
    const plistText = await qa.getPageText();
    console.log(`Purchase list loaded: ${plistText.includes('Purchase') || plistText.includes('خریداری')}`);
    if (qa.runtimeErrors.length > 0) {
      summary.failed.push({ page: '/purchase/list', error: qa.runtimeErrors.join('; ') });
    } else {
      summary.passed.push('/purchase/list');
    }

    // ==========================================
    // 2. Purchase Entry Form (/purchase/entry)
    // ==========================================
    console.log('\n--- Testing 2: Purchase Entry Form (/purchase/entry) ---');
    qa.clearErrors();
    await qa.goto('/purchase/entry');
    const pentryText = await qa.getPageText();
    console.log(`Purchase entry loaded: ${pentryText.includes('Purchase') || pentryText.includes('Supplier')}`);

    let createdPurchaseId = null;
    try {
      console.log('Filling Purchase Entry form...');
      // Select supplier
      await qa.evaluate(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const suppBtn = btns.find(b => b.innerText.includes('Select Supplier') || b.innerText.includes('سپلائر'));
        if (suppBtn) suppBtn.click();
      });
      await qa.wait(1000);

      // In supplier select modal, pick Al-Madina Rice Traders
      await qa.evaluate(() => {
        const rows = Array.from(document.querySelectorAll('button, tr, div.cursor-pointer'));
        const almadina = rows.find(r => r.innerText.includes('Al-Madina') || r.innerText.includes('03212061745'));
        if (almadina) almadina.click();
      });
      await qa.wait(1000);

      // Enter invoice number
      await qa.evaluate(() => {
        const textInputs = Array.from(document.querySelectorAll('input[type="text"]'));
        const invInput = textInputs.find(i => i.placeholder?.includes('INV') || i.name?.includes('supplierInvoice') || i.parentElement?.innerText?.includes('Invoice'));
        if (invInput) {
          const valSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
          valSetter.call(invInput, 'ALM-INV-' + Math.floor(Math.random() * 10000));
          invInput.dispatchEvent(new Event('input', { bubbles: true }));
          invInput.dispatchEvent(new Event('change', { bubbles: true }));
        }
      });

      // Select item for row
      await qa.evaluate(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const pickItemBtn = btns.find(b => b.innerText.includes('Select Item') || b.innerText.includes('Choose Item'));
        if (pickItemBtn) pickItemBtn.click();
      });
      await qa.wait(1000);

      // Pick Rice or Dalda from item modal
      await qa.evaluate(() => {
        const modalRows = Array.from(document.querySelectorAll('.fixed button, .fixed tr, .fixed div.cursor-pointer'));
        const itemOption = modalRows.find(el => el.innerText.includes('Rice') || el.innerText.includes('Dalda'));
        if (itemOption) itemOption.click();
      });
      await qa.wait(1000);

      // Set quantity & rate if inputs exist
      await qa.evaluate(() => {
        const numInputs = Array.from(document.querySelectorAll('tbody input[type="number"]'));
        if (numInputs.length >= 2) {
          const valSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
          // quantity
          valSetter.call(numInputs[0], '5');
          numInputs[0].dispatchEvent(new Event('input', { bubbles: true }));
          // rate
          valSetter.call(numInputs[1], '6500');
          numInputs[1].dispatchEvent(new Event('input', { bubbles: true }));
        }
      });
      await qa.wait(1000);

      // Save purchase
      await qa.evaluate(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const saveBtn = btns.find(b => b.innerText.includes('Save Purchase') || b.innerText.includes('Finalize') || b.innerText.includes('محفوظ'));
        if (saveBtn) saveBtn.click();
      });
      await qa.wait(3000);

      const postUrl = qa.page.url();
      console.log(`URL after saving purchase: ${postUrl}`);
      if (postUrl.includes('/purchase/')) {
        createdPurchaseId = postUrl.split('/').pop();
      }
    } catch (e) {
      console.warn('Purchase entry interaction notice:', e.message);
    }

    if (qa.runtimeErrors.length > 0) {
      summary.failed.push({ page: '/purchase/entry', error: qa.runtimeErrors.join('; ') });
    } else {
      summary.passed.push('/purchase/entry');
    }

    // ==========================================
    // 3. Purchase Bills List (/purchase/bills)
    // ==========================================
    console.log('\n--- Testing 3: Purchase Bills List (/purchase/bills) ---');
    qa.clearErrors();
    await qa.goto('/purchase/bills');
    const billsText = await qa.getPageText();
    console.log(`Bills list loaded: ${billsText.includes('Bill') || billsText.includes('Purchase Bills') || billsText.includes('بل')}`);
    if (qa.runtimeErrors.length > 0) {
      summary.failed.push({ page: '/purchase/bills', error: qa.runtimeErrors.join('; ') });
    } else {
      summary.passed.push('/purchase/bills');
    }

    // ==========================================
    // 4. Bill Aging Report (/purchase/bills/aging)
    // ==========================================
    console.log('\n--- Testing 4: Bill Aging Report (/purchase/bills/aging) ---');
    qa.clearErrors();
    await qa.goto('/purchase/bills/aging');
    const agingText = await qa.getPageText();
    console.log(`Bill aging loaded: ${agingText.includes('Aging') || agingText.includes('Bills') || agingText.includes('Days')}`);
    if (qa.runtimeErrors.length > 0) {
      summary.failed.push({ page: '/purchase/bills/aging', error: qa.runtimeErrors.join('; ') });
    } else {
      summary.passed.push('/purchase/bills/aging');
    }

    // ==========================================
    // 5. Purchase Orders List (/purchase-orders)
    // ==========================================
    console.log('\n--- Testing 5: Purchase Orders List (/purchase-orders) ---');
    qa.clearErrors();
    await qa.goto('/purchase-orders');
    const poListText = await qa.getPageText();
    console.log(`Purchase Orders list loaded: ${poListText.includes('Purchase Order') || poListText.includes('Orders')}`);
    if (qa.runtimeErrors.length > 0) {
      summary.failed.push({ page: '/purchase-orders', error: qa.runtimeErrors.join('; ') });
    } else {
      summary.passed.push('/purchase-orders');
    }

    // ==========================================
    // 6. Create Purchase Order (/purchase-orders/new)
    // ==========================================
    console.log('\n--- Testing 6: Create Purchase Order (/purchase-orders/new) ---');
    qa.clearErrors();
    await qa.goto('/purchase-orders/new');
    const poFormText = await qa.getPageText();
    console.log(`PO Form loaded: ${poFormText.includes('Purchase Order') || poFormText.includes('Supplier')}`);
    if (qa.runtimeErrors.length > 0) {
      summary.failed.push({ page: '/purchase-orders/new', error: qa.runtimeErrors.join('; ') });
    } else {
      summary.passed.push('/purchase-orders/new');
    }

    // ==========================================
    // 7. GRNs List (/grns)
    // ==========================================
    console.log('\n--- Testing 7: GRNs List (/grns) ---');
    qa.clearErrors();
    await qa.goto('/grns');
    const grnListText = await qa.getPageText();
    console.log(`GRN List loaded: ${grnListText.includes('GRN') || grnListText.includes('Goods Received')}`);
    if (qa.runtimeErrors.length > 0) {
      summary.failed.push({ page: '/grns', error: qa.runtimeErrors.join('; ') });
    } else {
      summary.passed.push('/grns');
    }

    // ==========================================
    // 8. Create GRN (/grns/new)
    // ==========================================
    console.log('\n--- Testing 8: Create GRN (/grns/new) ---');
    qa.clearErrors();
    await qa.goto('/grns/new');
    const grnFormText = await qa.getPageText();
    console.log(`GRN Form loaded: ${grnFormText.includes('GRN') || grnFormText.includes('Goods Received') || grnFormText.includes('Purchase Order')}`);
    if (qa.runtimeErrors.length > 0) {
      summary.failed.push({ page: '/grns/new', error: qa.runtimeErrors.join('; ') });
    } else {
      summary.passed.push('/grns/new');
    }

    // ==========================================
    // 9. Purchase Returns List (/purchase/returns)
    // ==========================================
    console.log('\n--- Testing 9: Purchase Returns List (/purchase/returns) ---');
    qa.clearErrors();
    await qa.goto('/purchase/returns');
    const prListText = await qa.getPageText();
    console.log(`Purchase Returns list loaded: ${prListText.includes('Return') || prListText.includes('واپسی')}`);
    if (qa.runtimeErrors.length > 0) {
      summary.failed.push({ page: '/purchase/returns', error: qa.runtimeErrors.join('; ') });
    } else {
      summary.passed.push('/purchase/returns');
    }

    // ==========================================
    // 10. Create Purchase Return (/purchase/returns/new)
    // ==========================================
    console.log('\n--- Testing 10: Create Purchase Return (/purchase/returns/new) ---');
    qa.clearErrors();
    await qa.goto('/purchase/returns/new');
    const prFormText = await qa.getPageText();
    console.log(`Purchase Return form loaded: ${prFormText.includes('Return') || prFormText.includes('Supplier')}`);
    if (qa.runtimeErrors.length > 0) {
      summary.failed.push({ page: '/purchase/returns/new', error: qa.runtimeErrors.join('; ') });
    } else {
      summary.passed.push('/purchase/returns/new');
    }

    // ==========================================
    // 11. Payment Out List (/purchase/payment-out/list)
    // ==========================================
    console.log('\n--- Testing 11: Payment Out List (/purchase/payment-out/list) ---');
    qa.clearErrors();
    await qa.goto('/purchase/payment-out/list');
    const poutListText = await qa.getPageText();
    console.log(`Payment Out list loaded: ${poutListText.includes('Payment Out') || poutListText.includes('ادائیگی')}`);
    if (qa.runtimeErrors.length > 0) {
      summary.failed.push({ page: '/purchase/payment-out/list', error: qa.runtimeErrors.join('; ') });
    } else {
      summary.passed.push('/purchase/payment-out/list');
    }

    // ==========================================
    // 12. Record Payment Out (/purchase/payment-out)
    // ==========================================
    console.log('\n--- Testing 12: Record Payment Out (/purchase/payment-out) ---');
    qa.clearErrors();
    await qa.goto('/purchase/payment-out');
    const poutFormText = await qa.getPageText();
    console.log(`Payment Out form loaded: ${poutFormText.includes('Payment Out') || poutFormText.includes('Supplier')}`);
    if (qa.runtimeErrors.length > 0) {
      summary.failed.push({ page: '/purchase/payment-out', error: qa.runtimeErrors.join('; ') });
    } else {
      summary.passed.push('/purchase/payment-out');
    }

    // ==========================================
    // 13. Expenses Tracker (/purchase/expenses)
    // ==========================================
    console.log('\n--- Testing 13: Expenses Tracker (/purchase/expenses) ---');
    qa.clearErrors();
    await qa.goto('/purchase/expenses');
    const expText = await qa.getPageText();
    console.log(`Expenses page loaded: ${expText.includes('Expense') || expText.includes('اخراجات')}`);

    // Test adding an expense: click Add Expense
    try {
      await qa.evaluate(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const addExpBtn = btns.find(b => b.innerText.includes('Add Expense') || b.innerText.includes('نیا خرچ'));
        if (addExpBtn) addExpBtn.click();
      });
      await qa.wait(1000);

      // Fill expense title and amount
      await qa.evaluate(() => {
        const titleInput = document.querySelector('input[name="title"], input[placeholder*="title" i], input[placeholder*="expense" i]');
        if (titleInput) {
          const valSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
          valSetter.call(titleInput, 'Electricity Bill - LESCO (Shop)');
          titleInput.dispatchEvent(new Event('input', { bubbles: true }));
        }

        const amtInput = document.querySelector('input[type="number"]');
        if (amtInput) {
          const valSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
          valSetter.call(amtInput, '4500');
          amtInput.dispatchEvent(new Event('input', { bubbles: true }));
        }
      });
      await qa.wait(500);

      // Submit modal if save button exists
      await qa.evaluate(() => {
        const btns = Array.from(document.querySelectorAll('.fixed button, button[type="submit"]'));
        const saveExpBtn = btns.find(b => b.innerText.includes('Save') || b.innerText.includes('Add') || b.innerText.includes('محفوظ'));
        if (saveExpBtn) saveExpBtn.click();
      });
      await qa.wait(2000);
    } catch (e) {
      console.warn('Expense addition notice:', e.message);
    }

    if (qa.runtimeErrors.length > 0) {
      summary.failed.push({ page: '/purchase/expenses', error: qa.runtimeErrors.join('; ') });
    } else {
      summary.passed.push('/purchase/expenses');
    }

    console.log('\n==========================================');
    console.log('MODULE 7 SUMMARY:');
    console.log(`Passed: ${summary.passed.length} (${summary.passed.join(', ')})`);
    console.log(`Failed: ${summary.failed.length}`);
    if (summary.failed.length > 0) {
      console.log('Failures:', JSON.stringify(summary.failed, null, 2));
    }
    console.log('==========================================');
  } catch (err) {
    console.error('Fatal test error in Module 7:', err);
  } finally {
    await qa.close();
  }
}

run();
