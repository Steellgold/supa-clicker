"use client";

import { Component } from "@/type/component";
import { useBulkBuy } from "@/lib/contexts/bulk-buy-context";
import { useGame } from "@/lib/providers/game-provider";
import { isBulkBuyUnlocked } from "@/lib/features-utils";
import { cn } from "@/lib/utils";

export type BulkBuyOption = 1 | 3 | 5 | 10 | 20 | "MAX";

interface BulkBuySettingsProps {
  maxAffordable?: number;
}

export const BulkBuySettings: Component<BulkBuySettingsProps> = ({
  maxAffordable = 999
}) => {
  const { bulkBuyOption, setBulkBuyOption } = useBulkBuy();
  const { gameState } = useGame();
  
  const isUnlocked = isBulkBuyUnlocked(gameState);
  if (!isUnlocked) return <></>;

  const options: BulkBuyOption[] = [1, 3, 5, 10, 20, "MAX"];

  const getDisplayValue = (option: BulkBuyOption): string => {
    if (option === "MAX") {
      return "MAX";
    }
    return `x${option}`;
  };

  const isOptionDisabled = (option: BulkBuyOption): boolean => {
    if (option === "MAX") return maxAffordable === 0;
    return typeof option === "number" && option > maxAffordable;
  };

  return (
    <div className="flex flex-wrap gap-1 text-xs">
      {options.map((option) => (
        <button
          key={option}
          onClick={() => setBulkBuyOption(option)}
          disabled={isOptionDisabled(option)}
          className={cn(
            "px-2 py-1 text-xs font-medium transition-colors border",
            {
              "bg-green-500/20 text-green-600 border-green-300": bulkBuyOption === option,
              "bg-neutral-100 text-neutral-700 border-neutral-300 hover:bg-green-500/10 hover:text-green-600 hover:border-green-300": 
                bulkBuyOption !== option && !isOptionDisabled(option),
              "bg-neutral-50 text-neutral-400 border-neutral-200 cursor-not-allowed": 
                isOptionDisabled(option),
            }
          )}
        >
          {getDisplayValue(option)}
        </button>
      ))}
    </div>
  );
};
