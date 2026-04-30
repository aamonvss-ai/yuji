import HelpImagePopup from "../../../../../components/HelpImage/HelpImagePopup";
import RecentVerifiedPlayers from "../../../../region/RecentVerifiedPlayers";

import { FiUserCheck } from "react-icons/fi";

export default function ValidationStep({
  game,
  playerId,
  setPlayerId,
  zoneId,
  setZoneId,
  onValidate,
  loading, // 👈 NEW
  error, // 👈 NEW
}) {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-3xl font-black uppercase tracking-tighter italic">Verify <span className="text-[var(--accent)]">Player</span></h2>
        <HelpImagePopup />
      </div>

      <div className="space-y-4">
        <div className="relative group">
          <input
            value={playerId}
            onChange={(e) => setPlayerId(e.target.value)}
            placeholder={game?.inputFieldOne || "Enter player ID"}
            className="w-full bg-[var(--foreground)]/[0.05] border-2 border-[var(--border)] rounded-2xl py-3.5 px-5 text-sm focus:outline-none focus:ring-4 focus:ring-[var(--accent)]/10 focus:border-[var(--accent)] transition-all placeholder:text-[var(--muted)]/40 font-bold tracking-tight backdrop-blur-md"
            disabled={loading}
          />
        </div>

        {(game?.inputFieldTwo || (game?.inputFieldTwoOption && game.inputFieldTwoOption.length > 0)) && (
          <div className="relative group">
            <input
              value={zoneId}
              onChange={(e) => setZoneId(e.target.value)}
              placeholder={game?.inputFieldTwo || "Enter zone ID"}
              className="w-full bg-[var(--foreground)]/[0.05] border-2 border-[var(--border)] rounded-2xl py-3.5 px-5 text-sm focus:outline-none focus:ring-4 focus:ring-[var(--accent)]/10 focus:border-[var(--accent)] transition-all placeholder:text-[var(--muted)]/40 font-bold tracking-tight backdrop-blur-md"
              disabled={loading}
            />
          </div>
        )}
      </div>

      <button
        onClick={onValidate}
        disabled={loading}
        className={`py-4 rounded-2xl w-full font-black uppercase tracking-widest text-xs transition-all duration-300 shadow-lg flex items-center justify-center gap-2
          ${loading
            ? "bg-[var(--border)] text-[var(--muted)] cursor-not-allowed opacity-50"
            : "bg-gradient-to-r from-[var(--accent)] to-[var(--accent-hover)] text-white hover:scale-[1.02] hover:shadow-[var(--accent)]/40 active:scale-[0.98]"
          }`}
      >
        {loading ? (
          "Verifying..."
        ) : (
          <>
            <FiUserCheck size={16} />
            Check Player
          </>
        )}
      </button>

      {error && (
        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/50 text-red-500 text-sm font-medium animate-pulse">
          {error}
        </div>
      )}

      <RecentVerifiedPlayers
        limit={10}
        onSelect={(player) => {
          setPlayerId(player.playerId);
          setZoneId(player.zoneId);
        }}
      />
    </div>
  );
}
