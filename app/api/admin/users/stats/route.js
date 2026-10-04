import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { requireOwner } from "@/lib/auth";

export async function GET(req) {
    try {
        await connectDB();
        requireOwner(req);

        /* ================= DATES ================= */
        const now = new Date();
        const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

        /* ================= AGGREGATION ================= */
        const result = await User.aggregate([
            {
                $match: {
                    $or: [
                        { lastLoginAt: { $gte: thirtyDaysAgo } },
                        { createdAt: { $gte: thirtyDaysAgo } }
                    ]
                }
            },
            {
                $group: {
                    _id: null,
                    active1d: { $sum: { $cond: [{ $and: [{ $ifNull: ["$lastLoginAt", false] }, { $gte: ["$lastLoginAt", oneDayAgo] }] }, 1, 0] } },
                    active7d: { $sum: { $cond: [{ $and: [{ $ifNull: ["$lastLoginAt", false] }, { $gte: ["$lastLoginAt", sevenDaysAgo] }] }, 1, 0] } },
                    active30d: { $sum: { $cond: [{ $and: [{ $ifNull: ["$lastLoginAt", false] }, { $gte: ["$lastLoginAt", thirtyDaysAgo] }] }, 1, 0] } },
                    new1d: { $sum: { $cond: [{ $gte: ["$createdAt", oneDayAgo] }, 1, 0] } },
                    new7d: { $sum: { $cond: [{ $gte: ["$createdAt", sevenDaysAgo] }, 1, 0] } },
                    new30d: { $sum: { $cond: [{ $gte: ["$createdAt", thirtyDaysAgo] }, 1, 0] } }
                }
            }
        ]);

        const stats = result[0] || {
            active1d: 0, active7d: 0, active30d: 0,
            new1d: 0, new7d: 0, new30d: 0
        };

        return Response.json({
            success: true,
            stats: {
                active: {
                    "1d": stats.active1d,
                    "7d": stats.active7d,
                    "30d": stats.active30d,
                },
                new: {
                    "1d": stats.new1d,
                    "7d": stats.new7d,
                    "30d": stats.new30d,
                }
            }
        });
    } catch (err) {
        console.error(err);
        return Response.json(
            { success: false, message: err.message || "Server error" },
            { status: err.status || 500 }
        );
    }
}
