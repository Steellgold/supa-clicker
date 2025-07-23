import { getAllUpgrades } from "@/lib/upgrades";
import { Achievement, GameStats, UserUpgrade } from "@/type/game";

const ALL_UPGRADES = getAllUpgrades();

const ACHIEVEMENTS: Achievement[] = [
  // Click-based achievements
  {
    id: 1,
    name: "First Click",
    description: "Make your first click",
    requirement: (stats) => stats.totalClicks >= 1,
    unlocked: false,
    icon: "👆",
  },
  {
    id: 2,
    name: "Beginner Clicker",
    description: "Make 100 clicks",
    requirement: (stats) => stats.totalClicks >= 100,
    unlocked: false,
    icon: "🖱️",
  },
  {
    id: 3,
    name: "Intermediate Clicker",
    description: "Make 500 clicks",
    requirement: (stats) => stats.totalClicks >= 500,
    unlocked: false,
    icon: "⚡",
  },
  {
    id: 4,
    name: "Expert Clicker",
    description: "Make 1,000 clicks",
    requirement: (stats) => stats.totalClicks >= 1000,
    unlocked: false,
    icon: "🔥",
  },
  {
    id: 5,
    name: "Click Master",
    description: "Make 10,000 clicks",
    requirement: (stats) => stats.totalClicks >= 10000,
    unlocked: false,
    icon: "👑",
  },
  {
    id: 6,
    name: "Click Legend",
    description: "Make 50,000 clicks",
    requirement: (stats) => stats.totalClicks >= 50000,
    unlocked: false,
    icon: "🌟",
  },
  {
    id: 7,
    name: "Click God",
    description: "Make 100,000 clicks",
    requirement: (stats) => stats.totalClicks >= 100000,
    unlocked: false,
    icon: "⚡",
  },
  {
    id: 8,
    name: "Transcendence",
    description: "Make 500,000 clicks",
    requirement: (stats) => stats.totalClicks >= 500000,
    unlocked: false,
    icon: "🌌",
  },
  {
    id: 9,
    name: "Infinity",
    description: "Make 1,000,000 clicks",
    requirement: (stats) => stats.totalClicks >= 1000000,
    unlocked: false,
    icon: "♾️",
  },

  // Resource-based achievements
  {
    id: 10,
    name: "First Fortune",
    description: "Have 1,000 resources",
    requirement: (stats) => stats.currentResources >= 1000,
    unlocked: false,
    icon: "💰",
  },
  {
    id: 11,
    name: "Millionaire",
    description: "Have 1 million resources",
    requirement: (stats) => stats.currentResources >= 1000000,
    unlocked: false,
    icon: "💎",
  },
  {
    id: 12,
    name: "Billionaire",
    description: "Have 1 billion resources",
    requirement: (stats) => stats.currentResources >= 1000000000,
    unlocked: false,
    icon: "🏦",
  },
  {
    id: 13,
    name: "Trillionaire",
    description: "Have 1 trillion resources",
    requirement: (stats) => stats.currentResources >= 1000000000000,
    unlocked: false,
    icon: "🌍",
  },

  // Upgrade-based achievements
  {
    id: 14,
    name: "First Employee",
    description: "Buy your first auto-clicker",
    requirement: (stats, upgrades) => upgrades?.some((u) => u.upgradeId === 1 && u.quantity > 0) || false,
    unlocked: false,
    icon: "🤖",
  },
  {
    id: 15,
    name: "Complete Team",
    description: "Have at least 1 of each basic auto-clicker",
    requirement: (stats, upgrades) =>
      upgrades ? [1, 2, 3, 4, 5].every((id) => upgrades.some((u) => u.upgradeId === id && u.quantity > 0)) : false,
    unlocked: false,
    icon: "👥",
  },
  {
    id: 16,
    name: "Startup",
    description: "Have 10 employees in total",
    requirement: (stats, upgrades) =>
      upgrades ? upgrades.filter((u) => [1, 2, 3, 4, 5, 6, 7].includes(u.upgradeId)).reduce((sum, u) => sum + u.quantity, 0) >= 10 : false,
    unlocked: false,
    icon: "🚀",
  },
  {
    id: 17,
    name: "Company",
    description: "Have 50 employees in total",
    requirement: (stats, upgrades) =>
      upgrades ? upgrades.filter((u) => [1, 2, 3, 4, 5, 6, 7].includes(u.upgradeId)).reduce((sum, u) => sum + u.quantity, 0) >= 50 : false,
    unlocked: false,
    icon: "🏢",
  },
  {
    id: 18,
    name: "Corporation",
    description: "Have 100 employees in total",
    requirement: (stats, upgrades) =>
      upgrades ? upgrades.filter((u) => [1, 2, 3, 4, 5, 6, 7].includes(u.upgradeId)).reduce((sum, u) => sum + u.quantity, 0) >= 100 : false,
    unlocked: false,
    icon: "🏭",
  },

  // Speed-based achievements
  {
    id: 19,
    name: "Cruising Speed",
    description: "Generate 10 resources per second",
    requirement: (stats) => stats.resourcesPerSecond >= 10,
    unlocked: false,
    icon: "🏃",
  },
  {
    id: 20,
    name: "Supersonic Speed",
    description: "Generate 100 resources per second",
    requirement: (stats) => stats.resourcesPerSecond >= 100,
    unlocked: false,
    icon: "✈️",
  },
  {
    id: 21,
    name: "Speed of Light",
    description: "Generate 1,000 resources per second",
    requirement: (stats) => stats.resourcesPerSecond >= 1000,
    unlocked: false,
    icon: "🌠",
  },
  {
    id: 22,
    name: "Warp Speed",
    description: "Generate 10,000 resources per second",
    requirement: (stats) => stats.resourcesPerSecond >= 10000,
    unlocked: false,
    icon: "🚀",
  },
  {
    id: 23,
    name: "Teleportation",
    description: "Generate 100,000 resources per second",
    requirement: (stats) => stats.resourcesPerSecond >= 100000,
    unlocked: false,
    icon: "⚡",
  },

  // Category-based achievements
  {
    id: 24,
    name: "Full-Stack Developer",
    description: "Have at least 1 upgrade from each category",
    requirement: (stats, upgrades) => {
      if (!upgrades) return false;
      const categories = ["auto", "click", "infra", "database", "security", "monitoring", "frontend", "backend"];
      return categories.every((cat) =>
        upgrades.some((u) => {
          const upgrade = ALL_UPGRADES.find((up) => up.id === u.upgradeId);
          return upgrade && upgrade.category === cat && u.quantity > 0;
        })
      );
    },
    unlocked: false,
    icon: "💻",
  },
  {
    id: 25,
    name: "Cloud Architect",
    description: "Have 10 infrastructure upgrades",
    requirement: (stats, upgrades) => {
      if (!upgrades) return false;
      return upgrades
        .filter((u) => {
          const upgrade = ALL_UPGRADES.find((up) => up.id === u.upgradeId);
          return upgrade && upgrade.category === "infra";
        })
        .reduce((sum, u) => sum + u.quantity, 0) >= 10;
    },
    unlocked: false,
    icon: "☁️",
  },

  // Special achievements
  {
    id: 26,
    name: "All-Nighter",
    description: "Play for more than one hour",
    requirement: (stats) => Date.now() - stats.lastSaveTime > 3600000,
    unlocked: false,
    icon: "🌙",
  },
  {
    id: 27,
    name: "Efficiency",
    description: "Have a resources/clicks ratio > 100",
    requirement: (stats) => stats.totalClicks > 0 && stats.currentResources / stats.totalClicks > 100,
    unlocked: false,
    icon: "📈",
  },

  // Milestone achievements
  {
    id: 28,
    name: "Collector",
    description: "Unlock 20 different upgrades",
    requirement: (stats, upgrades) => upgrades ? upgrades.length >= 20 : false,
    unlocked: false,
    icon: "🎯",
  },
  {
    id: 29,
    name: "Master Collector",
    description: "Unlock 50 different upgrades",
    requirement: (stats, upgrades) => upgrades ? upgrades.length >= 50 : false,
    unlocked: false,
    icon: "🏆",
  },
  // --- SESSION ACHIEVEMENTS ONLY ---
  {
    id: 40,
    name: "Bulk Buyer",
    description: "Buy 100 upgrades in a single session",
    requirement: (stats) => stats.upgradesBoughtSession >= 100,
    unlocked: false,
    icon: "🛒",
  },
  {
    id: 41,
    name: "Bulk Collector",
    description: "Buy 250 upgrades in a single session",
    requirement: (stats) => stats.upgradesBoughtSession >= 250,
    unlocked: false,
    icon: "🛒",
  },
  {
    id: 42,
    name: "Bulk Tycoon",
    description: "Buy 500 upgrades in a single session",
    requirement: (stats) => stats.upgradesBoughtSession >= 500,
    unlocked: false,
    icon: "🛍️",
  },
  {
    id: 43,
    name: "Bulk Legend",
    description: "Buy 1,000 upgrades in a single session",
    requirement: (stats) => stats.upgradesBoughtSession >= 1000,
    unlocked: false,
    icon: "🏷️",
  },
  {
    id: 44,
    name: "Bulk Master",
    description: "Buy 2,500 upgrades in a single session",
    requirement: (stats) => stats.upgradesBoughtSession >= 2500,
    unlocked: false,
    icon: "🏷️",
  },
  {
    id: 45,
    name: "Bulk Ultra",
    description:"Buy 5,000 upgrades in a single session",
    requirement: (stats) => stats.upgradesBoughtSession >= 5000,
    unlocked: false,
    icon: "🏅",
  },
  {
    id: 46,
    name: "Bulk Infinity",
    description: "Buy 10,000 upgrades in a single session",
    requirement: (stats) => stats.upgradesBoughtSession >= 10000,
    unlocked: false,
    icon: "🏅",
  },
  {
    id: 47,
    name: "Click Marathon",
    description: "Click 10,000 times in a single session",
    requirement: (stats) => stats.clicksSession >= 10000,
    unlocked: false,
    icon: "🏃‍♂️",
  },
  {
    id: 48,
    name: "Click Ultra",
    description: "Click 25,000 times in a single session",
    requirement: (stats) => stats.clicksSession >= 25000,
    unlocked: false,
    icon: "🏃‍♂️",
  },
  {
    id: 49,
    name: "Click Master",
    description: "Click 50,000 times in a single session",
    requirement: (stats) => stats.clicksSession >= 50000,
    unlocked: false,
    icon: "🏃‍♂️",
  },
  {
    id: 50,
    name: "Click Legend",
    description: "Click 100,000 times in a single session",
    requirement: (stats) => stats.clicksSession >= 100000,
    unlocked: false,
    icon: "🏃‍♀️",
  },
  {
    id: 51,
    name: "Click Ultra Legend",
    description: "Click 250,000 times in a single session",
    requirement: (stats) => stats.clicksSession >= 250000,
    unlocked: false,
    icon: "🏃‍♀️",
  },
  {
    id: 52,
    name: "Click Infinity",
    description: "Click 500,000 times in a single session",
    requirement: (stats) => stats.clicksSession >= 500000,
    unlocked: false,
    icon: "🏅",
  },
  {
    id: 53,
    name: "Session Hoarder",
    description: "Earn 1 billion power in a single session",
    requirement: (stats) => stats.powerSession >= 1e9,
    unlocked: false,
    icon: "💎",
  },
  {
    id: 54,
    name: "Session Tycoon",
    description: "Earn 10 billion power in a single session",
    requirement: (stats) => stats.powerSession >= 1e10,
    unlocked: false,
    icon: "🔮",
  },
  {
    id: 55,
    name: "Session Master",
    description: "Earn 100 billion power in a single session",
    requirement: (stats) => stats.powerSession >= 1e11,
    unlocked: false,
    icon: "👼",
  },
  {
    id: 56,
    name: "Session Ultra",
    description: "Earn 1 trillion power in a single session",
    requirement: (stats) => stats.powerSession >= 1e12,
    unlocked: false,
    icon: "💎",
  },
  {
    id: 57,
    name: "Session Legend",
    description: "Earn 10 trillion power in a single session",
    requirement: (stats) => stats.powerSession >= 1e13,
    unlocked: false,
    icon: "🔮",
  },
  {
    id: 58,
    name: "Session Infinity",
    description: "Earn 100 trillion power in a single session",
    requirement: (stats) => stats.powerSession >= 1e14,
    unlocked: false,
    icon: "👼",
  },
  {
    id: 59,
    name: "Upgrade Collector",
    description: "Own 1,000 upgrades total",
    requirement: (stats, upgrades) => upgrades ? upgrades.reduce((sum, u) => sum + u.quantity, 0) >= 1000 : false,
    unlocked: false,
    icon: "📦",
  },
  {
    id: 60,
    name: "Upgrade Hoarder",
    description: "Own 10,000 upgrades total",
    requirement: (stats, upgrades) => upgrades ? upgrades.reduce((sum, u) => sum + u.quantity, 0) >= 10000 : false,
    unlocked: false,
    icon: "📦",
  },
  {
    id: 61,
    name: "Clicker Supreme",
    description: "Make 50,000,000 clicks",
    requirement: (stats) => stats.totalClicks >= 50000000,
    unlocked: false,
    icon: "🥇",
  },
  {
    id: 62,
    name: "Clicker Infinity",
    description: "Make 100,000,000 clicks",
    requirement: (stats) => stats.totalClicks >= 100000000,
    unlocked: false,
    icon: "♾️",
  },
  {
    id: 63,
    name: "Resource Infinity",
    description: "Have 10 quadrillion resources",
    requirement: (stats) => stats.currentResources >= 10000000000000000,
    unlocked: false,
    icon: "💹",
  },
  {
    id: 64,
    name: "Upgrade Tycoon",
    description: "Unlock 120 different upgrades",
    requirement: (stats, upgrades) => upgrades ? upgrades.length >= 120 : false,
    unlocked: false,
    icon: "🧑‍💼",
  },
  {
    id: 65,
    name: "Speed Universe",
    description: "Generate 1,000,000,000 resources per second",
    requirement: (stats) => stats.resourcesPerSecond >= 1000000000,
    unlocked: false,
    icon: "🌌",
  },
  {
    id: 66,
    name: "Bulk Universe",
    description: "Buy 100,000 upgrades in one session",
    requirement: (stats) => stats.upgradesBoughtSession >= 100000,
    unlocked: false,
    icon: "🪐",
  },
  {
    id: 67,
    name: "Session Infinity",
    description: "Earn 1 sextillion resources in one session",
    requirement: (stats) => stats.powerSession >= 1e21,
    unlocked: false,
    icon: "🌠",
  },
  {
    id: 68,
    name: "Upgrade Universe",
    description: "Own 100,000 upgrades total",
    requirement: (stats, upgrades) => upgrades ? upgrades.reduce((sum, u) => sum + u.quantity, 0) >= 100000 : false,
    unlocked: false,
    icon: "🪙",
  },
  {
    id: 69,
    name: "Clicker Godlike",
    description: "Make 1,000,000,000 clicks",
    requirement: (stats) => stats.totalClicks >= 1000000000,
    unlocked: false,
    icon: "🧙‍♂️",
  },
  {
    id: 70,
    name: "Renaissance",
    description: "Perform your first prestige",
    requirement: (stats) => stats.prestigeLevel >= 1,
    unlocked: false,
    icon: "🔄",
  },
  {
    id: 71,
    name: "Prestige Godlike",
    description: "Perform your 10th prestige",
    requirement: (stats) => stats.prestigeLevel >= 10,
    unlocked: false,
    icon: "🔄",
  },
  {
    id: 72,
    name: "Prestige Newbie",
    description: "Perform your 20th prestige",
    requirement: (stats) => stats.prestigeLevel >= 20,
    unlocked: false,
    icon: "🔄",
  },
  {
    id: 73,
    name: "Prestige Veteran",
    description: "Perform your 45th prestige",
    requirement: (stats) => stats.prestigeLevel >= 45,
    unlocked: false,
    icon: "🔄",
  },
  {
    id: 74,
    name: "Prestige Hero",
    description: "Perform your 50th prestige",
    requirement: (stats) => stats.prestigeLevel >= 50,
    unlocked: false,
    icon: "🔄",
  }
];

export { ACHIEVEMENTS };

export const checkAchievements = (
  stats: GameStats,
  upgrades: UserUpgrade[],
  currentUnlockedIds: number[]
): Achievement[] => {
  const newlyUnlocked: Achievement[] = [];

  for (const achievement of ACHIEVEMENTS) {
    if (currentUnlockedIds.includes(achievement.id)) continue;

    if (achievement.requirement(stats, upgrades)) {
      newlyUnlocked.push({ ...achievement, unlocked: true });
    }
  }

  return newlyUnlocked;
};

export const getAchievementProgress = (
  achievementId: number,
  stats: GameStats,
  upgrades: UserUpgrade[]
): number => {
  const achievement = ACHIEVEMENTS.find(a => a.id === achievementId);
  if (!achievement) return 0;
  // Cast pour accès dynamique
  const statsAny = stats as GameStats & Record<string, unknown>;
  // Click-based achievements
  if (achievement.name.toLowerCase().includes("click") && achievement.requirement.toString().includes("totalClicks")) {
    const match = achievement.requirement.toString().match(/totalClicks\s*>=\s*(\d+)/);
    if (match) {
      const target = parseInt(match[1], 10);
      const value = Number(stats.totalClicks);
      if (!Number.isFinite(value) || value < 0) return 0;
      if (value >= target) return 100;
      return Math.max(0, Math.floor((value / target) * 100));
    }
  }
  // Resource-based achievements
  if (achievement.name.toLowerCase().includes("resource") && achievement.requirement.toString().includes("currentResources")) {
    const match = achievement.requirement.toString().match(/currentResources\s*>=\s*(\d+)/);
    if (match) {
      const target = parseInt(match[1], 10);
      const value = Number(stats.currentResources);
      if (!Number.isFinite(value) || value < 0) return 0;
      if (value >= target) return 100;
      return Math.max(0, Math.floor((value / target) * 100));
    }
  }
  // Session clicks
  if (achievement.name.toLowerCase().includes("session") && achievement.requirement.toString().includes("clicksSession")) {
    const match = achievement.requirement.toString().match(/clicksSession\s*>=\s*(\d+)/);
    if (match) {
      const target = parseInt(match[1], 10);
      const value = Number(statsAny.clicksSession);
      if (!Number.isFinite(value) || value < 0) return 0;
      if (value >= target) return 100;
      return Math.max(0, Math.floor((value / target) * 100));
    }
  }
  // Session resources
  if (achievement.name.toLowerCase().includes("session") && achievement.requirement.toString().includes("powerSession")) {
    const match = achievement.requirement.toString().match(/powerSession\s*>=\s*(\d+)/);
    if (match) {
      const target = parseInt(match[1], 10);
      const value = Number(statsAny.powerSession);
      if (!Number.isFinite(value) || value < 0) return 0;
      if (value >= target) return 100;
      return Math.max(0, Math.floor((value / target) * 100));
    }
  }
  // Session upgrades
  if (achievement.name.toLowerCase().includes("session") && achievement.requirement.toString().includes("upgradesBoughtSession")) {
    const match = achievement.requirement.toString().match(/upgradesBoughtSession\s*>=\s*(\d+)/);
    if (match) {
      const target = parseInt(match[1], 10);
      const value = Number(statsAny.upgradesBoughtSession);
      if (!Number.isFinite(value) || value < 0) return 0;
      if (value >= target) return 100;
      return Math.max(0, Math.floor((value / target) * 100));
    }
  }
  // Upgrades owned
  if (achievement.name.toLowerCase().includes("upgrade") && achievement.requirement.toString().includes("upgrades.length")) {
    const match = achievement.requirement.toString().match(/upgrades\.length\s*>=\s*(\d+)/);
    if (match) {
      const target = parseInt(match[1], 10);
      const value = upgrades.length;
      if (!Number.isFinite(value) || value < 0) return 0;
      if (value >= target) return 100;
      return Math.max(0, Math.floor((value / target) * 100));
    }
  }
  // Upgrades total quantity
  if (achievement.name.toLowerCase().includes("upgrade") && achievement.requirement.toString().includes("reduce((sum, u) => sum + u.quantity")) {
    const match = achievement.requirement.toString().match(/>=\s*(\d+)/);
    if (match) {
      const target = parseInt(match[1], 10);
      const value = upgrades.reduce((sum, u) => sum + u.quantity, 0);
      if (!Number.isFinite(value) || value < 0) return 0;
      if (value >= target) return 100;
      return Math.max(0, Math.floor((value / target) * 100));
    }
  }
  // Speed-based achievements
  if (achievement.name.toLowerCase().includes("speed") && achievement.requirement.toString().includes("resourcesPerSecond")) {
    const match = achievement.requirement.toString().match(/resourcesPerSecond\s*>=\s*(\d+)/);
    if (match) {
      const target = parseInt(match[1], 10);
      const value = Number(stats.resourcesPerSecond);
      if (!Number.isFinite(value) || value < 0) return 0;
      if (value >= target) return 100;
      return Math.max(0, Math.floor((value / target) * 100));
    }
  }
  // Par défaut : 0 ou 100
  return achievement.requirement(stats, upgrades) ? 100 : 0;
};

export const getAllAchievements = (): Achievement[] => {
  return ACHIEVEMENTS;
};

export const getAchievementById = (id: number): Achievement | undefined => {
  return ACHIEVEMENTS.find(a => a.id === id);
};

export const getUnlockedAchievements = (unlockedIds: number[]): Achievement[] => {
  return ACHIEVEMENTS.filter(a => unlockedIds.includes(a.id));
};

export const getLockedAchievements = (unlockedIds: number[]): Achievement[] => {
  return ACHIEVEMENTS.filter(a => !unlockedIds.includes(a.id));
};
