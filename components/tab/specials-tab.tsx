import { ReactElement } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatNumber } from "@/lib/utils";
import { useGame } from "@/lib/providers/game-provider";
import { getAllSpecialItems } from "@/lib/upgrades-specials";
import { PowerTag } from "@/components/power-tag";
import { useAuth } from "@/lib/auth/auth-context";
import { SpecialItemCard } from "@/components/special-item-card";

export const SpecialsTab = (): ReactElement => {
  const { gameState } = useGame();
  const { user } = useAuth();

  const allSpecialItems = getAllSpecialItems()
    .sort((a, b) => (a.unlockRequirement || 0) - (b.unlockRequirement || 0));

  return (
    <>
      <div className="flex flex-row justify-between items-center p-2 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900 dark:to-pink-900 overflow-hidden border-b-2 border-purple-200">
        <span className="text-sm text-purple-700 dark:text-purple-300">
          Total Power: <span className="font-bold">{formatNumber(gameState.totalPower)}</span>
        </span>

        <span className="text-sm text-purple-700 dark:text-purple-300">
          {Object.keys(gameState.specialItems).length}/{allSpecialItems.length}
        </span>
      </div>

      <ScrollArea
        style={{
          height: user
            ? "calc(100vh - 70px - 60px - 24px - 20px)" // Header - Tabs - Padding - Special header section
            : "calc(100vh - 70px - 60px - 24px - 120px - 60px)", // + Alert section
        }}
      >
        <div className="flex flex-col gap-2">
          {allSpecialItems.map((item, index) => (
            <SpecialItemCard key={item.id} item={item} index={index} />
          ))}
        </div>
      </ScrollArea>
    </>
  );
}