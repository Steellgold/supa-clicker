import { useGame } from "@/lib/providers/game-provider";
import { cn } from "@/lib/utils";
import { Component } from "@/type/component";

type AchievementProps = {
  name: string;
  icon: string;
};

export const Achievement: Component<AchievementProps> = ({ name, icon }) => {
  const { gameState } = useGame();

  return (
    <div className={cn(
      "absolute bottom-5 left-1/2 transform -translate-x-1/2 z-50",
      "border-4 rounded-none px-6 py-4",
      "w-[90vw] max-w-md font-mono text-sm text-black", {
        "bg-green-100 border-green-400 shadow-[4px_4px_0_#3a7758]": gameState.prestigeLevel === 0,
        "bg-purple-100 border-purple-400 shadow-[4px_4px_0_#744899]": gameState.prestigeLevel > 0,
      }
    )}>
      <div className="flex items-center gap-4">
        <span className={cn("text-2xl border-2 px-2 py-2", {
          "bg-green-400/25 border-green-400": gameState.prestigeLevel === 0,
          "bg-purple-400/25 border-purple-400": gameState.prestigeLevel > 0,
        })}>{icon}</span>
  
        <div className="flex flex-col leading-tight">
          <p className="font-bold text-base">Achievement Unlocked!</p>
          <p className="text-sm">{name}</p>
        </div>
      </div>
    </div>
  );
};