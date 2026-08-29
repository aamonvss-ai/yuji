import mongoose from "mongoose";

const WalletTransactionSchema = new mongoose.Schema(
  {
    transactionId: {
      type: String,
      unique: true,
      required: true,
    },
    userId: {
      type: String,
      required: true,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    type: {
      type: String,
      enum: ["topup", "spend", "refund", "bonus"],
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "success", "failed", "waiting"],
      default: "pending",
    },
    description: String,
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
  },
  { timestamps: true }
);

WalletTransactionSchema.index({ userId: 1, createdAt: -1 });
WalletTransactionSchema.index({ status: 1 });
WalletTransactionSchema.index({ createdAt: -1 });

export default mongoose.models.WalletTransaction ||
  mongoose.model("WalletTransaction", WalletTransactionSchema);
