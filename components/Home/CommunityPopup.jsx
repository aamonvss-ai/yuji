"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiX, FiMessageSquare, FiArrowRight } from "react-icons/fi";

const CommunityPopup = () => {
  const [isOpen, setIsOpen] = useState(false);
  const WHATSAPP_LINK = process.env.NEXT_PUBLIC_WHATSAPP_STORE_LINK || "https://whatsapp.com/channel/0029VbBpAyQ1HsppFN2mW336";
  const QR_CODE_URL = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(WHATSAPP_LINK)}`;

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
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 400 }}
            className="relative w-full max-w-[310px] bg-[var(--card)] border border-[var(--border)] rounded-[2.5rem] p-6 shadow-2xl overflow-hidden"
          >
            {/* Close Button */}
            <button
              onClick={handleClose}
              className="absolute top-5 right-5 text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
            >
              <FiX size={20} />
            </button>

            <div className="flex flex-col items-center text-center">
              {/* Icon Container */}
              <div className="w-12 h-12 bg-[var(--accent)]/10 rounded-2xl flex items-center justify-center mb-5 border border-[var(--accent)]/20 shadow-sm">
                <FiMessageSquare size={22} className="text-[var(--accent)]" />
              </div>

              {/* Title Content */}
              <div className="mb-6">
                <h2 className="text-xl font-black text-[var(--foreground)] uppercase tracking-tight leading-tight italic">
                  Official Channel
                </h2>
                <p className="text-[9px] font-black text-[var(--muted)] uppercase tracking-[0.2em] opacity-60">
                  Updates & Giveaways
                </p>
              </div>

              {/* QR Code Section */}
              <div className="relative mb-6 bg-white p-3.5 rounded-[1.8rem] shadow-lg border border-[var(--border)]/50 group transition-transform hover:scale-105 duration-300">
                <img
                  src={QR_CODE_URL}
                  alt="QR Code"
                  className="w-32 h-32 object-contain"
                />
              </div>

              {/* Action Button */}
              <button
                onClick={handleJoin}
                className="w-full flex items-center justify-center gap-2 py-3.5 px-6 bg-[var(--accent)] text-white rounded-2xl font-black uppercase text-[11px] tracking-widest transition-all hover:opacity-90 active:scale-95 shadow-lg shadow-[var(--accent)]/20 mb-5"
              >
                Join Now <FiArrowRight size={14} />
              </button>

              {/* Dismiss Action */}
              <button
                onClick={handleClose}
                className="text-[9px] font-black text-[var(--muted)] uppercase tracking-[0.2em] hover:text-[var(--foreground)] transition-colors opacity-40 hover:opacity-100"
              >
                Maybe Later
              </button>
            </div>

            {/* Background Glows (Theme Aware) */}
            <div className="absolute -top-16 -right-16 w-32 h-32 bg-[var(--accent)] opacity-10 blur-[60px] pointer-events-none" />
            <div className="absolute -bottom-16 -left-16 w-32 h-32 bg-[var(--accent)] opacity-5 blur-[60px] pointer-events-none" />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default CommunityPopup;
