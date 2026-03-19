"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import GamesPage from "@/app/games/page";
import GameBannerCarousel from "./GameBannerCarousel";
import HomeServices from "./HomeServices";
import TrustHighlights from "./TrustHighlights";
import MLBBPurchaseGuide from "../HelpImage/MLBBPurchaseGuide";
import TopNoticeBanner from "./TopNoticeBanner";
import ScrollingNoticeBand from "./ScrollingNoticeBand";
import HomeQuickActions from "./HomeQuickActions";
import StorySlider from "./StorySlider";


import FlashSale from "./FlashSale";


export default function HeroSection() {
  const pathname = usePathname();

  return (
    <>
      <TopNoticeBanner />
      <GameBannerCarousel />
      <StorySlider />
      <FlashSale />
      <HomeQuickActions />
      <GamesPage />
      <ScrollingNoticeBand />
      <HomeServices />
      <TrustHighlights />
    </>
  );
}
