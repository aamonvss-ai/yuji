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
    <section className="py-12 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-3 md:grid-cols-6 gap-8 md:gap-4">
          {ITEMS.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="group flex flex-col items-center gap-4"
            >
              <div className="w-14 h-14 rounded-2xl bg-transparent flex items-center justify-center transition-all duration-500 group-hover:bg-[var(--foreground)]/[0.03]">
                <item.icon className="w-6 h-6 text-[var(--muted)] group-hover:text-[var(--accent)] transition-all duration-300" />
              </div>
              <div className="flex flex-col items-center gap-1">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--muted)] group-hover:text-[var(--foreground)] transition-colors">
                  {item.title}
                </span>
                <div className="w-0 h-[1px] bg-[var(--accent)] transition-all duration-500 group-hover:w-full" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
