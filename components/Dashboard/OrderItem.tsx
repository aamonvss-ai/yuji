"use client";

import { useState } from "react";
import {
  ChevronDown,
  Calendar,
  User,
  Grid,
  CreditCard,
  Package,
  Hash,
  Share2,
  Copy,
  X,
  CheckCircle2,
  AlertCircle,
  Clock,
  RotateCcw,
  Zap
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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
    "mobile-legends270", "mlbb-smallphp638", "mlbb-double332",
    "sgmy-mlbb893", "value-pass-ml948", "mlbb-russia953", "mlbb-indo42",
  ];
  if (mlbbSlugs.some((k) => s.includes(k))) return "Mobile Legends";
  if (s.includes("pubg-mobile138")) return "BGMI";
  return slug;
};

/* ================= MAIN ================= */

export default function OrderItem({ order }: { order: OrderType }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const status = (order.topupStatus || order.status).toLowerCase();

  const getStatusConfig = (s: string) => {
    switch (s) {
      case "success":
        return {
          icon: <CheckCircle2 size={12} />,
          colors: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
          accent: "bg-emerald-500",
          label: "Delivered"
        };
      case "failed":
        return {
          icon: <AlertCircle size={12} />,
          colors: "bg-red-500/10 text-red-500 border-red-500/20",
          accent: "bg-red-500",
          label: "Failed"
        };
      case "refund":
      case "refunded":
        return {
          icon: <RotateCcw size={12} />,
          colors: "bg-blue-500/10 text-blue-500 border-blue-500/20",
          accent: "bg-blue-500",
          label: "Refunded"
        };
      default:
        return {
          icon: <Clock size={12} />,
          colors: "bg-amber-500/10 text-amber-500 border-amber-500/20",
          accent: "bg-amber-500",
          label: "Processing"
        };
    }
  };

  const config = getStatusConfig(status);

  return (
    <>
      <div
        className={`group relative overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--card)]/40 transition-all duration-300 hover:border-[var(--accent)]/30 ${open ? 'border-[var(--accent)]/50 shadow-lg shadow-[var(--accent)]/5' : ''}`}
      >
        {/* HEADER AREA */}
        <div className="p-2 md:p-2.5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className={`px-1.5 py-0.5 rounded text-[7px] font-black uppercase tracking-[0.2em] border ${config.colors} italic`}>
                  {config.label}
                </span>
                <span className="text-[7px] font-black text-[var(--muted)] opacity-30 uppercase tracking-widest italic">
                  #{order.orderId}
                </span>
              </div>

              <h3 className="font-black text-[11px] md:text-xs uppercase tracking-tight truncate text-[var(--foreground)] leading-tight italic">{order.itemName}</h3>

              <div className="flex items-center gap-2.5 text-[8px] text-[var(--muted)] font-black uppercase tracking-widest mt-0.5 opacity-40 italic">
                <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                <span className="w-1 h-1 bg-[var(--border)] rounded-full" />
                <span className="text-[var(--accent)]">{getGameName(order.gameSlug)}</span>
              </div>
            </div>

            <div className="flex items-center justify-between md:items-center gap-3">
              <div className="text-sm font-black text-[var(--foreground)] tracking-tighter italic">₹{order.price}</div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(order.orderId);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  className={`w-7 h-7 rounded-lg border flex items-center justify-center transition-all active:scale-90 ${copied ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30' : 'bg-[var(--foreground)]/[0.03] border-transparent text-[var(--muted)] hover:text-[var(--accent)] hover:border-[var(--accent)]/30'}`}
                  title="Copy ID"
                >
                  <Copy size={10} />
                </button>
                <button
                  onClick={() => setOpen(!open)}
                  className={`w-7 h-7 rounded-lg border transition-all flex items-center justify-center active:scale-90 ${open ? 'bg-[var(--accent)] text-black border-[var(--accent)] shadow-lg shadow-[var(--accent)]/20' : 'bg-[var(--foreground)]/[0.03] text-[var(--muted)] border-transparent hover:border-[var(--accent)]/30'}`}
                >
                  <ChevronDown size={12} className={`transition-transform duration-300 ${open ? "rotate-180" : ""}`} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* EXPANDED SECTION */}
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <div className="px-2 pb-2 pt-0.5 border-t border-[var(--border)]/10">
                <div className="grid grid-cols-2 gap-1.5 mt-1.5">
                  <DetailItem label="Player ID" value={order.playerId} mono />
                  <DetailItem label="Zone ID" value={order.zoneId || "N/A"} mono />
                  <DetailItem label="Payment" value={order.paymentMethod} />
                  <DetailItem label="Package" value={order.itemName} />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}

/* ================= HELPERS ================= */

function DetailItem({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-center justify-between p-1.5 rounded-lg bg-[var(--foreground)]/[0.02] border border-[var(--border)]/30">
      <span className="text-[7px] font-black text-[var(--muted)] uppercase tracking-widest opacity-40 italic">{label}</span>
      <span className={`text-[9px] font-black tracking-tight ${mono ? "font-mono" : ""} truncate uppercase text-[var(--foreground)] italic`}>
        {value}
      </span>
    </div>
  );
}
