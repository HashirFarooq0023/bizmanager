import assanPay from '../utils/assanPay.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

async function testBalanceCheck() {
  console.log('--- Testing Assan Pay Host-to-Host Balance Inquiry ---');
  try {
    const res = await assanPay.getMerchantBalance();
    console.log('Assan Pay Balance Result:', res);
  } catch (err) {
    console.error('Balance Error:', err);
  }
}

testBalanceCheck();
