import type { GameState } from "@/type/game";
import type { ClientSocket } from "@/type/socket";
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
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<ClientSocket | null>(null);

  useEffect(() => {
    setIsLoading(true);
    setError(null);
    setIsConnected(false);

    const id = userId || getOrCreateGuestId();
    
    const socket = io("ws://localhost:8080", {
      query: { token: id },
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
  }, [userId]);

  const handleClick = () => {
    if (!socketRef.current?.connected) {
      setError("Not connected to server");
      return;
    }
    socketRef.current.emit("click");
  };

  const buyUpgrade = (upgradeId: number, quantity: number = 1) => {
    if (!socketRef.current?.connected) {
      setError("Not connected to server");
      return;
    }
    socketRef.current.emit("buyUpgrade", upgradeId, quantity);
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

    canPerformAction,

    clearError: () => setError(null),
  };
};