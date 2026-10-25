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
  Phone,
  Menu
} from "lucide-react";
import { HiGlobeAlt, HiCube } from "react-icons/hi";
import Image from "next/image";
import logo from "@/public/logo.png";
import { useCurrency } from "@/components/CurrencyContext";
import PWAInstaller from "@/components/PWA/PWAInstaller";


export default function Header({ enableAutoTranslation = false }) {
  const [scrolled, setScrolled] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [imgError, setImgError] = useState(false);

  const { currency, setCurrency } = useCurrency();

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
          // Sync wallet balance & phone to localStorage for other components
          if (data.user.wallet !== undefined) {
             localStorage.setItem("walletBalance", data.user.wallet.toString());
          }
          if (data.user.phone) {
             localStorage.setItem("phone", data.user.phone);
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

  // ---------------- GOOGLE TRANSLATE ----------------
  useEffect(() => {
    // Only load the script after loading is false, so the div is guaranteed to be in the DOM
    if (enableAutoTranslation && !loading) {
      const scriptId = 'google-translate-script';
      if (!document.getElementById(scriptId)) {
        // Define the global callback function BEFORE appending the script
        window.googleTranslateElementInit = () => {
          new window.google.translate.TranslateElement(
            { 
              pageLanguage: 'en',
              includedLanguages: 'en,hi,bn,te,mr,ta,ur,gu,kn,ml,pa,or,as,mai,bho,sd,ne,ks,sa,doi,gom,brx,mni-Mtei,sat,lus', 
              autoDisplay: false
            },
            'google_translate_element'
          );
        };

        const script = document.createElement('script');
        script.id = scriptId;
        script.type = 'text/javascript';
        script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
        document.head.appendChild(script);
      }
    }
  }, [enableAutoTranslation, loading]);

  return (
    <header
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-200 ${scrolled
        ? "backdrop-blur-xl shadow-lg bg-[var(--card)]/90 border-b border-[var(--border)]"
        : "bg-transparent"
        }`}
    >
      <div className="max-w-6xl mx-auto flex items-center justify-between px-4 h-12">

        {/* LOGO */}
        <Link
          href="/"
          className="flex items-center transition-transform duration-300 hover:scale-105 -ml-4 lg:-ml-8"
        >
          <Image
            src={logo}
            alt="yuji Logo"
            width={100}
            height={30}
            priority
            className="object-contain logo-img"
          />
        </Link>

        {/* DESKTOP NAV */}
        {/* <nav className="hidden md:flex items-center space-x-1 text-[var(--muted)]">
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
        </nav> */}

        {/* RIGHT SIDE */}
        <div className="flex items-center gap-2 sm:gap-2.5 relative ml-auto" ref={dropdownRef}>

          {/* CURRENCY TOGGLE */}
          <button
            onClick={() => setCurrency(currency === "INR" ? "USDT" : "INR")}
            aria-label="Toggle currency"
            title={`Current: ${currency}. Click to switch.`}
            className="h-8 w-8 rounded-full flex items-center justify-center bg-[var(--foreground)]/[0.03] border border-[var(--border)]/50 hover:bg-[var(--accent)]/10 hover:border-[var(--accent)]/30 transition-all font-black text-xs text-[var(--muted)] hover:text-[var(--accent)] active:scale-95 shrink-0"
          >
            {currency === "INR" ? "₹" : "$"}
          </button>

          {/* THEME TOGGLE */}
          <ThemeToggle />

          {/* COMBINED MENU & USER AVATAR BUTTON */}
          <button
            onClick={() => {
              if (loading) return;
              setUserMenuOpen(!userMenuOpen);
            }}
            aria-label="User menu"
            className="h-8 flex items-center gap-1.5 pl-2.5 pr-1 rounded-full bg-[var(--foreground)]/[0.03] border border-[var(--border)]/50 hover:bg-[var(--accent)]/5 hover:border-[var(--accent)]/30 transition-all duration-200 text-[var(--muted)] hover:text-[var(--accent)] active:scale-95 group"
          >
            <Menu size={14} className="transition-transform duration-200 group-hover:scale-110" />
            
            <div className="relative w-6 h-6 rounded-full bg-gradient-to-br from-[var(--accent)] to-[#22d3ee] flex items-center justify-center overflow-hidden transition-all duration-200 ring-1 ring-transparent group-hover:ring-[var(--accent)]/50">
              {!loading && user ? (
                <Image
                  key={imgError ? 'fallback' : 'primary'}
                  src={(!imgError && user.avatar) ? user.avatar : `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || "User")}&background=0D8ABC&color=fff&size=128`}
                  alt="User Avatar"
                  width={40}
                  height={40}
                  className="object-cover w-full h-full"
                  onError={() => setImgError(true)}
                />
              ) : (
                <User className="text-white w-3.5 h-3.5" />
              )}
            </div>
          </button>

          {/* USER DROPDOWN */}
          {/* USER SLIDER (DRAWER) */}
          <AnimatePresence>
            {userMenuOpen && !loading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setUserMenuOpen(false)}
                  className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
                />
            )}
          </AnimatePresence>

          {!loading && (
                <motion.div
                  initial={false}
                  animate={{ x: userMenuOpen ? 0 : "100%" }}
                  transition={{ type: "spring", damping: 25, stiffness: 200 }}
                  className="fixed right-0 top-0 h-screen w-80 sm:w-[340px] max-w-[90vw] bg-[var(--card)]/95 backdrop-blur-2xl border-l border-[var(--border)] shadow-2xl z-[101] flex flex-col pt-1"
                >
                  {/* Top Bar / Close & Logout Buttons */}
                  <div className="flex items-center justify-between px-4 py-2.5 border-b border-[var(--border)]/60">
                    <span className="text-[10px] font-black uppercase tracking-widest text-[var(--muted)]">Account</span>
                    <div className="flex items-center gap-1.5">
                      {user && (
                        <button
                          onClick={handleLogout}
                          title="Sign Out"
                          aria-label="Sign Out"
                          className="w-7 h-7 flex items-center justify-center rounded-full bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white transition-all duration-200 active:scale-95"
                        >
                          <LogOut size={13} />
                        </button>
                      )}
                      <button 
                        onClick={() => setUserMenuOpen(false)}
                        aria-label="Close drawer"
                        className="w-7 h-7 flex items-center justify-center rounded-full bg-[var(--foreground)]/[0.04] hover:bg-[var(--foreground)]/[0.08] text-[var(--muted)] hover:text-[var(--foreground)] transition-colors active:scale-95"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </div>

                  {!user ? (
                    <div className="flex-1 flex flex-col p-4">
                      <div className="mb-4">
                        <button
                          onClick={() => {
                            setUserMenuOpen(false);
                            window.location.href = `/login?redirect=${encodeURIComponent(window.location.pathname)}`;
                          }}
                          className="flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white rounded-xl font-semibold text-xs tracking-wide transition-all active:scale-98 shadow-sm"
                        >
                          <User size={14} />
                          <span>Sign In / Sign Up</span>
                        </button>
                      </div>

                      <div className="space-y-0.5">
                        <p className="text-[9px] font-bold uppercase tracking-wider text-[var(--muted)]/60 px-2 mb-1.5">Explore</p>
                        {[
                          { href: "/games", label: "All Games", Icon: HiCube },
                          { href: "/region", label: "By Region", Icon: HiGlobeAlt },
                        ].map((item, idx) => (
                          <Link
                            key={idx}
                            href={item.href}
                            className="flex items-center justify-between px-2.5 py-2 rounded-xl transition-all hover:bg-[var(--foreground)]/[0.04] group"
                            onClick={() => setUserMenuOpen(false)}
                          >
                            <div className="flex items-center gap-2.5">
                              <div className="w-7 h-7 rounded-lg bg-[var(--foreground)]/[0.03] border border-[var(--border)]/70 flex items-center justify-center transition-all group-hover:bg-[var(--accent)]/10 group-hover:border-[var(--accent)]/30">
                                <item.Icon size={14} className="text-[var(--muted)] transition-colors group-hover:text-[var(--accent)]" />
                              </div>
                              <span className="font-semibold text-xs text-[var(--foreground)] group-hover:text-[var(--accent)] transition-colors tracking-tight">{item.label}</span>
                            </div>
                            <ChevronRight size={13} className="text-[var(--muted)] opacity-0 -translate-x-1 transition-all group-hover:opacity-100 group-hover:translate-x-0 group-hover:text-[var(--accent)]" />
                          </Link>
                        ))}
                        <PWAInstaller variant="menuItem" onAction={() => setUserMenuOpen(false)} />
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* USER PROFILE HERO CARD */}
                      <div className="px-3 pt-2.5 pb-1">
                        <div className="p-2.5 rounded-2xl bg-[var(--foreground)]/[0.02] border border-[var(--border)]">
                          {/* User Avatar + Name Row */}
                          <div className="flex items-center gap-2.5">
                            <div className="relative flex-shrink-0">
                              <div className="w-9 h-9 rounded-xl bg-[var(--accent)]/15 border border-[var(--accent)]/30 p-0.5 overflow-hidden">
                                <div className="w-full h-full rounded-[0.55rem] bg-[var(--card)] overflow-hidden flex items-center justify-center">
                                  {!loading && user ? (
                                    <Image
                                      key={imgError ? 'fallback-drawer' : 'primary-drawer'}
                                      src={(!imgError && user.avatar) ? user.avatar : `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || "User")}&background=0D8ABC&color=fff&size=128`}
                                      alt={user.name}
                                      width={36}
                                      height={36}
                                      className="object-cover w-full h-full"
                                      onError={() => setImgError(true)}
                                    />
                                  ) : (
                                    <User className="text-[var(--accent)] w-4 h-4" />
                                  )}
                                </div>
                              </div>
                              {user.userType === "owner" && (
                                <div className="absolute -bottom-0.5 -right-0.5 bg-emerald-500 text-white rounded-full p-0.5 border border-[var(--card)]">
                                  <ShieldCheck size={8} />
                                </div>
                              )}
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5">
                                <h3 className="font-bold text-[var(--foreground)] text-[12.5px] tracking-tight truncate leading-tight">
                                  {user.name}
                                </h3>
                                <span className={`px-1.5 py-0.2 rounded text-[7.5px] font-black uppercase tracking-wider ${
                                  user.userType === 'owner' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' :
                                  user.userType === 'admin' ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20' :
                                  user.userType === 'member' ? 'bg-purple-500/10 text-purple-500 border border-purple-500/20' :
                                  'bg-[var(--foreground)]/10 text-[var(--muted)] border border-[var(--border)]'
                                }`}>
                                  {user.userType === 'owner' ? 'Owner' :
                                   user.userType === 'admin' ? 'Reseller' :
                                   user.userType === 'member' ? 'Member' : 'User'}
                                </span>
                              </div>
                              <p className="text-[10px] text-[var(--muted)] truncate mt-0.5">
                                {user.email}
                              </p>
                            </div>
                          </div>

                          {/* Quick Wallet Subcard */}
                          <div className="mt-2 px-2.5 py-1.5 rounded-xl bg-[var(--card)] border border-[var(--border)] flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="w-5 h-5 rounded-md bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                                <Wallet size={11} />
                              </div>
                              <div>
                                <p className="text-[7.5px] font-bold text-[var(--muted)] uppercase tracking-wider leading-none">Balance</p>
                                <p className="text-[11.5px] font-black text-[var(--foreground)] tracking-tight mt-0.5">
                                  ₹{user.wallet?.toFixed(2) || "0.00"}
                                </p>
                              </div>
                            </div>

                            <Link
                              href="/dashboard/wallet"
                              onClick={() => setUserMenuOpen(false)}
                              className="text-[10px] font-bold text-[var(--accent)] hover:text-[var(--accent-hover)] px-2 py-0.5 rounded-lg bg-[var(--accent)]/10 hover:bg-[var(--accent)]/15 transition-colors flex items-center gap-0.5"
                            >
                              <span>Top Up</span>
                              <ChevronRight size={10} />
                            </Link>
                          </div>
                        </div>
                      </div>

                      {/* NAVIGATION LIST */}
                      <div className="flex-1 overflow-y-auto px-3 py-1 space-y-0.5">
                        <p className="text-[9px] font-bold uppercase tracking-wider text-[var(--muted)]/60 px-2 py-1">Navigation</p>
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
                            className="flex items-center justify-between px-2.5 py-1.5 rounded-xl transition-all hover:bg-[var(--foreground)]/[0.04] group"
                            onClick={() => setUserMenuOpen(false)}
                          >
                            <div className="flex items-center gap-2.5">
                              <div className="w-7 h-7 rounded-lg bg-[var(--foreground)]/[0.03] border border-[var(--border)]/70 flex items-center justify-center transition-all group-hover:bg-[var(--accent)]/10 group-hover:border-[var(--accent)]/30">
                                <item.Icon size={14} className="text-[var(--muted)] transition-colors group-hover:text-[var(--accent)]" />
                              </div>
                              <span className="font-semibold text-xs text-[var(--foreground)] group-hover:text-[var(--accent)] transition-colors tracking-tight">{item.label}</span>
                            </div>
                            <ChevronRight size={13} className="text-[var(--muted)] opacity-0 -translate-x-1 transition-all group-hover:opacity-100 group-hover:translate-x-0 group-hover:text-[var(--accent)]" />
                          </Link>
                        ))}

                        <PWAInstaller variant="menuItem" onAction={() => setUserMenuOpen(false)} />

                        {/* ADMIN PANEL (Conditional) */}
                        {user.userType === "owner" && (
                          <div className="pt-1.5">
                            <p className="text-[9px] font-bold uppercase tracking-wider text-emerald-500/70 mb-1 px-2">Management</p>
                            <Link
                              href="/owner-panel"
                              className="flex items-center justify-between px-2.5 py-2 rounded-xl transition-all bg-emerald-500/[0.06] border border-emerald-500/20 hover:bg-emerald-500/10 group"
                              onClick={() => setUserMenuOpen(false)}
                            >
                              <div className="flex items-center gap-2.5">
                                <div className="w-7 h-7 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center transition-all">
                                  <Shield size={14} className="text-emerald-500" />
                                </div>
                                <span className="font-bold text-xs text-emerald-600 dark:text-emerald-400 transition-colors tracking-tight">Admin Panel</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                <ChevronRight size={13} className="text-emerald-500 opacity-70 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                              </div>
                            </Link>
                          </div>
                        )}
                      </div>

                      {/* SLIM FOOTER */}
                      <div className="py-2.5 px-4 border-t border-[var(--border)]/60 text-center">
                        <p className="text-[8.5px] font-bold tracking-widest text-[var(--muted)]/40 uppercase">
                          Love from TK
                        </p>
                      </div>
                    </>
                  )}
                </motion.div>
          )}

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
