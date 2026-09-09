import mongoose from "mongoose";

const customerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      default: "",
      lowercase: true,
      trim: true,
      validate: {
        validator: function (v) {
          if (!v || v.trim() === "") return true;
          return /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(v);
        },
        message: "Please fill a valid email address",
      },
    },
    address: {
      type: String,
      default: "",
    },
    dues: {
      type: Number,
      default: 0,
    },
    transactionHistory: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Transaction",
      },
    ],
    // Referral tracking - which customer referred this one
    referredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      default: null,
    },
    // Link customer to shop owner
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      index: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    // Multi-tenancy
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      index: true,
      required: false,
    },
  },
  { timestamps: true }
);

// Compound index to ensure phone is unique per owner
customerSchema.index({ phone: 1, owner: 1 }, { unique: true });

const Customer = mongoose.model("Customer", customerSchema);
export default Customer;