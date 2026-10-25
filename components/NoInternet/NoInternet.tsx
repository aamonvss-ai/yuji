"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { WifiOff, Wifi, RefreshCw, CheckCircle2, Sparkles, Smartphone, ShieldCheck, Heart } from "lucide-react";

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
      // Fast lightweight HEAD request to verify actual internet access
      const res = await fetch(`/favicon.ico?_=${Date.now()}`, {
        method: "HEAD",
        cache: "no-store",
      });
      return res.ok || res.type === "opaque";
    } catch (e) {
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

    // Initial check
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
    setRetryMessage("Checking your connection...");

    const online = await checkConnection();

    setTimeout(() => {
      setIsRetrying(false);
      if (online) {
        setIsOffline(false);
        setRetryMessage(null);
        setShowBackOnlineToast(true);
        setTimeout(() => setShowBackOnlineToast(false), 4000);
      } else {
        setRetryMessage("Still offline. Please check your Wi-Fi or mobile data!");
        setTimeout(() => setRetryMessage(null), 3500);
      }
    }, 900);
  };

  if (!mounted) return null;

  return (
    <>
      {/* Back Online Toast */}
      <AnimatePresence>
        {showBackOnlineToast && (
          <motion.div
            initial={{ opacity: 0, y: -40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="fixed top-5 left-1/2 -translate-x-1/2 z-[100000] px-4 py-2.5 rounded-full bg-emerald-500 text-white shadow-xl shadow-emerald-500/20 flex items-center gap-2 text-xs sm:text-sm font-semibold tracking-wide pointer-events-none"
          >
            <CheckCircle2 className="w-4 h-4 text-white" />
            <span>Yay! You’re connected again ✨</span>
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
            className="fixed inset-0 z-[99998] bg-[#fafbfe] flex items-center justify-center p-4 sm:p-6 overflow-y-auto selection:bg-sky-100 selection:text-sky-900"
          >
            {/* Ambient Pastel Glows */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
              <motion.div
                animate={{
                  scale: [1, 1.15, 1],
                  x: [0, 25, 0],
                  y: [0, -15, 0],
                }}
                transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -top-32 -right-32 w-96 h-96 sm:w-[32rem] sm:h-[32rem] bg-gradient-to-bl from-sky-200/50 via-cyan-100/40 to-transparent rounded-full blur-3xl"
              />
              <motion.div
                animate={{
                  scale: [1.1, 1, 1.1],
                  x: [0, -20, 0],
                  y: [0, 20, 0],
                }}
                transition={{ duration: 13, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -bottom-32 -left-32 w-96 h-96 sm:w-[34rem] sm:h-[34rem] bg-gradient-to-tr from-rose-200/40 via-amber-100/30 to-transparent rounded-full blur-3xl"
              />
              {/* Subtle decorative dot pattern */}
              <div
                className="absolute inset-0 opacity-[0.035]"
                style={{
                  backgroundImage: `radial-gradient(#0f172a 1px, transparent 1px)`,
                  backgroundSize: "24px 24px",
                }}
              />
            </div>

            {/* Content Container */}
            <div className="relative w-full max-w-lg my-auto py-6">
              <motion.div
                initial={{ scale: 0.94, y: 18, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                transition={{ type: "spring", damping: 25, stiffness: 280 }}
                className="relative bg-white/90 backdrop-blur-2xl border border-slate-200/70 rounded-[2.25rem] sm:rounded-[2.75rem] p-6 sm:p-10 shadow-[0_25px_60px_-15px_rgba(15,23,42,0.08),0_0_0_1px_rgba(255,255,255,0.8)_inset] text-center"
              >
                {/* Cute Status Pill Badge */}
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-sky-50/90 border border-sky-200/70 text-sky-700 text-xs font-semibold tracking-wide mb-6 shadow-xs"
                >
                  <WifiOff className="w-3.5 h-3.5 text-sky-600 animate-pulse" />
                  <span>No Internet Connection</span>
                </motion.div>

                {/* Cute Sleeping Cloud & Wifi Mascot SVG */}
                <div className="relative mx-auto w-36 h-36 sm:w-40 sm:h-40 mb-6 flex items-center justify-center">
                  {/* Soft pulsing halo */}
                  <motion.div
                    animate={{ scale: [1, 1.12, 1], opacity: [0.35, 0.65, 0.35] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute inset-0 bg-gradient-to-tr from-sky-200/60 via-cyan-200/40 to-pink-200/50 rounded-full blur-xl"
                  />

                  {/* Floating cute cloud mascot */}
                  <motion.div
                    animate={{
                      y: [0, -7, 0],
                      rotate: [0, -1, 0, 1, 0],
                    }}
                    transition={{
                      duration: 4.8,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    className="relative z-10 w-full h-full"
                  >
                    <svg
                      viewBox="0 0 160 160"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-full h-full drop-shadow-md"
                    >
                      {/* Floating Sleep zZz */}
                      <motion.text
                        x="124"
                        y="42"
                        fill="#38bdf8"
                        fontSize="14"
                        fontWeight="bold"
                        animate={{ opacity: [0.2, 1, 0.2], y: [42, 38, 42] }}
                        transition={{ duration: 2.5, repeat: Infinity }}
                      >
                        z
                      </motion.text>
                      <motion.text
                        x="134"
                        y="30"
                        fill="#60a5fa"
                        fontSize="18"
                        fontWeight="bold"
                        animate={{ opacity: [0.4, 1, 0.4], y: [30, 24, 30] }}
                        transition={{ duration: 3, repeat: Infinity, delay: 0.4 }}
                      >
                        Z
                      </motion.text>

                      {/* Cute Antenna on Head */}
                      <path d="M80 50V35" stroke="#94a3b8" strokeWidth="3" strokeLinecap="round" />
                      <circle cx="80" cy="32" r="5" fill="#f43f5e" />
                      {/* Signal Search Waves */}
                      <motion.path
                        d="M70 24C76 19 84 19 90 24"
                        stroke="#cbd5e1"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        animate={{ opacity: [0.2, 0.8, 0.2] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                      <motion.path
                        d="M64 17C74 10 86 10 96 17"
                        stroke="#e2e8f0"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        animate={{ opacity: [0.1, 0.6, 0.1] }}
                        transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
                      />

                      {/* Cloud Body Shape */}
                      <path
                        d="M48 116C36 116 26 106 26 94C26 83 34 74 44 72C46 58 58 48 72 48C84 48 94 55 98 65C102 61 108 59 114 59C127 59 138 70 138 83C138 84 138 85 138 86C142 89 144 93 144 98C144 108 136 116 126 116H48Z"
                        fill="#ffffff"
                        stroke="#e2e8f0"
                        strokeWidth="3.5"
                        strokeLinejoin="round"
                      />

                      {/* Rosy Cheeks */}
                      <ellipse cx="58" cy="94" rx="7" ry="4.5" fill="#fecdd3" />
                      <ellipse cx="106" cy="94" rx="7" ry="4.5" fill="#fecdd3" />

                      {/* Sleeping / Relaxed Eyes */}
                      <path
                        d="M60 84C63 88 69 88 72 84"
                        stroke="#334155"
                        strokeWidth="3.5"
                        strokeLinecap="round"
                      />
                      <path
                        d="M92 84C95 88 101 88 104 84"
                        stroke="#334155"
                        strokeWidth="3.5"
                        strokeLinecap="round"
                      />

                      {/* Cute Mouth */}
                      <path
                        d="M80 91C80 91 80 95 82 95C84 95 84 91 84 91"
                        stroke="#475569"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                      />

                      {/* Little Sparkles around Cloud */}
                      <circle cx="22" cy="70" r="2.5" fill="#38bdf8" />
                      <circle cx="140" cy="110" r="2.5" fill="#f43f5e" />
                      <path
                        d="M18 104L20 108L24 109L20 110L18 114L16 110L12 109L16 108L18 104Z"
                        fill="#f59e0b"
                        opacity="0.7"
                      />
                    </svg>
                  </motion.div>
                </div>

                {/* Simple, Cute English Heading & Description */}
                <div className="space-y-2.5 mb-7">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                    Where did the Wi-Fi go?
                  </h1>
                  <p className="text-sm sm:text-base text-slate-500 font-normal leading-relaxed max-w-sm mx-auto">
                    Your internet took a little nap. Check your connection to get back to browsing!
                  </p>
                </div>

                {/* 3 Cute Help Tips */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mb-8 text-left">
                  <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-100 hover:border-slate-200 transition-colors">
                    <div className="w-8 h-8 rounded-xl bg-sky-100/70 text-sky-600 flex items-center justify-center mb-2">
                      <Wifi className="w-4 h-4" />
                    </div>
                    <div className="font-semibold text-xs text-slate-800">Check Wi-Fi</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">Make sure your Wi-Fi or data is turned on.</div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-100 hover:border-slate-200 transition-colors">
                    <div className="w-8 h-8 rounded-xl bg-indigo-100/70 text-indigo-600 flex items-center justify-center mb-2">
                      <Smartphone className="w-4 h-4" />
                    </div>
                    <div className="font-semibold text-xs text-slate-800">Airplane Mode</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">Toggle it on and off to refresh your signal.</div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-100 hover:border-slate-200 transition-colors">
                    <div className="w-8 h-8 rounded-xl bg-emerald-100/70 text-emerald-600 flex items-center justify-center mb-2">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <div className="font-semibold text-xs text-slate-800">Cart is Safe</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">Your diamonds and page will stay right here.</div>
                  </div>
                </div>

                {/* Retry feedback alert */}
                <AnimatePresence>
                  {retryMessage && (
                    <motion.div
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      className="mb-4 text-xs font-semibold text-sky-700 bg-sky-50 border border-sky-200/80 py-2 px-3 rounded-xl inline-block"
                    >
                      {retryMessage}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Friendly Action Buttons */}
                <div className="space-y-3">
                  <button
                    onClick={handleRetry}
                    disabled={isRetrying}
                    className="w-full py-3.5 px-6 rounded-2xl bg-slate-900 hover:bg-slate-800 active:scale-[0.98] text-white font-semibold text-sm tracking-wide shadow-lg shadow-slate-900/10 hover:shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75"
                  >
                    <RefreshCw className={`w-4 h-4 ${isRetrying ? "animate-spin" : ""}`} />
                    <span>{isRetrying ? "Checking Connection..." : "Try Again"}</span>
                  </button>

                  <button
                    onClick={() => window.location.reload()}
                    className="w-full py-3 px-6 rounded-2xl bg-slate-50 hover:bg-slate-100 active:scale-[0.98] border border-slate-200/80 text-slate-700 font-semibold text-xs tracking-wide transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
                    <span>Reload this page</span>
                  </button>
                </div>
              </motion.div>

              {/* Cute reassurance text at bottom */}
              <div className="mt-5 flex items-center justify-center gap-1.5 text-xs text-slate-400 font-medium">
                <Heart className="w-3.5 h-3.5 text-sky-400 fill-sky-400" />
                <span>We’ll reconnect you automatically once your internet returns</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
