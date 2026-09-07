import { connectDB } from "@/lib/mongodb";
import Order from "@/models/Order";
import User from "@/models/User";
import SupportQuery from "@/models/SupportQuery";
import jwt from "jsonwebtoken";

export async function GET(req: Request) {
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
    let decoded: any;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET!);
    } catch {
      return Response.json(
        { success: false, message: "Invalid token" },
        { status: 401 }
      );
    }

    const user = await User.findById(decoded.userId).lean();
    if (!user) {
      return Response.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    const matchSuccess = ["success", "SUCCESS"];
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    // Build user match criteria
    const userMatch = {
      $or: [
        ...(user.userId ? [{ userId: user.userId }] : []),
        ...(user.email ? [{ email: user.email }] : []),
        ...(user.phone ? [{ phone: user.phone }] : []),
      ]
    };

    const [
      orderAgg,
      favoriteGameAgg,
      recentOrders,
      supportQueriesCount
    ] = await Promise.all([
      // 1. User orders & spend aggregation
      Order.aggregate([
        { $match: userMatch },
        {
          $group: {
            _id: null,
            totalOrders: { $sum: 1 },
            successOrders: { $sum: { $cond: [{ $in: ["$status", matchSuccess] }, 1, 0] } },
            pendingOrders: { $sum: { $cond: [{ $in: ["$status", ["pending", "PENDING"]] }, 1, 0] } },
            totalSpent: { $sum: { $cond: [{ $in: ["$status", matchSuccess] }, "$price", 0] } },
            monthOrders: { $sum: { $cond: [{ $gte: ["$createdAt", thirtyDaysAgo] }, 1, 0] } },
            monthSpent: { $sum: { $cond: [{ $and: [{ $gte: ["$createdAt", thirtyDaysAgo] }, { $in: ["$status", matchSuccess] }] }, "$price", 0] } },
          }
        }
      ]),

      // 2. Favorite Game / Most played
      Order.aggregate([
        { $match: { ...userMatch, status: { $in: matchSuccess }, gameSlug: { $exists: true, $ne: null } } },
        {
          $group: {
            _id: "$gameSlug",
            ordersCount: { $sum: 1 },
            totalSpent: { $sum: "$price" }
          }
        },
        { $sort: { ordersCount: -1, totalSpent: -1 } },
        { $limit: 1 }
      ]),

      // 3. Recent 4 Orders
      Order.find(userMatch)
        .sort({ createdAt: -1 })
        .limit(4)
        .select("orderId itemName gameSlug price status topupStatus createdAt")
        .lean(),

      // 4. Open queries count
      SupportQuery.countDocuments({
        $or: [
          ...(user.email ? [{ email: user.email }] : []),
          ...(user.phone ? [{ phone: user.phone }] : [])
        ],
        status: { $in: ["open", "in_progress"] }
      })
    ]);

    const stats = orderAgg[0] || {
      totalOrders: 0,
      successOrders: 0,
      pendingOrders: 0,
      totalSpent: 0,
      monthOrders: 0,
      monthSpent: 0,
    };

    const favoriteGame = favoriteGameAgg[0] ? {
      gameSlug: favoriteGameAgg[0]._id,
      ordersCount: favoriteGameAgg[0].ordersCount,
      totalSpent: Math.round(favoriteGameAgg[0].totalSpent),
    } : null;

    // Calculate VIP Level & Tier Progression
    const spent = stats.totalSpent || 0;
    let tier = { name: "Bronze Member", badge: "🥉", color: "from-amber-700 to-amber-900", nextTier: "Silver Gamer", target: 1000, progress: 0 };

    if (spent >= 10000) {
      tier = { name: "Diamond VIP", badge: "💎", color: "from-cyan-400 to-blue-600", nextTier: "Max Level", target: 10000, progress: 100 };
    } else if (spent >= 3000) {
      const pct = Math.min(100, Math.round(((spent - 3000) / (10000 - 3000)) * 100));
      tier = { name: "Gold Master", badge: "👑", color: "from-amber-400 to-yellow-600", nextTier: "Diamond VIP", target: 10000, progress: pct };
    } else if (spent >= 1000) {
      const pct = Math.min(100, Math.round(((spent - 1000) / (3000 - 1000)) * 100));
      tier = { name: "Silver Gamer", badge: "⭐", color: "from-slate-300 to-slate-500", nextTier: "Gold Master", target: 3000, progress: pct };
    } else {
      const pct = Math.min(100, Math.round((spent / 1000) * 100));
      tier = { name: "Bronze Gamer", badge: "🥉", color: "from-amber-600 to-amber-800", nextTier: "Silver Gamer", target: 1000, progress: pct };
    }

    return Response.json({
      success: true,
      data: {
        profile: {
          name: user.name || "Player",
          email: user.email,
          phone: user.phone,
          userId: user.userId,
          userType: user.userType || "user",
          wallet: user.wallet || 0,
          avatar: user.avatar,
          createdAt: user.createdAt,
        },
        analytics: {
          totalSpent: Math.round(stats.totalSpent),
          totalOrders: stats.totalOrders,
          successOrders: stats.successOrders,
          pendingOrders: stats.pendingOrders,
          monthOrders: stats.monthOrders,
          monthSpent: Math.round(stats.monthSpent),
          walletBalance: user.wallet || 0,
          openQueries: supportQueriesCount,
          favoriteGame,
          tier,
        },
        recentOrders,
      }
    });

  } catch (error) {
    console.error("User Analytics Error:", error);
    return Response.json(
      { success: false, message: "Failed to load user analytics" },
      { status: 500 }
    );
  }
}
