"use client";

import Image from "next/image";
import logo from "@/public/logo.png";
import { motion } from "framer-motion";
import { FiArrowRight } from "react-icons/fi";
import { useCurrency } from "@/components/CurrencyContext";

export default function BuyPanel({
  activeItem,
  onBuy,
  redirecting,
  buyPanelRef,
  systemSettings,
}) {
  const { formatPrice } = useCurrency();

  if (!activeItem) return null;

  const discount = activeItem?.dummyPrice
    ? Math.round(((activeItem.dummyPrice - activeItem.sellingPrice) / activeItem.dummyPrice) * 100)
    : 0;

  return (
    <motion.div
      ref={buyPanelRef}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-6xl mx-auto relative overflow-hidden bg-[var(--card)]/60 border border-[var(--border)]
      rounded-2xl p-2.5 sm:p-3 flex flex-col gap-2 sm:gap-2.5 backdrop-blur-md shadow-xs"
    >
      {/* Curvy Ambient Wave & Gem SVG */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-[inherit]">
        <svg viewBox="0 0 200 70" preserveAspectRatio="none" className="absolute -bottom-0.5 inset-x-0 w-full h-14 opacity-[0.035] dark:opacity-[0.06] text-[var(--accent)]">
          <path d="M0,70 Q50,22 100,50 T200,26 L200,70 Z" fill="currentColor" />
          <path d="M0,70 Q50,22 100,50 T200,26" fill="none" stroke="currentColor" strokeWidth="1.2" />
        </svg>

        <div className="absolute -right-3 -bottom-3 w-20 h-20 opacity-[0.03] dark:opacity-[0.06] text-[var(--accent)]">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
            <path d="M6 3h12l4 6-10 12L2 9z" />
            <path d="M11 3L8 9l4 12 4-12-3-6" />
            <path d="M2 9h20" />
          </svg>
        </div>
      </div>

      <div className="flex gap-2.5 sm:gap-3 items-center relative z-10">
        <div className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-lg overflow-hidden border border-[var(--border)] shrink-0 shadow-xs">
          <Image
            src={activeItem?.itemImageId?.image || logo}
            alt={activeItem?.itemName || "Item"}
            fill
            className={`object-cover ${!(activeItem?.itemImageId?.image) ? "logo-img" : ""}`}
          />
        </div>

        <div className="flex-1 min-w-0">
          <h2 className="text-sm sm:text-base font-bold text-[var(--foreground)] truncate leading-tight">
            {activeItem?.itemName}
          </h2>

          <div className="flex items-center gap-2 mt-0.5">
            <p className="text-base sm:text-lg font-black text-[var(--accent)] tabular-nums leading-none">
              {formatPrice(activeItem?.sellingPrice)}
            </p>

            {activeItem?.dummyPrice && (
              <div className="flex items-center gap-1.5">
                <p className="text-[10px] sm:text-[11px] line-through text-[var(--muted)]/60 font-semibold tabular-nums">
                  {formatPrice(activeItem?.dummyPrice)}
                </p>
                {discount > 0 && (
                  <span className="text-[8.5px] sm:text-[9px] font-black text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1 py-0.5 rounded leading-none">
                    {discount}% off
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {systemSettings?.acceptingOrders === false ? (
        <div className="w-full text-center p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 shadow-xs relative z-10">
          <p className="text-xs font-bold leading-relaxed">
            {systemSettings.notAcceptingOrdersMessage}
          </p>
        </div>
      ) : (activeItem?.isOutOfStock || activeItem?.itemAvailablity === false) ? (
        <button
          disabled
          className="w-full h-9 sm:h-10 rounded-xl font-bold text-xs sm:text-sm bg-red-500/15 border border-red-500/30 text-red-500 cursor-not-allowed flex items-center justify-center gap-1.5 relative z-10"
        >
          Out of Stock
        </button>
      ) : (
        <button
          onClick={() => onBuy(activeItem)}
          disabled={redirecting}
          className={`w-full h-9 sm:h-10 rounded-xl font-bold text-xs sm:text-sm transition-all duration-200 flex items-center justify-center gap-1.5 shadow-md shadow-[var(--accent)]/10 active:scale-[0.99] relative z-10
            ${redirecting
              ? "bg-[var(--border)] text-[var(--muted)] cursor-not-allowed"
              : "bg-gradient-to-r from-[var(--accent)] to-[var(--accent-hover)] text-white hover:brightness-105"
            }`}
        >
          {redirecting ? (
            "Processing order..."
          ) : (
            <>
              Buy Now
              <FiArrowRight size={14} />
            </>
          )}
        </button>
      )}

      <p className="text-center text-[9px] sm:text-[10px] font-medium text-[var(--muted)]/60 relative z-10 -mt-0.5">
        Secure checkout & instant delivery
      </p>
    </motion.div>
  );
}
