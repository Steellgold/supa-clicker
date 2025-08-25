import type { Achievement, GameState } from "@clicker/game/types";

const SESSION_KEY = "supa-clicker-session";
const SESSION_DURATION = 5 * 60 * 1000; // 5 minutes

interface SessionData {
  startTime: number;
  currentPower: number;
  upgradesPurchased: number;
  clicks: number;
}

const getSessionData = (): SessionData => {
  if (typeof window === "undefined") {
    return { startTime: Date.now(), currentPower: 0, upgradesPurchased: 0, clicks: 0 };
  }

  try {
    const stored = localStorage.getItem(SESSION_KEY);
    if (!stored) {
      return { startTime: Date.now(), currentPower: 0, upgradesPurchased: 0, clicks: 0 };
    }

    const sessionData: SessionData = JSON.parse(stored);
    const now = Date.now();
    
    if (now - sessionData.startTime < SESSION_DURATION) {
      return sessionData;
    } else {
      const newSession = { startTime: now, currentPower: 0, upgradesPurchased: 0, clicks: 0 };
      localStorage.setItem(SESSION_KEY, JSON.stringify(newSession));
      return newSession;
    }
  } catch (error) {
    console.error("Error reading session data:", error);
    return { startTime: Date.now(), currentPower: 0, upgradesPurchased: 0, clicks: 0 };
  }
};

const updateSessionData = (updates: Partial<SessionData>, isRelative: boolean = false) => {
  if (typeof window === "undefined") return;

  try {
    const currentSession = getSessionData();
    let updatedSession: SessionData;
    
    if (isRelative) {
      // For relative updates, add to current values
      updatedSession = {
        ...currentSession,
        currentPower: currentSession.currentPower + (updates.currentPower || 0),
        upgradesPurchased: currentSession.upgradesPurchased + (updates.upgradesPurchased || 0),
        clicks: currentSession.clicks + (updates.clicks || 0),
      };
    } else {
      // For absolute updates, replace values
      updatedSession = { ...currentSession, ...updates };
    }
    
    localStorage.setItem(SESSION_KEY, JSON.stringify(updatedSession));
  } catch (error) {
    console.error("Error updating session data:", error);
  }
};

// Export functions for external use
export const getCurrentSessionData = getSessionData;
export const updateCurrentSessionData = updateSessionData;

// Reset session data (useful for testing or manual reset)
export const resetSessionData = () => {
  if (typeof window === "undefined") return;
  
  try {
    const newSession = { startTime: Date.now(), currentPower: 0, upgradesPurchased: 0, clicks: 0 };
    localStorage.setItem(SESSION_KEY, JSON.stringify(newSession));
    console.log("Session data reset");
  } catch (error) {
    console.error("Error resetting session data:", error);
  }
};

if (typeof window !== "undefined") {
  const handleBeforeUnload = () => {
    localStorage.removeItem(SESSION_KEY);
  };

  window.addEventListener("beforeunload", handleBeforeUnload);
  
  const handleVisibilityChange = () => {
    if (document.visibilityState === "hidden") {
      setTimeout(() => {
        if (document.visibilityState === "hidden") {
          resetSessionData();
        }
      }, 5000); // 5 second delay
    }
  };
  
  document.addEventListener("visibilitychange", handleVisibilityChange);
}

export const calculateAchievementProgress = (
  achievement: Achievement, 
  gameState: GameState | null
): number => {
  if (!gameState) return 0;

  if (gameState.unlocked_achievements.includes(achievement.id)) {
    return 100;
  }

  if (achievement.category === "clicking") {
    const clickTargets = [1, 100, 1000, 10000, 100000, 1000000, 10000000];
    const current = gameState.lifetime_clicks;
    
    const targetIndex = achievement.id - 1;
    if (targetIndex >= 0 && targetIndex < clickTargets.length) {
      const target = clickTargets[targetIndex];
      return Math.min(100, Math.floor((current / target) * 100));
    }
  }

  if (achievement.category === "power") {
    const powerTargets = [1000, 100000, 1000000, 1000000000, 1000000000000];
    const current = gameState.power;
    
    const targetIndex = achievement.id - 8;
    if (targetIndex >= 0 && targetIndex < powerTargets.length) {
      const target = powerTargets[targetIndex];
      return Math.min(100, Math.floor((current / target) * 100));
    }
  }

  if (achievement.category === "speed") {
    const speedTargets = [1000, 100000, 10000000, 1000000000];
    const current = gameState.pps;
    
    const targetIndex = achievement.id - 13;
    if (targetIndex >= 0 && targetIndex < speedTargets.length) {
      const target = speedTargets[targetIndex];
      return Math.min(100, Math.floor((current / target) * 100));
    }
  }

  if (achievement.category === "prestige") {
    const prestigeTargets = [1, 5, 10, 25, 50];
    const current = gameState.prestige_level;
    
    const targetIndex = achievement.id - 22;
    if (targetIndex >= 0 && targetIndex < prestigeTargets.length) {
      const target = prestigeTargets[targetIndex];
      return Math.min(100, Math.floor((current / target) * 100));
    }
  }

  if (achievement.category === "milestone") {
    const milestoneTargets = [1000, 1000000, 1000000000, 1000000000000];
    const current = gameState.total_power;
    
    const targetIndex = achievement.id - 42;
    if (targetIndex >= 0 && targetIndex < milestoneTargets.length) {
      const target = milestoneTargets[targetIndex];
      return Math.min(100, Math.floor((current / target) * 100));
    }
  }

  if (achievement.category === "efficiency") {
    const efficiencyTargets = [100, 1000, 10000];
    const current = gameState.ppc;
    
    const targetIndex = achievement.id - 30;
    if (targetIndex >= 0 && targetIndex < efficiencyTargets.length) {
      const target = efficiencyTargets[targetIndex];
      return Math.min(100, Math.floor((current / target) * 100));
    }
  }

  if (achievement.category === "upgrades") {
    const upgradeTargets = [1, 5, 15, 30, 50];
    const current = gameState.upgrades.filter(u => u.level > 0).length;
    
    const targetIndex = achievement.id - 17;
    if (targetIndex >= 0 && targetIndex < upgradeTargets.length) {
      const target = upgradeTargets[targetIndex];
      return Math.min(100, Math.floor((current / target) * 100));
    }
  }

  if (achievement.category === "time") {
    const timeTargets = [3600000, 21600000, 86400000];
    const current = Date.now() - gameState.current_prestige_start_time;
    
    const targetIndex = achievement.id - 27;
    if (targetIndex >= 0 && targetIndex < timeTargets.length) {
      const target = timeTargets[targetIndex];
      return Math.min(100, Math.floor((current / target) * 100));
    }
  }

  if (["special", "tech", "combo", "challenge"].includes(achievement.category)) {
    return gameState.unlocked_achievements.includes(achievement.id) ? 100 : 0;
  }

  if (achievement.category === "session") {
    const sessionTargets = [100000, 10000000, 20, 1000];
    const sessionData = getSessionData();
    
    const targetIndex = achievement.id - 33;
    if (targetIndex >= 0 && targetIndex < sessionTargets.length) {
      const target = sessionTargets[targetIndex];
      let current = 0;
      
      if (achievement.id === 33 || achievement.id === 34) {
        current = sessionData.currentPower;
      } else if (achievement.id === 35) {
        current = sessionData.upgradesPurchased;
      } else if (achievement.id === 36) {
        current = sessionData.clicks;
      }
      
      return Math.min(100, Math.floor((current / target) * 100));
    }
  }

  return 0;
};

export const getAchievementProgressValues = (
  achievement: Achievement, 
  gameState: GameState | null
): { current: number; target: number; unit: string } | null => {
  if (!gameState) return null;

  if (achievement.category === "clicking") {
    const clickTargets = [1, 100, 1000, 10000, 100000, 1000000, 10000000];
    const current = gameState.lifetime_clicks;
    
    const targetIndex = achievement.id - 1;
    if (targetIndex >= 0 && targetIndex < clickTargets.length) {
      return {
        current,
        target: clickTargets[targetIndex],
        unit: "clicks"
      };
    }
  }

  if (achievement.category === "power") {
    const powerTargets = [1000, 100000, 1000000, 1000000000, 1000000000000];
    const current = gameState.power;
    
    const targetIndex = achievement.id - 8;
    if (targetIndex >= 0 && targetIndex < powerTargets.length) {
      return {
        current,
        target: powerTargets[targetIndex],
        unit: "power"
      };
    }
  }

  if (achievement.category === "speed") {
    const speedTargets = [1000, 100000, 10000000, 1000000000];
    const current = gameState.pps;
    
    const targetIndex = achievement.id - 13;
    if (targetIndex >= 0 && targetIndex < speedTargets.length) {
      return {
        current,
        target: speedTargets[targetIndex],
        unit: "pps"
      };
    }
  }

  if (achievement.category === "prestige") {
    const prestigeTargets = [1, 5, 10, 25, 50];
    const current = gameState.prestige_level;
    
    const targetIndex = achievement.id - 22;
    if (targetIndex >= 0 && targetIndex < prestigeTargets.length) {
      return {
        current,
        target: prestigeTargets[targetIndex],
        unit: "prestige"
      };
    }
  }

  if (achievement.category === "milestone") {
    const milestoneTargets = [1000, 1000000, 1000000000, 1000000000000];
    const current = gameState.total_power;
    
    const targetIndex = achievement.id - 42;
    if (targetIndex >= 0 && targetIndex < milestoneTargets.length) {
      return {
        current,
        target: milestoneTargets[targetIndex],
        unit: "total power"
      };
    }
  }

  if (achievement.category === "efficiency") {
    const efficiencyTargets = [100, 1000, 10000];
    const current = gameState.ppc;
    
    const targetIndex = achievement.id - 30;
    if (targetIndex >= 0 && targetIndex < efficiencyTargets.length) {
      return {
        current,
        target: efficiencyTargets[targetIndex],
        unit: "ppc"
      };
    }
  }

  if (achievement.category === "upgrades") {
    const upgradeTargets = [1, 5, 15, 30, 50];
    const current = gameState.upgrades.filter(u => u.level > 0).length;
    
    const targetIndex = achievement.id - 17;
    if (targetIndex >= 0 && targetIndex < upgradeTargets.length) {
      return {
        current,
        target: upgradeTargets[targetIndex],
        unit: "upgrades"
      };
    }
  }

  if (achievement.category === "time") {
    const timeTargets = [3600000, 21600000, 86400000];
    const current = Date.now() - gameState.current_prestige_start_time;
    
    const targetIndex = achievement.id - 27;
    if (targetIndex >= 0 && targetIndex < timeTargets.length) {
      return {
        current,
        target: timeTargets[targetIndex],
        unit: "ms"
      };
    }
  }

  if (["special", "tech", "combo", "challenge"].includes(achievement.category)) {
    return null;
  }

  if (achievement.category === "session") {
    const sessionTargets = [100000, 10000000, 20, 1000];
    const sessionUnits = ["power", "power", "upgrades", "clicks"];
    const sessionData = getSessionData();
    
    const targetIndex = achievement.id - 33;
    if (targetIndex >= 0 && targetIndex < sessionTargets.length) {
      const target = sessionTargets[targetIndex];
      let current = 0;
      
      if (achievement.id === 33 || achievement.id === 34) {
        current = sessionData.currentPower;
      } else if (achievement.id === 35) {
        current = sessionData.upgradesPurchased;
      } else if (achievement.id === 36) {
        current = sessionData.clicks;
      }
      
      return {
        current,
        target,
        unit: sessionUnits[targetIndex]
      };
    }
  }

  return null;
}; 

export const debugSessionData = () => {
  const sessionData = getSessionData();
  console.log("Current session data:", sessionData);
  return sessionData;
}; 