import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { connectDB } from "@/lib/mongodb";
import Order from "@/models/Order";
import User from "@/models/User";
import WalletTransaction from "@/models/WalletTransaction";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    await connectDB();

    /* =====================================================
       AUTH (JWT)
    ===================================================== */
    const authHeader = req.headers.get("authorization");

    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    let decoded: any;
    try {
      decoded = jwt.verify(
        authHeader.split(" ")[1],
        process.env.JWT_SECRET!
      );
    } catch {
      return NextResponse.json(
        { success: false, message: "Invalid token" },
        { status: 401 }
      );
    }

    const tokenUserId = decoded.userId;

    /* =====================================================
       REQUEST BODY
    ===================================================== */
    const { orderId } = await req.json();

    if (!orderId) {
      return NextResponse.json({
        success: false,
        message: "Missing orderId",
      });
    }

    /* =====================================================
       FETCH ORDER
    ===================================================== */
    const order = await Order.findOne({ orderId });

    if (!order) {
      return NextResponse.json({
        success: false,
        message: "Order not found",
      });
    }

    /* =====================================================
       🔒 OWNERSHIP CHECK (CRITICAL)
    ===================================================== */
    if (order.userId && order.userId !== tokenUserId) {
      return NextResponse.json(
        { success: false, message: "Forbidden" },
        { status: 403 }
      );
    }

    // Already fully completed → safe exit
    if (order.status === "success" && order.topupStatus === "success") {
      return NextResponse.json({
        success: true,
        message: "Order already completed",
        topupResponse: order.externalResponse,
      });
    }

    /* =====================================================
       EXPIRE CHECK
    ===================================================== */
    if (order.expiresAt && Date.now() > order.expiresAt.getTime() && order.paymentStatus !== "success") {
      order.status = "failed";
      order.paymentStatus = "failed";
      await order.save();

      return NextResponse.json({
        success: false,
        message: "Order expired",
      });
    }

    /* =====================================================
       CHECK GATEWAY STATUS (Skip for Wallet)
    ===================================================== */
    if (order.paymentMethod !== "wallet") {
      const formData = new URLSearchParams();
      formData.append("user_token", process.env.XTRA_USER_TOKEN!);
      formData.append("order_id", orderId);

      const resp = await fetch(
        "https://xyzpay.site/api/check-order-status",
        {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: formData.toString(),
        }
      );

      const data = await resp.json();
      const txnStatus = data?.result?.txnStatus;

      // ⏳ Pending
      if (txnStatus === "PENDING") {
        return NextResponse.json({
          success: false,
          message: "Payment pending, please wait",
        });
      }

      // ❌ Failed
      if (txnStatus !== "SUCCESS" && txnStatus !== "COMPLETED") {
        order.status = "failed";
        order.paymentStatus = "failed";
        order.gatewayResponse = data;
        await order.save();

        return NextResponse.json({
          success: false,
          message: "Payment failed",
        });
      }

      /* =====================================================
         STRICT PRICE CHECK
      ===================================================== */
      const paidAmount = Number(
        data?.result?.amount ||
        data?.result?.txnAmount ||
        data?.result?.orderAmount
      );

      if (!paidAmount || paidAmount !== Number(order.price)) {
        order.status = "fraud";
        order.paymentStatus = "failed";
        order.topupStatus = "failed";
        order.gatewayResponse = data;
        await order.save();

        return NextResponse.json({
          success: false,
          message: "Payment amount mismatch detected",
        });
      }

      /* =====================================================
         PAYMENT CONFIRMED
      ===================================================== */
      order.paymentStatus = "success";
      order.gatewayResponse = data;
      await order.save();
    } else {
      // For wallet, if we are here and paymentStatus is not success, something is wrong
      if (order.paymentStatus !== "success") {
        return NextResponse.json({
          success: false,
          message: "Wallet payment not confirmed",
        });
      }
    }

    /* =====================================================
       TOPUP (IDEMPOTENT)
    ===================================================== */
    if (order.topupStatus === "success") {
      return NextResponse.json({
        success: true,
        message: "Topup already completed",
        topupResponse: order.externalResponse,
      });
    }

    const gameResp = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE}/api-service/order`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": process.env.API_SECRET_KEY!,
        },
        body: JSON.stringify({
          playerId: String(order.playerId),
          zoneId: String(order.zoneId),
          productId: `${order.gameSlug}_${order.itemSlug}`,
          currency: "USD",
        }),
      }
    );

    const gameData = await gameResp.json();
    order.externalResponse = gameData;

    const topupSuccess =
      gameResp.ok &&
      (gameData?.success === true ||
        gameData?.status === true ||
        gameData?.result?.status === "SUCCESS");

    if (topupSuccess) {
      order.status = "success";
      order.topupStatus = "success";
      await order.save();

      // Optional email
      try {
        const user = await User.findOne({ userId: order.userId });
        // send mail if needed
      } catch { }
    } else {
      order.status = "failed";
      order.topupStatus = "failed";

      // --- AUTOMATIC REFUND FOR WALLET ---
      if (order.paymentMethod === "wallet" && order.paymentStatus === "success") {
        try {
          await User.findByIdAndUpdate(order.userId, {
            $inc: { wallet: order.price }
          });

          const refundTxnId = "REF" + crypto.randomBytes(6).toString("hex").toUpperCase();
          await WalletTransaction.create({
            transactionId: refundTxnId,
            userId: order.userId,
            amount: order.price,
            type: "refund",
            status: "success",
            description: `Auto-refund: Failed delivery for ${order.itemName}`,
            metadata: {
              gameOrderId: order.orderId,
            }
          });

          order.status = "refunded";
        } catch (refundErr) {
          console.error("CRITICAL: Wallet refund failed for order", order.orderId, refundErr);
        }
      }

      await order.save();
    }

    return NextResponse.json({
      success: order.status === "success",
      message:
        order.status === "success"
          ? "Topup successful"
          : "Topup failed",
      topupResponse: gameData,
    });
  } catch (error: any) {
    console.error("VERIFY ERROR:", error);

    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
