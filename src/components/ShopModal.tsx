import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Zap,
  Magnet,
  Shield,
  Rocket,
  Flame,
  ArrowUpCircle,
  Crown,
  Radio,
  Bell,
  Coins,
  ArrowRightLeft,
  CircleDollarSign,
  Check,
  Wind,
} from 'lucide-react';
import { RatSkin, ToolUpgrade, ToolUpgradeId, StreakData } from '../types/game';
import { STREAK_MILESTONES } from './StreakModal';

interface ShopModalProps {
  totalCheese: number;
  totalCandy: number;
  totalChoco: number;
  skins: RatSkin[];
  activeSkinId: string;
  tools: ToolUpgrade[];
  streak: StreakData;
  onSelectSkin: (skinId: string) => void;
  onBuySkin: (skin: RatSkin) => void;
  onUpgradeTool: (toolId: ToolUpgradeId) => void;
  onExchangeCandy: (candies: number, cheeseReward: number) => void;
  onExchangeChoco: (choco: number, cheeseReward: number) => void;
  onExchangeAll: () => void;
  onClaimStreakReward: (rewardCheese: number) => void;
  hasClaimableStreakReward: boolean;
  onClose: () => void;
}

export const ShopModal: React.FC<ShopModalProps> = ({
  totalCheese,
  totalCandy,
  totalChoco,
  skins,
  activeSkinId,
  tools,
  streak,
  onSelectSkin,
  onBuySkin,
  onUpgradeTool,
  onExchangeCandy,
  onExchangeChoco,
  onExchangeAll,
  onClaimStreakReward,
  hasClaimableStreakReward,
  onClose,
}) => {
  const [tab, setTab] = useState<'TOOLS' | 'EXCHANGE' | 'SKINS' | 'STREAKS'>('TOOLS');

  const getToolIcon = (iconType: string) => {
    switch (iconType) {
      case 'magnet':
        return <Magnet className="w-5 h-5 text-rose-400" />;
      case 'spring':
        return <Zap className="w-5 h-5 text-amber-400 fill-amber-400" />;
      case 'shield':
        return <Shield className="w-5 h-5 text-cyan-400" />;
      case 'multiplier':
        return <Flame className="w-5 h-5 text-orange-400 fill-orange-400" />;
      case 'rocket':
        return <Rocket className="w-5 h-5 text-purple-400" />;
      case 'radar':
        return <Radio className="w-5 h-5 text-emerald-400" />;
      case 'distractor':
        return <Bell className="w-5 h-5 text-pink-400" />;
      case 'vault':
        return <Coins className="w-5 h-5 text-yellow-400" />;
      case 'wings':
        return <Wind className="w-5 h-5 text-sky-400" />;
      case 'clover':
        return <Sparkles className="w-5 h-5 text-emerald-400" />;
      case 'fever_spark':
        return <Flame className="w-5 h-5 text-amber-400 fill-amber-400" />;
      default:
        return <Sparkles className="w-5 h-5 text-amber-400" />;
    }
  };

  const eligibleMilestone = STREAK_MILESTONES.slice().reverse().find(m => streak.currentStreak >= m.days);
  const streakRewardAmount = eligibleMilestone ? eligibleMilestone.reward : 250;

  const candyPacks = [
    { candies: 5, cheese: 25, bonus: '' },
    { candies: 25, cheese: 150, bonus: '+20%' },
    { candies: 100, cheese: 700, bonus: '+40%' },
  ];

  const chocoPacks = [
    { choco: 2, cheese: 30, bonus: '' },
    { choco: 10, cheese: 180, bonus: '+20%' },
    { choco: 50, cheese: 1100, bonus: '+45%' },
  ];

  const totalTreatValueInCheese = totalCandy * 5 + totalChoco * 15;

  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md select-none animate-fadeIn">
      <div className="w-full max-w-xl max-h-[92vh] overflow-hidden bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl flex flex-col">
        {/* Top Header: Title & Anchored Close Button (Never hidden on mobile) */}
        <div className="flex items-center justify-between px-3.5 py-2.5 sm:px-5 sm:py-3.5 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Crown className="w-4 h-4" />
            </div>
            <h2 className="font-display font-black text-sm sm:text-lg text-slate-100 uppercase tracking-wide">
              Market & Gear
            </h2>
          </div>

          <button
            type="button"
            data-interactive="true"
            onClick={onClose}
            aria-label="Close Shop"
            className="shrink-0 w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-slate-800/90 hover:bg-slate-700 active:scale-95 text-slate-200 hover:text-white border border-slate-700/80 flex items-center justify-center transition-all cursor-pointer shadow-md"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        {/* Currency Bar: Balanced Fixed-Ratio Grid (🧀 🍬 🍫) */}
        <div className="grid grid-cols-3 gap-1.5 px-3 py-2 sm:px-4 sm:py-2 bg-slate-950/60 border-b border-slate-800/80 text-xs">
          {/* Cheese */}
          <div className="flex items-center justify-center gap-1.5 py-1 px-2 bg-amber-500/15 border border-amber-500/35 rounded-xl text-amber-300 font-mono font-bold truncate">
            <span className="w-2.5 h-2.5 bg-amber-400 rounded-sm rotate-45 shadow-[0_0_6px_#f59e0b] shrink-0" />
            <span>{totalCheese.toLocaleString()}</span>
          </div>

          {/* Candy */}
          <div className="flex items-center justify-center gap-1 py-1 px-2 bg-pink-500/15 border border-pink-500/30 rounded-xl text-pink-300 font-mono font-bold truncate">
            <span>🍬</span>
            <span>{totalCandy}</span>
          </div>

          {/* Choco */}
          <div className="flex items-center justify-center gap-1 py-1 px-2 bg-amber-900/40 border border-amber-700/40 rounded-xl text-amber-200 font-mono font-bold truncate">
            <span>🍫</span>
            <span>{totalChoco}</span>
          </div>
        </div>

        {/* 4 Navigation Tabs: Equal-Width Responsive Grid */}
        <div className="grid grid-cols-4 gap-1 p-1.5 sm:p-2 bg-slate-950/90 border-b border-slate-800/80">
          <button
            type="button"
            data-interactive="true"
            onClick={() => setTab('TOOLS')}
            className={`py-2 text-[11px] font-display font-bold uppercase rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1 ${
              tab === 'TOOLS'
                ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Zap className="w-3.5 h-3.5 shrink-0" />
            <span>Gear</span>
          </button>

          <button
            type="button"
            data-interactive="true"
            onClick={() => setTab('EXCHANGE')}
            className={`py-2 text-[11px] font-display font-bold uppercase rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1 relative ${
              tab === 'EXCHANGE'
                ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <ArrowRightLeft className="w-3.5 h-3.5 shrink-0" />
            <span>Trade</span>
            {(totalCandy >= 5 || totalChoco >= 2) && (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse absolute top-1.5 right-1.5" />
            )}
          </button>

          <button
            type="button"
            data-interactive="true"
            onClick={() => setTab('SKINS')}
            className={`py-2 text-[11px] font-display font-bold uppercase rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1 ${
              tab === 'SKINS'
                ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Crown className="w-3.5 h-3.5 shrink-0" />
            <span>Skins</span>
          </button>

          <button
            type="button"
            data-interactive="true"
            onClick={() => setTab('STREAKS')}
            className={`py-2 text-[11px] font-display font-bold uppercase rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1 relative ${
              tab === 'STREAKS'
                ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Flame className={`w-3.5 h-3.5 shrink-0 ${tab === 'STREAKS' ? 'fill-slate-950' : 'text-amber-500 fill-amber-500'}`} />
            <span>Streaks</span>
            {hasClaimableStreakReward && (
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping absolute top-1.5 right-1.5" />
            )}
          </button>
        </div>

        {/* Content Body: Clean, Low-Text, Visual Cards */}
        <div className="p-3 sm:p-4 overflow-y-auto flex-1 max-h-[62vh]">
          {/* TAB 1: TOOL UPGRADES */}
          {tab === 'TOOLS' && (
            <div className="flex flex-col gap-2">
              {tools.map(tool => {
                const upgradeCost = Math.floor(
                  tool.baseCost * Math.pow(1.12, tool.level - 1) + (tool.level - 1) * 8
                );
                const canAfford = totalCheese >= upgradeCost;

                return (
                  <div
                    key={tool.id}
                    className="p-3 sm:p-3.5 rounded-2xl border border-slate-800 bg-slate-950/70 flex items-start sm:items-center justify-between gap-3 shadow-sm"
                  >
                    <div className="flex items-start sm:items-center gap-3 flex-1 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center shrink-0 mt-0.5 sm:mt-0">
                        {getToolIcon(tool.iconType)}
                      </div>
                      <div className="flex-1 min-w-0 pr-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-display font-bold text-xs sm:text-sm text-slate-100">
                            {tool.name}
                          </span>
                          <span className="text-[10px] font-mono font-bold text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded-md border border-amber-500/20 shrink-0">
                            Lv.{tool.level}
                          </span>
                        </div>
                        <p className="text-[11px] text-amber-300/90 font-medium mt-1 leading-snug break-words">
                          ⚡ {tool.effectLabel}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      data-interactive="true"
                      onClick={() => onUpgradeTool(tool.id)}
                      disabled={!canAfford}
                      className={`shrink-0 px-3 py-1.5 rounded-xl font-display font-bold text-xs transition-all flex items-center gap-1 cursor-pointer whitespace-nowrap ${
                        canAfford
                          ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md active:scale-95 font-black'
                          : 'bg-slate-800 text-slate-500 cursor-not-allowed opacity-50'
                      }`}
                    >
                      <ArrowUpCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{upgradeCost.toLocaleString()} 🧀</span>
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* TAB 2: TREAT TRADE DESK */}
          {tab === 'EXCHANGE' && (
            <div className="space-y-3">
              {/* Quick Cash-In All Button */}
              {totalTreatValueInCheese > 0 && (
                <button
                  type="button"
                  data-interactive="true"
                  onClick={onExchangeAll}
                  className="w-full py-2.5 px-3 bg-gradient-to-r from-emerald-500 to-emerald-400 text-slate-950 font-display font-black text-xs uppercase rounded-xl shadow-md active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <CircleDollarSign className="w-4 h-4" />
                  <span>Trade All Treats (+{totalTreatValueInCheese.toLocaleString()} 🧀)</span>
                </button>
              )}

              {/* CANDY TRADES */}
              <div>
                <span className="text-[11px] font-display font-bold uppercase tracking-wider text-pink-300 block mb-1.5">
                  🍬 Peppermint Candy ({totalCandy})
                </span>
                <div className="grid grid-cols-3 gap-2">
                  {candyPacks.map(pack => {
                    const canTrade = totalCandy >= pack.candies;
                    return (
                      <div
                        key={pack.candies}
                        className="p-2.5 bg-slate-950/70 border border-slate-800 rounded-xl flex flex-col justify-between items-center text-center gap-2"
                      >
                        <div className="flex items-center gap-1 font-mono font-bold text-xs">
                          <span className="text-pink-300">{pack.candies} 🍬</span>
                          <span className="text-slate-500">➔</span>
                          <span className="text-amber-300">+{pack.cheese} 🧀</span>
                        </div>
                        {pack.bonus && (
                          <span className="text-[9px] px-1 py-0.2 bg-emerald-500/20 text-emerald-400 font-bold rounded">
                            {pack.bonus}
                          </span>
                        )}
                        <button
                          type="button"
                          data-interactive="true"
                          onClick={() => onExchangeCandy(pack.candies, pack.cheese)}
                          disabled={!canTrade}
                          className={`w-full py-1 text-[11px] font-display font-bold uppercase rounded-lg transition-all ${
                            canTrade
                              ? 'bg-pink-500 hover:bg-pink-400 text-slate-950 active:scale-95 font-black shadow'
                              : 'bg-slate-800 text-slate-500 cursor-not-allowed opacity-50'
                          }`}
                        >
                          Trade
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* CHOCOLATE TRADES */}
              <div>
                <span className="text-[11px] font-display font-bold uppercase tracking-wider text-amber-300 block mb-1.5">
                  🍫 Chocolate Bars ({totalChoco})
                </span>
                <div className="grid grid-cols-3 gap-2">
                  {chocoPacks.map(pack => {
                    const canTrade = totalChoco >= pack.choco;
                    return (
                      <div
                        key={pack.choco}
                        className="p-2.5 bg-slate-950/70 border border-slate-800 rounded-xl flex flex-col justify-between items-center text-center gap-2"
                      >
                        <div className="flex items-center gap-1 font-mono font-bold text-xs">
                          <span className="text-amber-200">{pack.choco} 🍫</span>
                          <span className="text-slate-500">➔</span>
                          <span className="text-amber-300">+{pack.cheese} 🧀</span>
                        </div>
                        {pack.bonus && (
                          <span className="text-[9px] px-1 py-0.2 bg-emerald-500/20 text-emerald-400 font-bold rounded">
                            {pack.bonus}
                          </span>
                        )}
                        <button
                          type="button"
                          data-interactive="true"
                          onClick={() => onExchangeChoco(pack.choco, pack.cheese)}
                          disabled={!canTrade}
                          className={`w-full py-1 text-[11px] font-display font-bold uppercase rounded-lg transition-all ${
                            canTrade
                              ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 active:scale-95 font-black shadow'
                              : 'bg-slate-800 text-slate-500 cursor-not-allowed opacity-50'
                          }`}
                        >
                          Trade
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: SKINS */}
          {tab === 'SKINS' && (
            <div className="grid grid-cols-2 gap-2.5">
              {skins.map(skin => {
                const isSelected = skin.id === activeSkinId;
                const canAfford = totalCheese >= skin.cost;

                return (
                  <div
                    key={skin.id}
                    className={`p-3 rounded-2xl border flex flex-col justify-between transition-all ${
                      isSelected
                        ? 'bg-amber-500/10 border-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.2)]'
                        : skin.unlocked
                        ? 'bg-slate-950/70 border-slate-800'
                        : 'bg-slate-950/45 border-slate-800/60 opacity-80'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div
                        className="w-4 h-4 rounded-full border-2 border-white/50 shrink-0"
                        style={{ backgroundColor: `#${skin.furColor.toString(16).padStart(6, '0')}` }}
                      />
                      <span className="font-display font-bold text-xs text-slate-200 truncate">
                        {skin.name}
                      </span>
                    </div>

                    <div>
                      {isSelected ? (
                        <div className="w-full py-1.5 bg-amber-500/20 text-amber-300 text-[11px] font-display font-black uppercase rounded-lg flex items-center justify-center gap-1">
                          <Check className="w-3.5 h-3.5" />
                          <span>Equipped</span>
                        </div>
                      ) : skin.unlocked ? (
                        <button
                          type="button"
                          data-interactive="true"
                          onClick={() => onSelectSkin(skin.id)}
                          className="w-full py-1.5 bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 text-[11px] font-display font-bold uppercase rounded-lg transition-all"
                        >
                          Select
                        </button>
                      ) : (
                        <button
                          type="button"
                          data-interactive="true"
                          onClick={() => onBuySkin(skin)}
                          disabled={!canAfford}
                          className={`w-full py-1.5 text-[11px] font-display font-bold uppercase rounded-lg transition-all ${
                            canAfford
                              ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 font-black shadow active:scale-95'
                              : 'bg-slate-800 text-slate-500 cursor-not-allowed opacity-50'
                          }`}
                        >
                          {skin.cost} 🧀
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* TAB 4: RUN STREAKS */}
          {tab === 'STREAKS' && (
            <div className="space-y-3">
              {/* Current Streak Pill */}
              <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Flame className="w-6 h-6 text-orange-400 fill-orange-400 animate-pulse" />
                  <div>
                    <span className="font-display font-black text-sm text-slate-100 block">
                      {streak.currentStreak} Day Streak
                    </span>
                    <span className="text-[10px] text-slate-400">
                      Best: {streak.bestStreak}d · Runs: {streak.totalRuns}
                    </span>
                  </div>
                </div>

                {hasClaimableStreakReward && (
                  <button
                    type="button"
                    data-interactive="true"
                    onClick={() => onClaimStreakReward(streakRewardAmount)}
                    className="px-3 py-1.5 bg-gradient-to-r from-amber-500 to-amber-400 text-slate-950 text-xs font-display font-black uppercase rounded-xl shadow-lg active:scale-95 animate-bounce"
                  >
                    +{streakRewardAmount.toLocaleString()} 🧀
                  </button>
                )}
              </div>

              {/* Milestones: Icon-Driven Clean Rows */}
              <div className="space-y-1.5">
                {STREAK_MILESTONES.map(tier => {
                  const reached = streak.currentStreak >= tier.days;
                  return (
                    <div
                      key={tier.days}
                      className={`px-3 py-2 rounded-xl border flex items-center justify-between text-xs ${
                        reached
                          ? 'bg-amber-500/10 border-amber-500/30 text-amber-200'
                          : 'bg-slate-950/40 border-slate-800 text-slate-400'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-amber-400">{tier.days}d</span>
                        <span className="text-slate-300">{tier.title}</span>
                      </div>
                      <span className="font-mono font-bold text-amber-300">+{tier.reward.toLocaleString()} 🧀</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
