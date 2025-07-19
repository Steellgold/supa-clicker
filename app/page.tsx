"use client"

import { formatDecimal, formatNumber, formatWithSpaces } from "@/lib/numbers"
import { getAllUpgrades, getRequiredTotalForNext } from "@/lib/upgrades"
import { ScrollArea } from "@/components/ui/scroll-area"
import { AuthModal } from "@/components/auth/auth-modal"
import { UpgradeCard } from "@/components/upgrade-card"
import { useGame } from "@/lib/providers/game-provider"
import { motion, AnimatePresence } from "framer-motion"
import { useAuth } from "@/lib/auth/auth-context"
import type { Component } from "@/type/component"
import { PowerTag } from "@/components/power-tag"
import { Button } from "@/components/ui/button"
import { Clicker } from "@/components/clicker"
import { Header } from "@/components/header"
import { Menu } from "lucide-react"
import { cn } from "@/lib/utils"
import { useRef } from "react"

const Home: Component<object> = () => {
  const { gameState, handleClick, newAchievements } = useGame()
  const { user } = useAuth()

  const leftPanelRef = useRef<HTMLDivElement>(null)
  
  return (
    <>
      <Header />

      <div className="flex" style={{ height: "calc(100vh - 70px)" }}>
        <div
          ref={leftPanelRef}
          className="flex-1 relative bg-neutral-50 dark:bg-neutral-900 flex flex-col items-center justify-center transition-colors"
        >
          <div className="text-center space-y-1">
            <div className={cn("bg-green-300/25 p-4")}>
              <div className="text-2xl font-bold">
                <PowerTag power={formatWithSpaces(gameState.currentPower)} />
              </div>
            </div>

            <div className="border border-neutral-300 rounded-lg p-4 bg-white dark:bg-neutral-800 mb-6">
              <div className="flex flex-row items-center justify-center gap-4">
                <div className="text-xl font-bold">
                  <PowerTag power={formatDecimal(gameState.rps)} imageProps={{ width: 12, height: 12 }} />
                  <span className="text-sm font-normal">/s</span>
                </div>

                <span className="text-xl -ml-1.5 -mr-1.5">・</span>

                <div className="text-xl font-bold">
                  <PowerTag power={formatDecimal(gameState.clickPower)} imageProps={{ width: 12, height: 12 }} />
                  <span className="text-sm font-normal">/click</span>
                </div>
              </div>

              <div className="text-md">
                Total Clicks: <span className="font-bold">{formatNumber(gameState.totalClicks)}</span>
              </div>
            </div>

            <Clicker onClick={handleClick} />
          </div>

          {/* Achievements notifications in left panel */}
          <AnimatePresence>
            {newAchievements.map((achievement) => (
              <motion.div
                key={achievement.id}
                initial={{ y: -50, opacity: 0, scale: 0.8 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                exit={{ y: -50, opacity: 0, scale: 0.8 }}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
                className="absolute top-5 -left-[105px] transform -translate-x-1/2 z-50 bg-green-100 dark:bg-green-900 border-2 border-green-500 rounded-lg p-4 shadow-lg max-w-xs"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{achievement.icon}</span>
                  <div>
                    <div className="font-mono font-bold text-sm text-green-800 dark:text-green-200">
                      Achievement Unlocked!
                    </div>
                    <div className="font-mono text-xs text-green-700 dark:text-green-300">{achievement.name}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <div className="flex-[0.45] border-l-2 border-neutral-800 dark:border-neutral-200 bg-white dark:bg-neutral-800 flex flex-col transition-colors">
          <div className="border-b-2 border-neutral-800 dark:border-neutral-200 bg-neutral-100 dark:bg-neutral-700 flex transition-colors">
            <Button size="lg" variant="tabRetro">
              <Menu />
              Upgrades
            </Button>
            <Button size="lg" variant="tabRetro">
              <span className="select-none">⭐</span> Specials
            </Button>
          </div>

          <div className="p-3 space-y-2" style={{ height: "calc(100vh - 70px - 60px)" }}>
            {!user && (
              <div className="p-3 bg-blue-50 border-4 border-blue-200 rounded-none text-center">
                <div className="text-sm text-blue-700 mb-2">💡 Sign in to save your progress in the cloud</div>

                <AuthModal>
                  <Button size="sm" variant="outline">
                    Enable Cloud Save
                  </Button>
                </AuthModal>
              </div>
            )}

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
          </div>
        </div>
      </div>
    </>
  )
}

export default Home