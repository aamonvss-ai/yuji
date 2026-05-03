"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Percent,
  Coins,
  Trash2,
  RefreshCcw,
  Gamepad2,
  Save,
  Package,
  Loader2
} from "lucide-react";

const API_BASE = "https://game-off-ten.vercel.app/api/v1";

export default function PricingTab({
  pricingType,
  setPricingType,
  slabs,
  setSlabs,
  overrides,
  setOverrides,
  gameOverrides = [],
  setGameOverrides,
  savingPricing,
  onSave,
}) {
  const [pricingMode, setPricingMode] = useState("percent");
  const [games, setGames] = useState([]);
  const [itemsByGame, setItemsByGame] = useState({});
  const [fixedGameFilter, setFixedGameFilter] = useState("");
  const [fixedItemFilter, setFixedItemFilter] = useState("");
  const [loadingFixedPrices, setLoadingFixedPrices] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/games/list`);
        const json = await res.json();
        if (json.success) setGames(json.data.games);
      } catch (e) {
        console.error("Game fetch failed", e);
      }
    })();
  }, []);

  const fetchItemsForGame = async (gameSlug) => {
    if (!gameSlug) return [];
    if (itemsByGame[gameSlug]) return itemsByGame[gameSlug];

    try {
      const res = await fetch(`${API_BASE}/games/${gameSlug}/items`);
      const json = await res.json();
      if (json.success) {
        const items = json.data.items || [];
        setItemsByGame((p) => ({ ...p, [gameSlug]: items }));
        return items;
      }
    } catch (e) {
      console.error("Item fetch failed", e);
    }
    return [];
  };

  const hydrateFixedPricing = async (gameSlug) => {
    if (!gameSlug) return;
    setLoadingFixedPrices(true);
    try {
      const items = await fetchItemsForGame(gameSlug);
      const hydrated = items.map((item) => {
        const existing = overrides.find(
          (o) => o.gameSlug === gameSlug && o.itemSlug === item.itemSlug
        );
        return {
          gameSlug,
          itemSlug: item.itemSlug,
          itemName: item.itemName,
          fixedPrice: existing?.fixedPrice ?? Number(item.sellingPrice) ?? 0,
          isOverride: existing?.isOverride ?? false,
          isOutOfStock: existing?.isOutOfStock ?? false,
        };
      });

      setOverrides((prev) => {
        const others = prev.filter(o => o.gameSlug !== gameSlug);
        return [...others, ...hydrated];
      });
    } finally {
      setLoadingFixedPrices(false);
    }
  };

  useEffect(() => {
    if (pricingMode === "fixed" && fixedGameFilter) {
      hydrateFixedPricing(fixedGameFilter);
    }
  }, [fixedGameFilter, pricingMode]);

  const visibleOverrides = useMemo(() => {
    return overrides.filter((o) => {
      if (fixedGameFilter && o.gameSlug !== fixedGameFilter) return false;
      return true;
    });
  }, [overrides, fixedGameFilter]);

  const updateOverride = (gameSlug, itemSlug, fields) => {
    setOverrides((prev) =>
      prev.map((o) =>
        o.gameSlug === gameSlug && o.itemSlug === itemSlug
          ? { ...o, ...fields }
          : o
      )
    );
  };

  const updateGameOveride = (gameSlug, fields) => {
    setGameOverrides((prev) => {
      const existingIdx = prev.findIndex(o => o.gameSlug === gameSlug);
      if (existingIdx > -1) {
        const next = [...prev];
        next[existingIdx] = { ...next[existingIdx], ...fields };
        return next;
      } else {
        return [...prev, { gameSlug, isOutOfStock: false, ...fields }];
      }
    });
  };

  const isGameOutOfStock = (gameSlug) => {
    return gameOverrides.find(o => o.gameSlug === gameSlug)?.isOutOfStock ?? false;
  };

  const updateSlab = (i, key, value) => {
    const next = [...slabs];
    next[i][key] = Math.max(0, Number(value) || 0);
    setSlabs(next);
  };

  const addSlab = () => setSlabs([...slabs, { min: 0, max: 0, percent: 0 }]);
  const deleteSlab = (i) => setSlabs(slabs.filter((_, idx) => idx !== i));
  const canSave = !savingPricing;

  const filteredGames = useMemo(() => {
    if (!fixedItemFilter) return games;
    return games.filter(g => g.gameName.toLowerCase().includes(fixedItemFilter.toLowerCase()));
  }, [games, fixedItemFilter]);

  return (
    <div className="space-y-6 pb-20 max-w-full overflow-x-hidden text-[var(--foreground)]/80">
      {/* ================= HEADER ================= */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-1">
          <h2 className="text-2xl md:text-3xl font-black italic tracking-tighter text-[var(--foreground)] uppercase">Pricing Config</h2>
          <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-[0.2em]">Manage profit margins and fixed item prices</p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* MODE SELECTOR */}
          <div className="flex bg-[var(--background)] p-1 rounded-xl border border-[var(--border)] overflow-x-auto no-scrollbar">
            {[
              { id: "percent", label: "Markup", icon: <Percent size={12} /> },
              { id: "fixed", label: "Fixed", icon: <Coins size={12} /> }
            ].map((m) => (
              <button
                key={m.id}
                onClick={() => setPricingMode(m.id)}
                className={`flex-1 flex items-center justify-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${pricingMode === m.id
                  ? "bg-[#0ea5e9] text-black shadow-[0_0_20px_rgba(14,165,233,0.3)]"
                  : "text-[var(--muted)] hover:text-[var(--foreground)]"
                  }`}
              >
                {m.icon}
                {m.label}
              </button>
            ))}
          </div>

          {/* ROLE SELECTOR */}
          <div className="flex bg-[var(--background)] p-1 rounded-xl border border-[var(--border)] overflow-x-auto no-scrollbar">
            {["user", "member", "admin"].map((type) => (
              <button
                key={type}
                onClick={() => setPricingType(type)}
                className={`flex-1 px-3 sm:px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${pricingType === type
                  ? "bg-[#0ea5e9] text-black shadow-[0_0_20px_rgba(14,165,233,0.3)]"
                  : "text-[var(--muted)] hover:text-[var(--foreground)]"
                  }`}
              >
                {type}
              </button>
            ))}
          </div>

          <button
            onClick={onSave}
            disabled={!canSave}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#0ea5e9] text-black text-[10px] font-black uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all disabled:opacity-50 shadow-lg shadow-[#0ea5e9]/20"
          >
            {savingPricing ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            Save Changes
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {pricingMode === "percent" ? (
          <motion.div
            key="markup"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] border border-[var(--border)] bg-[var(--card)] space-y-6 sm:space-y-8"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-[#0ea5e9]/10 flex items-center justify-center text-[#0ea5e9] border border-[#0ea5e9]/20">
                  <Percent size={20} className="sm:hidden" />
                  <Percent size={24} className="hidden sm:block" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-black italic text-[var(--foreground)] uppercase">Profit Markup</h3>
                  <p className="text-[9px] sm:text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider">Set percentage profit based on price ranges</p>
                </div>
              </div>
              <button
                onClick={addSlab}
                className="w-full sm:w-auto px-6 py-3 rounded-xl border border-[var(--border)] bg-[var(--foreground)]/5 text-[var(--foreground)] text-[10px] font-black uppercase tracking-widest hover:bg-[var(--foreground)]/10 transition-all active:scale-95"
              >
                + Add Range
              </button>
            </div>

            <div className="space-y-4">
              <div className="hidden md:grid grid-cols-12 gap-6 px-4 text-[9px] font-black text-[var(--muted)] uppercase tracking-[0.2em]">
                <div className="col-span-4">Minimum Price (₹)</div>
                <div className="col-span-4">Maximum Price (₹)</div>
                <div className="col-span-3">Add Profit (%)</div>
                <div className="col-span-1"></div>
              </div>

              {slabs.map((s, i) => (
                <div key={i} className="grid grid-cols-2 md:grid-cols-12 gap-4 md:gap-6 items-center p-4 md:p-6 rounded-[1.5rem] md:rounded-[2rem] border border-[var(--border)] bg-[var(--foreground)]/[0.02] group hover:border-[var(--foreground)]/10 transition-all">
                  <div className="col-span-1 md:col-span-4 space-y-1.5">
                    <label className="md:hidden text-[8px] font-black uppercase tracking-[0.2em] text-[var(--muted)] px-1">Min Price (₹)</label>
                    <input
                      type="number"
                      value={s.min}
                      onChange={(e) => updateSlab(i, "min", e.target.value)}
                      className="w-full h-12 md:h-14 px-4 md:px-6 rounded-xl md:rounded-2xl bg-[var(--background)] border border-[var(--border)] text-lg md:text-xl font-black italic text-[var(--foreground)] focus:border-[#0ea5e9]/50 transition-all outline-none"
                    />
                  </div>
                  <div className="col-span-1 md:col-span-4 space-y-1.5">
                    <label className="md:hidden text-[8px] font-black uppercase tracking-[0.2em] text-[var(--muted)] px-1">Max Price (₹)</label>
                    <input
                      type="number"
                      value={s.max}
                      onChange={(e) => updateSlab(i, "max", e.target.value)}
                      className="w-full h-12 md:h-14 px-4 md:px-6 rounded-xl md:rounded-2xl bg-[var(--background)] border border-[var(--border)] text-lg md:text-xl font-black italic text-[var(--foreground)] focus:border-[#0ea5e9]/50 transition-all outline-none"
                    />
                  </div>
                  <div className="col-span-2 md:col-span-3 space-y-1.5">
                    <label className="md:hidden text-[8px] font-black uppercase tracking-[0.2em] text-[var(--muted)] px-1">Profit Percentage</label>
                    <div className="relative">
                      <input
                        type="number"
                        value={s.percent}
                        onChange={(e) => updateSlab(i, "percent", e.target.value)}
                        className="w-full h-12 md:h-14 px-4 md:px-6 rounded-xl md:rounded-2xl bg-[#0ea5e9]/5 border border-[#0ea5e9]/20 text-lg md:text-xl font-black italic text-[#0ea5e9] focus:border-[#0ea5e9]/50 transition-all outline-none"
                      />
                      <span className="absolute right-4 md:right-6 top-1/2 -translate-y-1/2 text-lg md:text-xl font-black text-[#0ea5e9]/30">%</span>
                    </div>
                  </div>
                  <div className="col-span-2 md:col-span-1 flex justify-center pt-2 md:pt-0">
                    <button
                      onClick={() => deleteSlab(i)}
                      className="w-full md:w-10 h-10 md:h-10 rounded-xl flex items-center justify-center gap-2 text-[var(--muted)] hover:text-red-500 hover:bg-red-500/10 border border-[var(--border)] md:border-none transition-all active:scale-95"
                    >
                      <Trash2 size={18} />
                      <span className="md:hidden text-[10px] font-black uppercase tracking-widest">Remove Range</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* SIDEBAR - GAMES */}
            <div className="lg:col-span-4 p-4 sm:p-6 rounded-[2rem] sm:rounded-[2.5rem] border border-[var(--border)] bg-[var(--card)] space-y-4 sm:space-y-6 h-fit">
              <div className="flex items-center gap-3 px-2">
                <Gamepad2 size={18} className="text-[#0ea5e9]" />
                <h3 className="text-xs font-black uppercase tracking-widest text-[var(--foreground)] italic">Games</h3>
              </div>

              <div className="relative">
                <input
                  type="text"
                  placeholder="Search games..."
                  value={fixedItemFilter}
                  onChange={(e) => setFixedItemFilter(e.target.value)}
                  className="w-full h-12 px-12 rounded-2xl bg-[var(--background)] border border-[var(--border)] text-xs font-bold text-[var(--foreground)] focus:border-[#0ea5e9]/50 transition-all outline-none"
                />
                <RefreshCcw size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
              </div>

              <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                {filteredGames.map((g) => (
                  <button
                    key={g.gameSlug}
                    onClick={() => setFixedGameFilter(g.gameSlug)}
                    className={`w-full group p-4 rounded-2xl border transition-all flex items-center justify-between ${fixedGameFilter === g.gameSlug
                      ? "bg-[#0ea5e9]/10 border-[#0ea5e9]/30 shadow-[0_0_20px_rgba(14,165,233,0.1)]"
                      : "bg-[var(--background)] border-[var(--border)] hover:border-[var(--foreground)]/10"
                      }`}
                  >
                    <div className="text-left min-w-0">
                      <p className={`text-xs font-black uppercase tracking-wider italic truncate ${fixedGameFilter === g.gameSlug ? "text-[#0ea5e9]" : "text-[var(--foreground)]"}`}>
                        {g.gameName}
                      </p>
                      <p className="text-[8px] font-bold text-[var(--muted)] uppercase tracking-widest mt-0.5 truncate">{g.gameSlug}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div
                        onClick={(e) => {
                          e.stopPropagation();
                          updateGameOveride(g.gameSlug, { isOutOfStock: !isGameOutOfStock(g.gameSlug) });
                        }}
                        className={`w-10 h-5 rounded-full p-1 transition-all flex items-center ${!isGameOutOfStock(g.gameSlug) ? 'bg-[#22c55e]' : 'bg-[var(--muted)]/20'}`}
                      >
                        <div className={`w-3 h-3 rounded-full bg-white transition-all transform ${!isGameOutOfStock(g.gameSlug) ? 'translate-x-5' : 'translate-x-0'}`} />
                      </div>
                      <span className="text-[7px] font-black uppercase tracking-tighter text-[var(--muted)]">Stock</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* MAIN AREA - ITEMS */}
            <div className="lg:col-span-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {loadingFixedPrices ? (
                  <div className="col-span-full py-32 flex flex-col items-center justify-center space-y-4">
                    <Loader2 size={32} className="animate-spin text-[#0ea5e9]" />
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--muted)]">Fetching Data...</p>
                  </div>
                ) : !fixedGameFilter ? (
                  <div className="col-span-full py-32 flex flex-col items-center justify-center space-y-4 opacity-20">
                    <Package size={48} className="text-[var(--muted)]" />
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--muted)]">Select a game to configure items</p>
                  </div>
                ) : (
                  visibleOverrides.map((o) => (
                    <div key={o.itemSlug} className="p-4 sm:p-5 rounded-[1.5rem] sm:rounded-[2rem] border border-[var(--border)] bg-[var(--card)] space-y-4 sm:space-y-5">
                      <div className="flex items-center justify-between gap-4">
                        <div className="min-w-0">
                          <h4 className="text-lg sm:text-xl font-black italic text-[var(--foreground)] truncate">{o.itemName || o.itemSlug}</h4>
                          <p className="text-[7px] sm:text-[8px] font-bold text-[var(--muted)] uppercase tracking-wider truncate">{o.itemSlug}</p>
                        </div>
                        <div className="flex flex-col gap-2 shrink-0">
                          {/* IN STOCK TOGGLE */}
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => updateOverride(o.gameSlug, o.itemSlug, { isOutOfStock: !o.isOutOfStock })}
                              className={`w-8 h-4 rounded-full p-0.5 transition-all flex items-center ${!o.isOutOfStock ? 'bg-[#22c55e]' : 'bg-[var(--muted)]/20'}`}
                            >
                              <div className={`w-3 h-3 rounded-full bg-white transition-all transform ${!o.isOutOfStock ? 'translate-x-4' : 'translate-x-0'}`} />
                            </button>
                            <span className="text-[7px] font-black uppercase text-[var(--muted)]">In Stock</span>
                          </div>
                          {/* OVERRIDE TOGGLE */}
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => updateOverride(o.gameSlug, o.itemSlug, { isOverride: !o.isOverride })}
                              className={`w-8 h-4 rounded-full p-0.5 transition-all flex items-center ${o.isOverride ? 'bg-[#0ea5e9]' : 'bg-[var(--muted)]/20'}`}
                            >
                              <div className={`w-3 h-3 rounded-full bg-white transition-all transform ${o.isOverride ? 'translate-x-4' : 'translate-x-0'}`} />
                            </button>
                            <span className="text-[7px] font-black uppercase text-[var(--muted)]">Override</span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <p className="text-[8px] font-black text-[var(--muted)] uppercase tracking-widest px-1">Selling Price (INR)</p>
                        <div className="relative group">
                          {o.isOverride ? (
                            <input
                              type="number"
                              value={o.fixedPrice}
                              onChange={(e) => updateOverride(o.gameSlug, o.itemSlug, { fixedPrice: Number(e.target.value) })}
                              className="w-full h-12 sm:h-14 px-4 sm:px-6 rounded-xl sm:rounded-2xl bg-[var(--background)] border border-[var(--border)] text-[var(--foreground)] font-black italic focus:border-[#0ea5e9]/50 transition-all outline-none"
                            />
                          ) : (
                            <div className="w-full h-12 sm:h-14 flex items-center justify-center rounded-xl sm:rounded-2xl bg-[var(--foreground)]/[0.02] border border-dashed border-[var(--border)] text-[8px] sm:text-[9px] font-black uppercase tracking-[0.2em] text-[var(--muted)]">
                              % Markup Active
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
