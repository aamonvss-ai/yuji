import { connectDB } from "@/lib/mongodb";
import Order from "@/models/Order";
import User from "@/models/User";
import jwt from "jsonwebtoken";

export async function POST(req) {
  try {
    await connectDB();

    /* ================= AUTH ================= */
    const authHeader = req.headers.get("authorization");

    if (!authHeader?.startsWith("Bearer ")) {
      return Response.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const token = authHeader.split(" ")[1];

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
      return Response.json(
        { success: false, message: "Invalid or expired token" },
        { status: 401 }
      );
    }

    /* ================= USER ================= */
    const user = await User.findById(decoded.userId).lean();

    if (!user || !user.email) {
      return Response.json(
        { success: false, message: "User email not found" },
        { status: 404 }
      );
    }

    /* ================= BODY PARAMS ================= */
    const body = await req.json().catch(() => ({}));

    const page = Math.max(1, Number(body.page) || 1);
    const limit = Math.max(1, Number(body.limit) || 10);
    const search = body.search?.trim();
    const status = body.status?.trim();

    const skip = (page - 1) * limit;

    /* ================= BASE FILTER ================= */
    const finalFilter = { email: user.email };

    /* ================= SEARCH FILTER ================= */
    if (search) {
      finalFilter.$or = [
        { orderId: { $regex: search, $options: "i" } },
        { gameSlug: { $regex: search, $options: "i" } },
        { itemName: { $regex: search, $options: "i" } },
      ];
    }

    /* ================= STATUS FILTER ================= */
    if (status) {
      // Some orders use topupStatus, some use status
      finalFilter.$or = [
        { status: { $regex: `^${status}$`, $options: "i" } },
        { topupStatus: { $regex: `^${status}$`, $options: "i" } }
      ];
    }

    // If both search and status are present, we need to handle $and
    if (search && status) {
      delete finalFilter.$or;
      finalFilter.$and = [
        {
          $or: [
            { orderId: { $regex: search, $options: "i" } },
            { gameSlug: { $regex: search, $options: "i" } },
            { itemName: { $regex: search, $options: "i" } },
          ]
        },
        {
          $or: [
            { status: { $regex: `^${status}$`, $options: "i" } },
            { topupStatus: { $regex: `^${status}$`, $options: "i" } }
          ]
        }
      ];
    }

    /* ================= FETCH ORDERS ================= */
    const [orders, totalCount] = await Promise.all([
      Order.find(finalFilter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Order.countDocuments(finalFilter),
    ]);

    return Response.json(
      {
        success: true,
        orders,
        page,
        limit,
        count: orders.length,
        totalCount,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Fetch Orders Error:", error);
    return Response.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
