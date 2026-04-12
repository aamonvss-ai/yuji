"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AuthGuard from "@/components/AuthGuard";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaCrown,
  FaStar,
  FaUserTie,
  FaCheckCircle,
  FaArrowRight,
  FaGem,
  FaShieldAlt,
} from "react-icons/fa";

export default function AdminPanalPage() {
  const [role, setRole] = useState("user");
  const [expiry, setExpiry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("silver");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      return;
    }

    fetch("/api/auth/me", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data?.userType) setRole(data.userType);
        if (data?.membershipExpiresAt)
          setExpiry(new Date(data.membershipExpiresAt));
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return null;

  const isOwner = role === "owner";
  const isReseller = role === "admin";
  const isSilver = role === "member";
  const isUser = role === "user";

  const currentTier = isOwner
    ? "Supreme Owner"
    : isReseller
      ? "Elite Reseller"
      : isSilver
        ? "Silver Member"
        : "Verified User";

  const daysLeft =
    expiry
      ? Math.max(
        0,
        Math.ceil((expiry.getTime() - Date.now()) / 86400000)
      )
      : null;

  return (
    <AuthGuard>
      <section className="min-h-screen bg-[var(--background)] px-6 py-24 flex flex-col items-center overflow-hidden">
        {/* Background Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-[var(--accent)]/5 blur-[120px] pointer-events-none" />

        <div className="w-full max-w-3xl relative z-10">
          {/* ================= HEADER ================= */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter italic">
              Membership <span className="text-[var(--accent)]">Center</span>
            </h1>
            <p className="mt-2 text-[var(--muted)] text-xs md:text-sm font-black uppercase tracking-widest opacity-80">
              Manage your tier and unlock premium world-class benefits
            </p>
          </motion.div>

          {/* ================= STATUS CARD ================= */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative overflow-hidden bg-[var(--card)]/40 backdrop-blur-2xl border border-white/5 rounded-[2.5rem] p-8 md:p-10 shadow-2xl mb-10"
          >
            <div className="absolute top-0 right-0 p-6 opacity-10">
              <FaShieldAlt className="text-8xl" />
            </div>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase tracking-widest text-[var(--muted)]">Initial Status</p>
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-2xl bg-black/40 border border-white/5 
                    ${isOwner ? "text-yellow-400" : isReseller ? "text-yellow-500" : isSilver ? "text-blue-400" : "text-[var(--muted)]"}`}>
                    {isOwner ? <FaCrown className="text-2xl" /> : isReseller ? <FaUserTie className="text-2xl" /> : isSilver ? <FaStar className="text-2xl" /> : <FaGem className="text-2xl" />}
                  </div>
                  <div>
                    <h2 className={`text-2xl md:text-3xl font-black uppercase tracking-tighter 
                      ${isOwner ? "text-yellow-400" : isReseller ? "text-yellow-500" : isSilver ? "text-blue-400" : "text-white"}`}>
                      {currentTier}
                    </h2>
                    <p className="text-xs font-bold text-[var(--muted)] uppercase tracking-widest">
                      {isOwner ? "Infinite Validity" : expiry ? `Expires in ${daysLeft} Days` : "No Active Plan"}
                    </p>
                  </div>
                </div>
              </div>

              {(isSilver || isReseller) && expiry && (
                <div className="h-2 w-full md:w-48 bg-white/5 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, (daysLeft / 30) * 100)}%` }}
                    className="h-full bg-gradient-to-r from-[var(--accent)] to-[var(--accent-secondary)]"
                  />
                </div>
              )}
            </div>
          </motion.div>

          {/* ================= OWNER VIEW ================= */}
          {isOwner && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-16 bg-[var(--card)]/20 border border-white/5 rounded-[2.5rem] backdrop-blur-md"
            >
              <div className="w-20 h-20 bg-yellow-400/10 border border-yellow-400/20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_50px_rgba(250,204,21,0.1)]">
                <FaCrown className="text-4xl text-yellow-400" />
              </div>
              <p className="text-2xl font-black uppercase tracking-tighter">Ultimate Control Active</p>
              <p className="text-sm text-[var(--muted)] font-medium mt-2 max-w-md mx-auto">
                You possess full administrative authority and lifetime premium access to every module in the Digital Universe.
              </p>
            </motion.div>
          )}

          {/* ================= PLANS ================= */}
          {!isOwner && (
            <div className="space-y-8">
              {/* Tabs */}
              <div className="flex justify-center p-1.5 bg-black/40 backdrop-blur-xl border border-white/5 rounded-2xl max-w-xs mx-auto">
                <PlanTab
                  active={activeTab === "silver"}
                  label="Silver"
                  icon={<FaStar />}
                  onClick={() => setActiveTab("silver")}
                />
                <PlanTab
                  active={activeTab === "reseller"}
                  label="Reseller"
                  icon={<FaUserTie />}
                  onClick={() => setActiveTab("reseller")}
                />
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, x: activeTab === "silver" ? -20 : 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: activeTab === "silver" ? 20 : -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-8"
                >
                  <PerkList
                    perks={activeTab === "silver" ? [
                      "Unlock significantly lower product pricing",
                      "Exclusive access to Profile & Collage Maker",
                      "Priority Rent-ID listing and service",
                      "Verified identity badge on profile",
                    ] : [
                      "Guaranteed absolute lowest market prices",
                      "Professional heavy-duty bulk order tools",
                      "High-priority ID Rent management system",
                      "Personalized reseller dashboard & metrics",
                    ]}
                  />

                  {(isUser || isSilver) && (
                    <div className="flex justify-center">
                      <ActionButton
                        href={
                          activeTab === "reseller"
                            ? "/games/reseller-membership"
                            : "/games/silver-membership"
                        }
                        label={
                          isSilver && activeTab === "silver"
                            ? "Plan Active"
                            : isSilver && activeTab === "reseller"
                              ? "Upgrade To Reseller"
                              : `Become A ${activeTab}`
                        }
                        type={activeTab}
                        disabled={isSilver && activeTab === "silver"}
                      />
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          )}
        </div>
      </section>
    </AuthGuard>
  );
}

/* ================= SUB COMPONENTS ================= */

function PlanTab({ active, label, icon, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 py-3 px-6 rounded-xl font-black text-[10px] uppercase tracking-widest
                  flex items-center justify-center gap-2 transition-all duration-300
        ${active
          ? "bg-[var(--accent)] text-black shadow-lg"
          : "text-[var(--muted)] hover:text-white"
        }`}
    >
      {icon}
      {label}
    </button>
  );
}

function PerkList({ perks }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {perks.map((perk, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          className="flex items-start gap-4 p-5 bg-[var(--card)]/30 border border-white/5 rounded-3xl backdrop-blur-md"
        >
          <div className="p-2 rounded-xl bg-green-500/10 border border-green-500/20 text-green-500">
            <FaCheckCircle className="text-sm" />
          </div>
          <span className="text-sm font-medium text-white/80 leading-snug">{perk}</span>
        </motion.div>
      ))}
    </div>
  );
}

function ActionButton({ href, label, type, disabled }) {
  return (
    <motion.div whileHover={!disabled ? { scale: 1.05 } : {}} whileTap={!disabled ? { scale: 0.95 } : {}}>
      <Link
        href={disabled ? "#" : href}
        className={`inline-flex items-center gap-3 px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all duration-500 shadow-2xl
          ${disabled
            ? "bg-white/5 text-white/20 border border-white/10 cursor-not-allowed"
            : type === "reseller"
              ? "bg-yellow-500 text-black shadow-yellow-500/20"
              : "bg-white text-black shadow-white/10"
          }`}
      >
        {label}
        {!disabled && <FaArrowRight className="text-sm group-hover:translate-x-1 transition-transform" />}
      </Link>
    </motion.div>
  );
}

