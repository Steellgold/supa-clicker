import { Achievement, GameStats, UserUpgrade } from "@/type/game";

export const ACHIEVEMENTS: Achievement[] = [];

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
