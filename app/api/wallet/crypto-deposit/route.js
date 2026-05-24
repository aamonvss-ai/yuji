import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { connectDB } from "@/lib/mongodb";
import WalletTransaction from "@/models/WalletTransaction";
import crypto from "crypto";

export async function POST(req) {
    try {
        await connectDB();

        const authHeader = req.headers.get("authorization");
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }

        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.userId;

        const body = await req.json();
        const { usdtAmount, coinsAmount } = body;

        if (!usdtAmount || !coinsAmount) {
            return NextResponse.json({ success: false, message: "Missing required fields" }, { status: 400 });
        }

        const transactionId = "CRYPTO_" + crypto.randomBytes(6).toString("hex").toUpperCase();

        const newTx = await WalletTransaction.create({
            transactionId,
            userId,
            amount: coinsAmount,
            type: "topup",
            status: "pending", 
            description: `Crypto Deposit: ${usdtAmount} USDT`,
            metadata: {
                paymentMethod: "crypto",
                usdtAmount,
                txHash: null,
                network: "BEP20"
            }
        });

        return NextResponse.json({ success: true, transaction: newTx });
    } catch (error) {
        console.error("CRYPTO DEPOSIT ERROR:", error);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}

export async function PATCH(req) {
    try {
        await connectDB();

        const authHeader = req.headers.get("authorization");
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }

        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.userId;

        const body = await req.json();
        const { transactionId, txHash } = body;

        if (!transactionId || !txHash) {
            return NextResponse.json({ success: false, message: "Missing transaction ID or TX Hash" }, { status: 400 });
        }

        const transaction = await WalletTransaction.findOne({ transactionId, userId, status: "pending" });
        if (!transaction) {
            return NextResponse.json({ success: false, message: "Transaction not found" }, { status: 404 });
        }

        // To update metadata which is a Mixed type, we need to assign it and mark modified or use Object.assign
        const newMetadata = { ...transaction.metadata, txHash };
        transaction.metadata = newMetadata;
        transaction.markModified("metadata");
        await transaction.save();

        return NextResponse.json({ success: true, transaction });
    } catch (error) {
        console.error("CRYPTO SUBMIT HASH ERROR:", error);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
