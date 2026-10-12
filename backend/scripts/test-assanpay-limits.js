import assanPay from '../utils/assanPay.js';
import crypto from 'crypto';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

async function testWithTestingLimits() {
  console.log('--- Testing Assan Pay Checkout Session with Amount = 10 PKR (Within 1-100 PKR Test Limit) ---');
  
  const timePart = Date.now().toString(36).toUpperCase();
  const randPart = crypto.randomBytes(2).toString('hex').toUpperCase();
  const testOrderId = `BM-${timePart}-${randPart}`;
  
  console.log(`Generated Order ID: ${testOrderId} (Length: ${testOrderId.length})`);
  
  try {
    const result = await assanPay.createCheckoutSession({
      orderId: testOrderId,
      amount: 10, // Exactly 10 PKR within the 1-100 testing limit!
      branchCode: '10067',
      customerName: 'MegaTrix Merchant',
      customerContact: '03001234567',
      customerEmail: 'admin@megatrixai.com',
    });

    console.log('\n🎉 SUCCESS! Assan Pay Hosted Checkout Session Created:');
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

testWithTestingLimits();
