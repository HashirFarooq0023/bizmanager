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

// Subscription Management Routes
router.put("/users/:id/subscription", updateUserSubscription);

export default router;
