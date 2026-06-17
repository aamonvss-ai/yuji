import mongoose from "mongoose";

const SystemSettingsSchema = new mongoose.Schema(
    {
        maintenanceMode: {
            type: Boolean,
            default: false,
        },
        enableAutoTranslation: {
            type: Boolean,
            default: false,
        },
        acceptingOrders: {
            type: Boolean,
            default: true,
        },
        notAcceptingOrdersMessage: {
            type: String,
            default: "We are not taking orders right now. Please come back later.",
        },
        seoTitle: { type: String },
        seoDescription: { type: String },
        seoKeywords: [{ type: String }],
        flashSale: {
            isActive: { type: Boolean, default: false },
            endTime: { type: Date },
            items: [
                {
                    id: String,
                    name: String,
                    game: String,
                    image: String,
                    price: String,
                    originalPrice: String,
                    slug: String,
                    badge: String,
                    sold: Number
                }
            ]
        }
    },
    { timestamps: true }
);

if (mongoose.models.SystemSettings) {
    delete mongoose.models.SystemSettings;
}

export default mongoose.model("SystemSettings", SystemSettingsSchema);
