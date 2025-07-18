"use client";

import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { useRef } from "react";

const Home = () => {
  const leftPanelRef = useRef<HTMLDivElement>(null);

  return (
    <>
      <Header />

      <div className="flex h-[calc(100vh-70px)]">
        <div ref={leftPanelRef} className="flex-1 relative bg-neutral-50 dark:bg-neutral-900 flex flex-col items-center justify-center p-8 transition-colors">
          <h2 className="text-lg font-semibold">Left Panel</h2>
          <p className="text-sm text-muted-foreground">
            This is the left panel content.
          </p>
        </div>

        <div className="flex-[0.45] border-l-2 border-gray-800 dark:border-gray-200 bg-white dark:bg-gray-800 flex flex-col transition-colors">
          <div className="border-b-2 border-gray-800 dark:border-gray-200 bg-gray-100 dark:bg-gray-700 flex transition-colors">
            <Button size="lg" variant="tabRetro">
              <Menu />
              Upgrades
            </Button>
            <Button size="lg" variant="tabRetro">
              <span className="select-none">⭐</span>{" "}SPÉCIAUX
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;