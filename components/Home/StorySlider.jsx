"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";

const storyData = [
  {
    id: 0,
    title: "Weekly Pass",
    badge: "Hot",
    color: "from-emerald-400 to-emerald-600",
    image: "/game-assets/weeklypass-new.jpeg",
    link: "/games/mobile-legends114?type=weekly-pass",
  },
  {
    id: 1,
    title: "Weekly Bundle",
    badge: "Sale",
    color: "from-rose-500 to-rose-700",
    image: "/game-assets/elite-bundle.jpeg",
    link: "/games/weeklymonthly-bundle646",
  },
  {
    id: 2,
    title: "MLBB India",
    badge: "Live",
    color: "from-blue-400 to-indigo-600",
    image: "/game-assets/india-mlbb.jpg",
    link: "/games/mobile-legends114",
  },
  {
    id: 3,
    title: "MLBB Double",
    badge: "New",
    color: "from-violet-400 to-purple-600",
    image: "/game-assets/double.jpg",
    link: "/games/mlbb-double332",
  },
  {
    id: 4,
    title: "Indian Small Pack",
    color: "from-cyan-400 to-sky-600",
    image: "/game-assets/3_cj6nj4.jpg",
    link: "/games/mobile-legends-philippines888",
  },

  {
    id: 6,
    title: "Premium",
    badge: "VIP",
    color: "from-pink-500 to-rose-600",
    image: "/membership/silver-m.png",
    link: "/games/silver-membership",
  },
];

export default function StorySlider() {
  return (
    <section className="relative py-4 overflow-hidden select-none">
      <div className="max-w-7xl mx-auto flex gap-4 md:gap-6 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden snap-x snap-mandatory px-4 scroll-smooth">
        {storyData.map((item) => (
          <div
            key={item.id}
            className="snap-center"
          >
            <Link
              href={item.link}
              className="group relative flex flex-col items-center min-w-[60px] md:min-w-[76px]"
            >
              <div className="relative">
                {/* Rotating Orbital Ring (Hover Only - CSS animated) */}
                <div
                  className="absolute -inset-[3px] rounded-full border border-dashed border-[var(--border)] opacity-0 group-hover:opacity-100 group-hover:animate-spin transition-opacity duration-300 pointer-events-none"
                  style={{ animationDuration: '6s' }}
                />

                {/* Main Glass Circle Container */}
                <div className="relative p-[2.5px] rounded-full transition-transform duration-300 ease-out group-hover:scale-105 shadow-md overflow-hidden transform-gpu">

                  {/* Theme Border Accent */}
                  <div className={`absolute inset-0 bg-gradient-to-tr ${item.color} opacity-30 group-hover:opacity-100 transition-opacity duration-300`} />

                  <div className="relative p-[1.5px] rounded-full bg-[var(--card)]">
                    <div className="relative w-[52px] h-[52px] md:w-[66px] md:h-[66px] rounded-full overflow-hidden bg-[var(--card)] shadow-inner border border-[var(--border)]">
                      <Image
                        src={item.image}
                        alt={item.title}
                        fill
                        sizes="(max-width: 768px) 52px, 66px"
                        className="object-cover transition-transform duration-500 ease-out group-hover:scale-115"
                      />

                      {/* Premium Internal Shadow (Edge Depth) */}
                      <div className="absolute inset-0 shadow-[inset_0_0_12px_rgba(0,0,0,0.4)] opacity-20 pointer-events-none" />
                    </div>
                  </div>
                </div>

              </div>

              {/* Sophisticated Labels */}
              <div className="mt-1.5 flex flex-col items-center max-w-[68px] md:max-w-[80px] text-center">
                <span className="text-[8.5px] md:text-[9.5px] font-bold uppercase tracking-tight text-[var(--muted)] group-hover:text-[var(--foreground)] transition-colors duration-300 leading-tight">
                  {item.title}
                </span>
                <div className={`h-[1.5px] w-0 bg-gradient-to-r ${item.color} group-hover:w-full transition-all duration-300 rounded-full mt-0.5`} />
              </div>
            </Link>
          </div>
        ))}
      </div>

      <style jsx global>{`
        .mask-squircle {
          border-radius: 28%;
        }
      `}</style>
    </section>
  );
}
