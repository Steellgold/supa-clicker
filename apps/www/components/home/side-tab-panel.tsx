"use client";

import { PrestigeCard } from "@/components/cards/prestige-card";
import { UpgradeCard } from "@/components/cards/upgrade-card";
import { ChatPanel } from "@/components/chat-panel";
import { LeaderboardPanel } from "@/components/leaderboard-panel";
import { PowerTag } from "@/components/power-tag";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useBulkBuy } from "@/lib/contexts/bulk-buy-context";
import { useGameContext } from "@/lib/providers/game-provider";
import { formatNumber } from "@/lib/utils";
import { BULK_BUY_OPTIONS, getAllUpgrades } from "@clicker/game/utils";
import { useState } from "react";
import { BulkBuySettings } from "../bulk-buy-settings";

type TabType = "UPGRADES" | "SPECIALS" | "LEADERBOARD" | "CHAT";

export const SideTabPanel = () => {
  const { gameState } = useGameContext();
  const { bulkBuyOption } = useBulkBuy();
  const [activeTab, setActiveTab] = useState<TabType>("UPGRADES");
  
  if (!gameState) return null;

  const getUnlockedUpgradesCount = (totalPower: number) => {
    return getAllUpgrades().filter(upgrade => totalPower >= upgrade.baseCost).length;
  };

  const getAffordableUpgradesForOption = (option: typeof BULK_BUY_OPTIONS[number]) => {
    return getAllUpgrades().filter(upgrade => {
      if (gameState.total_power < upgrade.baseCost) return false;
      const userUpgrade = gameState.upgrades.find(u => u.id === upgrade.id);
      const currentLevel = userUpgrade?.level || 0;
      let maxAffordable = 0;
      let remainingPower = gameState.power;
      let i = 0;
      if (option === "MAX") {
        while (maxAffordable < 1000) {
          const nextCost = Math.floor(upgrade.baseCost * Math.pow(upgrade.costGrowth, currentLevel + i));
          if (remainingPower >= nextCost) {
            remainingPower -= nextCost;
            maxAffordable++;
            i++;
          } else {
            break;
          }
        }
        return maxAffordable > 0;
      } else if (typeof option === "number") {
        let totalCost = 0;
        for (let j = 0; j < option; j++) {
          totalCost += Math.floor(upgrade.baseCost * Math.pow(upgrade.costGrowth, currentLevel + j));
        }
        return gameState.power >= totalCost;
      }
      return false;
    });
  };

  const affordableCounts: Record<typeof BULK_BUY_OPTIONS[number], number> = BULK_BUY_OPTIONS.reduce((acc, option) => {
    acc[option] = 0;
    return acc;
  }, {} as Record<typeof BULK_BUY_OPTIONS[number], number>);
  BULK_BUY_OPTIONS.forEach((option) => {
    affordableCounts[option] = getAffordableUpgradesForOption(option).length;
  });

  const showAll = bulkBuyOption === 1;
  const upgradesToShow = showAll ? getAllUpgrades() : getAffordableUpgradesForOption(bulkBuyOption);

  const nextUnlockIndex = getUnlockedUpgradesCount(gameState.total_power);

  const renderTabContent = () => {
    switch (activeTab) {
      case "UPGRADES":
        return (
          <>
            <div className="p-3 border-b-2 border-neutral-200 dark:border-neutral-700">
              <PrestigeCard />
            </div>

            <div className="p-3 border-b-2 border-neutral-200 dark:border-neutral-700 flex justify-end">
              <BulkBuySettings affordableCounts={affordableCounts} />
            </div>

            <ScrollArea className="flex-1 p-3 overflow-y-auto">
              <div className="space-y-1.5">
                {upgradesToShow.map((upgrade, index) => (
                  <UpgradeCard key={upgrade.id} upgradeId={upgrade.id} index={index} />
                ))}
              </div>
            </ScrollArea>
          </>
        );
      // case "SPECIALS":
      //   return (
      //     <div className="p-3">
      //       <PrestigeCard />
      //     </div>
      //   );
      case "LEADERBOARD":
        return <LeaderboardPanel />;
      case "CHAT":
        return (
          <div className="flex-1 p-3">
            <ChatPanel />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="w-full md:w-3/6 xl:w-1/4 border-l-2 border-neutral-800 dark:border-neutral-200 bg-white dark:bg-neutral-800 flex flex-col transition-colors">
      <div className="flex border-b-2 border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800">
        <button 
          className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === "UPGRADES" 
              ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-b-2 border-green-500"
              : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700"
          }`}
          onClick={() => setActiveTab("UPGRADES")}
        >
          UPGRADES
        </button>
        {/* <button 
          className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === "SPECIALS" 
              ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-b-2 border-green-500"
              : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700"
          }`}
          onClick={() => setActiveTab("SPECIALS")}
        >
          SPECIALS
        </button> */}
        <button 
          className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === "LEADERBOARD" 
              ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-b-2 border-green-500"
              : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700"
          }`}
          onClick={() => setActiveTab("LEADERBOARD")}
        >
          LEADERBOARD
        </button>
        <button 
          className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === "CHAT" 
              ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-b-2 border-green-500"
              : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700"
          }`}
          onClick={() => setActiveTab("CHAT")}
        >
          CHAT
        </button>
      </div>

      {/* Header avec stats - seulement visible pour UPGRADES */}
      {activeTab === "UPGRADES" && (
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
      )}

      {renderTabContent()}
    </div>
  );
};
