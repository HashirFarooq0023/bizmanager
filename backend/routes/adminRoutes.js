import express from "express";
import {
  getAdminOverview,
  getAllUsers,
  getUserDetails,
  toggleUserStatus,
  deleteUser,
  updateUserSubscription,
  getSubscriptionMetrics,
  adminResetPassword,
} from "../controllers/adminController.js";
import {
  getAllPlansAdmin,
  createPlanAdmin,
  updatePlanAdmin,
  deletePlanAdmin,
} from "../controllers/subscriptionPlanController.js";
import {
  getSubscriptionTransactionsAdmin,
  getAssanPayBalanceAdmin,
} from "../controllers/subscriptionPaymentController.js";
import { protect } from "../middlewares/authMiddleware.js";
import { requireSuperAdmin } from "../middlewares/adminMiddleware.js";

const router = express.Router();

// All admin routes strictly require valid authentication and SuperAdmin role
router.use(protect, requireSuperAdmin);

// Overview & Analytics
router.get("/overview", getAdminOverview);
router.get("/subscriptions/metrics", getSubscriptionMetrics);

// User Management Routes
router.get("/users", getAllUsers);
router.get("/users/:id", getUserDetails);
router.put("/users/:id/status", toggleUserStatus);
router.post("/users/:id/reset-password", adminResetPassword);
router.delete("/users/:id", deleteUser);

// User Subscription Management Routes (Terminate, Extend, Add Trial, Override)
router.put("/users/:id/subscription", updateUserSubscription);

// Subscription Dynamic Plans Management Routes (Rates, Tenures, Trials, Limits)
router.get("/subscription-plans", getAllPlansAdmin);
router.post("/subscription-plans", createPlanAdmin);
router.put("/subscription-plans/:id", updatePlanAdmin);
router.delete("/subscription-plans/:id", deletePlanAdmin);

// Assan Pay Gateway Transactions & Live Balance
router.get("/subscriptions/transactions", getSubscriptionTransactionsAdmin);
router.get("/subscriptions/balance", getAssanPayBalanceAdmin);

export default router;
