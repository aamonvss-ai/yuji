"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";

export default function GameSwitcher() {
    const { slug } = useParams();
    const [games, setGames] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetch("/api/games")
            .then((res) => res.json())
            .then((data) => {
                if (data?.success && data?.data?.games) {
                    setGames(data.data.games);
                }
            })
            .catch((err) => console.error("Failed to load games for switcher:", err))
            .finally(() => setIsLoading(false));
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
                                    whileTap={{ scale: 0.96 }}
                                    className={`
                                        relative flex flex-col items-center gap-1 p-1.5 rounded-xl transition-all duration-200 min-w-[58px] sm:min-w-[64px]
                                        ${isActive
                                            ? "bg-[var(--foreground)]/[0.04] border border-[var(--border)]"
                                            : "hover:bg-[var(--foreground)]/[0.02] border border-transparent"
                                        }
                                    `}
                                >
                                    <div className={`
                                        w-8 h-8 sm:w-9 sm:h-9 relative rounded-xl overflow-hidden transition-all duration-200
                                        ${isActive 
                                            ? "ring-2 ring-[var(--accent)] ring-offset-1 ring-offset-[var(--card)] shadow-xs scale-102" 
                                            : "border border-[var(--border)]/70 opacity-75 group-hover:opacity-100 group-hover:scale-102"
                                        }
                                    `}>
                                        <Image
                                            src={game?.gameImageId?.image || "/logo.png"}
                                            alt={game.gameName}
                                            fill
                                            className={`object-cover ${!(game?.gameImageId?.image) ? "logo-img" : ""}`}
                                        />
                                    </div>
                                    <span className={`text-[8.5px] sm:text-[9.5px] font-bold uppercase tracking-tight max-w-[58px] sm:max-w-[64px] leading-tight text-center truncate transition-colors ${
                                        isActive ? 'text-[var(--foreground)]' : 'text-[var(--muted)] group-hover:text-[var(--foreground)]'
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
