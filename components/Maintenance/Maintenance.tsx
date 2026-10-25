"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RefreshCw, MessageCircle, LogIn } from "lucide-react";
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
  }, [pathname, forceShow]);

  const handleRefresh = async () => {
    setIsChecking(true);
    setCheckMessage(null);
    try {
      const res = await fetch("/api/system/settings", { cache: "no-store" });
      const data = await res.json();
      if (data && data.maintenanceMode === false) {
        setCheckMessage("We're back! Loading...");
        setTimeout(() => {
          window.location.reload();
        }, 500);
        return;
      }
    } catch (e) {
      // ignore
    }

    setTimeout(() => {
      setIsChecking(false);
      setCheckMessage("Still under maintenance. Please check back shortly.");
      setTimeout(() => setCheckMessage(null), 3000);
    }, 800);
  };

  const handleClearSession = () => {
    const keysToRemove = ["token", "userName", "email", "userId", "phone", "pending_topup_order", "avatar"];
    keysToRemove.forEach((key) => localStorage.removeItem(key));
    window.location.reload();
  };

  const whatsappNumber = process.env.NEXT_PUBLIC_SUPPORT_WHATSAPP || "919178521537";
  const whatsappUrl = `https://wa.me/${whatsappNumber.replace(/\D/g, "")}?text=${encodeURIComponent("Hi! I have a question during maintenance.")}`;

  if (!mounted || !show) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[99999] bg-[#fafbfe] flex items-center justify-center p-4 selection:bg-rose-100 selection:text-rose-900"
      >
        {/* Soft ambient background glows */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
              x: [0, 15, 0],
              y: [0, -10, 0],
            }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-32 -left-32 w-80 h-80 bg-gradient-to-br from-rose-200/40 via-pink-100/30 to-transparent rounded-full blur-3xl"
          />
          <motion.div
            animate={{
              scale: [1.1, 1, 1.1],
              x: [0, -15, 0],
              y: [0, 15, 0],
            }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -bottom-32 -right-32 w-80 h-80 bg-gradient-to-tl from-sky-200/40 via-indigo-100/20 to-transparent rounded-full blur-3xl"
          />
        </div>

        {/* Minimal Clean Card */}
        <div className="relative w-full max-w-sm my-auto">
          <motion.div
            initial={{ scale: 0.95, y: 12, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            transition={{ type: "spring", damping: 25, stiffness: 280 }}
            className="relative bg-white/95 backdrop-blur-xl border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-900/5 text-center"
          >
            {/* Status Pill Badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100/90 text-slate-600 text-xs font-medium mb-5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
              <span>Under Maintenance</span>
            </div>

            {/* Mascot Illustration */}
            <div className="relative mx-auto w-28 h-28 mb-5 flex items-center justify-center">
              <motion.div
                animate={{
                  y: [0, -6, 0],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="relative z-10 w-full h-full"
              >
                <svg
                  viewBox="0 0 160 160"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-full h-full drop-shadow-sm"
                >
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

                  {/* Head */}
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

                  {/* Cute Cap / Ribbon */}
                  <ellipse cx="80" cy="42" rx="20" ry="6" fill="#ffe4e6" />
                  <circle cx="80" cy="38" r="4.5" fill="#f43f5e" />

                  {/* Cheeks */}
                  <ellipse cx="56" cy="84" rx="6" ry="4" fill="#fecdd3" />
                  <ellipse cx="104" cy="84" rx="6" ry="4" fill="#fecdd3" />

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

                  {/* Nose & Smile */}
                  <ellipse cx="80" cy="79" rx="2.5" ry="2" fill="#fb7185" />
                  <path
                    d="M76 83C78 86 80 86 80 86C80 86 82 86 84 83"
                    stroke="#334155"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />

                  {/* Whiskers */}
                  <line x1="38" y1="78" x2="48" y2="79" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round" />
                  <line x1="37" y1="84" x2="48" y2="83" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round" />
                  <line x1="122" y1="78" x2="112" y2="79" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round" />
                  <line x1="123" y1="84" x2="112" y2="83" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round" />

                  {/* Body */}
                  <path
                    d="M52 110C52 104 60 100 80 100C100 100 108 104 108 110V126C108 132 100 136 80 136C60 136 52 132 52 126V110Z"
                    fill="#f8fafc"
                    stroke="#e2e8f0"
                    strokeWidth="3.5"
                  />

                  {/* Heart */}
                  <path
                    d="M80 120C80 120 74 116 74 112C74 109.5 76 108 78 108C79.2 108 80 109 80 109C80 109 80.8 108 82 108C84 108 86 109.5 86 112C86 116 80 120 80 120Z"
                    fill="#f43f5e"
                  />

                  {/* Mini Wrench */}
                  <g transform="translate(102, 100) rotate(22)">
                    <rect x="0" y="4" width="5" height="22" rx="2.5" fill="#f59e0b" />
                    <circle cx="2.5" cy="4" r="5" fill="#f59e0b" />
                    <circle cx="2.5" cy="4" r="2" fill="#ffffff" />
                  </g>

                  {/* Paws */}
                  <ellipse cx="66" cy="118" rx="5" ry="4" fill="#ffffff" stroke="#e2e8f0" strokeWidth="2" />
                  <ellipse cx="94" cy="118" rx="5" ry="4" fill="#ffffff" stroke="#e2e8f0" strokeWidth="2" />
                </svg>
              </motion.div>
            </div>

            {/* Clean Heading & Description */}
            <div className="space-y-2 mb-6">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                We'll be right back
              </h1>
              <p className="text-sm text-slate-500 leading-relaxed">
                We are performing quick updates to improve your experience.
              </p>
            </div>

            {/* Status Feedback Message */}
            <AnimatePresence>
              {checkMessage && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className="mb-4 text-xs font-medium text-slate-600 bg-slate-100 py-1.5 px-3 rounded-lg inline-block"
                >
                  {checkMessage}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Action Buttons */}
            <div className="space-y-2.5">
              <button
                onClick={handleRefresh}
                disabled={isChecking}
                className="w-full py-3 px-5 rounded-xl bg-slate-900 hover:bg-slate-800 active:scale-[0.99] text-white font-medium text-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
              >
                <RefreshCw className={`w-4 h-4 ${isChecking ? "animate-spin" : ""}`} />
                <span>{isChecking ? "Checking..." : "Refresh Page"}</span>
              </button>

              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 px-5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium text-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                <span>Chat on WhatsApp</span>
              </a>
            </div>

            {/* Subtle Footer */}
            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
              <a
                href="/login"
                className="hover:text-slate-600 transition-colors flex items-center gap-1"
              >
                <LogIn className="w-3 h-3" />
                <span>Owner Login</span>
              </a>
              <button
                onClick={handleClearSession}
                className="hover:text-slate-600 transition-colors cursor-pointer"
              >
                Clear session
              </button>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
