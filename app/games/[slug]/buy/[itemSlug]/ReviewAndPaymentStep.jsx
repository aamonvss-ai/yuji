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

    if ((slug === "mobile-legends270" || slug === "mlbb-double332") && restrictedRegions.includes(playerRegion)) {
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
        zoneId: reviewData.zoneId || "NA",
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
    <div className="space-y-3">
      {/* STEP 2: Review Content */}
      {step === 2 && (
        <>
          {/* Item Card */}
          <div className="flex items-center gap-3 bg-[var(--card)] p-3 rounded-xl border border-[var(--border)] shadow-sm">
            <div className="w-12 h-12 relative rounded-lg overflow-hidden border border-[var(--border)]/50">
              <Image
                src={itemImage || logo}
                alt="Item"
                fill
                className="object-cover"
              />
            </div>
            <div>
              <h3 className="text-base font-black uppercase tracking-tight italic leading-tight">{itemName}</h3>
              <p className="text-[9px] font-bold text-[var(--muted)] uppercase tracking-widest opacity-60">Package</p>
            </div>
          </div>

          {/* User Contact */}
          <div className="bg-[var(--card)] p-3.5 rounded-2xl border border-[var(--border)] shadow-sm">
            <h3 className="font-black text-[9px] mb-2 flex items-center gap-1.5 text-[var(--muted)] uppercase tracking-[0.2em]">
              <span className="w-1.5 h-1.5 bg-[var(--accent)] rounded-full animate-pulse" />
              Your Details
            </h3>
            <div className="flex flex-wrap sm:flex-nowrap gap-2">
              <div className="flex-1 flex items-center gap-2 p-2 rounded-xl bg-[var(--foreground)]/[0.03] border border-[var(--border)]/50 min-w-[130px]">
                <div className="w-7 h-7 shrink-0 rounded-lg bg-[var(--accent)]/10 flex items-center justify-center text-[var(--accent)]">
                  <Mail size={13} />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-[8px] text-[var(--muted)] uppercase font-black tracking-widest opacity-50">Email</span>
                  <span className="font-black text-[10px] truncate uppercase italic">{userEmail || "Not provided"}</span>
                </div>
              </div>
              <div className="flex-1 flex items-center gap-2 p-2 rounded-xl bg-[var(--foreground)]/[0.03] border border-[var(--border)]/50 min-w-[130px]">
                <div className="w-7 h-7 shrink-0 rounded-lg bg-[var(--accent)]/10 flex items-center justify-center text-[var(--accent)]">
                  <Phone size={13} />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-[8px] text-[var(--muted)] uppercase font-black tracking-widest opacity-50">Phone</span>
                  <span className="font-black text-[10px] uppercase italic">{userPhone || "Not provided"}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Game Details */}
          <div className="bg-[var(--card)] p-3.5 rounded-2xl border border-[var(--border)] shadow-sm">
            <h3 className="font-black text-[9px] mb-2 flex items-center gap-1.5 text-[var(--muted)] uppercase tracking-[0.2em]">
              <span className="w-1.5 h-1.5 bg-[var(--accent)] rounded-full animate-pulse" />
              Game Info
            </h3>
            <div className="space-y-2">
              {/* Row 1: User */}
              <div className="flex items-center gap-2 p-2 rounded-xl bg-[var(--foreground)]/[0.03] border border-[var(--border)]/50">
                <div className="w-7 h-7 shrink-0 rounded-lg bg-[var(--accent)]/10 flex items-center justify-center text-[var(--accent)]">
                  <User size={13} />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-[8px] text-[var(--muted)] uppercase font-black tracking-widest opacity-50">User</span>
                  <span className="font-black text-[11px] truncate uppercase italic">{reviewData.userName}</span>
                </div>
              </div>

              {/* Row 2: ID & Zone */}
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center gap-2 p-2 rounded-xl bg-[var(--foreground)]/[0.03] border border-[var(--border)]/50">
                  <div className="w-7 h-7 shrink-0 rounded-lg bg-[var(--accent)]/10 flex items-center justify-center text-[var(--accent)]">
                    <Hash size={13} />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-[8px] text-[var(--muted)] uppercase font-black tracking-widest opacity-50">ID</span>
                    <span className="font-black text-[11px] uppercase italic">{reviewData.playerId}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-xl bg-[var(--foreground)]/[0.03] border border-[var(--border)]/50">
                  <div className="w-7 h-7 shrink-0 rounded-lg bg-[var(--accent)]/10 flex items-center justify-center text-[var(--accent)]">
                    <MapPin size={13} />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-[8px] text-[var(--muted)] uppercase font-black tracking-widest opacity-50">Zone</span>
                    <span className="font-black text-[10px] uppercase italic">{reviewData.zoneId || "NA"}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div className="bg-[var(--card)] p-3.5 rounded-2xl border border-[var(--border)] shadow-sm">
            <h3 className="font-black text-[9px] mb-2 flex items-center gap-1.5 text-[var(--muted)] uppercase tracking-[0.2em]">
              <span className="w-1.5 h-1.5 bg-[var(--accent)] rounded-full animate-pulse" />
              Payment Method
            </h3>

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
                    className={`w-full p-2.5 rounded-xl border-2 text-left transition-all flex items-center justify-between
                      ${paymentMethod === "wallet"
                        ? "border-[var(--accent)] bg-[var(--accent)]/5"
                        : "border-[var(--border)] hover:border-[var(--accent)]/20"
                      }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`p-2 rounded-lg ${paymentMethod === "wallet" ? "bg-[var(--accent)] text-black" : "bg-[var(--foreground)]/[0.03] text-[var(--muted)]"}`}>
                        <Wallet size={16} />
                      </div>
                      <div>
                        <p className="font-black text-[10px] uppercase italic tracking-tight">Wallet Balance</p>
                        <p className="text-[8px] font-bold text-[var(--muted)] uppercase opacity-60">Pay with balance</p>
                      </div>
                    </div>
                    <span className="font-black text-xs italic">₹{walletBalance.toFixed(2)}</span>
                  </button>

                  {(!isAllowedRole || !isWithinLimit) && (
                    <div className="flex gap-2 mt-1 px-1">
                      {!isAllowedRole && (
                        <p className="text-amber-500 text-[7px] flex items-center gap-1 font-black uppercase tracking-widest opacity-80">
                          <Lock size={8} /> Restricted
                        </p>
                      )}
                      {!isWithinLimit && (
                        <p className="text-amber-500 text-[7px] flex items-center gap-1 font-black uppercase tracking-widest opacity-80">
                          <Lock size={8} /> Limit ₹500
                        </p>
                      )}
                    </div>
                  )}
                </div>
              );
            })()}

            {/* UPI Button */}
            <button
              onClick={handleUPI}
              className={`w-full mt-2 p-2.5 rounded-xl border-2 text-left transition-all flex items-center justify-between
                ${paymentMethod === "upi"
                  ? "border-[var(--accent)] bg-[var(--accent)]/5"
                  : "border-[var(--border)] hover:border-[var(--accent)]/20"
                }`}
            >
              <div className="flex items-center gap-2.5">
                <div className={`p-2 rounded-lg ${paymentMethod === "upi" ? "bg-[var(--accent)] text-black" : "bg-[var(--foreground)]/[0.03] text-[var(--muted)]"}`}>
                  <QrCode size={16} />
                </div>
                <div>
                  <p className="font-black text-[10px] uppercase italic tracking-tight">Pay with UPI</p>
                  <p className="text-[8px] font-bold text-[var(--muted)] uppercase opacity-60">Instant payment</p>
                </div>
              </div>
            </button>
          </div>

          {/* Price Summary */}
          <div className="bg-[var(--foreground)]/[0.03] p-4 rounded-2xl border border-[var(--border)] shadow-sm">
            <h3 className="font-black text-[9px] mb-3 flex items-center gap-1.5 text-[var(--muted)] uppercase tracking-[0.2em]">
              <span className="w-1.5 h-1.5 bg-[var(--accent)] rounded-full animate-pulse" />
              Order Summary
            </h3>

            <div className="space-y-1.5 mb-3 px-1">
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-[var(--muted)] font-medium">Base Price</span>
                <span className="font-bold text-[var(--foreground)]">₹{price}</span>
              </div>
              {discount > 0 && (
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-emerald-500 font-medium">Discount Applied</span>
                  <span className="font-bold text-emerald-500">-₹{discount}</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between bg-[var(--accent)]/5 p-3 rounded-xl border border-[var(--accent)]/10 mb-3">
              <span className="text-[9px] font-black uppercase tracking-widest text-[var(--muted)] italic">Total Amount</span>
              <span className="text-xl font-black text-[var(--accent)] italic tracking-tighter">₹{totalPrice}</span>
            </div>

            <button
              onClick={handleProceed}
              disabled={isRedirecting || !paymentMethod}
              className="group relative w-full py-3 px-6 rounded-xl bg-[var(--accent)] text-black font-black uppercase text-[10px] tracking-[0.2em] transition-all duration-300 hover:scale-[1.02] active:scale-95 disabled:opacity-50 shadow-xl shadow-[var(--accent)]/20"
            >
              <div className="flex items-center justify-center gap-2">
                {isRedirecting ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    <span>Redirecting...</span>
                  </>
                ) : (
                  <>
                    <Lock size={12} className="group-hover:rotate-12 transition-transform" />
                    <span>Pay Now</span>
                  </>
                )}
              </div>
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