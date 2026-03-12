"use client";

import { JSX, useState } from "react";
import {
  FaPhoneAlt,
  FaInstagram,
  FaYoutube,
  FaWhatsapp,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { FiSend, FiMessageSquare, FiExternalLink } from "react-icons/fi";

/* ===================== ENV ===================== */

const SUPPORT_WHATSAPP = process.env.NEXT_PUBLIC_SUPPORT_WHATSAPP;
const INSTAGRAM_USERNAME = process.env.NEXT_PUBLIC_INSTAGRAM_USERNAME;
const INSTAGRAM_URL = process.env.NEXT_PUBLIC_INSTAGRAM_URL;
const WHATSAPP_STORE_LINK = process.env.NEXT_PUBLIC_WHATSAPP_STORE_LINK;

/* ===================== CONFIG (JSON) ===================== */

const SUPPORT_CONFIG = {
  header: {
    title: "Support Center",
    subtitle:
      "Facing an issue? Contact us instantly or submit a support query and our team will assist you.",
  },

  contacts: {
    title: "Direct Channels",
    items: [
      {
        id: "phone",
        title: "Call Support",
        value: SUPPORT_WHATSAPP,
        href: SUPPORT_WHATSAPP ? `tel:${SUPPORT_WHATSAPP}` : "#",
        icon: "phone",
        external: false,
        desc: "Instant voice assistance"
      },
      {
        id: "instagram",
        title: "Instagram",
        value: INSTAGRAM_USERNAME,
        href: INSTAGRAM_URL,
        icon: "instagram",
        external: true,
        desc: "DM for updates"
      },
      {
        id: "whatsapp",
        title: "WhatsApp Group",
        value: "Join Support",
        href: WHATSAPP_STORE_LINK,
        icon: "whatsapp",
        external: true,
        desc: "Community & Support"
      },
    ],
  },

  queryTypes: [
    "Order Issue",
    "Payment Issue",
    "Wallet Issue",
    "General Inquiry",
  ],
};

/* ===================== ICON MAP ===================== */

const ICON_MAP: Record<string, JSX.Element> = {
  phone: <FaPhoneAlt />,
  instagram: <FaInstagram />,
  youtube: <FaYoutube />,
  whatsapp: <FaWhatsapp />,
};

/* ===================== COMPONENT ===================== */

export default function QueryTab() {
  const [queryType, setQueryType] = useState("");
  const [queryMessage, setQueryMessage] = useState("");
  const [querySuccess, setQuerySuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!queryType) return;

    setIsSubmitting(true);

    const storedEmail = localStorage.getItem("email");
    const storedPhone = localStorage.getItem("phone");
    const storedToken = localStorage.getItem("token");

    try {
      const res = await fetch("/api/support/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: storedEmail || null,
          phone: storedPhone || null,
          token: storedToken || null,
          type: queryType,
          message: queryMessage,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setQuerySuccess("Your query has been submitted successfully.");
      } else {
        setQuerySuccess(data.message || "Something went wrong.");
      }

      setQueryType("");
      setQueryMessage("");
    } catch {
      setQuerySuccess("Failed to submit query. Please try again.");
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setQuerySuccess(""), 5000);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10">

      {/* ================= HEADER ================= */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className="text-3xl font-black tracking-tight">{SUPPORT_CONFIG.header.title}</h2>
        <p className="text-[var(--muted)] font-medium mt-2 max-w-2xl">
          {SUPPORT_CONFIG.header.subtitle}
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* ================= CONTACT SECTION ================= */}
        <div className="lg:col-span-5 space-y-6">
          <h3 className="text-xs font-black uppercase tracking-[0.2em] text-[var(--muted)] px-1">
            {SUPPORT_CONFIG.contacts.title}
          </h3>

          <div className="space-y-3">
            {SUPPORT_CONFIG.contacts.items
              .filter((item) => item.href && item.value)
              .map((item, idx) => (
                <motion.a
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  key={item.id}
                  href={item.href}
                  target={item.external ? "_blank" : undefined}
                  rel={item.external ? "noopener noreferrer" : undefined}
                  className="group flex items-center gap-4 p-4 rounded-2xl bg-[var(--card)] border border-[var(--border)] hover:border-[var(--accent)]/50 hover:bg-[var(--background)]/50 transition-all shadow-sm"
                >
                  <div className="w-12 h-12 rounded-xl bg-[var(--background)] flex items-center justify-center text-[var(--accent)] group-hover:bg-[var(--accent)] group-hover:text-white transition-all">
                    {ICON_MAP[item.icon]}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm flex items-center gap-1.5">
                      {item.title}
                      {item.external && <FiExternalLink size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />}
                    </p>
                    <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-tight truncate">
                      {item.desc}
                    </p>
                  </div>
                </motion.a>
              ))}
          </div>
        </div>

        {/* ================= QUERY FORM ================= */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="lg:col-span-7 p-8 rounded-[2rem] bg-[var(--card)] border border-[var(--border)] shadow-xl space-y-6"
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2.5 rounded-xl bg-[var(--accent)]/10 text-[var(--accent)]">
              <FiMessageSquare />
            </div>
            <h3 className="text-xl font-bold">Submit a Query</h3>
          </div>

          <AnimatePresence>
            {querySuccess && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="rounded-2xl bg-green-500/10 text-green-500 p-4 text-sm font-bold border border-green-500/10 flex items-center gap-2"
              >
                {querySuccess}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-[var(--muted)] block mb-2 px-1">Issue Category</label>
              <select
                value={queryType}
                onChange={(e) => setQueryType(e.target.value)}
                className="w-full p-4 rounded-2xl bg-[var(--background)] border border-[var(--border)] focus:border-[var(--accent)] focus:ring-4 focus:ring-[var(--accent)]/10 outline-none transition-all font-bold text-sm appearance-none cursor-pointer"
              >
                <option value="">Select Category</option>
                {SUPPORT_CONFIG.queryTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-[var(--muted)] block mb-2 px-1">Detailed Message</label>
              <textarea
                className="w-full p-4 rounded-2xl h-40 bg-[var(--background)] border border-[var(--border)] focus:border-[var(--accent)] focus:ring-4 focus:ring-[var(--accent)]/10 outline-none transition-all resize-none text-sm placeholder:text-[var(--muted)]/50"
                placeholder="How can we help you today? Please include any relevant order IDs..."
                value={queryMessage}
                onChange={(e) => setQueryMessage(e.target.value)}
              />
            </div>

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              disabled={!queryType || isSubmitting}
              onClick={handleSubmit}
              className="w-full py-4 rounded-2xl bg-[var(--accent)] text-white font-black shadow-xl shadow-[var(--accent)]/20 hover:shadow-[var(--accent)]/40 transition-all disabled:opacity-50 disabled:grayscale flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <FiSend /> Send Message
                </>
              )}
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
