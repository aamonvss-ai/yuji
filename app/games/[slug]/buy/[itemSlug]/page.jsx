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
import { useCurrency } from "@/components/CurrencyContext";

export default function BuyFlowPage() {
  const { slug, itemSlug } = useParams();
  const params = useSearchParams();
  const router = useRouter();
  const { formatPrice } = useCurrency();

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
      const baseGameId = isMLBB ? "mobile-legends114" : (game?.gameId || slug);
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
        const restrictedSlugs = ["mobile-legends114", "mlbb-double332", "weeklymonthly-bundle468"];
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
              <div className="bg-[var(--card)]/40 backdrop-blur-md border border-[var(--border)] rounded-xl p-3 shadow-xs relative overflow-hidden group">
                <div className="flex items-center gap-3.5 relative z-10">
                  <div className="relative shrink-0">
                    <div className="w-14 h-14 sm:w-16 sm:h-16 relative rounded-lg overflow-hidden border border-[var(--border)] bg-[var(--card)]">
                      <Image
                        src={item?.itemImageId?.image || fallbackImage || logo}
                        alt={item?.itemName || "Item"}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                    {discountPercent > 0 && (
                      <span className="absolute -top-1.5 -left-1.5 bg-rose-500 text-white font-bold text-[7.5px] px-1.5 py-0.5 rounded shadow-xs z-20">
                        {discountPercent}% OFF
                      </span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="bg-[var(--accent)]/10 text-[var(--accent)] text-[8px] font-bold uppercase px-1.5 py-0.5 rounded tracking-wider">
                        • Instant Delivery
                      </span>
                    </div>
                    <h1 className="text-base sm:text-lg font-bold text-[var(--foreground)] tracking-tight leading-tight truncate">
                      {item?.itemName || fallbackName}
                    </h1>
                    <div className="flex items-baseline gap-2 mt-0.5">
                      <span className="text-lg sm:text-xl font-black text-[var(--accent)] tracking-tight">{formatPrice(price)}</span>
                      {dummyPrice > price && (
                        <span className="text-xs font-semibold text-[var(--muted)] opacity-60 line-through">{formatPrice(dummyPrice)}</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="absolute top-3 right-3 text-[var(--muted)] opacity-40 hover:opacity-100 transition-opacity">
                  <MdHelpOutline size={16} />
                </div>
              </div>

              {/* MORE PACKS */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 px-4">
                  <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />
                  <h3 className="font-black text-[9px] uppercase tracking-[0.2em] italic opacity-40">More packs you may like</h3>
                </div>

                <div className="flex overflow-x-auto snap-x pb-2 gap-2 no-scrollbar scroll-smooth">
                  {relatedItems.map((r) => (
                    <Link
                      key={r.itemSlug}
                      href={`/games/${slug}/buy/${r.itemSlug}`}
                      className="flex-shrink-0 w-[84px] md:w-[100px] snap-start bg-[var(--card)]/10 hover:bg-[var(--card)]/30 border-2 border-transparent hover:border-[var(--accent)]/20 px-2 py-1.5 rounded-xl transition-all duration-300 group shadow-sm hover:shadow-xl hover:-translate-y-1"
                    >
                      <p className="text-[8px] font-bold opacity-40 uppercase tracking-tight mb-0.5 truncate group-hover:text-[var(--accent)] transition-colors">{r.itemName}</p>
                      <p className="text-sm font-black italic tracking-tighter">{formatPrice(r.sellingPrice)}</p>
                    </Link>
                  ))}

                  {/* Active Item */}
                  <div className="flex-shrink-0 w-[84px] md:w-[100px] snap-start bg-[var(--card)]/30 border-2 border-[var(--accent)] px-2 py-1.5 rounded-xl relative shadow-lg">
                    <p className="text-[8px] font-bold text-[var(--accent)] uppercase tracking-tight mb-0.5 truncate">{item?.itemName}</p>
                    <p className="text-sm font-black text-[var(--accent)] italic tracking-tighter">{formatPrice(price)}</p>
                    <div className="absolute top-1 right-1">
                      <FaCheckCircle className="text-[var(--accent)]" size={8} />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: INFO & PAYMENT */}
            <div className="lg:col-span-7 space-y-6">

              {/* 1. PLAYER INFO */}
              <div className={`bg-[var(--card)]/40 backdrop-blur-md border transition-all duration-300 rounded-xl p-3.5 sm:p-4 shadow-xs relative overflow-hidden ${!isVerified ? 'border-[var(--border)]' : 'border-emerald-500/40'}`}>
                {/* Progress Indicator */}
                <div className="absolute top-0 left-0 h-0.5 bg-[var(--accent)] transition-all duration-500" style={{ width: isVerified ? '100%' : '50%' }} />

                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className={`w-1.5 h-4 rounded-full transition-colors duration-300 ${isVerified ? 'bg-emerald-500' : 'bg-[var(--accent)]'}`} />
                    <h2 className="text-sm font-bold text-[var(--foreground)] tracking-tight">1. Player Info</h2>
                  </div>
                  <HelpImagePopup />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-3">
                  <div className="relative group">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)] group-focus-within:text-[var(--accent)] transition-colors pointer-events-none">
                      <FaUser size={12} />
                    </div>
                    <input
                      value={playerId}
                      onChange={(e) => {
                        setPlayerId(e.target.value);
                        setIsVerified(false);
                      }}
                      placeholder={game?.inputFieldOne || "User ID"}
                      className="w-full bg-[var(--foreground)]/[0.03] border border-[var(--border)] focus:border-[var(--accent)] focus:bg-[var(--card)] rounded-lg py-2 pl-9 pr-3 text-xs font-semibold tracking-tight outline-none transition-all placeholder:text-[var(--muted)]/40 text-[var(--foreground)]"
                    />
                  </div>

                  {(game?.inputFieldTwo || (game?.inputFieldTwoOption && game.inputFieldTwoOption.length > 0)) && (
                    <div className="relative group">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)] group-focus-within:text-[var(--accent)] transition-colors pointer-events-none">
                        <FaHistory size={12} className="rotate-90" />
                      </div>
                      <input
                        value={zoneId}
                        onChange={(e) => {
                          setZoneId(e.target.value);
                          setIsVerified(false);
                        }}
                        placeholder={game?.inputFieldTwo || "Server ID"}
                        className="w-full bg-[var(--foreground)]/[0.03] border border-[var(--border)] focus:border-[var(--accent)] focus:bg-[var(--card)] rounded-lg py-2 pl-9 pr-3 text-xs font-semibold tracking-tight outline-none transition-all placeholder:text-[var(--muted)]/40 text-[var(--foreground)]"
                      />
                    </div>
                  )}
                </div>

                <button
                  onClick={handleValidate}
                  disabled={loading}
                  className={`w-full py-2.5 rounded-lg font-bold uppercase tracking-wider text-[10px] transition-all duration-300 flex items-center justify-center gap-2 mb-3 border
                    ${loading
                      ? "opacity-50 cursor-not-allowed border-transparent bg-[var(--foreground)]/[0.05]"
                      : isVerified
                        ? "bg-emerald-500 text-white border-emerald-500 shadow-xs"
                        : "bg-[var(--accent)]/10 text-[var(--accent)] border-[var(--accent)]/30 hover:bg-[var(--accent)] hover:text-white hover:border-[var(--accent)]"}`}
                >
                  {loading ? (
                    <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  ) : isVerified ? (
                    <div className="flex items-center gap-1.5 animate-pop">
                      <FaCheckCircle size={11} />
                      <span>Verified: {verifiedName}</span>
                    </div>
                  ) : (
                    <><FaUserCheck size={12} /> Check Name</>
                  )}
                </button>

                {error && (
                  <div className="p-2.5 mb-3 rounded-lg bg-rose-500/10 text-rose-500 text-[10.5px] font-semibold text-center border border-rose-500/20">
                    {error}
                  </div>
                )}

                <div className="pt-2.5 border-t border-[var(--border)]/60">
                  <div className="flex items-center justify-between px-0.5 mb-1.5">
                    <div className="flex items-center gap-1.5 text-[var(--muted)]">
                      <FaHistory size={10} />
                      <span className="font-bold text-[9.5px] uppercase tracking-wider">Recent Players</span>
                    </div>
                    <button
                      onClick={() => setShowRecent(!showRecent)}
                      className="text-[9.5px] font-bold uppercase tracking-wider text-[var(--accent)] hover:underline"
                    >
                      {showRecent ? "HIDE" : "SHOW"}
                    </button>
                  </div>

                  {showRecent && (
                    <div className="space-y-1.5 pt-1 animate-fadeUp">
                      {recentPlayers.length > 0 ? (
                        recentPlayers.map((p, i) => (
                          <button
                            key={i}
                            onClick={() => {
                              setPlayerId(p.playerId);
                              setZoneId(p.zoneId);
                              setIsVerified(false);
                            }}
                            className="w-full p-2 rounded-lg bg-[var(--foreground)]/[0.02] hover:bg-[var(--foreground)]/[0.05] border border-[var(--border)] flex items-center justify-between transition-all group text-left"
                          >
                            <div>
                              <p className="font-bold text-[10.5px] text-[var(--foreground)] truncate">{p.username}</p>
                              <p className="text-[9px] text-[var(--muted)] font-medium">{p.playerId} {p.zoneId ? `(${p.zoneId})` : ""}</p>
                            </div>
                            <FaArrowRight size={9} className="text-[var(--accent)] opacity-0 group-hover:opacity-100 transition-opacity" />
                          </button>
                        ))
                      ) : (
                        <p className="text-center py-1.5 text-[10px] text-[var(--muted)]">No recent players saved</p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* 2. PAYMENT */}
              <div className={`bg-[var(--card)]/40 backdrop-blur-md border transition-all duration-300 rounded-xl p-3.5 sm:p-4 shadow-xs relative overflow-hidden ${isVerified ? 'border-[var(--border)] opacity-100' : 'border-[var(--border)]/40 opacity-50'}`}>
                {/* Lock Overlay for UX */}
                {!isVerified && <div className="absolute inset-0 z-20 cursor-not-allowed" title="Verify player info first" />}

                <div className="flex items-center gap-2 mb-3">
                  <div className={`w-1.5 h-4 rounded-full transition-colors duration-300 ${isVerified ? 'bg-[var(--accent)]' : 'bg-[var(--muted)]/40'}`} />
                  <h2 className="text-sm font-bold text-[var(--foreground)] tracking-tight">2. Payment</h2>
                </div>

                <div className="space-y-2 mb-4">
                  {/* UPI Gateway */}
                  <button
                    onClick={() => setPaymentMethod("upi")}
                    disabled={!isVerified}
                    className={`w-full p-2.5 rounded-lg border transition-all flex items-center justify-between group
                      ${paymentMethod === "upi" ? "bg-[var(--card)] border-[var(--accent)] shadow-xs" : "bg-[var(--foreground)]/[0.02] border-[var(--border)] hover:border-[var(--accent)]/30"}`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${paymentMethod === "upi" ? "bg-[var(--accent)] text-white" : "bg-[var(--foreground)]/[0.04] text-[var(--muted)] border border-[var(--border)]"}`}>
                        <MdOutlineSmartphone size={16} />
                      </div>
                      <div className="text-left">
                        <p className="font-bold text-xs text-[var(--foreground)]">UPI Gateway</p>
                        <p className="text-[9px] text-[var(--muted)] font-medium">GPay, PhonePe, Paytm, QR</p>
                      </div>
                    </div>
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all ${paymentMethod === "upi" ? "border-[var(--accent)] bg-[var(--accent)]" : "border-[var(--border)]"}`}>
                      {paymentMethod === "upi" && <FaCheckCircle className="text-white" size={9} />}
                    </div>
                  </button>

                  {/* My Wallet */}
                  <button
                    onClick={() => setPaymentMethod("wallet")}
                    disabled={!isVerified}
                    className={`w-full p-2.5 rounded-lg border transition-all flex items-center justify-between group
                      ${paymentMethod === "wallet" ? "bg-[var(--card)] border-[var(--accent)] shadow-xs" : "bg-[var(--foreground)]/[0.02] border-[var(--border)] hover:border-[var(--accent)]/30"}`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${paymentMethod === "wallet" ? "bg-[var(--accent)] text-white" : "bg-[var(--foreground)]/[0.04] text-[var(--muted)] border border-[var(--border)]"}`}>
                        <IoWalletOutline size={16} />
                      </div>
                      <div className="text-left">
                        <p className="font-bold text-xs text-[var(--foreground)]">My Wallet</p>
                        <p className="text-[9px] text-[var(--muted)] font-medium">Balance: {formatPrice(walletBalance)}</p>
                      </div>
                    </div>
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all ${paymentMethod === "wallet" ? "border-[var(--accent)] bg-[var(--accent)]" : "border-[var(--border)]"}`}>
                      {paymentMethod === "wallet" && <FaCheckCircle className="text-white" size={9} />}
                    </div>
                  </button>
                </div>

                <div className="flex items-center justify-between px-1 mb-3 pt-2 border-t border-[var(--border)]/60">
                  <span className="font-bold text-[10px] uppercase tracking-wider text-[var(--muted)]">Total Amount</span>
                  <span className="text-xl sm:text-2xl font-black text-[var(--accent)] tracking-tight">{formatPrice(price)}</span>
                </div>

                {error && !loading && (
                  <div className="p-2.5 mb-3 rounded-lg bg-rose-500/10 text-rose-500 text-[10.5px] font-semibold text-center border border-rose-500/20">
                    {error}
                  </div>
                )}

                <button
                  onClick={handleProceed}
                  disabled={payLoading || !isVerified}
                  className={`w-full py-2.5 rounded-lg font-bold uppercase tracking-wider text-[10px] transition-all duration-300 shadow-xs flex items-center justify-center gap-2
                    ${!isVerified
                      ? "bg-[var(--foreground)]/[0.05] text-[var(--muted)]/50 cursor-not-allowed border border-[var(--border)]"
                      : "bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)] active:scale-98"}`}
                >
                  {payLoading ? (
                    <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      Confirm & Pay
                      <FaArrowRight size={12} />
                    </>
                  )}
                </button>

                {!isVerified && (
                  <p className="text-center text-[10px] font-semibold mt-2.5 text-[var(--accent)]">
                    Please verify player info above to proceed
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


