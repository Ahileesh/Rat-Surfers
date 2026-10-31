/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { LeaderboardEntry } from '../types/game';

// Calibrated 25-Competitor League: Balanced for high-speed runs where 10k is introductory
export const RODENT_COMPETITORS_25: { name: string; title: string; baseScore: number }[] = [
  { name: 'TurboNibbler', title: 'Grandmaster Scurrier', baseScore: 64500 },
  { name: 'CheddarCheetah', title: 'Subway Speedster', baseScore: 58200 },
  { name: 'NeonScurrier', title: 'Neon Phantom', baseScore: 52600 },
  { name: 'ShadowWhiskers', title: 'Stealth Acrobat', baseScore: 47800 },
  { name: 'FlashPaws', title: 'Track Blazer', baseScore: 43500 },
  { name: 'SwissGlider', title: 'Aero Vault Master', baseScore: 39800 },
  { name: 'CaptainCrumb', title: 'Underground Veteran', baseScore: 36400 },
  { name: 'SpeedySqueak', title: 'Tunnel Sprinter', baseScore: 33300 },
  { name: 'VelvetViper', title: 'Subway Ace', baseScore: 30500 },
  { name: 'GoudaGlide', title: 'Cheese Connoisseur', baseScore: 28000 },
  { name: 'SonicSnout', title: 'Express Runner', baseScore: 25800 },
  { name: 'CheesyRider', title: 'Rail Rider', baseScore: 23900 },
  { name: 'ZigZagPip', title: 'Dodge Maestro', baseScore: 22200 },
  { name: 'BarnabyBouncer', title: 'Spring Champion', baseScore: 20700 },
  { name: 'PixelPaw', title: 'Subterranean Scout', baseScore: 19300 },
  { name: 'SewerSurfer99', title: 'Urban Legend', baseScore: 18000 },
  { name: 'BrieBlaster', title: 'Rocket Scurrier', baseScore: 16800 },
  { name: 'ThunderTail', title: 'Speed Cadet', baseScore: 15600 },
  { name: 'SubwayPhantom', title: 'Night Prowler', baseScore: 14500 },
  { name: 'WhiskersMcGee', title: 'Track Hustler', baseScore: 13400 },
  { name: 'RustyRodent', title: 'Metro Wanderer', baseScore: 12300 },
  { name: 'DashMouser', title: 'Quick Paw', baseScore: 11200 },
  { name: 'MetroScamper', title: 'Alley Runner', baseScore: 10100 },
  { name: 'PipsterPrime', title: 'Tunnel Hopper', baseScore: 9100 },
  { name: 'CrumbCollector', title: 'Rookie Scurrier', baseScore: 8200 },
];

const SKINS = ['classic', 'golden', 'ninja', 'punk', 'cosmo', 'king', 'detective'];

function pseudoHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return Math.abs(hash);
}

/**
 * Calculates a player title based on their upgrade levels and high score
 */
export function getPlayerTitle(totalToolLevels: number, score: number): string {
  if (totalToolLevels >= 100 || score >= 60000) return 'Subway Tycoon';
  if (totalToolLevels >= 50 || score >= 45000) return 'Legendary Sprinter';
  if (totalToolLevels >= 30 || score >= 30000) return 'Subway Ace';
  if (totalToolLevels >= 15 || score >= 18000) return 'Tunnel Runner';
  return 'Rookie Scurrier';
}

/**
 * Generates dynamic 25-competitor leaderboard entries that update fast across runs AND while idle.
 * Competitor scores strictly increase with daily gains (never decrease).
 */
export function getDailyVirtualLeaderboard(
  playerScore: number,
  playerStreak: number,
  playerCheese: number,
  playerSkinId: string,
  totalRuns: number = 0,
  totalToolLevels: number = 8
): LeaderboardEntry[] {
  const today = new Date().toISOString().slice(0, 10);
  // Real-time idle progression: Every 20 minutes of elapsed real time simulated rivals advance!
  const idleTimeBlock = Math.floor(Date.now() / (1000 * 60 * 20));

  // Generate 25 simulated competitors with dynamic shifts based on runs + real-time elapsed intervals
  const entries: LeaderboardEntry[] = RODENT_COMPETITORS_25.map((comp, index) => {
    // Dynamic seed incorporates date, rival name, run count, and idle elapsed time
    const seed = pseudoHash(`${today}-${comp.name}-${index}-r${totalRuns}-t${idleTimeBlock}`);
    
    // Competitors steadily earn positive points today (scores NEVER decrease)
    const runShift = (totalRuns * 180);
    const idleGains = ((idleTimeBlock + index * 3) % 12) * 220;
    const dailyNaturalGain = 350 + (seed % 1900);
    const todayTotalGain = dailyNaturalGain + runShift + idleGains;

    // Upper competitors push higher when player achieves massive scores
    const playerRivalryBoost = Math.floor(Math.max(0, playerScore - 25000) * 0.22);
    
    const score = comp.baseScore + todayTotalGain + (index < 12 ? playerRivalryBoost : 0);
    const streak = Math.max(1, (seed % 35) + 1);
    const cheese = Math.floor(score * 0.16);
    const skinId = SKINS[seed % SKINS.length];
    
    // Previous rank for delta tracking: simulated previous standing
    const rankDelta = ((seed % 5) - 2); // -2 to +2
    const initialRank = index + 1;
    const previousRank = Math.max(1, Math.min(25, initialRank + rankDelta));

    return {
      id: `bot_${comp.name}`,
      rank: initialRank,
      previousRank,
      name: comp.name,
      score,
      scoreDelta: todayTotalGain, // ALWAYS positive points gained today!
      streak,
      cheese,
      skinId,
      title: comp.title,
      isPlayer: false,
    };
  });

  // Dynamic Player Entry: Real score determines exact placement in the league
  const realScore = Math.max(0, playerScore);
  const playerTitle = getPlayerTitle(totalToolLevels, realScore);

  const playerEntry: LeaderboardEntry = {
    id: 'player_user',
    rank: 26,
    previousRank: 26,
    name: 'You (Pip)',
    score: realScore,
    scoreDelta: totalRuns > 0 ? Math.max(100, Math.floor(realScore * 0.05)) : 0,
    streak: Math.max(playerStreak, 1),
    cheese: playerCheese,
    skinId: playerSkinId,
    title: playerTitle,
    isPlayer: true,
  };

  const combined = [...entries, playerEntry];

  // Sort by score descending - pure performance-based ranking
  combined.sort((a, b) => b.score - a.score);

  // Re-assign ranks 1..26 dynamically and compute deltas
  return combined.slice(0, 26).map((entry, idx) => {
    const newRank = idx + 1;
    const prevRank = entry.isPlayer
      ? (totalRuns > 0 && realScore > 0 ? Math.min(26, newRank + 1) : newRank)
      : entry.previousRank;
    return {
      ...entry,
      rank: newRank,
      previousRank: prevRank,
    };
  });
}
