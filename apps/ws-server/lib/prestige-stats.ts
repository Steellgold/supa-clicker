import type { GameState, PrestigeStats } from "@clicker/game/types";

// Create initial prestige stats for a new prestige level
export const createPrestigeStats = (prestigeLevel: number): PrestigeStats => {
  return {
    prestige_level: prestigeLevel,
    start_time: Date.now(),
    end_time: 0,
    duration_seconds: 0,
    total_power_earned: 0,
    total_clicks: 0,
    upgrades_purchased: 0,
    power_spent_on_upgrades: 0,
    max_pps_reached: 0,
    max_ppc_reached: 0,
    final_upgrades: [],
    achievements_unlocked: []
  };
}

// Update current prestige stats during gameplay
export const updateCurrentPrestigeStats = (
  gameState: GameState,
  powerEarned: number = 0,
  clicks: number = 0,
  upgradePurchased: boolean = false,
  powerSpent: number = 0
): void => {
  // Update current prestige tracking
  if (powerEarned > 0) {
    gameState.current_prestige_clicks += clicks;
  }

  if (upgradePurchased) {
    gameState.current_prestige_upgrades_purchased += 1;
    gameState.current_prestige_power_spent += powerSpent;
  }

  // Update max values
  const lastPrestigeStats = gameState.prestige_stats[gameState.prestige_stats.length - 1];
  if (lastPrestigeStats && gameState.pps > (lastPrestigeStats.max_pps_reached || 0)) {
    lastPrestigeStats.max_pps_reached = gameState.pps;
  }

  if (
    gameState.ppc >
    ((gameState.prestige_stats[gameState.prestige_stats.length - 1]?.max_ppc_reached) ?? 0)
  ) {
    const lastPrestigeStats = gameState.prestige_stats[gameState.prestige_stats.length - 1];
    if (lastPrestigeStats) {
      lastPrestigeStats.max_ppc_reached = gameState.ppc;
    }
  }
}

// Finalize prestige stats when prestige is performed
export const finalizePrestigeStats = (gameState: GameState): PrestigeStats => {
  const currentStats = gameState.prestige_stats[gameState.prestige_stats.length - 1];
  if (!currentStats) {
    throw new Error("No current prestige stats found");
  }

  const now = Date.now();
  const durationSeconds = Math.floor((now - currentStats.start_time) / 1000);

  const finalizedStats: PrestigeStats = {
    ...currentStats,
    end_time: now,
    duration_seconds: durationSeconds,
    total_power_earned: gameState.lifetime_power - (
      gameState.prestige_stats.length > 1 && gameState.prestige_stats[gameState.prestige_stats.length - 2]
        ? gameState.prestige_stats[gameState.prestige_stats.length - 2]!.total_power_earned
        : 0
    ),
    total_clicks: gameState.current_prestige_clicks,
    upgrades_purchased: gameState.current_prestige_upgrades_purchased,
    power_spent_on_upgrades: gameState.current_prestige_power_spent,
    max_pps_reached: Math.max(currentStats.max_pps_reached, gameState.pps),
    max_ppc_reached: Math.max(currentStats.max_ppc_reached, gameState.ppc),
    final_upgrades: [...gameState.upgrades],
    achievements_unlocked: [...gameState.unlocked_achievements]
  };

  return finalizedStats;
}

// Initialize new prestige level stats
export const initializeNewPrestigeStats = (gameState: GameState): void => {
  const newPrestigeLevel = gameState.prestige_level;
  const newStats = createPrestigeStats(newPrestigeLevel);
  
  gameState.prestige_stats.push(newStats);
  gameState.current_prestige_start_time = Date.now();
  gameState.current_prestige_clicks = 0;
  gameState.current_prestige_upgrades_purchased = 0;
  gameState.current_prestige_power_spent = 0;
}

// Get prestige stats summary
export const getPrestigeStatsSummary = (gameState: GameState): {
  total_prestiges: number;
  total_time_played: number;
  total_power_earned: number;
  total_clicks: number;
  total_upgrades_purchased: number;
  average_prestige_duration: number;
  fastest_prestige: number;
  slowest_prestige: number;
  most_productive_prestige: number;
} => {
  const currentTime = Date.now();
  const currentSessionTime = Math.floor((currentTime - gameState.current_prestige_start_time) / 1000);
  
  // Calculate current session stats
  const currentSessionStats = {
    duration_seconds: currentSessionTime,
    total_power_earned: gameState.lifetime_power,
    total_clicks: gameState.lifetime_clicks,
    upgrades_purchased: gameState.upgrades.reduce((sum, upgrade) => sum + upgrade.level, 0),
    power_spent_on_upgrades: gameState.current_prestige_power_spent
  };

  if (gameState.prestige_stats.length === 0) {
    // No prestiges yet, return current session stats
    return {
      total_prestiges: 0,
      total_time_played: currentSessionStats.duration_seconds,
      total_power_earned: currentSessionStats.total_power_earned,
      total_clicks: currentSessionStats.total_clicks,
      total_upgrades_purchased: currentSessionStats.upgrades_purchased,
      average_prestige_duration: currentSessionStats.duration_seconds,
      fastest_prestige: currentSessionStats.duration_seconds,
      slowest_prestige: currentSessionStats.duration_seconds,
      most_productive_prestige: currentSessionStats.total_power_earned
    };
  }

  // Include current session in calculations
  const allStats = [...gameState.prestige_stats, currentSessionStats];
  
  const totalPrestiges = gameState.prestige_stats.length;
  const totalTimePlayed = allStats.reduce((sum, stats) => sum + stats.duration_seconds, 0);
  const totalPowerEarned = allStats.reduce((sum, stats) => sum + stats.total_power_earned, 0);
  const totalClicks = allStats.reduce((sum, stats) => sum + stats.total_clicks, 0);
  const totalUpgradesPurchased = allStats.reduce((sum, stats) => sum + stats.upgrades_purchased, 0);

  const durations = allStats.map(stats => stats.duration_seconds).filter(d => d > 0);
  const averagePrestigeDuration = durations.length > 0 ? Math.floor(durations.reduce((sum, d) => sum + d, 0) / durations.length) : 0;
  const fastestPrestige = durations.length > 0 ? Math.min(...durations) : 0;
  const slowestPrestige = durations.length > 0 ? Math.max(...durations) : 0;

  const powerEarned = allStats.map(stats => stats.total_power_earned);
  const mostProductivePrestige = powerEarned.length > 0 ? Math.max(...powerEarned) : 0;

  return {
    total_prestiges: totalPrestiges,
    total_time_played: totalTimePlayed,
    total_power_earned: totalPowerEarned,
    total_clicks: totalClicks,
    total_upgrades_purchased: totalUpgradesPurchased,
    average_prestige_duration: averagePrestigeDuration,
    fastest_prestige: fastestPrestige,
    slowest_prestige: slowestPrestige,
    most_productive_prestige: mostProductivePrestige
  };
}

// Get detailed stats for a specific prestige level
export const getPrestigeLevelStats = (gameState: GameState, prestigeLevel: number): PrestigeStats | null => {
  return gameState.prestige_stats.find(stats => stats.prestige_level === prestigeLevel) || null;
}

// Format duration in human readable format
export const formatDuration = (seconds: number): string => {
  if (seconds < 60) {
    return `${seconds}s`;
  } else if (seconds < 3600) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  } else {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  }
}

// Get prestige efficiency score (power earned per second)
export const getPrestigeEfficiency = (stats: PrestigeStats): number => {
  if (stats.duration_seconds === 0) return 0;
  return stats.total_power_earned / stats.duration_seconds;
}

// Compare two prestige runs
export const comparePrestigeRuns = (stats1: PrestigeStats, stats2: PrestigeStats): {
  faster: PrestigeStats;
  moreEfficient: PrestigeStats;
  moreProductive: PrestigeStats;
} => {
  const efficiency1 = getPrestigeEfficiency(stats1);
  const efficiency2 = getPrestigeEfficiency(stats2);

  return {
    faster: stats1.duration_seconds < stats2.duration_seconds ? stats1 : stats2,
    moreEfficient: efficiency1 > efficiency2 ? stats1 : stats2,
    moreProductive: stats1.total_power_earned > stats2.total_power_earned ? stats1 : stats2
  };
} 