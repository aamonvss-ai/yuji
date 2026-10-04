import { connectDB } from "@/lib/mongodb";
import Order from "@/models/Order";
import User from "@/models/User";
import SupportQuery from "@/models/SupportQuery";
import { requireOwner } from "@/lib/auth";

export async function GET(req) {
  try {
    await connectDB();
    requireOwner(req);

    const { searchParams } = new URL(req.url);
    const timeframe = searchParams.get("timeframe") || "today"; // 'today', '7d', '30d', 'all'

    /* ================= DATE RANGES ================= */
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    let dateFilter = {};
    let periodStartDate = null;
    if (timeframe === "today") {
      dateFilter = { createdAt: { $gte: startOfToday } };
      periodStartDate = startOfToday;
    } else if (timeframe === "7d") {
      dateFilter = { createdAt: { $gte: sevenDaysAgo } };
      periodStartDate = sevenDaysAgo;
    } else if (timeframe === "30d") {
      dateFilter = { createdAt: { $gte: thirtyDaysAgo } };
      periodStartDate = thirtyDaysAgo;
    }

    const matchSuccess = ["success", "SUCCESS"];

    /* ================= AGGREGATIONS ================= */
    const [
      orderStatsAll,
      orderStatsPeriod,
      usersStats,
      queriesStats,
      peakHoursData,
      peakDaysData,
      mostSoldData,
      topBuyersData,
      recentActivityData,
      customerCohortData
    ] = await Promise.all([
      // 1. Global order stats
      Order.aggregate([
        {
          $group: {
            _id: null,
            totalOrders: { $sum: 1 },
            successOrders: { $sum: { $cond: [{ $in: ["$status", matchSuccess] }, 1, 0] } },
            pendingOrders: { $sum: { $cond: [{ $in: ["$status", ["pending", "PENDING"]] }, 1, 0] } },
            failedOrders: { $sum: { $cond: [{ $in: ["$status", ["failed", "FAILED", "refund", "refunded", "REFUNDED"]] }, 1, 0] } },
            totalRevenue: { $sum: { $cond: [{ $in: ["$status", matchSuccess] }, "$price", 0] } },
            
            // Today
            todayOrders: { $sum: { $cond: [{ $gte: ["$createdAt", startOfToday] }, 1, 0] } },
            todaySuccessOrders: { $sum: { $cond: [{ $and: [{ $gte: ["$createdAt", startOfToday] }, { $in: ["$status", matchSuccess] }] }, 1, 0] } },
            todayRevenue: { $sum: { $cond: [{ $and: [{ $gte: ["$createdAt", startOfToday] }, { $in: ["$status", matchSuccess] }] }, "$price", 0] } },

            // 7 Days
            weekOrders: { $sum: { $cond: [{ $gte: ["$createdAt", sevenDaysAgo] }, 1, 0] } },
            weekSuccessOrders: { $sum: { $cond: [{ $and: [{ $gte: ["$createdAt", sevenDaysAgo] }, { $in: ["$status", matchSuccess] }] }, 1, 0] } },
            weekRevenue: { $sum: { $cond: [{ $and: [{ $gte: ["$createdAt", sevenDaysAgo] }, { $in: ["$status", matchSuccess] }] }, "$price", 0] } },

            // 30 Days
            monthOrders: { $sum: { $cond: [{ $gte: ["$createdAt", thirtyDaysAgo] }, 1, 0] } },
            monthSuccessOrders: { $sum: { $cond: [{ $and: [{ $gte: ["$createdAt", thirtyDaysAgo] }, { $in: ["$status", matchSuccess] }] }, 1, 0] } },
            monthRevenue: { $sum: { $cond: [{ $and: [{ $gte: ["$createdAt", thirtyDaysAgo] }, { $in: ["$status", matchSuccess] }] }, "$price", 0] } },
          }
        }
      ]),

      // Filtered order stats based on chosen timeframe
      Order.aggregate([
        { $match: dateFilter },
        {
          $group: {
            _id: null,
            totalOrders: { $sum: 1 },
            successOrders: { $sum: { $cond: [{ $in: ["$status", matchSuccess] }, 1, 0] } },
            pendingOrders: { $sum: { $cond: [{ $in: ["$status", ["pending", "PENDING"]] }, 1, 0] } },
            failedOrders: { $sum: { $cond: [{ $in: ["$status", ["failed", "FAILED", "refund", "refunded", "REFUNDED"]] }, 1, 0] } },
            totalRevenue: { $sum: { $cond: [{ $in: ["$status", matchSuccess] }, "$price", 0] } },
          }
        }
      ]),

      // 2. Users Stats
      User.aggregate([
        {
          $group: {
            _id: null,
            totalUsers: { $sum: 1 },
            todayUsers: { $sum: { $cond: [{ $gte: ["$createdAt", startOfToday] }, 1, 0] } },
            weekUsers: { $sum: { $cond: [{ $gte: ["$createdAt", sevenDaysAgo] }, 1, 0] } },
            monthUsers: { $sum: { $cond: [{ $gte: ["$createdAt", thirtyDaysAgo] }, 1, 0] } },
          }
        }
      ]),

      // 3. Support Queries Stats
      SupportQuery.aggregate([
        {
          $group: {
            _id: null,
            totalQueries: { $sum: 1 },
            openQueries: { $sum: { $cond: [{ $eq: ["$status", "open"] }, 1, 0] } },
            inProgressQueries: { $sum: { $cond: [{ $eq: ["$status", "in_progress"] }, 1, 0] } },
            resolvedQueries: { $sum: { $cond: [{ $in: ["$status", ["resolved", "closed"]] }, 1, 0] } },
            todayQueries: { $sum: { $cond: [{ $gte: ["$createdAt", startOfToday] }, 1, 0] } },
          }
        }
      ]),

      // 4. Peak Hours Heatmap / Distribution (Hourly 0-23 in IST timezone)
      Order.aggregate([
        { $match: { ...dateFilter, $or: [{ status: { $in: matchSuccess } }, { status: "pending" }, { status: "PENDING" }] } },
        {
          $project: {
            hour: { $hour: { date: "$createdAt", timezone: "+05:30" } },
            price: { $ifNull: ["$price", 0] },
            isSuccess: { $cond: [{ $in: ["$status", matchSuccess] }, 1, 0] }
          }
        },
        {
          $group: {
            _id: "$hour",
            ordersCount: { $sum: 1 },
            successCount: { $sum: "$isSuccess" },
            revenue: { $sum: { $cond: [{ $eq: ["$isSuccess", 1] }, "$price", 0] } }
          }
        },
        { $sort: { _id: 1 } }
      ]),

      // Peak Days of week (1=Sun, 2=Mon... 7=Sat)
      Order.aggregate([
        { $match: { ...dateFilter, $or: [{ status: { $in: matchSuccess } }, { status: "pending" }, { status: "PENDING" }] } },
        {
          $project: {
            dayOfWeek: { $dayOfWeek: { date: "$createdAt", timezone: "+05:30" } },
            price: { $ifNull: ["$price", 0] },
            isSuccess: { $cond: [{ $in: ["$status", matchSuccess] }, 1, 0] }
          }
        },
        {
          $group: {
            _id: "$dayOfWeek",
            ordersCount: { $sum: 1 },
            successCount: { $sum: "$isSuccess" },
            revenue: { $sum: { $cond: [{ $eq: ["$isSuccess", 1] }, "$price", 0] } }
          }
        },
        { $sort: { _id: 1 } }
      ]),

      // 5. Most Sold Items (Top Products)
      Order.aggregate([
        { $match: { ...dateFilter, status: { $in: matchSuccess }, itemName: { $exists: true, $ne: null } } },
        {
          $group: {
            _id: "$itemName",
            gameSlug: { $first: "$gameSlug" },
            itemSlug: { $first: "$itemSlug" },
            unitsSold: { $sum: 1 },
            totalRevenue: { $sum: "$price" },
            avgPrice: { $avg: "$price" }
          }
        },
        { $sort: { unitsSold: -1, totalRevenue: -1 } },
        { $limit: 10 }
      ]),

      // 6. Most Buy / Top Customers
      Order.aggregate([
        { $match: { ...dateFilter, status: { $in: matchSuccess } } },
        {
          $group: {
            _id: { $ifNull: ["$userId", { $ifNull: ["$email", "$phone"] }] },
            email: { $first: "$email" },
            phone: { $first: "$phone" },
            userId: { $first: "$userId" },
            totalOrders: { $sum: 1 },
            totalSpent: { $sum: "$price" },
            lastOrderDate: { $max: "$createdAt" }
          }
        },
        { $match: { _id: { $ne: null } } },
        { $sort: { totalSpent: -1, totalOrders: -1 } },
        { $limit: 10 }
      ]),

      // 7. Recent Sales Stream
      Order.find({ status: { $in: matchSuccess } })
        .sort({ createdAt: -1 })
        .limit(6)
        .select("orderId itemName price gameSlug createdAt email phone")
        .lean(),

      // 8. Customer Cohort & Retention Aggregation (All Time Buyers with Period Metrics)
      Order.aggregate([
        { $match: { status: { $in: matchSuccess } } },
        {
          $group: {
            _id: { $ifNull: ["$userId", { $ifNull: ["$email", "$phone"] }] },
            firstOrderDate: { $min: "$createdAt" },
            lastOrderDate: { $max: "$createdAt" },
            totalLifetimeOrders: { $sum: 1 },
            totalLifetimeSpent: { $sum: "$price" },
            periodOrders: {
              $sum: {
                $cond: [
                  periodStartDate ? { $gte: ["$createdAt", periodStartDate] } : true,
                  1,
                  0
                ]
              }
            },
            periodSpent: {
              $sum: {
                $cond: [
                  periodStartDate ? { $gte: ["$createdAt", periodStartDate] } : true,
                  "$price",
                  0
                ]
              }
            }
          }
        },
        { $match: { _id: { $ne: null } } }
      ])
    ]);

    const globalO = orderStatsAll[0] || {
      totalOrders: 0, successOrders: 0, pendingOrders: 0, failedOrders: 0, totalRevenue: 0,
      todayOrders: 0, todaySuccessOrders: 0, todayRevenue: 0,
      weekOrders: 0, weekSuccessOrders: 0, weekRevenue: 0,
      monthOrders: 0, monthSuccessOrders: 0, monthRevenue: 0,
    };

    const periodO = orderStatsPeriod[0] || {
      totalOrders: 0, successOrders: 0, pendingOrders: 0, failedOrders: 0, totalRevenue: 0
    };

    const u = usersStats[0] || { totalUsers: 0, todayUsers: 0, weekUsers: 0, monthUsers: 0 };
    const q = queriesStats[0] || { totalQueries: 0, openQueries: 0, inProgressQueries: 0, resolvedQueries: 0, todayQueries: 0 };

    /* ================= AOV CALCULATIONS ================= */
    const overallAov = globalO.successOrders > 0 ? Math.round((globalO.totalRevenue / globalO.successOrders) * 100) / 100 : 0;
    const todayAov = globalO.todaySuccessOrders > 0 ? Math.round((globalO.todayRevenue / globalO.todaySuccessOrders) * 100) / 100 : 0;
    const weekAov = globalO.weekSuccessOrders > 0 ? Math.round((globalO.weekRevenue / globalO.weekSuccessOrders) * 100) / 100 : 0;
    const monthAov = globalO.monthSuccessOrders > 0 ? Math.round((globalO.monthRevenue / globalO.monthSuccessOrders) * 100) / 100 : 0;
    const periodAov = periodO.successOrders > 0 ? Math.round((periodO.totalRevenue / periodO.successOrders) * 100) / 100 : 0;

    /* ================= 24-HOUR PEAK TIME MATRIX ================= */
    const hoursMap = {};
    for (let h = 0; h < 24; h++) {
      hoursMap[h] = { hour: h, label: `${h.toString().padStart(2, '0')}:00`, ordersCount: 0, successCount: 0, revenue: 0 };
    }
    peakHoursData.forEach(item => {
      if (hoursMap[item._id] !== undefined) {
        hoursMap[item._id] = {
          hour: item._id,
          label: `${item._id.toString().padStart(2, '0')}:00`,
          ordersCount: item.ordersCount,
          successCount: item.successCount,
          revenue: Math.round(item.revenue),
        };
      }
    });

    const hourlyStats = Object.values(hoursMap);
    const peakHourItem = [...hourlyStats].sort((a, b) => b.ordersCount - a.ordersCount)[0] || null;

    /* ================= 7-DAY WEEKLY MATRIX ================= */
    const daysNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const daysMap = {};
    daysNames.forEach((name, idx) => {
      daysMap[idx + 1] = { day: name, dayIndex: idx + 1, ordersCount: 0, successCount: 0, revenue: 0 };
    });
    peakDaysData.forEach(item => {
      if (daysMap[item._id]) {
        daysMap[item._id].ordersCount = item.ordersCount;
        daysMap[item._id].successCount = item.successCount;
        daysMap[item._id].revenue = Math.round(item.revenue);
      }
    });
    const weeklyStats = Object.values(daysMap);

    /* ================= RETENTION & LTV ANALYSIS ================= */
    const totalUniqueBuyers = customerCohortData.length;
    let oneTimeBuyersCount = 0;
    let repeatBuyersCount = 0;
    let vipBuyersCount = 0; // > 5 orders
    let vipTotalSpent = 0;
    let totalAllLtvSpent = 0;

    // Period specific New vs Returning
    let newCustomersCount = 0;
    let returningCustomersCount = 0;
    let newCustomersRevenue = 0;
    let returningCustomersRevenue = 0;
    let activePeriodBuyersCount = 0;

    customerCohortData.forEach(cust => {
      totalAllLtvSpent += cust.totalLifetimeSpent;

      if (cust.totalLifetimeOrders === 1) {
        oneTimeBuyersCount++;
      } else if (cust.totalLifetimeOrders >= 2 && cust.totalLifetimeOrders <= 5) {
        repeatBuyersCount++;
      } else if (cust.totalLifetimeOrders > 5) {
        vipBuyersCount++;
        vipTotalSpent += cust.totalLifetimeSpent;
      }

      // If active in current period
      if (cust.periodOrders > 0) {
        activePeriodBuyersCount++;
        const isNewInPeriod = periodStartDate ? cust.firstOrderDate >= periodStartDate : cust.totalLifetimeOrders === 1;

        if (isNewInPeriod) {
          newCustomersCount++;
          newCustomersRevenue += cust.periodSpent;
        } else {
          returningCustomersCount++;
          returningCustomersRevenue += cust.periodSpent;
        }
      }
    });

    const repeatBuyersTotal = repeatBuyersCount + vipBuyersCount;
    const repeatPurchaseRate = totalUniqueBuyers > 0 ? (repeatBuyersTotal / totalUniqueBuyers) * 100 : 0;
    const averageOrdersPerCustomer = totalUniqueBuyers > 0 ? globalO.successOrders / totalUniqueBuyers : 0;
    const averageLtv = totalUniqueBuyers > 0 ? totalAllLtvSpent / totalUniqueBuyers : 0;
    const vipAvgLtv = vipBuyersCount > 0 ? vipTotalSpent / vipBuyersCount : 0;

    const newCustPct = activePeriodBuyersCount > 0 ? (newCustomersCount / activePeriodBuyersCount) * 100 : (totalUniqueBuyers > 0 ? 100 : 0);
    const returningCustPct = activePeriodBuyersCount > 0 ? (returningCustomersCount / activePeriodBuyersCount) * 100 : 0;

    return Response.json({
      success: true,
      data: {
        timeframe,
        overview: {
          orders: {
            total: periodO.totalOrders,
            success: periodO.successOrders,
            pending: periodO.pendingOrders,
            failed: periodO.failedOrders,
            today: globalO.todayOrders,
            week: globalO.weekOrders,
            month: globalO.monthOrders,
            allTimeTotal: globalO.totalOrders,
          },
          revenue: {
            total: periodO.totalRevenue,
            today: globalO.todayRevenue,
            week: globalO.weekRevenue,
            month: globalO.monthRevenue,
            allTime: globalO.totalRevenue,
          },
          aov: {
            current: periodAov,
            overall: overallAov,
            today: todayAov,
            week: weekAov,
            month: monthAov,
          },
          users: {
            total: u.totalUsers,
            today: u.todayUsers,
            week: u.weekUsers,
            month: u.monthUsers,
            uniqueBuyers: totalUniqueBuyers,
          },
          queries: {
            total: q.totalQueries,
            open: q.openQueries,
            inProgress: q.inProgressQueries,
            resolved: q.resolvedQueries,
            today: q.todayQueries,
          }
        },
        retention: {
          totalUniqueBuyers,
          repeatBuyersCount: repeatBuyersTotal,
          oneTimeBuyersCount,
          regularRepeatCount: repeatBuyersCount,
          vipBuyersCount,
          repeatPurchaseRate: Math.round(repeatPurchaseRate * 10) / 10,
          averageOrdersPerCustomer: Math.round(averageOrdersPerCustomer * 10) / 10,
          ltv: {
            averageLtv: Math.round(averageLtv),
            vipAvgLtv: Math.round(vipAvgLtv),
            periodAov: Math.round(periodAov),
          },
          ratio: {
            activeBuyers: activePeriodBuyersCount,
            newCount: newCustomersCount,
            returningCount: returningCustomersCount,
            newPct: Math.round(newCustPct),
            returningPct: Math.round(returningCustPct),
            newRevenue: Math.round(newCustomersRevenue),
            returningRevenue: Math.round(returningCustomersRevenue),
          },
          loyaltySegments: [
            { label: "1 Order (One-Time)", count: oneTimeBuyersCount, pct: Math.round((oneTimeBuyersCount / (totalUniqueBuyers || 1)) * 100), color: "bg-blue-500" },
            { label: "2-5 Orders (Repeat)", count: repeatBuyersCount, pct: Math.round((repeatBuyersCount / (totalUniqueBuyers || 1)) * 100), color: "bg-emerald-500" },
            { label: "6+ Orders (VIP Champions)", count: vipBuyersCount, pct: Math.round((vipBuyersCount / (totalUniqueBuyers || 1)) * 100), color: "bg-purple-500" },
          ]
        },
        peakTime: {
          peakHour: peakHourItem,
          hourly: hourlyStats,
          weekly: weeklyStats,
        },
        mostSold: mostSoldData.map(item => ({
          itemName: item._id,
          gameSlug: item.gameSlug,
          itemSlug: item.itemSlug,
          unitsSold: item.unitsSold,
          totalRevenue: Math.round(item.totalRevenue),
          avgPrice: Math.round(item.avgPrice),
        })),
        topBuyers: topBuyersData.map(item => ({
          identifier: item._id,
          userId: item.userId,
          email: item.email,
          phone: item.phone,
          totalOrders: item.totalOrders,
          totalSpent: Math.round(item.totalSpent),
          aov: Math.round(item.totalSpent / (item.totalOrders || 1)),
          lastOrderDate: item.lastOrderDate,
        })),
        recentActivity: recentActivityData,
      }
    });

  } catch (error) {
    console.error("Analytics Error:", error);
    return Response.json(
      { success: false, message: error.message || "Failed to compute analytics" },
      { status: error.status || 500 }
    );
  }
}
