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
    <div className="max-w-4xl mx-auto space-y-6">
 
      {/* ================= HEADER ================= */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className="text-2xl font-black uppercase tracking-tighter italic">Support <span className="text-[var(--accent)]">Center</span></h2>
        <p className="text-[var(--muted)] text-xs font-black uppercase tracking-widest opacity-80 mt-1 max-w-2xl">
          Contact us for help with your orders or account
        </p>
      </motion.div>
 
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* ================= CONTACT SECTION ================= */}
        <div className="lg:col-span-5 space-y-4">
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--muted)] px-1">
            {SUPPORT_CONFIG.contacts.title}
          </h3>
 
          <div className="space-y-2">
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
                  className="group flex items-center gap-3 p-3 rounded-xl bg-[var(--card)] border border-[var(--border)] hover:border-[var(--accent)]/50 transition-all shadow-sm"
                >
                  <div className="w-10 h-10 rounded-lg bg-[var(--foreground)]/[0.03] flex items-center justify-center text-[var(--accent)] group-hover:bg-[var(--accent)] group-hover:text-white transition-all">
                    {ICON_MAP[item.icon]}
                  </div>
 
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-xs flex items-center gap-1.5">
                      {item.title}
                      {item.external && <FiExternalLink size={10} className="opacity-0 group-hover:opacity-100 transition-opacity" />}
                    </p>
                    <p className="text-[9px] font-bold text-[var(--muted)] uppercase tracking-tight truncate">
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
          className="lg:col-span-7 p-6 rounded-[1.5rem] bg-[var(--card)] border border-[var(--border)] shadow-xl space-y-4"
        >
          <div className="flex items-center gap-2 mb-1">
            <div className="p-2 rounded-lg bg-[var(--accent)]/10 text-[var(--accent)]">
              <FiMessageSquare size={16} />
            </div>
            <h3 className="text-lg font-bold">Submit a Query</h3>
          </div>
 
          <AnimatePresence>
            {querySuccess && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="rounded-xl bg-green-500/10 text-green-500 p-3 text-[10px] font-black uppercase tracking-widest border border-green-500/10 flex items-center gap-2"
              >
                {querySuccess}
              </motion.div>
            )}
          </AnimatePresence>
 
          <div className="space-y-3">
            <div>
              <label className="text-[9px] font-black uppercase tracking-widest text-[var(--muted)] block mb-1.5 px-1">Category</label>
              <select
                value={queryType}
                onChange={(e) => setQueryType(e.target.value)}
                className="w-full p-3 rounded-xl bg-[var(--background)] border border-[var(--border)] focus:border-[var(--accent)] focus:ring-4 focus:ring-[var(--accent)]/10 outline-none transition-all font-bold text-xs appearance-none cursor-pointer"
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
              <label className="text-[9px] font-black uppercase tracking-widest text-[var(--muted)] block mb-1.5 px-1">Message</label>
              <textarea
                className="w-full p-3 rounded-xl h-32 bg-[var(--background)] border border-[var(--border)] focus:border-[var(--accent)] focus:ring-4 focus:ring-[var(--accent)]/10 outline-none transition-all resize-none text-xs placeholder:text-[var(--muted)]/50"
                placeholder="How can we help?"
                value={queryMessage}
                onChange={(e) => setQueryMessage(e.target.value)}
              />
            </div>
 
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              disabled={!queryType || isSubmitting}
              onClick={handleSubmit}
              className="w-full py-3 rounded-xl bg-[var(--accent)] text-white font-black uppercase tracking-[0.1em] text-xs shadow-xl shadow-[var(--accent)]/20 hover:shadow-[var(--accent)]/40 transition-all disabled:opacity-50 disabled:grayscale flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <FiSend size={14} /> Send Query
                </>
              )}
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
