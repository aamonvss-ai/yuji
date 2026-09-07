"use client";

import Link from "next/link";
import { Globe, Trophy, Gamepad2, LayoutGrid, Crown } from "lucide-react";

export default function HomeQuickActions() {
  const actions = [
    {
      name: "Leaderboard",
      href: "/leaderboard",
      icon: Trophy,
      delay: "0.05s",
      color: "text-amber-500 dark:text-amber-400",
      bg: "bg-amber-500/15 dark:bg-amber-500/20",
      border: "border-amber-500/30 dark:border-amber-500/30",
    },
    {
      name: "Region",
      href: "/region",
      icon: Globe,
      delay: "0.1s",
      color: "text-blue-500 dark:text-blue-400",
      bg: "bg-blue-500/15 dark:bg-blue-500/20",
      border: "border-blue-500/30 dark:border-blue-500/30",
    },
    {
      name: "VIP",
      href: "/games/silver-membership",
      icon: Crown,
      delay: "0.15s",
      color: "text-orange-500 dark:text-orange-400",
      bg: "bg-orange-500/15 dark:bg-orange-500/20",
      border: "border-orange-500/30 dark:border-orange-500/30",
    },
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: LayoutGrid,
      delay: "0.2s",
      color: "text-purple-500 dark:text-purple-400",
      bg: "bg-purple-500/15 dark:bg-purple-500/20",
      border: "border-purple-500/30 dark:border-purple-500/30",
    },
    {
      name: "Games",
      href: "/games",
      icon: Gamepad2,
      delay: "0.25s",
      color: "text-emerald-500 dark:text-emerald-400",
      bg: "bg-emerald-500/15 dark:bg-emerald-500/20",
      border: "border-emerald-500/30 dark:border-emerald-500/30",
    },
  ];

  return (
    <section className="w-full py-2.5 sm:py-3.5">
      <div className="max-w-7xl mx-auto px-1.5 sm:px-4 grid grid-cols-5 gap-1 sm:gap-3">
        {actions.map((action) => (
          <Link
            key={action.name}
            href={action.href}
            className="group flex flex-col items-center justify-center gap-1 sm:gap-1.5 py-1 px-0.5 sm:p-2 transition-all duration-300 rounded-2xl hover:bg-[var(--foreground)]/[0.04]"
            style={{
              animation: `fadeInUp 0.4s ease-out ${action.delay} both`
            }}
          >
            <div className={`h-11 w-11 sm:h-12 sm:w-12 flex items-center justify-center rounded-2xl transition-all duration-300 group-hover:scale-105 group-active:scale-95 ${action.bg} ${action.color}`}>
              <action.icon className="h-5 w-5 sm:h-5.5 sm:w-5.5 transition-transform duration-300 group-hover:scale-110" />
            </div>

            <span className="text-[9px] sm:text-[11px] font-bold uppercase tracking-tight text-[var(--foreground)] text-center transition-colors duration-200 group-hover:text-[var(--accent)] w-full block">
              {action.name}
            </span>
          </Link>
        ))}
      </div>

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </section>
  );
}
