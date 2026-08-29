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
    <div className="max-w-full mx-auto space-y-4 px-0.5">
      {/* ================= HEADER ================= */}
      <div className="px-1">
        <h2 className="text-base sm:text-lg font-bold tracking-tight text-[var(--foreground)] flex items-center gap-2">
          <div className="w-1.5 h-4 bg-[var(--accent)] rounded-full" />
          Support Hub
        </h2>
        <p className="text-[9.5px] text-[var(--muted)] font-medium mt-0.5">
          Fast assistance for orders, payments, and account queries
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5">
        {/* ================= CONTACT SECTION ================= */}
        <div className="lg:col-span-5 space-y-2.5">
          <h3 className="text-[9px] font-bold uppercase tracking-wider text-[var(--muted)] px-1">
            {SUPPORT_CONFIG.contacts.title}
          </h3>

          <div className="space-y-2">
            {SUPPORT_CONFIG.contacts.items
              .filter((item) => item.href && item.value)
              .map((item, idx) => (
                <a
                  key={item.id}
                  href={item.href}
                  target={item.external ? "_blank" : undefined}
                  rel={item.external ? "noopener noreferrer" : undefined}
                  className="group flex items-center gap-3 p-2.5 rounded-xl bg-[var(--card)]/40 border border-[var(--border)] hover:border-[var(--accent)]/40 transition-all shadow-xs"
                >
                  <div className="w-8 h-8 rounded-lg bg-[var(--foreground)]/[0.03] border border-[var(--border)] flex items-center justify-center text-[var(--accent)] group-hover:bg-[var(--accent)] group-hover:text-white transition-all">
                    {ICON_MAP[item.icon]}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-xs flex items-center gap-1.5 text-[var(--foreground)]">
                      {item.title}
                      {item.external && <FiExternalLink size={10} className="text-[var(--muted)] group-hover:text-[var(--foreground)] transition-colors" />}
                    </p>
                    <p className="text-[9px] text-[var(--muted)] mt-0.5 truncate">
                      {item.desc}
                    </p>
                  </div>
                </a>
              ))}
          </div>
        </div>

        {/* ================= QUERY FORM ================= */}
        <div className="lg:col-span-7 p-3.5 sm:p-4 rounded-xl bg-[var(--card)]/40 backdrop-blur-md border border-[var(--border)] shadow-xs space-y-3">
          <div className="flex items-center gap-2 mb-0.5">
            <div className="w-6 h-6 rounded-md bg-[var(--accent)]/10 text-[var(--accent)] flex items-center justify-center">
              <FiMessageSquare size={12} />
            </div>
            <h3 className="text-xs sm:text-sm font-bold text-[var(--foreground)]">Send a Message</h3>
          </div>

          <AnimatePresence>
            {querySuccess && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="rounded-lg bg-emerald-500/10 text-emerald-500 p-2.5 text-[10px] font-bold border border-emerald-500/20 flex items-center gap-2"
              >
                ● {querySuccess}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="space-y-2.5">
            <div>
              <label className="text-[9px] font-bold uppercase tracking-wider text-[var(--muted)] block mb-1 px-0.5">Select Category</label>
              <select
                value={queryType}
                onChange={(e) => setQueryType(e.target.value)}
                className="w-full py-2 px-3 rounded-lg bg-[var(--card)] border border-[var(--border)] focus:border-[var(--accent)] outline-none transition-all font-semibold text-xs text-[var(--foreground)] cursor-pointer"
              >
                <option value="">Choose a Topic...</option>
                {SUPPORT_CONFIG.queryTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[9px] font-bold uppercase tracking-wider text-[var(--muted)] block mb-1 px-0.5">Phone Number</label>
                <input
                  type="text"
                  className="w-full py-2 px-3 rounded-lg bg-[var(--foreground)]/[0.03] border border-[var(--border)] focus:border-[var(--accent)] focus:bg-[var(--card)] outline-none transition-all text-xs font-medium text-[var(--foreground)] placeholder:text-[var(--muted)]/40"
                  placeholder="91 00000 00000"
                  value={queryPhone}
                  onChange={(e) => setQueryPhone(e.target.value)}
                />
              </div>
              <div>
                <label className="text-[9px] font-bold uppercase tracking-wider text-[var(--muted)] block mb-1 px-0.5">Order ID (Optional)</label>
                <input
                  type="text"
                  className="w-full py-2 px-3 rounded-lg bg-[var(--foreground)]/[0.03] border border-[var(--border)] focus:border-[var(--accent)] focus:bg-[var(--card)] outline-none transition-all text-xs font-mono font-medium text-[var(--foreground)] placeholder:text-[var(--muted)]/40"
                  placeholder="#ORD-12345"
                  value={queryOrderId}
                  onChange={(e) => setQueryOrderId(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="text-[9px] font-bold uppercase tracking-wider text-[var(--muted)] block mb-1 px-0.5">Your Message</label>
              <textarea
                className="w-full p-2.5 rounded-lg h-20 bg-[var(--foreground)]/[0.03] border border-[var(--border)] focus:border-[var(--accent)] focus:bg-[var(--card)] outline-none transition-all resize-none text-xs font-medium text-[var(--foreground)] placeholder:text-[var(--muted)]/40"
                placeholder="Describe your issue or question in detail..."
                value={queryMessage}
                onChange={(e) => setQueryMessage(e.target.value)}
              />
            </div>

            <motion.button
              whileTap={{ scale: 0.99 }}
              disabled={!queryType || isSubmitting}
              onClick={handleSubmit}
              className="w-full py-2.5 rounded-lg bg-[var(--accent)] text-white font-bold uppercase tracking-wider text-[10.5px] shadow-xs hover:bg-[var(--accent-hover)] transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
            >
              {isSubmitting ? (
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <FiSend size={12} /> Send Message
                </>
              )}
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
}
