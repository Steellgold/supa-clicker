import { useAuth } from "@/lib/auth/auth-context";
import { useGame } from "@/lib/hooks/use-game";
import { LeaderboardEntry, LeaderboardResponse, LeaderboardType, UserLeaderboardStats } from "@clicker/game/types";
import { useCallback, useEffect, useRef, useState } from "react";

export const useLeaderboard = (type: LeaderboardType = "total_power", limit: number = 50) => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const gameHook = useGame(user?.id);
  
  const lastRequestTime = useRef<number>(0);
  const lastSuccessfulRequestTime = useRef<number>(0);
  const CACHE_TTL = 10000; // 10 seconds
  const isRequestPending = useRef<boolean>(false);
  const typeRef = useRef<LeaderboardType>(type);
  const limitRef = useRef<number>(limit);
  const lastTypeRef = useRef<LeaderboardType>(type);

  // Update refs when props change
  useEffect(() => {
    typeRef.current = type;
    limitRef.current = limit;
  }, [type, limit]);

  const fetchLeaderboard = useCallback(async (userId?: string, forceRefresh: boolean = false) => {
    const socket = gameHook.socketRef.current;
    if (!socket || !gameHook.isReady) {
      setError("Not connected to server");
      setIsLoading(false);
      return null;
    }

    const now = Date.now();
    const typeChanged = lastTypeRef.current !== typeRef.current;
    
    // Force refresh if type changed or if explicitly requested
    if (typeChanged) {
      console.log(`[LEADERBOARD] Type changed from ${lastTypeRef.current} to ${typeRef.current}, forcing refresh`);
      forceRefresh = true;
      lastTypeRef.current = typeRef.current;
    }
    
    if (!forceRefresh && now - lastSuccessfulRequestTime.current < CACHE_TTL) {
      console.log("[LEADERBOARD] Request throttled, using cached data");
      return { leaderboard: [], userPosition: null, userData: null, type: typeRef.current };
    }

    // Reset pending state if it's been too long (timeout protection)
    if (isRequestPending.current && now - lastRequestTime.current > 10000) {
      console.log("[LEADERBOARD] Request timeout, resetting pending state");
      isRequestPending.current = false;
    }

    if (isRequestPending.current && !forceRefresh) {
      console.log("[LEADERBOARD] Request already pending, skipping");
      return { leaderboard: [], userPosition: null, userData: null, type: typeRef.current };
    }

    setIsLoading(true);
    setError(null);

    lastRequestTime.current = now;
    isRequestPending.current = true;

    // Add timeout to reset pending state
    const timeoutId = setTimeout(() => {
      if (isRequestPending.current) {
        console.log("[LEADERBOARD] Request timeout, resetting pending state");
        isRequestPending.current = false;
        setIsLoading(false);
        setError("Request timeout");
      }
    }, 10000);

    try {
      console.log(`[LEADERBOARD] Sending request for type: ${typeRef.current}, limit: ${limitRef.current}, forceRefresh: ${forceRefresh}`);
      const requestData = { type: typeRef.current, limit: limitRef.current, userId };
      console.log(`[LEADERBOARD] Request data:`, requestData);
      console.log(`[LEADERBOARD] Socket ID:`, socket.id, `Connected:`, socket.connected);
      
      socket.emit("getLeaderboard", requestData);
      console.log(`[LEADERBOARD] Request sent successfully`);
      return { leaderboard: [], userPosition: null, userData: null, type: typeRef.current };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError(errorMessage);
      console.error("Error fetching leaderboard:", err);
      isRequestPending.current = false;
      clearTimeout(timeoutId);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [gameHook.socketRef, gameHook.isReady]); // Removed type and limit from dependencies

  const updateLeaderboard = useCallback(async (stats: UserLeaderboardStats) => {
    const socket = gameHook.socketRef.current;
    if (!socket || !gameHook.isReady) {
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
  }, [gameHook.socketRef, gameHook.isReady]);

  useEffect(() => {
    const socket = gameHook.socketRef.current;
    if (socket && gameHook.isReady) {
      const handleLeaderboardUpdate = (data: LeaderboardResponse) => {
        console.log(`[LEADERBOARD] Received update for type: ${data.type}, entries: ${data.leaderboard.length}`);
        console.log(`[LEADERBOARD] First entry received:`, data.leaderboard[0] ? `${data.leaderboard[0].username} (${data.leaderboard[0].user_id})` : 'None');
        console.log(`[LEADERBOARD] Current type ref: ${typeRef.current}, received type: ${data.type}`);
        
        // Only update if the received data matches our current type
        if (data.type === typeRef.current) {
          setLeaderboard(data.leaderboard);
          setIsLoading(false);
          setError(null);
          lastSuccessfulRequestTime.current = Date.now();
          isRequestPending.current = false;
          console.log(`[LEADERBOARD] Updated leaderboard state for type: ${data.type}`);
        } else {
          console.log(`[LEADERBOARD] Ignoring update for type ${data.type} (current: ${typeRef.current})`);
        }
      };

      const handleLeaderboardError = (message: string) => {
        console.error("[LEADERBOARD] Error received:", message);
        setError(message);
        setIsLoading(false);
        isRequestPending.current = false;
      };

      socket.on("leaderboardUpdate", handleLeaderboardUpdate);
      socket.on("leaderboardError", handleLeaderboardError);

      // Only fetch if we haven't made a request recently or if type changed
      const now = Date.now();
      const typeChanged = lastTypeRef.current !== typeRef.current;
      
      if (typeChanged || now - lastSuccessfulRequestTime.current >= CACHE_TTL) {
        const timer = setTimeout(() => {
          console.log(`[LEADERBOARD] Triggering fetch for type: ${typeRef.current}, typeChanged: ${typeChanged}`);
          // Use the current socket reference directly instead of calling fetchLeaderboard
          const currentSocket = gameHook.socketRef.current;
          if (currentSocket && gameHook.isReady) {
            const requestData = { type: typeRef.current, limit: limitRef.current, userId: user?.id };
            console.log(`[LEADERBOARD] Sending request for type: ${typeRef.current}, limit: ${limitRef.current}`);
            console.log(`[LEADERBOARD] Socket connected:`, currentSocket.connected, `Socket ID:`, currentSocket.id);
            currentSocket.emit("getLeaderboard", requestData);
          } else {
            console.log(`[LEADERBOARD] Cannot send request - socket:`, !!currentSocket, `ready:`, gameHook.isReady);
          }
        }, 100);
        return () => clearTimeout(timer);
      }

      return () => {
        socket.off("leaderboardUpdate", handleLeaderboardUpdate);
        socket.off("leaderboardError", handleLeaderboardError);
      };
    }
  }, [gameHook.isReady]); // Removed fetchLeaderboard from dependencies

  // Memoize the refresh function to prevent unnecessary re-renders
  const refresh = useCallback(() => {
    console.log("[LEADERBOARD] Manual refresh requested");
    return fetchLeaderboard(undefined, true);
  }, [fetchLeaderboard]);

  return {
    leaderboard,
    isLoading,
    error,
    fetchLeaderboard,
    updateLeaderboard,
    refresh,
  };
};

export const useUserLeaderboardPosition = (userId: string | null, type: LeaderboardType = "total_power") => {
  const [position, setPosition] = useState<number | null>(null);
  const [userData, setUserData] = useState<LeaderboardEntry | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const gameHook = useGame(userId || undefined);
  
  const lastPositionRequestTime = useRef<number>(0);
  const lastSuccessfulPositionRequestTime = useRef<number>(0);
  const POSITION_CACHE_TTL = 10000; // 10 seconds
  const isPositionRequestPending = useRef<boolean>(false);
  const typeRef = useRef<LeaderboardType>(type);
  const userIdRef = useRef<string | null>(userId);
  const lastTypeRef = useRef<LeaderboardType>(type);

  // Update refs when props change
  useEffect(() => {
    typeRef.current = type;
    userIdRef.current = userId;
  }, [type, userId]);

  const fetchUserPosition = useCallback(async (forceRefresh: boolean = false) => {
    const socket = gameHook.socketRef.current;
    if (!userIdRef.current || !socket || !gameHook.isReady) {
      setPosition(null);
      setUserData(null);
      return;
    }

    const now = Date.now();
    const typeChanged = lastTypeRef.current !== typeRef.current;
    
    // Force refresh if type changed
    if (typeChanged) {
      console.log(`[USER_POSITION] Type changed from ${lastTypeRef.current} to ${typeRef.current}, forcing refresh`);
      forceRefresh = true;
      lastTypeRef.current = typeRef.current;
    }
    
    if (!forceRefresh && now - lastSuccessfulPositionRequestTime.current < POSITION_CACHE_TTL) {
      console.log("[USER_POSITION] Request throttled, using cached data");
      return;
    }

    if (isPositionRequestPending.current && !forceRefresh) {
      console.log("[USER_POSITION] Request already pending, skipping");
      return;
    }

    setIsLoading(true);
    lastPositionRequestTime.current = now;
    isPositionRequestPending.current = true;

    try {
      console.log(`[USER_POSITION] Sending request for type: ${typeRef.current}, userId: ${userIdRef.current}`);
      socket.emit("getUserLeaderboardPosition", { type: typeRef.current, userId: userIdRef.current });
    } catch (err) {
      console.error("Error fetching user position:", err);
      setPosition(null);
      setUserData(null);
      isPositionRequestPending.current = false;
    } finally {
      setIsLoading(false);
    }
  }, [gameHook.socketRef, gameHook.isReady]); // Removed userId and type from dependencies

  useEffect(() => {
    const socket = gameHook.socketRef.current;
    if (socket && gameHook.isReady && userIdRef.current) {
      const handleUserPositionUpdate = (data: { position: number; userData: LeaderboardEntry | null }) => {
        console.log(`[USER_POSITION] Received update, position: ${data.position}`);
        setPosition(data.position);
        setUserData(data.userData);
        setIsLoading(false);
        lastSuccessfulPositionRequestTime.current = Date.now();
        isPositionRequestPending.current = false;
      };

      const handleUserPositionError = (message: string) => {
        console.error("User position error:", message);
        setPosition(null);
        setUserData(null);
        setIsLoading(false);
        isPositionRequestPending.current = false;
      };

      socket.on("userPositionUpdate", handleUserPositionUpdate);
      socket.on("userPositionError", handleUserPositionError);

      const now = Date.now();
      const typeChanged = lastTypeRef.current !== typeRef.current;
      
      if (typeChanged || now - lastSuccessfulPositionRequestTime.current >= POSITION_CACHE_TTL) {
        const timer = setTimeout(() => {
          fetchUserPosition();
        }, 100);
        return () => clearTimeout(timer);
      }

      return () => {
        socket.off("userPositionUpdate", handleUserPositionUpdate);
        socket.off("userPositionError", handleUserPositionError);
      };
    }
  }, [gameHook.isConnected, fetchUserPosition]);

  // Memoize the refresh function
  const refresh = useCallback(() => {
    console.log("[USER_POSITION] Manual refresh requested");
    return fetchUserPosition(true);
  }, [fetchUserPosition]);

  return {
    position,
    userData,
    isLoading,
    refresh,
  };
};