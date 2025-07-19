import { ReactElement } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatNumber } from "@/lib/numbers";
import { useGame } from "@/lib/providers/game-provider";
import { getAllUpgrades, getRequiredTotalForNext } from "@/lib/upgrades";
import { PowerTag } from "@/components/power-tag";
import { useAuth } from "@/lib/auth/auth-context";
import { UpgradeCard } from "@/components/upgrade-card";

export const UpgradesTab = (): ReactElement => {
  const { gameState } = useGame();
  const { user } = useAuth();

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

      <ScrollArea
        style={{
          height: user
            ? "calc(100vh - 70px - 60px - 24px - 20px)" // Header - Tabs - Padding - Next unlock section
            : "calc(100vh - 70px - 60px - 24px - 120px - 80px)", // + Alert section
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