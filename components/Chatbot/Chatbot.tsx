"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Bot, User } from "lucide-react";
import { usePathname } from "next/navigation";

export default function Chatbot() {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<{ text: string; isUser: boolean }[]>([]);
    const [inputValue, setInputValue] = useState("");
    const [isVisible, setIsVisible] = useState(true);
    const [isTyping, setIsTyping] = useState(false);
    const lastScrollY = useRef(0);

    const SUGGESTIONS = [
        "How to buy?",
        "Is it safe?",
        "Contact Support"
    ];

    // Don't show in games section
    const isHidden = pathname?.startsWith("/games");

    // Scroll handling
    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            if (currentScrollY > lastScrollY.current && currentScrollY > 100) {
                // Scrolling down
                setIsVisible(true);
            } else if (currentScrollY < lastScrollY.current) {
                // Scrolling up
                setIsVisible(false);
            }
            lastScrollY.current = currentScrollY;
        };

        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);
    const containerRef = useRef<HTMLDivElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const whatsappNumber = process.env.NEXT_PUBLIC_SUPPORT_WHATSAPP || "Not Available";
    // We'll use a generic email or assume one doesn't exist in env and provide a placeholder or instructions.
    // Since the user said "take from env", and I found no email env, I will use a placeholder that encourages checking the .env file or manually updating.
    // However, I can try to infer or use the brand name to construct one if needed, but safer to just state it's from env (even if missing).
    const supportEmail = process.env.GMAIL_USER || "hackerrai035@gmail.com"; // Fallback to a generic one if env is missing, or maybe undefined.

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

    // Auto-scroll to bottom of messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isOpen]);

    const handleSendMessage = (text: string) => {
        if (!text.trim()) return;

        const userMessage = text.trim();
        setMessages((prev) => [...prev, { text: userMessage, isUser: true }]);
        setInputValue("");
        setIsTyping(true);

        // Bot logic
        setTimeout(() => {
            let botReply = "";
            const lowerMsg = userMessage.toLowerCase();

            if (lowerMsg.includes("hi") || lowerMsg.includes("hello")) {
                botReply = "Hello! I'm your Yuji Support Assistant. How can I help you today?";
            } else if (lowerMsg.includes("how to buy")) {
                botReply = "To purchase diamonds:\n1. Select your game\n2. Choose a package\n3. Enter your Player ID & Zone\n4. Complete the payment\n\nYour diamonds will be delivered instantly!";
            } else if (lowerMsg.includes("safe")) {
                botReply = "Absolutely! We use official channels for top-ups, and our platform is protected by SSL encryption. Your account is 100% secure with Yuji.";
            } else if (lowerMsg.includes("order status") || lowerMsg.includes("where is my")) {
                botReply = "You can check your order status in the 'History' tab of your profile. Most orders are processed within 1-5 minutes.";
            } else if (lowerMsg.includes("refund")) {
                botReply = "Refunds are processed if the order fails. Please contact our WhatsApp support with your Order ID for assistance.";
            } else {
                botReply = `I'm here to help! You can also talk to a human expert at:\n\n📧 Email: ${supportEmail}\n📱 WhatsApp: ${whatsappNumber}`;
            }

            setMessages((prev) => [...prev, { text: botReply, isUser: false }]);
            setIsTyping(false);
        }, 800);
    };

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        handleSendMessage(inputValue);
    };

    if (isHidden) return null;

    return (
        <motion.div
            ref={containerRef}
            initial={false}
            animate={{
                y: isVisible ? 0 : 100,
                opacity: isVisible ? 1 : 0,
                scale: isVisible ? 1 : 0.8
            }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className="fixed bottom-6 left-6 z-[100] sm:bottom-8 sm:left-8 font-sans"
        >
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20, x: -20 }}
                        animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20, x: -20 }}
                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                        className="absolute bottom-20 left-0 w-[300px] sm:w-[350px] h-[480px] bg-[var(--card)] border border-[var(--border)] rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] overflow-hidden backdrop-blur-2xl flex flex-col"
                    >
                        {/* Header */}
                        <div className="bg-gradient-to-r from-[var(--accent)]/10 to-transparent p-4 border-b border-white/5 flex items-center gap-3 shrink-0">
                            <div className="w-8 h-8 rounded-full bg-[var(--accent)]/20 flex items-center justify-center text-[var(--accent)] border border-[var(--accent)]/30">
                                <Bot size={18} />
                            </div>
                            <div>
                                <h3 className="text-[var(--foreground)] font-black uppercase tracking-tight text-sm">Assistant</h3>
                                <div className="flex items-center gap-1.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                    <p className="text-[10px] text-[var(--muted)] font-bold uppercase tracking-widest">Live Support</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="ml-auto w-8 h-8 rounded-full flex items-center justify-center text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--foreground)]/5 transition-all"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
                            {messages.length === 0 && (
                                <div className="space-y-6 mt-4">
                                    <div className="text-center">
                                        <div className="w-12 h-12 rounded-2xl bg-[var(--accent)]/10 flex items-center justify-center mx-auto mb-3">
                                            <Bot className="text-[var(--accent)]" size={24} />
                                        </div>
                                        <h4 className="text-[var(--foreground)] font-black uppercase text-sm tracking-tight">How can we help?</h4>
                                        <p className="text-[10px] text-[var(--muted)] font-bold uppercase tracking-widest mt-1">Select a topic to start</p>
                                    </div>

                                    <div className="grid grid-cols-1 gap-2">
                                        {SUGGESTIONS.map((s) => (
                                            <button
                                                key={s}
                                                onClick={() => handleSendMessage(s)}
                                                className="text-left px-4 py-3 rounded-2xl bg-[var(--foreground)]/[0.03] border border-[var(--border)] text-[var(--foreground)] text-xs font-bold hover:bg-[var(--accent)]/10 hover:border-[var(--accent)]/30 transition-all flex items-center justify-between group"
                                            >
                                                {s}
                                                <Send size={12} className="opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {messages.map((msg, idx) => (
                                <div
                                    key={idx}
                                    className={`flex ${msg.isUser ? "justify-end" : "justify-start"}`}
                                >
                                    <div
                                        className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm whitespace-pre-wrap shadow-sm ${msg.isUser
                                            ? "bg-[var(--accent)] text-black rounded-tr-none font-bold italic"
                                            : "bg-[var(--foreground)]/[0.03] text-[var(--foreground)] rounded-tl-none border border-[var(--border)] font-medium"
                                            }`}
                                    >
                                        {msg.text}
                                    </div>
                                </div>
                            ))}
                             {isTyping && (
                                <div className="flex justify-start">
                                    <div className="bg-[var(--foreground)]/[0.03] border border-[var(--border)] rounded-2xl px-4 py-2 flex gap-1">
                                        <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] animate-bounce" />
                                        <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] animate-bounce [animation-delay:0.2s]" />
                                        <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] animate-bounce [animation-delay:0.4s]" />
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <form onSubmit={handleFormSubmit} className="p-3 bg-[var(--background)]/50 border-t border-[var(--border)] shrink-0 flex gap-2">
                            <input
                                type="text"
                                placeholder="Type a message..."
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                className="flex-1 bg-[var(--foreground)]/[0.03] border border-[var(--border)] rounded-xl px-4 py-2.5 text-sm text-[var(--foreground)] placeholder:text-[var(--muted)]/40 focus:outline-none focus:border-[var(--accent)]/50 focus:bg-[var(--foreground)]/[0.05] transition-all font-bold tracking-tight"
                            />
                            <button
                                type="submit"
                                disabled={!inputValue.trim()}
                                className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--accent)] to-[var(--accent-hover)] text-white flex items-center justify-center shadow-lg shadow-[var(--accent)]/10 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                <Send size={18} />
                            </button>
                        </form>

                        {/* Glossy overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(!isOpen)}
                className={`
          relative w-11 h-11 rounded-full 
          bg-[var(--accent)] 
          flex items-center justify-center text-black
          shadow-[0_0_15px_-5px_var(--accent)] 
          hover:shadow-[0_0_20px_-5px_var(--accent)]
          transition-shadow duration-300
          z-10 group
        `}
            >
                <AnimatePresence mode="wait">
                    {isOpen ? (
                        <motion.div
                            key="close"
                            initial={{ rotate: -90, opacity: 0 }}
                            animate={{ rotate: 0, opacity: 1 }}
                            exit={{ rotate: 90, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                        >
                            <X size={20} className="text-black font-bold" />
                        </motion.div>
                    ) : (
                        <motion.div
                            key="chat"
                            initial={{ rotate: 90, opacity: 0 }}
                            animate={{ rotate: 0, opacity: 1 }}
                            exit={{ rotate: -90, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                        >
                            <MessageCircle size={20} className="text-black font-bold fill-current" />
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Pulse ring when closed */}
                {!isOpen && (
                    <span className="absolute -inset-1 rounded-full border border-[var(--accent)] opacity-40 animate-ping pointer-events-none" />
                )}
            </motion.button>
        </motion.div>
    );
}
