"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

import logo from "@/public/logo.png";
import Loader from "@/components/Loader/Loader";
import MLBBPurchaseGuide from "../../../components/HelpImage/MLBBPurchaseGuide";

import ItemGrid from "@/components/GameDetail/ItemGrid";
import BuyPanel from "@/components/GameDetail/BuyPanel";
import ItemGridBgmi from "@/components/GameDetail/ItemGridBgmi";
import BuyPanelBgmi from "@/components/GameDetail/BuyPanelBgmi";
import GameSwitcher from "@/components/GameDetail/GameSwitcher";
import AuthGuard from "@/components/AuthGuard";

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
    setIsLoading(true);
    setNotFound(false);
    const token = localStorage.getItem("token");

    fetch(`/api/games/${slug}`, {
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (!data?.data || !data?.success) {
          setNotFound(true);
          return;
        }

        const items = [...(data?.data?.itemId || [])].sort(
          (a, b) => a.sellingPrice - b.sellingPrice
        );

        setGame({
          ...data.data,
          allItems: items,
        });

        setActiveItem(items[0] || null);
      })
      .catch(() => setNotFound(true))
      .finally(() => setIsLoading(false));
  }, [slug]);

  /* ================= RENDER STATES ================= */
  if (isLoading) {
    return <Loader />;
  }

  if (notFound || !game) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
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
      </div>
    );
  }

  /* ================= BUY HANDLER ================= */
  const goBuy = (item) => {
    if (redirecting) return;

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
    <section className="min-h-screen bg-[var(--background)] text-[var(--foreground)] px-4 py-4">

      <GameSwitcher />

      {/* ================= HEADER ================= */}
      <div className="max-w-6xl mx-auto mb-4 flex items-center gap-3">
        <div className="w-12 h-12 relative rounded-lg overflow-hidden shrink-0">
          <Image
            src={game?.gameImageId?.image || logo}
            alt={game?.gameName || "Game"}
            fill
            className="object-cover"
          />
        </div>

        <div>
          <h1 className="text-xl font-bold leading-tight">
            {game?.gameName}
          </h1>
          <p className="text-[10px] text-[var(--muted)] uppercase tracking-wider font-semibold">
            {game?.gameFrom}
          </p>
        </div>
      </div>

      {/* ================= CONTENT HANDLING ================= */}
      {game.allItems && game.allItems.length > 0 ? (
        <>
          {/* ================= ITEM GRID ================= */}
          {isBGMI ? (
            <ItemGridBgmi
              items={game.allItems}
              activeItem={activeItem}
              setActiveItem={setActiveItem}
              buyPanelRef={buyPanelRef}
            />
          ) : (
            <ItemGrid
              items={game.allItems}
              activeItem={activeItem}
              setActiveItem={setActiveItem}
              buyPanelRef={buyPanelRef}
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
                />
              ) : (
                <BuyPanel
                  activeItem={activeItem}
                  onBuy={goBuy}
                  redirecting={redirecting}
                  buyPanelRef={buyPanelRef}
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
