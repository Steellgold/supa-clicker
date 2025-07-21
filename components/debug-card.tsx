"use client";

import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { markDebugModified } from "@/lib/debug-utils";
import { useGame } from "@/lib/providers/game-provider";
import { getAllUpgrades } from "@/lib/upgrades";
import { SPECIAL_ITEMS } from "@/lib/upgrades-specials";
import { cn, formatNumber } from "@/lib/utils";
import { Component } from "@/type/component";
import { GameState } from "@/type/game";
import { Bug, Crown, Settings, Target, Timer, Trash2, Zap } from "lucide-react";
import type { PropsWithChildren, ReactElement } from "react";
import { useCallback, useState } from "react";

export const DebugCard = (): ReactElement => {
  const { gameState, setGameState } = useGame();
  const [selectedTab, setSelectedTab] = useState<'basic' | 'upgrades' | 'specials' | 'advanced'>('basic');

  const updateGameState = useCallback((updates: Partial<GameState>) => {
    setGameState({ ...gameState, ...updates });
    markDebugModified();
  }, [setGameState, gameState]);

  const updateBasicStat = (field: keyof GameState, value: number) => {
    updateGameState({ [field]: Math.max(0, value) });
  };

  const updateUpgrade = (upgradeId: number, level: number) => {
    updateGameState({
      upgrades: {
        ...gameState.upgrades,
        [upgradeId]: Math.max(0, level)
      }
    });
  };

  const updateSpecialItem = (itemId: number, level: number) => {
    updateGameState({
      specialItems: {
        ...gameState.specialItems,
        [itemId]: Math.max(0, level)
      }
    });
  };

  const resetAllUpgrades = () => {
    updateGameState({ upgrades: {} });
  };

  const resetAllSpecials = () => {
    updateGameState({ specialItems: {} });
  };

  const maxAllUpgrades = () => {
    const maxUpgrades: Record<number, number> = {};
    getAllUpgrades().forEach(upgrade => {
      maxUpgrades[upgrade.id] = 999;
    });
    updateGameState({ upgrades: maxUpgrades });
  };

  const giveRichStart = () => {
    updateGameState({
      currentPower: 1e9, // 1 billion
      totalPower: 1e9,
      clickPower: 1000,
      pps: 10000,
      totalClicks: 100000
    });
  };

  const givePrestigeReady = () => {
    updateGameState({
      totalPower: 1e8, // 100 million (prestige threshold)
      currentPower: 1e7,
    });
  };

  if (process.env.NODE_ENV !== 'development') {
    return <></>;
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex flex-col items-center gap-2 mb-2 bg-red-50 dark:bg-red-900/10 p-2 border-b-2 border-red-300">
        <div className="flex items-center gap-2">
          <Bug className="w-4 h-4 text-red-600" />
          <span className="font-bold text-red-800 dark:text-red-200 text-sm uppercase">
            Debug Panel
          </span>
        </div>
      </div>

      <div className="flex flex-col mb-2 border-b border-red-300 flex-shrink-0">
        {[
          { key: 'basic', label: 'Basic Stats', icon: Settings },
          { key: 'upgrades', label: 'Upgrades', icon: Zap },
          { key: 'specials', label: 'Specials', icon: Crown },
          { key: 'advanced', label: 'Advanced', icon: Target }
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setSelectedTab(key as 'basic' | 'upgrades' | 'specials' | 'advanced')}
            className={cn(
              "px-3 py-2 text-xs font-medium transition-colors flex items-center gap-1",
              selectedTab === key
                ? "bg-red-500 text-white"
                : "text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-800/30"
            )}
          >
            <Icon className="w-3 h-3" />
            {label}
          </button>
        ))}

        <ProfileResetButton>
          <button className="px-3 py-2 text-xs font-medium transition-colors flex items-center gap-1 hover:bg-red-200 dark:hover:bg-red-800/30 text-red-700 dark:text-red-300">
            100% Profile Reset
          </button>
        </ProfileResetButton>
      </div>

      <div className="flex-1 overflow-hidden">
        <div className="h-full p-4">
          {selectedTab === 'basic' && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-red-700 dark:text-red-300 block mb-1">
                    Current Power ({formatNumber(gameState.currentPower)})
                  </label>
                  <Input
                    type="number"
                    value={gameState.currentPower}
                    onChange={(e) => updateBasicStat('currentPower', Number(e.target.value))}
                    className="text-xs h-8 border-red-300"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-red-700 dark:text-red-300 block mb-1">
                    Total Power ({formatNumber(gameState.totalPower)})
                  </label>
                  <Input
                    type="number"
                    value={gameState.totalPower}
                    onChange={(e) => updateBasicStat('totalPower', Number(e.target.value))}
                    className="text-xs h-8 border-red-300"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-red-700 dark:text-red-300 block mb-1">
                    Click Power ({formatNumber(gameState.clickPower)})
                  </label>
                  <Input
                    type="number"
                    value={gameState.clickPower}
                    onChange={(e) => updateBasicStat('clickPower', Number(e.target.value))}
                    className="text-xs h-8 border-red-300"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-red-700 dark:text-red-300 block mb-1">
                    pps ({formatNumber(gameState.pps)})
                  </label>
                  <Input
                    type="number"
                    value={gameState.pps}
                    onChange={(e) => updateBasicStat('pps', Number(e.target.value))}
                    className="text-xs h-8 border-red-300"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-red-700 dark:text-red-300 block mb-1">
                    Total Clicks ({formatNumber(gameState.totalClicks)})
                  </label>
                  <Input
                    type="number"
                    value={gameState.totalClicks}
                    onChange={(e) => updateBasicStat('totalClicks', Number(e.target.value))}
                    className="text-xs h-8 border-red-300"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-red-700 dark:text-red-300 block mb-1">
                    Prestige Level ({gameState.prestigeLevel})
                  </label>
                  <Input
                    type="number"
                    value={gameState.prestigeLevel}
                    onChange={(e) => updateBasicStat('prestigeLevel', Number(e.target.value))}
                    className="text-xs h-8 border-red-300"
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-2 pt-2 border-t border-red-300">
                <Button size="sm" variant="destructive" onClick={giveRichStart} className="text-xs">
                  💰 Rich Start (1B Power)
                </Button>
                <Button size="sm" variant="destructive" onClick={givePrestigeReady} className="text-xs">
                  👑 Prestige Ready (100M Total)
                </Button>
              </div>
            </div>
          )}

          {selectedTab === 'upgrades' && (
            <div className="h-full flex flex-col">
              <div className="flex gap-2 mb-3 flex-shrink-0">
                <Button size="sm" variant="destructive" onClick={maxAllUpgrades} className="text-xs">
                  <Zap className="w-3 h-3 mr-1" />
                  Max All Upgrades
                </Button>
                <Button size="sm" variant="outline" onClick={resetAllUpgrades} className="text-xs border-red-300">
                  <Trash2 className="w-3 h-3 mr-1" />
                  Reset All Upgrades
                </Button>
              </div>
              
              <div className="flex-1 overflow-y-auto">
                <div className="grid grid-cols-1 gap-2">
                  {getAllUpgrades().map(upgrade => (
                    <div key={upgrade.id} className="flex items-center gap-2 bg-white dark:bg-neutral-800 p-2 rounded border">
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-medium truncate">{upgrade.name}</div>
                        <div className="text-xs text-gray-500">ID: {upgrade.id}</div>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-1 rounded">
                          {gameState.upgrades[upgrade.id] || 0}
                        </span>

                        <Input
                          type="number"
                          min="0"
                          value={gameState.upgrades[upgrade.id] || 0}
                          onChange={(e) => updateUpgrade(upgrade.id, Number(e.target.value))}
                          className="w-16 h-6 text-xs p-1"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {selectedTab === 'specials' && (
            <div className="h-full flex flex-col">
              <div className="flex gap-2 mb-3 flex-shrink-0">
                <Button 
                  size="sm" 
                  variant="destructive" 
                  onClick={() => {
                    const maxSpecials: Record<number, number> = {};
                    SPECIAL_ITEMS.forEach(item => {
                      maxSpecials[item.id] = item.maxPurchases || 999;
                    });
                    updateGameState({ specialItems: maxSpecials });
                  }}
                  className="text-xs"
                >
                  <Crown className="w-3 h-3 mr-1" />
                  Max All Specials
                </Button>
                <Button size="sm" variant="outline" onClick={resetAllSpecials} className="text-xs border-red-300">
                  <Trash2 className="w-3 h-3 mr-1" />
                  Reset All Specials
                </Button>
              </div>
              
              <div className="flex-1 overflow-y-auto">
                <div className="grid grid-cols-1 gap-2">
                  {SPECIAL_ITEMS.map(item => (
                    <div key={item.id} className="flex items-center gap-2 bg-white dark:bg-neutral-800 p-2 rounded border">
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-medium truncate">{item.name}</div>
                        <div className="text-xs text-gray-500">ID: {item.id} | Max: {item.maxPurchases || '∞'}</div>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-1 rounded">
                          {gameState.specialItems[item.id] || 0}
                        </span>
                        <Input
                          type="number"
                          min="0"
                          max={item.maxPurchases || 999}
                          value={gameState.specialItems[item.id] || 0}
                          onChange={(e) => updateSpecialItem(item.id, Number(e.target.value))}
                          className="w-16 h-6 text-xs p-1"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {selectedTab === 'advanced' && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-red-700 dark:text-red-300 block mb-1">
                    Combo Count ({gameState.comboCount})
                  </label>
                  <Input
                    type="number"
                    value={gameState.comboCount}
                    onChange={(e) => updateBasicStat('comboCount', Number(e.target.value))}
                    className="text-xs h-8 border-red-300"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-red-700 dark:text-red-300 block mb-1">
                    Time Boost Multiplier ({gameState.timeBoostMultiplier})
                  </label>
                  <Input
                    type="number"
                    step="0.1"
                    value={gameState.timeBoostMultiplier}
                    onChange={(e) => updateBasicStat('timeBoostMultiplier', Number(e.target.value))}
                    className="text-xs h-8 border-red-300"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="timeBoostActive"
                  checked={gameState.timeBoostActive}
                  onChange={(e) => updateGameState({ 
                    timeBoostActive: e.target.checked,
                    timeBoostEndTime: e.target.checked ? Date.now() + 30000 : 0
                  })}
                  className="rounded border-red-300"
                />
                <label htmlFor="timeBoostActive" className="text-xs text-red-700 dark:text-red-300">
                  Time Boost Active
                </label>
              </div>

              <div className="pt-2 border-t border-red-300">
                <Button 
                  size="sm" 
                  variant="destructive" 
                  onClick={() => {
                    updateGameState({
                      comboCount: 100,
                      timeBoostActive: true,
                      timeBoostMultiplier: 10,
                      timeBoostEndTime: Date.now() + 60000,
                    });
                  }}
                  className="text-xs"
                >
                  <Timer className="w-3 h-3 mr-1" />
                  Activate Super Boosts
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const ProfileResetButton: Component<PropsWithChildren> = ({ children }) => {
  const { resetGame } = useGame();
  const [open, setOpen] = useState(false);
  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        {children}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Reset Profile & Game Data?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently erase all your progress, upgrades, specials, stats, and achievements. This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            className="bg-red-700 hover:bg-red-800 text-white"
            onClick={async () => {
              await resetGame();
              setOpen(false);
              window.location.reload();
            }}
          >
            Yes, Reset Everything
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};