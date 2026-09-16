import User from "../models/User.js";

/**
 * Subscription Gate Middleware
 * Bulletproof server-side enforcement preventing any unauthorized or expired usage.
 */
export const requireActiveSubscription = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const user = req.user;

    // 1. Superadmin & Admin bypass all subscription checks
    if (user.role === "superadmin" || user.role === "admin") {
      return next();
    }

    // 2. Check if account is suspended or blocked
    if (user.accountStatus === "suspended" || user.accountStatus === "locked" || user.status === "suspended") {
      return res.status(403).json({
        success: false,
        accountSuspended: true,
        message: "Your account has been suspended by administration. Please contact MegaTrix support.",
      });
    }

    // 3. Check Lifetime Access
    if (user.subscription && user.subscription.isLifetime) {
      return next();
    }

    const now = new Date();
    const sub = user.subscription;

    // If no subscription object exists, initialize default 14-day trial
    if (!sub || !sub.expiresAt) {
      const trialExpiresAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
      await User.findByIdAndUpdate(user._id, {
        subscription: {
          plan: "trial",
          status: "trial",
          startDate: new Date(),
          expiresAt: trialExpiresAt,
          trialEndsAt: trialExpiresAt,
          isLifetime: false,
        },
      });
      return next();
    }

    const expiresAt = new Date(sub.expiresAt);

    // 4. Check if subscription is expired (JIT validation against server clock)
    if (now > expiresAt) {
      // Transition DB status to 'expired' asynchronously if not already set
      if (sub.status !== "expired") {
        User.findByIdAndUpdate(user._id, {
          "subscription.status": "expired",
        }).catch((err) => console.error("Failed to update expired status:", err.message));
      }

      return res.status(403).json({
        success: false,
        subscriptionExpired: true,
        plan: sub.plan || "trial",
        expiresAt: sub.expiresAt,
        message: "Your subscription has expired. Please renew your plan to continue using BizManager.",
      });
    }

    // 5. Subscription is active
    next();
  } catch (error) {
    console.error("Subscription Middleware Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal security validation failure",
    });
  }
};

export default { requireActiveSubscription };
