import React, { useEffect } from 'react';
import { RotateCcw, Trophy, Home, ShoppingBag } from 'lucide-react';
import { PlayerStats, HighScoreRecord } from '../types/game';

interface GameOverModalProps {
  stats: PlayerStats;
  highScore: HighScoreRecord | null;
  isNewHigh: boolean;
  onRestart: () => void;
  onHome: () => void;
  onOpenShop: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  stats,
  highScore,
  isNewHigh,
  onRestart,
  onHome,
  onOpenShop,
}) => {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault();
        onRestart();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onRestart]);

  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md select-none animate-fadeIn">
      <div className="w-full max-w-xs sm:max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col items-center text-center">
        {/* Playful Cat Paw */}
        <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mb-2">
          <span className="text-2xl">🐾</span>
        </div>

        <h2 className="font-display font-black text-2xl text-slate-100 tracking-wider uppercase mb-0.5">
          GAME OVER
        </h2>
        <p className="text-xs text-amber-400 font-medium mb-4">
          Shadow the cat caught up!
        </p>

        {/* New High Score Badge */}
        {isNewHigh && (
          <div className="w-full mb-3 py-1.5 px-3 bg-amber-500/20 border border-amber-500/50 rounded-xl flex items-center justify-center gap-1.5 text-amber-300 font-display font-bold text-xs tracking-wide">
            <Trophy className="w-3.5 h-3.5 text-amber-400 animate-bounce" />
            <span>NEW BEST RECORD!</span>
          </div>
        )}

        {/* Score & Distance Card */}
        <div className="w-full bg-slate-950/80 border border-slate-800/80 rounded-2xl p-3 mb-4 flex items-center justify-around">
          <div>
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Score</div>
            <div className="font-mono text-xl font-bold text-amber-400 tabular-nums">
              {stats.score.toLocaleString()}
            </div>
          </div>

          <div className="w-px h-8 bg-slate-800" />

          <div>
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Distance</div>
            <div className="font-mono text-xl font-bold text-slate-100 tabular-nums">
              {stats.distance}
              <span className="text-xs text-slate-400 font-normal ml-0.5">m</span>
            </div>
          </div>
        </div>

        {/* Treats Tally */}
        <div className="w-full bg-slate-950/60 rounded-xl py-1.5 px-3 mb-4 flex items-center justify-around text-xs">
          <div className="flex items-center gap-1 font-mono font-bold text-amber-300">
            <span className="w-2 h-2 bg-amber-400 rounded-sm" />
            <span>{stats.cheeseCount}</span>
          </div>
          <span className="text-slate-700">·</span>
          <div className="flex items-center gap-1 font-mono font-bold text-pink-300">
            <span className="w-2 h-2 bg-pink-500 rounded-full" />
            <span>{stats.candyCount}</span>
          </div>
          <span className="text-slate-700">·</span>
          <div className="flex items-center gap-1 font-mono font-bold text-amber-600">
            <span className="w-2 h-2 bg-amber-800 rounded-sm" />
            <span>{stats.chocoCount}</span>
          </div>
        </div>

        {/* Best Record */}
        {highScore && !isNewHigh && (
          <div className="text-[11px] text-slate-400 mb-4 flex items-center gap-1">
            <Trophy className="w-3 h-3 text-amber-400" />
            <span>Best:</span>
            <span className="font-mono font-bold text-slate-200">
              {highScore.score.toLocaleString()} pts
            </span>
          </div>
        )}

        {/* Action Buttons: Retry, Shop & Home */}
        <div className="w-full flex flex-col gap-2.5">
          <button
            type="button"
            data-interactive="true"
            onClick={onRestart}
            style={{ touchAction: 'manipulation' }}
            className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 active:scale-95 text-slate-950 font-display font-black text-sm uppercase tracking-wider rounded-2xl shadow-[0_0_20px_rgba(245,158,11,0.4)] transition-all flex items-center justify-center gap-2 border border-yellow-200/60 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>PLAY AGAIN</span>
          </button>

          <div className="grid grid-cols-2 gap-2 w-full">
            <button
              type="button"
              data-interactive="true"
              onClick={onOpenShop}
              style={{ touchAction: 'manipulation' }}
              className="py-2.5 px-3 bg-slate-800 hover:bg-slate-700 active:scale-95 text-amber-400 font-display font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-1.5 border border-slate-700 cursor-pointer"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Shop</span>
            </button>

            <button
              type="button"
              data-interactive="true"
              onClick={onHome}
              style={{ touchAction: 'manipulation' }}
              className="py-2.5 px-3 bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 font-display font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-1.5 border border-slate-700 cursor-pointer"
            >
              <Home className="w-3.5 h-3.5" />
              <span>Home</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
