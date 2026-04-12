import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import WalletTransaction from "@/models/WalletTransaction";
import jwt from "jsonwebtoken";
import crypto from "crypto";

export async function PATCH(req) {
  try {
    await connectDB();

    /* ================= AUTH ================= */
    const auth = req.headers.get("authorization");
    if (!auth?.startsWith("Bearer "))
      return Response.json({ message: "Unauthorized" }, { status: 401 });

    const token = auth.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.userType !== "owner")
      return Response.json({ message: "Forbidden" }, { status: 403 });

    /* ================= BODY ================= */
    const { userId, amount, action, description } = await req.json();

    if (!userId || amount == null || !action) {
      return Response.json({ message: "Missing fields" }, { status: 400 });
    }

    const user = await User.findOne({ userId });
    if (!user) {
      return Response.json({ message: "User not found" }, { status: 404 });
    }

    const adjAmount = Number(amount);
    if (isNaN(adjAmount) || adjAmount <= 0) {
      return Response.json({ message: "Amount must be a positive number" }, { status: 400 });
    }

    /* ================= ATOMIC UPDATE ================= */
    const update =
      action === "add" ? { $inc: { wallet: adjAmount } } : { $inc: { wallet: -adjAmount } };

    const updatedUser = await User.findOneAndUpdate({ userId }, update, {
      new: true,
    });

    if (!updatedUser) {
      return Response.json({ message: "Failed to update balance" }, { status: 500 });
    }

    /* ================= RECORD TRANSACTION ================= */
    const transactionId = "ADM" + crypto.randomBytes(6).toString("hex").toUpperCase();
    await WalletTransaction.create({
      transactionId,
      userId,
      amount: adjAmount,
      type: action === "add" ? "bonus" : "spend",
      status: "success",
      description: description || `Admin adjustment: ${action}`,
      metadata: {
        adminId: decoded.userId,
        reason: "manual_adjustment",
      },
    });

    return Response.json({
      success: true,
      newBalance: updatedUser.wallet,
    });
  } catch (err) {
    console.error(err);
    return Response.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
