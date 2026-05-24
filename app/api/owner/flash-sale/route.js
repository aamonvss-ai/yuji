import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import SystemSettings from "@/models/SystemSettings";

export async function GET() {
    try {
        await connectDB();
        let settings = await SystemSettings.findOne();

        if (!settings) {
            settings = await SystemSettings.create({
                maintenanceMode: false,
                flashSale: {
                    isActive: false,
                    endTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
                    items: []
                }
            });
        }

        return NextResponse.json({ success: true, flashSale: settings.flashSale || {} });
    } catch (error) {
        console.error("GET FLASH SALE ERROR:", error);
        return NextResponse.json({ success: false, message: "Failed to fetch flash sale settings" }, { status: 500 });
    }
}

export async function PUT(req) {
    try {
        const body = await req.json();
        await connectDB();

        let settings = await SystemSettings.findOne();
        if (!settings) {
            settings = new SystemSettings();
        }

        settings.flashSale = {
            isActive: body.isActive !== undefined ? body.isActive : settings.flashSale?.isActive,
            endTime: body.endTime !== undefined ? body.endTime : settings.flashSale?.endTime,
            items: body.items !== undefined ? body.items : settings.flashSale?.items
        };

        await settings.save();

        return NextResponse.json({ success: true, flashSale: settings.flashSale });
    } catch (error) {
        console.error("PUT FLASH SALE ERROR:", error);
        return NextResponse.json({ success: false, message: "Failed to update flash sale settings" }, { status: 500 });
    }
}
