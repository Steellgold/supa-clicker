"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useAuth } from "@/lib/auth/auth-context"
import { createClient } from "@/lib/supabase/client"

type GameData = {
  score: number
  level: number
  upgrades: Record<string, number>
  lastSaved: string
}

const defaultGameData: GameData = {
  score: 0,
  level: 1,
  upgrades: {},
  lastSaved: new Date().toISOString()
}

export function useGameData() {
  const { user } = useAuth()
  const [gameData, setGameData] = useState<GameData>(defaultGameData)
  const [loading, setLoading] = useState(false)
  const [saveStatus, setSaveStatus] = useState<"IDLE" | "SAVING" | "SAVED" | "ERROR">("IDLE")
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const supabase = createClient()

  const loadGameData = useCallback(async () => {
    if (!user) return

    const { data: { user: currentUser } } = await supabase.auth.getUser()
    if (!currentUser || currentUser.id !== user.id) {
      console.log("User not authenticated, skipping game data load")
      return
    }

    setLoading(true)
    try {
      const { data, error } = await supabase
        .from("game_data")
        .select("*")
        .eq("user_id", user.id)
        .single()

      if (error) {
        if (error.code === "PGRST116") {
          console.log("Creating new game data for user:", user.id)
          const { error: upsertError } = await supabase
            .from("game_data")
            .upsert({
              user_id: user.id,
              score: 0,
              level: 1,
              upgrades: {}
            }, {
              onConflict: "user_id"
            })
          
          if (upsertError) {
            console.error("Error creating game data:", upsertError)
          } else {
            console.log("Game data created successfully")
            setGameData(defaultGameData)
          }
          setLoading(false)
          return
        }
        console.error("Error loading game data:", error)
        setLoading(false)
        return
      }

      if (data) {
        setGameData({
          score: data.score || 0,
          level: data.level || 1,
          upgrades: typeof data.upgrades === "object" && data.upgrades !== null && !Array.isArray(data.upgrades)
            ? Object.fromEntries(
                Object.entries(data.upgrades).filter(([, v]) => typeof v === "number")
              ) as Record<string, number>
            : {},
          lastSaved: data.updated_at || new Date().toISOString()
        })
      }
    } catch (error) {
      console.error("Error loading game data:", error)
    } finally {
      setLoading(false)
    }
  }, [user, supabase])

  useEffect(() => {
    if (user) {
      loadGameData()
    } else {
      setGameData(defaultGameData)
    }
  }, [user, loadGameData])

  const saveGameDataToDb = useCallback(async (dataToSave: GameData) => {
    if (!user) return

    setSaveStatus("SAVING")

    try {
      const { error } = await supabase
        .from("game_data")
        .upsert({
          user_id: user.id,
          score: dataToSave.score,
          level: dataToSave.level,
          upgrades: dataToSave.upgrades,
          updated_at: dataToSave.lastSaved
        }, {
          onConflict: "user_id"
        })

      if (error) {
        console.error("Error saving game data:", error)
        setSaveStatus("ERROR")
        return
      }

      setSaveStatus("SAVED")
      setTimeout(() => setSaveStatus("IDLE"), 2000)
    } catch (error) {
      console.error("Error saving game data:", error)
      setSaveStatus("ERROR")
    }
  }, [user, supabase])

  const saveGameData = useCallback((newData: Partial<GameData>) => {
    const updatedData = {
      ...gameData,
      ...newData,
      lastSaved: new Date().toISOString()
    }

    setGameData(updatedData)

    if (!user) return

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }

    saveTimeoutRef.current = setTimeout(() => {
      saveGameDataToDb(updatedData)
    }, 1000)
  }, [user, gameData, saveGameDataToDb])

  const incrementScore = (amount: number = 1) => {
    const newScore = gameData.score + amount
    saveGameData({ score: newScore })
  }

  const levelUp = () => {
    const newLevel = gameData.level + 1
    saveGameData({ level: newLevel })
  }

  const updateUpgrade = (upgradeId: string, level: number) => {
    const newUpgrades = {
      ...gameData.upgrades,
      [upgradeId]: level
    }
    saveGameData({ upgrades: newUpgrades })
  }

  return {
    gameData,
    loading,
    saveStatus,
    incrementScore,
    levelUp,
    updateUpgrade,
    saveGameData
  }
}
