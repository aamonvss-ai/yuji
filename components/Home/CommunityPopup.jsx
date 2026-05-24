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
            className="relative w-full max-w-[280px] bg-[var(--card)] border border-[var(--border)]/60 rounded-[1.5rem] p-6 shadow-2xl overflow-hidden"
          >
            {/* Close Button */}
            <button
              onClick={handleClose}
              className="absolute top-3 right-3 p-2 text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--accent)]/10 rounded-full transition-all z-10"
            >
              <FiX size={18} />
            </button>

            <div className="flex flex-col items-center text-center mt-1">
              {/* Icon Container */}
              <div className="w-12 h-12 bg-[#25D366]/10 text-[#25D366] rounded-full flex items-center justify-center mb-4 shadow-sm border border-[#25D366]/20">
                <FaWhatsapp size={24} />
              </div>

              {/* Title Content */}
              <div className="mb-5 space-y-1.5">
                <h2 className="text-xl font-bold text-[var(--foreground)] tracking-tight">
                  Join Community
                </h2>
                <p className="text-[13px] text-[var(--muted)] leading-relaxed max-w-[220px] mx-auto">
                  Scan to get our latest updates & exclusive offers.
                </p>
              </div>

              {/* QR Code Section */}
              <div className="relative mb-5 bg-white p-3 rounded-[1.125rem] shadow-sm border border-black/5 dark:border-white/10 group hover:shadow-md transition-all duration-300">
                <img
                  src={QR_CODE_URL}
                  alt="WhatsApp QR Code"
                  className="w-[120px] h-[120px] object-contain mx-auto"
                />
              </div>

              {/* Action Button */}
              <button
                onClick={handleJoin}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-xl font-semibold text-[14px] transition-all active:scale-[0.98] shadow-lg shadow-[#25D366]/25 mb-3"
              >
                <FaWhatsapp size={18} />
                Open WhatsApp
              </button>

              {/* Dismiss Action */}
              <button
                onClick={handleClose}
                className="text-[12px] font-medium text-[var(--muted)] hover:text-[var(--foreground)] transition-colors py-1"
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
