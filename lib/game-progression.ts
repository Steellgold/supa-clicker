/**
 * CENTRALIZED GAME PROGRESSION MODULE
 * 
 * This module contains all mathematical formulas for:
 * - Upgrade costs and scaling
 * - Power generation rates  
 * - Prestige bonuses
 * - Special item effects
 * 
 * All formulas are designed to be:
 * - Balanced and controlled
 * - Non-exploitable
 * - Mathematically sound
 */

import { GAME_CONFIG } from "./config/game-config"

// ===============================
// CORE PROGRESSION FORMULAS
// ===============================

/**
 * Calculate upgrade cost with controlled exponential growth
 * Formula: baseCost * (growth^level) * prestigeReduction
 */
export function calculateUpgradeCost(
  baseCost: number, 
  growthRate: number, 
  currentLevel: number, 
  prestigeLevel: number = 0
): number {
  // Base exponential cost
  const baseCostAtLevel = baseCost * Math.pow(growthRate, currentLevel)
  
  // Prestige reduces costs (but not too much)
  const prestigeReduction = Math.max(0.5, 1 - (prestigeLevel * 0.02)) // Max 50% reduction
  
  return Math.floor(baseCostAtLevel * prestigeReduction)
}

/**
 * Calculate PPS (Power Per Second) gain from upgrade
 * Formula: baseGain * prestigeMultiplier
 */
export function calculateUpgradePPSGain(
  baseGain: number,
  prestigeLevel: number = 0
): number {
  // Controlled prestige scaling
  const prestigeMultiplier = 1 + (prestigeLevel * 0.1) // 10% per prestige level
  
  return baseGain * prestigeMultiplier
}

/**
 * Calculate click multiplier from upgrade
 * Formula: baseMultiplier * prestigeBonus
 */
export function calculateUpgradeClickMultiplier(
  baseMultiplier: number,
  prestigeLevel: number = 0
): number {
  // Controlled prestige scaling for clicks
  const prestigeBonus = 1 + (prestigeLevel * 0.05) // 5% per prestige level
  
  return baseMultiplier * prestigeBonus
}

/**
 * Calculate prestige power multiplier
 * Formula: Exponential but capped growth
 */
export function calculatePrestigeMultiplier(prestigeLevel: number): number {
  if (prestigeLevel === 0) return 1
  
  // Balanced exponential growth with diminishing returns
  const baseMultiplier = 2.5 // Start strong
  const diminishingFactor = Math.pow(0.95, Math.max(0, prestigeLevel - 5)) // Reduce after level 5
  
  return Math.pow(baseMultiplier, prestigeLevel) * diminishingFactor
}

// ===============================
// SPECIAL ITEM FORMULAS
// ===============================

/**
 * Calculate special item cost with steep scaling
 */
export function calculateSpecialItemCost(
  baseCost: number,
  currentLevel: number,
  growthRate: number = 2.5,
  prestigeLevel: number = 0
): number {
  const baseCostAtLevel = baseCost * Math.pow(growthRate, currentLevel)
  
  // Prestige provides small cost reduction for special items
  const prestigeReduction = Math.max(0.8, 1 - (prestigeLevel * 0.01)) // Max 20% reduction
  
  return Math.floor(baseCostAtLevel * prestigeReduction)
}

/**
 * Calculate special item effect multiplier
 */
export function calculateSpecialItemMultiplier(
  baseMultiplier: number,
  prestigeLevel: number = 0,
  totalPower: number = 0
): number {
  // Base multiplier with slight prestige bonus
  let multiplier = baseMultiplier
  
  // Small prestige bonus (avoid overpowered effects)
  multiplier += prestigeLevel * 0.1
  
  // Very small power-based bonus (logarithmic scaling)
  if (totalPower > 1000000) {
    const powerBonus = Math.log10(totalPower / 1000000) * 0.1
    multiplier += Math.min(powerBonus, 1) // Cap at +1
  }
  
  return multiplier
}

// ===============================
// CLICK & POWER FORMULAS
// ===============================

/**
 * Calculate base click power gain
 */
export function calculateClickGain(
  baseClickPower: number,
  totalClickMultiplier: number,
  isSpecialClick: boolean = false,
  specialMultiplier: number = 1,
  comboMultiplier: number = 1
): number {
  let gain = baseClickPower * totalClickMultiplier
  
  if (isSpecialClick) {
    gain *= specialMultiplier
  }
  
  gain *= comboMultiplier
  
  // Always return integer values
  return Math.floor(gain)
}

/**
 * Calculate PPS contribution
 */
export function calculatePPSContribution(
  upgrades: Record<number, number>,
  upgradeDefinitions: Array<{id: number, ppsGain: number}>,
  prestigeLevel: number = 0
): number {
  let totalPPS = 0
  
  upgradeDefinitions.forEach(upgrade => {
    const level = upgrades[upgrade.id] || 0
    if (level > 0) {
      const ppsGain = calculateUpgradePPSGain(upgrade.ppsGain, prestigeLevel)
      totalPPS += ppsGain * level
    }
  })
  
  return totalPPS
}

// ===============================
// VALIDATION & LIMITS
// ===============================

/**
 * Validate progression increases (anti-cheat)
 */
export function validateProgressionIncrease(
  oldValue: number,
  newValue: number,
  maxAllowedIncrease: number,
  context: string = "progression"
): { isValid: boolean; adjustedValue: number; reason?: string } {
  const increase = newValue - oldValue
  
  if (increase < 0) {
    return { isValid: false, adjustedValue: oldValue, reason: `${context}: Negative increase not allowed` }
  }
  
  if (increase > maxAllowedIncrease) {
    const adjustedValue = oldValue + maxAllowedIncrease
    return { 
      isValid: false, 
      adjustedValue, 
      reason: `${context}: Increase ${increase} exceeds limit ${maxAllowedIncrease}` 
    }
  }
  
  return { isValid: true, adjustedValue: newValue }
}

/**
 * Calculate reasonable maximum increase based on current state
 */
export function calculateReasonableMaxIncrease(
  currentPower: number,
  clickPower: number,
  pps: number,
  timeDelta: number = 1000 // 1 second
): {
  maxClickIncrease: number
  maxPPSIncrease: number
  maxTotalIncrease: number
} {
  // Maximum reasonable click increase (accounting for combos and special effects)
  const maxClickIncrease = clickPower * 200 // Allow for special effects
  
  // Maximum PPS increase over time delta
  const maxPPSIncrease = (pps * timeDelta) / 1000
  
  // Maximum total increase (click + PPS + some buffer)
  const maxTotalIncrease = maxClickIncrease + maxPPSIncrease + (currentPower * 0.01)
  
  return {
    maxClickIncrease,
    maxPPSIncrease,
    maxTotalIncrease
  }
}

// ===============================
// GAME BALANCE UTILITIES
// ===============================

/**
 * Check if upgrade purchase would break game balance
 */
export function validateUpgradePurchase(
  quantity: number,
  currentPower: number,
  currentLevel: number,
  upgradeCost: number
): { isValid: boolean; reason?: string } {
  // Check quantity limits
  if (quantity <= 0 || quantity > GAME_CONFIG.LIMITS.BULK_BUY_MAX) {
    return { isValid: false, reason: `Invalid quantity: ${quantity}` }
  }
  
  // Check if user can afford
  if (currentPower < upgradeCost) {
    return { isValid: false, reason: `Insufficient funds: ${currentPower} < ${upgradeCost}` }
  }
  
  // Check level limits (prevent excessive levels)
  const maxLevelPerUpgrade = 10000
  if (currentLevel + quantity > maxLevelPerUpgrade) {
    return { isValid: false, reason: `Level limit exceeded: ${currentLevel + quantity} > ${maxLevelPerUpgrade}` }
  }
  
  return { isValid: true }
}

/**
 * Apply diminishing returns to prevent exponential explosion
 */
export function applyDiminishingReturns(
  value: number,
  threshold: number,
  reductionFactor: number = 0.5
): number {
  if (value <= threshold) return value
  
  const excess = value - threshold
  const diminishedExcess = excess * reductionFactor
  
  return threshold + diminishedExcess
}

// ===============================
// PROGRESSION PRESETS
// ===============================

/**
 * Predefined progression curves for different upgrade categories
 */
export const PROGRESSION_PRESETS = {
  // Standard upgrades (most common)
  STANDARD: {
    costGrowth: 1.15,
    ppsScaling: 1.0,
    clickScaling: 1.0
  },
  
  // Infrastructure upgrades (expensive but powerful)
  INFRASTRUCTURE: {
    costGrowth: 1.18,
    ppsScaling: 1.2,
    clickScaling: 0.8
  },
  
  // Click upgrades (focus on click power)
  CLICK_FOCUSED: {
    costGrowth: 1.2,
    ppsScaling: 0.5,
    clickScaling: 1.5
  },
  
  // Premium upgrades (expensive but balanced)
  PREMIUM: {
    costGrowth: 1.25,
    ppsScaling: 1.1,
    clickScaling: 1.1
  }
} as const

export type ProgressionPreset = keyof typeof PROGRESSION_PRESETS