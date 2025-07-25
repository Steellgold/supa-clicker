import { Clicker } from "@/components/clicker";
import { Header } from "@/components/header";
import { MainStatsPanel } from "@/components/home/main-stats-panel";
import { SideTabPanel } from "@/components/home/side-tab-panel";

export default function GamePage() {
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
    </div>
  );
}
