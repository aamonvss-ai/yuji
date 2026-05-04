"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { FaWhatsapp, FaGlobe } from "react-icons/fa";

export default function HomeServices() {
  return (
    <section className="py-4 px-6">
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-[1.5rem] bg-[var(--card)] border border-[var(--border)] p-6 md:p-8 text-left shadow-xl shadow-black/5"
        >
          <div className="relative z-10 space-y-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2.5 text-[var(--accent)]">
                <FaGlobe size={22} />
                <h2 className="text-lg md:text-xl font-black italic uppercase tracking-tighter">
                  Build Your Website
                </h2>
              </div>
              <p className="text-[11px] md:text-xs font-medium text-[var(--muted)] max-w-sm leading-relaxed">
                We provide all kinds of software development and website services.
              </p>
            </div>

            <div className="flex justify-start">
              <Link
                href="https://wa.me/9178521537"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2 bg-[var(--accent)] hover:opacity-90 !text-white font-black uppercase tracking-widest rounded-lg transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg shadow-[var(--accent)]/20"
              >
                <FaWhatsapp size={16} />
                <span className="text-[10px] md:text-[11px]">Contact Us</span>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
