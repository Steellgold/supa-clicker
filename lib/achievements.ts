import { getAllUpgrades } from '@/lib/upgrades';
import { Achievement, GameStats, UserUpgrade } from '@/type/game';

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

  // Prestige achievements
  // {
  //   id: 30,
  //   name: "Renaissance",
  //   description: "Perform your first prestige",
  //   requirement: (stats) => stats.prestigeLevel >= 1,
  //   unlocked: false,
  //   icon: "🔄",
  // },
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
