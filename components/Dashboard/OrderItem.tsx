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
    "mobile-legends988", "mlbb-smallphp638", "mlbb-double332",
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
        <div className="p-2.5 md:p-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-2.5">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                 <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest border ${config.colors}`}>
                    {config.label}
                  </span>
                  <span className="text-[8px] font-bold text-[var(--muted)] opacity-50 uppercase tracking-tighter italic">
                    #{order.orderId}
                  </span>
              </div>

              <h3 className="font-black text-sm uppercase tracking-tight truncate text-[var(--foreground)]">{order.itemName}</h3>

              <div className="flex items-center gap-3 text-[9px] text-[var(--muted)] font-bold uppercase tracking-widest mt-1 opacity-60">
                <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                <span className="text-[var(--accent)]">{getGameName(order.gameSlug)}</span>
              </div>
             </div>
 
            <div className="flex items-center justify-between md:items-center gap-3">
              <div className="text-base font-black text-[var(--foreground)] tracking-tighter">₹{order.price}</div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(order.orderId);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  className={`w-8 h-8 rounded-lg border flex items-center justify-center transition-all active:scale-90 ${copied ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30' : 'bg-[var(--background)] border-[var(--border)] text-[var(--muted)] hover:text-[var(--accent)] hover:border-[var(--accent)]/30'}`}
                  title="Copy ID"
                >
                  <Copy size={12} />
                </button>
                <button
                  onClick={() => setOpen(!open)}
                  className={`w-8 h-8 rounded-lg border transition-all flex items-center justify-center active:scale-90 ${open ? 'bg-[var(--accent)] text-white border-[var(--accent)] shadow-md shadow-[var(--accent)]/20' : 'bg-[var(--card)] text-[var(--muted)] border-[var(--border)] hover:bg-[var(--foreground)]/5'}`}
                >
                  <ChevronDown size={14} className={`transition-transform duration-300 ${open ? "rotate-180" : ""}`} />
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
              <div className="px-3 pb-3 pt-1 border-t border-[var(--border)]/30">
                <div className="grid grid-cols-2 gap-2 mt-2">
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
    <div className="flex items-center justify-between p-2 rounded-xl bg-[var(--foreground)]/[0.02] border border-[var(--border)]">
      <span className="text-[8px] font-bold text-[var(--muted)] uppercase tracking-widest">{label}</span>
      <span className={`text-[10px] font-black tracking-tight ${mono ? "font-mono" : ""} truncate uppercase text-[var(--foreground)]`}>
        {value}
      </span>
    </div>
  );
}
