"use client";

import { Card } from "@/components/ui/card";
import { useBulkBuy } from "@/lib/contexts/bulk-buy-context";
import { isBulkBuyUnlocked } from "@/lib/features-utils";
import { useGame } from "@/lib/providers/game-provider";
import { getFirstLockedUpgradeIndex, getUnlockThreshold } from "@/lib/upgrades";
import { cn, formatDecimal, formatNumber, formatWithSpaces } from "@/lib/utils";
import { Component } from "@/type/component";
import { Upgrade } from "@/type/game";
import { PowerTag } from "./power-tag";
import { UnlockBlurWrapper } from "./unlock-blur-wrapper";

interface UpgradeCardProps {
  upgrade: Upgrade;
  index?: number;
}

export const UpgradeCard: Component<UpgradeCardProps> = ({ upgrade, index = 0 }) => {
  const { buyUpgrade, getUpgradeCost, gameState, upgradesInfo } = useGame();
  const { bulkBuyOption } = useBulkBuy();
  
  const upgradeInfo = upgradesInfo?.find(u => u.id === upgrade.id);
  const currentLevel = upgradeInfo?.currentLevel || 0;
  
  // Check if bulk buy is unlocked, otherwise default to 1
  const isBulkUnlocked = isBulkBuyUnlocked(gameState);
  const effectiveBulkBuyOption = isBulkUnlocked ? bulkBuyOption : 1;
  
  // Calculate bulk buy amounts and costs
  const getBulkBuyAmount = (): number => {
    if (effectiveBulkBuyOption === "MAX") {
      let maxAffordable = 0;
      let currentCost = upgradeInfo?.cost || getUpgradeCost(upgrade, currentLevel);
      let remainingPower = gameState.currentPower;
      
      while (remainingPower >= currentCost && maxAffordable < 1000) { // Safety limit
        remainingPower -= currentCost;
        maxAffordable++;
        currentCost = getUpgradeCost(upgrade, currentLevel + maxAffordable);
      }
      
      return Math.max(1, maxAffordable);
    }
    return typeof effectiveBulkBuyOption === "number" ? effectiveBulkBuyOption : 1;
  };
  
  const actualBuyAmount = getBulkBuyAmount();
  
  const calculateBulkCost = (amount: number): number => {
    let totalCost = 0;
    for (let i = 0; i < amount; i++) {
      totalCost += getUpgradeCost(upgrade, currentLevel + i);
    }
    return totalCost;
  };
  
  const cost = calculateBulkCost(actualBuyAmount);
  const canAfford = gameState.currentPower >= cost;
  
  const unlockThreshold = getUnlockThreshold(index);
  const isUnlocked = gameState.totalPower >= unlockThreshold;
  const firstLockedIndex = getFirstLockedUpgradeIndex(gameState.totalPower);
  
  const getUnlockedUpgradesCount = (totalPower: number) => {
    return upgradesInfo.filter((_, i) => totalPower >= getUnlockThreshold(i)).length;
  };

  const handleBuy = () => {
    if (canAfford && isUnlocked) {
      buyUpgrade(upgrade.id, actualBuyAmount);
    }
  };
  
  return (
    <UnlockBlurWrapper 
      isUnlocked={isUnlocked} 
      index={index} 
      getUnlockedCount={getUnlockedUpgradesCount}
    >
      {!isUnlocked ? (
        <Card className="rounded-none p-3 border-1 transition-colors mb-0 overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-neutral-600 dark:text-neutral-400">
                  {isUnlocked ? upgrade.name : index === firstLockedIndex ? upgrade.name : "???"}
                </h3>
              </div>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                {isUnlocked ? upgrade.description : index === firstLockedIndex ? upgrade.description : "???"}
              </p>
            </div>

            <span className="text-md text-neutral-500 dark:text-neutral-400 font-bold select-none">
              <PowerTag imageProps={{ width: 12, height: 12 }}>
                {formatWithSpaces(unlockThreshold)}
              </PowerTag>
            </span>
          </div>
        </Card>
      ) : (
        <Card className="rounded-none p-3 border-1 transition-colors mb-0">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                {currentLevel > 0 && (
                  <span className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 text-xs px-1.5 py-0.5 rounded-sm border border-green-300 dark:border-green-600">
                    x{currentLevel}
                  </span>
                )}
                <h3 className="font-semibold text-neutral-800 dark:text-neutral-200">{upgrade.name}</h3>
              </div>

              <p className="text-xs text-neutral-600 dark:text-neutral-400 mb-2">{upgrade.description}</p>

              <div className="flex items-center justify-between select-none">
                <div className={cn(
                  "text-xs font-medium px-1.5 py-0.5", {
                    "text-green-600 dark:text-green-400 bg-green-500/20 dark:bg-green-500/30": currentLevel > 0,
                    "text-neutral-500 dark:text-neutral-400 bg-neutral-200 dark:bg-neutral-700": currentLevel === 0
                  }
                )}>
                  <PowerTag imageProps={{ width: 12, height: 12, className: cn("mb-0.5 ml-1", {
                    "grayscale": currentLevel === 0
                  }) }}>
                    {upgrade.rpsGain == 0 && upgrade.clickMultiplier > 0 ? (
                      <>
                        +{formatDecimal(upgrade.clickMultiplier * (currentLevel == 0 ? 1 : currentLevel))}x Clicks
                      </>
                    ) : (
                      <>
                        +{formatDecimal(upgrade.rpsGain * (currentLevel == 0 ? 1 : currentLevel))}/s
                      </>
                    )}
                  </PowerTag>
                </div>

                <button
                  onClick={handleBuy}
                  disabled={!canAfford}
                  className={cn("text-xs font-medium px-1.5 py-0.5 transition-colors", {
                    "bg-green-500/20 hover:bg-green-500/30 text-green-600 dark:text-green-400": canAfford,
                    "bg-neutral-200 dark:bg-neutral-700 text-neutral-500 dark:text-neutral-400 hover:bg-red-200 dark:hover:bg-red-900/30 hover:text-red-500 dark:hover:text-red-400 cursor-not-allowed": !canAfford
                  })}
                >
                  {canAfford ? (
                    `Buy (${formatNumber(cost)})`
                  ) : (
                    <PowerTag imageProps={{ width: 12, height: 12, className: "mb-0.5 ml-1 grayscale" }}>
                      Need {formatNumber(cost)}
                    </PowerTag>
                  )}
                </button>
              </div>
            </div>
          </div>
        </Card>
      )}
    </UnlockBlurWrapper>
  );
};