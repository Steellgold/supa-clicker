import { Achievement as AchievementCard } from "@/components/achievement";
import { Clicker } from "@/components/clicker";
import { DuckWalker } from "@/components/duck-walker";
import { cn, formatCookieClickerNumber } from "@/lib/utils";
import { Component } from "@/type/component";
import type { Achievement, GameState } from "@/type/game";
import { AnimatePresence, motion } from "framer-motion";
import { RefObject } from "react";
import { PowerTag } from "../power-tag";

interface MainStatsPanelProps {
  gameState: GameState;
  handleClick: () => {
    gained: number;
    isGolden?: boolean;
    isPlatinum?: boolean;
    isSpecialClick?: boolean;
    specialMultiplier?: number;
    comboMultiplier?: number;
    comboCount?: number;
    timeBoostActivated?: boolean;
  };
  newAchievements: Achievement[];
  leftPanelWidth: number;
  leftPanelRef: RefObject<HTMLDivElement | null>;
}

export const MainStatsPanel: Component<MainStatsPanelProps> = ({ gameState, handleClick, newAchievements, leftPanelWidth, leftPanelRef }) => (
  <div ref={leftPanelRef} className="flex-1 relative bg-neutral-50 dark:bg-neutral-900 flex flex-col items-center justify-center transition-colors min-h-[60vh] md:min-h-0 space-y-12">
    <div className="flex flex-col items-center justify-center">
      <div className={cn("text-2xl md:text-3xl lg:text-5xl p-4 font-medium", {
        "bg-green-400/25": gameState.prestigeLevel === 0,
        "bg-purple-400/25": gameState.prestigeLevel > 0,
      })}>
        <PowerTag imageProps={{ className: "w-6 h-6 md:w-7 md:h-7 lg:w-12 lg:h-12" }}>
          {formatCookieClickerNumber(gameState.currentPower)}
        </PowerTag>
      </div>

      <div className="flex flex-row items-center justify-center gap-2">
        <div className={cn(
          "flex flex-row items-center justify-center text-sm md:text-base lg:text-lg p-2 font-medium mt-1 border-2", {
            "bg-green-400/25 border-green-400 shadow-[4px_4px_0_#3a7758]": gameState.prestigeLevel === 0,
            "bg-purple-400/25 border-purple-400 shadow-[4px_4px_0_#744899]": gameState.prestigeLevel > 0,
          }
        )}>
          <span>
            <PowerTag imageProps={{ className: "w-4 h-4" }}>
              {formatCookieClickerNumber(gameState.pps)}
            </PowerTag>
            <span className="text-sm">/s</span>
          </span>

          <span className="px-2">・</span>

          <span>
            <PowerTag imageProps={{ className: "w-4 h-4" }}>
              {formatCookieClickerNumber(gameState.clickPower)}
            </PowerTag>
            <span className="text-sm">/click</span>
          </span>
        </div>

        {gameState.comboActive && (
          <div className={cn(
            "bg-amber-700/25 border-2 border-[#78350f] text-sm md:text-base lg:text-lg p-2 font-medium mt-1",
            "shadow-[4px_4px_0_#78350f]"
          )}>
            <span>x{gameState.comboCount}</span>
          </div>
        )}
      </div>
    </div>

    <Clicker onClick={handleClick} />

    <AnimatePresence>
      {newAchievements.map((achievement) => (
        <motion.div
          key={achievement.id}
          initial={{ y: 50, opacity: 0, scale: 0.8 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 50, opacity: 0, scale: 0.8 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          className="absolute bottom-5 left-1/2 transform -translate-x-1/2 z-50 max-w-lg mx-auto"
        >
          <AchievementCard name={achievement.name} icon={achievement.icon} />
        </motion.div>
      ))}
    </AnimatePresence>

    {process.env.NODE_ENV === "development" && <AchievementCard name="Test Achievement" icon="🎉" />}
    <DuckWalker maxX={leftPanelWidth} />
  </div>
); 