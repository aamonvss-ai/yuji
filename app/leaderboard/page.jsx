"use client";

import { useEffect, useState } from "react";
import AuthGuard from "@/components/AuthGuard";
import { motion, AnimatePresence } from "framer-motion";
import { FaCrown, FaMedal, FaTrophy, FaUserCircle } from "react-icons/fa";

export default function LeaderboardPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState("monthly"); // monthly | prevMonth

  const limit = 10;

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    setLoading(true);

    fetch(`/api/leaderboard?limit=${limit}&range=${range}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((res) => {
        setData(res.success ? res.data : []);
      })
      .finally(() => setLoading(false));
  }, [range]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 },
  };

  const topThree = data.slice(0, 3);
  const rest = data.slice(3);

  return (
    <AuthGuard>
      <div className="min-h-screen bg-transparent px-4 py-8 pb-20">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-3xl mx-auto text-center mb-10"
        >
          <div className="inline-flex items-center gap-3 mb-2">
            <div className="w-8 h-px bg-gradient-to-r from-transparent to-[var(--accent)]" />
            <FaTrophy className="text-[var(--accent)]" size={16} />
            <div className="w-8 h-px bg-gradient-to-l from-transparent to-[var(--accent)]" />
          </div>
          <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tighter italic">
            Top <span className="text-[var(--accent)]">Spenders</span>
          </h1>
          <p className="mt-1 text-[var(--muted)] text-[9px] font-black uppercase tracking-[0.2em] opacity-40 italic">
            Top customers of the month
          </p>
 
          {/* Range Toggle */}
          <div className="flex justify-center mt-6 p-1 bg-[var(--card)]/30 backdrop-blur-md border border-[var(--border)] rounded-xl w-fit mx-auto shadow-xl">
            {["monthly", "prevMonth"].map((r) => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={`px-6 py-2 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all duration-500 italic
                  ${range === r
                    ? "bg-[var(--accent)] text-black shadow-lg shadow-[var(--accent)]/20"
                    : "text-[var(--muted)] hover:text-[var(--foreground)] opacity-60 hover:opacity-100"
                  }`}
              >
                {r === "monthly" ? "This Month" : "Last Month"}
              </button>
            ))}
          </div>
        </motion.div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="w-10 h-10 border-4 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : data.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-2xl mx-auto text-center py-20 bg-[var(--card)]/20 border border-dashed border-[var(--border)] rounded-[2.5rem] backdrop-blur-sm"
          >
            <FaTrophy className="text-5xl text-[var(--muted)]/20 mx-auto mb-6" />
            <h3 className="text-2xl font-black uppercase tracking-tighter italic">No Top Spenders Yet</h3>
            <p className="mt-2 text-sm text-[var(--muted)] font-medium max-w-xs mx-auto">
              No ranks yet. Start ordering now to reach the top of the list!
            </p>
          </motion.div>
        ) : (
          <div className="max-w-3xl mx-auto space-y-8">
            {/* ================= PODIUM ================= */}
            <div className="grid grid-cols-3 gap-2 md:gap-4 items-end pb-4 pt-4">
              {/* Rank 2 */}
              <PodiumItem
                user={topThree[1]}
                rank={2}
                color="text-gray-400"
                icon={<FaMedal />}
                delay={0.2}
              />
              {/* Rank 1 */}
              <PodiumItem
                user={topThree[0]}
                rank={1}
                color="text-[var(--accent)]"
                icon={<FaCrown />}
                delay={0.1}
                isLarge
              />
              {/* Rank 3 */}
              <PodiumItem
                user={topThree[2]}
                rank={3}
                color="text-amber-700"
                icon={<FaMedal />}
                delay={0.3}
              />
            </div>
 
            {/* ================= LIST ================= */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="space-y-2"
            >
              {rest.map((item, index) => (
                <div
                  key={index}
                  className="group flex items-center justify-between p-2.5 px-5 bg-[var(--card)]/20 backdrop-blur-md border border-[var(--border)] rounded-xl hover:border-[var(--accent)]/30 transition-all duration-300 shadow-sm"
                >
                  <div className="flex items-center gap-4">
                    <span className="w-6 text-[10px] font-black text-[var(--muted)] opacity-30 group-hover:text-[var(--accent)] group-hover:opacity-100 transition-all italic">
                      #{index + 4}
                    </span>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[var(--foreground)]/[0.03] overflow-hidden flex items-center justify-center border border-[var(--border)]/50 group-hover:border-[var(--accent)]/30 transition-all">
                        <FaUserCircle className="text-lg text-[var(--muted)]/20 group-hover:text-[var(--accent)]/20" />
                      </div>
                      <div>
                        <p className="text-[11px] font-black text-[var(--foreground)] uppercase tracking-tight italic leading-tight">
                          {item.user?.name || "Legend"}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-[var(--accent)] tracking-tighter italic">
                      ₹{item.totalSpent.toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>
        )}
      </div>
    </AuthGuard>
  );
}

/* ================= SUB COMPONENTS ================= */

function PodiumItem({ user, rank, color, icon, delay, isLarge }) {
  if (!user) return <div className="invisible" />;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.8, type: "spring" }}
      className={`relative flex flex-col items-center p-3 md:p-4 bg-[var(--card)]/30 backdrop-blur-md border border-[var(--border)] rounded-xl md:rounded-[2rem] shadow-xl ${isLarge
        ? "scale-105 md:scale-110 z-10 bg-gradient-to-t from-[var(--accent)]/[0.05] to-[var(--card)]/30 border-[var(--accent)]/30 shadow-[var(--accent)]/10"
        : "scale-90 md:scale-95 opacity-60 grayscale-[0.2]"
        }`}
    >
      <div className={`absolute -top-3 md:-top-4 text-xl md:text-3xl ${color}`}>
        {icon}
      </div>

      <div className={`relative rounded-full border p-0.5 md:p-1 overflow-hidden mb-2 md:mb-3 ${rank === 1 ? "w-12 h-12 md:w-20 md:h-20 border-[var(--accent)] shadow-[0_0_20px_rgba(var(--accent-rgb),0.2)]" : "w-10 h-10 md:w-16 md:h-16 border-[var(--border)]"
        }`}>
        <div className="w-full h-full rounded-full bg-[var(--foreground)]/[0.03] flex items-center justify-center">
          <FaUserCircle className={`text-xl md:text-3xl ${rank === 1 ? "text-[var(--accent)]/40" : "text-[var(--muted)]/20"}`} />
        </div>
      </div>

      <div className="text-center w-full">
        <p className={`text-[9px] md:text-[11px] font-black uppercase tracking-tighter truncate px-1 italic ${rank === 1 ? "text-[var(--foreground)]" : "text-[var(--foreground)]/60"
          }`}>
          {user.user?.name || "Legend"}
        </p>
        <p className={`text-xs md:text-base font-black mt-0.5 ${color} tracking-tighter text-center italic`}>
          ₹{user.totalSpent.toLocaleString()}
        </p>
        <div className={`mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[var(--foreground)]/[0.03] border border-[var(--border)]/50 ${rank === 1 ? 'border-[var(--accent)]/30' : ''}`}>
          <span className="text-[7px] md:text-[8px] font-black uppercase tracking-widest text-[var(--muted)] opacity-60">#{rank}</span>
        </div>
      </div>

      {rank === 1 && (
        <div className="absolute inset-0 rounded-xl md:rounded-[2rem] bg-[var(--accent)]/[0.02] -z-10 shadow-inner" />
      )}
    </motion.div>
  );
}

