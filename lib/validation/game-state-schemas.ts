import { z } from 'zod'

/**
 * Zod schema for validating the structure of the game state
 * Replaces manual typeof validations
 */
export const GameStateSchema = z.object({
  totalClicks: z.number().min(0, "Total clicks cannot be negative"),
  totalPower: z.number().min(0, "Total power cannot be negative"), 
  currentPower: z.number().min(0, "Current power cannot be negative"),
  clickPower: z.number().min(1, "Click power must be at least 1"),
  pps: z.number().min(0, "PPS cannot be negative"),
  
  // Objects with numeric keys and numeric values
  upgrades: z.record(z.string(), z.number().min(0, "Upgrade quantity cannot be negative")),
  specialItems: z.record(z.string(), z.number().min(0, "Special item quantity cannot be negative")),
  
  // Arrays and other properties
  unlockedAchievements: z.array(z.number()).default([]),
  lastSaveTime: z.number().min(0, "Invalid timestamp"),
  prestigeLevel: z.number().min(0).max(50, "Prestige level cannot exceed 50"),
  resourcesPerSecond: z.number().min(0, "Resources per second cannot be negative"),
  currentResources: z.number().min(0, "Current resources cannot be negative"),
  
  // Combo system
  comboActive: z.boolean(),
  comboCount: z.number().min(0, "Combo count cannot be negative"),
  lastClickTime: z.number().min(0, "Invalid timestamp"),
  
  // Time boost system
  timeBoostActive: z.boolean(),
  timeBoostEndTime: z.number().min(0, "Invalid timestamp"),
  timeBoostMultiplier: z.number().min(1).max(100, "Time boost multiplier out of range"),
  
  // Optional properties
  total_spent: z.number().min(0).optional(),
  purchasedUpgrades: z.array(z.object({
    upgradeId: z.number(),
    quantity: z.number().min(0),
    ppsGain: z.number().min(0),
    clickMultiplier: z.number().min(0)
  })).optional(),
  purchasedSpecialItems: z.array(z.object({
    specialItemId: z.number(),
    quantity: z.number().min(0),
    effectMultiplier: z.number().min(0)
  })).optional(),
  nextUpgradeCosts: z.record(z.string(), z.number().min(0)).optional(),
  nextSpecialItemCosts: z.record(z.string(), z.number().min(0)).optional()
})

export type ValidatedGameState = z.infer<typeof GameStateSchema>

/**
 * Zod schema for advanced security controls
 */
export const SecurityValidationSchema = z.object({
  // Validation of impossible ratios
  totalPowerVsClicks: z.custom<{ totalPower: number, totalClicks: number }>((data) => {
    if (typeof data !== 'object' || data === null) return false
    const { totalPower, totalClicks } = data as { totalPower: number, totalClicks: number }
    
    // If there is power but no clicks, it's suspicious
    if (totalPower > 0 && totalClicks === 0) return false
    
    // Too high ratio (more than 1000 power per click)
    if (totalClicks > 0 && (totalPower / totalClicks) > 1000) return false
    
    return true
  }, { message: "Impossible power to clicks ratio" }),
  
  // Validation of timestamps
  timestamps: z.custom<{ lastSaveTime: number, lastClickTime: number }>((data) => {
    if (typeof data !== 'object' || data === null) return false
    const { lastSaveTime, lastClickTime } = data as { lastSaveTime: number, lastClickTime: number }
    const now = Date.now()
    const oneYearAgo = now - (365 * 24 * 60 * 60 * 1000)
    
    // Timestamps in the future (with a tolerance of 1 minute)
    if (lastSaveTime > now + 60000) return false
    if (lastClickTime > now + 60000) return false
    
    // Timestamps too old
    if (lastSaveTime < oneYearAgo) return false
    if (lastClickTime < oneYearAgo) return false
    
    return true
  }, { message: "Invalid timestamps detected" }),
  
  // Validation of maximum values
  maxValues: z.custom<{ totalPower: number, currentPower: number }>((data) => {
    if (typeof data !== 'object' || data === null) return false
    const { totalPower, currentPower } = data as { totalPower: number, currentPower: number }
    const MAX_REASONABLE_VALUE = Number.MAX_SAFE_INTEGER / 1000
    
    if (totalPower > MAX_REASONABLE_VALUE) return false
    if (currentPower > MAX_REASONABLE_VALUE) return false
    
    return true
  }, { message: "Values exceed reasonable limits" }),
  
  // Validation of logical progression
  progressionLogic: z.custom<{ currentPower: number, totalPower: number }>((data) => {
    if (typeof data !== 'object' || data === null) return false
    const { currentPower, totalPower } = data as { currentPower: number, totalPower: number }
    
    // Current power cannot exceed total power
    if (currentPower > totalPower) return false
    
    return true
  }, { message: "Inconsistent progression logic" })
})

/**
 * Zod schema for validating encrypted data
 */
export const EncryptedDataSchema = z.object({
  encrypted_game_data: z.string().min(1, "Encrypted data cannot be empty"),
  data_hash: z.string().regex(/^[a-f0-9]{64}$/, "Invalid hash format"),
  encryption_version: z.number().min(1, "Invalid encryption version")
})
