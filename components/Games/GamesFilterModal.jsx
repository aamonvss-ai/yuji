"use client";

import { motion, AnimatePresence } from "framer-motion";
import { FiX, FiCheck, FiArrowDown, FiArrowUp, FiRotateCcw, FiLayers, FiZap, FiGlobe, FiShield } from "react-icons/fi";

export default function GamesFilterModal({
  open,
  onClose,
  sort,
  setSort,
  hideOOS,
  setHideOOS,
  activeTab = "all",
  setActiveTab,
}) {
  const categories = [
    { id: "all", label: "All", icon: FiLayers },
    { id: "mlbb", label: "MLBB", icon: FiZap },
    { id: "others", label: "Others", icon: FiGlobe },
    { id: "membership", label: "Membership", icon: FiShield },
  ];

  const handleReset = () => {
    setSort("");
    setHideOOS(false);
    if (setActiveTab) setActiveTab("all");
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="relative w-full max-w-sm bg-[var(--card)] border border-[var(--border)] rounded-3xl shadow-2xl overflow-hidden z-10 flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)]/60">
              <div>
                <h3 className="text-base font-bold text-[var(--foreground)] tracking-tight">
                  Filter & Sort
                </h3>
                <p className="text-[11px] text-[var(--muted)]">
                  Organize games catalog
                </p>
              </div>
              <button
                onClick={onClose}
                aria-label="Close"
                className="w-7 h-7 rounded-full bg-[var(--foreground)]/[0.04] hover:bg-[var(--foreground)]/[0.08] flex items-center justify-center text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
              >
                <FiX size={15} />
              </button>
            </div>

            <div className="p-5 space-y-5 overflow-y-auto max-h-[75vh]">
              {/* CATEGORIES SECTION */}
              {setActiveTab && (
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)] mb-2 px-0.5">
                    Category
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {categories.map((cat) => {
                      const Icon = cat.icon;
                      const isSelected = activeTab === cat.id;
                      return (
                        <button
                          key={cat.id}
                          onClick={() => setActiveTab(cat.id)}
                          className={`flex items-center gap-2 px-3 py-2 rounded-xl text-[11.5px] font-semibold transition-all border ${
                            isSelected
                              ? "bg-[var(--accent)] text-white border-[var(--accent)] shadow-xs"
                              : "bg-[var(--foreground)]/[0.03] hover:bg-[var(--foreground)]/[0.06] text-[var(--foreground)] border-[var(--border)]"
                          }`}
                        >
                          <Icon size={13} className={isSelected ? "text-white" : "text-[var(--accent)]"} />
                          <span>{cat.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* SORT BY SECTION */}
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)] mb-2 px-0.5">
                  Sort Order
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: "az", label: "A → Z", icon: FiArrowDown },
                    { id: "za", label: "Z → A", icon: FiArrowUp },
                  ].map((option) => {
                    const Icon = option.icon;
                    const isActive = sort === option.id;
                    return (
                      <button
                        key={option.id}
                        onClick={() => setSort(isActive ? "" : option.id)}
                        className={`flex items-center justify-center gap-2 py-2.5 rounded-xl border text-[12px] font-bold transition-all ${
                          isActive
                            ? "bg-[var(--accent)] text-white border-[var(--accent)] shadow-xs"
                            : "bg-[var(--foreground)]/[0.03] hover:bg-[var(--foreground)]/[0.06] text-[var(--foreground)] border-[var(--border)]"
                        }`}
                      >
                        <Icon size={14} />
                        <span>{option.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* AVAILABILITY FILTER */}
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)] mb-2 px-0.5">
                  Availability
                </p>
                <button
                  type="button"
                  onClick={() => setHideOOS(!hideOOS)}
                  className={`w-full flex items-center justify-between p-3 rounded-2xl border transition-all text-left ${
                    hideOOS
                      ? "bg-[var(--accent)]/10 border-[var(--accent)]/40"
                      : "bg-[var(--foreground)]/[0.03] hover:bg-[var(--foreground)]/[0.06] border-[var(--border)]"
                  }`}
                >
                  <div>
                    <p className={`text-[12.5px] font-bold ${hideOOS ? "text-[var(--accent)]" : "text-[var(--foreground)]"}`}>
                      Hide Out-of-Stock
                    </p>
                    <p className="text-[10.5px] text-[var(--muted)]">
                      Show only actively available games
                    </p>
                  </div>
                  <div
                    className={`w-9 h-5 rounded-full transition-colors relative flex items-center px-0.5 ${
                      hideOOS ? "bg-[var(--accent)]" : "bg-[var(--foreground)]/15"
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full bg-white transition-transform ${
                        hideOOS ? "translate-x-4 shadow-sm" : "translate-x-0"
                      }`}
                    />
                  </div>
                </button>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="p-4 border-t border-[var(--border)]/60 flex items-center gap-2 bg-[var(--foreground)]/[0.015]">
              <button
                onClick={handleReset}
                className="flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--foreground)]/[0.03] hover:bg-[var(--foreground)]/[0.06] text-[var(--muted)] hover:text-[var(--foreground)] font-semibold text-[11.5px] transition-colors"
              >
                <FiRotateCcw size={12} />
                <span>Reset</span>
              </button>

              <button
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-bold text-[12px] tracking-wide transition-all active:scale-98 shadow-xs"
              >
                Apply Filters
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
