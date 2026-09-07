"use client";

import { useState, useEffect } from "react";
import { 
  Download, 
  Smartphone, 
  Monitor, 
  Share, 
  PlusSquare, 
  Check, 
  X, 
  ArrowDownToLine, 
  Sparkles,
  MoreVertical,
  Laptop
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

let deferredInstallPrompt = null;

// Track PWA event helper
async function trackPwaEvent(eventType) {
  try {
    const userId = localStorage.getItem("userId") || null;
    const userName = localStorage.getItem("userName") || null;
    await fetch("/api/public/pwa-stats", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ eventType, userId, userName }),
    });
  } catch (e) {}
}

export default function PWAInstaller() {
  const [isInstallable, setIsInstallable] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState("android"); // 'android' | 'ios' | 'pc'
  const [isStandalone, setIsStandalone] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    // Check if running in standalone mode (already launched as PWA)
    const standaloneMode = 
      typeof window !== "undefined" && (
        window.matchMedia("(display-mode: standalone)").matches || 
        window.navigator.standalone || 
        document.referrer.includes("android-app://")
      );
    
    setIsStandalone(Boolean(standaloneMode));

    if (standaloneMode) {
      const hasTrackedSession = sessionStorage.getItem("pwa_tracked_session");
      if (!hasTrackedSession) {
        trackPwaEvent("standalone_session");
        sessionStorage.setItem("pwa_tracked_session", "true");
      }
    }

    // Auto-detect user platform
    if (typeof window !== "undefined" && navigator?.userAgent) {
      const ua = navigator.userAgent.toLowerCase();
      const isIOSDevice = /ipad|iphone|ipod/.test(ua) && !window.MSStream;
      const isAndroidDevice = /android/.test(ua);
      
      if (isIOSDevice) {
        setSelectedPlatform("ios");
      } else if (isAndroidDevice) {
        setSelectedPlatform("android");
      } else {
        // Desktop / Laptop
        setSelectedPlatform("android"); // default to android guide or pc
      }
    }

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      deferredInstallPrompt = e;
      setIsInstallable(true);
      trackPwaEvent("prompt_shown");
    };

    const handleAppInstalled = () => {
      setInstalled(true);
      setIsInstallable(false);
      deferredInstallPrompt = null;
      trackPwaEvent("app_installed");
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const triggerNativePrompt = async () => {
    if (deferredInstallPrompt) {
      try {
        deferredInstallPrompt.prompt();
        const choiceResult = await deferredInstallPrompt.userChoice;
        if (choiceResult.outcome === "accepted") {
          trackPwaEvent("install_accepted");
          setInstalled(true);
          setIsModalOpen(false);
        } else {
          trackPwaEvent("install_dismissed");
        }
        deferredInstallPrompt = null;
      } catch (err) {
        console.error("Install prompt error:", err);
      }
    }
  };

  const handleOpenModal = () => {
    if (deferredInstallPrompt) {
      // If native browser prompt is available, trigger directly
      triggerNativePrompt();
    } else {
      // Otherwise open friendly guide modal with Android / iOS / PC instructions
      setIsModalOpen(true);
      trackPwaEvent("prompt_shown");
    }
  };

  // If already running as installed standalone app, hide the download button
  if (isStandalone) {
    return null;
  }

  return (
    <>
      {/* HEADER DOWNLOAD / INSTALL BUTTON */}
      <button
        onClick={handleOpenModal}
        title="Download & Install Yuji MLBB App"
        aria-label="Download Yuji MLBB App"
        className="h-8 w-8 rounded-full flex items-center justify-center bg-[var(--foreground)]/[0.03] border border-[var(--border)]/50 hover:bg-[var(--accent)]/10 hover:border-[var(--accent)]/30 text-[var(--muted)] hover:text-[var(--accent)] transition-all active:scale-95 group shrink-0"
      >
        <Download size={15} className="group-hover:-translate-y-0.5 transition-transform duration-200" />
      </button>

      {/* INSTALL INSTRUCTION MODAL */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/70 backdrop-blur-md"
            />

            {/* Modal Dialog */}
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 12 }}
              transition={{ type: "spring", damping: 25, stiffness: 350 }}
              className="relative w-full max-w-[390px] bg-[var(--card)] border border-[var(--border)] rounded-3xl p-5 overflow-hidden text-left"
            >
              {/* Close Button */}
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-4 right-4 w-7 h-7 flex items-center justify-center text-[var(--muted)] hover:text-[var(--foreground)] bg-[var(--foreground)]/[0.04] hover:bg-[var(--foreground)]/[0.08] rounded-full transition-colors"
              >
                <X size={15} />
              </button>

              {/* App Icon + Title */}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-[var(--foreground)]/[0.04] border border-[var(--border)] p-1.5 flex items-center justify-center overflow-hidden shrink-0">
                  <Image src="/logo.png" alt="Yuji MLBB" width={42} height={42} className="object-contain rounded-xl" />
                </div>
                <div>
                  <h3 className="text-[15px] font-bold text-[var(--foreground)] tracking-tight">
                    Yuji MLBB App
                  </h3>
                  <p className="text-[11.5px] text-[var(--muted)]">
                    Fast & Instant Diamond Delivery
                  </p>
                </div>
              </div>

              {/* PLATFORM SWITCHER TABS */}
              <div className="flex items-center p-1 bg-[var(--foreground)]/[0.04] border border-[var(--border)] rounded-xl gap-1 mb-4 text-xs font-semibold">
                <button
                  onClick={() => setSelectedPlatform("android")}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg transition-all ${
                    selectedPlatform === "android"
                      ? "bg-[var(--accent)] text-white font-bold"
                      : "text-[var(--muted)] hover:text-[var(--foreground)]"
                  }`}
                >
                  <Smartphone size={13} />
                  <span>Android</span>
                </button>
                <button
                  onClick={() => setSelectedPlatform("ios")}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg transition-all ${
                    selectedPlatform === "ios"
                      ? "bg-[var(--accent)] text-white font-bold"
                      : "text-[var(--muted)] hover:text-[var(--foreground)]"
                  }`}
                >
                  <Smartphone size={13} />
                  <span>iOS (iPhone)</span>
                </button>
                <button
                  onClick={() => setSelectedPlatform("pc")}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg transition-all ${
                    selectedPlatform === "pc"
                      ? "bg-[var(--accent)] text-white font-bold"
                      : "text-[var(--muted)] hover:text-[var(--foreground)]"
                  }`}
                >
                  <Laptop size={13} />
                  <span>PC / Mac</span>
                </button>
              </div>

              {/* PLATFORM CONTENT */}
              {selectedPlatform === "android" && (
                <div className="space-y-3 mb-4 p-3.5 rounded-2xl bg-[var(--foreground)]/[0.02] border border-[var(--border)] text-xs text-[var(--foreground)]">
                  <div className="font-bold text-[var(--accent)] flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Smartphone size={14} /> Android Chrome / Browser
                    </span>
                    <span className="text-[10px] uppercase font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                      Instant PWA
                    </span>
                  </div>

                  {deferredInstallPrompt ? (
                    <button
                      onClick={triggerNativePrompt}
                      className="w-full py-2.5 px-4 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-98"
                    >
                      <Download size={14} />
                      <span>Tap to Install App Now</span>
                    </button>
                  ) : null}

                  {/* Android Step-by-Step */}
                  <div className="space-y-2.5 pt-1">
                    <div className="flex items-start gap-2.5">
                      <div className="w-5 h-5 rounded-full bg-[var(--accent)]/15 text-[var(--accent)] font-bold flex items-center justify-center shrink-0 text-[10px]">
                        1
                      </div>
                      <p className="text-[11.5px] leading-snug">
                        Tap the <strong className="text-[var(--foreground)]">3 dots menu</strong> <MoreVertical size={13} className="inline text-[var(--accent)]" /> at the top-right of your browser.
                      </p>
                    </div>

                    <div className="flex items-start gap-2.5">
                      <div className="w-5 h-5 rounded-full bg-[var(--accent)]/15 text-[var(--accent)] font-bold flex items-center justify-center shrink-0 text-[10px]">
                        2
                      </div>
                      <p className="text-[11.5px] leading-snug">
                        Tap <strong className="text-[var(--foreground)]">&quot;Install app&quot;</strong> or <strong className="text-[var(--foreground)]">&quot;Add to Home screen&quot;</strong>.
                      </p>
                    </div>

                    <div className="flex items-start gap-2.5">
                      <div className="w-5 h-5 rounded-full bg-[var(--accent)]/15 text-[var(--accent)] font-bold flex items-center justify-center shrink-0 text-[10px]">
                        3
                      </div>
                      <p className="text-[11.5px] leading-snug">
                        Tap <strong className="text-[var(--foreground)]">Install</strong> to add Yuji MLBB app to your home screen!
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {selectedPlatform === "ios" && (
                <div className="space-y-3 mb-4 p-3.5 rounded-2xl bg-[var(--foreground)]/[0.02] border border-[var(--border)] text-xs text-[var(--foreground)]">
                  <div className="font-bold text-[var(--accent)] flex items-center gap-1.5">
                    <Smartphone size={14} /> iOS Safari Installation
                  </div>

                  <div className="space-y-2.5 pt-1">
                    <div className="flex items-start gap-2.5">
                      <div className="w-5 h-5 rounded-full bg-[var(--accent)]/15 text-[var(--accent)] font-bold flex items-center justify-center shrink-0 text-[10px]">
                        1
                      </div>
                      <p className="text-[11.5px] leading-snug">
                        Tap the <strong className="text-[var(--foreground)]">Share button</strong> <Share size={12} className="inline mx-0.5 text-[var(--accent)]" /> at the bottom bar in Safari.
                      </p>
                    </div>

                    <div className="flex items-start gap-2.5">
                      <div className="w-5 h-5 rounded-full bg-[var(--accent)]/15 text-[var(--accent)] font-bold flex items-center justify-center shrink-0 text-[10px]">
                        2
                      </div>
                      <p className="text-[11.5px] leading-snug">
                        Scroll down and tap <strong className="text-[var(--foreground)]">Add to Home Screen</strong> <PlusSquare size={12} className="inline mx-0.5 text-[var(--accent)]" />.
                      </p>
                    </div>

                    <div className="flex items-start gap-2.5">
                      <div className="w-5 h-5 rounded-full bg-[var(--accent)]/15 text-[var(--accent)] font-bold flex items-center justify-center shrink-0 text-[10px]">
                        3
                      </div>
                      <p className="text-[11.5px] leading-snug">
                        Tap <strong className="text-[var(--foreground)]">Add</strong> in the top-right corner.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {selectedPlatform === "pc" && (
                <div className="space-y-3 mb-4 p-3.5 rounded-2xl bg-[var(--foreground)]/[0.02] border border-[var(--border)] text-xs text-[var(--foreground)]">
                  <div className="font-bold text-[var(--accent)] flex items-center gap-1.5">
                    <Monitor size={14} /> Chrome / Edge on Desktop
                  </div>

                  {deferredInstallPrompt ? (
                    <button
                      onClick={triggerNativePrompt}
                      className="w-full py-2.5 px-4 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-98"
                    >
                      <Download size={14} />
                      <span>Install Desktop App</span>
                    </button>
                  ) : null}

                  <div className="space-y-2.5 pt-1">
                    <div className="flex items-start gap-2.5">
                      <div className="w-5 h-5 rounded-full bg-[var(--accent)]/15 text-[var(--accent)] font-bold flex items-center justify-center shrink-0 text-[10px]">
                        1
                      </div>
                      <p className="text-[11.5px] leading-snug">
                        Click the <strong className="text-[var(--foreground)]">Install icon</strong> <ArrowDownToLine size={12} className="inline mx-0.5 text-[var(--accent)]" /> inside the browser URL address bar (top right).
                      </p>
                    </div>

                    <div className="flex items-start gap-2.5">
                      <div className="w-5 h-5 rounded-full bg-[var(--accent)]/15 text-[var(--accent)] font-bold flex items-center justify-center shrink-0 text-[10px]">
                        2
                      </div>
                      <p className="text-[11.5px] leading-snug">
                        Click <strong className="text-[var(--foreground)]">Install</strong> to launch Yuji MLBB as a standalone desktop app.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Features list */}
              <div className="grid grid-cols-2 gap-2 text-[10.5px] text-[var(--muted)] mb-4">
                <div className="flex items-center gap-1.5">
                  <Check size={12} className="text-emerald-500 shrink-0" />
                  <span>1-Tap Fast Launch</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Check size={12} className="text-emerald-500 shrink-0" />
                  <span>Ultra Lightweight</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Check size={12} className="text-emerald-500 shrink-0" />
                  <span>Instant Diamonds</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Check size={12} className="text-emerald-500 shrink-0" />
                  <span>Safe & Secure</span>
                </div>
              </div>

              {/* Dismiss button */}
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-full py-2 text-center text-[11.5px] font-medium text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
              >
                Close
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
