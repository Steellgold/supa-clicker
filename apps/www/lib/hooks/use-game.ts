import { useAuth } from "@/lib/auth/auth-context";
import type { ClientSocket } from "@/type/socket";
import type { GameState } from "@clicker/game/types";
import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

function getOrCreateGuestId() {
  let id = localStorage.getItem("supa-clicker-guest-id");
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem("supa-clicker-guest-id", id);
  }
  return id;
}

export const useGame = (userId?: string) => {
  const { finalizeMigration } = useAuth();
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<ClientSocket | null>(null);

  useEffect(() => {
    setIsLoading(true);
    setError(null);
    setIsConnected(false);

    const guestId = getOrCreateGuestId();
    const actualUserId = userId || guestId; // Use userId if logged in, otherwise guestId
    
    console.log(`[CLIENT] Connecting with - userId: ${userId}, guestId: ${guestId}, actualUserId: ${actualUserId}`);
    
    const wsUrl = "ws://" + process.env.NEXT_PUBLIC_WS_SERVER_URL || "ws://localhost";
    const wsPort = process.env.NEXT_PUBLIC_WS_SERVER_PORT || "8080";
    
    const socket = io(`${wsUrl}:${wsPort}`, {
      query: { 
        token: actualUserId,       // This is the final user ID (authenticated or guest)
        guestId: guestId           // This is always the original guest ID from localStorage
      },
      transports: ["websocket"],
    }) as ClientSocket;
    
    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("Connected to game server");
      setIsConnected(true);
      setError(null);
    });

    socket.on("disconnect", () => {
      console.log("Disconnected from game server");
      setIsConnected(false);
      setIsLoading(true);
    });

    socket.on("welcome", (payload) => {
      console.log("Welcome received:", payload);
      setIsLoading(false);
      
      // If we have a userId and it's different from the guest ID, finalize migration
      if (userId && userId !== guestId) {
        console.log("[CLIENT] Finalizing migration - updating localStorage");
        finalizeMigration();
      }
    });

    socket.on("update", (state) => {
      setGameState(state);
      setIsLoading(false);
      setError(null);
    });

    socket.on("loading", (loading) => {
      setIsLoading(loading);
    });

    socket.on("error", (msg) => {
      console.error("Game error:", msg);
      setError(msg);
      setIsLoading(false);
    });

    socket.on("refused", (reason) => {
      console.warn("Action refused:", reason);
      setError(reason);
      setTimeout(() => setError(null), 3000);
    });

    socket.on("connect_error", (err) => {
      console.error("Connection error:", err);
      setError("Failed to connect to game server");
      setIsLoading(false);
    });

    return () => {
      console.log("Cleaning up socket connection");
      socket.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const handleClick = () => {
    if (!socketRef.current?.connected) {
      setError("Not connected to server");
      return;
    }
    socketRef.current.emit("click");
  };

  const buyUpgrade = (upgradeId: number, quantity: number = 1, isBulk: boolean = false) => {
    if (!socketRef.current?.connected) {
      setError("Not connected to server");
      return;
    }
    console.log(`[CLIENT] Buying upgrade ${upgradeId}: quantity=${quantity}, isBulk=${isBulk}`);
    socketRef.current.emit("buyUpgrade", upgradeId, quantity, isBulk);
  };

  const resetGame = () => {
    if (!socketRef.current?.connected) {
      setError("Not connected to server");
      return;
    }
    
    if (window.confirm("Are you sure you want to reset your game? This action cannot be undone.")) {
      socketRef.current.emit("reset");
    }
  };

  const performPrestige = () => {
    if (!socketRef.current?.connected) {
      setError("Not connected to server");
      return;
    }

    socketRef.current.emit("prestige", true);
  };

  const canPerformAction = () => {
    return socketRef.current?.connected && !isLoading;
  };

  return {
    gameState,
    isLoading,
    error,
    isConnected,

    handleClick,
    buyUpgrade,
    resetGame,
    performPrestige,

    canPerformAction,

    clearError: () => setError(null),
  };
};