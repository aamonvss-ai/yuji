"use client";

import { useState } from "react";
import Image from "next/image";
import QRCode from "qrcode";
import logo from "@/public/logo.png";
import { Mail, Phone, User, Hash, MapPin, Wallet, QrCode, Lock } from "lucide-react";


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
      alert("Please choose a payment method");
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
              <p className="text-sm opacity-50">Selected package</p>
            </div>
          </div>

          {/* User Contact */}
          <div className="bg-[var(--card)]/40 p-4 rounded-2xl border border-[var(--border)] shadow-sm">
            <h3 className="font-bold text-sm mb-3 flex items-center gap-2">
              <span className="w-1 h-3 bg-[var(--accent)] rounded-full" />
              Your Details
            </h3>
            <div className="flex flex-wrap sm:flex-nowrap gap-3">
              <div className="flex-1 flex items-center gap-2 p-2 rounded-xl bg-black/20 border border-white/5 min-w-[140px]">
                <div className="w-8 h-8 shrink-0 rounded-lg bg-white/5 flex items-center justify-center text-[var(--accent)]">
                  <Mail size={14} />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-[8px] text-[var(--muted)] uppercase font-bold tracking-wider">Email</span>
                  <span className="font-semibold text-[11px] truncate">{userEmail || "Not provided"}</span>
                </div>
              </div>
              <div className="flex-1 flex items-center gap-2 p-2 rounded-xl bg-black/20 border border-white/5 min-w-[140px]">
                <div className="w-8 h-8 shrink-0 rounded-lg bg-white/5 flex items-center justify-center text-[var(--accent)]">
                  <Phone size={14} />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-[8px] text-[var(--muted)] uppercase font-bold tracking-wider">Phone</span>
                  <span className="font-semibold text-[11px]">{userPhone || "Not provided"}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Game Details */}
          <div className="bg-[var(--card)]/40 p-4 rounded-2xl border border-[var(--border)] shadow-sm">
            <h3 className="font-bold text-sm mb-3 flex items-center gap-2">
              <span className="w-1 h-3 bg-[var(--accent)] rounded-full" />
              Game Info
            </h3>
            <div className="flex flex-wrap sm:flex-nowrap gap-2">
              <div className="flex-1 flex items-center gap-2 p-2 rounded-xl bg-black/20 border border-white/5 min-w-[100px]">
                <div className="w-8 h-8 shrink-0 rounded-lg bg-white/5 flex items-center justify-center text-[var(--accent)]">
                  <User size={14} />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-[8px] text-[var(--muted)] uppercase font-bold tracking-wider">User</span>
                  <span className="font-semibold text-[11px] truncate">{reviewData.userName}</span>
                </div>
              </div>
              <div className="flex-1 flex items-center gap-2 p-2 rounded-xl bg-black/20 border border-white/5 min-w-[100px]">
                <div className="w-8 h-8 shrink-0 rounded-lg bg-white/5 flex items-center justify-center text-[var(--accent)]">
                  <Hash size={14} />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-[8px] text-[var(--muted)] uppercase font-bold tracking-wider">ID</span>
                  <span className="font-semibold text-[11px]">{reviewData.playerId}</span>
                </div>
              </div>
              <div className="flex-1 flex items-center gap-2 p-2 rounded-xl bg-black/20 border border-white/5 min-w-[100px]">
                <div className="w-8 h-8 shrink-0 rounded-lg bg-white/5 flex items-center justify-center text-[var(--accent)]">
                  <MapPin size={14} />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-[8px] text-[var(--muted)] uppercase font-bold tracking-wider">Zone</span>
                  <span className="font-semibold text-[11px]">{reviewData.zoneId}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div className="bg-black/20 p-4 rounded-xl border border-gray-700">
            <h3 className="font-semibold mb-3">Choose Payment Method</h3>

            {/* Wallet Button */}
            {(() => {
              const storedUserType = typeof window !== 'undefined' ? localStorage.getItem("userType") || "user" : "user";
              const allowedRoles = ["owner", "admin", "member"];
              const isAllowedRole = allowedRoles.includes(storedUserType);
              const isWithinLimit = totalPrice <= 500;

              return (
                <div className="relative">
                  <button
                    onClick={() => {
                      setPaymentMethod("wallet");
                    }}
                    className={`w-full p-4 rounded-xl border-2 text-left transition-all flex items-center justify-between
                      ${paymentMethod === "wallet"
                        ? "border-[var(--accent)] bg-[var(--accent)]/10"
                        : "border-gray-700 hover:border-gray-500"
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${paymentMethod === "wallet" ? "bg-[var(--accent)] text-black" : "bg-white/5 text-gray-400"}`}>
                        <Wallet size={18} />
                      </div>
                      <div>
                        <p className="font-bold text-sm">Wallet Balance</p>
                        <p className="text-xs opacity-60">Pay using your loaded balance</p>
                      </div>
                    </div>
                    <span className="font-black">₹{walletBalance.toFixed(2)}</span>
                  </button>

                  {!isAllowedRole && (
                    <p className="text-amber-400 text-[10px] mt-1.5 flex items-center gap-1 font-bold">
                      <Lock size={10} /> Possibly restricted access (Verified at checkout)
                    </p>
                  )}

                  {!isWithinLimit && (
                    <p className="text-amber-400 text-[10px] mt-1.5 flex items-center gap-1 font-bold">
                      <Lock size={10} /> Wallet limit is ₹500. Use UPI for higher amounts.
                    </p>
                  )}
                </div>
              );
            })()}

            {/* UPI Button */}
            <button
              onClick={handleUPI}
              className={`w-full mt-3 p-4 rounded-xl border-2 text-left transition-all flex items-center justify-between
                ${paymentMethod === "upi"
                  ? "border-[var(--accent)] bg-[var(--accent)]/10"
                  : "border-gray-700 hover:border-gray-500"
                }`}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${paymentMethod === "upi" ? "bg-[var(--accent)] text-black" : "bg-white/5 text-gray-400"}`}>
                  <QrCode size={18} />
                </div>
                <div>
                  <p className="font-bold text-sm">Pay with UPI</p>
                  <p className="text-xs opacity-60">Instant payment via any UPI app</p>
                </div>
              </div>
            </button>
          </div>

          {/* Price Summary */}
          <div className="bg-black/20 p-4 rounded-xl border border-gray-700">
            <h3 className="font-bold text-sm mb-3 flex items-center gap-2 text-[var(--muted)] uppercase tracking-widest">
              <span className="w-1 h-3 bg-[var(--accent)] rounded-full" />
              Order Summary
            </h3>
            <div className="flex items-center justify-between text-sm mb-1 px-1">
              <span className="text-[var(--muted)]">Base Price</span>
              <span className="font-bold">₹{price}</span>
            </div>
            <div className="flex items-center justify-between text-sm mb-3 px-1">
              <span className="text-green-500">Discount Applied</span>
              <span className="font-bold text-green-500">-₹{discount}</span>
            </div>

            <div className="flex items-center justify-between bg-white/[0.03] p-3 rounded-xl border border-white/5 mb-4">
              <span className="text-xs font-black uppercase tracking-tighter italic">Total Amount</span>
              <span className="text-xl font-black text-[var(--accent)] italic">₹{totalPrice}</span>
            </div>

            <button
              onClick={handleProceed}
              disabled={
                isRedirecting ||
                !paymentMethod
              }
              className="
    bg-[var(--accent)] text-black p-3 rounded-lg w-full mt-4 font-semibold
    disabled:opacity-50 flex items-center justify-center gap-2
  "            >
              {isRedirecting ? (
                <>
                  <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  Redirecting...
                </>
              ) : (
                <>
                  <Lock size={16} />
                  <span>Pay Now</span>
                </>
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
              <p className="font-semibold mb-3">Scan to pay</p>

              <div className="w-48 h-48 mx-auto bg-white p-3 rounded-xl">
                {upiQR ? (
                  <Image src={upiQR} alt="QR" width={200} height={200} />
                ) : (
                  <p>Creating QR...</p>
                )}
              </div>

              <button
                onClick={onPaymentComplete}
                className="bg-[var(--accent)] text-black mt-4 w-full py-3 rounded-lg font-semibold"
              >
                I Paid
              </button>
            </div>
          )}

          {/* Wallet Payment */}
          {paymentMethod === "wallet" && (
            <div className="bg-black/20 p-6 rounded-xl border border-gray-700 text-center">
              <p className="mb-2">Wallet Balance: ₹{walletBalance}</p>

              {walletBalance < totalPrice && (
                <p className="text-red-400 text-xs mb-3">
                  Not enough balance for this order.
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