"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import AuthGuard from "../../../../../components/AuthGuard";
import ValidationStep from "./ValidationStep";
import ReviewAndPaymentStep from "./ReviewAndPaymentStep";
import { saveVerifiedPlayer } from "@/utils/storage/verifiedPlayerStorage";

import { FaUserCheck, FaClipboardCheck, FaWallet } from "react-icons/fa";

export default function BuyFlowPage() {
  const { slug, itemSlug } = useParams();
  const params = useSearchParams();

  const steps = [
    { num: 1, title: "1.Validate", Icon: FaUserCheck },
    { num: 2, title: "2.Review", Icon: FaClipboardCheck },
    { num: 3, title: "3.Payment", Icon: FaWallet },
  ];

  /* ================= FLOW STATE ================= */
  const [step, setStep] = useState(1);
  const [playerId, setPlayerId] = useState("");
  const [zoneId, setZoneId] = useState("");
  const [reviewData, setReviewData] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("upi");
  const [showSuccess, setShowSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(""); // 👈 NEW
  const [game, setGame] = useState(null); // 👈 NEW

  /* ================= USER DATA ================= */
  const [userEmail, setUserEmail] = useState("");
  const [userPhone, setUserPhone] = useState("");
  const [walletBalance, setWalletBalance] = useState(0);

  /* ================= VERIFIED ITEM DATA ================= */
  const [item, setItem] = useState(null);
  const [price, setPrice] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);

  /* ================= FALLBACK UI PARAMS (NOT TRUSTED) ================= */
  const fallbackName = params.get("name");
  const fallbackImage = params.get("image");

  /* ================= LOAD USER ================= */
  useEffect(() => {
    setUserEmail(localStorage.getItem("email") || "");
    setUserPhone(localStorage.getItem("phone") || "");
    setWalletBalance(Number(localStorage.getItem("walletBalance") || 0));
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
        setGame(gameData); // Store game data

        if (!gameData?.itemId) return;

        const foundItem = gameData.itemId.find(
          (i) => i.itemSlug === itemSlug
        );

        if (!foundItem) {
          alert("Invalid item selected");
          return;
        }

        const sPrice = Number(foundItem.sellingPrice);
        const dPrice = Number(foundItem.dummyPrice || sPrice);
        const calcDiscount = dPrice > sPrice ? dPrice - sPrice : 0;

        setItem(foundItem);
        setPrice(dPrice);
        setDiscount(calcDiscount);
        setTotalPrice(sPrice);
      })
      .catch(() => {
        alert("Failed to load item price");
      });
  }, [slug, itemSlug]);

  /* ================= VALIDATE PLAYER ================= */
  /* ================= PLAYER VALIDATION ================= */
  const handleValidate = async () => {
    setError(""); // reset error

    const fieldOneLabel = game?.inputFieldOne || "Player ID";
    const fieldTwoLabel = game?.inputFieldTwo || "Zone ID";
    const hasFieldTwo = !!(game?.inputFieldTwo || (game?.inputFieldTwoOption && game.inputFieldTwoOption.length > 0));

    if (!playerId || (hasFieldTwo && !zoneId)) {
      setError(`Please enter your ${fieldOneLabel}${hasFieldTwo ? ` and ${fieldTwoLabel}` : ""}`);
      return;
    }

    setLoading(true);

    // Determine if MLBB based on slug and name
    const name = game?.gameName?.toLowerCase() || "";
    const isMLBB = slug?.includes("mlbb") || name.includes("mlbb") || slug?.includes("legends988") || slug?.includes("weeklymonthly-bundle");

    // Skip validation ONLY if not required AND not an MLBB variant
    if (game?.isValidationRequired === false && !isMLBB) {
      setReviewData({
        userName: game?.gameName || "Player",
        region: "Global",
        playerId,
        zoneId: zoneId || "NA",
      });
      setLoading(false);
      setStep(2);
      return;
    }

    try {
      let username = "Unknown";
      let region = "Global";
      let isValid = false;

      // Use a standard gameId for MLBB variants to ensure the name check works
      const baseGameId = isMLBB ? "mobile-legends988" : (game?.gameId || slug);
      const productId = `${baseGameId}_${item?.itemId || itemSlug}`;

      const nameRes = await fetch("/api/check-region/namecheck", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          playerId,
          zoneId: zoneId || "NA",
        }),
      });
      const nameData = await nameRes.json();

      if (
        (nameData?.success === 200 || nameData?.success === true) &&
        (nameData?.data?.username || nameData?.data?.name) &&
        nameData?.data?.valid !== false
      ) {
        username = nameData?.data?.username || nameData?.data?.name || "Unknown";
        region = nameData?.data?.region || "Global";
        isValid = true;
      }

      if (isValid) {
        // Filter restricted regions for SPECIFIC slugs
        const restrictedSlugs = ["mobile-legends988", "mlbb-double332", "weeklymonthly-bundle931"];
        if (restrictedSlugs.includes(slug)) {
          const restrictedRegions = ["INDO", "ID", "PH", "SG", "RU", "MY", "MM"];
          const playerRegion = region.toUpperCase();

          if (restrictedRegions.includes(playerRegion)) {
            setError(`Sorry, we don't support orders from ${playerRegion} region for this item.`);
            setLoading(false);
            return;
          }
        }

        saveVerifiedPlayer({
          playerId,
          zoneId,
          username,
          region,
          savedAt: Date.now(),
        });

        setReviewData({
          userName: username,
          region,
          playerId,
          zoneId: zoneId || "NA",
        });

        setLoading(false);
        setStep(2);
      } else {
        // If namecheck failed, use the error from nameData
        const serverMsg = nameData?.message || "Player not found";
        setError(serverMsg.toLowerCase().includes("success") ? "Player ID not found." : serverMsg);
        setLoading(false);
      }
    } catch (err) {
      console.error("Complete Validation Error:", err);
      setError("Validation failed. Please try again.");
      setLoading(false);
    }
  };

  /* ================= PAYMENT ================= */
  const handlePayment = async () => {
    // Backend MUST re-verify price again
    setTimeout(() => setShowSuccess(true), 500);
  };

  return (
    <AuthGuard>
      <section className="px-6 py-8 max-w-3xl mx-auto">

        {/* ================= STEP INDICATOR ================= */}
        <div className="relative flex items-center justify-between mb-10">
          <div className="absolute top-[31%] left-[15%] w-[70%] h-[3px] bg-gray-700 -z-0 rounded-full">
            <div
              className="h-full bg-[var(--accent)] transition-all duration-500 rounded-full"
              style={{
                width:
                  step === 1 ? "0%" :
                    step === 2 ? "50%" :
                      step === 3 ? "100%" : "0%",
              }}
            />
          </div>

          {steps.map((s) => (
            <div key={s.num} className="relative z-10 flex flex-col items-center w-1/3">
              <div
                className={`w-11 h-11 flex items-center justify-center rounded-full border-2 transition-all duration-500
                ${step >= s.num
                    ? "border-[var(--accent)] bg-[var(--accent)] text-black shadow-lg shadow-[var(--accent)]/30 scale-110"
                    : "border-gray-700 bg-[var(--card)] text-gray-500 scale-100"}`}
              >
                <s.Icon size={18} />
              </div>

              <p className={`text-[10px] font-black uppercase tracking-widest mt-3 transition-colors duration-500 ${step >= s.num ? "text-[var(--accent)]" : "text-gray-500 opacity-50"}`}>
                {s.title}
              </p>
            </div>
          ))}
        </div>

        {/* ================= SUCCESS ================= */}
        {showSuccess && (
          <div className="bg-green-600/20 border border-green-600 text-green-500 p-6 rounded-xl text-center shadow-lg">
            <h2 className="text-xl font-bold">Payment Successful ✔</h2>
            <p className="text-sm mt-2 opacity-80">Your order has been placed.</p>
          </div>
        )}

        {!showSuccess && (
          <>
            {/* STEP 1 */}
            {step === 1 && (
              <ValidationStep
                game={game}
                playerId={playerId}
                setPlayerId={setPlayerId}
                zoneId={zoneId}
                setZoneId={setZoneId}
                onValidate={handleValidate}
                loading={loading}
                error={error}
              />
            )}

            {/* STEP 2 & 3 */}
            {(step === 2 || step === 3) && reviewData && (
              <ReviewAndPaymentStep
                step={step}
                setStep={setStep}
                itemName={item?.itemName || fallbackName}
                itemImage={item?.itemImageId?.image || fallbackImage}
                price={price}
                discount={discount}
                totalPrice={totalPrice}
                userEmail={userEmail}
                userPhone={userPhone}
                reviewData={reviewData}
                walletBalance={walletBalance}
                paymentMethod={paymentMethod}
                setPaymentMethod={setPaymentMethod}
                onPaymentComplete={handlePayment}
                slug={slug}
                itemSlug={itemSlug}
              />
            )}
          </>
        )}
      </section>
    </AuthGuard>
  );
}
