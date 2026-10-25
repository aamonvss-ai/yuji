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

  const [fixedPriceFilter, setFixedPriceFilter] = useState("all"); // "all" | "overrides_only"
  const [itemSearchQuery, setItemSearchQuery] = useState("");

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
      if (fixedPriceFilter === "overrides_only" && !o.isOverride) return false;
      if (itemSearchQuery) {
        const q = itemSearchQuery.toLowerCase();
        const matchName = o.itemName?.toLowerCase().includes(q);
        const matchSlug = o.itemSlug?.toLowerCase().includes(q);
        const matchGame = o.gameSlug?.toLowerCase().includes(q);
        if (!matchName && !matchSlug && !matchGame) return false;
      }
      return true;
    });
  }, [overrides, fixedGameFilter, fixedPriceFilter, itemSearchQuery]);

  const totalFixedOverridesAcrossAllGames = useMemo(() => {
    return overrides.filter((o) => o.isOverride).length;
  }, [overrides]);

  const updateOverride = (gameSlug, itemSlug, fields) => {
    setOverrides((prev) =>
      prev.map((o) =>
        o.gameSlug === gameSlug && o.itemSlug === itemSlug
          ? { ...o, ...fields }
          : o
      )
    );
  };

  const updateGameOveride = async (gameSlug, fields) => {
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

    if (fields.isOutOfStock !== undefined) {
      try {
        const token = localStorage.getItem("token");
        await fetch("/api/admin/pricing", {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            action: "toggle-game-stock",
            gameSlug,
            isOutOfStock: fields.isOutOfStock,
          }),
        });
      } catch (err) {
        console.error("Failed to auto-sync stock toggle", err);
      }
    }
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
    <div className="space-y-6 pb-12 max-w-full overflow-x-hidden text-[var(--foreground)]/80">
      {/* ================= HEADER ================= */}
      <div className="flex flex-col gap-4 pb-3 border-b border-[var(--border)]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-lg sm:text-xl font-bold tracking-tight text-[var(--foreground)]">
              Pricing Configuration
            </h1>
            <p className="text-[10px] text-[var(--muted)] font-medium mt-0.5">
              Manage profit margins and item pricing overrides
            </p>
          </div>
          <button
            onClick={onSave}
            disabled={!canSave}
            className="px-4 py-2 rounded-xl bg-[var(--accent)] text-white font-bold text-xs hover:brightness-110 active:scale-95 transition-all disabled:opacity-50 shadow-md shadow-[var(--accent)]/20 shrink-0 flex items-center gap-2"
          >
            {savingPricing ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            <span>Save Settings</span>
          </button>
        </div>

        {/* CONTROLS ROW */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          {/* MODE SELECTOR */}
          <div className="flex bg-[var(--foreground)]/[0.03] p-1 rounded-xl border border-[var(--border)]">
            {[
              { id: "percent", label: "Markup", icon: <Percent size={13} /> },
              { id: "fixed", label: "Fixed", icon: <Coins size={13} /> }
            ].map((m) => (
              <button
                key={m.id}
                onClick={() => setPricingMode(m.id)}
                className={`flex-1 flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  pricingMode === m.id
                    ? "bg-[var(--accent)] text-white shadow-xs"
                    : "text-[var(--muted)] hover:text-[var(--foreground)]"
                }`}
              >
                {m.icon}
                <span>{m.label}</span>
              </button>
            ))}
          </div>

          {/* ROLE SELECTOR */}
          <div className="flex bg-[var(--foreground)]/[0.03] p-1 rounded-xl border border-[var(--border)]">
            {["user", "member", "admin"].map((type) => (
              <button
                key={type}
                onClick={() => setPricingType(type)}
                className={`flex-1 px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                  pricingType === type
                    ? "bg-[var(--accent)] text-white shadow-xs"
                    : "text-[var(--muted)] hover:text-[var(--foreground)]"
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {pricingMode === "percent" ? (
          <motion.div
            key="markup"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[var(--accent)]/10 flex items-center justify-center text-[var(--accent)] border border-[var(--accent)]/20 shrink-0">
                  <Percent size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[var(--foreground)]">Profit Markup Ranges</h3>
                  <p className="text-[10px] text-[var(--muted)]">Set profit percentage per price range</p>
                </div>
              </div>
              <button
                onClick={addSlab}
                className="px-3.5 py-1.5 rounded-xl border border-[var(--border)] bg-[var(--foreground)]/[0.03] text-[var(--foreground)] text-xs font-semibold hover:bg-[var(--foreground)]/[0.07] transition-all active:scale-95 shrink-0"
              >
                + Add Range
              </button>
            </div>

            <div className="divide-y divide-[var(--border)]">
              {slabs.map((s, i) => (
                <div key={i} className="py-3 flex flex-wrap sm:flex-nowrap items-center gap-2.5 group">
                  <div className="flex-1 min-w-[100px] space-y-1">
                    <label className="text-[10px] font-medium text-[var(--muted)]">Min (₹)</label>
                    <input
                      type="number"
                      value={s.min}
                      onChange={(e) => updateSlab(i, "min", e.target.value)}
                      className="w-full h-9 px-3 rounded-xl bg-[var(--foreground)]/[0.02] border border-[var(--border)] text-xs font-semibold text-[var(--foreground)] focus:border-[var(--accent)]/50 transition-all outline-none"
                    />
                  </div>
                  <div className="flex-1 min-w-[100px] space-y-1">
                    <label className="text-[10px] font-medium text-[var(--muted)]">Max (₹)</label>
                    <input
                      type="number"
                      value={s.max}
                      onChange={(e) => updateSlab(i, "max", e.target.value)}
                      className="w-full h-9 px-3 rounded-xl bg-[var(--foreground)]/[0.02] border border-[var(--border)] text-xs font-semibold text-[var(--foreground)] focus:border-[var(--accent)]/50 transition-all outline-none"
                    />
                  </div>
                  <div className="flex-1 min-w-[100px] space-y-1">
                    <label className="text-[10px] font-medium text-[var(--muted)]">Profit (%)</label>
                    <div className="relative">
                      <input
                        type="number"
                        value={s.percent}
                        onChange={(e) => updateSlab(i, "percent", e.target.value)}
                        className="w-full h-9 px-3 rounded-xl bg-[var(--accent)]/5 border border-[var(--accent)]/20 text-xs font-bold text-[var(--accent)] focus:border-[var(--accent)]/50 transition-all outline-none pr-6"
                      />
                      <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-[var(--accent)]/60">%</span>
                    </div>
                  </div>
                  <button
                    onClick={() => deleteSlab(i)}
                    aria-label="Delete slab"
                    className="self-end mb-0.5 h-9 w-9 shrink-0 rounded-xl flex items-center justify-center text-[var(--muted)] hover:text-red-500 hover:bg-red-500/10 transition-all active:scale-95"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            {/* SIDEBAR - GAMES */}
            <div className="lg:col-span-4 xl:col-span-3 space-y-3">
              <div className="flex items-center justify-between gap-2 px-1">
                <div className="flex items-center gap-2">
                  <Gamepad2 size={16} className="text-[var(--accent)]" />
                  <h3 className="text-xs font-bold text-[var(--foreground)] uppercase tracking-wider">Games</h3>
                </div>
                {totalFixedOverridesAcrossAllGames > 0 && (
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent)]/20">
                    {totalFixedOverridesAcrossAllGames} Fixed
                  </span>
                )}
              </div>

              {/* ALL GAMES OVERRIDE QUICK FILTER */}
              <button
                type="button"
                onClick={() => {
                  setFixedGameFilter("");
                  setFixedPriceFilter("overrides_only");
                }}
                className={`w-full p-2.5 rounded-xl border transition-all flex items-center justify-between gap-2 text-left ${
                  !fixedGameFilter && fixedPriceFilter === "overrides_only"
                    ? "bg-[var(--accent)]/15 border-[var(--accent)] text-[var(--accent)] shadow-xs"
                    : "bg-[var(--card)] border-[var(--border)] text-[var(--foreground)] hover:bg-[var(--foreground)]/[0.02]"
                }`}
              >
                <div className="min-w-0">
                  <p className="text-xs font-bold truncate">All Fixed Items (All Games)</p>
                  <p className="text-[9px] text-[var(--muted)]">View overrides across entire catalog</p>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-[var(--foreground)]/[0.05] shrink-0">
                  {totalFixedOverridesAcrossAllGames}
                </span>
              </button>

              <div className="relative">
                <input
                  type="text"
                  placeholder="Search games..."
                  value={fixedItemFilter}
                  onChange={(e) => setFixedItemFilter(e.target.value)}
                  className="w-full h-9 pl-9 pr-3 rounded-xl bg-[var(--foreground)]/[0.02] border border-[var(--border)] text-xs font-medium text-[var(--foreground)] focus:border-[var(--accent)]/50 transition-all outline-none placeholder:text-[var(--muted)]"
                />
                <RefreshCcw size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
              </div>

              <div className="space-y-1.5 max-h-[460px] overflow-y-auto pr-1">
                {filteredGames.map((g) => {
                  const isSelected = fixedGameFilter === g.gameSlug;
                  const isOutOfStock = isGameOutOfStock(g.gameSlug);
                  const gameOverridesCount = overrides.filter(o => o.gameSlug === g.gameSlug && o.isOverride).length;

                  return (
                    <div
                      key={g.gameSlug}
                      onClick={() => setFixedGameFilter(g.gameSlug)}
                      className={`w-full cursor-pointer p-2.5 rounded-xl border transition-all flex items-center justify-between gap-2.5 ${
                        isSelected
                          ? "bg-[var(--accent)]/10 border-[var(--accent)]/40 text-[var(--foreground)]"
                          : "bg-[var(--card)] border-[var(--border)] hover:bg-[var(--foreground)]/[0.02]"
                      }`}
                    >
                      <div className="text-left min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <p className={`text-xs font-semibold truncate ${isSelected ? "text-[var(--accent)]" : "text-[var(--foreground)]"}`}>
                            {g.gameName}
                          </p>
                          {gameOverridesCount > 0 && (
                            <span className="text-[8px] font-bold px-1.5 py-0.2 rounded bg-[var(--accent)]/15 text-[var(--accent)] shrink-0">
                              {gameOverridesCount}
                            </span>
                          )}
                        </div>
                        <p className="text-[9px] text-[var(--muted)] truncate">{g.gameSlug}</p>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            updateGameOveride(g.gameSlug, { isOutOfStock: !isOutOfStock });
                          }}
                          className={`w-8 h-4.5 rounded-full p-0.5 transition-colors flex items-center ${
                            !isOutOfStock ? "bg-green-500" : "bg-[var(--foreground)]/15"
                          }`}
                        >
                          <div
                            className={`w-3.5 h-3.5 rounded-full bg-white shadow-xs transition-transform transform ${
                              !isOutOfStock ? "translate-x-3.5" : "translate-x-0"
                            }`}
                          />
                        </button>
                        <span className="text-[8px] font-semibold text-[var(--muted)] uppercase">Stock</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* MAIN AREA - ITEMS */}
            <div className="lg:col-span-8 xl:col-span-9 space-y-3">
              {/* ITEM FILTER TOOLBAR */}
              <div className="flex flex-wrap items-center justify-between gap-2.5 pb-2">
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setFixedPriceFilter("all")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      fixedPriceFilter === "all"
                        ? "bg-[var(--foreground)]/10 text-[var(--foreground)]"
                        : "text-[var(--muted)] hover:text-[var(--foreground)]"
                    }`}
                  >
                    All Items
                  </button>
                  <button
                    type="button"
                    onClick={() => setFixedPriceFilter("overrides_only")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                      fixedPriceFilter === "overrides_only"
                        ? "bg-[var(--accent)] text-white shadow-xs"
                        : "text-[var(--muted)] hover:text-[var(--foreground)]"
                    }`}
                  >
                    <span>Fixed Price Only</span>
                    <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold ${
                      fixedPriceFilter === "overrides_only" ? "bg-white/20 text-white" : "bg-[var(--foreground)]/10 text-[var(--muted)]"
                    }`}>
                      {fixedGameFilter 
                        ? overrides.filter(o => o.gameSlug === fixedGameFilter && o.isOverride).length 
                        : totalFixedOverridesAcrossAllGames}
                    </span>
                  </button>
                </div>

                <div className="flex-1 max-w-xs min-w-[160px]">
                  <input
                    type="text"
                    placeholder="Search items..."
                    value={itemSearchQuery}
                    onChange={(e) => setItemSearchQuery(e.target.value)}
                    className="w-full h-8 px-3 rounded-xl bg-[var(--foreground)]/[0.02] border border-[var(--border)] text-xs text-[var(--foreground)] focus:border-[var(--accent)]/50 transition-all outline-none placeholder:text-[var(--muted)]"
                  />
                </div>
              </div>

              {loadingFixedPrices ? (
                <div className="py-24 flex flex-col items-center justify-center space-y-3">
                  <Loader2 size={24} className="animate-spin text-[var(--accent)]" />
                  <p className="text-xs text-[var(--muted)] font-medium">Loading items...</p>
                </div>
              ) : !fixedGameFilter && fixedPriceFilter !== "overrides_only" ? (
                <div className="py-24 flex flex-col items-center justify-center space-y-2 border border-dashed border-[var(--border)] rounded-2xl">
                  <Package size={32} className="text-[var(--muted)]/40" />
                  <p className="text-xs font-medium text-[var(--muted)]">Select a game from the list or click &quot;All Fixed Items (All Games)&quot;</p>
                </div>
              ) : visibleOverrides.length === 0 ? (
                <div className="py-20 flex flex-col items-center justify-center space-y-2 border border-dashed border-[var(--border)] rounded-2xl">
                  <Package size={28} className="text-[var(--muted)]/40" />
                  <p className="text-xs font-medium text-[var(--muted)]">No items match the current filter</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                  {visibleOverrides.map((o) => (
                    <div
                      key={o.itemSlug}
                      className="p-3.5 rounded-xl border border-[var(--border)] bg-[var(--card)] space-y-3"
                    >
                      <div className="flex items-start justify-between gap-2.5">
                        <div className="min-w-0 flex-1">
                          <h4 className="text-xs sm:text-sm font-bold text-[var(--foreground)] truncate">
                            {o.itemName || o.itemSlug}
                          </h4>
                          <p className="text-[9px] text-[var(--muted)] truncate">{o.itemSlug}</p>
                        </div>

                        <div className="flex flex-col gap-1.5 shrink-0 items-end">
                          {/* IN STOCK */}
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => updateOverride(o.gameSlug, o.itemSlug, { isOutOfStock: !o.isOutOfStock })}
                              className={`w-7 h-4 rounded-full p-0.5 transition-colors flex items-center ${
                                !o.isOutOfStock ? "bg-green-500" : "bg-[var(--foreground)]/15"
                              }`}
                            >
                              <div
                                className={`w-3 h-3 rounded-full bg-white shadow-xs transition-transform transform ${
                                  !o.isOutOfStock ? "translate-x-3" : "translate-x-0"
                                }`}
                              />
                            </button>
                            <span className="text-[8px] font-semibold text-[var(--muted)] uppercase">Stock</span>
                          </div>

                          {/* OVERRIDE */}
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => updateOverride(o.gameSlug, o.itemSlug, { isOverride: !o.isOverride })}
                              className={`w-7 h-4 rounded-full p-0.5 transition-colors flex items-center ${
                                o.isOverride ? "bg-[var(--accent)]" : "bg-[var(--foreground)]/15"
                              }`}
                            >
                              <div
                                className={`w-3 h-3 rounded-full bg-white shadow-xs transition-transform transform ${
                                  o.isOverride ? "translate-x-3" : "translate-x-0"
                                }`}
                              />
                            </button>
                            <span className="text-[8px] font-semibold text-[var(--muted)] uppercase">Fixed</span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <span className="text-[9px] font-medium text-[var(--muted)]">Selling Price (INR)</span>
                        {o.isOverride ? (
                          <input
                            type="number"
                            value={o.fixedPrice}
                            onChange={(e) => updateOverride(o.gameSlug, o.itemSlug, { fixedPrice: Number(e.target.value) })}
                            className="w-full h-8 px-2.5 rounded-lg bg-[var(--foreground)]/[0.02] border border-[var(--border)] text-xs font-bold text-[var(--foreground)] focus:border-[var(--accent)]/50 transition-all outline-none"
                          />
                        ) : (
                          <div className="w-full h-8 flex items-center justify-center rounded-lg bg-[var(--foreground)]/[0.02] border border-dashed border-[var(--border)] text-[9px] font-semibold uppercase tracking-wider text-[var(--muted)]">
                            % Markup Active
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
