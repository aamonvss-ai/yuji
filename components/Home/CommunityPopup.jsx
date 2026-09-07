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

  useEffect(() => {
    const hasSeenPopup = sessionStorage.getItem("has_seen_community_popup_v5");
    if (!hasSeenPopup) {
      const timer = setTimeout(() => setIsOpen(true), 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    sessionStorage.setItem("has_seen_community_popup_v5", "true");
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
            className="relative w-full max-w-[340px] bg-white dark:bg-[#111215] border border-neutral-200 dark:border-neutral-800 rounded-3xl overflow-hidden flex flex-col items-center shadow-2xl"
          >
            {/* Close Button */}
            <button
              onClick={handleClose}
              aria-label="Close modal"
              className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center text-white/90 hover:text-white bg-black/60 hover:bg-black/80 rounded-full transition-all z-20 backdrop-blur-md shadow-lg active:scale-95"
            >
              <FiX size={16} />
            </button>

            {/* Banner Image - Lower Height (4:3 original aspect) */}
            <div
              onClick={handleJoin}
              className="w-full relative cursor-pointer group bg-neutral-900 aspect-[4/3] overflow-hidden"
            >
              <img
                src="/joinus.png"
                alt="Join WhatsApp Community"
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 block"
              />
            </div>

            {/* Bottom Actions Section with bottom padding */}
            <div className="w-full p-4 pt-3.5 pb-5 flex flex-col items-center">
              {/* Open WhatsApp Button */}
              <button
                onClick={handleJoin}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-[#25D366] hover:bg-[#20be5b] text-white rounded-2xl font-semibold text-[14px] tracking-wide transition-all active:scale-[0.98] shadow-lg shadow-[#25D366]/25 hover:shadow-[#25D366]/40 mb-1.5"
              >
                <FaWhatsapp size={18} />
                <span>Open WhatsApp</span>
              </button>

              {/* Dismiss Button */}
              <button
                onClick={handleClose}
                className="text-[12px] font-medium text-neutral-400 hover:text-neutral-700 dark:text-neutral-500 dark:hover:text-neutral-300 transition-colors pt-1.5 pb-0.5 hover:underline underline-offset-4"
              >
                Maybe Later
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default CommunityPopup;
