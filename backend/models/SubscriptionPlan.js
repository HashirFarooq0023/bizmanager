import mongoose from "mongoose";

/**
 * Dynamic Subscription Plan Schema
 * Fully manageable from MegaTrix Core Admin Portal
 */
const subscriptionPlanSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Plan name is required"],
      trim: true,
    },
    slug: {
      type: String,
      required: [true, "Plan slug is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    tagline: {
      type: String,
      default: "",
    },
    description: {
      type: String,
      default: "",
    },
    // Rates & Pricing
    price: {
      type: Number,
      required: [true, "Monthly price is required"],
      min: 0,
      default: 2500, // PKR per month
    },
    yearlyPrice: {
      type: Number,
      required: [true, "Yearly price is required"],
      min: 0,
      default: 25000, // PKR per year (with built-in discount)
    },
    lifetimePrice: {
      type: Number,
      min: 0,
      default: 45000, // Optional one-time fee in PKR
    },
    currency: {
      type: String,
      default: "PKR",
    },
    // Supported billing cycles for checkout
    billingCycles: {
      type: [String],
      enum: ["monthly", "quarterly", "semi_annual", "yearly", "lifetime"],
      default: ["monthly", "yearly"],
    },
    // Trial duration & rules
    trialDays: {
      type: Number,
      default: 14,
      min: 0,
    },
    isTrialAllowed: {
      type: Boolean,
      default: true,
    },
    // Visual & Merchandising
    badge: {
      type: String,
      default: "",
    },
    isPopular: {
      type: Boolean,
      default: false,
    },
    isDefaultTrialPlan: {
      type: Boolean,
      default: false,
    },
    displayOrder: {
      type: Number,
      default: 0,
    },
    // Feature list (bullet points displayed in UI)
    features: {
      type: [String],
      default: [],
    },
    // Concrete Feature Gates & Quantitative Resource Limits
    limits: {
      maxUsers: { type: Number, default: 5 }, // -1 for unlimited
      maxBranches: { type: Number, default: 1 },
      maxWarehouses: { type: Number, default: 1 },
      maxSKUs: { type: Number, default: -1 },
      allowAdvancedReports: { type: Boolean, default: true },
      allowWhatsAppBilling: { type: Boolean, default: true },
      allowBarcodeGenerator: { type: Boolean, default: true },
      allowAuditLogs: { type: Boolean, default: true },
      allowApiAccess: { type: Boolean, default: false },
    },
    // Lifecycle
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    createdBy: {
      type: String,
      default: "system",
    },
    updatedBy: {
      type: String,
      default: "system",
    },
  },
  { timestamps: true }
);

subscriptionPlanSchema.index({ slug: 1, isActive: 1 });
subscriptionPlanSchema.index({ displayOrder: 1 });

const SubscriptionPlan = mongoose.model("SubscriptionPlan", subscriptionPlanSchema);
export default SubscriptionPlan;
