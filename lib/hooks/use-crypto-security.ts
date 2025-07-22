"use client"

import { useAuth } from '@/lib/auth/auth-context'
import { GameCryptoSecurity } from '@/lib/security/crypto-signature'
import { useCallback, useEffect, useRef, useState } from 'react'

interface CryptoSecurityState {
  cryptoKey: string | null
  isLoading: boolean
  error: string | null
  lastRefresh: number
}

export const useCryptoSecurity = () => {
  const { user, loading: authLoading } = useAuth()
  const [state, setState] = useState<CryptoSecurityState>({
    cryptoKey: null,
    isLoading: true,
    error: null,
    lastRefresh: 0
  })

  const lastClientKeyRequest = useRef(0);

  const fetchCryptoKey = useCallback(async () => {
    const now = Date.now();
    if (now - lastClientKeyRequest.current < 16000) {
      return;
    }
    lastClientKeyRequest.current = now;
    if (!user || authLoading) {
      setState(prev => ({ ...prev, isLoading: false, cryptoKey: null }))
      return
    }

    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }))

      const response = await fetch('/api/security/key', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `HTTP ${response.status}`)
      }

      const { cryptoKey, isNewKey } = await response.json()

      setState(prev => ({
        ...prev,
        cryptoKey,
        isLoading: false,
        error: null,
        lastRefresh: Date.now()
      }))

      if (isNewKey) {
        console.log('New crypto key generated for enhanced security')
      }

    } catch (error) {
      console.error('Failed to fetch crypto key:', error)
      setState(prev => ({
        ...prev,
        cryptoKey: null,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to get security key'
      }))
    }
  }, [user, authLoading])

  const regenerateCryptoKey = useCallback(async () => {
    if (!user) return

    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }))

      const response = await fetch('/api/security/key', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `HTTP ${response.status}`)
      }

      const { cryptoKey } = await response.json()

      setState(prev => ({
        ...prev,
        cryptoKey,
        isLoading: false,
        error: null,
        lastRefresh: Date.now()
      }))

      console.log('Crypto key regenerated successfully')

    } catch (error) {
      console.error('Failed to regenerate crypto key:', error)
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to regenerate security key'
      }))
    }
  }, [user])

  const signSaveRequest = useCallback((gameData: Record<string, unknown>) => {
    if (!state.cryptoKey) {
      throw new Error('Crypto key not available')
    }

    return GameCryptoSecurity.signGameSave(gameData, state.cryptoKey)
  }, [state.cryptoKey])

  const signPurchaseRequest = useCallback((upgradeId: number, quantity: number = 1) => {
    if (!state.cryptoKey) {
      throw new Error('Crypto key not available')
    }

    return GameCryptoSecurity.signUpgradePurchase(upgradeId, quantity, state.cryptoKey)
  }, [state.cryptoKey])

  const makeSignedRequest = useCallback(async (
    endpoint: string,
    action: { type: 'save' | 'purchase' | 'click', payload: Record<string, unknown> },
    options: RequestInit = {}
  ) => {
    if (!state.cryptoKey) {
      throw new Error('Crypto key not available')
    }

    const signedRequest = GameCryptoSecurity.signGameAction(action, state.cryptoKey)

    const response = await fetch(endpoint, {
      ...options,
      method: options.method || 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      body: JSON.stringify(signedRequest)
    })

    return response
  }, [state.cryptoKey])

  useEffect(() => {
    if (!authLoading) {
      fetchCryptoKey()
    }
  }, [fetchCryptoKey, authLoading])

  useEffect(() => {
    if (!state.cryptoKey || !user) return

    const sixHours = 6 * 60 * 60 * 1000
    const timeSinceLastRefresh = Date.now() - state.lastRefresh

    if (timeSinceLastRefresh >= sixHours) {
      fetchCryptoKey()
      return
    }

    const timeToNextRefresh = sixHours - timeSinceLastRefresh
    const refreshTimer = setTimeout(fetchCryptoKey, timeToNextRefresh)

    return () => clearTimeout(refreshTimer)
  }, [state.cryptoKey, state.lastRefresh, user, fetchCryptoKey])

  return {
    cryptoKey: state.cryptoKey,
    isLoading: state.isLoading,
    error: state.error,
    isReady: !!state.cryptoKey && !state.isLoading,
    
    // Actions
    fetchCryptoKey,
    regenerateCryptoKey,
    signSaveRequest,
    signPurchaseRequest,
    makeSignedRequest
  }
}