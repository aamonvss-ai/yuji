import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import jwt from "jsonwebtoken";

export async function POST(req: Request) {
  try {
    await connectDB();
    const authHeader = req.headers.get("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return Response.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const token = authHeader.split(" ")[1];
    let decoded: any;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET!);
    } catch {
      return Response.json(
        { success: false, message: "Invalid or expired token" },
        { status: 401 }
      );
    }

    const { phone } = await req.json();

    if (!phone || typeof phone !== "string") {
      return Response.json(
        { success: false, message: "Phone number is required" },
        { status: 400 }
      );
    }

    const cleanPhone = phone.trim().replace(/[\s-]/g, "");

    // Validate phone number format (digits only, e.g. 7-15 digits)
    if (!/^\d{7,15}$/.test(cleanPhone)) {
      return Response.json(
        { success: false, message: "Please enter a valid phone number (digits only)" },
        { status: 400 }
      );
    }

    // Check if phone number is already registered to another user
    const existing = await User.findOne({
      phone: cleanPhone,
      _id: { $ne: decoded.userId },
    });

    if (existing) {
      return Response.json(
        { success: false, message: "This phone number is already registered to another account" },
        { status: 400 }
      );
    }

    const user = await User.findByIdAndUpdate(
      decoded.userId,
      { phone: cleanPhone },
      { new: true }
    );

    if (!user) {
      return Response.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    return Response.json({
      success: true,
      message: "Phone number saved successfully",
      phone: user.phone,
    });
  } catch (error) {
    console.error("Update Phone Error:", error);
    return Response.json(
      { success: false, message: "Failed to update phone number" },
      { status: 500 }
    );
  }
}
