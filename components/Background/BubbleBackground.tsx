"use client";

import React from "react";

export default function BubbleBackground() {
  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none"
    >
      {/* Deep Base Vignette */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[var(--background,#0b0f17)]/40 to-[var(--background,#0b0f17)]/90" />

      {/* Aurora Ambient Glow Orb 1 - Top Center / Sapphire */}
      <div
        className="absolute top-[-10%] left-[20%] sm:left-[30%] w-[320px] sm:w-[580px] md:w-[720px] h-[320px] sm:h-[580px] md:h-[720px] rounded-full blur-[110px] sm:blur-[140px] md:blur-[170px] opacity-25 dark:opacity-20 animate-pulse pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(59, 130, 246, 0.45) 0%, rgba(99, 102, 241, 0.25) 45%, transparent 75%)",
          animationDuration: "8s",
        }}
      />

      {/* Aurora Ambient Glow Orb 2 - Mid Right / Electric Violet */}
      <div
        className="absolute top-[28%] right-[-15%] sm:right-[-5%] w-[300px] sm:w-[520px] md:w-[650px] h-[300px] sm:h-[520px] md:h-[650px] rounded-full blur-[100px] sm:blur-[135px] md:blur-[160px] opacity-20 dark:opacity-15 pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(168, 85, 247, 0.4) 0%, rgba(139, 92, 246, 0.2) 50%, transparent 80%)",
          animation: "floatSlow 14s ease-in-out infinite alternate",
        }}
      />

      {/* Aurora Ambient Glow Orb 3 - Lower Left / Cyan-Emerald Glow */}
      <div
        className="absolute top-[62%] left-[-15%] sm:left-[-5%] w-[320px] sm:w-[500px] md:w-[620px] h-[320px] sm:h-[500px] md:h-[620px] rounded-full blur-[110px] sm:blur-[140px] md:blur-[165px] opacity-20 dark:opacity-15 pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(14, 165, 233, 0.35) 0%, rgba(20, 184, 166, 0.2) 45%, transparent 75%)",
          animation: "floatSlowReverse 16s ease-in-out infinite alternate",
        }}
      />

      {/* Subtle Noise / Studio Texture Overlay */}
      <div
        className="absolute inset-0 opacity-[0.015] dark:opacity-[0.025] pointer-events-none mix-blend-overlay"
        style={{
          backgroundImage: `radial-gradient(rgba(255, 255, 255, 0.8) 1px, transparent 0)`,
          backgroundSize: "28px 28px",
        }}
      />

      {/* Smooth Keyframe Animations */}
      <style jsx>{`
        @keyframes floatSlow {
          0% {
            transform: translateY(0px) scale(1);
          }
          50% {
            transform: translateY(-25px) scale(1.05);
          }
          100% {
            transform: translateY(20px) scale(0.96);
          }
        }
        @keyframes floatSlowReverse {
          0% {
            transform: translateY(0px) scale(0.96);
          }
          50% {
            transform: translateY(30px) scale(1.04);
          }
          100% {
            transform: translateY(-15px) scale(1);
          }
        }
      `}</style>
    </div>
  );
}
