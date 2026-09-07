import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

export async function GET(req) {
  try {
    await connectDB();

    // 🔐 Read Authorization header
    const authHeader = req.headers.get("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { success: false, message: "No token provided" },
        { status: 401 }
      );
    }

    const token = authHeader.split(" ")[1];

    // 🔎 Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 👤 Fetch user
    const user = await User.findById(decoded.userId)
      .select("-password -__v")
      .lean();

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    // 🕒 Update Activity status (throttled to once every 15 mins)
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0] || "127.0.0.1";

    if (!user.lastLoginAt || user.lastLoginAt < fifteenMinutesAgo) {
      await User.findByIdAndUpdate(user._id, {
        lastLoginAt: new Date(),
        lastLoginIp: ip,
      });
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user._id,
        userId: user.userId,
        name: user.name,
        email: user.email,
        phone: user.phone,
        wallet: user.wallet,
        order: user.order,
        userType: user.userType,
        avatar: user.avatar,
      },
    });

  } catch (err) {
    return NextResponse.json(
      { success: false, message: "Invalid or expired token" },
      { status: 401 }
    );
  }
}
