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
      "Need help? Contact us now or send a support message.",
  },

  contacts: {
    title: "Contact Us",
    items: [
      {
        id: "phone",
        title: "Call Us",
        value: SUPPORT_WHATSAPP,
        href: SUPPORT_WHATSAPP ? `tel:${SUPPORT_WHATSAPP}` : "#",
        icon: "phone",
        external: false,
        desc: "Talk to our team"
      },
      {
        id: "instagram",
        title: "Instagram",
        value: INSTAGRAM_USERNAME,
        href: INSTAGRAM_URL,
        icon: "instagram",
        external: true,
        desc: "Follow us for updates"
      },
      {
        id: "whatsapp",
        title: "WhatsApp Group",
        value: "Join Support",
        href: WHATSAPP_STORE_LINK,
        icon: "whatsapp",
        external: true,
        desc: "Join our community"
      },
    ],
  },

  queryTypes: [
    "Order Issue",
    "Payment Issue",
    "Wallet Issue",
    "General Question",
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
  const [queryPhone, setQueryPhone] = useState("");
  const [queryOrderId, setQueryOrderId] = useState("");
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
          phone: queryPhone || storedPhone || null,
          orderId: queryOrderId || null,
          token: storedToken || null,
          type: queryType,
          message: queryMessage,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setQuerySuccess("Your message was sent.");
      } else {
        setQuerySuccess(data.message || "Something went wrong.");
      }

      setQueryType("");
      setQueryPhone("");
      setQueryOrderId("");
      setQueryMessage("");
    } catch {
      setQuerySuccess("Could not send message. Please try again.");
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setQuerySuccess(""), 5000);
    }
  };

  return (
    <div className="max-w-full mx-auto space-y-5 px-1">
 
      {/* ================= HEADER ================= */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="px-1"
      >
        <h2 className="text-xl font-black uppercase tracking-tighter italic flex items-center gap-3">
          <div className="w-1.5 h-6 bg-[var(--accent)] rounded-full" />
          Support <span className="text-[var(--accent)]">Hub</span>
        </h2>
        <p className="text-[var(--muted)] text-[9px] font-black uppercase tracking-[0.2em] opacity-40 mt-1 italic">
          Help with your orders and account
        </p>
      </motion.div>
 
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* ================= CONTACT SECTION ================= */}
        <div className="lg:col-span-5 space-y-4">
          <h3 className="text-[9px] font-black uppercase tracking-[0.2em] text-[var(--muted)] px-1 italic opacity-40">
            {SUPPORT_CONFIG.contacts.title}
          </h3>
 
          <div className="space-y-2">
            {SUPPORT_CONFIG.contacts.items
              .filter((item) => item.href && item.value)
              .map((item, idx) => (
                <motion.a
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  key={item.id}
                  href={item.href}
                  target={item.external ? "_blank" : undefined}
                  rel={item.external ? "noopener noreferrer" : undefined}
                  className="group flex items-center gap-3 p-3 rounded-xl bg-[var(--card)]/20 backdrop-blur-md border border-[var(--border)] hover:border-[var(--accent)]/50 transition-all shadow-sm"
                >
                  <div className="w-9 h-9 rounded-lg bg-[var(--foreground)]/[0.03] flex items-center justify-center text-[var(--accent)] group-hover:bg-[var(--accent)] group-hover:text-black transition-all">
                    {ICON_MAP[item.icon]}
                  </div>
 
                  <div className="flex-1 min-w-0">
                    <p className="font-black text-[10px] uppercase italic flex items-center gap-1.5 tracking-tight">
                      {item.title}
                      {item.external && <FiExternalLink size={10} className="opacity-30 group-hover:opacity-100 transition-opacity" />}
                    </p>
                    <p className="text-[8px] font-black text-[var(--muted)] uppercase tracking-widest opacity-40 italic">
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
          className="lg:col-span-7 p-5 rounded-[2rem] bg-[var(--card)]/30 backdrop-blur-md border border-[var(--border)] shadow-xl space-y-5"
        >
          <div className="flex items-center gap-2 mb-1 px-1">
            <div className="p-2 rounded-lg bg-[var(--accent)]/10 text-[var(--accent)]">
              <FiMessageSquare size={14} />
            </div>
            <h3 className="text-sm font-black uppercase italic tracking-tighter">Send a Message</h3>
          </div>
 
          <AnimatePresence>
            {querySuccess && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="rounded-xl bg-green-500/10 text-green-500 p-3 text-[9px] font-black uppercase tracking-[0.2em] border border-green-500/10 flex items-center gap-2 italic"
              >
                {querySuccess}
              </motion.div>
            )}
          </AnimatePresence>
 
          <div className="space-y-4">
            <div>
              <label className="text-[8px] font-black uppercase tracking-[0.2em] text-[var(--muted)] block mb-1.5 px-1 opacity-40 italic">Select Category</label>
              <select
                value={queryType}
                onChange={(e) => setQueryType(e.target.value)}
                className="w-full p-3 rounded-xl bg-[var(--foreground)]/[0.03] border border-transparent focus:border-[var(--accent)]/20 focus:bg-[var(--card)] outline-none transition-all font-black uppercase italic tracking-tighter text-[10px] appearance-none cursor-pointer shadow-inner"
              >
                <option value="">Choose a Topic</option>
                {SUPPORT_CONFIG.queryTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
 
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[8px] font-black uppercase tracking-[0.2em] text-[var(--muted)] block mb-1.5 px-1 opacity-40 italic">Phone Number</label>
                <input
                  type="text"
                  className="w-full p-3 rounded-xl bg-[var(--foreground)]/[0.03] border border-transparent focus:border-[var(--accent)]/20 focus:bg-[var(--card)] outline-none transition-all font-black uppercase italic tracking-tighter text-[10px] shadow-inner"
                  placeholder="91 000..."
                  value={queryPhone}
                  onChange={(e) => setQueryPhone(e.target.value)}
                />
              </div>
              <div>
                <label className="text-[8px] font-black uppercase tracking-[0.2em] text-[var(--muted)] block mb-1.5 px-1 opacity-40 italic">Order ID (Optional)</label>
                <input
                  type="text"
                  className="w-full p-3 rounded-xl bg-[var(--foreground)]/[0.03] border border-transparent focus:border-[var(--accent)]/20 focus:bg-[var(--card)] outline-none transition-all font-black uppercase italic tracking-tighter text-[10px] shadow-inner"
                  placeholder="#ORD-..."
                  value={queryOrderId}
                  onChange={(e) => setQueryOrderId(e.target.value)}
                />
              </div>
            </div>
 
            <div>
              <label className="text-[8px] font-black uppercase tracking-[0.2em] text-[var(--muted)] block mb-1.5 px-1 opacity-40 italic">Your Message</label>
              <textarea
                className="w-full p-3 rounded-xl h-20 bg-[var(--foreground)]/[0.03] border border-transparent focus:border-[var(--accent)]/20 focus:bg-[var(--card)] outline-none transition-all resize-none text-[10px] font-bold placeholder:text-[var(--muted)]/20 shadow-inner"
                placeholder="Describe your issue..."
                value={queryMessage}
                onChange={(e) => setQueryMessage(e.target.value)}
              />
            </div>
 
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              disabled={!queryType || isSubmitting}
              onClick={handleSubmit}
              className="w-full py-4 rounded-xl bg-[var(--accent)] text-black font-black uppercase tracking-[0.3em] text-[10px] italic shadow-lg shadow-[var(--accent)]/20 hover:brightness-110 transition-all disabled:opacity-30 disabled:grayscale flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
              ) : (
                <>
                  <FiSend size={12} /> Send Message
                </>
              )}
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
