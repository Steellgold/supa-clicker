"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { useGameContext } from "@/lib/providers/game-provider";
import { cn } from "@/lib/utils";
import { Component } from "@/type/component";
import { Check, Lock, Trophy } from "lucide-react";
import React, { useEffect } from "react";
import { Badge } from "./ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { Achievement } from "@clicker/game/types";

type AchievementsDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const rarityConfig = {
  common: { 
    color: "bg-gray-100 text-gray-800 border-gray-300",
    bgColor: "bg-gray-50",
    textColor: "text-gray-700"
  },
  rare: { 
    color: "bg-blue-100 text-blue-800 border-blue-300",
    bgColor: "bg-blue-50",
    textColor: "text-blue-700"
  },
  epic: { 
    color: "bg-purple-100 text-purple-800 border-purple-300",
    bgColor: "bg-purple-50",
    textColor: "text-purple-700"
  },
  legendary: { 
    color: "bg-yellow-100 text-yellow-800 border-yellow-300",
    bgColor: "bg-yellow-50",
    textColor: "text-yellow-700"
  },
};

const categoryConfig = {
  clicking: { name: "Clicking", icon: "👆", color: "bg-red-100 text-red-800 border-red-300" },
  upgrades: { name: "Upgrades", icon: "⬆️", color: "bg-emerald-100 text-emerald-800 border-emerald-300" },
  prestige: { name: "Prestige", icon: "⭐", color: "bg-blue-100 text-blue-800 border-blue-300" },
  power: { name: "Power", icon: "⚡", color: "bg-yellow-100 text-yellow-800 border-yellow-300" },
  special: { name: "Special", icon: "🎯", color: "bg-purple-100 text-purple-800 border-purple-300" },
  challenge: { name: "Challenge", icon: "💪", color: "bg-pink-100 text-pink-800 border-pink-300" },
  speed: { name: "Speed", icon: "🚀", color: "bg-cyan-100 text-cyan-800 border-cyan-300" },
  time: { name: "Time", icon: "⏰", color: "bg-pink-100 text-pink-800 border-pink-300" },
  efficiency: { name: "Efficiency", icon: "💡", color: "bg-green-100 text-green-800 border-green-300" },
  tech: { name: "Tech", icon: "🔧", color: "bg-teal-100 text-teal-800 border-teal-300" },
  milestone: { name: "Milestone", icon: "🏆", color: "bg-lime-100 text-lime-800 border-lime-300" },
  combo: { name: "Combo", icon: "🔄", color: "bg-orange-100 text-orange-800 border-orange-300" },
};

interface AchievementCardProps {
  achievement: Achievement;
  isUnlocked: boolean;
}

const AchievementCard: Component<AchievementCardProps> = ({ achievement, isUnlocked }) => {
  const rarity = rarityConfig[achievement.rarity] || rarityConfig.common;
  const category = categoryConfig[achievement.category];
  
  return (
    // <div className={`
    //   p-4 border-2 transition-all duration-200 hover:shadow-md
    //   ${isUnlocked 
    //     ? 'border-green-400 bg-green-50 dark:bg-green-900/20' 
    //     : 'border-neutral-300 dark:border-neutral-600 bg-neutral-50 dark:bg-neutral-800/50 opacity-70'
    //   }
    // `}>
    <div className={cn("p-3 border-2", {
      "border-green-400 bg-green-100 dark:bg-green-800 shadow-[3px_3px_0_#5aa761]": isUnlocked,
      "border-neutral-400 bg-neutral-100 dark:bg-neutral-700 opacity-70 shadow-[3px_3px_0_#c4c4c4]": !isUnlocked
    })}>
      <div className="flex items-start gap-3">
        <div className={cn("w-10 h-10 flex items-center justify-center text-2xl border-2 flex-shrink-0", {
          "border-green-400 bg-green-100 dark:bg-green-800": isUnlocked,
          "border-neutral-400 bg-neutral-100 dark:bg-neutral-700": !isUnlocked
        })}>
          {isUnlocked ? achievement.icon : <Lock className="w-6 h-6 text-neutral-500" />}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className={cn("font-bold text-sm truncate", {
              "text-green-800 dark:text-green-200": isUnlocked,
              "text-neutral-600 dark:text-neutral-400": !isUnlocked
            })}>
              {achievement.name}
            </h3>
          </div>
          
          <p className={cn("text-xs", {
            "mb-3": category || rarity,
            "text-green-700 dark:text-green-300": isUnlocked,
            "text-neutral-500 dark:text-neutral-500": !isUnlocked
          })}>
            {achievement.description}
          </p>

          {(category || rarity) && (
            <div className="flex items-center gap-1">
              {category && (
                <Badge className={`text-xs ${category.color}`}>
                  <span>{category.icon}</span>
                  {category.name}
                </Badge>
              )}

              {achievement.rarity && (
                <Badge className={`text-xs ${rarity.color}`}>
                  <span className="capitalize">{achievement.rarity}</span>
                </Badge>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const AchievementsDialog: Component<AchievementsDialogProps> = ({ open, onOpenChange }) => {
  const { achievements, unlockedAchievements, lockedAchievements, isLoadingAchievements, refreshAchievements } = useGameContext();

  useEffect(() => {
    if (open) {
      refreshAchievements();
    }
  }, [open]);

  const unlockedCount = unlockedAchievements.length;
  const totalCount = achievements.length;
  const completionPercentage = totalCount > 0 ? Math.round((unlockedCount / totalCount) * 100) : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-4xl h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trophy className="w-4 h-4" />
            Achievements
          </DialogTitle>
          <DialogDescription>
            <span className="text-neutral-500">{unlockedCount}/{totalCount}</span>
            <span className="ml-2 text-xs text-neutral-400">({completionPercentage}%)</span>
          </DialogDescription>
            
            {/* <div className="flex items-center gap-3"> */}
              {/* <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-1"
              >
                <Filter className="w-4 h-4" />
                Filters
              </Button> */}
            {/* </div> */}
        </DialogHeader>

        {/* Filters */}
        {/* {showFilters && (
          <div className="space-y-3 p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg border">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-medium">Category:</span>
              <Button
                variant={selectedCategory === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory("all")}
              >
                All
              </Button>
              {availableCategories.map(category => {
                const config = categoryConfig[category];
                return (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(category)}
                    className="flex items-center gap-1"
                  >
                    {config?.icon} {config?.name || category}
                  </Button>
                );
              })}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-medium">Rarity:</span>
              <Button
                variant={selectedRarity === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedRarity("all")}
              >
                All
              </Button>
              {availableRarities.map(rarity => (
                <Button
                  key={rarity}
                  variant={selectedRarity === rarity ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedRarity(rarity)}
                  className="capitalize"
                >
                  {rarity}
                </Button>
              ))}
            </div>
          </div>
        )} */}

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {isLoadingAchievements ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-neutral-500">Loading achievements...</div>
            </div>
          ) : (
            <ScrollArea className="h-full">
              <div className="space-y-6 py-4">
                {/* Unlocked Achievements */}
                {unlockedAchievements.length > 0 && (
                  <div>
                    <h2 className="text-lg font-bold text-green-700 dark:text-green-300 mb-2 flex items-center gap-2">
                      <Check className="w-5 h-5" />
                      Unlocked ({unlockedAchievements.length})
                    </h2>

                    <div className="grid grid-cols-1 gap-2">
                      {unlockedAchievements.map(achievement => (
                        <AchievementCard
                          key={achievement.id}
                          achievement={achievement}
                          isUnlocked={true}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Locked Achievements */}
                {lockedAchievements.length > 0 && (
                  <div>
                    <h2 className="text-lg font-bold text-neutral-600 dark:text-neutral-400 mb-2 flex items-center gap-2">
                      <Lock className="w-5 h-5" />
                      Locked ({lockedAchievements.length})
                    </h2>
                    <div className="grid grid-cols-1 gap-2">
                      {lockedAchievements.map(achievement => (
                        <AchievementCard
                          key={achievement.id}
                          achievement={achievement}
                          isUnlocked={false}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {unlockedAchievements.length === 0 && lockedAchievements.length === 0 && (
                  <div className="text-center py-12 text-neutral-500">
                    <Trophy className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No achievements found with the selected filters.</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}