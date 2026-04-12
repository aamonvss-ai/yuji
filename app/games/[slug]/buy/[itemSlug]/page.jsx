"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import AuthGuard from "../../../../../components/AuthGuard";
import ValidationStep from "./ValidationStep";
import ReviewAndPaymentStep from "./ReviewAndPaymentStep";
import { saveVerifiedPlayer } from "@/utils/storage/verifiedPlayerStorage";

export default function BuyFlowPage() {
  const { slug, itemSlug } = useParams();
  const params = useSearchParams();

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

        const sellingPrice = Number(foundItem.sellingPrice);
        const dummyPrice = Number(foundItem.dummyPrice || 0);
        const calculatedDiscount =
          dummyPrice > sellingPrice ? dummyPrice - sellingPrice : 0;

        setItem(foundItem);
        setPrice(sellingPrice);
        setDiscount(calculatedDiscount);
        setTotalPrice(sellingPrice);
      })
      .catch(() => {
        alert("Failed to load item price");
      });
  }, [slug, itemSlug]);

  /* ================= VALIDATE PLAYER ================= */
  const handleValidate = async () => {
    setError(""); // reset error

    const isZoneRequired = !!(game?.inputFieldTwo || (game?.inputFieldTwoOption && game.inputFieldTwoOption.length > 0));

    if (!playerId || (isZoneRequired && !zoneId)) {
      setError(isZoneRequired ? "Please enter Player ID and Zone ID" : "Please enter Player ID");
      return;
    }

    setLoading(true);

    const isMLBB = 
      slug?.includes("mlbb") || 
      slug?.includes("mobile-legends") || 
      slug?.includes("bundle") ||
      game?.gameName?.toLowerCase().includes("mlbb") ||
      game?.gameName?.toLowerCase().includes("bundle");

    if (game?.isValidationRequired === false || !isMLBB) {
      setReviewData({
        userName: isMLBB ? "Manual Order" : (game?.gameName || "Game Order"),
        region: "Global",
        playerId,
        zoneId: zoneId || "0000",
      });
      setLoading(false);
      setStep(2);
      return;
    }

    try {
      const res = await fetch("/api/check-region", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: playerId, zone: zoneId }),
      });

      const data = await res.json();

      if (
        data?.success === 200 &&
        data?.data &&
        data.data.valid !== false &&
        (data?.data?.username || data?.data?.region)
      ) {
        // Filter restricted regions for mobile-legends988
        const restrictedRegions = ["INDO", "ID", "PH", "SG", "RU", "MY", "MM"];
        const playerRegion = data.data.region?.toUpperCase();

        if ((slug === "mobile-legends988" || slug === "mlbb-double332") && restrictedRegions.includes(playerRegion)) {
          setError(`Orders from ${playerRegion} region are not allowed for this product.`);
          setLoading(false);
          return;
        }

        saveVerifiedPlayer({
          playerId,
          zoneId,
          username: data.data.username || "Unknown",
          region: data.data.region || "Unknown",
          savedAt: Date.now(),
        });

        setReviewData({
          userName: data.data.username || "Unknown",
          region: data.data.region || "Unknown",
          playerId,
          zoneId,
        });

        setLoading(false);
        setStep(2);
      } else {
        const serverMsg = data?.message || "Invalid Player ID / Zone ID";
        const finalError = serverMsg.toLowerCase().includes("success")
          ? "Player Not Found (Invalid ID/Zone)"
          : serverMsg;

        setError(finalError);
        setLoading(false);
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
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

          {[1, 2, 3].map((num) => (
            <div key={num} className="relative z-10 flex flex-col items-center w-1/3">
              <div
                className={`w-10 h-10 flex items-center justify-center rounded-full border-2 font-semibold text-sm
                ${step >= num
                    ? "border-[var(--accent)] bg-[var(--accent)] text-black"
                    : "border-gray-600 bg-[var(--card)] text-gray-400"}`}
              >
                {num}
              </div>

              <p className={`text-sm mt-2 ${step >= num ? "text-[var(--accent)]" : "text-gray-500"}`}>
                {num === 1 ? "Validate" : num === 2 ? "Review" : "Payment"}
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
