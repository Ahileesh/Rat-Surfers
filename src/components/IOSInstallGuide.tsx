import React, { useState } from 'react';
import { X, Check, Share, PlusSquare, Smartphone, Tablet, ChevronDown, ChevronUp } from 'lucide-react';

interface IOSInstallGuideProps {
  onClose: () => void;
  isIPad?: boolean;
}

export const IOSInstallGuide: React.FC<IOSInstallGuideProps> = ({ onClose, isIPad: propIsIPad }) => {
  // Auto-detect iPadOS vs iPhone iOS if not explicitly passed
  const isIPad = propIsIPad ?? (() => {
    if (typeof window === 'undefined') return false;
    const ua = window.navigator.userAgent.toLowerCase();
    return /ipad/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  })();

  const [step1Done, setStep1Done] = useState(false);
  const [step2Done, setStep2Done] = useState(false);

  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md select-none animate-fadeIn">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header with Auto-detected Device Badge */}
        <div className="flex items-center justify-between px-4 py-3 sm:px-5 sm:py-4 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
              {isIPad ? <Tablet className="w-5 h-5" /> : <Smartphone className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display font-black text-sm sm:text-base text-slate-100 uppercase tracking-wide">
                  Install Rat Surfers
                </h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  {isIPad ? 'iPadOS' : 'iOS'} Safari
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Play full-screen offline with zero app store lag
              </p>
            </div>
          </div>

          <button
            type="button"
            data-interactive="true"
            onClick={onClose}
            aria-label="Close"
            className="shrink-0 w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-300 hover:text-white border border-slate-700 flex items-center justify-center transition-all cursor-pointer shadow-md"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-5 space-y-3.5">
          {/* Animated Directional Pointer to Safari Share Icon */}
          <div
            className={`p-3 rounded-2xl border flex items-center gap-3 transition-all ${
              isIPad
                ? 'bg-sky-950/30 border-sky-500/40 text-sky-200'
                : 'bg-indigo-950/30 border-indigo-500/40 text-indigo-200'
            }`}
          >
            <div className="w-8 h-8 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center shrink-0">
              {isIPad ? (
                <ChevronUp className="w-5 h-5 text-sky-400 animate-bounce" />
              ) : (
                <ChevronDown className="w-5 h-5 text-indigo-400 animate-bounce" />
              )}
            </div>
            <div className="text-xs leading-relaxed">
              {isIPad ? (
                <span>
                  Safari's Share button <strong className="text-sky-300">[↑]</strong> is at the{' '}
                  <strong className="text-sky-300 uppercase underline">top right</strong> toolbar on iPad!
                </span>
              ) : (
                <span>
                  Safari's Share button <strong className="text-indigo-300">[↑]</strong> is at the{' '}
                  <strong className="text-indigo-300 uppercase underline">bottom</strong> toolbar on iPhone!
                </span>
              )}
            </div>
          </div>

          {/* Step 1: Interactive Tap Share Button */}
          <button
            type="button"
            data-interactive="true"
            onClick={() => setStep1Done(!step1Done)}
            className={`w-full text-left p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
              step1Done
                ? 'bg-emerald-950/30 border-emerald-500/50 shadow-[0_0_12px_rgba(16,185,129,0.2)]'
                : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                  step1Done
                    ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                    : 'bg-slate-900 text-amber-400 border-slate-700'
                }`}
              >
                {step1Done ? <Check className="w-5 h-5 font-bold" /> : <Share className="w-5 h-5" />}
              </div>
              <div>
                <div className="font-display font-bold text-xs sm:text-sm text-slate-100 flex items-center gap-1.5">
                  <span>Step 1: Tap the Share Button</span>
                  <span className="font-mono text-[11px] text-amber-400">[↑]</span>
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  {isIPad ? 'Located in the top-right toolbar' : 'Located at the bottom of the Safari screen'}
                </div>
              </div>
            </div>

            <div
              className={`w-6 h-6 rounded-full border flex items-center justify-center shrink-0 ${
                step1Done
                  ? 'bg-emerald-500 border-emerald-400 text-slate-950'
                  : 'border-slate-700 bg-slate-900 text-transparent'
              }`}
            >
              <Check className="w-3.5 h-3.5" />
            </div>
          </button>

          {/* Step 2: Interactive Add to Home Screen */}
          <button
            type="button"
            data-interactive="true"
            onClick={() => setStep2Done(!step2Done)}
            className={`w-full text-left p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
              step2Done
                ? 'bg-emerald-950/30 border-emerald-500/50 shadow-[0_0_12px_rgba(16,185,129,0.2)]'
                : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                  step2Done
                    ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                    : 'bg-slate-900 text-amber-400 border-slate-700'
                }`}
              >
                {step2Done ? <Check className="w-5 h-5 font-bold" /> : <PlusSquare className="w-5 h-5" />}
              </div>
              <div>
                <div className="font-display font-bold text-xs sm:text-sm text-slate-100 flex items-center gap-1.5">
                  <span>Step 2: Tap "Add to Home Screen"</span>
                  <span className="font-mono text-[11px] text-amber-400">[+]</span>
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  Scroll down the menu and choose Add to Home Screen
                </div>
              </div>
            </div>

            <div
              className={`w-6 h-6 rounded-full border flex items-center justify-center shrink-0 ${
                step2Done
                  ? 'bg-emerald-500 border-emerald-400 text-slate-950'
                  : 'border-slate-700 bg-slate-900 text-transparent'
              }`}
            >
              <Check className="w-3.5 h-3.5" />
            </div>
          </button>
        </div>

        {/* Footer */}
        <div className="p-3 sm:p-4 border-t border-slate-800 bg-slate-950/80 flex justify-end">
          <button
            type="button"
            data-interactive="true"
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 active:scale-95 text-slate-950 font-display font-black text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-md text-center"
          >
            Got It, Let's Play!
          </button>
        </div>
      </div>
    </div>
  );
};
