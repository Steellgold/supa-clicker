/**
 * In-memory cache for game states with TTL to avoid reloading
 * encrypted data on every request
 */

import { GameState } from "@/type/game"

interface CacheEntry {
  gameState: GameState
  timestamp: number
  ttl: number
}

class GameStateCache {
  private cache = new Map<string, CacheEntry>()
  private readonly DEFAULT_TTL = 5000 // 5 seconds by default
  private readonly MAX_CACHE_SIZE = 1000 // Limite de taille du cache

  /**
   * Stores a game state in the cache
   */
  set(userId: string, gameState: GameState, ttl: number = this.DEFAULT_TTL): void {
    // Nettoyer le cache si il devient trop grand
    if (this.cache.size >= this.MAX_CACHE_SIZE) {
      this.cleanup()
    }

    this.cache.set(userId, {
      gameState: { ...gameState }, // Copie profonde pour éviter les mutations
      timestamp: Date.now(),
      ttl
    })
  }

  /**
   * Retrieves a game state from the cache if still valid
   */
  get(userId: string): GameState | null {
    const entry = this.cache.get(userId)
    if (!entry) {
      return null
    }

    const now = Date.now()
    if (now - entry.timestamp > entry.ttl) {
      // Entrée expirée, la supprimer
      this.cache.delete(userId)
      return null
    }

    return { ...entry.gameState } // Retourner une copie pour éviter les mutations
  }

  /**
   * Invalidates the cache for a specific user
   */
  invalidate(userId: string): void {
    this.cache.delete(userId)
  }

  /**
   * Updates the cache with a new game state
   */
  update(userId: string, gameState: GameState): void {
    const entry = this.cache.get(userId)
    if (entry) {
      entry.gameState = { ...gameState }
      entry.timestamp = Date.now()
    }
  }

  /**
   * Cleans up expired entries from the cache
   */
  private cleanup(): void {
    const now = Date.now()
    const toDelete: string[] = []

    for (const [userId, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        toDelete.push(userId)
      }
    }

    toDelete.forEach(userId => this.cache.delete(userId))

    // Si le cache est encore trop grand, supprimer les plus anciennes entrées
    if (this.cache.size >= this.MAX_CACHE_SIZE) {
      const entries = Array.from(this.cache.entries())
      entries.sort((a, b) => a[1].timestamp - b[1].timestamp)
      
      const toRemove = entries.slice(0, Math.floor(this.MAX_CACHE_SIZE * 0.2)) // Supprimer 20% des plus anciennes
      toRemove.forEach(([userId]) => this.cache.delete(userId))
    }
  }

  /**
   * Completely clears the cache
   */
  clear(): void {
    this.cache.clear()
  }

  /**
   * Returns the current size of the cache
   */
  size(): number {
    return this.cache.size
  }
}

// Instance singleton du cache
export const gameStateCache = new GameStateCache()
