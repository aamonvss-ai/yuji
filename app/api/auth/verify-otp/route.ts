import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import Otp from "@/models/Otp";
import jwt from "jsonwebtoken";
import { generateUserId } from "@/lib/generateUserId";

export async function POST(req: Request) {
  try {
    await connectDB();
    const { email, otp } = await req.json();

    if (!email || !otp) {
      return Response.json(
        { success: false, message: "Email and OTP are required" },
        { status: 400 }
      );
    }

    const emailLower = email.toLowerCase().trim();

    const otpRecord = await Otp.findOne({ email: emailLower, otp });

    if (!otpRecord) {
      return Response.json(
        { success: false, message: "Invalid or expired OTP" },
        { status: 400 }
      );
    }

    // OTP is valid, let's process the user
    let user = await User.findOne({ email: emailLower });

    if (!user) {
      // Register new user automatically
      const name = emailLower.split("@")[0]; // basic default name
      user = await User.create({
        userId: generateUserId(name, Date.now().toString()),
        name,
        email: emailLower,
        provider: "local",
        password: null,
        wallet: 0,
        order: 0,
        userType: "user",
      });
    }

    // Update last login info
    const forwarded = req.headers.get("x-forwarded-for");
    const ip = forwarded ? forwarded.split(/, /)[0] : "127.0.0.1";
    user.lastLoginAt = new Date();
    user.lastLoginIp = ip;
    await user.save();

    // Delete OTP record as it has been used successfully
    await Otp.deleteOne({ _id: otpRecord._id });

    // Generate JWT
    const token = jwt.sign(
      { userId: user._id, userType: user.userType },
      process.env.JWT_SECRET!,
      { expiresIn: "7d" }
    );

    return Response.json({
      success: true,
      token,
      user: {
        name: user.name,
        email: user.email,
        userId: user.userId,
        userType: user.userType,
      },
    });
  } catch (error) {
    console.error("Verify OTP Error:", error);
    return Response.json(
      { success: false, message: "Verification failed" },
      { status: 500 }
    );
  }
}
