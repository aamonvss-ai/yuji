"use client";

import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

/**
 * Reusable Pagination Component
 * @param {number} page - Current page (1-indexed)
 * @param {number} totalPages - Total number of pages
 * @param {function} onPageChange - Callback receiving the new page number
 * @param {string} [className] - Optional container classes
 * @param {boolean} [showArrowsOnly] - Use compact arrow buttons
 */
export default function Pagination({
  page,
  totalPages,
  onPageChange,
  className = "",
  showArrowsOnly = false,
}) {
  if (!totalPages || totalPages <= 1) return null;

  const handlePrev = () => onPageChange(Math.max(1, page - 1));
  const handleNext = () => onPageChange(Math.min(totalPages, page + 1));

  return (
    <div
      className={`flex items-center justify-between pt-6 border-t border-[var(--border)] ${className}`}
    >
      <p className="text-[10px] sm:text-xs font-bold text-[var(--muted)]/60 uppercase">
        Page <b className="text-[var(--foreground)]">{page}</b> / {totalPages}
      </p>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={handlePrev}
          disabled={page <= 1}
          className="px-4 py-2 rounded-xl border border-[var(--border)] text-[10px] sm:text-xs font-bold uppercase text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--foreground)]/[0.05] disabled:opacity-20 disabled:pointer-events-none transition-all font-mono"
        >
          {showArrowsOnly ? <ChevronLeft size={14} /> : "Previous"}
        </button>

        <button
          type="button"
          onClick={handleNext}
          disabled={page >= totalPages}
          className="px-4 py-2 rounded-xl border border-[var(--border)] text-[10px] sm:text-xs font-bold uppercase text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--foreground)]/[0.05] disabled:opacity-20 disabled:pointer-events-none transition-all font-mono"
        >
          {showArrowsOnly ? <ChevronRight size={14} /> : "Next"}
        </button>
      </div>
    </div>
  );
}
