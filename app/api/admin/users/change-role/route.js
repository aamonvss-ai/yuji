import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { requireOwner } from "@/lib/auth";

export async function PATCH(req) {
  try {
    await connectDB();
    requireOwner(req);

    // ---------------- BODY ----------------
    const { userId, newUserType } = await req.json();

    if (!userId || !newUserType) {
      return Response.json(
        { message: "userId and newUserType are required" },
        { status: 400 }
      );
    }

    // ✅ member added
    const allowedRoles = ["user", "member", "admin", "owner"];

    if (!allowedRoles.includes(newUserType)) {
      return Response.json(
        { message: "Invalid userType" },
        { status: 400 }
      );
    }

    // ---------------- FETCH USER ----------------
    const user = await User.findOne({ userId });

    if (!user) {
      return Response.json({ message: "User not found" }, { status: 404 });
    }

    /**
     * 🔒 CRITICAL RULES
     */

    // ❌ Owner role cannot be ASSIGNED
    if (newUserType === "owner" && user.userType !== "owner") {
      return Response.json(
        { message: "Owner role cannot be assigned" },
        { status: 403 }
      );
    }

    // ❌ Owner role cannot be DOWNGRADED
    if (user.userType === "owner" && newUserType !== "owner") {
      return Response.json(
        { message: "Owner role cannot be changed" },
        { status: 403 }
      );
    }

    // ---------------- UPDATE ----------------
    user.userType = newUserType;
    await user.save();

    return Response.json({
      success: true,
      message: "User role updated successfully",
      data: {
        userId: user.userId,
        userType: user.userType,
      },
    });
  } catch (err) {
    console.error("ROLE UPDATE ERROR:", err);
    return Response.json(
      { success: false, message: err.message || "Server error" },
      { status: err.status || 500 }
    );
  }
}
