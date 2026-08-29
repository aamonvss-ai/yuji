import mongoose from "mongoose";

const OrderSchema = new mongoose.Schema(
  {
    orderId: { type: String, required: true, unique: true },
    userId: { type: String, default: null },
    gameSlug: String,
    itemSlug: String,
    itemName: String,
    playerId: String,
    zoneId: String,
    paymentMethod: String,
    price: Number,
    email: String,
    phone: String,
    status: {
      type: String,
      enum: [
        "pending", "success", "failed", "refund", "refunded",
        "PENDING", "SUCCESS", "FAILED", "REFUND", "REFUNDED"
      ],
      default: "pending"
    },
    // ✅ NEW: Top-up status
    paymentStatus: {
      type: String,
      enum: ["pending", "success", "failed", "refunded", "REFUNDED"],
      default: "pending",
    },

    /* ================= TOP-UP STATUS ================= */
    topupStatus: {
      type: String,
      enum: ["pending", "success", "failed", "refunded", "REFUNDED"],
      default: "pending",
    },
    ip: String,
    expiresAt: Date,
  },
  { timestamps: true }
);

OrderSchema.index({ email: 1, createdAt: -1 });
OrderSchema.index({ userId: 1, createdAt: -1 });
OrderSchema.index({ phone: 1, createdAt: -1 });
OrderSchema.index({ status: 1 });
OrderSchema.index({ createdAt: -1 });

export default mongoose.models.Order || mongoose.model("Order", OrderSchema);
