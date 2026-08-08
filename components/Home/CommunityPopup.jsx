"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiX } from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa6";

const CommunityPopup = () => {
  const [isOpen, setIsOpen] = useState(false);
  const WHATSAPP_LINK = process.env.NEXT_PUBLIC_WHATSAPP_STORE_LINK || "https://whatsapp.com/channel/0029VbBpAyQ1HsppFN2mW336";
  const QR_CODE_URL = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(WHATSAPP_LINK)}`;

  useEffect(() => {
    const hasSeenPopup = sessionStorage.getItem("has_seen_community_popup_v2");
    if (!hasSeenPopup) {
      const timer = setTimeout(() => setIsOpen(true), 2500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    sessionStorage.setItem("has_seen_community_popup_v2", "true");
  };

  const handleJoin = () => {
    window.open(WHATSAPP_LINK, "_blank", "noopener,noreferrer");
    handleClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 400 }}
            className="relative w-full max-w-[260px] bg-[var(--card)]/95 backdrop-blur-xl border border-white/10 dark:border-white/5 rounded-[1.25rem] p-5 shadow-2xl overflow-hidden ring-1 ring-black/5"
          >
            {/* Close Button */}
            <button
              onClick={handleClose}
              className="absolute top-2 right-2 p-1.5 text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-black/5 dark:hover:bg-white/10 rounded-full transition-all z-10"
            >
              <FiX size={16} />
            </button>

            <div className="flex flex-col items-center text-center">
              {/* Icon Container with glowing effect */}
              <div className="relative mb-3 group">
                <div className="absolute inset-0 bg-[#25D366] blur-md opacity-30 rounded-full transition-all duration-300 group-hover:opacity-50 group-hover:scale-110" />
                <div className="relative w-10 h-10 bg-gradient-to-br from-[#25D366]/20 to-[#1DA851]/20 text-[#25D366] rounded-full flex items-center justify-center shadow-sm border border-[#25D366]/30 backdrop-blur-md">
                  <FaWhatsapp size={20} className="drop-shadow-sm" />
                </div>
              </div>

              {/* Title Content */}
              <div className="mb-4 space-y-1">
                <h2 className="text-lg font-bold text-[var(--foreground)] tracking-tight">
                  Join Community
                </h2>
                <p className="text-[12px] text-[var(--muted)] leading-relaxed max-w-[200px] mx-auto">
                  Scan to get our latest updates & exclusive offers.
                </p>
              </div>

              {/* QR Code Section */}
              <div className="relative mb-4 bg-white/90 p-2.5 rounded-[1rem] shadow-[0_2px_10px_-3px_rgba(0,0,0,0.1)] border border-black/5 dark:border-white/10 group hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-all duration-300 transform hover:-translate-y-0.5">
                <div className="absolute inset-0 bg-gradient-to-tr from-[#25D366]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-[1rem]" />
                <img
                  src={QR_CODE_URL}
                  alt="WhatsApp QR Code"
                  className="relative w-[95px] h-[95px] object-contain mx-auto mix-blend-multiply"
                />
              </div>

              {/* Action Button */}
              <button
                onClick={handleJoin}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-gradient-to-r from-[#25D366] to-[#1DA851] hover:from-[#22c55e] hover:to-[#16a34a] text-white rounded-[0.875rem] font-semibold text-[13px] transition-all duration-300 hover:shadow-lg hover:shadow-[#25D366]/30 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] mb-2 border border-white/10"
              >
                <FaWhatsapp size={16} />
                Open WhatsApp
              </button>

              {/* Dismiss Action */}
              <button
                onClick={handleClose}
                className="text-[11px] font-medium text-[var(--muted)] hover:text-[var(--foreground)] transition-colors py-1 hover:underline underline-offset-2 opacity-80 hover:opacity-100"
              >
                Maybe Later
              </button>
            </div>

            {/* Background Glows (Theme Aware) */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#25D366] opacity-[0.06] blur-[60px] pointer-events-none rounded-full" />
            <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-[#25D366] opacity-[0.06] blur-[60px] pointer-events-none rounded-full" />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default CommunityPopup;
