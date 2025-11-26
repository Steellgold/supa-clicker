"use client";

import { PowerTag } from "@/components/power-tag";
import { Card } from "@/components/ui/card";
import { UnlockBlurWrapper } from "@/components/unlock-blur-wrapper";
import { useBulkBuy } from "@/lib/contexts/bulk-buy-context";
import { useGame } from "@/lib/providers/game-provider";
import { getFirstLockedUpgradeIndex, getUnlockThreshold } from "@/lib/upgrades";
import { cn, formatDecimal, formatNumber, formatWithSpaces } from "@/lib/utils";
import { Component } from "@/type/component";
import { Upgrade } from "@/type/game";

interface UpgradeCardProps {
  upgrade: Upgrade;
  index?: number;
}

export const UpgradeCard: Component<UpgradeCardProps> = ({ upgrade, index = 0 }) => {
  const { buyUpgrade, getUpgradeCost, getUpgradePPSGain, getUpgradeClickMultiplier, gameState, upgradesInfo } = useGame();
  const { bulkBuyOption } = useBulkBuy();

  const upgradeInfo = upgradesInfo?.find(u => u.id === upgrade.id);
  const purchasedUpgrades = (gameState.purchasedUpgrades || []).filter(u => u.upgradeId === upgrade.id);
  const currentLevel = purchasedUpgrades.length > 0 ? purchasedUpgrades.length : (upgradeInfo?.currentLevel || 0);
  const staticCost = typeof gameState.nextUpgradeCosts?.[upgrade.id] === "number"
    ? gameState.nextUpgradeCosts[upgrade.id]
    : getUpgradeCost(upgrade, currentLevel);

  const totalPpsGain = getUpgradePPSGain(upgrade) * currentLevel;
  const totalClickMultiplier = getUpgradeClickMultiplier(upgrade) * currentLevel;

  const effectiveBulkBuyOption = bulkBuyOption;
  let actualBuyAmount = 0;
  let cost = 0;
  if (staticCost !== undefined) {
    const getBulkBuyAmount = (): number => {
      if (effectiveBulkBuyOption === "MAX") {
        let maxAffordable = 0;
        let remainingPower = gameState.currentPower;
        const currentCost = staticCost;
        while (remainingPower >= currentCost && maxAffordable < 1000) {
          remainingPower -= currentCost;
          maxAffordable++;
        }
        return Math.max(1, maxAffordable);
      }
      return typeof effectiveBulkBuyOption === "number" ? effectiveBulkBuyOption : 1;
    };
    actualBuyAmount = getBulkBuyAmount();
    cost = staticCost * actualBuyAmount;
  }
  const canAfford = staticCost !== undefined && gameState.currentPower >= cost;

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

  const unitPpsGain = getUpgradePPSGain(upgrade);
  const unitClickMultiplier = getUpgradeClickMultiplier(upgrade);

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
              <div className="flex items-center gap-1.5 mb-1">
                {currentLevel > 0 && (
                  <span className={cn("text-xs px-1 py-0 border", {
                    "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-green-300 dark:border-green-600": gameState.prestigeLevel === 0,
                    "bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 border-purple-300 dark:border-purple-600": gameState.prestigeLevel > 0,
                  })}>
                    x{currentLevel}
                  </span>
                )}
                <h3 className="font-semibold text-neutral-800 dark:text-neutral-200">{upgrade.name}</h3>
              </div>

              <p className="text-xs text-neutral-600 dark:text-neutral-400 mb-2">{upgrade.description}</p>

              <div className="flex items-center justify-between select-none">
                <div className="flex flex-row">
                  {(totalPpsGain > 0 || totalClickMultiplier > 0) && currentLevel > 0 && (
                    <div className={cn("text-xs font-medium px-1.5 py-0.5 w-fit", {
                      "text-green-600 dark:text-green-400 bg-green-500/20 dark:bg-green-500/30": gameState.prestigeLevel === 0,
                      "text-purple-600 dark:text-purple-400 bg-purple-500/20 dark:bg-purple-500/30": gameState.prestigeLevel > 0,
                    })}>
                      {totalPpsGain > 0 && (
                        <PowerTag imageProps={{ width: 12, height: 12, className: "mb-0.5 ml-1" }}>
                          +{formatDecimal(totalPpsGain)}/s
                        </PowerTag>
                      )}
                      {totalClickMultiplier > 0 && (
                        <>
                          <PowerTag imageProps={{ width: 12, height: 12, className: "mb-0.5 ml-1" }}>
                            +{formatDecimal(totalClickMultiplier)}/clicks
                          </PowerTag>
                        </>
                      )}
                    </div>
                  )}

                  {(unitPpsGain > 0 || unitClickMultiplier > 0) && (
                    <div className="text-xs font-medium px-1.5 py-0.5 text-neutral-600 dark:text-neutral-400 bg-neutral-500/20 dark:bg-neutral-500/30 w-fit">
                      {unitPpsGain > 0 && (<>+{formatDecimal(unitPpsGain)}/s</>)}

                      {unitClickMultiplier > 0 && (
                        <>+{formatDecimal(unitClickMultiplier)}/clicks</>
                      )}
                    </div>
                  )}
                </div>

                {/* BUY BUTTON */}
                <button
                  onClick={handleBuy}
                  disabled={!canAfford || staticCost === undefined}
                  className={cn("text-xs font-medium px-1.5 py-0.5 transition-colors", {
                    "bg-green-500/20 hover:bg-green-500/30 text-green-600 dark:text-green-400": canAfford && gameState.prestigeLevel === 0,
                    "bg-purple-500/20 hover:bg-purple-500/30 text-purple-600 dark:text-purple-400": canAfford && gameState.prestigeLevel > 0,
                    "bg-neutral-200 dark:bg-neutral-700 text-neutral-500 dark:text-neutral-400 hover:bg-red-200 dark:hover:bg-red-900/30 hover:text-red-500 dark:hover:text-red-400 cursor-not-allowed": !canAfford || staticCost === undefined
                  })}
                >
                  {staticCost !== undefined ? (
                    canAfford ? `Buy (${formatNumber(cost)})` : (
                      <PowerTag imageProps={{ width: 12, height: 12, className: "mb-0.5 ml-1 neutralscale" }}>
                        Need {formatNumber(cost)}
                      </PowerTag>
                    )
                  ) : (
                    <span>???</span>
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
