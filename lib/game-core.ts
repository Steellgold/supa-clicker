/**
 * CENTRALIZED GAME CORE MODULE
 *
 * This module centralizes:
 * - All game constants and configuration
 * - Type definitions
 * - Core game rules and limits
 * - Utility functions
 *
 * Single source of truth for all game mechanics
 */

import { GAME_CONFIG } from "./config/game-config"

// ===============================
// CORE GAME TYPES
// ===============================

export interface GameState {
  totalClicks: number
  totalPower: number
  currentPower: number
  clickPower: number
  pps: number
  upgrades: Record<number, number>
  specialItems: Record<number, number>
  unlockedAchievements: number[]
  lastSaveTime: number
  prestigeLevel: number
  resourcesPerSecond: number
  currentResources: number
  comboCount: number
  comboActive: boolean
  lastClickTime: number
  timeBoostActive: boolean
  timeBoostEndTime: number
  timeBoostMultiplier: number
}

export interface UpgradeDefinition {
  id: number
  name: string
  description: string
  baseCost: number
  costGrowth: number
  ppsGain: number
  clickMultiplier: number
  category: string
  unlockThreshold?: number
}

export interface SpecialItemDefinition {
  id: number
  name: string
  description: string
  baseCost: number
  costGrowth: number
  effect: string
  category: string
  requirements?: {
    minPower?: number
    minTotalPower?: number
    requiredUpgrades?: Record<number, number>
  }
}

export interface GameAction {
  type: "click" | "purchase" | "save" | "load" | "reset"
  payload: Record<string, unknown>
  userId: string
  timestamp: number
}

export interface ValidationResult {
  isValid: boolean
  adjustedValue?: number
  reason?: string
  severity?: "info" | "warning" | "error"
}

// ===============================
// GAME RULES & LIMITS
// ===============================

export const GAME_RULES = {
  // Core progression rules
  PROGRESSION: {
    MIN_CLICK_INTERVAL: 50, // ms
    MIN_PURCHASE_INTERVAL: 100, // ms
    MAX_LEVEL_PER_UPGRADE: 10000,
    MAX_PRESTIGE_LEVEL: 50,
    MAX_COMBO_COUNT: 1000,
    MAX_POWER_INCREASE_PER_SECOND: 1000000,
  },

  // Anti-cheat thresholds
  ANTI_CHEAT: {
    MAX_CLICK_POWER_MULTIPLIER: 200, // Max multiplier for special clicks
    MAX_PPS_MULTIPLIER: 1000, // Max PPS reasonable multiplier
    SUSPICIOUS_POWER_THRESHOLD: 1000000000, // 1B power triggers scrutiny
    MAX_PROGRESSION_JUMP: 100, // Max % increase per action
    TIMESTAMP_TOLERANCE: 5000, // 5 seconds for request validation
  },

  // Special abilities balance
  SPECIAL_ABILITIES: {
    GOLDEN_CLICK: {
      BASE_CHANCE: 0.01, // 1%
      MAX_MULTIPLIER: 100,
      COOLDOWN: 0, // No cooldown
    },
    COMBO_SYSTEM: {
      TIMEOUT: 500, // ms
      INCREMENT_PER_LEVEL: 0.1,
      MAX_MULTIPLIER: 10,
    },
    TIME_BOOST: {
      MIN_DURATION: 5000, // 5 seconds
      MAX_DURATION: 30000, // 30 seconds
      MIN_MULTIPLIER: 1.5,
      MAX_MULTIPLIER: 5,
    },
  },

  // Economic balance
  ECONOMY: {
    COST_GROWTH_MIN: 1.1,
    COST_GROWTH_MAX: 2.5,
    PRESTIGE_COST_REDUCTION_MAX: 0.5, // 50% max reduction
    SPECIAL_ITEM_COST_MULTIPLIER: 2.5,
    POWER_VALIDATION_BUFFER: 1.1, // 10% buffer for calculations
  },
} as const

// ===============================
// VALIDATION UTILITIES
// ===============================

export class GameValidator {
  /**
   * Validate a game action for basic sanity checks
   */
  static validateAction(action: GameAction): ValidationResult {
    const now = Date.now()

    // Timestamp validation
    const timeDiff = Math.abs(now - action.timestamp)
    if (timeDiff > GAME_RULES.ANTI_CHEAT.TIMESTAMP_TOLERANCE) {
      return {
        isValid: false,
        reason: `Timestamp too old: ${timeDiff}ms`,
        severity: "error"
      }
    }

    // User ID validation
    if (!action.userId || typeof action.userId !== "string") {
      return {
        isValid: false,
        reason: "Invalid user ID",
        severity: "error"
      }
    }

    // Action type validation
    const validTypes = ["click", "purchase", "save", "load", "reset", "batch-purchase"]
    if (!validTypes.includes(action.type)) {
      return {
        isValid: false,
        reason: `Invalid action type: ${action.type}`,
        severity: "error"
      }
    }

    return { isValid: true }
  }

  /**
   * Validate power progression increase
   */
  static validatePowerIncrease(
    oldPower: number,
    newPower: number,
    maxExpectedIncrease: number
  ): ValidationResult {
    const increase = newPower - oldPower

    if (increase < 0) {
      return {
        isValid: false,
        reason: "Negative power increase",
        severity: "error"
      }
    }

    if (increase > maxExpectedIncrease) {
      const allowedIncrease = maxExpectedIncrease * GAME_RULES.ECONOMY.POWER_VALIDATION_BUFFER

      if (increase > allowedIncrease) {
        return {
          isValid: false,
          adjustedValue: oldPower + allowedIncrease,
          reason: `Power increase too large: ${increase} > ${allowedIncrease}`,
          severity: "error"
        }
      } else {
        return {
          isValid: true,
          reason: `Power increase within buffer: ${increase}`,
          severity: "warning"
        }
      }
    }

    return { isValid: true }
  }

  /**
   * Validate upgrade purchase
   */
  static validateUpgradePurchase(
    upgradeId: number,
    quantity: number,
    currentLevel: number,
    cost: number,
    availablePower: number
  ): ValidationResult {
    // Quantity validation
    if (quantity <= 0 || quantity > GAME_CONFIG.LIMITS.BULK_BUY_MAX) {
      return {
        isValid: false,
        reason: `Invalid quantity: ${quantity}`,
        severity: "error"
      }
    }

    // Level limit validation
    if (currentLevel + quantity > GAME_RULES.PROGRESSION.MAX_LEVEL_PER_UPGRADE) {
      return {
        isValid: false,
        reason: `Level limit exceeded: ${currentLevel + quantity}`,
        severity: "error"
      }
    }

    // Cost validation
    if (cost > availablePower) {
      return {
        isValid: false,
        reason: `Insufficient funds: ${cost} > ${availablePower}`,
        severity: "error"
      }
    }

    return { isValid: true }
  }
}

// ===============================
// GAME STATE UTILITIES
// ===============================

export class GameStateManager {
  /**
   * Create a default game state
   */
  static createDefaultState(): GameState {
    return {
      totalClicks: 0,
      totalPower: 0,
      currentPower: 0,
      clickPower: 1,
      pps: 0,
      upgrades: {},
      specialItems: {},
      unlockedAchievements: [],
      lastSaveTime: Date.now(),
      prestigeLevel: 0,
      resourcesPerSecond: 0,
      currentResources: 0,
      comboCount: 0,
      comboActive: false,
      lastClickTime: 0,
      timeBoostActive: false,
      timeBoostEndTime: 0,
      timeBoostMultiplier: 1
    }
  }

  /**
   * Validate and sanitize game state
   */
  static sanitizeGameState(state: Partial<GameState>): GameState {
    return {
      totalClicks: Math.max(0, Math.floor(state.totalClicks || 0)),
      totalPower: Math.max(0, Math.floor(state.totalPower || 0)),
      currentPower: Math.max(0, Math.floor(state.currentPower || 0)),
      clickPower: Math.max(1, Math.floor(state.clickPower || 1)),
      pps: Math.max(0, Math.floor(state.pps || 0)),
      upgrades: state.upgrades || {},
      specialItems: state.specialItems || {},
      unlockedAchievements: Array.isArray(state.unlockedAchievements)
        ? state.unlockedAchievements.filter(id => Number.isInteger(id) && id >= 0)
        : [],
      lastSaveTime: Math.max(0, state.lastSaveTime || Date.now()),
      prestigeLevel: Math.max(0, Math.min(
        GAME_RULES.PROGRESSION.MAX_PRESTIGE_LEVEL,
        Math.floor(state.prestigeLevel || 0)
      )),
      resourcesPerSecond: Math.max(0, Math.floor(state.resourcesPerSecond || 0)),
      currentResources: Math.max(0, Math.floor(state.currentResources || 0)),
      comboCount: Math.max(0, Math.min(
        GAME_RULES.PROGRESSION.MAX_COMBO_COUNT,
        Math.floor(state.comboCount || 0)
      )),
      comboActive: Boolean(state.comboActive),
      lastClickTime: Math.max(0, state.lastClickTime || 0),
      timeBoostActive: Boolean(state.timeBoostActive),
      timeBoostEndTime: Math.max(0, state.timeBoostEndTime || 0),
      timeBoostMultiplier: Math.max(1, Math.min(
        GAME_RULES.SPECIAL_ABILITIES.TIME_BOOST.MAX_MULTIPLIER,
        state.timeBoostMultiplier || 1
      ))
    }
  }

  /**
   * Check if game state is suspicious
   */
  static detectSuspiciousActivity(state: GameState): {
    isSuspicious: boolean
    reasons: string[]
    severity: "low" | "medium" | "high"
  } {
    const reasons: string[] = []
    let severity: "low" | "medium" | "high" = "low"

    // Check for unreasonable power levels
    if (state.totalPower > GAME_RULES.ANTI_CHEAT.SUSPICIOUS_POWER_THRESHOLD) {
      reasons.push(`Extremely high total power: ${state.totalPower}`)
      severity = "medium"
    }

    // Check for impossible click power
    if (state.clickPower > state.totalPower * 10) {
      reasons.push(`Click power too high relative to total power`)
      severity = "high"
    }

    // Check for impossible PPS
    if (state.pps > state.totalPower) {
      reasons.push(`PPS exceeds total power`)
      severity = "high"
    }

    // Check prestige level
    if (state.prestigeLevel > GAME_RULES.PROGRESSION.MAX_PRESTIGE_LEVEL) {
      reasons.push(`Prestige level exceeds maximum`)
      severity = "high"
    }

    return {
      isSuspicious: reasons.length > 0,
      reasons,
      severity
    }
  }
}

// ===============================
// RATE LIMITING UTILITIES
// ===============================

export class RateLimiter {
  private static userActions = new Map<string, Map<string, number>>()

  /**
   * Check if action is rate limited
   */
  static isRateLimited(
    userId: string,
    actionType: string,
    minInterval: number
  ): boolean {
    const now = Date.now()

    if (!this.userActions.has(userId)) {
      this.userActions.set(userId, new Map())
    }

    const userActionMap = this.userActions.get(userId)!
    const lastActionTime = userActionMap.get(actionType) || 0

    const timeSinceLastAction = now - lastActionTime

    if (timeSinceLastAction < minInterval) {
      return true // Rate limited
    }

    userActionMap.set(actionType, now)
    return false // Not rate limited
  }

  /**
   * Clear old rate limit data (cleanup)
   */
  static cleanup(maxAge: number = 300000): void { // 5 minutes
    const now = Date.now()

    for (const [userId, actionMap] of this.userActions.entries()) {
      for (const [actionType, timestamp] of actionMap.entries()) {
        if (now - timestamp > maxAge) {
          actionMap.delete(actionType)
        }
      }

      if (actionMap.size === 0) {
        this.userActions.delete(userId)
      }
    }
  }
}

// ===============================
// GAME CONSTANTS EXPORT
// ===============================

export const GAME_CONSTANTS = {
  ...GAME_CONFIG,
  RULES: GAME_RULES,
} as const

// Type exports
export type GameRules = typeof GAME_RULES
export type GameConstants = typeof GAME_CONSTANTS