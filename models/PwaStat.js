import mongoose from "mongoose";

const PwaStatSchema = new mongoose.Schema(
  {
    eventType: {
      type: String,
      enum: ["prompt_shown", "install_accepted", "install_dismissed", "app_installed", "standalone_session"],
      required: true,
      index: true,
    },
    platform: {
      type: String,
      default: "Unknown",
      index: true,
    },
    browser: {
      type: String,
      default: "Unknown",
    },
    userAgent: {
      type: String,
      default: "",
    },
    userId: {
      type: String,
      default: null,
      index: true,
    },
    userName: {
      type: String,
      default: null,
    },
    ip: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

PwaStatSchema.index({ createdAt: -1 });

export default mongoose.models.PwaStat ||
  mongoose.model("PwaStat", PwaStatSchema);
