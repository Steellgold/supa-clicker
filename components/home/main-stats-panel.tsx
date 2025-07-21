import { Achievement as AchievementCard } from "@/components/achievement";
import { Clicker } from "@/components/clicker";
import { DuckWalker } from "@/components/duck-walker";
import { Component } from "@/type/component";
import type { Achievement, GameState } from "@/type/game";
import { AnimatePresence, motion } from "framer-motion";
import { RefObject } from "react";

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

export const MainStatsPanel: Component<MainStatsPanelProps> = ({ handleClick, newAchievements, leftPanelWidth, leftPanelRef }) => (
  <div ref={leftPanelRef} className="flex-1 relative bg-neutral-50 dark:bg-neutral-900 flex flex-col items-center justify-center transition-colors min-h-[60vh] md:min-h-0">
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

    {/* {process.env.NODE_ENV === "development" && <AchievementCard name="Test Achievement" icon="🎉" />} */}
    <DuckWalker maxX={leftPanelWidth} />
  </div>
); 