"use client";

import { useState, useEffect } from "react";
import { FaWallet, FaGooglePay, FaBitcoin } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { FiPlus, FiArrowRight, FiCheckCircle } from "react-icons/fi";
import { History } from "lucide-react";


interface WalletTabProps {
  walletBalance: number;
  setWalletBalance: (balance: number) => void;
}

export default function WalletTab({
  walletBalance,
  setWalletBalance,
}: WalletTabProps) {
  const [amount, setAmount] = useState("");
  const [amountError, setAmountError] = useState("");
  const [method, setMethod] = useState("upi");
  const [loading, setLoading] = useState(false);
  const [storedPhone, setStoredPhone] = useState("");
  const [storedEmail, setStoredEmail] = useState("");
  const [transactions, setTransactions] = useState<any[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);

  const quickAmounts = ["100", "500", "1000", "2000", "5000"];

  useEffect(() => {
    const phone = localStorage.getItem("phone");
    const email = localStorage.getItem("email");
    if (phone) setStoredPhone(phone);
    if (email) setStoredEmail(email);
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const res = await fetch("/api/wallet/transactions", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setTransactions(data.transactions);
      }
    } catch (err) {
      console.error("Failed to fetch transactions", err);
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleProceed = async () => {

    if (!amount || Number(amount) < 1) {
      setAmountError("Amount must be at least ₹1");
      return;
    }

    if (!method) {
      alert("Please choose a payment method");
      return;
    }

    // Removed mandatory phone check as requested by user

    setLoading(true);
    const userId = localStorage.getItem("userId");

    try {
      const res = await fetch("/api/wallet/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: Number(amount),
          mobile: storedPhone || "0000000000", // Fallback for gateway
          email: storedEmail,
          userId,
        }),
      });

      const data = await res.json();
      setLoading(false);

      if (!data.success) {
        alert(data.message);
        return;
      }

      localStorage.setItem("pending_order", data.orderId);
      window.location.href = data.paymentUrl;
    } catch (err) {
      setLoading(false);
      alert("Could not create order");
    }
  };

  return (
    <div className="max-w-full mx-auto space-y-5 px-1">
      {/* ================= HEADER ================= */}
      <div className="flex items-center justify-between px-1">
        <h2 className="text-xl font-black uppercase tracking-tighter italic flex items-center gap-3">
          <div className="w-1.5 h-6 bg-[var(--accent)] rounded-full" />
          My Wallet
        </h2>
        <div className="hidden md:flex items-center gap-2 text-[9px] font-black text-[var(--accent)] uppercase tracking-widest bg-[var(--accent)]/5 px-3 py-1.5 rounded-full border border-[var(--accent)]/10">
          <FiCheckCircle size={10} /> Safe & Secure Payments
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* ================= LEFT SIDE: BALANCE & QUICK ADD ================= */}
        <div className="lg:col-span-5 space-y-5">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden p-6 rounded-[2rem] bg-gradient-to-br from-[var(--accent)] to-[#4f46e5] text-white shadow-xl"
          >
            <div className="relative z-10">
              <p className="text-[9px] font-black opacity-60 uppercase tracking-[0.2em] italic">Current Balance</p>
              <h3 className="text-3xl md:text-4xl font-black mt-1 tracking-tighter italic">
                ₹{walletBalance.toLocaleString("en-IN")}
              </h3>
              <div className="mt-6 flex items-center gap-2 text-[8px] font-black bg-white/10 w-fit px-3 py-1 rounded-full backdrop-blur-md border border-white/10">
                <div className="w-1.5 h-1.5 rounded-full bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.5)]" />
                ACTIVE WALLET
              </div>
            </div>
            {/* Decals */}
            <div className="absolute top-0 right-0 -mr-12 -mt-12 w-40 h-40 bg-white/5 rounded-full blur-3xl" />
          </motion.div>

          <div className="p-5 rounded-3xl bg-[var(--card)]/30 border border-[var(--border)] space-y-3">
            <p className="text-[9px] font-black text-[var(--muted)] uppercase tracking-widest opacity-40 italic">Quick Top-up</p>
            <div className="grid grid-cols-3 gap-2">
              {quickAmounts.map((amt) => (
                <button
                  key={amt}
                  onClick={() => setAmount(amt)}
                  className={`py-2 rounded-xl text-[10px] font-black transition-all border
                    ${amount === amt
                      ? "bg-[var(--accent)] text-black border-[var(--accent)] shadow-lg shadow-[var(--accent)]/20"
                      : "bg-[var(--foreground)]/[0.03] border-transparent text-[var(--foreground)] hover:border-[var(--accent)]/30"}`}
                >
                  +₹{amt}
                </button>
              ))}
            </div>
          </div>
        </div>
        {/* ================= RIGHT SIDE: INPUT & METHODS ================= */}
        <div className="lg:col-span-7 space-y-5">
          <div className="p-6 rounded-[2rem] bg-[var(--card)]/30 backdrop-blur-md border border-[var(--border)] shadow-xl space-y-6">
            {/* Amount Input */}
            <div>
              <label className="text-[9px] font-black text-[var(--muted)] uppercase tracking-[0.2em] block mb-2 italic opacity-40">
                Custom Amount
              </label>
              <div className="relative group">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-black text-[var(--muted)] group-focus-within:text-[var(--accent)] transition-colors italic">₹</span>
                <input
                  type="number"
                  value={amount}
                  placeholder="0.00"
                  onChange={(e) => {
                    setAmount(e.target.value);
                    setAmountError("");
                  }}
                  className="w-full pl-10 pr-4 py-3.5 rounded-xl
                             bg-[var(--foreground)]/[0.03] border border-transparent
                             text-xl font-black italic tracking-tighter focus:bg-[var(--card)]
                             focus:border-[var(--accent)]/20 outline-none transition-all shadow-inner"
                />
              </div>
              <AnimatePresence>
                {amountError && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="text-red-500 text-[10px] font-bold mt-2 flex items-center gap-1"
                  >
                    ● {amountError}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            {/* Methods */}
            <div>
              <label className="text-[9px] font-black text-[var(--muted)] uppercase tracking-[0.2em] block mb-2 italic opacity-40">
                Payment Gateway
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setMethod("upi")}
                  className={`p-4 rounded-xl border-2 transition-all flex items-center gap-3
                    ${method === "upi"
                      ? "border-[var(--accent)] bg-[var(--accent)]/5"
                      : "border-transparent bg-[var(--foreground)]/[0.03] hover:border-[var(--accent)]/20"}`}
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${method === "upi" ? "bg-[var(--accent)] text-black rotate-[-6deg]" : "bg-[var(--card)] text-[var(--muted)] border border-[var(--border)]"}`}>
                    <FaGooglePay size={20} />
                  </div>
                  <div className="text-left">
                    <p className="text-[11px] font-black uppercase italic tracking-tight">UPI / QR</p>
                    <p className="text-[8px] font-bold opacity-30 uppercase tracking-widest">Instant</p>
                  </div>
                </button>

                <button
                  disabled
                  className="p-4 rounded-xl border-2 border-transparent bg-[var(--foreground)]/[0.01] opacity-30 cursor-not-allowed flex items-center gap-3"
                >
                  <div className="w-10 h-10 rounded-lg bg-[var(--card)] text-[var(--muted)] border border-[var(--border)] flex items-center justify-center">
                    <FaBitcoin size={20} />
                  </div>
                  <div className="text-left">
                    <p className="text-[11px] font-black uppercase italic tracking-tight opacity-40">Crypto</p>
                    <p className="text-[8px] font-bold opacity-20 uppercase tracking-widest">Disabled</p>
                  </div>
                </button>
              </div>
            </div>

            {/* CTA */}
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={handleProceed}
              disabled={loading || !amount || Number(amount) < 1}
              className="w-full py-4 rounded-xl bg-[var(--accent)] text-black font-black text-[11px] uppercase tracking-[0.3em] italic
                         shadow-lg shadow-[var(--accent)]/20 hover:brightness-110
                         transition-all flex items-center justify-center gap-3 disabled:opacity-30 disabled:grayscale"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
              ) : (
                <>
                  Top-up Now <FiArrowRight size={14} />
                </>
              )}
            </motion.button>
          </div>
        </div>
      </div>
      {/* ================= TRANSACTION HISTORY ================= */}
      <div className="p-3 rounded-[1.5rem] bg-[var(--card)]/20 backdrop-blur-md border border-[var(--border)] shadow-xl space-y-3">
        <div className="flex items-center justify-between px-1.5">
          <h3 className="text-sm font-black uppercase tracking-tight italic">History</h3>
          <button 
            onClick={fetchTransactions}
            className="text-[9px] font-black uppercase tracking-widest text-[var(--accent)] hover:underline italic"
          >
            Refresh
          </button>
        </div>

        {historyLoading ? (
          <div className="flex flex-col items-center py-8 gap-3">
            <div className="w-6 h-6 border-2 border-[var(--accent)]/30 border-t-[var(--accent)] rounded-full animate-spin" />
            <p className="text-[9px] font-bold text-[var(--muted)] uppercase tracking-widest">Updating...</p>
          </div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-8 space-y-2">
            <div className="mx-auto w-10 h-10 rounded-xl bg-[var(--foreground)]/[0.03] flex items-center justify-center text-[var(--muted)] opacity-30">
               <History size={18} />
            </div>
            <p className="text-[10px] font-black text-[var(--muted)] uppercase opacity-30 tracking-widest italic">No activity yet</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)]/40">
            <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-[8px] font-black uppercase tracking-[0.2em] text-[var(--muted)] bg-[var(--foreground)]/[0.03] border-b border-[var(--border)]">
                  <th className="py-2.5 px-2 italic">Activity</th>
                  <th className="py-2.5 px-2 italic">Amount</th>
                  <th className="py-2.5 px-2 italic">Ref</th>
                  <th className="py-2.5 px-2 italic">Date</th>
                  <th className="py-2.5 px-2 text-right italic">Result</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]/30">
                {transactions.map((tx) => (
                  <tr key={tx._id} className="group hover:bg-[var(--accent)]/[0.03] transition-colors">
                    <td className="py-2.5 px-2">
                       <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded border ${
                        tx.type === "topup" ? "bg-green-500/10 text-green-500 border-green-500/20" :
                        tx.type === "spend" ? "bg-blue-500/10 text-blue-500 border-blue-500/20" :
                        "bg-orange-500/10 text-orange-500 border-orange-500/20"
                      }`}>
                        {tx.type}
                      </span>
                    </td>
                    <td className="py-2.5 px-2">
                      <span className={`text-xs font-black italic tracking-tighter ${tx.type === "topup" ? "text-green-500" : "text-[var(--foreground)]"}`}>
                        {tx.type === "topup" ? "+" : "-"}₹{tx.amount}
                      </span>
                    </td>
                    <td className="py-2.5 px-2 text-[10px] font-bold text-[var(--muted)] opacity-60 truncate max-w-[120px]">
                      {tx.description}
                    </td>
                    <td className="py-2.5 px-2 text-[9px] font-black text-[var(--muted)] opacity-40">
                      {new Date(tx.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-2.5 px-2 text-right">
                      <span className={`text-[9px] font-black uppercase italic ${
                        tx.status === "success" ? "text-green-500" :
                        tx.status === "pending" ? "text-orange-500" :
                        "text-red-500"
                      }`}>
                        {tx.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </div>
        )}
      </div>
    </div>

  );
}
