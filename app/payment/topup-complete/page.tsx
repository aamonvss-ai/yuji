"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  XCircle,
  Loader2,
  Home,
  ShoppingBag,
  Clock,
  ExternalLink,
  CreditCard,
  History,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";

export default function TopupComplete() {
  const [status, setStatus] = useState("checking"); // checking | success | failed
  const [orderData, setOrderData] = useState<any>(null);

  useEffect(() => {
    const orderId = localStorage.getItem("pending_topup_order");

    if (!orderId) {
      setStatus("failed");
      return;
    }

    async function verify() {
      try {
        const token = localStorage.getItem("token");

        // Artificial delay for better UX feel during verification
        await new Promise(r => setTimeout(r, 2000));

        const res = await fetch("/api/order/verify-topup-payment", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ orderId }),
        });

        const data = await res.json();

        if (data?.success) {
          setStatus("success");
          setOrderData(data.order || { orderId });
          // cleanup
          localStorage.removeItem("pending_topup_order");
        } else {
          setStatus("failed");
        }
      } catch (err) {
        console.error("Topup verification error:", err);
        setStatus("failed");
      }
    }

    verify();
  }, []);

  const containerVariants = {
    initial: { opacity: 0, scale: 0.9, y: 30 },
    animate: { opacity: 1, scale: 1, y: 0 }
  };

  const particleVariants = {
    animate: (i: number) => ({
      y: [0, -100 - Math.random() * 100],
      x: [0, (Math.random() - 0.5) * 200],
      opacity: [0, 1, 0],
      scale: [0, 1, 0],
      transition: {
        duration: 1 + Math.random(),
        repeat: Infinity,
        delay: Math.random() * 2,
      },
    }),
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center bg-[var(--background)] px-4 overflow-hidden">
      {/* Static Background Decor */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-15%] right-[-10%] w-[50%] h-[50%] bg-[var(--accent)]/5 rounded-full blur-[140px]" />
        <div className="absolute bottom-[-15%] left-[-10%] w-[50%] h-[50%] bg-purple-500/5 rounded-full blur-[140px]" />
      </div>

      <motion.div
        variants={containerVariants}
        initial="initial"
        animate="animate"
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-md relative z-10"
      >
        <div className="relative rounded-[3rem] border border-[var(--border)] bg-[var(--card)]/60 backdrop-blur-2xl shadow-[0_32px_64px_-16px_rgba(0,0,0,0.4)] p-8 md:p-12 overflow-hidden text-center">
          {/* Top Decorative Indicator */}
          <div className={`absolute top-0 left-0 right-0 h-2 ${status === 'success' ? 'bg-gradient-to-r from-emerald-500 to-teal-400' :
            status === 'failed' ? 'bg-gradient-to-r from-rose-500 to-pink-500' :
              'bg-gradient-to-r from-[var(--accent)] to-cyan-400'
            }`} />

          <AnimatePresence mode="wait">
            {status === "checking" && (
              <motion.div
                key="checking"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center py-10"
              >
                <div className="relative mb-10">
                  <div className="w-24 h-24 rounded-3xl bg-[var(--accent)]/5 flex items-center justify-center">
                    <Loader2 className="w-12 h-12 animate-spin text-[var(--accent)]" />
                  </div>
                </div>

                <h1 className="text-3xl font-black text-[var(--foreground)] uppercase tracking-tight mb-4 italic">
                  Syncing <span className="text-[var(--accent)] tracking-[-0.1em] ml-1">...</span>
                </h1>
                <p className="text-sm text-[var(--muted)] text-center leading-relaxed max-w-[240px]">
                  Confirming your transaction with the payment gateway.
                </p>

                <div className="mt-12 flex items-center gap-2 px-4 py-2 rounded-full border border-[var(--border)] bg-[var(--foreground)]/[0.02]">
                  <ShieldCheck size={14} className="text-emerald-500" />
                  <span className="text-[10px] font-black text-[var(--muted)] uppercase tracking-[0.2em]">Verified Payment Layer</span>
                </div>
              </motion.div>
            )}

            {status === "success" && (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center py-6"
              >
                <div className="relative mb-10 overflow-visible">
                  <motion.div
                    initial={{ scale: 0, rotate: -45 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", damping: 10, stiffness: 100, delay: 0.2 }}
                    className="w-28 h-28 rounded-[2rem] bg-emerald-500/10 border-4 border-emerald-500/20 flex items-center justify-center text-emerald-500 shadow-[0_20px_40px_rgba(16,185,129,0.2)]"
                  >
                    <CheckCircle2 size={56} strokeWidth={2.5} />
                  </motion.div>

                  <motion.div
                    initial={{ scale: 0, rotate: -45 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", damping: 15, stiffness: 100, delay: 0.2 }}
                    className="w-28 h-28 rounded-[2rem] bg-emerald-500/10 border-4 border-emerald-500/20 flex items-center justify-center text-emerald-500 shadow-[0_20px_40px_rgba(16,185,129,0.1)]"
                  >
                    <CheckCircle2 size={56} strokeWidth={2.5} />
                  </motion.div>
                </div>

                <div className="space-y-2 mb-10">
                  <h1 className="text-4xl font-black text-[var(--foreground)] uppercase tracking-tighter italic leading-none">
                    Success!
                  </h1>
                  <p className="text-sm text-[var(--muted)] font-bold tracking-wide uppercase opacity-60">
                    Order has been green-lit
                  </p>
                </div>

                <div className="w-full space-y-4 bg-[var(--foreground)]/[0.03] border border-[var(--border)] rounded-[2rem] p-6 mb-10 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4 opacity-5 transition-transform group-hover:scale-110">
                    <History size={64} />
                  </div>
                  <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-wider text-[var(--muted)]">
                    <span>Transaction ID</span>
                    <span className="font-mono text-[var(--foreground)] bg-[var(--foreground)]/5 px-2 py-1 rounded-md">
                      #{orderData?.orderId?.slice(-8) || 'CONFIRMED'}
                    </span>
                  </div>
                  <div className="h-px bg-[var(--border)] opacity-30" />
                  <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-wider text-[var(--muted)]">
                    <span>Current Status</span>
                    <span className="flex items-center gap-1.5 text-emerald-500 font-black italic">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      In Processing
                    </span>
                  </div>
                </div>

                <div className="w-full flex flex-col gap-4">
                  <Link
                    href="/dashboard/order"
                    className="w-full py-5 rounded-[1.5rem] bg-[var(--foreground)] text-[var(--background)] font-black uppercase text-xs tracking-[0.2em] flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all shadow-2xl "
                  >
                    <History size={18} />
                    Track Order
                  </Link>
                  <Link
                    href="/"
                    className="w-full py-5 rounded-[1.5rem] border border-[var(--border)] text-[var(--foreground)] font-black uppercase text-[10px] tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-[var(--foreground)]/[0.05] active:scale-95 transition-all"
                  >
                    <Home size={18} />
                    Return Home
                  </Link>
                </div>
              </motion.div>
            )}

            {status === "failed" && (
              <motion.div
                key="failed"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center py-6"
              >
                <div className="relative mb-10">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", damping: 12, stiffness: 200 }}
                    className="w-28 h-28 rounded-[2rem] bg-rose-500/10 border-4 border-rose-500/20 flex items-center justify-center text-rose-500 shadow-[0_20px_40px_rgba(244,63,94,0.2)]"
                  >
                    <XCircle size={56} strokeWidth={2.5} />
                  </motion.div>
                </div>

                <h1 className="text-4xl font-black text-[var(--foreground)] uppercase tracking-tighter italic mb-4 text-center leading-none">
                  Payment <span className="text-rose-500">Stalled</span>
                </h1>
                <p className="text-sm text-[var(--muted)] font-medium text-center mb-12 px-6 leading-relaxed max-w-xs">
                  We couldn't verify your payment. If funds were debited, they will be auto-processed within 10 mins.
                </p>

                <div className="w-full flex flex-col gap-4">
                  <button
                    onClick={() => window.location.reload()}
                    className="w-full py-5 rounded-[1.5rem] bg-rose-500 text-white font-black uppercase text-xs tracking-[0.2em] flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-rose-500/20"
                  >
                    <Loader2 size={18} />
                    Retry Verification
                  </button>
                  <Link
                    href="/"
                    className="w-full py-5 rounded-[1.5rem] border border-[var(--border)] text-[var(--foreground)] font-black uppercase text-[10px] tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-[var(--foreground)]/[0.05] active:scale-95 transition-all"
                  >
                    <Home size={18} />
                    Back to Store
                  </Link>
                </div>

                <div className="mt-12 p-4 rounded-2xl bg-amber-500/5 border border-amber-500/10 flex items-center gap-4 justify-center w-full">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0">
                    <Clock size={16} className="text-amber-500" />
                  </div>
                  <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest leading-normal text-left">
                    Verification Auto-Retry:<br />Every 120 Seconds
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Support Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="mt-12 text-center"
        >
          <div className="flex items-center justify-center gap-8">
            <a href="#" className="group flex flex-col items-center gap-2">
              <div className="w-10 h-10 rounded-full border border-[var(--border)] flex items-center justify-center text-[var(--muted)] transition-all group-hover:border-[var(--accent)] group-hover:text-[var(--accent)] group-hover:bg-[var(--accent)]/5">
                <CreditCard size={14} />
              </div>
              <span className="text-[9px] font-black text-[var(--muted)] uppercase tracking-widest">Help Center</span>
            </a>
            <div className="w-px h-8 bg-[var(--border)] opacity-20" />
            <a href="#" className="group flex flex-col items-center gap-2">
              <div className="w-10 h-10 rounded-full border border-[var(--border)] flex items-center justify-center text-[var(--muted)] transition-all group-hover:border-[var(--accent)] group-hover:text-[var(--accent)] group-hover:bg-[var(--accent)]/5">
                <ShoppingBag size={14} />
              </div>
              <span className="text-[9px] font-black text-[var(--muted)] uppercase tracking-widest">Store Policy</span>
            </a>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
