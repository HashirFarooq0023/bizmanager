import express from "express";
import { getMySubscription, getPublicPlans } from "../controllers/subscriptionController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Public plans catalog
router.get("/plans", getPublicPlans);

// Authenticated user subscription status
router.get("/me", protect, getMySubscription);

export default router;
