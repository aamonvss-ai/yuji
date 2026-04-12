"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";
import logo from "@/public/logo.png";


export default function GameBannerCarousel() {
  const [banners, setBanners] = useState([]);
  const [current, setCurrent] = useState(0);

  const [direction, setDirection] = useState(0); // -1 for left, 1 for right
  const timerRef = useRef(null);

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (banners.length > 1) {
      timerRef.current = setInterval(() => {
        setDirection(1);
        setCurrent((prev) => (prev + 1) % banners.length);
      }, 6000);
    }
  }, [banners.length]);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await fetch("/api/game-banners");
        const json = await res.json();
        if (!active) return;
        setBanners(json?.data || []);
      } catch {
        if (active) setBanners([]);

      }
    })();
    return () => { active = false; if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  useEffect(() => {
    resetTimer();
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [resetTimer]);

  const paginate = (newDirection) => {
    setDirection(newDirection);
    setCurrent((prev) => (prev + newDirection + banners.length) % banners.length);
    resetTimer();
  };


  if (!banners.length) return null;

  const currentBanner = banners[current];

  const slideVariants = {
    enter: (direction) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
      scale: 1.1,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
      scale: 1,
      transition: {
        x: { duration: 0.5, ease: "easeOut" },
        opacity: { duration: 0.4 },
        scale: { duration: 0.5 }
      }
    },
    exit: (direction) => ({
      zIndex: 0,
      x: direction < 0 ? 800 : -800,
      opacity: 0,
      scale: 0.95,
      transition: {
        x: { duration: 0.5, ease: "easeIn" },
        opacity: { duration: 0.3 }
      }
    })
  };

  return (
    <div className="relative w-full max-w-6xl mx-auto mt-4 md:mt-6 px-4 sm:px-0 select-none overflow-hidden group">
      <div className="relative h-[195px] sm:h-[260px] md:h-[340px] rounded-[2rem] overflow-hidden shadow-2xl bg-black">
        <AnimatePresence initial={false} custom={direction} mode="popLayout">
          <motion.div
            key={current}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={1}
            onDragEnd={(e, { offset, velocity }) => {
              const swipe = Math.abs(offset.x) * velocity.x;
              if (swipe < -10000) paginate(1);
              else if (swipe > 10000) paginate(-1);
            }}
            className="absolute inset-0"
          >
            <Image
              src={currentBanner.bannerImage || logo}
              alt={currentBanner.bannerTitle || "Banner"}
              fill
              priority
              className="object-cover"
            />

            {/* Dynamic Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent md:bg-gradient-to-r md:from-black/80 md:via-black/20" />

            {/* Content Entrance */}
            <div className="absolute inset-0 z-10 p-8 md:p-12 flex flex-col justify-end">
              <div className="max-w-2xl">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                >
                  <h2 className="text-3xl md:text-5xl font-black text-white leading-tight tracking-tighter drop-shadow-2xl">
                    {currentBanner.bannerTitle}
                  </h2>
                </motion.div>


              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Floating Controls */}
        {banners.length > 1 && (
          <>
            <button
              onClick={() => paginate(-1)}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-2xl bg-black/20 hover:bg-black/40 border border-white/10 backdrop-blur-xl text-white flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 hover:scale-110 active:scale-90"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={() => paginate(1)}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-2xl bg-black/20 hover:bg-black/40 border border-white/10 backdrop-blur-xl text-white flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 hover:scale-110 active:scale-90"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </>
        )}

      </div>
    </div>
  );
}

