/**
 * TRUE anti-cheat system - Server-side validation only
 * Principle: "Never trust the client"
 */

import { GameState } from "../game-core";
import { getUpgradeById } from "../upgrades";

export class ServerSideAntiCheat {
  
  /**
   * Validates a click action
   */
  static validateClick(userId: string, currentGameState: GameState, clickCount: number): boolean {
    const maxClicksPerSecond = 20; // Impossible for a human to exceed
    const timeSinceLastClick = Date.now() - currentGameState.lastClickTime;
   
    // Too many clicks in too little time
    if (clickCount > maxClicksPerSecond && timeSinceLastClick < 1000) {
      console.log(`�� CHEAT DETECTED: ${userId}`);
      return false;
    }

    // Too many clicks too quickly
    if (timeSinceLastClick < 50 && clickCount > 1) { // 50ms minimum between clicks
      console.log(`🚨 CHEAT DETECTED: ${userId} - Clicks too fast`);
      return false;
    }
    
    return true;
  }
  
  /**
   * Validates overall progression
   */
  static validateProgression(oldState: GameState, newState: GameState): boolean {
    const timeDiff = newState.lastSaveTime - oldState.lastSaveTime;
    const maxPowerGainPerSecond = 1000; // Adjust based on your game
    
    const powerGain = newState.totalPower - oldState.totalPower;
    const maxPossibleGain = (timeDiff / 1000) * maxPowerGainPerSecond;
    
    if (powerGain > maxPossibleGain * 1.1) { // 10% margin
      console.log(`🚨 CHEAT DETECTED: Impossible progression`);
      return false;
    }
    
    return true;
  }
  
  /**
   * Action: Server calculates EVERYTHING
   */
  static processClick(userId: string, currentState: GameState): GameState {
    // Server decides the gain, not the client
    const actualClickPower = this.calculateRealClickPower(currentState);
    
    return {
      ...currentState,
      totalClicks: currentState.totalClicks + 1,
      currentPower: currentState.currentPower + actualClickPower,
      totalPower: currentState.totalPower + actualClickPower,
      lastClickTime: Date.now()
    };
  }
  
  private static calculateRealClickPower(state: GameState): number {
    // Server recalculates the true click power
    // Based on legitimate upgrades in base
    let basePower = 1;
    
    // Add upgrade bonuses (verified in base)
    Object.entries(state.upgrades).forEach(([upgradeId, level]) => {
      const upgrade = getUpgradeById(Number(upgradeId));
      if (upgrade) {
        basePower += upgrade.clickMultiplier * level;
      }
    });
    
    return basePower;
  }
}
