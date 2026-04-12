"use client";

import { useState, useEffect } from "react";
import { FaWhatsapp } from "react-icons/fa";
import { FiX, FiChevronRight } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";

const STORAGE_KEY = "hide_whatsapp_banner";
const MESSAGE_DURATION = 5000; // 5 seconds per message

// ✅ Read from env
const WHATSAPP_CHANNEL_URL =
  process.env.NEXT_PUBLIC_WHATSAPP_STORE_LINK || "";

// ✅ Rotating messages
const MESSAGES = [
  {
    title: "Join our WhatsApp Channel",
    subtitle: "Get instant offers, updates & announcements",
    badge: "VIP ACCESS"
  },
  {
    title: "Account Support Available",
    subtitle: "Get help with your game accounts & top-ups",
    badge: "24/7 LIVE"
  },
  {
    title: "Latest MLBB Top-up Updates",
    subtitle: "New skins and exclusive rewards ready",
    badge: "NEW OFFERS"
  },
];

export default function TopNoticeBanner() {
  const [visible, setVisible] = useState(false);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const hidden = localStorage.getItem(STORAGE_KEY);
    if (!hidden && WHATSAPP_CHANNEL_URL) setVisible(true);
  }, []);

  // 🔁 Rotate message every 5 seconds
  useEffect(() => {
    if (!visible) return;

    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % MESSAGES.length);
    }, MESSAGE_DURATION);

    return () => clearInterval(interval);
  }, [visible]);

  if (!visible || !WHATSAPP_CHANNEL_URL) return null;

  const current = MESSAGES[index];

  return (
    <>
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: "auto", opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full overflow-hidden border-b border-[var(--border)] bg-gradient-to-r from-[var(--card)]/40 via-[var(--card)]/80 to-[var(--card)]/40 backdrop-blur-xl group"
      >
        {/* Enhanced Animated Accent Background */}
        <div className="absolute inset-0 bg-gradient-to-r from-[var(--accent)]/10 via-transparent to-[var(--accent)]/10 pointer-events-none opacity-50 group-hover:opacity-100 transition-opacity duration-700" />

        {/* Subtle radial glow */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,var(--accent)/5,transparent_70%)] pointer-events-none" />

        <div
          className="max-w-7xl mx-auto px-4 py-3 cursor-pointer relative z-10"
          onClick={() => window.open(WHATSAPP_CHANNEL_URL, "_blank", "noopener,noreferrer")}
        >
          <div className="flex items-center justify-between gap-4">

            {/* Left Section: Icon & Content */}
            <div className="flex items-center gap-4 min-w-0 flex-1">
<div className="relative shrink-0">
                <div className="p-2 rounded-xl bg-[var(--accent)]/10 border border-[var(--accent)]/30 text-[var(--accent)]">
                  <FaWhatsapp size={20} />
                </div>
</div>

              <div className="flex flex-col min-w-0">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: 20, filter: "blur(4px)" }}
                    animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                    exit={{ opacity: 0, x: -20, filter: "blur(4px)" }}
                    transition={{ duration: 0.4 }}
                    className="flex flex-col"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] font-black tracking-[0.2em] text-[var(--accent)] uppercase hidden sm:inline px-2 py-0.5 rounded-md bg-[var(--accent)]/5 border border-[var(--accent)]/10">
                        {current.badge}
                      </span>
                      <h3 className="text-xs md:text-sm font-bold bg-gradient-to-r from-[var(--foreground)] to-[var(--foreground)]/60 bg-clip-text text-transparent uppercase tracking-wider truncate">
                        {current.title}
                      </h3>
                    </div>
                    <p className="text-[10px] md:text-xs text-[var(--muted)] truncate font-medium">
                      {current.subtitle}
                    </p>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>

            {/* Right Section: Action & Close */}
            <div className="flex items-center gap-3 shrink-0">
              <motion.div
                className="hidden md:flex items-center gap-2 bg-[var(--accent)]/10 hover:bg-[var(--accent)]/20 text-[var(--accent)] px-4 py-1.5 rounded-lg text-[10px] font-black tracking-widest uppercase transition-all border border-[var(--accent)]/20"
                whileHover={{ scale: 1.05, x: 2 }}
                whileTap={{ scale: 0.95 }}
              >
                Connect Panel
                <FiChevronRight />
              </motion.div>

              <div className="w-[1px] h-6 bg-[var(--border)] mx-1" />

              <motion.button
                onClick={(e) => {
                  e.stopPropagation();
                  localStorage.setItem(STORAGE_KEY, "true");
                  setVisible(false);
                }}
                className="p-2 text-[var(--muted)] hover:text-[var(--foreground)] transition-colors rounded-lg hover:bg-[var(--accent)]/10"
                aria-label="Close"
                whileHover={{ rotate: 90 }}
              >
                <FiX size={18} />
              </motion.button>
            </div>
          </div>
        </div>

        {/* Corner Accents */}
        <div className="absolute top-0 left-0 w-1 h-1 border-t border-l border-[var(--accent)]/40" />
        <div className="absolute bottom-0 right-0 w-1 h-1 border-b border-r border-[var(--accent)]/40" />
      </motion.div>
    </>
  );
}
