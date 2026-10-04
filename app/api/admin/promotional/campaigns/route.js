import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import PromotionalCampaign from "@/models/PromotionalCampaign";
import { requireOwner } from "@/lib/auth";

export async function GET(req) {
  try {
    await connectDB();
    requireOwner(req);

    const campaigns = await PromotionalCampaign.find().sort({ createdAt: -1 }).limit(20);

    return NextResponse.json({
      success: true,
      data: campaigns,
    });
  } catch (error) {
    console.error("Fetch campaigns error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Internal server error" },
      { status: error.status || 500 }
    );
  }
}
