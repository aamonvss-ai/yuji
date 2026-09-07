import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import PwaStat from "@/models/PwaStat";
import jwt from "jsonwebtoken";

const requireAdminOrOwner = (req) => {
  const auth = req.headers.get("authorization");
  if (!auth || !auth.startsWith("Bearer ")) {
    return { error: "Unauthorized", status: 401 };
  }

  try {
    const token = auth.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!["owner", "admin"].includes(decoded.userType)) {
      return { error: "Forbidden", status: 403 };
    }
    return { decoded };
  } catch {
    return { error: "Invalid token", status: 401 };
  }
};

export async function GET(req) {
  try {
    const authCheck = requireAdminOrOwner(req);
    if (authCheck.error) {
      return NextResponse.json({ success: false, message: authCheck.error }, { status: authCheck.status });
    }

    await connectDB();

    const [
      totalPrompts,
      totalInstallsAccepted,
      totalAppInstalled,
      totalDismissed,
      totalStandaloneSessions,
      platformCounts,
      browserCounts,
      recentLogs
    ] = await Promise.all([
      PwaStat.countDocuments({ eventType: "prompt_shown" }),
      PwaStat.countDocuments({ eventType: "install_accepted" }),
      PwaStat.countDocuments({ eventType: "app_installed" }),
      PwaStat.countDocuments({ eventType: "install_dismissed" }),
      PwaStat.countDocuments({ eventType: "standalone_session" }),
      PwaStat.aggregate([
        { $group: { _id: "$platform", count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      PwaStat.aggregate([
        { $group: { _id: "$browser", count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      PwaStat.find().sort({ createdAt: -1 }).limit(60).lean()
    ]);

    const totalInstalls = Math.max(totalInstallsAccepted, totalAppInstalled);
    const conversionRate = totalPrompts > 0 ? ((totalInstalls / totalPrompts) * 100).toFixed(1) : "0.0";

    return NextResponse.json({
      success: true,
      stats: {
        totalPrompts,
        totalInstalls,
        totalAppInstalled,
        totalDismissed,
        totalStandaloneSessions,
        conversionRate,
        platformCounts,
        browserCounts,
        recentLogs
      }
    });
  } catch (error) {
    console.error("GET PWA STATS ERROR:", error);
    return NextResponse.json({ success: false, message: "Failed to fetch PWA stats" }, { status: 500 });
  }
}
