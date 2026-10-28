"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { WifiOff, RefreshCw, CheckCircle2 } from "lucide-react";

export default function NoInternet() {
  const [isOffline, setIsOffline] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const [retryMessage, setRetryMessage] = useState<string | null>(null);
  const [showBackOnlineToast, setShowBackOnlineToast] = useState(false);

  const checkConnection = useCallback(async (): Promise<boolean> => {
    if (typeof window === "undefined") return true;
    if (!navigator.onLine) return false;

    try {
      const res = await fetch(`/favicon.ico?_=${Date.now()}`, {
        method: "HEAD",
        cache: "no-store",
      });
      return res.ok || res.type === "opaque";
    } catch {
      return false;
    }
  }, []);

  useEffect(() => {
    setMounted(true);

    const handleOffline = () => {
      setIsOffline(true);
      setShowBackOnlineToast(false);
    };

    const handleOnline = async () => {
      const hasConnection = await checkConnection();
      if (hasConnection) {
        setIsOffline(false);
        setShowBackOnlineToast(true);
        setTimeout(() => setShowBackOnlineToast(false), 4000);
      }
    };

    if (typeof window !== "undefined") {
      if (!navigator.onLine) {
        setIsOffline(true);
      }
    }

    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);

    return () => {
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
    };
  }, [checkConnection]);

  const handleRetry = async () => {
    setIsRetrying(true);
    setRetryMessage(null);

    const online = await checkConnection();

    setTimeout(() => {
      setIsRetrying(false);
      if (online) {
        setIsOffline(false);
        setRetryMessage(null);
        setShowBackOnlineToast(true);
        setTimeout(() => setShowBackOnlineToast(false), 4000);
      } else {
        setRetryMessage("Still offline. Check your network.");
        setTimeout(() => setRetryMessage(null), 3000);
      }
    }, 700);
  };

  if (!mounted) return null;

  return (
    <>
      {/* Back Online Toast */}
      <AnimatePresence>
        {showBackOnlineToast && (
          <motion.div
            initial={{ opacity: 0, y: -30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="fixed top-5 left-1/2 -translate-x-1/2 z-[100000] px-4 py-2 rounded-full bg-emerald-500 text-white shadow-lg shadow-emerald-500/25 flex items-center gap-2 text-xs sm:text-sm font-semibold tracking-wide pointer-events-none"
          >
            <CheckCircle2 className="w-4 h-4 text-white" />
            <span>Back online</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Full Screen No Internet Overlay */}
      <AnimatePresence>
        {isOffline && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[99998] bg-slate-900/50 backdrop-blur-md flex items-center justify-center p-4 sm:p-6"
          >
            {/* Minimal Card Container */}
            <motion.div
              initial={{ scale: 0.95, y: 12, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 12, opacity: 0 }}
              transition={{ type: "spring", damping: 26, stiffness: 320 }}
              className="relative w-full max-w-sm bg-white dark:bg-[#0c1017] border border-slate-200/90 dark:border-slate-800/90 rounded-3xl p-6 sm:p-8 shadow-2xl text-center"
            >
              {/* Cute Mascot */}
              <div className="relative mx-auto w-24 h-24 mb-4 flex items-center justify-center">
                <motion.div
                  animate={{ scale: [1, 1.1, 1], opacity: [0.25, 0.45, 0.25] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute inset-0 bg-sky-400/20 rounded-full blur-lg"
                />
                <motion.div
                  animate={{ y: [0, -4, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="relative z-10 w-full h-full"
                >
                  <svg
                    viewBox="0 0 160 160"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-full h-full drop-shadow-sm"
                  >
                    {/* Sleep zZ */}
                    <motion.text
                      x="122"
                      y="42"
                      fill="#38bdf8"
                      fontSize="14"
                      fontWeight="bold"
                      animate={{ opacity: [0.2, 1, 0.2], y: [42, 38, 42] }}
                      transition={{ duration: 2.2, repeat: Infinity }}
                    >
                      z
                    </motion.text>
                    <motion.text
                      x="132"
                      y="30"
                      fill="#60a5fa"
                      fontSize="17"
                      fontWeight="bold"
                      animate={{ opacity: [0.3, 1, 0.3], y: [30, 24, 30] }}
                      transition={{ duration: 2.6, repeat: Infinity, delay: 0.3 }}
                    >
                      Z
                    </motion.text>

                    {/* Antenna */}
                    <path d="M80 50V35" stroke="#94a3b8" strokeWidth="3" strokeLinecap="round" />
                    <circle cx="80" cy="32" r="5" fill="#f43f5e" />
                    <motion.path
                      d="M70 24C76 19 84 19 90 24"
                      stroke="#94a3b8"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      animate={{ opacity: [0.2, 0.8, 0.2] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />

                    {/* Cloud Body Shape */}
                    <path
                      d="M48 116C36 116 26 106 26 94C26 83 34 74 44 72C46 58 58 48 72 48C84 48 94 55 98 65C102 61 108 59 114 59C127 59 138 70 138 83C138 84 138 85 138 86C142 89 144 93 144 98C144 108 136 116 126 116H48Z"
                      fill="currentColor"
                      className="text-slate-100 dark:text-slate-800"
                      stroke="#94a3b8"
                      strokeWidth="3"
                      strokeLinejoin="round"
                    />

                    {/* Rosy Cheeks */}
                    <ellipse cx="58" cy="94" rx="6" ry="4" fill="#fecdd3" />
                    <ellipse cx="106" cy="94" rx="6" ry="4" fill="#fecdd3" />

                    {/* Sleeping Eyes */}
                    <path
                      d="M60 84C63 88 69 88 72 84"
                      stroke="#475569"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                    />
                    <path
                      d="M92 84C95 88 101 88 104 84"
                      stroke="#475569"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                    />

                    {/* Gentle Smile */}
                    <path
                      d="M80 91C80 91 80 95 82 95C84 95 84 91 84 91"
                      stroke="#64748b"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />
                  </svg>
                </motion.div>
              </div>

              {/* Title & Subtitle */}
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                No Connection
              </h2>
              <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-normal">
                Please check your network and try again.
              </p>

              {/* Status Message */}
              <AnimatePresence>
                {retryMessage && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    className="mt-3 text-xs font-medium text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 py-1.5 px-3 rounded-lg inline-flex items-center gap-1.5"
                  >
                    <WifiOff className="w-3 h-3" />
                    <span>{retryMessage}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Primary Action Button */}
              <div className="mt-5">
                <button
                  onClick={handleRetry}
                  disabled={isRetrying}
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 font-semibold text-xs sm:text-sm shadow-md active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isRetrying ? "animate-spin" : ""}`} />
                  <span>{isRetrying ? "Connecting..." : "Try Again"}</span>
                </button>
              </div>

              {/* Subtle Auto-reconnect note */}
              <p className="mt-4 text-[11px] text-slate-400 dark:text-slate-500 font-normal">
                Reconnecting automatically when online
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
