import { GameState } from '@/type/game'
import crypto from 'crypto'

/**
 * Server-side decryption of client-encrypted data
 * Compatible with ClientEncryption (simple method)
 */
export class ServerClientDecryption {

  /**
   * Decrypts data sent from the client
   */
  static decryptClientData(userId: string, encryptedData: string): GameState {
    try {
      const key = this.simpleHash(userId + ':client-encryption')
      const decryptedData = this.simpleDecrypt(encryptedData, key)
      
      return JSON.parse(decryptedData)
    } catch (error) {
      console.error('Server-side client decryption failed:', error)
      throw new Error('Failed to decrypt client-encrypted data')
    }
  }

  /**
   * Simple hash to generate a key (compatible with the client)
   */
  private static simpleHash(input: string): string {
    return crypto.createHash('sha256').update(input).digest('hex')
  }

  /**
   * Simple decryption (XOR with derived key) - compatible with the client
   */
  private static simpleDecrypt(encryptedData: string, key: string): string {
    const data = Buffer.from(encryptedData, 'base64').toString()
    const result = []
    for (let i = 0; i < data.length; i++) {
      const charCode = data.charCodeAt(i)
      const keyChar = key.charCodeAt(i % key.length)
      result.push(String.fromCharCode(charCode ^ keyChar))
    }
    return result.join('')
  }

  /**
   * Checks that the decrypted data is valid
   */
  static validateDecryptedData(gameData: GameState): boolean {
    return (
      typeof gameData === 'object' &&
      typeof gameData.totalClicks === 'number' &&
      typeof gameData.totalPower === 'number' &&
      typeof gameData.currentPower === 'number'
    )
  }
}
