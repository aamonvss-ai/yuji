"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { FaWhatsapp } from "react-icons/fa";

export default function HomeServices() {
  return (
    <section className="py-8 px-6">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-[2rem] bg-[var(--card)] border border-[var(--border)] p-8 md:p-10 text-center shadow-xl shadow-black/5"
        >
          <div className="relative z-10 space-y-5">
            <div className="space-y-2">
              <h2 className="text-xl md:text-2xl font-black italic uppercase tracking-tighter text-amber-500">
                Build Your Website
              </h2>
              <p className="text-xs md:text-sm font-medium text-[var(--muted)] max-w-md mx-auto leading-relaxed">
                We provide all kinds of software development and website services.
              </p>
            </div>

            <div className="flex justify-center pt-2">
              <Link
                href="https://wa.me/9178521537"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2.5 px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-black uppercase tracking-widest rounded-xl transition-all duration-300 hover:scale-105 active:scale-95"
              >
                <FaWhatsapp size={18} />
                <span className="text-[11px] md:text-xs">Contact Us</span>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
