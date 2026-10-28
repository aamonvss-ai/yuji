"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";

const OUT_OF_STOCK_GAMES = ["Genshin Impact", "TEST 1", "Wuthering of Waves", "Mobile Legends Backup"];

const isOutOfStock = (game) => {
    if (!game) return false;
    if (typeof game === "object") {
        if (game.gameAvailablity === false || game.isOutOfStock === true) return true;
        if (OUT_OF_STOCK_GAMES.includes(game.gameName) || OUT_OF_STOCK_GAMES.includes(game.gameSlug)) return true;
        return false;
    }
    return OUT_OF_STOCK_GAMES.includes(game);
};

export default function GameSwitcher() {
    const { slug } = useParams();
    const [games, setGames] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let hasCache = false;
        const cached = typeof window !== "undefined" ? localStorage.getItem("yuji_games_cache") : null;
        if (cached) {
            try {
                const parsed = JSON.parse(cached);
                const list = parsed.games || [];
                const inStock = list.filter((g) => !isOutOfStock(g));
                if (inStock.length > 0) {
                    setGames(inStock);
                    setIsLoading(false);
                    hasCache = true;
                }
            } catch {
                // ignore
            }
        }

        // Only fetch from network if no cache exists
        if (!hasCache) {
            const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
            fetch("/api/games", {
                headers: {
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
            })
                .then((res) => res.json())
                .then((data) => {
                    if (data?.success && data?.data?.games) {
                        const inStock = data.data.games.filter((g) => !isOutOfStock(g));
                        setGames(inStock);
                    }
                })
                .catch((err) => console.error("Failed to load games for switcher:", err))
                .finally(() => setIsLoading(false));
        }
    }, []);

    if (isLoading || games.length === 0) return null;

    return (
        <div className="w-full overflow-hidden mb-2">
            <div className="max-w-6xl mx-auto px-0">
                <div className="flex items-center gap-1.5 mb-1.5 px-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)]">
                        Quick Switch
                    </span>
                </div>

                <div className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto pb-1.5 pt-0.5 no-scrollbar">
                    {games.map((game) => {
                        const isActive = game.gameSlug === slug;
                        return (
                            <Link
                                key={game.gameSlug}
                                href={`/games/${game.gameSlug}`}
                                className="shrink-0 group"
                            >
                                <motion.div
                                    whileTap={{ scale: 0.95 }}
                                    className="relative flex flex-col items-center gap-0.5 p-0.5 sm:p-1 w-[50px] sm:w-[56px] shrink-0 transition-all duration-200"
                                >
                                    <div className={`
                                        w-7 h-7 sm:w-8 sm:h-8 relative rounded-lg overflow-hidden transition-all duration-200 shrink-0
                                        ${isActive 
                                            ? "ring-2 ring-[var(--accent)] ring-offset-1 ring-offset-[var(--background)] shadow-xs scale-105" 
                                            : "border border-[var(--border)]/70 opacity-70 group-hover:opacity-100 group-hover:scale-105"
                                        }
                                    `}>
                                        <Image
                                            src={game?.gameImageId?.image || "/logo.png"}
                                            alt={game.gameName}
                                            fill
                                            className={`object-cover ${!(game?.gameImageId?.image) ? "logo-img" : ""}`}
                                        />
                                    </div>
                                    <span className={`w-full min-h-[18px] sm:min-h-[20px] flex items-center justify-center text-[7.5px] sm:text-[8.5px] font-bold uppercase tracking-tight leading-[1.1] text-center line-clamp-2 break-words transition-colors ${
                                        isActive ? 'text-[var(--foreground)] font-black' : 'text-[var(--muted)] group-hover:text-[var(--foreground)]'
                                    }`}>
                                        {game.gameName}
                                    </span>
                                </motion.div>
                            </Link>
                        );
                    })}
                </div>
            </div>

            <style jsx>{`
                .no-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .no-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>
        </div>
    );
}
