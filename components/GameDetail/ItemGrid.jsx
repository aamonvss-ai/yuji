"use client";

import { motion } from "framer-motion";
import { FiCheckCircle } from "react-icons/fi";

export default function ItemGrid({
  items,
  activeItem,
  setActiveItem,
  buyPanelRef,
}) {
  return (
    <div className="max-w-6xl mx-auto mb-5 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-3">
      {items.map((item, i) => {
        const isActive = activeItem?.itemSlug === item.itemSlug;

        return (
          <motion.div
            key={item.itemSlug}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            onClick={() => {
              setActiveItem(item);
              buyPanelRef.current?.scrollIntoView({
                behavior: "smooth",
                block: "center",
              });
            }}
            className={`group relative rounded-xl p-2.5 md:p-3 cursor-pointer border transition-all duration-300 overflow-hidden
              ${isActive
                ? "border-[var(--accent)] bg-[var(--accent)]/10 shadow-[0_0_20px_rgba(var(--accent-rgb),0.1)]"
                : "border-[var(--border)] bg-[var(--card)]/40 hover:border-[var(--accent)]/50 backdrop-blur-sm"
              }`}
          >
            {/* Active Indicator */}
            {isActive && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute top-2 right-2 text-[var(--accent)]"
              >
                <FiCheckCircle className="w-4 h-4" />
              </motion.div>
            )}

            <div className="flex flex-col gap-1.5 relative z-10">
              <div className="flex items-center gap-2">
                <span className="text-base drop-shadow-sm">💎</span>
                <h3 className="text-[13px] font-bold text-[var(--foreground)] truncate leading-tight">
                  {item.itemName}
                </h3>
              </div>

              <div className="flex items-center justify-between mt-1">
                <div className="flex items-baseline gap-1.5 ">
                  <span className="text-base font-black text-[var(--accent)]">₹{item.sellingPrice}</span>
                  {item.dummyPrice && (
                    <span className="text-[10px] line-through text-[var(--muted)] opacity-50 font-medium">
                      ₹{item.dummyPrice}
                    </span>
                  )}
                </div>

                {/* Simplified Save Badge */}
                {item.dummyPrice && item.dummyPrice > item.sellingPrice && (
                  <span className="text-[9px] font-bold text-green-500 bg-green-500/10 px-1.5 rounded">
                    -{Math.round(((item.dummyPrice - item.sellingPrice) / item.dummyPrice) * 100)}%
                  </span>
                )}
              </div>
            </div>

            {/* Hover Backdrop Glow */}
            <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none bg-gradient-to-br from-[var(--accent)]/5 to-transparent`} />
          </motion.div>
        );
      })}
    </div>
  );
}
