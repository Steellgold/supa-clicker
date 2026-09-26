"use client";

import { AchievementNotification } from "@/components/achievement-notification";
import { Clicker } from "@/components/clicker";
import { FarewellScreen } from "@/components/farewell-screen";
import { Header } from "@/components/header";
import { MainStatsPanel } from "@/components/home/main-stats-panel";
import { SideTabPanel } from "@/components/home/side-tab-panel";
import { useSingleplayerGate } from "@/lib/hooks/use-singleplayer-gate";

export default function GamePage() {
  const { hasStarted, isReady, start } = useSingleplayerGate();

  if (!isReady) {
    return <div className="flex-1" />;
  }

  if (!hasStarted) {
    return (
      <div className="flex flex-col h-screen">
        <Header />
        <FarewellScreen onStart={start} />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      <Header />
      <div className="flex flex-1 flex-col md:flex-row overflow-hidden">
        <div className="flex-1 flex flex-col items-center justify-center transition-colors space-y-12">
          <MainStatsPanel />
          <Clicker />
        </div>
        <SideTabPanel />
      </div>

      <AchievementNotification />
    </div>
  );
}
