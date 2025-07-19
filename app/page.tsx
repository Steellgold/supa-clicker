"use client"

import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Menu } from "lucide-react"
import { useRef } from "react"
import { useAuth } from "@/lib/auth/auth-context"
import { AuthModal } from "@/components/auth/auth-modal"
import type { Component } from "@/type/component"
import { useGame } from "@/lib/providers/game-provider"
import { getAllUpgrades } from "@/lib/upgrades"
import { formatDecimal, formatNumber } from "@/lib/numbers"
import { UpgradeCard } from "@/components/upgrade-card"
import { PowerTag } from "@/components/power-tag"
import { Clicker } from "@/components/clicker"

const Home: Component<object> = () => {
  const leftPanelRef = useRef<HTMLDivElement>(null)
  const { user } = useAuth()
  const { gameState, handleClick } = useGame();

  return (
    <>
      <Header />

      <div className="flex h-[calc(100vh-70px)]">
        <div ref={leftPanelRef} className="flex-1 relative bg-neutral-50 dark:bg-neutral-900 flex flex-col items-center justify-center p-8 transition-colors">
          <div className="text-center space-y-6">
            <div className="space-y-4">
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                Score: {formatNumber(gameState.totalClicks)}
              </div>

              <div className="text-lg text-gray-700 dark:text-gray-300">
                R/S:{" "}<PowerTag>{formatDecimal(gameState.rps)}</PowerTag>
              </div>

              <Clicker onClick={handleClick} />
            </div>
          </div>
        </div>

        <div className="flex-[0.45] border-l-2 border-gray-800 dark:border-gray-200 bg-white dark:bg-gray-800 flex flex-col transition-colors">
          <div className="border-b-2 border-gray-800 dark:border-gray-200 bg-gray-100 dark:bg-gray-700 flex transition-colors">
            <Button size="lg" variant="tabRetro">
              <Menu />
              Upgrades
            </Button>
            <Button size="lg" variant="tabRetro">
              <span className="select-none">⭐</span>{" "}Specials
            </Button>
          </div>
          
          <div className="flex-1 space-y-2 p-4">
            {!user && (
              <div className="p-3 bg-blue-50 border-4 border-blue-200 rounded-none text-center">
                <div className="text-sm text-blue-700 mb-2">
                  💡 Sign in to save your progress in the cloud
                </div>
                
                <AuthModal>
                  <Button size="sm" variant="outline">Enable Cloud Save</Button>
                </AuthModal>
              </div>
            )}

            <div className="flex flex-col gap-2">
              {getAllUpgrades().map((upgrade, index) => <UpgradeCard upgrade={upgrade} index={index} key={upgrade.id} />)}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Home
