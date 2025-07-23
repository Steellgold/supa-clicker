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
    name: "Bulk Buyer (in one session)",
    description: "Buy 100 upgrades in a single session",
    requirement: (stats) => (typeof stats.upgradesBoughtSession === 'number') && stats.upgradesBoughtSession >= 100,
    unlocked: false,
    icon: "🛒",
  },
  {
    id: 41,
    name: "Bulk Collector (in one session)",
    description: "Buy 250 upgrades in a single session",
    requirement: (stats) => (typeof stats.upgradesBoughtSession === 'number') && stats.upgradesBoughtSession >= 250,
    unlocked: false,
    icon: "🛒",
  },
  {
    id: 42,
    name: "Bulk Tycoon (in one session)",
    description: "Buy 500 upgrades in a single session",
    requirement: (stats) => (typeof stats.upgradesBoughtSession === 'number') && stats.upgradesBoughtSession >= 500,
    unlocked: false,
    icon: "🛍️",
  },
  {
    id: 43,
    name: "Bulk Legend (in one session)",
    description: "Buy 1,000 upgrades in a single session",
    requirement: (stats) => (typeof stats.upgradesBoughtSession === 'number') && stats.upgradesBoughtSession >= 1000,
    unlocked: false,
    icon: "🏷️",
  },
  {
    id: 44,
    name: "Bulk Master (in one session)",
    description: "Buy 2,500 upgrades in a single session",
    requirement: (stats) => (typeof stats.upgradesBoughtSession === 'number') && stats.upgradesBoughtSession >= 2500,
    unlocked: false,
    icon: "🏷️",
  },
  {
    id: 45,
    name: "Bulk Ultra (in one session)",
    description: "Buy 5,000 upgrades in a single session",
    requirement: (stats) => (typeof stats.upgradesBoughtSession === 'number') && stats.upgradesBoughtSession >= 5000,
    unlocked: false,
    icon: "🏅",
  },
  {
    id: 46,
    name: "Bulk Infinity (in one session)",
    description: "Buy 10,000 upgrades in a single session",
    requirement: (stats) => (typeof stats.upgradesBoughtSession === 'number') && stats.upgradesBoughtSession >= 10000,
    unlocked: false,
    icon: "🏅",
  },
  {
    id: 47,
    name: "Click Marathon (in one session)",
    description: "Click 10,000 times in a single session",
    requirement: (stats) => (typeof stats.clicksSession === 'number') && stats.clicksSession >= 10000,
    unlocked: false,
    icon: "🏃‍♂️",
  },
  {
    id: 48,
    name: "Click Ultra (in one session)",
    description: "Click 25,000 times in a single session",
    requirement: (stats) => (typeof stats.clicksSession === 'number') && stats.clicksSession >= 25000,
    unlocked: false,
    icon: "🏃‍♂️",
  },
  {
    id: 49,
    name: "Click Master (in one session)",
    description: "Click 50,000 times in a single session",
    requirement: (stats) => (typeof stats.clicksSession === 'number') && stats.clicksSession >= 50000,
    unlocked: false,
    icon: "🏃‍♂️",
  },
  {
    id: 50,
    name: "Click Legend (in one session)",
    description: "Click 100,000 times in a single session",
    requirement: (stats) => (typeof stats.clicksSession === 'number') && stats.clicksSession >= 100000,
    unlocked: false,
    icon: "🏃‍♀️",
  },
  {
    id: 51,
    name: "Click Ultra Legend (in one session)",
    description: "Click 250,000 times in a single session",
    requirement: (stats) => (typeof stats.clicksSession === 'number') && stats.clicksSession >= 250000,
    unlocked: false,
    icon: "🏃‍♀️",
  },
  {
    id: 52,
    name: "Click Infinity (in one session)",
    description: "Click 500,000 times in a single session",
    requirement: (stats) => (typeof stats.clicksSession === 'number') && stats.clicksSession >= 500000,
    unlocked: false,
    icon: "🏅",
  },
  {
    id: 53,
    name: "Session Hoarder",
    description: "Earn 1 billion power in a single session",
    requirement: (stats) => (typeof stats.powerSession === 'number') && stats.powerSession >= 1e9,
    unlocked: false,
    icon: "💎",
  },
  {
    id: 54,
    name: "Session Tycoon",
    description: "Earn 10 billion power in a single session",
    requirement: (stats) => (typeof stats.powerSession === 'number') && stats.powerSession >= 1e10,
    unlocked: false,
    icon: "🔮",
  },
  {
    id: 55,
    name: "Session Master",
    description: "Earn 100 billion power in a single session",
    requirement: (stats) => (typeof stats.powerSession === 'number') && stats.powerSession >= 1e11,
    unlocked: false,
    icon: "👼",
  },
  {
    id: 56,
    name: "Session Ultra",
    description: "Earn 1 trillion power in a single session",
    requirement: (stats) => (typeof stats.powerSession === 'number') && stats.powerSession >= 1e12,
    unlocked: false,
    icon: "💎",
  },
  {
    id: 57,
    name: "Session Legend",
    description: "Earn 10 trillion power in a single session",
    requirement: (stats) => (typeof stats.powerSession === 'number') && stats.powerSession >= 1e13,
    unlocked: false,
    icon: "🔮",
  },
  {
    id: 58,
    name: "Session Infinity",
    description: "Earn 100 trillion power in a single session",
    requirement: (stats) => (typeof stats.powerSession === 'number') && stats.powerSession >= 1e14,
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
    requirement: (stats) => (typeof stats.upgradesBoughtSession === 'number') && stats.upgradesBoughtSession >= 100000,
    unlocked: false,
    icon: "🪐",
  },
  {
    id: 67,
    name: "Session Infinity",
    description: "Earn 1 sextillion resources in one session",
    requirement: (stats) => typeof stats.powerSession === 'number' && stats.powerSession >= 1e21 ? true : false,
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
    name: "Resource Godlike",
    description: "Have 1 quintillion resources",
    requirement: (stats) => stats.currentResources >= 1e18,
    unlocked: false,
    icon: "🧿",
  },
  {
    id: 71,
    name: "Session Godlike",
    description: "Earn 1 septillion resources in one session",
    requirement: (stats) => typeof stats.powerSession === 'number' && stats.powerSession >= 1e24 ? true : false,
    unlocked: false,
    icon: "🦄",
  },
  {
    id: 72,
    name: "Bulk Godlike",
    description: "Buy 1,000,000 upgrades in one session",
    requirement: (stats) => typeof stats.upgradesBoughtSession === 'number' && stats.upgradesBoughtSession >= 1000000 ? true : false,
    unlocked: false,
    icon: "🦾",
  },
  {
    id: 73,
    name: "Upgrade Godlike",
    description: "Own 1,000,000 upgrades total",
    requirement: (stats, upgrades) => upgrades ? upgrades.reduce((sum, u) => sum + u.quantity, 0) >= 1000000 : false,
    unlocked: false,
    icon: "🦾",
  },
  {
    id: 74,
    name: "Clicker Beyond",
    description: "Make 10,000,000,000 clicks",
    requirement: (stats) => stats.totalClicks >= 10000000000,
    unlocked: false,
    icon: "🛸",
  },
  {
    id: 75,
    name: "Resource Beyond",
    description: "Have 1 sextillion resources",
    requirement: (stats) => stats.currentResources >= 1e21,
    unlocked: false,
    icon: "🪙",
  },
  {
    id: 76,
    name: "Session Beyond",
    description: "Earn 1 octillion resources in one session",
    requirement: (stats) => typeof stats.powerSession === 'number' && stats.powerSession >= 1e27 ? true : false,
    unlocked: false,
    icon: "🛸",
  },
  {
    id: 77,
    name: "Bulk Beyond",
    description: "Buy 10,000,000 upgrades in one session",
    requirement: (stats) => typeof stats.upgradesBoughtSession === 'number' && stats.upgradesBoughtSession >= 10000000 ? true : false,
    unlocked: false,
    icon: "🛒",
  },
  {
    id: 78,
    name: "Upgrade Beyond",
    description: "Own 10,000,000 upgrades total",
    requirement: (stats, upgrades) => upgrades ? upgrades.reduce((sum, u) => sum + u.quantity, 0) >= 10000000 : false,
    unlocked: false,
    icon: "🛒",
  },
  {
    id: 79,
    name: "Clicker Infinite",
    description: "Make 100,000,000,000 clicks",
    requirement: (stats) => stats.totalClicks >= 100000000000,
    unlocked: false,
    icon: "♾️",
  },
  {
    id: 80,
    name: "Resource Infinite",
    description: "Have 1 nonillion resources",
    requirement: (stats) => stats.currentResources >= 1e30,
    unlocked: false,
    icon: "💠",
  },
  {
    id: 81,
    name: "Session Infinite",
    description: "Earn 1 decillion resources in one session",
    requirement: (stats) => typeof stats.powerSession === 'number' && stats.powerSession >= 1e33 ? true : false,
    unlocked: false,
    icon: "💠",
  },
  {
    id: 82,
    name: "Bulk Infinite",
    description: "Buy 100,000,000 upgrades in one session",
    requirement: (stats) => typeof stats.upgradesBoughtSession === 'number' && stats.upgradesBoughtSession >= 100000000 ? true : false,
    unlocked: false,
    icon: "💠",
  },
  {
    id: 83,
    name: "Upgrade Infinite",
    description: "Own 100,000,000 upgrades total",
    requirement: (stats, upgrades) => upgrades ? upgrades.reduce((sum, u) => sum + u.quantity, 0) >= 100000000 : false,
    unlocked: false,
    icon: "💠",
  },
  {
    id: 84,
    name: "Clicker Ultimate",
    description: "Make 1 trillion clicks",
    requirement: (stats) => stats.totalClicks >= 1e12,
    unlocked: false,
    icon: "🏆",
  },
  {
    id: 85,
    name: "Resource Ultimate",
    description: "Have 1 decillion resources",
    requirement: (stats) => stats.currentResources >= 1e33,
    unlocked: false,
    icon: "🏆",
  },
  {
    id: 86,
    name: "Session Ultimate",
    description: "Earn 1 undecillion resources in one session",
    requirement: (stats) => typeof stats.powerSession === 'number' && stats.powerSession >= 1e36 ? true : false,
    unlocked: false,
    icon: "🏆",
  },
  {
    id: 87,
    name: "Bulk Ultimate",
    description: "Buy 1 billion upgrades in one session",
    requirement: (stats) => typeof stats.upgradesBoughtSession === 'number' && stats.upgradesBoughtSession >= 1e9 ? true : false,
    unlocked: false,
    icon: "🏆",
  },
  {
    id: 88,
    name: "Upgrade Ultimate",
    description: "Own 1 billion upgrades total",
    requirement: (stats, upgrades) => upgrades ? upgrades.reduce((sum, u) => sum + u.quantity, 0) >= 1e9 : false,
    unlocked: false,
    icon: "🏆",
  },
  {
    id: 89,
    name: "Clicker Supreme Infinity",
    description: "Make 10 trillion clicks",
    requirement: (stats) => stats.totalClicks >= 1e13,
    unlocked: false,
    icon: "🏅",
  },
  {
    id: 90,
    name: "Resource Supreme Infinity",
    description: "Have 1 duodecillion resources",
    requirement: (stats) => stats.currentResources >= 1e39,
    unlocked: false,
    icon: "🏅",
  },
  {
    id: 91,
    name: "Session Supreme Infinity",
    description: "Earn 1 tredecillion resources in one session",
    requirement: (stats) => typeof stats.powerSession === 'number' && stats.powerSession >= 1e42 ? true : false,
    unlocked: false,
    icon: "🏅",
  },
  {
    id: 92,
    name: "Bulk Supreme Infinity",
    description: "Buy 10 billion upgrades in one session",
    requirement: (stats) => typeof stats.upgradesBoughtSession === 'number' && stats.upgradesBoughtSession >= 1e10 ? true : false,
    unlocked: false,
    icon: "🏅",
  },
  {
    id: 93,
    name: "Upgrade Supreme Infinity",
    description: "Own 10 billion upgrades total",
    requirement: (stats, upgrades) => upgrades ? upgrades.reduce((sum, u) => sum + u.quantity, 0) >= 1e10 : false,
    unlocked: false,
    icon: "🏅",
  },
  {
    id: 94,
    name: "Clicker God Supreme",
    description: "Make 100 trillion clicks",
    requirement: (stats) => stats.totalClicks >= 1e14,
    unlocked: false,
    icon: "👑",
  },
  {
    id: 95,
    name: "Resource God Supreme",
    description: "Have 1 quattuordecillion resources",
    requirement: (stats) => stats.currentResources >= 1e45,
    unlocked: false,
    icon: "👑",
  },
  {
    id: 96,
    name: "Session God Supreme",
    description: "Earn 1 quindecillion resources in one session",
    requirement: (stats) => typeof stats.powerSession === 'number' && stats.powerSession >= 1e48 ? true : false,
    unlocked: false,
    icon: "👑",
  },
  {
    id: 97,
    name: "Bulk God Supreme",
    description: "Buy 100 billion upgrades in one session",
    requirement: (stats) => typeof stats.upgradesBoughtSession === 'number' && stats.upgradesBoughtSession >= 1e11 ? true : false,
    unlocked: false,
    icon: "👑",
  },
  {
    id: 98,
    name: "Upgrade God Supreme",
    description: "Own 100 billion upgrades total",
    requirement: (stats, upgrades) => upgrades ? upgrades.reduce((sum, u) => sum + u.quantity, 0) >= 1e11 : false,
    unlocked: false,
    icon: "👑",
  },
  {
    id: 99,
    name: "Clicker Omniverse",
    description: "Make 1 quadrillion clicks",
    requirement: (stats) => stats.totalClicks >= 1e15,
    unlocked: false,
    icon: "🌌",
  },
  {
    id: 100,
    name: "Resource Omniverse",
    description: "Have 1 quindecillion resources",
    requirement: (stats) => stats.currentResources >= 1e48,
    unlocked: false,
    icon: "🌌",
  },
  {
    id: 101,
    name: "Session Omniverse",
    description: "Earn 1 sexdecillion resources in one session",
    requirement: (stats) => typeof stats.powerSession === 'number' && stats.powerSession >= 1e51 ? true : false,
    unlocked: false,
    icon: "🌌",
  },
  {
    id: 102,
    name: "Bulk Omniverse",
    description: "Buy 1 trillion upgrades in one session",
    requirement: (stats) => typeof stats.upgradesBoughtSession === 'number' && stats.upgradesBoughtSession >= 1e12 ? true : false,
    unlocked: false,
    icon: "🌌",
  },
  {
    id: 103,
    name: "Upgrade Omniverse",
    description: "Own 1 trillion upgrades total",
    requirement: (stats, upgrades) => upgrades ? upgrades.reduce((sum, u) => sum + u.quantity, 0) >= 1e12 : false,
    unlocked: false,
    icon: "🌌",
  },
  {
    id: 104,
    name: "Clicker Eternity",
    description: "Make 10 quadrillion clicks",
    requirement: (stats) => stats.totalClicks >= 1e16,
    unlocked: false,
    icon: "⏳",
  },
  {
    id: 105,
    name: "Resource Eternity",
    description: "Have 1 septendecillion resources",
    requirement: (stats) => stats.currentResources >= 1e51,
    unlocked: false,
    icon: "⏳",
  },
  {
    id: 106,
    name: "Session Eternity",
    description: "Earn 1 octodecillion resources in one session",
    requirement: (stats) => typeof stats.powerSession === 'number' && stats.powerSession >= 1e54 ? true : false,
    unlocked: false,
    icon: "⏳",
  },
  {
    id: 107,
    name: "Bulk Eternity",
    description: "Buy 10 trillion upgrades in one session",
    requirement: (stats) => typeof stats.upgradesBoughtSession === 'number' && stats.upgradesBoughtSession >= 1e13 ? true : false,
    unlocked: false,
    icon: "⏳",
  },
  {
    id: 108,
    name: "Upgrade Eternity",
    description: "Own 10 trillion upgrades total",
    requirement: (stats, upgrades) => upgrades ? upgrades.reduce((sum, u) => sum + u.quantity, 0) >= 1e13 : false,
    unlocked: false,
    icon: "⏳",
  },
  {
    id: 109,
    name: "Clicker Infinity+",
    description: "Make 100 quadrillion clicks",
    requirement: (stats) => stats.totalClicks >= 1e17,
    unlocked: false,
    icon: "🔆",
  },
  {
    id: 110,
    name: "Resource Beyond Infinity",
    description: "Have 1 novemdecillion resources",
    requirement: (stats) => stats.currentResources >= 1e60,
    unlocked: false,
    icon: "🔆",
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
