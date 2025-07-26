import { LeaderboardEntry, LeaderboardResponse, LeaderboardType, UserLeaderboardStats } from "@clicker/game/types";
import { useCallback, useEffect, useState } from "react";
import { useGame } from "@/lib/hooks/use-game";
import { useAuth } from "@/lib/auth/auth-context";

export const useLeaderboard = (type: LeaderboardType = "total_power", limit: number = 50) => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const gameHook = useGame(user?.id);

  const fetchLeaderboard = useCallback(async (userId?: string) => {
    const socket = gameHook.socketRef.current;
    if (!socket || !gameHook.isConnected) {
      setError("Not connected to server");
      setIsLoading(false);
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      socket.emit("getLeaderboard", { type, limit, userId });
      return { leaderboard: [], userPosition: null, userData: null, type };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError(errorMessage);
      console.error("Error fetching leaderboard:", err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [gameHook.socketRef, gameHook.isConnected, type, limit]);

  const updateLeaderboard = useCallback(async (stats: UserLeaderboardStats) => {
    const socket = gameHook.socketRef.current;
    if (!socket || !gameHook.isConnected) {
      throw new Error("Not connected to server");
    }

    try {
      socket.emit("updateLeaderboard", stats);
      return {
        success: true,
      };
    } catch (err) {
      console.error("Error updating leaderboard:", err);
      throw err;
    }
  }, [gameHook.socketRef, gameHook.isConnected]);

  useEffect(() => {
    const socket = gameHook.socketRef.current;
    if (socket && gameHook.isConnected) {
      const handleLeaderboardUpdate = (data: LeaderboardResponse) => {
        setLeaderboard(data.leaderboard);
        setIsLoading(false);
        setError(null);
      };

      const handleLeaderboardError = (message: string) => {
        setError(message);
        setIsLoading(false);
      };

      socket.on("leaderboardUpdate", handleLeaderboardUpdate);
      socket.on("leaderboardError", handleLeaderboardError);

      fetchLeaderboard();

      return () => {
        socket.off("leaderboardUpdate", handleLeaderboardUpdate);
        socket.off("leaderboardError", handleLeaderboardError);
      };
    }
  }, [gameHook.isConnected, fetchLeaderboard]);

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
  const gameHook = useGame(userId || undefined);

  const fetchUserPosition = useCallback(async () => {
    const socket = gameHook.socketRef.current;
    if (!userId || !socket || !gameHook.isConnected) {
      setPosition(null);
      setUserData(null);
      return;
    }

    setIsLoading(true);

    try {
      socket.emit("getUserLeaderboardPosition", { type, userId });
    } catch (err) {
      console.error("Error fetching user position:", err);
      setPosition(null);
      setUserData(null);
    } finally {
      setIsLoading(false);
    }
  }, [userId, type, gameHook.socketRef, gameHook.isConnected]);

  useEffect(() => {
    const socket = gameHook.socketRef.current;
    if (socket && gameHook.isConnected && userId) {
      const handleUserPositionUpdate = (data: { position: number; userData: LeaderboardEntry | null }) => {
        setPosition(data.position);
        setUserData(data.userData);
        setIsLoading(false);
      };

      const handleUserPositionError = (message: string) => {
        console.error("User position error:", message);
        setPosition(null);
        setUserData(null);
        setIsLoading(false);
      };

      socket.on("userPositionUpdate", handleUserPositionUpdate);
      socket.on("userPositionError", handleUserPositionError);

      fetchUserPosition();

      return () => {
        socket.off("userPositionUpdate", handleUserPositionUpdate);
        socket.off("userPositionError", handleUserPositionError);
      };
    }
  }, [gameHook.isConnected, userId, fetchUserPosition]);

  return {
    position,
    userData,
    isLoading,
    refresh: fetchUserPosition,
  };
};