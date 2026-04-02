"use client";

import { useEffect, useState } from "react";
import { Clock, History } from "lucide-react";
import { getVerifiedPlayers } from "@/utils/storage/verifiedPlayerStorage";

function timeAgo(ts?: number) {
  if (!ts) return "";
  const diff = Date.now() - ts;
  const min = Math.floor(diff / 60000);
  if (min < 1) return "just now";
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const d = Math.floor(hr / 24);
  return `${d}d ago`;
}

export default function RecentVerifiedPlayers({
  onSelect,
  limit = 10,
}: {
  onSelect: (player: any) => void;
  limit?: number;
}) {
  const [players, setPlayers] = useState<any[]>([]);

  useEffect(() => {
    setPlayers(getVerifiedPlayers(limit));
  }, [limit]);

  if (!players.length) return null;

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 shadow-sm">

      {/* ================= HEADER ================= */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <History size={16} className="text-[var(--accent)]" />
          Recent Verified IDs
        </div>
        <span className="text-xs text-[var(--muted)]">
          {players.length} saved
        </span>
      </div>

      {/* ================= LIST ================= */}
      <div className="space-y-1.5">
        {players.map((p, index) => (
          <button
            key={`${p.playerId}-${p.zoneId}-${index}`}
            onClick={() => onSelect(p)}
            className="
              w-full text-left
              rounded-xl border border-[var(--border)]
              bg-[var(--foreground)]/[0.03] hover:bg-[var(--foreground)]/[0.06]
              hover:border-[var(--accent)]
              transition-all
              p-2.5
              group
            "
          >
            <div className="flex items-start justify-between gap-3">

              {/* LEFT */}
              <div>
                <p className="text-sm font-semibold leading-tight">
                  {p.username || "Unknown Player"}
                </p>

                <p className="text-xs text-[var(--muted)] mt-0.5">
                  ID {p.playerId} · Zone {p.zoneId}
                </p>

                {p.savedAt && (
                  <div className="flex items-center gap-1 mt-1 text-[10px] text-gray-500">
                    <Clock size={12} />
                    {timeAgo(p.savedAt)}
                  </div>
                )}
              </div>

              {/* RIGHT */}
              <span
                className="
                  text-[10px] font-medium
                  px-2 py-1 rounded-full
                  bg-[var(--accent)]/15
                  text-[var(--accent)]
                  whitespace-nowrap
                "
              >
                {p.region}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
