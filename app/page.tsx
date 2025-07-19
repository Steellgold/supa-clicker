"use client"

import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { RetroClickerButton } from "@/components/ui/retro-clicker-button"
import { Menu } from "lucide-react"
import { useRef } from "react"
import { useAuth } from "@/lib/auth/auth-context"
import { AuthModal } from "@/components/auth/auth-modal"
import { useGameData } from "@/lib/hooks/use-game-data"
import type { Component } from "@/type/component"

const Home: Component<object> = () => {
  const leftPanelRef = useRef<HTMLDivElement>(null)
  const { user } = useAuth()
  const { gameData, incrementScore, loading: gameLoading } = useGameData()

  const handleClick = () => {
    // incrementScore(1)
    const rand = Math.random()
    const isPlatinum = rand < 0.05
    const isGolden = !isPlatinum && rand < 0.2
    incrementScore(isPlatinum ? 20 : isGolden ? 5 : 1)
    return {
      gained: isPlatinum ? 20 : isGolden ? 5 : 1,
      isGolden,
      isPlatinum
    }
  }

  return (
    <>
      <Header />

      <div className="flex h-[calc(100vh-70px)]">
        <div ref={leftPanelRef} className="flex-1 relative bg-neutral-50 dark:bg-neutral-900 flex flex-col items-center justify-center p-8 transition-colors">
          <div className="text-center space-y-6">
            <div className="space-y-4">
              {gameData && (
                <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  Score: {gameData.score}
                </div>
              )}

              <RetroClickerButton
                onClick={handleClick}
                disabled={gameLoading}
              />
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

            {/*
              TODO: Add upgrades, specials, and other game features here
            */}
          </div>
        </div>
      </div>
    </>
  )
}

export default Home
