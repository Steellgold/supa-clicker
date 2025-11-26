"use client";

import { PowerTag } from "@/components/power-tag";
import { Card } from "@/components/ui/card";
import { UnlockBlurWrapper } from "@/components/unlock-blur-wrapper";
import { useBulkBuy } from "@/lib/contexts/bulk-buy-context";
import { useGameContext } from "@/lib/providers/game-provider";
import { cn, formatDecimal, formatNumber, formatWithSpaces } from "@/lib/utils";
import { getAllUpgrades, UPGRADES } from "@clicker/game/utils";

const calculateUpgradeCost = (upgrade: { baseCost: number; costGrowth: number }, level: number) => {
  return Math.floor(upgrade.baseCost * Math.pow(upgrade.costGrowth, level));
};


interface UpgradeCardProps {
  upgradeId: number;
  index?: number;
}

export const UpgradeCard = ({ upgradeId, index = 0 }: UpgradeCardProps) => {
  const { buyUpgrade, gameState } = useGameContext();
  const { bulkBuyOption } = useBulkBuy();
  
  if (!gameState) return null;

  const upgrade = UPGRADES.find(u => u.id === upgradeId);
  if (!upgrade) return null;

  const userUpgrade = gameState.upgrades.find(u => u.id === upgradeId);
  const currentLevel = userUpgrade?.level || 0;

  let actualBuyAmount = 0;
  let cost = 0;
  const getBulkBuyAmount = () => {
    if (bulkBuyOption === "MAX") {
      let maxAffordable = 0;
      let remainingPower = gameState.power;
      let i = 0;

      while (maxAffordable < 1000) {
        const nextCost = calculateUpgradeCost(upgrade, currentLevel + i);
        if (remainingPower >= nextCost) {
          remainingPower -= nextCost;
          maxAffordable++;
          i++;
        } else {
          break;
        }
      }
      return Math.max(1, maxAffordable);
    }

    return typeof bulkBuyOption === "number" ? bulkBuyOption : 1;
  };

  actualBuyAmount = getBulkBuyAmount();
  let totalCost = 0;

  for (let i = 0; i < actualBuyAmount; i++) {
    totalCost += calculateUpgradeCost(upgrade, currentLevel + i);
  }

  cost = totalCost;

  const canAfford = gameState.power >= cost && actualBuyAmount > 0;
  const isUnlocked = gameState.total_power >= upgrade.baseCost;

  const getUnlockedUpgradesCount = (totalPower: number) => {
    return getAllUpgrades().filter(up => totalPower >= up.baseCost).length;
  };

  const handleBuy = () => {
    if (canAfford && isUnlocked) {
      buyUpgrade(upgradeId, actualBuyAmount, actualBuyAmount > 1);
    }
  };

  const totalPpsGain = (upgrade.pps || 0) * currentLevel;
  const totalClickMultiplier = (upgrade.ppc || 0) * currentLevel;
  
  const purchaseQuantity = actualBuyAmount;
  const unitPpsGain = upgrade.pps || 0;
  const unitClickMultiplier = upgrade.ppc || 0;
  const purchasePpsGain = unitPpsGain * purchaseQuantity;
  const purchaseClickMultiplier = unitClickMultiplier * purchaseQuantity;

  return (
    <UnlockBlurWrapper
      isUnlocked={isUnlocked}
      index={index}
      getUnlockedCount={getUnlockedUpgradesCount}
    >
      <Card className="rounded-none p-3 border-1 transition-colors mb-0">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            {isUnlocked ? (
              <>
                <div className="flex items-center gap-1.5 mb-1">
                  {currentLevel > 0 && (
                    <span className={cn("text-xs px-1 py-0 border", {
                      "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-green-300 dark:border-green-600": true,
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
                        "text-green-600 dark:text-green-400 bg-green-500/20 dark:bg-green-500/30": true,
                      })}>
                        {totalPpsGain > 0 && (
                          <PowerTag imageProps={{ width: 12, height: 12, className: "mb-0.5 ml-1" }}>
                            +{formatDecimal(totalPpsGain)}/s
                          </PowerTag>
                        )}
                        {totalClickMultiplier > 0 && (
                          <>
                            <PowerTag imageProps={{ width: 12, height: 12, className: "mb-0.5 ml-1" }}>
                              +{formatDecimal(totalClickMultiplier)}/c
                            </PowerTag>
                          </>
                        )}
                      </div>
                    )}

                    {(purchasePpsGain > 0 || purchaseClickMultiplier > 0) && (
                      <div className="text-xs font-medium px-1.5 py-0.5 text-neutral-600 dark:text-neutral-400 bg-neutral-500/20 dark:bg-neutral-500/30 w-fit">
                        {purchasePpsGain > 0 && (<>+{formatDecimal(purchasePpsGain)}/s</>)}

                        {purchaseClickMultiplier > 0 && (
                          <>+{formatDecimal(purchaseClickMultiplier)}/c</>
                        )}
                      </div>
                    )}
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
                      actualBuyAmount > 1 ?
                        `Buy x${actualBuyAmount} (${formatNumber(cost)})` :
                        `Buy (${formatNumber(cost)})`
                    ) : (
                      <PowerTag imageProps={{ width: 12, height: 12, className: "mb-0.5 ml-1 neutralscale" }}>
                        Need {formatNumber(cost)}
                      </PowerTag>
                    )}
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-neutral-600 dark:text-neutral-400">
                    {upgrade.name}
                  </h3>
                </div>
                
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  {upgrade.description}
                </p>

                <div className="flex items-center justify-between mt-2">
                  <div></div>
                  <span className="text-md text-neutral-500 dark:text-neutral-400 font-bold select-none">
                    <PowerTag imageProps={{ width: 12, height: 12 }}>
                      {formatWithSpaces(upgrade.baseCost)}
                    </PowerTag>
                  </span>
                </div>
              </>
            )}
          </div>
        </div>
      </Card>
    </UnlockBlurWrapper>
  );
};
