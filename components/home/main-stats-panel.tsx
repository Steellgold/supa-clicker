"use client";

import { PowerTag } from "@/components/power-tag";
import { useGameContext } from "@/lib/providers/game-provider";
import { cn, formatDecimal, formatNumber } from "@/lib/utils";

export const MainStatsPanel = () => {
  const { gameState } = useGameContext();
  
  if (!gameState) return null;

  return (
    <div className="flex flex-col items-center justify-center">
      {/* Grand affichage du power principal */}
      <div className={cn("text-2xl md:text-3xl lg:text-5xl p-4 font-medium", {
        "bg-green-400/25": true, // Plus de prestige dans le système minimaliste
      })}>
        <PowerTag imageProps={{ className: "w-6 h-6 md:w-7 md:h-7 lg:w-12 lg:h-12" }}>
          {formatNumber(gameState.power)}
        </PowerTag>
      </div>

      {/* Barre horizontale avec PPS et PPC */}
      <div className="flex flex-row items-center justify-center gap-2">
        <div className={cn(
          "flex flex-row items-center justify-center text-sm md:text-base lg:text-lg p-2 font-medium mt-1 border-2", {
            "bg-green-400/25 border-green-400 shadow-[4px_4px_0_#3a7758]": true, // Plus de prestige
          }
        )}>
          <span>
            <PowerTag imageProps={{ className: "w-4 h-4" }}>
              {formatDecimal(gameState.pps)}
            </PowerTag>
            <span className="text-sm">/s</span>
          </span>

          <span className="px-2">・</span>

          <span>
            <PowerTag imageProps={{ className: "w-4 h-4" }}>
              {formatDecimal(gameState.ppc)}
            </PowerTag>
            <span className="text-sm">/click</span>
          </span>
        </div>
      </div>
    </div>
  );
}; 