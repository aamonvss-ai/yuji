import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import PromotionalCampaign from "@/models/PromotionalCampaign";
import jwt from "jsonwebtoken";
import User from "@/models/User";

export async function GET(req) {
  try {
    await connectDB();

    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ success: false, message: "No token provided" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const admin = await User.findById(decoded.userId);

    if (!admin || admin.userType !== "owner") {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const campaigns = await PromotionalCampaign.find().sort({ createdAt: -1 }).limit(20);

    return NextResponse.json({
      success: true,
      data: campaigns,
    });
  } catch (error) {
    console.error("Fetch campaigns error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
