/**
 * Client-side encryption system
 * Encrypts data before sending to the API
 */


// Utilisation d'un chiffrement simple compatible client/serveur
export class ClientEncryption {

  /**
   * Encrypts any object on the client side (not just GameState)
   */
  static async encryptData<T = unknown>(userId: string, data: T): Promise<string> {
    try {
      const key = await this.simpleHash(userId + ':client-encryption')
      const json = JSON.stringify(data)
      const encrypted = this.simpleEncrypt(json, key)
      return encrypted
    } catch (error) {
      throw new Error('Failed to encrypt data on client')
    }
  }

  /**
   * Decrypts any object on the client side
   */
  static async decryptData<T = unknown>(userId: string, encryptedData: string): Promise<T> {
    try {
      const key = await this.simpleHash(userId + ':client-encryption')
      const decryptedData = this.simpleDecrypt(encryptedData, key)
      return JSON.parse(decryptedData)
    } catch (error) {
      throw new Error('Failed to decrypt data on client')
    }
  }

  /**
   * Simple hash to generate a key
   */
  private static async simpleHash(input: string): Promise<string> {
    const encoder = new TextEncoder()
    const data = encoder.encode(input)
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  }

  /**
   * Simple encryption (XOR with derived key)
   */
  private static simpleEncrypt(data: string, key: string): string {
    const result = []
    for (let i = 0; i < data.length; i++) {
      const charCode = data.charCodeAt(i)
      const keyChar = key.charCodeAt(i % key.length)
      result.push(String.fromCharCode(charCode ^ keyChar))
    }
    return btoa(result.join(''))
  }

  /**
   * Simple decryption (XOR with derived key)
   */
  private static simpleDecrypt(encryptedData: string, key: string): string {
    const data = atob(encryptedData)
    const result = []
    for (let i = 0; i < data.length; i++) {
      const charCode = data.charCodeAt(i)
      const keyChar = key.charCodeAt(i % key.length)
      result.push(String.fromCharCode(charCode ^ keyChar))
    }
    return result.join('')
  }

  /**
   * Checks if the browser supports encryption
   */
  static isSupported(): boolean {
    return typeof crypto !== 'undefined' && 
           typeof crypto.subtle !== 'undefined' &&
           typeof crypto.getRandomValues !== 'undefined'
  }
}
