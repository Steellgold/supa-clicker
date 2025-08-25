import type { PrestigeStats } from "@clicker/game/types";
import { useEffect, useState, useCallback } from "react";
import { useGame } from "./use-game";

export interface PrestigeStatsSummary {
  total_prestiges: number;
  total_time_played: number;
  total_power_earned: number;
  total_clicks: number;
  total_upgrades_purchased: number;
  average_prestige_duration: number;
  fastest_prestige: number;
  slowest_prestige: number;
  most_productive_prestige: number;
}

export const usePrestigeStats = () => {
  const { socketRef, isConnected } = useGame();
  const [summary, setSummary] = useState<PrestigeStatsSummary | null>(null);
  const [currentStats, setCurrentStats] = useState<PrestigeStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const socket = socketRef.current;
    if (!socket || !isConnected) return;

    const handlePrestigeStatsSummary = (statsSummary: PrestigeStatsSummary) => {
      setSummary(statsSummary);
      setIsLoading(false);
    };

    const handlePrestigeStats = (stats: PrestigeStats | null) => {
      setCurrentStats(stats);
      setIsLoading(false);
    };

    socket.on("prestigeStatsSummary", handlePrestigeStatsSummary);
    socket.on("prestigeStats", handlePrestigeStats);

    // Request summary on mount
    setIsLoading(true);
    socket.emit("getPrestigeStatsSummary");

    return () => {
      socket.off("prestigeStatsSummary", handlePrestigeStatsSummary);
      socket.off("prestigeStats", handlePrestigeStats);
    };
  }, [socketRef, isConnected]);

  const getPrestigeLevelStats = useCallback((prestigeLevel: number) => {
    const socket = socketRef.current;
    if (socket && isConnected) {
      setIsLoading(true);
      socket.emit("getPrestigeStats", prestigeLevel);
    }
  }, [isConnected]);

  const refreshSummary = useCallback(() => {
    const socket = socketRef.current;
    if (socket && isConnected) {
      setIsLoading(true);
      socket.emit("getPrestigeStatsSummary");
    }
  }, [isConnected]);

  return {
    summary,
    currentStats,
    isLoading,
    getPrestigeLevelStats,
    refreshSummary,
  };
}; 