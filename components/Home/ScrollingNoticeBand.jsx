"use client";

import { motion } from "framer-motion";
import { FiZap, FiActivity, FiShield, FiClock, FiStar } from "react-icons/fi";

/* ================= NOTICE CONFIG (EDIT HERE) ================= */
const NOTICE_CONFIG = {
  items: [
    {
      type: "status",
      label: "SYSTEM ACTIVE",
      icon: FiActivity,
      color: "#22c55e",
    },
    {
      icon: FiStar,
      highlight: "PREMIUM",
      text: "FAST & RELIABLE SERVICE",
    },
    {
      icon: FiZap,
      highlight: "INSTANT",
      text: "AUTOMATIC DELIVERY",
    },
    {
      icon: FiClock,
      highlight: "24/7",
      text: "CUSTOMER SUPPORT",
    },
    {
      icon: FiShield,
      highlight: "SECURE",
      text: "SAFE & PROTECTED",
    },
  ],
  duration: 30, // Updated speed: Lower is faster
};
/* ============================================================= */

export default function ScrollingNoticeBand() {
  // Triple items to ensure it covers even the widest screens for seamless scrolling
  const scrollingItems = [...NOTICE_CONFIG.items, ...NOTICE_CONFIG.items, ...NOTICE_CONFIG.items];

  return (
    <div className="relative w-full overflow-hidden bg-[var(--card)]/40 backdrop-blur-xl border-y border-[var(--border)] py-3 group">
      {/* Subtle Glow & Masking */}
      <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-[var(--background)] to-transparent z-10 pointer-events-none" />
      <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-[var(--background)] to-transparent z-10 pointer-events-none" />

      {/* Top Accent Line */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[var(--accent)] to-transparent opacity-20" />

      <motion.div
        className="flex whitespace-nowrap items-center"
        animate={{
          x: ["0%", "-33.33%"],
        }}
        transition={{
          x: {
            repeat: Infinity,
            repeatType: "loop",
            duration: NOTICE_CONFIG.duration,
            ease: "linear",
          },
        }}
      >
        {scrollingItems.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={idx}
              className="flex items-center gap-10 px-10 shrink-0 border-r border-[var(--border)]/50 last:border-r-0"
            >
              {item.type === "status" ? (
                <div className="flex items-center gap-3">
                  <span className="relative flex h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }}></span>

                  <span className="text-[11px] font-black tracking-[0.2em] text-[#22c55e]">
                    {item.label}
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <Icon className="text-[var(--accent)] text-sm" />
                  <p className="text-[11px] font-bold tracking-[0.15em] uppercase text-[var(--foreground)]/60">
                    <span className="text-[var(--accent)] shadow-[0_0_10px_rgba(var(--accent-rgb),0.3)]">{item.highlight}</span> {item.text}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </motion.div>

      {/* Subtle Scanline Effect */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.02] bg-[length:100%_4px] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%)]" />
    </div>
  );
}
