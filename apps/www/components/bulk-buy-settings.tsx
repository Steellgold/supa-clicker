"use client";

import { useBulkBuy } from "@/lib/contexts/bulk-buy-context";
import { cn } from "@/lib/utils";
import { Component } from "@/type/component";
import { BULK_BUY_OPTIONS, BulkBuyOption } from "@clicker/game/utils";
import { useEffect } from "react";

interface BulkBuySettingsProps {
  affordableCounts: Record<BulkBuyOption, number>;
}

export const BulkBuySettings: Component<BulkBuySettingsProps> = ({ affordableCounts }) => {
  const { bulkBuyOption, setBulkBuyOption } = useBulkBuy();
  
  const getDisplayValue = (option: BulkBuyOption): string => {
    if (option === "MAX") return "MAX";
    return `x${option}`;
  };

  const isOptionDisabled = (option: BulkBuyOption): boolean => {
    if (option === 1) return false;
    return affordableCounts[option] === 0;
  };

  useEffect(() => {
    if (isOptionDisabled(bulkBuyOption)) {
      const currentIndex = BULK_BUY_OPTIONS.indexOf(bulkBuyOption);
      let found = false;
      for (let i = currentIndex - 1; i >= 0; i--) {
        if (!isOptionDisabled(BULK_BUY_OPTIONS[i])) {
          setBulkBuyOption(BULK_BUY_OPTIONS[i]);
          found = true;
          break;
        }
      }

      if (!found) setBulkBuyOption(1);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [affordableCounts, bulkBuyOption, setBulkBuyOption]);

  return (
    <div className="flex flex-wrap gap-1 text-xs">
      {BULK_BUY_OPTIONS.map((option) => (
        <button
          key={option}
          onClick={() => setBulkBuyOption(option)}
          disabled={isOptionDisabled(option)}
          className={cn(
            "px-2 py-1 text-xs font-medium transition-colors border",
            {
              "bg-green-500/20 dark:bg-green-500/30 text-green-600 dark:text-green-400 border-green-300 dark:border-green-600": bulkBuyOption === option,
              "bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border-neutral-300 dark:border-neutral-600 hover:bg-green-500/10 dark:hover:bg-green-500/20 hover:text-green-600 dark:hover:text-green-400 hover:border-green-300 dark:hover:border-green-600": 
                bulkBuyOption !== option && !isOptionDisabled(option),
              "bg-neutral-50 dark:bg-neutral-900 text-neutral-400 dark:text-neutral-500 border-neutral-200 dark:border-neutral-700 cursor-not-allowed": 
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
