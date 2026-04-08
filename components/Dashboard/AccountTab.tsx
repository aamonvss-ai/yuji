"use client";

import { JSX, useState } from "react";
import { FaUser, FaEnvelope, FaPhone, FaLock, FaCalendarAlt, FaShieldAlt } from "react-icons/fa";
import { motion } from "framer-motion";
import { FiEdit2, FiCamera } from "react-icons/fi";

interface UserDetails {
  name: string;
  email: string;
  phone: string;
}

interface AccountTabProps {
  userDetails: UserDetails;
}

export default function AccountTab({ userDetails }: AccountTabProps) {
  const [newPass, setNewPass] = useState("");
  const [passSuccess, setPassSuccess] = useState("");
  const [passError, setPassError] = useState("");
  const [loadingPass, setLoadingPass] = useState(false);

  const handlePasswordUpdate = async () => {
    if (newPass.length < 6) {
      setPassError("Password must be at least 6 characters");
      return;
    }

    setLoadingPass(true);

    try {
      const res = await fetch("/api/auth/update-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identifier: userDetails.email || userDetails.phone,
          newPassword: newPass,
        }),
      });

      const data = await res.json();
      setLoadingPass(false);

      if (!data.success) {
        setPassError(data.message);
        return;
      }

      setNewPass("");
      setPassSuccess("Password updated");
      setTimeout(() => setPassSuccess(""), 2500);
    } catch {
      setLoadingPass(false);
      setPassError("Could not update password. Please try again.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* ================= PROFILE HEADER ================= */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row items-center gap-6 p-8 rounded-[2.5rem] bg-[var(--background)] border border-[var(--border)] shadow-xl relative overflow-hidden"
      >
        <div className="relative group">
          <div className="w-24 h-24 md:w-32 md:h-32 rounded-[2rem] bg-gradient-to-br from-[var(--accent)] to-[#4f46e5] flex items-center justify-center text-white text-4xl md:text-5xl font-black shadow-2xl">
            {userDetails.name?.charAt(0).toUpperCase() || "P"}
          </div>
          <button className="absolute -bottom-2 -right-2 p-2.5 rounded-2xl bg-[var(--card)] border border-[var(--border)] text-[var(--accent)] shadow-lg hover:scale-110 transition-transform">
            <FiCamera size={18} />
          </button>
        </div>

        <div className="text-center md:text-left">
          <h2 className="text-3xl font-black tracking-tight">{userDetails.name || "Player"}</h2>
          <p className="text-[var(--muted)] font-medium mt-1">{userDetails.email || userDetails.phone}</p>
          <div className="flex flex-wrap justify-center md:justify-start gap-3 mt-4">
            <span className="px-4 py-1.5 rounded-full bg-[var(--accent)]/10 text-[var(--accent)] text-xs font-bold uppercase tracking-widest border border-[var(--accent)]/10">Verified</span>
            <span className="px-4 py-1.5 rounded-full bg-green-500/10 text-green-500 text-xs font-bold uppercase tracking-widest border border-green-500/10">Active Member</span>
          </div>
        </div>

        {/* Decor */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--accent)]/5 rounded-full blur-3xl -z-10" />
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* ================= PERSONAL INFO ================= */}
        <motion.section
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-6"
        >
          <div className="flex items-center justify-between px-2">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <FaUser className="text-[var(--accent)]" /> Profile
            </h3>
            <button className="text-[var(--accent)] text-sm font-bold flex items-center gap-1 hover:underline">
              <FiEdit2 size={14} /> Edit
            </button>
          </div>

          <div className="space-y-4">
            <InfoCard icon={<FaUser />} label="Full Name" value={userDetails.name || "N/A"} />
            <InfoCard icon={<FaEnvelope />} label="Email" value={userDetails.email || "N/A"} />
            <InfoCard icon={<FaPhone />} label="Phone" value={userDetails.phone || "N/A"} />
          </div>
        </motion.section>

        {/* ================= SECURITY ================= */}
        <motion.section
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-6"
        >
          <h3 className="text-xl font-bold flex items-center gap-2 px-2">
            <FaShieldAlt className="text-[var(--accent)]" /> Security
          </h3>

          <div className="p-8 rounded-[2.5rem] bg-[var(--card)] border border-[var(--border)] shadow-inner space-y-6">
            {passSuccess && (
              <div className="rounded-2xl bg-green-500/10 text-green-500 p-4 text-sm font-bold border border-green-500/10 flex items-center gap-2">
                <FaShieldAlt /> {passSuccess}
              </div>
            )}
            {passError && (
              <div className="rounded-2xl bg-red-500/10 text-red-500 p-4 text-sm font-bold border border-red-500/10 flex items-center gap-2">
                ● {passError}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-[var(--muted)] uppercase tracking-widest block mb-2">New Password</label>
                <div className="relative group">
                  <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted)] group-focus-within:text-[var(--accent)] transition-colors" />
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={newPass}
                    onChange={(e) => {
                      setNewPass(e.target.value);
                      setPassError("");
                    }}
                    className="w-full pl-12 pr-4 py-4 rounded-2xl bg-[var(--background)] border border-[var(--border)] focus:border-[var(--accent)] focus:ring-4 focus:ring-[var(--accent)]/10 outline-none transition-all font-mono"
                  />
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handlePasswordUpdate}
                disabled={loadingPass || !newPass}
                className="w-full py-4 rounded-2xl bg-[var(--accent)] text-white font-bold shadow-xl shadow-[var(--accent)]/20 hover:shadow-[var(--accent)]/40 transition-all disabled:opacity-50"
              >
                {loadingPass ? "Updating..." : "Update Password"}
              </motion.button>
            </div>
          </div>
        </motion.section>
      </div>

      {/* ================= FOOTER STATS ================= */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
        <StatItem icon={<FaCalendarAlt />} label="Joined" value="Feb 2026" />
        <StatItem icon={<FaShieldAlt />} label="Status" value="Verified" />
        <StatItem icon={<FaUser />} label="Level" value="Gold Player" />
        <StatItem icon={<FaShieldAlt />} label="Security" value="Strong" />
      </div>
    </div>
  );
}

function InfoCard({ icon, label, value }: { icon: JSX.Element; label: string; value: string }) {
  return (
    <div className="group p-5 rounded-2xl bg-[var(--card)] border border-[var(--border)] hover:border-[var(--accent)]/50 transition-all flex items-center gap-4">
      <div className="w-12 h-12 rounded-xl bg-[var(--background)] flex items-center justify-center text-[var(--accent)] group-hover:bg-[var(--accent)] group-hover:text-white transition-all shadow-sm">
        {icon}
      </div>
      <div>
        <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-widest">{label}</p>
        <p className="font-bold text-[var(--foreground)] truncate">{value}</p>
      </div>
    </div>
  );
}

function StatItem({ icon, label, value }: { icon: JSX.Element; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 px-2">
      <div className="text-[var(--muted)]">{icon}</div>
      <div>
        <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider">{label}</p>
        <p className="text-xs font-black">{value}</p>
      </div>
    </div>
  );
}
