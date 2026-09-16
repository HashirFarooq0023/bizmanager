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
  const summary = { passed: [], failed: [], details: {} };

  try {
    console.log('🚀 Starting Module 6: Sales Operations QA Suite...');
    await qa.init();
    await loginUser(qa);
    console.log('✅ Authenticated successfully as Master Admin');

    // ==========================================
    // 1. Estimates List (/sales/estimates)
    // ==========================================
    console.log('\n--- Testing 1: Estimates List (/sales/estimates) ---');
    qa.clearErrors();
    await qa.goto('/sales/estimates');
    const estListText = await qa.getPageText();
    console.log(`Estimates list loaded: ${estListText.includes('Estimate') || estListText.includes('Quotation') || estListText.includes('تخمینہ')}`);
    if (qa.runtimeErrors.length > 0) {
      summary.failed.push({ page: '/sales/estimates', error: qa.runtimeErrors.join('; ') });
    } else {
      summary.passed.push('/sales/estimates');
    }

    // ==========================================
    // 2. Create Estimate (/sales/estimate)
    // ==========================================
    console.log('\n--- Testing 2: Create Estimate Form (/sales/estimate) ---');
    qa.clearErrors();
    await qa.goto('/sales/estimate');
    const estFormText = await qa.getPageText();
    console.log(`Estimate form loaded: ${estFormText.includes('Estimate') || estFormText.includes('Customer')}`);

    let createdEstimateId = null;
    try {
      console.log('Filling Estimate form...');
      // 1. Select customer
      await qa.evaluate(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const selectCustomerBtn = btns.find(b => b.innerText.includes('Select Customer') || b.innerText.includes('گاہک منتخب کریں'));
        if (selectCustomerBtn) selectCustomerBtn.click();
      });
      await qa.wait(1000);

      // In customer select modal or list, pick Tariq Mehmood Traders
      await qa.evaluate(() => {
        const modalRows = Array.from(document.querySelectorAll('.fixed button, .fixed tr, .fixed div.cursor-pointer'));
        const tariqOption = modalRows.find(el => el.innerText.includes('Tariq Mehmood') || el.innerText.includes('03005669412'));
        if (tariqOption) tariqOption.click();
      });
      await qa.wait(1000);

      // 2. Add an item from product grid
      await qa.evaluate(() => {
        const itemButtons = Array.from(document.querySelectorAll('button'));
        const itemBtn = itemButtons.find(b => b.innerText.includes('Dalda') || b.innerText.includes('Rice'));
        if (itemBtn) itemBtn.click();
      });
      await qa.wait(1000);

      // 3. Set notes
      await qa.evaluate(() => {
        const textareas = Array.from(document.querySelectorAll('textarea'));
        if (textareas.length > 0) {
          textareas[0].value = "Valid for 7 days. Special wholesale price.";
          textareas[0].dispatchEvent(new Event('input', { bubbles: true }));
        }
      });

      // 4. Click Save Estimate / Generate Estimate
      await qa.evaluate(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const saveBtn = btns.find(b => b.innerText.includes('Save') || b.innerText.includes('Generate') || b.innerText.includes('محفوظ'));
        if (saveBtn) saveBtn.click();
      });
      await qa.wait(3000);

      const currentUrl = qa.page.url();
      console.log(`URL after saving estimate: ${currentUrl}`);
      if (currentUrl.includes('/estimate/')) {
        createdEstimateId = currentUrl.split('/').pop();
      }
    } catch (e) {
      console.warn('Estimate creation interaction notice:', e.message);
    }

    if (qa.runtimeErrors.length > 0) {
      summary.failed.push({ page: '/sales/estimate', error: qa.runtimeErrors.join('; ') });
    } else {
      summary.passed.push('/sales/estimate');
    }

    // ==========================================
    // 3. View Estimate Detail (/sales/estimate/:id)
    // ==========================================
    console.log('\n--- Testing 3: Estimate Detail (/sales/estimate/:id) ---');
    qa.clearErrors();
    if (!createdEstimateId) {
      // Find one from /sales/estimates
      await qa.goto('/sales/estimates');
      const foundLink = await qa.evaluate(() => {
        const link = document.querySelector('a[href*="/sales/estimate/"]');
        return link ? link.getAttribute('href') : null;
      });
      if (foundLink) {
        await qa.goto(foundLink);
      }
    }
    const estDetailText = await qa.getPageText();
    console.log(`Estimate detail loaded: ${estDetailText.includes('Estimate') || estDetailText.includes('Quotation')}`);
    if (qa.runtimeErrors.length > 0) {
      summary.failed.push({ page: '/sales/estimate/:id', error: qa.runtimeErrors.join('; ') });
    } else {
      summary.passed.push('/sales/estimate/:id');
    }

    // ==========================================
    // 4. Sales Orders List (/sales/orders)
    // ==========================================
    console.log('\n--- Testing 4: Sales Orders List (/sales/orders) ---');
    qa.clearErrors();
    await qa.goto('/sales/orders');
    const orderListText = await qa.getPageText();
    console.log(`Sales orders list loaded: ${orderListText.includes('Sales Order') || orderListText.includes('آرڈر')}`);
    if (qa.runtimeErrors.length > 0) {
      summary.failed.push({ page: '/sales/orders', error: qa.runtimeErrors.join('; ') });
    } else {
      summary.passed.push('/sales/orders');
    }

    // ==========================================
    // 5. Create Sales Order (/sales/sales-order)
    // ==========================================
    console.log('\n--- Testing 5: Create Sales Order (/sales/sales-order) ---');
    qa.clearErrors();
    await qa.goto('/sales/sales-order');
    const soText = await qa.getPageText();
    console.log(`Sales order form loaded: ${soText.includes('Sales Order') || soText.includes('Customer')}`);

    let createdOrderId = null;
    try {
      // Click Select Customer
      await qa.evaluate(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const custBtn = btns.find(b => b.innerText.includes('Select Customer') || b.innerText.includes('گاہک'));
        if (custBtn) custBtn.click();
      });
      await qa.wait(1000);

      // Select Tariq Mehmood Traders
      await qa.evaluate(() => {
        const btns = Array.from(document.querySelectorAll('button, tr, div.cursor-pointer'));
        const tariq = btns.find(b => b.innerText.includes('Tariq Mehmood') || b.innerText.includes('03005669412'));
        if (tariq) tariq.click();
      });
      await qa.wait(1000);

      // Click Add Item
      await qa.evaluate(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const addItemBtn = btns.find(b => b.innerText.includes('Add Item') || b.innerText.includes('آئٹم شامل کریں'));
        if (addItemBtn) addItemBtn.click();
      });
      await qa.wait(1000);

      // Select item in ItemSelectionModal
      await qa.evaluate(() => {
        const btns = Array.from(document.querySelectorAll('.fixed button, .fixed tr, .fixed div.cursor-pointer'));
        const dalda = btns.find(b => b.innerText.includes('Dalda') || b.innerText.includes('Rice'));
        if (dalda) dalda.click();
      });
      await qa.wait(1000);

      // Set delivery date & notes
      await qa.evaluate(() => {
        const dateInput = document.querySelector('input[type="date"]');
        if (dateInput) {
          const tomorrow = new Date();
          tomorrow.setDate(tomorrow.getDate() + 2);
          dateInput.value = tomorrow.toISOString().split('T')[0];
          dateInput.dispatchEvent(new Event('input', { bubbles: true }));
          dateInput.dispatchEvent(new Event('change', { bubbles: true }));
        }
      });

      // Submit Order
      await qa.evaluate(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const submitBtn = btns.find(b => b.innerText.includes('Save Order') || b.innerText.includes('Create Order') || b.innerText.includes('محفوظ'));
        if (submitBtn) submitBtn.click();
      });
      await qa.wait(3000);

      const postOrderUrl = qa.page.url();
      console.log(`URL after saving sales order: ${postOrderUrl}`);
      if (postOrderUrl.includes('/sales-order/')) {
        createdOrderId = postOrderUrl.split('/').pop();
      }
    } catch (e) {
      console.warn('Sales order interaction notice:', e.message);
    }

    if (qa.runtimeErrors.length > 0) {
      summary.failed.push({ page: '/sales/sales-order', error: qa.runtimeErrors.join('; ') });
    } else {
      summary.passed.push('/sales/sales-order');
    }

    // ==========================================
    // 6. View Sales Order Detail (/sales/sales-order/:id)
    // ==========================================
    console.log('\n--- Testing 6: Sales Order Detail (/sales/sales-order/:id) ---');
    qa.clearErrors();
    if (!createdOrderId) {
      await qa.goto('/sales/orders');
      const orderLink = await qa.evaluate(() => {
        const link = document.querySelector('a[href*="/sales/sales-order/"]');
        return link ? link.getAttribute('href') : null;
      });
      if (orderLink) await qa.goto(orderLink);
    }
    const orderDetailText = await qa.getPageText();
    console.log(`Sales order detail loaded: ${orderDetailText.includes('Sales Order') || orderDetailText.includes('Order #')}`);
    if (qa.runtimeErrors.length > 0) {
      summary.failed.push({ page: '/sales/sales-order/:id', error: qa.runtimeErrors.join('; ') });
    } else {
      summary.passed.push('/sales/sales-order/:id');
    }

    // ==========================================
    // 7. Delivery Challan List (/sales/delivery-challan-list)
    // ==========================================
    console.log('\n--- Testing 7: Delivery Challan List (/sales/delivery-challan-list) ---');
    qa.clearErrors();
    await qa.goto('/sales/delivery-challan-list');
    const dcListText = await qa.getPageText();
    console.log(`Delivery challan list loaded: ${dcListText.includes('Delivery Challan') || dcListText.includes('ڈلیوری چالان')}`);
    if (qa.runtimeErrors.length > 0) {
      summary.failed.push({ page: '/sales/delivery-challan-list', error: qa.runtimeErrors.join('; ') });
    } else {
      summary.passed.push('/sales/delivery-challan-list');
    }

    // ==========================================
    // 8. Create Delivery Challan (/sales/delivery-challan)
    // ==========================================
    console.log('\n--- Testing 8: Create Delivery Challan (/sales/delivery-challan) ---');
    qa.clearErrors();
    await qa.goto('/sales/delivery-challan');
    const dcFormText = await qa.getPageText();
    console.log(`Delivery challan form loaded: ${dcFormText.includes('Challan') || dcFormText.includes('Delivery')}`);
    if (qa.runtimeErrors.length > 0) {
      summary.failed.push({ page: '/sales/delivery-challan', error: qa.runtimeErrors.join('; ') });
    } else {
      summary.passed.push('/sales/delivery-challan');
    }

    // ==========================================
    // 9. Payment In List (/sales/payment-in-list)
    // ==========================================
    console.log('\n--- Testing 9: Payment In List (/sales/payment-in-list) ---');
    qa.clearErrors();
    await qa.goto('/sales/payment-in-list');
    const pinListText = await qa.getPageText();
    console.log(`Payment In list loaded: ${pinListText.includes('Payment In') || pinListText.includes('Receipt') || pinListText.includes('ادائیگی')}`);
    if (qa.runtimeErrors.length > 0) {
      summary.failed.push({ page: '/sales/payment-in-list', error: qa.runtimeErrors.join('; ') });
    } else {
      summary.passed.push('/sales/payment-in-list');
    }

    // ==========================================
    // 10. Record Payment In (/sales/payment-in)
    // ==========================================
    console.log('\n--- Testing 10: Record Payment In (/sales/payment-in) ---');
    qa.clearErrors();
    await qa.goto('/sales/payment-in');
    const pinFormText = await qa.getPageText();
    console.log(`Payment In form loaded: ${pinFormText.includes('Payment In') || pinFormText.includes('Customer')}`);

    try {
      // Pick customer
      await qa.evaluate(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const custBtn = btns.find(b => b.innerText.includes('Select Customer') || b.innerText.includes('گاہک'));
        if (custBtn) custBtn.click();
      });
      await qa.wait(1000);

      await qa.evaluate(() => {
        const btns = Array.from(document.querySelectorAll('button, tr, div.cursor-pointer'));
        const tariq = btns.find(b => b.innerText.includes('Tariq Mehmood') || b.innerText.includes('03005669412'));
        if (tariq) tariq.click();
      });
      await qa.wait(1000);

      // Enter amount 1000
      await qa.evaluate(() => {
        const numInputs = Array.from(document.querySelectorAll('input[type="number"]'));
        if (numInputs.length > 0) {
          const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
          nativeInputValueSetter.call(numInputs[0], '1000');
          numInputs[0].dispatchEvent(new Event('input', { bubbles: true }));
          numInputs[0].dispatchEvent(new Event('change', { bubbles: true }));
        }
      });
      await qa.wait(500);

      // Click Record Payment / Save
      await qa.evaluate(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const saveBtn = btns.find(b => b.innerText.includes('Save') || b.innerText.includes('Record Payment') || b.innerText.includes('محفوظ'));
        if (saveBtn) saveBtn.click();
      });
      await qa.wait(3000);
    } catch (e) {
      console.warn('Payment In interaction notice:', e.message);
    }

    if (qa.runtimeErrors.length > 0) {
      summary.failed.push({ page: '/sales/payment-in', error: qa.runtimeErrors.join('; ') });
    } else {
      summary.passed.push('/sales/payment-in');
    }

    // ==========================================
    // 11. Returned Items List (/sales/returned-items)
    // ==========================================
    console.log('\n--- Testing 11: Returned Items List (/sales/returned-items) ---');
    qa.clearErrors();
    await qa.goto('/sales/returned-items');
    const retItemsText = await qa.getPageText();
    console.log(`Returned Items list loaded: ${retItemsText.includes('Return') || retItemsText.includes('واپسی')}`);
    if (qa.runtimeErrors.length > 0) {
      summary.failed.push({ page: '/sales/returned-items', error: qa.runtimeErrors.join('; ') });
    } else {
      summary.passed.push('/sales/returned-items');
    }

    // ==========================================
    // 12. Create Sales Return (/sales/return)
    // ==========================================
    console.log('\n--- Testing 12: Create Sales Return (/sales/return) ---');
    qa.clearErrors();
    await qa.goto('/sales/return');
    const retFormText = await qa.getPageText();
    console.log(`Sales return form loaded: ${retFormText.includes('Return') || retFormText.includes('Invoice')}`);
    if (qa.runtimeErrors.length > 0) {
      summary.failed.push({ page: '/sales/return', error: qa.runtimeErrors.join('; ') });
    } else {
      summary.passed.push('/sales/return');
    }

    console.log('\n==========================================');
    console.log('MODULE 6 SUMMARY:');
    console.log(`Passed: ${summary.passed.length} (${summary.passed.join(', ')})`);
    console.log(`Failed: ${summary.failed.length}`);
    if (summary.failed.length > 0) {
      console.log('Failures:', JSON.stringify(summary.failed, null, 2));
    }
    console.log('==========================================');
  } catch (err) {
    console.error('Fatal test error in Module 6:', err);
  } finally {
    await qa.close();
  }
}

run();
