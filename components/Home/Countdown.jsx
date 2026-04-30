"use client";

import { useState, useEffect, memo } from "react";
import { FiClock } from "react-icons/fi";

const Countdown = memo(function Countdown() {
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
        <div className="flex items-center gap-1.5 bg-black/5 dark:bg-white/5 backdrop-blur-md border border-[var(--border)] px-2.5 py-1 rounded-xl shadow-sm">
            <FiClock className="text-amber-500 hidden sm:block" size={10} />
            <div className="flex items-center gap-1.5 font-black text-[10px] tabular-nums text-amber-500 uppercase tracking-tighter">
                <span className="opacity-40 text-[8px] font-bold text-[var(--foreground)] mr-0.5 hidden md:block">Time left</span>
                <div className="bg-amber-500/20 px-1 py-0.5 rounded-md min-w-[20px] text-center">
                    {String(timeLeft.hours).padStart(2, '0')}
                </div>
                <span className="opacity-30 text-[var(--foreground)]">:</span>
                <div className="bg-amber-500/20 px-1 py-0.5 rounded-md min-w-[20px] text-center">
                    {String(timeLeft.minutes).padStart(2, '0')}
                </div>
                <span className="opacity-30 text-[var(--foreground)]">:</span>
                <div className="bg-rose-500/20 text-rose-500 px-1 py-0.5 rounded-md min-w-[20px] text-center">
                    {String(timeLeft.seconds).padStart(2, '0')}
                </div>
            </div>
        </div>
    );
});

export default Countdown;
