import { LeaderboardEntry, LeaderboardResponse, LeaderboardType, UserLeaderboardStats } from "@/type/leaderboard";
import { useCallback, useEffect, useState } from "react";

export const useLeaderboard = (type: LeaderboardType = "total_power", limit: number = 50) => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLeaderboard = useCallback(async (userId?: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        type,
        limit: limit.toString(),
      });

      if (userId) {
        params.append("userId", userId);
      }

      const response = await fetch(`/api/leaderboard?${params}`);
      
      if (!response.ok) {
        throw new Error("Failed to fetch leaderboard");
      }

      const data: LeaderboardResponse = await response.json();
      setLeaderboard(data.leaderboard);
      
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError(errorMessage);
      console.error("Error fetching leaderboard:", err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [type, limit]);

  const updateLeaderboard = useCallback(async (stats: UserLeaderboardStats) => {
    try {
      const response = await fetch("/api/leaderboard", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(stats),
      });

      if (!response.ok) {
        throw new Error("Failed to update leaderboard");
      }

      return await response.json();
    } catch (err) {
      console.error("Error updating leaderboard:", err);
      throw err;
    }
  }, []);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  return {
    leaderboard,
    isLoading,
    error,
    fetchLeaderboard,
    updateLeaderboard,
    refresh: () => fetchLeaderboard(),
  };
};

export const useUserLeaderboardPosition = (userId: string | null, type: LeaderboardType = "total_power") => {
  const [position, setPosition] = useState<number | null>(null);
  const [userData, setUserData] = useState<LeaderboardEntry | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchUserPosition = useCallback(async () => {
    if (!userId) {
      setPosition(null);
      setUserData(null);
      return;
    }

    setIsLoading(true);

    try {
      const params = new URLSearchParams({
        type,
        limit: "1",
        userId,
      });

      const response = await fetch(`/api/leaderboard?${params}`);
      
      if (!response.ok) {
        throw new Error("Failed to fetch user position");
      }

      const data: LeaderboardResponse = await response.json();
      setPosition(data.userPosition);
      setUserData(data.userData);
    } catch (err) {
      console.error("Error fetching user position:", err);
      setPosition(null);
      setUserData(null);
    } finally {
      setIsLoading(false);
    }
  }, [userId, type]);

  useEffect(() => {
    fetchUserPosition();
  }, [fetchUserPosition]);

  return {
    position,
    userData,
    isLoading,
    refresh: fetchUserPosition,
  };
};