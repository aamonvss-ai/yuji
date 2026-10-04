"use client";

import React from "react";
import { Inbox } from "lucide-react";

/**
 * EmptyState UI Component
 * @param {React.ReactNode} [icon] - Lucide icon component or custom element
 * @param {string} [title] - Header / message title
 * @param {string} [description] - Subtext or explanation
 * @param {React.ReactNode} [action] - Optional CTA button or element
 * @param {string} [className] - Additional wrapper styling
 * @param {'sm'|'md'|'lg'} [size='md'] - Sizing preset
 */
export default function EmptyState({
  icon: Icon = Inbox,
  title = "No data found",
  description,
  action,
  className = "",
  size = "md",
}) {
  const sizeClasses = {
    sm: "py-12 rounded-2xl",
    md: "py-20 rounded-[2rem]",
    lg: "py-28 rounded-[2.5rem]",
  };

  const iconSizes = {
    sm: 32,
    md: 44,
    lg: 56,
  };

  return (
    <div
      className={`text-center border border-dashed border-[var(--border)] bg-[var(--foreground)]/[0.01] flex flex-col items-center justify-center p-6 ${sizeClasses[size] || sizeClasses.md} ${className}`}
    >
      {React.isValidElement(Icon) ? (
        <div className="text-[var(--muted)]/30 mb-3">{Icon}</div>
      ) : Icon ? (
        <Icon size={iconSizes[size] || 44} className="text-[var(--muted)]/25 mb-3" />
      ) : null}

      <p className="text-xs font-bold text-[var(--muted)]/60 uppercase tracking-[0.18em]">
        {title}
      </p>

      {description && (
        <p className="text-[11px] font-medium text-[var(--muted)]/40 mt-1 max-w-sm">
          {description}
        </p>
      )}

      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
