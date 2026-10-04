"use client";

import { useEffect, useState } from "react";
import {
  TrendingUp,
  ShoppingCart,
  Users,
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
  Gem,
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
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-3">
        
        {/* Total Orders */}
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-3 sm:p-3.5 flex flex-col justify-between shadow-xs hover:border-[var(--accent)]/30 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-wider font-bold text-[var(--muted)]">
              Orders
            </span>
            <div className="w-7 h-7 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center">
              <ShoppingCart size={14} />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-lg sm:text-xl font-black text-[var(--foreground)] tabular-nums">
              {orders.total?.toLocaleString() || 0}
            </div>
            <div className="flex items-center justify-between text-[10px] text-[var(--muted)] mt-0.5">
              <span className="text-emerald-500 font-semibold flex items-center gap-0.5">
                <CheckCircle2 size={11} /> {orders.success || 0} done
              </span>
              <span>{successRate}% rate</span>
            </div>
          </div>
        </div>

        {/* Total Revenue */}
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-3 sm:p-3.5 flex flex-col justify-between shadow-xs hover:border-[var(--accent)]/30 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-wider font-bold text-[var(--muted)]">
              Revenue
            </span>
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <DollarSign size={14} />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-lg sm:text-xl font-black text-emerald-400 tabular-nums">
              {formatPrice ? formatPrice(revenue.total || 0) : `₹${(revenue.total || 0).toLocaleString()}`}
            </div>
            <div className="text-[10px] text-[var(--muted)] mt-0.5 flex items-center justify-between">
              <span>Today: {formatPrice ? formatPrice(revenue.today || 0) : `₹${revenue.today || 0}`}</span>
            </div>
          </div>
        </div>

        {/* AOV (Average Order Value) */}
        <div className="bg-[var(--card)] border border-amber-500/20 bg-amber-500/[0.02] rounded-xl p-3 sm:p-3.5 flex flex-col justify-between shadow-xs hover:border-amber-500/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-wider font-bold text-amber-500 flex items-center gap-1">
              <Sparkles size={11} /> AOV
            </span>
            <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <TrendingUp size={14} />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-lg sm:text-xl font-black text-amber-400 tabular-nums">
              {formatPrice ? formatPrice(aov.current || 0) : `₹${aov.current || 0}`}
            </div>
            <div className="text-[10px] text-[var(--muted)] mt-0.5 flex items-center justify-between">
              <span>All-Time: {formatPrice ? formatPrice(aov.overall || 0) : `₹${aov.overall || 0}`}</span>
            </div>
          </div>
        </div>

        {/* Users */}
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-3 sm:p-3.5 flex flex-col justify-between shadow-xs hover:border-[var(--accent)]/30 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-wider font-bold text-[var(--muted)]">
              Users
            </span>
            <div className="w-7 h-7 rounded-lg bg-purple-500/10 text-purple-500 flex items-center justify-center">
              <Users size={14} />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-lg sm:text-xl font-black text-[var(--foreground)] tabular-nums">
              {users.total?.toLocaleString() || 0}
            </div>
            <div className="text-[10px] text-[var(--muted)] mt-0.5 flex items-center justify-between">
              <span className="text-purple-400 font-semibold">+{users.today || 0} today</span>
              <span>{users.uniqueBuyers || 0} buyers</span>
            </div>
          </div>
        </div>

        {/* Queries */}
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-3 sm:p-3.5 flex flex-col justify-between shadow-xs hover:border-[var(--accent)]/30 transition-all col-span-2 md:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-wider font-bold text-[var(--muted)]">
              Queries
            </span>
            <div className="w-7 h-7 rounded-lg bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
              <MessageSquare size={14} />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-lg sm:text-xl font-black text-[var(--foreground)] tabular-nums">
              {queries.total?.toLocaleString() || 0}
            </div>
            <div className="text-[10px] text-[var(--muted)] mt-0.5 flex items-center justify-between">
              <span className="text-amber-400 font-semibold">{queries.open || 0} open</span>
              <span className="text-emerald-400">{queries.resolved || 0} fixed</span>
            </div>
          </div>
        </div>

      </div>

      {/* ================= CUSTOMER RETENTION & LTV INTELLIGENCE ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        
        {/* 1. New vs. Returning Customers Ratio */}
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs sm:text-sm font-bold text-[var(--foreground)] flex items-center gap-1.5">
                <PieChart className="text-blue-400" size={15} />
                New vs. Returning Buyers
              </h3>
              <span className="text-[9px] font-bold text-[var(--muted)] bg-[var(--background)] px-1.5 py-0.5 rounded-md border border-[var(--border)]">
                {timeframe === "today" ? "24h Ratio" : `${timeframe} Ratio`}
              </span>
            </div>

            <p className="text-[11px] text-[var(--muted)] mb-3">
              Breakdown of first-time buyers versus repeat customers in this period.
            </p>

            {/* Visual Ratio Bar */}
            <div className="space-y-2">
              <div className="w-full bg-[var(--background)] rounded-lg h-2.5 flex overflow-hidden p-0.5 border border-[var(--border)]">
                <div
                  style={{ width: `${ratio.newPct || 50}%` }}
                  className="bg-blue-500 h-full rounded-l-md transition-all"
                  title={`New: ${ratio.newPct || 0}%`}
                />
                <div
                  style={{ width: `${ratio.returningPct || 50}%` }}
                  className="bg-emerald-500 h-full rounded-r-md transition-all"
                  title={`Returning: ${ratio.returningPct || 0}%`}
                />
              </div>

              {/* Legend & Stats */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <div className="bg-[var(--background)]/40 border border-blue-500/20 rounded-lg p-2.5">
                  <div className="flex items-center gap-1 text-[11px] text-blue-400 font-semibold mb-0.5">
                    <UserPlus size={12} />
                    <span>New Buyers</span>
                  </div>
                  <div className="text-base font-black text-[var(--foreground)]">
                    {ratio.newPct || 0}% <span className="text-[10px] font-normal text-[var(--muted)]">({ratio.newCount || 0})</span>
                  </div>
                  <div className="text-[10px] text-[var(--muted)] mt-0.5">
                    Rev: {formatPrice ? formatPrice(ratio.newRevenue || 0) : `₹${ratio.newRevenue || 0}`}
                  </div>
                </div>

                <div className="bg-[var(--background)]/40 border border-emerald-500/20 rounded-lg p-2.5">
                  <div className="flex items-center gap-1 text-[11px] text-emerald-400 font-semibold mb-0.5">
                    <Repeat size={12} />
                    <span>Returning</span>
                  </div>
                  <div className="text-base font-black text-[var(--foreground)]">
                    {ratio.returningPct || 0}% <span className="text-[10px] font-normal text-[var(--muted)]">({ratio.returningCount || 0})</span>
                  </div>
                  <div className="text-[10px] text-[var(--muted)] mt-0.5">
                    Rev: {formatPrice ? formatPrice(ratio.returningRevenue || 0) : `₹${ratio.returningRevenue || 0}`}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-3 pt-2 border-t border-[var(--border)]/60 text-[10px] text-[var(--muted)] flex items-center justify-between">
            <span>Total Active Buyers:</span>
            <span className="font-bold text-[var(--foreground)]">{ratio.activeBuyers || 0}</span>
          </div>
        </div>

        {/* 2. Repeat Purchase Rate */}
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs sm:text-sm font-bold text-[var(--foreground)] flex items-center gap-1.5">
                <Repeat className="text-[var(--accent)]" size={15} />
                Repeat Purchase Rate
              </h3>
              <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded-md border border-emerald-500/20">
                Retention
              </span>
            </div>

            <p className="text-[11px] text-[var(--muted)] mb-2.5">
              Percentage of total customers who placed 2 or more lifetime orders.
            </p>

            <div className="bg-[var(--background)]/40 border border-[var(--border)] rounded-xl p-3 flex items-center justify-between">
              <div>
                <div className="text-2xl font-black text-[var(--foreground)]">
                  {retention.repeatPurchaseRate || 0}%
                </div>
                <div className="text-[10px] text-[var(--muted)] mt-0.5">
                  {retention.repeatBuyersCount || 0} of {retention.totalUniqueBuyers || 0} buyers reordered
                </div>
              </div>
              <div className="text-right">
                <div className="text-base font-black text-amber-400">
                  {retention.averageOrdersPerCustomer || 1}x
                </div>
                <div className="text-[9px] text-[var(--muted)]">Avg Orders / Buyer</div>
              </div>
            </div>

            {/* Loyalty breakdown bars */}
            <div className="mt-2.5 space-y-1.5">
              <div className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider">
                Buyer Frequency Breakdown
              </div>
              {loyaltySegments.map((seg) => (
                <div key={seg.label} className="space-y-0.5">
                  <div className="flex justify-between text-[10px]">
                    <span className="text-[var(--foreground)] font-medium">{seg.label}</span>
                    <span className="text-[var(--muted)]">{seg.count} buyers ({seg.pct}%)</span>
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
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs sm:text-sm font-bold text-[var(--foreground)] flex items-center gap-1.5">
                <Gem className="text-purple-400" size={15} />
                Customer Lifetime Value (LTV)
              </h3>
              <span className="text-[9px] font-bold text-purple-400 bg-purple-500/10 px-1.5 py-0.5 rounded-md border border-purple-500/20">
                LTV Metrics
              </span>
            </div>

            <p className="text-[11px] text-[var(--muted)] mb-2.5">
              Average total revenue generated per paying user over their entire lifetime.
            </p>

            <div className="bg-gradient-to-br from-purple-500/10 via-transparent to-transparent border border-purple-500/20 rounded-xl p-3">
              <div className="text-[10px] uppercase tracking-wider text-[var(--muted)] font-bold">
                Average Customer LTV
              </div>
              <div className="text-2xl font-black text-purple-300 mt-0.5">
                {formatPrice ? formatPrice(ltv.averageLtv || 0) : `₹${ltv.averageLtv || 0}`}
              </div>
              <div className="text-[10px] text-[var(--muted)] mt-1">
                Across all {retention.totalUniqueBuyers || 0} unique paying customers.
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-2.5">
              <div className="bg-[var(--background)]/40 border border-[var(--border)] rounded-lg p-2.5">
                <div className="text-[9px] uppercase tracking-wider text-purple-400 font-bold">
                  VIP Cohort LTV
                </div>
                <div className="text-sm font-black text-[var(--foreground)] mt-0.5">
                  {formatPrice ? formatPrice(ltv.vipAvgLtv || 0) : `₹${ltv.vipAvgLtv || 0}`}
                </div>
                <div className="text-[9px] text-[var(--muted)] mt-0.5">
                  6+ Orders Champions
                </div>
              </div>

              <div className="bg-[var(--background)]/40 border border-[var(--border)] rounded-lg p-2.5">
                <div className="text-[9px] uppercase tracking-wider text-amber-400 font-bold">
                  Period AOV
                </div>
                <div className="text-sm font-black text-[var(--foreground)] mt-0.5">
                  {formatPrice ? formatPrice(ltv.periodAov || 0) : `₹${ltv.periodAov || 0}`}
                </div>
                <div className="text-[9px] text-[var(--muted)] mt-0.5">
                  Avg order basket size
                </div>
              </div>
            </div>
          </div>

          <div className="mt-3 pt-2 border-t border-[var(--border)]/60 text-[10px] text-[var(--muted)] flex items-center justify-between">
            <span>VIP Customer Base:</span>
            <span className="font-bold text-purple-400">{retention.vipBuyersCount || 0} loyal users</span>
          </div>
        </div>

      </div>

      {/* ================= PEAK TIME SECTION ================= */}
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div>
            <h3 className="text-base font-bold text-[var(--foreground)] flex items-center gap-2">
              <Clock className="text-[var(--accent)]" size={18} />
              Peak Time Orders & Traffic Heatmap
            </h3>
            <p className="text-xs text-[var(--muted)] mt-0.5">
              Hourly order frequency distribution (IST) to identify rush hours and customer peak activity.
            </p>
          </div>

          {peakTime.peakHour && peakTime.peakHour.ordersCount > 0 && (
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-bold shrink-0">
              <Flame size={14} className="text-orange-500 animate-pulse" />
              <span>
                Peak Rush: {peakTime.peakHour.label} ({peakTime.peakHour.ordersCount} orders)
              </span>
            </div>
          )}
        </div>

        {/* 24-Hour Distribution Bar Chart */}
        <div className="space-y-2">
          <div className="grid grid-cols-12 sm:grid-cols-24 gap-1 items-end h-36 pt-4 pb-2 px-1 border-b border-[var(--border)]/60">
            {peakTime.hourly?.map((h) => {
              const heightPct = maxHourlyOrders > 0 ? Math.max((h.ordersCount / maxHourlyOrders) * 100, 4) : 4;
              const isPeak = peakTime.peakHour && peakTime.peakHour.hour === h.hour && h.ordersCount > 0;

              return (
                <div key={h.hour} className="group relative flex flex-col items-center h-full justify-end">
                  {/* Tooltip */}
                  <div className="absolute bottom-full mb-2 hidden group-hover:flex flex-col items-center z-20 pointer-events-none">
                    <div className="bg-black/90 text-white text-[10px] rounded-lg px-2 py-1 shadow-lg whitespace-nowrap border border-white/10">
                      <div className="font-bold">{h.label}</div>
                      <div>{h.ordersCount} orders ({formatPrice ? formatPrice(h.revenue) : `₹${h.revenue}`})</div>
                    </div>
                    <div className="w-1.5 h-1.5 bg-black/90 rotate-45 -mt-0.5" />
                  </div>

                  {/* Bar */}
                  <div
                    style={{ height: `${heightPct}%` }}
                    className={`w-full rounded-t-md transition-all duration-300 ${
                      isPeak
                        ? "bg-gradient-to-t from-orange-600 to-amber-400 shadow-sm shadow-orange-500/50"
                        : h.ordersCount > 0
                        ? "bg-[var(--accent)] hover:brightness-110"
                        : "bg-[var(--muted)]/15 hover:bg-[var(--muted)]/30"
                    }`}
                  />
                  <span className="text-[9px] text-[var(--muted)] mt-1.5 group-hover:text-[var(--foreground)] hidden sm:block">
                    {h.hour % 4 === 0 ? `${h.hour}h` : ""}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Time axis labels */}
          <div className="flex justify-between text-[10px] text-[var(--muted)] px-1 pt-1 font-mono">
            <span>00:00 (Midnight)</span>
            <span>06:00 (Morning)</span>
            <span>12:00 (Noon)</span>
            <span>18:00 (Evening)</span>
            <span>23:00 (Night)</span>
          </div>
        </div>

        {/* Weekly Day of Week Breakdown */}
        <div className="mt-6 pt-5 border-t border-[var(--border)]/70">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)] mb-3">
            Weekly Breakdown (Day-Wise Performance)
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-7 gap-2">
            {peakTime.weekly?.map((d) => {
              const pct = maxWeeklyOrders > 0 ? Math.round((d.ordersCount / maxWeeklyOrders) * 100) : 0;
              return (
                <div key={d.day} className="bg-[var(--background)]/40 border border-[var(--border)] rounded-xl p-2.5 flex flex-col justify-between">
                  <div className="flex items-center justify-between text-xs font-bold text-[var(--foreground)]">
                    <span>{d.day}</span>
                    <span className="text-[10px] text-[var(--accent)] font-semibold">{d.ordersCount} orders</span>
                  </div>
                  <div className="mt-2 w-full bg-[var(--card)] rounded-full h-1.5 overflow-hidden">
                    <div
                      style={{ width: `${pct}%` }}
                      className="bg-[var(--accent)] h-full rounded-full transition-all"
                    />
                  </div>
                  <div className="text-[10px] text-[var(--muted)] mt-1.5">
                    {formatPrice ? formatPrice(d.revenue) : `₹${d.revenue}`}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ================= MOST SOLD & TOP BUYERS (2 COLUMN GRID) ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* 1. MOST SOLD ITEMS */}
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-[var(--foreground)] flex items-center gap-2">
                  <Flame className="text-amber-500" size={18} />
                  Most Sold Products (Top 10)
                </h3>
                <p className="text-xs text-[var(--muted)] mt-0.5">
                  Best performing game items ranked by total units sold and revenue.
                </p>
              </div>
              <span className="text-xs font-bold text-[var(--accent)] bg-[var(--accent)]/10 px-2.5 py-1 rounded-lg border border-[var(--accent)]/20">
                {mostSold.length} Items
              </span>
            </div>

            {mostSold.length === 0 ? (
              <div className="text-center py-10 text-xs text-[var(--muted)]">
                No sales records found for this timeframe.
              </div>
            ) : (
              <div className="space-y-2.5">
                {mostSold.map((item, idx) => {
                  const barWidth = maxSoldUnits > 0 ? Math.round((item.unitsSold / maxSoldUnits) * 100) : 0;
                  return (
                    <div
                      key={item.itemName + idx}
                      className="p-3 rounded-xl bg-[var(--background)]/40 border border-[var(--border)] hover:border-[var(--accent)]/40 transition-all flex flex-col gap-1.5"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-black shrink-0 ${
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

                        <div className="flex items-center gap-3 shrink-0 text-right">
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
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-[var(--foreground)] flex items-center gap-2">
                  <Award className="text-purple-400" size={18} />
                  Top Buyers (Highest Spend)
                </h3>
                <p className="text-xs text-[var(--muted)] mt-0.5">
                  Top customer accounts contributing the most revenue and volume.
                </p>
              </div>
              <span className="text-xs font-bold text-purple-400 bg-purple-500/10 px-2.5 py-1 rounded-lg border border-purple-500/20">
                VIP Customers
              </span>
            </div>

            {topBuyers.length === 0 ? (
              <div className="text-center py-10 text-xs text-[var(--muted)]">
                No customer orders found for this timeframe.
              </div>
            ) : (
              <div className="space-y-2.5">
                {topBuyers.map((buyer, idx) => (
                  <div
                    key={buyer.identifier + idx}
                    className="p-3 rounded-xl bg-[var(--background)]/40 border border-[var(--border)] hover:border-purple-500/40 transition-all flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-black shrink-0 ${
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
                        <div className="text-[10px] text-[var(--muted)] flex items-center gap-2">
                          <span>{buyer.totalOrders} orders</span>
                          <span>•</span>
                          <span>AOV: {formatPrice ? formatPrice(buyer.aov) : `₹${buyer.aov}`}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-xs font-black text-emerald-400">
                        {formatPrice ? formatPrice(buyer.totalSpent) : `₹${buyer.totalSpent}`}
                      </div>
                      <div className="text-[9px] text-[var(--muted)]">Total Spend</div>
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
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-[var(--foreground)] flex items-center gap-2">
              <Sparkles className="text-[var(--accent)]" size={16} />
              Recent Completed Orders Pulse
            </h3>
            <span className="text-[11px] text-[var(--muted)]">Latest 6 orders</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {data.recentActivity.map((ord) => (
              <div
                key={ord._id}
                className="p-3 rounded-xl bg-[var(--background)]/30 border border-[var(--border)]/70 flex items-center justify-between text-xs"
              >
                <div className="min-w-0">
                  <div className="font-bold text-[var(--foreground)] truncate">{ord.itemName || "Item"}</div>
                  <div className="text-[10px] text-[var(--muted)] truncate">
                    {ord.email || ord.phone || ord.orderId}
                  </div>
                </div>
                <div className="text-right shrink-0 ml-2">
                  <span className="font-extrabold text-emerald-400">
                    {formatPrice ? formatPrice(ord.price) : `₹${ord.price}`}
                  </span>
                  <div className="text-[9px] text-[var(--muted)]">
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
