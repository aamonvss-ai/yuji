"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
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
import GamesFilterModal from "@/components/Games/GamesFilterModal";
import Loader from "@/components/Loader/Loader";
import SearchInput from "@/components/ui/SearchInput";
import EmptyState from "@/components/ui/EmptyState";

/* ===================== SUB-COMPONENTS ===================== */

const SectionHeader = ({ title, count, icon: Icon }) => (
  <div className="flex items-center justify-between mb-4 pt-3">
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 md:w-9 md:h-9 rounded-xl bg-[var(--accent)]/10 border border-[var(--accent)]/20 text-[var(--accent)] flex items-center justify-center shrink-0">
        {Icon && <Icon size={16} />}
      </div>
      <h2 className="text-[15px] md:text-[18px] font-black tracking-tight text-[var(--foreground)] uppercase italic">
        {title}
      </h2>
    </div>

    {count !== undefined && (
      <span className="px-2.5 py-1 rounded-lg bg-[var(--foreground)]/[0.04] border border-[var(--border)] text-[10px] md:text-[11px] font-bold text-[var(--muted)]">
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

  const isOutOfStock = (game) => {
    if (!game) return false;
    if (typeof game === "object") {
      if (game.gameAvailablity === false || game.isOutOfStock === true) return true;
      if (outOfStockGames.includes(game.gameName) || outOfStockGames.includes(game.gameSlug)) return true;
      return false;
    }
    return outOfStockGames.includes(game);
  };

  /* ================= FETCH ================= */
  useEffect(() => {
    const cached = localStorage.getItem("yuji_games_cache");
    if (cached) {
      try {
        const data = JSON.parse(cached);
        queueMicrotask(() => {
          setCategory(data.category || []);
          setOtts(data.otts || null);
          setMemberships(data.memberships || null);
          setGames((data.games || []).map((g) => g.gameName === "PUBG Mobile" ? { ...g, gameName: "PUBG Mobile" } : g));
          setLoading(false);
        });
      } catch {
        // invalid cache ignore
      }
    }

    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    fetch("/api/games", {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    })
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

  /* ================= PROCESSING ================= */
  const processGames = useCallback((list) => {
    if (!list || !list.length) return [];
    let filtered = [...list];
    if (hideOOS) filtered = filtered.filter((g) => !isOutOfStock(g));
    if (search.trim()) {
      const q = search.toLowerCase();
      filtered = filtered.filter((g) => g.gameName?.toLowerCase().includes(q) || g.gameFrom?.toLowerCase().includes(q));
    }
    filtered.sort((a, b) => sort === "az" ? a.gameName.localeCompare(b.gameName) : b.gameName.localeCompare(a.gameName));
    return filtered;
  }, [hideOOS, search, sort]);

  const injectSpecialGame = useCallback((cat) => {
    if (!cat.categoryTitle?.toLowerCase().includes("mobile legends")) return cat.gameId || [];
    const specialGame = games.find((g) => g.gameName === SPECIAL_MLBB_GAME);
    if (!specialGame) return cat.gameId || [];
    const withoutDuplicate = (cat.gameId || []).filter((g) => g.gameName !== SPECIAL_MLBB_GAME);
    return [specialGame, ...withoutDuplicate];
  }, [games]);

  if (loading) return <Loader />;

  const activeFilterCount = (sort ? 1 : 0) + (hideOOS ? 1 : 0) + (activeTab !== "all" ? 1 : 0);

  /* ================= RENDER CARD ================= */
  const GameCard = ({ game }) => {
    const disabled = isOutOfStock(game);

    const tagName = (game.tagId?.tagName?.toLowerCase().includes("most selling") || game.tagId?.tagName === "MOST SELLING")
      ? "INDIAN SMALL PACK"
      : game.tagId?.tagName;

    return (
      <Link
        href={disabled ? "#" : `/games/${game.gameSlug}`}
        onClick={(e) => {
          if (disabled) e.preventDefault();
        }}
        className={`group flex flex-col transition-all duration-300 transform-gpu ${disabled ? "opacity-40 grayscale cursor-not-allowed pointer-events-none" : "hover:-translate-y-1"}`}
      >
        {/* Image Container */}
        <div className="relative aspect-square rounded-xl sm:rounded-2xl overflow-hidden bg-[var(--card)] border border-[var(--border)] group-hover:border-[var(--accent)]/60 transition-all duration-300 shadow-xs group-hover:shadow-md">
          {/* Main Image */}
          <Image
            src={game.gameImageId?.image || logo}
            alt={game.gameName}
            fill
            sizes="(max-width: 640px) 33vw, (max-width: 1024px) 25vw, 15vw"
            className={`object-cover transition-transform duration-500 ease-out ${!disabled && "group-hover:scale-105"}`}
          />

          {/* Sleek Minimal Tag Badge (Top-Right) */}
          {!disabled && game.tagId && tagName && (
            <div className="absolute top-1.5 right-1.5 z-10">
              <span
                className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[7px] sm:text-[7.5px] md:text-[8px] font-bold uppercase tracking-wider backdrop-blur-md shadow-xs border border-white/20 text-white"
                style={{ background: `${game.tagId.tagBackground || '#0284c7'}dd` }}
              >
                {tagName}
              </span>
            </div>
          )}

          {/* Out of Stock Overlay */}
          {disabled && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/75 backdrop-blur-xs p-1">
              <span className="px-1.5 sm:px-2 py-0.5 bg-black/90 border border-white/20 text-[6.5px] sm:text-[7.5px] font-bold uppercase tracking-wider text-white rounded-md whitespace-nowrap">
                Out of Stock
              </span>
            </div>
          )}
        </div>

        {/* Clean Info Below Card */}
        <div className="mt-1.5 px-0.5 text-left">
          <h3 className="text-[10px] sm:text-[11px] md:text-[12px] font-bold text-[var(--foreground)] leading-tight group-hover:text-[var(--accent)] transition-colors duration-200">
            {game.gameName}
          </h3>
          <p className="text-[8px] sm:text-[8.5px] md:text-[9px] font-medium text-[var(--muted)] leading-tight mt-0.5">
            {game.gameFrom || "Global"}
          </p>
        </div>
      </Link>
    );
  };

  return (
    <section className="min-h-screen bg-transparent">

      <div className="relative z-10">
        {/* ================= SEARCH AREA ================= */}
        <div className="bg-transparent py-2 mt-4">
          <div className="max-w-7xl mx-auto px-4">
            <SearchInput
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onClear={() => setSearch("")}
              placeholder="Search for your favorite game..."
              inputClassName="!rounded-2xl !bg-[var(--card)]/60 !backdrop-blur-md !text-[11px] md:!text-xs font-semibold !shadow-xs"
              rightElement={
                <button
                  type="button"
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
              }
            />
          </div>
        </div>

        {/* ================= CONTENT ================= */}
        <div className="max-w-7xl mx-auto px-4 py-4 space-y-7">

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
                <div key={i}>
                  <SectionHeader title={cat.categoryTitle} count={filtered.length} icon={FiLayers} />
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-2.5 sm:gap-3.5 md:gap-4.5">
                    {filtered.map((game, index) => (
                      <GameCard key={game._id || game.gameSlug || index} game={game} />
                    ))}
                  </div>
                </div>
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
              <div>
                <SectionHeader title="All Games" count={filteredGlobal.length} icon={FiGlobe} />
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-2.5 sm:gap-3.5 md:gap-4.5">
                  {filteredGlobal.map((game, i) => (
                    <GameCard key={game._id || game.gameSlug || i} game={game} />
                  ))}
                </div>
              </div>
            );
          })()}

          {/* Memberships */}
          {(activeTab === "all" || activeTab === "membership") && memberships?.items?.length > 0 && (
            <div>
              <SectionHeader title={memberships.title} count={memberships.items.length} icon={FiShield} />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                {memberships.items.map((plan) => (
                  <Link
                    key={plan.slug}
                    href={`/games/${plan.slug}`}
                    className="group relative flex items-center p-5 rounded-[1.5rem] bg-gradient-to-br from-[var(--card)] to-transparent border border-[var(--border)] hover:border-[var(--accent)]/40 transition-transform duration-250 ease-out hover:-translate-y-1 shadow-sm overflow-hidden transform-gpu"
                  >
                    <div className="relative w-16 h-16 mr-5 flex-shrink-0 rounded-2xl overflow-hidden border border-[var(--border)] bg-gradient-to-br from-[var(--foreground)]/[0.04] to-transparent shadow-sm">
                      <Image src={plan.image} alt={plan.name} fill className="object-cover relative z-10 group-hover:scale-105 transition-transform duration-300" />
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
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                      <FiShield size={40} className="rotate-12" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* OTT Subscriptions */}
          {(activeTab === "all" || activeTab === "others") && otts?.items?.length > 0 && (
            <div>
              <SectionHeader title={otts.title} count={otts.items.length} icon={FiZap} />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                {otts.items.map((item) => (
                  <Link
                    key={item.slug}
                    href={`/games/${item.slug}`}
                    className="group relative flex items-center p-5 rounded-[1.5rem] bg-gradient-to-br from-[var(--card)] to-transparent border border-[var(--border)] hover:border-[var(--accent)]/40 transition-transform duration-250 ease-out hover:-translate-y-1 shadow-sm overflow-hidden transform-gpu"
                  >
                    <div className="relative w-16 h-16 mr-5 flex-shrink-0">
                      <Image src={item.image} alt={item.name} fill className="object-cover rounded-xl relative z-10 group-hover:scale-105 transition-transform duration-300" />
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
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                      <FiZap size={40} className="-rotate-12" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
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
