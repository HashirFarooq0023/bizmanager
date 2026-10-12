import cron from "node-cron";
import User from "../models/User.js";

/**
 * Subscription Lifecycle Automation Engine
 * Runs background scans to update expired subscriptions and trials.
 */
export const runSubscriptionLifecycleScan = async () => {
  try {
    const now = new Date();

    // 1. Transition Expired Paid Subscriptions
    const expiredPaidResult = await User.updateMany(
      {
        role: { $ne: "superadmin" },
        "subscription.isLifetime": { $ne: true },
        "subscription.status": "active",
        "subscription.expiresAt": { $lt: now },
        $or: [
          { "subscription.gracePeriodEndsAt": null },
          { "subscription.gracePeriodEndsAt": { $lt: now } },
        ],
      },
      {
        $set: { "subscription.status": "expired" },
      }
    );

    // 2. Transition Expired Free Trials
    const expiredTrialsResult = await User.updateMany(
      {
        role: { $ne: "superadmin" },
        "subscription.isLifetime": { $ne: true },
        "subscription.status": "trial",
        $or: [
          { "subscription.trialEndsAt": { $lt: now } },
          { "subscription.expiresAt": { $lt: now } },
        ],
      },
      {
        $set: { "subscription.status": "expired" },
      }
    );

    if (expiredPaidResult.modifiedCount > 0 || expiredTrialsResult.modifiedCount > 0) {
      console.log(
        `[Subscription Scheduler] Scanned & updated: ${expiredPaidResult.modifiedCount} paid -> expired, ${expiredTrialsResult.modifiedCount} trials -> expired.`
      );
    }
  } catch (error) {
    console.error("[Subscription Scheduler Error]:", error.message);
  }
};

/**
 * Initialize Background Cron Schedule
 * Default: Every 6 hours (0 0,6,12,18 * * *)
 */
export const initSubscriptionScheduler = () => {
  // Run once immediately on startup
  runSubscriptionLifecycleScan();

  // Schedule every 6 hours
  cron.schedule("0 0,6,12,18 * * *", () => {
    console.log("[Subscription Scheduler] Running scheduled subscription lifecycle check...");
    runSubscriptionLifecycleScan();
  });

  console.log("⏱️  Subscription automated lifecycle cron scheduler initialized.");
};

export default {
  runSubscriptionLifecycleScan,
  initSubscriptionScheduler,
};
