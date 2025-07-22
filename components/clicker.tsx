"use client"

import { useGame } from "@/lib/providers/game-provider"
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

type ClickerProps = {
  onClick: () => {
    gained: number
  }
  disabled?: boolean
}

export function Clicker({ onClick, disabled }: ClickerProps) {
  const { gameState } = useGame();
  const [isClicking, setIsClicking] = useState(false);
  const [clickEffects, setClickEffects] = useState<ClickEffect[]>([]);
  const [isActive, setIsActive] = useState(false);

  const handleClick = useCallback(
    (event: React.MouseEvent) => {
      if (disabled) return;

      setIsClicking(true);
      setIsActive(true);

      const result = onClick();

      const rect = event.currentTarget.getBoundingClientRect();
      const x = event.clientX - rect.left - rect.width / 2;
      const y = event.clientY - rect.top - rect.height / 2;
      const effectId = Date.now();

      setClickEffects((prev) => [...prev, { id: effectId, x, y, gained: result.gained }]);

      setTimeout(() => setClickEffects((prev) => prev.filter((effect) => effect.id !== effectId)), 1000);
      setTimeout(() => setIsClicking(false), 100);
      setTimeout(() => setIsActive(false), 300);
    },
    [onClick, disabled]
  );

  return (
    <div className="relative flex items-center justify-center">
      <motion.button
        onClick={handleClick}
        disabled={disabled || isClicking}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        animate={isClicking ? { scale: [1, 1.05, 1] } : {}}
        transition={{ duration: 0.1 }}
        className={cn(
          "size-82 md:size-92 rounded-full border-4 border-black dark:border-white bg-black dark:bg-white relative overflow-hidden",
          "shadow-[4px_4px_0_#000] dark:shadow-[4px_4px_0_#aaa] transition-transform duration-100 focus:outline-none", {
            "ring-4 ring-green-600 dark:ring-green-300": isActive || isClicking && gameState.prestigeLevel === 0,
            "ring-4 ring-purple-600 dark:ring-purple-300": isActive || isClicking && gameState.prestigeLevel > 0,
            "focus:ring-2 focus:ring-green-600 dark:focus:ring-green-400": !isActive && !isClicking && gameState.prestigeLevel === 0,
            "focus:ring-2 focus:ring-purple-600 dark:focus:ring-purple-400": !isActive && !isClicking && gameState.prestigeLevel > 0,
            "opacity-60 cursor-not-allowed": disabled,
          }
        )}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <Image
            src={
              gameState.prestigeLevel === 0
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
            "text-green-600 dark:text-green-300": gameState.prestigeLevel === 0,
            "text-purple-600 dark:text-purple-300": gameState.prestigeLevel > 0,
          })}
          style={{ left: "50%", top: "50%" }}
        >
          +{formatNumber(effect.gained)}
        </motion.div>
      ))}
    </div>
  );
}
