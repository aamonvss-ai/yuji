import HelpImagePopup from "../../../../../components/HelpImage/HelpImagePopup";
import RecentVerifiedPlayers from "../../../../region/RecentVerifiedPlayers";

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
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-2xl font-bold">Verify Player</h2>
        <HelpImagePopup />
      </div>

      <input
        value={playerId}
        onChange={(e) => setPlayerId(e.target.value)}
        placeholder={game?.inputFieldOne || "Enter player ID"}
        className="p-3 rounded-lg bg-black/20 border border-gray-700 w-full"
        disabled={loading}
      />

      {(game?.inputFieldTwo || (game?.inputFieldTwoOption && game.inputFieldTwoOption.length > 0)) && (
        <input
          value={zoneId}
          onChange={(e) => setZoneId(e.target.value)}
          placeholder={game?.inputFieldTwo || "Enter zone ID"}
          className="p-3 rounded-lg bg-black/20 border border-gray-700 w-full"
          disabled={loading}
        />
      )}

      <button
        onClick={onValidate}
        disabled={loading}
        className={`py-3 rounded-lg w-full font-semibold transition
          ${loading
            ? "bg-gray-600 text-gray-300 cursor-not-allowed"
            : "bg-[var(--accent)] text-black hover:opacity-90"
          }`}
      >
        {loading ? "Checking..." : "Check"}
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
