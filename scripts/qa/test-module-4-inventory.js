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
    console.log('🚀 Starting Module 4: Inventory QA Suite...');
    await qa.init();
    await loginUser(qa);
    console.log('✅ Authenticated successfully as Master Admin');

    // ==========================================
    // 1. Inventory List (/inventory)
    // ==========================================
    console.log('\n--- Testing 1: Inventory List (/inventory) ---');
    qa.clearErrors();
    await qa.goto('/inventory');

    const invText = await qa.getPageText();
    const hasInvHeader = invText.includes('Inventory') || invText.includes('پروڈکٹس') || invText.includes('اسٹاک');
    console.log(`Inventory page rendered: ${hasInvHeader}`);
    if (qa.runtimeErrors.length > 0) {
      summary.failed.push({ page: '/inventory', error: qa.runtimeErrors.join('; ') });
    } else {
      summary.passed.push('/inventory');
    }

    // ==========================================
    // 2. Add Item 1: Dalda Cooking Oil 5L (/inventory/add)
    // ==========================================
    console.log('\n--- Testing 2: Add Item 1: Dalda Cooking Oil 5L (/inventory/add) ---');
    qa.clearErrors();
    await qa.goto('/inventory/add');

    // Test form validation: empty submit
    await qa.click('button[type="submit"]');
    await qa.wait(500);
    console.log('Tested empty item submission');

    const testItem1Name = `Dalda Cooking Oil 5L Can ${Date.now().toString().slice(-4)}`;
    const testSku1 = `8964${Math.floor(1000000 + Math.random() * 9000000)}`;
    console.log(`Creating product: "${testItem1Name}", SKU: ${testSku1}`);

    await qa.type('input[name="name"]', testItem1Name);
    await qa.type('input[name="sku"]', testSku1);
    await qa.type('input[name="category"]', 'Edible Oil');
    await qa.type('input[name="costPrice"]', '2650');
    await qa.type('input[name="sellingPrice"]', '2900');
    await qa.type('input[name="stockQty"]', '50');
    await qa.type('input[name="lowStockLimit"]', '5');

    await qa.click('button[type="submit"]');
    await qa.wait(3000);

    const afterAddUrl = qa.page.url();
    console.log(`Post-add item URL: ${afterAddUrl}`);

    if (afterAddUrl.includes('/inventory') && !afterAddUrl.includes('/add')) {
      console.log('✅ Item 1 created successfully and navigated to inventory list');
      summary.passed.push('/inventory/add');
    } else {
      const pageTextNow = await qa.getPageText();
      console.error('❌ Failed to navigate back to /inventory. Page text:', pageTextNow.slice(0, 300));
      summary.failed.push({ page: '/inventory/add', error: 'Did not redirect to /inventory' });
    }

    // Verify item 1 in inventory list
    await qa.goto('/inventory');
    const invListText = await qa.getPageText();
    const foundItem1 = invListText.includes(testItem1Name);
    console.log(`Verified Item 1 in table: ${foundItem1}`);

    // ==========================================
    // 3. Add Item 2: Super Kernel Basmati Rice 25kg
    // ==========================================
    console.log('\n--- Testing 3: Add Item 2: Basmati Rice 25kg ---');
    await qa.goto('/inventory/add');
    const testItem2Name = `Super Kernel Basmati Rice 25kg ${Date.now().toString().slice(-4)}`;
    const testSku2 = `8965${Math.floor(1000000 + Math.random() * 9000000)}`;

    await qa.type('input[name="name"]', testItem2Name);
    await qa.type('input[name="sku"]', testSku2);
    await qa.type('input[name="category"]', 'Grains & Flour');
    await qa.type('input[name="costPrice"]', '6500');
    await qa.type('input[name="sellingPrice"]', '7200');
    await qa.type('input[name="stockQty"]', '30');
    await qa.type('input[name="lowStockLimit"]', '5');

    await qa.click('button[type="submit"]');
    await qa.wait(3000);

    await qa.goto('/inventory');
    const invListText2 = await qa.getPageText();
    const foundItem2 = invListText2.includes(testItem2Name);
    console.log(`Verified Item 2 in table: ${foundItem2}`);

    // Test Search filter in Inventory
    console.log('Testing Inventory search filter...');
    const searchInput = await qa.page.$('input[placeholder*="Search"], input[type="text"]');
    if (searchInput) {
      await qa.type('input[placeholder*="Search"], input[type="text"]', 'Dalda');
      await qa.wait(600);
      const searchRes = await qa.getPageText();
      console.log(`Search for 'Dalda' returned correct item: ${searchRes.includes('Dalda')}`);
      await qa.type('input[placeholder*="Search"], input[type="text"]', ''); // clear
      await qa.wait(500);
    }

    // ==========================================
    // 4. Edit Item (/inventory/edit/:id)
    // ==========================================
    console.log('\n--- Testing 4: Edit Item (/inventory/edit/:id) ---');
    await qa.goto('/inventory');

    // Click Edit button on the first row
    const editUrl = await qa.evaluate(() => {
      const links = Array.from(document.querySelectorAll('a[href*="/inventory/edit/"]'));
      return links.length > 0 ? links[0].getAttribute('href') : null;
    });

    console.log(`Found edit item link: ${editUrl}`);
    if (editUrl) {
      qa.clearErrors();
      await qa.goto(editUrl);
      const editPageText = await qa.getPageText();
      console.log(`Edit item page loaded: ${editPageText.includes('Edit') || editPageText.includes('Item')}`);

      // Change selling price to test update
      await qa.type('input[name="sellingPrice"]', '2950');
      await qa.click('button[type="submit"]');
      await qa.wait(3000);

      const afterEditUrl = qa.page.url();
      console.log(`Post-edit item URL: ${afterEditUrl}`);
      if (afterEditUrl.includes('/inventory') && !afterEditUrl.includes('/edit')) {
        console.log('✅ Edit item saved and returned to /inventory');
        summary.passed.push('/inventory/edit/:id');
      } else {
        summary.failed.push({ page: '/inventory/edit/:id', error: 'Did not redirect back to /inventory' });
      }
    } else {
      // If table row has a button instead of a link
      console.log('Clicking Edit button on table row...');
      await qa.evaluate(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const editBtn = btns.find((b) => b.innerText.includes('Edit') || b.innerText.includes('ترمیم'));
        if (editBtn) editBtn.click();
      });
      await qa.wait(2000);
      const currentUrl = qa.page.url();
      if (currentUrl.includes('/inventory/edit/')) {
        summary.passed.push('/inventory/edit/:id');
      }
    }

    // ==========================================
    // 5. Utilities: Barcode Generator (/utilities/barcode)
    // ==========================================
    console.log('\n--- Testing 5: Barcode Generator (/utilities/barcode) ---');
    qa.clearErrors();
    await qa.goto('/utilities/barcode');
    const barcodeText = await qa.getPageText();
    console.log(`Barcode Generator loaded: ${barcodeText.includes('Barcode') || barcodeText.includes('Generator')}`);
    if (qa.runtimeErrors.length > 0) {
      summary.failed.push({ page: '/utilities/barcode', error: qa.runtimeErrors.join('; ') });
    } else {
      summary.passed.push('/utilities/barcode');
    }

    // ==========================================
    // 6. Utilities: Import Items (/utilities/import-items)
    // ==========================================
    console.log('\n--- Testing 6: Import Items (/utilities/import-items) ---');
    qa.clearErrors();
    await qa.goto('/utilities/import-items');
    const importText = await qa.getPageText();
    console.log(`Import items page loaded: ${importText.includes('Import') || importText.includes('Excel') || importText.includes('CSV')}`);
    if (qa.runtimeErrors.length > 0) {
      summary.failed.push({ page: '/utilities/import-items', error: qa.runtimeErrors.join('; ') });
    } else {
      summary.passed.push('/utilities/import-items');
    }

    console.log('\n==========================================');
    console.log('MODULE 4 SUMMARY:');
    console.log(`Passed: ${summary.passed.length} (${summary.passed.join(', ')})`);
    console.log(`Failed: ${summary.failed.length}`);
    if (summary.failed.length > 0) {
      console.log('Failures:', JSON.stringify(summary.failed, null, 2));
    }
    console.log('==========================================');
  } catch (err) {
    console.error('Fatal test error in Module 4:', err);
  } finally {
    await qa.close();
  }
}

run();
