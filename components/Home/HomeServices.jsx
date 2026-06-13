"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { FaWhatsapp } from "react-icons/fa";

export default function HomeServices() {
  return (
    <section className="py-2 px-6">
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="rounded-2xl bg-[var(--card)] border border-[var(--border)] p-3 md:p-4 shadow-sm flex flex-row items-center justify-between gap-2 md:gap-3 transition-all"
        >
          {/* Left Side: Text */}
          <div className="space-y-0.5 md:space-y-1 pl-1 md:pl-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[var(--accent)] shadow-[0_0_8px_var(--accent)]"></span>
              <h2 className="text-[13px] md:text-sm font-bold text-[var(--accent)] uppercase tracking-wide leading-none">
                Build Your Site
              </h2>
            </div>
            <p className="text-[10px] md:text-[11px] font-medium text-[var(--muted)] max-w-[280px] leading-snug">
              We build clean, fast websites and software for your business.
            </p>
          </div>

          {/* Right Side: Button */}
          <div className="shrink-0 pr-1 md:pr-2">
            <Link
              href="https://wa.me/9178521537"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-1.5 md:py-2 bg-[var(--background)] border border-[var(--border)] rounded-xl shadow-sm hover:shadow-md hover:border-[var(--accent)]/50 transition-all active:scale-95 group"
            >
              <FaWhatsapp className="text-green-500 text-base group-hover:scale-110 transition-transform" />
              <span className="text-[var(--accent)] font-bold text-[11px] uppercase tracking-wider">
                Contact
              </span>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
