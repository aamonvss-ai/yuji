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
            className={`group relative rounded-2xl px-3 py-3 sm:px-3.5 sm:py-3.5 border transition-all duration-200 overflow-hidden min-h-[74px] sm:min-h-[78px] flex flex-col justify-between
              ${isOutOfStock
                 ? "border-red-500/20 bg-red-500/[0.04] opacity-55 grayscale cursor-not-allowed"
                 : isActive
                 ? "border-[var(--accent)] bg-[var(--accent)]/10 shadow-[0_0_15px_rgba(59,130,246,0.12)] cursor-pointer"
                 : "border-[var(--border)] bg-[var(--card)]/50 hover:border-[var(--accent)]/40 backdrop-blur-xs cursor-pointer"
              }`}
          >
            {/* Top Right: Badges & Indicators */}
            <div className="absolute top-2 right-2 z-20 flex items-center gap-1.5 pointer-events-none">
              {isOutOfStock ? (
                <span className="px-2 py-0.5 rounded-full bg-red-500/90 border border-white/20 text-white font-bold text-[7px] uppercase tracking-wider shadow-xs whitespace-nowrap">
                  Out of Stock
                </span>
              ) : (
                <>
                  {item.dummyPrice && item.dummyPrice > item.sellingPrice && (
                    <span className="px-1.5 py-0.5 rounded-full bg-red-500 text-white font-black text-[7.5px] sm:text-[8px] leading-none shadow-xs tracking-tight">
                      -{Math.round(((item.dummyPrice - item.sellingPrice) / item.dummyPrice) * 100)}%
                    </span>
                  )}
                  {isActive && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="text-[var(--accent)]"
                    >
                      <FiCheckCircle className="w-3.5 h-3.5" />
                    </motion.div>
                  )}
                </>
              )}
            </div>

            {/* Faceted Premium Diamond Watermark SVG - High Visibility on Both Light & Dark Themes */}
            <div className="absolute -right-2 -bottom-2.5 w-14 h-14 sm:w-16 sm:h-16 pointer-events-none opacity-[0.14] dark:opacity-[0.18] group-hover:opacity-[0.25] dark:group-hover:opacity-[0.30] text-[var(--accent)] transition-all duration-300 group-hover:scale-105">
              <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                {/* Table facet */}
                <polygon points="20,10 44,10 54,24 10,24" fill="currentColor" fillOpacity="0.35" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
                {/* Crown facets */}
                <polygon points="10,24 20,10 26,24" fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
                <polygon points="26,24 20,10 44,10 38,24" fill="currentColor" fillOpacity="0.5" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
                <polygon points="44,10 54,24 38,24" fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
                {/* Pavilion facets meeting at culet (32, 56) */}
                <polygon points="10,24 26,24 32,56" fill="currentColor" fillOpacity="0.25" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
                <polygon points="26,24 38,24 32,56" fill="currentColor" fillOpacity="0.6" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
                <polygon points="38,24 54,24 32,56" fill="currentColor" fillOpacity="0.35" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
              </svg>
            </div>

            <div className="flex flex-col gap-1.5 relative z-10">
              <div className="flex items-center gap-1.5 pr-12">
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

              <div className="flex items-baseline gap-1.5 mt-1">
                <span className="text-sm sm:text-[15px] font-black text-[var(--accent)] tabular-nums leading-none">
                  {formatPrice(item.sellingPrice)}
                </span>
                {item.dummyPrice && (
                  <span className="text-[9px] sm:text-[9.5px] line-through text-[var(--muted)]/60 font-semibold tabular-nums">
                    {formatPrice(item.dummyPrice)}
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
