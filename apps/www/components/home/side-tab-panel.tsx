"use client";

import { UpgradeCard } from "@/components/cards/upgrade-card";
import { PowerTag } from "@/components/power-tag";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useGameContext } from "@/lib/providers/game-provider";
import { formatNumber } from "@/lib/utils";
import { getAllUpgrades } from "@clicker/game/utils";

export const SideTabPanel = () => {
  const { gameState } = useGameContext();
  if (!gameState) return null;

  const getUnlockedUpgradesCount = (totalPower: number) => {
    return getAllUpgrades().filter(upgrade => totalPower >= upgrade.baseCost).length;
  };

  const nextUnlockIndex = getUnlockedUpgradesCount(gameState.total_power);

  return (
    <div className="w-full md:w-3/6 xl:w-1/4 border-l-2 border-neutral-800 dark:border-neutral-200 bg-white dark:bg-neutral-800 flex flex-col transition-colors">
      {/* Header avec stats */}
      <div className="flex flex-row justify-between items-center p-3 bg-neutral-100 dark:bg-neutral-900 border-b-2 border-neutral-200 dark:border-neutral-700">
        <span className="text-sm text-neutral-600 dark:text-neutral-400">
          Total Power:{" "}
          <PowerTag imageProps={{ width: 14, height: 14 }}>
            <span className="font-bold text-neutral-800 dark:text-neutral-200">
              {formatNumber(gameState.total_power)}
            </span>
          </PowerTag>
        </span>

        {nextUnlockIndex > 0 && (
          <span className="text-sm text-neutral-600 dark:text-neutral-400">
            Next unlock:{" "}
            <PowerTag imageProps={{ width: 14, height: 14 }}>
              <span className="font-bold text-neutral-800 dark:text-neutral-200">
                {formatNumber(getAllUpgrades()[nextUnlockIndex].baseCost)}
              </span>
            </PowerTag>
          </span>
        )}
      </div>

      {/* <div className="flex border-b-2 border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-850">
        <button className="flex-1 px-2 py-2 text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-b-2 border-green-500">
          UPGRADES
        </button>
        <button className="flex-1 px-2 py-2 text-xs font-medium text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700">
          SPECIALS
        </button>
        <button className="flex-1 px-2 py-2 text-xs font-medium text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700">
          LEADERBOARD
        </button>
        <button className="flex-1 px-2 py-2 text-xs font-medium text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700">
          CHAT
        </button>
      </div> */}
      
      <ScrollArea className="flex-1 p-3 overflow-y-auto">
        <div className="space-y-2">
          {getAllUpgrades().map((upgrade, index) => (
            <UpgradeCard key={upgrade.id} upgradeId={upgrade.id} index={index} />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};
