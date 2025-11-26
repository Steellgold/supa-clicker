"use client";

import { useGameContext } from "@/lib/providers/game-provider";
import { cn } from "@/lib/utils";
import { calculateAchievementProgress, getAchievementProgressValues } from "@/lib/utils/achievement-progress";
import { Trophy } from "lucide-react";
import { Progress } from "./ui/progress";

export const AchievementNotification = () => {
  const { achievementNotifications, gameState } = useGameContext();

  if (achievementNotifications.length === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 z-50 space-y-2">
      {achievementNotifications.map((achievement) => (
        <div
          key={achievement.id}
          className={cn(
            "animate-in slide-in-from-right-5 duration-300",
            "p-3 border-2 w-full max-w-xs shadow-[3px_3px_0_#5aa761]",
            "border-green-400 bg-green-100 dark:bg-green-800 text-green-900 dark:text-green-100"
          )}
        >
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 flex items-center justify-center text-2xl border-2 border-green-400 bg-green-100 dark:bg-green-800 flex-shrink-0">
              {achievement.icon ?? <Trophy className="w-6 h-6" />}
            </div>

            <div className="flex-1 min-w-0">
              <div className="font-bold text-sm truncate text-green-800 dark:text-green-200">
                {achievement.name}
              </div>

              <p className="text-xs text-green-700 dark:text-green-300">
                {achievement.description}
              </p>
              
              {(() => {
                const progress = calculateAchievementProgress(achievement, gameState);
                const progressValues = getAchievementProgressValues(achievement, gameState);
                
                if (progress >= 50 && progress < 100 && progressValues) {
                  return (
                    <div className="mt-2">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-green-600 dark:text-green-400">
                          {progressValues.current.toLocaleString()} / {progressValues.target.toLocaleString()} {progressValues.unit}
                        </span>
                        <span className="text-green-600 dark:text-green-400">
                          {progress}%
                        </span>
                      </div>
                      <Progress value={progress} className="h-1" />
                    </div>
                  );
                }
                return null;
              })()}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}