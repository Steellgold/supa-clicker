/**
 * Advanced server-side anti-cheat validation
 * Detects impossible progression anomalies
 */

import { GameState } from '@/type/game'

export class AdvancedAntiCheat {
  
  /**
   * Validates the time consistency of the data
   */
  static validateTimeConsistency(gameData: GameState): boolean {
    const now = Date.now()
    const maxTimeDiff = 10 * 60 * 1000 // 10 minutes max
    
    // Timestamps cannot be in the future
    if (gameData.lastSaveTime > now + 60000) return false
    if (gameData.lastClickTime > now + 60000) return false
    
    // Timestamps cannot be too old for an active session
    if (now - gameData.lastSaveTime > maxTimeDiff) return false
    
    return true
  }
  
  /**
   * Validates progression compared to previous data
   */
  static validateProgression(newData: GameState, oldData: GameState | null): boolean {
    if (!oldData) return true
    
    const timeDiff = newData.lastSaveTime - oldData.lastSaveTime
    const maxProgressionPerSecond = 1000 // Ajustable selon ton jeu
    
    // Progression cannot be negative (except reset)
    if (newData.totalPower < oldData.totalPower && newData.totalPower > 0) return false
    if (newData.totalClicks < oldData.totalClicks && newData.totalClicks > 0) return false
    
    // Progression too fast
    const powerGain = newData.totalPower - oldData.totalPower
    const maxPossibleGain = (timeDiff / 1000) * maxProgressionPerSecond
    
    if (powerGain > maxPossibleGain) return false
    
    return true
  }
  
  /**
   * Checks consistency ratios
   */
  static validateRatios(gameData: GameState): boolean {
    // Impossible clicks/power ratio
    if (gameData.totalClicks > 0) {
      const powerPerClick = gameData.totalPower / gameData.totalClicks
      if (powerPerClick > 10000) return false // Max 10k power per click
    }
    
    // Current power cannot exceed total power
    if (gameData.currentPower > gameData.totalPower * 1.1) return false
    
    return true
  }
  
  /**
   * Full validation
   */
  static validateGameData(gameData: GameState, oldData: GameState | null): {
    valid: boolean
    reason?: string
  } {
    if (!this.validateTimeConsistency(gameData)) return { valid: false, reason: 'Invalid timestamps' }
    if (!this.validateProgression(gameData, oldData)) return { valid: false, reason: 'Invalid progression' }
    if (!this.validateRatios(gameData)) return { valid: false, reason: 'Invalid ratios' }
    
    return { valid: true }
  }
}
