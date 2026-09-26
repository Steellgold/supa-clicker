"use client";

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "supa-clicker-singleplayer";

export const useSingleplayerGate = () => {
  const [hasStarted, setHasStarted] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    try {
      setHasStarted(localStorage.getItem(STORAGE_KEY) === "1");
    } catch {
      setHasStarted(false);
    }
    setIsReady(true);
  }, []);

  const start = useCallback(() => {
    setHasStarted(true);
    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      // storage unavailable: still play, progress just won't persist
    }
  }, []);

  return { hasStarted, isReady, start };
};
