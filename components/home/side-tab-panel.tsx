// SideTabPanel.tsx

import { AuthModal } from "@/components/auth/auth-modal";
import { LeaderboardTab } from "@/components/tab/leaderboard-tab";
import { SpecialsTab } from "@/components/tab/specials-tab";
import { UpgradesTab } from "@/components/tab/upgrades-tab";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Component } from "@/type/component";
import type { User } from "@supabase/supabase-js";
import { ChatPanel } from "../chat-panel";
import { TabsHeader } from "./tabs-header";

type TabType = "UPGRADES" | "SPECIALS" | "LEADERBOARD" | "CHAT";

interface SideTabPanelProps {
  tab: TabType;
  setTab: (tab: TabType) => void;
  user: User | null;
}

export const SideTabPanel: Component<SideTabPanelProps> = ({ tab, setTab, user }) => (
  <div className={cn(
    "w-full md:flex-[0.45] border-t-2 md:border-t-0 md:border-l-2 flex flex-col transition-colors z-0 md:z-20",
    "border-neutral-800 dark:border-neutral-200 bg-white dark:bg-neutral-800"
  )}>
    <TabsHeader tab={tab} setTab={setTab} />
    <div className={cn("p-3 md:p-3 space-y-2",
      tab === "CHAT" ? "flex-1 overflow-hidden flex flex-col" : ""
    )}>
      {!user && (
        <div className="p-3 bg-[#f0faff] dark:bg-[#1a2e40] border-4 border-[#507199] dark:border-[#6aa7d1] text-center font-mono text-sm text-[#1a2e40] dark:text-[#cde8ff] rounded-none shadow-[4px_4px_0_#507199]">
          <div className="mb-2">💡 Sign in to save your progress in the cloud</div>
          <AuthModal>
            <Button size="sm" variant="retro">
              Enable Cloud Save
            </Button>
          </AuthModal>
        </div>
      )}

      {tab === "UPGRADES" && <UpgradesTab />}
      {tab === "SPECIALS" && <SpecialsTab />}
      {tab === "LEADERBOARD" && <LeaderboardTab />}
      {tab === "CHAT" && <ChatPanel />}
    </div>
  </div>
);
