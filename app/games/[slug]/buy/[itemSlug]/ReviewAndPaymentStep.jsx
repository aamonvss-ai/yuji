"use client";

import { useState } from "react";
import Image from "next/image";
import QRCode from "qrcode";
import logo from "@/public/logo.png";
import { Mail, Phone, User, Hash, MapPin } from "lucide-react";

export default function ReviewAndPaymentStep({
  step,
  setStep,
  itemName,
  itemImage,
  price,
  discount,
  totalPrice,
  userEmail,
  userPhone,
  reviewData,
  walletBalance,
  paymentMethod,
  setPaymentMethod,
  onPaymentComplete,
  slug,
  itemSlug,
}) {
  const [upiQR, setUpiQR] = useState("");
  const [isRedirecting, setIsRedirecting] = useState(false);


  // Generate UPI QR
  const handleUPI = async () => {
    setPaymentMethod("upi");

    const upiId = "yourupi@bank";
    const upiString = `upi://pay?pa=${upiId}&pn=YourStore&am=${totalPrice}&cu=INR`;

    const qr = await QRCode.toDataURL(upiString);
    setUpiQR(qr);
  };


  // Handle proceed to payment
  const handleProceed = async () => {
    if (!paymentMethod) {
      alert("Please select a payment method");
      return;
    }

    setIsRedirecting(true); // 🔑 start loading

    // Double check restricted regions before order
    const restrictedRegions = ["INDO", "ID", "PH", "SG", "RU", "MY", "MM"];
    const playerRegion = reviewData.region?.toUpperCase();

    if ((slug === "mobile-legends988" || slug === "mlbb-double332") && restrictedRegions.includes(playerRegion)) {
      alert(`Orders from ${playerRegion} region are not allowed for this product.`);
      setIsRedirecting(false);
      return;
    }

    try {
      const userId = localStorage.getItem("userId");
      const storedPhone = userPhone || localStorage.getItem("phone");

      // if (!storedPhone) {
      //   alert("Phone number missing. Please log in again.");
      //   setIsRedirecting(false);
      //   return;
      // }

      const orderPayload = {
        gameSlug: slug,
        itemSlug,
        itemName,
        playerId: reviewData.playerId,
        zoneId: reviewData.zoneId,
        paymentMethod,
        email: userEmail || null,
        phone: storedPhone,
        currency: "INR",
      };
      const token = localStorage.getItem("token");

      const res = await fetch("/api/order/create-gateway-order", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        }, body: JSON.stringify(orderPayload),
      });

      const data = await res.json();

      if (!data.success) {
        alert("Order failed: " + data.message);
        setIsRedirecting(false);
        return;
      }

      localStorage.setItem("pending_topup_order", data.orderId);

      // 🚀 redirect
      window.location.href = data.paymentUrl;
    } catch (err) {
      alert("Something went wrong. Please try again.");
      setIsRedirecting(false);
    }
  };



  return (
    <div className="space-y-6">
      {/* STEP 2: Review Content */}
      {step === 2 && (
        <>
          {/* Item Card */}
          <div className="flex items-center gap-4 bg-black/20 p-4 rounded-xl border border-gray-700">
            <Image
              src={itemImage || logo}
              alt="Item"
              width={65}
              height={65}
              className="rounded-xl"
            />
            <div>
              <h3 className="text-lg font-bold">{itemName}</h3>
              <p className="text-sm opacity-50">Selected item</p>
            </div>
          </div>

          {/* User Contact */}
          <div className="bg-[var(--card)]/40 p-5 rounded-2xl border border-[var(--border)] shadow-sm">
            <h3 className="font-bold text-base mb-4 flex items-center gap-2">
              <span className="w-1.5 h-4 bg-[var(--accent)] rounded-full" />
              Your Details
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-black/30 border border-white/5 group hover:border-[var(--accent)] transition-colors">
                <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-[var(--accent)]">
                  <Mail size={18} />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-[10px] text-[var(--muted)] uppercase font-bold tracking-wider">Email</span>
                  <span className="font-semibold text-sm truncate">{userEmail || "Not Provided"}</span>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-black/30 border border-white/5 group hover:border-[var(--accent)] transition-colors">
                <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-[var(--accent)]">
                  <Phone size={18} />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-[10px] text-[var(--muted)] uppercase font-bold tracking-wider">Phone</span>
                  <span className="font-semibold text-sm">{userPhone || "Not Provided"}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Game Details */}
          <div className="bg-[var(--card)]/40 p-5 rounded-2xl border border-[var(--border)] shadow-sm">
            <h3 className="font-bold text-base mb-4 flex items-center gap-2">
              <span className="w-1.5 h-4 bg-[var(--accent)] rounded-full" />
              Game Details
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-black/30 border border-white/5 group hover:border-[var(--accent)] transition-colors">
                <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-[var(--accent)]">
                  <User size={18} />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-[10px] text-[var(--muted)] uppercase font-bold tracking-wider">Username</span>
                  <span className="font-semibold text-sm truncate">{reviewData.userName}</span>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-black/30 border border-white/5 group hover:border-[var(--accent)] transition-colors">
                <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-[var(--accent)]">
                  <Hash size={18} />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-[10px] text-[var(--muted)] uppercase font-bold tracking-wider">User ID</span>
                  <span className="font-semibold text-sm">{reviewData.playerId}</span>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-black/30 border border-white/5 group hover:border-[var(--accent)] transition-colors">
                <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-[var(--accent)]">
                  <MapPin size={18} />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-[10px] text-[var(--muted)] uppercase font-bold tracking-wider">Zone ID</span>
                  <span className="font-semibold text-sm">{reviewData.zoneId}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div className="bg-black/20 p-4 rounded-xl border border-gray-700">
            <h3 className="font-semibold mb-3">Select Payment Method</h3>

            {/* Wallet Button */}
            <button
              disabled
              onClick={() => {
                if (walletBalance < totalPrice) return;
                setPaymentMethod("wallet");
              }}
              className={`w-full p-3 rounded-lg border text-left ${paymentMethod === "wallet"
                ? "border-[var(--accent)] bg-[var(--accent)]/20"
                : "border-gray-700"
                } ${walletBalance < totalPrice ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              Wallet (₹{walletBalance})
            </button>

            {walletBalance < totalPrice && (
              <p className="text-red-400 text-xs mt-1">
                Not enough balance. You need ₹{totalPrice}.
              </p>
            )}

            {/* UPI Button */}
            <button
              onClick={handleUPI}
              className={`w-full mt-3 p-3 rounded-lg border text-left ${paymentMethod === "upi"
                ? "border-[var(--accent)] bg-[var(--accent)]/20"
                : "border-gray-700"
                }`}
            >
              UPI Payment
            </button>
          </div>

          {/* Price Summary */}
          <div className="bg-black/20 p-4 rounded-xl border border-gray-700">
            <h3 className="font-semibold mb-2">Price Summary</h3>
            <div className="flex items-center justify-between">
              <p>Price: ₹{price}</p>
              <p>Discount: -₹{discount}</p>
            </div>
            <p className="text-lg font-bold mt-2">Total: ₹{totalPrice}</p>

            <button
              onClick={handleProceed}
              disabled={
                isRedirecting ||
                !paymentMethod ||
                (paymentMethod === "wallet" && walletBalance < totalPrice)
              }
              className="
    bg-[var(--accent)] text-black p-3 rounded-lg w-full mt-4 font-semibold
    disabled:opacity-50 flex items-center justify-center gap-2
  "            >
              {isRedirecting ? (
                <>
                  <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  Redirecting…
                </>
              ) : (
                "Proceed to Pay"
              )}
            </button>
          </div>
        </>
      )}

      {/* STEP 3: Payment Content */}
      {step === 3 && (
        <>
          {/* UPI Payment */}
          {paymentMethod === "upi" && (
            <div className="bg-black/20 p-6 rounded-xl border border-gray-700 text-center">
              <p className="font-semibold mb-3">Scan to Pay</p>

              <div className="w-48 h-48 mx-auto bg-white p-3 rounded-xl">
                {upiQR ? (
                  <Image src={upiQR} alt="QR" width={200} height={200} />
                ) : (
                  <p>Generating QR...</p>
                )}
              </div>

              <button
                onClick={onPaymentComplete}
                className="bg-[var(--accent)] text-black mt-4 w-full py-3 rounded-lg font-semibold"
              >
                I Have Paid
              </button>
            </div>
          )}

          {/* Wallet Payment */}
          {paymentMethod === "wallet" && (
            <div className="bg-black/20 p-6 rounded-xl border border-gray-700 text-center">
              <p className="mb-2">Wallet Balance: ₹{walletBalance}</p>

              {walletBalance < totalPrice && (
                <p className="text-red-400 text-xs mb-3">
                  Not enough balance to complete this purchase.
                </p>
              )}

              <button
                onClick={onPaymentComplete}
                disabled={walletBalance < totalPrice}
                className="bg-[var(--accent)] text-black w-full py-3 rounded-lg font-semibold disabled:opacity-50"
              >
                Pay ₹{totalPrice}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}