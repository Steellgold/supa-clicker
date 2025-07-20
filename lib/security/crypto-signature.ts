import { createHmac, randomBytes, timingSafeEqual } from "crypto"

interface SignedRequest {
  data: any
  timestamp: number
  signature: string
}

interface GameAction {
  type: 'save' | 'purchase' | 'click'
  payload: any
}

export class GameCryptoSecurity {
  private static readonly SIGNATURE_VALIDITY_WINDOW = 30000 // 30 seconds
  private static readonly SECRET_LENGTH = 32

  static generateUserSecret(): string {
    return randomBytes(this.SECRET_LENGTH).toString('hex')
  }


  static signGameAction(action: GameAction, userSecret: string, timestamp?: number): SignedRequest {
    const ts = timestamp || Date.now()
    
    const payload = {
      type: action.type,
      payload: action.payload,
      timestamp: ts
    }
    
    const dataString = JSON.stringify(payload)
    const signature = this.createSignature(dataString, userSecret)
    
    return {
      data: action,
      timestamp: ts,
      signature
    }
  }

  static verifySignedRequest(signedRequest: SignedRequest, userSecret: string): { isValid: boolean; reason?: string } {
    const now = Date.now()
    const timeDiff = now - signedRequest.timestamp
    
    if (timeDiff > this.SIGNATURE_VALIDITY_WINDOW) {
      return { isValid: false, reason: 'Request too old' }
    }
    
    if (timeDiff < -5000) {
      return { isValid: false, reason: 'Request from future' }
    }

    const payload = {
      type: signedRequest.data.type,
      payload: signedRequest.data.payload,
      timestamp: signedRequest.timestamp
    }
    
    const dataString = JSON.stringify(payload)
    const expectedSignature = this.createSignature(dataString, userSecret)
    
    // Comparaison sécurisée pour éviter les timing attacks
    if (!this.secureCompare(signedRequest.signature, expectedSignature)) {
      return { isValid: false, reason: 'Invalid signature' }
    }
    
    return { isValid: true }
  }

  private static createSignature(data: string, secret: string): string {
    return createHmac('sha256', secret)
      .update(data)
      .digest('hex')
  }

  private static secureCompare(a: string, b: string): boolean {
    if (a.length !== b.length) return false
    
    try {
      return timingSafeEqual(
        Buffer.from(a, 'hex'),
        Buffer.from(b, 'hex')
      )
    } catch {
      return false
    }
  }

  static signGameSave(gameData: any, userSecret: string): SignedRequest {
    return this.signGameAction({
      type: 'save',
      payload: gameData
    }, userSecret)
  }

  static signUpgradePurchase(upgradeId: number, quantity: number, userSecret: string): SignedRequest {
    return this.signGameAction({
      type: 'purchase',
      payload: { upgradeId, quantity }
    }, userSecret)
  }

  static validateGameDataIntegrity(gameData: any, previousData: any, userSecret: string): boolean {
    const criticalData = {
      currentPower: gameData.currentPower,
      totalPower: gameData.totalPower,
      upgrades: gameData.upgrades,
      specialItems: gameData.specialItems
    }
    
    const dataHash = createHmac('sha256', userSecret)
      .update(JSON.stringify(criticalData))
      .digest('hex')
    
    return true
  }
}

export function validateSignedGameRequest(request: SignedRequest, userSecret: string): { isValid: boolean; reason?: string; data?: any } {
  
  const validation = GameCryptoSecurity.verifySignedRequest(request, userSecret)
  
  if (!validation.isValid) {
    return validation
  }
  
  return {
    isValid: true,
    data: request.data
  }
}