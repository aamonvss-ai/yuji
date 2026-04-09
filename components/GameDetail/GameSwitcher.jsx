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
        <div className="w-full overflow-hidden mb-3">
            <div className="max-w-6xl mx-auto px-1">
                <div className="flex items-center gap-2 overflow-x-auto pb-2 pt-0.5 no-scrollbar mask-fade">
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
                    flex flex-col items-center gap-1.5 p-1.5 rounded-xl transition-all duration-300
                    ${isActive
                                            ? "bg-[var(--accent)] text-black shadow-[0_0_20px_rgba(var(--accent-rgb),0.3)]"
                                            : "bg-[var(--foreground)]/[0.03] hover:bg-[var(--accent)]/10 text-[var(--muted)] hover:text-[var(--foreground)] border border-[var(--border)] uppercase"
                                        }
                  `}
                                >
                                    <div className={`
                    w-10 h-10 relative rounded-lg overflow-hidden shadow-lg
                    ${isActive ? "ring-2 ring-black/20" : "grayscale-[0.5] hover:grayscale-0"}
                  `}>
                                        <Image
                                            src={game?.gameImageId?.image || "/logo.png"}
                                            alt={game.gameName}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                    <span className="text-[10px] font-bold uppercase tracking-wider max-w-[64px] truncate text-center">
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
        .mask-fade {
          mask-image: linear-gradient(to right, transparent, black 5%, black 95%, transparent);
        }
      `}</style>
        </div>
    );
}
