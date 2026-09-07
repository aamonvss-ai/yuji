"use client";

import { JSX, useState } from "react";
import { FaUser, FaEnvelope, FaPhone, FaCalendarAlt, FaShieldAlt } from "react-icons/fa";
import { motion } from "framer-motion";
import { ShieldCheck, UserCheck, Copy, Check, Sparkles } from "lucide-react";

interface UserDetails {
  name: string;
  email: string;
  phone: string;
  userId?: string;
  userType?: string;
}

interface AccountTabProps {
  userDetails: UserDetails;
}

export default function AccountTab({ userDetails }: AccountTabProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyId = (id: string) => {
    if (!id) return;
    navigator.clipboard.writeText(id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* ================= PROFILE HEADER ================= */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row items-center gap-5 p-6 rounded-2xl bg-[var(--card)] border border-[var(--border)] shadow-xs relative overflow-hidden"
      >
        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br from-[var(--accent)] to-blue-600 flex items-center justify-center text-white text-3xl sm:text-4xl font-black shadow-md shrink-0">
          {userDetails.name?.charAt(0).toUpperCase() || "P"}
        </div>

        <div className="text-center sm:text-left space-y-1 min-w-0">
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-[var(--foreground)] truncate">
            {userDetails.name || "Player"}
          </h2>
          <p className="text-xs text-[var(--muted)] font-medium truncate">
            {userDetails.email || userDetails.phone}
          </p>

          <div className="flex flex-wrap justify-center sm:justify-start items-center gap-2 pt-1.5">
            <span className="px-3 py-1 rounded-full bg-[var(--accent)]/10 text-[var(--accent)] text-[10px] font-bold uppercase tracking-wider border border-[var(--accent)]/20 flex items-center gap-1">
              <ShieldCheck size={12} /> Verified Account
            </span>
            <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-bold uppercase tracking-wider border border-emerald-500/20 flex items-center gap-1">
              <UserCheck size={12} /> Active Member
            </span>
          </div>
        </div>
      </motion.div>

      {/* ================= PERSONAL INFO GRID ================= */}
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="space-y-4"
      >
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--muted)] flex items-center gap-1.5">
            <FaUser className="text-[var(--accent)]" /> Profile Details
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <InfoCard icon={<FaUser />} label="Full Name" value={userDetails.name || "N/A"} />
          <InfoCard icon={<FaEnvelope />} label="Email Address" value={userDetails.email || "N/A"} />
          <InfoCard icon={<FaPhone />} label="Phone Number" value={userDetails.phone || "N/A"} />
          {userDetails.userId && (
            <div className="p-4 rounded-xl bg-[var(--card)] border border-[var(--border)] flex items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-[var(--background)] flex items-center justify-center text-[var(--accent)] shrink-0 border border-[var(--border)]">
                  <Sparkles size={16} />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider">User ID</p>
                  <p className="text-xs font-bold font-mono text-[var(--foreground)] truncate">{userDetails.userId}</p>
                </div>
              </div>
              <button
                onClick={() => handleCopyId(userDetails.userId!)}
                className="p-2 rounded-lg bg-[var(--background)] border border-[var(--border)] text-[var(--muted)] hover:text-[var(--foreground)] transition-colors shrink-0"
                title="Copy User ID"
              >
                {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
              </button>
            </div>
          )}
          <InfoCard icon={<FaShieldAlt />} label="Account Role" value={userDetails.userType ? userDetails.userType.toUpperCase() : "USER"} />
          <InfoCard icon={<FaCalendarAlt />} label="Security Status" value="Secure (Passwordless OTP / OAuth)" />
        </div>
      </motion.section>
    </div>
  );
}

function InfoCard({ icon, label, value }: { icon: JSX.Element; label: string; value: string }) {
  return (
    <div className="p-4 rounded-xl bg-[var(--card)] border border-[var(--border)] hover:border-[var(--accent)]/30 transition-all flex items-center gap-3 shadow-xs">
      <div className="w-10 h-10 rounded-xl bg-[var(--background)] flex items-center justify-center text-[var(--accent)] shrink-0 border border-[var(--border)]">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider">{label}</p>
        <p className="text-xs font-bold text-[var(--foreground)] truncate">{value}</p>
      </div>
    </div>
  );
}
