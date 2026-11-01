import React from 'react';
import { X, ArrowLeftRight, ArrowUp, ArrowDown, Magnet, Shield, Zap, Flame, CircleDollarSign, Wind, Code } from 'lucide-react';

interface HelpModalProps {
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ onClose }) => {
  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md select-none animate-fadeIn">
      <div className="w-full max-w-lg max-h-[92vh] overflow-hidden bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 sm:px-5 sm:py-4 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-display font-black text-base">
              ?
            </div>
            <div>
              <h2 className="font-display font-black text-base sm:text-lg text-slate-100 uppercase tracking-wide">
                How to Play
              </h2>
            </div>
          </div>

          <button
            type="button"
            data-interactive="true"
            onClick={onClose}
            aria-label="Close Help"
            className="shrink-0 w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-slate-800/90 hover:bg-slate-700 active:scale-95 text-slate-200 hover:text-white border border-slate-700/80 flex items-center justify-center transition-all cursor-pointer shadow-md"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        {/* Content Body: Icon-Driven, Visual & Clean */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4">
          {/* Controls: Touch & Keyboard */}
          <div>
            <div className="text-[11px] font-display font-extrabold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
              <span>🎮 Universal Controls</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {/* Dodge */}
              <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-2xl flex flex-col items-center text-center">
                <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-2">
                  <ArrowLeftRight className="w-5 h-5" />
                </div>
                <span className="font-display font-bold text-xs text-slate-200 uppercase">Dodge</span>
                <span className="text-[10px] text-slate-400 mt-0.5">Swipe ‹ › or A / D</span>
              </div>

              {/* Jump */}
              <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-2xl flex flex-col items-center text-center">
                <div className="w-9 h-9 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-2">
                  <ArrowUp className="w-5 h-5" />
                </div>
                <span className="font-display font-bold text-xs text-slate-200 uppercase">Jump</span>
                <span className="text-[10px] text-slate-400 mt-0.5">Swipe ▲ or Space</span>
              </div>

              {/* Slide */}
              <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-2xl flex flex-col items-center text-center">
                <div className="w-9 h-9 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400 mb-2">
                  <ArrowDown className="w-5 h-5" />
                </div>
                <span className="font-display font-bold text-xs text-slate-200 uppercase">Slide</span>
                <span className="text-[10px] text-slate-400 mt-0.5">Swipe ▼ or S</span>
              </div>
            </div>
          </div>

          {/* Power-Up Items */}
          <div>
            <div className="text-[11px] font-display font-extrabold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
              <span>⚡ Special Boosters</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {/* Magnet */}
              <div className="p-2.5 bg-slate-950/60 border border-slate-800 rounded-xl flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center shrink-0">
                  <Magnet className="w-4 h-4 text-rose-400" />
                </div>
                <div>
                  <span className="font-display font-bold text-xs text-slate-200 block">Horseshoe Magnet</span>
                  <span className="text-[11px] text-slate-400 leading-tight block">Pulls all cheese & candies smoothly toward you</span>
                </div>
              </div>

              {/* Shield */}
              <div className="p-2.5 bg-slate-950/60 border border-slate-800 rounded-xl flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center shrink-0">
                  <Shield className="w-4 h-4 text-cyan-400" />
                </div>
                <div>
                  <span className="font-display font-bold text-xs text-slate-200 block">Cheese Bubble Shield</span>
                  <span className="text-[11px] text-slate-400 leading-tight block">Absorbs 1 collision hazard safely</span>
                </div>
              </div>

              {/* Rocket Dash */}
              <div className="p-2.5 bg-slate-950/60 border border-slate-800 rounded-xl flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center shrink-0">
                  <Zap className="w-4 h-4 text-amber-400" />
                </div>
                <div>
                  <span className="font-display font-bold text-xs text-slate-200 block">Rocket Dash</span>
                  <span className="text-[11px] text-slate-400 leading-tight block">Invincible high-speed sprint across track</span>
                </div>
              </div>

              {/* Glider Wings */}
              <div className="p-2.5 bg-slate-950/60 border border-slate-800 rounded-xl flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-sky-500/20 border border-sky-500/30 flex items-center justify-center shrink-0">
                  <Wind className="w-4 h-4 text-sky-400" />
                </div>
                <div>
                  <span className="font-display font-bold text-xs text-slate-200 block">Glider Wings</span>
                  <span className="text-[11px] text-slate-400 leading-tight block">Soar high above all hazards in superhero flight</span>
                </div>
              </div>

              {/* Fever Rush */}
              <div className="p-2.5 bg-slate-950/60 border border-slate-800 rounded-xl flex items-center gap-2.5 sm:col-span-2">
                <div className="w-9 h-9 rounded-xl bg-orange-500/20 border border-orange-500/30 flex items-center justify-center shrink-0">
                  <Flame className="w-4 h-4 text-orange-400" />
                </div>
                <div>
                  <span className="font-display font-bold text-xs text-slate-200 block">Fever Rush</span>
                  <span className="text-[11px] text-slate-400 leading-tight block">Grab 10 treats to trigger a 2x turbo score frenzy</span>
                </div>
              </div>
            </div>
          </div>

          {/* Treats & Economy */}
          <div>
            <div className="text-[11px] font-display font-extrabold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
              <span>🍬 Treats & Gear Shop</span>
            </div>

            <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-2xl space-y-2">
              <div className="flex items-center gap-2 text-xs text-slate-300">
                <CircleDollarSign className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Trade peppermint candy and chocolate bars for golden cheese in the shop to upgrade permanent abilities!</span>
              </div>
            </div>
          </div>

          {/* Leaderboard */}
          <div>
            <div className="text-[11px] font-display font-extrabold uppercase tracking-wider text-amber-400/90 mb-2 flex items-center gap-1.5">
              <span>🏆 Leaderboard</span>
            </div>

            <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-xs text-slate-300 leading-relaxed">
              Your rank updates dynamically based on your high score—collect treats and score big to climb all the way to #1 Champion!
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 sm:p-4 border-t border-slate-800 bg-slate-950/80 flex flex-col sm:flex-row items-center justify-between gap-3">
          <a
            href="https://github.com/Ahileesh/Rat-Surfers"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-xs text-slate-400 hover:text-amber-300 transition-colors"
          >
            <Code className="w-4 h-4 text-cyan-400" />
            <span>Source Code: Ahileesh/Rat-Surfers</span>
          </a>

          <button
            type="button"
            data-interactive="true"
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2 bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 font-display font-black text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-md"
          >
            Got it, Let's Play!
          </button>
        </div>
      </div>
    </div>
  );
};
