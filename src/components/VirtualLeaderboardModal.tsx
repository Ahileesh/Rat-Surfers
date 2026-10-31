import React, { useMemo } from 'react';
import { X, Trophy, Flame, ChevronUp, ChevronDown, Minus, Award, Crown } from 'lucide-react';
import { getDailyVirtualLeaderboard } from '../utils/leaderboard';

interface VirtualLeaderboardModalProps {
  playerScore: number;
  playerStreak: number;
  playerCheese: number;
  playerSkinId: string;
  totalRuns?: number;
  totalToolLevels?: number;
  onClose: () => void;
}

export const VirtualLeaderboardModal: React.FC<VirtualLeaderboardModalProps> = ({
  playerScore,
  playerStreak,
  playerCheese,
  playerSkinId,
  totalRuns = 0,
  totalToolLevels = 8,
  onClose,
}) => {
  const entries = useMemo(() => {
    return getDailyVirtualLeaderboard(
      playerScore,
      playerStreak,
      playerCheese,
      playerSkinId,
      totalRuns,
      totalToolLevels
    );
  }, [playerScore, playerStreak, playerCheese, playerSkinId, totalRuns, totalToolLevels]);

  const playerEntry = entries.find(e => e.isPlayer);
  const nextRival = playerEntry && playerEntry.rank > 1 ? entries[playerEntry.rank - 2] : null;
  const pointsToNextRival = playerEntry && nextRival ? nextRival.score - playerEntry.score + 1 : 0;

  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md select-none animate-fadeIn">
      <div className="w-full max-w-lg max-h-[92vh] overflow-hidden bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 sm:px-5 sm:py-4 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center">
              <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />
            </div>
            <div>
              <h2 className="font-display font-black text-base sm:text-lg text-slate-100 uppercase tracking-wide">
                Leaderboard
              </h2>
            </div>
          </div>

          <button
            type="button"
            data-interactive="true"
            onClick={onClose}
            aria-label="Close"
            className="shrink-0 w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-slate-800/90 hover:bg-slate-700 active:scale-95 text-slate-200 hover:text-white border border-slate-700/80 flex items-center justify-center transition-all cursor-pointer shadow-md"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        {/* Clean Sub-Bar: Icon-Driven & Minimalist */}
        <div className="px-3.5 py-1.5 bg-slate-950/60 border-b border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-1.5 text-amber-400 font-semibold text-[11px]">
            <span>🏆</span>
            <span>Rankings</span>
          </div>
          {playerEntry && nextRival && (
            <span className="text-[10px] text-amber-300 font-mono font-medium">
              +{pointsToNextRival.toLocaleString()} to rank #{nextRival.rank}
            </span>
          )}
        </div>

        {/* Leaderboard Table List (25 Competitors) */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2">
          {entries.map(entry => {
            const rankDelta = entry.previousRank - entry.rank;
            const isTop3 = entry.rank <= 3;

            return (
              <div
                key={entry.id}
                className={`flex items-center justify-between p-3 rounded-2xl border transition-all ${
                  entry.isPlayer
                    ? 'bg-amber-500/15 border-amber-500/60 shadow-[0_0_15px_rgba(245,158,11,0.25)] ring-1 ring-amber-500/40'
                    : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700'
                }`}
              >
                {/* Left: Rank & Delta & Name */}
                <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                  {/* Rank Badge */}
                  <div className="flex flex-col items-center justify-center w-7 text-center">
                    <span
                      className={`font-display font-black text-sm tabular-nums ${
                        entry.rank === 1
                          ? 'text-yellow-300'
                          : entry.rank === 2
                          ? 'text-slate-300'
                          : entry.rank === 3
                          ? 'text-amber-600'
                          : 'text-slate-400'
                      }`}
                    >
                      #{entry.rank}
                    </span>

                    {/* Rank change indicator */}
                    {!entry.isPlayer && (
                      <div className="flex items-center text-[10px] leading-none mt-0.5">
                        {rankDelta > 0 ? (
                          <span className="text-emerald-400 flex items-center font-bold">
                            <ChevronUp className="w-2.5 h-2.5 -mr-0.5" />+{rankDelta}
                          </span>
                        ) : rankDelta < 0 ? (
                          <span className="text-rose-400 flex items-center font-bold">
                            <ChevronDown className="w-2.5 h-2.5 -mr-0.5" />{rankDelta}
                          </span>
                        ) : (
                          <span className="text-slate-600">
                            <Minus className="w-2.5 h-2.5" />
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Rodent Icon / Avatar */}
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
                      entry.isPlayer
                        ? 'bg-amber-400 text-slate-950 border-amber-300 font-bold shadow-[0_0_10px_rgba(245,158,11,0.5)]'
                        : isTop3
                        ? 'bg-slate-800 border-amber-500/40 text-amber-400'
                        : 'bg-slate-900 border-slate-800 text-slate-400'
                    }`}
                  >
                    {entry.rank === 1 ? (
                      <Crown className="w-4 h-4 text-yellow-300 fill-yellow-300" />
                    ) : isTop3 ? (
                      <Award className="w-4 h-4" />
                    ) : (
                      <span className="text-xs">🐭</span>
                    )}
                  </div>

                  {/* Name, Title, and Streak */}
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span
                        className={`font-display font-bold text-xs sm:text-sm truncate ${
                          entry.isPlayer ? 'text-amber-300' : 'text-slate-200'
                        }`}
                      >
                        {entry.name}
                      </span>
                      {entry.isPlayer && (
                        <span className="text-[9px] px-1.5 py-0.2 bg-amber-500 text-slate-950 font-black rounded-md uppercase">
                          YOU
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                      {entry.title && (
                        <span className="text-slate-400 font-medium truncate max-w-[110px] sm:max-w-none">
                          {entry.title}
                        </span>
                      )}
                      <span className="text-slate-600">·</span>
                      <span className="flex items-center gap-0.5 text-orange-400 font-medium">
                        <Flame className="w-2.5 h-2.5 fill-orange-400" />
                        {entry.streak}d
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: Score & Delta */}
                <div className="text-right pl-2 shrink-0">
                  <div className="font-mono font-bold text-xs sm:text-sm text-slate-100 tabular-nums">
                    {entry.score.toLocaleString()}
                  </div>
                  <div className="text-[10px] flex items-center justify-end gap-1 font-mono">
                    {entry.isPlayer ? (
                      <span className="text-amber-400 font-semibold uppercase tracking-wider text-[9px]">Your Score</span>
                    ) : entry.scoreDelta && entry.scoreDelta > 0 ? (
                      <span className="text-emerald-400 font-bold">+{entry.scoreDelta.toLocaleString()} today</span>
                    ) : (
                      <span className="text-slate-500 uppercase tracking-wider">pts</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-3 sm:p-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="text-amber-400 font-bold">#{playerEntry ? playerEntry.rank : entries.length}</span>
            <span>Current League Rank</span>
          </div>
          <button
            type="button"
            data-interactive="true"
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 rounded-xl font-bold uppercase transition-all cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
