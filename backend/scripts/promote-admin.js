import dotenv from "dotenv";
import connectDB from "../config/db.js";
import User from "../models/User.js";

dotenv.config();

const promoteUser = async () => {
  const email = process.argv[2];

  if (!email) {
    console.error("❌ Usage: node backend/scripts/promote-admin.js <user-email>");
    process.exit(1);
  }

  try {
    await connectDB();

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      console.error(`❌ User with email '${normalizedEmail}' not found in database.`);
      process.exit(1);
    }

    user.role = "superadmin";
    user.accountStatus = "active";
    user.status = "active";
    user.subscription = {
      plan: "lifetime",
      status: "active",
      startDate: new Date(),
      expiresAt: new Date(Date.now() + 100 * 365 * 24 * 60 * 60 * 1000),
      isLifetime: true,
      assignedBy: "cli-script",
      notes: "Promoted to SuperAdmin with Lifetime License",
      history: [
        {
          plan: "lifetime",
          status: "active",
          startDate: new Date(),
          expiresAt: new Date(Date.now() + 100 * 365 * 24 * 60 * 60 * 1000),
          changedBy: "system-cli",
          changedAt: new Date(),
          note: "Promoted to SuperAdmin",
        },
      ],
    };

    await user.save();

    console.log("==================================================");
    console.log(`✅ SUCCESS: ${user.name} (${user.email}) is now a SuperAdmin!`);
    console.log(`👑 Role: superadmin`);
    console.log(`⭐ Subscription: LIFETIME (All SaaS Platforms)`);
    console.log("==================================================");

    process.exit(0);
  } catch (error) {
    console.error("❌ Promotion Error:", error.message);
    process.exit(1);
  }
};

promoteUser();
