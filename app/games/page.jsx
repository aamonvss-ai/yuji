"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  FiFilter,
  FiX,
  FiSearch,
  FiArrowRight,
  FiLayers,
  FiGlobe,
  FiShield,
  FiZap
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import logo from "@/public/logo.png";
import GamesFilterModal from "@/components/Games/GamesFilterModal";
import Loader from "@/components/Loader/Loader";

/* ===================== SUB-COMPONENTS ===================== */

const SectionHeader = ({ title, count, icon: Icon }) => (
  <div className="flex items-center justify-between mb-6 group px-1">
    <div className="flex items-center gap-3">
      <div className="relative">
        <div className="p-2 rounded-xl bg-gradient-to-br from-[var(--accent)]/20 to-transparent border border-[var(--accent)]/20 text-[var(--accent)] shadow-[0_0_15px_rgba(var(--accent-rgb),0.1)]">
          {Icon && <Icon size={16} />}
        </div>
        <div className="absolute inset-0 bg-[var(--accent)] blur-xl opacity-20" />
      </div>
      <div className="flex flex-col">
        <h2 className="text-sm md:text-lg font-black tracking-tight text-[var(--foreground)] uppercase italic leading-none">
          {title}
        </h2>
        <div className="h-[2px] w-8 bg-[var(--accent)] mt-1.5 rounded-full opacity-50 group-hover:w-full transition-all duration-500" />
      </div>
    </div>

    {count !== undefined && (
      <div className="px-3 py-1 rounded-full bg-[var(--card)] border border-[var(--border)] shadow-sm">
        <span className="text-[8px] md:text-[9px] font-black tracking-[0.2em] text-[var(--muted)] uppercase opacity-80">
          {count} <span className="hidden sm:inline">Available</span> Items
        </span>
      </div>
    )}
  </div>
);

/* ===================== MAIN COMPONENT ===================== */

export default function GamesPage() {
  const [category, setCategory] = useState([]);
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [otts, setOtts] = useState(null);
  const [memberships, setMemberships] = useState(null);

  /* ================= FILTER STATE ================= */
  const [showFilter, setShowFilter] = useState(false);
  const [sort, setSort] = useState("az");
  const [hideOOS, setHideOOS] = useState(false);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  /* ================= CONFIG ================= */
  const SPECIAL_MLBB_GAME = "MLBB SMALL";
  const outOfStockGames = ["Genshin Impact", "TEST 1", "Wuthering of Waves", "Mobile Legends Backup"];

  const isOutOfStock = (name) => outOfStockGames.includes(name);

  /* ================= FETCH ================= */
  useEffect(() => {
    fetch("/api/games")
      .then((res) => res.json())
      .then((data) => {
        setCategory(data?.data?.category || []);
        setOtts(data?.data?.otts || null);
        setMemberships(data?.data?.memberships || null);
        setGames((data?.data?.games || []).map((g) => g.gameName === "PUBG Mobile" ? { ...g, gameName: "PUBG Mobile" } : g));
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader />;

  const activeFilterCount = (sort !== "az" ? 1 : 0) + (hideOOS ? 1 : 0);

  /* ================= PROCESSING ================= */
  const processGames = (list) => {
    let filtered = [...list];
    if (hideOOS) filtered = filtered.filter((g) => !isOutOfStock(g.gameName));
    if (search.trim()) {
      const q = search.toLowerCase();
      filtered = filtered.filter((g) => g.gameName.toLowerCase().includes(q) || g.gameFrom?.toLowerCase().includes(q));
    }
    filtered.sort((a, b) => sort === "az" ? a.gameName.localeCompare(b.gameName) : b.gameName.localeCompare(a.gameName));
    return filtered;
  };

  const injectSpecialGame = (cat) => {
    if (!cat.categoryTitle?.toLowerCase().includes("mobile legends")) return cat.gameId;
    const specialGame = games.find((g) => g.gameName === SPECIAL_MLBB_GAME);
    if (!specialGame) return cat.gameId;
    const withoutDuplicate = cat.gameId.filter((g) => g.gameName !== SPECIAL_MLBB_GAME);
    return [specialGame, ...withoutDuplicate];
  };

  /* ================= RENDER CARD ================= */
  const GameCard = ({ game }) => {
    const disabled = isOutOfStock(game.gameName);

    return (
      <Link
        href={disabled ? "#" : `/games/${game.gameSlug}`}
        className={`group block transition-all duration-500 ${disabled ? "opacity-40 grayscale cursor-not-allowed" : "hover:-translate-y-2"}`}
      >
        {/* Image Container (Compact Portrait) */}
        <div className="relative aspect-[3.5/4.5] rounded-2xl md:rounded-3xl overflow-hidden bg-[var(--card)] border border-[var(--border)] transition-all duration-500 group-hover:border-[var(--accent)]/50 group-hover:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.3)]">
          {/* Main Image */}
          <Image
            src={game.gameImageId?.image || logo}
            alt={game.gameName}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className={`object-cover transition-all duration-[1.5s] ease-out ${!disabled && "group-hover:scale-110"}`}
          />

          {/* Tag Overlay (Top Left) */}
          {!disabled && game.tagId && (
            <div className="absolute top-3 left-3 md:top-4 md:left-4 z-10">
              <div
                className="flex items-center gap-1.5 px-3 py-1 rounded-xl border border-white/10 backdrop-blur-md shadow-2xl transition-all duration-500 group-hover:bg-white/10"
                style={{ background: `${game.tagId.tagBackground}aa` }}
              >
                <FiGlobe size={10} className="text-white/60" style={{ color: game.tagId.tagColor }} />
                <span
                  className="text-[7px] md:text-[9px] font-black uppercase tracking-widest"
                  style={{ color: game.tagId.tagColor }}
                >
                  {game.tagId.tagName}
                </span>
              </div>
            </div>
          )}

          {/* Premium Shine & Glow */}
          <div className="absolute inset-0 bg-gradient-to-tr from-[var(--accent)]/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
          <div className="absolute inset-0 translate-x-[-150%] group-hover:translate-x-[150%] bg-gradient-to-r from-transparent via-white/5 to-transparent transition-transform duration-[1.5s] ease-in-out pointer-events-none" />

          {/* Maintenance Overlay */}
          {disabled && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/70 backdrop-blur-[4px]">
              <div className="px-5 py-2 bg-black/80 border border-white/10 text-[10px] font-black uppercase tracking-[0.3em] text-white rounded-full shadow-2xl">
                Offline
              </div>
            </div>
          )}
        </div>

        {/* Content Below Image */}
        <div className="mt-2.5 px-1">
          <div className="flex flex-col gap-0.5">
            <h3 className="text-[9px] md:text-[12px] font-black text-[var(--foreground)] leading-tight uppercase italic truncate group-hover:text-[var(--accent)] transition-colors duration-300">
              {game.gameName}
            </h3>
            <div className="flex items-center gap-1.5 opacity-50 group-hover:opacity-100 transition-all duration-300">
              <div className="h-[1.5px] w-3 bg-[var(--accent)] rounded-full" />
              <span className="text-[6px] md:text-[8px] font-black text-[var(--accent)] uppercase tracking-widest italic">
                {game.gameFrom || "Global"}
              </span>
            </div>
          </div>
        </div>
      </Link>
    );
  };

  return (
    <section className="min-h-screen bg-transparent">

      {/* Immersive Background Decor */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-[10%] -right-[10%] w-[400px] h-[400px] bg-[var(--accent)]/5 blur-[100px] rounded-full" />
        <div className="absolute top-[40%] -left-[5%] w-[300px] h-[300px] bg-purple-500/5 blur-[100px] rounded-full" />
      </div>

      <div className="relative z-10">
        {/* ================= SEARCH AREA ================= */}
        <div className="bg-transparent px-4 py-2 mt-4">
          <div className="max-w-7xl mx-auto flex items-center gap-3">
            <div className="relative flex-1 group">
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted)] w-4 h-4 transition-colors group-focus-within:text-[var(--accent)]" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search for your favorite game..."
                className="w-full h-11 pl-11 pr-10 rounded-2xl bg-[var(--card)]/50 backdrop-blur-md border border-[var(--border)] text-[10px] md:text-xs font-bold tracking-wider uppercase focus:border-[var(--accent)] focus:ring-4 focus:ring-[var(--accent)]/10 outline-none transition-all placeholder:text-[var(--muted)]/40 text-[var(--foreground)] shadow-sm"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg hover:bg-rose-500/10 text-[var(--muted)] hover:text-rose-500 transition-all"
                >
                  <FiX size={14} />
                </button>
              )}
            </div>

            <button
              onClick={() => setShowFilter(true)}
              className={`h-11 px-4 flex items-center gap-2 rounded-2xl border text-[10px] font-black uppercase tracking-widest transition-all shadow-sm
              ${activeFilterCount > 0
                  ? "bg-[var(--accent)] text-black border-[var(--accent)] shadow-lg shadow-[var(--accent)]/20"
                  : "bg-[var(--card)]/50 backdrop-blur-md border border-[var(--border)] text-[var(--foreground)] hover:border-[var(--accent)]/50 hover:bg-[var(--card)]"}`}
            >
              <FiFilter size={14} />
              <span className="hidden sm:inline">Refine</span>
              {activeFilterCount > 0 && (
                <span className="flex items-center justify-center w-4 h-4 rounded-md bg-black/20 text-[8px]">{activeFilterCount}</span>
              )}
            </button>
          </div>
        </div>

        {/* ================= CATEGORY FILTER ================= */}
        <div className="max-w-7xl mx-auto px-4 mt-6">
          <div className="flex gap-2.5 overflow-x-auto pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {[
              { id: "all", icon: FiLayers, label: "All" },
              { id: "mlbb", icon: FiZap, label: "MLBB" },
              { id: "others", icon: FiGlobe, label: "Others" },
              { id: "membership", icon: FiShield, label: "Membership" }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all whitespace-nowrap border
                ${activeTab === tab.id
                    ? "bg-blue-600 text-white border-blue-500 shadow-lg shadow-blue-600/30"
                    : "bg-[var(--card)] border border-[var(--border)] text-[var(--muted)] hover:border-[var(--accent)]/50 hover:text-[var(--foreground)]"}`}
              >
                <tab.icon size={12} className={activeTab === tab.id ? "text-white" : "text-[var(--accent)]"} />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* ================= CONTENT ================= */}
        <div className="max-w-7xl mx-auto px-4 py-6 space-y-8">

          {category
            .filter(cat => {
              if (activeTab === "all") return true;
              if (activeTab === "membership") return false;
              const isMLBB = cat.categoryTitle?.toLowerCase().includes("mobile legends") || cat.categoryTitle?.toLowerCase().includes("mlbb") || cat.categoryTitle?.toLowerCase().includes("bundle");
              return activeTab === "mlbb" ? isMLBB : !isMLBB;
            })
            .map((cat, i) => {
              const merged = injectSpecialGame(cat);
              const filtered = processGames(merged);
              if (!filtered.length) return null;

              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.5, delay: i * 0.05 }}
                >
                  <SectionHeader title={cat.categoryTitle} count={filtered.length} icon={FiLayers} />
                  <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7 gap-3 md:gap-4">
                    {filtered.map((game, index) => (
                      <GameCard key={index} game={game} />
                    ))}
                  </div>
                </motion.div>
              );
            })}

          {/* Global Games */}
          {(() => {
            const filteredGlobal = processGames(games).filter(g => {
              if (activeTab === "all") return true;
              if (activeTab === "membership") return false;
              const isMLBB = g.gameName?.toLowerCase().includes("mobile legends") || g.gameFrom?.toLowerCase().includes("mobile legends") || g.gameName?.toLowerCase().includes("mlbb") || g.gameName?.toLowerCase().includes("bundle");
              return activeTab === "mlbb" ? isMLBB : !isMLBB;
            });

            if (!filteredGlobal.length) return null;

            return (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
              >
                <SectionHeader title="All Games" count={filteredGlobal.length} icon={FiGlobe} />
                <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7 gap-3 md:gap-4">
                  {filteredGlobal.map((game, i) => (
                    <GameCard key={i} game={game} />
                  ))}
                </div>
              </motion.div>
            );
          })()}

          {/* Memberships */}
          {(activeTab === "all" || activeTab === "membership") && memberships?.items?.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
            >
              <SectionHeader title={memberships.title} count={memberships.items.length} icon={FiShield} />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                {memberships.items.map((plan) => (
                  <Link
                    key={plan.slug}
                    href={`/games/${plan.slug}`}
                    className="group relative flex items-center p-5 rounded-[1.5rem] bg-gradient-to-br from-[var(--card)] to-transparent border border-[var(--border)] hover:border-[var(--accent)]/40 transition-all duration-500 shadow-xl shadow-black/5 overflow-hidden"
                  >
                    <div className="relative w-16 h-16 mr-5 flex-shrink-0">
                      <div className="absolute inset-0 bg-[var(--accent)]/20 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                      <Image src={plan.image} alt={plan.name} fill className="object-contain relative z-10 group-hover:scale-110 transition-transform duration-700" />
                    </div>
                    <div className="relative z-10 flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="h-[1px] w-3 bg-[var(--accent)]" />
                        <p className="text-[8px] md:text-[9px] font-black text-[var(--accent)] uppercase tracking-[0.2em]">{plan.duration}</p>
                      </div>
                      <h3 className="text-xs md:text-sm font-black text-[var(--foreground)] uppercase tracking-tight group-hover:text-[var(--accent)] transition-colors leading-tight italic">
                        {plan.name}
                      </h3>
                      <p className="text-[9px] font-bold text-[var(--muted)] opacity-50 mt-1 uppercase">Exclusive Access</p>
                    </div>

                    {/* Decorative Elements */}
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-30 transition-opacity">
                      <FiShield size={40} className="rotate-12" />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-150%] group-hover:translate-x-[150%] transition-transform duration-1000" />
                  </Link>
                ))}
              </div>
            </motion.div>
          )}

          {/* OTT Subscriptions */}
          {(activeTab === "all" || activeTab === "others") && otts?.items?.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
            >
              <SectionHeader title={otts.title} count={otts.items.length} icon={FiZap} />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                {otts.items.map((item) => (
                  <Link
                    key={item.slug}
                    href={`/games/${item.slug}`}
                    className="group relative flex items-center p-5 rounded-[1.5rem] bg-gradient-to-br from-[var(--card)] to-transparent border border-[var(--border)] hover:border-[var(--accent)]/40 transition-all duration-500 shadow-xl shadow-black/5 overflow-hidden"
                  >
                    <div className="relative w-16 h-16 mr-5 flex-shrink-0">
                      <div className="absolute inset-0 bg-[var(--accent)]/20 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                      <Image src={item.image} alt={item.name} fill className="object-cover rounded-xl relative z-10 group-hover:scale-110 transition-transform duration-700" />
                    </div>
                    <div className="relative z-10 flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="h-[1px] w-3 bg-[var(--accent)]" />
                        <p className="text-[8px] md:text-[9px] font-black text-[var(--accent)] uppercase tracking-[0.2em]">{item.category}</p>
                      </div>
                      <h3 className="text-xs md:text-sm font-black text-[var(--foreground)] uppercase tracking-tight group-hover:text-[var(--accent)] transition-colors leading-tight italic">
                        {item.name}
                      </h3>
                      <p className="text-[9px] font-bold text-[var(--muted)] opacity-50 mt-1 uppercase">Premium Sub</p>
                    </div>

                    {/* Decorative Elements */}
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-30 transition-opacity">
                      <FiZap size={40} className="-rotate-12" />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-150%] group-hover:translate-x-[150%] transition-transform duration-1000" />
                  </Link>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {showFilter && (
        <GamesFilterModal
          open={showFilter}
          onClose={() => setShowFilter(false)}
          sort={sort}
          setSort={setSort}
          hideOOS={hideOOS}
          setHideOOS={setHideOOS}
        />
      )}
    </section>
  );
}
