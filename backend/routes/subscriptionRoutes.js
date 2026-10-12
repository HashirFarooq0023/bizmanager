import express from "express";
import { getMySubscription } from "../controllers/subscriptionController.js";
import { getPublicPlans } from "../controllers/subscriptionPlanController.js";
import {
  createCheckout,
  handleAssanPayWebhook,
  verifyPaymentStatus,
  getMyPaymentHistory,
} from "../controllers/subscriptionPaymentController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

// 1. Public Dynamic Plans Catalog (Rates, Tenures, Trials & Features)
router.get("/plans", getPublicPlans);

// 2. Assan Pay Inbound Webhook (Public, HMAC-SHA256 Signature Verified)
router.post("/webhook/assanpay", handleAssanPayWebhook);

// 3. Authenticated User Subscription State & Billing Operations
router.get("/me", protect, getMySubscription);
router.post("/checkout", protect, createCheckout);
router.get("/verify/:orderId", protect, verifyPaymentStatus);
router.get("/history", protect, getMyPaymentHistory);

export default router;
