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
  <div className="flex items-center justify-between mb-3.5 pt-2">
    <div className="flex items-center gap-2.5">
      <div className="w-7 h-7 md:w-8 md:h-8 rounded-xl bg-[var(--accent)]/10 border border-[var(--accent)]/20 text-[var(--accent)] flex items-center justify-center shrink-0">
        {Icon && <Icon size={14} />}
      </div>
      <h2 className="text-[13px] md:text-[15px] font-bold tracking-tight text-[var(--foreground)]">
        {title}
      </h2>
    </div>

    {count !== undefined && (
      <span className="px-2 py-0.5 rounded-md bg-[var(--foreground)]/[0.04] border border-[var(--border)] text-[9.5px] md:text-[10px] font-semibold text-[var(--muted)]">
        {count} {count === 1 ? 'Item' : 'Items'}
      </span>
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
    const cached = localStorage.getItem("yuji_games_cache");
    if (cached) {
      try {
        const data = JSON.parse(cached);
        setCategory(data.category || []);
        setOtts(data.otts || null);
        setMemberships(data.memberships || null);
        setGames((data.games || []).map((g) => g.gameName === "PUBG Mobile" ? { ...g, gameName: "PUBG Mobile" } : g));
        setLoading(false);
      } catch (e) {}
    }

    fetch("/api/games")
      .then((res) => res.json())
      .then((data) => {
        const payload = {
          category: data?.data?.category || [],
          otts: data?.data?.otts || null,
          memberships: data?.data?.memberships || null,
          games: data?.data?.games || []
        };
        localStorage.setItem("yuji_games_cache", JSON.stringify(payload));
        
        setCategory(payload.category);
        setOtts(payload.otts);
        setMemberships(payload.memberships);
        setGames(payload.games.map((g) => g.gameName === "PUBG Mobile" ? { ...g, gameName: "PUBG Mobile" } : g));
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader />;

  const activeFilterCount = (sort ? 1 : 0) + (hideOOS ? 1 : 0) + (activeTab !== "all" ? 1 : 0);

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
        {/* Image Container (Compact Squircle Card) */}
        <div className="relative aspect-square rounded-2xl md:rounded-[1.25rem] overflow-hidden bg-[var(--card)] border border-[var(--border)] transition-all duration-500 group-hover:border-[var(--accent)]/50 group-hover:shadow-[0_15px_30px_-10px_rgba(0,0,0,0.25)]">
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
        <div className="mt-1.5 px-0.5">
          <div className="flex flex-col">
            <h3 className="text-[9px] md:text-[11px] font-black text-[var(--foreground)] leading-tight uppercase italic line-clamp-2 group-hover:text-[var(--accent)] transition-colors duration-300">
              {game.gameName}
            </h3>
            <div className="flex items-center gap-1 opacity-40 group-hover:opacity-100 transition-all duration-300">
              <span className="text-[6px] md:text-[7px] font-black text-[var(--accent)] uppercase tracking-[0.15em] italic">
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
        <div className="bg-transparent py-2 mt-4">
          <div className="max-w-7xl mx-auto px-4">
            <div className="relative flex items-center group">
              <FiSearch className="absolute left-4 text-[var(--muted)] w-4 h-4 transition-colors group-focus-within:text-[var(--accent)] pointer-events-none z-10" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search for your favorite game..."
                className="w-full h-11 pl-11 pr-24 rounded-2xl bg-[var(--card)]/60 backdrop-blur-md border border-[var(--border)] text-[11px] md:text-xs font-semibold tracking-wide focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/15 outline-none transition-all placeholder:text-[var(--muted)]/50 text-[var(--foreground)] shadow-xs"
              />
              <div className="absolute right-2 flex items-center gap-1.5">
                {search && (
                  <button
                    onClick={() => setSearch("")}
                    className="p-1 rounded-lg hover:bg-rose-500/10 text-[var(--muted)] hover:text-rose-500 transition-colors"
                  >
                    <FiX size={14} />
                  </button>
                )}
                <button
                  onClick={() => setShowFilter(true)}
                  className={`h-7 px-2.5 flex items-center gap-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all ${
                    activeFilterCount > 0
                      ? "bg-[var(--accent)] text-white shadow-xs"
                      : "bg-[var(--foreground)]/[0.05] hover:bg-[var(--foreground)]/[0.1] text-[var(--foreground)] border border-[var(--border)]"
                  }`}
                  title="Filter & Sort games"
                >
                  <FiFilter size={11} className={activeFilterCount > 0 ? "text-white" : "text-[var(--muted)]"} />
                  <span>Filter</span>
                  {activeFilterCount > 0 && (
                    <span className="w-4 h-4 rounded-full bg-white/20 text-white text-[8.5px] flex items-center justify-center font-bold">
                      {activeFilterCount}
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ================= CONTENT ================= */}
        <div className="max-w-7xl mx-auto px-4 py-4 space-y-6">

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
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />
      )}
    </section>
  );
}
