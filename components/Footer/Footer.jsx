"use client";

import Link from "next/link";
import Image from "next/image";
import logo from "@/public/logo.png";
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
import { Home, Info, Phone, FileText, Shield, FileCheck, RefreshCcw, Globe } from "lucide-react";

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
      { label: "Home", href: "/", icon: Home },
      { label: "About Us", href: "/about", icon: Info },
      { label: "Contact", href: "/contact", icon: Phone },
      { label: "Blog", href: "/blog", icon: FileText },
    ],
  },
  {
    title: "Help",
    links: [
      { label: "Privacy Policy", href: "/privacy-policy", icon: Shield },
      { label: "Terms & Conditions", href: "/terms-and-conditions", icon: FileCheck },
      { label: "Refund Policy", href: "/refund-policy", icon: RefreshCcw },
      { label: "Region Info", href: "/region", icon: Globe },
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
    <footer className="relative mt-6 border-t border-[var(--border)] bg-[var(--card)]/30 backdrop-blur-xl overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-[var(--accent)]/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-[var(--accent)]/10 rounded-full blur-[80px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-5 py-5 lg:py-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 lg:gap-6">

          {/* Brand & Description */}
          <div className="md:col-span-5 space-y-2.5">
            <Link href="/" className="inline-flex items-center gap-2.5 group">
              <Image
                src={logo}
                alt="YUJI MLBB"
                width={50}
                height={50}
                className="w-12 h-12 md:w-12 md:h-12 object-contain logo-img transition-transform duration-300 group-hover:scale-105 shrink-0"
              />
              <span className="font-black text-lg md:text-xl tracking-tight text-[var(--foreground)] uppercase whitespace-nowrap select-none">
                YUJI <span className="text-[var(--accent)]">MLBB</span>
              </span>
            </Link>
            <p className="text-xs text-[var(--muted)] leading-relaxed max-w-sm">
              {BRAND.description}
            </p>
            <div className="flex items-center gap-2 pt-0.5">
              {SOCIALS.map((social) => (
                <motion.a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ y: -2, scale: 1.08 }}
                  className={`w-7 h-7 rounded-xl border border-[var(--border)] bg-[var(--background)]/50 backdrop-blur-sm flex items-center justify-center transition-all duration-200 ${social.color} hover:border-[var(--accent)]/50 text-[var(--muted)]`}
                  aria-label={social.label}
                >
                  <social.icon size={13} />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Links Grid */}
          <div className="md:col-span-4 grid grid-cols-2 gap-3 lg:gap-4">
            {FOOTER_LINKS.map((section) => (
              <div key={section.title} className="space-y-1.5">
                <h3 className="text-[9px] font-black uppercase tracking-[0.2em] text-[var(--muted)]/60">
                  {section.title}
                </h3>
                <ul className="space-y-1">
                  {section.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="group flex items-center gap-1.5 text-xs font-medium text-[var(--muted)] hover:text-[var(--foreground)] transition-colors py-0.5"
                      >
                        <link.icon size={12} className="text-[var(--muted)]/50 group-hover:text-[var(--accent)] transition-colors duration-200" />
                        <span>{link.label}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* QR / Trust Section */}
          <div className="md:col-span-3 flex items-start">
            <div className="p-2 rounded-xl bg-[var(--card)]/60 border border-[var(--border)] backdrop-blur-md flex flex-row items-center gap-2 text-left transition-all duration-300 hover:border-[var(--accent)]/30 w-full">
              <div className="shrink-0 p-1 bg-white rounded-lg border border-gray-100">
                <QRCodeCanvas
                  value={TRUSTPILOT_URL}
                  size={32}
                  bgColor="#ffffff"
                  fgColor="#000000"
                  level="H"
                />
              </div>
              <div className="space-y-0.5 min-w-0 flex-1">
                <div className="flex items-center justify-between gap-1">
                  <div className="flex items-center gap-1 text-[10px] font-bold text-[var(--foreground)]">
                    <FiShield className="text-green-500 w-2.5 h-2.5 shrink-0" />
                    <span className="truncate">Safe & Secure</span>
                  </div>
                  <span className="inline-flex items-center px-1.5 py-0.2 rounded-full text-[7px] font-bold bg-green-500/10 text-green-500 border border-green-500/20 whitespace-nowrap shrink-0 leading-none">
                    ACTIVE
                  </span>
                </div>
                <p className="text-[8.5px] text-[var(--muted)] truncate leading-tight">
                  Reviews on <span className="text-[var(--foreground)] font-semibold">Trustpilot</span>
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* Divider & Bottom Bar */}
        <div className="mt-6 pt-4 border-t border-[var(--border)]/30 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex flex-col md:flex-row items-center gap-3 text-center md:text-left">
            <p className="text-[10px] font-semibold text-[var(--muted)]/70 uppercase tracking-widest">
              © {currentYear} {BRAND_NAME}. All Rights Reserved.
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
