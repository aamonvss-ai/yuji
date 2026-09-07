"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Wallet,
  ShoppingBag,
  TrendingUp,
  Sparkles,
  Gamepad2,
  ChevronRight,
  Clock,
  RefreshCw
} from "lucide-react";
import { motion } from "framer-motion";
import { useCurrency } from "@/components/CurrencyContext";

export default function UserOverviewTab() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { formatPrice } = useCurrency();

  const fetchUserStats = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const res = await fetch("/api/user/analytics", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const json = await res.json();
      if (json.success) {
        setData(json.data);
      }
    } catch (err) {
      console.error("Failed to load user stats", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserStats();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] gap-3">
        <RefreshCw size={24} className="animate-spin text-[var(--accent)]" />
        <p className="text-xs text-[var(--muted)] font-medium">Loading Overview...</p>
      </div>
    );
  }

  const analytics = data?.analytics || {};
  const recentOrders = data?.recentOrders || [];

  return (
    <div className="space-y-4 sm:space-y-5">
      
      {/* ================= SLIGHT ANALYTICS STATS CARDS (COMPACT) ================= */}
      <div>
        <div className="flex items-center justify-between mb-2 px-1">
          <h3 className="text-[10.5px] font-bold uppercase tracking-wider text-[var(--muted)] flex items-center gap-1.5">
            <TrendingUp size={12} className="text-[var(--accent)]" />
            Account Analytics
          </h3>
          <span className="text-[10px] text-[var(--muted)]">Summary</span>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
          
          {/* 1. Wallet Balance */}
          <div
            onClick={() => router.push("/dashboard/wallet")}
            className="cursor-pointer group p-2.5 sm:p-3 rounded-xl bg-[var(--card)] border border-[var(--border)] hover:border-[var(--accent)]/40 transition-all flex flex-col justify-between shadow-xs"
          >
            <div className="flex items-center justify-between">
              <span className="text-[9.5px] sm:text-[10px] uppercase tracking-wider font-semibold text-[var(--muted)]">
                Wallet Balance
              </span>
              <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-md bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
                <Wallet size={12} />
              </div>
            </div>
            <div className="mt-1.5">
              <div className="text-base sm:text-lg font-black text-emerald-400 tabular-nums leading-tight">
                {formatPrice ? formatPrice(analytics.walletBalance || 0) : `₹${analytics.walletBalance || 0}`}
              </div>
              <div className="text-[9px] sm:text-[9.5px] text-[var(--muted)] group-hover:text-[var(--accent)] mt-0.5 flex items-center gap-0.5 transition-colors">
                <span>Deposit</span>
                <ChevronRight size={10} />
              </div>
            </div>
          </div>

          {/* 2. Total Lifetime Spent */}
          <div className="p-2.5 sm:p-3 rounded-xl bg-[var(--card)] border border-[var(--border)] flex flex-col justify-between shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[9.5px] sm:text-[10px] uppercase tracking-wider font-semibold text-[var(--muted)]">
                Total Spent
              </span>
              <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-md bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
                <Sparkles size={12} />
              </div>
            </div>
            <div className="mt-1.5">
              <div className="text-base sm:text-lg font-black text-amber-400 tabular-nums leading-tight">
                {formatPrice ? formatPrice(analytics.totalSpent || 0) : `₹${analytics.totalSpent || 0}`}
              </div>
              <div className="text-[9px] sm:text-[9.5px] text-[var(--muted)] mt-0.5 truncate">
                30d: {formatPrice ? formatPrice(analytics.monthSpent || 0) : `₹${analytics.monthSpent || 0}`}
              </div>
            </div>
          </div>

          {/* 3. Completed Orders */}
          <div
            onClick={() => router.push("/dashboard/order")}
            className="cursor-pointer group p-2.5 sm:p-3 rounded-xl bg-[var(--card)] border border-[var(--border)] hover:border-[var(--accent)]/40 transition-all flex flex-col justify-between shadow-xs"
          >
            <div className="flex items-center justify-between">
              <span className="text-[9.5px] sm:text-[10px] uppercase tracking-wider font-semibold text-[var(--muted)]">
                Completed
              </span>
              <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-md bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0">
                <ShoppingBag size={12} />
              </div>
            </div>
            <div className="mt-1.5">
              <div className="text-base sm:text-lg font-black text-[var(--foreground)] tabular-nums leading-tight">
                {analytics.successOrders || 0}
              </div>
              <div className="text-[9px] sm:text-[9.5px] text-[var(--muted)] group-hover:text-[var(--accent)] mt-0.5 flex items-center gap-0.5 transition-colors">
                <span>{analytics.totalOrders || 0} placed</span>
                <ChevronRight size={10} />
              </div>
            </div>
          </div>

          {/* 4. Favorite Game */}
          <div className="p-2.5 sm:p-3 rounded-xl bg-[var(--card)] border border-[var(--border)] flex flex-col justify-between shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[9.5px] sm:text-[10px] uppercase tracking-wider font-semibold text-[var(--muted)]">
                Top Game
              </span>
              <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-md bg-purple-500/10 text-purple-400 flex items-center justify-center shrink-0">
                <Gamepad2 size={12} />
              </div>
            </div>
            <div className="mt-1.5">
              <div className="text-xs sm:text-sm font-black text-[var(--foreground)] truncate leading-tight">
                {analytics.favoriteGame?.gameSlug
                  ? analytics.favoriteGame.gameSlug.charAt(0).toUpperCase() + analytics.favoriteGame.gameSlug.slice(1).replace('-', ' ')
                  : "Explore"}
              </div>
              <div className="text-[9px] sm:text-[9.5px] text-[var(--muted)] mt-0.5 truncate">
                {analytics.favoriteGame?.ordersCount
                  ? `${analytics.favoriteGame.ordersCount} delivered`
                  : "Start top-up"}
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ================= RECENT ORDERS PULSE (LIVE STREAM) ================= */}
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-4 sm:p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-[var(--foreground)] flex items-center gap-1.5">
              <Clock size={15} className="text-[var(--accent)]" />
              Recent Orders
            </h3>
            <p className="text-[11px] text-[var(--muted)]">Latest top-up delivery statuses</p>
          </div>

          <button
            onClick={() => router.push("/dashboard/order")}
            className="text-xs font-bold text-[var(--accent)] hover:underline flex items-center gap-1"
          >
            <span>View All</span>
            <ChevronRight size={14} />
          </button>
        </div>

        {recentOrders.length === 0 ? (
          <div className="text-center py-8 bg-[var(--background)]/40 rounded-xl border border-[var(--border)]/60">
            <ShoppingBag size={28} className="mx-auto text-[var(--muted)] mb-2 opacity-50" />
            <p className="text-xs font-semibold text-[var(--foreground)]">No orders yet</p>
            <p className="text-[11px] text-[var(--muted)] mt-0.5">Top up your favorite game to get instant delivery!</p>
            <button
              onClick={() => router.push("/games")}
              className="mt-3 px-3.5 py-1.5 bg-[var(--accent)] text-black font-bold text-xs rounded-xl shadow-xs hover:brightness-110"
            >
              Browse Games
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {recentOrders.map((ord: any) => {
              const isSuccess = ord.status === "success" || ord.status === "SUCCESS" || ord.topupStatus === "success";
              const isPending = ord.status === "pending" || ord.status === "PENDING";
              return (
                <div
                  key={ord.orderId}
                  className="p-3 rounded-xl bg-[var(--background)]/40 border border-[var(--border)]/70 hover:border-[var(--accent)]/40 transition-all flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-[var(--card)] border border-[var(--border)] flex items-center justify-center shrink-0">
                      <Gamepad2 size={16} className="text-[var(--accent)]" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-[var(--foreground)] truncate">
                        {ord.itemName || ord.gameSlug || "Game Top-Up"}
                      </div>
                      <div className="text-[10px] text-[var(--muted)] font-mono">
                        #{ord.orderId} • {new Date(ord.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <div className="font-black text-[var(--foreground)]">
                        {formatPrice ? formatPrice(ord.price) : `₹${ord.price}`}
                      </div>
                      <span className={`inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.2 rounded ${
                        isSuccess
                          ? "bg-emerald-500/10 text-emerald-400"
                          : isPending
                          ? "bg-amber-500/10 text-amber-400"
                          : "bg-red-500/10 text-red-400"
                      }`}>
                        {isSuccess ? "Delivered" : isPending ? "Pending" : "Failed"}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
