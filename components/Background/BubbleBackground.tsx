"use client";

import React from "react";

export default function BubbleBackground() {
  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none"
      style={{ contain: "strict" }}
    >
      {/* Deep Base Vignette */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[var(--background,#0b0f17)]/40 to-[var(--background,#0b0f17)]/90" />

      {/* Aurora Ambient Glow Orb 1 - Top Center / Sapphire */}
      <div
        className="absolute top-[-10%] left-[20%] sm:left-[30%] w-[320px] sm:w-[580px] md:w-[720px] h-[320px] sm:h-[580px] md:h-[720px] rounded-full opacity-25 dark:opacity-20 pointer-events-none transform-gpu"
        style={{
          background: "radial-gradient(circle, rgba(59, 130, 246, 0.4) 0%, rgba(99, 102, 241, 0.15) 50%, transparent 70%)",
        }}
      />

      {/* Aurora Ambient Glow Orb 2 - Mid Right / Electric Violet */}
      <div
        className="absolute top-[28%] right-[-15%] sm:right-[-5%] w-[300px] sm:w-[520px] md:w-[650px] h-[300px] sm:h-[520px] md:h-[650px] rounded-full opacity-20 dark:opacity-15 pointer-events-none transform-gpu"
        style={{
          background: "radial-gradient(circle, rgba(168, 85, 247, 0.35) 0%, rgba(139, 92, 246, 0.12) 50%, transparent 70%)",
        }}
      />

      {/* Aurora Ambient Glow Orb 3 - Lower Left / Cyan-Emerald Glow */}
      <div
        className="absolute top-[62%] left-[-15%] sm:left-[-5%] w-[320px] sm:w-[500px] md:w-[620px] h-[320px] sm:h-[500px] md:h-[620px] rounded-full opacity-20 dark:opacity-15 pointer-events-none transform-gpu"
        style={{
          background: "radial-gradient(circle, rgba(14, 165, 233, 0.3) 0%, rgba(20, 184, 166, 0.12) 50%, transparent 70%)",
        }}
      />

      {/* Subtle Noise / Studio Texture Overlay */}
      <div
        className="absolute inset-0 opacity-[0.02] dark:opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(rgba(255, 255, 255, 0.8) 1px, transparent 0)`,
          backgroundSize: "28px 28px",
        }}
      />
    </div>
  );
}
