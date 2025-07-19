"use client";

import { useGame } from "@/lib/providers/game-provider";
import { Component } from "@/type/component";
import { Upgrade } from "@/type/game";
import { Card } from "@/components/ui/card";
import { formatDecimal, formatNumber } from "@/lib/numbers";
import { getUnlockThreshold } from "@/lib/upgrades";
import { PowerTag } from "./power-tag";
import { cn } from "@/lib/utils";

interface UpgradeCardProps {
  upgrade: Upgrade;
  index?: number;
}

export const UpgradeCard: Component<UpgradeCardProps> = ({ upgrade, index = 0 }) => {
  const { buyUpgrade, getUpgradeCost, gameState, upgradesInfo } = useGame();
  
  const upgradeInfo = upgradesInfo?.find(u => u.id === upgrade.id);
  const currentLevel = upgradeInfo?.currentLevel || 0;
  const cost = upgradeInfo?.cost || getUpgradeCost(upgrade, currentLevel);
  const canAfford = gameState.currentPower >= cost;
  
  const unlockThreshold = getUnlockThreshold(index);
  const isUnlocked = gameState.totalPower >= unlockThreshold;
  
  const getVisualEffect = () => {
    if (isUnlocked) return { opacity: 1, blur: 0 };
    
    const distanceFromUnlocked = index - upgradesInfo.filter((_, i) => gameState.totalPower >= getUnlockThreshold(i)).length;
    const maxDistance = 4;
    
    if (distanceFromUnlocked > maxDistance) return { opacity: 0, blur: 10 };
    
    const opacityStep = 0.7 / maxDistance;
    const blurStep = 8 / maxDistance;
    
    return {
      opacity: Math.max(0.1, 1 - (distanceFromUnlocked * opacityStep)),
      blur: distanceFromUnlocked * blurStep
    };
  };

  if (getVisualEffect().blur > 6) {
    return <></>;
  }

  const handleBuy = () => {
    if (canAfford && isUnlocked) {
      buyUpgrade(upgrade.id);
    }
  };

  const { opacity, blur } = getVisualEffect();
  
  if (!isUnlocked) {
    return (
      <Card 
        className="rounded-none p-3 border-1 transition-colors mb-0"
        style={{ 
          opacity,
          filter: `blur(${blur}px)`,
          transform: blur > 5 ? 'scale(0.95)' : 'scale(1)'
        }}
      >
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-neutral-600">
                {blur > 3 ? "???" : upgrade.name} {blur < 2 && "🔒"}
              </h3>
            </div>

            <p className="text-xs text-neutral-500">
              {blur > 3 ? "???" : blur > 1 ? "Locked Upgrade" : upgrade.description}
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="rounded-none p-3 border-1 transition-colors mb-0">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            {currentLevel > 0 && (
              <span className="bg-green-100 text-green-800 text-xs px-1.5 py-0.5 rounded-sm border border-green-300">
                x{currentLevel}
              </span>
            )}
            <h3 className="font-semibold text-neutral-800">{upgrade.name}</h3>
          </div>

          <p className="text-xs text-neutral-600 mb-2">{upgrade.description}</p>

          <div className="flex items-center justify-between select-none">
            <div className={cn(
              "text-xs font-medium px-1.5 py-0.5", {
                "text-green-600 bg-green-500/20": currentLevel > 0,
                "text-neutral-500 bg-neutral-200": currentLevel === 0
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
              className={`text-xs font-medium px-1.5 py-0.5 transition-colors ${
                canAfford
                  ? "bg-green-500/20 hover:bg-green-500/30 text-green-600"
                  : "bg-neutral-200 text-neutral-500 hover:bg-red-200 hover:text-red-500 cursor-not-allowed"
              }`}
            >
              {canAfford ? `Buy (${formatNumber(cost)})` : (
                <PowerTag imageProps={{ width: 12, height: 12, className: "mb-0.5 ml-1 grayscale" }}>
                  Need {formatNumber(cost)}
                </PowerTag>
              )}
            </button>
          </div>
        </div>
      </div>
    </Card>
  );
};