import crypto from "crypto";
import User from "../models/User.js";
import RefreshToken from "../models/RefreshToken.js";
import { logUserActivity } from "../utils/activityLogger.js";

/**
 * @desc Get high-level Multi-SaaS / BizManager admin overview metrics
 * @route GET /api/admin/overview
 * @access SuperAdmin
 */
export const getAdminOverview = async (req, res) => {
  try {
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const inSevenDays = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const [
      totalUsers,
      activeToday,
      active7Days,
      suspendedUsers,
      activePaidSubs,
      activeTrials,
      expiringSoon,
      expiredSubs,
      lifetimeUsers,
      recentUsers,
    ] = await Promise.all([
      // Total users
      User.countDocuments({ role: { $ne: "superadmin" } }),
      // Active in last 24h
      User.countDocuments({
        role: { $ne: "superadmin" },
        $or: [{ lastSeenAt: { $gte: oneDayAgo } }, { lastLoginAt: { $gte: oneDayAgo } }],
      }),
      // Active in last 7 days
      User.countDocuments({
        role: { $ne: "superadmin" },
        $or: [{ lastSeenAt: { $gte: sevenDaysAgo } }, { lastLoginAt: { $gte: sevenDaysAgo } }],
      }),
      // Suspended / Blocked
      User.countDocuments({
        role: { $ne: "superadmin" },
        $or: [{ accountStatus: "suspended" }, { status: "suspended" }],
      }),
      // Active Paid Subscriptions
      User.countDocuments({
        role: { $ne: "superadmin" },
        "subscription.plan": { $in: ["starter", "pro", "enterprise"] },
        "subscription.expiresAt": { $gte: now },
        "subscription.isLifetime": { $ne: true },
        accountStatus: { $ne: "suspended" },
      }),
      // Active Trials
      User.countDocuments({
        role: { $ne: "superadmin" },
        "subscription.plan": "trial",
        "subscription.expiresAt": { $gte: now },
        "subscription.isLifetime": { $ne: true },
        accountStatus: { $ne: "suspended" },
      }),
      // Expiring in next 7 days
      User.countDocuments({
        role: { $ne: "superadmin" },
        "subscription.expiresAt": { $gte: now, $lte: inSevenDays },
        "subscription.isLifetime": { $ne: true },
        accountStatus: { $ne: "suspended" },
      }),
      // Expired Subscriptions
      User.countDocuments({
        role: { $ne: "superadmin" },
        "subscription.isLifetime": { $ne: true },
        $or: [
          { "subscription.status": "expired" },
          { "subscription.expiresAt": { $lt: now } },
        ],
      }),
      // Lifetime licenses
      User.countDocuments({
        role: { $ne: "superadmin" },
        "subscription.isLifetime": true,
      }),
      // Recent Registrations (last 8)
      User.find({ role: { $ne: "superadmin" } })
        .select("name email phone shopName createdAt lastSeenAt accountStatus subscription role")
        .sort({ createdAt: -1 })
        .limit(8)
        .lean(),
    ]);

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        activeToday,
        active7Days,
        suspendedUsers,
        activePaidSubs,
        activeTrials,
        expiringSoon,
        expiredSubs,
        lifetimeUsers,
      },
      recentUsers,
    });
  } catch (error) {
    console.error("Admin Overview Error:", error);
    res.status(500).json({ success: false, message: "Failed to load admin overview", error: error.message });
  }
};

/**
 * @desc Get all users with search, filters, and pagination
 * @route GET /api/admin/users
 * @access SuperAdmin
 */
export const getAllUsers = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.max(1, Math.min(100, parseInt(req.query.limit) || 20));
    const skip = (page - 1) * limit;

    const { search, accountStatus, subscriptionStatus, plan, sort = "-createdAt" } = req.query;

    const filter = { role: { $ne: "superadmin" } };

    // Search query across name, email, phone, shopName
    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), "i");
      filter.$or = [
        { name: searchRegex },
        { email: searchRegex },
        { phone: searchRegex },
        { shopName: searchRegex },
      ];
    }

    // Account status filter
    if (accountStatus && accountStatus !== "all") {
      filter.accountStatus = accountStatus;
    }

    // Plan filter
    if (plan && plan !== "all") {
      if (plan === "lifetime") {
        filter["subscription.isLifetime"] = true;
      } else {
        filter["subscription.plan"] = plan;
      }
    }

    // Subscription status filter
    const now = new Date();
    if (subscriptionStatus && subscriptionStatus !== "all") {
      if (subscriptionStatus === "active") {
        filter.$or = [
          { "subscription.isLifetime": true },
          { "subscription.expiresAt": { $gte: now }, "subscription.plan": { $ne: "trial" } },
        ];
      } else if (subscriptionStatus === "trial") {
        filter["subscription.plan"] = "trial";
        filter["subscription.expiresAt"] = { $gte: now };
        filter["subscription.isLifetime"] = { $ne: true };
      } else if (subscriptionStatus === "expired") {
        filter["subscription.isLifetime"] = { $ne: true };
        filter.$or = [
          { "subscription.status": "expired" },
          { "subscription.expiresAt": { $lt: now } },
        ];
      } else if (subscriptionStatus === "expiring_soon") {
        const inSevenDays = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        filter["subscription.isLifetime"] = { $ne: true };
        filter["subscription.expiresAt"] = { $gte: now, $lte: inSevenDays };
      }
    }

    const [users, total] = await Promise.all([
      User.find(filter)
        .select("-password -resetPasswordToken -resetPasswordExpires")
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      User.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      users,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Admin Get Users Error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch users", error: error.message });
  }
};

/**
 * @desc Get detailed user profile by ID including login & subscription history
 * @route GET /api/admin/users/:id
 * @access SuperAdmin
 */
export const getUserDetails = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select("-password -resetPasswordToken -resetPasswordExpires")
      .lean();

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.status(200).json({ success: true, user });
  } catch (error) {
    console.error("Admin Get User Details Error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch user details", error: error.message });
  }
};

/**
 * @desc Block or Unblock a user (Instant kill-switch)
 * @route PUT /api/admin/users/:id/status
 * @access SuperAdmin
 */
export const toggleUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, reason } = req.body;

    if (!["active", "suspended"].includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status. Must be 'active' or 'suspended'." });
    }

    // Protect against self-blocking
    if (req.user._id.toString() === id) {
      return res.status(400).json({ success: false, message: "You cannot suspend your own SuperAdmin account." });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (user.role === "superadmin") {
      return res.status(403).json({ success: false, message: "Cannot modify another SuperAdmin." });
    }

    if (status === "suspended") {
      // 1. Set status to suspended
      user.accountStatus = "suspended";
      user.status = "suspended";
      user.accountSuspendedReason = reason || "Suspended by SuperAdmin";

      // 2. Terminate active sessions immediately (Anti-Access Kill-Switch)
      user.activeDeviceId = null;
      user.activeDeviceIds = [];
      user.activeSessionCount = 0;
      user.activeSessionCreatedAt = null;

      // 3. Revoke all active refresh tokens in database
      await RefreshToken.updateMany(
        { user: user._id, isRevoked: false },
        { isRevoked: true, revokedAt: new Date() }
      );

      // 4. Log admin audit event
      await logUserActivity(user._id, "ACCOUNT_SUSPENDED", {
        adminEmail: req.user.email,
        reason: reason || "Suspended by SuperAdmin",
      });
    } else {
      // Unblock user
      user.accountStatus = "active";
      user.status = "active";
      user.accountSuspendedReason = null;
      user.failedLoginAttempts = 0;
      user.accountLockedUntil = null;

      await logUserActivity(user._id, "ACCOUNT_REACTIVATED", {
        adminEmail: req.user.email,
      });
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: `User successfully ${status === "suspended" ? "suspended and sessions revoked" : "reactivated"}.`,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        accountStatus: user.accountStatus,
        accountSuspendedReason: user.accountSuspendedReason,
      },
    });
  } catch (error) {
    console.error("Admin Toggle Status Error:", error);
    res.status(500).json({ success: false, message: "Failed to update user status", error: error.message });
  }
};

/**
 * @desc Delete a user permanently
 * @route DELETE /api/admin/users/:id
 * @access SuperAdmin
 */
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (req.user._id.toString() === id) {
      return res.status(400).json({ success: false, message: "You cannot delete your own SuperAdmin account." });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (user.role === "superadmin") {
      return res.status(403).json({ success: false, message: "Cannot delete a SuperAdmin." });
    }

    // Clean up refresh tokens
    await RefreshToken.deleteMany({ user: id });

    // Delete user document
    await User.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: `User ${user.name} (${user.email}) permanently removed.`,
    });
  } catch (error) {
    console.error("Admin Delete User Error:", error);
    res.status(500).json({ success: false, message: "Failed to delete user", error: error.message });
  }
};

/**
 * @desc Grant / Extend / Override user subscription
 * @route PUT /api/admin/users/:id/subscription
 * @access SuperAdmin
 */
export const updateUserSubscription = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      plan,
      status = "active",
      durationDays,
      customExpiresAt,
      isLifetime = false,
      note = "",
    } = req.body;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const now = new Date();
    let newExpiresAt;

    if (isLifetime) {
      newExpiresAt = new Date(now.getTime() + 100 * 365 * 24 * 60 * 60 * 1000); // 100 years
    } else if (customExpiresAt) {
      newExpiresAt = new Date(customExpiresAt);
    } else if (durationDays) {
      const days = parseInt(durationDays);
      const currentExpiry = user.subscription?.expiresAt ? new Date(user.subscription.expiresAt) : now;
      const baseDate = currentExpiry > now ? currentExpiry : now;
      newExpiresAt = new Date(baseDate.getTime() + days * 24 * 60 * 60 * 1000);
    } else {
      // Default 30 days
      newExpiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    }

    const targetPlan = isLifetime ? "lifetime" : (plan || user.subscription?.plan || "pro");
    const targetStatus = status || (newExpiresAt > now ? "active" : "expired");

    // Initialize subscription history array if missing
    if (!user.subscription) {
      user.subscription = {};
    }
    if (!user.subscription.history) {
      user.subscription.history = [];
    }

    // Append to history log
    user.subscription.history.push({
      plan: targetPlan,
      status: targetStatus,
      startDate: user.subscription.startDate || now,
      expiresAt: newExpiresAt,
      changedBy: req.user.email,
      changedAt: now,
      note: note || `Updated by SuperAdmin (${req.user.name || req.user.email})`,
    });

    // Update subscription object
    user.subscription.plan = targetPlan;
    user.subscription.status = targetStatus;
    user.subscription.expiresAt = newExpiresAt;
    user.subscription.isLifetime = Boolean(isLifetime);
    user.subscription.lastRenewedAt = now;
    user.subscription.assignedBy = req.user.email;
    user.subscription.notes = note || user.subscription.notes;

    // If previously suspended due to expiry, ensure accountStatus is active
    if (user.accountStatus === "active" && user.status === "active") {
      user.subscription.status = targetStatus;
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: `Subscription successfully updated to ${targetPlan.toUpperCase()} (Expires: ${isLifetime ? "Lifetime" : newExpiresAt.toLocaleDateString()}).`,
      subscription: user.subscription,
    });
  } catch (error) {
    console.error("Admin Update Subscription Error:", error);
    res.status(500).json({ success: false, message: "Failed to update subscription", error: error.message });
  }
};

/**
 * @desc Get detailed subscription analytics & plan distribution
 * @route GET /api/admin/subscriptions/metrics
 * @access SuperAdmin
 */
export const getSubscriptionMetrics = async (req, res) => {
  try {
    const now = new Date();
    const inSevenDays = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const [
      planDistribution,
      statusDistribution,
      expiringIn7Days,
      recentRenewals,
    ] = await Promise.all([
      // Aggregation by plan
      User.aggregate([
        { $match: { role: { $ne: "superadmin" } } },
        { $group: { _id: "$subscription.plan", count: { $sum: 1 } } },
      ]),
      // Aggregation by status
      User.aggregate([
        { $match: { role: { $ne: "superadmin" } } },
        { $group: { _id: "$subscription.status", count: { $sum: 1 } } },
      ]),
      // Expiring users list
      User.find({
        role: { $ne: "superadmin" },
        "subscription.isLifetime": { $ne: true },
        "subscription.expiresAt": { $gte: now, $lte: inSevenDays },
      })
        .select("name email phone shopName subscription")
        .sort({ "subscription.expiresAt": 1 })
        .limit(20)
        .lean(),
      // Recent subscription overrides / renewals from history
      User.find({ "subscription.history.0": { $exists: true } })
        .select("name email shopName subscription.history")
        .sort({ "subscription.lastRenewedAt": -1 })
        .limit(10)
        .lean(),
    ]);

    res.status(200).json({
      success: true,
      metrics: {
        planDistribution,
        statusDistribution,
        expiringIn7Days,
        recentRenewals,
      },
    });
  } catch (error) {
    console.error("Admin Subscription Metrics Error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch subscription metrics", error: error.message });
  }
};

/**
 * @desc Administrator password reset with forced credential change
 * @route POST /api/admin/users/:id/reset-password
 * @access SuperAdmin
 */
export const adminResetPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body || {};

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (user.role === "superadmin") {
      return res.status(403).json({ success: false, message: "Cannot reset SuperAdmin password directly." });
    }

    const rawEntropy = crypto.randomBytes(4).toString("hex");
    const temporaryPassword = `Temp#${rawEntropy}!9`;

    user.password = temporaryPassword;
    user.passwordChangeRequired = true;
    user.failedLoginAttempts = 0;
    user.accountLockedUntil = null;

    // Revoke active sessions
    await RefreshToken.updateMany(
      { user: user._id, isRevoked: false },
      { isRevoked: true, revokedAt: new Date() }
    );

    await user.save();

    await logUserActivity(user._id, "ADMIN_PASSWORD_RESET", {
      adminEmail: req.user?.email || "admin@megatrixai.com",
      reason: reason || "Administrative password reset from MegaTrix Admin Core",
    });

    return res.status(200).json({
      success: true,
      message: `Password reset successfully for ${user.name}. Forced password update required on next login.`,
      temporaryPassword,
      passwordChangeRequired: true,
    });
  } catch (error) {
    console.error("Admin Reset Password Error:", error);
    return res.status(500).json({ success: false, message: "Failed to reset password", error: error.message });
  }
};

export default {
  getAdminOverview,
  getAllUsers,
  getUserDetails,
  toggleUserStatus,
  deleteUser,
  updateUserSubscription,
  getSubscriptionMetrics,
  adminResetPassword,
};
