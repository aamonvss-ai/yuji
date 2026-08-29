"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Filter,
  RefreshCw,
  ShoppingBag,
  History,
  LayoutGrid,
  X,
  Check
} from "lucide-react";
import OrderItem, { OrderType } from "./OrderItem";
import { motion, AnimatePresence } from "framer-motion";

export default function OrdersTab() {
  const [orders, setOrders] = useState<OrderType[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showFilter, setShowFilter] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setMounted(true);
  }, []);

  const totalPages = Math.ceil(totalCount / limit);
  const activeFilterCount = statusFilter !== "all" ? 1 : 0;

  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("token")
      : null;

  /* ================= LOAD ORDERS ================= */
  const fetchOrders = async () => {
    if (!token) return;
    setLoading(true);

    try {
      const res = await fetch("/api/order/user", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          page,
          limit,
          search,
          status: statusFilter === "all" ? undefined : statusFilter
        }),
      });
      const data = await res.json();
      if (data.success) {
        setOrders(data.orders || []);
        setTotalCount(data.totalCount || 0);
      }
    } catch (error) {
      console.error("Failed to fetch orders:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [token, page, search, statusFilter]);

  /* ================= RESET PAGE ON SEARCH/FILTER ================= */
  useEffect(() => {
    setPage(1);
  }, [search, statusFilter]);

  const getPageNumbers = () => {
    const pages: number[] = [];
    const start = Math.max(1, page - 1);
    const end = Math.min(totalPages, page + 1);
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  const statusOptions = [
    { label: "All Orders", value: "all", desc: "Show all transactions" },
    { label: "Success / Delivered", value: "success", desc: "Completed top-ups" },
    { label: "Pending", value: "pending", desc: "Awaiting gateway / processing" },
    { label: "Failed", value: "failed", desc: "Unsuccessful transactions" },
    { label: "Refunded", value: "refunded", desc: "Refunded to wallet/source" },
  ];

  return (
    <div className="max-w-full mx-auto space-y-4 px-0.5">
      {/* MINIMAL HEADER */}
      <div className="flex items-center justify-between px-1">
        <div>
          <h2 className="text-base sm:text-lg font-bold tracking-tight text-[var(--foreground)] flex items-center gap-2">
            <div className="w-1.5 h-4 bg-[var(--accent)] rounded-full" />
            My Orders
          </h2>
          <p className="text-[9.5px] text-[var(--muted)] font-medium mt-0.5">
            {loading ? "Loading orders..." : `${totalCount} total orders`}
          </p>
        </div>
 
        <button
          onClick={fetchOrders}
          disabled={loading}
          title="Refresh orders"
          className="w-7 h-7 rounded-lg bg-[var(--card)]/40 border border-[var(--border)]
                     text-[var(--muted)] hover:text-[var(--foreground)] hover:border-[var(--accent)]/40 flex items-center justify-center shadow-xs transition-all shrink-0 disabled:opacity-50"
        >
          <RefreshCw size={13} className={loading ? "animate-spin text-[var(--accent)]" : "transition-transform active:rotate-180"} />
        </button>
      </div>

      {/* SEARCH WITH NESTED FILTER ICON BUTTON */}
      <div className="relative flex items-center group">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)] group-focus-within:text-[var(--accent)] transition-colors pointer-events-none" size={13} />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search Order ID, Player ID..."
          className="w-full pl-9 pr-14 py-2 rounded-lg border border-[var(--border)] bg-[var(--card)]/40 text-xs font-medium focus:outline-none focus:border-[var(--accent)] transition-all text-[var(--foreground)] placeholder:text-[var(--muted)]/50 shadow-xs"
        />
        <div className="absolute right-1.5 flex items-center gap-1">
          {search && (
            <button
              onClick={() => setSearch("")}
              className="p-1 rounded-md text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
            >
              <X size={12} />
            </button>
          )}
          <button
            onClick={() => setShowFilter(true)}
            className={`relative w-7 h-7 flex items-center justify-center rounded-md transition-all shrink-0 ${
              activeFilterCount > 0
                ? "bg-[var(--accent)] text-white shadow-xs"
                : "bg-[var(--foreground)]/[0.04] hover:bg-[var(--foreground)]/[0.08] text-[var(--muted)] hover:text-[var(--foreground)] border border-[var(--border)]"
            }`}
            title="Filter by status"
          >
            <Filter size={12} className={activeFilterCount > 0 ? "text-white" : "text-[var(--foreground)]"} />
            {activeFilterCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-[var(--card)]" />
            )}
          </button>
        </div>
      </div>

      {/* FILTER MODAL (PORTAL) */}
      {mounted &&
        createPortal(
          <AnimatePresence>
            {showFilter && (
              <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setShowFilter(false)}
                  className="fixed inset-0 bg-black/70 backdrop-blur-xs"
                />
                <motion.div
                  initial={{ scale: 0.95, opacity: 0, y: 10 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.95, opacity: 0, y: 10 }}
                  transition={{ type: "spring", damping: 25, stiffness: 300 }}
                  className="relative w-full max-w-sm bg-[var(--card)] border border-[var(--border)] rounded-xl p-4 shadow-2xl z-10 space-y-3.5"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center justify-between border-b border-[var(--border)] pb-2.5">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-[var(--foreground)]">
                      <Filter size={13} className="text-[var(--accent)]" />
                      <span>Filter Orders</span>
                    </div>
                    <button
                      onClick={() => setShowFilter(false)}
                      className="w-6 h-6 rounded-md flex items-center justify-center text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--foreground)]/5 transition-colors"
                    >
                      <X size={14} />
                    </button>
                  </div>

                  <div className="space-y-1.5">
                    <p className="text-[9px] font-bold uppercase tracking-wider text-[var(--muted)] px-0.5">Order Status</p>
                    <div className="grid grid-cols-1 gap-1">
                      {statusOptions.map((opt) => {
                        const isSelected = statusFilter === opt.value;
                        return (
                          <button
                            key={opt.value}
                            onClick={() => {
                              setStatusFilter(opt.value);
                              setShowFilter(false);
                            }}
                            className={`w-full p-2.5 rounded-lg border text-left flex items-center justify-between transition-all ${
                              isSelected
                                ? "bg-[var(--accent)]/10 border-[var(--accent)] text-[var(--foreground)]"
                                : "bg-[var(--foreground)]/[0.02] border-[var(--border)] text-[var(--foreground)] hover:bg-[var(--foreground)]/[0.05]"
                            }`}
                          >
                            <div>
                              <p className="text-[11px] font-bold leading-tight">{opt.label}</p>
                              <p className="text-[8.5px] text-[var(--muted)] mt-0.5">{opt.desc}</p>
                            </div>
                            {isSelected && (
                              <div className="w-4 h-4 rounded-full bg-[var(--accent)] text-white flex items-center justify-center shrink-0">
                                <Check size={10} />
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {statusFilter !== "all" && (
                    <div className="pt-1">
                      <button
                        onClick={() => {
                          setStatusFilter("all");
                          setShowFilter(false);
                        }}
                        className="w-full py-2 rounded-lg border border-[var(--border)] hover:border-rose-500/30 text-rose-500 hover:bg-rose-500/5 text-[10px] font-bold uppercase tracking-wider transition-colors"
                      >
                        Reset Filter
                      </button>
                    </div>
                  )}
                </motion.div>
              </div>
            )}
          </AnimatePresence>,
          document.body
        )}

      {/* ORDERS LIST */}
      <div className="relative min-h-[300px]">
        {loading && orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-10 h-10 border-2 border-[var(--accent)]/20 border-t-[var(--accent)] rounded-full animate-spin mb-4" />
            <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-widest">Loading orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16 rounded-[1.5rem] border border-dashed border-[var(--border)] bg-[var(--card)]/20 backdrop-blur-sm"
          >
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[var(--card)] text-[var(--muted)]/40 mb-3 border border-[var(--border)]">
              <Filter size={20} />
            </div>
            <h3 className="text-lg font-black uppercase italic">No Orders</h3>
            <p className="text-[10px] text-[var(--muted)] font-bold uppercase tracking-widest mt-1">Try a different search or filter</p>
            <button
              onClick={() => { setSearch(""); setStatusFilter("all"); }}
              className="mt-5 px-5 py-2 rounded-lg bg-[var(--accent)]/10 text-[var(--accent)] text-[10px] font-black uppercase tracking-widest hover:bg-[var(--accent)] transition-all hover:text-white"
            >
              Clear Filters
            </button>
          </motion.div>
        ) : (
          <div className="space-y-2.5">
            <AnimatePresence mode="popLayout">
              {orders.map((order, idx) => (
                <motion.div
                  key={order.orderId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: idx * 0.05, duration: 0.3 }}
                >
                  <OrderItem order={order} />
                </motion.div>
              ))}
            </AnimatePresence>

            {/* PAGINATION */}
            {totalPages > 1 && (
              <div className="mt-10 flex flex-col md:flex-row justify-between items-center gap-6 py-6 border-t border-[var(--border)]/50">
                <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-widest">
                  Showing <span className="text-[var(--foreground)]">{(page - 1) * limit + 1}</span> - <span className="text-[var(--foreground)]">{Math.min(page * limit, totalCount)}</span> <span className="opacity-30">/</span> {totalCount}
                </p>

                <div className="flex items-center gap-2">
                  <button
                    disabled={page === 1}
                    onClick={() => setPage((p) => p - 1)}
                    className="p-2 rounded-lg border border-[var(--border)] bg-[var(--card)]/50
                               disabled:opacity-20 hover:border-[var(--accent)]/50 hover:text-[var(--accent)] transition-all active:scale-90"
                  >
                    <ChevronLeft size={18} />
                  </button>

                  <div className="flex items-center gap-1.5">
                    {getPageNumbers().map((p) => (
                      <button
                        key={p}
                        onClick={() => setPage(p)}
                        className={`min-w-[36px] h-[36px] rounded-lg text-xs font-black border transition-all
                          ${p === page
                            ? "bg-[var(--accent)] text-white border-[var(--accent)] shadow-lg shadow-[var(--accent)]/20"
                            : "border-[var(--border)] bg-[var(--card)]/50 text-[var(--muted)] hover:border-[var(--muted)]"
                          }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>

                  <button
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => p + 1)}
                    className="p-2 rounded-lg border border-[var(--border)] bg-[var(--card)]/50
                               disabled:opacity-20 hover:border-[var(--accent)]/50 hover:text-[var(--accent)] transition-all active:scale-90"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
