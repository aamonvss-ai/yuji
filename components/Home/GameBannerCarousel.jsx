"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";
import logo from "@/public/logo.png";

export default function GameBannerCarousel() {
  const [banners, setBanners] = useState([]);
  const [current, setCurrent] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const timerRef = useRef(null);

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (banners.length > 1 && !isHovered) {
      timerRef.current = setInterval(() => {
        setCurrent((prev) => (prev + 1) % banners.length);
      }, 4500);
    }
  }, [banners.length, isHovered]);

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
    return () => {
      active = false;
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  useEffect(() => {
    resetTimer();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [resetTimer]);

  const paginate = (newDirection) => {
    setCurrent((prev) => (prev + newDirection + banners.length) % banners.length);
    resetTimer();
  };

  if (!banners.length) return null;

  // Compute card style for offset relative to current active center card
  const getCardProps = (offset) => {
    if (offset === 0) {
      return {
        zIndex: 30,
        scale: 1,
        x: "0%",
        y: "0%",
        opacity: 1,
        pointerEvents: "auto",
      };
    } else if (offset === -1) {
      return {
        zIndex: 10,
        scale: 0.9,
        x: "-46%",
        y: "0%",
        opacity: 0.65,
        pointerEvents: "auto",
      };
    } else if (offset === 1) {
      return {
        zIndex: 10,
        scale: 0.9,
        x: "46%",
        y: "0%",
        opacity: 0.65,
        pointerEvents: "auto",
      };
    }
    return {
      zIndex: 0,
      scale: 0.75,
      x: offset > 0 ? "80%" : "-80%",
      y: "0%",
      opacity: 0,
      pointerEvents: "none",
    };
  };

  const getIndexWithOffset = (offset) => {
    return (current + offset + banners.length) % banners.length;
  };

  // Show previous, center, and next when >=3 banners exist
  const visibleOffsets =
    banners.length === 1 ? [0] : banners.length === 2 ? [-1, 0] : [-1, 0, 1];

  return (
    <div
      className="relative w-full max-w-7xl mx-auto mt-4 md:mt-6 px-1 xs:px-2 sm:px-4 select-none overflow-hidden group py-2"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* 3D Stage / Sliding Stack */}
      <div className="relative h-[200px] xs:h-[235px] sm:h-[300px] md:h-[370px] lg:h-[410px] flex items-center justify-center">
        {visibleOffsets.map((offset) => {
          const index = getIndexWithOffset(offset);
          const banner = banners[index];
          const isCenter = offset === 0;
          const cardStyle = getCardProps(offset);

          const bannerCard = (
            <div className="relative w-full h-full rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl bg-zinc-950 border border-white/10 group/card">
              <Image
                src={banner?.bannerImage || logo}
                alt={banner?.bannerTitle || "Banner"}
                fill
                priority={isCenter}
                sizes="(max-width: 640px) 90vw, (max-width: 1024px) 75vw, 920px"
                className="object-cover transition-transform duration-700 ease-out group-hover/card:scale-105"
              />

              {/* Dynamic Gradient Shading */}
              <div
                className={`absolute inset-0 transition-opacity duration-300 ${
                  isCenter
                    ? "bg-gradient-to-t from-black/85 via-black/25 to-transparent"
                    : "bg-black/45"
                }`}
              />

              {/* Title & Info Overlay on center card */}
              {isCenter && banner?.bannerTitle && (
                <div className="absolute inset-0 z-10 p-5 sm:p-7 md:p-10 flex flex-col justify-end pointer-events-none">
                  <div className="max-w-xl">
                    <h2 className="text-xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-white leading-tight tracking-tight drop-shadow-xl line-clamp-2">
                      {banner.bannerTitle}
                    </h2>
                    {banner.bannerSummary && (
                      <p className="text-xs sm:text-sm text-zinc-300/90 font-medium mt-1 line-clamp-1 drop-shadow">
                        {banner.bannerSummary}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* External Link Indicator */}
              {isCenter && banner?.bannerLink && banner.bannerLink !== "/" && (
                <div className="absolute top-3 right-3 sm:top-5 sm:right-5 z-20 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-black/40 backdrop-blur-md border border-white/15 text-white/80 flex items-center justify-center opacity-0 group-hover/card:opacity-100 transition-opacity duration-300 shadow-lg">
                  <ExternalLink className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
              )}
            </div>
          );

          return (
            <motion.div
              key={`${index}-${offset}`}
              animate={{
                scale: cardStyle.scale,
                x: cardStyle.x,
                y: cardStyle.y,
                opacity: cardStyle.opacity,
                zIndex: cardStyle.zIndex,
              }}
              transition={{
                duration: 0.45,
                ease: [0.25, 1, 0.5, 1],
              }}
              onClick={() => {
                if (offset !== 0) paginate(offset);
              }}
              style={{
                pointerEvents: cardStyle.pointerEvents,
              }}
              className="absolute w-[88%] xs:w-[86%] sm:w-[80%] md:w-[76%] lg:w-[72%] h-full cursor-pointer will-change-transform"
            >
              {banner?.bannerLink && isCenter ? (
                <Link
                  href={banner.bannerLink}
                  className="block w-full h-full"
                >
                  {bannerCard}
                </Link>
              ) : (
                bannerCard
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Floating Controls */}
      {banners.length > 1 && (
        <>
          <button
            onClick={() => paginate(-1)}
            aria-label="Previous Banner"
            className="absolute left-2 sm:left-5 top-1/2 -translate-y-1/2 z-40 w-9 h-9 sm:w-12 sm:h-12 rounded-full bg-black/40 hover:bg-black/70 border border-white/20 backdrop-blur-xl text-white flex items-center justify-center transition-all opacity-80 md:opacity-0 md:group-hover:opacity-100 hover:scale-110 active:scale-90 shadow-xl"
          >
            <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
          <button
            onClick={() => paginate(1)}
            aria-label="Next Banner"
            className="absolute right-2 sm:right-5 top-1/2 -translate-y-1/2 z-40 w-9 h-9 sm:w-12 sm:h-12 rounded-full bg-black/40 hover:bg-black/70 border border-white/20 backdrop-blur-xl text-white flex items-center justify-center transition-all opacity-80 md:opacity-0 md:group-hover:opacity-100 hover:scale-110 active:scale-90 shadow-xl"
          >
            <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </>
      )}

      {/* Dot Indicators */}
      {banners.length > 1 && (
        <div className="flex items-center justify-center gap-1.5 sm:gap-2 mt-3 sm:mt-4 z-30 relative">
          {banners.map((_, i) => (
            <button
              key={i}
              onClick={() => {
                setCurrent(i);
                resetTimer();
              }}
              aria-label={`Go to slide ${i + 1}`}
              className={`h-1.5 sm:h-2 rounded-full transition-all duration-300 ${
                current === i
                  ? "w-7 sm:w-9 bg-[var(--accent,#3b82f6)] shadow-lg shadow-[var(--accent,#3b82f6)]/50"
                  : "w-1.5 sm:w-2 bg-white/25 hover:bg-white/50"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

