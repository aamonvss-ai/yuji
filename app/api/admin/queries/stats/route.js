import { connectDB } from "@/lib/mongodb";
import SupportQuery from "@/models/SupportQuery";
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
        const result = await SupportQuery.aggregate([
            {
                $match: {
                    createdAt: { $gte: thirtyDaysAgo }
                }
            },
            {
                $group: {
                    _id: null,
                    total1d: { $sum: { $cond: [{ $gte: ["$createdAt", oneDayAgo] }, 1, 0] } },
                    active1d: { $sum: { $cond: [{ $and: [{ $gte: ["$createdAt", oneDayAgo] }, { $in: ["$status", ["open", "in_progress"]] }] }, 1, 0] } },
                    resolved1d: { $sum: { $cond: [{ $and: [{ $gte: ["$createdAt", oneDayAgo] }, { $eq: ["$status", "resolved"] }] }, 1, 0] } },

                    total7d: { $sum: { $cond: [{ $gte: ["$createdAt", sevenDaysAgo] }, 1, 0] } },
                    active7d: { $sum: { $cond: [{ $and: [{ $gte: ["$createdAt", sevenDaysAgo] }, { $in: ["$status", ["open", "in_progress"]] }] }, 1, 0] } },
                    resolved7d: { $sum: { $cond: [{ $and: [{ $gte: ["$createdAt", sevenDaysAgo] }, { $eq: ["$status", "resolved"] }] }, 1, 0] } },

                    total30d: { $sum: 1 },
                    active30d: { $sum: { $cond: [{ $in: ["$status", ["open", "in_progress"]] }, 1, 0] } },
                    resolved30d: { $sum: { $cond: [{ $eq: ["$status", "resolved"] }, 1, 0] } }
                }
            }
        ]);

        const stats = result[0] || {
            total1d: 0, active1d: 0, resolved1d: 0,
            total7d: 0, active7d: 0, resolved7d: 0,
            total30d: 0, active30d: 0, resolved30d: 0
        };

        return Response.json({
            success: true,
            stats: {
                "1d": { total: stats.total1d, active: stats.active1d, resolved: stats.resolved1d },
                "7d": { total: stats.total7d, active: stats.active7d, resolved: stats.resolved7d },
                "30d": { total: stats.total30d, active: stats.active30d, resolved: stats.resolved30d },
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
