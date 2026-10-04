import { connectDB } from "@/lib/mongodb";
import WalletTransaction from "@/models/WalletTransaction";
import { requireOwner } from "@/lib/auth";

export async function GET(req) {
  try {
    await connectDB();
    requireOwner(req);

    /* ================= QUERY ================= */
    const { searchParams } = new URL(req.url);
    const page = Math.max(parseInt(searchParams.get("page") || "1"), 1);
    const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 100);
    const skip = (page - 1) * limit;

    const [transactions, total] = await Promise.all([
      WalletTransaction.find({})
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      WalletTransaction.countDocuments({}),
    ]);

    return Response.json({
      success: true,
      data: transactions,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error(err);
    return Response.json(
      { success: false, message: err.message || "Server error" },
      { status: err.status || 500 }
    );
  }
}
