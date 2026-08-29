"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { FaWallet, FaGooglePay, FaBitcoin } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { FiPlus, FiArrowRight, FiCheckCircle } from "react-icons/fi";
import { History, RefreshCw } from "lucide-react";
import { useCurrency } from "@/components/CurrencyContext";


interface WalletTabProps {
  walletBalance: number;
  setWalletBalance: (balance: number) => void;
}

export default function WalletTab({
  walletBalance,
  setWalletBalance,
}: WalletTabProps) {
  const [mounted, setMounted] = useState(false);
  const [amount, setAmount] = useState("");
  const [amountError, setAmountError] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);
  const [method, setMethod] = useState("upi");
  const [loading, setLoading] = useState(false);
  const [storedPhone, setStoredPhone] = useState("");
  const [storedEmail, setStoredEmail] = useState("");
  const [transactions, setTransactions] = useState<any[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const { formatPrice } = useCurrency();

  // Crypto Specific State
  const [usdtAmount, setUsdtAmount] = useState("10");
  const [showCryptoAddress, setShowCryptoAddress] = useState(false);
  const [txHash, setTxHash] = useState("");
  const [cryptoSubmitting, setCryptoSubmitting] = useState(false);
  const [activeCryptoTxId, setActiveCryptoTxId] = useState("");
  const [hashSubmitModal, setHashSubmitModal] = useState<string | null>(null);

  const RATE = Number(process.env.NEXT_PUBLIC_USDT_RATE) || 98;
  const depositAddress = "0x3e51e7cbae36bce80b2c6432a2add6130d184a94"; 
  const quickAmounts = ["50", "100", "200", "500"];
  const quickUsdt = ["1", "5", "10", "20"];

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

  const handleGenerateAddress = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/wallet/crypto-deposit", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          usdtAmount: Number(usdtAmount),
          coinsAmount: Number(usdtAmount) * RATE,
        })
      });

      const data = await res.json();
      if (data.success) {
        setActiveCryptoTxId(data.transaction.transactionId);
        setShowCryptoAddress(true);
        fetchTransactions(); // To show it as waiting in history
      } else {
        alert(data.message || "Failed to generate address");
      }
    } catch (err) {
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleCryptoSubmit = async (txIdToSubmit: string) => {
    if (!txHash) {
      alert("Please paste your transaction hash");
      return;
    }

    setCryptoSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/wallet/crypto-deposit", {
        method: "PATCH",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          transactionId: txIdToSubmit,
          txHash
        })
      });

      const data = await res.json();
      if (data.success) {
        alert("Deposit submitted! Admin will verify and add funds shortly.");
        setTxHash("");
        setShowCryptoAddress(false);
        setHashSubmitModal(null);
        setActiveCryptoTxId("");
        setMethod("upi");
        fetchTransactions();
      } else {
        alert(data.message || "Failed to submit");
      }
    } catch (err) {
      alert("Something went wrong");
    } finally {
      setCryptoSubmitting(false);
    }
  };

  return (
    <div className="max-w-full mx-auto space-y-4 px-0.5">
      {/* ================= HEADER ================= */}
      <div className="flex items-center justify-between px-1">
        <h2 className="text-base sm:text-lg font-bold tracking-tight text-[var(--foreground)] flex items-center gap-2">
          <div className="w-1.5 h-4 bg-[var(--accent)] rounded-full" />
          My Wallet
        </h2>
        <div className="hidden sm:flex items-center gap-1.5 text-[9.5px] font-bold text-[var(--accent)] bg-[var(--accent)]/10 px-2.5 py-1 rounded-md border border-[var(--accent)]/20">
          <FiCheckCircle size={11} /> Safe & Secure
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5">
        {/* ================= LEFT SIDE: BALANCE & QUICK ADD ================= */}
        <div className="lg:col-span-5 space-y-3">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden p-3.5 sm:p-4 rounded-xl bg-gradient-to-br from-[var(--accent)] to-[#4f46e5] text-white shadow-sm"
          >
            <div className="relative z-10 flex flex-col justify-between h-full">
              <div>
                <p className="text-[8.5px] font-bold opacity-75 uppercase tracking-wider">Current Balance</p>
                <h3 className="text-2xl sm:text-3xl font-black tracking-tight mt-0.5">
                  {formatPrice(walletBalance)}
                </h3>
              </div>
              <div className="mt-2.5 flex items-center gap-1.5 text-[8px] font-bold bg-white/15 w-fit px-2 py-0.5 rounded-full backdrop-blur-md border border-white/15">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                ACTIVE WALLET
              </div>
            </div>
            {/* Decals */}
            <div className="absolute top-0 right-0 -mr-6 -mt-6 w-24 h-24 bg-white/10 rounded-full blur-xl" />
          </motion.div>

          <div className="p-3 rounded-xl bg-[var(--card)]/40 border border-[var(--border)] space-y-2">
            <p className="text-[9px] font-bold text-[var(--muted)] uppercase tracking-wider">Quick Top-up</p>
            <div className="grid grid-cols-4 gap-1.5">
              {quickAmounts.map((amt) => (
                <button
                  key={amt}
                  onClick={() => setAmount(amt)}
                  className={`py-1.5 rounded-lg text-[10.5px] font-bold transition-all border
                    ${amount === amt
                      ? "bg-[var(--accent)] text-white border-[var(--accent)] shadow-xs"
                      : "bg-[var(--foreground)]/[0.03] border-[var(--border)] text-[var(--foreground)] hover:border-[var(--accent)]/40"}`}
                >
                  +₹{amt}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ================= RIGHT SIDE: INPUT & METHODS ================= */}
        <div className="lg:col-span-7 space-y-3">
          <div className="p-3.5 sm:p-4 rounded-xl bg-[var(--card)]/40 backdrop-blur-md border border-[var(--border)] shadow-xs space-y-3">
            {/* Amount Input */}
            <div>
              <label className="text-[9px] font-bold text-[var(--muted)] uppercase tracking-wider block mb-1">
                Custom Amount
              </label>
              <div className="relative group">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-base font-bold text-[var(--muted)] group-focus-within:text-[var(--accent)] transition-colors">₹</span>
                <input
                  type="number"
                  value={amount}
                  placeholder="0.00"
                  onChange={(e) => {
                    setAmount(e.target.value);
                    setAmountError("");
                  }}
                  className="w-full pl-7 pr-3 py-2 rounded-lg
                             bg-[var(--foreground)]/[0.03] border border-[var(--border)]
                             text-base sm:text-lg font-bold tracking-tight focus:bg-[var(--card)]
                             focus:border-[var(--accent)] outline-none transition-all text-[var(--foreground)]"
                />
              </div>
              <AnimatePresence>
                {amountError && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="text-rose-500 text-[10px] font-bold mt-1.5 flex items-center gap-1"
                  >
                    ● {amountError}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            {/* Methods */}
            <div>
              <label className="text-[9px] font-bold text-[var(--muted)] uppercase tracking-wider block mb-1">
                Payment Gateway
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setMethod("upi")}
                  className={`p-2.5 rounded-lg border transition-all flex items-center gap-2
                    ${method === "upi"
                      ? "border-[var(--accent)] bg-[var(--accent)]/10 shadow-xs"
                      : "border-[var(--border)] bg-[var(--foreground)]/[0.02] hover:border-[var(--accent)]/30"}`}
                >
                  <div className={`w-7 h-7 rounded-md flex items-center justify-center transition-all ${method === "upi" ? "bg-[var(--accent)] text-white" : "bg-[var(--foreground)]/[0.04] text-[var(--muted)]"}`}>
                    <FaGooglePay size={15} />
                  </div>
                  <div className="text-left min-w-0">
                    <p className="text-[11px] font-bold text-[var(--foreground)] leading-tight truncate">UPI / QR</p>
                    <p className="text-[8px] font-medium text-[var(--muted)] uppercase">Instant</p>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setMethod("crypto");
                    setShowCryptoAddress(false);
                  }}
                  className={`p-2.5 rounded-lg border transition-all flex items-center gap-2
                    ${method === "crypto"
                      ? "border-[var(--accent)] bg-[var(--accent)]/10 shadow-xs"
                      : "border-[var(--border)] bg-[var(--foreground)]/[0.02] hover:border-[var(--accent)]/30"}`}
                >
                  <div className={`w-7 h-7 rounded-md flex items-center justify-center transition-all ${method === "crypto" ? "bg-[var(--accent)] text-white" : "bg-[var(--foreground)]/[0.04] text-[var(--muted)]"}`}>
                    <FaBitcoin size={15} />
                  </div>
                  <div className="text-left min-w-0">
                    <p className="text-[11px] font-bold text-[var(--foreground)] leading-tight truncate">Crypto / USDT</p>
                    <p className="text-[8px] font-medium text-[var(--accent)] uppercase">1 USDT = {RATE} Rs</p>
                  </div>
                </button>
              </div>
            </div>

            {method === "crypto" ? (
              !showCryptoAddress ? (
                <div className="space-y-2.5 pt-1">
                  <div className="p-2.5 bg-[var(--foreground)]/[0.02] border border-[var(--border)] rounded-lg">
                    <p className="text-[9px] font-bold text-emerald-500 uppercase tracking-wider mb-1.5">Network: BEP20 (Recommended)</p>
                    <div className="relative group">
                      <input
                        type="number"
                        value={usdtAmount}
                        onChange={(e) => setUsdtAmount(e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-md bg-[var(--card)] border border-[var(--border)] text-base font-bold focus:border-[var(--accent)] outline-none text-[var(--foreground)]"
                      />
                      <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-[var(--muted)]">USDT</span>
                    </div>
                    <div className="flex justify-between items-center mt-1.5 px-0.5">
                      <span className="text-[9px] font-medium text-[var(--muted)] uppercase">You Receive:</span>
                      <span className="text-sm font-bold text-[var(--accent)]">{(Number(usdtAmount) * RATE).toLocaleString()} Rs</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-1.5">
                    {quickUsdt.map((amt) => (
                      <button
                        key={amt}
                        onClick={() => setUsdtAmount(amt)}
                        className={`py-1 rounded-md text-[9.5px] font-bold transition-all border
                          ${usdtAmount === amt ? "bg-[var(--accent)] text-white border-[var(--accent)]" : "bg-[var(--foreground)]/[0.03] border-[var(--border)] text-[var(--foreground)] hover:border-[var(--accent)]/30"}`}
                      >
                        {amt} USDT
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={handleGenerateAddress}
                    disabled={loading || !usdtAmount || Number(usdtAmount) < 1}
                    className="w-full py-2.5 rounded-lg bg-[var(--accent)] text-white font-bold text-[10.5px] uppercase tracking-wider shadow-xs hover:bg-[var(--accent-hover)] transition-all disabled:opacity-50 flex items-center justify-center gap-1.5"
                  >
                    {loading ? <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : "Show Deposit Address →"}
                  </button>
                </div>
              ) : (
                <div className="space-y-2.5 border border-emerald-500/30 bg-emerald-500/5 p-3 rounded-lg relative">
                  <button onClick={() => setShowCryptoAddress(false)} className="text-[9px] font-bold text-[var(--muted)] hover:text-[var(--foreground)] uppercase">← Back</button>
                  <div className="text-center mb-2">
                     <p className="text-[9.5px] font-bold text-emerald-500 uppercase tracking-wider">Send USDT To This Address</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    <div className="bg-[var(--card)] p-2 rounded-md border border-[var(--border)] text-center">
                      <p className="text-[8px] text-[var(--muted)] font-bold uppercase mb-0.5">Send</p>
                      <p className="text-sm font-bold text-[var(--foreground)]">{usdtAmount} USDT</p>
                    </div>
                    <div className="bg-[var(--card)] p-2 rounded-md border border-[var(--border)] text-center">
                      <p className="text-[8px] text-[var(--muted)] font-bold uppercase mb-0.5">Receive</p>
                      <p className="text-sm font-bold text-[var(--accent)]">{Number(usdtAmount) * RATE} Rs</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-[8px] font-bold text-[var(--muted)] uppercase mb-1">Deposit Address (BEP20)</p>
                    <div className="flex items-center gap-1.5">
                      <input readOnly value={depositAddress} className="w-full px-2 py-1.5 rounded-md bg-[var(--card)] border border-[var(--border)] text-[8.5px] font-mono text-emerald-500" />
                      <button 
                        onClick={() => {
                          navigator.clipboard.writeText(depositAddress);
                          alert("Address copied!");
                        }}
                        className="px-2.5 py-1.5 rounded-md bg-[var(--accent)] text-white font-bold text-[9px] uppercase shrink-0"
                      >
                        Copy
                      </button>
                    </div>
                  </div>

                  <div className="p-1.5 bg-amber-500/10 border border-amber-500/20 rounded-md text-amber-500 text-[8.5px] font-semibold">
                    ⚠️ Send exactly <b>{usdtAmount} USDT</b> on <b>BEP20</b> network only.
                  </div>

                  <div>
                    <p className="text-[8px] font-bold text-[var(--muted)] uppercase mb-1">Paste TX Hash</p>
                    <input 
                      value={txHash}
                      onChange={(e) => setTxHash(e.target.value)}
                      placeholder="Paste TX hash here..." 
                      className="w-full px-2.5 py-1.5 rounded-md bg-[var(--card)] border border-[var(--border)] text-xs font-mono outline-none focus:border-[var(--accent)] text-[var(--foreground)]" 
                    />
                  </div>

                  <button
                    onClick={() => handleCryptoSubmit(activeCryptoTxId)}
                    disabled={cryptoSubmitting || !txHash}
                    className="w-full py-2.5 rounded-lg bg-emerald-500 text-white font-bold text-[10px] uppercase tracking-wider shadow-xs hover:bg-emerald-600 transition-all disabled:opacity-50"
                  >
                    {cryptoSubmitting ? "Submitting..." : "Confirm Deposit"}
                  </button>
                </div>
              )
            ) : (
              <motion.button
                whileTap={{ scale: 0.99 }}
                onClick={handleProceed}
                disabled={loading || !amount || Number(amount) < 1}
                className="w-full py-2.5 rounded-lg bg-[var(--accent)] text-white font-bold text-[10.5px] uppercase tracking-wider
                           shadow-xs hover:bg-[var(--accent-hover)]
                           transition-all flex items-center justify-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    Top-up Now <FiArrowRight size={13} />
                  </>
                )}
              </motion.button>
            )}
          </div>
        </div>
      </div>

      {/* ================= TRANSACTION HISTORY ================= */}
      <div className="p-3 sm:p-4 rounded-xl bg-[var(--card)]/40 backdrop-blur-md border border-[var(--border)] shadow-xs space-y-2.5">
        <div className="flex items-center justify-between px-0.5">
          <h3 className="text-xs sm:text-sm font-bold text-[var(--foreground)] tracking-tight">Transaction History</h3>
          <button 
            onClick={fetchTransactions}
            title="Refresh transactions"
            disabled={historyLoading}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--foreground)]/[0.05] transition-all disabled:opacity-50"
          >
            <RefreshCw size={13} className={historyLoading ? "animate-spin text-[var(--accent)]" : "transition-transform active:rotate-180"} />
          </button>
        </div>

        {historyLoading ? (
          <div className="flex flex-col items-center py-6 gap-2">
            <div className="w-5 h-5 border-2 border-[var(--accent)]/30 border-t-[var(--accent)] rounded-full animate-spin" />
            <p className="text-[9px] font-semibold text-[var(--muted)] uppercase tracking-wider">Updating...</p>
          </div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-6 space-y-1.5">
            <div className="mx-auto w-8 h-8 rounded-lg bg-[var(--foreground)]/[0.03] flex items-center justify-center text-[var(--muted)]">
               <History size={16} />
            </div>
            <p className="text-[10px] font-semibold text-[var(--muted)]">No activity yet</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--card)]/60">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[340px]">
                <thead>
                  <tr className="text-[8.5px] font-bold uppercase tracking-wider text-[var(--muted)] bg-[var(--foreground)]/[0.02] border-b border-[var(--border)]">
                    <th className="py-2 px-2.5">Activity</th>
                    <th className="py-2 px-2">Amount</th>
                    <th className="py-2 px-2">Details</th>
                    <th className="py-2 px-2">Date</th>
                    <th className="py-2 px-2.5 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]/40 text-[10.5px]">
                  {transactions.map((tx) => (
                    <tr key={tx._id} className="hover:bg-[var(--foreground)]/[0.02] transition-colors">
                      <td className="py-2 px-2.5">
                         <span className={`text-[8px] font-bold uppercase px-1.5 py-0.5 rounded border ${
                          tx.type === "topup" ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" :
                          tx.type === "spend" ? "bg-blue-500/10 text-blue-500 border-blue-500/20" :
                          "bg-amber-500/10 text-amber-500 border-amber-500/20"
                        }`}>
                          {tx.type}
                        </span>
                      </td>
                      <td className="py-2 px-2">
                        <span className={`font-bold ${tx.type === "topup" ? "text-emerald-500" : "text-[var(--foreground)]"}`}>
                          {tx.type === "topup" ? "+" : "-"}₹{tx.amount}
                        </span>
                      </td>
                      <td className="py-2 px-2 text-[9.5px] text-[var(--muted)] truncate max-w-[100px] sm:max-w-[140px]">
                        {tx.description}
                      </td>
                      <td className="py-2 px-2 text-[9px] text-[var(--muted)]">
                        {new Date(tx.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-2 px-2.5 text-right">
                        <span className={`text-[9px] font-bold uppercase ${
                          tx.status === "success" ? "text-emerald-500" :
                          tx.status === "pending" ? "text-amber-500" :
                          "text-rose-500"
                        }`}>
                          {tx.status === "pending" && !tx.metadata?.txHash ? "WAITING" : tx.status}
                        </span>
                        {tx.status === "pending" && !tx.metadata?.txHash && (
                          <div className="mt-1">
                            <button onClick={() => setHashSubmitModal(tx.transactionId)} className="bg-emerald-500 hover:bg-emerald-600 text-white text-[8px] font-bold uppercase px-1.5 py-0.5 rounded shadow-xs transition-all">Submit Hash</button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {mounted &&
        createPortal(
          <AnimatePresence>
            {hashSubmitModal && (
              <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setHashSubmitModal(null)} className="fixed inset-0 bg-black/70 backdrop-blur-xs" />
                <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative bg-[var(--card)] border border-[var(--border)] rounded-xl p-4 sm:p-5 w-full max-w-sm shadow-xl z-10" onClick={(e) => e.stopPropagation()}>
                    <h3 className="text-xs sm:text-sm font-bold text-[var(--foreground)] mb-1">Submit TX Hash</h3>
                    <p className="text-[10px] text-[var(--muted)] mb-3">Paste your transaction hash for {hashSubmitModal}</p>
                    <input 
                      value={txHash}
                      onChange={(e) => setTxHash(e.target.value)}
                      placeholder="Paste TX hash here..." 
                      className="w-full px-3 py-2 rounded-lg bg-[var(--foreground)]/[0.03] border border-[var(--border)] text-xs font-mono outline-none focus:border-[var(--accent)] mb-3 text-[var(--foreground)]" 
                    />
                    <div className="flex gap-2">
                      <button onClick={() => setHashSubmitModal(null)} className="flex-1 py-2 rounded-lg border border-[var(--border)] text-[10px] font-bold uppercase text-[var(--muted)] hover:text-[var(--foreground)] transition-all">Cancel</button>
                      <button onClick={() => handleCryptoSubmit(hashSubmitModal)} disabled={cryptoSubmitting || !txHash} className="flex-1 py-2 rounded-lg bg-[var(--accent)] text-white text-[10px] font-bold uppercase transition-all disabled:opacity-50">Submit</button>
                    </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </div>

  );
}
