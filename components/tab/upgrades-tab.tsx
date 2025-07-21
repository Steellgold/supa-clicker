import { BulkBuySettings } from "@/components/bulk-buy-settings";
import { PowerTag } from "@/components/power-tag";
import { ScrollArea } from "@/components/ui/scroll-area";
import { UpgradeCard } from "@/components/upgrade-card";
import { useAuth } from "@/lib/auth/auth-context";
import { isBulkBuyUnlocked } from "@/lib/features-utils";
import { useGame } from "@/lib/providers/game-provider";
import { getAllUpgrades, getRequiredTotalForNext } from "@/lib/upgrades";
import { formatNumber } from "@/lib/utils";
import { ReactElement } from "react";

export const UpgradesTab = (): ReactElement => {
  const { gameState } = useGame();
  const { user } = useAuth();

  const isBBUnlocked = isBulkBuyUnlocked(gameState);

  return (
    <>
      <div className="flex flex-row justify-between items-center p-2 bg-neutral-100 dark:bg-neutral-900 overflow-hidden">
        <span className="text-sm text-neutral-500">
          Total Power: <span className="font-bold">{formatNumber(gameState.totalPower)}</span>
        </span>

        <span className="text-sm text-neutral-500">
          <PowerTag imageProps={{ width: 14, height: 14 }}>
            Next unlock at{" "}
            <span className="font-bold">
              {(() => {
                const requiredPower = getRequiredTotalForNext(gameState.totalPower);
                return requiredPower ? formatNumber(requiredPower) : "Max reached";
              })()}
            </span>
          </PowerTag>
        </span>
      </div>

      {isBBUnlocked && (
        <div className="flex justify-end  border-neutral-200 dark:border-neutral-700">
          <BulkBuySettings />
        </div>
      )}

      <ScrollArea
        style={{
          height: user
            ? `calc(100vh - 70px - 60px - 24px - 20px${isBBUnlocked ? " - 60px" : ""})` // Header - Tabs - Padding - Next unlock section - Bulk buy selector (if unlocked)
            : `calc(100vh - 70px - 60px - 24px - 120px - 60px${isBBUnlocked ? " - 60px" : ""})`, // + Alert section - Bulk buy selector (if unlocked)
          }}
        >
          <div className="flex flex-col gap-2">
            {getAllUpgrades().map((upgrade, index) => (
              <UpgradeCard upgrade={upgrade} index={index} key={upgrade.id} />
            ))}
          </div>
      </ScrollArea>
    </>
  )
}