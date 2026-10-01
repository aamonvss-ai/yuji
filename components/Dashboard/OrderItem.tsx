"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { useCurrency } from "@/components/CurrencyContext";

/* ================= TYPES ================= */

export type OrderType = {
  orderId: string;
  gameSlug: string;
  itemName: string;
  playerId: string;
  zoneId: string;
  paymentMethod: string;
  price: number;
  status: string;
  topupStatus?: string;
  createdAt: string;
};

/* ================= GAME NAME ================= */

const getGameName = (slug: string) => {
  const s = slug.toLowerCase();
  const mlbbSlugs = [
    "mobile-legends114", "mlbb-smallphp638", "mlbb-double332",
    "sgmy-mlbb893", "value-pass-ml948", "mlbb-russia953", "mlbb-indo42","value-pass-ml838"
  ];
  if (mlbbSlugs.some((k) => s.includes(k))) return "Mobile Legends";
  if (s.includes("pubg-mobile138")) return "BGMI";
  return slug;
};

/* ================= MAIN ================= */

export default function OrderItem({ order }: { order: OrderType }) {
  const [copied, setCopied] = useState(false);
  const { formatPrice } = useCurrency();

  const status = (order.topupStatus || order.status).toLowerCase();

  const getStatusConfig = (s: string) => {
    switch (s) {
      case "success":
        return {
          colors: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
          label: "Delivered"
        };
      case "failed":
        return {
          colors: "bg-rose-500/10 text-rose-500 border-rose-500/20",
          label: "Failed"
        };
      case "refund":
      case "refunded":
        return {
          colors: "bg-sky-500/10 text-sky-500 border-sky-500/20",
          label: "Refunded"
        };
      default:
        return {
          colors: "bg-amber-500/10 text-amber-500 border-amber-500/20",
          label: "Processing"
        };
    }
  };

  const config = getStatusConfig(status);

  return (
    <div className="group relative rounded-xl border border-[var(--border)] bg-[var(--card)]/40 hover:border-[var(--accent)]/40 transition-all p-3 shadow-xs space-y-2">
      {/* TOP ROW: Status badge + Order ID (with copy) + Price */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider border shrink-0 ${config.colors}`}>
            {config.label}
          </span>
          <span className="text-[9px] font-mono text-[var(--muted)] truncate max-w-[130px] sm:max-w-[220px]">
            #{order.orderId}
          </span>
          <button
            onClick={() => {
              navigator.clipboard.writeText(order.orderId);
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            }}
            className={`p-1 rounded transition-colors shrink-0 ${
              copied ? "text-emerald-500 bg-emerald-500/10" : "text-[var(--muted)] hover:text-[var(--foreground)]"
            }`}
            title="Copy Order ID"
          >
            {copied ? <Check size={11} /> : <Copy size={11} />}
          </button>
        </div>

        <div className="text-sm sm:text-base font-black text-[var(--foreground)] shrink-0">
          {formatPrice(order.price)}
        </div>
      </div>

      {/* MIDDLE ROW: Item name & Game name */}
      <div className="flex items-center justify-between gap-2">
        <h3 className="font-bold text-xs sm:text-[13px] text-[var(--foreground)] truncate">
          {order.itemName}
        </h3>
        <span className="text-[9.5px] font-semibold text-[var(--accent)] shrink-0">
          {getGameName(order.gameSlug)}
        </span>
      </div>

      {/* BOTTOM ROW: Compact Player Meta Info */}
      <div className="pt-2 border-t border-[var(--border)]/30 flex flex-wrap items-center gap-x-3.5 gap-y-1 text-[9.5px]">
        <div className="flex items-center gap-1">
          <span className="text-[var(--muted)] font-medium">Player ID:</span>
          <span className="font-mono font-semibold text-[var(--foreground)]">{order.playerId}</span>
        </div>
        {order.zoneId && order.zoneId !== "N/A" && order.zoneId !== "NA" && (
          <div className="flex items-center gap-1">
            <span className="text-[var(--muted)] font-medium">Zone:</span>
            <span className="font-mono font-semibold text-[var(--foreground)]">{order.zoneId}</span>
          </div>
        )}
        <div className="flex items-center gap-1">
          <span className="text-[var(--muted)] font-medium">Payment:</span>
          <span className="font-semibold uppercase text-[var(--foreground)]">{order.paymentMethod}</span>
        </div>
        <div className="ml-auto text-[8.5px] text-[var(--muted)]">
          {new Date(order.createdAt).toLocaleDateString()}
        </div>
      </div>
    </div>
  );
}
