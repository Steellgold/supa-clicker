"use client";

import {
  calculateBulkUpgradeCost,
  calculateUpgradeCost,
  createInitialGameState,
  getUpgradeById,
  recalculateStats,
} from "@/lib/game";
import { checkAchievements, getAllAchievements } from "@/lib/game/achievements";
import {
  finalizePrestigeStats,
  fixPrestigeStats,
  initializeNewPrestigeStats,
  updateCurrentPrestigeStats,
} from "@/lib/game/prestige-stats";
import { updateCurrentSessionData } from "@/lib/utils/achievement-progress";
import type { Achievement, GameState } from "@clicker/game/types";
import { canPrestige, performPrestige as buildPrestigedState } from "@clicker/game/utils";
import { useCallback, useEffect, useRef, useState } from "react";

const STORAGE_KEY = "supa-clicker-game-state";
const SAVE_VERSION = 1;
const TICK_INTERVAL = 1000;
const SAVE_THROTTLE = 2000;

type SessionCounters = {
  startTime: number;
  currentPower: number;
  upgradesPurchased: number;
  clicks: number;
};

const createSessionCounters = (): SessionCounters => ({
  startTime: Date.now(),
  currentPower: 0,
  upgradesPurchased: 0,
  clicks: 0,
});

const clone = (state: GameState): GameState => JSON.parse(JSON.stringify(state));

const loadGameState = (): GameState => {
  const fallback = createInitialGameState();

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return fallback;

    const parsed = JSON.parse(raw) as { version?: number; gameState?: Partial<GameState> };
    if (!parsed?.gameState) return fallback;

    const stored = { ...fallback, ...parsed.gameState } as GameState;
    if (!Array.isArray(stored.upgrades) || !Array.isArray(stored.unlocked_achievements)) {
      return fallback;
    }
    if (!Array.isArray(stored.prestige_stats) || stored.prestige_stats.length === 0) {
      stored.prestige_stats = fallback.prestige_stats;
    }

    recalculateStats(stored);
    fixPrestigeStats(stored);

    return stored;
  } catch {
    return fallback;
  }
};

export const useGameLocal = () => {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [unlocks, setUnlocks] = useState<Achievement[]>([]);

  const stateRef = useRef<GameState | null>(null);
  const sessionRef = useRef<SessionCounters>(createSessionCounters());
  const lastSaveRef = useRef(0);

  const persist = useCallback((force = false) => {
    const current = stateRef.current;
    if (!current) return;

    const now = Date.now();
    if (!force && now - lastSaveRef.current < SAVE_THROTTLE) return;
    lastSaveRef.current = now;

    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ version: SAVE_VERSION, gameState: current })
      );
    } catch {
      setError("Couldn't save your progress (storage unavailable)");
    }
  }, []);

  const collectUnlocks = useCallback((draft: GameState): Achievement[] => {
    const session = sessionRef.current;
    const newlyUnlocked = checkAchievements(draft, session.startTime, {
      session_current_power: session.currentPower,
      session_upgrades_purchased: session.upgradesPurchased,
      session_clicks: session.clicks,
    });

    for (const achievement of newlyUnlocked) {
      if (!draft.unlocked_achievements.includes(achievement.id)) {
        draft.unlocked_achievements.push(achievement.id);
      }
    }

    return newlyUnlocked;
  }, []);

  const commit = useCallback(
    (mutate: (draft: GameState) => void) => {
      const current = stateRef.current;
      if (!current) return;

      const draft = clone(current);
      mutate(draft);
      recalculateStats(draft);

      const newlyUnlocked = collectUnlocks(draft);
      if (newlyUnlocked.length > 0) {
        setUnlocks((prev) => [...prev, ...newlyUnlocked]);
      }

      stateRef.current = draft;
      setGameState(draft);
      persist();
    },
    [collectUnlocks, persist]
  );

  useEffect(() => {
    const loaded = loadGameState();
    stateRef.current = loaded;
    sessionRef.current = createSessionCounters();
    setGameState(loaded);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const current = stateRef.current;
      if (!current || current.pps <= 0) return;

      commit((draft) => {
        const reward = draft.pps;
        draft.power += reward;
        draft.total_power += reward;
        draft.lifetime_power += reward;
        updateCurrentPrestigeStats(draft, reward, 0);
        sessionRef.current.currentPower += reward;
      });
    }, TICK_INTERVAL);

    return () => clearInterval(interval);
  }, [commit]);

  useEffect(() => {
    const saveNow = () => persist(true);

    window.addEventListener("pagehide", saveNow);
    document.addEventListener("visibilitychange", saveNow);

    return () => {
      window.removeEventListener("pagehide", saveNow);
      document.removeEventListener("visibilitychange", saveNow);
    };
  }, [persist]);

  const handleClick = useCallback(() => {
    commit((draft) => {
      const powerGained = draft.ppc;
      draft.power += powerGained;
      draft.total_power += powerGained;
      draft.lifetime_power += powerGained;
      draft.lifetime_clicks += 1;
      updateCurrentPrestigeStats(draft, powerGained, 1);

      sessionRef.current.clicks += 1;
      sessionRef.current.currentPower += powerGained;
    });

    updateCurrentSessionData({ clicks: 1, currentPower: stateRef.current?.ppc || 1 }, true);
  }, [commit]);

  const buyUpgrade = useCallback(
    (upgradeId: number, quantity: number = 1, isBulk: boolean = false) => {
      const upgrade = getUpgradeById(upgradeId);
      if (!upgrade) {
        setError("Invalid upgrade");
        return;
      }

      commit((draft) => {
        let owned = draft.upgrades.find(u => u.id === upgradeId);
        if (!owned) {
          owned = { id: upgradeId, level: 0 };
          draft.upgrades.push(owned);
        }

        if (upgrade.max && owned.level >= upgrade.max) {
          setError("Maximum purchases reached for this upgrade");
          return;
        }

        if (draft.power < 0) {
          setError("Invalid game state");
          return;
        }

        let totalCost = 0;
        let canBuy = 0;

        if (isBulk && quantity > 1) {
          const bulk = calculateBulkUpgradeCost(upgrade, owned.level, quantity, draft.power);
          totalCost = bulk.totalCost;
          canBuy = bulk.actualQuantity;
        } else {
          const cost = calculateUpgradeCost(upgrade, owned.level);
          if (cost > 0 && Number.isFinite(cost) && draft.power >= cost) {
            totalCost = cost;
            canBuy = 1;
          }
        }

        if (canBuy === 0) {
          setError("Not enough power");
          return;
        }

        draft.power -= totalCost;
        owned.level += canBuy;
        updateCurrentPrestigeStats(draft, 0, 0, true, totalCost);
        sessionRef.current.upgradesPurchased += canBuy;
      });

      updateCurrentSessionData({ upgradesPurchased: quantity }, true);
    },
    [commit]
  );

  const resetGame = useCallback(() => {
    if (!window.confirm("Are you sure you want to reset your game? This action cannot be undone.")) {
      return;
    }

    sessionRef.current = createSessionCounters();
    setUnlocks([]);

    commit((draft) => {
      Object.assign(draft, createInitialGameState());
    });

    updateCurrentSessionData({ currentPower: 0, upgradesPurchased: 0, clicks: 0 }, false);
  }, [commit]);

  const performPrestige = useCallback(() => {
    commit((draft) => {
      if (!canPrestige(draft)) {
        setError("Prestige requirements not met");
        return;
      }

      try {
        finalizePrestigeStats(draft);
        Object.assign(draft, buildPrestigedState(draft));
        initializeNewPrestigeStats(draft);

        const currentStats = draft.prestige_stats[draft.prestige_stats.length - 1];
        if (currentStats) {
          currentStats.max_ppc_reached = draft.ppc;
          currentStats.max_pps_reached = draft.pps;
        }
      } catch {
        setError("Prestige failed");
      }
    });
  }, [commit]);

  const consumeUnlocks = useCallback(() => setUnlocks([]), []);

  return {
    gameState,
    isLoading,
    error,
    achievements: getAllAchievements(),
    unlocks,

    handleClick,
    buyUpgrade,
    resetGame,
    performPrestige,

    canPerformAction: () => !isLoading,
    clearError: () => setError(null),
    consumeUnlocks,
  };
};
