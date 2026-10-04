"use client";

import React from "react";
import { Search, X } from "lucide-react";

/**
 * Shared SearchInput Component
 * @param {string} value - Controlled input value
 * @param {function} onChange - Handler receiving new text or native event
 * @param {function} [onClear] - Optional clear handler (if omitted, onChange("") is called)
 * @param {string} [placeholder="Search..."] - Input placeholder
 * @param {string} [className=""] - Wrapper custom class
 * @param {string} [inputClassName=""] - Input element custom class
 * @param {boolean} [showClear=true] - Render clear (X) button when value is not empty
 * @param {'sm'|'md'|'lg'} [size="md"] - Size preset
 * @param {React.ReactNode} [rightElement] - Additional right-side action or badge
 */
export default function SearchInput({
  value = "",
  onChange,
  onClear,
  placeholder = "Search...",
  className = "",
  inputClassName = "",
  showClear = true,
  size = "md",
  rightElement = null,
  ...props
}) {
  const handleChange = (e) => {
    if (typeof onChange === "function") {
      onChange(e);
    }
  };

  const handleClear = () => {
    if (typeof onClear === "function") {
      onClear();
    } else if (typeof onChange === "function") {
      onChange({ target: { value: "" } });
    }
  };

  const heightClasses = {
    sm: "h-9 text-xs",
    md: "h-11 text-sm",
    lg: "h-12 text-sm",
  };

  const iconSizes = {
    sm: 14,
    md: 16,
    lg: 18,
  };

  const paddingLeftClasses = {
    sm: "pl-9",
    md: "pl-11",
    lg: "pl-12",
  };

  return (
    <div className={`relative flex items-center min-w-0 ${className}`}>
      <Search
        size={iconSizes[size] || 16}
        className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted)]/40 pointer-events-none transition-colors"
      />
      <input
        type="text"
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        className={`w-full ${heightClasses[size] || heightClasses.md} ${paddingLeftClasses[size] || paddingLeftClasses.md} ${
          showClear && value ? "pr-10" : "pr-4"
        } rounded-xl border border-[var(--border)] bg-[var(--foreground)]/[0.02] text-[var(--foreground)] focus:border-[var(--accent)]/50 outline-none transition-all placeholder:text-[var(--muted)]/40 ${inputClassName}`}
        {...props}
      />
      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
        {showClear && Boolean(value) && (
          <button
            type="button"
            onClick={handleClear}
            className="p-1 rounded-lg text-[var(--muted)]/50 hover:text-[var(--foreground)] hover:bg-[var(--foreground)]/[0.05] transition-all"
            aria-label="Clear search"
          >
            <X size={14} />
          </button>
        )}
        {rightElement}
      </div>
    </div>
  );
}
