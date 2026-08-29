"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiX } from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa6";

const CommunityPopup = () => {
  const [isOpen, setIsOpen] = useState(false);
  const WHATSAPP_LINK =
    process.env.NEXT_PUBLIC_WHATSAPP_STORE_LINK ||
    "https://whatsapp.com/channel/0029VbBpAyQ1HsppFN2mW336";
  const QR_CODE_URL = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(
    WHATSAPP_LINK
  )}`;

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
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={handleClose}
            className="absolute inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-md"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 12 }}
            transition={{ type: "spring", damping: 28, stiffness: 360 }}
            className="relative w-full max-w-[300px] bg-white dark:bg-[#111215] border border-neutral-200 dark:border-neutral-800 rounded-3xl p-5.5 overflow-hidden flex flex-col items-center"
          >
            {/* Close Button */}
            <button
              onClick={handleClose}
              aria-label="Close modal"
              className="absolute top-3.5 right-3.5 w-7 h-7 flex items-center justify-center text-neutral-400 hover:text-neutral-700 dark:text-neutral-500 dark:hover:text-neutral-200 bg-neutral-100 dark:bg-neutral-800/80 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-full transition-colors z-10"
            >
              <FiX size={15} />
            </button>

            {/* Header: Icon Left, Text Right */}
            <div className="flex items-center gap-3 mb-4 pr-6 text-left w-full">
              <div className="w-10 h-10 shrink-0 rounded-xl bg-[#25D366]/10 dark:bg-[#25D366]/15 border border-[#25D366]/25 flex items-center justify-center text-[#25D366]">
                <FaWhatsapp size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-[15.5px] font-bold text-neutral-900 dark:text-white tracking-tight leading-tight">
                  Join Community
                </h2>
                <p className="text-[11.5px] text-neutral-500 dark:text-neutral-400 leading-tight mt-0.5">
                  Scan to get instant updates & exclusive offers.
                </p>
              </div>
            </div>

            {/* QR Code Container */}
            <div className="mb-4 p-3 bg-white dark:bg-white rounded-2xl border border-neutral-200 dark:border-neutral-800">
              <img
                src={QR_CODE_URL}
                alt="WhatsApp QR Code"
                className="w-[115px] h-[115px] object-contain rounded-lg block"
              />
            </div>

            {/* Open WhatsApp Button */}
            <button
              onClick={handleJoin}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-[#25D366] hover:bg-[#20be5b] text-white rounded-xl font-semibold text-[13.5px] tracking-wide transition-colors active:scale-[0.98] mb-1.5"
            >
              <FaWhatsapp size={17} />
              <span>Open WhatsApp</span>
            </button>

            {/* Dismiss Button */}
            <button
              onClick={handleClose}
              className="text-[11.5px] font-medium text-neutral-400 hover:text-neutral-700 dark:text-neutral-500 dark:hover:text-neutral-300 transition-colors py-1 hover:underline underline-offset-4"
            >
              Maybe Later
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default CommunityPopup;
