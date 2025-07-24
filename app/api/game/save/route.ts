import { ServerClientDecryption } from "@/lib/crypto/server-client-decryption"
import { GameEngine } from "@/lib/game-engine"
import { createClient as createServerClient } from "@/lib/supabase/server"
import { EncryptedClientDataSchema, SaveGameRequestSchema, SecurityValidationSchema } from "@/lib/validation/game-schemas"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    // Verify user authentication
    const supabase = await createServerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()

    // Vérifier si les données sont chiffrées côté client
    let validatedGameData
    
    if (body.encryptedData && body.userId) {
      // Nouvelles données chiffrées côté client
      try {
        const encryptedValidation = EncryptedClientDataSchema.safeParse(body)
        if (!encryptedValidation.success) {
          return NextResponse.json({ 
            error: "Invalid encrypted data format",
            details: encryptedValidation.error.issues
          }, { status: 400 })
        }

        // Déchiffrer les données côté serveur
        const decryptedData = ServerClientDecryption.decryptClientData(
          encryptedValidation.data.userId,
          encryptedValidation.data.encryptedData
        )

        // Valider les données déchiffrées
        const gameValidation = SaveGameRequestSchema.safeParse({
          type: 'save',
          payload: decryptedData,
          timestamp: Date.now()
        })

        if (!gameValidation.success) {
          return NextResponse.json({ 
            error: "Invalid decrypted game data",
            details: gameValidation.error.issues
          }, { status: 400 })
        }

        validatedGameData = gameValidation.data.payload
      } catch (decryptError) {
        console.error("Decryption failed:", decryptError)
        return NextResponse.json({ error: "Failed to decrypt data" }, { status: 400 })
      }
    } else {
      // Anciennes données non chiffrées (pour compatibilité)
      const validationResult = SaveGameRequestSchema.safeParse(body)
      if (!validationResult.success) {
        console.error("Validation error:", validationResult.error.issues)
        return NextResponse.json({ 
          error: "Invalid game data format",
          details: validationResult.error.issues
        }, { status: 400 })
      }
      validatedGameData = validationResult.data.payload
    }

    // Check data size
    const dataSize = JSON.stringify(validatedGameData).length
    if (dataSize > 1024 * 1024) { // 1MB limit
      return NextResponse.json({ error: "Game data too large" }, { status: 413 })
    }

    // DEBUG: Log the validated game data before security validation
    console.log('SECURITY VALIDATION DEBUG', JSON.stringify(validatedGameData, null, 2));

    // NEW: Advanced security validation with Zod
    try {
      SecurityValidationSchema.parse({
        timestamps: { 
          lastSaveTime: validatedGameData.lastSaveTime, 
          lastClickTime: validatedGameData.lastClickTime 
        },
        maxValues: { 
          totalPower: validatedGameData.totalPower, 
          currentPower: validatedGameData.currentPower 
        },
        progressionLogic: { 
          currentPower: validatedGameData.currentPower, 
          totalPower: validatedGameData.totalPower 
        }
      })
    } catch (securityError: unknown) {
      console.warn(`Security validation failed for user ${user.id}:`, securityError)
      
      if (securityError && typeof securityError === 'object' && 'errors' in securityError) {
        const zodError = securityError as { errors: Array<{ message: string }> }
        return NextResponse.json({ 
          error: "Invalid game data: security validation failed",
          details: zodError.errors.map(e => e.message)
        }, { status: 400 })
      }
      
      return NextResponse.json({ 
        error: "Invalid game data: security validation failed" 
      }, { status: 400 })
    }

    // Save using GameEngine (now with encryption)
    await GameEngine.saveUserGameState(user.id, validatedGameData)

    console.log(`Game data saved successfully for user ${user.id} with encryption`)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ 
      error: "Internal server error", 
      details: error instanceof Error ? error.message : String(error) 
    }, { status: 500 })
  }
}