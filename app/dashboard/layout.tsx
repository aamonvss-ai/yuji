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
    <section className="min-h-screen px-3 sm:px-6 md:px-10 py-4 sm:py-6 bg-transparent text-[var(--foreground)] selection:bg-[var(--accent)]/30">
      <div className="max-w-6xl mx-auto space-y-4 sm:space-y-5">
        
        {/* ================= COMPACT USER HEADER & INTEGRATED NAVIGATION ================= */}
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-4 sm:p-5 shadow-xs space-y-3.5">
          
          {/* TOP ROW: USER INFO */}
          <div className="flex items-center justify-between gap-3.5">
            
            {/* User Profile */}
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-[var(--accent)] to-blue-600 flex items-center justify-center text-white text-base sm:text-lg font-black shadow-xs shrink-0">
                {userDetails.name?.charAt(0).toUpperCase() || "P"}
              </div>

              <div className="space-y-0.5 min-w-0">
                <h2 className="text-sm sm:text-base font-bold text-[var(--foreground)] truncate">
                  {userDetails.name || "Player"}
                </h2>

                <div className="flex items-center gap-2 flex-wrap text-xs text-[var(--muted)]">
                  <span className="truncate text-[11px] sm:text-xs">{userDetails.email || userDetails.phone}</span>
                  {userDetails.userId && (
                    <>
                      <span>•</span>
                      <button
                        onClick={() => handleCopyId(userDetails.userId)}
                        className="inline-flex items-center gap-1 font-mono text-[10px] text-[var(--foreground)] bg-[var(--background)] px-1.5 py-0.5 rounded border border-[var(--border)] hover:bg-[var(--foreground)]/5 transition-colors"
                        title="Copy User ID"
                      >
                        <span>ID: {userDetails.userId}</span>
                        {copiedId ? <Check size={10} className="text-emerald-400" /> : <Copy size={10} className="text-[var(--muted)]" />}
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* BOTTOM ROW: INTEGRATED NAVIGATION TABS (4 TABS, NO SCROLL) */}
          <div className="pt-2.5 border-t border-[var(--border)]/60 grid grid-cols-4 sm:flex sm:flex-wrap sm:items-center gap-1.5 w-full">
            {navTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = tab.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(tab.href);

              return (
                <button
                  key={tab.key}
                  onClick={() => router.push(tab.href)}
                  className={`flex items-center justify-center gap-1.5 px-2 sm:px-3.5 py-2 rounded-xl text-xs font-bold transition-all text-center ${
                    isActive
                      ? "bg-[var(--accent)] text-black shadow-xs"
                      : "text-[var(--muted)] hover:text-[var(--foreground)] bg-[var(--background)]/40 hover:bg-[var(--background)] sm:bg-transparent"
                  }`}
                >
                  <Icon size={14} className="shrink-0" />
                  <span className="truncate">{tab.label}</span>
                </button>
              );
            })}
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
