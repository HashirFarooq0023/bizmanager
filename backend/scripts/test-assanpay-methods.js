import assanPay from '../utils/assanPay.js';
import crypto from 'crypto';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

async function testPaymentMethods() {
  const methods = ['JAZZCASH', 'EASYPAISA', 'CARD', 'CARDS', 'ZINDIGI', '1LINK', 'QR'];

  for (const method of methods) {
    const timePart = Date.now().toString(36).toUpperCase();
    const randPart = crypto.randomBytes(2).toString('hex').toUpperCase();
    const testOrderId = `BM-${timePart}-${randPart}`;

    try {
      console.log(`\nTesting paymentMethodName: "${method}" with Order ID: ${testOrderId}...`);
      const result = await assanPay.createCheckoutSession({
        orderId: testOrderId,
        amount: 100,
        branchCode: '10067',
        paymentMethodName: method,
        customerName: 'MegaTrix Test Merchant',
        customerContact: '03001234567',
        customerEmail: 'test@megatrixai.com',
      });
      console.log(`✅ SUCCESS for ${method}:`, result);
      break;
    } catch (err) {
      console.log(`❌ Result for ${method}:`, err.message, err.details?.errorCode);
    }
  }
}

testPaymentMethods();
