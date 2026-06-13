"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Sun, Moon, Zap, Gamepad2, Code2, Target, Flower2, Leaf, 
  Heart, Cloud, Sunrise, IceCream, Flame, Droplets, 
  ShieldCheck, Shield, TreePine, Coins, Sparkles, 
  Hexagon, Monitor, Star, Compass, Wind
} from "lucide-react";

const themes = [
  // 🌍 Core
  { id: "light", icon: <Sun size={20} strokeWidth={2.5} />, label: "Light" },
  { id: "dark", icon: <Moon size={20} strokeWidth={2.5} />, label: "Dark" },

  // ⚡ Creative / Gaming
  { id: "cyber", icon: <Zap size={20} strokeWidth={2.5} />, label: "Cyber Neon" },
  { id: "retro", icon: <Gamepad2 size={20} strokeWidth={2.5} />, label: "Retro Arcade" },
  { id: "matrix", icon: <Code2 size={20} strokeWidth={2.5} />, label: "Matrix" },
  { id: "neonlime", icon: <Target size={20} strokeWidth={2.5} />, label: "Neon Lime" },

  // 🌸 Soft / Aesthetic
  { id: "sakura", icon: <Flower2 size={20} strokeWidth={2.5} />, label: "Sakura" },
  { id: "autumn", icon: <Leaf size={20} strokeWidth={2.5} />, label: "Autumn" },

  // 💖 Girly / Cute
  { id: "rose", icon: <Heart size={20} strokeWidth={2.5} />, label: "Rose Blush" },
  { id: "lavender", icon: <Cloud size={20} strokeWidth={2.5} />, label: "Lavender Dream" },
  { id: "peach", icon: <Sunrise size={20} strokeWidth={2.5} />, label: "Peach Glow" },
  { id: "vanilla", icon: <IceCream size={20} strokeWidth={2.5} />, label: "Vanilla Cream" },

  // 🔥 Bold / Aggressive
  { id: "inferno", icon: <Flame size={20} strokeWidth={2.5} />, label: "Inferno" },
  { id: "crimson", icon: <Droplets size={20} strokeWidth={2.5} />, label: "Crimson Noir" },

  // 🧔 Manly / Strong
  { id: "steel", icon: <ShieldCheck size={20} strokeWidth={2.5} />, label: "Steel Gray" },
  { id: "bloodiron", icon: <Shield size={20} strokeWidth={2.5} />, label: "Blood Iron" },
  { id: "carbon", icon: <Wind size={20} strokeWidth={2.5} />, label: "Carbon Fiber" },

  // 🌲 Calm / Natural
  { id: "forest", icon: <TreePine size={20} strokeWidth={2.5} />, label: "Forest" },
  { id: "emerald", icon: <Coins size={20} strokeWidth={2.5} />, label: "Finance Emerald" },

  // 🌌 Dark / Premium
  { id: "void", icon: <Sparkles size={20} strokeWidth={2.5} />, label: "Void Purple" },
  { id: "midnight", icon: <Compass size={20} strokeWidth={2.5} />, label: "Midnight Blue" },

  // 🧊 Modern / SaaS
  { id: "glass", icon: <Hexagon size={20} strokeWidth={2.5} />, label: "Glass" },
  { id: "slate", icon: <Monitor size={20} strokeWidth={2.5} />, label: "Slate Pro" },

  // 🎨 Creator / Luxury
  { id: "solar", icon: <Sun size={20} strokeWidth={2.5} />, label: "Solar Gold" },
  { id: "prism", icon: <Star size={20} strokeWidth={2.5} />, label: "Prism" },
];



export default function ThemeToggle() {
  const [theme, setTheme] = useState<string>("dark");
  const [open, setOpen] = useState(false);

  // Load stored theme on mount
  useEffect(() => {
    const stored = localStorage.getItem("theme") || "dark";
    setTheme(stored);
    document.documentElement.setAttribute("data-theme", stored);
  }, []);

  // Change theme handler
  const changeTheme = (newTheme: string) => {
    const applyTheme = () => {
      setTheme(newTheme);
      localStorage.setItem("theme", newTheme);
      document.documentElement.setAttribute("data-theme", newTheme);
      setOpen(false);
    };

    // ✨ Premium View Transition API support
    if (typeof document !== "undefined" && (document as any).startViewTransition) {
      (document as any).startViewTransition(applyTheme);
    } else {
      applyTheme();
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest(".theme-toggle-container")) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
    }
  }, [open]);

  const currentTheme = themes.find((t) => t.id === theme);

  return (
    <div className="relative inline-block text-left theme-toggle-container">
      {/* 🎨 Current Theme Button (Icon Only) */}
      <button
        onClick={() => setOpen(!open)}
        className="w-10 h-10 flex items-center justify-center border border-[var(--border)] rounded-full bg-[var(--card)]/40 backdrop-blur-md hover:bg-[var(--accent)] hover:border-[var(--accent)] group transition-all duration-200 shadow-lg hover:shadow-[var(--accent)]/40 outline-none"
        aria-label="Select Theme"
      >
        <span className={`text-xl transition-transform duration-150 ${open ? 'rotate-180 scale-110' : 'group-hover:scale-120'}`}>
          {currentTheme?.icon || "🎨"}
        </span>
      </button>

      {/* 🪄 Premium Grid Dropdown */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10, filter: "blur(5px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -10, filter: "blur(5px)" }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="absolute right-0 mt-3 w-72 sm:w-[320px] bg-[var(--card)]/95 backdrop-blur-3xl border border-[var(--border)] rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.4)] z-[100] p-4 sm:p-5 origin-top-right overflow-hidden will-change-transform"
          >
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 sm:gap-3 max-h-[320px] sm:max-h-[380px] overflow-y-auto pr-2 custom-scrollbar">
              {themes.map((t) => {
                const isActive = theme === t.id;
                // Use first word of label for a cleaner, untruncated look
                const shortLabel = t.label.split(" ")[0];
                return (
                  <button
                    key={t.id}
                    title={t.label}
                    onClick={() => changeTheme(t.id)}
                    className={`
                      group flex flex-col items-center justify-center p-2 rounded-2xl transition-all duration-300
                      ${isActive
                        ? "bg-[var(--accent)]/10 ring-1 ring-[var(--accent)]/50 text-[var(--accent)] shadow-inner"
                        : "hover:bg-[var(--foreground)]/5 text-[var(--foreground)]"
                      }
                    `}
                  >
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl mb-1.5 transition-transform duration-300 ${isActive ? "scale-110 drop-shadow-md" : "group-hover:scale-110 group-hover:bg-[var(--foreground)]/5"}`}>
                      {t.icon}
                    </div>
                    <span className={`text-[9px] font-bold uppercase tracking-wider truncate w-full text-center ${isActive ? "opacity-100" : "opacity-60 group-hover:opacity-100"}`}>
                      {shortLabel}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Visual Indicator */}
            <div className="mt-4 pt-4 border-t border-[var(--border)] flex items-center justify-center">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--muted)] opacity-60">Studio Themes</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: var(--accent);
        }
      `}</style>
    </div>
  );
}

