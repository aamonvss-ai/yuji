import mongoose from "mongoose";

const PromotionalCampaignSchema = new mongoose.Schema(
  {
    subject: { type: String, required: true },
    header: { type: String },
    message: { type: String, required: true },
    bannerUrl: { type: String },
    recipientsCount: { type: Number, default: 0 },
    successCount: { type: Number, default: 0 },
    errorCount: { type: Number, default: 0 },
    status: { type: String, enum: ["completed", "failed", "processing"], default: "completed" },
    sentBy: { type: String }, // Admin/Owner username or ID
    logs: [
      {
        email: String,
        status: String,
        error: String,
        timestamp: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.models.PromotionalCampaign ||
  mongoose.model("PromotionalCampaign", PromotionalCampaignSchema);
