import assanPay from '../utils/assanPay.js';
import crypto from 'crypto';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

async function testLiveCheckoutCall() {
  console.log('--- Testing Assan Pay Checkout Session API Call with Valid 16-Char OrderId ---');
  
  // Format: BM-XXXXXXX-XXXX (Strictly between 6 and 20 characters)
  const timePart = Date.now().toString(36).toUpperCase();
  const randPart = crypto.randomBytes(2).toString('hex').toUpperCase();
  const testOrderId = `BM-${timePart}-${randPart}`;
  console.log(`Generated Order ID: ${testOrderId} (Length: ${testOrderId.length})`);
  
  try {
    const result = await assanPay.createCheckoutSession({
      orderId: testOrderId,
      amount: 100, // 100 PKR test transaction
      branchCode: '10067',
      customerName: 'MegaTrix Test Merchant',
      customerContact: '03001234567',
      customerEmail: 'test@megatrixai.com',
    });

    console.log('\n🎉 SUCCESS! Assan Pay Hosted Session Generated:');
    console.log('   Order ID:', result.orderId);
    console.log('   Session ID:', result.sessionId);
    console.log('   Checkout URL:', result.checkoutUrl);
    console.log('   Expires At:', result.expiresAt);
  } catch (error) {
    console.error('\n❌ Assan Pay Error Response:', {
      message: error.message,
      statusCode: error.statusCode,
      details: error.details,
    });
  }
}

testLiveCheckoutCall();
