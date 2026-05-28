"use client";

import { useEffect, useState } from "react";
import {
  FiSearch,
  FiChevronLeft,
  FiChevronRight,
  FiMenu,
  FiX,
} from "react-icons/fi";
import { 
  Users, ShoppingCart, ArrowRightLeft, Wallet, MessageSquare, 
  Image as ImageIcon, Megaphone, Zap, Search, DollarSign, Settings, Monitor 
} from "lucide-react";

import AuthGuard from "@/components/AuthGuard";
import UsersTab from "@/components/admin/UsersTab";
import OrdersTab from "@/components/admin/OrdersTab";
import PricingTab from "@/components/admin/PricingTab";
import TransactionsTab from "@/components/admin/TransactionsTab";
import WalletTransactionsTab from "@/components/admin/WalletTransactionsTab";
import SupportQueriesTab from "@/components/admin/SupportQueriesTab";
import BannersTab from "@/components/admin/BannersTab";
import SettingsTab from "@/components/admin/SettingsTab";
import SeoTab from "@/components/admin/SeoTab";
import PromotionalTab from "@/components/admin/PromotionalTab";
import FlashSaleTab from "@/components/admin/FlashSaleTab";




export default function AdminPanalPage() {
  const [activeTab, setActiveTab] = useState("users");
  const [queries, setQueries] = useState([]);
  const [balance, setBalance] = useState(null);
  const [banners, setBanners] = useState([]);
  const [isOwner, setIsOwner] = useState(false);
  const [checkingRole, setCheckingRole] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const categories = [
    {
      title: "Management",
      items: ["users", "orders", "transactions", "wallet", "queries"],
    },
    {
      title: "Marketing",
      items: ["banners", "promotional", "flash-sale", "seo"],
    },
    {
      title: "Configuration",
      items: ["pricing", "settings", "ui-settings"],
    },
  ];

  const categoryIcons = {
    users: Users,
    orders: ShoppingCart,
    transactions: ArrowRightLeft,
    wallet: Wallet,
    queries: MessageSquare,
    banners: ImageIcon,
    promotional: Megaphone,
    "flash-sale": Zap,
    seo: Search,
    pricing: DollarSign,
    settings: Settings,
    "ui-settings": Monitor
  };

  /* ================= TABLE CONTROLS ================= */
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const limit = 10;

  /* ================= PRICING STATE ================= */
  const [pricingType, setPricingType] = useState("admin");
  const [slabs, setSlabs] = useState([{ min: 0, max: 100, percent: 0 }]);
  const [overrides, setOverrides] = useState([]);
  const [gameOverrides, setGameOverrides] = useState([]);
  const [savingPricing, setSavingPricing] = useState(false);

  /* ================= HELPERS ================= */
  const normalizeSlabs = (list) =>
    [...list].sort((a, b) => a.min - b.min);

  const resetControls = () => {
    setSearch("");
    setPage(1);
  };


  /* ================= FETCH BALANCE ================= */
  const fetchBalance = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/game/balance", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setBalance(data?.balance?.data?.balance ?? data.balance);
      }
    } catch (err) {
      console.error("Balance fetch failed", err);
    }
  };


  const fetchBanners = async () => {
    const token = localStorage.getItem("token");
    const res = await fetch("/api/admin/banners/game-banners", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setBanners(data.data || []);
  };




  /* ================= FETCH PRICING ================= */
  const fetchPricing = async (type) => {
    const token = localStorage.getItem("token");
    const res = await fetch(`/api/admin/pricing?userType=${type}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();

    if (data.success) {
      setSlabs(
        data.data?.slabs?.length
          ? data.data.slabs
          : [{ min: 0, max: 0, percent: 0 }]
      );
      setOverrides(data.data?.overrides || []);
      setGameOverrides(data.data?.gameOverrides || []);
    }
  };

  /* ================= SAVE PRICING ================= */
  const savePricing = async () => {
    try {
      setSavingPricing(true);
      const token = localStorage.getItem("token");

      const res = await fetch("/api/admin/pricing", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userType: pricingType,
          slabs: normalizeSlabs(slabs),
          overrides,
          gameOverrides,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.message || "Failed");
      } else {
        alert("Pricing updated successfully");
      }
    } finally {
      setSavingPricing(false);
    }
  };



  /* ================= EFFECTS ================= */
  useEffect(() => {
    const checkRole = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        window.location.href = "/login";
        return;
      }

      try {
        const res = await fetch("/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.success && data.user.userType === "owner") {
          setIsOwner(true);
          fetchBalance();
        } else {
          window.location.href = "/";
        }
      } catch (err) {
        window.location.href = "/";
      } finally {
        setCheckingRole(false);
      }
    };

    checkRole();
  }, []);

  useEffect(() => {
    resetControls();
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === "banners" && isOwner) fetchBanners();
  }, [activeTab, isOwner]);

  useEffect(() => {
    if (activeTab === "pricing" && isOwner) fetchPricing(pricingType);
  }, [activeTab, pricingType, page, search, isOwner]);

  if (checkingRole) return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--accent)]"></div>
    </div>
  );

  if (!isOwner) return null;

  return (
    <AuthGuard>
      <section className="min-h-screen bg-transparent px-2 py-2">
        <div className="max-w-6xl mx-auto">
          {/* HEADER & BALANCE SECTION */}
          <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Left: Title & Subtitle */}
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h1 className="text-xl md:text-2xl font-extrabold tracking-tight text-[var(--foreground)]">
                  Admin Panel
                </h1>
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)] animate-pulse" />
              </div>
              <p className="mt-0.5 text-xs md:text-sm text-[var(--muted)] max-w-lg leading-snug">
                Manage users, orders, transactions, queries & pricing
              </p>
            </div>

            {/* Right: Actions & Balance */}
            <div className="flex flex-row items-stretch gap-3 w-full md:w-auto">
              {/* Mobile Sidebar Toggle */}
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="md:hidden flex-1 flex flex-col items-center justify-center gap-1 px-4 py-2 bg-[var(--card)] border border-[var(--border)] rounded-xl text-[11px] uppercase tracking-widest font-bold hover:bg-[var(--accent)]/10 hover:border-[var(--accent)]/30 transition-all shadow-sm"
              >
                <FiMenu className="text-lg text-[var(--accent)]" />
                <span>Menu</span>
              </button>

              {/* BALANCE */}
              <div className="flex-[2] md:flex-initial relative rounded-xl border border-[var(--border)] bg-gradient-to-br from-[var(--card)] to-[var(--background)] px-4 py-3 shadow-sm flex flex-col justify-center min-w-[180px]">
                {/* Subtle top accent bar */}
                <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-[var(--accent)] to-purple-500 rounded-t-xl opacity-80" />
                
                <p className="text-[9px] uppercase tracking-widest text-[var(--muted)] font-bold mb-1">
                  Account Balance
                </p>
                <div className="flex items-baseline gap-2">
                  <p className="text-lg font-bold text-[var(--foreground)] leading-none truncate max-w-[120px]">
                    {balance !== null ? balance : "..."}
                  </p>
                  <span className="text-[9px] font-bold text-green-500 uppercase tracking-widest bg-green-500/10 px-1.5 py-0.5 rounded">
                    Available
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row-reverse gap-6 items-start relative">
            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
              <div 
                className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm transition-opacity"
                onClick={() => setIsSidebarOpen(false)}
              />
            )}

            {/* Sidebar Slider */}
            <div className={`
              fixed md:static inset-y-0 right-0 z-50
              w-64 md:w-56 lg:w-64 flex-shrink-0
              bg-[var(--card)] md:bg-transparent
              border-l border-[var(--border)] md:border-none
              transform transition-transform duration-300 ease-in-out
              ${isSidebarOpen ? "translate-x-0" : "translate-x-full md:translate-x-0"}
              h-full md:h-auto overflow-y-auto md:overflow-visible
              p-5 md:p-0 shadow-2xl md:shadow-none
            `}>
              <div className="flex items-center justify-between md:hidden mb-6 pb-4 border-b border-[var(--border)]">
                <span className="font-bold text-lg text-[var(--foreground)]">Admin Menu</span>
                <button onClick={() => setIsSidebarOpen(false)} className="p-2 text-[var(--muted)] hover:text-[var(--foreground)] transition-colors bg-[var(--background)] rounded-full">
                  <FiX className="text-xl" />
                </button>
              </div>

              <div className="space-y-6">
                {categories.map((cat, index) => (
                  <div key={cat.title} className={index !== 0 ? "pt-5 border-t border-[var(--border)]/70" : ""}>
                    <h3 className="text-[10px] font-medium uppercase tracking-widest text-[var(--muted)]/60 mb-3 px-3">
                      {cat.title}
                    </h3>
                    <div className="space-y-1">
                      {cat.items.map((tab) => {
                        const isActive = activeTab === tab;
                        const Icon = categoryIcons[tab];
                        return (
                          <button
                            key={tab}
                            onClick={() => {
                              setActiveTab(tab);
                              setIsSidebarOpen(false); // Close on mobile after selection
                            }}
                            className={`
                              group w-full flex items-center gap-3 px-3 py-2.5
                              rounded-xl text-sm font-medium
                              transition-all duration-200
                              ${isActive
                                ? "bg-[var(--accent)]/10 text-[var(--foreground)]"
                                : "text-[var(--muted)] hover:bg-[var(--foreground)]/[0.03] hover:text-[var(--foreground)]"
                              }
                            `}
                          >
                            {Icon && (
                              <Icon 
                                size={18} 
                                className={`transition-colors ${isActive ? "text-[var(--accent)]" : "text-[var(--muted)] group-hover:text-[var(--foreground)]"}`} 
                              />
                            )}
                            <span className={isActive ? "font-bold" : ""}>
                              {tab.charAt(0).toUpperCase() + tab.slice(1).replace('-', ' ')}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* PANEL */}
            <div className="flex-1 w-full min-w-0 bg-[var(--card)] border border-[var(--border)] rounded-2xl p-3 md:p-5 min-h-[500px]">
            {activeTab === "users" && (
              <UsersTab

              />
            )}

            {activeTab === "orders" && (
              <OrdersTab

              />
            )}

            {activeTab === "transactions" && (
              <TransactionsTab />
            )}

            {activeTab === "wallet" && (
              <WalletTransactionsTab />
            )}


            {activeTab === "queries" && (
              <SupportQueriesTab

              />
            )}
            {activeTab === "banners" && (
              <BannersTab banners={banners} onRefresh={fetchBanners} />
            )}

            {activeTab === "settings" && (
              <SettingsTab />
            )}

            {activeTab === "seo" && (
              <SeoTab />
            )}

            {activeTab === "flash-sale" && (
              <FlashSaleTab />
            )}

            {activeTab === "promotional" && (
              <PromotionalTab />
            )}


            {activeTab === "pricing" && (
              <PricingTab
                pricingType={pricingType}
                setPricingType={setPricingType}
                slabs={slabs}
                setSlabs={setSlabs}
                overrides={overrides}
                setOverrides={setOverrides}
                gameOverrides={gameOverrides}
                setGameOverrides={setGameOverrides}
                savingPricing={savingPricing}
                onSave={savePricing}
              />
            )}
          </div>

          </div>

        </div>
      </section>
    </AuthGuard>
  );
}
