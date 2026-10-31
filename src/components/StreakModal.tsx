import React from 'react';
import { X, Flame, Gift, Check, Award, Calendar } from 'lucide-react';
import { StreakData } from '../types/game';

export interface StreakMilestone {
  days: number;
  reward: number;
  title: string;
}

export const STREAK_MILESTONES: StreakMilestone[] = [
  { days: 3, reward: 250, title: 'Tunnel Scout' },
  { days: 7, reward: 750, title: 'Subway Champion' },
  { days: 14, reward: 2500, title: 'Feline Outrunner' },
  { days: 30, reward: 6000, title: 'Grand Legend' },
  { days: 60, reward: 15000, title: 'Sewer Emperor' },
  { days: 100, reward: 35000, title: 'Century Scurrier' },
  { days: 180, reward: 75000, title: 'Half-Year Phantom' },
  { days: 365, reward: 200000, title: 'Immortal Subway Titan' },
];

interface StreakModalProps {
  streak: StreakData;
  onClaimReward: (days: number, cheese: number) => void;
  claimedMilestones: number[];
  onClose: () => void;
}

export const StreakModal: React.FC<StreakModalProps> = ({
  streak,
  onClaimReward,
  claimedMilestones,
  onClose,
}) => {
  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md select-none animate-fadeIn">
      <div className="w-full max-w-md max-h-[90vh] overflow-hidden bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl flex flex-col">
        {/* Compact Top Header */}
        <div className="flex items-center justify-between px-4 py-2.5 sm:px-5 sm:py-3 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-orange-500/20 border border-orange-500/40 flex items-center justify-center">
              <Flame className="w-4 h-4 text-orange-400 fill-orange-400" />
            </div>
            <h2 className="font-display font-black text-sm sm:text-base text-slate-100 uppercase tracking-wide">
              Daily Escape Streaks
            </h2>
          </div>

          <button
            type="button"
            data-interactive="true"
            onClick={onClose}
            aria-label="Close Streak Modal"
            className="shrink-0 w-8 h-8 rounded-xl bg-slate-800/90 hover:bg-slate-700 active:scale-95 text-slate-300 hover:text-white border border-slate-700/80 flex items-center justify-center transition-all cursor-pointer shadow-md"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Compact Horizontal Streak Strip (Replaces massive header so milestones are fully visible) */}
        <div className="px-4 py-2.5 bg-gradient-to-r from-orange-500/15 via-amber-500/10 to-transparent border-b border-slate-800 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-orange-500/20 border border-orange-500/50 flex items-center justify-center shadow-inner">
              <Flame className="w-6 h-6 text-orange-400 fill-orange-400 animate-pulse" />
            </div>
            <div>
              <div className="font-mono font-black text-xl text-amber-300 tracking-tight leading-none">
                {streak.currentStreak} <span className="text-xs font-display text-slate-300 font-bold uppercase">Days Active</span>
              </div>
              <span className="text-[10px] text-amber-400/90 font-medium">Daily Streak Bonus</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0 text-right">
            <div className="px-2 py-1 bg-slate-950/80 border border-slate-800 rounded-lg text-center">
              <div className="text-[9px] text-slate-500 font-bold uppercase leading-none">Best</div>
              <div className="font-mono font-bold text-xs text-amber-400">{streak.bestStreak}d</div>
            </div>
            <div className="px-2 py-1 bg-slate-950/80 border border-slate-800 rounded-lg text-center">
              <div className="text-[9px] text-slate-500 font-bold uppercase leading-none">Runs</div>
              <div className="font-mono font-bold text-xs text-cyan-400">{streak.totalRuns}</div>
            </div>
          </div>
        </div>

        {/* Milestones List: Fully visible & scrollable on all small screens */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2">
          <div className="text-[11px] font-display font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between mb-1">
            <div className="flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-amber-400" />
              <span>Milestone Rewards</span>
            </div>
            <span className="text-[10px] text-amber-400 font-mono">Up to 200,000 🧀</span>
          </div>

          {STREAK_MILESTONES.map(item => {
            const isReached = streak.currentStreak >= item.days;
            const isClaimed = claimedMilestones.includes(item.days);
            const canClaim = isReached && !isClaimed;
            const daysLeft = item.days - streak.currentStreak;

            return (
              <div
                key={item.days}
                className={`flex items-center justify-between p-2.5 sm:p-3 rounded-2xl border transition-all ${
                  canClaim
                    ? 'bg-amber-500/15 border-amber-500/60 shadow-[0_0_15px_rgba(245,158,11,0.25)]'
                    : isClaimed
                    ? 'bg-slate-950/40 border-slate-800/60 opacity-60'
                    : 'bg-slate-950/70 border-slate-800'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center font-mono font-bold text-xs border shrink-0 ${
                      isReached
                        ? 'bg-orange-500/20 border-orange-500/50 text-orange-300'
                        : 'bg-slate-800 border-slate-700 text-slate-400'
                    }`}
                  >
                    {item.days}d
                  </div>

                  <div className="min-w-0">
                    <div className="font-display font-bold text-xs text-slate-100 truncate">
                      {item.title}
                    </div>
                    <div className="text-[11px] text-amber-400 font-mono flex items-center gap-1 font-semibold">
                      <Gift className="w-3 h-3 shrink-0" />
                      <span>+{item.reward.toLocaleString()} 🧀</span>
                    </div>
                  </div>
                </div>

                <div className="shrink-0 pl-2">
                  {isClaimed ? (
                    <div className="flex items-center gap-1 text-[11px] text-emerald-400 font-bold px-2 py-1 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                      <Check className="w-3 h-3" />
                      <span>Claimed</span>
                    </div>
                  ) : canClaim ? (
                    <button
                      type="button"
                      data-interactive="true"
                      onClick={() => onClaimReward(item.days, item.reward)}
                      className="px-3 py-1.5 bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-display font-black text-xs uppercase rounded-xl shadow-md hover:brightness-110 active:scale-95 cursor-pointer animate-bounce"
                    >
                      Claim!
                    </button>
                  ) : (
                    <span className="text-[10px] text-slate-500 font-mono">
                      {daysLeft}d left
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        {/* Footer */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            <span>Streaks record daily escapes automatically.</span>
          </div>
          <button
            type="button"
            data-interactive="true"
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 rounded-xl font-bold uppercase transition-all cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
