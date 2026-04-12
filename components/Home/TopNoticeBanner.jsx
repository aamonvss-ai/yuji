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

// ✅ Rotating messages with themes
const MESSAGES = [
  {
    title: "Join VIP WhatsApp Channel",
    subtitle: "Get exclusive offers & instant updates",
    badge: "OFFER",
    color: "from-[#0b3c3c] to-[#25d366]" // Deep Contrast WhatsApp Green
  },
  {
    title: "Need Account Support?",
    subtitle: "Our team is available 24/7 to help you",
    badge: "HELP",
    color: "from-[#2e1065] to-[#a855f7]" // Deep Contrast Support Purple
  },
  {
    title: "MLBB New Skins Ready",
    subtitle: "Top-up now for exclusive rewards",
    badge: "NEW",
    color: "from-[#172554] to-[#3b82f6]" // Deep Contrast MLBB Blue
  },
];

export default function TopNoticeBanner() {
  const [visible, setVisible] = useState(false);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const hidden = localStorage.getItem(STORAGE_KEY);
    if (!hidden && WHATSAPP_CHANNEL_URL) setVisible(true);
  }, []);

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
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: "auto", opacity: 1 }}
      className={`relative w-full overflow-hidden bg-gradient-to-r ${current.color} shadow-lg`}
    >
      <div
        className="max-w-7xl mx-auto px-4 py-2.5 cursor-pointer flex items-center justify-between gap-4"
        onClick={() => window.open(WHATSAPP_CHANNEL_URL, "_blank", "noopener,noreferrer")}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center shrink-0">
            <FaWhatsapp size={16} className="text-white" />
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={index}
              initial={{ y: 5, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -5, opacity: 0 }}
              className="flex flex-col"
            >
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold bg-white/20 text-white px-1.5 py-0.5 rounded uppercase tracking-tighter">
                  {current.badge}
                </span>
                <h3 className="text-xs md:text-sm font-black text-white uppercase tracking-tight truncate">
                  {current.title}
                </h3>
              </div>
              <p className="text-[10px] md:text-[11px] text-white/80 font-medium truncate italic">
                {current.subtitle}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="flex items-center gap-2">
          <motion.div
            className="hidden sm:flex items-center gap-1 bg-white/20 hover:bg-white/30 text-white px-3 py-1.5 rounded-full text-[10px] font-bold uppercase transition-all"
            whileHover={{ scale: 1.05 }}
          >
            Join
            <FiChevronRight />
          </motion.div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              localStorage.setItem(STORAGE_KEY, "true");
              setVisible(false);
            }}
            className="p-1.5 text-white/60 hover:text-white transition-colors"
          >
            <FiX size={18} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
