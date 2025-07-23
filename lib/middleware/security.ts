/**
 * SECURITY MIDDLEWARE FOR GAME ENDPOINTS
 * 
 * This middleware provides:
 * - Request validation and sanitization
 * - Rate limiting per user and action type
 * - Anti-cheat detection
 * - Payload validation
 * - Origin verification
 */

import { GAME_RULES, GameAction, GameValidator, RateLimiter } from "@/lib/game-core"
import { createClient as createServerClient } from "@/lib/supabase/server"
import type { User } from "@supabase/supabase-js"
import { NextRequest, NextResponse } from "next/server"

export interface SecurityValidationResult {
  isValid: boolean
  user: User | null
  action?: GameAction
  error?: string
  statusCode?: number
}

export class GameSecurityMiddleware {
  
  /**
   * Validate and authenticate game request
   */
  static async validateGameRequest(request: NextRequest): Promise<SecurityValidationResult> {
    try {
      // 1. Origin validation
      const originResult = this.validateOrigin(request)
      if (!originResult.isValid) {
        return {
          isValid: false,
          user: null,
          error: "Invalid origin",
          statusCode: 403
        }
      }

      // 2. Authentication
      const authResult = await this.validateAuthentication()
      if (!authResult.isValid) {
        return {
          isValid: false,
          user: null,
          error: "Authentication failed",
          statusCode: 401
        }
      }

      // 3. Request method validation
      if (request.method !== "POST") {
        return {
          isValid: false,
          user: authResult.user,
          error: "Only POST requests allowed",
          statusCode: 405
        }
      }

      // 4. Content type validation
      const contentType = request.headers.get("content-type")
      if (!contentType || !contentType.includes("application/json")) {
        return {
          isValid: false,
          user: authResult.user,
          error: "Content-Type must be application/json",
          statusCode: 400
        }
      }

      // 5. Payload validation
      let body
      try {
        body = await request.json()
      } catch (error) {
        console.error("Invalid JSON payload:", error)
        return {
          isValid: false,
          user: authResult.user,
          error: "Invalid JSON payload",
          statusCode: 400
        }
      }

      // 6. Action validation
      const action: GameAction = {
        type: body.type || this.inferActionType(request.url),
        payload: body,
        userId: authResult.user!.id,
        timestamp: body.timestamp || Date.now()
      }

      const actionValidation = GameValidator.validateAction(action)
      if (!actionValidation.isValid) {
        return {
          isValid: false,
          user: authResult.user,
          error: actionValidation.reason,
          statusCode: 400
        }
      }

      return {
        isValid: true,
        user: authResult.user,
        action
      }

    } catch (error) {
      console.error("Security validation error:", error)
      return {
        isValid: false,
        user: null,
        error: "Internal security error",
        statusCode: 500
      }
    }
  }

  /**
   * Apply rate limiting for specific action types
   */
  static validateRateLimit(userId: string, actionType: string): {
    isAllowed: boolean
    error?: string
  } {
    const intervals = {
      click: GAME_RULES.PROGRESSION.MIN_CLICK_INTERVAL,
      purchase: GAME_RULES.PROGRESSION.MIN_PURCHASE_INTERVAL,
      save: 1000, // 1 second
      load: 500,  // 0.5 seconds
      reset: 30000 // 30 seconds
    }

    const minInterval = intervals[actionType as keyof typeof intervals] || 1000

    if (RateLimiter.isRateLimited(userId, actionType, minInterval)) {
      return {
        isAllowed: false,
        error: `Rate limit exceeded for ${actionType}. Min interval: ${minInterval}ms`
      }
    }

    return { isAllowed: true }
  }

  /**
   * Validate request origin
   */
  private static validateOrigin(request: NextRequest): { isValid: boolean } {
    const origin = request.headers.get("origin")
    const referer = request.headers.get("referer")
    
    // In development, allow localhost
    if (process.env.NODE_ENV === "development") {
      return { isValid: true }
    }

    const allowedOrigins = [
      "https://supaclicker.vercel.app",
      "https://supa-clicker.vercel.app"
    ]

    if (!origin || !allowedOrigins.includes(origin)) {
      return { isValid: false }
    }

    if (referer && !allowedOrigins.some(allowed => referer.startsWith(allowed))) {
      return { isValid: false }
    }

    return { isValid: true }
  }

  /**
   * Validate user authentication
   */
  private static async validateAuthentication(): Promise<{
    isValid: boolean
    user: User | null
  }> {
    try {
      const supabase = await createServerClient()
      const { data: { user }, error } = await supabase.auth.getUser()
      
      if (error || !user) {
        return { isValid: false, user: null }
      }

      return { isValid: true, user }
    } catch (error) {
      console.error("Authentication error:", error)
      return { isValid: false, user: null }
    }
  }

  /**
   * Infer action type from URL
   */
  private static inferActionType(url: string): string {
    if (url.includes("/click")) return "click"
    if (url.includes("/purchase")) return "purchase"
    if (url.includes("/save")) return "save"
    if (url.includes("/load")) return "load"
    if (url.includes("/reset")) return "reset"
    return "unknown"
  }

  /**
   * Create standardized error response
   */
  static createErrorResponse(error: string, statusCode: number = 400): NextResponse {
    return NextResponse.json({
      success: false,
      error,
      timestamp: Date.now()
    }, { status: statusCode })
  }

  /**
   * Create standardized success response
   */
  static createSuccessResponse(data: Record<string, unknown>): NextResponse {
    return NextResponse.json({
      success: true,
      ...data,
      timestamp: Date.now()
    })
  }
}

/**
 * Utility function to wrap API handlers with security validation
 */
export function withGameSecurity(
  handler: (request: NextRequest, validation: SecurityValidationResult) => Promise<NextResponse>
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    try {
      // Clean up old rate limit data periodically
      if (Math.random() < 0.01) { // 1% chance
        RateLimiter.cleanup()
      }

      // Validate request
      const validation = await GameSecurityMiddleware.validateGameRequest(request)
      
      if (!validation.isValid) {
        return GameSecurityMiddleware.createErrorResponse(
          validation.error || "Security validation failed",
          validation.statusCode || 400
        )
      }

      // Apply rate limiting
      if (validation.action) {
        const rateLimit = GameSecurityMiddleware.validateRateLimit(
          validation.user!.id,
          validation.action.type
        )
        
        if (!rateLimit.isAllowed) {
          return GameSecurityMiddleware.createErrorResponse(
            rateLimit.error || "Rate limit exceeded",
            429
          )
        }
      }

      // Call the actual handler
      return await handler(request, validation)
    } catch (error) {
      console.error("Security middleware error:", error)
      return GameSecurityMiddleware.createErrorResponse(
        "Internal server error",
        500
      )
    }
  }
}

/**
 * Payload validation schemas for different action types
 */
export const PayloadSchemas = {
  click: {
    required: ["timestamp"],
    optional: ["sessionId", "clientTime"],
    validate: (payload: unknown) => {
      if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
        return { isValid: false, error: "Invalid payload" }
      }
      const p = payload as Record<string, unknown>;
      if (!p.timestamp || typeof p.timestamp !== "number") {
        return { isValid: false, error: "Invalid timestamp" }
      }
      return { isValid: true }
    }
  },

  purchase: {
    required: ["purchaseType", "timestamp"],
    optional: ["upgradeId", "specialItemId", "quantity"],
    validate: (payload: unknown) => {
      if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
        return { isValid: false, error: "Invalid payload" }
      }
      const p = payload as Record<string, unknown>;
      if (!p.purchaseType || !["upgrade", "specialItem"].includes(p.purchaseType as string)) {
        return { isValid: false, error: "Invalid purchase type" }
      }
      if (p.purchaseType === "upgrade" && (!p.upgradeId || !Number.isInteger(p.upgradeId))) {
        return { isValid: false, error: "Invalid upgrade ID" }
      }
      if (p.purchaseType === "specialItem" && (!p.specialItemId || !Number.isInteger(p.specialItemId))) {
        return { isValid: false, error: "Invalid special item ID" }
      }
      if (p.quantity && (!Number.isInteger(p.quantity) || (p.quantity as number) <= 0)) {
        return { isValid: false, error: "Invalid quantity" }
      }
      return { isValid: true }
    }
  },

  save: {
    required: ["type", "payload"],
    optional: [],
    validate: (payload: unknown) => {
      if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
        return { isValid: false, error: "Invalid payload" }
      }
      const p = payload as Record<string, unknown>;
      if (p.type !== "save") {
        return { isValid: false, error: "Invalid save type" }
      }
      if (!p.payload || typeof p.payload !== "object") {
        return { isValid: false, error: "Invalid game data payload" }
      }
      return { isValid: true }
    }
  }
} as const