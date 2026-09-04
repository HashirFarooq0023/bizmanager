/**
 * Clear Demo Account Data Script
 * Deletes all seeded data and records for demo@bizzai.com.
 */
import mongoose from "mongoose";
import dotenv from "dotenv";
import dns from "dns";

dotenv.config();

// Import all models
import User from "../models/User.js";
import Organization from "../models/Organization.js";
import Customer from "../models/Customer.js";
import Item from "../models/Item.js";
import Supplier from "../models/Supplier.js";
import BankAccount from "../models/BankAccount.js";
import Invoice from "../models/Invoice.js";
import Counter from "../models/Counter.js";
import Bill from "../models/Bill.js";
import PurchaseOrder from "../models/PurchaseOrder.js";
import SalesOrder from "../models/SalesOrder.js";
import Estimate from "../models/Estimate.js";
import DeliveryChallan from "../models/DeliveryChallan.js";
import PaymentIn from "../models/PaymentIn.js";
import PaymentOut from "../models/PaymentOut.js";
import Expense from "../models/Expense.js";
import GoodsReceivedNote from "../models/GoodsReceivedNote.js";
import PurchaseReturn from "../models/PurchaseReturn.js";
import Return from "../models/Return.js";
import CreditNote from "../models/CreditNote.js";
import DebitNote from "../models/DebitNote.js";
import DueAdjustment from "../models/DueAdjustment.js";
import StockLedger from "../models/StockLedger.js";
import StockMovement from "../models/StockMovement.js";
import CashbankTransaction from "../models/CashbankTransaction.js";
import JournalEntry from "../models/JournalEntry.js";

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
        console.error(`❌ Connection Error: ${error.message}`);
        process.exit(1);
    }
};

const clearDemoData = async () => {
    console.log("╔════════════════════════════════════════╗");
    console.log("║     Clear Demo Account Data Script     ║");
    console.log("╚════════════════════════════════════════╝\n");

    await connectDB();

    const targetEmail = "demo@bizzai.com";
    const user = await User.findOne({ email: targetEmail });

    if (!user) {
        console.log(`⚠️ User ${targetEmail} not found. No data to clear.`);
        process.exit(0);
    }

    const userId = user._id;
    const orgId = user.organizationId;

    console.log(`👤 Found target demo account: ${user.name} (${user.email})`);
    console.log(`🆔 User ID: ${userId}`);
    if (orgId) console.log(`🏢 Organization ID: ${orgId}`);

    console.log("\n🧹 Removing all seeded data for demo account...");

    const delUser = { $or: [{ createdBy: userId }, { owner: userId }, { userId: userId }, { addedBy: userId }] };
    const delOrg = orgId ? { organizationId: orgId } : {};

    await Invoice.collection.deleteMany({ $or: [{ createdBy: userId }, delOrg] });
    await Item.collection.deleteMany({ $or: [{ addedBy: userId }, delOrg] });
    await Customer.collection.deleteMany({ $or: [{ owner: userId }, { createdBy: userId }, delOrg] });
    await Supplier.collection.deleteMany({ $or: [{ owner: userId }, delOrg] });
    await BankAccount.collection.deleteMany({ $or: [{ userId: userId }, delOrg] });
    await Counter.collection.deleteMany({ userId: userId });

    await Bill.collection.deleteMany({ $or: [{ createdBy: userId }, delOrg] });
    await PurchaseOrder.collection.deleteMany({ $or: [{ createdBy: userId }, delOrg] });
    await SalesOrder.collection.deleteMany({ $or: [{ createdBy: userId }, delOrg] });
    await Estimate.collection.deleteMany({ $or: [{ createdBy: userId }, delOrg] });
    await DeliveryChallan.collection.deleteMany({ $or: [{ createdBy: userId }, delOrg] });
    await PaymentIn.collection.deleteMany({ $or: [{ createdBy: userId }, delOrg] });
    await PaymentOut.collection.deleteMany({ $or: [{ createdBy: userId }, delOrg] });
    await Expense.collection.deleteMany({ $or: [{ createdBy: userId }, delOrg] });
    await GoodsReceivedNote.collection.deleteMany({ $or: [{ createdBy: userId }, delOrg] });
    await PurchaseReturn.collection.deleteMany({ $or: [{ createdBy: userId }, delOrg] });
    await Return.collection.deleteMany({ $or: [{ createdBy: userId }, delOrg] });
    await CreditNote.collection.deleteMany({ $or: [{ createdBy: userId }, delOrg] });
    await DebitNote.collection.deleteMany({ $or: [{ createdBy: userId }, delOrg] });
    await DueAdjustment.collection.deleteMany({ $or: [{ createdBy: userId }, delOrg] });
    await StockLedger.collection.deleteMany({ $or: [{ createdBy: userId }, delOrg] });
    await StockMovement.collection.deleteMany({ $or: [{ createdBy: userId }, delOrg] });
    await CashbankTransaction.collection.deleteMany({ $or: [{ userId: userId }, delOrg] });
    await JournalEntry.collection.deleteMany({ $or: [{ createdBy: userId }, delOrg] });

    console.log("   ✓ Deleted all transactions, items, customers, suppliers, bills, and ledgers");

    if (orgId) {
        await Organization.collection.deleteMany({ _id: orgId });
        console.log("   ✓ Deleted Demo Organization");
    }

    await User.collection.deleteOne({ _id: userId });
    console.log(`   ✓ Deleted User account: ${targetEmail}`);

    console.log("\n╔════════════════════════════════════════╗");
    console.log("║  ✅ Demo account & data fully cleared! ║");
    console.log("╚════════════════════════════════════════╝");

    process.exit(0);
};

clearDemoData().catch((err) => {
    console.error("❌ Cleanup failed:", err);
    process.exit(1);
});
