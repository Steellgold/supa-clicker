"use client"

import { useGameContext } from "@/lib/providers/game-provider"
import { cn, formatNumber } from "@/lib/utils"
import { motion } from "framer-motion"
import Image from "next/image"
import type React from "react"
import { useCallback, useState } from "react"

type ClickEffect = {
  id: number
  x: number
  y: number
  gained: number
}

export function Clicker() {
  const { gameState, handleClick, isLoading } = useGameContext();
  const [isClicking, setIsClicking] = useState(false);
  const [clickEffects, setClickEffects] = useState<ClickEffect[]>([]);
  const [isActive, setIsActive] = useState(false);

  const handleClickAction = useCallback(
    (event: React.MouseEvent) => {
      if (isLoading) return;

      setIsClicking(true);
      setIsActive(true);

      // Appeler la fonction WebSocket
      handleClick();

      const rect = event.currentTarget.getBoundingClientRect();
      const x = event.clientX - rect.left - rect.width / 2;
      const y = event.clientY - rect.top - rect.height / 2;
      const effectId = Date.now();

      // Afficher l'effet avec le PPC actuel
      const gained = gameState?.ppc || 1;
      setClickEffects((prev) => [...prev, { id: effectId, x, y, gained }]);

      setTimeout(() => setClickEffects((prev) => prev.filter((effect) => effect.id !== effectId)), 1000);
      setTimeout(() => setIsClicking(false), 100);
      setTimeout(() => setIsActive(false), 300);
    },
    [handleClick, isLoading, gameState?.ppc]
  );

  if (!gameState) return null;

  const isPrestige = false; // Plus de prestige dans le système minimaliste
  const isRingActive = isActive || isClicking;
  const isRingInactive = !isActive && !isClicking;

  const ringClass = isRingActive
    ? isPrestige
      ? "ring-4 ring-purple-600 dark:ring-purple-300"
      : "ring-4 ring-green-600 dark:ring-green-300"
    : "";

  const focusRingClass = isRingInactive
    ? isPrestige
      ? "focus:ring-2 focus:ring-purple-600 dark:focus:ring-purple-400"
      : "focus:ring-2 focus:ring-green-600 dark:focus:ring-green-400"
    : "";

  const disabledClass = isLoading ? "opacity-60 cursor-not-allowed" : "";

  return (
    <div className="relative flex items-center justify-center">
      <motion.button
        onClick={handleClickAction}
        disabled={isLoading || isClicking}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        animate={isClicking ? { scale: [1, 1.05, 1] } : {}}
        transition={{ duration: 0.1 }}
        className={cn(
          "size-82 md:size-92 rounded-full border-4 border-black dark:border-white bg-black dark:bg-white relative overflow-hidden",
          "shadow-[4px_4px_0_#000] dark:shadow-[4px_4px_0_#aaa] transition-transform duration-100 focus:outline-none",
          ringClass,
          focusRingClass,
          disabledClass
        )}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <Image
            src={
              !isPrestige
                ? "https://s7yh4pytyr.ufs.sh/f/UAfcSNyPsVRcBNW5dZLiLn2WUYjB5ursFGVI4PJSbHf0K8p7"
                : "https://s7yh4pytyr.ufs.sh/f/UAfcSNyPsVRcvf7PIUQPlpyARfVLYXwGBDtCO603v4EnQT2r"
            }
            alt="Clicker button"
            width={135}
            height={135}
            className="select-none pointer-events-none drag-none"
            draggable={false}
            unoptimized
          />
        </div>
      </motion.button>

      {clickEffects.map((effect) => (
        <motion.div
          key={effect.id}
          initial={{ opacity: 1, scale: 0, x: effect.x, y: effect.y }}
          animate={{ opacity: 0, scale: 1.5, y: effect.y - 40 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className={cn("absolute pointer-events-none z-20 text-2xl font-mono font-bold", {
            "text-green-600 dark:text-green-300": !isPrestige,
            "text-purple-600 dark:text-purple-300": isPrestige,
          })}
          style={{ left: "50%", top: "50%" }}
        >
          +{formatNumber(effect.gained)}
        </motion.div>
      ))}
    </div>
  );
}
