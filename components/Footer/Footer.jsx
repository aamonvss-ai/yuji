"use client";

import Link from "next/link";
import { QRCodeCanvas } from "qrcode.react";
import {
  FiInstagram,
  FiHeart,
  FiMail,
  FiShield,
  FiGlobe,
  FiExternalLink,
  FiChevronRight
} from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa6";
import { motion } from "framer-motion";

/* ===================== CONFIG ===================== */

const BRAND_NAME = process.env.NEXT_PUBLIC_BRAND_NAME || "MewJi";

const BRAND = {
  name: BRAND_NAME,
  description:
    "Fast and safe game top-ups. Instant delivery and 24/7 support for all players.",
};

const TK_CONTACT_LINK = "https://wa.me/9178521537";

/* ===================== ENV LINKS ===================== */

const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_SUPPORT_WHATSAPP || "";
const INSTAGRAM_URL = process.env.NEXT_PUBLIC_INSTAGRAM_URL || "";

const TRUSTPILOT_URL =
  process.env.NEXT_PUBLIC_TRUSTPILOT_URL ||
  "https://www.trustpilot.com/evaluate/yujimlbb.com";

const WHATSAPP_CHAT_LINK = WHATSAPP_NUMBER
  ? `https://wa.me/${WHATSAPP_NUMBER.replace(/\D/g, "")}`
  : "";

/* ===================== FOOTER LINKS ===================== */

const FOOTER_LINKS = [
  {
    title: "Links",
    links: [
      { label: "Home", href: "/" },
      { label: "About Us", href: "/about" },
      { label: "Contact", href: "/contact" },
      { label: "Blog", href: "/blog" },
    ],
  },
  {
    title: "Help",
    links: [
      { label: "Privacy Policy", href: "/privacy-policy" },
      { label: "Terms & Conditions", href: "/terms-and-conditions" },
      { label: "Refund Policy", href: "/refund-policy" },
      { label: "Region Info", href: "/region" },
    ],
  },
];

/* ===================== SOCIALS ===================== */

const SOCIALS = [
  {
    label: "Instagram",
    href: INSTAGRAM_URL,
    icon: FiInstagram,
    color: "hover:text-pink-500",
    glow: "hover:shadow-[0_0_15px_rgba(236,72,153,0.4)]",
  },
  {
    label: "WhatsApp",
    href: WHATSAPP_CHAT_LINK,
    icon: FaWhatsapp,
    color: "hover:text-green-500",
    glow: "hover:shadow-[0_0_15px_rgba(34,197,94,0.4)]",
  },
].filter((s) => s.href);

/* ===================== MAIN COMPONENT ===================== */

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative mt-8 border-t border-[var(--border)] bg-[var(--card)]/30 backdrop-blur-xl overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-[var(--accent)]/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-[var(--accent)]/10 rounded-full blur-[80px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 py-6 lg:py-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-8">

          {/* Brand & Description */}
          <div className="md:col-span-4 space-y-4">
            <Link href="/" className="inline-block group">
              <h2 className="text-2xl font-black tracking-tighter transition-transform duration-300 group-hover:scale-105">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#4f46e5] via-[#22d3ee] to-[#ec4899] filter drop-shadow-[0_2px_10px_rgba(34,211,238,0.2)]">
                  {BRAND.name}
                </span>
                <span className="text-[var(--accent)] drop-shadow-[0_0_12px_var(--accent)]">.</span>
              </h2>
            </Link>
            <p className="text-sm text-[var(--muted)] leading-relaxed max-w-sm">
              {BRAND.description}
            </p>
            <div className="flex items-center gap-3">
              {SOCIALS.map((social) => (
                <motion.a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ y: -4, scale: 1.1 }}
                  className={`p-2 rounded-xl border border-[var(--border)] bg-[var(--background)]/50 backdrop-blur-sm transition-all duration-300 ${social.color} ${social.glow} hover:border-[var(--accent)]/50`}
                  aria-label={social.label}
                >
                  <social.icon className="w-4.5 h-4.5" />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Links Grid */}
          <div className="md:col-span-5 grid grid-cols-2 gap-4 lg:gap-8">
            {FOOTER_LINKS.map((section) => (
              <div key={section.title} className="space-y-2">
                <h3 className="text-[9px] font-black uppercase tracking-[0.2em] text-[var(--muted)]/60">
                  {section.title}
                </h3>
                <ul className="space-y-2">
                  {section.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="group flex items-center gap-2 text-sm font-medium text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
                      >
                        <span className="w-1 h-1 rounded-full bg-[var(--accent)]/0 transition-all duration-300 group-hover:bg-[var(--accent)] group-hover:scale-110" />
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* QR / Trust Section */}
          <div className="md:col-span-3">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-[var(--background)]/80 to-[var(--background)]/40 border border-[var(--border)] backdrop-blur-md shadow-lg flex flex-row items-center gap-4 text-left transition-all duration-300 hover:border-[var(--accent)]/30">
              <div className="shrink-0 p-2 bg-white rounded-xl shadow-inner border border-gray-100 transition-transform duration-500 hover:scale-105">
                <QRCodeCanvas
                  value={TRUSTPILOT_URL}
                  size={50}
                  bgColor="#ffffff"
                  fgColor="#000000"
                  level="H"
                />
              </div>
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-[var(--foreground)]">
                  <FiShield className="text-green-500 w-3 h-3" />
                  <span>Safe & Secure</span>
                </div>
                <p className="text-[10px] text-[var(--muted)] leading-tight">
                  Scan to see our reviews<br />on <span className="text-[var(--foreground)] font-semibold">Trustpilot</span>
                </p>
                <div className="pt-0.5">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[8.5px] font-bold bg-green-500/10 text-green-500 border border-green-500/20 whitespace-nowrap">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-1.5" />
                    SERVICES ACTIVE
                  </span>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Divider & Bottom Bar */}
        <div className="mt-6 pt-4 border-t border-[var(--border)]/30 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex flex-col md:flex-row items-center gap-3 text-center md:text-left">
            <p className="text-[10px] font-semibold text-[var(--muted)]/70 uppercase tracking-widest">
              © {currentYear} {BRAND_NAME}
            </p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex items-center gap-4"
          >
            <div className="flex items-center gap-2.5 px-4 py-2 bg-[var(--background)]/40 rounded-full border border-[var(--border)] backdrop-blur-sm group hover:border-[var(--accent)]/30 transition-all duration-300">
              <span className="text-[10px] font-bold text-[var(--muted)]/80">Made with</span>
              <FiHeart className="text-red-500 w-3.5 h-3.5 fill-red-500/20" />
              <span className="text-[10px] font-bold text-[var(--muted)]/80">by</span>
              <Link
                href={TK_CONTACT_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-black text-[var(--foreground)] hover:text-[var(--accent)] transition-all duration-300 flex items-center gap-1 group-hover:translate-x-1"
              >
                TK
                <FiExternalLink className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Visual Accent Bottom */}
      <div className="h-1 w-full bg-gradient-to-r from-transparent via-[var(--accent)]/30 to-transparent" />
    </footer>
  );
}
