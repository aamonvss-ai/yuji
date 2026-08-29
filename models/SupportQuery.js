import mongoose from "mongoose";

const SupportQuerySchema = new mongoose.Schema(
  {
    email: { type: String, default: null },
    phone: { type: String, default: null },
    type: { type: String, required: true },
    message: { type: String, required: true },
    orderId: { type: String, default: null },

    // 👇 new field
    status: {
      type: String,
      enum: ["open", "in_progress", "resolved", "closed"],
      default: "open",
    },
  },
  { timestamps: true }
);

SupportQuerySchema.index({ email: 1, createdAt: -1 });
SupportQuerySchema.index({ phone: 1, createdAt: -1 });
SupportQuerySchema.index({ status: 1 });
SupportQuerySchema.index({ createdAt: -1 });

export default mongoose.models.SupportQuery ||
  mongoose.model("SupportQuery", SupportQuerySchema);
