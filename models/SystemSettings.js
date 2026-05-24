import mongoose from "mongoose";

const SystemSettingsSchema = new mongoose.Schema(
    {
        maintenanceMode: {
            type: Boolean,
            default: false,
        },
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
