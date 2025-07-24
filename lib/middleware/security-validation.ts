import { GameEncryption } from '@/lib/crypto/encryption'
import { GameStateSchema, SecurityValidationSchema } from '@/lib/validation/game-schemas'
import { GameState } from '@/type/game'

export interface SecurityValidationResult {
  isValid: boolean
  gameState?: GameState
  errors: string[]
  securityFlags: {
    suspiciousValues: boolean
    impossibleProgression: boolean
    invalidTimestamp: boolean
    dataCorruption: boolean
  }
}

/**
 * Security middleware to validate game data
 * Detects cheating attempts and corrupted data
 */
export class SecurityMiddleware {
  /**
   * Validates decrypted game data and detects anomalies
   */
  static validateGameData(
    userId: string, 
    encryptedData: string, 
    dataHash: string
  ): SecurityValidationResult {
    const result: SecurityValidationResult = {
      isValid: false,
      errors: [],
      securityFlags: {
        suspiciousValues: false,
        impossibleProgression: false,
        invalidTimestamp: false,
        dataCorruption: false
      }
    }

    try {
      // 1. Decrypt data
      const gameState = GameEncryption.decryptGameData(userId, encryptedData)
      result.gameState = gameState

      // 2. Verify integrity with hash
      if (!GameEncryption.verifyDataIntegrity(userId, gameState, dataHash)) {
        result.errors.push('Data integrity check failed - possible tampering detected')
        result.securityFlags.dataCorruption = true
        return result
      }

      // 3. Validate suspicious values (now with Zod)
      const suspiciousCheck = this.checkSuspiciousValues(gameState)
      if (!suspiciousCheck.isValid) {
        result.errors.push(...suspiciousCheck.errors)
        result.securityFlags.suspiciousValues = true
      }

      // Data is valid if no critical flags are raised
      result.isValid = !result.securityFlags.dataCorruption && 
                       result.errors.length === 0

      return result

    } catch (error) {
      result.errors.push(`Decryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
      result.securityFlags.dataCorruption = true
      return result
    }
  }

  /**
   * Checks for suspicious values that might indicate cheating (with Zod)
   */
  private static checkSuspiciousValues(gameState: GameState): { isValid: boolean, errors: string[] } {
    const errors: string[] = []

    try {
      // Validation with Zod schema
      GameStateSchema.parse(gameState)
      
      // Advanced security validations
      SecurityValidationSchema.parse({
        totalPowerVsClicks: { totalPower: gameState.totalPower, totalClicks: gameState.totalClicks },
        timestamps: { lastSaveTime: gameState.lastSaveTime, lastClickTime: gameState.lastClickTime },
        maxValues: { totalPower: gameState.totalPower, currentPower: gameState.currentPower },
        progressionLogic: { currentPower: gameState.currentPower, totalPower: gameState.totalPower }
      })

    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'errors' in error) {
        const zodError = error as { errors: Array<{ message: string, path?: string[] }> }
        zodError.errors.forEach((err) => {
          errors.push(`Validation error: ${err.message} at ${err.path?.join('.') || 'root'}`)
        })
      } else {
        errors.push(`Validation error: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    }

    return { isValid: errors.length === 0, errors }
  }

  /**
   * Generates a detailed security report
   */
  static generateSecurityReport(validation: SecurityValidationResult): string {
    const flags = []
    
    if (validation.securityFlags.suspiciousValues) flags.push('SUSPICIOUS_VALUES')
    if (validation.securityFlags.impossibleProgression) flags.push('IMPOSSIBLE_PROGRESSION')
    if (validation.securityFlags.invalidTimestamp) flags.push('INVALID_TIMESTAMP')
    if (validation.securityFlags.dataCorruption) flags.push('DATA_CORRUPTION')

    return JSON.stringify({
      timestamp: new Date().toISOString(),
      isValid: validation.isValid,
      securityFlags: flags,
      errors: validation.errors,
      errorCount: validation.errors.length
    })
  }
}
