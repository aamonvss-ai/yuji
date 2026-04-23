"use client";

import { usePathname, useRouter } from "next/navigation";
import AuthGuard from "../../components/AuthGuard";
import DashboardCard from "../../components/Dashboard/DashboardCard";
import { DashboardProvider, useDashboard } from "../../components/Dashboard/DashboardContext";
import { FiLogOut } from "react-icons/fi";
import { User, ShieldCheck, Wallet, ChevronRight, LayoutDashboard, Settings, LogOut } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

function DashboardLayoutContent({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const { userDetails, walletBalance } = useDashboard();

    // Map pathname to activeTab
    let activeTab = "order";
    if (pathname.includes("/dashboard/support")) activeTab = "support";
    else if (pathname.includes("/dashboard/wallet")) activeTab = "wallet";
    else if (pathname.includes("/dashboard/account")) activeTab = "account";
    else if (pathname.includes("/dashboard/order")) activeTab = "order";

    const tabCards = [
        { key: "order", label: "Orders", label_alt: "Order History", value: "Archive", href: "/dashboard/order" },
        { key: "wallet", label: "Wallet", label_alt: "Balance", value: `₹${walletBalance}`, href: "/dashboard/wallet" },
        { key: "support", label: "Support", label_alt: "Assistance", value: "Help ", href: "/dashboard/support" },
        { key: "account", label: "Account", label_alt: "Profile", value: "Settings", href: "/dashboard/account" },
    ];

    const handleLogout = () => {
        localStorage.clear();
        router.push("/login");
    };

    return (
        <section className="min-h-screen px-4 md:px-10 py-8 bg-transparent text-[var(--foreground)] selection:bg-[var(--accent)]/30">
            {/* HEADER */}
            <div className="max-w-6xl mx-auto mb-8">
                <div className="flex flex-col md:flex-row gap-4 md:items-center justify-between">
                    <div>
                        <motion.h1
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-2xl md:text-3xl font-black tracking-tight"
                        >
                            {userDetails.name || "Player"}<span className="text-[var(--accent)]">'s</span> Dashboard
                        </motion.h1>
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="flex items-center gap-2 mt-1"
                        >
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-widest">
                                Profile Active & Secure
                            </p>
                        </motion.div>
                    </div>

                    <motion.button
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        onClick={() => router.push("/dashboard/wallet")}
                        className="flex items-center gap-3 bg-[var(--card)]/30 backdrop-blur-md border border-[var(--border)] px-4 py-2 rounded-2xl hover:bg-[var(--card)]/50 transition-all active:scale-95"
                    >
                        <div className="flex flex-col items-start">
                            <span className="text-[8px] uppercase font-black text-[var(--muted)] tracking-widest leading-none mb-1">Balance</span>
                            <div className="flex items-center gap-1.5 text-lg font-black text-emerald-500">
                                <Wallet size={14} />
                                <span>₹{walletBalance}</span>
                            </div>
                        </div>
                        <ChevronRight size={14} className="text-[var(--muted)]" />
                    </motion.button>
                </div>
            </div>

            {/* CARDS GRID */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 max-w-6xl mx-auto mb-12">
                {tabCards.map((tab, idx) => (
                    <motion.div
                        key={tab.key}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                    >
                        <DashboardCard
                            tab={tab}
                            activeTab={activeTab}
                            onClick={() => router.push(tab.href)}
                        />
                    </motion.div>
                ))}
            </div>

            {/* CONTENT AREA */}
            <motion.div
                layout
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-6xl mx-auto bg-[var(--card)]/40 
                          backdrop-blur-3xl border border-[var(--border)]
                          rounded-[3rem] p-4 md:p-8 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)] relative overflow-hidden"
            >
                {/* Premium Background Accents */}
                <div className="absolute -top-24 -right-24 w-96 h-96 bg-[var(--accent)]/10 rounded-full blur-[100px] -z-10 animate-pulse" />
                <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-[var(--accent)]/5 rounded-full blur-[100px] -z-10" />

                <div className="relative min-h-[500px]">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={pathname}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.4, ease: "circOut" }}
                        >
                            {children}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </motion.div>
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
