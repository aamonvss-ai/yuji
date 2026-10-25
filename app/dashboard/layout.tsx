"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import AuthGuard from "../../components/AuthGuard";
import { DashboardProvider, useDashboard } from "../../components/Dashboard/DashboardContext";
import {
  LayoutDashboard,
  ShoppingBag,
  Wallet,
  MessageSquare,
  User,
  Copy,
  Check,
  Gamepad2,
  Plus
} from "lucide-react";
import { motion } from "framer-motion";
import { useCurrency } from "@/components/CurrencyContext";

function DashboardLayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { userDetails, walletBalance } = useDashboard();
  const { formatPrice } = useCurrency();
  const [copiedId, setCopiedId] = useState(false);

  const navTabs = [
    { key: "overview", label: "Overview", icon: LayoutDashboard, href: "/dashboard" },
    { key: "order", label: "Orders", icon: ShoppingBag, href: "/dashboard/order" },
    { key: "wallet", label: "Wallet", icon: Wallet, href: "/dashboard/wallet" },
    { key: "support", label: "Support", icon: MessageSquare, href: "/dashboard/support" },
  ];

  const handleCopyId = (id: string) => {
    if (!id) return;
    navigator.clipboard.writeText(id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  return (
    <section className="min-h-screen px-3 sm:px-6 md:px-10 py-3 sm:py-5 bg-transparent text-[var(--foreground)] selection:bg-[var(--accent)]/30">
      <div className="max-w-6xl mx-auto space-y-3 sm:space-y-4">
        
        {/* ================= COMPACT USER HEADER & INTEGRATED NAVIGATION ================= */}
        <div className="bg-[var(--card)]/90 backdrop-blur-xl border border-[var(--border)] rounded-xl p-3 sm:p-4 shadow-xs space-y-2.5">
          
          <div className="flex items-center justify-between gap-2.5">
            {/* User Profile */}
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-600 flex items-center justify-center text-white text-xs sm:text-sm font-bold shadow-xs shrink-0">
                {userDetails.name?.charAt(0).toUpperCase() || "P"}
              </div>

              <div className="space-y-0.5 min-w-0">
                <h2 className="text-xs sm:text-sm font-bold text-[var(--foreground)] tracking-tight truncate leading-tight">
                  {userDetails.name || "Player"}
                </h2>

                <div className="flex items-center gap-2 flex-wrap text-[11px] text-[var(--muted)] leading-tight">
                  <span className="truncate max-w-[170px] sm:max-w-none">
                    {userDetails.email || userDetails.phone}
                  </span>
                  {userDetails.userId && (
                    <button
                      onClick={() => handleCopyId(userDetails.userId)}
                      className="inline-flex items-center gap-1 text-[10px] font-mono px-1.5 py-0.5 rounded bg-[var(--background)] border border-[var(--border)] text-[var(--foreground)] hover:border-[var(--accent)]/40 hover:text-[var(--accent)] transition-all cursor-pointer active:scale-95"
                      title="Click to copy User ID"
                    >
                      <span>ID: {userDetails.userId}</span>
                      {copiedId ? (
                        <Check size={10} className="text-emerald-400" />
                      ) : (
                        <Copy size={10} className="opacity-50" />
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Wallet Glance (Desktop/Tablet) */}
            <div
              onClick={() => router.push("/dashboard/wallet")}
              className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-lg bg-[var(--background)]/60 border border-[var(--border)] hover:border-[var(--accent)]/40 transition-colors cursor-pointer shrink-0"
              title="View Wallet"
            >
              <div className="w-5 h-5 rounded-md bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                <Wallet size={11} />
              </div>
              <div className="text-right">
                <div className="text-[8px] uppercase tracking-wider font-semibold text-[var(--muted)] leading-none mb-0.5">Wallet</div>
                <div className="text-[11px] font-bold text-emerald-400 tabular-nums leading-none">
                  {formatPrice ? formatPrice(walletBalance || 0) : `₹${walletBalance || 0}`}
                </div>
              </div>
            </div>
          </div>

          {/* BOTTOM ROW: INTEGRATED NAVIGATION TABS (PREMIUM COMPACT SEGMENTED TRACK) */}
          <div className="pt-1.5 border-t border-[var(--border)]/50">
            <div className="flex items-center gap-0.5 p-0.5 rounded-lg bg-[var(--background)]/60 border border-[var(--border)]/60 overflow-x-auto no-scrollbar">
              {navTabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = tab.href === "/dashboard"
                  ? pathname === "/dashboard"
                  : pathname.startsWith(tab.href);

                return (
                  <button
                    key={tab.key}
                    onClick={() => router.push(tab.href)}
                    className={`flex-1 min-w-[70px] sm:min-w-0 flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-md text-[11px] sm:text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
                      isActive
                        ? "bg-[var(--card)] text-[var(--foreground)] font-semibold shadow-xs border border-[var(--border)]"
                        : "text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--card)]/40"
                    }`}
                  >
                    <Icon size={13} className={isActive ? "text-[var(--accent)] shrink-0" : "shrink-0 opacity-70"} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

        </div>

        {/* ================= MAIN CONTENT VIEW ================= */}
        <motion.div
          key={pathname}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="w-full"
        >
          {children}
        </motion.div>

      </div>
    </section>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <DashboardProvider>
        <DashboardLayoutContent>{children}</DashboardLayoutContent>
      </DashboardProvider>
    </AuthGuard>
  );
}
