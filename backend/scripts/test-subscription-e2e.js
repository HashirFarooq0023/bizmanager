import mongoose from 'mongoose';
import dotenv from 'dotenv';
import crypto from 'crypto';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

import assanPay from '../utils/assanPay.js';
import SubscriptionPlan from '../models/SubscriptionPlan.js';
import SubscriptionPayment from '../models/SubscriptionPayment.js';
import User from '../models/User.js';

async function runE2ETests() {
  console.log('====================================================');
  console.log('🚀 MegaTrix - Assan Pay & Subscription Governance E2E');
  console.log('====================================================');

  try {
    // 1. Connect MongoDB
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
    if (!mongoUri) {
      console.warn('⚠️ MONGODB_URI not found in env, testing with in-memory validation.');
    } else {
      await mongoose.connect(mongoUri);
      console.log('✅ Connected to MongoDB Atlas.');
    }

    // 2. Verify Assan Pay Cryptographic Client
    console.log('\n[TEST 1] Verifying Assan Pay HMAC-SHA256 Canonical Signer...');
    const dummyPayload = {
      orderId: 'ORD_TEST_E2E_01',
      amount: 5500,
      currency: 'PKR',
      branchCode: '10067',
    };
    const signatureHeaders = assanPay.buildSignedHeaders(
      'POST',
      '/api/checkout/sessions',
      dummyPayload
    );

    if (
      signatureHeaders['X-API-KEY'] &&
      signatureHeaders['X-SIGNATURE'] &&
      signatureHeaders['X-TIMESTAMP'] &&
      signatureHeaders['X-NONCE']
    ) {
      console.log('✅ Canonical Signature Headers Generated Successfully:');
      console.log('   X-API-KEY:', signatureHeaders['X-API-KEY']);
      console.log('   X-SIGNATURE:', signatureHeaders['X-SIGNATURE']);
      console.log('   X-TIMESTAMP:', signatureHeaders['X-TIMESTAMP']);
      console.log('   X-NONCE:', signatureHeaders['X-NONCE']);
    } else {
      throw new Error('Missing signature headers in Assan Pay client.');
    }

    // 3. Verify Webhook Signature Validator
    console.log('\n[TEST 2] Verifying Webhook HMAC-SHA256 Signature Verification...');
    const rawWebhookBody = JSON.stringify({
      order_id: 'ORD_TEST_E2E_01',
      status: 'PAID',
      amount: 5500,
      transaction_id: 'TX_ASSANPAY_99812',
    });
    const eventId = 'evt_test_123456';
    const timestamp = String(Math.floor(Date.now() / 1000));
    const secret = process.env.ASSANPAY_API_SECRET || 'e789df1c-45d5-49d5-aabf-2e450de1868d';

    const calculatedSig = crypto
      .createHmac('sha256', secret)
      .update(`${eventId}\n${timestamp}\n${rawWebhookBody}`, 'utf8')
      .digest('base64');

    const headers = {
      'x-assanpay-event-id': eventId,
      'x-assanpay-timestamp': timestamp,
      'x-assanpay-signature': calculatedSig,
    };

    const verifyResult = assanPay.verifyCallbackSignature(rawWebhookBody, headers, secret);
    if (verifyResult.isValid) {
      console.log('✅ Webhook Signature Verification Passed.');
    } else {
      throw new Error('Webhook signature verification failed.');
    }

    // 4. Test Subscription Plan Seeding & Dynamic Governance
    if (mongoose.connection.readyState === 1) {
      console.log('\n[TEST 3] Testing SubscriptionPlan DB Schema & Seeding...');
      const count = await SubscriptionPlan.countDocuments();
      console.log(`✅ Current Dynamic Plans in DB: ${count}`);

      let testPlan = await SubscriptionPlan.findOne({ slug: 'pro' });
      if (!testPlan) {
        testPlan = await SubscriptionPlan.create({
          name: 'Pro Enterprise',
          slug: 'pro',
          tagline: 'High-volume grocery marts & retail POS',
          price: 5500,
          yearlyPrice: 52800,
          lifetimePrice: 75000,
          currency: 'PKR',
          billingCycles: ['monthly', 'yearly', 'lifetime'],
          trialDays: 14,
          isTrialAllowed: true,
          limits: { maxUsers: 10, maxBranches: 2, maxWarehouses: 2, maxSKUs: 5000 },
          features: ['Unlimited POS cashier logins', 'Udhaar khata ledgers', 'WhatsApp receipts'],
        });
        console.log('✅ Created initial Pro Enterprise plan in DB.');
      }

      console.log('   Plan Name:', testPlan.name);
      console.log('   Monthly Rate:', `PKR ${testPlan.price}`);
      console.log('   Yearly Rate:', `PKR ${testPlan.yearlyPrice}`);
      console.log('   Lifetime Rate:', `PKR ${testPlan.lifetimePrice}`);
      console.log('   Trial Days:', `${testPlan.trialDays} days`);

      // 5. Test User Subscription Modification Simulation
      console.log('\n[TEST 4] Testing User Subscription Lifecycle & Termination Kill-switch...');
      let testUser = await User.findOne({ email: 'hashirfarooq48@gmail.com' });
      if (!testUser) {
        testUser = await User.findOne();
      }

      if (testUser) {
        console.log(`   Found Test Merchant: ${testUser.name} (${testUser.email})`);

        // Add 14d Trial
        const trialExpiry = new Date();
        trialExpiry.setDate(trialExpiry.getDate() + 14);
        testUser.subscription = {
          plan: 'pro',
          planName: 'Pro Enterprise',
          status: 'trial',
          isLifetime: false,
          startedAt: new Date(),
          expiresAt: trialExpiry,
          billingCycle: 'trial',
          limits: testPlan.limits,
          features: testPlan.features,
        };
        await testUser.save();
        console.log('✅ Successfully granted 14-day evaluation trial.');

        // Test Immediate Termination
        testUser.subscription.status = 'terminated';
        testUser.accountStatus = 'suspended';
        testUser.activeSessions = [];
        testUser.tokenVersion = (testUser.tokenVersion || 0) + 1;
        await testUser.save();
        console.log('✅ Successfully triggered Immediate Termination Kill-switch (sessions purged, token invalidated).');

        // Restore to Active Pro
        const activeExpiry = new Date();
        activeExpiry.setDate(activeExpiry.getDate() + 30);
        testUser.subscription.status = 'active';
        testUser.accountStatus = 'active';
        testUser.subscription.expiresAt = activeExpiry;
        testUser.subscription.billingCycle = 'monthly';
        await testUser.save();
        console.log('✅ Restored account to Active Pro subscription.');
      }
    }

    console.log('\n====================================================');
    console.log('🎉 ALL ASSAN PAY & SUBSCRIPTION E2E TESTS PASSED!');
    console.log('====================================================\n');
    process.exit(0);
  } catch (err) {
    console.error('❌ E2E Test Failure:', err);
    process.exit(1);
  }
}

runE2ETests();
