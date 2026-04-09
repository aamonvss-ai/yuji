"use client";

import Image from "next/image";
import logo from "@/public/logo.png";
import { motion } from "framer-motion";
import { FiArrowRight } from "react-icons/fi";

export default function BuyPanel({
  activeItem,
  onBuy,
  redirecting,
  buyPanelRef,
}) {
  if (!activeItem) return null;

  const discount = activeItem?.dummyPrice
    ? Math.round(((activeItem.dummyPrice - activeItem.sellingPrice) / activeItem.dummyPrice) * 100)
    : 0;

  return (
    <motion.div
      ref={buyPanelRef}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-6xl mx-auto bg-[var(--card)]/50 border border-[var(--border)]
      rounded-2xl p-3 md:p-4 flex flex-col gap-3 backdrop-blur-md"
    >
      <div className="flex gap-4 items-center">
        <div className="relative w-14 h-14 md:w-16 md:h-16 rounded-lg overflow-hidden border border-white/5 shrink-0">
          <Image
            src={activeItem?.itemImageId?.image || logo}
            alt={activeItem?.itemName || "Item"}
            fill
            className="object-cover"
          />
        </div>

        <div className="flex-1 min-w-0">
          <h2 className="text-lg font-bold text-[var(--foreground)] truncate leading-tight">
            {activeItem?.itemName}
          </h2>

          <div className="flex items-center gap-2.5 mt-1">
            <p className="text-xl font-black text-[var(--accent)]">
              ₹{activeItem?.sellingPrice}
            </p>

            {activeItem?.dummyPrice && (
              <div className="flex items-center gap-2">
                <p className="text-xs line-through text-[var(--muted)] opacity-50 font-bold">
                  ₹{activeItem?.dummyPrice}
                </p>
                {discount > 0 && (
                  <span className="text-[10px] font-bold text-green-500">
                    {discount}% off
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <button
        onClick={() => onBuy(activeItem)}
        disabled={redirecting}
        className={`w-full h-12 rounded-xl font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2
          ${redirecting
            ? "bg-[var(--border)] text-[var(--muted)] cursor-not-allowed"
            : "bg-[var(--accent)] text-black hover:opacity-90 active:scale-[0.98]"
          }`}
      >
        {redirecting ? (
          "Processing order..."
        ) : (
          <>
            Buy Now
            <FiArrowRight />
          </>
        )}
      </button>

      <p className="text-center text-[10px] font-medium text-[var(--muted)] opacity-60">
        Secure checkout & instant delivery
      </p>
    </motion.div>
  );
}
