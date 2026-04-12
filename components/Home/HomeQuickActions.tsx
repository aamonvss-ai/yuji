"use client";

import Link from "next/link";
import { Globe, Trophy, Gamepad2, LayoutGrid, Crown } from "lucide-react";

export default function HomeQuickActions() {
  const actions = [
    {
      name: "Trophy",
      href: "/leaderboard",
      icon: Trophy,
      delay: "0.05s",
      color: "text-yellow-500",
      bg: "bg-yellow-500/10",
      hover: "hover:bg-yellow-500/10",
    },
    {
      name: "Region",
      href: "/region",
      icon: Globe,
      delay: "0.1s",
      color: "text-blue-500",
      bg: "bg-blue-500/10",
      hover: "hover:bg-blue-500/10",
    },
    {
      name: "Pass",
      href: "/games/silver-membership",
      icon: Crown,
      delay: "0.15s",
      color: "text-amber-500",
      bg: "bg-amber-500/10",
      hover: "hover:bg-amber-500/10",
    },
    {
      name: "More",
      href: "/services",
      icon: LayoutGrid,
      delay: "0.2s",
      color: "text-violet-500",
      bg: "bg-violet-500/10",
      hover: "hover:bg-violet-500/10",
    },
    {
      name: "Play",
      href: "/games",
      icon: Gamepad2,
      delay: "0.25s",
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
      hover: "hover:bg-emerald-500/10",
    },
  ];

  return (
    <section className="w-full px-2 py-4">
      <div className="max-w-6xl mx-auto grid grid-cols-5 gap-1.5 sm:gap-3">
        {actions.map((action, index) => (
          <Link
            key={action.name}
            href={action.href}
            className={`
              group
              flex flex-col items-center justify-center gap-1.5
              sm:gap-2
              p-1 sm:p-2
              transition-all duration-300
              rounded-2xl
              hover:bg-[var(--foreground)]/[0.03]
            `}
            style={{
              animation: `fadeInUp 0.4s ease-out ${action.delay} both`
            }}
          >
            <div className={`h-11 w-11 flex items-center justify-center rounded-2xl transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 ${action.bg} ${action.color} border border-transparent group-hover:border-[var(--border)]/50`}>
              <action.icon className="h-5 w-5 transition-transform duration-300 group-hover:scale-110" />
            </div>

            <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-[var(--muted)] text-center transition-all duration-300 group-hover:text-[var(--foreground)]">
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
