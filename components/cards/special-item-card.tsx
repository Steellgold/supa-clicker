"use client";

import { PowerTag } from "@/components/power-tag";
import { Card } from "@/components/ui/card";
import { UnlockBlurWrapper } from "@/components/unlock-blur-wrapper";
import { GAME_CONFIG } from "@/lib/config/game-config";
import { SPECIAL_ITEM_EFFECTS } from "@/lib/constants/special-items";
import { useGame } from "@/lib/providers/game-provider";
import { canPurchaseSpecialItem, getAllSpecialItems, getRequiredUpgradeIds, getRequiredUpgradeNames, getSpecialItemCost, getSpecialItemMultiplier, isSpecialItemUnlocked } from "@/lib/upgrades-specials";
import { cn, formatNumber } from "@/lib/utils";
import { Component } from "@/type/component";
import { SpecialItem } from "@/type/game";

type SpecialItemCardProps = {
  item: SpecialItem;
  index?: number;
}

export const SpecialItemCard: Component<SpecialItemCardProps> = ({ item, index = 0 }) => {
  const { buySpecialItem, gameState, queueError } = useGame();
  
  // Find locked upgrades for this upgrade
  const purchasedSpecials = (gameState.purchasedSpecialItems || []).filter(s => s.specialItemId === item.id);
  const currentLevel = purchasedSpecials.length > 0 ? purchasedSpecials.length : (gameState.specialItems[item.id] || 0);

  // Static cost: take the cost of the next purchase from the state, otherwise "???"
  const staticCost =
    typeof gameState.nextSpecialItemCosts?.[item.id] === "number"
      ? gameState.nextSpecialItemCosts[item.id]
      : getSpecialItemCost(item, currentLevel, gameState.prestigeLevel);

  // Static gains: sum of effectMultipliers stored
  const totalEffectMultiplier = purchasedSpecials.reduce((prod, s) => prod * Math.pow(s.effectMultiplier, s.quantity), 1);

  const isUnlocked = isSpecialItemUnlocked(item, gameState.totalPower, gameState.prestigeLevel);
  const canPurchase = canPurchaseSpecialItem(
    item,
    currentLevel,
    gameState.currentPower,
    gameState.totalPower,
    gameState.prestigeLevel,
    gameState.upgrades,
  );

  const isMaxed = item.maxPurchases && currentLevel >= item.maxPurchases;
  
  const requiredUpgradeIds = getRequiredUpgradeIds(item);
  const hasRequiredUpgrades = requiredUpgradeIds.length === 0 || requiredUpgradeIds.some(id => (gameState.upgrades[id] || 0) > 0);
  const needsUpgrades = requiredUpgradeIds.length > 0 && !hasRequiredUpgrades;
  const requiredUpgradeNames = getRequiredUpgradeNames(item);

  const handleBuy = () => {
    if (canPurchase) {
      buySpecialItem(item.id);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "upgrade_boost": return "⚡";
      case "global": return "🌟";
      case "special": return "✨";
      case "automation": return "🤖";
      default: return "🎯";
    }
  };

  const getCategoryAccent = (category: string) => {
    switch (category) {
      case "upgrade_boost": return {
        badge: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 border-yellow-300 dark:border-yellow-600",
        button: "bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-600 dark:text-yellow-400",
        effect: "text-yellow-600 dark:text-yellow-400 bg-yellow-500/20 dark:bg-yellow-500/30"
      };
      case "global": return {
        badge: "bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 border-purple-300 dark:border-purple-600",
        button: "bg-purple-500/20 hover:bg-purple-500/30 text-purple-600 dark:text-purple-400",
        effect: "text-purple-600 dark:text-purple-400 bg-purple-500/20 dark:bg-purple-500/30"
      };
      case "special": return {
        badge: "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border-blue-300 dark:border-blue-600",
        button: "bg-blue-500/20 hover:bg-blue-500/30 text-blue-600 dark:text-blue-400",
        effect: "text-blue-600 dark:text-blue-400 bg-blue-500/20 dark:bg-blue-500/30"
      };
      case "automation": return {
        badge: "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-green-300 dark:border-green-600",
        button: "bg-green-500/20 hover:bg-green-500/30 text-green-600 dark:text-green-400",
        effect: "text-green-600 dark:text-green-400 bg-green-500/20 dark:bg-green-500/30"
      };
      default: return {
        badge: "bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-300 border-neutral-300 dark:border-neutral-600",
        button: "bg-neutral-500/20 hover:bg-neutral-500/30 text-neutral-600 dark:text-neutral-400",
        effect: "text-neutral-600 dark:text-neutral-400 bg-neutral-500/20 dark:bg-neutral-500/30"
      };
    }
  };

  const accent = getCategoryAccent(item.category);

  const getUnlockedSpecialItemsCount = (totalPower: number) => {
    return getAllSpecialItems()
      .sort((a, b) => (a.unlockRequirement || 0) - (b.unlockRequirement || 0))
      .filter(specialItem => isSpecialItemUnlocked(specialItem, totalPower, gameState.prestigeLevel)).length;
  };

  const shouldShowPowerTag = (effect: string) => {
    return effect.includes("x") || effect.includes("/s") || effect.includes("Clicks");
  };

  const getDynamicEffectText = (item: SpecialItem, currentLevel: number) => {
    if (currentLevel === 0) return item.effect;
    // If there are purchased specials, use the static gains
    if (purchasedSpecials.length > 0) {
      switch (item.effect) {
        case SPECIAL_ITEM_EFFECTS.GLOBAL_1_5X:
        case SPECIAL_ITEM_EFFECTS.GLOBAL_2X:
        case SPECIAL_ITEM_EFFECTS.GLOBAL_3X:
        case SPECIAL_ITEM_EFFECTS.GLOBAL_5X:
        case SPECIAL_ITEM_EFFECTS.GLOBAL_10X:
        case SPECIAL_ITEM_EFFECTS.CAFFEINE_BOOST:
          return `x${totalEffectMultiplier.toFixed(1)} Global`;
        case SPECIAL_ITEM_EFFECTS.AI_INTERN_BOOST:
          return `x${totalEffectMultiplier.toFixed(1)} AI Intern`;
        case SPECIAL_ITEM_EFFECTS.JUNIOR_DEV_BOOST:
          return `x${totalEffectMultiplier.toFixed(1)} Junior Dev`;
        case SPECIAL_ITEM_EFFECTS.AI_ML_BOOST:
          return `x${totalEffectMultiplier.toFixed(1)} AI/ML`;
        case SPECIAL_ITEM_EFFECTS.DEVOPS_BOOST:
          return `x${totalEffectMultiplier.toFixed(1)} DevOps`;
        case SPECIAL_ITEM_EFFECTS.CLOUD_BOOST:
          return `x${totalEffectMultiplier.toFixed(1)} Cloud`;
        default:
          return item.effect;
      }
    }
    // Sinon, fallback dynamique
    switch (item.effect) {
      case SPECIAL_ITEM_EFFECTS.GLOBAL_1_5X:
      case SPECIAL_ITEM_EFFECTS.GLOBAL_2X:
      case SPECIAL_ITEM_EFFECTS.GLOBAL_3X:
      case SPECIAL_ITEM_EFFECTS.GLOBAL_5X:
      case SPECIAL_ITEM_EFFECTS.GLOBAL_10X:
      case SPECIAL_ITEM_EFFECTS.CAFFEINE_BOOST: {
        const baseMultiplier = getSpecialItemMultiplier(item, gameState.prestigeLevel, gameState.totalPower);
        const actualMultiplier = Math.pow(baseMultiplier, currentLevel);
        return `x${actualMultiplier.toFixed(1)} Global`;
      }
      
      case SPECIAL_ITEM_EFFECTS.AI_INTERN_BOOST: {
        const baseMultiplier = getSpecialItemMultiplier(item, gameState.prestigeLevel, gameState.totalPower);
        const actualMultiplier = Math.pow(baseMultiplier, currentLevel);
        return `x${actualMultiplier.toFixed(1)} AI Intern`;
      }
      
      case SPECIAL_ITEM_EFFECTS.JUNIOR_DEV_BOOST: {
        const baseMultiplier = getSpecialItemMultiplier(item, gameState.prestigeLevel, gameState.totalPower);
        const actualMultiplier = Math.pow(baseMultiplier, currentLevel);
        return `x${actualMultiplier.toFixed(1)} Junior Dev`;
      }
      
      case SPECIAL_ITEM_EFFECTS.AI_ML_BOOST: {
        const baseMultiplier = getSpecialItemMultiplier(item, gameState.prestigeLevel, gameState.totalPower);
        const actualMultiplier = Math.pow(baseMultiplier, currentLevel);
        return `x${actualMultiplier.toFixed(1)} AI/ML`;
      }
      
      case SPECIAL_ITEM_EFFECTS.DEVOPS_BOOST: {
        const baseMultiplier = getSpecialItemMultiplier(item, gameState.prestigeLevel, gameState.totalPower);
        const actualMultiplier = Math.pow(baseMultiplier, currentLevel);
        return `x${actualMultiplier.toFixed(1)} DevOps`;
      }
      
      case SPECIAL_ITEM_EFFECTS.CLOUD_BOOST: {
        const baseMultiplier = getSpecialItemMultiplier(item, gameState.prestigeLevel, gameState.totalPower);
        const actualMultiplier = Math.pow(baseMultiplier, currentLevel);
        return `x${actualMultiplier.toFixed(1)} Cloud`;
      }
      
      case SPECIAL_ITEM_EFFECTS.GOLDEN_CLICK: {
        const chance = GAME_CONFIG.SPECIAL_ABILITIES.GOLDEN_CLICK_CHANCE * currentLevel * 100;
        return `${Math.min(chance, 100).toFixed(0)}% chance x100 click`;
      }
      
      case SPECIAL_ITEM_EFFECTS.LUCKY_STREAK: {
        const chance = GAME_CONFIG.SPECIAL_ABILITIES.LUCKY_STREAK_CHANCE * currentLevel * 100;
        return `${Math.min(chance, 100).toFixed(0)}% chance x50 click`;
      }
      
      default:
        return item.effect;
    }
  };

  return (
    <UnlockBlurWrapper 
      isUnlocked={isUnlocked} 
      index={index} 
      getUnlockedCount={getUnlockedSpecialItemsCount}
    >
      {!isUnlocked ? (
        <Card className="rounded-none p-3 border-1 transition-colors mb-0">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">{getCategoryIcon(item.category)}</span>
                <h3 className="font-semibold text-neutral-600 dark:text-neutral-400">{item.name} 🔒</h3>
              </div>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-2">
                Requires {formatNumber((gameState.prestigeLevel > 0 ? Math.floor((item.unlockRequirement || 0) * Math.pow(2, Math.min(gameState.prestigeLevel, 10))) : (item.unlockRequirement || 0)))} total power
              </p>
            </div>
          </div>
        </Card>
      ) : (
        <Card className="rounded-none p-3 border-1 transition-colors mb-0">
          <div className={cn("flex items-center justify-between")}>
            <div className="flex-1">
              <div className="flex items-center gap-1.5">
                <span>{getCategoryIcon(item.category)}</span>
                {currentLevel > 0 && !isMaxed && (
                  <span className={cn("text-xs px-1.5 py-0.5 rounded-sm border", accent.badge)}>
                    x{currentLevel}
                  </span>
                )}

                <h3 className="font-semibold text-neutral-800 dark:text-neutral-200">{item.name}</h3>
              </div>

              <p className="text-xs text-neutral-600 dark:text-neutral-400 mb-2">{item.description}</p>
              
              {needsUpgrades && (
                <p className="text-xs text-red-600 dark:text-red-400 mb-2">
                  Requires: {requiredUpgradeNames.slice(0, 2).join(", ")}
                  {requiredUpgradeNames.length > 2 ? "..." : ""}
                </p>
              )}

              <div className={cn("flex items-center select-none", {
                "justify-between": item.effect !== item.name,
                "justify-end": item.effect === item.name
              })}>
                {(() => {
                  const dynamicEffect = getDynamicEffectText(item, currentLevel);
                  return shouldShowPowerTag(dynamicEffect) ? (
                    <div className={cn(
                      "text-xs font-medium px-1.5 py-0.5", 
                      currentLevel > 0 ? accent.effect : "text-neutral-500 bg-neutral-200"
                    )}>
                      <PowerTag imageProps={{ width: 12, height: 12, className: cn("mb-0.5 ml-1", {
                        "neutralscale": currentLevel === 0
                      }) }}>
                        {dynamicEffect}
                      </PowerTag>
                    </div>
                  ) : (
                    <div className={cn("text-xs font-medium px-1.5 py-0.5", {
                      "text-neutral-500 dark:text-neutral-400 bg-neutral-200 dark:bg-neutral-700": currentLevel === 0,
                      [accent.effect]: currentLevel > 0,

                      "hidden": dynamicEffect === item.name
                    })}>
                      {dynamicEffect}
                    </div>
                  );
                })()}

                {!isMaxed ? (
                  <button
                    onClick={handleBuy}
                    disabled={!canPurchase}
                    className={cn("text-xs font-medium px-1.5 py-0.5 transition-colors", {
                      "bg-green-500/20 hover:bg-green-500/30 text-green-600 dark:text-green-400": canPurchase && gameState.prestigeLevel == 0,
                      "bg-purple-500/20 hover:bg-purple-500/30 text-purple-600 dark:text-purple-400": canPurchase && gameState.prestigeLevel > 0,
                      //
                      "bg-neutral-200 dark:bg-neutral-700 text-neutral-500 dark:text-neutral-400 hover:bg-red-200 dark:hover:bg-red-900/30 hover:text-red-500 dark:hover:text-red-400 cursor-not-allowed": !canPurchase
                    })}
                  >
                    {canPurchase ? (
                      <PowerTag imageProps={{ width: 12, height: 12, className: "mb-0.5 ml-1" }}>
                        Buy {formatNumber(staticCost)}
                      </PowerTag>
                    ) : (
                      <PowerTag imageProps={{ width: 12, height: 12, className: "mb-0.5 ml-1 neutralscale" }}>
                        Need {formatNumber(staticCost)}
                      </PowerTag>
                    )}
                  </button>
                ) : (
                  <span className={cn("text-xs font-medium px-1.5 py-0.5", {
                    "bg-green-500/20 dark:bg-green-500/30 text-green-600 dark:text-green-400": gameState.prestigeLevel == 0,
                    "bg-purple-500/20 dark:bg-purple-500/30 text-purple-600 dark:text-purple-400": gameState.prestigeLevel > 0
                  })}>
                    ✓ Maxed
                  </span>
                )}
              </div>
            </div>
          </div>
        </Card>
      )}
      {queueError && (
        <div className="text-xs text-red-600 mt-1">{queueError}</div>
      )}
    </UnlockBlurWrapper>
  );
};
