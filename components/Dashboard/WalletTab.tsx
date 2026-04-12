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
    <div className="max-w-3xl mx-auto space-y-8">
      {/* ================= HEADER ================= */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[var(--accent)]/10 text-[var(--accent)]">
            <FaWallet size={20} />
          </div>
          My Wallet
        </h2>
        <div className="hidden md:flex items-center gap-2 text-xs font-bold text-[var(--muted)] uppercase tracking-widest">
          <FiCheckCircle className="text-green-500" /> Safe Payments
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
        {/* ================= LEFT SIDE: BALANCE & QUICK ADD ================= */}
        <div className="md:col-span-2 space-y-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative overflow-hidden p-8 rounded-[2rem] bg-gradient-to-br from-[var(--accent)] to-[#4f46e5] text-white shadow-2xl shadow-[var(--accent)]/30"
          >
            <div className="relative z-10">
              <p className="text-sm font-bold opacity-80 uppercase tracking-widest">Balance</p>
              <h3 className="text-4xl md:text-5xl font-black mt-2 tracking-tighter">
                ₹{walletBalance.toLocaleString("en-IN")}
              </h3>
              <div className="mt-8 flex items-center gap-2 text-xs font-bold bg-black/20 w-fit px-3 py-1.5 rounded-full backdrop-blur-md">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                Live Wallet
              </div>
            </div>

            {/* Decals */}
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 -ml-10 -mb-10 w-32 h-32 bg-black/10 rounded-full blur-2xl" />
          </motion.div>

          <div className="p-6 rounded-3xl bg-[var(--card)] border border-[var(--border)] space-y-4">
            <p className="text-sm font-bold text-[var(--muted)] uppercase tracking-wider">Quick Add</p>
            <div className="flex flex-wrap gap-2">
              {quickAmounts.map((amt) => (
                <button
                  key={amt}
                  onClick={() => setAmount(amt)}
                  className={`px-4 py-2 rounded-xl text-sm font-bold transition-all
                    ${amount === amt
                      ? "bg-[var(--accent)] text-white shadow-lg shadow-[var(--accent)]/20"
                      : "bg-[var(--background)] border border-[var(--border)] text-[var(--foreground)] hover:border-[var(--accent)]"}`}
                >
                  +₹{amt}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ================= RIGHT SIDE: INPUT & METHODS ================= */}
        <div className="md:col-span-3 space-y-6">
          <div className="p-8 rounded-[2rem] bg-[var(--card)] border border-[var(--border)] shadow-xl space-y-8">
            {/* Amount Input */}
            <div>
              <label className="text-xs font-bold text-[var(--muted)] uppercase tracking-widest block mb-3">
                Enter Amount
              </label>
              <div className="relative group">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-[var(--muted)] group-focus-within:text-[var(--accent)] transition-colors">₹</span>
                <input
                  type="number"
                  value={amount}
                  placeholder="0.00"
                  onChange={(e) => {
                    setAmount(e.target.value);
                    setAmountError("");
                  }}
                  className="w-full pl-10 pr-4 py-4 rounded-2xl
                             bg-[var(--background)]/50 border border-[var(--border)]
                             text-2xl font-bold focus:ring-4 focus:ring-[var(--accent)]/10
                             focus:border-[var(--accent)] outline-none transition-all"
                />
              </div>
              <AnimatePresence>
                {amountError && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="text-red-500 text-xs font-bold mt-2 flex items-center gap-1"
                  >
                    ● {amountError}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            {/* Methods */}
            <div>
              <label className="text-xs font-bold text-[var(--muted)] uppercase tracking-widest block mb-3">
                Payment Method
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setMethod("upi")}
                  className={`p-5 rounded-2xl border-2 transition-all flex flex-col items-center gap-3
                    ${method === "upi"
                      ? "border-[var(--accent)] bg-[var(--accent)]/5"
                      : "border-[var(--border)] hover:border-[var(--muted)]"}`}
                >
                  <div className={`p-3 rounded-xl transition-colors ${method === "upi" ? "bg-[var(--accent)] text-white" : "bg-[var(--background)] text-[var(--muted)]"}`}>
                    <FaGooglePay size={24} />
                  </div>
                  <span className="text-sm font-bold">UPI / QR</span>
                </button>

                <button
                  disabled
                  className="p-5 rounded-2xl border-2 border-[var(--border)] opacity-40 cursor-not-allowed flex flex-col items-center gap-3"
                >
                  <div className="p-3 rounded-xl bg-[var(--background)] text-[var(--muted)]">
                    <FaBitcoin size={24} />
                  </div>
                  <span className="text-sm font-bold">USDT</span>
                </button>
              </div>
            </div>

            {/* CTA */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleProceed}
              disabled={loading || !amount || Number(amount) < 1}
              className="w-full py-5 rounded-2xl bg-[var(--accent)] text-white font-black text-lg
                         shadow-xl shadow-[var(--accent)]/20 hover:shadow-[var(--accent)]/40
                         transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:grayscale"
            >
              {loading ? (
                <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Add Money <FiArrowRight />
                </>
              )}
            </motion.button>
          </div>
        </div>
      </div>

      {/* ================= TRANSACTION HISTORY ================= */}
      <div className="p-8 rounded-[2rem] bg-[var(--card)] border border-[var(--border)] shadow-xl space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold">Transaction History</h3>
          <button 
            onClick={fetchTransactions}
            className="text-xs font-bold text-[var(--accent)] hover:underline"
          >
            Refresh
          </button>
        </div>

        {historyLoading ? (
          <div className="flex flex-col items-center py-12 gap-4">
            <div className="w-8 h-8 border-3 border-[var(--accent)]/30 border-t-[var(--accent)] rounded-full animate-spin" />
            <p className="text-sm font-bold text-[var(--muted)]">Loading transactions...</p>
          </div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-12 space-y-3">
            <div className="mx-auto w-12 h-12 rounded-2xl bg-[var(--background)] flex items-center justify-center text-[var(--muted)]">
               <History size={24} />
            </div>
            <p className="text-sm font-bold text-[var(--muted)]">No transactions found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] font-black uppercase tracking-widest text-[var(--muted)] border-b border-[var(--border)]">
                  <th className="pb-4 px-2">Type</th>
                  <th className="pb-4 px-2">Amount</th>
                  <th className="pb-4 px-2">Description</th>
                  <th className="pb-4 px-2">Date</th>
                  <th className="pb-4 px-2 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {transactions.map((tx) => (
                  <tr key={tx._id} className="group hover:bg-[var(--accent)]/[0.02]">
                    <td className="py-4 px-2">
                       <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-md ${
                        tx.type === "topup" ? "bg-green-500/10 text-green-500" :
                        tx.type === "spend" ? "bg-blue-500/10 text-blue-500" :
                        "bg-orange-500/10 text-orange-500"
                      }`}>
                        {tx.type}
                      </span>
                    </td>
                    <td className="py-4 px-2">
                      <span className={`font-bold ${tx.type === "topup" ? "text-green-500" : "text-[var(--foreground)]"}`}>
                        {tx.type === "topup" ? "+" : "-"}₹{tx.amount}
                      </span>
                    </td>
                    <td className="py-4 px-2 text-sm font-medium text-[var(--muted)]">
                      {tx.description}
                    </td>
                    <td className="py-4 px-2 text-xs font-bold text-[var(--muted)]">
                      {new Date(tx.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-2 text-right">
                      <span className={`text-[10px] font-bold uppercase ${
                        tx.status === "success" ? "text-green-500" :
                        tx.status === "pending" ? "text-orange-500" :
                        "text-red-500"
                      }`}>
                        ● {tx.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>

  );
}
