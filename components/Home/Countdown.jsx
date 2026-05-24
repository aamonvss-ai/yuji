"use client";

import { useState, useEffect, memo } from "react";
import { FiClock } from "react-icons/fi";

const Countdown = memo(function Countdown({ endTime }) {
    const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

    useEffect(() => {
        if (!endTime) return;

        const targetDate = new Date(endTime).getTime();

        const timer = setInterval(() => {
            const now = new Date().getTime();
            const distance = targetDate - now;

            if (distance < 0) {
                clearInterval(timer);
                setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
                return;
            }

            const days = Math.floor(distance / (1000 * 60 * 60 * 24));
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);

            // Cap at 24 hours if we don't want to show days, but here we can just show total hours
            const totalHours = (days * 24) + hours;

            setTimeLeft({ hours: totalHours, minutes, seconds });
        }, 1000);

        return () => clearInterval(timer);
    }, [endTime]);

    if (!endTime) return null;

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
