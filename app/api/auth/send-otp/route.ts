import { connectDB } from "@/lib/mongodb";
import Otp from "@/models/Otp";
import { sendAuthOtpMail } from "@/lib/sendAuthOtpMail";

export async function POST(req: Request) {
  try {
    await connectDB();
    const { email } = await req.json();

    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      return Response.json(
        { success: false, message: "Valid email is required" },
        { status: 400 }
      );
    }

    const emailLower = email.toLowerCase().trim();

    // Generate 6 digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Delete existing OTPs for this email to prevent issues
    await Otp.deleteMany({ email: emailLower });

    // Save new OTP
    await Otp.create({
      email: emailLower,
      otp,
    });

    // Send email
    await sendAuthOtpMail(emailLower, otp);

    return Response.json({
      success: true,
      message: "OTP sent successfully",
    });
  } catch (error) {
    console.error("Send OTP Error:", error);
    return Response.json(
      { success: false, message: "Failed to send OTP" },
      { status: 500 }
    );
  }
}
