import React, { useEffect, useState } from 'react';
import { Play, RotateCcw, Volume2, VolumeX, Home, ShoppingBag } from 'lucide-react';

interface PauseModalProps {
  onResume: () => void;
  onRestart: () => void;
  onHome: () => void;
  onOpenShop: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  onResume,
  onRestart,
  onHome,
  onOpenShop,
  isMuted,
  onToggleMute,
}) => {
  const [controlMode, setControlMode] = useState<'touch' | 'keyboard'>('touch');

  useEffect(() => {
    try {
      const saved = localStorage.getItem('rat_surfers_control_mode') as 'touch' | 'keyboard' | null;
      if (saved) {
        setControlMode(saved);
        return;
      }
    } catch {}
    const hasTouch = 'ontouchstart' in window || (navigator.maxTouchPoints && navigator.maxTouchPoints > 0);
    const isCoarse = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
    const isMobileSize = window.innerWidth <= 1024;
    setControlMode(hasTouch || isCoarse || isMobileSize ? 'touch' : 'keyboard');
  }, []);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.code === 'Escape' || e.code === 'KeyP' || e.code === 'Space') {
        e.preventDefault();
        onResume();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onResume]);

  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md select-none animate-fadeIn">
      <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-col items-center text-center">
        <h2 className="font-display font-black text-2xl text-slate-100 uppercase tracking-wider mb-1">
          Game Paused
        </h2>
        <p className="text-xs text-slate-400 mb-5">Take a breather, Pip.</p>

        <div className="w-full flex flex-col gap-2.5 mb-4">
          <button
            type="button"
            data-interactive="true"
            onClick={onResume}
            style={{ touchAction: 'manipulation' }}
            className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-amber-400 active:scale-95 text-slate-950 font-display font-black text-sm uppercase tracking-wider rounded-2xl transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer border border-yellow-200/50"
          >
            <Play className="w-4 h-4 fill-slate-950" />
            <span>Resume Game</span>
          </button>

          <button
            type="button"
            data-interactive="true"
            onClick={onRestart}
            style={{ touchAction: 'manipulation' }}
            className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 font-display font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Restart Run</span>
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

          <button
            type="button"
            data-interactive="true"
            onClick={onToggleMute}
            style={{ touchAction: 'manipulation' }}
            className="w-full py-2.5 bg-slate-950/70 hover:bg-slate-900 active:scale-95 text-slate-300 text-xs rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer border border-slate-800"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
            <span>Sound: {isMuted ? 'Muted' : 'Enabled'}</span>
          </button>
        </div>

        {/* DEVICE-AWARE CONTROLS: Show touch instructions on mobile/tablet or touch mode */}
        <div className="text-[11px] text-slate-400 border-t border-slate-800 pt-3 w-full">
          {controlMode === 'keyboard'
            ? 'Desktop: Arrows / WASD to Steer, Jump & Slide'
            : 'Swipe ‹ › to Dodge · Swipe Up to Jump · Swipe Down to Slide'}
        </div>
      </div>
    </div>
  );
};
