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
  Search,
  Command,
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

  // ---------------- SEARCH STATE ----------------
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [allGames, setAllGames] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const searchInputRef = useRef(null);
  const mobileSearchInputRef = useRef(null);

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

    // Fetch games for search
    fetch("/api/games")
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setAllGames(data.data.games || []);
        }
      })
      .catch(err => console.error("Search fetch failed", err));
  }, []);

  // ---------------- SEARCH LOGIC ----------------
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = allGames.filter(game => 
      game.gameName.toLowerCase().includes(query) || 
      game.tagId?.tagName?.toLowerCase().includes(query)
    ).slice(0, 5); // Limit to top 5 results

    setSearchResults(filtered);
  }, [searchQuery, allGames]);

  // Keyboard shortcut (Cmd+K)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      if (e.key === "Escape") {
        setIsSearchFocused(false);
        setIsMobileSearchOpen(false);
        setSearchQuery("");
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Auto-focus mobile search
  useEffect(() => {
    if (isMobileSearchOpen) {
      setTimeout(() => mobileSearchInputRef.current?.focus(), 100);
    }
  }, [isMobileSearchOpen]);

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

        {/* MOBILE SEARCH TOGGLE */}
        <div className="flex lg:hidden items-center ml-auto mr-2 sm:mr-2.5">
          <button
            onClick={() => setIsMobileSearchOpen(true)}
            aria-label="Open Search"
            className="h-8 w-8 rounded-full flex items-center justify-center bg-[var(--foreground)]/[0.03] border border-[var(--border)]/50 hover:bg-[var(--accent)]/10 hover:border-[var(--accent)]/30 text-[var(--muted)] hover:text-[var(--accent)] transition-all"
          >
            <Search size={15} />
          </button>
        </div>

        {/* SEARCH BAR (Desktop) */}
        <div className="flex-1 max-w-sm ml-4 mr-12 hidden lg:block relative">
          <div className="relative group">
            <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${isSearchFocused ? "text-[var(--accent)]" : "text-[var(--muted)]"}`} />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
              placeholder="Search games, regions..."
              className="w-full bg-[var(--foreground)]/[0.03] border border-[var(--border)] rounded-2xl py-2 pl-10 pr-12 text-xs focus:outline-none focus:ring-4 focus:ring-[var(--accent)]/10 focus:border-[var(--accent)] transition-all placeholder:text-[var(--muted)]/40 font-bold tracking-tight"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 px-1.5 py-0.5 rounded-md border border-[var(--border)] bg-[var(--card)]/50 pointer-events-none opacity-40">
              <Command size={10} />
              <span className="text-[9px] font-black">K</span>
            </div>
          </div>

          {/* SEARCH RESULTS DROPDOWN */}
          <AnimatePresence>
            {isSearchFocused && searchQuery.trim() !== "" && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute top-full left-0 right-0 mt-3 bg-[var(--card)]/95 backdrop-blur-2xl border border-[var(--border)] rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] overflow-hidden z-[60]"
              >
                <div className="p-2">
                  {searchResults.length > 0 ? (
                    searchResults.map((game) => (
                      <Link
                        key={game.gameSlug}
                        href={`/games/${game.gameSlug}`}
                        className="flex items-center gap-3 p-2.5 rounded-2xl hover:bg-[var(--accent)]/10 group transition-all"
                        onClick={() => {
                          setSearchQuery("");
                          setIsSearchFocused(false);
                        }}
                      >
                        <div className="w-10 h-10 rounded-xl overflow-hidden bg-[var(--foreground)]/[0.03] border border-[var(--border)] group-hover:scale-105 transition-transform">
                          <Image
                            src={game.gameImageId?.image || "/game-placeholder.png"}
                            alt={game.gameName}
                            width={40}
                            height={40}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-xs font-black uppercase tracking-tight text-[var(--foreground)] group-hover:text-[var(--accent)] transition-colors">
                            {game.gameName}
                          </span>
                          <span className="text-[9px] font-bold text-[var(--muted)] uppercase opacity-60">
                            {game.tagId?.tagName || "Global"} • {game.gameFrom}
                          </span>
                        </div>
                      </Link>
                    ))
                  ) : (
                    <div className="py-8 text-center">
                      <Search size={24} className="mx-auto text-[var(--muted)]/20 mb-2" />
                      <p className="text-[10px] font-black uppercase tracking-widest text-[var(--muted)]">No results found</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* RIGHT SIDE */}
        <div className="flex items-center gap-2 sm:gap-2.5 relative" ref={dropdownRef}>
          
          {/* PWA INSTALL / DOWNLOAD BUTTON */}
          <PWAInstaller />

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
                  className="fixed right-0 top-0 h-screen w-72 max-w-[85vw] bg-[var(--card)]/95 backdrop-blur-2xl border-l border-[var(--border)] shadow-2xl z-[101] flex flex-col pt-1"
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

                        {/* ADMIN PANEL (Conditional) */}
                        {user.userType === "owner" && (
                          <div className="pt-1.5">
                            <p className="text-[9px] font-bold uppercase tracking-wider text-emerald-500/70 mb-1 px-2">Management</p>
                            <Link
                              href="/owner-panal"
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

      {/* MOBILE SEARCH OVERLAY */}
      <AnimatePresence>
        {isMobileSearchOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 bg-[var(--background)] z-[200] flex flex-col"
          >
            <div className="flex items-center gap-3 p-4 border-b border-[var(--border)]">
              <button 
                onClick={() => {
                  setIsMobileSearchOpen(false);
                  setSearchQuery("");
                }}
                className="p-2 -ml-2 text-[var(--muted)]"
              >
                <X size={24} />
              </button>
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted)]" />
                <input
                  ref={mobileSearchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search games..."
                  className="w-full bg-[var(--foreground)]/[0.03] border border-[var(--border)] rounded-2xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20 focus:border-[var(--accent)] transition-all font-bold"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {searchQuery.trim() === "" ? (
                <div className="py-12 text-center opacity-40">
                  <Search size={48} className="mx-auto mb-4" />
                  <p className="text-xs font-black uppercase tracking-[0.2em]">Start typing to search</p>
                </div>
              ) : searchResults.length > 0 ? (
                searchResults.map((game) => (
                  <Link
                    key={game.gameSlug}
                    href={`/games/${game.gameSlug}`}
                    className="flex items-center gap-4 p-3 bg-[var(--card)] border border-[var(--border)] rounded-2xl active:scale-[0.98] transition-all"
                    onClick={() => {
                      setSearchQuery("");
                      setIsMobileSearchOpen(false);
                    }}
                  >
                    <div className="w-12 h-12 rounded-xl overflow-hidden border border-[var(--border)]">
                      <Image
                        src={game.gameImageId?.image || "/game-placeholder.png"}
                        alt={game.gameName}
                        width={48}
                        height={48}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-black uppercase italic text-[var(--foreground)]">
                        {game.gameName}
                      </span>
                      <span className="text-[10px] font-bold text-[var(--muted)] uppercase opacity-60">
                        {game.tagId?.tagName || "Global"} • {game.gameFrom}
                      </span>
                    </div>
                    <ChevronRight size={16} className="ml-auto text-[var(--muted)]/30" />
                  </Link>
                ))
              ) : (
                <div className="py-12 text-center opacity-40">
                  <Search size={48} className="mx-auto mb-4" />
                  <p className="text-xs font-black uppercase tracking-[0.2em]">No games found</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
