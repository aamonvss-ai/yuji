"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  XCircle,
  Loader2,
  Home,
  History,
  ShieldCheck,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";
import confetti from "canvas-confetti";

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

        // Subtle delay for smoother transition
        await new Promise(r => setTimeout(r, 1500));

        const res = await fetch("/api/order/verify-topup-payment", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ orderId }),
        });

        const data = await res.json();

        if (data?.success) {
          setStatus("success");
          setOrderData(data.order || { orderId });
          localStorage.removeItem("pending_topup_order");
          confetti({
            particleCount: 150,
            spread: 70,
            origin: { y: 0.6 },
            zIndex: 100
          });
        } else {
          setStatus("failed");
        }
      } catch (err) {
        console.error("Verification error:", err);
        setStatus("failed");
      }
    }

    verify();
  }, []);

  return (
    <div className="min-h-[80vh] flex items-start justify-center bg-transparent px-4 pt-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        <div className="p-8 text-center relative">


          <AnimatePresence mode="wait">
            {status === "checking" && (
              <motion.div
                key="checking"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="py-6"
              >
                <div className="flex justify-center mb-6">
                  <div className="w-16 h-16 rounded-2xl bg-[var(--accent)]/10 flex items-center justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-[var(--accent)]" />
                  </div>
                </div>
                <h1 className="text-xl font-bold text-[var(--foreground)] mb-2">
                  Checking Payment
                </h1>
                <p className="text-sm text-[var(--muted)] px-4">
                  We are verifying your transaction. Please wait a moment.
                </p>
              </motion.div>
            )}

            {status === "success" && (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-6"
              >
                <div className="flex justify-center mb-6">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500"
                  >
                    <CheckCircle2 size={40} />
                  </motion.div>
                </div>

                <h1 className="text-2xl font-bold text-[var(--foreground)] mb-1">
                  Success!
                </h1>
                <p className="text-sm text-[var(--muted)] mb-8">
                  Your payment has been verified.
                </p>

                <div className="bg-[var(--foreground)]/[0.03] border border-[var(--border)] rounded-2xl p-4 mb-8 text-left space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-[var(--muted)]">Order ID</span>
                    <span className="font-mono text-[var(--foreground)]">
                      #{orderData?.orderId?.slice(-8) || '...'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-[var(--muted)]">Status</span>
                    <span className="text-emerald-500 font-medium">Success</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <Link
                    href="/dashboard/order"
                    className="flex items-center justify-center gap-2 w-full py-4 rounded-2xl bg-[var(--foreground)] text-[var(--background)] text-sm font-bold transition-transform hover:scale-[1.02] active:scale-95"
                  >
                    <History size={16} />
                    Track Order
                  </Link>
                  <Link
                    href="/"
                    className="flex items-center justify-center gap-2 w-full py-4 rounded-2xl border border-[var(--border)] text-[var(--foreground)] text-sm font-medium hover:bg-[var(--foreground)]/5 transition-colors"
                  >
                    <Home size={16} />
                    Home
                  </Link>
                </div>
              </motion.div>
            )}

            {status === "failed" && (
              <motion.div
                key="failed"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-6"
              >
                <div className="flex justify-center mb-6">
                  <div className="w-20 h-20 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-500">
                    <XCircle size={40} />
                  </div>
                </div>

                <h1 className="text-xl font-bold text-[var(--foreground)] mb-2">
                  Payment Failed
                </h1>
                <p className="text-sm text-[var(--muted)] mb-8 px-4">
                  We couldn't verify your payment. If money was deducted, it will be added shortly.
                </p>

                <div className="space-y-3">
                  <button
                    onClick={() => window.location.reload()}
                    className="flex items-center justify-center gap-2 w-full py-4 rounded-2xl bg-rose-500 text-white text-sm font-bold hover:bg-rose-600 transition-colors"
                  >
                    <RefreshCw size={16} />
                    Try Again
                  </button>
                  <Link
                    href="/"
                    className="flex items-center justify-center gap-2 w-full py-4 rounded-2xl border border-[var(--border)] text-[var(--foreground)] text-sm font-medium hover:bg-[var(--foreground)]/5 transition-colors"
                  >
                    <Home size={16} />
                    Back to Shop
                  </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="mt-8 flex justify-center items-center gap-2 text-[10px] text-[var(--muted)] uppercase tracking-widest font-bold">
          <ShieldCheck size={12} className="text-emerald-500" />
          Secure Payment Verification
        </div>
      </motion.div>
    </div>
  );
}
