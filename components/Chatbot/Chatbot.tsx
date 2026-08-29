"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Bot, ShieldCheck, Clock, CreditCard, HelpCircle, Sparkles, RotateCcw, ChevronRight } from "lucide-react";
import { usePathname } from "next/navigation";
import Link from "next/link";

interface QuickTopic {
  id: string;
  icon: any;
  label: string;
  question: string;
  answer: string;
  actionUrl?: string;
  actionLabel?: string;
}

export default function Chatbot() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ text: string; isUser: boolean; actionUrl?: string; actionLabel?: string }[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isVisible, setIsVisible] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const lastScrollY = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const whatsappNumber = process.env.NEXT_PUBLIC_SUPPORT_WHATSAPP || "+91 98765 43210";
  const whatsappUrl = `https://wa.me/${whatsappNumber.replace(/[^0-9]/g, "")}?text=${encodeURIComponent("Hello Yuji Support, I need help with my order.")}`;

  const FAQ_TOPICS: QuickTopic[] = [
    {
      id: "how_to_buy",
      icon: HelpCircle,
      label: "How to top up?",
      question: "How do I top up diamonds or game packs?",
      answer: "Top-up in 4 easy steps:\n1. Choose your game from the home catalog.\n2. Select your desired diamond or pass bundle.\n3. Enter your Game User ID & Zone ID.\n4. Complete the secure checkout.\n\n✨ Your items are credited to your account instantly!",
      actionUrl: "/games",
      actionLabel: "Browse Games",
    },
    {
      id: "delivery_time",
      icon: Clock,
      label: "Delivery time?",
      question: "How long does top-up delivery take?",
      answer: "⚡ Most top-ups are processed automatically via instant API within 30 to 90 seconds.\n\nIf server traffic is high, it may take up to 2–5 minutes. You can check the real-time status in your Orders tab.",
      actionUrl: "/dashboard/order",
      actionLabel: "Check My Orders",
    },
    {
      id: "safety",
      icon: ShieldCheck,
      label: "Is it safe?",
      question: "Is this top-up safe and ban-proof?",
      answer: "🔒 100% Safe & Guaranteed!\n• We use direct official top-up channels.\n• We never ask for your game password.\n• Encrypted payments with zero ban risk.",
    },
    {
      id: "find_id",
      icon: Sparkles,
      label: "Find User ID / Zone ID?",
      question: "Where do I find my Game User ID and Zone ID?",
      answer: "🎮 For Mobile Legends (MLBB):\n1. Open MLBB and tap your profile avatar (top-left).\n2. Under your nickname, you will see:\n   ID: 12345678 (1234)\n• User ID: The main 8–10 digit number.\n• Zone ID: The 4–5 digit number inside parentheses.",
    },
    {
      id: "order_help",
      icon: CreditCard,
      label: "Order / Payment issue?",
      question: "My payment was deducted but items not received yet?",
      answer: "Don't worry! If payment was deducted:\n• Most delays resolve within 2 minutes as the payment gateway syncs.\n• If pending after 5 minutes, our 24/7 team will resolve it immediately on WhatsApp with your Order ID or UPI UTR reference.",
      actionUrl: whatsappUrl,
      actionLabel: "WhatsApp Support",
    },
    {
      id: "contact_support",
      icon: MessageCircle,
      label: "Contact human support",
      question: "How can I speak to human support?",
      answer: "Our support specialists are available 24/7 to assist you directly on WhatsApp for instant resolution!",
      actionUrl: whatsappUrl,
      actionLabel: "Chat on WhatsApp",
    },
  ];

  // Don't show in games section if needed
  const isHidden = pathname?.startsWith("/games");

  // Scroll handling
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY.current && currentScrollY > 100) {
        setIsVisible(true);
      } else if (currentScrollY < lastScrollY.current) {
        setIsVisible(false);
      }
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen, isTyping]);

  const handleSelectTopic = (topic: QuickTopic) => {
    setMessages((prev) => [...prev, { text: topic.question, isUser: true }]);
    setIsTyping(true);

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          text: topic.answer,
          isUser: false,
          actionUrl: topic.actionUrl,
          actionLabel: topic.actionLabel,
        },
      ]);
      setIsTyping(false);
    }, 500);
  };

  const handleSendMessage = (text: string) => {
    if (!text.trim()) return;

    const userMessage = text.trim();
    setMessages((prev) => [...prev, { text: userMessage, isUser: true }]);
    setInputValue("");
    setIsTyping(true);

    setTimeout(() => {
      let botReply = "";
      let actionUrl: string | undefined;
      let actionLabel: string | undefined;
      const lower = userMessage.toLowerCase();

      if (lower.includes("hi") || lower.includes("hello") || lower.includes("hey")) {
        botReply = "Hello! 👋 Welcome to Yuji Support. How can I help you today? You can choose any topic below or ask your question.";
      } else if (lower.includes("how to buy") || lower.includes("topup") || lower.includes("top up") || lower.includes("purchase")) {
        botReply = "To top up:\n1. Select your game\n2. Choose diamond pack\n3. Enter Player ID & Zone ID\n4. Complete payment for instant delivery!";
        actionUrl = "/games";
        actionLabel = "View Catalog";
      } else if (lower.includes("safe") || lower.includes("ban") || lower.includes("legit")) {
        botReply = "🛡️ 100% Safe & Secure!\nAll top-ups are processed via authorized official game servers. Zero risk to your account.";
      } else if (lower.includes("order") || lower.includes("status") || lower.includes("history") || lower.includes("track")) {
        botReply = "You can view and track your real-time top-up orders directly in your account dashboard.";
        actionUrl = "/dashboard/order";
        actionLabel = "My Orders";
      } else if (lower.includes("id") || lower.includes("zone") || lower.includes("find")) {
        botReply = "To find your MLBB ID:\nOpen game -> Click your profile in the top-left corner. Your User ID and Zone ID (in brackets) are displayed right under your avatar.";
      } else if (lower.includes("whatsapp") || lower.includes("contact") || lower.includes("human") || lower.includes("agent") || lower.includes("support")) {
        botReply = "You can chat with our support team directly on WhatsApp for instant assistance.";
        actionUrl = whatsappUrl;
        actionLabel = "Open WhatsApp";
      } else if (lower.includes("refund") || lower.includes("failed") || lower.includes("pending")) {
        botReply = "If your payment succeeded but order is pending, please share your Transaction ID or Order ID with our WhatsApp team for quick manual release!";
        actionUrl = whatsappUrl;
        actionLabel = "Contact on WhatsApp";
      } else {
        botReply = "I'm here to help! For specialized questions or custom orders, feel free to connect directly with our 24/7 support team on WhatsApp.";
        actionUrl = whatsappUrl;
        actionLabel = "Connect on WhatsApp";
      }

      setMessages((prev) => [...prev, { text: botReply, isUser: false, actionUrl, actionLabel }]);
      setIsTyping(false);
    }, 600);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage(inputValue);
  };

  const handleResetChat = () => {
    setMessages([]);
  };

  if (isHidden) return null;

  return (
    <motion.div
      ref={containerRef}
      initial={false}
      animate={{
        y: isVisible ? 0 : 100,
        opacity: isVisible ? 1 : 0,
        scale: isVisible ? 1 : 0.8,
      }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
      className="fixed bottom-6 left-6 z-[100] sm:bottom-8 sm:left-8 font-sans select-none"
    >
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20, x: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20, x: -10 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="absolute bottom-16 left-0 w-[310px] sm:w-[360px] h-[500px] bg-[var(--card)]/95 border border-[var(--border)] rounded-3xl shadow-2xl overflow-hidden backdrop-blur-2xl flex flex-col z-50"
          >
            {/* Header */}
            <div className="p-3.5 px-4 bg-[var(--foreground)]/[0.02] border-b border-[var(--border)]/70 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[var(--accent)]/15 border border-[var(--accent)]/30 flex items-center justify-center text-[var(--accent)]">
                  <Bot size={16} />
                </div>
                <div>
                  <h3 className="text-[13px] font-bold text-[var(--foreground)] tracking-tight leading-tight">Support Assistant</h3>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <p className="text-[9.5px] font-semibold text-[var(--muted)]">Online • Instant help</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1">
                {messages.length > 0 && (
                  <button
                    onClick={handleResetChat}
                    title="Reset chat"
                    className="w-7 h-7 rounded-full flex items-center justify-center text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--foreground)]/5 transition-colors"
                  >
                    <RotateCcw size={13} />
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  aria-label="Close"
                  className="w-7 h-7 rounded-full flex items-center justify-center text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--foreground)]/5 transition-colors"
                >
                  <X size={15} />
                </button>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
              {messages.length === 0 ? (
                <div className="space-y-4 pt-1">
                  <div className="text-center py-2">
                    <div className="w-10 h-10 rounded-2xl bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent)]/20 flex items-center justify-center mx-auto mb-2">
                      <Sparkles size={18} />
                    </div>
                    <h4 className="text-[13.5px] font-bold text-[var(--foreground)] tracking-tight">How can we help you?</h4>
                    <p className="text-[10.5px] text-[var(--muted)] mt-0.5">Tap a question below or type your message</p>
                  </div>

                  <div className="space-y-1.5">
                    <p className="text-[9.5px] font-bold uppercase tracking-wider text-[var(--muted)] px-1">Common Questions</p>
                    <div className="grid grid-cols-1 gap-1.5">
                      {FAQ_TOPICS.map((topic) => {
                        const Icon = topic.icon;
                        return (
                          <button
                            key={topic.id}
                            onClick={() => handleSelectTopic(topic)}
                            className="text-left px-3 py-2.5 rounded-2xl bg-[var(--foreground)]/[0.03] hover:bg-[var(--foreground)]/[0.06] border border-[var(--border)] hover:border-[var(--accent)]/40 transition-all flex items-center justify-between group"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="w-6 h-6 rounded-lg bg-[var(--accent)]/10 text-[var(--accent)] flex items-center justify-center shrink-0">
                                <Icon size={12} />
                              </div>
                              <span className="text-[11.5px] font-semibold text-[var(--foreground)] group-hover:text-[var(--accent)] transition-colors truncate">
                                {topic.label}
                              </span>
                            </div>
                            <ChevronRight size={13} className="text-[var(--muted)] group-hover:text-[var(--accent)] group-hover:translate-x-0.5 transition-all shrink-0" />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  {messages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`flex ${msg.isUser ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-[12px] shadow-xs leading-relaxed ${
                          msg.isUser
                            ? "bg-[var(--accent)] text-white rounded-br-xs font-semibold"
                            : "bg-[var(--foreground)]/[0.04] text-[var(--foreground)] rounded-bl-xs border border-[var(--border)] font-normal"
                        }`}
                      >
                        <p className="whitespace-pre-wrap">{msg.text}</p>

                        {/* Action Link if provided */}
                        {msg.actionUrl && (
                          <div className="mt-2 pt-2 border-t border-[var(--border)]/60">
                            <Link
                              href={msg.actionUrl}
                              target={msg.actionUrl.startsWith("http") ? "_blank" : undefined}
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--accent)]/10 hover:bg-[var(--accent)]/20 text-[var(--accent)] text-[11px] font-bold transition-colors"
                            >
                              <span>{msg.actionLabel || "Learn More"}</span>
                              <ChevronRight size={11} />
                            </Link>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}

                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="bg-[var(--foreground)]/[0.04] border border-[var(--border)] rounded-2xl px-3.5 py-2 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] animate-bounce" />
                        <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] animate-bounce [animation-delay:0.2s]" />
                        <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] animate-bounce [animation-delay:0.4s]" />
                      </div>
                    </div>
                  )}
                </>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <form onSubmit={handleFormSubmit} className="p-2.5 px-3 bg-[var(--card)] border-t border-[var(--border)] shrink-0 flex items-center gap-2">
              <input
                type="text"
                placeholder="Ask a question..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="flex-1 bg-[var(--foreground)]/[0.03] border border-[var(--border)] rounded-xl px-3.5 py-2 text-[12px] text-[var(--foreground)] placeholder:text-[var(--muted)]/50 focus:outline-none focus:border-[var(--accent)] transition-all font-medium"
              />
              <button
                type="submit"
                disabled={!inputValue.trim()}
                className="w-8 h-8 rounded-xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white flex items-center justify-center shadow-xs disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-95 shrink-0"
              >
                <Send size={13} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Launcher Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="relative w-11 h-11 rounded-2xl bg-[var(--accent)] text-white flex items-center justify-center shadow-lg shadow-[var(--accent)]/25 hover:shadow-[var(--accent)]/40 transition-all z-10 group"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <X size={18} />
            </motion.div>
          ) : (
            <motion.div
              key="chat"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <MessageCircle size={18} className="fill-current" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Pulse indicator */}
        {!isOpen && (
          <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-[var(--background)] animate-pulse" />
        )}
      </motion.button>
    </motion.div>
  );
}
