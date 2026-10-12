import crypto from "crypto";
import SubscriptionPayment from "../models/SubscriptionPayment.js";
import SubscriptionPlan from "../models/SubscriptionPlan.js";
import User from "../models/User.js";
import {
  createCheckoutSession,
  verifyCallbackSignature,
  checkPaymentStatus,
  getMerchantBalance,
} from "../utils/assanPay.js";
import { logUserActivity } from "../utils/activityLogger.js";

/**
 * Generate unique Order ID and Invoice Number
 */
const generateOrderId = () => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const rand = crypto.randomBytes(2).toString("hex").toUpperCase();
  return `BM-${timestamp}-${rand}`;
};

const generateInvoiceNumber = () => {
  const year = new Date().getFullYear();
  const rand = Math.floor(100000 + Math.random() * 900000);
  return `INV-BM-${year}-${rand}`;
};

/**
 * @desc Initiate Hosted Assan Pay Checkout for Subscription
 * @route POST /api/subscriptions/checkout
 * @access Private
 */
export const createCheckout = async (req, res) => {
  try {
    const user = req.user;
    const { billingCycle = "monthly", paymentMethodName } = req.body;
    const planIdentifier = req.body.planId || req.body.planSlug || req.body.slug || req.body.plan;

    if (!planIdentifier) {
      return res.status(400).json({ success: false, message: "Plan identifier is required." });
    }

    // 1. Fetch the requested Plan
    const isObjectId = typeof planIdentifier === "string" && Boolean(planIdentifier.match(/^[0-9a-fA-F]{24}$/));
    let plan = await SubscriptionPlan.findOne({
      $or: [
        { slug: planIdentifier },
        ...(isObjectId ? [{ _id: planIdentifier }] : []),
      ],
      isActive: true,
    });

    // Fallback if not found in DB
    if (!plan) {
      return res.status(404).json({ success: false, message: "Selected subscription plan is not active or available." });
    }

    // 2. Determine Amount & Tenure Days based on Billing Cycle
    let amount = plan.price;
    let tenureDays = 30;

    if (billingCycle === "yearly") {
      amount = plan.yearlyPrice || plan.price * 10;
      tenureDays = 365;
    } else if (billingCycle === "lifetime") {
      amount = plan.lifetimePrice || 45000;
      tenureDays = 36500; // 100 years
    } else if (billingCycle === "quarterly") {
      amount = Math.round(plan.price * 3 * 0.95);
      tenureDays = 90;
    }

    if (amount <= 0) {
      return res.status(400).json({ success: false, message: "Invalid payment amount calculated for plan." });
    }

    // 3. Create SubscriptionPayment pending record
    const orderId = generateOrderId();
    const invoiceNumber = generateInvoiceNumber();

    const paymentRecord = await SubscriptionPayment.create({
      user: user._id,
      organizationId: user.organizationId || null,
      orderId,
      planId: plan.slug,
      planName: plan.name,
      billingCycle,
      tenureDays,
      amount,
      currency: plan.currency || "PKR",
      status: "pending",
      paymentMethod: paymentMethodName || "Unknown",
      customerContact: user.phone || "03000000000",
      customerEmail: user.email,
      customerName: user.name || user.shopName || "Merchant",
      invoiceNumber,
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
    });

    // 4. Call Assan Pay Checkout Session API
    const sessionRes = await createCheckoutSession({
      orderId,
      amount,
      paymentMethodName,
      customerContact: user.phone || "03000000000",
      customerEmail: user.email,
      customerName: user.name || user.shopName || "Merchant",
    });

    // 5. Update Payment Record with Session Info
    paymentRecord.assanPaySessionId = sessionRes.sessionId;
    paymentRecord.assanPayCheckoutUrl = sessionRes.checkoutUrl;
    if (sessionRes.paymentId) paymentRecord.paymentId = String(sessionRes.paymentId);
    await paymentRecord.save();

    res.status(200).json({
      success: true,
      message: "Assan Pay checkout session created successfully.",
      orderId,
      sessionId: sessionRes.sessionId,
      checkoutUrl: sessionRes.checkoutUrl,
      paymentId: sessionRes.paymentId,
      amount,
      currency: "PKR",
      planName: plan.name,
      billingCycle,
    });
  } catch (error) {
    console.error("Create Subscription Checkout Error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to initialize payment gateway.",
      details: error.details || null,
    });
  }
};

/**
 * @desc Assan Pay Webhook Receiver (HMAC Signed)
 * @route POST /api/subscriptions/webhook/assanpay
 * @access Public (HMAC Verified)
 */
export const handleAssanPayWebhook = async (req, res) => {
  const rawBody = req.rawBody || JSON.stringify(req.body);

  try {
    const signatureHeader = req.headers["x-assanpay-signature"] || req.headers["X-Assanpay-Signature"];

    // 1. Verify Webhook Signature if signature header is provided
    if (signatureHeader) {
      const verification = verifyCallbackSignature(rawBody, req.headers);
      if (!verification.isValid) {
        console.warn("[AssanPay Webhook] ❌ Invalid signature detected:", {
          received: verification.receivedSignature,
          expected: verification.generatedSignature,
        });
        return res.status(401).json({ success: false, message: "Invalid webhook signature." });
      }
    }

    const payload = req.body || {};
    const {
      orderId,
      paymentId,
      status,
      statusCode,
      amount,
      transactionId,
      reference,
      occurredAt,
      successAt,
      failedAt,
      message,
    } = payload;

    if (!orderId) {
      // Must respond 200 OK so Assan Pay does not retry invalid payload
      return res.status(200).json({ success: false, message: "Missing orderId in payload" });
    }

    // 2. Find matching Payment Record
    const payment = await SubscriptionPayment.findOne({ orderId });
    if (!payment) {
      console.warn(`[AssanPay Webhook] Order ID '${orderId}' not found in database.`);
      return res.status(200).json({ success: true, message: "Order not found but acknowledged." });
    }

    payment.rawWebhookPayload = payload;
    payment.paymentId = paymentId || payment.paymentId;
    payment.transactionId = transactionId || payment.transactionId;
    payment.reference = reference || payment.reference;
    payment.statusCode = String(statusCode || "200");
    payment.statusMessage = message || "Callback processed";

    const isSuccess = status === "SUCCESS" || statusCode === "200" || payload.success === true;

    if (isSuccess && payment.status !== "success") {
      const now = new Date();
      payment.status = "success";
      payment.paidAt = successAt ? new Date(successAt) : now;

      // 3. Calculate New Expiry Date for User
      const user = await User.findById(payment.user);
      if (user) {
        const isLifetime = payment.billingCycle === "lifetime" || payment.planId === "lifetime";
        let newExpiresAt;

        if (isLifetime) {
          newExpiresAt = new Date(now.getTime() + 100 * 365 * 24 * 60 * 60 * 1000);
        } else {
          const currentExpiry = user.subscription?.expiresAt ? new Date(user.subscription.expiresAt) : now;
          const baseDate = currentExpiry > now ? currentExpiry : now;
          const daysToAdd = payment.tenureDays || (payment.billingCycle === "yearly" ? 365 : 30);
          newExpiresAt = new Date(baseDate.getTime() + daysToAdd * 24 * 60 * 60 * 1000);
        }

        payment.expiresAtCalculated = newExpiresAt;

        // 4. Update User Subscription & Unlock Access
        if (!user.subscription) user.subscription = {};
        if (!user.subscription.history) user.subscription.history = [];

        user.subscription.history.push({
          plan: payment.planId,
          status: "active",
          startDate: user.subscription.startDate || now,
          expiresAt: newExpiresAt,
          changedBy: "AssanPay Gateway",
          changedAt: now,
          note: `Auto-activated via Assan Pay (${payment.paymentMethod || "Online"} PKR ${payment.amount}) - Ref: ${reference || orderId}`,
        });

        user.subscription.plan = payment.planId;
        user.subscription.status = "active";
        user.subscription.billingCycle = payment.billingCycle;
        user.subscription.expiresAt = newExpiresAt;
        user.subscription.isLifetime = isLifetime;
        user.subscription.lastRenewedAt = now;
        user.subscription.lastPaymentId = payment._id;
        user.subscription.gracePeriodEndsAt = null;

        // If user account was locked or suspended solely due to expiry, restore active
        if (user.accountStatus === "active" || user.status === "active") {
          user.subscription.status = "active";
        }

        await user.save();

        await logUserActivity(user._id, "SUBSCRIPTION_RENEWED", {
          orderId,
          plan: payment.planId,
          amount: payment.amount,
          expiresAt: newExpiresAt,
        });

        console.log(`✅ [AssanPay Webhook] Activated Subscription for ${user.email}: Plan ${payment.planId}, Expires ${newExpiresAt.toISOString()}`);
      }
    } else if (!isSuccess && payment.status === "pending") {
      payment.status = "failed";
      payment.failedAt = failedAt ? new Date(failedAt) : new Date();
    }

    await payment.save();

    // Return 200 OK per Assan Pay specifications to avoid retries
    return res.status(200).json({
      success: true,
      message: "Assan Pay webhook processed successfully.",
      orderId,
      status: payment.status,
    });
  } catch (error) {
    console.error("[AssanPay Webhook] Processing Error:", error);
    // Return 200 to acknowledge receipt and avoid continuous retries if payload was processed partially
    return res.status(200).json({
      success: false,
      message: "Webhook error handled",
      error: error.message,
    });
  }
};

/**
 * @desc Verify / Check Status Fallback endpoint (called when user redirects back)
 * @route GET /api/subscriptions/verify/:orderId
 * @access Private
 */
export const verifyPaymentStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const payment = await SubscriptionPayment.findOne({
      orderId,
      user: req.user._id,
    });

    if (!payment) {
      return res.status(404).json({ success: false, message: "Payment order not found." });
    }

    // If already marked successful
    if (payment.status === "success") {
      const user = await User.findById(req.user._id).select("subscription");
      return res.status(200).json({
        success: true,
        payment,
        subscription: user?.subscription,
        message: "Payment verified successfully. Subscription is active!",
      });
    }

    // Fallback: Query Assan Pay Status Inquiry directly
    const inquiry = await checkPaymentStatus(orderId);
    if (inquiry.success && inquiry.data) {
      const data = inquiry.data;
      const isSuccess = data.status === "SUCCESS" || data.statusCode === "200" || data.success === true;

      if (isSuccess && payment.status !== "success") {
        const now = new Date();
        payment.status = "success";
        payment.paidAt = data.successAt ? new Date(data.successAt) : now;
        payment.transactionId = data.transactionId || payment.transactionId;
        payment.reference = data.reference || payment.reference;
        payment.paymentId = data.paymentId || payment.paymentId;

        const user = await User.findById(req.user._id);
        if (user) {
          const isLifetime = payment.billingCycle === "lifetime" || payment.planId === "lifetime";
          const currentExpiry = user.subscription?.expiresAt ? new Date(user.subscription.expiresAt) : now;
          const baseDate = currentExpiry > now ? currentExpiry : now;
          const daysToAdd = payment.tenureDays || (payment.billingCycle === "yearly" ? 365 : 30);
          const newExpiresAt = isLifetime
            ? new Date(now.getTime() + 100 * 365 * 24 * 60 * 60 * 1000)
            : new Date(baseDate.getTime() + daysToAdd * 24 * 60 * 60 * 1000);

          payment.expiresAtCalculated = newExpiresAt;

          if (!user.subscription) user.subscription = {};
          if (!user.subscription.history) user.subscription.history = [];

          user.subscription.history.push({
            plan: payment.planId,
            status: "active",
            startDate: user.subscription.startDate || now,
            expiresAt: newExpiresAt,
            changedBy: "AssanPay Inquire",
            changedAt: now,
            note: `Verified on redirect via Assan Pay (${payment.amount} PKR)`,
          });

          user.subscription.plan = payment.planId;
          user.subscription.status = "active";
          user.subscription.billingCycle = payment.billingCycle;
          user.subscription.expiresAt = newExpiresAt;
          user.subscription.isLifetime = isLifetime;
          user.subscription.lastRenewedAt = now;
          user.subscription.lastPaymentId = payment._id;

          await user.save();
        }

        await payment.save();

        return res.status(200).json({
          success: true,
          payment,
          subscription: (await User.findById(req.user._id).select("subscription"))?.subscription,
          message: "Payment verified directly via Assan Pay gateway. Subscription activated!",
        });
      }
    }

    res.status(200).json({
      success: false,
      payment,
      message: payment.status === "failed" ? "Payment was unsuccessful." : "Payment is currently pending confirmation.",
    });
  } catch (error) {
    console.error("Verify Payment Error:", error);
    res.status(500).json({ success: false, message: "Failed to verify payment status", error: error.message });
  }
};

/**
 * @desc Get Authenticated User's Billing History & Receipts
 * @route GET /api/subscriptions/history
 * @access Private
 */
export const getMyPaymentHistory = async (req, res) => {
  try {
    const payments = await SubscriptionPayment.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    res.status(200).json({
      success: true,
      payments,
    });
  } catch (error) {
    console.error("Get Payment History Error:", error);
    res.status(500).json({ success: false, message: "Failed to load payment history" });
  }
};

/**
 * @desc Get All Subscription Transactions for SuperAdmin Audit
 * @route GET /api/admin/subscriptions/transactions
 * @access SuperAdmin
 */
export const getSubscriptionTransactionsAdmin = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.max(1, Math.min(100, parseInt(req.query.limit) || 20));
    const skip = (page - 1) * limit;

    const { status, search } = req.query;
    const filter = {};

    if (status && status !== "all") {
      filter.status = status;
    }

    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), "i");
      filter.$or = [
        { orderId: searchRegex },
        { paymentId: searchRegex },
        { customerEmail: searchRegex },
        { customerName: searchRegex },
        { invoiceNumber: searchRegex },
      ];
    }

    const [transactions, total] = await Promise.all([
      SubscriptionPayment.find(filter)
        .populate("user", "name email phone shopName")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      SubscriptionPayment.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      transactions,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Admin Get Transactions Error:", error);
    res.status(500).json({ success: false, message: "Failed to load subscription transactions", error: error.message });
  }
};

/**
 * @desc Get Assan Pay Merchant Balance for Core Admin Treasury
 * @route GET /api/admin/subscriptions/balance
 * @access SuperAdmin
 */
export const getAssanPayBalanceAdmin = async (req, res) => {
  try {
    const balanceRes = await getMerchantBalance();
    if (!balanceRes.success) {
      return res.status(200).json({
        success: false,
        live: false,
        message: balanceRes.message || "Failed to query Assan Pay balance",
        error: balanceRes.error,
      });
    }

    res.status(200).json({
      success: true,
      live: true,
      data: balanceRes.balance,
    });
  } catch (error) {
    console.error("Admin Get Assan Pay Balance Error:", error);
    res.status(500).json({ success: false, message: "Failed to load gateway balance", error: error.message });
  }
};

export default {
  createCheckout,
  handleAssanPayWebhook,
  verifyPaymentStatus,
  getMyPaymentHistory,
  getSubscriptionTransactionsAdmin,
  getAssanPayBalanceAdmin,
};
