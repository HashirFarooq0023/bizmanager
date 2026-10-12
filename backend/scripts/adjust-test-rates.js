import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

import SubscriptionPlan from '../models/SubscriptionPlan.js';

async function adjustTestRates() {
  console.log('--- Adjusting Subscription Plan Rates to Assan Pay 1-100 PKR Test Limits ---');
  
  const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
  if (!mongoUri) {
    console.error('❌ MONGODB_URI missing in .env');
    process.exit(1);
  }

  await mongoose.connect(mongoUri);
  console.log('✅ Connected to MongoDB Atlas.');

  const testPlans = [
    {
      slug: 'starter',
      name: 'Starter POS',
      tagline: 'Ideal for neighborhood retail shops & single registers',
      price: 10, // 10 PKR (Test Limit 1-100)
      yearlyPrice: 50, // 50 PKR (Test Limit 1-100)
      lifetimePrice: 100, // 100 PKR (Test Limit 1-100)
      currency: 'PKR',
      billingCycles: ['monthly', 'yearly'],
      trialDays: 14,
      isTrialAllowed: true,
      badge: 'Starter Test',
      displayOrder: 1,
      isActive: true,
      limits: { maxUsers: 2, maxBranches: 1, maxWarehouses: 1, maxSKUs: 500 },
      features: [
        'Single POS terminal registration',
        'Barcode scanning & label printing',
        'Basic customer udhaar khata',
        'Thermal receipt printing (58mm/80mm)',
        'Daily profit & sales reconciliation',
      ],
    },
    {
      slug: 'pro',
      name: 'Pro Enterprise',
      tagline: 'Built for high-volume grocery marts & multi-counters',
      price: 20, // 20 PKR (Test Limit 1-100)
      yearlyPrice: 80, // 80 PKR (Test Limit 1-100)
      lifetimePrice: 100, // 100 PKR (Test Limit 1-100)
      currency: 'PKR',
      billingCycles: ['monthly', 'yearly', 'lifetime'],
      trialDays: 14,
      isTrialAllowed: true,
      isPopular: true,
      badge: 'Most Popular',
      displayOrder: 2,
      isActive: true,
      limits: { maxUsers: 10, maxBranches: 2, maxWarehouses: 2, maxSKUs: 5000 },
      features: [
        'Unlimited POS terminals & cashier logins',
        'Live wholesale credit khata ledgers',
        'Multi-currency & bank transfer support',
        'Automatic stock low alerts & reorders',
        'Direct WhatsApp invoice dispatch',
      ],
    },
    {
      slug: 'enterprise',
      name: 'Enterprise Multi-Branch',
      tagline: 'Multi-store chains with centralized warehouse control',
      price: 50, // 50 PKR (Test Limit 1-100)
      yearlyPrice: 90, // 90 PKR (Test Limit 1-100)
      lifetimePrice: 100, // 100 PKR (Test Limit 1-100)
      currency: 'PKR',
      billingCycles: ['monthly', 'yearly', 'lifetime'],
      trialDays: 30,
      isTrialAllowed: true,
      badge: 'Multi-Branch',
      displayOrder: 3,
      isActive: true,
      limits: { maxUsers: 50, maxBranches: 10, maxWarehouses: 5, maxSKUs: -1 },
      features: [
        'Multi-branch real-time sync & stock transfers',
        'Centralized warehouse inventory management',
        'Advanced P&L, balance sheets & tax reports',
        'Unlimited POS cashier registers',
        'Custom invoice header branding & QR',
      ],
    },
    {
      slug: 'lifetime',
      name: 'Lifetime License VIP',
      tagline: 'Permanent institutional ownership with zero recurring dues',
      price: 100, // 100 PKR (Max Test Limit)
      yearlyPrice: 100,
      lifetimePrice: 100,
      currency: 'PKR',
      billingCycles: ['lifetime'],
      trialDays: 0,
      isTrialAllowed: false,
      badge: 'Perpetual Test',
      displayOrder: 4,
      isActive: true,
      limits: { maxUsers: 25, maxBranches: 3, maxWarehouses: 3, maxSKUs: -1 },
      features: [
        'Lifetime permanent software access',
        'Zero monthly or annual subscriptions',
        'All present & upcoming POS features',
        'Unlimited inventory SKU catalog',
      ],
    },
  ];

  for (const planData of testPlans) {
    const updated = await SubscriptionPlan.findOneAndUpdate(
      { slug: planData.slug },
      { $set: planData },
      { upsert: true, new: true }
    );
    console.log(`✅ Plan "${updated.name}" updated: Monthly: PKR ${updated.price} | Yearly: PKR ${updated.yearlyPrice} | Lifetime: PKR ${updated.lifetimePrice}`);
  }

  console.log('\n🎉 ALL SUBSCRIPTION PLAN RATES ADJUSTED TO ASSAN PAY 1-100 PKR TEST LIMITS!');
  process.exit(0);
}

adjustTestRates();
