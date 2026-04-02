"use client";

import { useEffect, useState } from "react";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Filter,
  RefreshCw,
  ShoppingBag,
  History,
  LayoutGrid
} from "lucide-react";
import OrderItem, { OrderType } from "./OrderItem";
import { motion, AnimatePresence } from "framer-motion";

export default function OrdersTab() {
  const [orders, setOrders] = useState<OrderType[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const totalPages = Math.ceil(totalCount / limit);

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
    { label: "All", value: "all" },
    { label: "Success", value: "success" },
    { label: "Pending", value: "pending" },
    { label: "Failed", value: "failed" },
    { label: "Refunded", value: "refunded" },
  ];

  return (
    <div className="space-y-6">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[var(--accent)] flex items-center justify-center text-white shadow-lg shadow-[var(--accent)]/20">
            <History size={18} />
          </div>
          <div>
            <h2 className="text-xl font-black uppercase tracking-tighter italic">My <span className="text-[var(--accent)]">Orders</span></h2>
            <p className="text-[10px] text-[var(--muted)] font-black uppercase tracking-widest opacity-80 mt-0.5">
              {loading ? "Loading..." : `${totalCount} orders found`}
            </p>
          </div>
        </div>
 
        <motion.button
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
          onClick={fetchOrders}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--card)] border border-[var(--border)]
                     text-[var(--foreground)] font-black text-[9px] uppercase tracking-widest shadow-sm hover:border-[var(--accent)]/50 transition-all active:scale-95 group"
        >
          <RefreshCw size={12} className={`transition-transform duration-700 ${loading ? "animate-spin" : "group-hover:rotate-180"}`} />
          <span>Refresh List</span>
        </motion.button>
      </div>

      {/* FILTERS & SEARCH */}
      <div className="flex flex-col lg:flex-row gap-4">
        {/* SEARCH */}
        <div className="flex-1 relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted)]/50 group-focus-within:text-[var(--accent)] transition-colors" size={16} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search Order ID, Item, or ID..."
            className="w-full pl-12 pr-4 py-3 rounded-xl
                       border border-[var(--border)]
                       bg-[var(--card)]/40 backdrop-blur-sm
                       focus:ring-2 focus:ring-[var(--accent)]/20
                       focus:border-[var(--accent)]/50
                       text-sm font-medium outline-none transition-all shadow-inner"
          />
        </div>

        {/* STATUS FILTER */}
        <div className="flex gap-1.5 p-1 rounded-xl bg-[var(--card)]/30 border border-[var(--border)] overflow-x-auto scrollbar-hide">
          {statusOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setStatusFilter(opt.value)}
              className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all
                ${statusFilter === opt.value
                  ? "bg-[var(--accent)] text-white shadow-lg shadow-[var(--accent)]/20 scale-[1.02]"
                  : "text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-black/5"
                }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* ORDERS LIST */}
      <div className="relative min-h-[300px]">
        {loading && orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-10 h-10 border-2 border-[var(--accent)]/20 border-t-[var(--accent)] rounded-full animate-spin mb-4" />
            <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-widest">Querying Orders...</p>
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
            <h3 className="text-lg font-black uppercase italic">No Orders Found</h3>
            <p className="text-[10px] text-[var(--muted)] font-bold uppercase tracking-widest mt-1">Try changing your search or filters</p>
            <button
              onClick={() => { setSearch(""); setStatusFilter("all"); }}
              className="mt-5 px-5 py-2 rounded-lg bg-[var(--accent)]/10 text-[var(--accent)] text-[10px] font-black uppercase tracking-widest hover:bg-[var(--accent)] transition-all hover:text-white"
            >
              Clear Filters
            </button>
          </motion.div>
        ) : (
          <div className="space-y-4">
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
