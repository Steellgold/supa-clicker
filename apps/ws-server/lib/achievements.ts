import type { Achievement, GameState } from "@clicker/game/types";

export const ACHIEVEMENTS: Achievement[] = [
  // === CLICKING ACHIEVEMENTS ===
  {
    id: 1,
    name: "First Click",
    description: "Click for the first time",
    category: "clicking",
    rarity: "common",
    icon: "🖱️",
    requirement: (stats) => stats.totalClicks >= 1,
    unlocked: false
  },
  {
    id: 2,
    name: "Click Enthusiast",
    description: "Click 100 times",
    category: "clicking",
    rarity: "common",
    icon: "👆",
    requirement: (stats) => stats.totalClicks >= 100,
    unlocked: false
  },
  {
    id: 3,
    name: "Click Master",
    description: "Click 1,000 times",
    category: "clicking",
    rarity: "common",
    icon: "⚡",
    requirement: (stats) => stats.totalClicks >= 1000,
    unlocked: false
  },
  {
    id: 4,
    name: "Click Veteran",
    description: "Click 10,000 times",
    category: "clicking",
    rarity: "rare",
    icon: "🎯",
    requirement: (stats) => stats.totalClicks >= 10000,
    unlocked: false
  },
  {
    id: 5,
    name: "Click Legend",
    description: "Click 100,000 times",
    category: "clicking",
    rarity: "rare",
    icon: "👑",
    requirement: (stats) => stats.totalClicks >= 100000,
    unlocked: false
  },
  {
    id: 6,
    name: "Click God",
    description: "Click 1,000,000 times",
    category: "clicking",
    rarity: "epic",
    icon: "🌟",
    requirement: (stats) => stats.totalClicks >= 1000000,
    unlocked: false
  },
  {
    id: 7,
    name: "Click Transcendent",
    description: "Click 10,000,000 times",
    category: "clicking",
    rarity: "legendary",
    icon: "💫",
    requirement: (stats) => stats.totalClicks >= 10000000,
    unlocked: false
  },

  // === POWER ACHIEVEMENTS ===
  {
    id: 8,
    name: "Power Starter",
    description: "Earn 1,000 power",
    category: "power",
    rarity: "common",
    icon: "⚡",
    requirement: (stats) => stats.currentResources >= 1000,
    unlocked: false
  },
  {
    id: 9,
    name: "Power Collector",
    description: "Earn 100,000 power",
    category: "power",
    rarity: "common",
    icon: "💰",
    requirement: (stats) => stats.currentResources >= 100000,
    unlocked: false
  },
  {
    id: 10,
    name: "Power Millionaire",
    description: "Earn 1,000,000 power",
    category: "power",
    rarity: "rare",
    icon: "💎",
    requirement: (stats) => stats.currentResources >= 1000000,
    unlocked: false
  },
  {
    id: 11,
    name: "Power Billionaire",
    description: "Earn 1,000,000,000 power",
    category: "power",
    rarity: "epic",
    icon: "🏰",
    requirement: (stats) => stats.currentResources >= 1000000000,
    unlocked: false
  },
  {
    id: 12,
    name: "Power Trillionaire",
    description: "Earn 1,000,000,000,000 power",
    category: "power",
    rarity: "legendary",
    icon: "🌌",
    requirement: (stats) => stats.currentResources >= 1000000000000,
    unlocked: false
  },

  // === SPEED ACHIEVEMENTS ===
  {
    id: 13,
    name: "Speed Demon",
    description: "Reach 1,000 power per second",
    category: "speed",
    rarity: "common",
    icon: "🏃",
    requirement: (stats) => stats.resourcesPerSecond >= 1000,
    unlocked: false
  },
  {
    id: 14,
    name: "Speed Master",
    description: "Reach 100,000 power per second",
    category: "speed",
    rarity: "rare",
    icon: "🚀",
    requirement: (stats) => stats.resourcesPerSecond >= 100000,
    unlocked: false
  },
  {
    id: 15,
    name: "Speed of Light",
    description: "Reach 10,000,000 power per second",
    category: "speed",
    rarity: "epic",
    icon: "💨",
    requirement: (stats) => stats.resourcesPerSecond >= 10000000,
    unlocked: false
  },
  {
    id: 16,
    name: "Quantum Speed",
    description: "Reach 1,000,000,000 power per second",
    category: "speed",
    rarity: "legendary",
    icon: "⚛️",
    requirement: (stats) => stats.resourcesPerSecond >= 1000000000,
    unlocked: false
  },

  // === UPGRADE ACHIEVEMENTS ===
  {
    id: 17,
    name: "First Upgrade",
    description: "Buy your first upgrade",
    category: "upgrades",
    rarity: "common",
    icon: "🔧",
    requirement: (stats, upgrades) => (upgrades?.filter(u => u.quantity > 0).length || 0) >= 1,
    unlocked: false
  },
  {
    id: 18,
    name: "Upgrade Enthusiast",
    description: "Buy 5 different upgrades",
    category: "upgrades",
    rarity: "common",
    icon: "🛠️",
    requirement: (stats, upgrades) => (upgrades?.filter(u => u.quantity > 0).length || 0) >= 5,
    unlocked: false
  },
  {
    id: 19,
    name: "Upgrade Collector",
    description: "Buy 15 different upgrades",
    category: "upgrades",
    rarity: "rare",
    icon: "⚙️",
    requirement: (stats, upgrades) => (upgrades?.filter(u => u.quantity > 0).length || 0) >= 15,
    unlocked: false
  },
  {
    id: 20,
    name: "Upgrade Master",
    description: "Buy 30 different upgrades",
    category: "upgrades",
    rarity: "epic",
    icon: "🎛️",
    requirement: (stats, upgrades) => (upgrades?.filter(u => u.quantity > 0).length || 0) >= 30,
    unlocked: false
  },
  {
    id: 21,
    name: "Upgrade Completionist",
    description: "Buy 50 different upgrades",
    category: "upgrades",
    rarity: "legendary",
    icon: "🏆",
    requirement: (stats, upgrades) => (upgrades?.filter(u => u.quantity > 0).length || 0) >= 50,
    unlocked: false
  },

  // === PRESTIGE ACHIEVEMENTS ===
  {
    id: 22,
    name: "First Prestige",
    description: "Perform your first prestige",
    category: "prestige",
    rarity: "rare",
    icon: "⭐",
    requirement: (stats) => stats.prestigeLevel >= 1,
    unlocked: false
  },
  {
    id: 23,
    name: "Prestige Veteran",
    description: "Reach prestige level 5",
    category: "prestige",
    rarity: "rare",
    icon: "🌟",
    requirement: (stats) => stats.prestigeLevel >= 5,
    unlocked: false
  },
  {
    id: 24,
    name: "Prestige Master",
    description: "Reach prestige level 10",
    category: "prestige",
    rarity: "epic",
    icon: "💫",
    requirement: (stats) => stats.prestigeLevel >= 10,
    unlocked: false
  },
  {
    id: 25,
    name: "Prestige Legend",
    description: "Reach prestige level 25",
    category: "prestige",
    rarity: "legendary",
    icon: "👑",
    requirement: (stats) => stats.prestigeLevel >= 25,
    unlocked: false
  },
  {
    id: 26,
    name: "Prestige Transcendent",
    description: "Reach maximum prestige level (50)",
    category: "prestige",
    rarity: "legendary",
    icon: "🌌",
    requirement: (stats) => stats.prestigeLevel >= 50,
    unlocked: false
  },

  // === TIME-BASED ACHIEVEMENTS ===
  {
    id: 27,
    name: "Marathon Session",
    description: "Play for 1 hour straight",
    category: "time",
    rarity: "common",
    icon: "⏰",
    requirement: (stats) => (stats as any).sessionTime >= 3600000, // 1 hour in ms
    unlocked: false
  },
  {
    id: 28,
    name: "Dedication",
    description: "Play for 6 hours straight",
    category: "time",
    rarity: "rare",
    icon: "🕕",
    requirement: (stats) => (stats as any).sessionTime >= 21600000, // 6 hours in ms
    unlocked: false
  },
  {
    id: 29,
    name: "No Life",
    description: "Play for 24 hours straight",
    category: "time",
    rarity: "epic",
    icon: "🌙",
    requirement: (stats) => (stats as any).sessionTime >= 86400000, // 24 hours in ms
    unlocked: false
  },

  // === EFFICIENCY ACHIEVEMENTS ===
  {
    id: 30,
    name: "Efficient Clicker",
    description: "Reach 100 power per click",
    category: "efficiency",
    rarity: "rare",
    icon: "🎯",
    requirement: (stats) => (stats as any).powerPerClick >= 100,
    unlocked: false
  },
  {
    id: 31,
    name: "Power Clicker",
    description: "Reach 1,000 power per click",
    category: "efficiency",
    rarity: "epic",
    icon: "💥",
    requirement: (stats) => (stats as any).powerPerClick >= 1000,
    unlocked: false
  },
  {
    id: 32,
    name: "God Clicker",
    description: "Reach 10,000 power per click",
    category: "efficiency",
    rarity: "legendary",
    icon: "⚡",
    requirement: (stats) => (stats as any).powerPerClick >= 10000,
    unlocked: false
  },

  // === SESSION ACHIEVEMENTS ===
  {
    id: 33,
    name: "Session Warrior",
    description: "Earn 100,000 power in a single session",
    category: "session",
    rarity: "rare",
    icon: "🔥",
    requirement: (stats) => (stats as any).powerSession >= 100000,
    unlocked: false
  },
  {
    id: 34,
    name: "Session Legend",
    description: "Earn 10,000,000 power in a single session",
    category: "session",
    rarity: "epic",
    icon: "🌟",
    requirement: (stats) => (stats as any).powerSession >= 10000000,
    unlocked: false
  },
  {
    id: 35,
    name: "Upgrade Spree",
    description: "Buy 20 upgrades in a single session",
    category: "session",
    rarity: "epic",
    icon: "🛒",
    requirement: (stats) => stats.upgradesBoughtSession >= 20,
    unlocked: false
  },
  {
    id: 36,
    name: "Click Frenzy",
    description: "Click 1,000 times in a single session",
    category: "session",
    rarity: "rare",
    icon: "🌪️",
    requirement: (stats) => stats.clicksSession >= 1000,
    unlocked: false
  },

  // === TECH STACK ACHIEVEMENTS ===
  {
    id: 37,
    name: "Frontend Developer",
    description: "Own HTML/CSS, JavaScript, and React upgrades",
    category: "tech",
    rarity: "rare",
    icon: "🎨",
    requirement: (stats, upgrades) => {
      const requiredUpgrades = [65, 66, 67]; // HTML/CSS, JavaScript, React
      return requiredUpgrades.every(id => upgrades?.some(u => u.upgradeId === id));
    },
    unlocked: false
  },
  {
    id: 38,
    name: "Backend Engineer",
    description: "Own Node.js, Express.js, and PostgreSQL upgrades",
    category: "tech",
    rarity: "rare",
    icon: "⚙️",
    requirement: (stats, upgrades) => {
      const requiredUpgrades = [73, 74, 45]; // Node.js, Express.js, PostgreSQL
      return requiredUpgrades.every(id => upgrades?.some(u => u.upgradeId === id));
    },
    unlocked: false
  },
  {
    id: 39,
    name: "DevOps Master",
    description: "Own Docker, Kubernetes, and Monitoring upgrades",
    category: "tech",
    rarity: "epic",
    icon: "🐳",
    requirement: (stats, upgrades) => {
      const requiredUpgrades = [16, 58, 61]; // Kubernetes, Logs, APM
      return requiredUpgrades.every(id => upgrades?.some(u => u.upgradeId === id));
    },
    unlocked: false
  },
  {
    id: 40,
    name: "Security Expert",
    description: "Own SSL Certificate, Firewall, and Zero Trust upgrades",
    category: "tech",
    rarity: "epic",
    icon: "🛡️",
    requirement: (stats, upgrades) => {
      const requiredUpgrades = [51, 52, 55]; // SSL, Firewall, Zero Trust
      return requiredUpgrades.every(id => upgrades?.some(u => u.upgradeId === id));
    },
    unlocked: false
  },
  {
    id: 41,
    name: "AI Pioneer",
    description: "Own ML Model, Neural Network, and Deep Learning upgrades",
    category: "tech",
    rarity: "legendary",
    icon: "🤖",
    requirement: (stats, upgrades) => {
      const requiredUpgrades = [18, 19, 21]; // ML Model, Neural Network, Deep Learning
      return requiredUpgrades.every(id => upgrades?.some(u => u.upgradeId === id));
    },
    unlocked: false
  },

  // === MILESTONE ACHIEVEMENTS ===
  {
    id: 42,
    name: "The Beginning",
    description: "Reach 1,000 total power",
    category: "milestone",
    rarity: "common",
    icon: "🌱",
    requirement: (stats) => stats.lifetimePower >= 1000,
    unlocked: false
  },
  {
    id: 43,
    name: "Getting Serious",
    description: "Reach 1,000,000 total power",
    category: "milestone",
    rarity: "rare",
    icon: "🌿",
    requirement: (stats) => stats.lifetimePower >= 1000000,
    unlocked: false
  },
  {
    id: 44,
    name: "Power House",
    description: "Reach 1,000,000,000 total power",
    category: "milestone",
    rarity: "epic",
    icon: "🌳",
    requirement: (stats) => stats.lifetimePower >= 1000000000,
    unlocked: false
  },
  {
    id: 45,
    name: "Infinite Power",
    description: "Reach 1,000,000,000,000 total power",
    category: "milestone",
    rarity: "legendary",
    icon: "🏔️",
    requirement: (stats) => stats.lifetimePower >= 1000000000000,
    unlocked: false
  },

  // === COMBO ACHIEVEMENTS ===
  {
    id: 46,
    name: "Jack of All Trades",
    description: "Own at least one upgrade from 10 different categories",
    category: "combo",
    rarity: "epic",
    icon: "🎭",
    requirement: (stats, upgrades) => {
      // Count unique categories based on upgrade IDs
      const categories = new Set();
      upgrades?.forEach(u => {
        if (u.upgradeId >= 1 && u.upgradeId <= 12) categories.add('workers');
        if (u.upgradeId >= 36 && u.upgradeId <= 42) categories.add('infrastructure');
        if (u.upgradeId >= 43 && u.upgradeId <= 50) categories.add('databases');
        if (u.upgradeId >= 51 && u.upgradeId <= 57) categories.add('security');
        if (u.upgradeId >= 58 && u.upgradeId <= 64) categories.add('monitoring');
        if (u.upgradeId >= 65 && u.upgradeId <= 72) categories.add('frontend');
        if (u.upgradeId >= 73 && u.upgradeId <= 79) categories.add('backend');
        if (u.upgradeId >= 86 && u.upgradeId <= 91) categories.add('testing');
        if (u.upgradeId >= 92 && u.upgradeId <= 97) categories.add('analytics');
        if (u.upgradeId >= 98 && u.upgradeId <= 102) categories.add('emerging');
      });
      return categories.size >= 10;
    },
    unlocked: false
  },

  // === CHALLENGE ACHIEVEMENTS ===
  {
    id: 47,
    name: "Minimalist",
    description: "Reach 1,000,000 power with fewer than 10 different upgrades",
    category: "challenge",
    rarity: "epic",
    icon: "⚖️",
    requirement: (stats, upgrades) => {
      return stats.currentResources >= 1000000 && (upgrades?.filter(u => u.quantity > 0).length || 0) < 10;
    },
    unlocked: false
  },
  {
    id: 48,
    name: "Clicking Purist",
    description: "Reach 100,000 power with only clicking upgrades",
    category: "challenge",
    rarity: "epic",
    icon: "👆",
    requirement: (stats, upgrades) => {
      const clickingUpgrades = [7, 13, 20]; // Finger Training, Ergonomic Mouse, Clicking Gloves
      const hasOnlyClicking = upgrades?.every(u => clickingUpgrades.includes(u.upgradeId)) || false;
      return stats.currentResources >= 100000 && hasOnlyClicking;
    },
    unlocked: false
  }
];


// Convert GameState to GameStats for achievement checking
export const gameStateToStats = (gameState: GameState, sessionStartTime?: number, sessionData?: any): any => {
  const totalUpgrades = gameState.upgrades.reduce((sum, upgrade) => sum + upgrade.level, 0);
  const currentTime = Date.now();
  
  const sessionTime = sessionStartTime 
    ? currentTime - sessionStartTime 
    : currentTime - gameState.current_prestige_start_time;
  
  const consecutiveClicks = 0;

  // Session-specific counters
  const sessionPowerEarned = sessionData?.session_current_power ?? gameState.current_prestige_power_earned;
  const sessionUpgradesBought = sessionData?.session_upgrades_purchased ?? gameState.current_prestige_upgrades_purchased;
  const sessionClicks = sessionData?.session_clicks ?? gameState.current_prestige_clicks;

  return {
    totalClicks: gameState.lifetime_clicks,
    currentResources: gameState.power,
    resourcesPerSecond: gameState.pps,
    lastSaveTime: currentTime,
    prestigeLevel: gameState.prestige_level,
    upgradesBoughtSession: sessionUpgradesBought,
    clicksSession: sessionClicks,
    powerSession: sessionPowerEarned,
    powerSpentSession: gameState.current_prestige_power_spent,
    totalUpgrades,
    lifetimePower: gameState.lifetime_power,
    lifetimeClicks: gameState.lifetime_clicks,
    sessionTime,
    consecutiveClicks
  };
}

// Check for newly unlocked achievements
export const checkAchievements = (gameState: GameState, sessionStartTime?: number, sessionData?: any): Achievement[] => {
  const stats = gameStateToStats(gameState, sessionStartTime, sessionData);
  const upgrades = gameState.upgrades.map(u => ({ upgradeId: u.id, quantity: u.level }));
  const newlyUnlocked: Achievement[] = [];

  for (const achievement of ACHIEVEMENTS) {
    // Skip if already unlocked
    if (gameState.unlocked_achievements.includes(achievement.id)) {
      continue;
    }

    // Check if achievement requirement is met
    if (achievement.requirement(stats, upgrades)) {
      newlyUnlocked.push({ ...achievement, unlocked: true });
    }
  }

  return newlyUnlocked;
}

// Get achievement by ID
export const getAchievementById = (id: number): Achievement | undefined => {
  return ACHIEVEMENTS.find(a => a.id === id);
}

// Get all achievements
export const getAllAchievements = (): Achievement[] => {
  return ACHIEVEMENTS;
}

// Get unlocked achievements
export const getUnlockedAchievements = (unlockedIds: number[]): Achievement[] => {
  return ACHIEVEMENTS.filter(a => unlockedIds.includes(a.id));
}

// Get locked achievements
export const getLockedAchievements = (unlockedIds: number[]): Achievement[] => {
  return ACHIEVEMENTS.filter(a => !unlockedIds.includes(a.id));
}

// Calculate achievement progress (0-100)
export const getAchievementProgress = (achievementId: number, gameState: GameState, sessionStartTime?: number, sessionData?: any): number => {
  const achievement = getAchievementById(achievementId);
  if (!achievement) return 0;

  const stats = gameStateToStats(gameState, sessionStartTime, sessionData);
  const upgrades = gameState.upgrades.map(u => ({ upgradeId: u.id, quantity: u.level }));

  // If already unlocked, return 100%
  if (gameState.unlocked_achievements.includes(achievementId)) {
    return 100;
  }

  // For numeric achievements, calculate progress
  const requirementStr = achievement.requirement.toString();
  
  // Click-based achievements
  if (achievement.category === "clicking" && requirementStr.includes("totalClicks")) {
    const match = requirementStr.match(/totalClicks\s*>=\s*(\d+)/);
    if (match) {
      const target = parseInt(match[1] as string, 10);
      const current = stats.totalClicks;
      return Math.min(100, Math.floor((current / target) * 100));
    }
  }

  // Power-based achievements
  if (achievement.category === "power" && requirementStr.includes("currentResources")) {
    const match = requirementStr.match(/currentResources\s*>=\s*(\d+)/);
    if (match) {
      const target = parseInt(match[1] as string, 10);
      const current = stats.currentResources;
      return Math.min(100, Math.floor((current / target) * 100));
    }
  }

  // Speed-based achievements
  if (achievement.category === "power" && requirementStr.includes("resourcesPerSecond")) {
    const match = requirementStr.match(/resourcesPerSecond\s*>=\s*(\d+)/);
    if (match) {
      const target = parseInt(match[1] as string, 10);
      const current = stats.resourcesPerSecond;
      return Math.min(100, Math.floor((current / target) * 100));
    }
  }

  // Prestige-based achievements
  if (achievement.category === "prestige" && requirementStr.includes("prestigeLevel")) {
    const match = requirementStr.match(/prestigeLevel\s*>=\s*(\d+)/);
    if (match) {
      const target = parseInt(match[1] as string, 10);
      const current = stats.prestigeLevel;
      return Math.min(100, Math.floor((current / target) * 100));
    }
  }

  // Default: return 0 or 100 based on requirement
  return achievement.requirement(stats, upgrades) ? 100 : 0;
} 