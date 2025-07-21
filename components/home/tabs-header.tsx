import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Component } from "@/type/component";
import { Menu } from "lucide-react";

type TabType = "UPGRADES" | "SPECIALS" | "LEADERBOARD";

interface TabsHeaderProps {
  tab: TabType;
  setTab: (tab: TabType) => void;
}

export const TabsHeader: Component<TabsHeaderProps> = ({ tab, setTab }) => (
  <div className="border-b-2 border-neutral-800 dark:border-neutral-200 bg-neutral-100 dark:bg-neutral-700 flex transition-colors sticky top-0 z-10 md:static">
    <Button
      onClick={() => setTab("UPGRADES")}
      variant={"tabRetro"}
      size="lg"
      className={cn(
        "flex-1 p-3 md:p-3 font-mono font-bold text-xs md:text-sm border-r border-neutral-800 dark:border-neutral-200 transition-colors",
        tab === "UPGRADES"
          ? "bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
          : "hover:bg-neutral-200 dark:hover:bg-neutral-600 text-neutral-700 dark:text-neutral-300"
      )}
    >
      <Menu className="w-3 h-3 md:w-4 md:h-4 inline mr-1 md:mr-2" />
      UPGRADES
    </Button>
    <Button
      variant={"tabRetro"}
      size="lg"
      onClick={() => setTab("SPECIALS")}
      className={cn(
        "flex-1 p-3 md:p-3 font-mono font-bold text-xs md:text-sm border-r border-neutral-800 dark:border-neutral-200 transition-colors",
        tab === "SPECIALS"
          ? "bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
          : "hover:bg-neutral-200 dark:hover:bg-neutral-600 text-neutral-700 dark:text-neutral-300"
      )}
    >
      ⭐ SPECIALS
    </Button>
    <Button
      variant={"tabRetro"}
      size="lg"
      onClick={() => setTab("LEADERBOARD")}
      className={cn(
        "flex-1 p-3 md:p-3 font-mono font-bold text-xs md:text-sm transition-colors",
        tab === "LEADERBOARD"
          ? "bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
          : "hover:bg-neutral-200 dark:hover:bg-neutral-600 text-neutral-700 dark:text-neutral-300"
      )}
    >
      🏆 LEADERBOARD
    </Button>
  </div>
); 