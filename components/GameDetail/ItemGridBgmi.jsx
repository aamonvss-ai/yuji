"use client";

import { motion } from "framer-motion";
import { FiCheckCircle } from "react-icons/fi";
import Image from "next/image";
import logo from "@/public/logo.png";
import { useCurrency } from "@/components/CurrencyContext";

export default function ItemGridBgmi({
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
            className={`group relative rounded-2xl px-2.5 py-2.5 sm:px-3 sm:py-3 border transition-all duration-200 overflow-hidden
              ${isOutOfStock
                 ? "border-red-500/20 bg-red-500/[0.04] opacity-55 grayscale cursor-not-allowed"
                 : isActive
                 ? "border-[var(--accent)] bg-[var(--accent)]/10 shadow-[0_0_15px_rgba(59,130,246,0.12)] cursor-pointer"
                 : "border-[var(--border)] bg-[var(--card)]/50 hover:border-[var(--accent)]/40 backdrop-blur-xs cursor-pointer"
              }`}
          >
            {/* Out of Stock Badge / Active Indicator */}
            {isOutOfStock ? (
              <div className="absolute top-1.5 right-1.5 z-20">
                <span className="px-2 py-0.5 rounded-full bg-red-500/90 border border-white/20 text-white font-bold text-[7px] uppercase tracking-wider shadow-xs whitespace-nowrap">
                  Out of Stock
                </span>
              </div>
            ) : isActive ? (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute top-1.5 right-1.5 text-[var(--accent)] z-20"
              >
                <FiCheckCircle className="w-3.5 h-3.5" />
              </motion.div>
            ) : null}

            {/* Curvy Ambient Wave & Gem Watermark SVG */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-[inherit]">
              <svg viewBox="0 0 200 70" preserveAspectRatio="none" className="absolute -bottom-0.5 inset-x-0 w-full h-11 opacity-[0.035] dark:opacity-[0.07] text-[var(--accent)] group-hover:opacity-[0.12] transition-opacity">
                <path d="M0,70 Q50,22 100,50 T200,26 L200,70 Z" fill="currentColor" />
                <path d="M0,70 Q50,22 100,50 T200,26" fill="none" stroke="currentColor" strokeWidth="1.2" />
              </svg>

              <div className="absolute -right-2 -bottom-2 w-12 h-12 opacity-[0.03] dark:opacity-[0.07] text-[var(--accent)] group-hover:opacity-[0.11] group-hover:scale-105 transition-all">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
                  <path d="M6 3h12l4 6-10 12L2 9z" />
                  <path d="M11 3L8 9l4 12 4-12-3-6" />
                  <path d="M2 9h20" />
                </svg>
              </div>
            </div>

            <div className="flex flex-col gap-1.5 relative z-10">
              <div className="flex items-center gap-1.5 pr-4">
                <div className="relative w-4.5 h-4.5 shrink-0 rounded-md overflow-hidden">
                  <Image 
                    src={item.itemImageId?.image || gameImage || logo} 
                    alt={item.itemName} 
                    fill 
                    className="object-cover"
                  />
                </div>
                <h3 className="text-[11.5px] sm:text-[12px] font-bold text-[var(--foreground)] truncate leading-tight">
                  {item.itemName}
                </h3>
              </div>

              <div className="flex items-center justify-between mt-1">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-sm sm:text-[15px] font-black text-[var(--accent)] tabular-nums leading-none">
                    {formatPrice(item.sellingPrice)}
                  </span>
                  {item.dummyPrice && (
                    <span className="text-[9px] sm:text-[9.5px] line-through text-[var(--muted)]/60 font-semibold tabular-nums">
                      {formatPrice(item.dummyPrice)}
                    </span>
                  )}
                </div>

                {/* Curvy Save Badge */}
                {item.dummyPrice && item.dummyPrice > item.sellingPrice && (
                  <span className="text-[8px] sm:text-[8.5px] font-black text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full leading-none">
                    -{Math.round(((item.dummyPrice - item.sellingPrice) / item.dummyPrice) * 100)}%
                  </span>
                )}
              </div>
            </div>

            {/* Hover Backdrop Glow */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none bg-gradient-to-br from-[var(--accent)]/5 to-transparent" />
          </motion.div>
        );
      })}
    </div>
  );
}
