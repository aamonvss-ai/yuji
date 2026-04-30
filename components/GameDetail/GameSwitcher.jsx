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
        <div className="w-full overflow-hidden mb-1">
            <div className="max-w-6xl mx-auto px-0">
                <div className="flex items-center gap-1 overflow-x-auto pb-2 pt-0.5 no-scrollbar mask-fade">
                    {games.map((game) => {
                        const isActive = game.gameSlug === slug;
                        return (
                            <Link
                                key={game.gameSlug}
                                href={`/games/${game.gameSlug}`}
                                className="shrink-0"
                            >
                                <motion.div
                                    whileHover={{ y: -2 }}
                                    whileTap={{ scale: 0.95 }}
                                    className={`
                    relative flex flex-col items-center gap-1.5 p-1.5 rounded-xl transition-all duration-300
                    ${isActive
                                            ? "bg-[var(--foreground)]/[0.05] text-[var(--foreground)] pb-2"
                                            : "bg-transparent text-[var(--muted)] hover:text-[var(--foreground)]"
                                        }
                  `}
                                >
                                    <div className={`
                    w-10 h-10 relative rounded-lg overflow-hidden transition-all duration-300
                    ${isActive ? "shadow-md scale-105" : "grayscale-[0.5] hover:grayscale-0 opacity-70 hover:opacity-100"}
                  `}>
                                        <Image
                                            src={game?.gameImageId?.image || "/logo.png"}
                                            alt={game.gameName}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                    <span className={`text-[10px] font-black uppercase tracking-tight max-w-[70px] leading-[1.1] text-center line-clamp-2 h-[22px] flex items-center justify-center transition-colors ${isActive ? 'text-[var(--foreground)]' : 'text-[var(--muted)]'}`}>
                                        {game.gameName}
                                    </span>

                                    {/* Active Indicator Bar */}
                                    {isActive && (
                                        <motion.div
                                            layoutId="active-nav-line"
                                            className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-8 h-[2px] bg-[var(--foreground)] rounded-full"
                                        />
                                    )}
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
        .mask-fade {
          mask-image: linear-gradient(to right, transparent, black 5%, black 95%, transparent);
        }
      `}</style>
        </div>
    );
}
