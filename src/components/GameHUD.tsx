import React from 'react';
import {
  Pause,
  Zap,
  Magnet,
  Shield,
  Flame,
  CheckCircle2,
  Wind,
} from 'lucide-react';
import { PlayerStats, PowerUpActive } from '../types/game';

interface GameHUDProps {
  stats: PlayerStats;
  activeBuffs: PowerUpActive[];
  isMuted: boolean;
  biomeBanner?: string | null;
  onToggleMute: () => void;
  onPause: () => void;
  onRestart?: () => void;
  onAction?: (action: 'LEFT' | 'RIGHT' | 'JUMP' | 'SLIDE') => void;
}

export const GameHUD: React.FC<GameHUDProps> = ({
  stats,
  activeBuffs,
  onPause,
}) => {
  const isCriticalThreat = stats.catDistance < 4.8;
  const isModerateThreat = stats.catDistance < 7.5;

  const handlePauseTrigger = (e: React.SyntheticEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onPause();
  };

  return (
    <div className="absolute inset-0 z-10 pointer-events-none select-none flex flex-col justify-between p-3 sm:p-5 overflow-hidden">
      {/* Red Warning Scratch Vignette when cat is dangerously close */}
      {isCriticalThreat && (
        <div
          className="absolute inset-0 pointer-events-none border-4 sm:border-8 border-red-600/40 shadow-[inset_0_0_80px_rgba(239,68,68,0.55)] transition-opacity duration-200"
          style={{ opacity: Math.min(1, (4.8 - stats.catDistance) / 2.0) }}
        />
      )}

      {/* DEDICATED FIXED PAUSE BUTTON: Always anchored in top-right, NEVER pushed or hidden by expanding score */}
      <button
        type="button"
        data-interactive="true"
        onClick={handlePauseTrigger}
        onTouchEnd={handlePauseTrigger}
        aria-label="Pause Game"
        title="Pause Game"
        style={{ touchAction: 'manipulation' }}
        className="fixed top-2.5 right-2.5 sm:top-4 sm:right-4 z-40 pointer-events-auto flex items-center justify-center min-w-[44px] min-h-[44px] w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-slate-950/95 backdrop-blur-md border border-amber-500/70 hover:border-amber-400 active:scale-95 text-amber-400 hover:text-yellow-300 transition-all shadow-md cursor-pointer"
      >
        <Pause className="w-5 h-5 fill-amber-400" />
      </button>

      {/* TOP BAR: Ultra-compact, clean header with safe margin away from fixed Pause button */}
      <div className="w-full max-w-3xl mx-auto flex items-start justify-between gap-1.5 pr-13 sm:pr-15">
        {/* Left: Distance & Score Badge + Mission Status */}
        <div className="flex flex-col gap-1 items-start max-w-[calc(100%-65px)]">
          {/* Distance & Score Main Pill - Compact & Elegant */}
          <div className="bg-slate-950/90 backdrop-blur-md border border-slate-800/90 px-2.5 py-1 rounded-xl flex items-center gap-2 shadow-lg max-w-full overflow-hidden">
            <div className="shrink-0 flex items-center gap-0.5">
              <span className="font-display font-extrabold text-xs sm:text-sm text-amber-400 tabular-nums">
                {stats.distance}
              </span>
              <span className="text-[9px] text-amber-200/70">m</span>
            </div>

            <div className="w-px h-3.5 bg-slate-800 shrink-0" />

            <div className="truncate">
              <span className="font-mono font-bold text-xs sm:text-sm text-slate-100 tabular-nums">
                {stats.score.toLocaleString()}
              </span>
            </div>

            {stats.multiplier > 1 && (
              <div className="shrink-0 flex items-center px-1 py-0.2 bg-amber-500/20 border border-amber-500/35 rounded-full text-amber-400 font-display font-black text-[9px]">
                <Flame className="w-2 h-2 fill-amber-400 mr-0.5" />
                <span>{stats.multiplier}x</span>
              </div>
            )}
          </div>

          {/* Treats Inventory Counter - Small, Minimal Footprint */}
          <div className="flex items-center gap-2 px-2 py-0.5 bg-slate-950/80 backdrop-blur-md border border-slate-800/70 rounded-lg text-[10px] shadow-sm">
            <div className="flex items-center gap-1 text-amber-300 font-mono font-bold">
              <span className="w-2 h-2 bg-amber-400 rounded-sm shadow-[0_0_4px_#f59e0b]" />
              <span>{stats.cheeseCount}</span>
            </div>
            <span className="text-slate-700">·</span>
            <div className="flex items-center gap-1 text-pink-300 font-mono font-bold">
              <span className="w-2 h-2 bg-pink-500 rounded-full" />
              <span>{stats.candyCount}</span>
            </div>
            <span className="text-slate-700">·</span>
            <div className="flex items-center gap-1 text-amber-500 font-mono font-bold">
              <span className="w-2 h-2 bg-amber-800 rounded-sm" />
              <span>{stats.chocoCount}</span>
            </div>
          </div>

          {/* Active Mission Mini-Tracker */}
          {stats.activeMission && (
            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-slate-950/80 backdrop-blur-md border border-amber-500/25 rounded-lg text-[9px] text-slate-300 shadow-sm max-w-full truncate">
              <span className="text-amber-400 font-bold shrink-0">🎯</span>
              <span className="truncate">{stats.activeMission.title}:</span>
              <span className="font-mono text-amber-300 font-bold shrink-0">
                {Math.min(stats.activeMission.target, stats.activeMission.current)}/{stats.activeMission.target}
              </span>
              {stats.activeMission.completed && (
                <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400 shrink-0" />
              )}
            </div>
          )}
        </div>

        {/* Right: Cat Distance Threat Indicator */}
        <div className="flex items-center gap-1.5 shrink-0">
          <div
            className={`flex items-center gap-1 px-2 py-1 rounded-xl border text-[11px] font-bold transition-all shadow-md ${
              isCriticalThreat
                ? 'bg-red-950/95 border-red-500 text-red-200 animate-pulse shadow-red-900/40'
                : isModerateThreat
                ? 'bg-amber-950/90 border-amber-500/80 text-amber-200'
                : 'bg-slate-950/90 border-slate-800 text-slate-300'
            }`}
          >
            <span className="text-[11px]">🐾</span>
            <span className="font-mono text-[10px] tabular-nums">
              {stats.catDistance.toFixed(1)}m
            </span>
          </div>
        </div>
      </div>

      {/* ACTIVE POWER-UP BUFF DOCK: Ultra-Compact Micro-Pills (Zero Screen Clutter!) */}
      {activeBuffs.length > 0 && (
        <div className="flex items-center gap-1 mt-1 pointer-events-none flex-wrap">
          {activeBuffs.map(buff => {
            let icon = <Zap className="w-2.5 h-2.5 text-amber-300 fill-amber-300" />;
            let badgeBg = 'bg-amber-950/80 border-amber-500/50 text-amber-200';

            if (buff.type === 'MAGNET') {
              icon = <Magnet className="w-2.5 h-2.5 text-rose-300" />;
              badgeBg = 'bg-rose-950/80 border-rose-500/50 text-rose-200';
            } else if (buff.type === 'CHEESE_SHIELD') {
              icon = <Shield className="w-2.5 h-2.5 text-cyan-200" />;
              badgeBg = 'bg-cyan-950/80 border-cyan-500/50 text-cyan-100';
            } else if (buff.type === 'GLIDER_WINGS') {
              icon = <Wind className="w-2.5 h-2.5 text-sky-200" />;
              badgeBg = 'bg-sky-950/80 border-sky-400/50 text-sky-100';
            }

            return (
              <div
                key={buff.type}
                className={`flex items-center gap-1 px-1.5 py-0.5 rounded-full border shadow-sm backdrop-blur-md ${badgeBg} animate-fadeIn`}
              >
                {icon}
                <span className="font-mono font-bold text-[9px] text-white tabular-nums">
                  {Math.ceil(buff.remaining)}s
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* Center is completely clear! Zero popups, zero banners blocking the road! */}
      <div className="flex-1" />
    </div>
  );
};
