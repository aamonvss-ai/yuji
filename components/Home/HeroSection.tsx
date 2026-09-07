"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import GamesPage from "@/app/games/page";
import GameBannerCarousel from "./GameBannerCarousel";
import TopNoticeBanner from "./TopNoticeBanner";
import HomeQuickActions from "./HomeQuickActions";
import StorySlider from "./StorySlider";

const CommunityPopup = dynamic(() => import("./CommunityPopup"), { ssr: false });
const FlashSale = dynamic(() => import("./FlashSale"), { ssr: false });
const HomeServices = dynamic(() => import("./HomeServices"), { ssr: false });
const TrustHighlights = dynamic(() => import("./TrustHighlights"), { ssr: false });


export default function HeroSection() {
  const pathname = usePathname();

  return (
    <>
      <CommunityPopup />
      <TopNoticeBanner />
      <GameBannerCarousel />
      <StorySlider />
      <FlashSale />
      <HomeQuickActions />
      <GamesPage />
      {/* <ScrollingNoticeBand /> */}
      <HomeServices />
      <TrustHighlights />
    </>
  );
}
