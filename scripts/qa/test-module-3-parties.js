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
  const summary = { passed: [], failed: [], bugs: [] };

  try {
    console.log('🚀 Starting Module 3: Parties (Customers & Suppliers) QA Suite...');
    await qa.init();
    await loginUser(qa);
    console.log('✅ Authenticated successfully as Master Admin');

    // ==========================================
    // 1. Customers List (/customers)
    // ==========================================
    console.log('\n--- Testing 1: Customers List (/customers) ---');
    qa.clearErrors();
    await qa.goto('/customers');
    const custText = await qa.getPageText();
    const hasCustHeader = custText.includes('Customers') || custText.includes('گراہک');
    console.log(`Customers page rendered: ${hasCustHeader}`);
    if (qa.runtimeErrors.length > 0) {
      summary.failed.push({ page: '/customers', error: qa.runtimeErrors.join('; ') });
    } else {
      summary.passed.push('/customers');
    }

    // ==========================================
    // 2. Add Customer (/customers/add)
    // ==========================================
    console.log('\n--- Testing 2: Add Customer (/customers/add) ---');
    qa.clearErrors();
    await qa.goto('/customers/add');

    // Test form validation: empty submit
    await qa.click('button[type="submit"]');
    await qa.wait(600);
    console.log('Tested empty submission');

    // Enter realistic Pakistani customer data
    const testPhone = `0300${Math.floor(1000000 + Math.random() * 9000000)}`;
    const testCustomerName = `Tariq Mehmood Traders ${Date.now().toString().slice(-4)}`;
    console.log(`Creating customer: "${testCustomerName}", Phone: ${testPhone}`);

    await qa.type('input[name="name"]', testCustomerName);
    await qa.type('input[name="phone"]', testPhone);
    await qa.type('input[name="email"]', `tariq_${Date.now().toString().slice(-4)}@test.com`);
    await qa.type('textarea[name="address"], input[name="address"]', 'Shop #14, Tariq Road Commercial Area, Karachi');

    await qa.click('button[type="submit"]');
    await qa.wait(3000);

    const afterAddCustUrl = qa.page.url();
    console.log(`Post-add customer URL: ${afterAddCustUrl}`);

    if (afterAddCustUrl.includes('/customers') && !afterAddCustUrl.includes('/add')) {
      console.log('✅ Customer created successfully and navigated to customer list');
      summary.passed.push('/customers/add');
    } else {
      const pageTextNow = await qa.getPageText();
      console.error('❌ Failed to navigate back to /customers. Page text:', pageTextNow.slice(0, 300));
      summary.failed.push({ page: '/customers/add', error: 'Did not redirect to /customers' });
    }

    // Verify newly added customer is in the list
    await qa.goto('/customers');
    const custPageListText = await qa.getPageText();
    const foundCreatedCustomer = custPageListText.includes(testCustomerName);
    console.log(`Verified customer in list: ${foundCreatedCustomer}`);

    // Test customer search
    const searchField = await qa.page.$('input[placeholder*="Search"], input[type="text"]');
    if (searchField) {
      await qa.type('input[placeholder*="Search"], input[type="text"]', testCustomerName);
      await qa.wait(500);
      const searchedText = await qa.getPageText();
      console.log(`Customer search works: ${searchedText.includes(testCustomerName)}`);
    }

    // ==========================================
    // 3. Customers With Dues (/customers/with-dues)
    // ==========================================
    console.log('\n--- Testing 3: Customers With Dues (/customers/with-dues) ---');
    qa.clearErrors();
    await qa.goto('/customers/with-dues');
    const withDuesText = await qa.getPageText();
    console.log(`Customers with dues loaded: ${withDuesText.includes('Dues') || withDuesText.includes('ادھار') || withDuesText.includes('Customers')}`);
    if (qa.runtimeErrors.length > 0) {
      summary.failed.push({ page: '/customers/with-dues', error: qa.runtimeErrors.join('; ') });
    } else {
      summary.passed.push('/customers/with-dues');
    }

    // ==========================================
    // 4. Customer Detail (/customers/:id) & Edit (/customers/edit/:id)
    // ==========================================
    console.log('\n--- Testing 4: Customer Detail & Edit ---');
    await qa.goto('/customers');
    const clickedCustView = await qa.evaluate((targetName) => {
      const rows = Array.from(document.querySelectorAll('tbody tr'));
      const row = rows.find((r) => r.innerText.includes(targetName)) || rows[0];
      if (row) {
        const viewBtn = Array.from(row.querySelectorAll('button')).find((b) => b.innerText.includes('View') || b.innerText.includes('دیکھیں'));
        if (viewBtn) {
          viewBtn.click();
          return true;
        }
      }
      return false;
    }, testCustomerName);

    await qa.wait(2000);
    const custDetailUrl = qa.page.url();
    console.log(`Customer detail URL: ${custDetailUrl}`);
    if (custDetailUrl.includes('/customers/') && !custDetailUrl.endsWith('/customers')) {
      const detailText = await qa.getPageText();
      console.log(`Customer detail loaded: ${detailText.includes('Customer') || detailText.includes('Phone') || detailText.includes('گراہک')}`);
      if (qa.runtimeErrors.length > 0) {
        summary.failed.push({ page: '/customers/:id', error: qa.runtimeErrors.join('; ') });
      } else {
        summary.passed.push('/customers/:id');
      }

      const customerId = custDetailUrl.split('/').filter(Boolean).pop();

      // Test Edit Customer: /customers/edit/:id
      console.log(`Testing Edit Customer: /customers/edit/${customerId}`);
      qa.clearErrors();
      await qa.goto(`/customers/edit/${customerId}`);
      const editText = await qa.getPageText();
      console.log(`Edit customer page loaded: ${editText.includes('Edit') || editText.includes('Customer')}`);
      if (qa.runtimeErrors.length > 0) {
        summary.failed.push({ page: '/customers/edit/:id', error: qa.runtimeErrors.join('; ') });
      } else {
        summary.passed.push('/customers/edit/:id');
      }

      // Test Due Adjustment: /customers/adjust-due/:id
      console.log(`Testing Due Adjustment: /customers/adjust-due/${customerId}`);
      qa.clearErrors();
      await qa.goto(`/customers/adjust-due/${customerId}`);
      const adjText = await qa.getPageText();
      console.log(`Due adjustment page loaded: ${adjText.includes('Adjustment') || adjText.includes('Due') || adjText.includes('ادھار')}`);
      if (qa.runtimeErrors.length > 0) {
        summary.failed.push({ page: '/customers/adjust-due/:id', error: qa.runtimeErrors.join('; ') });
      } else {
        summary.passed.push('/customers/adjust-due/:id');
      }
    }

    // ==========================================
    // 5. Suppliers List (/suppliers)
    // ==========================================
    console.log('\n--- Testing 5: Suppliers List (/suppliers) ---');
    qa.clearErrors();
    await qa.goto('/suppliers');
    const supText = await qa.getPageText();
    const hasSupHeader = supText.includes('Suppliers') || supText.includes('سپلائرز');
    console.log(`Suppliers page rendered: ${hasSupHeader}`);
    if (qa.runtimeErrors.length > 0) {
      summary.failed.push({ page: '/suppliers', error: qa.runtimeErrors.join('; ') });
    } else {
      summary.passed.push('/suppliers');
    }

    // ==========================================
    // 6. Add Supplier (/suppliers/add)
    // ==========================================
    console.log('\n--- Testing 6: Add Supplier (/suppliers/add) ---');
    qa.clearErrors();
    await qa.goto('/suppliers/add');

    // Test form validation: empty submit
    await qa.click('button[type="submit"]');
    await qa.wait(500);
    console.log('Tested empty supplier submission');

    const testSupPhone = `0321${Math.floor(1000000 + Math.random() * 9000000)}`;
    const testSupplierName = `Al-Madina Rice Traders ${Date.now().toString().slice(-4)}`;
    console.log(`Creating supplier: "${testSupplierName}", Phone: ${testSupPhone}`);

    await qa.type('input[name="businessName"]', testSupplierName);
    await qa.type('input[name="contactPersonName"]', 'Haji Muhammad Aslam');
    await qa.type('input[name="contactNo"]', testSupPhone);
    await qa.type('input[name="email"]', `almadina_${Date.now().toString().slice(-4)}@supplier.com`);
    await qa.type('textarea[name="physicalAddress"], input[name="physicalAddress"]', 'G.T. Road, Gujranwala, Punjab');

    await qa.click('button[type="submit"]');
    await qa.wait(3000);

    const afterAddSupUrl = qa.page.url();
    console.log(`Post-add supplier URL: ${afterAddSupUrl}`);

    if (afterAddSupUrl.includes('/suppliers') && !afterAddSupUrl.includes('/add')) {
      console.log('✅ Supplier created successfully and navigated to supplier list');
      summary.passed.push('/suppliers/add');
    } else {
      const pageTextNow = await qa.getPageText();
      console.error('❌ Failed to navigate back to /suppliers. Page text:', pageTextNow.slice(0, 300));
      summary.failed.push({ page: '/suppliers/add', error: 'Did not redirect to /suppliers' });
    }

    // Verify newly added supplier in table
    await qa.goto('/suppliers');
    const supPageListText = await qa.getPageText();
    const foundCreatedSupplier = supPageListText.includes(testSupplierName);
    console.log(`Verified supplier in list: ${foundCreatedSupplier}`);

    // ==========================================
    // 7. Supplier Detail (/suppliers/:id) & Edit (/suppliers/:id/edit)
    // ==========================================
    console.log('\n--- Testing 7: Supplier Detail & Edit ---');
    const supDetailLink = await qa.evaluate((targetName) => {
      const links = Array.from(document.querySelectorAll('a[href*="/suppliers/"]'));
      const found = links.find((a) => a.getAttribute('href') && !a.getAttribute('href').includes('/add'));
      return found ? found.getAttribute('href') : null;
    }, testSupplierName);

    await qa.goto('/suppliers');
    const clickedSupView = await qa.evaluate((targetName) => {
      const rows = Array.from(document.querySelectorAll('tbody tr'));
      const row = rows.find((r) => r.innerText.includes(targetName)) || rows[0];
      if (row) {
        const viewBtn = Array.from(row.querySelectorAll('button')).find((b) => b.innerText.includes('View') || b.innerText.includes('دیکھیں'));
        if (viewBtn) {
          viewBtn.click();
          return true;
        }
      }
      return false;
    }, testSupplierName);

    await qa.wait(2000);
    const supDetailUrl = qa.page.url();
    console.log(`Supplier detail URL: ${supDetailUrl}`);
    if (supDetailUrl.includes('/suppliers/') && !supDetailUrl.endsWith('/suppliers')) {
      const detailText = await qa.getPageText();
      console.log(`Supplier detail loaded: ${detailText.includes('Supplier') || detailText.includes('Contact') || detailText.includes('سپلائر')}`);
      if (qa.runtimeErrors.length > 0) {
        summary.failed.push({ page: '/suppliers/:id', error: qa.runtimeErrors.join('; ') });
      } else {
        summary.passed.push('/suppliers/:id');
      }

      // Test edit supplier
      const supplierId = supDetailUrl.split('/').filter(Boolean).pop();
      console.log(`Testing Edit Supplier: /suppliers/${supplierId}/edit`);
      qa.clearErrors();
      await qa.goto(`/suppliers/${supplierId}/edit`);
      const editSupText = await qa.getPageText();
      console.log(`Edit supplier loaded: ${editSupText.includes('Edit') || editSupText.includes('Supplier')}`);
      if (qa.runtimeErrors.length > 0) {
        summary.failed.push({ page: '/suppliers/:id/edit', error: qa.runtimeErrors.join('; ') });
      } else {
        summary.passed.push('/suppliers/:id/edit');
      }
    }

    console.log('\n==========================================');
    console.log('MODULE 3 SUMMARY:');
    console.log(`Passed: ${summary.passed.length} (${summary.passed.join(', ')})`);
    console.log(`Failed: ${summary.failed.length}`);
    if (summary.failed.length > 0) {
      console.log('Failures:', JSON.stringify(summary.failed, null, 2));
    }
    console.log('==========================================');
  } catch (err) {
    console.error('Fatal test error in Module 3:', err);
  } finally {
    await qa.close();
  }
}

run();
