"use client"

import { PatchNotesDialog } from "@/components/dialogs/patch-notes-dialog";
import { Header } from "@/components/header";
import { DebugPanel } from "@/components/home/debug-panel";
import { MainStatsPanel } from "@/components/home/main-stats-panel";
import { SideTabPanel } from "@/components/home/side-tab-panel";
import { useAuth } from "@/lib/auth/auth-context";
import { useGame } from "@/lib/providers/game-provider";
import { useEffect, useRef, useState } from "react";

type TabType = "UPGRADES" | "SPECIALS" | "LEADERBOARD" | "CHAT";

const Home = () => {
  const { gameState, handleClick, newAchievements } = useGame();
  const [tab, setTab] = useState<TabType>("UPGRADES");
  const { user } = useAuth();

  const leftPanelRef = useRef<HTMLDivElement>(null);
  const [leftPanelWidth, setLeftPanelWidth] = useState<number>(0);

  useEffect(() => {
    function updateWidth() {
      if (leftPanelRef.current) {
        setLeftPanelWidth(leftPanelRef.current.offsetWidth);
      }
    }
    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);
  
  return (
    <>
      <Header />

      <div className="flex flex-col md:flex-row h-full" style={{ height: "calc(100vh - 70px)" }}>
        {process.env.NODE_ENV === "development" && <DebugPanel user={user} />}

        <MainStatsPanel
          gameState={gameState}
          handleClick={handleClick}
          newAchievements={newAchievements}
          leftPanelWidth={leftPanelWidth}
          leftPanelRef={leftPanelRef}
        />

        <SideTabPanel tab={tab} setTab={setTab} user={user} />
      </div>

      <PatchNotesDialog />
    </>
  )
}

export default Home