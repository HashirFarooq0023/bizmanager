import mongoose from "mongoose";

/**
 * Subscription Payment & Assan Pay Transaction Ledger Schema
 */
const subscriptionPaymentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      default: null,
      index: true,
    },
    // Order Identifiers
    orderId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    paymentId: {
      type: String,
      default: null,
      index: true,
    },
    reference: {
      type: String,
      default: null,
    },
    transactionId: {
      type: String,
      default: null,
    },
    // Plan Details at time of purchase
    planId: {
      type: String,
      required: true,
      index: true,
    },
    planName: {
      type: String,
      required: true,
    },
    billingCycle: {
      type: String,
      enum: ["monthly", "quarterly", "semi_annual", "yearly", "lifetime", "custom", "trial"],
      default: "monthly",
    },
    tenureDays: {
      type: Number,
      default: 30,
    },
    // Financial Amounts
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      default: "PKR",
    },
    // Payment Status Lifecycle
    status: {
      type: String,
      enum: ["pending", "success", "failed", "cancelled", "expired"],
      default: "pending",
      index: true,
    },
    statusCode: {
      type: String,
      default: "202",
    },
    statusMessage: {
      type: String,
      default: "Pending checkout completion",
    },
    // Gateway Details
    paymentMethod: {
      type: String,
      enum: ["JazzCash", "Easypaisa", "Zindigi", "Card", "QR", "BankTransfer", "AdminGrant", "Unknown"],
      default: "Unknown",
    },
    branchCode: {
      type: String,
      default: "10067",
    },
    assanPaySessionId: {
      type: String,
      default: null,
    },
    assanPayCheckoutUrl: {
      type: String,
      default: null,
    },
    // Payer Contact Info
    customerContact: {
      type: String,
      default: "",
    },
    customerEmail: {
      type: String,
      default: "",
    },
    customerName: {
      type: String,
      default: "",
    },
    // Security & Audit
    rawWebhookPayload: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    ipAddress: {
      type: String,
      default: null,
    },
    userAgent: {
      type: String,
      default: null,
    },
    // Dates & Validity
    paidAt: {
      type: Date,
      default: null,
    },
    failedAt: {
      type: Date,
      default: null,
    },
    expiresAtCalculated: {
      type: Date,
      default: null,
    },
    invoiceNumber: {
      type: String,
      unique: true,
      sparse: true,
    },
  },
  { timestamps: true }
);

subscriptionPaymentSchema.index({ createdAt: -1 });
subscriptionPaymentSchema.index({ user: 1, status: 1 });

const SubscriptionPayment = mongoose.model("SubscriptionPayment", subscriptionPaymentSchema);
export default SubscriptionPayment;
