"use client";

import { useEffect, useState } from "react";
import AuthGuard from "@/components/AuthGuard";
import { motion, AnimatePresence } from "framer-motion";
import { FaCrown, FaMedal, FaTrophy, FaUserCircle } from "react-icons/fa";

export default function LeaderboardPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState("monthly"); // weekly | monthly

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
      <div className="min-h-screen bg-[var(--background)] px-4 py-12 pb-20">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto text-center mb-10"
        >
          <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tighter italic">
            Top <span className="text-[var(--accent)]">Legends</span>
          </h1>
          <p className="mt-2 text-[var(--muted)] text-xs md:text-sm font-black uppercase tracking-widest opacity-80">
            Our top customers of the week and month
          </p>

          {/* Range Toggle */}
          <div className="flex justify-center mt-8 p-1 bg-[var(--card)] backdrop-blur-xl border border-[var(--border)] rounded-2xl w-fit mx-auto">
            {["weekly", "monthly"].map((r) => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={`px-8 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${range === r
                  ? "bg-[var(--accent)] text-black shadow-lg"
                  : "text-[var(--muted)] hover:text-[var(--foreground)]"
                  }`}
              >
                {r === "weekly" ? "This Week" : "This Month"}
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
            <h3 className="text-2xl font-black uppercase tracking-tighter italic">No Legends Yet</h3>
            <p className="mt-2 text-sm text-[var(--muted)] font-medium max-w-xs mx-auto">
              No ranks yet. Start ordering now to reach the top of the list!
            </p>
          </motion.div>
        ) : (
          <div className="max-w-4xl mx-auto space-y-12">
            {/* ================= PODIUM ================= */}
            <div className="grid grid-cols-3 gap-2 md:gap-6 items-end pb-10">
              {/* Rank 1 */}
              <PodiumItem
                user={topThree[0]}
                rank={1}
                color="text-yellow-400"
                icon={<FaCrown />}
                delay={0.1}
                isLarge
              />
              {/* Rank 2 */}
              <PodiumItem
                user={topThree[1]}
                rank={2}
                color="text-gray-300"
                icon={<FaMedal />}
                delay={0.2}
              />
              {/* Rank 3 */}
              <PodiumItem
                user={topThree[2]}
                rank={3}
                color="text-orange-400"
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
              className="space-y-3"
            >
              {rest.map((item, index) => (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  className="group flex items-center justify-between p-4 px-6 bg-[var(--card)] border border-[var(--border)] rounded-2xl hover:border-[var(--accent)]/30 transition-all duration-300 shadow-sm"
                >
                  <div className="flex items-center gap-4">
                    <span className="w-8 text-sm font-black text-[var(--muted)] group-hover:text-[var(--accent)] transition-colors">
                      #{index + 4}
                    </span>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[var(--foreground)]/5 overflow-hidden flex items-center justify-center border border-[var(--border)]">
                        <FaUserCircle className="text-2xl text-[var(--muted)]/40" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-[var(--foreground)] uppercase tracking-tight">
                          {item.user?.name || "Anonymous User"}
                        </p>
                        <p className="text-[10px] text-[var(--muted)] font-black uppercase tracking-widest leading-none">
                          {item.totalOrders} Global Orders
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-black text-[var(--accent)] tracking-tighter">
                      ₹{item.totalSpent.toLocaleString()}
                    </p>
                  </div>
                </motion.div>
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
      className={`relative flex flex-col items-center p-3 md:p-6 bg-[var(--card)] border border-[var(--border)] rounded-2xl md:rounded-[2.5rem] shadow-sm ${isLarge
        ? "scale-105 md:scale-110 z-10 bg-gradient-to-t from-[var(--accent)]/10 to-[var(--card)] border-[var(--accent)]/20 shadow-2xl"
        : "scale-90 md:scale-95 opacity-80"
        }`}
    >
      <div className={`absolute -top-4 md:-top-6 text-2xl md:text-4xl ${color} drop-shadow-[0_0_15px_var(--accent)]/20`}>
        {icon}
      </div>

      <div className={`relative rounded-full border-2 p-0.5 md:p-1 overflow-hidden mb-2 md:mb-4 ${rank === 1 ? "w-16 h-16 md:w-24 md:h-24 border-[var(--accent)]" : "w-12 h-12 md:w-20 md:h-20 border-[var(--border)]"
        }`}>
        <div className="w-full h-full rounded-full bg-[var(--foreground)]/5 flex items-center justify-center">
          <FaUserCircle className={`text-2xl md:text-4xl ${rank === 1 ? "text-[var(--accent)]/50" : "text-[var(--muted)]/20"}`} />
        </div>
      </div>

      <div className="text-center w-full">
        <p className={`text-[10px] md:text-sm font-black uppercase tracking-tighter truncate px-1 ${rank === 1 ? "text-[var(--foreground)]" : "text-[var(--foreground)]/80"
          }`}>
          {user.user?.name || "Legend"}
        </p>
        <p className={`text-xs md:text-xl font-black mt-0.5 md:mt-1 ${color} tracking-tighter text-center`}>
          ₹{user.totalSpent.toLocaleString()}
        </p>
        <div className="mt-2 md:mt-3 inline-flex items-center gap-1.5 px-2 py-0.5 md:px-3 md:py-1 rounded-full bg-[var(--foreground)]/5 border border-[var(--border)]">
          <span className="text-[7px] md:text-[9px] font-black uppercase tracking-widest text-[var(--muted)]">#{rank}</span>
        </div>
      </div>

      {rank === 1 && (
        <div className="absolute inset-0 rounded-2xl md:rounded-[2.5rem] bg-[var(--accent)]/5 animate-pulse -z-10" />
      )}
    </motion.div>
  );
}

