"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sun, Moon } from "lucide-react";

export const themes = [
  { id: "dark", icon: <Moon size={16} strokeWidth={2.2} />, label: "Dark" },
  { id: "light", icon: <Sun size={16} strokeWidth={2.2} />, label: "Light" },
];

export default function ThemeToggle() {
  const [theme, setTheme] = useState<string>("dark");
  const [mounted, setMounted] = useState(false);

  // Load stored theme on mount
  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem("theme");
    const initialTheme = stored === "light" ? "light" : "dark";
    setTheme(initialTheme);
    document.documentElement.setAttribute("data-theme", initialTheme);
  }, []);

  // Toggle between dark and light
  const handleToggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";

    const applyTheme = () => {
      setTheme(nextTheme);
      localStorage.setItem("theme", nextTheme);
      document.documentElement.setAttribute("data-theme", nextTheme);
    };

    // ✨ View Transition API support if available
    if (typeof document !== "undefined" && (document as any).startViewTransition) {
      (document as any).startViewTransition(applyTheme);
    } else {
      applyTheme();
    }
  };

  const isDark = theme === "dark";

  return (
    <button
      onClick={handleToggleTheme}
      className="h-8 w-8 flex items-center justify-center rounded-xl bg-[var(--foreground)]/[0.03] border border-[var(--border)]/50 hover:bg-[var(--accent)]/10 hover:border-[var(--accent)]/30 text-[var(--foreground)] hover:text-[var(--accent)] transition-all active:scale-95 group focus:outline-none"
      title={`Switch to ${isDark ? "Light" : "Dark"} mode`}
      aria-label={`Current theme: ${isDark ? "Dark" : "Light"}. Click to toggle.`}
    >
      <AnimatePresence mode="wait" initial={false}>
        {mounted && (
          <motion.span
            key={theme}
            initial={{ scale: 0.6, rotate: -40, opacity: 0 }}
            animate={{ scale: 1, rotate: 0, opacity: 1 }}
            exit={{ scale: 0.6, rotate: 40, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="flex items-center justify-center"
          >
            {isDark ? <Moon size={16} strokeWidth={2.2} /> : <Sun size={16} strokeWidth={2.2} />}
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
}
