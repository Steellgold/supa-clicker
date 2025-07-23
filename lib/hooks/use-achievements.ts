
import { checkAchievements, getAllAchievements } from "@/lib/achievements";
import { useAuth } from "@/lib/auth/auth-context";
import { Achievement, GameStats, UserUpgrade } from "@/type/game";
import { useCallback, useEffect, useMemo, useState } from "react";

export interface UseAchievementsReturn {
  // Achievement states
  unlockedAchievements: Achievement[];
  newAchievements: Achievement[];
  allAchievements: Achievement[];
  
  // Actions
  checkForNewAchievements: (stats: GameStats, upgrades: UserUpgrade[]) => void;
  markAchievementAsViewed: (achievementId: number) => void;
  clearNewAchievements: () => void;
  resetAchievements: () => void;
  
  // Stats
  totalAchievements: number;
  unlockedCount: number;
  completionPercentage: number;
}

export const useAchievements = (initialUnlockedIds: number[] = []): UseAchievementsReturn => {
  const { user } = useAuth();
  const storageKey = user ? `achievements_viewed_${user.id}` : "achievements_viewed_local";
  const [unlockedIds, setUnlockedIds] = useState<number[]>(initialUnlockedIds);
  const [newAchievements, setNewAchievements] = useState<Achievement[]>([]);
  const [viewedIds, setViewedIds] = useState<number[]>([]);
  const [, setInitialLoadComplete] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const parsedViewedIds = JSON.parse(raw);
        setViewedIds(parsedViewedIds);

        if (initialUnlockedIds.length > 0) {
          const allInitialViewed = [...new Set([...parsedViewedIds, ...initialUnlockedIds])];
          setViewedIds(allInitialViewed);
          localStorage.setItem(storageKey, JSON.stringify(allInitialViewed));
        }
      } else if (initialUnlockedIds.length > 0) {
        setViewedIds(initialUnlockedIds);
        localStorage.setItem(storageKey, JSON.stringify(initialUnlockedIds));
      }

      setInitialLoadComplete(true);
    } catch {
      setInitialLoadComplete(true);
    }
  }, [storageKey, initialUnlockedIds]);

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(viewedIds));
    } catch {}
  }, [viewedIds, storageKey]);

  const allAchievements = useMemo(() => getAllAchievements(), []);

  const unlockedAchievements = useMemo(() =>
    allAchievements.filter(achievement => unlockedIds.includes(achievement.id)),
    [allAchievements, unlockedIds]
  );

  const totalAchievements = allAchievements.length;
  const unlockedCount = unlockedIds.length;
  const completionPercentage = Math.round((unlockedCount / totalAchievements) * 100);

  const checkForNewAchievements = useCallback((stats: GameStats, upgrades: UserUpgrade[]) => {
    const newlyUnlocked = checkAchievements(stats, upgrades, unlockedIds);
    if (newlyUnlocked.length > 0) {
      const newIds = newlyUnlocked.map(a => a.id);
      setUnlockedIds(prev => [...prev, ...newIds]);
      const notViewed = newlyUnlocked.filter(a => !viewedIds.includes(a.id));
      setNewAchievements(prev => [...prev, ...notViewed]);
    }
  }, [unlockedIds, viewedIds]);

  const markAchievementAsViewed = useCallback((achievementId: number) => {
    setNewAchievements(prev => prev.filter(a => a.id !== achievementId));
    setViewedIds(prev => prev.includes(achievementId) ? prev : [...prev, achievementId]);
  }, []);

  const clearNewAchievements = useCallback(() => {
    setNewAchievements([]);
    setViewedIds(prev => {
      const allNew = newAchievements.map(a => a.id);
      return [...new Set([...prev, ...allNew])];
    });
  }, [newAchievements]);

  const resetAchievements = useCallback(() => {
    setUnlockedIds([]);
    setNewAchievements([]);
    setViewedIds([]);
    
    try {
      localStorage.removeItem(storageKey);
    } catch {}
  }, [storageKey]);

  useEffect(() => {
    if (newAchievements.length > 0) {
      const timer = setTimeout(() => {
        clearNewAchievements();
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [newAchievements, clearNewAchievements]);

  return {
    unlockedAchievements,
    newAchievements,
    allAchievements,
    checkForNewAchievements,
    markAchievementAsViewed,
    clearNewAchievements,
    resetAchievements,
    totalAchievements,
    unlockedCount,
    completionPercentage,
  };
};
