import { useEffect, useRef, useState, useCallback } from 'react';
import { GameHUD } from './components/GameHUD';
import { GameOverModal } from './components/GameOverModal';
import { PauseModal } from './components/PauseModal';
import { ShopModal } from './components/ShopModal';
import { TitleScreen } from './components/TitleScreen';
import { VirtualLeaderboardModal } from './components/VirtualLeaderboardModal';
import { StreakModal, STREAK_MILESTONES } from './components/StreakModal';
import { HelpModal } from './components/HelpModal';
import { IOSInstallGuide } from './components/IOSInstallGuide';
import { audioSynth } from './game/systems/AudioSynth';
import { InputManager } from './game/systems/InputManager';
import { SceneManager } from './game/three/SceneManager';
import { usePWAInstall } from './hooks/usePWAInstall';
import {
  CavernBiome,
  GameState,
  HighScoreRecord,
  PlayerStats,
  PowerUpActive,
  RatSkin,
  ToolUpgrade,
  ToolUpgradeId,
  StreakData,
} from './types/game';

const INITIAL_SKINS: RatSkin[] = [
  {
    id: 'classic',
    name: 'Honey Pip',
    description: 'The cheerful, swift golden mouse with bright sparkling blue eyes.',
    furColor: 0xf59e0b,
    bellyColor: 0xfef9c3,
    cost: 0,
    unlocked: true,
  },
  {
    id: 'golden',
    name: 'Super Cheddar',
    description: 'Aged to sunny perfection with a joyful cheese-loving glow.',
    furColor: 0xfacc15,
    bellyColor: 0xfef08a,
    cost: 45,
    unlocked: false,
    badge: 'Popular',
  },
  {
    id: 'ninja',
    name: 'Shadow Shinobi',
    description: 'Stealthy midnight coat with crimson gear for swift underground escapes.',
    furColor: 0x1e293b,
    bellyColor: 0xef4444,
    cost: 80,
    unlocked: false,
    badge: 'Ninja',
  },
  {
    id: 'punk',
    name: 'Punk Rocker Pip',
    description: 'Neon electric lime fur and violet rebel spirit who refuses to be caged.',
    furColor: 0x84cc16,
    bellyColor: 0xa855f7,
    cost: 120,
    unlocked: false,
    badge: 'Rebel',
  },
  {
    id: 'cosmo',
    name: 'Cosmo Scurrier',
    description: 'Astronaut silver fur with cosmic cyan glow engineered for low-gravity leaps.',
    furColor: 0x94a3b8,
    bellyColor: 0x06b6d4,
    cost: 160,
    unlocked: false,
    badge: 'Cosmic',
  },
  {
    id: 'king',
    name: 'Royal King Pip',
    description: 'Imperial royal velvet fur crowned with dazzling gold cheddar prestige.',
    furColor: 0x7c3aed,
    bellyColor: 0xfbbf24,
    cost: 220,
    unlocked: false,
    badge: 'Royal',
  },
  {
    id: 'detective',
    name: 'Snoop Pip',
    description: 'Sharp trenchcoat caramel brown rodent on the trail of legendary cheeses.',
    furColor: 0x78350f,
    bellyColor: 0xfef3c7,
    cost: 280,
    unlocked: false,
    badge: 'Detective',
  },
  {
    id: 'cyber',
    name: 'Cyberpunk Neon Pip',
    description: 'High-tech neon cyan and magenta bio-fur with electric circuitry glow.',
    furColor: 0x06b6d4,
    bellyColor: 0xec4899,
    cost: 350,
    unlocked: false,
    badge: 'Cyber',
  },
  {
    id: 'wizard',
    name: 'Cheese Sorcerer',
    description: 'Mystical indigo midnight fur attuned to ancient dairy spellcraft.',
    furColor: 0x4f46e5,
    bellyColor: 0xfde047,
    cost: 420,
    unlocked: false,
    badge: 'Magic',
  },
  {
    id: 'pirate',
    name: 'Captain Cheddar',
    description: 'Swashbuckling sea rat with dark rum coat and golden pirate eye patch.',
    furColor: 0x451a03,
    bellyColor: 0xf59e0b,
    cost: 500,
    unlocked: false,
    badge: 'Pirate',
  },
  {
    id: 'phoenix',
    name: 'Fire Phoenix Pip',
    description: 'Blazing crimson-amber ember coat immune to the heat of the chase.',
    furColor: 0xdc2626,
    bellyColor: 0xfbbf24,
    cost: 600,
    unlocked: false,
    badge: 'Inferno',
  },
  {
    id: 'glacier',
    name: 'Frosty Glacier Pip',
    description: 'Sub-zero crystal blue fur that leaves frozen ice crystals in its wake.',
    furColor: 0x38bdf8,
    bellyColor: 0xf8fafc,
    cost: 700,
    unlocked: false,
    badge: 'Glacial',
  },
  {
    id: 'sakura',
    name: 'Blossom Scamper',
    description: 'Delicate cherry blossom petal pink fur flowing with springtime wind.',
    furColor: 0xf472b6,
    bellyColor: 0xfff1f2,
    cost: 800,
    unlocked: false,
    badge: 'Blossom',
  },
  {
    id: 'pharaoh',
    name: 'Pharaoh Pip',
    description: 'Ancient Egyptian lapis lazuli coat adorned with golden royal regalia.',
    furColor: 0x1d4ed8,
    bellyColor: 0xfacc15,
    cost: 950,
    unlocked: false,
    badge: 'Ancient',
  },
  {
    id: 'rainbow',
    name: 'Dreamcatcher Pip',
    description: 'Mythic iridescent prism fur radiating pure cartoon starlight.',
    furColor: 0x8b5cf6,
    bellyColor: 0x34d399,
    cost: 1200,
    unlocked: false,
    badge: 'Mythic',
  },
];

// 8 tools with infinite uncapped levels and diminishing return curves
const DEFAULT_TOOLS: ToolUpgrade[] = [
  {
    id: 'magnet',
    name: 'Cheese Magnet',
    description: 'Pulls nearby cheese, candies, and treats directly to Pip across tracks.',
    level: 1,
    baseCost: 30,
    iconType: 'magnet',
    effectLabel: 'Suction duration & range expand asymptotically per level',
  },
  {
    id: 'spring_shoes',
    name: 'Bouncer Spring Shoes',
    description: 'High-bounce sneakers that give Pip higher leap clearance over hurdles.',
    level: 1,
    baseCost: 35,
    iconType: 'spring',
    effectLabel: 'Leap clearance & airtime control smoothly scale per level',
  },
  {
    id: 'shield',
    name: 'Bubble Shield',
    description: 'Protective force bubble that deflects obstacle hits and saves your run.',
    level: 1,
    baseCost: 40,
    iconType: 'shield',
    effectLabel: 'Shield protection duration expands smoothly per level',
  },
  {
    id: 'multiplier',
    name: 'Score Doubler',
    description: 'Increases score rate and points earned during high-speed runs.',
    level: 1,
    baseCost: 45,
    iconType: 'multiplier',
    effectLabel: '+0.05x permanent score multiplier bonus per level',
  },
  {
    id: 'rocket',
    name: 'Rocket Headstart',
    description: 'Invincible rocket sprint at start of run blasting through obstacles!',
    level: 1,
    baseCost: 50,
    iconType: 'rocket',
    effectLabel: 'Rocket speed dash duration expands smoothly per level',
  },
  {
    id: 'radar',
    name: 'Treat Radar',
    description: 'Scans subterranean tracks to locate rare candy and chocolate treats.',
    level: 1,
    baseCost: 35,
    iconType: 'radar',
    effectLabel: '+1.5% bonus candy and chocolate frequency per level',
  },
  {
    id: 'distractor',
    name: 'Cat Decoy Distractor',
    description: 'Leaves savory decoys behind to keep Shadow the cat at a safe distance.',
    level: 1,
    baseCost: 45,
    iconType: 'distractor',
    effectLabel: 'Initial cat escape buffer expands smoothly per level',
  },
  {
    id: 'vault',
    name: 'Cheese Vault',
    description: 'Reinforced vault that banks bonus cheese rewards at the end of runs.',
    level: 1,
    baseCost: 55,
    iconType: 'vault',
    effectLabel: '+5% bonus cheese saved after each run per level',
  },
  {
    id: 'wings',
    name: 'Glider Cheese Wings',
    description: 'Celestial feather wings that soar above bridge chasms and hazards.',
    level: 1,
    baseCost: 50,
    iconType: 'wings',
    effectLabel: 'Flight duration & celestial treat reach expand smoothly per level',
  },
  {
    id: 'clover',
    name: 'Lucky Four-Leaf Clover',
    description: 'Enchants cavern tracks with increased chocolate and rare candy drops.',
    level: 1,
    baseCost: 40,
    iconType: 'clover',
    effectLabel: '+2% rare candy & chocolate frequency per level',
  },
  {
    id: 'fever_spark',
    name: 'Fever Surge Spark',
    description: 'Supercharges the Fever rush meter so you achieve invincibility faster.',
    level: 1,
    baseCost: 60,
    iconType: 'fever_spark',
    effectLabel: '+10% faster Fever meter charging rate per level',
  },
];

const BIOME_ANNOUNCEMENTS: Record<CavernBiome, string> = {
  CRYSTAL_CAVERN: 'Biome 1: Crystal Caverns',
  CHEESE_GROTTO: 'Biome 2: The Great Cheese Grotto',
  CHOCO_CHASM: 'Biome 3: Choco Chasm',
  CANDY_MINES: 'Biome 4: Enchanted Candy Mines',
};

export default function App() {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneManagerRef = useRef<SceneManager | null>(null);
  const inputManagerRef = useRef<InputManager | null>(null);
  const previousStateBeforeShop = useRef<GameState>('MENU');

  const { isInstallable, isInstalled, isIOS, isIPad, promptInstall } = usePWAInstall();

  const [gameState, setGameState] = useState<GameState>('MENU');
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);
  const [isStreakOpen, setIsStreakOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isIOSGuideOpen, setIsIOSGuideOpen] = useState(false);
  const [installNotification, setInstallNotification] = useState<string | null>(null);



  const [stats, setStats] = useState<PlayerStats>({
    score: 0,
    distance: 0,
    cheeseCount: 0,
    candyCount: 0,
    chocoCount: 0,
    multiplier: 1,
    catDistance: 10.5,
    currentBiome: 'CRYSTAL_CAVERN',
    biomeProgress: 0,
    feverCharge: 0,
    isFeverActive: false,
    activeMission: null,
  });
  const [activeBuffs, setActiveBuffs] = useState<PowerUpActive[]>([]);
  const [isMuted, setIsMuted] = useState<boolean>(() => audioSynth.getIsMuted());

  // Wallets: Cheese, Candy, and Chocolate
  const [totalCheese, setTotalCheese] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('rat_surfers_cheese_wallet');
      return saved ? parseInt(saved, 10) : 50;
    } catch {
      return 50;
    }
  });

  const [totalCandy, setTotalCandy] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('rat_surfers_candy_wallet');
      return saved ? parseInt(saved, 10) : 15;
    } catch {
      return 15;
    }
  });

  const [totalChoco, setTotalChoco] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('rat_surfers_choco_wallet');
      return saved ? parseInt(saved, 10) : 8;
    } catch {
      return 8;
    }
  });

  // Skins
  const [skins, setSkins] = useState<RatSkin[]>(() => {
    try {
      const saved = localStorage.getItem('rat_surfers_unlocked_skins');
      if (saved) {
        const unlockedIds: string[] = JSON.parse(saved);
        return INITIAL_SKINS.map(s => ({
          ...s,
          unlocked: s.cost === 0 || unlockedIds.includes(s.id),
        }));
      }
    } catch {}
    return INITIAL_SKINS;
  });

  const [activeSkinId, setActiveSkinId] = useState<string>(() => {
    return localStorage.getItem('rat_surfers_active_skin') || 'classic';
  });

  // Tool Upgrades
  const [tools, setTools] = useState<ToolUpgrade[]>(() => {
    try {
      const saved = localStorage.getItem('rat_surfers_tool_upgrades');
      if (saved) {
        const savedLevels: Partial<Record<ToolUpgradeId, number>> = JSON.parse(saved);
        return DEFAULT_TOOLS.map(t => ({
          ...t,
          level: savedLevels[t.id] ?? t.level,
        }));
      }
    } catch {}
    return DEFAULT_TOOLS;
  });

  // Streaks
  const [streak, setStreak] = useState<StreakData>(() => {
    try {
      const saved = localStorage.getItem('rat_surfers_streak_data');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {}
    return {
      currentStreak: 1,
      bestStreak: 1,
      totalRuns: 0,
      lastRunDate: new Date().toLocaleDateString(),
    };
  });

  const [claimedStreakMilestones, setClaimedStreakMilestones] = useState<number[]>(() => {
    try {
      const saved = localStorage.getItem('rat_surfers_claimed_milestones');
      if (saved) return JSON.parse(saved);
      const legacy = localStorage.getItem('rat_surfers_claimed_streak');
      if (legacy) {
        const val = parseInt(legacy, 10);
        return val > 0 ? [val] : [];
      }
    } catch {}
    return [];
  });

  // High Scores
  const [highScore, setHighScore] = useState<HighScoreRecord | null>(() => {
    try {
      const saved = localStorage.getItem('rat_surfers_high_score');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [isNewHigh, setIsNewHigh] = useState(false);
  const [biomeBanner, setBiomeBanner] = useState<string | null>(null);

  const getToolLevelMap = useCallback((toolList: ToolUpgrade[]) => {
    const map: Partial<Record<ToolUpgradeId, number>> = {};
    toolList.forEach(t => {
      map[t.id] = t.level;
    });
    return map;
  }, []);

  // Initialize Scene & Input
  useEffect(() => {
    if (!mountRef.current) return;

    const input = new InputManager();
    input.init();
    inputManagerRef.current = input;

    const scene = new SceneManager(
      mountRef.current,
      input,
      (newStats, buffs) => {
        setStats(newStats);
        setActiveBuffs(buffs);
      },
      (newState, finalStats) => {
        setGameState(newState);
        if (newState === 'GAMEOVER' && finalStats) {
          // Process run completion & streak
          setStreak(prev => {
            const todayStr = new Date().toLocaleDateString();
            const isSameDay = prev.lastRunDate === todayStr;
            const updatedStreak = isSameDay ? prev.currentStreak : prev.currentStreak + 1;
            const nextData: StreakData = {
              currentStreak: updatedStreak,
              bestStreak: Math.max(prev.bestStreak, updatedStreak),
              totalRuns: prev.totalRuns + 1,
              lastRunDate: todayStr,
            };
            localStorage.setItem('rat_surfers_streak_data', JSON.stringify(nextData));
            return nextData;
          });

          // Process wallet additions (treats collected)
          setTotalCheese(prevWallet => {
            const added = finalStats.cheeseCount;
            const next = prevWallet + added;
            localStorage.setItem('rat_surfers_cheese_wallet', String(next));
            return next;
          });

          // Add collected candies to confectionery wallet
          if (finalStats.candyCount > 0) {
            setTotalCandy(prev => {
              const next = prev + finalStats.candyCount;
              localStorage.setItem('rat_surfers_candy_wallet', String(next));
              return next;
            });
          }

          // Add collected chocolate bars to confectionery wallet
          if (finalStats.chocoCount > 0) {
            setTotalChoco(prev => {
              const next = prev + finalStats.chocoCount;
              localStorage.setItem('rat_surfers_choco_wallet', String(next));
              return next;
            });
          }

          // Process High Score
          setHighScore(prevHigh => {
            if (!prevHigh || finalStats.score > prevHigh.score) {
              const newRecord: HighScoreRecord = {
                score: finalStats.score,
                distance: finalStats.distance,
                cheeseCount: finalStats.cheeseCount,
                date: new Date().toLocaleDateString(),
              };
              localStorage.setItem('rat_surfers_high_score', JSON.stringify(newRecord));
              setIsNewHigh(true);
              return newRecord;
            }
            setIsNewHigh(false);
            return prevHigh;
          });
        }
      },
      biome => {
        const announcement = BIOME_ANNOUNCEMENTS[biome] || 'Entering New Cavern Zone';
        setBiomeBanner(announcement);
        audioSynth.playPowerUp();
        setTimeout(() => setBiomeBanner(null), 3500);
      }
    );

    sceneManagerRef.current = scene;

    // Apply active skin & tool upgrades to scene
    const initialSkin = skins.find(s => s.id === activeSkinId);
    if (initialSkin) {
      scene.setRatSkin(initialSkin.furColor, initialSkin.bellyColor);
    }
    scene.setToolUpgrades(getToolLevelMap(tools));

    return () => {
      scene.destroy();
      input.destroy();
      sceneManagerRef.current = null;
      inputManagerRef.current = null;
    };
  }, []);

  const handleStartGame = useCallback(() => {
    setIsLeaderboardOpen(false);
    setIsStreakOpen(false);
    audioSynth.resume();
    sceneManagerRef.current?.startGame();
    setGameState('PLAYING');
  }, []);

  const handleRestart = useCallback(() => {
    setIsLeaderboardOpen(false);
    setIsStreakOpen(false);
    audioSynth.resume();
    sceneManagerRef.current?.startGame();
    setGameState('PLAYING');
  }, []);

  const handlePause = useCallback(() => {
    sceneManagerRef.current?.setGameState('PAUSED');
    setGameState('PAUSED');
  }, []);

  const handleResume = useCallback(() => {
    sceneManagerRef.current?.setGameState('PLAYING');
    setGameState('PLAYING');
  }, []);

  const handleHome = useCallback(() => {
    setIsLeaderboardOpen(false);
    setIsStreakOpen(false);
    sceneManagerRef.current?.setGameState('MENU');
    setGameState('MENU');
  }, []);

  const handleToggleMute = useCallback(() => {
    const next = !audioSynth.getIsMuted();
    audioSynth.setMuted(next);
    setIsMuted(next);
  }, []);

  const handleOnScreenAction = useCallback((action: 'LEFT' | 'RIGHT' | 'JUMP' | 'SLIDE') => {
    inputManagerRef.current?.triggerAction(action);
  }, []);

  const handleOpenShop = useCallback(() => {
    previousStateBeforeShop.current = gameState;
    setIsLeaderboardOpen(false);
    setIsStreakOpen(false);
    setGameState('SHOP');
    sceneManagerRef.current?.setGameState('SHOP');
  }, [gameState]);

  const handleCloseShop = useCallback(() => {
    const returnState = previousStateBeforeShop.current === 'PAUSED' ? 'PAUSED' : 'MENU';
    setGameState(returnState);
    sceneManagerRef.current?.setGameState(returnState);
  }, []);

  const handleSelectSkin = useCallback((skinId: string) => {
    setActiveSkinId(skinId);
    localStorage.setItem('rat_surfers_active_skin', skinId);
    const skin = skins.find(s => s.id === skinId);
    if (skin) {
      sceneManagerRef.current?.setRatSkin(skin.furColor, skin.bellyColor);
    }
  }, [skins]);

  const handleBuySkin = useCallback((skin: RatSkin) => {
    if (totalCheese < skin.cost) return;
    const newWallet = totalCheese - skin.cost;
    setTotalCheese(newWallet);
    localStorage.setItem('rat_surfers_cheese_wallet', String(newWallet));

    const updated = skins.map(s => s.id === skin.id ? { ...s, unlocked: true } : s);
    setSkins(updated);
    const unlockedIds = updated.filter(s => s.unlocked).map(s => s.id);
    localStorage.setItem('rat_surfers_unlocked_skins', JSON.stringify(unlockedIds));

    handleSelectSkin(skin.id);
  }, [totalCheese, skins, handleSelectSkin]);

  // Infinite tool upgrades: no ceiling, balanced scaling cost formula
  const handleUpgradeTool = useCallback((toolId: ToolUpgradeId) => {
    const targetTool = tools.find(t => t.id === toolId);
    if (!targetTool) return;

    const cost = Math.floor(
      targetTool.baseCost * Math.pow(1.12, targetTool.level - 1) + (targetTool.level - 1) * 8
    );
    if (totalCheese < cost) return;

    const newWallet = totalCheese - cost;
    setTotalCheese(newWallet);
    localStorage.setItem('rat_surfers_cheese_wallet', String(newWallet));

    const updatedTools = tools.map(t =>
      t.id === toolId ? { ...t, level: t.level + 1 } : t
    );
    setTools(updatedTools);

    const levelMap: Partial<Record<ToolUpgradeId, number>> = {};
    updatedTools.forEach(t => {
      levelMap[t.id] = t.level;
    });
    localStorage.setItem('rat_surfers_tool_upgrades', JSON.stringify(levelMap));

    // Update scene manager
    sceneManagerRef.current?.setToolUpgrades(getToolLevelMap(updatedTools));
    audioSynth.playPowerUp();
  }, [tools, totalCheese, getToolLevelMap]);

  // Confectionery Treat Exchange Handlers (Business Loop)
  const handleExchangeCandy = useCallback((candies: number, cheeseReward: number) => {
    if (totalCandy < candies) return;
    setTotalCandy(prev => {
      const next = prev - candies;
      localStorage.setItem('rat_surfers_candy_wallet', String(next));
      return next;
    });
    setTotalCheese(prev => {
      const next = prev + cheeseReward;
      localStorage.setItem('rat_surfers_cheese_wallet', String(next));
      return next;
    });
    audioSynth.playMissionComplete();
  }, [totalCandy]);

  const handleExchangeChoco = useCallback((choco: number, cheeseReward: number) => {
    if (totalChoco < choco) return;
    setTotalChoco(prev => {
      const next = prev - choco;
      localStorage.setItem('rat_surfers_choco_wallet', String(next));
      return next;
    });
    setTotalCheese(prev => {
      const next = prev + cheeseReward;
      localStorage.setItem('rat_surfers_cheese_wallet', String(next));
      return next;
    });
    audioSynth.playMissionComplete();
  }, [totalChoco]);

  const handleExchangeAll = useCallback(() => {
    if (totalCandy <= 0 && totalChoco <= 0) return;
    const candyCheese = Math.floor(totalCandy * 5.5);
    const chocoCheese = Math.floor(totalChoco * 16);
    const totalReward = candyCheese + chocoCheese;

    setTotalCandy(0);
    localStorage.setItem('rat_surfers_candy_wallet', '0');

    setTotalChoco(0);
    localStorage.setItem('rat_surfers_choco_wallet', '0');

    setTotalCheese(prev => {
      const next = prev + totalReward;
      localStorage.setItem('rat_surfers_cheese_wallet', String(next));
      return next;
    });

    audioSynth.playMissionComplete();
  }, [totalCandy, totalChoco]);

  const totalToolLevels = tools.reduce((acc, t) => acc + t.level, 0);

  // Check if current streak unlocks a new claimable reward milestone
  const hasClaimableStreakReward = STREAK_MILESTONES.some(
    m => streak.currentStreak >= m.days && !claimedStreakMilestones.includes(m.days)
  );

  const handleClaimStreakReward = useCallback((daysOrReward: number, explicitReward?: number) => {
    let rewardCheese = explicitReward ?? daysOrReward;
    let milestoneDay = explicitReward !== undefined ? daysOrReward : 3;

    if (explicitReward === undefined) {
      const eligible = STREAK_MILESTONES.slice().reverse().find(
        m => streak.currentStreak >= m.days && !claimedStreakMilestones.includes(m.days)
      );
      if (eligible) {
        rewardCheese = eligible.reward;
        milestoneDay = eligible.days;
      }
    }

    setTotalCheese(prev => {
      const next = prev + rewardCheese;
      localStorage.setItem('rat_surfers_cheese_wallet', String(next));
      return next;
    });

    setClaimedStreakMilestones(prev => {
      const next = prev.includes(milestoneDay) ? prev : [...prev, milestoneDay];
      localStorage.setItem('rat_surfers_claimed_milestones', JSON.stringify(next));
      return next;
    });

    audioSynth.playMissionComplete();
  }, [streak.currentStreak, claimedStreakMilestones]);

  const handleInstallPWA = useCallback(async () => {
    if (isInstalled) {
      setInstallNotification('✓ Rat Surfers is already installed on your device!');
      setTimeout(() => setInstallNotification(null), 3200);
      return;
    }

    if (isInstallable) {
      // 1-Click native install on Android Chrome, Edge, and Desktop:
      // Pops open the native system install dialog directly - zero extra page!
      const outcome = await promptInstall();
      if (outcome) {
        setInstallNotification('🎉 Rat Surfers installed successfully!');
        setTimeout(() => setInstallNotification(null), 3200);
      }
      return;
    }

    if (isIOS || isIPad) {
      // Step-by-step interactive instructions for iOS / iPadOS Safari users
      setIsIOSGuideOpen(true);
      return;
    }

    // Android / Desktop fallback when running inside an iframe preview or if already prompted:
    const isAndroid = /android/i.test(navigator.userAgent);
    if (isAndroid) {
      setInstallNotification("⚡ On Android: Tap Chrome's ⋮ menu and tap 'Install app' or 'Add to Home screen' for 1-click install!");
    } else {
      setInstallNotification("⚡ To install: Open in Chrome/Edge and click the Install icon in the browser address bar.");
    }
    setTimeout(() => setInstallNotification(null), 4500);
  }, [isInstallable, isInstalled, isIOS, isIPad, promptInstall]);

  return (
    <div className="relative w-full h-full overflow-hidden bg-[#06090e]">
      {/* 3D WebGL Canvas */}
      <div
        ref={mountRef}
        className="absolute inset-0 w-full h-full"
        style={{ touchAction: 'none' }}
      />

      {/* Screen Modals & Overlays */}
      {gameState === 'MENU' && (
        <TitleScreen
          onStart={handleStartGame}
          onOpenShop={handleOpenShop}
          onOpenLeaderboard={() => setIsLeaderboardOpen(true)}
          onOpenStreak={() => setIsStreakOpen(true)}
          onOpenHelp={() => setIsHelpOpen(true)}
          onInstallPWA={handleInstallPWA}
          canInstallPWA={isInstallable}
          isPWAInstalled={isInstalled}
          totalCheese={totalCheese}
          totalCandy={totalCandy}
          totalChoco={totalChoco}
          streak={streak}
          highScore={highScore}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
        />
      )}

      {(gameState === 'PLAYING' || gameState === 'PAUSED' || gameState === 'GAMEOVER') && (
        <GameHUD
          stats={stats}
          activeBuffs={activeBuffs}
          isMuted={isMuted}
          biomeBanner={biomeBanner}
          onToggleMute={handleToggleMute}
          onPause={handlePause}
          onRestart={handleRestart}
          onAction={handleOnScreenAction}
        />
      )}

      {gameState === 'PAUSED' && (
        <PauseModal
          onResume={handleResume}
          onRestart={handleRestart}
          onHome={handleHome}
          onOpenShop={handleOpenShop}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
        />
      )}

      {gameState === 'GAMEOVER' && (
        <GameOverModal
          stats={stats}
          highScore={highScore}
          isNewHigh={isNewHigh}
          onRestart={handleRestart}
          onHome={handleHome}
          onOpenShop={handleOpenShop}
        />
      )}

      {gameState === 'SHOP' && (
        <ShopModal
          totalCheese={totalCheese}
          totalCandy={totalCandy}
          totalChoco={totalChoco}
          skins={skins}
          activeSkinId={activeSkinId}
          tools={tools}
          streak={streak}
          onSelectSkin={handleSelectSkin}
          onBuySkin={handleBuySkin}
          onUpgradeTool={handleUpgradeTool}
          onExchangeCandy={handleExchangeCandy}
          onExchangeChoco={handleExchangeChoco}
          onExchangeAll={handleExchangeAll}
          onClaimStreakReward={handleClaimStreakReward}
          hasClaimableStreakReward={hasClaimableStreakReward}
          onClose={handleCloseShop}
        />
      )}

      {/* Virtual Local Leaderboard Modal (25 Competitors) */}
      {isLeaderboardOpen && (
        <VirtualLeaderboardModal
          playerScore={highScore ? highScore.score : stats.score}
          playerStreak={streak.currentStreak}
          playerCheese={totalCheese}
          playerSkinId={activeSkinId}
          totalRuns={streak.totalRuns}
          totalToolLevels={totalToolLevels}
          onClose={() => setIsLeaderboardOpen(false)}
        />
      )}

      {/* Interactive Streak Modal */}
      {isStreakOpen && (
        <StreakModal
          streak={streak}
          onClaimReward={handleClaimStreakReward}
          claimedMilestones={claimedStreakMilestones}
          onClose={() => setIsStreakOpen(false)}
        />
      )}

      {/* Icon-First Help & Controls Modal */}
      {isHelpOpen && (
        <HelpModal
          onClose={() => setIsHelpOpen(false)}
        />
      )}

      {/* Auto-Detecting Interactive iOS & iPadOS Install Guide */}
      {isIOSGuideOpen && (
        <IOSInstallGuide
          isIPad={isIPad}
          onClose={() => setIsIOSGuideOpen(false)}
        />
      )}

      {/* Sleek, Non-Intrusive Install Toast (Zero clutter, auto-dismissing) */}
      {installNotification && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 max-w-sm w-[90%] bg-slate-950/95 border border-amber-500/60 rounded-xl px-4 py-3 text-xs sm:text-sm text-amber-200 text-center font-display font-medium shadow-2xl backdrop-blur-md pointer-events-auto flex items-center justify-between gap-2">
          <span>{installNotification}</span>
          <button
            onClick={() => setInstallNotification(null)}
            className="text-slate-400 hover:text-white p-1 text-sm font-bold cursor-pointer"
            aria-label="Dismiss notification"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}
