"use client";

import { useState, useEffect } from "react";
import { FaWallet, FaGooglePay, FaBitcoin } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { FiPlus, FiArrowRight, FiCheckCircle } from "react-icons/fi";
import { History } from "lucide-react";
import { useCurrency } from "@/components/CurrencyContext";


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
        <div className="lg:col-span-5 space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden p-4 md:p-5 rounded-[1.5rem] bg-gradient-to-br from-[var(--accent)] to-[#4f46e5] text-white shadow-lg"
          >
            <div className="relative z-10 flex flex-col justify-between h-full">
              <div>
                <p className="text-[8px] font-black opacity-60 uppercase tracking-[0.2em] italic">Current Balance</p>
                <h3 className="text-2xl md:text-3xl font-black tracking-tighter italic">
                  {formatPrice(walletBalance)}
                </h3>
              </div>
              <div className="mt-3 flex items-center gap-1.5 text-[8px] font-black bg-white/10 w-fit px-2.5 py-1 rounded-full backdrop-blur-md border border-white/10">
                <div className="w-1.5 h-1.5 rounded-full bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.5)]" />
                ACTIVE WALLET
              </div>
            </div>
            {/* Decals */}
            <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-white/5 rounded-full blur-2xl" />
          </motion.div>

          <div className="p-4 rounded-2xl bg-[var(--card)]/30 border border-[var(--border)] space-y-2">
            <p className="text-[8px] font-black text-[var(--muted)] uppercase tracking-widest opacity-40 italic">Quick Top-up</p>
            <div className="grid grid-cols-4 gap-1.5">
              {quickAmounts.map((amt) => (
                <button
                  key={amt}
                  onClick={() => setAmount(amt)}
                  className={`py-1.5 rounded-lg text-[10px] font-black transition-all border
                    ${amount === amt
                      ? "bg-[var(--accent)] text-black border-[var(--accent)] shadow-md shadow-[var(--accent)]/20"
                      : "bg-[var(--foreground)]/[0.03] border-transparent text-[var(--foreground)] hover:border-[var(--accent)]/30"}`}
                >
                  +₹{amt}
                </button>
              ))}
            </div>
          </div>
        </div>
        {/* ================= RIGHT SIDE: INPUT & METHODS ================= */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-4 md:p-5 rounded-2xl bg-[var(--card)]/30 backdrop-blur-md border border-[var(--border)] shadow-lg space-y-4">
            {/* Amount Input */}
            <div>
              <label className="text-[8px] font-black text-[var(--muted)] uppercase tracking-[0.2em] block mb-1.5 italic opacity-40">
                Custom Amount
              </label>
              <div className="relative group">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg font-black text-[var(--muted)] group-focus-within:text-[var(--accent)] transition-colors italic">₹</span>
                <input
                  type="number"
                  value={amount}
                  placeholder="0.00"
                  onChange={(e) => {
                    setAmount(e.target.value);
                    setAmountError("");
                  }}
                  className="w-full pl-8 pr-3 py-2.5 rounded-xl
                             bg-[var(--foreground)]/[0.03] border border-transparent
                             text-lg font-black italic tracking-tighter focus:bg-[var(--card)]
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
              <label className="text-[8px] font-black text-[var(--muted)] uppercase tracking-[0.2em] block mb-1.5 italic opacity-40">
                Payment Gateway
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  onClick={() => setMethod("upi")}
                  className={`p-3 rounded-xl border-2 transition-all flex items-center gap-2.5
                    ${method === "upi"
                      ? "border-[var(--accent)] bg-[var(--accent)]/5"
                      : "border-transparent bg-[var(--foreground)]/[0.03] hover:border-[var(--accent)]/20"}`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${method === "upi" ? "bg-[var(--accent)] text-black rotate-[-6deg]" : "bg-[var(--card)] text-[var(--muted)] border border-[var(--border)]"}`}>
                    <FaGooglePay size={16} />
                  </div>
                  <div className="text-left">
                    <p className="text-[10px] font-black uppercase italic tracking-tight">UPI / QR</p>
                    <p className="text-[7px] font-bold opacity-30 uppercase tracking-widest">Instant</p>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setMethod("crypto");
                    setShowCryptoAddress(false);
                  }}
                  className={`p-3 rounded-xl border-2 transition-all flex items-center gap-2.5
                    ${method === "crypto"
                      ? "border-[var(--accent)] bg-[var(--accent)]/5"
                      : "border-transparent bg-[var(--foreground)]/[0.03] hover:border-[var(--accent)]/20"}`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${method === "crypto" ? "bg-[var(--accent)] text-black rotate-[-6deg]" : "bg-[var(--card)] text-[var(--muted)] border border-[var(--border)]"}`}>
                    <FaBitcoin size={16} />
                  </div>
                  <div className="text-left">
                    <p className="text-[10px] font-black uppercase italic tracking-tight">Crypto / USDT</p>
                    <p className="text-[7px] font-bold opacity-30 uppercase tracking-widest text-[var(--accent)]">1 USDT = {RATE} Rs</p>
                  </div>
                </button>
              </div>
            </div>

            {method === "crypto" ? (
              !showCryptoAddress ? (
                <div className="space-y-3">
                  <div className="p-3 bg-[var(--foreground)]/[0.02] border border-[var(--border)] rounded-xl">
                    <p className="text-[9px] font-black text-green-500 uppercase tracking-widest mb-2">Network: BEP20 (Recommended)</p>
                    <div className="relative group">
                      <input
                        type="number"
                        value={usdtAmount}
                        onChange={(e) => setUsdtAmount(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-[var(--card)] border border-[var(--border)] text-xl font-black italic focus:border-[var(--accent)] outline-none"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-black text-[var(--muted)]">USDT</span>
                    </div>
                    <div className="flex justify-between items-center mt-2 px-1">
                      <span className="text-[9px] font-bold text-[var(--muted)] uppercase">You Receive:</span>
                      <span className="text-base font-black text-[var(--accent)] italic">{(Number(usdtAmount) * RATE).toLocaleString()} Rs</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-2">
                    {quickUsdt.map((amt) => (
                      <button
                        key={amt}
                        onClick={() => setUsdtAmount(amt)}
                        className={`py-1.5 rounded-lg text-[9px] font-black transition-all border
                          ${usdtAmount === amt ? "bg-[var(--accent)] text-black border-[var(--accent)]" : "bg-[var(--foreground)]/[0.03] border-transparent hover:border-[var(--accent)]/30"}`}
                      >
                        {amt} USDT
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={handleGenerateAddress}
                    disabled={loading || !usdtAmount || Number(usdtAmount) < 1}
                    className="w-full py-3 rounded-xl bg-[var(--accent)] text-black font-black text-[10px] uppercase tracking-widest italic shadow-md hover:brightness-110 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {loading ? <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" /> : "Show Me The Address →"}
                  </button>
                </div>
              ) : (
                <div className="space-y-3 border border-green-500/20 bg-green-500/5 p-4 rounded-xl relative">
                  <button onClick={() => setShowCryptoAddress(false)} className="absolute top-3 left-3 text-[9px] font-black text-[var(--muted)] hover:text-white uppercase">← Back</button>
                  <div className="text-center mb-4">
                     <p className="text-[9px] font-black text-green-500 uppercase tracking-widest mt-2">Send USDT To This Address</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <div className="bg-[var(--card)] p-2 rounded-lg border border-[var(--border)] text-center">
                      <p className="text-[8px] text-[var(--muted)] font-black uppercase mb-0.5">Send</p>
                      <p className="text-base font-black italic">{usdtAmount} USDT</p>
                    </div>
                    <div className="bg-[var(--card)] p-2 rounded-lg border border-[var(--border)] text-center">
                      <p className="text-[8px] text-[var(--muted)] font-black uppercase mb-0.5">Receive</p>
                      <p className="text-base font-black text-[var(--accent)] italic">{Number(usdtAmount) * RATE} Rs</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-[8px] font-black text-[var(--muted)] uppercase mb-1.5">Deposit Address (BEP20)</p>
                    <div className="flex items-center gap-2">
                      <input readOnly value={depositAddress} className="w-full px-2 py-2 rounded-lg bg-[var(--card)] border border-[var(--border)] text-[9px] font-mono text-green-400" />
                      <button 
                        onClick={() => {
                          navigator.clipboard.writeText(depositAddress);
                          alert("Address copied!");
                        }}
                        className="p-2 rounded-lg bg-[var(--accent)] text-black font-black text-[9px] uppercase shrink-0"
                      >
                        Copy
                      </button>
                    </div>
                  </div>

                  <div className="p-2 bg-orange-500/10 border border-orange-500/20 rounded-lg text-orange-400 text-[9px] font-bold">
                    ⚠️ Send exactly <b>{usdtAmount} USDT</b> on <b>BEP20</b> only.
                  </div>

                  <div>
                    <p className="text-[8px] font-black text-[var(--muted)] uppercase mb-1.5">Paste TX Hash</p>
                    <input 
                      value={txHash}
                      onChange={(e) => setTxHash(e.target.value)}
                      placeholder="Paste your TX hash here..." 
                      className="w-full px-3 py-2 rounded-lg bg-[var(--card)] border border-[var(--border)] text-xs font-mono outline-none focus:border-[var(--accent)]" 
                    />
                  </div>

                  <button
                    onClick={() => handleCryptoSubmit(activeCryptoTxId)}
                    disabled={cryptoSubmitting || !txHash}
                    className="w-full py-3 rounded-xl bg-green-500 text-black font-black text-[10px] uppercase tracking-widest italic shadow-md hover:brightness-110 transition-all disabled:opacity-50"
                  >
                    {cryptoSubmitting ? "Submitting..." : "Confirm"}
                  </button>
                </div>
              )
            ) : (
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={handleProceed}
                disabled={loading || !amount || Number(amount) < 1}
                className="w-full py-3.5 rounded-xl bg-[var(--accent)] text-black font-black text-[10px] uppercase tracking-[0.3em] italic
                           shadow-md shadow-[var(--accent)]/20 hover:brightness-110
                           transition-all flex items-center justify-center gap-2 disabled:opacity-30 disabled:grayscale"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                ) : (
                  <>
                    Top-up Now <FiArrowRight size={14} />
                  </>
                )}
              </motion.button>
            )}
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
                        {tx.status === "pending" && !tx.metadata?.txHash ? "WAITING" : tx.status}
                      </span>
                      {tx.status === "pending" && !tx.metadata?.txHash && (
                        <div className="mt-1">
                          <button onClick={() => setHashSubmitModal(tx.transactionId)} className="bg-green-500 hover:bg-green-400 text-black text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-md shadow-lg shadow-green-500/20 transition-all">Submit Hash</button>
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

      <AnimatePresence>
        {hashSubmitModal && (
          <div className="fixed inset-0 z-[1200] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setHashSubmitModal(null)} className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative bg-[var(--card)] border border-[var(--border)] rounded-[2rem] p-6 w-full max-w-sm shadow-2xl">
                <h3 className="text-sm font-black uppercase italic mb-1">Submit TX Hash</h3>
                <p className="text-[10px] text-[var(--muted)] mb-5">Paste your transaction hash for {hashSubmitModal}</p>
                <input 
                  value={txHash}
                  onChange={(e) => setTxHash(e.target.value)}
                  placeholder="Paste your TX hash here..." 
                  className="w-full px-4 py-3 rounded-xl bg-[var(--foreground)]/[0.03] border border-[var(--border)] text-xs font-mono outline-none focus:border-[var(--accent)] mb-4" 
                />
                <div className="flex gap-2">
                  <button onClick={() => setHashSubmitModal(null)} className="flex-1 py-3 rounded-xl border border-[var(--border)] text-[10px] font-black uppercase text-[var(--muted)] hover:text-white transition-all">Cancel</button>
                  <button onClick={() => handleCryptoSubmit(hashSubmitModal)} disabled={cryptoSubmitting || !txHash} className="flex-1 py-3 rounded-xl bg-[var(--accent)] text-black text-[10px] font-black uppercase transition-all disabled:opacity-50">Submit</button>
                </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>

  );
}
