"use client";

import React from "react";

export const Skeleton = ({ className = "", style, children, ...props }) => {
  return (
    <div
      className={`relative overflow-hidden bg-[var(--foreground)]/[0.06] border border-[var(--border)]/20 rounded-xl ${className}`}
      style={style}
      {...props}
    >
      <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-[var(--foreground)]/[0.08] to-transparent pointer-events-none" />
      {children}
    </div>
  );
};

export const SkeletonCircle = ({ size = "w-10 h-10", className = "", ...props }) => (
  <Skeleton className={`rounded-full shrink-0 ${size} ${className}`} {...props} />
);

export const SkeletonText = ({ className = "w-full h-3", ...props }) => (
  <Skeleton className={`rounded-md ${className}`} {...props} />
);

export default Skeleton;
