import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import WalletTransaction from "@/models/WalletTransaction";

export async function POST(req) {
    try {
        await connectDB();

        // Admin Auth
        const authHeader = req.headers.get("authorization");
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }

        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const adminUser = await User.findById(decoded.userId);

        if (!adminUser || adminUser.userType !== "owner") {
            return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
        }

        const body = await req.json();
        const { transactionId, action } = body;

        if (!transactionId || !["approve", "reject"].includes(action)) {
            return NextResponse.json({ success: false, message: "Invalid request" }, { status: 400 });
        }

        // Find Pending Transaction
        const transaction = await WalletTransaction.findOne({ transactionId, status: "pending" });
        if (!transaction) {
            return NextResponse.json({ success: false, message: "Transaction not found or not pending" }, { status: 404 });
        }

        if (action === "approve") {
            // Update Transaction
            transaction.status = "success";
            await transaction.save();

            // Add funds to user
            await User.findByIdAndUpdate(transaction.userId, {
                $inc: { wallet: transaction.amount }
            });

        } else if (action === "reject") {
            transaction.status = "failed";
            await transaction.save();
        }

        return NextResponse.json({ success: true, message: `Successfully ${action}ed` });
    } catch (error) {
        console.error("VERIFY CRYPTO ERROR:", error);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
