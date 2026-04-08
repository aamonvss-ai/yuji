"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { GoogleLogin } from "@react-oauth/google";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, Lock, ArrowRight, UserCheck } from "lucide-react";

export default function AuthPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleGoogleLogin = async (credential: string) => {
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: credential }),
      });

      const data = await res.json();

      if (!data.success) {
        setError(data.message || "Authentication failed");
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("userName", data.user.name);
      localStorage.setItem("email", data.user.email);
      localStorage.setItem("userId", data.user.userId);
      if (data.user.avatar) localStorage.setItem("avatar", data.user.avatar);

      setSuccess("Welcome back! Redirecting...");

      const searchParams = new URLSearchParams(window.location.search);
      const redirectTo = searchParams.get("redirect") || "/";

      setTimeout(() => (window.location.href = redirectTo), 1200);
    } catch {
      setError("Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) return null;

  return (
    <section className="min-h-screen relative flex items-center justify-center bg-[var(--background)] overflow-hidden px-4 py-20 font-sans selection:bg-[var(--accent)]/30">

      {/* --- Premium Background System --- */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        {/* Cinematic Orbs - Simplified for performance */}
        <div
          className="absolute -top-[20%] -left-[20%] w-full h-full bg-gradient-to-br from-[var(--accent)] to-transparent blur-[120px] rounded-full opacity-10 animate-[pulse_8s_ease-in-out_infinite] will-change-transform"
        />
        <div
          className="absolute -bottom-[20%] -right-[20%] w-full h-full bg-gradient-to-tl from-[#7dd3fc] to-transparent blur-[100px] rounded-full opacity-10 animate-[pulse_10s_ease-in-out_infinite] will-change-transform"
        />

        {/* Subtle Overlay - CSS based instead of SVG filter for low-end device support */}
        <div className="absolute inset-0 opacity-[0.4] bg-[radial-gradient(circle_at_center,transparent_0%,var(--background)_100%)]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative w-full max-w-[420px] z-10 will-change-[transform,opacity]"
      >
        {/* --- Card Container --- */}
        <div className="relative">
          <div className="relative rounded-[2.5rem] bg-[var(--card)]/75 backdrop-blur-md border border-white/10 shadow-xl overflow-hidden p-8 sm:p-12">

            {/* BRANDING SECTION */}
            <div className="mb-10 text-center">
              <div className="mx-auto mb-6 h-20 w-20 relative">
                {/* Logo Halo - Performance standard blur */}
                <div className="absolute inset-0 bg-[var(--accent)]/10 blur-md rounded-full" />

                <div className="relative h-full w-full rounded-2xl bg-gradient-to-b from-white/10 to-transparent p-[1px]">
                  <div className="h-full w-full rounded-2xl bg-[#0a0a0a]/80 backdrop-blur-sm flex items-center justify-center border border-white/5">
                    <Image
                      src="/logo.png"
                      alt="yuji Logo"
                      width={44}
                      height={44}
                      className="object-contain"
                      priority
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <h1 className="text-3xl font-extrabold tracking-tight text-[var(--foreground)]">
                  Welcome back
                </h1>
                <p className="text-sm text-[var(--muted)] font-medium">
                  Sign in to continue
                </p>
              </div>
            </div>

            {/* ERROR / SUCCESS HANDLING */}
            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="mb-6 rounded-2xl border border-red-500/10 bg-red-500/5 px-4 py-3 text-xs text-red-500 flex items-center gap-3 font-semibold"
                >
                  <Lock size={14} className="flex-shrink-0" />
                  {error}
                </motion.div>
              )}
              {success && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="mb-6 rounded-2xl border border-green-500/10 bg-green-500/5 px-4 py-3 text-xs text-green-500 flex items-center gap-3 font-semibold"
                >
                  <UserCheck size={14} className="flex-shrink-0" />
                  {success}
                </motion.div>
              )}
            </AnimatePresence>

            {/* AUTH ACTIONS */}
            <div className="space-y-6">
              <div className="relative group/btn overflow-hidden rounded-[1.25rem] border border-white/10 bg-white/5 transition-all duration-300 hover:border-[var(--accent)]/50 hover:bg-white/[0.08]">
                <GoogleLogin
                  onSuccess={(res) => res.credential && handleGoogleLogin(res.credential)}
                  onError={() => setError("Google sign-in failed")}
                  theme="filled_black"
                  size="large"
                  shape="pill"
                  width="100%"
                />
              </div>

              {/* LOADING STATE INDICATOR */}
              <AnimatePresence>
                {loading && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center gap-3 pt-2"
                  >
                    <div className="flex gap-1.5">
                      {[0, 1, 2].map((i) => (
                        <motion.div
                          key={i}
                          animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }}
                          transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                          className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]"
                        />
                      ))}
                    </div>
                    <span className="text-[10px] text-[var(--accent)] font-bold uppercase tracking-widest">Signing you in</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* FOOTER */}
            <div className="mt-12 space-y-6">
              <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

              <div className="flex flex-col items-center gap-5">
                <p className="text-[10px] text-[var(--muted)] tracking-wide leading-relaxed text-center px-4">
                  By signing in, you agree to our{" "}
                  <button className="text-[var(--foreground)] font-bold hover:text-[var(--accent)] transition-colors underline underline-offset-4 decoration-white/20">Terms of Service</button>
                  {" "}and{" "}
                  <button className="text-[var(--foreground)] font-bold hover:text-[var(--accent)] transition-colors underline underline-offset-4 decoration-white/20">Privacy Policy</button>
                </p>

                <Link
                  href="/"
                  className="group inline-flex items-center gap-2 text-xs font-bold text-[var(--muted)] hover:text-[var(--foreground)] transition-all"
                >
                  <ArrowRight size={14} className="rotate-180 group-hover:-translate-x-1 transition-transform" />
                  Back to homepage
                </Link>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
