import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import WalletTransaction from "@/models/WalletTransaction";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    await connectDB();

    const { orderId, userId } = await req.json();

    if (!orderId || !userId) {
      return NextResponse.json(
        { success: false, message: "Missing orderId or userId" },
        { status: 400 }
      );
    }

    // 1. Check if this order was already processed to prevent double-crediting
    const existingTx = await WalletTransaction.findOne({
      "metadata.gatewayOrderId": orderId,
      status: "success",
    });

    if (existingTx) {
      return NextResponse.json({
        success: true,
        message: "Payment already processed",
        amount: existingTx.amount,
      });
    }

    const formData = new URLSearchParams();
    formData.append("user_token", process.env.XTRA_USER_TOKEN!);
    formData.append("order_id", orderId);

    const resp = await fetch("https://chuimei-pe.in/api/check-order-status", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: formData.toString(),
    });

    const data = await resp.json();
    console.log("Gateway Response:", data);

    const gatewaySuccess =
      data?.status == true ||
      data?.result?.txnStatus == "COMPLETED" ||
      data?.result?.txnStatus == "SUCCESS";

    if (!gatewaySuccess) {
      return NextResponse.json({
        success: false,
        message: "Payment Pending or Failed",
      });
    }

    const amount = Number(data?.result?.amount || 0);

    if (!amount) {
      return NextResponse.json({
        success: false,
        message: "Invalid amount",
      });
    }

    // 2. Start Wallet Update
    const user = await User.findOne({ userId });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    // 3. Create a success transaction record
    const transactionId = "TXN" + crypto.randomBytes(6).toString("hex").toUpperCase();

    await WalletTransaction.create({
      transactionId,
      userId,
      amount,
      type: "topup",
      status: "success",
      description: `Wallet top-up via UPI`,
      metadata: {
        gatewayOrderId: orderId,
        paymentMethod: "upi",
      },
    });

    // 4. ATOMIC BALANCE UPDATE
    await User.findOneAndUpdate(
      { userId },
      { 
        $inc: { 
          wallet: amount,
          order: 1 
        } 
      }
    );

    return NextResponse.json({
      success: true,
      message: "Payment Successful",
      amount,
      newWallet: user.wallet,
    });
  } catch (error) {
    console.error("Check-status error:", error);
    return NextResponse.json(
      { success: false, message: "Server Error" },
      { status: 500 }
    );
  }
}

