import { Skeleton } from "@/components/ui/Skeleton";
import { GameBannerCarouselSkeleton } from "@/components/Home/GameBannerCarousel";
import { FlashSaleSkeleton } from "@/components/Home/FlashSale";
import { GamesGridSkeleton } from "@/app/games/page";

export default function Loading() {
  return (
    <div className="w-full min-h-screen bg-transparent pb-16">
      {/* Top Notice Shimmer */}
      <div className="w-full h-10 bg-[var(--foreground)]/[0.04] border-b border-[var(--border)] overflow-hidden relative">
        <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-[var(--foreground)]/[0.06] to-transparent pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Skeleton className="w-6 h-6 rounded-full" />
            <Skeleton className="w-48 h-3.5 rounded" />
          </div>
          <Skeleton className="w-14 h-5 rounded-full" />
        </div>
      </div>

      {/* Game Banner Carousel Skeleton */}
      <GameBannerCarouselSkeleton />

      {/* Story Slider Circles Skeleton */}
      <div className="py-3 sm:py-4 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 flex gap-3 sm:gap-4 overflow-x-auto no-scrollbar">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="flex flex-col items-center gap-1.5 shrink-0">
              <Skeleton className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-2 border-[var(--border)]" />
              <Skeleton className="w-14 h-2.5 rounded" />
            </div>
          ))}
        </div>
      </div>

      {/* Flash Sale Skeleton */}
      <FlashSaleSkeleton />

      {/* Quick Actions Skeleton */}
      <div className="w-full py-2.5 sm:py-3.5">
        <div className="max-w-7xl mx-auto px-1.5 sm:px-4 grid grid-cols-6 gap-1 sm:gap-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="flex flex-col items-center justify-center gap-1.5 py-1 px-0.5 sm:p-2">
              <Skeleton className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl" />
              <Skeleton className="w-11 sm:w-14 h-2.5 rounded" />
            </div>
          ))}
        </div>
      </div>

      {/* Games Grid Skeleton */}
      <GamesGridSkeleton />
    </div>
  );
}
