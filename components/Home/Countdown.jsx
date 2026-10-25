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
        <div className="flex items-center gap-1 bg-black/40 dark:bg-black/60 backdrop-blur-md border border-white/10 px-1.5 py-0.5 rounded-lg">
            <FiClock className="text-white/60 shrink-0" size={10} />
            
            <div className="flex items-center gap-0.5 font-mono font-bold text-[10px] sm:text-[11px] tabular-nums">
                <span className="bg-white/10 text-white px-1 py-0.5 rounded min-w-[17px] sm:min-w-[19px] text-center leading-none">
                    {String(timeLeft.hours).padStart(2, '0')}
                </span>
                <span className="text-white/40 font-bold text-[8px] sm:text-[9px]">:</span>
                <span className="bg-white/10 text-white px-1 py-0.5 rounded min-w-[17px] sm:min-w-[19px] text-center leading-none">
                    {String(timeLeft.minutes).padStart(2, '0')}
                </span>
                <span className="text-white/40 font-bold text-[8px] sm:text-[9px]">:</span>
                <span className="bg-[var(--accent)] text-white px-1 py-0.5 rounded min-w-[17px] sm:min-w-[19px] text-center leading-none">
                    {String(timeLeft.seconds).padStart(2, '0')}
                </span>
            </div>
        </div>
    );
});

export default Countdown;
