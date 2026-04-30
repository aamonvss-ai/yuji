import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import { generateUserId } from "@/lib/generateUserId";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export async function POST(req: Request) {
  try {
    await connectDB();
    const { token } = await req.json();

    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload?.email) {
      return Response.json(
        { success: false, message: "Invalid Google token" },
        { status: 401 }
      );
    }

    const { sub, email, name, picture } = payload;

    let user = await User.findOne({ email });

    /* ================= CREATE OR UPDATE USER ================= */
    if (!user) {
      user = await User.create({
        userId: generateUserId(name || "user", Date.now().toString()),
        name,
        email,
        password: null,         // 🔐 no password
        provider: "google",
        googleId: sub,
        avatar: picture,
        wallet: 0,
        order: 0,
        userType: "user",
      });
    } else {
      // Update missing info for existing users
      if (!user.avatar && picture) user.avatar = picture;
      if (!user.googleId) user.googleId = sub;
      if (user.provider === "local" && !user.password) user.provider = "google";
    }

    /* ================= UPDATE LAST LOGIN ================= */
    const forwarded = req.headers.get("x-forwarded-for");
    const ip = forwarded ? forwarded.split(/, /)[0] : "127.0.0.1";

    user.lastLoginAt = new Date();
    user.lastLoginIp = ip;
    await user.save();

    /* ================= JWT ================= */
    const jwtToken = jwt.sign(
      { userId: user._id, userType: user.userType },
      process.env.JWT_SECRET!,
      { expiresIn: "7d" }
    );

    return Response.json({
      success: true,
      token: jwtToken,
      user: {
        name: user.name,
        email: user.email,
        userId: user.userId,
        userType: user.userType,
      },
    });
  } catch (error) {
    console.error("Google Auth Error:", error);
    return Response.json(
      { success: false, message: "Google authentication failed" },
      { status: 500 }
    );
  }
}
