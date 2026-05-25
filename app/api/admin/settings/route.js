import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import SystemSettings from "@/models/SystemSettings";

export async function GET(req) {
    try {
        await connectDB();

        const authHeader = req.headers.get("authorization");
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }

        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId);

        if (!user || user.userType !== "owner") {
            return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
        }

        let settings = await SystemSettings.findOne();
        if (!settings) {
            settings = await SystemSettings.create({ maintenanceMode: false });
        }

        return NextResponse.json({ success: true, settings });
    } catch (err) {
        return NextResponse.json({ success: false, message: err.message }, { status: 500 });
    }
}

export async function PATCH(req) {
    try {
        await connectDB();

        const authHeader = req.headers.get("authorization");
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }

        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId);

        if (!user || user.userType !== "owner") {
            return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
        }

        const body = await req.json();
        const { maintenanceMode, seoTitle, seoDescription, seoKeywords, enableAutoTranslation } = body;

        let settings = await SystemSettings.findOne();
        if (!settings) {
            settings = new SystemSettings();
        }

        if (maintenanceMode !== undefined) settings.maintenanceMode = maintenanceMode;
        if (enableAutoTranslation !== undefined) settings.enableAutoTranslation = enableAutoTranslation;
        if (seoTitle !== undefined) settings.seoTitle = seoTitle;
        if (seoDescription !== undefined) settings.seoDescription = seoDescription;
        if (seoKeywords !== undefined) settings.seoKeywords = seoKeywords;
        await settings.save();

        return NextResponse.json({ success: true, settings });
    } catch (err) {
        return NextResponse.json({ success: false, message: err.message }, { status: 500 });
    }
}
