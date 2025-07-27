import type { Achievement, GameState } from "@clicker/game/types";

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
    let current = 0;
    
    const targetIndex = achievement.id - 33;
    if (targetIndex >= 0 && targetIndex < sessionTargets.length) {
      const target = sessionTargets[targetIndex];
      
      if (achievement.id === 33 || achievement.id === 34) {
        current = gameState.current_prestige_power_earned || 0;
      } else if (achievement.id === 35) {
        current = gameState.current_prestige_upgrades_purchased || 0;
      } else if (achievement.id === 36) {
        current = gameState.current_prestige_clicks || 0;
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
    
    const targetIndex = achievement.id - 33;
    if (targetIndex >= 0 && targetIndex < sessionTargets.length) {
      const target = sessionTargets[targetIndex];
      let current = 0;
      
      if (achievement.id === 33 || achievement.id === 34) {
        current = gameState.current_prestige_power_earned || 0;
      } else if (achievement.id === 35) {
        current = gameState.current_prestige_upgrades_purchased || 0;
      } else if (achievement.id === 36) {
        current = gameState.current_prestige_clicks || 0;
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