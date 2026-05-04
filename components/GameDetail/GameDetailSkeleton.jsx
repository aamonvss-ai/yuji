"use client";

import { Skeleton } from "../ui/Skeleton";

export default function GameDetailSkeleton() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-4 space-y-6">
      {/* Game Switcher Skeleton */}
      <div className="flex gap-2 overflow-hidden py-2">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="flex flex-col items-center gap-2">
            <Skeleton className="w-10 h-10 rounded-lg" />
            <Skeleton className="w-12 h-2 rounded-full" />
          </div>
        ))}
      </div>

      {/* Header Skeleton */}
      <div className="flex items-center gap-3">
        <Skeleton className="w-12 h-12 rounded-lg shrink-0" />
        <div className="space-y-2 flex-1">
          <Skeleton className="w-1/3 h-5 rounded-md" />
          <Skeleton className="w-1/4 h-3 rounded-md" />
        </div>
      </div>

      {/* Item Grid Skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-4">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="w-full aspect-[4/3] rounded-2xl" />
            <div className="space-y-2">
              <Skeleton className="w-3/4 h-3 rounded-md" />
              <Skeleton className="w-1/2 h-4 rounded-md" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
