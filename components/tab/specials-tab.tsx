import { SpecialItemCard } from "@/components/cards/special-item-card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/lib/auth/auth-context";
import { useGame } from "@/lib/providers/game-provider";
import { getAllSpecialItems } from "@/lib/upgrades-specials";
import { formatNumber } from "@/lib/utils";
import { ReactElement } from "react";
import { AuthModal } from "../auth/auth-modal";
import { PowerTag } from "../power-tag";
import { Button } from "../ui/button";

export const SpecialsTab = (): ReactElement => {
  const { gameState } = useGame();
  const { user } = useAuth();

  const allSpecialItems = getAllSpecialItems()
    .sort((a, b) => (a.unlockRequirement || 0) - (b.unlockRequirement || 0));

  if (!user) {
    return (
      <div className="p-3 bg-neutral-100 dark:bg-neutral-900">
        <div className="flex flex-col gap-2 mb-4">
          <span className="text-sm text-neutral-700 dark:text-neutral-300">Oh, you want to see the special items?</span>
          <span className="text-sm text-neutral-700 dark:text-neutral-300">Well, I could let you see them if you sign in</span>
          <span className="text-sm text-neutral-700 dark:text-neutral-300">
            You could even have your name in the leaderboard? Let&apos;s see if you can <b>beat</b> the <b>best!</b>
          </span>
        </div>

        <AuthModal>
          <Button size="sm" variant="retro" className="w-full mb-2">
            Join the community
          </Button>
        </AuthModal>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-row justify-between items-center p-2 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900 dark:to-pink-900 overflow-hidden border-b-2 border-purple-200">
        <span className="text-sm text-purple-700 dark:text-purple-300">
          Total Power:{" "}
          <PowerTag imageProps={{ width: 14, height: 14 }}>
            <span className="font-bold">{formatNumber(gameState.totalPower)}</span>
          </PowerTag>
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