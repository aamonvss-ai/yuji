import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import SystemSettings from "@/models/SystemSettings";

export async function GET() {
    try {
        await connectDB();
        const settings = await SystemSettings.findOne().lean();

        if (!settings || !settings.flashSale || !settings.flashSale.isActive) {
            return NextResponse.json({ success: true, isActive: false });
        }

        return NextResponse.json({
            success: true,
            isActive: true,
            endTime: settings.flashSale.endTime,
            items: settings.flashSale.items || []
        });
    } catch (error) {
        console.error("PUBLIC GET FLASH SALE ERROR:", error);
        return NextResponse.json({ success: false, isActive: false }, { status: 500 });
    }
}
