"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  RefreshCcw,
  Clock,
  User as UserIcon,
  IndianRupee,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ChevronRight,
  X,
  Filter,
  CreditCard,
  Hash,
  Loader2,
  Calendar,
  ArrowRightLeft,
  ArrowUpRight,
  ArrowDownLeft,
  Gift,
  Plus,
  Minus,
  Users
} from "lucide-react";

export default function WalletTransactionsTab() {
  const [activeSubTab, setActiveSubTab] = useState("logs"); // "logs" or "balances"
  const [transactions, setTransactions] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("wallet"); // "createdAt" or "wallet"

  const [page, setPage] = useState(1);
  const [limit] = useState(20);

  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    totalPages: 1,
  });

  useEffect(() => {
    if (activeSubTab === "logs") {
      fetchTransactions();
    } else {
      fetchUsers();
    }
  }, [page, limit, activeSubTab, search, sortBy]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const res = await fetch(
        `/api/admin/wallet/transactions?page=${page}&limit=${limit}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();
      setTransactions(data?.data || []);
      setPagination(data?.pagination || { total: 0, page: 1, totalPages: 1 });
    } catch (err) {
      console.error("Wallet Transaction fetch failed", err);
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/admin/users?page=${page}&limit=${limit}&search=${search}&sort=${sortBy}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setUsersList(data?.data || []);
      setPagination(data?.pagination || { total: 0, page: 1, totalPages: 1 });
    } catch (err) {
      console.error("Fetch users failed", err);
      setUsersList([]);
    } finally {
      setLoading(false);
    }
  };

  const typeMeta = {
    topup: { label: "Top Up", class: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20", icon: <ArrowDownLeft size={12} /> },
    spend: { label: "Spent", class: "bg-rose-500/10 text-rose-500 border-rose-500/20", icon: <ArrowUpRight size={12} /> },
    bonus: { label: "Bonus/Adj", class: "bg-amber-500/10 text-amber-500 border-amber-500/20", icon: <Gift size={12} /> },
    refund: { label: "Refund", class: "bg-blue-500/10 text-blue-500 border-blue-500/20", icon: <ArrowDownLeft size={12} /> },
  };

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-[var(--foreground)]">Wallet Management</h2>
          <p className="text-sm text-[var(--muted)] mt-1">Manage balances and view history</p>
        </div>

        <div className="flex items-center gap-2 p-1 rounded-xl bg-[var(--foreground)]/[0.03] border border-[var(--border)]">
          <button
            onClick={() => { setActiveSubTab("logs"); setPage(1); }}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${activeSubTab === "logs" ? "bg-[var(--background)] text-[var(--accent)] shadow-sm" : "text-[var(--muted)] hover:text-[var(--foreground)]"}`}
          >
            History Logs
          </button>
          <button
            onClick={() => { setActiveSubTab("balances"); setPage(1); }}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${activeSubTab === "balances" ? "bg-[var(--background)] text-[var(--accent)] shadow-sm" : "text-[var(--muted)] hover:text-[var(--foreground)]"}`}
          >
            User Balances
          </button>
        </div>
      </div>

      {activeSubTab === "balances" && (
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted)]/40" size={16} />
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search user by name, email or ID..."
              className="w-full h-11 pl-11 pr-4 rounded-xl border border-[var(--border)] bg-[var(--foreground)]/[0.02] text-[var(--foreground)] text-sm focus:border-[var(--accent)]/50 outline-none transition-all placeholder:text-[var(--muted)]/40"
            />
          </div>
          
          <button
            onClick={() => setSortBy(sortBy === "wallet" ? "createdAt" : "wallet")}
            className={`flex items-center gap-2 px-4 h-11 rounded-xl border transition-all text-xs font-bold uppercase tracking-wider ${
              sortBy === "wallet" 
              ? "bg-[var(--accent)]/10 border-[var(--accent)] text-[var(--accent)]" 
              : "border-[var(--border)] bg-[var(--foreground)]/[0.02] text-[var(--muted)] hover:text-[var(--foreground)]"
            }`}
          >
            <ArrowDownLeft size={16} className={sortBy === "wallet" ? "rotate-180" : ""} />
            {sortBy === "wallet" ? "Sorted by Balance" : "Sort by Balance"}
          </button>
        </div>
      )}

      <AnimatePresence mode="wait">
        {loading ? (
          <div className="py-32 flex flex-col items-center justify-center space-y-4">
            <Loader2 className="animate-spin text-[var(--accent)]" size={32} />
            <p className="text-[10px] font-bold text-[var(--muted)]/40 uppercase tracking-[0.2em]">Loading data</p>
          </div>
        ) : activeSubTab === "logs" ? (
          <LogsView transactions={transactions} typeMeta={typeMeta} />
        ) : (
          <BalancesView users={usersList} onRefresh={fetchUsers} />
        )}
      </AnimatePresence>

      {/* PAGINATION (Shared) */}
      {!loading && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between pt-6 border-t border-[var(--border)]">
          <p className="text-[10px] font-bold text-[var(--muted)]/40 uppercase">
            Page <b className="text-[var(--foreground)]">{pagination.page}</b> / {pagination.totalPages}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-5 py-2.5 rounded-xl border border-[var(--border)] text-[10px] font-bold uppercase text-[var(--muted)]/60 hover:text-[var(--foreground)] hover:bg-[var(--foreground)]/[0.05] disabled:opacity-20 transition-all"
            >
              Previous
            </button>
            <button
              onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
              disabled={page === pagination.totalPages}
              className="px-5 py-2.5 rounded-xl border border-[var(--border)] text-[10px] font-bold uppercase text-[var(--muted)]/60 hover:text-[var(--foreground)] hover:bg-[var(--foreground)]/[0.05] disabled:opacity-20 transition-all"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function LogsView({ transactions, typeMeta }) {
  return (
    <div className="rounded-[1.5rem] overflow-hidden border border-[var(--border)] bg-[var(--card)]">
      <table className="w-full text-left text-sm">
        <thead className="bg-[var(--foreground)]/[0.03] border-b border-[var(--border)]">
          <tr className="text-[10px] uppercase font-bold tracking-widest text-[var(--muted)]">
            <th className="px-6 py-4">Date</th>
            <th className="px-6 py-4">TX ID</th>
            <th className="px-6 py-4">User</th>
            <th className="px-6 py-4">Type</th>
            <th className="px-6 py-4 text-right">Amount</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--border)]">
          {transactions.map((t) => {
            const meta = typeMeta[t.type] || { label: t.type, class: "", icon: null };
            return (
              <tr key={t._id} className="group hover:bg-[var(--foreground)]/[0.02] transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex flex-col">
                    <span className="text-[var(--foreground)] font-medium text-xs">{new Date(t.createdAt).toLocaleDateString()}</span>
                    <span className="text-[10px] text-[var(--muted)]/40">{new Date(t.createdAt).toLocaleTimeString()}</span>
                  </div>
                </td>
                <td className="px-6 py-4"><span className="font-mono text-[10px] text-[var(--accent)] uppercase">{t.transactionId}</span></td>
                <td className="px-6 py-4 font-mono text-[10px] text-[var(--foreground)]">{t.userId}</td>
                <td className="px-6 py-4">
                   <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg border text-[9px] font-bold uppercase tracking-wider ${meta.class}`}>
                    {meta.icon} {meta.label}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                   <span className={`text-sm font-black tracking-tighter tabular-nums ${t.type === 'spend' ? 'text-rose-500' : 'text-emerald-500'}`}>
                    {t.type === 'spend' ? '-' : '+'} ₹{t.amount.toFixed(2)}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {!transactions.length && (
         <div className="py-20 text-center">
           <Hash className="mx-auto text-[var(--muted)]/20 mb-4" size={48} />
           <p className="text-[10px] font-bold text-[var(--muted)]/40 uppercase tracking-[0.2em]">No records found</p>
         </div>
      )}
    </div>
  );
}

function BalancesView({ users, onRefresh }) {
  const [selectedUser, setSelectedUser] = useState(null);

  return (
    <div className="space-y-4">
      <div className="rounded-[1.5rem] overflow-hidden border border-[var(--border)] bg-[var(--card)]">
        <table className="w-full text-left text-sm">
          <thead className="bg-[var(--foreground)]/[0.03] border-b border-[var(--border)]">
            <tr className="text-[10px] uppercase font-bold tracking-widest text-[var(--muted)]">
              <th className="px-6 py-4">Member Info</th>
              <th className="px-6 py-4">Wallet Balance</th>
              <th className="px-6 py-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]">
            {users.map((u) => (
              <tr key={u._id} className="group hover:bg-[var(--foreground)]/[0.02] transition-colors">
                <td className="px-6 py-4">
                   <div className="flex flex-col">
                     <span className="text-[var(--foreground)] font-bold text-xs uppercase tracking-tight">{u.name}</span>
                     <span className="text-[10px] text-[var(--muted)]/50 font-mono italic">{u.userId}</span>
                   </div>
                </td>
                <td className="px-6 py-4">
                   <span className="text-emerald-500 font-black text-sm tabular-nums tracking-tighter italic">₹{u.wallet?.toFixed(2) || "0.00"}</span>
                </td>
                <td className="px-6 py-4 text-right">
                   <button
                    onClick={() => setSelectedUser(u)}
                    className="px-3 py-1.5 rounded-lg border border-[var(--border)] bg-[var(--foreground)]/[0.02] text-[10px] font-bold uppercase hover:bg-[var(--foreground)]/[0.05] transition-all"
                   >
                     Manage
                   </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!users.length && (
          <div className="py-20 text-center">
            <Users className="mx-auto text-[var(--muted)]/20 mb-4" size={48} />
            <p className="text-[10px] font-bold text-[var(--muted)]/40 uppercase tracking-[0.2em]">No users found</p>
          </div>
        )}
      </div>

      <AnimatePresence>
        {selectedUser && (
          <div className="fixed inset-0 z-[1200] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedUser(null)} className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative bg-[var(--background)] border border-[var(--border)] rounded-[2rem] p-8 w-full max-w-md shadow-2xl">
               <div className="flex justify-between items-start mb-6">
                 <div>
                   <h3 className="text-xl font-bold text-[var(--foreground)]">Balance Control</h3>
                   <p className="text-xs text-[var(--muted)] mt-1">{selectedUser.name} ({selectedUser.userId})</p>
                 </div>
                 <button onClick={() => setSelectedUser(null)} className="w-8 h-8 rounded-full bg-[var(--foreground)]/[0.05] flex items-center justify-center text-[var(--muted)] hover:text-[var(--foreground)]"><X size={18} /></button>
               </div>

               <div className="mb-6 p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-bold text-emerald-500/60 uppercase tracking-widest leading-none">Current Balance</p>
                    <p className="text-2xl font-black text-emerald-500 tabular-nums mt-1">₹{selectedUser.wallet?.toFixed(2) || "0.00"}</p>
                  </div>
               </div>

               <BalanceAdjustorComponent 
                userId={selectedUser.userId} 
                onSuccess={(newBal) => {
                  setSelectedUser({ ...selectedUser, wallet: newBal });
                  onRefresh();
                }} 
               />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function BalanceAdjustorComponent({ userId, onSuccess }) {
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAdjust = async (action) => {
    if (!amount || isNaN(amount) || Number(amount) <= 0) {
      alert("Please enter a valid positive amount");
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await fetch("/api/admin/users/adjust-balance", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ userId, amount: Number(amount), action, description }),
      });
      const data = await res.json();
      if (data.success) {
        setAmount(""); setDescription("");
        onSuccess(data.newBalance);
      } else {
        alert(data.message || "Failed to adjust balance");
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-[var(--muted)] uppercase ml-1">Adjustment Amount (₹)</label>
          <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" className="w-full h-12 px-4 rounded-xl border border-[var(--border)] bg-[var(--foreground)]/[0.03] text-[var(--foreground)] font-bold outline-none focus:border-emerald-500/50 transition-all" />
        </div>
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-[var(--muted)] uppercase ml-1">Optional Reason</label>
          <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Bonus, Refund, etc." className="w-full h-12 px-4 rounded-xl border border-[var(--border)] bg-[var(--foreground)]/[0.03] text-[var(--foreground)] outline-none focus:border-[var(--accent)]/50 transition-all text-sm" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 pt-2">
        <button onClick={() => handleAdjust("add")} disabled={loading} className="h-12 rounded-xl bg-emerald-500 text-white flex items-center justify-center gap-2 font-black text-xs shadow-lg shadow-emerald-500/20 active:scale-95 transition-all disabled:opacity-50"><Plus size={16} /> Add Funds</button>
        <button onClick={() => handleAdjust("remove")} disabled={loading} className="h-12 rounded-xl bg-rose-500 text-white flex items-center justify-center gap-2 font-black text-xs shadow-lg shadow-rose-500/20 active:scale-95 transition-all disabled:opacity-50"><Minus size={16} /> Deduct Funds</button>
      </div>
    </div>
  );
}
