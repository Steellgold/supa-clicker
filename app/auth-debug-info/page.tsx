"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth/auth-context"
import { createClient } from "@/lib/supabase/client"
import type { User } from "@supabase/supabase-js"

interface DebugInfo {
  currentUrl: string
  environment: string
  supabaseUrl: string
  hasSupabaseKey: boolean
  supabaseCookies: string[]
  hasAuthToken: boolean
  authTokenKey: string | null
  userAgent: string
  timestamp: string
  middlewareHeaders: Record<string, string>
  authState: {
    user: Partial<User> | null
    userProfile: { username?: string } | null
    loading: boolean
  }
  sessionInfo: {
    session: object | null
    error: object | null
  }
}

export default function AuthDebugPage() {
  const { user, userProfile, loading } = useAuth()
  const [debugInfo, setDebugInfo] = useState<DebugInfo | null>(null)
  const [sessionDebug, setSessionDebug] = useState<object | null>(null)

  useEffect(() => {
    const collectDebugInfo = async () => {
      const supabase = createClient()
      
      // Récupérer la session directement
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
      
      // Construire la clé du token localStorage
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      let authTokenKey = null
      let hasAuthToken = false
      
      if (supabaseUrl) {
        const urlParts = supabaseUrl.split('://')[1]?.split('.')[0]
        authTokenKey = `sb-${urlParts}-auth-token`
        hasAuthToken = !!localStorage.getItem(authTokenKey)
      }

      // Récupérer les cookies Supabase
      const cookies = document.cookie.split(';').filter(cookie => 
        cookie.trim().includes('sb-') || 
        cookie.trim().includes('supabase') ||
        cookie.trim().includes('auth')
      ).map(cookie => cookie.trim())

      // Récupérer les headers de debug du middleware
      const middlewareHeaders: Record<string, string> = {}
      if (typeof window !== 'undefined' && window.location) {
        // On ne peut pas accéder aux headers de réponse depuis le client
        // Mais on peut faire une requête pour les récupérer
        try {
          const response = await fetch(window.location.href, { method: 'HEAD' })
          const headers = Array.from(response.headers.entries())
          headers.forEach(([key, value]) => {
            if (key.startsWith('x-auth-debug')) {
              middlewareHeaders[key] = value
            }
          })
        } catch (error) {
          console.error('Erreur lors de la récupération des headers:', error)
        }
      }

      const info: DebugInfo = {
        currentUrl: window.location.href,
        environment: process.env.NODE_ENV || 'unknown',
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || 'not set',
        hasSupabaseKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        supabaseCookies: cookies,
        hasAuthToken,
        authTokenKey,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString(),
        middlewareHeaders,
        authState: {
          user: user ? {
            id: user.id,
            email: user.email,
            created_at: user.created_at,
            last_sign_in_at: user.last_sign_in_at,
            email_confirmed_at: user.email_confirmed_at
          } : null,
          userProfile,
          loading
        },
        sessionInfo: {
          session: sessionData.session ? {
            user: sessionData.session.user ? {
              id: sessionData.session.user.id,
              email: sessionData.session.user.email,
              created_at: sessionData.session.user.created_at,
              last_sign_in_at: sessionData.session.user.last_sign_in_at
            } : null,
            expires_at: sessionData.session.expires_at,
            expires_in: sessionData.session.expires_in,
            token_type: sessionData.session.token_type
          } : null,
          error: sessionError
        }
      }

      setDebugInfo(info)
      setSessionDebug(sessionData)
    }

    if (typeof window !== 'undefined') {
      collectDebugInfo()
    }
  }, [user, userProfile, loading])

  if (!debugInfo) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Auth Debug Info</h1>
        <p>Collecte des informations de debug...</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">Auth Debug Info</h1>
      
      <div className="space-y-6">
        {/* Status général */}
        <div className="bg-gray-100 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">Status Général</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <strong>Environment:</strong> {debugInfo.environment}
            </div>
            <div>
              <strong>Loading:</strong> {debugInfo.authState.loading ? '🔄 TRUE' : '✅ FALSE'}
            </div>
            <div>
              <strong>User connecté:</strong> {debugInfo.authState.user ? '✅ OUI' : '❌ NON'}
            </div>
            <div>
              <strong>Profil chargé:</strong> {debugInfo.authState.userProfile ? '✅ OUI' : '❌ NON'}
            </div>
          </div>
        </div>

        {/* Configuration Supabase */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">Configuration Supabase</h2>
          <div className="space-y-2">
            <div>
              <strong>URL:</strong> {debugInfo.supabaseUrl}
            </div>
            <div>
              <strong>Clé anonyme présente:</strong> {debugInfo.hasSupabaseKey ? '✅ OUI' : '❌ NON'}
            </div>
            <div>
              <strong>Token localStorage:</strong> {debugInfo.hasAuthToken ? '✅ PRÉSENT' : '❌ ABSENT'}
            </div>
            {debugInfo.authTokenKey && (
              <div>
                <strong>Clé token:</strong> {debugInfo.authTokenKey}
              </div>
            )}
          </div>
        </div>

        {/* Headers de middleware */}
        <div className="bg-purple-50 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">Headers Middleware ({Object.keys(debugInfo.middlewareHeaders).length})</h2>
          {Object.keys(debugInfo.middlewareHeaders).length > 0 ? (
            <div className="space-y-1">
              {Object.entries(debugInfo.middlewareHeaders).map(([key, value]) => (
                <div key={key} className="text-sm">
                  <strong>{key}:</strong> {value}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600">Aucun header de debug trouvé (les headers de réponse ne sont pas accessibles côté client)</p>
          )}
        </div>

        {/* Cookies */}
        <div className="bg-yellow-50 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">Cookies Auth ({debugInfo.supabaseCookies.length})</h2>
          {debugInfo.supabaseCookies.length > 0 ? (
            <ul className="list-disc pl-5 space-y-1">
              {debugInfo.supabaseCookies.map((cookie, index) => (
                <li key={index} className="text-sm font-mono">{cookie}</li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-600">Aucun cookie d&apos;authentification trouvé</p>
          )}
        </div>

        {/* Données complètes */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">Données Complètes</h2>
          <pre className="text-xs overflow-auto bg-white p-4 rounded border max-h-96">
            {JSON.stringify(debugInfo, null, 2)}
          </pre>
        </div>

        {/* Session raw data */}
        {sessionDebug && (
          <div className="bg-red-50 p-4 rounded-lg">
            <h2 className="text-lg font-semibold mb-2">Session Raw Data</h2>
            <pre className="text-xs overflow-auto bg-white p-4 rounded border max-h-96">
              {JSON.stringify(sessionDebug, null, 2)}
            </pre>
          </div>
        )}

        {/* Actions de debug */}
        <div className="bg-green-50 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">Actions de Debug</h2>
          <div className="space-y-2">
            <button 
              onClick={() => window.location.reload()}
              className="bg-blue-500 text-white px-4 py-2 rounded mr-2"
            >
              Recharger la page
            </button>
            <button 
              onClick={() => {
                localStorage.clear()
                window.location.reload()
              }}
              className="bg-red-500 text-white px-4 py-2 rounded mr-2"
            >
              Vider localStorage et recharger
            </button>
            <button 
              onClick={() => {
                navigator.clipboard.writeText(JSON.stringify(debugInfo, null, 2))
                alert('Données copiées dans le presse-papiers!')
              }}
              className="bg-green-500 text-white px-4 py-2 rounded"
            >
              Copier les données
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
