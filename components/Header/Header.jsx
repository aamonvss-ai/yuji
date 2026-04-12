"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import ThemeToggle from "../ThemeToggle/ThemeToggle";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  LogOut,
  Settings,
  Award,
  Shield,
  Headphones,
  ChevronRight,
  Wallet,
  LayoutDashboard,
  ShieldCheck,
  History,
  X,
  Instagram,
  Phone
} from "lucide-react";
import { HiGlobeAlt, HiCube } from "react-icons/hi";
import Image from "next/image";
import logo from "@/public/logo.png";


export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [imgError, setImgError] = useState(false);

  const dropdownRef = useRef(null);

  // ---------------- FETCH USER FROM JWT ----------------
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      return;
    }

    fetch("/api/auth/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setUser(data.user);
          setImgError(false); // Reset error on new user
          // Sync wallet balance to localStorage for other components
          if (data.user.wallet !== undefined) {
             localStorage.setItem("walletBalance", data.user.wallet.toString());
          }
        } else {

          // Clear everything if token is invalid
          const keysToRemove = ["token", "email", "phone", "userName", "userId", "avatar", "walletBalance"];
          keysToRemove.forEach(key => localStorage.removeItem(key));
        }
      })
      .finally(() => setLoading(false));
  }, []);

  // ---------------- LOGOUT ----------------
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("email");
    localStorage.removeItem("phone");
    localStorage.removeItem("userName");
    localStorage.removeItem("userId");
    localStorage.removeItem("avatar");
    localStorage.removeItem("walletBalance");
    setUser(null);
    setImgError(false);
    window.location.href = "/";
  };

  // ---------------- SCROLL EFFECT ----------------
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // ---------------- CLOSE DROPDOWN ON OUTSIDE CLICK ----------------
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-200 ${scrolled
        ? "backdrop-blur-xl shadow-lg bg-[var(--card)]/90 border-b border-[var(--border)]"
        : "bg-transparent"
        }`}
    >
      <div className="max-w-6xl mx-auto flex items-center justify-between px-4 h-14">

        {/* LOGO */}
        <Link
          href="/"
          className="flex items-center transition-transform duration-300 hover:scale-105"
        >
          <Image
            src={logo}
            alt="yuji Logo"
            width={80}
            height={24}
            priority
            className="object-contain"
          />
        </Link>

        {/* DESKTOP NAV */}
        <nav className="hidden md:flex items-center space-x-1 text-[var(--muted)]">
          <Link
            href="/region"
            className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 hover:text-[var(--foreground)] hover:bg-[var(--accent)]/10"
          >
            <HiGlobeAlt size={18} />
            <span>Region</span>
          </Link>
          <Link
            href="/services"
            className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 hover:text-[var(--foreground)] hover:bg-[var(--accent)]/10"
          >
            <HiCube size={18} />
            <span>Services</span>
          </Link>
        </nav>

        {/* RIGHT SIDE */}
        <div className="flex items-center gap-3 relative" ref={dropdownRef}>
          <ThemeToggle />

          {/* USER AVATAR BUTTON */}
          <button
            onClick={() => {
              if (loading) return;
              setUserMenuOpen(!userMenuOpen);
            }}
            className="group relative w-10 h-10 rounded-full bg-gradient-to-br from-[var(--accent)] to-[#22d3ee] flex items-center justify-center overflow-hidden transition-all duration-300 hover:scale-110 active:scale-95 ring-2 ring-transparent hover:ring-[var(--accent)]/50 shadow-lg"
          >
            {!loading && user?.avatar && !imgError ? (
              <Image
                src={user.avatar}
                alt="User Avatar"
                width={40}
                height={40}
                className="object-cover w-full h-full"
                onError={() => setImgError(true)}
              />
            ) : (
              <User className="text-white w-5 h-5" />
            )}

            {/* Subtle glow effect */}
            <div className="absolute inset-0 bg-[var(--accent)] opacity-0 group-hover:opacity-20 transition-opacity" />
          </button>

          {/* USER DROPDOWN */}
          {/* USER SLIDER (DRAWER) */}
          <AnimatePresence>
            {userMenuOpen && !loading && (
              <>
                {/* Backdrop */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setUserMenuOpen(false)}
                  className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
                />

                <motion.div
                  initial={{ x: "100%" }}
                  animate={{ x: 0 }}
                  exit={{ x: "100%" }}
                  transition={{ type: "spring", damping: 25, stiffness: 200 }}
                  className="fixed right-0 top-0 h-screen w-72 bg-[var(--card)]/95 backdrop-blur-2xl border-l border-[var(--border)] shadow-[-20px_0_50px_rgba(0,0,0,0.3)] z-[101] flex flex-col pt-4"
                >
                  <div className="flex items-center justify-between px-5 mb-2">
                    <h2 className="text-[10px] font-black uppercase tracking-widest text-[var(--muted)] opacity-50">Account</h2>
                    <button 
                      onClick={() => setUserMenuOpen(false)}
                      className="p-1.5 rounded-full bg-[var(--foreground)]/[0.03] hover:bg-[var(--accent)]/10 text-[var(--muted)] hover:text-[var(--accent)] transition-all"
                    >
                      <X size={16} />
                    </button>
                  </div>

                  {!user ? (
                    <div className="flex-1 flex flex-col p-5">
                      <div className="mb-6">
                        <button
                          onClick={() => {
                            setUserMenuOpen(false);
                            window.location.href = `/login?redirect=${encodeURIComponent(window.location.pathname)}`;
                          }}
                          className="flex items-center justify-center gap-2 w-full py-4 px-4 bg-[var(--accent)] text-white rounded-xl font-black uppercase text-[11px] tracking-widest transition-all duration-300 hover:shadow-xl hover:shadow-[var(--accent)]/30 hover:scale-[1.02] active:scale-95 shadow-lg shadow-[var(--accent)]/20"
                        >
                          <User size={14} />
                          Sign In / Sign Up
                        </button>
                      </div>

                      <div className="space-y-1">
                        <p className="text-[9px] font-black uppercase tracking-widest text-[var(--muted)] opacity-50 px-3 mb-2">Explore</p>
                        {[
                          { href: "/games", label: "All Games", Icon: HiCube },
                          { href: "/region", label: "By Region", Icon: HiGlobeAlt },
                        ].map((item, idx) => (
                          <Link
                            key={idx}
                            href={item.href}
                            className="flex items-center justify-between px-3 py-3 rounded-xl transition-all duration-300 hover:bg-[var(--accent)]/5 group"
                            onClick={() => setUserMenuOpen(false)}
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-lg bg-[var(--foreground)]/[0.03] border border-[var(--border)]/50 flex items-center justify-center transition-all duration-300 group-hover:scale-105 group-hover:bg-[var(--accent)]/10 group-hover:border-[var(--accent)]/20">
                                <item.Icon size={16} className="text-[var(--muted)] transition-colors duration-300 group-hover:text-[var(--accent)]" />
                              </div>
                              <span className="font-bold text-xs text-[var(--foreground)] group-hover:text-[var(--accent)] transition-colors tracking-tight font-black uppercase italic">{item.label}</span>
                            </div>
                            <ChevronRight size={12} className="text-[var(--muted)] opacity-0 -translate-x-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0 group-hover:text-[var(--accent)]" />
                          </Link>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* USER PROFILE HEADER */}
                      <div className="px-4 py-5 border-b border-[var(--border)]/30 bg-gradient-to-br from-[var(--accent)]/2 to-transparent">
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="relative flex-shrink-0">
                              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--accent)] to-[#22d3ee] p-[1.5px] shadow-lg">
                                <div className="w-full h-full rounded-[0.7rem] bg-[var(--card)] overflow-hidden flex items-center justify-center">
                                  {user?.avatar && !imgError ? (
                                    <Image
                                      src={user.avatar}
                                      alt={user.name}
                                      width={48}
                                      height={48}
                                      className="object-cover w-full h-full"
                                      onError={() => setImgError(true)}
                                    />
                                  ) : (
                                    <User className="text-[var(--accent)] w-5 h-5" />
                                  )}
                                </div>
                              </div>
                              {user.userType === "owner" && (
                                <div className="absolute -bottom-1 -right-1 bg-emerald-500 rounded-md p-0.5 border border-[var(--card)] shadow-lg">
                                  <ShieldCheck size={10} className="text-white" />
                                </div>
                              )}
                            </div>
                            
                            <div className="flex flex-col min-w-0">
                              <h3 className="font-black text-[var(--foreground)] text-[13px] tracking-tight uppercase italic truncate leading-tight">
                                {user.name}
                              </h3>
                              <p className="text-[9px] text-[var(--muted)] font-bold opacity-60 truncate">
                                {user.email}
                              </p>
                              
                              {/* Wallet Mini-Badge */}
                              <div className="flex items-center gap-1.5 mt-1 px-2 py-0.5 rounded-full bg-[var(--accent)]/10 border border-[var(--accent)]/20 w-fit">
                                <Wallet size={8} className="text-[var(--accent)]" />
                                <span className="text-[9px] font-black text-[var(--accent)] uppercase tracking-wider">
                                  ₹{user.wallet?.toFixed(2) || "0.00"}
                                </span>
                              </div>
                            </div>
                          </div>

                          <button
                            onClick={handleLogout}
                            className="p-2.5 rounded-xl bg-rose-500/5 text-rose-500 hover:bg-rose-500 hover:text-white transition-all duration-300 active:scale-90 flex-shrink-0"
                            title="Logout"
                          >
                            <LogOut size={16} />
                          </button>
                        </div>
                      </div>

                      {/* MENU ITEMS */}
                      <div className="flex-1 overflow-y-auto px-3 py-4 scrollbar-none">
                        <div className="grid grid-cols-1 gap-0.5">
                          {[
                            { href: "/dashboard", label: "Dashboard", Icon: LayoutDashboard },
                            { href: "/dashboard/wallet", label: "Wallet", Icon: Wallet },
                            { href: "/dashboard/order", label: "My Orders", Icon: History },
                            { href: "/leaderboard", label: "Leaderboard", Icon: Award },
                            { href: "/dashboard/support", label: "Support", Icon: Headphones },
                          ].map((item, idx) => (
                            <Link
                              key={idx}
                              href={item.href}
                              className="flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-300 hover:bg-[var(--accent)]/5 group"
                              onClick={() => setUserMenuOpen(false)}
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-lg bg-[var(--foreground)]/[0.03] border border-[var(--border)]/50 flex items-center justify-center transition-all duration-300 group-hover:scale-105 group-hover:bg-[var(--accent)]/10 group-hover:border-[var(--accent)]/20">
                                  <item.Icon size={14} className="text-[var(--muted)] transition-colors duration-300 group-hover:text-[var(--accent)]" />
                                </div>
                                <span className="font-bold text-xs text-[var(--foreground)] group-hover:text-[var(--accent)] transition-colors tracking-tight font-black uppercase italic">{item.label}</span>
                              </div>
                              <ChevronRight size={12} className="text-[var(--muted)] opacity-0 -translate-x-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0 group-hover:text-[var(--accent)]" />
                            </Link>
                          ))}

                          {/* ADMIN PANEL (Conditional) */}
                          {user.userType === "owner" && (
                            <div className="mt-4 mb-2 px-1">
                              <p className="text-[9px] font-black uppercase tracking-widest text-emerald-500/50 mb-2 px-3">Management</p>
                              <Link
                                href="/owner-panal"
                                className="flex items-center justify-between px-3 py-3 rounded-xl transition-all duration-300 bg-emerald-500/[0.03] border border-emerald-500/10 hover:bg-emerald-500/10 hover:border-emerald-500/20 group relative overflow-hidden"
                                onClick={() => setUserMenuOpen(false)}
                              >
                                <div className="flex items-center gap-3">
                                  <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:bg-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                                    <Shield size={14} className="text-emerald-500" />
                                  </div>
                                  <span className="font-bold text-xs text-emerald-500 transition-colors tracking-tight font-black uppercase italic">Admin Panel</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                  <ChevronRight size={12} className="text-emerald-500 opacity-0 -translate-x-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0" />
                                </div>

                                {/* Subtle glow line */}
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-emerald-500/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                              </Link>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* SOCIAL LINKS */}
                      <div className="flex items-center justify-center gap-3 px-5 mt-auto pt-3 border-t border-[var(--border)]/20">
                        <Link 
                          href={process.env.NEXT_PUBLIC_INSTAGRAM_URL || "#"} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="p-2 rounded-lg bg-[var(--foreground)]/[0.03] border border-[var(--border)]/50 text-[var(--muted)] hover:text-[#E1306C] hover:bg-[#E1306C]/10 transition-all duration-300 hover:scale-105 active:scale-90"
                        >
                          <Instagram size={16} />
                        </Link>
                        <Link 
                          href={`https://wa.me/${(process.env.NEXT_PUBLIC_SUPPORT_WHATSAPP || "").replace(/\D/g, "")}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="p-2 rounded-lg bg-[var(--foreground)]/[0.03] border border-[var(--border)]/50 text-[var(--muted)] hover:text-[#25D366] hover:bg-[#25D366]/10 transition-all duration-300 hover:scale-105 active:scale-90"
                        >
                          <Phone size={16} />
                        </Link>
                      </div>

                      {/* FOOTER */}
                      <div className="py-4">
                        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[var(--muted)] opacity-20 text-center italic">
                          love from TK
                        </p>
                      </div>
                    </>
                  )}
                </motion.div>
              </>
            )}
          </AnimatePresence>

          {/* LOGOUT BUTTON OR LOGIN (Handled in dropdown) */}
        </div>
      </div>



      <style jsx>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </header>
  );
}
