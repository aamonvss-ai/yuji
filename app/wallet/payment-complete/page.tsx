"use client";

import { useEffect, useState } from "react";
import { FaCheckCircle, FaTimesCircle, FaSpinner } from "react-icons/fa";

import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";

export default function PaymentComplete() {
  const [status, setStatus] = useState("checking"); // checking | success | failed
  const [message, setMessage] = useState("Checking payment status...");

  useEffect(() => {
    const orderId = localStorage.getItem("pending_order");
    const userId = localStorage.getItem("userId");

    if (!orderId) {
      setStatus("failed");
      setMessage("Order not found");
      return;
    }

    async function checkPayment() {
      try {
        const res = await fetch("/api/wallet/check-status", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderId, userId }),
        });

        const data = await res.json();

        if (data?.success) {
          setStatus("success");
          setMessage("Payment Successful!");
          confetti({
            particleCount: 150,
            spread: 70,
            origin: { y: 0.6 },
            zIndex: 100
          });

          // Update wallet balance
          const oldBal = Number(localStorage.getItem("walletBalance") || "0");
          const newBal = oldBal + Number(data.amount || 0);
          localStorage.setItem("walletBalance", String(newBal));

          // Optional cleanup
          localStorage.removeItem("pending_order");
        } else {
          setStatus("failed");
          setMessage("Payment failed or still pending");
        }
      } catch (err) {
        console.error("Payment check error:", err);
        setStatus("failed");
        setMessage("Unable to verify payment");
      }
    }

    checkPayment();
  }, []);

  return (
    <div className="min-h-screen relative flex items-start justify-center bg-transparent px-4 pt-20 overflow-hidden">
      {/* --- Premium Background System --- */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div
          className="absolute -top-[20%] -left-[20%] w-full h-full bg-gradient-to-br from-[var(--accent)] to-transparent blur-[120px] rounded-full opacity-[0.05]"
        />
        <div
          className="absolute -bottom-[20%] -right-[20%] w-full h-full bg-gradient-to-tl from-[#7dd3fc] to-transparent blur-[100px] rounded-full opacity-[0.03]"
        />
        <div className="absolute inset-0 opacity-[0.2] bg-[radial-gradient(circle_at_center,transparent_0%,var(--background)_100%)]" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full max-w-md p-10 text-center relative z-10"
      >
        {/* ICON SECTION */}
        <div className="flex justify-center mb-10">
          <div className="relative">
            {/* Ambient Glows */}
            <AnimatePresence mode="wait">
              {status === "checking" && (
                <motion.div
                  key="check-glow"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-[var(--accent)]/20 blur-3xl rounded-full scale-150"
                />
              )}
              {status === "success" && (
                <motion.div
                  key="success-glow"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute inset-0 bg-emerald-500/20 blur-3xl rounded-full scale-150"
                />
              )}
              {status === "failed" && (
                <motion.div
                  key="failed-glow"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute inset-0 bg-rose-500/20 blur-3xl rounded-full scale-150"
                />
              )}
            </AnimatePresence>

            <div className={`relative w-24 h-24 rounded-[2rem] flex items-center justify-center transition-colors duration-500 ${status === 'success' ? 'bg-emerald-500/10' :
              status === 'failed' ? 'bg-rose-500/10' : 'bg-[var(--accent)]/10'
              }`}>
              <AnimatePresence mode="wait">
                {status === "checking" && (
                  <motion.div
                    key="checking-icon"
                    initial={{ opacity: 0, rotate: -45 }}
                    animate={{ opacity: 1, rotate: 0 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                  >
                    <FaSpinner className="text-4xl animate-spin text-[var(--accent)]" />
                  </motion.div>
                )}
                {status === "success" && (
                  <motion.div
                    key="success-icon"
                    initial={{ scale: 0, rotate: -45 }}
                    animate={{ scale: 1, rotate: 0 }}
                    className="text-emerald-500"
                  >
                    <FaCheckCircle size={48} />
                  </motion.div>
                )}
                {status === "failed" && (
                  <motion.div
                    key="failed-icon"
                    initial={{ scale: 0, rotate: 45 }}
                    animate={{ scale: 1, rotate: 0 }}
                    className="text-rose-500"
                  >
                    <FaTimesCircle size={48} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* STATUS TEXT */}
        <div className="space-y-3 mb-10">
          <motion.h1
            key={message}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-extrabold tracking-tight text-[var(--foreground)]"
          >
            {message}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-base text-[var(--muted)] font-medium max-w-[280px] mx-auto leading-relaxed"
          >
            {status === "checking" && "Please wait while we verify your transaction."}
            {status === "success" && "Your wallet balance has been updated successfully."}
            {status === "failed" && "If money was deducted, it will be credited to your account shortly."}
          </motion.p>
        </div>

        {/* ACTION BUTTON */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="relative group"
        >
          <div className="absolute -inset-1 bg-gradient-to-r from-[var(--accent)] to-[#7dd3fc] rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200" />
          <button
            onClick={() => window.location.href = "/dashboard/wallet"}
            className="relative w-full py-4 rounded-2xl bg-[var(--foreground)] text-[var(--background)] text-sm font-bold tracking-wide transition-all hover:scale-[1.02] active:scale-[0.98] shadow-xl"
          >
            Return to Dashboard
          </button>
        </motion.div>

        {/* FOOTER HINT */}
        <p className="mt-8 text-[10px] text-[var(--muted)] font-bold uppercase tracking-[0.2em] opacity-50">
          Secure Wallet Transaction
        </p>
      </motion.div>
    </div>
  );
}
