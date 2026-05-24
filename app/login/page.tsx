"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { GoogleLogin } from "@react-oauth/google";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, Lock, ArrowRight, ArrowLeft, UserCheck, Mail, KeyRound, Crown } from "lucide-react";

export default function AuthPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [mounted, setMounted] = useState(false);

  // OTP flow states
  const [step, setStep] = useState<"email" | "otp">("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleAuthSuccess = (data: { token: string; user: { name: string; email: string; userId: string; userType: string; avatar?: string } }) => {
    localStorage.setItem("token", data.token);
    localStorage.setItem("userName", data.user.name);
    localStorage.setItem("email", data.user.email);
    localStorage.setItem("userId", data.user.userId);
    localStorage.setItem("userType", data.user.userType);
    if (data.user.avatar) localStorage.setItem("avatar", data.user.avatar);

    setSuccess("Welcome back! Redirecting...");

    const searchParams = new URLSearchParams(window.location.search);
    const redirectTo = searchParams.get("redirect") || "/";

    setTimeout(() => (window.location.href = redirectTo), 1200);
  };

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

      handleAuthSuccess(data);
    } catch {
      setError("Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (!data.success) {
        setError(data.message || "Failed to send OTP.");
        return;
      }

      setSuccess("OTP sent to your email!");
      setStep("otp");
      setTimeout(() => setSuccess(""), 3000);
    } catch {
      setError("Failed to send OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) {
      setError("Please enter a valid 6-digit OTP.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });

      const data = await res.json();
      if (!data.success) {
        setError(data.message || "Invalid OTP.");
        return;
      }

      handleAuthSuccess(data);
    } catch {
      setError("Verification failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) return null;

  return (
    <section className="min-h-screen relative flex items-start justify-center bg-transparent overflow-hidden px-4 pt-0 pb-4 font-sans selection:bg-[var(--accent)]/30">

      {/* --- Premium Background System --- */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute -top-[20%] -left-[20%] w-full h-full bg-gradient-to-br from-[var(--accent)] to-transparent blur-[120px] rounded-full opacity-[0.07]" />
        <div className="absolute -bottom-[20%] -right-[20%] w-full h-full bg-gradient-to-tl from-[#7dd3fc] to-transparent blur-[100px] rounded-full opacity-[0.05]" />
        <div className="absolute inset-0 opacity-[0.4] bg-[radial-gradient(circle_at_center,transparent_0%,var(--background)_100%)]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative w-full max-w-[320px] mx-auto z-10 will-change-[transform,opacity]"
      >
        <div className="w-full relative">
          
          {/* BRANDING SECTION */}
          <div className="mb-6 text-center flex flex-col items-center">
            <div className="mb-4 h-14 w-14 relative flex justify-center items-center rounded-full border border-amber-500/20 bg-amber-500/5">
              <div className="h-10 w-10 rounded-full border border-amber-500/30 flex items-center justify-center bg-amber-500/10">
                <Crown size={20} className="text-amber-500" />
              </div>
            </div>

            <div className="space-y-1">
              <h1 className="text-2xl font-bold tracking-tight text-[var(--foreground)]">
                Welcome back
              </h1>
              <p className="text-[14px] text-[var(--muted)]">
                Sign in or register to continue
              </p>
            </div>
          </div>

          {/* ERROR / SUCCESS HANDLING */}
          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                animate={{ opacity: 1, height: "auto", marginBottom: 16 }}
                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                className="overflow-hidden"
              >
                <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-500 flex items-center gap-3">
                  <Lock size={16} className="flex-shrink-0" />
                  {error}
                </div>
              </motion.div>
            )}
            {success && (
              <motion.div
                initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                animate={{ opacity: 1, height: "auto", marginBottom: 16 }}
                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                className="overflow-hidden"
              >
                <div className="rounded-xl border border-green-500/20 bg-green-500/10 px-4 py-3 text-sm text-green-500 flex items-center gap-3">
                  <UserCheck size={16} className="flex-shrink-0" />
                  {success}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* AUTH ACTIONS */}
          <div className="space-y-5 w-full">

            {/* OTP FLOW */}
            <div className="w-full">
              {step === "email" ? (
                <form onSubmit={handleSendOtp} className="space-y-4 w-full">
                  <div className="space-y-1.5 w-full">
                    <label className="text-[13px] font-medium text-[var(--foreground)] ml-1">Email Address</label>
                    <div className="relative group w-full">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted)] group-focus-within:text-[var(--foreground)] transition-colors" size={18} />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="w-full h-[48px] bg-[var(--background)]/30 border border-[var(--border)]/60 rounded-xl pl-11 pr-4 text-[14px] text-[var(--foreground)] placeholder:text-[var(--muted)] focus:outline-none focus:border-[var(--foreground)]/50 focus:ring-1 focus:ring-[var(--foreground)]/50 transition-all shadow-sm"
                        required
                        disabled={loading}
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={loading || !email}
                    className="w-full h-[48px] bg-[var(--foreground)] hover:bg-[var(--foreground)]/90 text-[var(--background)] font-medium text-[14px] rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow flex items-center px-4"
                  >
                    <div className="w-5" /> {/* Spacer to keep text centered */}
                    <span className="flex-1 text-center">{loading ? "Sending..." : "Continue with Email"}</span>
                    <ArrowRight size={18} className="w-5 opacity-80" />
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtp} className="space-y-4 w-full">
                  <div className="space-y-1.5 w-full">
                    <label className="text-[13px] font-medium text-[var(--foreground)] ml-1">Enter OTP</label>
                    <div className="relative group w-full">
                      <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted)] group-focus-within:text-[var(--foreground)] transition-colors" size={18} />
                      <input
                        type="text"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                        placeholder="000000"
                        className="w-full h-[48px] bg-[var(--background)]/30 border border-[var(--border)]/60 rounded-xl pl-11 pr-4 text-center tracking-[0.75em] text-[18px] font-bold text-[var(--foreground)] placeholder:text-[var(--muted)] focus:outline-none focus:border-[var(--foreground)]/50 focus:ring-1 focus:ring-[var(--foreground)]/50 transition-all shadow-sm"
                        required
                        disabled={loading}
                        maxLength={6}
                      />
                    </div>
                  </div>
                  <div className="flex gap-3 w-full">
                    <button
                      type="button"
                      onClick={() => { setStep("email"); setOtp(""); }}
                      disabled={loading}
                      className="w-1/3 h-[48px] bg-[var(--background)]/50 border border-[var(--border)]/60 text-[var(--foreground)] font-medium text-[14px] rounded-xl hover:bg-[var(--border)]/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={loading || otp.length !== 6}
                      className="w-2/3 h-[48px] bg-[var(--foreground)] hover:bg-[var(--foreground)]/90 text-[var(--background)] font-medium text-[14px] rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow flex justify-center items-center"
                    >
                      {loading ? "Verifying..." : "Verify OTP"}
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* DIVIDER */}
            <div className="relative py-1 flex items-center w-full">
              <div className="flex-grow border-t border-[var(--border)]/50"></div>
              <span className="flex-shrink-0 mx-4 text-[var(--muted)] text-[12px]">or continue with</span>
              <div className="flex-grow border-t border-[var(--border)]/50"></div>
            </div>

            {/* GOOGLE LOGIN */}
            <div className="relative w-full h-[48px] flex items-center justify-center [&>div]:!flex [&>div]:!items-center [&>div]:!justify-center [&>div]:!w-full [&>div]:!h-full">
              <GoogleLogin
                onSuccess={(res) => res.credential && handleGoogleLogin(res.credential)}
                onError={() => setError("Google sign-in failed")}
                theme="outline"
                size="large"
                shape="rectangular"
                width="320"
                text="continue_with"
              />
            </div>

            {/* LOADING STATE INDICATOR FOR GOOGLE */}
            <AnimatePresence>
              {loading && step === "email" && !email && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center gap-2 pt-1"
                >
                  <div className="flex gap-1.5">
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.3 }}
                        className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]"
                      />
                    ))}
                  </div>
                  <span className="text-xs text-[var(--accent)] font-medium">Signing you in...</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* FOOTER */}
          <div className="mt-8 space-y-5">
            <p className="text-[12px] text-[var(--muted)] text-center px-2">
              By signing in, you agree to our{" "}
              <button className="text-amber-500 font-medium hover:text-amber-600 transition-colors">Terms</button>
              {" "}and{" "}
              <button className="text-amber-500 font-medium hover:text-amber-600 transition-colors">Privacy Policy</button>
            </p>

            <div className="flex justify-center">
              <Link
                href="/"
                className="group inline-flex items-center gap-2 text-[13px] font-medium text-[var(--foreground)]/80 hover:text-[var(--foreground)] transition-colors"
              >
                <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                Back to homepage
              </Link>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
