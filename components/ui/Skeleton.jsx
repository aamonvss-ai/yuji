"use client";

import { motion } from "framer-motion";

export const Skeleton = ({ className }) => {
  return (
    <div
      className={`relative overflow-hidden bg-[var(--foreground)]/[0.05] border border-[var(--border)]/30 rounded-xl ${className}`}
    >
      <motion.div
        initial={{ x: "-100%" }}
        animate={{ x: "100%" }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "linear",
        }}
        className="absolute inset-0 bg-gradient-to-r from-transparent via-[var(--foreground)]/[0.08] to-transparent -skew-x-12"
      />
    </div>
  );
};
