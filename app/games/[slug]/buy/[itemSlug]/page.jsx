"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import AuthGuard from "../../../../../components/AuthGuard";
import { saveVerifiedPlayer, getVerifiedPlayers } from "@/utils/storage/verifiedPlayerStorage";
import HelpImagePopup from "../../../../../components/HelpImage/HelpImagePopup";
import logo from "@/public/logo.png";

import { 
  FaUserCheck, 
  FaWallet, 
  FaCheckCircle, 
  FaHistory,
  FaArrowRight,
  FaShieldAlt,
  FaUser
} from "react-icons/fa";
import { MdOutlineSmartphone, MdHelpOutline } from "react-icons/md";
import { IoWalletOutline } from "react-icons/io5";

export default function BuyFlowPage() {
  const { slug, itemSlug } = useParams();
  const params = useSearchParams();
  const router = useRouter();

  /* ================= FLOW STATE ================= */
  const [playerId, setPlayerId] = useState("");
  const [zoneId, setZoneId] = useState("");
  const [isVerified, setIsVerified] = useState(false);
  const [verifiedName, setVerifiedName] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("upi");
  const [loading, setLoading] = useState(false);
  const [payLoading, setPayLoading] = useState(false);
  const [error, setError] = useState("");
  const [game, setGame] = useState(null);
  const [relatedItems, setRelatedItems] = useState([]);
  const [recentPlayers, setRecentPlayers] = useState([]);
  const [showRecent, setShowRecent] = useState(false);

  /* ================= USER DATA ================= */
  const [userEmail, setUserEmail] = useState("");
  const [userPhone, setUserPhone] = useState("");
  const [walletBalance, setWalletBalance] = useState(0);

  /* ================= VERIFIED ITEM DATA ================= */
  const [item, setItem] = useState(null);
  const [price, setPrice] = useState(0);
  const [dummyPrice, setDummyPrice] = useState(0);

  /* ================= FALLBACK UI PARAMS ================= */
  const fallbackName = params.get("name");
  const fallbackImage = params.get("image");

  /* ================= LOAD USER & RECENT ================= */
  useEffect(() => {
    setUserEmail(localStorage.getItem("email") || "");
    setUserPhone(localStorage.getItem("phone") || "");
    setWalletBalance(Number(localStorage.getItem("walletBalance") || 0));
    setRecentPlayers(getVerifiedPlayers(5));
  }, []);

  /* ================= FETCH GAME & VERIFY ITEM PRICE ================= */
  useEffect(() => {
    if (!slug || !itemSlug) return;

    const token = localStorage.getItem("token");

    fetch(`/api/games/${slug}`, {
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    })
      .then(res => res.json())
      .then(data => {
        const gameData = data?.data;
        setGame(gameData);

        if (!gameData?.itemId) return;

        const foundItem = gameData.itemId.find((i) => i.itemSlug === itemSlug);
        if (!foundItem) {
          alert("Invalid item selected");
          return;
        }

        setItem(foundItem);
        setPrice(Number(foundItem.sellingPrice));
        setDummyPrice(Number(foundItem.dummyPrice || foundItem.sellingPrice));

        // Set related items (other packs)
        const others = gameData.itemId
          .filter(i => i.itemSlug !== itemSlug)
          .slice(0, 16);
        setRelatedItems(others);
      })
      .catch(() => {
        alert("Failed to load item price");
      });
  }, [slug, itemSlug]);

  /* ================= PLAYER VALIDATION ================= */
  const handleValidate = async () => {
    setError("");
    setIsVerified(false);

    const hasFieldTwo = !!(game?.inputFieldTwo || (game?.inputFieldTwoOption && game.inputFieldTwoOption.length > 0));

    if (!playerId || (hasFieldTwo && !zoneId)) {
      setError(`Please enter your ${game?.inputFieldOne || "ID"}${hasFieldTwo ? ` and ${game?.inputFieldTwo || "Zone"}` : ""}`);
      return;
    }

    setLoading(true);

    const name = game?.gameName?.toLowerCase() || "";
    const isMLBB = slug?.includes("mlbb") || name.includes("mlbb") || slug?.includes("legends988") || slug?.includes("weeklymonthly-bundle");

    if (game?.isValidationRequired === false && !isMLBB) {
      setVerifiedName(game?.gameName || "Player");
      setIsVerified(true);
      setLoading(false);
      return;
    }

    try {
      const baseGameId = isMLBB ? "mobile-legends988" : (game?.gameId || slug);
      const productId = `${baseGameId}_${item?.itemId || itemSlug}`;

      const nameRes = await fetch("/api/check-region/namecheck", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, playerId, zoneId: zoneId || "NA" }),
      });
      const nameData = await nameRes.json();

      if ((nameData?.success === 200 || nameData?.success === true) && (nameData?.data?.username || nameData?.data?.name)) {
        const username = nameData?.data?.username || nameData?.data?.name || "Unknown";
        const region = nameData?.data?.region || "Global";
        
        // Filter restricted regions
        const restrictedSlugs = ["mobile-legends988", "mlbb-double332", "weeklymonthly-bundle931"];
        if (restrictedSlugs.includes(slug)) {
          const restrictedRegions = ["INDO", "ID", "PH", "SG", "RU", "MY", "MM"];
          if (restrictedRegions.includes(region.toUpperCase())) {
            setError(`Sorry, we don't support orders from ${region} region for this item.`);
            setLoading(false);
            return;
          }
        }

        saveVerifiedPlayer({ playerId, zoneId, username, region, savedAt: Date.now() });
        setVerifiedName(username);
        setIsVerified(true);
        setRecentPlayers(getVerifiedPlayers(5));
      } else {
        setError(nameData?.message || "Player not found");
      }
    } catch (err) {
      setError("Validation failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  /* ================= PROCEED TO PAYMENT ================= */
  const handleProceed = async () => {
    setError("");
    if (!isVerified) {
      handleValidate();
      return;
    }

    setPayLoading(true);

    try {
      const orderPayload = {
        gameSlug: slug,
        itemSlug,
        itemName: item?.itemName || fallbackName,
        playerId,
        zoneId: zoneId || "NA",
        paymentMethod,
        email: userEmail || null,
        phone: userPhone || localStorage.getItem("phone"),
        currency: "INR",
      };
      
      const token = localStorage.getItem("token");
      const res = await fetch("/api/order/create-gateway-order", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(orderPayload),
      });

      const data = await res.json();
      if (!data.success) {
        setError(data.message);
        setPayLoading(false);
        return;
      }

      localStorage.setItem("pending_topup_order", data.orderId);
      window.location.href = data.paymentUrl;
    } catch (err) {
      setError("Something went wrong. Please try again.");
      setPayLoading(false);
    }
  };

  const discountPercent = dummyPrice > price ? Math.round(((dummyPrice - price) / dummyPrice) * 100) : 0;

  return (
    <AuthGuard>
      <section className="min-h-screen bg-transparent text-[var(--foreground)] px-4 py-4 md:px-8 lg:py-8">
        <div className="max-w-6xl mx-auto">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* LEFT COLUMN: HERO & RELATED */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* HERO CARD */}
              <div className="bg-[var(--card)]/20 backdrop-blur-xl border border-[var(--border)] rounded-[2rem] p-4 shadow-xl relative overflow-hidden group">
                <div className="flex items-center gap-4 relative z-10">
                  <div className="w-20 h-20 md:w-24 md:h-24 relative rounded-2xl overflow-hidden border-2 border-[var(--card)]/50 shadow-2xl rotate-[-2deg] group-hover:rotate-0 transition-all duration-700">
                    <Image
                      src={item?.itemImageId?.image || fallbackImage || logo}
                      alt={item?.itemName || "Item"}
                      fill
                      className="object-cover scale-110 group-hover:scale-125 transition-transform duration-700"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="bg-[var(--accent)]/10 text-[var(--accent)] text-[8px] font-black uppercase px-2 py-0.5 rounded-full tracking-wider">
                        • Instant Delivery
                      </span>
                    </div>
                    <h1 className="text-xl md:text-2xl font-black uppercase tracking-tighter italic leading-none mb-1">
                      {item?.itemName || fallbackName}
                    </h1>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-black text-[var(--accent)] italic tracking-tighter">₹{price}</span>
                      {dummyPrice > price && (
                        <span className="text-sm font-bold opacity-30 line-through">₹{dummyPrice}</span>
                      )}
                    </div>
                  </div>
                </div>

                {discountPercent > 0 && (
                  <div className="absolute top-3 left-3 bg-red-500 text-white font-black text-[9px] px-3 py-1 rounded-full shadow-lg z-20 animate-bounce">
                    {discountPercent}% OFF
                  </div>
                )}
                
                <div className="absolute top-4 right-4 opacity-20">
                  <MdHelpOutline size={20} />
                </div>
              </div>

              {/* MORE PACKS */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 px-4">
                  <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />
                  <h3 className="font-black text-[9px] uppercase tracking-[0.2em] italic opacity-40">More packs you may like</h3>
                </div>

                <div className="flex overflow-x-auto snap-x pb-2 gap-2.5 no-scrollbar scroll-smooth">
                  {relatedItems.map((r) => (
                    <Link
                      key={r.itemSlug}
                      href={`/games/${slug}/buy/${r.itemSlug}`}
                      className="flex-shrink-0 w-24 md:w-32 snap-start bg-[var(--card)]/10 hover:bg-[var(--card)]/30 border-2 border-transparent hover:border-[var(--accent)]/20 p-2.5 rounded-2xl transition-all duration-300 group shadow-sm hover:shadow-xl hover:-translate-y-1"
                    >
                      <p className="text-[8px] font-bold opacity-40 uppercase tracking-tight mb-0.5 truncate group-hover:text-[var(--accent)] transition-colors">{r.itemName}</p>
                      <p className="text-base font-black italic tracking-tighter">₹{r.sellingPrice}</p>
                    </Link>
                  ))}
                  
                  {/* Active Item */}
                  <div className="flex-shrink-0 w-24 md:w-32 snap-start bg-[var(--card)]/30 border-2 border-[var(--accent)] p-2.5 rounded-2xl relative shadow-lg">
                    <p className="text-[8px] font-bold text-[var(--accent)] uppercase tracking-tight mb-0.5 truncate">{item?.itemName}</p>
                    <p className="text-base font-black text-[var(--accent)] italic tracking-tighter">₹{price}</p>
                    <div className="absolute top-1 right-1">
                      <FaCheckCircle className="text-[var(--accent)]" size={10} />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: INFO & PAYMENT */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* 1. PLAYER INFO */}
              <div className={`bg-[var(--card)]/30 backdrop-blur-xl border-2 transition-all duration-500 rounded-[2rem] p-5 shadow-2xl relative overflow-hidden ${!isVerified ? 'border-[var(--accent)]/30' : 'border-transparent'}`}>
                {/* Progress Indicator */}
                <div className="absolute top-0 left-0 h-1 bg-[var(--accent)] transition-all duration-700" style={{ width: isVerified ? '100%' : '50%' }} />
                
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className={`w-1 h-8 rounded-full transition-colors duration-500 ${isVerified ? 'bg-green-500' : 'bg-[var(--accent)]'}`} />
                    <h2 className="text-xl font-black uppercase tracking-tighter italic">1. Player Info</h2>
                  </div>
                  <HelpImagePopup />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="relative group">
                    <div className="absolute left-5 top-1/2 -translate-y-1/2 opacity-30 group-focus-within:opacity-100 group-focus-within:text-[var(--accent)] transition-all">
                      <FaUser size={14} />
                    </div>
                    <input
                      value={playerId}
                      onChange={(e) => {
                        setPlayerId(e.target.value);
                        setIsVerified(false);
                      }}
                      placeholder={game?.inputFieldOne || "User ID"}
                      className="w-full bg-[var(--foreground)]/[0.03] border-2 border-transparent focus:border-[var(--accent)]/20 focus:bg-[var(--card)] rounded-xl py-3 pl-12 pr-4 text-xs font-bold tracking-tight outline-none transition-all shadow-inner placeholder:opacity-20"
                    />
                  </div>

                  {(game?.inputFieldTwo || (game?.inputFieldTwoOption && game.inputFieldTwoOption.length > 0)) && (
                    <div className="relative group">
                      <div className="absolute left-5 top-1/2 -translate-y-1/2 opacity-30 group-focus-within:opacity-100 group-focus-within:text-[var(--accent)] transition-all">
                        <FaHistory size={14} className="rotate-90" />
                      </div>
                      <input
                        value={zoneId}
                        onChange={(e) => {
                          setZoneId(e.target.value);
                          setIsVerified(false);
                        }}
                        placeholder={game?.inputFieldTwo || "Server ID"}
                        className="w-full bg-[var(--foreground)]/[0.03] border-2 border-transparent focus:border-[var(--accent)]/20 focus:bg-[var(--card)] rounded-xl py-3 pl-12 pr-4 text-xs font-bold tracking-tight outline-none transition-all shadow-inner placeholder:opacity-20"
                      />
                    </div>
                  )}
                </div>

                <button
                  onClick={handleValidate}
                  disabled={loading}
                  className={`w-full py-3.5 rounded-xl font-black uppercase tracking-[0.2em] text-[9px] italic transition-all duration-500 flex items-center justify-center gap-3 mb-6 shadow-xl border-2
                    ${loading 
                      ? "opacity-50 cursor-not-allowed border-transparent bg-[var(--foreground)]/[0.05]" 
                      : isVerified 
                        ? "bg-green-500 text-white border-green-500 shadow-green-500/20" 
                        : "bg-[var(--accent)]/10 text-[var(--accent)] border-[var(--accent)]/20 hover:bg-[var(--accent)] hover:text-black hover:border-[var(--accent)]"}`}
                >
                  {loading ? (
                    <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  ) : isVerified ? (
                    <div className="flex items-center gap-2 animate-pop">
                      <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center"><FaCheckCircle size={10} /></div>
                      <span>Verified: {verifiedName}</span>
                    </div>
                  ) : (
                    <><FaUserCheck size={12} /> Check Name</>
                  )}
                </button>

                {error && (
                  <div className="p-3 mb-6 rounded-xl bg-red-500/10 text-red-500 text-[10px] font-bold uppercase tracking-widest text-center border border-red-500/20 animate-shake">
                    {error}
                  </div>
                )}

                <div className="pt-4 border-t border-[var(--border)]">
                  <div className="flex items-center justify-between mb-3 px-1">
                    <div className="flex items-center gap-2">
                      <FaHistory size={10} className="opacity-20" />
                      <span className="font-black text-[9px] uppercase tracking-widest opacity-30">Recent Players</span>
                    </div>
                    <button 
                      onClick={() => setShowRecent(!showRecent)}
                      className="text-[9px] font-black uppercase tracking-widest text-[var(--accent)] hover:underline"
                    >
                      {showRecent ? "HIDE" : "SHOW"}
                    </button>
                  </div>
                  
                  {showRecent && (
                    <div className="space-y-2 animate-fadeUp">
                      {recentPlayers.length > 0 ? (
                        recentPlayers.map((p, i) => (
                          <button
                            key={i}
                            onClick={() => {
                              setPlayerId(p.playerId);
                              setZoneId(p.zoneId);
                              setIsVerified(false);
                            }}
                            className="w-full p-3 rounded-xl bg-[var(--foreground)]/[0.02] hover:bg-[var(--card)] border border-transparent hover:border-[var(--accent)]/10 flex items-center justify-between transition-all group"
                          >
                            <div className="text-left">
                              <p className="font-black text-[10px] uppercase italic tracking-tight">{p.username}</p>
                              <p className="text-[8px] font-bold opacity-30 uppercase">{p.playerId} {p.zoneId ? `(${p.zoneId})` : ""}</p>
                            </div>
                            <FaArrowRight size={8} className="text-[var(--accent)] opacity-0 group-hover:opacity-100 transition-opacity" />
                          </button>
                        ))
                      ) : (
                        <p className="text-center py-2 text-[9px] font-bold opacity-20 uppercase tracking-widest italic">No recent players</p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* 2. PAYMENT */}
              <div className={`bg-[var(--card)]/30 backdrop-blur-xl border-2 transition-all duration-700 rounded-[2rem] p-5 shadow-2xl relative overflow-hidden ${isVerified ? 'border-[var(--accent)]/30 opacity-100' : 'border-transparent opacity-40'}`}>
                {/* Lock Overlay for UX */}
                {!isVerified && <div className="absolute inset-0 z-20 cursor-not-allowed" title="Verify player info first" />}
                
                <div className="flex items-center gap-3 mb-6">
                  <div className={`w-1 h-8 rounded-full transition-colors duration-500 ${isVerified ? 'bg-[var(--accent)]' : 'bg-[var(--foreground)]/10'}`} />
                  <h2 className="text-xl font-black uppercase tracking-tighter italic">2. Payment</h2>
                </div>

                <div className="space-y-3 mb-8">
                  {/* UPI Gateway */}
                  <button
                    onClick={() => setPaymentMethod("upi")}
                    disabled={!isVerified}
                    className={`w-full p-4 rounded-2xl border-2 transition-all flex items-center justify-between group
                      ${paymentMethod === "upi" ? "bg-[var(--card)] border-[var(--accent)] shadow-xl scale-[1.01]" : "bg-[var(--foreground)]/[0.02] border-transparent hover:border-[var(--accent)]/10"}`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-500 ${paymentMethod === "upi" ? "bg-[var(--accent)] text-black rotate-[-6deg]" : "bg-[var(--card)] text-[var(--accent)] border border-[var(--border)]"}`}>
                        <MdOutlineSmartphone size={22} />
                      </div>
                      <div className="text-left">
                        <p className="font-black text-sm uppercase italic tracking-tight">UPI Gateway</p>
                        <p className="text-[9px] font-bold opacity-30 uppercase tracking-wider">Gpay, Phonepe, Paytm</p>
                      </div>
                    </div>
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${paymentMethod === "upi" ? "border-[var(--accent)] bg-[var(--accent)]" : "border-[var(--border)]"}`}>
                      {paymentMethod === "upi" && <FaCheckCircle className="text-black" size={12} />}
                    </div>
                  </button>

                  {/* My Wallet */}
                  <button
                    onClick={() => setPaymentMethod("wallet")}
                    disabled={!isVerified}
                    className={`w-full p-4 rounded-2xl border-2 transition-all flex items-center justify-between group
                      ${paymentMethod === "wallet" ? "bg-[var(--card)] border-[var(--accent)] shadow-xl scale-[1.01]" : "bg-[var(--foreground)]/[0.02] border-transparent hover:border-[var(--accent)]/10"}`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-500 ${paymentMethod === "wallet" ? "bg-[var(--accent)] text-black rotate-[-6deg]" : "bg-[var(--card)] text-[var(--accent)] border border-[var(--border)]"}`}>
                        <IoWalletOutline size={22} />
                      </div>
                      <div className="text-left">
                        <p className="font-black text-sm uppercase italic tracking-tight">My Wallet</p>
                        <p className="text-[9px] font-bold opacity-30 uppercase tracking-wider">Balance: ₹{walletBalance.toFixed(2)}</p>
                      </div>
                    </div>
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${paymentMethod === "wallet" ? "border-[var(--accent)] bg-[var(--accent)]" : "border-[var(--border)]"}`}>
                      {paymentMethod === "wallet" && <FaCheckCircle className="text-black" size={12} />}
                    </div>
                  </button>
                </div>

                <div className="flex items-center justify-between px-2 mb-6">
                  <span className="font-black text-[10px] uppercase tracking-[0.3em] opacity-30 italic">Total Amount</span>
                  <span className="text-4xl font-black italic tracking-tighter">₹{price}</span>
                </div>

                {error && !loading && (
                  <div className="p-3 mb-5 rounded-xl bg-red-500/10 text-red-500 text-[10px] font-bold uppercase tracking-widest text-center border border-red-500/20 animate-shake">
                    {error}
                  </div>
                )}

                <button
                  onClick={handleProceed}
                  disabled={payLoading || !isVerified}
                  className={`w-full py-4 rounded-[1.25rem] font-black uppercase tracking-[0.3em] text-[10px] italic transition-all duration-700 shadow-2xl flex items-center justify-center gap-3
                    ${!isVerified 
                      ? "bg-[var(--foreground)]/[0.05] text-[var(--foreground)]/10 cursor-not-allowed shadow-none" 
                      : "bg-[var(--accent)] text-black hover:bg-[var(--accent)] hover:brightness-110 shadow-[var(--accent)]/30 hover:scale-[1.02]"}`}
                >
                  {payLoading ? (
                    <span className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      Confirm & Pay
                      <FaArrowRight size={14} />
                    </>
                  )}
                </button>

                {!isVerified && (
                  <p className="text-center text-[9px] font-black uppercase tracking-[0.3em] mt-5 text-[var(--accent)] animate-pulse italic">
                    Please verify account to proceed
                  </p>
                )}


              </div>

            </div>

          </div>
        </div>
      </section>
    </AuthGuard>
  );
}


