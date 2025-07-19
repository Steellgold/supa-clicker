"use client"

import { formatDecimal, formatNumber, formatWithSpaces } from "@/lib/numbers";
import { UpgradesTab } from "@/components/tab/upgrades-tab";
import { SpecialsTab } from "@/components/tab/specials-tab";
import { AuthModal } from "@/components/auth/auth-modal";
import { useGame } from "@/lib/providers/game-provider";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/lib/auth/auth-context";
import type { Component } from "@/type/component";
import { PowerTag } from "@/components/power-tag";
import { Button } from "@/components/ui/button";
import { Clicker } from "@/components/clicker";
import { Header } from "@/components/header";
import { Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRef, useState } from "react";

type TabType = "UPGRADES" | "SPECIALS";

const Home: Component<object> = () => {
  const { gameState, handleClick, newAchievements } = useGame();
  const [tab, setTab] = useState<TabType>("UPGRADES");
  const { user } = useAuth();

  const leftPanelRef = useRef<HTMLDivElement>(null);
  
  return (
    <>
      <Header />

      <div className="flex flex-col md:flex-row min-h-screen" style={{ height: "calc(100vh - 70px)" }}>
        <div
          ref={leftPanelRef}
          className="flex-1 relative bg-neutral-50 dark:bg-neutral-900 flex flex-col items-center justify-center transition-colors min-h-[60vh] md:min-h-auto pb-safe-area"
        >
          <div className="text-center space-y-2 p-4 md:p-0 w-full max-w-sm mx-auto">
            <div className={cn("bg-green-300/25 p-3 md:p-4 rounded-lg")}>
              <div className="text-xl md:text-2xl font-bold">
                <PowerTag power={formatWithSpaces(gameState.currentPower)} />
              </div>
            </div>

            <div className="border border-neutral-300 dark:border-neutral-600 rounded-lg p-3 md:p-4 bg-white dark:bg-neutral-800 mb-4 md:mb-6">
              <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4">
                <div className="text-lg md:text-xl font-bold">
                  <PowerTag power={formatDecimal(gameState.rps)} imageProps={{ width: 10, height: 10 }} />
                  <span className="text-xs md:text-sm font-normal">/s</span>
                </div>

                <span className="hidden sm:block text-xl -ml-1.5 -mr-1.5">・</span>

                <div className="text-lg md:text-xl font-bold">
                  <PowerTag power={formatDecimal(gameState.clickPower)} imageProps={{ width: 10, height: 10 }} />
                  <span className="text-xs md:text-sm font-normal">/click</span>
                </div>
              </div>

              <div className="text-sm md:text-md mt-2">
                Total Clicks: <span className="font-bold">{formatNumber(gameState.totalClicks)}</span>
              </div>
            </div>

            <div className="pb-4 md:pb-0">
              <Clicker onClick={handleClick} />
            </div>
          </div>

          {/* Achievements notifications in left panel */}
          <AnimatePresence>
            {newAchievements.map((achievement) => (
              <motion.div
                key={achievement.id}
                initial={{ y: 50, opacity: 0, scale: 0.8 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                exit={{ y: 50, opacity: 0, scale: 0.8 }}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
                className="absolute bottom-5 left-1/2 transform -translate-x-1/2 z-50 bg-green-100 dark:bg-green-900 border-2 border-green-500 rounded-lg p-3 md:p-4 shadow-lg max-w-[280px] md:max-w-xs mx-2"
              >
                <div className="flex items-center gap-2 md:gap-3">
                  <span className="text-xl md:text-2xl">{achievement.icon}</span>
                  <div>
                    <div className="font-mono font-bold text-xs md:text-sm text-green-800 dark:text-green-200">
                      Achievement Unlocked!
                    </div>
                    <div className="font-mono text-xs text-green-700 dark:text-green-300">{achievement.name}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <div className="w-full md:flex-[0.45] border-t-2 md:border-t-0 md:border-l-2 border-neutral-800 dark:border-neutral-200 bg-white dark:bg-neutral-800 flex flex-col transition-colors md:sticky md:top-0">
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
                "flex-1 p-3 md:p-3 font-mono font-bold text-xs md:text-sm transition-colors",
                tab === "SPECIALS"
                  ? "bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                  : "hover:bg-neutral-200 dark:hover:bg-neutral-600 text-neutral-700 dark:text-neutral-300"
              )}
            >
              ⭐ SPECIALS
            </Button>
          </div>

          <div className="p-3 md:p-3 space-y-2 overflow-y-auto flex-1" style={{ maxHeight: "calc(100vh - 70px - 60px)" }}>
            {!user && (
              <div className="p-3 md:p-3 bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-700 rounded-lg text-center">
                <div className="text-xs md:text-sm text-blue-700 dark:text-blue-300 mb-2">💡 Sign in to save your progress in the cloud</div>

                <AuthModal>
                  <Button size="sm" variant="outline">
                    Enable Cloud Save
                  </Button>
                </AuthModal>
              </div>
            )}

            {tab === "UPGRADES" && <UpgradesTab />}
            {tab === "SPECIALS" && <SpecialsTab />}
          </div>
        </div>
      </div>
    </>
  )
}

export default Home