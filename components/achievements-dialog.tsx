"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Trophy, Check, Lock } from "lucide-react"
import { useGame } from "@/lib/providers/game-provider"
import { Achievement } from "@/type/game"
import { PropsWithChildren } from "react"

interface AchievementItemProps {
  achievement: Achievement
  isUnlocked: boolean
}

const AchievementItem = ({ achievement, isUnlocked }: AchievementItemProps) => {
  return (
    <div className={`
      flex items-center gap-3 p-4 border-2 transition-all
      ${isUnlocked 
        ? 'border-green-400 bg-green-50 dark:bg-green-900/20' 
        : 'border-neutral-300 dark:border-neutral-600 bg-neutral-50 dark:bg-neutral-800/50'
      }
    `}>
      <div className="flex-shrink-0">
        <div className={`
          w-12 h-12 rounded-none flex items-center justify-center text-2xl border-2
          ${isUnlocked 
            ? 'border-green-400 bg-green-100 dark:bg-green-800' 
            : 'border-neutral-400 bg-neutral-100 dark:bg-neutral-700'
          }
        `}>
          {isUnlocked ? achievement.icon : <Lock className="w-6 h-6 text-neutral-500" />}
        </div>
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h3 className={`font-bold text-sm ${isUnlocked ? 'text-green-800 dark:text-green-200' : 'text-neutral-600 dark:text-neutral-400'}`}>
            {achievement.name}
          </h3>
          {isUnlocked && <Check className="w-4 h-4 text-green-600" />}
        </div>
        <p className={`text-xs ${isUnlocked ? 'text-green-700 dark:text-green-300' : 'text-neutral-500 dark:text-neutral-500'}`}>
          {achievement.description}
        </p>
      </div>
    </div>
  )
}

export const AchievementsDialog = ({ children }: PropsWithChildren) => {
  const { allAchievements, unlockedAchievements, unlockedCount, totalAchievements, completionPercentage } = useGame()
  
  const unlockedIds = unlockedAchievements.map(a => a.id)
  const lockedAchievements = allAchievements.filter(a => !unlockedIds.includes(a.id))

  return (
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>

      <DialogContent className="w-full max-w-2xl h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5" />
            Achievements
          </DialogTitle>
          <DialogDescription>
            Progress: {unlockedCount} / {totalAchievements} ({completionPercentage}% complete)
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="space-y-6 py-4">
              {unlockedAchievements.length > 0 && (
                <div>
                  <h2 className="text-lg font-bold text-green-700 dark:text-green-300 mb-3 flex items-center gap-2">
                    <Check className="w-5 h-5" />
                    Unlocked ({unlockedAchievements.length})
                  </h2>
                  <div className="space-y-2">
                    {unlockedAchievements.map(achievement => (
                      <AchievementItem
                        key={achievement.id}
                        achievement={achievement}
                        isUnlocked={true}
                      />
                    ))}
                  </div>
                </div>
              )}

              {lockedAchievements.length > 0 && (
                <div>
                  <h2 className="text-lg font-bold text-neutral-600 dark:text-neutral-400 mb-3 flex items-center gap-2">
                    <Lock className="w-5 h-5" />
                    Locked ({lockedAchievements.length})
                  </h2>
                  <div className="space-y-2">
                    {lockedAchievements.map(achievement => (
                      <AchievementItem
                        key={achievement.id}
                        achievement={achievement}
                        isUnlocked={false}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  )
}
