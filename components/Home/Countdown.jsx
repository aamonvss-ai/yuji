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
        <div className="flex items-center gap-1.5 bg-black/40 dark:bg-black/60 backdrop-blur-md border border-white/10 px-2 sm:px-2.5 py-1 rounded-xl">
            <FiClock className="text-white/60 shrink-0" size={12} />
            
            <div className="flex items-center gap-1 font-mono font-bold text-[11px] sm:text-[12px] tabular-nums">
                <span className="bg-white/10 text-white border border-white/10 px-1.5 py-0.5 rounded-md min-w-[21px] sm:min-w-[24px] text-center leading-tight">
                    {String(timeLeft.hours).padStart(2, '0')}
                </span>
                <span className="text-white/40 font-bold">:</span>
                <span className="bg-white/10 text-white border border-white/10 px-1.5 py-0.5 rounded-md min-w-[21px] sm:min-w-[24px] text-center leading-tight">
                    {String(timeLeft.minutes).padStart(2, '0')}
                </span>
                <span className="text-white/40 font-bold">:</span>
                <span className="bg-[var(--accent)] text-white font-bold px-1.5 py-0.5 rounded-md min-w-[21px] sm:min-w-[24px] text-center leading-tight">
                    {String(timeLeft.seconds).padStart(2, '0')}
                </span>
            </div>
        </div>
    );
});

export default Countdown;
