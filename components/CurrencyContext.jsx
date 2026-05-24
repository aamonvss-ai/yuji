"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

const CurrencyContext = createContext();

export function CurrencyProvider({ children }) {
  const [currency, setCurrency] = useState("INR");
  const RATE = Number(process.env.NEXT_PUBLIC_USDT_RATE) || 98; // 1 USDT = 98 INR

  useEffect(() => {
    // Load currency preference from localStorage on mount
    const savedCurrency = localStorage.getItem("globalCurrency");
    if (savedCurrency && (savedCurrency === "INR" || savedCurrency === "USDT")) {
      setCurrency(savedCurrency);
    }
  }, []);

  const handleSetCurrency = (newCurrency) => {
    setCurrency(newCurrency);
    localStorage.setItem("globalCurrency", newCurrency);
  };

  const formatPrice = (inrAmount) => {
    if (inrAmount === null || inrAmount === undefined) return "";
    
    // Ensure inrAmount is a number
    const num = Number(inrAmount);
    if (isNaN(num)) return inrAmount;

    if (currency === "USDT") {
      const usdtVal = num / RATE;
      // Round to 2 decimal places
      return "$" + usdtVal.toFixed(2);
    }

    // Default to INR
    return "₹" + num.toLocaleString("en-IN");
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency: handleSetCurrency, formatPrice, RATE }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error("useCurrency must be used within a CurrencyProvider");
  }
  return context;
}
