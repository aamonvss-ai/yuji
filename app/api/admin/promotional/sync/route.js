import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { requireOwner } from "@/lib/auth";

export async function GET(req) {
  try {
    requireOwner(req);
    await connectDB();

    // Fetch all users who have an email
    const users = await User.find({ email: { $exists: true, $ne: "" } }).select(
      "username email userType"
    );

    return NextResponse.json({
      success: true,
      data: users.map((u) => ({
        id: u._id,
        username: u.username,
        email: u.email,
        type: u.userType,
      })),
    });
  } catch (error) {
    console.error("Sync error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Internal server error" },
      { status: error.status || 500 }
    );
  }
}
