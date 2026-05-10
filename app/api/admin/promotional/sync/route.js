import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import jwt from "jsonwebtoken";

export async function GET(req) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ success: false, message: "No token provided" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    await connectDB();
    const admin = await User.findById(decoded.userId);

    if (!admin || admin.userType !== "owner") {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

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
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
