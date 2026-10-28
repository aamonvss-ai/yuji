"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

import logo from "@/public/logo.png";
import MLBBPurchaseGuide from "../../../components/HelpImage/MLBBPurchaseGuide";

import ItemGrid from "@/components/GameDetail/ItemGrid";
import BuyPanel from "@/components/GameDetail/BuyPanel";
import ItemGridBgmi from "@/components/GameDetail/ItemGridBgmi";
import BuyPanelBgmi from "@/components/GameDetail/BuyPanelBgmi";
import GameSwitcher from "@/components/GameDetail/GameSwitcher";
import AuthGuard from "@/components/AuthGuard";
import GameDetailSkeleton from "@/components/GameDetail/GameDetailSkeleton";

export default function GameDetailPage() {
  const { slug } = useParams();
  const router = useRouter();

  const buyPanelRef = useRef(null);

  const [game, setGame] = useState(null);
  const [activeItem, setActiveItem] = useState(null);
  const [redirecting, setRedirecting] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const isBGMI =
    game?.gameName?.toLowerCase() === "pubg mobile" || game?.gameName?.toLowerCase() === "bgmi";


  /* ================= FETCH GAME ================= */
  useEffect(() => {
    setNotFound(false);

    // 1. Instant cache hydrate
    try {
      const cached = sessionStorage.getItem(`yuji_game_${slug}`);
      if (cached) {
        const cachedData = JSON.parse(cached);
        if (cachedData?.allItems?.length) {
          setGame(cachedData);
          const firstAvailable = cachedData.allItems.find((item) => !item.isOutOfStock && item.itemAvailablity !== false) || cachedData.allItems[0] || null;
          setActiveItem(firstAvailable);
          setIsLoading(false);
        }
      }
    } catch {}

    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

    fetch(`/api/games/${slug}`, {
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (!data?.data || !data?.success) {
          setGame((curr) => {
            if (!curr) setNotFound(true);
            return curr;
          });
          return;
        }

        const items = [...(data?.data?.itemId || [])].sort(
          (a, b) => a.sellingPrice - b.sellingPrice
        );

        const gamePayload = {
          ...data.data,
          allItems: items,
        };

        try {
          sessionStorage.setItem(`yuji_game_${slug}`, JSON.stringify(gamePayload));
        } catch {}

        setGame(gamePayload);

        setActiveItem((prev) => {
          if (prev && items.some(i => i.itemSlug === prev.itemSlug)) return prev;
          return items.find((item) => !item.isOutOfStock && item.itemAvailablity !== false) || items[0] || null;
        });
      })
      .catch(() => {
        setGame((curr) => {
          if (!curr) setNotFound(true);
          return curr;
        });
      })
      .finally(() => setIsLoading(false));
  }, [slug]);

  /* ================= RENDER STATES ================= */
  if (isLoading) {
    return <GameDetailSkeleton />;
  }

  if (notFound || !game) {
    return (
      <section className="min-h-screen relative flex flex-col items-center justify-center bg-transparent overflow-hidden px-4 py-20 font-sans selection:bg-[var(--accent)]/30">
        <div className="w-24 h-24 mb-6 opacity-20">
          <Image src={logo} alt="Logo" className="grayscale" />
        </div>
        <h2 className="text-3xl font-black uppercase tracking-tighter italic mb-2">
          Game <span className="text-[var(--accent)]">Not Found</span>
        </h2>
        <p className="text-[var(--muted)] text-sm mb-8 max-w-xs">
          The game you are looking for does not exist or has been removed from our catalog.
        </p>
        <Link
          href="/games"
          className="px-8 py-3 rounded-2xl bg-white text-black font-black text-xs uppercase tracking-widest shadow-xl hover:scale-105 transition-transform"
        >
          View All Games
        </Link>
      </section>
    );
  }

  /* ================= BUY HANDLER ================= */
  const goBuy = (item) => {
    if (redirecting) return;
    if (item?.isOutOfStock || item?.itemAvailablity === false) return;

    // Check Authentication
    const token = localStorage.getItem("token");
    const email = localStorage.getItem("email");
    if (!token && !email) {
      router.push(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
      return;
    }

    setRedirecting(true);
    const query = new URLSearchParams({
      name: item.itemName,
      price: item.sellingPrice?.toString() || "",
      dummy: item.dummyPrice?.toString() || "",
      image: item.itemImageId?.image || "",
    });

    // GENERIC ROUTE
    router.push(
      `/games/${slug}/buy/${item.itemSlug}?${query.toString()}`
    );
  };

  return (
    <section className="min-h-screen bg-transparent text-[var(--foreground)] px-4 py-4">

      <GameSwitcher />

      {/* ================= HEADER ================= */}
      <div className="max-w-6xl mx-auto mt-2 sm:mt-3 mb-3.5 pb-2.5 border-b border-[var(--border)] flex items-center gap-2.5">
        <div className="w-9 h-9 sm:w-10 sm:h-10 relative rounded-lg overflow-hidden shrink-0 border border-[var(--border)] shadow-xs">
          <Image
            src={game?.gameImageId?.image || logo}
            alt={game?.gameName || "Game"}
            fill
            className="object-cover"
          />
        </div>

        <div>
          <h1 className="text-base sm:text-lg font-bold leading-tight">
            {game?.gameName}
          </h1>
          <p className="text-[9.5px] sm:text-[10px] text-[var(--muted)] uppercase tracking-wider font-semibold">
            {game?.gameFrom}
          </p>
        </div>
      </div>

      {/* ================= OUT OF STOCK HANDLING ================= */}
      {(game?.gameAvailablity === false || game?.isOutOfStock === true) ? (
        <div className="max-w-6xl mx-auto py-16 px-4 text-center border-2 border-dashed border-red-500/20 bg-red-500/5 rounded-3xl">
          <div className="w-12 h-12 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4 font-black text-xs">
            OFF
          </div>
          <h3 className="text-xl font-black uppercase tracking-tighter italic text-red-500">Currently Out Of Stock</h3>
          <p className="text-xs text-[var(--muted)] mt-2 max-w-sm mx-auto">
            {game.gameName} is temporarily out of stock. Please check back soon!
          </p>
          <div className="mt-6">
            <Link
              href="/games"
              className="inline-flex px-6 py-2.5 rounded-xl bg-[var(--foreground)]/[0.08] text-[var(--foreground)] text-xs font-bold hover:bg-[var(--foreground)]/[0.12] transition-colors"
            >
              Back to Catalog
            </Link>
          </div>
        </div>
      ) : game.allItems && game.allItems.length > 0 ? (
        <>
          {/* ================= ITEM GRID ================= */}
          {isBGMI ? (
            <ItemGridBgmi
              items={game.allItems}
              activeItem={activeItem}
              setActiveItem={setActiveItem}
              buyPanelRef={buyPanelRef}
              gameImage={game?.gameImageId?.image}
            />
          ) : (
            <ItemGrid
              items={game.allItems}
              activeItem={activeItem}
              setActiveItem={setActiveItem}
              buyPanelRef={buyPanelRef}
              gameImage={game?.gameImageId?.image}
            />
          )}

          {/* ================= BUY PANEL ================= */}
          {activeItem && (
            <>
              {isBGMI ? (
                <BuyPanelBgmi
                  activeItem={activeItem}
                  onBuy={goBuy}
                  redirecting={redirecting}
                  buyPanelRef={buyPanelRef}
                  systemSettings={game?.systemSettings}
                />
              ) : (
                <BuyPanel
                  activeItem={activeItem}
                  onBuy={goBuy}
                  redirecting={redirecting}
                  buyPanelRef={buyPanelRef}
                  systemSettings={game?.systemSettings}
                />
              )}
            </>
          )}
        </>
      ) : (
        /* ================= EMPTY STATE ================= */
        <div className="max-w-6xl mx-auto py-16 px-4 text-center border-2 border-dashed border-[var(--border)] rounded-3xl">
          <div className="w-12 h-12 bg-[var(--foreground)]/[0.03] rounded-full flex items-center justify-center mx-auto mb-4">
            <Image src={logo} alt="Logo" className="w-8 h-8 opacity-20 grayscale" />
          </div>
          <h3 className="text-xl font-black uppercase tracking-tighter italic">Coming Soon</h3>
          <p className="text-xs text-[var(--muted)] mt-2">
            No items are currently listed for {game.gameName}. Please check back later!
          </p>
        </div>
      )}

    </section>
  );
}
