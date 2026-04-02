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
  <div className="flex items-center justify-between mb-4 group">
    <div className="flex items-center gap-2">
      <div className="relative">
        <div className="p-1.5 rounded-lg bg-[var(--card)] border border-[var(--border)] text-[var(--accent)]">
          {Icon && <Icon size={14} />}
        </div>
      </div>
      <div>
        <h2 className="text-sm md:text-base font-black tracking-tight text-[var(--foreground)] uppercase italic leading-none">
          {title}
        </h2>
      </div>
    </div>

    {count !== undefined && (
      <span className="text-[8px] font-black tracking-[0.2em] text-[var(--muted)] uppercase opacity-80">
        {count} UNITS
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

  /* ================= CONFIG ================= */
  const SPECIAL_MLBB_GAME = "MLBB SMALL";
  const outOfStockGames = ["Genshin Impact", "Honor Of Kings", "TEST 1", "Wuthering of Waves", "Mobile Legends Backup"];

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
        className={`group relative rounded-2xl overflow-hidden bg-[var(--card)] border border-[var(--border)] transition-all duration-500
        ${disabled ? "opacity-30 grayscale cursor-not-allowed shadow-none" : "hover:border-[var(--accent)]/40 hover:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] hover:-translate-y-2"}`}
      >
        <div className="relative aspect-[4/5.5]">
          {/* Main Image */}
          <Image
            src={game.gameImageId?.image || logo}
            alt={game.gameName}
            fill
            sizes="(max-width: 640px) 33vw, (max-width: 1024px) 25vw, 15vw"
            className={`object-cover transition-all duration-[1s] ease-out ${!disabled && "group-hover:scale-110"}`}
          />

          {/* Information Section (Top) */}
          <div className="absolute top-0 left-0 right-0 p-3 md:p-4 space-y-1 z-20">
            <div className="flex items-center gap-1.5">
              <div className="w-1 h-1 rounded-full bg-[var(--accent)] shadow-[0_0_8px_var(--accent)]" />
              <p className="text-[7px] md:text-[9px] font-black text-[var(--accent)] uppercase tracking-[0.2em] opacity-80">
                {game.gameFrom}
              </p>
            </div>

            <h3 className="text-[11px] md:text-[14px] font-black text-white leading-tight uppercase italic mt-0.5 group-hover:text-[var(--accent)] transition-colors line-clamp-2">
              {game.gameName}
            </h3>

            {/* Minimalist Accent Line */}
            <div className="h-[2px] w-4 bg-[var(--accent)] group-hover:w-12 transition-all duration-700 rounded-full" />
          </div>

          {/* Premium Gradient Overlay (Top Focused) */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/20 to-transparent opacity-90 group-hover:opacity-100 transition-opacity duration-500" />

          {/* Reactive Shine Effect */}
          <div className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] bg-gradient-to-r from-transparent via-white/5 to-transparent transition-transform duration-1000 ease-in-out pointer-events-none" />

          {/* Bottom Info: Tag/Badge moved to bottom */}
          {!disabled && game.tagId && (
            <div className="absolute bottom-3 left-3 z-10">
              <span
                className="text-[7px] md:text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md shadow-2xl backdrop-blur-md border border-white/10"
                style={{ background: `${game.tagId.tagBackground}cc`, color: game.tagId.tagColor }}
              >
                {game.tagId.tagName}
              </span>
            </div>
          )}

          {/* Out of Stock Overlay */}
          {disabled && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
              <span className="px-3 py-1 bg-black/60 border border-white/10 text-[8px] font-black uppercase tracking-[0.2em] text-white rounded-full">
                Offline
              </span>
            </div>
          )}
        </div>
      </Link>
    );
  };

  return (
    <section className="min-h-screen bg-[var(--background)]">

      {/* Immersive Background Decor */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-[10%] -right-[10%] w-[400px] h-[400px] bg-[var(--accent)]/5 blur-[100px] rounded-full" />
        <div className="absolute top-[40%] -left-[5%] w-[300px] h-[300px] bg-purple-500/5 blur-[100px] rounded-full" />
      </div>

      <div className="relative z-10">
        {/* ================= SEARCH AREA ================= */}
        <div className="bg-transparent px-4 py-2 mt-4">
          <div className="max-w-7xl mx-auto flex items-center gap-2">
            <div className="relative flex-1">
              <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 w-3 h-3" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search..."
                className="w-full h-9 pl-9 pr-8 rounded-lg bg-[var(--card)] border border-[var(--border)] text-[10px] font-bold tracking-widest uppercase focus:border-[var(--accent)]/30 outline-none transition-all placeholder:text-[var(--muted)]/50 text-[var(--foreground)]"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-red-500 transition-colors"
                >
                  <FiX size={12} />
                </button>
              )}
            </div>

            <button
              onClick={() => setShowFilter(true)}
              className={`h-9 px-3 flex items-center gap-1.5 rounded-lg border text-[9px] font-black uppercase tracking-tight transition-all
              ${activeFilterCount > 0
                  ? "bg-[var(--accent)] text-black border-[var(--accent)]"
                  : "bg-[var(--card)] border-[var(--border)] text-[var(--foreground)] hover:border-[var(--accent)]/50"}`}
            >
              <FiFilter size={12} />
              <span className="hidden sm:inline">Filter</span>
              {activeFilterCount > 0 && (
                <span className="flex items-center justify-center w-3.5 h-3.5 rounded bg-black/20 text-[7px]">{activeFilterCount}</span>
              )}
            </button>
          </div>
        </div>

        {/* ================= CONTENT ================= */}
        <div className="max-w-7xl mx-auto px-4 py-6 space-y-8">

          {category.map((cat, i) => {
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
                <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-6">
                  {filtered.map((game, index) => (
                    <GameCard key={index} game={game} />
                  ))}
                </div>
              </motion.div>
            );
          })}

          {/* Global Games */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
          >
            <SectionHeader title="Global Games" count={processGames(games).length} icon={FiGlobe} />
            <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-6">
              {processGames(games).map((game, i) => (
                <GameCard key={i} game={game} />
              ))}
            </div>
          </motion.div>

          {/* Memberships */}
          {memberships?.items?.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
            >
              <SectionHeader title={memberships.title} count={memberships.items.length} icon={FiShield} />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {memberships.items.map((plan) => (
                  <Link
                    key={plan.slug}
                    href={`/games/membership/${plan.slug}`}
                    className="group relative flex items-center p-4 rounded-2xl bg-[var(--card)] border border-[var(--border)] hover:border-[var(--accent)]/30 hover:bg-[var(--card)]/80 transition-all duration-500 shadow-sm"
                  >
                    <div className="relative w-12 h-12 mr-4 group-hover:scale-110 transition-transform duration-500">
                      <Image src={plan.image} alt={plan.name} fill className="object-contain" />
                    </div>
                    <div className="relative z-10">
                      <p className="text-[8px] font-black text-[var(--accent)] uppercase tracking-widest mb-0.5">{plan.duration}</p>
                      <h3 className="text-xs font-black text-[var(--foreground)] uppercase tracking-tight group-hover:text-[var(--accent)] transition-colors leading-none">
                        {plan.name}
                      </h3>
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent)]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl" />
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
