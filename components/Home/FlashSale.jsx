"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { FiZap, FiClock, FiChevronRight } from "react-icons/fi";
import { useEffect, useState } from "react";

const flashSaleData = [
    {
        id: 1,
        name: "Weekly Pass",
        game: "MLBB",
        image: "/game-assets/weeklypass-new.jpeg",
        price: "₹148",
        originalPrice: "₹175",
        slug: "mobile-legends988?type=weekly-pass",
        badge: "Hot"
    },

    {
        id: 5,
        name: "Weekly Bundle",
        game: "MLBB",
        image: "/game-assets/elite-bundle.jpeg",
        price: "₹81",
        originalPrice: "₹100",
        slug: "weeklymonthly-bundle931",
        badge: "Value"
    },

];

export default function FlashSale() {
    const [timeLeft, setTimeLeft] = useState({ hours: 12, minutes: 45, seconds: 30 });

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
                if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
                if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
                return { hours: 23, minutes: 59, seconds: 59 };
            });
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    return (
        <section className="relative py-2 px-4 overflow-hidden border-b border-[var(--border)] bg-gray-50/50 dark:bg-white/[0.02]">
            {/* Background Decorative */}
            <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-amber-500/5 blur-[80px] pointer-events-none" />

            <div className="max-w-7xl mx-auto">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                        <div className="p-1 rounded-md bg-amber-500 text-black shadow-[0_0_15px_rgba(245,158,11,0.5)] shrink-0 animate-pulse">
                            <FiZap size={10} fill="currentColor" />
                        </div>
                        <h2 className="text-sm sm:text-base font-black uppercase tracking-tight italic bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 bg-clip-text text-transparent">
                            Flash Sale
                        </h2>
                    </div>

                    <div className="flex items-center gap-1.5 bg-black/5 dark:bg-white/5 backdrop-blur-md border border-[var(--border)] px-2.5 py-1 rounded-xl shadow-sm">
                        <FiClock className="text-amber-500 hidden sm:block" size={10} />
                        <div className="flex items-center gap-1.5 font-black text-[10px] tabular-nums text-amber-500 uppercase tracking-tighter">
                            <span className="opacity-40 text-[8px] font-bold text-[var(--foreground)] mr-0.5 hidden md:block">Time left</span>
                            <div className="bg-amber-500/20 px-1 py-0.5 rounded-md">{String(timeLeft.hours).padStart(2, '0')}</div>
                            <span className="opacity-30 text-[var(--foreground)]">:</span>
                            <div className="bg-amber-500/20 px-1 py-0.5 rounded-md">{String(timeLeft.minutes).padStart(2, '0')}</div>
                            <span className="opacity-30 text-[var(--foreground)]">:</span>
                            <div className="bg-rose-500/20 text-rose-500 px-1 py-0.5 rounded-md">{String(timeLeft.seconds).padStart(2, '0')}</div>
                        </div>
                    </div>
                </div>

                {/* Compact Horizontal Slider */}
                <div className="overflow-x-auto pb-4 custom-scrollbar-premium snap-x snap-mandatory">
                    <div className="flex gap-3 md:gap-4 px-1 md:justify-center min-w-max md:min-w-0">
                        {flashSaleData.map((item, index) => (
                            <div
                                key={item.id}
                                className="snap-start"
                            >
                                <Link
                                    href={`/games/${item.slug}`}
                                    className="group relative block w-[105px] sm:w-[125px] md:w-[155px] aspect-[4/5] bg-white dark:bg-black border border-[var(--border)] rounded-[1rem] overflow-hidden transition-all duration-500 hover:border-[var(--accent)] shadow-lg hover:shadow-[var(--accent)]/20"
                                >
                                    {/* Badge */}
                                    <div className="absolute top-2 left-2 z-20">
                                        <span className="text-[6px] md:text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-full bg-amber-500 text-black shadow-lg">
                                            {item.badge}
                                        </span>
                                    </div>

                                    {/* Image Container (Whole Card) */}
                                    <div className="absolute inset-0">
                                        <Image
                                            src={item.image}
                                            alt={item.name}
                                            fill
                                            className="object-cover transition-transform duration-1000 group-hover:scale-110"
                                        />
                                        
                                        {/* Bottom Gradient Overlay */}
                                        <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black via-black/40 to-transparent" />
                                        
                                        {/* Info Overlap */}
                                        <div className="absolute inset-x-0 bottom-0 p-2 md:p-3 space-y-0">
                                            <p className="text-[6px] md:text-[8px] font-bold text-amber-500 uppercase tracking-widest mb-0.5">{item.game}</p>
                                            <h3 className="text-[10px] md:text-[13px] font-black uppercase tracking-tight text-white group-hover:text-amber-500 transition-colors leading-tight line-clamp-1">
                                                {item.name}
                                            </h3>

                                            <div className="flex items-center justify-between pt-1">
                                                <span className="text-[11px] md:text-[15px] font-black italic text-white">
                                                    {item.price}
                                                </span>
                                                <span className="text-[8px] md:text-[10px] font-bold text-white/40 line-through decoration-red-500/50">
                                                    {item.originalPrice}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            </div>
                        ))}
                    </div>
                </div>

                <style jsx global>{`
                    .custom-scrollbar-premium::-webkit-scrollbar {
                        height: 3px;
                    }
                    .custom-scrollbar-premium::-webkit-scrollbar-track {
                        background: rgba(255, 255, 255, 0.02);
                        border-radius: 10px;
                    }
                    .custom-scrollbar-premium::-webkit-scrollbar-thumb {
                        background: rgba(245, 158, 11, 0.2);
                        border-radius: 10px;
                    }
                    .custom-scrollbar-premium::-webkit-scrollbar-thumb:hover {
                        background: rgba(245, 158, 11, 0.4);
                    }
                    @keyframes shimmer {
                        100% {
                            transform: translateX(100%);
                        }
                    }
                `}</style>
            </div>
        </section>
    );
}
