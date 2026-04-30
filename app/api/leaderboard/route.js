import { connectDB } from "@/lib/mongodb";
import Order from "@/models/Order";
import jwt from "jsonwebtoken";
import { unstable_cache } from 'next/cache';

/* ================= AUTH (ANY USER) ================= */
function verifyUser(req) {
  const auth = req.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) {
    throw { status: 401, message: "Unauthorized" };
  }

  const token = auth.split(" ")[1];
  return jwt.verify(token, process.env.JWT_SECRET);
}

/* ================= DATE HELPERS ================= */
function getDateFilter(range) {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();

  if (range === "monthly") {
    // Current month start
    const monthStart = new Date(year, month, 1);
    return { $gte: monthStart };
  }

  if (range === "prevMonth") {
    // Previous month start and end
    const prevMonthStart = new Date(year, month - 1, 1);
    const prevMonthEnd = new Date(year, month, 0, 23, 59, 59, 999);
    return { $gte: prevMonthStart, $lte: prevMonthEnd };
  }

  return null; // all-time
}

/* ================= LEADERBOARD ================= */
export async function GET(req) {
  try {
    await connectDB();
    verifyUser(req);

    const { searchParams } = new URL(req.url);

    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 10;
    const range = searchParams.get("range") || "all";

    const skip = (page - 1) * limit;

    /* ---------- MATCH CONDITIONS ---------- */
    const match = {
      paymentStatus: "success",
      topupStatus: "success",
    };

    const dateFilter = getDateFilter(range);
    if (dateFilter) {
      match.createdAt = dateFilter;
    }

    /* ---------- FETCH DATA (CACHED) ---------- */
    const getCachedLeaderboard = unstable_cache(
      async (matchObj, skipVal, limitVal) => {
        return await Order.aggregate([
          { $match: matchObj },
          {
            $group: {
              _id: { email: "$email", phone: "$phone" },
              totalSpent: { $sum: "$price" },
              totalOrders: { $sum: 1 },
              lastOrderAt: { $max: "$createdAt" },
            },
          },
          {
            $lookup: {
              from: "users",
              let: { email: "$_id.email", phone: "$_id.phone" },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $or: [
                        { $eq: ["$email", "$$email"] },
                        { $eq: ["$phone", "$$phone"] },
                      ],
                    },
                  },
                },
                { $project: { _id: 0, userId: 1, name: 1, email: 1, phone: 1 } },
              ],
              as: "user",
            },
          },
          { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
          { $sort: { totalSpent: -1 } },
          {
            $facet: {
              data: [
                { $skip: skipVal },
                { $limit: limitVal },
              ],
              totalCount: [{ $count: "count" }],
            },
          },
        ]);
      },
      [`leaderboard-${range}-${page}-${limit}`],
      { revalidate: 300, tags: ['leaderboard'] }
    );

    const leaderboard = await getCachedLeaderboard(match, skip, limit);

    const data = leaderboard[0]?.data || [];
    const total = leaderboard[0]?.totalCount[0]?.count || 0;

    return Response.json({
      success: true,
      range,
      data,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    return Response.json(
      { success: false, message: err.message || "Server error" },
      { status: err.status || 500 }
    );
  }
}
