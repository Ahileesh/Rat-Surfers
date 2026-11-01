import React from 'react';
import {
  Volume2,
  VolumeX,
  Trophy,
  ShoppingBag,
  Play,
  Flame,
  Download,
  Check,
  HelpCircle,
  Code,
} from 'lucide-react';
import { HighScoreRecord, StreakData } from '../types/game';

interface TitleScreenProps {
  onStart: () => void;
  onOpenShop: () => void;
  onOpenLeaderboard: () => void;
  onOpenStreak: () => void;
  onOpenHelp: () => void;
  onInstallPWA: () => void;
  canInstallPWA: boolean;
  isPWAInstalled: boolean;
  totalCheese: number;
  totalCandy?: number;
  totalChoco?: number;
  streak: StreakData;
  highScore: HighScoreRecord | null;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({
  onStart,
  onOpenShop,
  onOpenLeaderboard,
  onOpenStreak,
  onOpenHelp,
  onInstallPWA,
  isPWAInstalled,
  totalCheese,
  totalCandy = 0,
  totalChoco = 0,
  streak,
  highScore,
  isMuted,
  onToggleMute,
}) => {
  return (
    <div
      className="absolute inset-0 z-20 flex flex-col justify-between p-2.5 sm:p-5 select-none pointer-events-none"
      style={{ touchAction: 'manipulation' }}
    >
      {/* TOP BAR: Clean Icon-First Currencies & Stats (Zero Clutter) */}
      <div className="flex items-center justify-between w-full max-w-lg mx-auto pointer-events-auto gap-1.5 sm:gap-2">
        {/* Treat Balances: Cheese, Candy, Choco */}
        <div className="flex items-center gap-1 sm:gap-1.5">
          {/* Cheese */}
          <button
            type="button"
            data-interactive="true"
            onClick={onOpenShop}
            aria-label="Shop"
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-950/85 backdrop-blur-md border border-amber-500/40 rounded-full text-amber-300 font-mono font-bold text-xs sm:text-sm shadow-md hover:border-amber-400 active:scale-95 transition-all cursor-pointer"
          >
            <span className="w-2.5 h-2.5 bg-amber-400 rounded-sm rotate-45 shadow-[0_0_6px_#f59e0b]" />
            <span>{totalCheese.toLocaleString()}</span>
          </button>

          {/* Candy */}
          <button
            type="button"
            data-interactive="true"
            onClick={onOpenShop}
            aria-label="Trade Treats"
            className="flex items-center gap-1 px-2 py-1.5 bg-slate-950/85 backdrop-blur-md border border-pink-500/30 rounded-full text-pink-300 font-mono font-bold text-xs shadow-md hover:border-pink-400 active:scale-95 transition-all cursor-pointer"
          >
            <span>🍬</span>
            <span>{totalCandy}</span>
          </button>

          {/* Choco */}
          <button
            type="button"
            data-interactive="true"
            onClick={onOpenShop}
            aria-label="Trade Treats"
            className="hidden xs:flex items-center gap-1 px-2 py-1.5 bg-slate-950/85 backdrop-blur-md border border-amber-900/50 rounded-full text-amber-200 font-mono font-bold text-xs shadow-md hover:border-amber-700 active:scale-95 transition-all cursor-pointer"
          >
            <span>🍫</span>
            <span>{totalChoco}</span>
          </button>
        </div>

        {/* Right: Streak & High Score Icons */}
        <div className="flex items-center gap-1.5">
          {/* High Score Icon Pill */}
          {highScore && highScore.score > 0 && (
            <button
              type="button"
              data-interactive="true"
              onClick={onOpenLeaderboard}
              aria-label="Leaderboard"
              className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-950/85 backdrop-blur-md border border-slate-800 rounded-full text-xs text-amber-300 font-mono font-bold shadow-md hover:border-amber-500/50 active:scale-95 transition-all cursor-pointer"
            >
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              <span>{highScore.score.toLocaleString()}</span>
            </button>
          )}

          {/* Streak Pill */}
          <button
            type="button"
            data-interactive="true"
            onClick={onOpenStreak}
            aria-label="Daily Streak"
            className="flex items-center gap-1 px-2.5 py-1.5 bg-gradient-to-r from-orange-500/20 to-amber-500/20 backdrop-blur-md border border-orange-500/50 hover:border-orange-400 rounded-full text-xs font-display font-bold text-orange-300 shadow-md active:scale-95 transition-all cursor-pointer group"
          >
            <Flame className="w-3.5 h-3.5 text-orange-400 fill-orange-400 group-hover:animate-bounce" />
            <span>{streak.currentStreak}d</span>
          </button>
        </div>
      </div>

      {/* GAME TITLE LOGO */}
      <div className="flex flex-col items-center text-center mt-2 pointer-events-none">
        <h1 className="font-display font-black text-3xl sm:text-5xl tracking-wider text-transparent bg-clip-text bg-gradient-to-b from-yellow-200 via-amber-400 to-amber-600 drop-shadow-[0_4px_14px_rgba(0,0,0,0.85)] uppercase">
          RAT SURFERS
        </h1>
        <p className="text-[10px] sm:text-[11px] font-display font-extrabold uppercase tracking-widest text-amber-300/90 mt-0.5">
          Subway Feline Escape
        </p>
      </div>

      {/* CENTER VIEWPORT (Animated 3D Pip sprays graffiti) */}
      <div className="flex-1" />

      {/* BOTTOM AREA: PUNCHY PLAY BUTTON & ICON-ONLY DOCK (ZERO INSTRUCTION CLUTTER) */}
      <div className="flex flex-col items-center w-full max-w-sm mx-auto gap-2.5 pointer-events-auto pb-2">
        {/* BIG START RUN BUTTON */}
        <button
          type="button"
          data-interactive="true"
          onClick={onStart}
          aria-label="Play Game"
          className="w-full py-3.5 sm:py-4 px-6 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 active:scale-95 text-slate-950 font-display font-black text-base sm:text-lg tracking-wider uppercase rounded-2xl shadow-[0_0_30px_rgba(245,158,11,0.55)] transition-all flex items-center justify-center gap-2 border-2 border-yellow-200/80 cursor-pointer"
        >
          <Play className="w-5 h-5 fill-slate-950" />
          <span>START RUN</span>
        </button>

        {/* CLEAN, ICON-ONLY FOOTER DOCK (No text clutter, pure icon simplicity) */}
        <div className="flex items-center justify-around p-1.5 bg-slate-950/90 backdrop-blur-md border border-slate-800/80 rounded-2xl shadow-xl w-full">
          {/* 1. Shop & Gear */}
          <button
            type="button"
            data-interactive="true"
            onClick={onOpenShop}
            title="Shop & Gear"
            aria-label="Shop and Gear"
            className="flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-slate-900/90 border border-amber-500/40 text-amber-400 hover:text-amber-300 hover:bg-slate-800 active:scale-95 transition-all shadow-md cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          {/* 2. Leaderboard */}
          <button
            type="button"
            data-interactive="true"
            onClick={onOpenLeaderboard}
            title="Underground League"
            aria-label="Underground League"
            className="flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-slate-900/90 border border-slate-700 text-yellow-400 hover:text-yellow-300 hover:bg-slate-800 active:scale-95 transition-all shadow-md cursor-pointer"
          >
            <Trophy className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          {/* 3. Escape Streaks */}
          <button
            type="button"
            data-interactive="true"
            onClick={onOpenStreak}
            title="Streaks"
            aria-label="Streaks"
            className="flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-slate-900/90 border border-orange-500/40 text-orange-400 hover:text-orange-300 hover:bg-slate-800 active:scale-95 transition-all shadow-md cursor-pointer"
          >
            <Flame className="w-4 h-4 sm:w-5 sm:h-5 fill-orange-400/30" />
          </button>

          {/* 4. How to Play / Help (Replaces clutter on home screen!) */}
          <button
            type="button"
            data-interactive="true"
            onClick={onOpenHelp}
            title="How to Play"
            aria-label="How to Play"
            className="flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-slate-900/90 border border-cyan-500/40 text-cyan-400 hover:text-cyan-300 hover:bg-slate-800 active:scale-95 transition-all shadow-md cursor-pointer"
          >
            <HelpCircle className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          {/* 5. Install PWA */}
          <button
            type="button"
            data-interactive="true"
            onClick={onInstallPWA}
            title={isPWAInstalled ? 'App Installed' : 'Install App'}
            aria-label="Install App"
            className={`flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-xl border active:scale-95 transition-all shadow-md cursor-pointer ${
              isPWAInstalled
                ? 'bg-emerald-950/40 border-emerald-600/40 text-emerald-400'
                : 'bg-slate-900/90 border-slate-700 text-indigo-400 hover:text-indigo-300 hover:bg-slate-800'
            }`}
          >
            {isPWAInstalled ? <Check className="w-4 h-4 sm:w-5 sm:h-5" /> : <Download className="w-4 h-4 sm:w-5 sm:h-5" />}
          </button>

          {/* 6. Audio Toggle */}
          <button
            type="button"
            data-interactive="true"
            onClick={onToggleMute}
            title={isMuted ? 'Unmute' : 'Mute'}
            aria-label={isMuted ? 'Unmute' : 'Mute'}
            className="flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-slate-900/90 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 active:scale-95 transition-all shadow-md cursor-pointer"
          >
            {isMuted ? <VolumeX className="w-4 h-4 sm:w-5 sm:h-5 text-rose-400" /> : <Volume2 className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" />}
          </button>

          {/* 7. Source Code Repository Link */}
          <a
            href="https://github.com/Ahileesh/Rat-Surfers"
            target="_blank"
            rel="noopener noreferrer"
            title="Source Code Repository: Ahileesh/Rat-Surfers"
            aria-label="View Source Code on GitHub"
            className="flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-slate-900/90 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 active:scale-95 transition-all shadow-md cursor-pointer"
          >
            <Code className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-400" />
          </a>
        </div>
      </div>
    </div>
  );
};
