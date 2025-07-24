import { z } from "zod";

const RecordNumberNumberSchema = z.record(z.string(), z.number()).transform(
  (val) => {
    const result: Record<number, number> = {};
    for (const [key, value] of Object.entries(val)) {
      const numKey = parseInt(key, 10);
      if (!isNaN(numKey)) {
        result[numKey] = value;
      }
    }
    return result;
  }
);

export const GameStateSchema = z.object({
  totalClicks: z.number().min(0),
  totalPower: z.number().min(0),
  currentPower: z.number().min(0),
  clickPower: z.number().min(1),
  pps: z.number().min(0),
  upgrades: RecordNumberNumberSchema,
  specialItems: RecordNumberNumberSchema,
  unlockedAchievements: z.array(z.number().int().min(0)).max(1000),
  lastSaveTime: z.number().min(0),
  prestigeLevel: z.number().int().min(0).max(50),
  resourcesPerSecond: z.number().min(0),
  currentResources: z.number().min(0),
  comboCount: z.number().int().min(0).max(1000),
  comboActive: z.boolean(),
  lastClickTime: z.number().min(0),
  timeBoostActive: z.boolean(),
  timeBoostEndTime: z.number().min(0),
  timeBoostMultiplier: z.number().min(1).max(1000),
  // Optional props
  total_spent: z.number().min(0).optional()
});

// Schema for client full request (with type and timestamp)
export const SaveGameRequestSchema = z.object({
  type: z.literal("save"),
  payload: GameStateSchema,
  timestamp: z.number().min(0)
});

// New schema for client encrypted data
export const EncryptedSaveGameRequestSchema = z.object({
  type: z.literal("save"),
  encryptedPayload: z.string().min(1, "Encrypted payload cannot be empty"),
  timestamp: z.number().min(0),
  clientEncryption: z.literal(true) // Flag pour indiquer chiffrement client
});

export const LoadGameResponseSchema = z.object({
  gameData: GameStateSchema.nullable()
});

/**
 * Advanced security validations
 */
export const SecurityValidationSchema = z.object({
  // Impossible power to clicks ratio validation
  totalPowerVsClicks: z.custom<{ totalPower: number, totalClicks: number }>((data) => {
    if (typeof data !== 'object' || data === null) return false
    const { totalPower, totalClicks } = data as { totalPower: number, totalClicks: number }
    
    // If there is power but no clicks, it's suspicious
    if (totalPower > 0 && totalClicks === 0) return false
    
    // Too high ratio (more than 1000 power per click)
    if (totalClicks > 0 && (totalPower / totalClicks) > 1000) return false
    
    return true
  }, { message: "Impossible power to clicks ratio" }),
  
  // Timestamps validation
  timestamps: z.custom<{ lastSaveTime: number, lastClickTime: number }>((data) => {
    if (typeof data !== 'object' || data === null) return false
    const { lastSaveTime, lastClickTime } = data as { lastSaveTime: number, lastClickTime: number }
    const now = Date.now()
    const oneYearAgo = now - (365 * 24 * 60 * 60 * 1000)
    
    // Timestamps in the future (with 1 minute tolerance)
    if (lastSaveTime > now + 60000) return false
    if (lastClickTime > now + 60000) return false
    
    // Timestamps too old
    if (lastSaveTime < oneYearAgo) return false
    if (lastClickTime < oneYearAgo) return false
    
    return true
  }, { message: "Invalid timestamps detected" }),
  
  // Max values validation
  maxValues: z.custom<{ totalPower: number, currentPower: number }>((data) => {
    if (typeof data !== 'object' || data === null) return false
    const { totalPower, currentPower } = data as { totalPower: number, currentPower: number }
    const MAX_REASONABLE_VALUE = Number.MAX_SAFE_INTEGER / 1000
    
    if (totalPower > MAX_REASONABLE_VALUE) return false
    if (currentPower > MAX_REASONABLE_VALUE) return false
    
    return true
  }, { message: "Values exceed reasonable limits" }),
  
  // Validation de la progression logique
  progressionLogic: z.custom<{ currentPower: number, totalPower: number }>((data) => {
    if (typeof data !== 'object' || data === null) return false
    const { currentPower, totalPower } = data as { currentPower: number, totalPower: number }
    
    // Current power cannot exceed total power
    if (currentPower > totalPower) return false
    
    return true
  }, { message: "Inconsistent progression logic" })
});

export type GameStateValidated = z.infer<typeof GameStateSchema>;
export type SaveGameRequest = z.infer<typeof SaveGameRequestSchema>;
export type EncryptedSaveGameRequest = z.infer<typeof EncryptedSaveGameRequestSchema>;
export type LoadGameResponse = z.infer<typeof LoadGameResponseSchema>;

// Schema for client encrypted data
export const EncryptedClientDataSchema = z.object({
  encryptedData: z.string().min(1, 'Encrypted data cannot be empty'),
  userId: z.string().min(1, 'User ID is required')
})

export type EncryptedClientData = z.infer<typeof EncryptedClientDataSchema>

// Schema for client encrypted batch purchase request
export const EncryptedBatchPurchaseRequestSchema = z.object({
  type: z.literal("batch-purchase"),
  encryptedPayload: z.string().min(1, "Encrypted payload cannot be empty"),
  timestamp: z.number().min(0),
  clientEncryption: z.literal(true)
});

export type EncryptedBatchPurchaseRequest = z.infer<typeof EncryptedBatchPurchaseRequestSchema>;