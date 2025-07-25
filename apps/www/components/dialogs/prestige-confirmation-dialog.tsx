"use client";

import { PowerTag } from "@/components/power-tag";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent, AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from "@/components/ui/alert-dialog";
import { formatDecimal, formatNumber } from "@/lib/utils";
import { formatPrestigeNumber, getPrestigeEstimates } from "@/lib/utils/prestige-client";
import { Component } from "@/type/component";
import { GameState } from "@clicker/game/types";
import { PropsWithChildren } from "react";

type PrestigeConfirmationDialogProps = {
  gameState: GameState;
  onConfirm: () => void;
};

export const PrestigeConfirmationDialog: Component<PropsWithChildren<PrestigeConfirmationDialogProps>> = ({
  children, gameState, onConfirm
}) => {
  const estimates = getPrestigeEstimates(gameState);
  const isFirstPrestige = gameState.prestige_level === 0;
  const nextLevel = gameState.prestige_level + 1;

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        {children}
      </AlertDialogTrigger>
      <AlertDialogContent className="font-mono border-2 border-neutral-800 dark:border-neutral-200 bg-neutral-100 dark:bg-neutral-900">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-purple-800 dark:text-purple-200 font-bold text-center sr-only">
            {isFirstPrestige ? "🌟 UNLOCK PRESTIGE 🌟" : `👑 PRESTIGE TO LEVEL ${nextLevel} 👑`}
          </AlertDialogTitle>
          <div className="text-neutral-700 dark:text-neutral-300 space-y-3">
            {isFirstPrestige ? (
              <>
                <div className="border-2 border-purple-500 bg-purple-50 dark:bg-purple-900/20 p-3 rounded">
                  <h3 className="font-bold text-purple-800 dark:text-purple-200 mb-2">What is Prestige?</h3>
                  <p className="text-sm">
                    Prestige is a powerful reset mechanic that allows you to restart your progress 
                    in exchange for permanent multipliers to all your gains!
                  </p>
                </div>
                
                <div className="border-2 border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded">
                  <h3 className="font-bold text-yellow-800 dark:text-yellow-200 mb-2">Benefits:</h3>
                  <ul className="text-sm space-y-1">
                    <li>• <strong>Permanent multipliers</strong> to all power gains</li>
                    <li>• Access to <strong>higher tier upgrades</strong></li>
                    <li>• <strong>Faster progression</strong> through early stages</li>
                    <li>• <strong>Prestige levels</strong> show your dedication</li>
                  </ul>
                </div>
              </>
            ) : (
              <div className="border-2 border-purple-500 bg-purple-50 dark:bg-purple-900/20 p-3 rounded">
                <h3 className="font-bold text-purple-800 dark:text-purple-200 mb-2">Prestige Upgrade</h3>
                <p className="text-sm">
                  Continue your prestige journey to unlock even greater power multipliers!
                </p>
              </div>
            )}

            <div className="border-2 border-red-500 bg-red-50 dark:bg-red-900/20 p-3 rounded">
              <h3 className="font-bold text-red-800 dark:text-red-200 mb-2">⚠️ WARNING: This will reset:</h3>
              <ul className="text-sm space-y-1">
                <li>• All your current power</li>
                <li>• All upgrades (back to level 0)</li>
                <li>• All special items (back to level 0)</li>
              </ul>
            </div>

            <div className="border-2 border-green-500 bg-green-50 dark:bg-green-900/20 p-3 rounded">
              <h3 className="font-bold text-green-800 dark:text-green-200 mb-2">🎁 You will gain:</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Current multiplier:</span>
                  <span className="font-bold">{formatDecimal(estimates.currentMultiplier)}x</span>
                </div>
                <div className="flex items-center justify-between border-t pt-2">
                  <span className="text-sm">New multiplier:</span>
                  <span className="font-bold text-green-600 dark:text-green-400">
                    {formatDecimal(estimates.newMultiplier)}x
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Improvement:</span>
                  <span className="font-bold text-green-600 dark:text-green-400">
                    +{formatPrestigeNumber(estimates.newMultiplier - estimates.currentMultiplier)}x
                  </span>
                </div>
              </div>
            </div>

            <div className="text-center">
              <PowerTag imageProps={{ width: 16, height: 16, className: "mb-1" }}>
                <span className="font-bold">
                  Current Power: {formatNumber(gameState.power)}
                </span>
              </PowerTag>
            </div>
          </div>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="font-mono border-2 border-neutral-600 bg-neutral-200 dark:bg-neutral-800">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction 
            onClick={onConfirm}
            className="font-mono border-2 border-purple-600 bg-purple-500 hover:bg-purple-600 text-white font-bold"
          >
            {isFirstPrestige ? "UNLOCK PRESTIGE!" : `PRESTIGE TO LV.${nextLevel}!`}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};