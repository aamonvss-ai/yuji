"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RefreshCw, MessageCircle, ShieldCheck, Sparkles, Clock, Heart, LogIn, CheckCircle2 } from "lucide-react";
import { usePathname } from "next/navigation";

export default function Maintenance({ forceShow = false }: { forceShow?: boolean } = {}) {
  const pathname = usePathname();
  const [show, setShow] = useState(forceShow);
  const [mounted, setMounted] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [checkMessage, setCheckMessage] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);

    if (forceShow) {
      setShow(true);
      return;
    }

    // Never block the login page so owners/admins can always log in
    if (pathname === "/login") {
      setShow(false);
      return;
    }

    const checkOwner = async () => {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (!token) {
        setShow(true);
        return;
      }
      try {
        const res = await fetch("/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.success && data.user?.userType === "owner") {
          setShow(false);
        } else {
          setShow(true);
        }
      } catch (err) {
        setShow(true);
      }
    };

    checkOwner();
  }, [pathname]);

  const handleRefresh = async () => {
    setIsChecking(true);
    setCheckMessage("Checking if we're back...");
    try {
      const res = await fetch("/api/system/settings", { cache: "no-store" });
      const data = await res.json();
      if (data && data.maintenanceMode === false) {
        setCheckMessage("We're back! Loading...");
        setTimeout(() => {
          window.location.reload();
        }, 600);
        return;
      }
    } catch (e) {
      // ignore
    }

    setTimeout(() => {
      setIsChecking(false);
      setCheckMessage("Still working on updates! Please check back in a moment ✨");
      setTimeout(() => setCheckMessage(null), 3500);
    }, 1000);
  };

  const handleClearSession = () => {
    const keysToRemove = ["token", "userName", "email", "userId", "phone", "pending_topup_order", "avatar"];
    keysToRemove.forEach((key) => localStorage.removeItem(key));
    window.location.reload();
  };

  const whatsappNumber = process.env.NEXT_PUBLIC_SUPPORT_WHATSAPP || "919178521537";
  const whatsappUrl = `https://wa.me/${whatsappNumber.replace(/\D/g, "")}?text=${encodeURIComponent("Hi! I have a question about my order during maintenance.")}`;

  if (!mounted || !show) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[99999] bg-[#fafbfe] flex items-center justify-center p-4 sm:p-6 overflow-y-auto selection:bg-rose-100 selection:text-rose-900"
      >
        {/* Soft, dreamy ambient pastel glows */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <motion.div
            animate={{
              scale: [1, 1.15, 1],
              x: [0, 20, 0],
              y: [0, -15, 0],
            }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-32 -left-32 w-96 h-96 sm:w-[32rem] sm:h-[32rem] bg-gradient-to-br from-rose-200/50 via-pink-100/40 to-transparent rounded-full blur-3xl"
          />
          <motion.div
            animate={{
              scale: [1.1, 1, 1.1],
              x: [0, -25, 0],
              y: [0, 20, 0],
            }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -bottom-32 -right-32 w-96 h-96 sm:w-[34rem] sm:h-[34rem] bg-gradient-to-tl from-sky-200/50 via-indigo-100/30 to-transparent rounded-full blur-3xl"
          />
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-amber-100/40 rounded-full blur-3xl"
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
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-rose-50/90 border border-rose-200/70 text-rose-600 text-xs font-semibold tracking-wide mb-6 shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5 animate-pulse text-rose-500" />
              <span>Making things prettier</span>
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping ml-0.5" />
            </motion.div>

            {/* Cute Mascot Illustration */}
            <div className="relative mx-auto w-36 h-36 sm:w-40 sm:h-40 mb-6 flex items-center justify-center">
              {/* Soft pulsing halo */}
              <motion.div
                animate={{ scale: [1, 1.12, 1], opacity: [0.4, 0.7, 0.4] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute inset-0 bg-gradient-to-tr from-rose-200/60 via-amber-200/40 to-sky-200/60 rounded-full blur-xl"
              />

              {/* Floating cute robot cat mascot SVG */}
              <motion.div
                animate={{
                  y: [0, -8, 0],
                  rotate: [0, 1.5, 0, -1.5, 0],
                }}
                transition={{
                  duration: 4.5,
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
                  {/* Floating magic sparkles */}
                  <circle cx="25" cy="45" r="3" fill="#fb7185" className="animate-pulse" />
                  <circle cx="138" cy="40" r="2.5" fill="#38bdf8" className="animate-pulse" />
                  <path
                    d="M135 70L137 75L142 77L137 79L135 84L133 79L128 77L133 75L135 70Z"
                    fill="#f59e0b"
                    opacity="0.8"
                  />
                  <path
                    d="M20 95L22 99L26 100L22 101L20 105L18 101L14 100L18 99L20 95Z"
                    fill="#fb7185"
                    opacity="0.8"
                  />

                  {/* Cat Ear Left */}
                  <path
                    d="M48 62L36 34C35 32 37 30 40 32L62 46"
                    fill="#f8fafc"
                    stroke="#e2e8f0"
                    strokeWidth="3.5"
                    strokeLinejoin="round"
                  />
                  <path d="M46 54L39 37L56 46" fill="#fecdd3" />

                  {/* Cat Ear Right */}
                  <path
                    d="M112 62L124 34C125 32 123 30 120 32L98 46"
                    fill="#f8fafc"
                    stroke="#e2e8f0"
                    strokeWidth="3.5"
                    strokeLinejoin="round"
                  />
                  <path d="M114 54L121 37L104 46" fill="#fecdd3" />

                  {/* Head Container */}
                  <rect
                    x="40"
                    y="42"
                    width="80"
                    height="70"
                    rx="35"
                    fill="#ffffff"
                    stroke="#e2e8f0"
                    strokeWidth="3.5"
                  />

                  {/* Cute Soft Cap / Ribbon */}
                  <ellipse cx="80" cy="42" rx="22" ry="7" fill="#ffe4e6" />
                  <circle cx="80" cy="38" r="5" fill="#f43f5e" />

                  {/* Cute Cheeks */}
                  <ellipse cx="56" cy="84" rx="7" ry="4.5" fill="#fecdd3" />
                  <ellipse cx="104" cy="84" rx="7" ry="4.5" fill="#fecdd3" />

                  {/* Happy Eyes */}
                  <path
                    d="M58 74C60 71 66 71 68 74"
                    stroke="#1e293b"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                  />
                  <path
                    d="M92 74C94 71 100 71 102 74"
                    stroke="#1e293b"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                  />

                  {/* Little Nose & Smile */}
                  <ellipse cx="80" cy="79" rx="2.5" ry="2" fill="#fb7185" />
                  <path
                    d="M76 83C78 86 80 86 80 86C80 86 82 86 84 83"
                    stroke="#334155"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />

                  {/* Cute Whiskers */}
                  <line x1="38" y1="78" x2="48" y2="79" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round" />
                  <line x1="37" y1="84" x2="48" y2="83" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round" />
                  <line x1="122" y1="78" x2="112" y2="79" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round" />
                  <line x1="123" y1="84" x2="112" y2="83" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round" />

                  {/* Little Body */}
                  <path
                    d="M52 110C52 104 60 100 80 100C100 100 108 104 108 110V126C108 132 100 136 80 136C60 136 52 132 52 126V110Z"
                    fill="#f8fafc"
                    stroke="#e2e8f0"
                    strokeWidth="3.5"
                  />

                  {/* Heart on chest */}
                  <path
                    d="M80 120C80 120 74 116 74 112C74 109.5 76 108 78 108C79.2 108 80 109 80 109C80 109 80.8 108 82 108C84 108 86 109.5 86 112C86 116 80 120 80 120Z"
                    fill="#f43f5e"
                  />

                  {/* Little Cute Golden Wrench held by mascot */}
                  <g transform="translate(102, 100) rotate(22)">
                    <rect x="0" y="4" width="6" height="24" rx="3" fill="#f59e0b" />
                    <circle cx="3" cy="4" r="6" fill="#f59e0b" />
                    <circle cx="3" cy="4" r="2.5" fill="#ffffff" />
                  </g>

                  {/* Paws */}
                  <ellipse cx="66" cy="118" rx="5" ry="4" fill="#ffffff" stroke="#e2e8f0" strokeWidth="2" />
                  <ellipse cx="94" cy="118" rx="5" ry="4" fill="#ffffff" stroke="#e2e8f0" strokeWidth="2" />
                </svg>
              </motion.div>
            </div>

            {/* Simple, Cute English Heading & Description */}
            <div className="space-y-2.5 mb-7">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                We’ll be right back!
              </h1>
              <p className="text-sm sm:text-base text-slate-500 font-normal leading-relaxed max-w-sm mx-auto">
                We are giving our website a quick polish so everything runs faster and smoother for you.
              </p>
            </div>

            {/* 3 Cute Reassurance Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mb-8 text-left">
              <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-100 hover:border-slate-200 transition-colors">
                <div className="w-8 h-8 rounded-xl bg-emerald-100/70 text-emerald-600 flex items-center justify-center mb-2">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div className="font-semibold text-xs text-slate-800">100% Safe</div>
                <div className="text-[11px] text-slate-500 mt-0.5">Your orders and wallet are secure.</div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-100 hover:border-slate-200 transition-colors">
                <div className="w-8 h-8 rounded-xl bg-sky-100/70 text-sky-600 flex items-center justify-center mb-2">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div className="font-semibold text-xs text-slate-800">New Perks</div>
                <div className="text-[11px] text-slate-500 mt-0.5">Fresh upgrades are coming up.</div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-100 hover:border-slate-200 transition-colors">
                <div className="w-8 h-8 rounded-xl bg-amber-100/70 text-amber-600 flex items-center justify-center mb-2">
                  <Clock className="w-4 h-4" />
                </div>
                <div className="font-semibold text-xs text-slate-800">Short Break</div>
                <div className="text-[11px] text-slate-500 mt-0.5">We will reopen very soon!</div>
              </div>
            </div>

            {/* Status Feedback Message */}
            <AnimatePresence>
              {checkMessage && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="mb-4 text-xs font-semibold text-rose-600 bg-rose-50 border border-rose-200/80 py-2 px-3 rounded-xl inline-block"
                >
                  {checkMessage}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Friendly Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={handleRefresh}
                disabled={isChecking}
                className="w-full py-3.5 px-6 rounded-2xl bg-slate-900 hover:bg-slate-800 active:scale-[0.98] text-white font-semibold text-sm tracking-wide shadow-lg shadow-slate-900/10 hover:shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75"
              >
                <RefreshCw className={`w-4 h-4 ${isChecking ? "animate-spin" : ""}`} />
                <span>{isChecking ? "Checking Status..." : "Refresh Page"}</span>
              </button>

              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 px-6 rounded-2xl bg-emerald-50 hover:bg-emerald-100/80 active:scale-[0.98] border border-emerald-200/60 text-emerald-700 font-semibold text-xs tracking-wide transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <MessageCircle className="w-4 h-4 text-emerald-600" />
                <span>Need quick help? Chat on WhatsApp</span>
              </a>
            </div>

            {/* Subtle Footer Links for Owner & Support */}
            <div className="mt-8 pt-5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
              <a
                href="/login"
                className="hover:text-slate-700 transition-colors flex items-center gap-1 font-medium"
              >
                <LogIn className="w-3 h-3" />
                <span>Owner Login</span>
              </a>
              <button
                onClick={handleClearSession}
                className="hover:text-rose-500 transition-colors font-medium cursor-pointer"
              >
                Clear old session
              </button>
            </div>
          </motion.div>

          {/* Cute Reassurance Badge at bottom */}
          <div className="mt-5 flex items-center justify-center gap-1.5 text-xs text-slate-400 font-medium">
            <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400" />
            <span>Thank you for being part of Yuji</span>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
