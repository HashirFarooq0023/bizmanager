/**
 * Mobile Phone Seed Script
 * 
 * Seeds Apple iPhone (11 to 17 Pro Max) and Samsung Galaxy (S22 Ultra to S25 Ultra) models
 * into MongoDB with default stockQty = 0 and market prices in PKR for Pakistani used mobile market.
 * 
 * Usage: node scripts/seed-mobiles.js
 */

import mongoose from "mongoose";
import dotenv from "dotenv";
import dns from "dns";
import User from "../models/User.js";
import Organization from "../models/Organization.js";
import Item from "../models/Item.js";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../.env") });
dotenv.config();

const connectDB = async () => {
    try {
        const mongoUri = process.env.MONGO_URI || "";
        if (mongoUri.startsWith("mongodb+srv://")) {
            try {
                dns.setServers(["8.8.8.8", "1.1.1.1"]);
            } catch (e) {}
        }
        const conn = await mongoose.connect(mongoUri);
        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`❌ DB Connection Error: ${error.message}`);
        process.exit(1);
    }
};

export const mobileItemsData = [
    // --- APPLE IPHONE MODELS (iPhone 11 to iPhone 17 Pro Max) ---
    // iPhone 11 Series
    { name: "iPhone 11 (128GB)", sku: "IPH-11-128", category: "Smartphones", costPrice: 75000, sellingPrice: 85000, stockQty: 0, unit: "pcs" },
    { name: "iPhone 11 Pro (128GB)", sku: "IPH-11P-128", category: "Smartphones", costPrice: 95000, sellingPrice: 110000, stockQty: 0, unit: "pcs" },
    { name: "iPhone 11 Pro Max (128GB)", sku: "IPH-11PM-128", category: "Smartphones", costPrice: 115000, sellingPrice: 130000, stockQty: 0, unit: "pcs" },

    // iPhone 12 Series
    { name: "iPhone 12 Mini (128GB)", sku: "IPH-12M-128", category: "Smartphones", costPrice: 80000, sellingPrice: 90000, stockQty: 0, unit: "pcs" },
    { name: "iPhone 12 (128GB)", sku: "IPH-12-128", category: "Smartphones", costPrice: 95000, sellingPrice: 110000, stockQty: 0, unit: "pcs" },
    { name: "iPhone 12 Pro (128GB)", sku: "IPH-12P-128", category: "Smartphones", costPrice: 125000, sellingPrice: 140000, stockQty: 0, unit: "pcs" },
    { name: "iPhone 12 Pro Max (128GB)", sku: "IPH-12PM-128", category: "Smartphones", costPrice: 150000, sellingPrice: 170000, stockQty: 0, unit: "pcs" },

    // iPhone 13 Series
    { name: "iPhone 13 Mini (128GB)", sku: "IPH-13M-128", category: "Smartphones", costPrice: 115000, sellingPrice: 130000, stockQty: 0, unit: "pcs" },
    { name: "iPhone 13 (128GB)", sku: "IPH-13-128", category: "Smartphones", costPrice: 140000, sellingPrice: 160000, stockQty: 0, unit: "pcs" },
    { name: "iPhone 13 Pro (128GB)", sku: "IPH-13P-128", category: "Smartphones", costPrice: 180000, sellingPrice: 205000, stockQty: 0, unit: "pcs" },
    { name: "iPhone 13 Pro Max (128GB)", sku: "IPH-13PM-128", category: "Smartphones", costPrice: 210000, sellingPrice: 235000, stockQty: 0, unit: "pcs" },

    // iPhone 14 Series
    { name: "iPhone 14 (128GB)", sku: "IPH-14-128", category: "Smartphones", costPrice: 170000, sellingPrice: 195000, stockQty: 0, unit: "pcs" },
    { name: "iPhone 14 Plus (128GB)", sku: "IPH-14PL-128", category: "Smartphones", costPrice: 190000, sellingPrice: 215000, stockQty: 0, unit: "pcs" },
    { name: "iPhone 14 Pro (128GB)", sku: "IPH-14P-128", category: "Smartphones", costPrice: 240000, sellingPrice: 270000, stockQty: 0, unit: "pcs" },
    { name: "iPhone 14 Pro Max (128GB)", sku: "IPH-14PM-128", category: "Smartphones", costPrice: 270000, sellingPrice: 300000, stockQty: 0, unit: "pcs" },

    // iPhone 15 Series
    { name: "iPhone 15 (128GB)", sku: "IPH-15-128", category: "Smartphones", costPrice: 220000, sellingPrice: 245000, stockQty: 0, unit: "pcs" },
    { name: "iPhone 15 Plus (128GB)", sku: "IPH-15PL-128", category: "Smartphones", costPrice: 245000, sellingPrice: 275000, stockQty: 0, unit: "pcs" },
    { name: "iPhone 15 Pro (128GB)", sku: "IPH-15P-128", category: "Smartphones", costPrice: 310000, sellingPrice: 345000, stockQty: 0, unit: "pcs" },
    { name: "iPhone 15 Pro Max (256GB)", sku: "IPH-15PM-256", category: "Smartphones", costPrice: 360000, sellingPrice: 400000, stockQty: 0, unit: "pcs" },

    // iPhone 16 Series
    { name: "iPhone 16 (128GB)", sku: "IPH-16-128", category: "Smartphones", costPrice: 270000, sellingPrice: 300000, stockQty: 0, unit: "pcs" },
    { name: "iPhone 16 Plus (128GB)", sku: "IPH-16PL-128", category: "Smartphones", costPrice: 300000, sellingPrice: 335000, stockQty: 0, unit: "pcs" },
    { name: "iPhone 16 Pro (128GB)", sku: "IPH-16P-128", category: "Smartphones", costPrice: 390000, sellingPrice: 430000, stockQty: 0, unit: "pcs" },
    { name: "iPhone 16 Pro Max (256GB)", sku: "IPH-16PM-256", category: "Smartphones", costPrice: 450000, sellingPrice: 495000, stockQty: 0, unit: "pcs" },

    // iPhone 17 Series
    { name: "iPhone 17 (128GB)", sku: "IPH-17-128", category: "Smartphones", costPrice: 340000, sellingPrice: 380000, stockQty: 0, unit: "pcs" },
    { name: "iPhone 17 Air (256GB)", sku: "IPH-17AIR-256", category: "Smartphones", costPrice: 380000, sellingPrice: 420000, stockQty: 0, unit: "pcs" },
    { name: "iPhone 17 Pro (256GB)", sku: "IPH-17P-256", category: "Smartphones", costPrice: 480000, sellingPrice: 530000, stockQty: 0, unit: "pcs" },
    { name: "iPhone 17 Pro Max (256GB)", sku: "IPH-17PM-256", category: "Smartphones", costPrice: 550000, sellingPrice: 600000, stockQty: 0, unit: "pcs" },

    // --- SAMSUNG GALAXY MODELS (S22 Ultra to S25 Series) ---
    // Samsung S22 Series
    { name: "Samsung Galaxy S22 Ultra (256GB)", sku: "SAM-S22U-256", category: "Smartphones", costPrice: 145000, sellingPrice: 165000, stockQty: 0, unit: "pcs" },

    // Samsung S23 Series
    { name: "Samsung Galaxy S23 (128GB)", sku: "SAM-S23-128", category: "Smartphones", costPrice: 140000, sellingPrice: 160000, stockQty: 0, unit: "pcs" },
    { name: "Samsung Galaxy S23 Plus (256GB)", sku: "SAM-S23P-256", category: "Smartphones", costPrice: 165000, sellingPrice: 185000, stockQty: 0, unit: "pcs" },
    { name: "Samsung Galaxy S23 Ultra (256GB)", sku: "SAM-S23U-256", category: "Smartphones", costPrice: 205000, sellingPrice: 230000, stockQty: 0, unit: "pcs" },

    // Samsung S24 Series
    { name: "Samsung Galaxy S24 (128GB)", sku: "SAM-S24-128", category: "Smartphones", costPrice: 185000, sellingPrice: 210000, stockQty: 0, unit: "pcs" },
    { name: "Samsung Galaxy S24 Plus (256GB)", sku: "SAM-S24P-256", category: "Smartphones", costPrice: 220000, sellingPrice: 250000, stockQty: 0, unit: "pcs" },
    { name: "Samsung Galaxy S24 Ultra (256GB)", sku: "SAM-S24U-256", category: "Smartphones", costPrice: 280000, sellingPrice: 315000, stockQty: 0, unit: "pcs" },

    // Samsung S25 Series
    { name: "Samsung Galaxy S25 (128GB)", sku: "SAM-S25-128", category: "Smartphones", costPrice: 240000, sellingPrice: 270000, stockQty: 0, unit: "pcs" },
    { name: "Samsung Galaxy S25 Plus (256GB)", sku: "SAM-S25P-256", category: "Smartphones", costPrice: 280000, sellingPrice: 315000, stockQty: 0, unit: "pcs" },
    { name: "Samsung Galaxy S25 Ultra (256GB)", sku: "SAM-S25U-256", category: "Smartphones", costPrice: 360000, sellingPrice: 400000, stockQty: 0, unit: "pcs" },
    { name: "Samsung Galaxy S25 Slim (256GB)", sku: "SAM-S25SLIM-256", category: "Smartphones", costPrice: 320000, sellingPrice: 360000, stockQty: 0, unit: "pcs" }
];

const seedMobiles = async () => {
    console.log("📱 Starting Mobile Phone Seeding...");
    await connectDB();

    const users = await User.find({});
    if (!users || users.length === 0) {
        console.log("⚠️ No users found in database. Run 'npm run seed' first to create default user.");
        process.exit(0);
    }

    console.log(`Found ${users.length} user(s). Seeding items for each user/organization...`);

    let totalCreated = 0;
    let totalUpdated = 0;

    for (const user of users) {
        const orgId = user.organizationId;
        for (const itemData of mobileItemsData) {
            const filter = { name: itemData.name, addedBy: user._id };
            const update = {
                ...itemData,
                addedBy: user._id,
                organizationId: orgId,
                isDeleted: false
            };

            const existing = await Item.findOne(filter);
            if (existing) {
                await Item.updateOne(filter, update);
                totalUpdated++;
            } else {
                await Item.create(update);
                totalCreated++;
            }
        }
    }

    console.log(`\n🎉 Mobile Phone Seeding Complete!`);
    console.log(`   - Created: ${totalCreated} items`);
    console.log(`   - Updated: ${totalUpdated} items`);
    console.log(`   - Total Models Seeded per User: ${mobileItemsData.length}`);

    process.exit(0);
};

// Execute if run directly
if (process.argv[1].endsWith("seed-mobiles.js")) {
    seedMobiles().catch((err) => {
        console.error("❌ Seeding failed:", err);
        process.exit(1);
    });
}
