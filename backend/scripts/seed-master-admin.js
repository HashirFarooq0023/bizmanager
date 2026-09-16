import dotenv from "dotenv";
import connectDB from "../config/db.js";
import User from "../models/User.js";

dotenv.config();

const seedMasterAdmin = async () => {
  const MASTER_EMAIL = "admin.megatrixai@gmail.com";
  const MASTER_PASSWORD = "Orangeman235!";
  const MASTER_NAME = "MegaTrix Master SuperAdmin";

  try {
    console.log("🔌 Connecting to MongoDB database...");
    await connectDB();

    const normalizedEmail = MASTER_EMAIL.toLowerCase().trim();
    let user = await User.findOne({ email: normalizedEmail });

    const subscriptionData = {
      plan: "lifetime",
      status: "active",
      startDate: new Date(),
      expiresAt: new Date(Date.now() + 100 * 365 * 24 * 60 * 60 * 1000), // 100 years
      trialEndsAt: null,
      isLifetime: true,
      lastRenewedAt: new Date(),
      assignedBy: "master-seed-system",
      notes: "Master SuperAdmin Account for MegaTrix Technologies Ecosystem",
      history: [
        {
          plan: "lifetime",
          status: "active",
          startDate: new Date(),
          expiresAt: new Date(Date.now() + 100 * 365 * 24 * 60 * 60 * 1000),
          changedBy: "system-seed",
          changedAt: new Date(),
          note: "Master SuperAdmin Initialized",
        },
      ],
    };

    if (user) {
      console.log(`🔄 Updating existing user account '${normalizedEmail}'...`);
      user.name = MASTER_NAME;
      user.password = MASTER_PASSWORD; // Will be encrypted by pre-save hook in User model
      user.role = "superadmin";
      user.accountStatus = "active";
      user.status = "active";
      user.failedLoginAttempts = 0;
      user.accountLockedUntil = undefined;
      user.subscription = subscriptionData;
      await user.save();
    } else {
      console.log(`✨ Creating new Master SuperAdmin account '${normalizedEmail}'...`);
      user = new User({
        name: MASTER_NAME,
        email: normalizedEmail,
        password: MASTER_PASSWORD, // Pre-save hook will hash
        phone: "03000000000",
        shopName: "MegaTrix Headquarters",
        role: "superadmin",
        accountStatus: "active",
        status: "active",
        preferredMode: "pro",
        accountCreatedSource: "api",
        subscription: subscriptionData,
      });
      await user.save();
    }

    console.log("=========================================================");
    console.log("👑 MEGATRIX MASTER SUPERADMIN CONFIGURED SUCCESSFULLY!");
    console.log("=========================================================");
    console.log(`📧 Master Email:    ${user.email}`);
    console.log(`🔑 Master Password: ${MASTER_PASSWORD}`);
    console.log(`🛡️ Role:            ${user.role.toUpperCase()}`);
    console.log(`⭐ License:         LIFETIME ALL-ACCESS (All SaaS Platforms)`);
    console.log(`🏢 Status:          ACTIVE`);
    console.log("=========================================================");

    process.exit(0);
  } catch (error) {
    console.error("❌ Master SuperAdmin Seeding Error:", error.message || error);
    process.exit(1);
  }
};

seedMasterAdmin();
