/**
 * Hook to manage game data with client-side encryption
 */

import { ClientEncryption } from '@/lib/crypto/client-encryption'
import { createClient } from '@/lib/supabase/client'
import { GameState } from '@/type/game'
import { useCallback, useState } from 'react'

export function useEncryptedGameData() {
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState<Error | null>(null)

  const saveGame = useCallback(async (gameData: GameState) => {
    setIsSaving(true)
    setSaveError(null)

    if (process.env.NODE_ENV === 'development') console.log('🔐 Starting encrypted save process...');

    try {
      // Get the current user
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        throw new Error('User not authenticated')
      }

      if (process.env.NODE_ENV === 'development') console.log('👤 User authenticated:', user.id);

      // Encrypt data on client
      if (process.env.NODE_ENV === 'development') console.log('🔒 Encrypting data on client...');
      const encryptedData = await ClientEncryption.encryptData(user.id, gameData)
      if (process.env.NODE_ENV === 'development') console.log('✅ Data encrypted, length:', encryptedData.length);

      // Send encrypted data to API
      if (process.env.NODE_ENV === 'development') console.log('📤 Sending encrypted data to API...');
      const response = await fetch('/api/game/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          encryptedData,
          userId: user.id
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to save game')
      }

      const result = await response.json()
      if (process.env.NODE_ENV === 'development') console.log('✅ Encrypted save successful');
      return result
    } catch (error) {
      if (process.env.NODE_ENV === 'development') console.error('❌ Encrypted save failed:', error);
      setSaveError(error as Error)
      throw error
    } finally {
      setIsSaving(false)
    }
  }, [])

  return {
    saveGame,
    isSaving,
    saveError
  }
}
