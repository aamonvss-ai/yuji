"use client";

import { useEffect, useState } from "react";
import {
  TrendingUp,
  ShoppingCart,
  ShoppingBag,
  PackageCheck,
  CircleDollarSign,
  Users,
  Headphones,
  MessageSquare,
  DollarSign,
  Clock,
  Flame,
  Award,
  Calendar,
  RefreshCw,
  ArrowUpRight,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Package,
  Layers,
  BarChart3,
  UserCheck,
  UserPlus,
  Repeat,
  Repeat2,
  Gem,
  Crown,
  PieChart,
  ShieldCheck
} from "lucide-react";
import { useCurrency } from "@/components/CurrencyContext";

export default function AnalyticsTab() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [timeframe, setTimeframe] = useState("today"); // 'today' (24h) | '7d' | '30d' | 'all'
  const { formatPrice } = useCurrency();

  const fetchAnalytics = async (tf = timeframe) => {
    try {
      setRefreshing(true);
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/admin/analytics?timeframe=${tf}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const result = await res.json();
      if (result.success) {
        setData(result.data);
      }
    } catch (err) {
      console.error("Failed to load analytics", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAnalytics(timeframe);
  }, [timeframe]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <RefreshCw size={28} className="animate-spin text-[var(--accent)]" />
        <p className="text-sm text-[var(--muted)] font-medium">Computing Store Analytics...</p>
      </div>
    );
  }

  const overview = data?.overview || {};
  const orders = overview.orders || {};
  const revenue = overview.revenue || {};
  const aov = overview.aov || {};
  const users = overview.users || {};
  const queries = overview.queries || {};
  const retention = data?.retention || {};
  const ratio = retention?.ratio || {};
  const ltv = retention?.ltv || {};
  const loyaltySegments = retention?.loyaltySegments || [];
  const peakTime = data?.peakTime || { hourly: [], weekly: [], peakHour: null };
  const mostSold = data?.mostSold || [];
  const topBuyers = data?.topBuyers || [];

  const maxHourlyOrders = Math.max(...(peakTime.hourly?.map(h => h.ordersCount) || [1]), 1);
  const maxWeeklyOrders = Math.max(...(peakTime.weekly?.map(w => w.ordersCount) || [1]), 1);
  const maxSoldUnits = Math.max(...(mostSold.map(m => m.unitsSold) || [1]), 1);

  // Success rate
  const successRate = orders.total > 0 ? Math.round((orders.success / orders.total) * 100) : 0;

  return (
    <div className="space-y-4">
      {/* ================= HEADER CONTROLS ================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[var(--border)]">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold tracking-tight text-[var(--foreground)] flex items-center gap-2">
              <BarChart3 className="text-[var(--accent)]" size={18} />
              Store Analytics & Intelligence
            </h2>
            <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent)]/20 uppercase tracking-wider">
              Live
            </span>
          </div>
          <p className="text-[11px] text-[var(--muted)] mt-0.5">
            Real-time performance across orders, revenue, customer retention, peak traffic & AOV.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Timeframe Filters */}
          <div className="flex items-center bg-[var(--background)]/60 border border-[var(--border)] rounded-xl p-0.5 gap-0.5 shadow-xs">
            {[
              { id: "today", label: "24 Hours" },
              { id: "7d", label: "7 Days" },
              { id: "30d", label: "30 Days" },
              { id: "all", label: "All Time" },
            ].map((tf) => (
              <button
                key={tf.id}
                onClick={() => setTimeframe(tf.id)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                  timeframe === tf.id
                    ? "bg-[var(--accent)] text-black shadow-xs font-bold"
                    : "text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--card)]"
                }`}
              >
                {tf.label}
              </button>
            ))}
          </div>

          <button
            onClick={() => fetchAnalytics(timeframe)}
            disabled={refreshing}
            className="p-1.5 bg-[var(--card)] hover:bg-[var(--accent)]/10 text-[var(--muted)] hover:text-[var(--accent)] border border-[var(--border)] rounded-xl transition-colors shadow-xs disabled:opacity-50"
            title="Refresh Analytics"
          >
            <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* ================= TOP METRICS CARDS (5 KPI BLOCKS) ================= */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-2.5">
        
        {/* Total Orders */}
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-2.5 sm:p-3 flex flex-col justify-between shadow-xs hover:border-[var(--accent)]/30 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-wider font-bold text-[var(--muted)]">
              Orders
            </span>
            <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center">
              <PackageCheck size={13} />
            </div>
          </div>
          <div className="mt-1.5">
            <div className="text-base sm:text-lg font-black text-[var(--foreground)] tabular-nums leading-none">
              {orders.total?.toLocaleString() || 0}
            </div>
            <div className="flex items-center justify-between text-[10px] text-[var(--muted)] mt-1.5">
              <span className="text-emerald-500 font-semibold flex items-center gap-0.5">
                <CheckCircle2 size={10} /> {orders.success || 0}
              </span>
              <span>{successRate}% rate</span>
            </div>
          </div>
        </div>

        {/* Total Revenue */}
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-2.5 sm:p-3 flex flex-col justify-between shadow-xs hover:border-[var(--accent)]/30 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-wider font-bold text-[var(--muted)]">
              Revenue
            </span>
            <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <CircleDollarSign size={13} />
            </div>
          </div>
          <div className="mt-1.5">
            <div className="text-base sm:text-lg font-black text-emerald-400 tabular-nums leading-none">
              {formatPrice ? formatPrice(revenue.total || 0) : `₹${(revenue.total || 0).toLocaleString()}`}
            </div>
            <div className="text-[10px] text-[var(--muted)] mt-1.5 flex items-center justify-between">
              <span>Today: {formatPrice ? formatPrice(revenue.today || 0) : `₹${revenue.today || 0}`}</span>
            </div>
          </div>
        </div>

        {/* AOV (Average Order Value) */}
        <div className="bg-[var(--card)] border border-amber-500/20 bg-amber-500/[0.02] rounded-xl p-2.5 sm:p-3 flex flex-col justify-between shadow-xs hover:border-amber-500/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-wider font-bold text-amber-500">
              AOV
            </span>
            <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <TrendingUp size={13} />
            </div>
          </div>
          <div className="mt-1.5">
            <div className="text-base sm:text-lg font-black text-amber-400 tabular-nums leading-none">
              {formatPrice ? formatPrice(aov.current || 0) : `₹${aov.current || 0}`}
            </div>
            <div className="text-[10px] text-[var(--muted)] mt-1.5 flex items-center justify-between">
              <span>All: {formatPrice ? formatPrice(aov.overall || 0) : `₹${aov.overall || 0}`}</span>
            </div>
          </div>
        </div>

        {/* Users */}
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-2.5 sm:p-3 flex flex-col justify-between shadow-xs hover:border-[var(--accent)]/30 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-wider font-bold text-[var(--muted)]">
              Users
            </span>
            <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <UserCheck size={13} />
            </div>
          </div>
          <div className="mt-1.5">
            <div className="text-base sm:text-lg font-black text-[var(--foreground)] tabular-nums leading-none">
              {users.total?.toLocaleString() || 0}
            </div>
            <div className="text-[10px] text-[var(--muted)] mt-1.5 flex items-center justify-between">
              <span className="text-purple-400 font-semibold">+{users.today || 0}</span>
              <span>{users.uniqueBuyers || 0} buyers</span>
            </div>
          </div>
        </div>

        {/* Queries */}
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-2.5 sm:p-3 flex flex-col justify-between shadow-xs hover:border-[var(--accent)]/30 transition-all col-span-2 md:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-wider font-bold text-[var(--muted)]">
              Queries
            </span>
            <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
              <Headphones size={13} />
            </div>
          </div>
          <div className="mt-1.5">
            <div className="text-base sm:text-lg font-black text-[var(--foreground)] tabular-nums leading-none">
              {queries.total?.toLocaleString() || 0}
            </div>
            <div className="text-[10px] text-[var(--muted)] mt-1.5 flex items-center justify-between">
              <span className="text-amber-400 font-semibold">{queries.open || 0} open</span>
              <span className="text-emerald-400">{queries.resolved || 0} fixed</span>
            </div>
          </div>
        </div>

      </div>

      {/* ================= CUSTOMER RETENTION & LTV INTELLIGENCE ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-2.5 sm:gap-3">
        
        {/* 1. New vs. Returning Customers Ratio */}
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-3 sm:p-3.5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold text-[var(--foreground)] flex items-center gap-1.5">
                <UserPlus className="text-blue-400" size={13} />
                New vs Repeat
              </h3>
              <span className="text-[9px] font-bold text-[var(--muted)] bg-[var(--background)] px-1.5 py-0.5 rounded-md border border-[var(--border)]">
                {timeframe === "today" ? "24h" : timeframe}
              </span>
            </div>

            {/* Visual Ratio Bar */}
            <div className="space-y-2 mt-1">
              <div className="w-full bg-[var(--background)] rounded-full h-2 flex overflow-hidden border border-[var(--border)]">
                <div
                  style={{ width: `${ratio.newPct || 50}%` }}
                  className="bg-blue-500 h-full transition-all"
                  title={`New: ${ratio.newPct || 0}%`}
                />
                <div
                  style={{ width: `${ratio.returningPct || 50}%` }}
                  className="bg-emerald-500 h-full transition-all"
                  title={`Returning: ${ratio.returningPct || 0}%`}
                />
              </div>

              {/* Legend & Stats */}
              <div className="grid grid-cols-2 gap-2 pt-0.5">
                <div className="bg-[var(--background)]/40 border border-blue-500/20 rounded-lg p-2">
                  <div className="flex items-center gap-1 text-[10px] text-blue-400 font-semibold mb-0.5">
                    <span>New Buyers</span>
                  </div>
                  <div className="text-sm font-black text-[var(--foreground)] leading-tight">
                    {ratio.newPct || 0}% <span className="text-[10px] font-normal text-[var(--muted)]">({ratio.newCount || 0})</span>
                  </div>
                  <div className="text-[9px] text-[var(--muted)] mt-0.5 truncate">
                    {formatPrice ? formatPrice(ratio.newRevenue || 0) : `₹${ratio.newRevenue || 0}`}
                  </div>
                </div>

                <div className="bg-[var(--background)]/40 border border-emerald-500/20 rounded-lg p-2">
                  <div className="flex items-center gap-1 text-[10px] text-emerald-400 font-semibold mb-0.5">
                    <span>Returning</span>
                  </div>
                  <div className="text-sm font-black text-[var(--foreground)] leading-tight">
                    {ratio.returningPct || 0}% <span className="text-[10px] font-normal text-[var(--muted)]">({ratio.returningCount || 0})</span>
                  </div>
                  <div className="text-[9px] text-[var(--muted)] mt-0.5 truncate">
                    {formatPrice ? formatPrice(ratio.returningRevenue || 0) : `₹${ratio.returningRevenue || 0}`}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-2.5 pt-2 border-t border-[var(--border)]/60 text-[10px] text-[var(--muted)] flex items-center justify-between">
            <span>Active Buyers:</span>
            <span className="font-bold text-[var(--foreground)]">{ratio.activeBuyers || 0}</span>
          </div>
        </div>

        {/* 2. Repeat Purchase Rate */}
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-3 sm:p-3.5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold text-[var(--foreground)] flex items-center gap-1.5">
                <Repeat2 className="text-emerald-400" size={13} />
                Repeat Rate
              </h3>
              <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded-md border border-emerald-500/20">
                Retention
              </span>
            </div>

            <div className="bg-[var(--background)]/40 border border-[var(--border)] rounded-lg p-2.5 flex items-center justify-between">
              <div>
                <div className="text-lg sm:text-xl font-black text-[var(--foreground)] leading-tight">
                  {retention.repeatPurchaseRate || 0}%
                </div>
                <div className="text-[9px] text-[var(--muted)] mt-0.5">
                  {retention.repeatBuyersCount || 0}/{retention.totalUniqueBuyers || 0} buyers reordered
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-black text-amber-400 leading-tight">
                  {retention.averageOrdersPerCustomer || 1}x
                </div>
                <div className="text-[9px] text-[var(--muted)]">Orders / Buyer</div>
              </div>
            </div>

            {/* Loyalty breakdown bars */}
            <div className="mt-2 space-y-1">
              <div className="text-[9px] font-bold text-[var(--muted)] uppercase tracking-wider">
                Frequency Breakdown
              </div>
              {loyaltySegments.map((seg) => (
                <div key={seg.label} className="space-y-0.5">
                  <div className="flex justify-between text-[9px]">
                    <span className="text-[var(--foreground)] font-medium">{seg.label}</span>
                    <span className="text-[var(--muted)]">{seg.count} ({seg.pct}%)</span>
                  </div>
                  <div className="w-full bg-[var(--background)] rounded-full h-1 overflow-hidden">
                    <div style={{ width: `${seg.pct}%` }} className={`h-full ${seg.color} rounded-full transition-all`} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 3. Customer Lifetime Value (LTV) */}
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-3 sm:p-3.5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold text-[var(--foreground)] flex items-center gap-1.5">
                <Crown className="text-purple-400" size={13} />
                Customer LTV
              </h3>
              <span className="text-[9px] font-bold text-purple-400 bg-purple-500/10 px-1.5 py-0.5 rounded-md border border-purple-500/20">
                LTV
              </span>
            </div>

            <div className="bg-gradient-to-br from-purple-500/10 via-transparent to-transparent border border-purple-500/20 rounded-lg p-2.5">
              <div className="flex items-center justify-between">
                <div className="text-[9px] uppercase tracking-wider text-[var(--muted)] font-bold">
                  Avg Customer LTV
                </div>
                <div className="text-[9px] text-[var(--muted)]">
                  {retention.totalUniqueBuyers || 0} buyers
                </div>
              </div>
              <div className="text-lg sm:text-xl font-black text-purple-300 mt-0.5 leading-tight">
                {formatPrice ? formatPrice(ltv.averageLtv || 0) : `₹${ltv.averageLtv || 0}`}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-2">
              <div className="bg-[var(--background)]/40 border border-[var(--border)] rounded-lg p-2">
                <div className="text-[9px] uppercase tracking-wider text-purple-400 font-bold">
                  VIP LTV (6+)
                </div>
                <div className="text-xs sm:text-sm font-black text-[var(--foreground)] mt-0.5">
                  {formatPrice ? formatPrice(ltv.vipAvgLtv || 0) : `₹${ltv.vipAvgLtv || 0}`}
                </div>
                <div className="text-[9px] text-[var(--muted)]">
                  Champions
                </div>
              </div>

              <div className="bg-[var(--background)]/40 border border-[var(--border)] rounded-lg p-2">
                <div className="text-[9px] uppercase tracking-wider text-amber-400 font-bold">
                  Period AOV
                </div>
                <div className="text-xs sm:text-sm font-black text-[var(--foreground)] mt-0.5">
                  {formatPrice ? formatPrice(ltv.periodAov || 0) : `₹${ltv.periodAov || 0}`}
                </div>
                <div className="text-[9px] text-[var(--muted)]">
                  Avg basket
                </div>
              </div>
            </div>
          </div>

          <div className="mt-2.5 pt-2 border-t border-[var(--border)]/60 text-[10px] text-[var(--muted)] flex items-center justify-between">
            <span>VIP Base:</span>
            <span className="font-bold text-purple-400">{retention.vipBuyersCount || 0} users</span>
          </div>
        </div>

      </div>

      {/* ================= PEAK TIME SECTION ================= */}
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-3 sm:p-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <Clock className="text-[var(--accent)]" size={15} />
            <h3 className="text-xs sm:text-sm font-bold text-[var(--foreground)]">
              Peak Hours & Activity Heatmap
            </h3>
          </div>

          {peakTime.peakHour && peakTime.peakHour.ordersCount > 0 && (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-orange-500/10 border border-orange-500/20 text-orange-400 text-[11px] font-bold shrink-0 self-start sm:self-auto">
              <Flame size={13} className="text-orange-500 animate-pulse" />
              <span>
                Peak: {peakTime.peakHour.label} ({peakTime.peakHour.ordersCount} orders)
              </span>
            </div>
          )}
        </div>

        {/* 24-Hour Distribution Bar Chart */}
        <div className="space-y-1.5">
          <div className="grid grid-cols-12 sm:grid-cols-24 gap-1 items-end h-28 pt-2 pb-1.5 px-1 border-b border-[var(--border)]/60">
            {peakTime.hourly?.map((h) => {
              const heightPct = maxHourlyOrders > 0 ? Math.max((h.ordersCount / maxHourlyOrders) * 100, 4) : 4;
              const isPeak = peakTime.peakHour && peakTime.peakHour.hour === h.hour && h.ordersCount > 0;

              return (
                <div key={h.hour} className="group relative flex flex-col items-center h-full justify-end">
                  {/* Tooltip */}
                  <div className="absolute bottom-full mb-1.5 hidden group-hover:flex flex-col items-center z-20 pointer-events-none">
                    <div className="bg-black/95 text-white text-[10px] rounded-md px-2 py-0.5 shadow-md whitespace-nowrap border border-white/10">
                      <span className="font-bold">{h.label}</span>: {h.ordersCount} ord ({formatPrice ? formatPrice(h.revenue) : `₹${h.revenue}`})
                    </div>
                    <div className="w-1.5 h-1.5 bg-black/95 rotate-45 -mt-0.5" />
                  </div>

                  {/* Bar */}
                  <div
                    style={{ height: `${heightPct}%` }}
                    className={`w-full rounded-t-sm transition-all duration-200 ${
                      isPeak
                        ? "bg-gradient-to-t from-orange-600 to-amber-400 shadow-xs shadow-orange-500/40"
                        : h.ordersCount > 0
                        ? "bg-[var(--accent)] hover:brightness-110"
                        : "bg-[var(--muted)]/15 hover:bg-[var(--muted)]/30"
                    }`}
                  />
                  <span className="text-[8px] text-[var(--muted)] mt-1 group-hover:text-[var(--foreground)] hidden sm:block">
                    {h.hour % 4 === 0 ? `${h.hour}h` : ""}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Time axis labels */}
          <div className="flex justify-between text-[9px] text-[var(--muted)] px-1 font-mono">
            <span>00:00</span>
            <span>06:00</span>
            <span>12:00</span>
            <span>18:00</span>
            <span>23:00</span>
          </div>
        </div>

        {/* Weekly Day of Week Breakdown */}
        <div className="mt-3.5 pt-3 border-t border-[var(--border)]/70">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)]">
              Weekly Performance
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-7 gap-1.5 sm:gap-2">
            {peakTime.weekly?.map((d) => {
              const pct = maxWeeklyOrders > 0 ? Math.round((d.ordersCount / maxWeeklyOrders) * 100) : 0;
              return (
                <div key={d.day} className="bg-[var(--background)]/40 border border-[var(--border)] rounded-lg p-2 flex flex-col justify-between">
                  <div className="flex items-center justify-between text-[11px] font-bold text-[var(--foreground)]">
                    <span>{d.day}</span>
                    <span className="text-[10px] text-[var(--accent)] font-semibold">{d.ordersCount}</span>
                  </div>
                  <div className="my-1.5 w-full bg-[var(--card)] rounded-full h-1 overflow-hidden">
                    <div
                      style={{ width: `${pct}%` }}
                      className="bg-[var(--accent)] h-full rounded-full transition-all"
                    />
                  </div>
                  <div className="text-[9px] text-[var(--muted)]">
                    {formatPrice ? formatPrice(d.revenue) : `₹${d.revenue}`}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ================= MOST SOLD & TOP BUYERS (2 COLUMN GRID) ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-2.5 sm:gap-3">

        {/* 1. MOST SOLD ITEMS */}
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-3 sm:p-3.5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-1.5">
                <Flame className="text-amber-500" size={14} />
                <h3 className="text-xs sm:text-sm font-bold text-[var(--foreground)]">
                  Most Sold Products
                </h3>
              </div>
              <span className="text-[10px] font-bold text-[var(--accent)] bg-[var(--accent)]/10 px-2 py-0.5 rounded-md border border-[var(--accent)]/20">
                {mostSold.length} items
              </span>
            </div>

            {mostSold.length === 0 ? (
              <div className="text-center py-6 text-xs text-[var(--muted)]">
                No sales records found.
              </div>
            ) : (
              <div className="space-y-1.5">
                {mostSold.map((item, idx) => {
                  const barWidth = maxSoldUnits > 0 ? Math.round((item.unitsSold / maxSoldUnits) * 100) : 0;
                  return (
                    <div
                      key={item.itemName + idx}
                      className="p-2 rounded-lg bg-[var(--background)]/40 border border-[var(--border)] hover:border-[var(--accent)]/40 transition-all flex flex-col gap-1"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className={`w-4 h-4 rounded flex items-center justify-center text-[9px] font-black shrink-0 ${
                            idx === 0
                              ? "bg-amber-500 text-black shadow-xs shadow-amber-500/50"
                              : idx === 1
                              ? "bg-slate-300 text-black"
                              : idx === 2
                              ? "bg-amber-700 text-white"
                              : "bg-[var(--card)] text-[var(--muted)] border border-[var(--border)]"
                          }`}>
                            {idx + 1}
                          </span>
                          <span className="text-xs font-bold text-[var(--foreground)] truncate" title={item.itemName}>
                            {item.itemName}
                          </span>
                        </div>

                        <div className="flex items-center gap-2.5 shrink-0 text-right">
                          <span className="text-xs font-black text-[var(--foreground)]">
                            {item.unitsSold} sold
                          </span>
                          <span className="text-xs font-bold text-emerald-400">
                            {formatPrice ? formatPrice(item.totalRevenue) : `₹${item.totalRevenue}`}
                          </span>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="w-full bg-[var(--card)] rounded-full h-1 overflow-hidden">
                        <div
                          style={{ width: `${barWidth}%` }}
                          className={`h-full rounded-full transition-all ${
                            idx === 0 ? "bg-amber-500" : "bg-[var(--accent)]"
                          }`}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* 2. MOST BUY / TOP BUYERS */}
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-3 sm:p-3.5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-1.5">
                <Crown className="text-purple-400" size={14} />
                <h3 className="text-xs sm:text-sm font-bold text-[var(--foreground)]">
                  Top Buyers
                </h3>
              </div>
              <span className="text-[10px] font-bold text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-md border border-purple-500/20">
                VIP
              </span>
            </div>

            {topBuyers.length === 0 ? (
              <div className="text-center py-6 text-xs text-[var(--muted)]">
                No customer orders found.
              </div>
            ) : (
              <div className="space-y-1.5">
                {topBuyers.map((buyer, idx) => (
                  <div
                    key={buyer.identifier + idx}
                    className="p-2 rounded-lg bg-[var(--background)]/40 border border-[var(--border)] hover:border-purple-500/40 transition-all flex items-center justify-between gap-2.5"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className={`w-4 h-4 rounded flex items-center justify-center text-[9px] font-black shrink-0 ${
                        idx === 0
                          ? "bg-purple-500 text-white shadow-xs shadow-purple-500/50"
                          : idx === 1
                          ? "bg-purple-600/80 text-white"
                          : idx === 2
                          ? "bg-purple-700/60 text-white"
                          : "bg-[var(--card)] text-[var(--muted)] border border-[var(--border)]"
                      }`}>
                        {idx + 1}
                      </span>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-[var(--foreground)] truncate">
                          {buyer.email || buyer.phone || buyer.userId || "Anonymous Customer"}
                        </div>
                        <div className="text-[9px] text-[var(--muted)] flex items-center gap-1.5">
                          <span>{buyer.totalOrders} ord</span>
                          <span>•</span>
                          <span>AOV: {formatPrice ? formatPrice(buyer.aov) : `₹${buyer.aov}`}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-xs font-black text-emerald-400 leading-tight">
                        {formatPrice ? formatPrice(buyer.totalSpent) : `₹${buyer.totalSpent}`}
                      </div>
                      <div className="text-[8px] text-[var(--muted)]">Total Spend</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>

      {/* ================= RECENT ACTIVITY PULSE ================= */}
      {data?.recentActivity && data.recentActivity.length > 0 && (
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-3 sm:p-3.5 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <Sparkles className="text-[var(--accent)]" size={14} />
              <h3 className="text-xs sm:text-sm font-bold text-[var(--foreground)]">
                Recent Completed Orders
              </h3>
            </div>
            <span className="text-[10px] text-[var(--muted)]">Latest 6 orders</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {data.recentActivity.map((ord) => (
              <div
                key={ord._id}
                className="p-2 rounded-lg bg-[var(--background)]/30 border border-[var(--border)]/70 flex items-center justify-between text-xs"
              >
                <div className="min-w-0">
                  <div className="font-bold text-[var(--foreground)] truncate">{ord.itemName || "Item"}</div>
                  <div className="text-[9px] text-[var(--muted)] truncate">
                    {ord.email || ord.phone || ord.orderId}
                  </div>
                </div>
                <div className="text-right shrink-0 ml-2">
                  <span className="font-extrabold text-emerald-400">
                    {formatPrice ? formatPrice(ord.price) : `₹${ord.price}`}
                  </span>
                  <div className="text-[8px] text-[var(--muted)]">
                    {new Date(ord.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
