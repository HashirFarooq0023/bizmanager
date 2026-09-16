import User from "../models/User.js";

/**
 * Standard MegaTrix SaaS Plan Catalog for BizManager
 */
const BIZMANAGER_PLANS = [
  {
    id: "trial",
    name: "Free Trial",
    price: 0,
    currency: "PKR",
    billingCycle: "14 days",
    badge: "Free Starter",
    description: "Full access to test all BizManager features with no restrictions.",
    features: [
      "14 Days Full Access",
      "Unlimited Sales & Invoices",
      "Full POS & Quick Billing",
      "Customer & Udhaar Khata",
      "Inventory & Stock Management",
      "Reports & Export (PDF/Excel)",
      "Single Device Active Login",
    ],
  },
  {
    id: "starter",
    name: "Starter Business",
    price: 1500,
    currency: "PKR",
    billingCycle: "per month",
    badge: "Popular for Retail",
    description: "Ideal for individual shops, grocery stores, and local retailers.",
    features: [
      "Full POS Billing System",
      "Udhaar / Customer Ledger Management",
      "Inventory & Low Stock Alerts",
      "Thermal Bill Printing & PDF Invoices",
      "Daily Cash & Bank Ledger",
      "WhatsApp & SMS Billing Ready",
      "Standard Email Support",
    ],
  },
  {
    id: "pro",
    name: "Professional Pro",
    price: 3500,
    currency: "PKR",
    billingCycle: "per month",
    badge: "Best Value",
    description: "Complete ERP capabilities for growing supermarkets and wholesale businesses.",
    features: [
      "Everything in Starter",
      "Purchase Orders, GRN & Vendor Bills",
      "Purchase Returns & Debit Notes",
      "Advanced Profit & Loss Financial Reports",
      "Custom Barcode Generator & Batch Scanner",
      "Automated Database Cloud Backup",
      "Priority 24/7 MegaTrix Support",
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise Multi-Branch",
    price: 35000,
    currency: "PKR",
    billingCycle: "per year",
    badge: "Annual Super Saver",
    description: "For established businesses and enterprise retail operations.",
    features: [
      "Everything in Professional Pro",
      "Multi-Branch & Multi-Warehouse Tracking",
      "Custom Domain & White-Label Invoice Branding",
      "Dedicated MegaTrix Account Manager",
      "1 Year Full License Guarantee",
      "Free Data Import & Migration Support",
    ],
  },
];

/**
 * @desc Get current authenticated user's subscription status
 * @route GET /api/subscriptions/me
 * @access Private
 */
export const getMySubscription = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("subscription role accountStatus name email shopName");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const now = new Date();
    const sub = user.subscription || {
      plan: "trial",
      status: "trial",
      expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      isLifetime: false,
    };

    const expiresAt = new Date(sub.expiresAt);
    const msRemaining = expiresAt.getTime() - now.getTime();
    const daysRemaining = sub.isLifetime ? 9999 : Math.max(0, Math.ceil(msRemaining / (1000 * 60 * 60 * 24)));
    const isExpired = !sub.isLifetime && now > expiresAt;

    res.status(200).json({
      success: true,
      subscription: {
        plan: sub.plan,
        status: isExpired ? "expired" : sub.status,
        startDate: sub.startDate,
        expiresAt: sub.expiresAt,
        trialEndsAt: sub.trialEndsAt,
        isLifetime: sub.isLifetime,
        daysRemaining,
        isExpired,
      },
    });
  } catch (error) {
    console.error("Get My Subscription Error:", error);
    res.status(500).json({ success: false, message: "Failed to retrieve subscription", error: error.message });
  }
};

/**
 * @desc Get public subscription plans catalog
 * @route GET /api/subscriptions/plans
 * @access Public
 */
export const getPublicPlans = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      plans: BIZMANAGER_PLANS,
      contact: {
        whatsapp: "+923000000000",
        email: "support@megatrixai.com",
        paymentMethods: ["JazzCash", "EasyPaisa", "Bank Transfer", "Visa / MasterCard"],
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to load subscription plans" });
  }
};

export default { getMySubscription, getPublicPlans, BIZMANAGER_PLANS };
