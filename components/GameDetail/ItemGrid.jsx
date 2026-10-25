"use client";

import { motion } from "framer-motion";
import { FiCheckCircle } from "react-icons/fi";
import Image from "next/image";
import logo from "@/public/logo.png";
import { useCurrency } from "@/components/CurrencyContext";

export default function ItemGrid({
  items,
  activeItem,
  setActiveItem,
  buyPanelRef,
  gameImage
}) {
  const { formatPrice } = useCurrency();

  return (
    <div className="max-w-6xl mx-auto mb-5 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-3">
      {items.map((item, i) => {
        const isOutOfStock = Boolean(item.isOutOfStock || item.itemAvailablity === false);
        const isActive = activeItem?.itemSlug === item.itemSlug;

        return (
          <motion.div
            key={item.itemSlug}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            onClick={() => {
              if (isOutOfStock) return;
              setActiveItem(item);
              buyPanelRef.current?.scrollIntoView({
                behavior: "smooth",
                block: "center",
              });
            }}
            className={`group relative rounded-xl p-2.5 md:p-3 border transition-all duration-300 overflow-hidden
              ${isOutOfStock
                ? "border-red-500/20 bg-red-500/[0.04] opacity-55 grayscale cursor-not-allowed"
                : isActive
                ? "border-[var(--accent)] bg-[var(--accent)]/10 shadow-[0_0_20px_rgba(var(--accent-rgb),0.1)] cursor-pointer"
                : "border-[var(--border)] bg-[var(--card)]/40 hover:border-[var(--accent)]/50 backdrop-blur-sm cursor-pointer"
              }`}
          >
            {/* Out of Stock Badge / Active Indicator */}
            {isOutOfStock ? (
              <div className="absolute top-2 right-2 z-20">
                <span className="px-1.5 py-0.5 rounded-md bg-red-500/90 border border-white/20 text-white font-bold text-[7.5px] uppercase tracking-wider shadow-xs whitespace-nowrap">
                  Out of Stock
                </span>
              </div>
            ) : isActive ? (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute top-2 right-2 text-[var(--accent)] z-20"
              >
                <FiCheckCircle className="w-4 h-4" />
              </motion.div>
            ) : null}

            <div className="flex flex-col gap-1.5 relative z-10">
              <div className="flex items-center gap-2">
                <div className="relative w-5 h-5 shrink-0 rounded overflow-hidden">
                  <Image 
                    src={item.itemImageId?.image || gameImage || logo} 
                    alt={item.itemName} 
                    fill 
                    className="object-cover"
                  />
                </div>
                <h3 className="text-[13px] font-bold text-[var(--foreground)] truncate leading-tight">
                  {item.itemName}
                </h3>
              </div>

              <div className="flex items-center justify-between mt-1">
                <div className="flex items-baseline gap-1.5 ">
                  <span className="text-base font-black text-[var(--accent)]">{formatPrice(item.sellingPrice)}</span>
                  {item.dummyPrice && (
                    <span className="text-[10px] line-through text-[var(--muted)] opacity-50 font-medium">
                      {formatPrice(item.dummyPrice)}
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
