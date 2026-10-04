import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import SystemSettings from "@/models/SystemSettings";
import { requireOwner } from "@/lib/auth";

export async function GET(req) {
    try {
        await connectDB();
        requireOwner(req);

        let settings = await SystemSettings.findOne();
        if (!settings) {
            settings = await SystemSettings.create({ maintenanceMode: false });
        }

        return NextResponse.json({ success: true, settings });
    } catch (err) {
        return NextResponse.json({ success: false, message: err.message }, { status: err.status || 500 });
    }
}

export async function PATCH(req) {
    try {
        await connectDB();
        requireOwner(req);

        const body = await req.json();
        const { maintenanceMode, seoTitle, seoDescription, seoKeywords, enableAutoTranslation, acceptingOrders, notAcceptingOrdersMessage } = body;

        let settings = await SystemSettings.findOne();
        if (!settings) {
            settings = new SystemSettings();
        }

        if (maintenanceMode !== undefined) settings.maintenanceMode = maintenanceMode;
        if (enableAutoTranslation !== undefined) settings.enableAutoTranslation = enableAutoTranslation;
        if (acceptingOrders !== undefined) settings.acceptingOrders = acceptingOrders;
        if (notAcceptingOrdersMessage !== undefined) settings.notAcceptingOrdersMessage = notAcceptingOrdersMessage;
        if (seoTitle !== undefined) settings.seoTitle = seoTitle;
        if (seoDescription !== undefined) settings.seoDescription = seoDescription;
        if (seoKeywords !== undefined) settings.seoKeywords = seoKeywords;
        await settings.save();

        return NextResponse.json({ success: true, settings });
    } catch (err) {
        return NextResponse.json({ success: false, message: err.message }, { status: err.status || 500 });
    }
}
