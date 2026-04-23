"use client";

import React, { useEffect } from "react";
import { motion } from "framer-motion";

export default function Loader() {
  useEffect(() => {
    // Lock scroll when loader is active
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-[999999] flex flex-col items-center justify-center bg-[var(--background)]/80 backdrop-blur-2xl"
    >
      <div className="relative flex flex-col items-center">
        {/* Minimal Logo with Subtle Shimmer */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="relative group"
        >
          {/* Soft background essence */}
          <div className="absolute inset-0 -m-8 blur-3xl bg-[var(--accent)]/5 rounded-full" />

          <motion.span
            animate={{
              opacity: [0.8, 1, 0.8],
            }}
            transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
            className="text-6xl font-black tracking-tighter text-[var(--foreground)] relative z-10"
            style={{
              textShadow: '0 0 30px color-mix(in srgb, var(--accent), transparent 90%)'
            }}
          >
            yJ
          </motion.span>

          {/* Elegant Shimmer Line */}
          <motion.div
            initial={{ x: "-150%" }}
            animate={{ x: "150%" }}
            transition={{
              duration: 1.2,
              repeat: Infinity,
              ease: "easeInOut",
              repeatDelay: 0.1
            }}
            className="absolute inset-0 z-20 bg-gradient-to-r from-transparent via-[var(--foreground)]/10 to-transparent skew-x-12"
          />
        </motion.div>

        {/* High-End Progress Tracker */}
        <div className="mt-12 w-32 h-[1px] bg-[var(--border)]/20 relative overflow-hidden rounded-full">
          <motion.div
            initial={{ left: "-100%" }}
            animate={{ left: "100%" }}
            transition={{
              duration: 0.6,
              repeat: Infinity,
              ease: "linear"
            }}
            className="absolute top-0 bottom-0 w-1/2 bg-gradient-to-r from-transparent via-[var(--accent)] to-transparent"
          />
        </div>

        {/* Subtle Loading Text */}
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.3 }}
          transition={{ delay: 0.2, duration: 0.3 }}
          className="mt-4 text-[9px] uppercase tracking-[0.4em] font-medium text-[var(--foreground)]"
        >
          Please Wait...
        </motion.span>
      </div>
    </motion.div>
  );
}
