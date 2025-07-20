"use client";

import type React from "react";
import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { formatWithSpaces } from "@/lib/numbers";

type ClickEffect = {
  id: number;
  x: number;
  y: number;
  gained: number;
  isGolden?: boolean;
  isPlatinum?: boolean;
};

type ClickerProps = {
  onClick: () => {
    gained: number;
    isGolden?: boolean;
    isPlatinum?: boolean
  };
  disabled?: boolean;
}

export function Clicker({ onClick, disabled }: ClickerProps) {
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

      setClickEffects((prev) => [
        ...prev,
        { id: effectId, x, y,
          gained: result.gained,
          isGolden: result.isGolden,
          isPlatinum: result.isPlatinum,
        },
      ]);

      setTimeout(() => setClickEffects((prev) => prev.filter((effect) => effect.id !== effectId)), 1000);
      setTimeout(() => setIsClicking(false), 100);
      setTimeout(() => setIsActive(false), 300);
    },
    [onClick, disabled],
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
          "size-52 rounded-full bg-gray-900 dark:bg-gray-100 border-6 border-gray-800 dark:border-gray-200 hover:border-gray-700 dark:hover:border-gray-300 transition-colors relative overflow-hidden focus:outline-none", {
          "ring-2 ring-green-500": isActive || isClicking,
          "focus:ring-2 focus:ring-green-500": !isActive && !isClicking
          }
        )}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <Image 
            src="https://s7yh4pytyr.ufs.sh/f/UAfcSNyPsVRcBNW5dZLiLn2WUYjB5ursFGVI4PJSbHf0K8p7"
            alt="Clicker button"
            width={80}
            height={80}
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
          className={`absolute pointer-events-none text-3xl font-bold z-20 ${
            effect.isPlatinum 
              ? "text-purple-400" 
                : effect.isGolden 
                  ? "text-yellow-400"
                    : "text-green-500"
          }`}
          style={{ left: "50%", top: "50%" }}
        >
          +{formatWithSpaces(effect.gained)}
        </motion.div>
      ))}
    </div>
  );
}
