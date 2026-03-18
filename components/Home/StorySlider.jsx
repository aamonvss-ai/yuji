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
    link: "/games/mobile-legends988?type=weekly-pass",
  },
  {
    id: 1,
    title: "Weekly Bundle",
    badge: "Sale",
    color: "from-rose-500 to-rose-700",
    image: "/game-assets/elite-bundle.jpeg",
    link: "/games/weeklymonthly-bundle931",
  },
  {
    id: 2,
    title: "MLBB India",
    badge: "Live",
    color: "from-blue-400 to-indigo-600",
    image: "/game-assets/india-mlbb.jpg",
    link: "/games/mobile-legends988",
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
    title: "Small pack",
    badge: "Fast",
    color: "from-cyan-400 to-sky-600",
    image: "/game-assets/3_cj6nj4.jpg",
    link: "/games/mlbb-smallphp980",
  },

  {
    id: 6,
    title: "Premium",
    badge: "VIP",
    color: "from-pink-500 to-rose-600",
    image: "/membership/silver-m.png",
    link: "/games/membership/silver-membership",
  },
];

export default function StorySlider() {
  return (
    <section className="relative py-10 px-4 overflow-hidden select-none">
      <div className="max-w-7xl mx-auto flex gap-6 md:gap-10 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden snap-x snap-mandatory px-4 lg:px-0 scroll-smooth">
        {storyData.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: index * 0.05 }}
            className="snap-center"
          >
            <Link
              href={item.link}
              className="group relative flex flex-col items-center min-w-[75px] md:min-w-[95px]"
            >
              <div className="relative">
                {/* Rotating Orbital Ring (Hover Only) */}
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                  className={`absolute -inset-[3px] rounded-[1.8rem] border border-dashed border-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
                />

                {/* Main Glass Squircle Container */}
                <div className={`relative p-[2.5px] rounded-[1.6rem] transition-all duration-500 group-hover:scale-110 shadow-2xl overflow-hidden`}>

                  {/* Theme Border Accent */}
                  <div className={`absolute inset-0 bg-gradient-to-tr ${item.color} opacity-30 group-hover:opacity-100 transition-opacity duration-500`} />

                  <div className="relative p-[2px] rounded-[1.5rem] bg-[#050505]">
                    <div className="relative w-[68px] h-[68px] md:w-[84px] md:h-[84px] rounded-[1.4rem] overflow-hidden bg-zinc-900 mask-squircle shadow-inner">
                      <Image
                        src={item.image}
                        alt={item.title}
                        fill
                        sizes="(max-width: 768px) 68px, 84px"
                        className="object-cover transition-all duration-1000 group-hover:scale-125 filter group-hover:brightness-110"
                      />

                      {/* Premium Internal Shadow (Edge Depth) */}
                      <div className="absolute inset-0 shadow-[inset_0_0_20px_rgba(0,0,0,0.8)] opacity-60" />

                      {/* Shimmer Light Leak */}
                      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                    </div>
                  </div>
                </div>

                {/* Minimalist Floating Badge */}
                {item.badge && (
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 z-20">
                    <div className={`px-2 py-[2px] rounded-full bg-black/90 backdrop-blur-md border border-white/10 shadow-[0_4px_12px_rgba(0,0,0,0.5)] transition-all duration-500 group-hover:bg-gradient-to-r ${item.color} group-hover:border-transparent group-hover:-translate-y-1`}>
                      <span className="flex items-center gap-1 text-[7px] md:text-[8px] font-black uppercase tracking-[0.15em] text-white">
                        {item.badge === "Live" && (
                          <span className="relative flex h-1.5 w-1.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white"></span>
                          </span>
                        )}
                        {item.badge}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Sophisticated Labels */}
              <div className="mt-4 flex flex-col items-center">
                <span className="text-[10px] md:text-[11px] font-black uppercase tracking-widest text-zinc-500 group-hover:text-white transition-all duration-500 transform group-hover:translate-y-[-2px]">
                  {item.title}
                </span>
                <div className={`h-[1.5px] w-0 bg-gradient-to-r ${item.color} group-hover:w-full transition-all duration-500 rounded-full mt-1.5`} />
              </div>
            </Link>
          </motion.div>
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
