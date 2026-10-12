import SubscriptionPlan from "../models/SubscriptionPlan.js";

/**
 * Default standard initial plans for BizManager
 */
const DEFAULT_INITIAL_PLANS = [
  {
    name: "Starter POS",
    slug: "starter",
    tagline: "Ideal for neighborhood retail shops, grocery stores & single registers",
    description: "Full point-of-sale, barcode scanning, thermal bill printing, and daily cash ledgers.",
    price: 2500, // PKR per month
    yearlyPrice: 24000, // PKR per year (Rs 2,000/mo - 20% discount)
    lifetimePrice: 35000,
    currency: "PKR",
    billingCycles: ["monthly", "yearly"],
    trialDays: 14,
    isTrialAllowed: true,
    badge: "Popular for Retail",
    isPopular: false,
    isDefaultTrialPlan: true,
    displayOrder: 1,
    features: [
      "14 Days Full Free Trial",
      "Full POS & Rapid Barcode Billing",
      "Thermal Bill Printing (58mm/80mm)",
      "Customer & Udhaar Khata Ledgers",
      "Inventory & Low Stock Alerts",
      "Daily Cash & Bank Register",
      "Standard Email & WhatsApp Support",
    ],
    limits: {
      maxUsers: 3,
      maxBranches: 1,
      maxWarehouses: 1,
      maxSKUs: -1,
      allowAdvancedReports: true,
      allowWhatsAppBilling: true,
      allowBarcodeGenerator: true,
      allowAuditLogs: false,
      allowApiAccess: false,
    },
    isActive: true,
  },
  {
    name: "Pro Enterprise",
    slug: "pro",
    tagline: "Built for high-volume grocery marts, supermarkets & wholesale distributors",
    description: "Complete ERP capabilities, vendor procurement, GRN, profit & loss reports, and multi-user permissions.",
    price: 5500, // PKR per month
    yearlyPrice: 52000, // PKR per year (Rs 4,333/mo - 21% discount)
    lifetimePrice: 55000,
    currency: "PKR",
    billingCycles: ["monthly", "yearly"],
    trialDays: 14,
    isTrialAllowed: true,
    badge: "Best Value",
    isPopular: true,
    isDefaultTrialPlan: false,
    displayOrder: 2,
    features: [
      "Everything in Starter POS",
      "Purchase Orders, GRN & Vendor Bills",
      "Purchase Returns & Debit Notes",
      "Advanced Profit & Loss Financial Reports",
      "Custom Barcode Generator & Batch Scanner",
      "Automated Cloud Database Backup",
      "Maker-Checker Multi-Tier Approvals",
      "Priority 24/7 MegaTrix Support",
    ],
    limits: {
      maxUsers: 15,
      maxBranches: 3,
      maxWarehouses: 3,
      maxSKUs: -1,
      allowAdvancedReports: true,
      allowWhatsAppBilling: true,
      allowBarcodeGenerator: true,
      allowAuditLogs: true,
      allowApiAccess: true,
    },
    isActive: true,
  },
  {
    name: "Enterprise Multi-Branch",
    slug: "enterprise",
    tagline: "For established retail supermarket chains and wholesale institutions",
    description: "Multi-branch synchronization, warehouse network, custom white-label branding, and dedicated account management.",
    price: 12000, // PKR per month
    yearlyPrice: 110000, // PKR per year
    lifetimePrice: 150000,
    currency: "PKR",
    billingCycles: ["monthly", "yearly", "lifetime"],
    trialDays: 30,
    isTrialAllowed: true,
    badge: "Enterprise Suite",
    isPopular: false,
    isDefaultTrialPlan: false,
    displayOrder: 3,
    features: [
      "Everything in Pro Enterprise",
      "Multi-Branch & Multi-Warehouse Sync",
      "Custom Domain & White-Label Invoices",
      "Dedicated MegaTrix Account Manager",
      "Enterprise SLA & Custom Integrations",
      "Free Data Migration & On-Premises Training",
    ],
    limits: {
      maxUsers: -1,
      maxBranches: -1,
      maxWarehouses: -1,
      maxSKUs: -1,
      allowAdvancedReports: true,
      allowWhatsAppBilling: true,
      allowBarcodeGenerator: true,
      allowAuditLogs: true,
      allowApiAccess: true,
    },
    isActive: true,
  },
  {
    name: "Lifetime VIP License",
    slug: "lifetime",
    tagline: "Permanent software license with zero recurring dues",
    description: "One-time permanent ownership of BizManager ERP with lifetime cloud updates and premium support.",
    price: 45000,
    yearlyPrice: 45000,
    lifetimePrice: 45000,
    currency: "PKR",
    billingCycles: ["lifetime"],
    trialDays: 0,
    isTrialAllowed: false,
    badge: "One-Time Ownership",
    isPopular: false,
    isDefaultTrialPlan: false,
    displayOrder: 4,
    features: [
      "Lifetime Permanent Software Access",
      "Zero Monthly or Annual Subscription Dues",
      "All Present & Upcoming ERP Updates",
      "Unlimited Inventory SKUs & Multi-Registers",
      "Priority 24/7 Dedicated Support Desk",
      "Custom Invoice Header & Watermark Branding",
    ],
    limits: {
      maxUsers: 20,
      maxBranches: 5,
      maxWarehouses: 5,
      maxSKUs: -1,
      allowAdvancedReports: true,
      allowWhatsAppBilling: true,
      allowBarcodeGenerator: true,
      allowAuditLogs: true,
      allowApiAccess: true,
    },
    isActive: true,
  },
];

/**
 * Seed Initial Default Plans in Database if empty
 */
export const seedInitialPlans = async () => {
  try {
    const count = await SubscriptionPlan.countDocuments();
    if (count === 0) {
      await SubscriptionPlan.insertMany(DEFAULT_INITIAL_PLANS);
      console.log("✅ Seeded default subscription plans into BizManager database.");
    }
  } catch (error) {
    console.error("Failed to seed default subscription plans:", error.message);
  }
};

/**
 * @desc Get all public active subscription plans
 * @route GET /api/subscriptions/plans
 * @access Public
 */
export const getPublicPlans = async (req, res) => {
  try {
    // Ensure plans exist
    await seedInitialPlans();

    const plans = await SubscriptionPlan.find({ isActive: true })
      .sort({ displayOrder: 1, createdAt: 1 })
      .lean();

    const formattedPlans = plans.map((p) => {
      const monthlyPrice = p.price || 0;
      const yearlyPrice = p.yearlyPrice || monthlyPrice * 12;
      const yearlyMonthlyEquivalent = Math.round(yearlyPrice / 12);
      const savingsPercent = monthlyPrice > 0
        ? Math.max(0, Math.round(((monthlyPrice * 12 - yearlyPrice) / (monthlyPrice * 12)) * 100))
        : 0;

      return {
        id: p.slug || p._id,
        _id: p._id,
        name: p.name,
        slug: p.slug,
        tagline: p.tagline,
        description: p.description,
        price: monthlyPrice,
        yearlyPrice,
        yearlyMonthlyEquivalent,
        savingsPercent,
        lifetimePrice: p.lifetimePrice || 0,
        currency: p.currency || "PKR",
        billingCycles: p.billingCycles || ["monthly", "yearly"],
        trialDays: p.trialDays || 14,
        isTrialAllowed: Boolean(p.isTrialAllowed),
        badge: p.badge || (p.isPopular ? "Most Popular" : ""),
        isPopular: Boolean(p.isPopular),
        features: p.features || [],
        limits: p.limits || {},
      };
    });

    res.status(200).json({
      success: true,
      plans: formattedPlans,
      contact: {
        whatsapp: "+923000000000",
        email: "support@megatrixai.com",
        paymentMethods: ["JazzCash", "Easypaisa", "Zindigi", "Debit / Credit Cards", "QR"],
      },
    });
  } catch (error) {
    console.error("Get Public Plans Error:", error);
    res.status(500).json({ success: false, message: "Failed to load subscription plans", error: error.message });
  }
};

/**
 * @desc Get all subscription plans for SuperAdmin (including inactive)
 * @route GET /api/admin/subscription-plans
 * @access SuperAdmin
 */
export const getAllPlansAdmin = async (req, res) => {
  try {
    await seedInitialPlans();

    const plans = await SubscriptionPlan.find().sort({ displayOrder: 1, createdAt: 1 }).lean();

    res.status(200).json({
      success: true,
      plans,
    });
  } catch (error) {
    console.error("Admin Get Plans Error:", error);
    res.status(500).json({ success: false, message: "Failed to load plans", error: error.message });
  }
};

/**
 * @desc Create new subscription plan
 * @route POST /api/admin/subscription-plans
 * @access SuperAdmin
 */
export const createPlanAdmin = async (req, res) => {
  try {
    const {
      name,
      slug,
      tagline,
      description,
      price,
      yearlyPrice,
      lifetimePrice,
      currency = "PKR",
      billingCycles = ["monthly", "yearly"],
      trialDays = 14,
      isTrialAllowed = true,
      badge = "",
      isPopular = false,
      isDefaultTrialPlan = false,
      displayOrder = 0,
      features = [],
      limits = {},
      isActive = true,
    } = req.body;

    if (!name || !price) {
      return res.status(400).json({ success: false, message: "Plan name and monthly price are required." });
    }

    const planSlug = (slug || name.toLowerCase().replace(/[^a-z0-9]+/g, "-")).trim();

    const existing = await SubscriptionPlan.findOne({ slug: planSlug });
    if (existing) {
      return res.status(400).json({ success: false, message: `Plan with slug '${planSlug}' already exists.` });
    }

    const newPlan = await SubscriptionPlan.create({
      name,
      slug: planSlug,
      tagline: tagline || "",
      description: description || "",
      price: Number(price),
      yearlyPrice: Number(yearlyPrice || price * 10), // default 2 months free
      lifetimePrice: lifetimePrice ? Number(lifetimePrice) : 0,
      currency,
      billingCycles,
      trialDays: Number(trialDays) || 0,
      isTrialAllowed: Boolean(isTrialAllowed),
      badge: badge || "",
      isPopular: Boolean(isPopular),
      isDefaultTrialPlan: Boolean(isDefaultTrialPlan),
      displayOrder: Number(displayOrder) || 0,
      features: Array.isArray(features) ? features : (typeof features === "string" ? features.split("\n").map(f => f.trim()).filter(Boolean) : []),
      limits: {
        maxUsers: limits.maxUsers !== undefined ? Number(limits.maxUsers) : 5,
        maxBranches: limits.maxBranches !== undefined ? Number(limits.maxBranches) : 1,
        maxWarehouses: limits.maxWarehouses !== undefined ? Number(limits.maxWarehouses) : 1,
        maxSKUs: limits.maxSKUs !== undefined ? Number(limits.maxSKUs) : -1,
        allowAdvancedReports: limits.allowAdvancedReports !== undefined ? Boolean(limits.allowAdvancedReports) : true,
        allowWhatsAppBilling: limits.allowWhatsAppBilling !== undefined ? Boolean(limits.allowWhatsAppBilling) : true,
        allowBarcodeGenerator: limits.allowBarcodeGenerator !== undefined ? Boolean(limits.allowBarcodeGenerator) : true,
        allowAuditLogs: limits.allowAuditLogs !== undefined ? Boolean(limits.allowAuditLogs) : true,
        allowApiAccess: limits.allowApiAccess !== undefined ? Boolean(limits.allowApiAccess) : false,
      },
      isActive: Boolean(isActive),
      createdBy: req.user?.email || "SuperAdmin",
      updatedBy: req.user?.email || "SuperAdmin",
    });

    res.status(201).json({
      success: true,
      message: `Subscription plan '${newPlan.name}' created successfully.`,
      plan: newPlan,
    });
  } catch (error) {
    console.error("Admin Create Plan Error:", error);
    res.status(500).json({ success: false, message: "Failed to create plan", error: error.message });
  }
};

/**
 * @desc Update existing subscription plan (rates, tenures, trials, features)
 * @route PUT /api/admin/subscription-plans/:id
 * @access SuperAdmin
 */
export const updatePlanAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    const plan = await SubscriptionPlan.findById(id);
    if (!plan) {
      return res.status(404).json({ success: false, message: "Subscription plan not found." });
    }

    if (updateData.features && typeof updateData.features === "string") {
      updateData.features = updateData.features.split("\n").map(f => f.trim()).filter(Boolean);
    }

    if (updateData.price !== undefined) updateData.price = Number(updateData.price);
    if (updateData.yearlyPrice !== undefined) updateData.yearlyPrice = Number(updateData.yearlyPrice);
    if (updateData.lifetimePrice !== undefined) updateData.lifetimePrice = Number(updateData.lifetimePrice);
    if (updateData.trialDays !== undefined) updateData.trialDays = Number(updateData.trialDays);
    if (updateData.displayOrder !== undefined) updateData.displayOrder = Number(updateData.displayOrder);

    updateData.updatedBy = req.user?.email || "SuperAdmin";

    const updatedPlan = await SubscriptionPlan.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });

    res.status(200).json({
      success: true,
      message: `Plan '${updatedPlan.name}' updated successfully.`,
      plan: updatedPlan,
    });
  } catch (error) {
    console.error("Admin Update Plan Error:", error);
    res.status(500).json({ success: false, message: "Failed to update plan", error: error.message });
  }
};

/**
 * @desc Delete / Archive a subscription plan
 * @route DELETE /api/admin/subscription-plans/:id
 * @access SuperAdmin
 */
export const deletePlanAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const plan = await SubscriptionPlan.findById(id);
    if (!plan) {
      return res.status(404).json({ success: false, message: "Plan not found." });
    }

    await SubscriptionPlan.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: `Plan '${plan.name}' removed successfully.`,
    });
  } catch (error) {
    console.error("Admin Delete Plan Error:", error);
    res.status(500).json({ success: false, message: "Failed to delete plan", error: error.message });
  }
};

export default {
  seedInitialPlans,
  getPublicPlans,
  getAllPlansAdmin,
  createPlanAdmin,
  updatePlanAdmin,
  deletePlanAdmin,
};
