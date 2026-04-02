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
  History
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
      <div className="max-w-6xl mx-auto flex items-center justify-between px-4 h-16">

        {/* LOGO */}
        <Link
          href="/"
          className="flex items-center transition-transform duration-300 hover:scale-105"
        >
          <Image
            src={logo}
            alt="yuji Logo"
            width={90}
            height={28}
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
              if (!user) {
                window.location.href = `/login?redirect=${encodeURIComponent(window.location.pathname)}`;
              } else {
                setUserMenuOpen(!userMenuOpen);
              }
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
          <AnimatePresence>
            {userMenuOpen && !loading && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="absolute right-0 top-14 w-72 bg-[var(--card)]/95 backdrop-blur-2xl border border-[var(--border)] rounded-[1.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.3)] overflow-hidden z-50 origin-top-right"
              >
                {!user ? (
                  <div className="p-3">
                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        window.location.href = `/login?redirect=${encodeURIComponent(window.location.pathname)}`;
                      }}
                      className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-[var(--accent)] text-white rounded-xl font-black uppercase text-xs tracking-widest transition-all duration-300 hover:shadow-xl hover:shadow-[var(--accent)]/30 hover:scale-[1.02] active:scale-95"
                    >
                      <User size={14} />
                      Login / Register
                    </button>
                  </div>
                ) : (
                  <>
                    {/* USER PROFILE HEADER */}
                    <div className="p-4 bg-gradient-to-br from-[var(--accent)]/10 via-transparent to-transparent border-b border-[var(--border)]/50">
                      <div className="flex items-start gap-3">
                        <div className="relative">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--accent)] to-[#22d3ee] p-[2px] shadow-lg">
                            <div className="w-full h-full rounded-[0.9rem] bg-[var(--card)] overflow-hidden flex items-center justify-center">
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
                            <div className="absolute -bottom-1 -right-1 bg-emerald-500 rounded-md p-0.5 border-2 border-[var(--card)] shadow-lg">
                              <ShieldCheck size={10} className="text-white" />
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col min-w-0 pt-0.5">
                          <span className="font-extrabold text-[var(--foreground)] truncate text-base leading-tight tracking-tight">
                            {user.name}
                          </span>
                          <span className="text-[10px] text-[var(--muted)] font-bold truncate opacity-70">
                            {user.email}
                          </span>
 
                          {/* Wallet Badge */}
                          <div className="flex items-center gap-1 mt-1.5 px-2 py-1 rounded-full bg-[var(--accent)]/10 border border-[var(--accent)]/20 w-fit">
                            <Wallet size={10} className="text-[var(--accent)]" />
                            <span className="text-[9px] font-black text-[var(--accent)] uppercase tracking-wider">
                              ₹{user.wallet?.toFixed(2) || "0.00"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
 
                    {/* MENU ITEMS */}
                    <div className="p-2">
                      <div className="grid grid-cols-1 gap-0.5">
                        {[
                          { href: "/dashboard", label: "Dashboard", Icon: LayoutDashboard },
                          { href: "/dashboard/order", label: "My Orders", Icon: History },
                          { href: "/leaderboard", label: "Leaderboard", Icon: Award },
                          { href: "/dashboard/support", label: "Customer Support", Icon: Headphones },
                        ].map((item, idx) => (
                          <Link
                            key={idx}
                            href={item.href}
                            className="flex items-center justify-between px-3 py-2 rounded-xl transition-all duration-300 hover:bg-[var(--accent)]/5 group"
                            onClick={() => setUserMenuOpen(false)}
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-[var(--foreground)]/[0.03] border border-[var(--border)]/50 flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:bg-[var(--accent)]/10 group-hover:border-[var(--accent)]/20">
                                <item.Icon size={14} className="text-[var(--muted)] transition-colors duration-300 group-hover:text-[var(--accent)]" />
                              </div>
                              <span className="font-bold text-xs text-[var(--foreground)] group-hover:text-[var(--accent)] transition-colors">{item.label}</span>
                            </div>
                            <ChevronRight size={12} className="text-[var(--muted)] opacity-0 -translate-x-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0 group-hover:text-[var(--accent)]" />
                          </Link>
                        ))}
 
                        {/* ADMIN PANEL (Conditional) */}
                        {user.userType === "owner" && (
                          <Link
                            href="/owner-panal"
                            className="flex items-center justify-between px-3 py-2 rounded-xl transition-all duration-300 hover:bg-emerald-500/5 group"
                            onClick={() => setUserMenuOpen(false)}
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-emerald-500/5 border border-emerald-500/10 flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:bg-emerald-500/10">
                                <Shield size={14} className="text-emerald-500" />
                              </div>
                              <span className="font-bold text-xs text-[var(--foreground)] group-hover:text-emerald-500 transition-colors tracking-tight">Admin Control</span>
                            </div>
                            <ChevronRight size={12} className="text-emerald-500 opacity-0 -translate-x-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0" />
                          </Link>
                        )}
                      </div>
 
                      <div className="h-px bg-[var(--border)]/30 my-2 mx-1" />
 
                      {/* LOGOUT BUTTON */}
                      <button
                        onClick={handleLogout}
                        className="flex items-center justify-center w-full px-4 py-3 rounded-xl transition-all duration-500 bg-rose-500/5 text-rose-500 hover:bg-rose-500 hover:text-white group border border-rose-500/10 shadow-sm"
                      >
                        <div className="flex items-center gap-2.5">
                          <LogOut size={16} className="transition-transform duration-500 group-hover:rotate-12" />
                          <span className="font-black uppercase text-[11px] tracking-[0.2em]">Logout</span>
                        </div>
                      </button>
                    </div>
                  </>
                )}
              </motion.div>
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
