"use client";

import { motion } from "framer-motion";
import {
  FiZap,
  FiShield,
  FiCreditCard,
  FiMessageSquare,
  FiUsers,
  FiCpu
} from "react-icons/fi";

const ITEMS = [
  { title: "Instant", icon: FiZap },
  { title: "Safe", icon: FiShield },
  { title: "Gateway", icon: FiCreditCard },
  { title: "Support", icon: FiMessageSquare },
  { title: "Trusted", icon: FiUsers },
  { title: "Fast", icon: FiCpu },
];

export default function TrustHighlights() {
  return (
    <section className="py-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-3 md:grid-cols-6 gap-8 md:gap-4">
          {ITEMS.map((item, i) => (
            <div
              key={i}
              className="group flex flex-col items-center gap-4"
            >
              <div className="w-14 h-14 rounded-2xl bg-transparent flex items-center justify-center transition-colors duration-200 group-hover:bg-[var(--foreground)]/[0.03]">
                <item.icon className="w-6 h-6 text-[var(--muted)] group-hover:text-[var(--accent)] transition-colors duration-200" />
              </div>
              <div className="flex flex-col items-center gap-1">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--muted)] group-hover:text-[var(--foreground)] transition-colors">
                  {item.title}
                </span>
                <div className="w-0 h-[1px] bg-[var(--accent)] transition-all duration-300 group-hover:w-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
