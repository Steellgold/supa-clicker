import { GameStateSchema } from '@/lib/validation/game-schemas'
import { GameState } from '@/type/game'
import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'crypto'

/**
 * AES encryption system for game data
 * Each user has a unique key derived from their user ID
 */
export class GameEncryption {
  private static readonly ALGORITHM = 'aes-256-gcm'
  private static readonly KEY_LENGTH = 32 // 256 bits
  private static readonly IV_LENGTH = 16  // 128 bits
  private static readonly TAG_LENGTH = 16 // 128 bits
  private static readonly SALT_SECRET = process.env.ENCRYPTION_SALT_SECRET

  /**
   * Generates a unique encryption key for a user
   * Uses the user ID + a secret salt to derive the key
   */
  private static generateUserKey(userId: string): Buffer {
    if (!this.SALT_SECRET) {
      throw new Error('ENCRYPTION_SALT_SECRET environment variable is required')
    }

    // Dérive une clé déterministe mais unique pour chaque utilisateur
    const keyMaterial = `${userId}:${this.SALT_SECRET}`
    return createHash('sha256').update(keyMaterial).digest()
  }

  /**
   * Encrypts a user's game data
   */
  static encryptGameData(userId: string, gameData: GameState): string {
    try {
      const key = this.generateUserKey(userId)
      const iv = randomBytes(this.IV_LENGTH)
      
      const cipher = createCipheriv(this.ALGORITHM, key, iv)
      
      // Sérialise les données de jeu
      const jsonData = JSON.stringify(gameData)
      
      // Chiffre les données
      let encrypted = cipher.update(jsonData, 'utf8', 'hex')
      encrypted += cipher.final('hex')
      
      // Récupère le tag d'authentification
      const tag = cipher.getAuthTag()
      
      // Combine IV + données chiffrées + tag
      const result = Buffer.concat([
        iv,
        Buffer.from(encrypted, 'hex'),
        tag
      ]).toString('base64')
      
      return result
    } catch (error) {
      console.error('Encryption error:', error)
      throw new Error('Failed to encrypt game data')
    }
  }

  /**
   * Decrypts a user's game data
   */
  static decryptGameData(userId: string, encryptedData: string): GameState {
    try {
      const key = this.generateUserKey(userId)
      const buffer = Buffer.from(encryptedData, 'base64')
      
      // Extract IV, encrypted data, and tag
      const iv = buffer.subarray(0, this.IV_LENGTH)
      const tag = buffer.subarray(-this.TAG_LENGTH)
      const encrypted = buffer.subarray(this.IV_LENGTH, -this.TAG_LENGTH)
      
      const decipher = createDecipheriv(this.ALGORITHM, key, iv)
      decipher.setAuthTag(tag)
      
      // Decrypt the data
      let decrypted = decipher.update(encrypted, undefined, 'utf8')
      decrypted += decipher.final('utf8')
      
      // Parse the JSON data
      const gameData = JSON.parse(decrypted) as GameState
      
      // Basic validation of the structure
      if (!this.isValidGameState(gameData)) {
        throw new Error('Invalid game state structure after decryption')
      }
      
      return gameData
    } catch (error) {
      console.error('Decryption error:', error)
      throw new Error('Failed to decrypt game data - data may be corrupted or tampered with')
    }
  }

  /**
   * Validates the structure of decrypted game data with Zod
   */
  private static isValidGameState(data: unknown): data is GameState {
    try {
      GameStateSchema.parse(data)
      return true
    } catch (error) {
      console.warn('Game state validation failed:', error)
      return false
    }
  }

  /**
   * Generates a verification hash to detect modifications
   */
  static generateDataHash(userId: string, gameData: GameState): string {
    const dataString = JSON.stringify(gameData)
    const key = this.generateUserKey(userId)
    
    return createHash('sha256')
      .update(dataString + key.toString('hex'))
      .digest('hex')
  }

  /**
   * Verifies data integrity with the hash
   */
  static verifyDataIntegrity(userId: string, gameData: GameState, expectedHash: string): boolean {
    const computedHash = this.generateDataHash(userId, gameData)
    return computedHash === expectedHash
  }
}
