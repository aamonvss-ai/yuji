"use client";

import React from "react";
import {
  Clock,
  CheckCircle2,
  XCircle,
  RotateCcw,
  RefreshCcw,
  AlertCircle,
  X,
  ArrowUpRight,
  ArrowDownLeft,
  Gift
} from "lucide-react";

const STATUS_CONFIG = {
  // Orders & Transactions
  pending: {
    label: "Pending",
    class: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    icon: Clock,
  },
  processing: {
    label: "Processing",
    class: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    icon: RefreshCcw,
  },
  success: {
    label: "Success",
    class: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    icon: CheckCircle2,
  },
  completed: {
    label: "Completed",
    class: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    icon: CheckCircle2,
  },
  paid: {
    label: "Paid",
    class: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    icon: CheckCircle2,
  },
  failed: {
    label: "Failed",
    class: "bg-rose-500/10 text-rose-500 border-rose-500/20",
    icon: XCircle,
  },
  refunded: {
    label: "Refunded",
    class: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    icon: RotateCcw,
  },
  cancelled: {
    label: "Cancelled",
    class: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
    icon: AlertCircle,
  },

  // Support Queries
  open: {
    label: "Open",
    class: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    icon: AlertCircle,
  },
  in_progress: {
    label: "In Progress",
    class: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    icon: RefreshCcw,
  },
  resolved: {
    label: "Resolved",
    class: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    icon: CheckCircle2,
  },
  closed: {
    label: "Closed",
    class: "bg-[var(--foreground)]/[0.05] text-[var(--muted)] border-[var(--border)]",
    icon: X,
  },

  // Wallet Types
  topup: {
    label: "Top Up",
    class: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    icon: ArrowDownLeft,
  },
  spend: {
    label: "Spend",
    class: "bg-rose-500/10 text-rose-500 border-rose-500/20",
    icon: ArrowUpRight,
  },
  refund: {
    label: "Refund",
    class: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    icon: RotateCcw,
  },
  bonus: {
    label: "Bonus",
    class: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    icon: Gift,
  },
};

/**
 * Reusable StatusBadge Component
 * @param {string} status - Status key (e.g. 'pending', 'success', 'failed', 'open')
 * @param {'sm'|'md'|'lg'} [size='md'] - Badge size
 * @param {boolean} [showIcon=true] - Render icon
 * @param {string} [className=''] - Extra classes
 */
export default function StatusBadge({
  status,
  size = "md",
  showIcon = true,
  className = "",
}) {
  const normalizedKey = String(status || "pending").toLowerCase();
  const config = STATUS_CONFIG[normalizedKey] || {
    label: status || "Unknown",
    class: "bg-[var(--foreground)]/[0.05] text-[var(--muted)] border-[var(--border)]",
    icon: Clock,
  };

  const Icon = config.icon;

  const sizeClasses = {
    sm: "px-2 py-0.5 text-[8px] gap-1 rounded-md",
    md: "px-2.5 py-1 text-[9px] gap-1.5 rounded-lg",
    lg: "px-3 py-1.5 text-[10px] gap-2 rounded-xl",
  };

  const iconSizes = {
    sm: 10,
    md: 12,
    lg: 14,
  };

  return (
    <span
      className={`inline-flex items-center font-bold uppercase tracking-wider border ${sizeClasses[size] || sizeClasses.md} ${config.class} ${className}`}
    >
      {showIcon && Icon && <Icon size={iconSizes[size] || 12} className="shrink-0" />}
      <span>{config.label}</span>
    </span>
  );
}

// Named export for raw config lookup if needed
export { STATUS_CONFIG };
